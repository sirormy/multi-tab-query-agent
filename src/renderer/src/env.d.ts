/// <reference types="vite/client" />

interface ElectronAPI {
    ipcRenderer: {
        invoke(channel: string, ...args: any[]): Promise<any>
        send(channel: string, ...args: any[]): void
        on(channel: string, func: (...args: any[]) => void): void
        removeAllListeners(channel: string): void
    }
    process: NodeJS.Process
}

interface Window {
    electron: ElectronAPI
}
