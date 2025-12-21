import { useState, useEffect, useRef } from 'react'
import { TabList, Tab } from './components/TabList'
import { QueryInput } from './components/QueryInput'
import { PlatformSelect } from './components/PlatformSelect'

// Add WebviewTag type definition locally if not available
declare global {
  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string
        preload?: string
        webpreferences?: string
        partition?: string
        allowpopups?: boolean
        onConsoleMessage?: (event: any) => void
      }
    }
  }
}

interface ExtendedTab extends Tab {
  url: string
  // syncEnabled is already in Tab interface, but we need to ensure we initialize it
}

function App() {
  // Initialize state from localStorage if available
  const [tabs, setTabs] = useState<ExtendedTab[]>(() => {
    try {
      const saved = localStorage.getItem('app-tabs')
      if (saved) {
        const parsed = JSON.parse(saved)
        // Migration: Ensure syncEnabled exists
        return parsed.map((t: any) => ({ ...t, syncEnabled: t.syncEnabled ?? true }))
      }
      return []
    } catch (e) {
      console.error('Failed to load tabs from storage', e)
      return []
    }
  })

  const [activeTab, setActiveTab] = useState<string | null>(() => {
    return localStorage.getItem('app-active-tab') || null
  })

  const [preloadPath, setPreloadPath] = useState<string>('')
  const [selectedPlatform, setSelectedPlatform] = useState(() => {
    return localStorage.getItem('app-selected-platform') || 'https://yuanbao.tencent.com/'
  })
  const webviewRefs = useRef<{ [key: string]: any }>({})

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('app-tabs', JSON.stringify(tabs))
  }, [tabs])

  useEffect(() => {
    if (activeTab) {
      localStorage.setItem('app-active-tab', activeTab)
    } else {
      localStorage.removeItem('app-active-tab')
    }
  }, [activeTab])

  useEffect(() => {
    localStorage.setItem('app-selected-platform', selectedPlatform)
  }, [selectedPlatform])

  useEffect(() => {
    // Get preload path from main process
    window.electron.ipcRenderer.invoke('get-preload-path').then((path) => {
      setPreloadPath(`file://${path}`)
    })
  }, [])

  const handleAddTab = () => {
    const url = selectedPlatform
    let title = 'New Tab'
    if (url.includes('yuanbao')) title = 'Yuanbao'
    else if (url.includes('deepseek')) title = 'DeepSeek'
    else if (url.includes('gemini.google')) title = 'Gemini'
    else if (url.includes('chatgpt')) title = 'ChatGPT'
    else if (url.includes('qwen')) title = 'Qwen'
    else if (url.includes('manus')) title = 'Manus'

    const tabId = `tab-${Date.now()}`
    const newTab: ExtendedTab = {
      id: tabId,
      title: `${title} ${tabs.length + 1}`,
      url,
      syncEnabled: true
    }

    setTabs([...tabs, newTab])
    setActiveTab(tabId)
  }

  const handleSwitchTab = (tabId: string) => {
    setActiveTab(tabId)
  }

  const handleToggleSync = (tabId: string) => {
    setTabs(currentTabs =>
      currentTabs.map(t =>
        t.id === tabId ? { ...t, syncEnabled: !t.syncEnabled } : t
      )
    )
  }

  const handleBroadcast = (question: string) => {
    Object.entries(webviewRefs.current).forEach(([id, webview]) => {
      if (webview) {
        // Find the tab to check if sync is enabled
        const tab = tabs.find(t => t.id === id)
        if (tab && !tab.syncEnabled) {
          console.log(`[App] Skipping tab ${id} (sync disabled)`)
          return
        }

        try {
          // Check if methods exist
          if (typeof webview.send === 'function') {
            webview.send('question:sync', question)
            console.log(`[App] Sent to tab ${id}`)
          } else {
            console.error(`[App] Webview ${id} missing send method`)
          }
          // For debugging, open devtools if needed
          // webview.openDevTools()
        } catch (e) {
          console.error(`[App] Failed to send to ${id}`, e)
        }
      }
    })
    console.log('Broadcasted:', question)
  }

  const handleCloseTab = (tabId: string) => {
    const tabIndex = tabs.findIndex(t => t.id === tabId)
    if (tabIndex === -1) return

    const newTabs = tabs.filter(t => t.id !== tabId)
    setTabs(newTabs)

    // Remove from refs
    delete webviewRefs.current[tabId]

    // If closing active tab, switch to another
    if (activeTab === tabId) {
      if (newTabs.length > 0) {
        // Try to go to the left, otherwise go to the new first one (which was to the right)
        const newIndex = tabIndex > 0 ? tabIndex - 1 : 0
        setActiveTab(newTabs[newIndex].id)
      } else {
        setActiveTab(null)
      }
    }
  }

  const handleCloseAll = () => {
    setTabs([])
    setActiveTab(null)
    webviewRefs.current = {}
  }

  if (!preloadPath) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white shadow-sm z-20 relative">
        <TabList
          tabs={tabs}
          activeTab={activeTab}
          onAddTab={handleAddTab}
          onSwitchTab={handleSwitchTab}
          onToggleSync={handleToggleSync}
          onCloseTab={handleCloseTab}
          onCloseAll={handleCloseAll}
        >
          <div className="flex items-center ml-2 gap-2">
            <PlatformSelect value={selectedPlatform} onValueChange={setSelectedPlatform} />
            <button
              onClick={() => {
                Object.values(webviewRefs.current).forEach((webview) => {
                  if (webview && typeof webview.openDevTools === 'function') {
                    webview.openDevTools()
                  }
                })
              }}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
              title="Open DevTools for all tabs"
            >
              Debug
            </button>
          </div>
        </TabList>
        <QueryInput onBroadcast={handleBroadcast} />
      </div>

      <div className="flex-1 relative overflow-hidden">
        {tabs.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 z-0">
            <div className="text-center p-10">
              <p className="mb-4 text-lg">No active tabs.</p>
              <button
                onClick={handleAddTab}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Open Tab
              </button>
            </div>
          </div>
        )}

        {tabs.map((tab) => (
          <webview
            key={tab.id}
            ref={(el) => { if (el) webviewRefs.current[tab.id] = el }}
            src={tab.url}
            preload={preloadPath}
            className="w-full h-full"
            style={{
              display: activeTab === tab.id ? 'flex' : 'none',
              // Use z-0 to ensure it sits behind the header (z-20)
              zIndex: 0
            }}
            partition={`persist:${tab.id}`}
            // Relax security for compatibility and debugging, enable plugins if needed
            webpreferences="contextIsolation=no, nodeIntegration=yes, sandbox=no, webSecurity=no"
            allowpopups={true}
            // Forward console logs to main devtools
            // @ts-ignore - Electron webview tag event
            onConsoleMessage={(e: any) => {
              console.log(`[Tab ${tab.title}]`, e.message)
            }}
            // Fix for Cloudflare and Login issues: Use a standard browser User-Agent
            useragent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            // Track URL changes to persist state correctly
            // @ts-ignore - Electron webview tag event
            onDidNavigate={(e: any) => {
              const newUrl = e.url
              setTabs(currentTabs =>
                currentTabs.map(t => t.id === tab.id ? { ...t, url: newUrl } : t)
              )
            }}
            // @ts-ignore - Electron webview tag event
            onDidNavigateInPage={(e: any) => {
              const newUrl = e.url
              setTabs(currentTabs =>
                currentTabs.map(t => t.id === tab.id ? { ...t, url: newUrl } : t)
              )
            }}
          />
        ))}
      </div>
    </div>
  )
}

export default App
