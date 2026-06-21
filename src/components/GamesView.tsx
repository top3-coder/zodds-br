'use client'

import { useState } from 'react'
import GameCard from './GameCard'
import { Game } from '@/lib/types'

export type MarketTab = 'h2h' | 'goals' | 'corners' | 'cards'

const ALL_TABS: { key: MarketTab; label: string }[] = [
  { key: 'h2h', label: 'Resultado' },
  { key: 'goals', label: 'Gols' },
  { key: 'corners', label: 'Escanteios' },
  { key: 'cards', label: 'Cartões' },
]

export default function GamesView({
  grouped,
  dateKeys,
  dateLabels,
}: {
  grouped: Record<string, Game[]>
  dateKeys: string[]
  dateLabels: Record<string, string>
}) {
  const [market, setMarket] = useState<MarketTab>('h2h')

  return (
    <div>
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
        {ALL_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setMarket(tab.key)}
            className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
              market === tab.key
                ? 'bg-white text-green-700 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-10">
        {dateKeys.map((dateKey) => (
          <section key={dateKey}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-xl font-bold text-gray-800 capitalize">
                {dateLabels[dateKey]}
              </h2>
              <span className="bg-green-100 text-green-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
                {grouped[dateKey].length}{' '}
                {grouped[dateKey].length === 1 ? 'jogo' : 'jogos'}
              </span>
            </div>
            <div className="space-y-4">
              {grouped[dateKey].map((game) => (
                <GameCard key={game.id} game={game} market={market} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
