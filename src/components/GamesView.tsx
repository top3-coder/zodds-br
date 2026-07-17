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
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mb-8">
        <div className="flex gap-1 bg-white border border-gray-100 rounded-2xl p-1 flex-1 shadow-sm">
          {ALL_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setMarket(tab.key)}
              className={`flex-1 px-2 sm:px-3 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                market === tab.key
                  ? 'text-white shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
              style={market === tab.key ? { background: 'linear-gradient(135deg, #0f5c2e 0%, #1a7a3c 100%)' } : {}}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Stake input */}
        <div className="flex items-center gap-1.5 bg-white border border-gray-100 rounded-2xl px-4 py-2 shadow-sm shrink-0">
          <span className="text-gray-400 text-xs font-medium whitespace-nowrap">💰 Valor:</span>
          <span className="text-xs font-bold" style={{ color: '#1a7a3c' }}>R$</span>
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

      <div className="space-y-12">
        {dateKeys.map((dateKey) => (
          <section key={dateKey}>
            <div className="flex items-center gap-3 mb-5">
              <h2
                className="text-xl font-extrabold text-gray-900 capitalize"
                style={{ letterSpacing: '-0.02em' }}
              >
                {dateLabels[dateKey]}
              </h2>
              <span
                className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: '#f0faf4', color: '#1a7a3c' }}
              >
                {grouped[dateKey].length}{' '}
                {grouped[dateKey].length === 1 ? 'jogo' : 'jogos'}
              </span>
            </div>
            <div className="space-y-5">
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
