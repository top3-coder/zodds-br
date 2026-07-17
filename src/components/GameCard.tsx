'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { Game } from '@/lib/types'
import { getBookmakerUrl, ALLOWED_BOOKMAKERS } from '@/lib/bookmakers'
import { formatTime, formatDateLabel, calcEV } from '@/lib/utils'
import { COMP_INFO } from '@/lib/competitions'
import { EVBadge } from './EVBadge'
import type { MarketTab } from './GamesView'

const StakeCtx = createContext<number>(0)

// ─── Team Avatar ──────────────────────────────────────────────────────────────

const AVATAR_PALETTE = [
  '#e53e3e', '#3182ce', '#805ad5', '#dd6b20',
  '#2c7a7b', '#d53f8c', '#4c51bf', '#b7791f',
  '#0987a0', '#c53030', '#6b46c1', '#276749',
]

// Country name → ISO flag code (flagcdn.com)
const NATIONAL_FLAGS: Record<string, string> = {
  'brazil': 'br', 'brasil': 'br',
  'argentina': 'ar',
  'colombia': 'co',
  'chile': 'cl',
  'uruguay': 'uy',
  'ecuador': 'ec',
  'peru': 'pe',
  'venezuela': 've',
  'bolivia': 'bo',
  'paraguay': 'py',
  'costa rica': 'cr',
  'panama': 'pa',
  'honduras': 'hn',
  'jamaica': 'jm',
  'mexico': 'mx',
  'canada': 'ca',
  'united states': 'us', 'usa': 'us',
  'spain': 'es',
  'france': 'fr',
  'germany': 'de',
  'italy': 'it',
  'england': 'gb-eng',
  'scotland': 'gb-sct',
  'wales': 'gb-wls',
  'portugal': 'pt',
  'netherlands': 'nl',
  'belgium': 'be',
  'croatia': 'hr',
  'denmark': 'dk',
  'sweden': 'se',
  'norway': 'no',
  'switzerland': 'ch',
  'austria': 'at',
  'poland': 'pl',
  'czech republic': 'cz',
  'ukraine': 'ua',
  'turkey': 'tr',
  'greece': 'gr',
  'serbia': 'rs',
  'romania': 'ro',
  'japan': 'jp',
  'south korea': 'kr',
  'australia': 'au',
  'morocco': 'ma',
  'senegal': 'sn',
  'nigeria': 'ng',
  'ghana': 'gh',
  'cameroon': 'cm',
}

function getNationalFlag(name: string): string | null {
  const lower = name.toLowerCase()
  for (const [keyword, code] of Object.entries(NATIONAL_FLAGS)) {
    if (lower === keyword || lower.startsWith(keyword + ' ')) {
      return `https://flagcdn.com/w80/${code}.png`
    }
  }
  return null
}

function getInitials(name: string): string {
  const words = name.split(' ').filter((w) => w.length > 2)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

function hashColor(name: string): string {
  let h = 0
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length]
}

// Module-level cache: string = URL, null = failed, undefined = not fetched
const crestCache = new Map<string, string | null>()

function TeamAvatar({ name }: { name: string }) {
  const [imgUrl, setImgUrl] = useState<string | null | undefined>(
    crestCache.has(name) ? crestCache.get(name) : undefined
  )

  useEffect(() => {
    if (crestCache.has(name)) return

    // National teams → flagcdn
    const flag = getNationalFlag(name)
    if (flag) {
      crestCache.set(name, flag)
      setImgUrl(flag)
      return
    }

    // Club teams → TheSportsDB via proxy
    fetch(`/api/crest?q=${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data: { url: string | null }) => {
        crestCache.set(name, data.url ?? null)
        setImgUrl(data.url ?? null)
      })
      .catch(() => {
        crestCache.set(name, null)
        setImgUrl(null)
      })
  }, [name])

  // Loading skeleton
  if (imgUrl === undefined) {
    return (
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 shrink-0 animate-pulse" />
    )
  }

  // Success — show crest/flag
  if (imgUrl !== null) {
    return (
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
        <img
          src={imgUrl}
          alt={name}
          className="w-9 h-9 sm:w-11 sm:h-11 object-contain"
          onError={() => {
            crestCache.set(name, null)
            setImgUrl(null)
          }}
        />
      </div>
    )
  }

  // Fallback — colored circle with initials
  return (
    <div
      className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shrink-0 shadow-sm"
      style={{ background: hashColor(name) }}
    >
      <span className="text-white text-xs font-extrabold tracking-wide">{getInitials(name)}</span>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBRL(value: number): string {
  return `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

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

// ─── GOALS ───────────────────────────────────────────────────────────────────

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

// ─── ALT TOTALS ───────────────────────────────────────────────────────────────

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function best(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null)
  return valid.length ? Math.max(...valid) : null
}

function shortName(name: string): string {
  if (name.length <= 14) return name
  return name.split(' ')[0]
}

// ─── OddCell ─────────────────────────────────────────────────────────────────

function OddCell({ value, isBest, ev }: { value: number | null; isBest: boolean; ev?: number | null }) {
  const stake = useContext(StakeCtx)
  if (value === null) {
    return <td className="px-2 sm:px-3 py-3.5 text-center text-gray-200 text-sm select-none">—</td>
  }
  return (
    <td className={`px-2 sm:px-3 py-3.5 text-center ${isBest ? 'bg-[#f0faf4]' : ''}`}>
      <div className="flex flex-col items-center gap-1">
        <span
          className={`inline-flex items-center justify-center font-bold text-base rounded-xl px-3 py-1.5 min-w-[54px] tabular-nums ${
            isBest
              ? 'text-[#1a7a3c] bg-green-100 ring-1 ring-green-300 shadow-sm'
              : 'text-gray-700 bg-gray-50'
          }`}
        >
          {value.toFixed(2)}
        </span>
        <EVBadge ev={ev} />
        {stake > 0 && (
          <span className="text-[9px] text-gray-400 font-medium tabular-nums whitespace-nowrap">
            {formatBRL(stake * value)}
          </span>
        )}
      </div>
    </td>
  )
}

const betBtn =
  'inline-flex items-center gap-1 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all whitespace-nowrap shadow-sm hover:shadow-md active:scale-95'

// ─── Card Shell ───────────────────────────────────────────────────────────────

function CardShell({
  game,
  children,
  bestSummary,
}: {
  game: Game
  children: React.ReactNode
  bestSummary?: React.ReactNode
}) {
  const gradient = COMP_INFO[game.sport_key]?.gradient ?? 'from-[#0f5c2e] to-[#1a7a3c]'

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-md"
      style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07), 0 1px 3px 0 rgba(0,0,0,0.05)' }}
    >
      <div className={`px-5 py-2.5 bg-gradient-to-r ${gradient} flex items-center justify-between`}>
        <span className="text-white text-xs font-semibold tracking-wider uppercase opacity-90">
          {COMP_INFO[game.sport_key]?.cardLabel ?? game.sport_title}
        </span>
        <span className="text-white/70 text-xs font-medium">
          {formatDateLabel(game.commence_time)} · {formatTime(game.commence_time)}
        </span>
      </div>

      <div className="px-5 sm:px-7 py-5 sm:py-6 border-b border-gray-50">
        <div className="flex items-center justify-center gap-4 sm:gap-8">
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamAvatar name={game.home_team} />
            <p className="font-bold text-gray-900 text-sm sm:text-base leading-snug text-center">
              {game.home_team}
            </p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Casa</p>
          </div>

          <div className="flex-shrink-0">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: '#f0faf4' }}
            >
              <span className="text-[#1a7a3c] text-xs font-extrabold">VS</span>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamAvatar name={game.away_team} />
            <p className="font-bold text-gray-900 text-sm sm:text-base leading-snug text-center">
              {game.away_team}
            </p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Visitante</p>
          </div>
        </div>
      </div>

      {children}

      {bestSummary && (
        <div
          className="px-5 py-2.5 border-t border-green-50 flex flex-wrap items-center justify-between gap-2"
          style={{ background: '#f0faf4' }}
        >
          <span className="text-[#0f5c2e] text-[10px] font-bold uppercase tracking-widest">
            ✓ Melhores odds
          </span>
          <div className="flex items-center gap-4 text-xs text-[#1a7a3c] font-semibold">
            {bestSummary}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Table helpers ────────────────────────────────────────────────────────────

function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead>
      <tr className="border-b border-gray-100 bg-gray-50/70">
        {children}
      </tr>
    </thead>
  )
}

function Th({ children, align = 'center' }: { children?: React.ReactNode; align?: 'left' | 'center' }) {
  return (
    <th className={`px-3 sm:px-4 py-3 text-${align} text-[10px] font-bold text-gray-400 uppercase tracking-widest`}>
      {children}
    </th>
  )
}

// ─── H2H View ────────────────────────────────────────────────────────────────

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
          {bestHome && <span><span className="text-gray-400 font-medium">{shortHome}: </span>{bestHome.toFixed(2)}</span>}
          {bestDraw && <span><span className="text-gray-400 font-medium">X: </span>{bestDraw.toFixed(2)}</span>}
          {bestAway && <span><span className="text-gray-400 font-medium">{shortAway}: </span>{bestAway.toFixed(2)}</span>}
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <THead>
            <Th align="left">Casa de apostas</Th>
            <Th>{shortHome}</Th>
            <Th>Empate</Th>
            <Th>{shortAway}</Th>
            <th className="px-3 sm:px-4 py-3" />
          </THead>
          <tbody className="divide-y divide-gray-50">
            {bookmakers.map((bm, idx) => {
              const isPinnacle = bm.key === 'pinnacle'
              return (
                <tr key={bm.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                  <td className="px-3 sm:px-4 py-3.5">
                    <span className="font-semibold text-gray-700 text-sm">{bm.title}</span>
                  </td>
                  <OddCell value={bm.home} isBest={bm.home === bestHome} ev={isPinnacle ? undefined : calcEV(pinnacle?.home, bm.home)} />
                  <OddCell value={bm.draw} isBest={bm.draw === bestDraw} ev={isPinnacle ? undefined : calcEV(pinnacle?.draw, bm.draw)} />
                  <OddCell value={bm.away} isBest={bm.away === bestAway} ev={isPinnacle ? undefined : calcEV(pinnacle?.away, bm.away)} />
                  <td className="px-3 sm:px-4 py-3.5 text-right">
                    <a href={bm.url} target="_blank" rel="noopener noreferrer"
                      className={betBtn}
                      style={{ background: 'linear-gradient(135deg, #0f5c2e 0%, #1a7a3c 100%)' }}
                    >
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

// ─── Goals View ───────────────────────────────────────────────────────────────

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
          {bestOver && <span><span className="text-gray-400 font-medium">+{point}: </span>{bestOver.toFixed(2)}</span>}
          {bestUnder && <span><span className="text-gray-400 font-medium">-{point}: </span>{bestUnder.toFixed(2)}</span>}
          {bestYes && <span><span className="text-gray-400 font-medium">BTTS S: </span>{bestYes.toFixed(2)}</span>}
          {bestNo && <span><span className="text-gray-400 font-medium">BTTS N: </span>{bestNo.toFixed(2)}</span>}
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <THead>
            <Th align="left">Casa de apostas</Th>
            {hasTotals && <><Th>+{point}</Th><Th>-{point}</Th></>}
            {hasBtts && <><Th>BTTS S</Th><Th>BTTS N</Th></>}
            <th className="px-3 sm:px-4 py-3" />
          </THead>
          <tbody className="divide-y divide-gray-50">
            {bookmakers.map((bm, idx) => {
              const isPinnacle = bm.key === 'pinnacle'
              return (
                <tr key={bm.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                  <td className="px-3 sm:px-4 py-3.5">
                    <span className="font-semibold text-gray-700 text-sm">{bm.title}</span>
                  </td>
                  {hasTotals && <>
                    <OddCell value={bm.over} isBest={bm.over === bestOver} ev={isPinnacle ? undefined : calcEV(pinnacle?.over, bm.over)} />
                    <OddCell value={bm.under} isBest={bm.under === bestUnder} ev={isPinnacle ? undefined : calcEV(pinnacle?.under, bm.under)} />
                  </>}
                  {hasBtts && <>
                    <OddCell value={bm.yes} isBest={bm.yes === bestYes} ev={isPinnacle ? undefined : calcEV(pinnacle?.yes, bm.yes)} />
                    <OddCell value={bm.no} isBest={bm.no === bestNo} ev={isPinnacle ? undefined : calcEV(pinnacle?.no, bm.no)} />
                  </>}
                  <td className="px-3 sm:px-4 py-3.5 text-right">
                    <a href={bm.url} target="_blank" rel="noopener noreferrer"
                      className={betBtn}
                      style={{ background: 'linear-gradient(135deg, #0f5c2e 0%, #1a7a3c 100%)' }}
                    >
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

// ─── AltTotals View ───────────────────────────────────────────────────────────

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
          {bestOver && <span><span className="text-gray-400 font-medium">+{point}: </span>{bestOver.toFixed(2)}</span>}
          {bestUnder && <span><span className="text-gray-400 font-medium">-{point}: </span>{bestUnder.toFixed(2)}</span>}
        </>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <THead>
            <Th align="left">Casa de apostas</Th>
            <Th>+{point}</Th>
            <Th>-{point}</Th>
            <th className="px-3 sm:px-4 py-3" />
          </THead>
          <tbody className="divide-y divide-gray-50">
            {bookmakers.map((bm, idx) => {
              const isPinnacle = bm.key === 'pinnacle'
              return (
                <tr key={bm.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                  <td className="px-3 sm:px-4 py-3.5">
                    <span className="font-semibold text-gray-700 text-sm">{bm.title}</span>
                  </td>
                  <OddCell value={bm.over} isBest={bm.over === bestOver} ev={isPinnacle ? undefined : calcEV(pinnacle?.over, bm.over)} />
                  <OddCell value={bm.under} isBest={bm.under === bestUnder} ev={isPinnacle ? undefined : calcEV(pinnacle?.under, bm.under)} />
                  <td className="px-3 sm:px-4 py-3.5 text-right">
                    <a href={bm.url} target="_blank" rel="noopener noreferrer"
                      className={betBtn}
                      style={{ background: 'linear-gradient(135deg, #0f5c2e 0%, #1a7a3c 100%)' }}
                    >
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

// ─── Empty ────────────────────────────────────────────────────────────────────

function EmptyMarket({ game, label }: { game: Game; label: string }) {
  return (
    <CardShell game={game}>
      <div className="px-5 py-12 text-center">
        <p className="text-gray-400 text-sm">
          Sem dados de <span className="font-semibold text-gray-500">{label}</span> para este jogo.
        </p>
      </div>
    </CardShell>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function GameCard({
  game,
  market = 'h2h',
  stake = 0,
}: {
  game: Game
  market?: MarketTab
  stake?: number
}) {
  let view
  if (market === 'goals') view = <GoalsView game={game} />
  else if (market === 'corners') view = <AltTotalsView game={game} descFilter="corner" label="Escanteios" />
  else if (market === 'cards') view = <AltTotalsView game={game} descFilter="card" label="Cartões" />
  else view = <H2HView game={game} />

  return <StakeCtx.Provider value={stake}>{view}</StakeCtx.Provider>
}
