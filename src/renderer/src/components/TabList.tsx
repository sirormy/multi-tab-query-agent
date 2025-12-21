import React from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { Plus, X, Trash2, CheckSquare, Square } from 'lucide-react'
import { cn } from '../lib/utils'

export interface Tab {
    id: string
    title: string
    syncEnabled: boolean
}

interface TabListProps {
    tabs: Tab[]
    activeTab: string | null
    onAddTab: () => void
    onSwitchTab: (id: string) => void
    onCloseTab: (id: string) => void
    onToggleSync: (id: string) => void
    onCloseAll: () => void
    children?: React.ReactNode
}

export const TabList: React.FC<TabListProps> = ({
    tabs,
    activeTab,
    onAddTab,
    onSwitchTab,
    onCloseTab,
    onToggleSync,
    onCloseAll,
    children
}) => {
    return (
        <Tabs.Root
            value={activeTab || ''}
            onValueChange={onSwitchTab}
            className="flex flex-col w-full"
        >
            <div className="flex items-center bg-gray-100 border-b border-gray-300 h-[45px]">
                <Tabs.List className="flex flex-1 overflow-x-auto no-scrollbar h-full items-end">
                    {tabs.map((tab) => (
                        <Tabs.Trigger
                            key={tab.id}
                            value={tab.id}
                            className={cn(
                                'group flex items-center px-3 h-[40px] select-none text-[13px] leading-none cursor-pointer outline-none border-t border-r border-gray-200 min-w-[100px] max-w-[200px] transition-colors data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:font-medium data-[state=active]:border-b-white data-[state=active]:border-t-blue-500 rounded-t-md mr-[-1px] mb-[-1px] text-gray-600 hover:bg-white/50 data-[state=active]:hover:bg-white shadow-none'
                            )}
                        >
                            <div
                                role="button"
                                tabIndex={0}
                                className={cn(
                                    "p-1 rounded-sm mr-2 text-gray-400 hover:text-blue-600 transition-colors",
                                    tab.syncEnabled ? "text-blue-500" : "text-gray-300"
                                )}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onToggleSync(tab.id)
                                }}
                                title={tab.syncEnabled ? "Disable AI Response" : "Enable AI Response"}
                            >
                                {tab.syncEnabled ? <CheckSquare size={14} /> : <Square size={14} />}
                            </div>
                            <span className="truncate flex-1 text-left mr-2">{tab.title}</span>
                            <div
                                role="button"
                                tabIndex={0}
                                className="opacity-0 group-hover:opacity-100 p-0.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    onCloseTab(tab.id)
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.stopPropagation()
                                        onCloseTab(tab.id)
                                    }
                                }}
                            >
                                <X size={12} />
                            </div>
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>

                <div className="flex items-center h-full px-2 gap-2 border-l border-gray-300 bg-gray-50">
                    {children}
                    <button
                        onClick={onAddTab}
                        className="p-1 rounded hover:bg-gray-200 text-gray-600 transition-colors"
                        title="New Tab"
                    >
                        <Plus size={18} />
                    </button>
                    {tabs.length > 0 && (
                        <>
                            <button
                                onClick={onCloseAll}
                                className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                                title="Close All Tabs"
                            >
                                <Trash2 size={16} />
                            </button>
                            <button
                                onClick={() => {
                                    // Custom debug event or just let App handle it if we passed a prop,
                                    // but TabList doesn't have access to webviewRefs. 
                                    // Let's use a console command or just expose a prop?
                                    // Simplified: Just add a devtools toggle in App.tsx instead of TabList for now, 
                                    // or passing a onDebug prop.
                                }}
                                className="hidden"
                            />
                        </>
                    )}
                </div>
            </div>
        </Tabs.Root>
    )
}
