import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Youpile Admin Panel',
    description: 'Panel d\'administration de Youpile Marketplace C2C',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="fr" suppressHydrationWarning>
            <body className={inter.className}>
                {children}
                <Toaster position="top-right" />
            </body>
        </html>
    )
}
