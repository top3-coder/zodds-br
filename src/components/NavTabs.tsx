'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'

const TABS = [
  { href: '/', label: 'Jogos' },
  { href: '/multiplas', label: 'Múltiplas' },
]

export default function NavTabs() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const comp = searchParams.get('comp')

  return (
    <div className="flex gap-1">
      {TABS.map((tab) => {
        const qs = comp ? `?comp=${comp}` : ''
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={`${tab.href}${qs}`}
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
              active
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-green-100 hover:text-white hover:bg-white/20'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
