import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

export function KPICard({ title, value, icon: Icon, description, trend }: {
    title: string,
    value: string | number,
    icon: LucideIcon,
    description?: string,
    trend?: { value: number, isPositive: boolean }
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-text-muted">{title}</CardTitle>
                <Icon className="h-4 w-4 text-text-muted" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-foreground">{value}</div>
                {(description || trend) && (
                    <p className="text-xs text-text-muted mt-1">
                        {trend && (
                            <span className={trend.isPositive ? "text-success" : "text-error"}>
                                {trend.isPositive ? "+" : "-"}{trend.value}%
                            </span>
                        )}
                        {description && ` ${description}`}
                    </p>
                )}
            </CardContent>
        </Card>
    )
}
