import { useState, useEffect } from 'react'
import { TabList, Tab } from './components/TabList'
import { QueryInput } from './components/QueryInput'
import { PlatformSelect } from './components/PlatformSelect'

function App() {
  const [tabs, setTabs] = useState<Tab[]>([])
  const [activeTab, setActiveTab] = useState<string | null>(null)

  const [selectedPlatform, setSelectedPlatform] = useState('https://yuanbao.tencent.com/')

  const handleAddTab = async () => {
    const url = selectedPlatform
    const title = url.includes('yuanbao') ? 'Yuanbao' : 'DeepSeek'

    try {
      const tabId = await window.electron.ipcRenderer.invoke('tabs:create', url)
      const newTab: Tab = { id: tabId, title: `${title} ${tabs.length + 1}` }
      setTabs([...tabs, newTab])
      handleSwitchTab(tabId)
    } catch (err) {
      console.error('Failed to create tab:', err)
    }
  }

  const handleSwitchTab = async (tabId: string) => {
    try {
      await window.electron.ipcRenderer.invoke('tabs:switch', tabId)
      setActiveTab(tabId)
    } catch (err) {
      console.error('Failed to switch tab:', err)
    }
  }

  const handleBroadcast = async (question: string) => {
    try {
      await window.electron.ipcRenderer.invoke('question:broadcast', question)
      console.log('Broadcasted:', question)
    } catch (err) {
      console.error('Failed to broadcast:', err)
    }
  }

  useEffect(() => {
    // Optional initialization
  }, [])

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="bg-white shadow-sm z-20">
        <TabList
          tabs={tabs}
          activeTab={activeTab}
          onAddTab={handleAddTab}
          onSwitchTab={handleSwitchTab}
        >
          <div className="flex items-center ml-2">
            <PlatformSelect value={selectedPlatform} onValueChange={setSelectedPlatform} />
          </div>
        </TabList>
        <QueryInput onBroadcast={handleBroadcast} />
      </div>

      <div className="flex-1 flex items-center justify-center text-gray-400">
        {tabs.length === 0 && (
          <div className="text-center p-10">
            <p className="mb-4 text-lg">No active tabs.</p>
            <button
              onClick={handleAddTab}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Open Tab
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
