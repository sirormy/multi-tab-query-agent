import React from 'react'
import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '../lib/utils'

interface PlatformSelectProps {
    value: string
    onValueChange: (value: string) => void
}

export const PlatformSelect: React.FC<PlatformSelectProps> = ({ value, onValueChange }) => {
    return (
        <Select.Root value={value} onValueChange={onValueChange}>
            <Select.Trigger
                className="inline-flex items-center justify-center rounded px-[15px] text-[13px] leading-none h-[35px] gap-[5px] bg-white text-violet11 shadow-[0_2px_10px] shadow-black/10 hover:bg-mauve3 focus:shadow-[0_0_0_2px] focus:shadow-black data-[placeholder]:text-violet9 outline-none cursor-pointer border border-gray-200"
                aria-label="Platform"
            >
                <Select.Value placeholder="Select platform" />
                <Select.Icon className="text-violet11">
                    <ChevronDown size={16} />
                </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
                <Select.Content className="overflow-hidden bg-white rounded-md shadow-[0px_10px_38px_-10px_rgba(22,_23,_24,_0.35),0px_10px_20px_-15px_rgba(22,_23,_24,_0.2)]">
                    <Select.ScrollUpButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
                        <ChevronUp size={16} />
                    </Select.ScrollUpButton>
                    <Select.Viewport className="p-[5px]">
                        <SelectItem value="https://yuanbao.tencent.com/">Tencent Yuanbao</SelectItem>
                        <SelectItem value="https://chat.deepseek.com/">DeepSeek</SelectItem>
                    </Select.Viewport>
                    <Select.ScrollDownButton className="flex items-center justify-center h-[25px] bg-white text-violet11 cursor-default">
                        <ChevronDown size={16} />
                    </Select.ScrollDownButton>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    )
}

const SelectItem = React.forwardRef<HTMLDivElement, any>(({ children, className, value, ...props }, forwardedRef) => {
    return (
        <Select.Item
            value={value}
            className={cn(
                'text-[13px] leading-none text-violet11 rounded-[3px] flex items-center h-[25px] pr-[35px] pl-[25px] relative select-none data-[disabled]:text-mauve8 data-[disabled]:pointer-events-none data-[highlighted]:outline-none data-[highlighted]:bg-violet9 data-[highlighted]:text-violet1 cursor-pointer hover:bg-gray-100',
                className
            )}
            {...props}
            ref={forwardedRef}
        >
            <Select.ItemText>{children}</Select.ItemText>
            <Select.ItemIndicator className="absolute left-0 w-[25px] inline-flex items-center justify-center">
                <Check size={16} />
            </Select.ItemIndicator>
        </Select.Item>
    )
})
