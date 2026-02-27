"use client"

import { useState } from "react"
import { Folder, FolderPlus, Pen, Trash2, GripVertical, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CategoriesTree({ categories }: { categories: any[] }) {
    // Simple hierarchical view
    const rootCats = categories.filter(c => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order)

    return (
        <div className="bg-white border text-sm border-border rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold">Arborescence</h3>
                <Button size="sm" className="h-8 gap-2 bg-primary text-primary-dark">
                    <Plus className="h-4 w-4" /> Nouvelle Racine
                </Button>
            </div>

            <div className="p-4 space-y-4">
                {rootCats.map(cat => {
                    const children = categories.filter(c => c.parent_id === cat.id).sort((a, b) => a.sort_order - b.sort_order)
                    return (
                        <div key={cat.id} className="border border-border rounded-md">
                            <div className="flex items-center justify-between p-3 bg-surface border-b border-border group">
                                <div className="flex items-center gap-3">
                                    <GripVertical className="h-4 w-4 text-gray-300 cursor-grab" />
                                    <Folder className="h-4 w-4 text-text-muted" />
                                    <span className="font-semibold">{cat.name}</span>
                                    {!cat.is_active && <span className="text-xs bg-gray-200 px-1 rounded">Inactif</span>}
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                    <button className="text-text-muted hover:text-foreground"><FolderPlus className="h-4 w-4" /></button>
                                    <button className="text-text-muted hover:text-foreground"><Pen className="h-4 w-4" /></button>
                                    <button className="text-error"><Trash2 className="h-4 w-4" /></button>
                                </div>
                            </div>

                            {children.length > 0 && (
                                <div className="p-2 pl-8 space-y-1">
                                    {children.map(child => (
                                        <div key={child.id} className="flex items-center justify-between p-2 hover:bg-surface rounded group">
                                            <div className="flex items-center gap-3">
                                                <GripVertical className="h-3 w-3 text-gray-300 cursor-grab" />
                                                <span className="text-text-secondary">{child.name}</span>
                                            </div>
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                                <button className="text-text-muted hover:text-foreground"><Pen className="h-3 w-3" /></button>
                                                <button className="text-error"><Trash2 className="h-3 w-3" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
