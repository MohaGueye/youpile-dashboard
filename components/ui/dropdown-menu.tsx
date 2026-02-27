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

export function DropdownMenuContent({ children }: { children: React.ReactNode }) {
    const context = React.useContext(DropdownMenuContext)
    if (!context || !context.open) return null

    return (
        <div className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
                {children}
            </div>
        </div>
    )
}

export function DropdownMenuItem({ children, onClick, className }: { children: React.ReactNode, onClick?: () => void, className?: string }) {
    const context = React.useContext(DropdownMenuContext)

    return (
        <button
            onClick={() => {
                if (onClick) onClick()
                if (context) context.setOpen(false)
            }}
            className={cn(
                "block w-full text-left px-4 py-2 text-sm text-foreground hover:bg-gray-100",
                className
            )}
        >
            {children}
        </button>
    )
}
