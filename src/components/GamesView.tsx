'use client'

import { useState, useMemo } from 'react'
import GameCard from './GameCard'
import { Game } from '@/lib/types'

export type MarketTab = 'h2h' | 'goals' | 'corners' | 'cards'

const ALL_TABS: { key: MarketTab; label: string }[] = [
  { key: 'h2h', label: 'Resultado' },
  { key: 'goals', label: 'Gols' },
  { key: 'corners', label: 'Escanteios' },
  { key: 'cards', label: 'Cartões' },
]

function hasMarketInGames(games: Game[], marketKey: string): boolean {
  return games.some((g) =>
    g.bookmakers.some((bm) => bm.markets.some((m) => m.key === marketKey))
  )
}

function hasCornersInGames(games: Game[]): boolean {
  return games.some((g) =>
    g.bookmakers.some((bm) =>
      bm.markets.some(
        (m) =>
          m.key === 'alternate_totals' &&
          (m.description?.toLowerCase().includes('corner') ||
            m.description?.toLowerCase().includes('escanteio'))
      )
    )
  )
}

function hasCardsInGames(games: Game[]): boolean {
  return games.some((g) =>
    g.bookmakers.some((bm) =>
      bm.markets.some(
        (m) =>
          m.key === 'alternate_totals' &&
          (m.description?.toLowerCase().includes('card') ||
            m.description?.toLowerCase().includes('cartão'))
      )
    )
  )
}

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

  const allGames = useMemo(
    () => dateKeys.flatMap((k) => grouped[k]),
    [grouped, dateKeys]
  )

  const visibleTabs = useMemo(
    () =>
      ALL_TABS.filter((tab) => {
        if (tab.key === 'h2h') return true
        if (tab.key === 'goals')
          return hasMarketInGames(allGames, 'totals') || hasMarketInGames(allGames, 'btts')
        if (tab.key === 'corners') return hasCornersInGames(allGames)
        if (tab.key === 'cards') return hasCardsInGames(allGames)
        return false
      }),
    [allGames]
  )

  const activeTab = visibleTabs.some((t) => t.key === market) ? market : 'h2h'

  return (
    <div>
      {visibleTabs.length > 1 && (
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMarket(tab.key)}
              className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

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
                <GameCard key={game.id} game={game} market={activeTab} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
