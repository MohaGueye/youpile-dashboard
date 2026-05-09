"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext<{
    open: boolean;
    setOpen: (open: boolean) => void;
} | null>(null)

export function DropdownMenu({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false)

    return (
        <DropdownMenuContext.Provider value={{ open, setOpen }}>
            <div className="relative inline-block text-left" onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    setOpen(false)
                }
            }}>
                {children}
            </div>
        </DropdownMenuContext.Provider>
    )
}

export function DropdownMenuTrigger({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) {
    const context = React.useContext(DropdownMenuContext)
    if (!context) return null

    return (
        <div onClick={() => context.setOpen(!context.open)} className="cursor-pointer">
            {children}
        </div>
    )
}

export function DropdownMenuContent({ children, align = 'end' }: { children: React.ReactNode, align?: 'start' | 'end' | 'center' }) {
    const context = React.useContext(DropdownMenuContext)
    if (!context || !context.open) return null

    const alignClass = align === 'end' ? 'right-0' : 'left-0'

    return (
        <div className={cn(
            "absolute z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none",
            alignClass
        )}>
            <div className="py-1">
                {children}
            </div>
        </div>
    )
}

export function DropdownMenuItem({ children, onClick, className, disabled, asChild }: { children: React.ReactNode, onClick?: () => void, className?: string, disabled?: boolean, asChild?: boolean }) {
    const context = React.useContext(DropdownMenuContext)

    const baseClass = cn(
        "block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed",
        className
    )

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children as React.ReactElement<any>, {
            onClick: () => {
                if (disabled) return
                if (onClick) onClick()
                if (children.props.onClick) children.props.onClick()
                if (context) context.setOpen(false)
            },
            className: cn(baseClass, children.props.className)
        })
    }

    return (
        <button
            onClick={() => {
                if (disabled) return
                if (onClick) onClick()
                if (context) context.setOpen(false)
            }}
            disabled={disabled}
            className={baseClass}
        >
            {children}
        </button>
    )
}
