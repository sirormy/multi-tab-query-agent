import { app, shell, BrowserWindow, ipcMain, BrowserView, session } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'

let mainWindow: BrowserWindow
const views = new Map<string, BrowserView>()
let activeTabId: string | null = null

function updateViewBounds(view: BrowserView) {
  if (mainWindow) {
    const contentBounds = mainWindow.getContentBounds()
    // Assume top bar height is 120px
    view.setBounds({ x: 0, y: 120, width: contentBounds.width, height: contentBounds.height - 120 })
  }
}

function createTab(url: string): string {
  const tabId = `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  // Create isolated session
  const tabSession = session.fromPartition(`persist:${tabId}`)

  const view = new BrowserView({
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      session: tabSession
    }
  })

  view.webContents.loadURL(url)
  view.setAutoResize({ width: true, height: true })

  views.set(tabId, view)
  return tabId
}

function switchTab(tabId: string) {
  if (!mainWindow) return

  const view = views.get(tabId)
  if (!view) return

  // Remove current view if exists
  if (activeTabId) {
    const currentView = views.get(activeTabId)
    if (currentView) {
      mainWindow.removeBrowserView(currentView)
    }
  }

  // Add new view
  mainWindow.addBrowserView(view)
  updateViewBounds(view)
  activeTabId = tabId
}

function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // IPC Handlers
  ipcMain.handle('tabs:create', (_, url) => createTab(url))

  ipcMain.handle('tabs:switch', (_, tabId) => switchTab(tabId))

  ipcMain.handle('question:broadcast', (_, question) => {
    for (const view of views.values()) {
      view.webContents.send('question:sync', question)
    }
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
