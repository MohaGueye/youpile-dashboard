"use client"

import * as React from "react"
import { Bell, Check, Clock, Info, ShoppingCart, UserPlus, AlertTriangle } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { Button } from "@/components/ui/button"

type Notification = {
    id: string
    title: string
    description: string
    type: 'order' | 'user' | 'alert' | 'info'
    created_at: string
    is_read: boolean
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        title: 'Nouvelle commande',
        description: 'Une nouvelle commande #1234 vient d\'être passée.',
        type: 'order',
        created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        is_read: false
    },
    {
        id: '2',
        title: 'Nouvel utilisateur',
        description: 'Mohamed G. s\'est inscrit sur la plateforme.',
        type: 'user',
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
        is_read: false
    },
    {
        id: '3',
        title: 'Stock faible',
        description: 'Le produit "iPhone 15" est presque épuisé.',
        type: 'alert',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        is_read: true
    },
    {
        id: '4',
        title: 'Maintenance prévue',
        description: 'Une maintenance est prévue ce dimanche à 02h00.',
        type: 'info',
        created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        is_read: true
    }
]

export function NotificationDropdown() {
    const [isOpen, setIsOpen] = React.useState(false)
    const [notifications, setNotifications] = React.useState(MOCK_NOTIFICATIONS)
    const dropdownRef = React.useRef<HTMLDivElement>(null)

    const unreadCount = notifications.filter(n => !n.is_read).length

    const toggleOpen = () => setIsOpen(!isOpen)

    const markAllAsRead = () => {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })))
    }

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const getIcon = (type: string) => {
        switch (type) {
            case 'order': return <ShoppingCart className="h-4 w-4 text-blue-500" />
            case 'user': return <UserPlus className="h-4 w-4 text-green-500" />
            case 'alert': return <AlertTriangle className="h-4 w-4 text-red-500" />
            default: return <Info className="h-4 w-4 text-gray-500" />
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={toggleOpen}
                className="text-text-muted hover:text-foreground relative p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-error text-[10px] text-white ring-2 ring-white font-bold">
                        {unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-border shadow-xl rounded-xl overflow-hidden z-50 animate-in fade-in zoom-in duration-200">
                    <div className="p-4 border-b border-border flex items-center justify-between bg-gray-50/50">
                        <h3 className="font-bold text-sm">Notifications</h3>
                        {unreadCount > 0 && (
                            <button 
                                onClick={markAllAsRead}
                                className="text-xs text-primary hover:underline font-medium"
                            >
                                Tout marquer comme lu
                            </button>
                        )}
                    </div>

                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length > 0 ? (
                            <div className="divide-y divide-border">
                                {notifications.map((n) => (
                                    <div 
                                        key={n.id} 
                                        className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 ${!n.is_read ? 'bg-primary/5' : ''}`}
                                    >
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${!n.is_read ? 'bg-white shadow-sm' : 'bg-gray-100'}`}>
                                            {getIcon(n.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className={`text-sm leading-none ${!n.is_read ? 'font-bold text-foreground' : 'font-medium text-text-secondary'}`}>
                                                    {n.title}
                                                </p>
                                                <span className="text-[10px] text-text-muted flex items-center gap-1 whitespace-nowrap">
                                                    <Clock className="h-3 w-3" />
                                                    {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: fr })}
                                                </span>
                                            </div>
                                            <p className="text-xs text-text-muted line-clamp-2">
                                                {n.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center">
                                <Bell className="h-8 w-8 text-gray-200 mx-auto mb-2" />
                                <p className="text-sm text-text-muted">Aucune notification</p>
                            </div>
                        )}
                    </div>

                    <div className="p-2 border-t border-border bg-gray-50/50">
                        <Button variant="ghost" className="w-full text-xs h-8 text-text-muted hover:text-foreground">
                            Voir toutes les notifications
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
