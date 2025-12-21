import React from 'react'
import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../lib/utils'

type SelectItemProps = React.ComponentPropsWithoutRef<typeof Select.Item>

interface PlatformSelectProps {
    value: string
    onValueChange: (value: string) => void
}

export const PlatformSelect: React.FC<PlatformSelectProps> = ({ value, onValueChange }) => {
    return (
        <Select.Root value={value} onValueChange={onValueChange}>
            <Select.Trigger
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 data-[placeholder]:text-gray-400"
                aria-label="Platform"
            >
                <Select.Value placeholder="Select platform" />
                <Select.Icon className="text-violet11">
                    <ChevronDown size={16} />
                </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content className="z-50 overflow-hidden bg-white rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
                    <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
                        <ChevronUp size={16} />
                    </Select.ScrollUpButton>
                    <Select.Viewport className="p-[5px]">
                        <SelectItem value="https://yuanbao.tencent.com/">Tencent Yuanbao</SelectItem>
                        <SelectItem value="https://chat.deepseek.com/">DeepSeek</SelectItem>
                        <SelectItem value="https://gemini.google.com/">Gemini</SelectItem>
                        <SelectItem value="https://chatgpt.com/">ChatGPT</SelectItem>
                        <SelectItem value="https://chat.qwen.ai/">Qwen</SelectItem>
                        <SelectItem value="https://manus.im/">Manus</SelectItem>
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
                'relative flex h-[30px] cursor-pointer select-none items-center rounded-md px-6 pr-9 text-xs text-gray-700 outline-none data-[disabled]:pointer-events-none data-[disabled]:text-gray-300 data-[highlighted]:bg-blue-600 data-[highlighted]:text-white',
                className
            )}
            {...props}
            ref={forwardedRef}
        >
            <Select.ItemText>{children}</Select.ItemText>
            <Select.ItemIndicator className="absolute left-0 inline-flex h-[25px] w-[25px] items-center justify-center text-blue-600">
                <Check size={16} />
            </Select.ItemIndicator>
        </Select.Item>
    )
})

SelectItem.displayName = 'SelectItem'
