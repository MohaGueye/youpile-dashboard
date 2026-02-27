"use client"

import { useState, useEffect } from "react"
import { createSupabaseBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Loader2, Plus, Trash2 } from "lucide-react"
import toast from "react-hot-toast"

export default function ConfigPage() {
    const supabase = createSupabaseBrowserClient()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    // States for configs
    const [serviceFee, setServiceFee] = useState("5")
    const [escrowDays, setEscrowDays] = useState("7")
    const [banners, setBanners] = useState<{ url: string, active: boolean }[]>([])

    useEffect(() => {
        async function fetchConfig() {
            const { data } = await supabase.from('config').select('*')
            if (data) {
                data.forEach(item => {
                    if (item.key === 'service_fee_percent') setServiceFee(String(item.value))
                    if (item.key === 'escrow_release_days') setEscrowDays(String(item.value))
                    if (item.key === 'banners') setBanners(item.value as any || [])
                })
            }
            setLoading(false)
        }
        fetchConfig()
    }, [])

    const handleSave = async () => {
        setSaving(true)
        try {
            // Upsert logic
            const updates = [
                { key: 'service_fee_percent', value: Number(serviceFee) },
                { key: 'escrow_release_days', value: Number(escrowDays) },
                { key: 'banners', value: banners }
            ]

            for (const update of updates) {
                // This assumes config table has a unique constraint on 'key'
                await supabase.from('config').upsert(update, { onConflict: 'key' })
            }

            toast.success("Configuration sauvegardée avec succès")
        } catch {
            toast.error("Erreur lors de la sauvegarde")
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8"><Loader2 className="animate-spin" /></div>

    return (
        <div className="space-y-6 max-w-4xl">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Configuration Globale</h1>
                <Button onClick={handleSave} disabled={saving} className="gap-2 bg-primary text-primary-dark hover:bg-primary-dark hover:text-white">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Sauvegarder
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Paramètres Financiers</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Frais de service plateforme (%)</label>
                            <input
                                type="number"
                                value={serviceFee}
                                onChange={e => setServiceFee(e.target.value)}
                                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                            />
                            <p className="text-xs text-text-muted mt-1">Prélevé sur chaque transaction réussie.</p>
                        </div>
                        <div className="pt-4">
                            <label className="block text-sm font-medium mb-1">Délai libération auto Escrow (Jours)</label>
                            <input
                                type="number"
                                value={escrowDays}
                                onChange={e => setEscrowDays(e.target.value)}
                                className="w-full rounded-md border border-border px-3 py-2 text-sm"
                            />
                            <p className="text-xs text-text-muted mt-1">Délai après livraison avant paiement automatique du vendeur.</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-lg">Bannières Accueil App</CardTitle>
                        <Button size="sm" variant="outline" onClick={() => setBanners([...banners, { url: '', active: true }])}>
                            <Plus className="h-4 w-4" /> Ajouter
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4 mt-2">
                        {banners.map((b, i) => (
                            <div key={i} className="flex gap-2 items-start border p-3 rounded-md bg-surface">
                                <div className="flex-1 space-y-2">
                                    <input
                                        type="url"
                                        value={b.url}
                                        placeholder="URL de l'image (Storage)"
                                        onChange={e => {
                                            const newB = [...banners]
                                            newB[i].url = e.target.value
                                            setBanners(newB)
                                        }}
                                        className="w-full rounded border border-border px-2 py-1 text-xs"
                                    />
                                    <label className="flex items-center gap-2 text-xs">
                                        <input
                                            type="checkbox"
                                            checked={b.active}
                                            onChange={e => {
                                                const newB = [...banners]
                                                newB[i].active = e.target.checked
                                                setBanners(newB)
                                            }}
                                        />
                                        Active sur l'application
                                    </label>
                                </div>
                                <Button variant="ghost" size="icon" className="text-error" onClick={() => setBanners(banners.filter((_, idx) => idx !== i))}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {banners.length === 0 && <p className="text-sm text-text-muted italic">Aucune bannière configurée.</p>}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
