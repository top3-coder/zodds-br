import { Game } from '@/lib/types'
import { getBookmakerUrl, ALLOWED_BOOKMAKERS } from '@/lib/bookmakers'
import { formatTime, formatDateLabel, calcEV } from '@/lib/utils'
import { COMP_INFO } from '@/lib/competitions'
import { EVBadge } from './EVBadge'
import type { MarketTab } from './GamesView'

// ─── H2H ─────────────────────────────────────────────────────────────────────

interface H2HBm {
  key: string; title: string; url: string
  home: number | null; draw: number | null; away: number | null
}

function processH2H(game: Game): H2HBm[] {
  return game.bookmakers
    .filter((bm) => ALLOWED_BOOKMAKERS.has(bm.key))
    .map((bm) => {
      const mkt = bm.markets.find((m) => m.key === 'h2h')
      if (!mkt) return null
      return {
        key: bm.key, title: bm.title, url: getBookmakerUrl(bm.key),
        home: mkt.outcomes.find((o) => o.name === game.home_team)?.price ?? null,
        draw: mkt.outcomes.find((o) => o.name === 'Draw')?.price ?? null,
        away: mkt.outcomes.find((o) => o.name === game.away_team)?.price ?? null,
      }
    })
    .filter((b): b is H2HBm => {
      if (!b) return false
      const odds = [b.home, b.draw, b.away].filter((v): v is number => v !== null)
      return odds.length > 0 && odds.every((o) => o >= 1.05 && o <= 100)
    })
    .sort((a, b) => a.title.localeCompare(b.title))
}

// ─── GOALS (totals + btts) ────────────────────────────────────────────────────

interface GoalsBm {
  key: string; title: string; url: string
  point: number
  over: number | null; under: number | null
  yes: number | null; no: number | null
}

function processGoals(game: Game): GoalsBm[] {
  return game.bookmakers
    .filter((bm) => ALLOWED_BOOKMAKERS.has(bm.key))
    .map((bm) => {
      const totalsMkt = bm.markets.find((m) => m.key === 'totals')
      const bttsMkt = bm.markets.find((m) => m.key === 'btts')
      if (!totalsMkt && !bttsMkt) return null
      const point = totalsMkt?.outcomes[0]?.point ?? 2.5
      const over = totalsMkt?.outcomes.find((o) => o.name === 'Over')?.price ?? null
      const under = totalsMkt?.outcomes.find((o) => o.name === 'Under')?.price ?? null
      const yes = bttsMkt?.outcomes.find((o) => o.name === 'Yes')?.price ?? null
      const no = bttsMkt?.outcomes.find((o) => o.name === 'No')?.price ?? null
      if ([over, under, yes, no].every((v) => v === null)) return null
      return { key: bm.key, title: bm.title, url: getBookmakerUrl(bm.key), point, over, under, yes, no }
    })
    .filter((b): b is GoalsBm => b !== null)
    .sort((a, b) => a.title.localeCompare(b.title))
}

// ─── ALTERNATE TOTALS (corners / cards) ───────────────────────────────────────

interface AltTotalsBm {
  key: string; title: string; url: string
  point: number
  over: number | null; under: number | null
}

function processAltTotals(game: Game, descFilter: string): AltTotalsBm[] {
  return game.bookmakers
    .filter((bm) => ALLOWED_BOOKMAKERS.has(bm.key))
    .map((bm) => {
      const mkt = bm.markets.find(
        (m) => m.key === 'alternate_totals' && m.description?.toLowerCase().includes(descFilter)
      )
      if (!mkt) return null
      const point = mkt.outcomes[0]?.point ?? 9.5
      const over = mkt.outcomes.find((o) => o.name === 'Over')?.price ?? null
      const under = mkt.outcomes.find((o) => o.name === 'Under')?.price ?? null
      if (over === null && under === null) return null
      return { key: bm.key, title: bm.title, url: getBookmakerUrl(bm.key), point, over, under }
    })
    .filter((b): b is AltTotalsBm => b !== null)
    .sort((a, b) => a.title.localeCompare(b.title))
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function best(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null)
  return valid.length ? Math.max(...valid) : null
}

function shortName(name: string): string {
  if (name.length <= 14) return name
  return name.split(' ')[0]
}

function OddCell({ value, isBest, ev }: { value: number | null; isBest: boolean; ev?: number | null }) {
  if (value === null) return <td className="px-2 py-3 text-center text-gray-300 text-sm">—</td>
  return (
    <td className={`px-2 py-2 text-center ${isBest ? 'bg-green-50' : ''}`}>
      <div className="flex flex-col items-center gap-0.5">
        <span
          className={`inline-flex items-center justify-center gap-1 font-bold text-sm rounded-lg px-3 py-1.5 min-w-[52px] ${
            isBest
              ? 'text-green-700 bg-green-100 ring-1 ring-green-300 shadow-sm'
              : 'text-gray-700'
          }`}
        >
          {value.toFixed(2)}
          {isBest && <span className="text-green-500 font-normal">↑</span>}
        </span>
        <EVBadge ev={ev} />
      </div>
    </td>
  )
}

// ─── Card shell ───────────────────────────────────────────────────────────────

function CardShell({
  game,
  children,
  bestSummary,
}: {
  game: Game
  children: React.ReactNode
  bestSummary?: React.ReactNode
}) {
  const gradient = COMP_INFO[game.sport_key]?.gradient ?? 'from-green-700 to-green-600'

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <div className={`px-4 py-2.5 bg-gradient-to-r ${gradient} flex items-center justify-between`}>
        <span className="text-white text-xs font-medium">
          {COMP_INFO[game.sport_key]?.cardLabel ?? game.sport_title}
        </span>
        <span className="text-green-100 text-xs">
          {formatDateLabel(game.commence_time)} · {formatTime(game.commence_time)}
        </span>
      </div>

      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-center gap-4">
          <div className="flex-1 text-right">
            <p className="font-bold text-gray-900 text-lg leading-tight">{game.home_team}</p>
            <p className="text-xs text-gray-400 mt-0.5">Casa</p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center">
              <span className="text-gray-400 text-xs font-bold">VS</span>
            </div>
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-gray-900 text-lg leading-tight">{game.away_team}</p>
            <p className="text-xs text-gray-400 mt-0.5">Visitante</p>
          </div>
        </div>
      </div>

      {children}

      {bestSummary && (
        <div className="px-4 py-2.5 bg-green-50 border-t border-green-100 flex flex-wrap items-center justify-between gap-2">
          <span className="text-green-700 text-xs font-semibold uppercase tracking-wide">
            ✓ Melhores odds
          </span>
          <div className="flex items-center gap-4 text-xs text-green-800">
            {bestSummary}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── H2H view ─────────────────────────────────────────────────────────────────

function H2HView({ game }: { game: Game }) {
  const bookmakers = processH2H(game)
  if (bookmakers.length === 0) return null

  const pinnacle = bookmakers.find((b) => b.key === 'pinnacle')
  const shortHome = shortName(game.home_team)
  const shortAway = shortName(game.away_team)
  const bestHome = best(bookmakers.map((b) => b.home))
  const bestDraw = best(bookmakers.map((b) => b.draw))
  const bestAway = best(bookmakers.map((b) => b.away))

  return (
    <CardShell
      game={game}
      bestSummary={
        <>
          {bestHome && <span><span className="text-gray-500">{shortHome}: </span><span className="font-bold">{bestHome.toFixed(2)}</span></span>}
          {bestDraw && <span><span className="text-gray-500">Empate: </span><span className="font-bold">{bestDraw.toFixed(2)}</span></span>}
          {bestAway && <span><span className="text-gray-500">{shortAway}: </span><span className="font-bold">{bestAway.toFixed(2)}</span></span>}
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-2.5 text-gray-400 font-medium text-xs uppercase tracking-wide">Casa de Apostas</th>
              <th className="text-center px-2 py-2.5 text-xs">
                <span className="block font-semibold text-gray-700">{shortHome}</span>
                <span className="text-gray-400 font-normal">1</span>
              </th>
              <th className="text-center px-2 py-2.5 text-xs">
                <span className="block font-semibold text-gray-700">Empate</span>
                <span className="text-gray-400 font-normal">X</span>
              </th>
              <th className="text-center px-2 py-2.5 text-xs">
                <span className="block font-semibold text-gray-700">{shortAway}</span>
                <span className="text-gray-400 font-normal">2</span>
              </th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookmakers.map((bm, idx) => {
              const isPinnacle = bm.key === 'pinnacle'
              return (
                <tr key={bm.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="px-4 py-3"><span className="font-medium text-gray-800">{bm.title}</span></td>
                  <OddCell value={bm.home} isBest={bm.home === bestHome} ev={isPinnacle ? undefined : calcEV(pinnacle?.home, bm.home)} />
                  <OddCell value={bm.draw} isBest={bm.draw === bestDraw} ev={isPinnacle ? undefined : calcEV(pinnacle?.draw, bm.draw)} />
                  <OddCell value={bm.away} isBest={bm.away === bestAway} ev={isPinnacle ? undefined : calcEV(pinnacle?.away, bm.away)} />
                  <td className="px-3 py-3 text-right">
                    <a href={bm.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm">
                      Apostar →
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </CardShell>
  )
}

// ─── Goals view ───────────────────────────────────────────────────────────────

function GoalsView({ game }: { game: Game }) {
  const bookmakers = processGoals(game)
  if (bookmakers.length === 0) return <EmptyMarket game={game} label="Gols" />

  const pinnacle = bookmakers.find((b) => b.key === 'pinnacle')
  const point = bookmakers[0]?.point ?? 2.5
  const bestOver = best(bookmakers.map((b) => b.over))
  const bestUnder = best(bookmakers.map((b) => b.under))
  const bestYes = best(bookmakers.map((b) => b.yes))
  const bestNo = best(bookmakers.map((b) => b.no))
  const hasTotals = bookmakers.some((b) => b.over !== null || b.under !== null)
  const hasBtts = bookmakers.some((b) => b.yes !== null || b.no !== null)

  return (
    <CardShell
      game={game}
      bestSummary={
        <>
          {bestOver && <span><span className="text-gray-500">+{point}: </span><span className="font-bold">{bestOver.toFixed(2)}</span></span>}
          {bestUnder && <span><span className="text-gray-500">-{point}: </span><span className="font-bold">{bestUnder.toFixed(2)}</span></span>}
          {bestYes && <span><span className="text-gray-500">BTTS Sim: </span><span className="font-bold">{bestYes.toFixed(2)}</span></span>}
          {bestNo && <span><span className="text-gray-500">BTTS Não: </span><span className="font-bold">{bestNo.toFixed(2)}</span></span>}
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-2.5 text-gray-400 font-medium text-xs uppercase tracking-wide">Casa de Apostas</th>
              {hasTotals && <>
                <th className="text-center px-2 py-2.5 text-xs">
                  <span className="block font-semibold text-gray-700">+{point}</span>
                  <span className="text-gray-400 font-normal">Over</span>
                </th>
                <th className="text-center px-2 py-2.5 text-xs">
                  <span className="block font-semibold text-gray-700">-{point}</span>
                  <span className="text-gray-400 font-normal">Under</span>
                </th>
              </>}
              {hasBtts && <>
                <th className="text-center px-2 py-2.5 text-xs">
                  <span className="block font-semibold text-gray-700">BTTS Sim</span>
                  <span className="text-gray-400 font-normal">Ambas marcam</span>
                </th>
                <th className="text-center px-2 py-2.5 text-xs">
                  <span className="block font-semibold text-gray-700">BTTS Não</span>
                  <span className="text-gray-400 font-normal">Não ambas</span>
                </th>
              </>}
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookmakers.map((bm, idx) => {
              const isPinnacle = bm.key === 'pinnacle'
              return (
                <tr key={bm.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="px-4 py-3"><span className="font-medium text-gray-800">{bm.title}</span></td>
                  {hasTotals && <>
                    <OddCell value={bm.over} isBest={bm.over === bestOver} ev={isPinnacle ? undefined : calcEV(pinnacle?.over, bm.over)} />
                    <OddCell value={bm.under} isBest={bm.under === bestUnder} ev={isPinnacle ? undefined : calcEV(pinnacle?.under, bm.under)} />
                  </>}
                  {hasBtts && <>
                    <OddCell value={bm.yes} isBest={bm.yes === bestYes} ev={isPinnacle ? undefined : calcEV(pinnacle?.yes, bm.yes)} />
                    <OddCell value={bm.no} isBest={bm.no === bestNo} ev={isPinnacle ? undefined : calcEV(pinnacle?.no, bm.no)} />
                  </>}
                  <td className="px-3 py-3 text-right">
                    <a href={bm.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm">
                      Apostar →
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </CardShell>
  )
}

// ─── AltTotals view (corners / cards) ────────────────────────────────────────

function AltTotalsView({ game, descFilter, label }: { game: Game; descFilter: string; label: string }) {
  const bookmakers = processAltTotals(game, descFilter)
  if (bookmakers.length === 0) return <EmptyMarket game={game} label={label} />

  const pinnacle = bookmakers.find((b) => b.key === 'pinnacle')
  const point = bookmakers[0]?.point ?? 9.5
  const bestOver = best(bookmakers.map((b) => b.over))
  const bestUnder = best(bookmakers.map((b) => b.under))

  return (
    <CardShell
      game={game}
      bestSummary={
        <>
          {bestOver && <span><span className="text-gray-500">+{point}: </span><span className="font-bold">{bestOver.toFixed(2)}</span></span>}
          {bestUnder && <span><span className="text-gray-500">-{point}: </span><span className="font-bold">{bestUnder.toFixed(2)}</span></span>}
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-2.5 text-gray-400 font-medium text-xs uppercase tracking-wide">Casa de Apostas</th>
              <th className="text-center px-2 py-2.5 text-xs">
                <span className="block font-semibold text-gray-700">+{point}</span>
                <span className="text-gray-400 font-normal">Over</span>
              </th>
              <th className="text-center px-2 py-2.5 text-xs">
                <span className="block font-semibold text-gray-700">-{point}</span>
                <span className="text-gray-400 font-normal">Under</span>
              </th>
              <th className="px-3 py-2.5" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookmakers.map((bm, idx) => {
              const isPinnacle = bm.key === 'pinnacle'
              return (
                <tr key={bm.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                  <td className="px-4 py-3"><span className="font-medium text-gray-800">{bm.title}</span></td>
                  <OddCell value={bm.over} isBest={bm.over === bestOver} ev={isPinnacle ? undefined : calcEV(pinnacle?.over, bm.over)} />
                  <OddCell value={bm.under} isBest={bm.under === bestUnder} ev={isPinnacle ? undefined : calcEV(pinnacle?.under, bm.under)} />
                  <td className="px-3 py-3 text-right">
                    <a href={bm.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm">
                      Apostar →
                    </a>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </CardShell>
  )
}

// ─── Empty market placeholder ─────────────────────────────────────────────────

function EmptyMarket({ game, label }: { game: Game; label: string }) {
  return (
    <CardShell game={game}>
      <div className="px-4 py-10 text-center">
        <p className="text-gray-400 text-sm">
          Sem dados de <span className="font-medium text-gray-500">{label}</span> para este jogo.
        </p>
      </div>
    </CardShell>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function GameCard({ game, market = 'h2h' }: { game: Game; market?: MarketTab }) {
  if (market === 'goals') return <GoalsView game={game} />
  if (market === 'corners') return <AltTotalsView game={game} descFilter="corner" label="Escanteios" />
  if (market === 'cards') return <AltTotalsView game={game} descFilter="card" label="Cartões" />
  return <H2HView game={game} />
}
