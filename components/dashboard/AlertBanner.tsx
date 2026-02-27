import { AlertTriangle } from "lucide-react"

export function AlertBanner({ urgentDisputesCount, pendingReportsCount }: { urgentDisputesCount: number, pendingReportsCount: number }) {
    if (urgentDisputesCount === 0 && pendingReportsCount <= 10) return null;

    return (
        <div className="bg-error/10 border-l-4 border-error p-4 mb-6 rounded-r-md">
            <div className="flex">
                <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-error" />
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-error">Alertes système critiques</h3>
                    <div className="mt-2 text-sm text-error/90 space-y-1 block">
                        {urgentDisputesCount > 0 && (
                            <p>• {urgentDisputesCount} litige(s) ouvert(s) depuis plus de 48h nécessitent une intervention immédiate.</p>
                        )}
                        {pendingReportsCount > 10 && (
                            <p>• {pendingReportsCount} signalements en attente. La file de modération est saturée.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
