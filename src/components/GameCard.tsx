import { Game } from '@/lib/types'
import { getBookmakerUrl, ALLOWED_BOOKMAKERS } from '@/lib/bookmakers'
import { formatTime, formatDateLabel } from '@/lib/utils'

interface Props {
  game: Game
}

interface ProcessedBm {
  key: string
  title: string
  url: string
  home: number | null
  draw: number | null
  away: number | null
}

function processBookmakers(game: Game): ProcessedBm[] {
  return game.bookmakers
    .filter((bm) => ALLOWED_BOOKMAKERS.has(bm.key))
    .map((bm) => {
      const h2h = bm.markets.find((m) => m.key === 'h2h')
      if (!h2h) return null
      return {
        key: bm.key,
        title: bm.title,
        url: getBookmakerUrl(bm.key),
        home: h2h.outcomes.find((o) => o.name === game.home_team)?.price ?? null,
        draw: h2h.outcomes.find((o) => o.name === 'Draw')?.price ?? null,
        away: h2h.outcomes.find((o) => o.name === game.away_team)?.price ?? null,
      }
    })
    .filter((b): b is ProcessedBm => b !== null)
    .sort((a, b) => a.title.localeCompare(b.title))
}

function best(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null)
  return valid.length ? Math.max(...valid) : null
}

function OddCell({ value, isBest }: { value: number | null; isBest: boolean }) {
  if (value === null) {
    return <td className="px-2 py-3 text-center text-gray-300 text-sm">—</td>
  }
  return (
    <td className={`px-2 py-3 text-center ${isBest ? 'bg-green-50' : ''}`}>
      <span
        className={`inline-flex items-center justify-center gap-1 font-bold text-sm rounded-lg px-3 py-1.5 min-w-[58px] ${
          isBest
            ? 'text-green-700 bg-green-100 ring-1 ring-green-300 shadow-sm'
            : 'text-gray-700'
        }`}
      >
        {value.toFixed(2)}
        {isBest && <span className="text-green-500 font-normal">↑</span>}
      </span>
    </td>
  )
}

function shortName(name: string): string {
  if (name.length <= 14) return name
  return name.split(' ')[0]
}

export default function GameCard({ game }: Props) {
  const bookmakers = processBookmakers(game)
  if (bookmakers.length === 0) return null

  const bestHome = best(bookmakers.map((b) => b.home))
  const bestDraw = best(bookmakers.map((b) => b.draw))
  const bestAway = best(bookmakers.map((b) => b.away))

  const shortHome = shortName(game.home_team)
  const shortAway = shortName(game.away_team)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      {/* Card header */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-green-700 to-green-600 flex items-center justify-between">
        <span className="text-white text-xs font-medium">⚽ Brasileirão Série B</span>
        <span className="text-green-100 text-xs">
          {formatDateLabel(game.commence_time)} · {formatTime(game.commence_time)}
        </span>
      </div>

      {/* Teams */}
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

      {/* Odds table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-2.5 text-gray-400 font-medium text-xs uppercase tracking-wide">
                Casa de Apostas
              </th>
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
              <th className="px-3 py-2.5 text-xs text-gray-400 font-medium uppercase tracking-wide" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {bookmakers.map((bm, idx) => (
              <tr key={bm.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                <td className="px-4 py-3">
                  <span className="font-medium text-gray-800">{bm.title}</span>
                </td>
                <OddCell value={bm.home} isBest={bm.home === bestHome} />
                <OddCell value={bm.draw} isBest={bm.draw === bestDraw} />
                <OddCell value={bm.away} isBest={bm.away === bestAway} />
                <td className="px-3 py-3 text-right">
                  <a
                    href={bm.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors whitespace-nowrap shadow-sm"
                  >
                    Apostar →
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Best odds summary */}
      <div className="px-4 py-2.5 bg-green-50 border-t border-green-100 flex flex-wrap items-center justify-between gap-2">
        <span className="text-green-700 text-xs font-semibold uppercase tracking-wide">
          ✓ Melhores odds
        </span>
        <div className="flex items-center gap-4 text-xs text-green-800">
          {bestHome && (
            <span>
              <span className="text-gray-500">{shortHome}: </span>
              <span className="font-bold">{bestHome.toFixed(2)}</span>
            </span>
          )}
          {bestDraw && (
            <span>
              <span className="text-gray-500">Empate: </span>
              <span className="font-bold">{bestDraw.toFixed(2)}</span>
            </span>
          )}
          {bestAway && (
            <span>
              <span className="text-gray-500">{shortAway}: </span>
              <span className="font-bold">{bestAway.toFixed(2)}</span>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
