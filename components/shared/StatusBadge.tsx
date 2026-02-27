import { Badge } from "@/components/ui/badge"

export function StatusBadge({ status, type = 'listing' }: { status: string, type?: 'listing' | 'transaction' | 'report' | 'dispute' }) {
    let label = status
    let variant: "default" | "success" | "error" | "warning" | "neutral" = "neutral"

    if (type === 'listing') {
        switch (status) {
            case 'active': label = 'Actif'; variant = 'success'; break;
            case 'draft': label = 'Brouillon'; variant = 'neutral'; break;
            case 'paused': label = 'En pause'; variant = 'warning'; break;
            case 'sold': label = 'Vendu'; variant = 'default'; break;
            case 'deleted': label = 'Supprimé'; variant = 'error'; break;
        }
    } else if (type === 'transaction') {
        switch (status) {
            case 'pending': label = 'En attente'; variant = 'warning'; break;
            case 'paid': label = 'Payé'; variant = 'success'; break;
            case 'escrow': label = 'Bloqué (Escrow)'; variant = 'warning'; break;
            case 'shipped': label = 'Expédié'; variant = 'default'; break;
            case 'delivered': label = 'Livré'; variant = 'success'; break;
            case 'completed': label = 'Terminé'; variant = 'success'; break;
            case 'disputed': label = 'En litige'; variant = 'error'; break;
            case 'refunded': label = 'Remboursé'; variant = 'neutral'; break;
            case 'cancelled': label = 'Annulé'; variant = 'error'; break;
        }
    } else if (type === 'report') {
        switch (status) {
            case 'pending': label = 'En attente'; variant = 'error'; break;
            case 'in_review': label = 'En cours'; variant = 'warning'; break;
            case 'resolved': label = 'Résolu'; variant = 'success'; break;
            case 'dismissed': label = 'Ignoré'; variant = 'neutral'; break;
        }
    } else if (type === 'dispute') {
        switch (status) {
            case 'open': label = 'Ouvert'; variant = 'error'; break;
            case 'in_review': label = 'En cours'; variant = 'warning'; break;
            case 'resolved_buyer': label = 'Résolu (Acheteur)'; variant = 'success'; break;
            case 'resolved_seller': label = 'Résolu (Vendeur)'; variant = 'success'; break;
            case 'closed': label = 'Fermé'; variant = 'neutral'; break;
        }
    }

    return <Badge variant={variant}>{label}</Badge>
}
