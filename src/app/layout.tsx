import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: "Zodd's BR – Comparador de Odds",
  description:
    'Compare as melhores odds do Brasileirão e ligas do mundo em tempo real. Encontre o maior pagamento antes de apostar.',
  keywords: ["odds", "apostas", "brasileirão", "comparador de odds", "Zodd's BR"],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={inter.className}>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  )
}
