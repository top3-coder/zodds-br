'use client'

import { useState, useMemo } from 'react'
import { Game } from '@/lib/types'
import { getBookmakerUrl, ALLOWED_BOOKMAKERS } from '@/lib/bookmakers'
import { formatTime, formatDateLabel, formatDateHeader } from '@/lib/utils'
import { COMP_INFO } from '@/lib/competitions'

type Selection = 'home' | 'draw' | 'away'

interface ProcessedBm {
  key: string
  title: string
  home: number | null
  draw: number | null
  away: number | null
}

interface ProcessedGame {
  id: string
  sport_key: string
  home_team: string
  away_team: string
  commence_time: string
  bookmakers: ProcessedBm[]
}

interface RankedBm {
  key: string
  title: string
  url: string
  totalOdd: number
}

interface DateGroup {
  dateKey: string
  games: ProcessedGame[]
}

const MEDALS = ['🥇', '🥈', '🥉']
const SP_TZ = 'America/Sao_Paulo'

function buildProcessedGames(games: Game[]): Map<string, ProcessedGame> {
  const map = new Map<string, ProcessedGame>()
  for (const game of games) {
    const bookmakers = game.bookmakers
      .filter((bm) => ALLOWED_BOOKMAKERS.has(bm.key))
      .map((bm) => {
        const h2h = bm.markets.find((m) => m.key === 'h2h')
        return {
          key: bm.key,
          title: bm.title,
          home: h2h?.outcomes.find((o) => o.name === game.home_team)?.price ?? null,
          draw: h2h?.outcomes.find((o) => o.name === 'Draw')?.price ?? null,
          away: h2h?.outcomes.find((o) => o.name === game.away_team)?.price ?? null,
        }
      })
      .filter((bm) => {
        const odds = [bm.home, bm.draw, bm.away].filter((v): v is number => v !== null)
        return odds.length > 0 && odds.every((o) => o >= 1.05 && o <= 100)
      })

    if (bookmakers.length > 0) {
      map.set(game.id, {
        id: game.id,
        sport_key: game.sport_key,
        home_team: game.home_team,
        away_team: game.away_team,
        commence_time: game.commence_time,
        bookmakers,
      })
    }
  }
  return map
}

function buildDateGroups(processedGames: Map<string, ProcessedGame>): DateGroup[] {
  const dateMap = new Map<string, ProcessedGame[]>()
  for (const game of Array.from(processedGames.values())) {
    const dateKey = new Date(game.commence_time).toLocaleDateString('en-CA', { timeZone: SP_TZ })
    if (!dateMap.has(dateKey)) dateMap.set(dateKey, [])
    dateMap.get(dateKey)!.push(game)
  }
  return Array.from(dateMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, games]) => ({
      dateKey,
      games: games.sort(
        (a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime()
      ),
    }))
}

function short(name: string): string {
  return name.length <= 12 ? name : name.split(' ')[0]
}

export default function MultiplasBuilder({ games }: { games: Game[] }) {
  const [selections, setSelections] = useState<Record<string, Selection>>({})

  const processedGames = useMemo(() => buildProcessedGames(games), [games])
  const dateGroups = useMemo(() => buildDateGroups(processedGames), [processedGames])

  const sportKey = games[0]?.sport_key ?? 'soccer_brazil_serie_b'
  const gradient = COMP_INFO[sportKey]?.gradient ?? 'from-green-700 to-green-600'

  const ranking = useMemo((): RankedBm[] => {
    const entries = Object.entries(selections) as [string, Selection][]
    if (entries.length < 2) return []

    const allBmKeys = new Set<string>()
    for (const [gameId] of entries) {
      processedGames.get(gameId)?.bookmakers.forEach((bm) => allBmKeys.add(bm.key))
    }

    const result: RankedBm[] = []

    allBmKeys.forEach((bmKey) => {
      let totalOdd = 1
      let valid = true
      let title = ''

      for (const [gameId, outcome] of entries) {
        const bm = processedGames.get(gameId)?.bookmakers.find((b) => b.key === bmKey)
        if (!bm) { valid = false; break }
        title = bm.title
        const odd = outcome === 'home' ? bm.home : outcome === 'draw' ? bm.draw : bm.away
        if (odd === null) { valid = false; break }
        totalOdd *= odd
      }

      if (valid) result.push({ key: bmKey, title, url: getBookmakerUrl(bmKey), totalOdd })
    })

    return result.sort((a, b) => b.totalOdd - a.totalOdd)
  }, [selections, processedGames])

  function toggle(gameId: string, outcome: Selection) {
    setSelections((prev) => {
      if (prev[gameId] === outcome) {
        const next = { ...prev }
        delete next[gameId]
        return next
      }
      return { ...prev, [gameId]: outcome }
    })
  }

  const selectedCount = Object.keys(selections).length
  const totalGames = processedGames.size

  return (
    <div className="space-y-8">
      {/* Step 1 */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-7 h-7 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold shrink-0">
            1
          </div>
          <h2 className="text-lg font-bold text-gray-800">Selecione os resultados</h2>
          {selectedCount > 0 && (
            <span className="bg-green-100 text-green-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
              {selectedCount} selecionado{selectedCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {totalGames === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="text-4xl mb-3">⚽</div>
            <p className="text-gray-500">Nenhum jogo disponível no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {dateGroups.map((dg) => (
              <div key={dg.dateKey}>
                <div className="flex items-center gap-2 mb-2 px-1">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    📅 {formatDateHeader(dg.dateKey)}
                  </span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>

                <div className="space-y-2">
                  {dg.games.map((game) => {
                    const sel = selections[game.id]
                    return (
                      <div
                        key={game.id}
                        className={`bg-white rounded-xl border shadow-sm transition-all ${
                          sel ? 'border-green-300 shadow-green-50' : 'border-gray-100'
                        }`}
                      >
                        <div className={`px-4 py-2 bg-gradient-to-r ${gradient} rounded-t-xl flex justify-between items-center`}>
                          <span className="text-white text-xs font-medium">
                            {formatDateLabel(game.commence_time)}
                          </span>
                          <span className="text-green-100 text-xs">
                            {formatTime(game.commence_time)}
                          </span>
                        </div>

                        <div className="px-4 py-3.5 flex flex-wrap items-center gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900 text-sm truncate">
                                {game.home_team}
                              </span>
                              <span className="text-gray-300 text-xs shrink-0">vs</span>
                              <span className="font-semibold text-gray-900 text-sm truncate">
                                {game.away_team}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2 shrink-0">
                            {(['home', 'draw', 'away'] as Selection[]).map((outcome) => {
                              const label =
                                outcome === 'home'
                                  ? short(game.home_team)
                                  : outcome === 'draw'
                                  ? 'Empate'
                                  : short(game.away_team)
                              const active = sel === outcome
                              return (
                                <button
                                  key={outcome}
                                  onClick={() => toggle(game.id, outcome)}
                                  className={`px-3 py-1.5 text-sm font-semibold rounded-lg border transition-all ${
                                    active
                                      ? 'bg-green-600 border-green-600 text-white shadow-sm'
                                      : 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'
                                  }`}
                                >
                                  {label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Step 2 — Ranking */}
      <section>
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
              selectedCount >= 2 ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}
          >
            2
          </div>
          <h2 className="text-lg font-bold text-gray-800">Ranking das casas de apostas</h2>
        </div>

        {selectedCount < 2 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
            <p className="text-gray-400 text-sm">
              Selecione pelo menos{' '}
              <span className="font-semibold text-gray-600">2 resultados</span> para ver o ranking.
            </p>
          </div>
        ) : ranking.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-10 text-center">
            <p className="text-gray-400 text-sm">
              Nenhuma casa possui odds para todos os jogos selecionados.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-100 px-4 py-2.5 grid grid-cols-[2rem_1fr_auto_auto] gap-4 items-center">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">#</span>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Casa</span>
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide text-right">Odd Total</span>
              <span />
            </div>

            <div className="divide-y divide-gray-50">
              {ranking.map((bm, idx) => (
                <div
                  key={bm.key}
                  className={`px-4 py-3.5 grid grid-cols-[2rem_1fr_auto_auto] gap-4 items-center transition-colors ${
                    idx === 0 ? 'bg-green-50' : 'hover:bg-gray-50/60'
                  }`}
                >
                  <div className="text-center text-lg leading-none">
                    {idx < 3 ? (
                      MEDALS[idx]
                    ) : (
                      <span className="text-gray-400 text-sm font-semibold">{idx + 1}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-gray-800 truncate">{bm.title}</span>
                    {idx === 0 && (
                      <span className="text-xs bg-green-200 text-green-800 font-semibold px-1.5 py-0.5 rounded shrink-0">
                        Melhor
                      </span>
                    )}
                  </div>
                  <span className={`font-bold text-xl tabular-nums ${idx === 0 ? 'text-green-700' : 'text-gray-700'}`}>
                    {bm.totalOdd.toFixed(2)}
                  </span>
                  <a
                    href={bm.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap"
                  >
                    Apostar →
                  </a>
                </div>
              ))}
            </div>

            <div className="border-t border-green-100 bg-green-50 px-4 py-2.5 flex justify-between items-center flex-wrap gap-2">
              <span className="text-xs text-green-700 font-medium">
                {selectedCount} resultado{selectedCount !== 1 ? 's' : ''} · {ranking.length} casa
                {ranking.length !== 1 ? 's' : ''} com cobertura completa
              </span>
              <button
                onClick={() => setSelections({})}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
              >
                Limpar seleção
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
