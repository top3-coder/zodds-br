'use client'

import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { COMP_LIST } from '@/lib/competitions'

export default function CompSelector() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const current = searchParams.get('comp') ?? 'serie-b'

  function select(slug: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (slug === 'serie-b') {
      params.delete('comp')
    } else {
      params.set('comp', slug)
    }
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`)
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-2 px-4 py-2.5 w-max mx-auto">
        {COMP_LIST.map((comp) => (
          <button
            key={comp.slug}
            onClick={() => select(comp.slug)}
            className={`px-4 py-1.5 text-sm font-semibold rounded-full border transition-all whitespace-nowrap ${
              comp.slug === current
                ? 'bg-green-600 border-green-600 text-white shadow-sm'
                : 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'
            }`}
          >
            {comp.label}
          </button>
        ))}
      </div>
    </div>
  )
}
