"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    Users,
    ShoppingBag,
    CreditCard,
    AlertTriangle,
    Flag,
    FolderTree,
    Tags,
    DollarSign,
    Settings,
} from "lucide-react"

const navItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { title: "Utilisateurs", href: "/users", icon: Users },
    { title: "Annonces", href: "/listings", icon: ShoppingBag },
    { title: "Transactions", href: "/transactions", icon: CreditCard },
    { title: "Litiges", href: "/disputes", icon: AlertTriangle },
    { title: "Signalements", href: "/reports", icon: Flag },
    { title: "Catégories", href: "/catalog/categories", icon: FolderTree },
    { title: "Marques", href: "/catalog/brands", icon: Tags },
    { title: "Finance", href: "/finance", icon: DollarSign },
    { title: "Configuration", href: "/config", icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-surface border-r border-border flex flex-col">
            <div className="flex h-16 items-center px-6 border-b border-border bg-white">
                <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-primary-dark">
                    <div className="h-8 w-8 rounded bg-primary text-white flex items-center justify-center">Y</div>
                    Youpile Panel
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary text-white"
                                    : "text-text-secondary hover:bg-gray-100 hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-text-muted")} />
                            {item.title}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <div className="text-xs text-text-muted text-center">
                    Youpile Admin v1.0
                </div>
            </div>
        </aside>
    )
}
