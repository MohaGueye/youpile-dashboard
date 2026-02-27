"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

export function RevenueChart({ data }: { data: { date: string; amount: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                <XAxis
                    dataKey="date"
                    stroke="#999999"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <YAxis
                    stroke="#999999"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value} XOF`}
                />
                <Tooltip />
                <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#F5C518"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#D4A800" }}
                    activeDot={{ r: 6 }}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
