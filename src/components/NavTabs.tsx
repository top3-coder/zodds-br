'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TABS = [
  { href: '/', label: 'Jogos' },
  { href: '/multiplas', label: 'Múltiplas' },
]

export default function NavTabs() {
  const pathname = usePathname()

  return (
    <div className="flex gap-1">
      {TABS.map((tab) => {
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={tab.href}
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
