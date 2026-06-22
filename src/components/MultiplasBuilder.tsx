'use client'

import { useState, useMemo } from 'react'
import { Game } from '@/lib/types'
import { getBookmakerUrl, ALLOWED_BOOKMAKERS } from '@/lib/bookmakers'
import { formatTime, formatDateLabel, formatDateHeader, calcEV } from '@/lib/utils'
import { COMP_INFO } from '@/lib/competitions'
import BetSlip, { BetSlipItem } from './BetSlip'
import { EVBadge } from './EVBadge'

// ─── Types ────────────────────────────────────────────────────────────────────

interface BmH2H     { home: number | null; draw: number | null; away: number | null }
interface BmTotals  { point: number; over: number | null; under: number | null }
interface BmBtts    { yes: number | null; no: number | null }
interface BmAltTot  { point: number; over: number | null; under: number | null }

interface ProcessedBm {
  key: string
  title: string
  h2h?: BmH2H
  totals?: BmTotals
  btts?: BmBtts
  corners?: BmAltTot
  cards?: BmAltTot
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

// selections[gameId][marketKey] = outcomeName
type Selections = Record<string, Record<string, string>>

const MEDALS = ['🥇', '🥈', '🥉']
const SP_TZ = 'America/Sao_Paulo'

// ─── Processing ───────────────────────────────────────────────────────────────

function buildProcessedGames(games: Game[]): Map<string, ProcessedGame> {
  const map = new Map<string, ProcessedGame>()
  for (const game of games) {
    const bookmakers: ProcessedBm[] = game.bookmakers
      .filter((bm) => ALLOWED_BOOKMAKERS.has(bm.key))
      .map((bm) => {
        const h2hMkt = bm.markets.find((m) => m.key === 'h2h')
        const totalsMkt = bm.markets.find((m) => m.key === 'totals')
        const bttsMkt = bm.markets.find((m) => m.key === 'btts')

        const h2h: BmH2H | undefined = h2hMkt
          ? {
              home: h2hMkt.outcomes.find((o) => o.name === game.home_team)?.price ?? null,
              draw: h2hMkt.outcomes.find((o) => o.name === 'Draw')?.price ?? null,
              away: h2hMkt.outcomes.find((o) => o.name === game.away_team)?.price ?? null,
            }
          : undefined

        const totals: BmTotals | undefined = totalsMkt
          ? {
              point: totalsMkt.outcomes[0]?.point ?? 2.5,
              over: totalsMkt.outcomes.find((o) => o.name === 'Over')?.price ?? null,
              under: totalsMkt.outcomes.find((o) => o.name === 'Under')?.price ?? null,
            }
          : undefined

        const btts: BmBtts | undefined = bttsMkt
          ? {
              yes: bttsMkt.outcomes.find((o) => o.name === 'Yes')?.price ?? null,
              no: bttsMkt.outcomes.find((o) => o.name === 'No')?.price ?? null,
            }
          : undefined

        const cornersMkt = bm.markets.find(
          (m) => m.key === 'alternate_totals' && m.description?.toLowerCase().includes('corner')
        )
        const cardsMkt = bm.markets.find(
          (m) => m.key === 'alternate_totals' && m.description?.toLowerCase().includes('card')
        )
        const corners: BmAltTot | undefined = cornersMkt
          ? {
              point: cornersMkt.outcomes[0]?.point ?? 9.5,
              over: cornersMkt.outcomes.find((o) => o.name === 'Over')?.price ?? null,
              under: cornersMkt.outcomes.find((o) => o.name === 'Under')?.price ?? null,
            }
          : undefined
        const cards: BmAltTot | undefined = cardsMkt
          ? {
              point: cardsMkt.outcomes[0]?.point ?? 4.5,
              over: cardsMkt.outcomes.find((o) => o.name === 'Over')?.price ?? null,
              under: cardsMkt.outcomes.find((o) => o.name === 'Under')?.price ?? null,
            }
          : undefined

        return { key: bm.key, title: bm.title, h2h, totals, btts, corners, cards }
      })
      .filter((bm) => {
        const validH2H = bm.h2h && Object.values(bm.h2h).some((v) => v !== null && v >= 1.05 && v <= 100)
        const validTotals = bm.totals && [bm.totals.over, bm.totals.under].some((v) => v !== null && v >= 1.05 && v <= 100)
        const validBtts = bm.btts && [bm.btts.yes, bm.btts.no].some((v) => v !== null && v >= 1.05 && v <= 100)
        const validCorners = bm.corners && [bm.corners.over, bm.corners.under].some((v) => v !== null && v >= 1.05 && v <= 100)
        const validCards = bm.cards && [bm.cards.over, bm.cards.under].some((v) => v !== null && v >= 1.05 && v <= 100)
        return validH2H || validTotals || validBtts || validCorners || validCards
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

function getOddFromBm(bm: ProcessedBm, market: string, outcome: string): number | null {
  if (market === 'h2h' && bm.h2h) {
    if (outcome === 'home') return bm.h2h.home
    if (outcome === 'draw') return bm.h2h.draw
    if (outcome === 'away') return bm.h2h.away
  }
  if (market === 'totals' && bm.totals) {
    if (outcome === 'Over') return bm.totals.over
    if (outcome === 'Under') return bm.totals.under
  }
  if (market === 'btts' && bm.btts) {
    if (outcome === 'Yes') return bm.btts.yes
    if (outcome === 'No') return bm.btts.no
  }
  if (market === 'corners' && bm.corners) {
    if (outcome === 'Over') return bm.corners.over
    if (outcome === 'Under') return bm.corners.under
  }
  if (market === 'cards' && bm.cards) {
    if (outcome === 'Over') return bm.cards.over
    if (outcome === 'Under') return bm.cards.under
  }
  return null
}

function short(name: string): string {
  return name.length <= 12 ? name : name.split(' ')[0]
}

// ─── Game Card ────────────────────────────────────────────────────────────────

function MultiplasCard({
  game,
  gameSels,
  gradient,
  onToggle,
}: {
  game: ProcessedGame
  gameSels: Record<string, string>
  gradient: string
  onToggle: (gameId: string, market: string, outcome: string) => void
}) {
  const hasH2H = game.bookmakers.some((bm) => bm.h2h)
  const hasTotals = game.bookmakers.some((bm) => bm.totals)
  const hasBtts = game.bookmakers.some((bm) => bm.btts)
  const hasCorners = game.bookmakers.some((bm) => bm.corners)
  const hasCards = game.bookmakers.some((bm) => bm.cards)
  const totalsPoint = game.bookmakers.find((bm) => bm.totals)?.totals?.point ?? 2.5
  const cornersPoint = game.bookmakers.find((bm) => bm.corners)?.corners?.point ?? 9.5
  const cardsPoint = game.bookmakers.find((bm) => bm.cards)?.cards?.point ?? 4.5

  const anySelected = Object.keys(gameSels).length > 0

  function isActive(market: string, outcome: string) {
    return gameSels[market] === outcome
  }

  const btnBase = 'px-2.5 py-1.5 text-xs font-semibold rounded-lg border transition-all whitespace-nowrap'
  const btnActive = 'bg-green-600 border-green-600 text-white shadow-sm'
  const btnIdle = 'bg-white border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'

  return (
    <div
      className={`bg-white rounded-xl border shadow-sm transition-all ${
        anySelected ? 'border-green-300 shadow-green-50' : 'border-gray-100'
      }`}
    >
      <div className={`px-4 py-2 bg-gradient-to-r ${gradient} rounded-t-xl flex justify-between items-center`}>
        <span className="text-white text-xs font-medium">{formatDateLabel(game.commence_time)}</span>
        <span className="text-green-100 text-xs">{formatTime(game.commence_time)}</span>
      </div>

      <div className="px-4 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 text-sm truncate">{game.home_team}</span>
          <span className="text-gray-300 text-xs shrink-0">vs</span>
          <span className="font-semibold text-gray-900 text-sm truncate">{game.away_team}</span>
        </div>
      </div>

      <div className="px-4 pb-3.5 space-y-2.5 mt-2">
        {hasH2H && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 w-16 shrink-0">Resultado</span>
            <div className="flex gap-1 flex-wrap">
              {(['home', 'draw', 'away'] as const).map((outcome) => {
                const label = outcome === 'home' ? short(game.home_team) : outcome === 'draw' ? 'Empate' : short(game.away_team)
                return (
                  <button
                    key={outcome}
                    onClick={() => onToggle(game.id, 'h2h', outcome)}
                    className={`${btnBase} ${isActive('h2h', outcome) ? btnActive : btnIdle}`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {(hasTotals || hasBtts) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 w-16 shrink-0">Gols</span>
            <div className="flex gap-1 flex-wrap">
              {hasTotals && (
                <>
                  <button onClick={() => onToggle(game.id, 'totals', 'Over')} className={`${btnBase} ${isActive('totals', 'Over') ? btnActive : btnIdle}`}>+{totalsPoint}</button>
                  <button onClick={() => onToggle(game.id, 'totals', 'Under')} className={`${btnBase} ${isActive('totals', 'Under') ? btnActive : btnIdle}`}>-{totalsPoint}</button>
                </>
              )}
              {hasBtts && (
                <>
                  <button onClick={() => onToggle(game.id, 'btts', 'Yes')} className={`${btnBase} ${isActive('btts', 'Yes') ? btnActive : btnIdle}`}>BTTS Sim</button>
                  <button onClick={() => onToggle(game.id, 'btts', 'No')} className={`${btnBase} ${isActive('btts', 'No') ? btnActive : btnIdle}`}>BTTS Não</button>
                </>
              )}
            </div>
          </div>
        )}

        {hasCorners && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 w-16 shrink-0">Escanteios</span>
            <div className="flex gap-1 flex-wrap">
              <button onClick={() => onToggle(game.id, 'corners', 'Over')} className={`${btnBase} ${isActive('corners', 'Over') ? btnActive : btnIdle}`}>+{cornersPoint}</button>
              <button onClick={() => onToggle(game.id, 'corners', 'Under')} className={`${btnBase} ${isActive('corners', 'Under') ? btnActive : btnIdle}`}>-{cornersPoint}</button>
            </div>
          </div>
        )}

        {hasCards && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400 w-16 shrink-0">Cartões</span>
            <div className="flex gap-1 flex-wrap">
              <button onClick={() => onToggle(game.id, 'cards', 'Over')} className={`${btnBase} ${isActive('cards', 'Over') ? btnActive : btnIdle}`}>+{cardsPoint}</button>
              <button onClick={() => onToggle(game.id, 'cards', 'Under')} className={`${btnBase} ${isActive('cards', 'Under') ? btnActive : btnIdle}`}>-{cardsPoint}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MultiplasBuilder({ games }: { games: Game[] }) {
  const [selections, setSelections] = useState<Selections>({})

  const processedGames = useMemo(() => buildProcessedGames(games), [games])
  const dateGroups = useMemo(() => buildDateGroups(processedGames), [processedGames])

  const sportKey = games[0]?.sport_key ?? 'soccer_brazil_serie_b'
  const gradient = COMP_INFO[sportKey]?.gradient ?? 'from-green-700 to-green-600'

  function toggle(gameId: string, market: string, outcome: string) {
    setSelections((prev) => {
      const gameSels = { ...(prev[gameId] ?? {}) }
      if (gameSels[market] === outcome) {
        delete gameSels[market]
      } else {
        gameSels[market] = outcome
      }
      if (Object.keys(gameSels).length === 0) {
        const next = { ...prev }
        delete next[gameId]
        return next
      }
      return { ...prev, [gameId]: gameSels }
    })
  }

  const allSels = useMemo(() => {
    const list: { gameId: string; market: string; outcome: string }[] = []
    for (const [gameId, mktSels] of Object.entries(selections)) {
      for (const [market, outcome] of Object.entries(mktSels)) {
        list.push({ gameId, market, outcome })
      }
    }
    return list
  }, [selections])

  const ranking = useMemo((): RankedBm[] => {
    if (allSels.length < 2) return []

    const allBmKeys = new Set<string>()
    for (const { gameId } of allSels) {
      processedGames.get(gameId)?.bookmakers.forEach((bm) => allBmKeys.add(bm.key))
    }

    const result: RankedBm[] = []
    allBmKeys.forEach((bmKey) => {
      let totalOdd = 1
      let valid = true
      let title = ''

      for (const { gameId, market, outcome } of allSels) {
        const bm = processedGames.get(gameId)?.bookmakers.find((b) => b.key === bmKey)
        if (!bm) { valid = false; break }
        title = bm.title
        const odd = getOddFromBm(bm, market, outcome)
        if (odd === null || odd < 1.05) { valid = false; break }
        totalOdd *= odd
      }

      if (valid) result.push({ key: bmKey, title, url: getBookmakerUrl(bmKey), totalOdd })
    })

    return result.sort((a, b) => b.totalOdd - a.totalOdd)
  }, [allSels, processedGames])

  const selectedCount = allSels.length
  const totalGames = processedGames.size

  const betSlipItems = useMemo((): BetSlipItem[] => {
    const bestBmKey = ranking[0]?.key ?? null

    return allSels
      .map(({ gameId, market, outcome }) => {
        const game = processedGames.get(gameId)
        if (!game) return null

        // Individual odd: prefer the best combined bookmaker, fallback to best available
        let odd: number | null = null
        if (bestBmKey) {
          const bm = game.bookmakers.find((b) => b.key === bestBmKey)
          if (bm) odd = getOddFromBm(bm, market, outcome)
        }
        if (odd === null) {
          for (const bm of game.bookmakers) {
            const o = getOddFromBm(bm, market, outcome)
            if (o !== null && (odd === null || o > odd)) odd = o
          }
        }

        const point = game.bookmakers.find((bm) => bm.totals)?.totals?.point ?? 2.5
        let selectionLabel = outcome
        if (market === 'h2h') {
          selectionLabel =
            outcome === 'home'
              ? `Vitória ${short(game.home_team)}`
              : outcome === 'draw'
              ? 'Empate'
              : `Vitória ${short(game.away_team)}`
        } else if (market === 'totals') {
          selectionLabel = outcome === 'Over' ? `+${point} Gols` : `-${point} Gols`
        } else if (market === 'btts') {
          selectionLabel = outcome === 'Yes' ? 'BTTS Sim' : 'BTTS Não'
        } else if (market === 'corners') {
          const p = game.bookmakers.find((bm) => bm.corners)?.corners?.point ?? 9.5
          selectionLabel = outcome === 'Over' ? `+${p} Escanteios` : `-${p} Escanteios`
        } else if (market === 'cards') {
          const p = game.bookmakers.find((bm) => bm.cards)?.cards?.point ?? 4.5
          selectionLabel = outcome === 'Over' ? `+${p} Cartões` : `-${p} Cartões`
        }

        return {
          key: `${gameId}-${market}-${outcome}`,
          gameLabel: `${short(game.home_team)} × ${short(game.away_team)}`,
          selectionLabel,
          odd,
        }
      })
      .filter((item): item is BetSlipItem => item !== null)
  }, [allSels, processedGames, ranking])

  const pinnacleRanked = useMemo(() => ranking.find((r) => r.key === 'pinnacle') ?? null, [ranking])

  function clearAll() {
    setSelections({})
  }

  return (
    <>
    <div className={`space-y-8 transition-all duration-300 ${selectedCount > 0 ? 'lg:pr-80' : ''}`}>
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
                  {dg.games.map((game) => (
                    <MultiplasCard
                      key={game.id}
                      game={game}
                      gameSels={selections[game.id] ?? {}}
                      gradient={gradient}
                      onToggle={toggle}
                    />
                  ))}
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
              Nenhuma casa possui odds para todos os resultados selecionados.
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
              {ranking.map((bm, idx) => {
                const ev = (bm.key === 'pinnacle' || !pinnacleRanked)
                  ? null
                  : calcEV(pinnacleRanked.totalOdd, bm.totalOdd)
                return (
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
                    <div className="flex flex-col items-end gap-0.5">
                      <span className={`font-bold text-xl tabular-nums ${idx === 0 ? 'text-green-700' : 'text-gray-700'}`}>
                        {bm.totalOdd.toFixed(2)}
                      </span>
                      <EVBadge ev={ev} />
                    </div>
                    <a
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm whitespace-nowrap"
                    >
                      Apostar →
                    </a>
                  </div>
                )
              })}
            </div>

            <div className="border-t border-green-100 bg-green-50 px-4 py-2.5 flex justify-between items-center flex-wrap gap-2">
              <span className="text-xs text-green-700 font-medium">
                {selectedCount} resultado{selectedCount !== 1 ? 's' : ''} · {ranking.length} casa
                {ranking.length !== 1 ? 's' : ''} com cobertura completa
              </span>
              <button
                onClick={clearAll}
                className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium"
              >
                Limpar seleção
              </button>
            </div>
          </div>
        )}
      </section>
    </div>

    <BetSlip
      items={betSlipItems}
      totalOdd={ranking[0]?.totalOdd ?? null}
      bestTitle={ranking[0]?.title ?? null}
      bestUrl={ranking[0]?.url ?? null}
      evTotal={
        ranking[0] && pinnacleRanked && ranking[0].key !== 'pinnacle'
          ? calcEV(pinnacleRanked.totalOdd, ranking[0].totalOdd)
          : null
      }
      onClear={clearAll}
    />
    </>
  )
}
