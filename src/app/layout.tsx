import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: "Zodd's BR – Comparador de Odds",
  description:
    'Compare as melhores odds do Brasileirão Série B em tempo real. Encontre o maior pagamento antes de apostar.',
  keywords: ["odds", "apostas", "série b", "brasileirão", "comparador de odds", "Zodd's BR"],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-100 antialiased">{children}</body>
    </html>
  )
}
