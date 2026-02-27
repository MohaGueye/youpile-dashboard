"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

export function RegistrationsChart({ data }: { data: { date: string; count: number }[] }) {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
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
                    tickFormatter={(value) => `${value}`}
                />
                <Tooltip cursor={{ fill: '#F7F7F7' }} />
                <Bar dataKey="count" fill="#D4A800" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}
