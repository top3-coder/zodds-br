'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'

const COMPS = [
  { key: 'serie-b', label: '⚽ Série B' },
  { key: 'copa', label: '🌍 Copa 2026' },
]

export default function CompSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('comp') ?? 'serie-b'

  function select(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (key === 'serie-b') {
      params.delete('comp')
    } else {
      params.set('comp', key)
    }
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="flex gap-1 bg-green-900/40 rounded-lg p-0.5">
      {COMPS.map((comp) => (
        <button
          key={comp.key}
          onClick={() => select(comp.key)}
          className={`px-3 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
            comp.key === current
              ? 'bg-white text-green-800 shadow-sm'
              : 'text-green-200 hover:text-white'
          }`}
        >
          {comp.label}
        </button>
      ))}
    </div>
  )
}
