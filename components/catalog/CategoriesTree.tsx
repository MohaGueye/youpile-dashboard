"use client"

import * as React from "react"
import { useState } from "react"
import { Folder, FolderPlus, Pen, Trash2, GripVertical, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"

export function CategoriesTree({ categories }: { categories: any[] }) {
    const router = useRouter()
    const rootCats = categories.filter(c => !c.parent_id).sort((a, b) => a.sort_order - b.sort_order)

    const [loadingId, setLoadingId] = useState<string | null>(null)
    const [addingTo, setAddingTo] = useState<string | null>(null) // null = none, 'root' = root, id = child
    const [editingId, setEditingId] = useState<string | null>(null)
    const [inputValue, setInputValue] = useState("")

    const handleSave = async (id: string | null, parentId: string | null) => {
        if (!inputValue.trim()) return
        setLoadingId('saving')
        try {
            const endpoint = '/api/admin/catalog/categories'
            const method = id ? 'PUT' : 'POST'
            const body = id ? { id, name: inputValue } : { name: inputValue, parent_id: parentId || null }

            console.log('Saving category:', { method, body })
            const res = await fetch(endpoint, { 
                method, 
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body) 
            })
            const data = await res.json()
            if (res.ok) {
                toast.success("Catégorie enregistrée")
                setEditingId(null)
                setAddingTo(null)
                setInputValue("")
                router.refresh()
            } else {
                toast.error(data.error || "Erreur lors de l'enregistrement")
            }
        } catch (err: any) {
            console.error('Save category error:', err)
            toast.error("Erreur réseau")
        } finally {
            setLoadingId(null)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette catégorie ?")) return
        setLoadingId(id)
        try {
            const res = await fetch(`/api/admin/catalog/categories?id=${id}`, { method: 'DELETE' })
            const data = await res.json()
            if (res.ok) { 
                toast.success("Catégorie supprimée")
                router.refresh() 
            } else {
                toast.error(data.error || "Erreur lors de la suppression")
            }
        } catch (err: any) {
            console.error('Delete category error:', err)
            toast.error("Erreur réseau")
        } finally {
            setLoadingId(null)
        }
    }

    const InputForm = ({ onCancel, onSave }: { onCancel: () => void, onSave: () => void }) => (
        <div className="flex items-center gap-2 p-2 bg-gray-50 border-b border-border">
            <input
                autoFocus
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="flex-1 h-8 px-2 text-sm border rounded"
                placeholder="Nom de la catégorie..."
                onKeyDown={e => { if (e.key === 'Enter') onSave(); if (e.key === 'Escape') onCancel(); }}
            />
            <Button size="sm" className="h-8" onClick={onSave} disabled={loadingId === 'saving'}>OK</Button>
            <Button size="sm" variant="ghost" className="h-8" onClick={onCancel}>Annuler</Button>
        </div>
    )

    return (
        <div className="bg-white border text-sm border-border rounded-lg shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="font-semibold">Arborescence</h3>
                <Button
                    size="sm"
                    className="h-8 gap-2 bg-primary text-primary-dark"
                    onClick={() => { setAddingTo('root'); setInputValue(''); setEditingId(null); }}
                >
                    <Plus className="h-4 w-4" /> Nouvelle Racine
                </Button>
            </div>

            {addingTo === 'root' && <InputForm onCancel={() => setAddingTo(null)} onSave={() => handleSave(null, null)} />}

            <div className="p-4 space-y-4">
                {rootCats.map(cat => {
                    const children = categories.filter(c => c.parent_id === cat.id).sort((a, b) => a.sort_order - b.sort_order)
                    return (
                        <div key={cat.id} className="border border-border rounded-md">
                            <div className="flex items-center justify-between p-3 bg-surface border-b border-border group">
                                <div className="flex items-center gap-3 flex-1">
                                    <GripVertical className="h-4 w-4 text-gray-300 cursor-grab" />
                                    <Folder className="h-4 w-4 text-text-muted" />
                                    {editingId === cat.id ? (
                                        <div className="flex-1 flex gap-2">
                                            <input autoFocus value={inputValue} onChange={e => setInputValue(e.target.value)} className="h-7 px-2 border rounded text-xs w-full" />
                                            <Button size="sm" className="h-7 text-xs px-2" onClick={() => handleSave(cat.id, null)}>OK</Button>
                                            <Button size="sm" variant="ghost" className="h-7 text-xs px-2" onClick={() => setEditingId(null)}>Annul</Button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className="font-semibold">{cat.name}</span>
                                            {!cat.is_active && <span className="text-xs bg-gray-200 px-1 rounded">Inactif</span>}
                                        </>
                                    )}
                                </div>
                                {editingId !== cat.id && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                        <button onClick={() => { setAddingTo(cat.id); setInputValue(''); setEditingId(null); }} className="text-text-muted hover:text-foreground"><FolderPlus className="h-4 w-4" /></button>
                                        <button onClick={() => { setEditingId(cat.id); setInputValue(cat.name); setAddingTo(null); }} className="text-text-muted hover:text-foreground"><Pen className="h-4 w-4" /></button>
                                        <button disabled={loadingId === cat.id} onClick={() => handleDelete(cat.id)} className="text-error"><Trash2 className="h-4 w-4" /></button>
                                    </div>
                                )}
                            </div>

                            {addingTo === cat.id && <InputForm onCancel={() => setAddingTo(null)} onSave={() => handleSave(null, cat.id)} />}

                            {children.length > 0 && (
                                <div className="p-2 pl-8 space-y-1">
                                    {children.map(child => (
                                        <div key={child.id} className="flex items-center justify-between p-2 hover:bg-surface rounded group">
                                            <div className="flex items-center gap-3 flex-1">
                                                <GripVertical className="h-3 w-3 text-gray-300 cursor-grab" />
                                                {editingId === child.id ? (
                                                    <div className="flex-1 flex gap-2">
                                                        <input autoFocus value={inputValue} onChange={e => setInputValue(e.target.value)} className="h-6 px-1 border rounded text-xs w-full" />
                                                        <Button size="sm" className="h-6 text-[10px] px-2" onClick={() => handleSave(child.id, cat.id)}>OK</Button>
                                                        <Button size="sm" variant="ghost" className="h-6 text-[10px] px-2" onClick={() => setEditingId(null)}>Annul</Button>
                                                    </div>
                                                ) : (
                                                    <span className="text-text-secondary">{child.name}</span>
                                                )}
                                            </div>
                                            {editingId !== child.id && (
                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                                    <button onClick={() => { setEditingId(child.id); setInputValue(child.name); setAddingTo(null); }} className="text-text-muted hover:text-foreground"><Pen className="h-3 w-3" /></button>
                                                    <button disabled={loadingId === child.id} onClick={() => handleDelete(child.id)} className="text-error"><Trash2 className="h-3 w-3" /></button>
                                                </div>
                                            )}
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
