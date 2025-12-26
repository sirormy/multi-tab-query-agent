import React from 'react'
import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../lib/utils'

import yuanbaoIcon from '../assets/icons/yuanbao.png'
import deepseekIcon from '../assets/icons/deepseek.png'
import geminiIcon from '../assets/icons/gemini.png'
import chatgptIcon from '../assets/icons/chatgpt.png'
import qwenIcon from '../assets/icons/qwen.png'
import manusIcon from '../assets/icons/manus.png'
import zaiIcon from '../assets/icons/zai.png'
import doubaoIcon from '../assets/icons/doubao.png'

type SelectItemProps = React.ComponentPropsWithoutRef<typeof Select.Item>

interface PlatformSelectProps {
    value: string
    onValueChange: (value: string) => void
}

const platforms = [
    { name: 'Tencent Yuanbao', url: 'https://yuanbao.tencent.com/', icon: yuanbaoIcon },
    { name: 'DeepSeek', url: 'https://chat.deepseek.com/', icon: deepseekIcon },
    { name: 'Gemini', url: 'https://gemini.google.com/', icon: geminiIcon },
    { name: 'ChatGPT', url: 'https://chatgpt.com/', icon: chatgptIcon },
    { name: 'Qwen', url: 'https://chat.qwen.ai/', icon: qwenIcon },
    { name: 'Manus', url: 'https://manus.im/', icon: manusIcon },
    { name: 'Z.AI', url: 'https://chat.z.ai/', icon: zaiIcon },
    { name: 'Doubao', url: 'https://www.doubao.com/chat/', icon: doubaoIcon }
]

export const PlatformSelect: React.FC<PlatformSelectProps> = ({ value, onValueChange }) => {
    return (
        <Select.Root value={value} onValueChange={onValueChange}>
            <Select.Trigger
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 data-[placeholder]:text-gray-400 min-w-[160px]"
                aria-label="Platform"
            >
                <Select.Value placeholder="Select platform" />
                <Select.Icon className="text-violet11 ml-auto">
                    <ChevronDown size={16} />
                </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content className="z-50 overflow-hidden bg-white rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
                    <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
                        <ChevronUp size={16} />
                    </Select.ScrollUpButton>
                    <Select.Viewport className="p-[5px]">
                        {platforms.map((platform) => (
                            <SelectItem key={platform.url} value={platform.url}>
                                <div className="flex items-center gap-2">
                                    <img
                                        src={platform.icon}
                                        alt=""
                                        className="w-4 h-4 object-contain"
                                    />
                                    <span>{platform.name}</span>
                                </div>
                            </SelectItem>
                        ))}
                    </Select.Viewport>
                    <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
                        <ChevronDown size={16} />
                    </Select.ScrollDownButton>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    )
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(({ children, className, value, ...props }, forwardedRef) => {
    return (
        <Select.Item
            value={value}
            className={cn(
                'relative flex h-[30px] cursor-pointer select-none items-center rounded-md px-8 py-2 text-xs text-gray-700 outline-none data-[disabled]:pointer-events-none data-[disabled]:text-gray-300 data-[highlighted]:bg-blue-600 data-[highlighted]:text-white',
                className
            )}
            {...props}
            ref={forwardedRef}
        >
            <Select.ItemText>{children}</Select.ItemText>
            <Select.ItemIndicator className="absolute left-2 inline-flex h-[25px] w-[25px] items-center justify-center text-blue-600 data-[highlighted]:text-white">
                <Check size={16} />
            </Select.ItemIndicator>
        </Select.Item>
    )
})

SelectItem.displayName = 'SelectItem'
