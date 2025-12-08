import React from 'react'
import * as Tabs from '@radix-ui/react-tabs'
import { Plus } from 'lucide-react'
import { cn } from '../lib/utils'

export interface Tab {
    id: string
    title: string
}

interface TabListProps {
    tabs: Tab[]
    activeTab: string | null
    onAddTab: () => void
    onSwitchTab: (id: string) => void
    children?: React.ReactNode
}

export const TabList: React.FC<TabListProps> = ({ tabs, activeTab, onAddTab, onSwitchTab, children }) => {
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
                                'group flex items-center px-5 h-[40px] select-none text-[13px] leading-none cursor-pointer outline-none border-t border-r border-gray-200 min-w-[100px] max-w-[200px] truncate transition-colors data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:font-medium data-[state=active]:border-b-white data-[state=active]:border-t-blue-500 rounded-t-md mr-[-1px] mb-[-1px] text-gray-600 hover:bg-white/50 data-[state=active]:hover:bg-white shadow-none'
                            )}
                        >
                            {tab.title}
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
                </div>
            </div>
        </Tabs.Root>
    )
}
