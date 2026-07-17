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
    <div className="flex">
      {TABS.map((tab) => {
        const qs = comp ? `?comp=${comp}` : ''
        const active = pathname === tab.href
        return (
          <Link
            key={tab.href}
            href={`${tab.href}${qs}`}
            className={`px-7 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
              active
                ? 'border-[#1a7a3c] text-[#1a7a3c]'
                : 'border-transparent text-gray-400 hover:text-[#1a7a3c] hover:border-green-200'
            }`}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
