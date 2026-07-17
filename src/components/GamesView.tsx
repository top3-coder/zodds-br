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
  const [stakeInput, setStakeInput] = useState('')
  const stake = parseFloat(stakeInput) || 0

  return (
    <div>
      {/* Market tabs + stake calculator in same row */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-6">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-1">
          {ALL_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMarket(tab.key)}
              className={`flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
                market === tab.key
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stake input */}
        <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5 shadow-sm shrink-0">
          <span className="text-gray-400 text-xs font-medium whitespace-nowrap">💰 Valor:</span>
          <span className="text-gray-500 text-xs font-semibold">R$</span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0,00"
            value={stakeInput}
            onChange={(e) => setStakeInput(e.target.value)}
            className="w-20 text-sm font-bold text-gray-800 placeholder-gray-300 bg-transparent outline-none tabular-nums"
          />
          {stake > 0 && (
            <button
              onClick={() => setStakeInput('')}
              className="text-gray-300 hover:text-gray-500 text-xs leading-none ml-1"
              aria-label="Limpar valor"
            >
              ✕
            </button>
          )}
        </div>
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
                <GameCard key={game.id} game={game} market={market} stake={stake} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
