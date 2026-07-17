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

const NATIONAL_FLAGS: Record<string, string> = {
  'brazil': 'br', 'brasil': 'br',
  'argentina': 'ar', 'colombia': 'co', 'chile': 'cl', 'uruguay': 'uy',
  'ecuador': 'ec', 'peru': 'pe', 'venezuela': 've', 'bolivia': 'bo',
  'paraguay': 'py', 'costa rica': 'cr', 'panama': 'pa', 'honduras': 'hn',
  'jamaica': 'jm', 'mexico': 'mx', 'canada': 'ca',
  'united states': 'us', 'usa': 'us',
  'spain': 'es', 'france': 'fr', 'germany': 'de', 'italy': 'it',
  'england': 'gb-eng', 'scotland': 'gb-sct', 'wales': 'gb-wls',
  'portugal': 'pt', 'netherlands': 'nl', 'belgium': 'be', 'croatia': 'hr',
  'denmark': 'dk', 'sweden': 'se', 'norway': 'no', 'switzerland': 'ch',
  'austria': 'at', 'poland': 'pl', 'czech republic': 'cz', 'ukraine': 'ua',
  'turkey': 'tr', 'greece': 'gr', 'serbia': 'rs', 'romania': 'ro',
  'japan': 'jp', 'south korea': 'kr', 'australia': 'au',
  'morocco': 'ma', 'senegal': 'sn', 'nigeria': 'ng', 'ghana': 'gh',
}

function getNationalFlag(name: string): string | null {
  const lower = name.toLowerCase()
  for (const [k, code] of Object.entries(NATIONAL_FLAGS)) {
    if (lower === k || lower.startsWith(k + ' ')) return `https://flagcdn.com/w80/${code}.png`
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

const crestCache = new Map<string, string | null>()

function TeamAvatar({ name }: { name: string }) {
  const [imgUrl, setImgUrl] = useState<string | null | undefined>(
    crestCache.has(name) ? crestCache.get(name) : undefined
  )
  useEffect(() => {
    if (crestCache.has(name)) return
    const flag = getNationalFlag(name)
    if (flag) { crestCache.set(name, flag); setImgUrl(flag); return }
    fetch(`/api/crest?q=${encodeURIComponent(name)}`)
      .then((r) => r.json())
      .then((data: { url: string | null }) => { crestCache.set(name, data.url ?? null); setImgUrl(data.url ?? null) })
      .catch(() => { crestCache.set(name, null); setImgUrl(null) })
  }, [name])

  if (imgUrl === undefined)
    return <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-100 shrink-0 animate-pulse" />
  if (imgUrl !== null)
    return (
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center overflow-hidden shrink-0">
        <img src={imgUrl} alt={name} className="w-9 h-9 sm:w-11 sm:h-11 object-contain"
          onError={() => { crestCache.set(name, null); setImgUrl(null) }} />
      </div>
    )
  return (
    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shrink-0 shadow-sm"
      style={{ background: hashColor(name) }}>
      <span className="text-white text-xs font-extrabold tracking-wide">{getInitials(name)}</span>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatBRL(v: number) {
  return `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function best(values: (number | null)[]): number | null {
  const valid = values.filter((v): v is number => v !== null)
  return valid.length ? Math.max(...valid) : null
}

function shortName(name: string): string {
  return name.length <= 14 ? name : name.split(' ')[0]
}

// ─── Market types ─────────────────────────────────────────────────────────────

interface H2HBm     { key: string; title: string; url: string; home: number | null; draw: number | null; away: number | null }
interface DNBBm     { key: string; title: string; url: string; home: number | null; away: number | null }
interface TotalsBm  { key: string; title: string; url: string; point: number; over: number | null; under: number | null }
interface HTH2HBm   { key: string; title: string; url: string; home: number | null; draw: number | null; away: number | null }
interface SpreadsBm { key: string; title: string; url: string; homePoint: number; homeOdd: number | null; awayPoint: number; awayOdd: number | null }

// ─── Processing ───────────────────────────────────────────────────────────────

function processH2H(game: Game): H2HBm[] {
  return game.bookmakers
    .filter((bm) => ALLOWED_BOOKMAKERS.has(bm.key))
    .map((bm) => {
      const m = bm.markets.find((m) => m.key === 'h2h')
      if (!m) return null
      return {
        key: bm.key, title: bm.title, url: getBookmakerUrl(bm.key),
        home: m.outcomes.find((o) => o.name === game.home_team)?.price ?? null,
        draw: m.outcomes.find((o) => o.name === 'Draw')?.price ?? null,
        away: m.outcomes.find((o) => o.name === game.away_team)?.price ?? null,
      }
    })
    .filter((b): b is H2HBm => {
      if (!b) return false
      const vals = [b.home, b.draw, b.away].filter((v): v is number => v !== null)
      return vals.length > 0 && vals.every((v) => v >= 1.05 && v <= 100)
    })
    .sort((a, b) => a.title.localeCompare(b.title))
}

function processDNB(game: Game): DNBBm[] {
  return game.bookmakers
    .filter((bm) => ALLOWED_BOOKMAKERS.has(bm.key))
    .map((bm) => {
      const m = bm.markets.find((m) => m.key === 'draw_no_bet')
      if (!m) return null
      return {
        key: bm.key, title: bm.title, url: getBookmakerUrl(bm.key),
        home: m.outcomes.find((o) => o.name === game.home_team)?.price ?? null,
        away: m.outcomes.find((o) => o.name === game.away_team)?.price ?? null,
      }
    })
    .filter((b): b is DNBBm => b !== null && (b.home !== null || b.away !== null))
    .sort((a, b) => a.title.localeCompare(b.title))
}

function processTotals(game: Game, mktKey: string): TotalsBm[] {
  return game.bookmakers
    .filter((bm) => ALLOWED_BOOKMAKERS.has(bm.key))
    .map((bm) => {
      const m = bm.markets.find((mk) => mk.key === mktKey)
      if (!m) return null
      const point = m.outcomes[0]?.point ?? 2.5
      const over  = m.outcomes.find((o) => o.name === 'Over')?.price  ?? null
      const under = m.outcomes.find((o) => o.name === 'Under')?.price ?? null
      if (over === null && under === null) return null
      return { key: bm.key, title: bm.title, url: getBookmakerUrl(bm.key), point, over, under }
    })
    .filter((b): b is TotalsBm => b !== null)
    .sort((a, b) => a.title.localeCompare(b.title))
}

function processHTH2H(game: Game): HTH2HBm[] {
  return game.bookmakers
    .filter((bm) => ALLOWED_BOOKMAKERS.has(bm.key))
    .map((bm) => {
      const m = bm.markets.find((mk) => mk.key === 'h2h_h1')
      if (!m) return null
      return {
        key: bm.key, title: bm.title, url: getBookmakerUrl(bm.key),
        home: m.outcomes.find((o) => o.name === game.home_team)?.price ?? null,
        draw: m.outcomes.find((o) => o.name === 'Draw')?.price ?? null,
        away: m.outcomes.find((o) => o.name === game.away_team)?.price ?? null,
      }
    })
    .filter((b): b is HTH2HBm => b !== null)
    .sort((a, b) => a.title.localeCompare(b.title))
}

function processSpreads(game: Game): SpreadsBm[] {
  return game.bookmakers
    .filter((bm) => ALLOWED_BOOKMAKERS.has(bm.key))
    .map((bm) => {
      const m = bm.markets.find((mk) => mk.key === 'spreads')
      if (!m) return null
      const homeO = m.outcomes.find((o) => o.name === game.home_team || o.name === 'Home')
      const awayO = m.outcomes.find((o) => o.name === game.away_team || o.name === 'Away')
      if (!homeO && !awayO) return null
      return {
        key: bm.key, title: bm.title, url: getBookmakerUrl(bm.key),
        homePoint: homeO?.point ?? 0, homeOdd: homeO?.price ?? null,
        awayPoint: awayO?.point ?? 0, awayOdd: awayO?.price ?? null,
      }
    })
    .filter((b): b is SpreadsBm => b !== null)
    .sort((a, b) => a.title.localeCompare(b.title))
}

const HT_INDICATORS = ['1st', 'half', 'ht', 'first']

function processAltTotals(game: Game, descInclude: string, htOnly?: boolean) {
  return game.bookmakers
    .filter((bm) => ALLOWED_BOOKMAKERS.has(bm.key))
    .map((bm) => {
      const m = bm.markets.find((mk) => {
        if (mk.key !== 'alternate_totals') return false
        const desc = mk.description?.toLowerCase() ?? ''
        if (!desc.includes(descInclude)) return false
        const isHT = HT_INDICATORS.some((ind) => desc.includes(ind))
        if (htOnly === true && !isHT) return false
        if (htOnly === false && isHT) return false
        return true
      })
      if (!m) return null
      const point = m.outcomes[0]?.point ?? 9.5
      const over  = m.outcomes.find((o) => o.name === 'Over')?.price  ?? null
      const under = m.outcomes.find((o) => o.name === 'Under')?.price ?? null
      if (over === null && under === null) return null
      return { key: bm.key, title: bm.title, url: getBookmakerUrl(bm.key), point, over, under }
    })
    .filter((b): b is { key: string; title: string; url: string; point: number; over: number | null; under: number | null } => b !== null)
    .sort((a, b) => a.title.localeCompare(b.title))
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

const betBtn = 'inline-flex items-center gap-1 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all whitespace-nowrap shadow-sm hover:shadow-md active:scale-95'
const betStyle = { background: 'linear-gradient(135deg, #0f5c2e 0%, #1a7a3c 100%)' }

function OddCell({ value, isBest, ev }: { value: number | null; isBest: boolean; ev?: number | null }) {
  const stake = useContext(StakeCtx)
  if (value === null)
    return <td className="px-2 sm:px-3 py-3.5 text-center text-gray-200 text-sm select-none">—</td>
  return (
    <td className={`px-2 sm:px-3 py-3.5 text-center ${isBest ? 'bg-[#f0faf4]' : ''}`}>
      <div className="flex flex-col items-center gap-1">
        <span className={`inline-flex items-center justify-center font-bold text-base rounded-xl px-3 py-1.5 min-w-[54px] tabular-nums ${
          isBest ? 'text-[#1a7a3c] bg-green-100 ring-1 ring-green-300 shadow-sm' : 'text-gray-700 bg-gray-50'
        }`}>{value.toFixed(2)}</span>
        <EVBadge ev={ev} />
        {stake > 0 && <span className="text-[9px] text-gray-400 font-medium tabular-nums whitespace-nowrap">{formatBRL(stake * value)}</span>}
      </div>
    </td>
  )
}

function THead({ children }: { children: React.ReactNode }) {
  return <thead><tr className="border-b border-gray-100 bg-gray-50/70">{children}</tr></thead>
}

function Th({ children, align = 'center' }: { children?: React.ReactNode; align?: 'left' | 'center' }) {
  return <th className={`px-3 sm:px-4 py-3 text-${align} text-[10px] font-bold text-gray-400 uppercase tracking-widest`}>{children}</th>
}

function SubLabel({ label }: { label: string }) {
  return (
    <div className="px-5 py-2 border-t border-b border-gray-50 flex items-center gap-2" style={{ background: '#fafafa' }}>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  )
}

// ─── Card Shell ───────────────────────────────────────────────────────────────

function CardShell({ game, children }: { game: Game; children: React.ReactNode }) {
  const gradient = COMP_INFO[game.sport_key]?.gradient ?? 'from-[#0f5c2e] to-[#1a7a3c]'
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-md"
      style={{ boxShadow: '0 2px 12px 0 rgba(0,0,0,0.07), 0 1px 3px 0 rgba(0,0,0,0.05)' }}>
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
            <p className="font-bold text-gray-900 text-sm sm:text-base leading-snug text-center">{game.home_team}</p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Casa</p>
          </div>
          <div className="flex-shrink-0">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#f0faf4' }}>
              <span className="text-[#1a7a3c] text-xs font-extrabold">VS</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 flex-1">
            <TeamAvatar name={game.away_team} />
            <p className="font-bold text-gray-900 text-sm sm:text-base leading-snug text-center">{game.away_team}</p>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Visitante</p>
          </div>
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── Individual tables ────────────────────────────────────────────────────────

function H2HTable({ bms, game }: { bms: H2HBm[]; game: Game }) {
  const pinnacle = bms.find((b) => b.key === 'pinnacle')
  const sh = shortName(game.home_team), sa = shortName(game.away_team)
  const bestHome = best(bms.map((b) => b.home))
  const bestDraw = best(bms.map((b) => b.draw))
  const bestAway = best(bms.map((b) => b.away))
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <THead>
          <Th align="left">Casa de apostas</Th>
          <Th>{sh}</Th><Th>Empate</Th><Th>{sa}</Th>
          <th className="px-3 sm:px-4 py-3" />
        </THead>
        <tbody className="divide-y divide-gray-50">
          {bms.map((bm, i) => {
            const ip = bm.key === 'pinnacle'
            return (
              <tr key={bm.key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                <td className="px-3 sm:px-4 py-3.5"><span className="font-semibold text-gray-700 text-sm">{bm.title}</span></td>
                <OddCell value={bm.home} isBest={bm.home === bestHome} ev={ip ? undefined : calcEV(pinnacle?.home, bm.home)} />
                <OddCell value={bm.draw} isBest={bm.draw === bestDraw} ev={ip ? undefined : calcEV(pinnacle?.draw, bm.draw)} />
                <OddCell value={bm.away} isBest={bm.away === bestAway} ev={ip ? undefined : calcEV(pinnacle?.away, bm.away)} />
                <td className="px-3 sm:px-4 py-3.5 text-right">
                  <a href={bm.url} target="_blank" rel="noopener noreferrer" className={betBtn} style={betStyle}>Apostar →</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function DNBTable({ bms, game }: { bms: DNBBm[]; game: Game }) {
  const pinnacle = bms.find((b) => b.key === 'pinnacle')
  const sh = shortName(game.home_team), sa = shortName(game.away_team)
  const bestHome = best(bms.map((b) => b.home))
  const bestAway = best(bms.map((b) => b.away))
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <THead>
          <Th align="left">Casa de apostas</Th>
          <Th>{sh} (DNB)</Th><Th>{sa} (DNB)</Th>
          <th className="px-3 sm:px-4 py-3" />
        </THead>
        <tbody className="divide-y divide-gray-50">
          {bms.map((bm, i) => {
            const ip = bm.key === 'pinnacle'
            return (
              <tr key={bm.key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                <td className="px-3 sm:px-4 py-3.5"><span className="font-semibold text-gray-700 text-sm">{bm.title}</span></td>
                <OddCell value={bm.home} isBest={bm.home === bestHome} ev={ip ? undefined : calcEV(pinnacle?.home, bm.home)} />
                <OddCell value={bm.away} isBest={bm.away === bestAway} ev={ip ? undefined : calcEV(pinnacle?.away, bm.away)} />
                <td className="px-3 sm:px-4 py-3.5 text-right">
                  <a href={bm.url} target="_blank" rel="noopener noreferrer" className={betBtn} style={betStyle}>Apostar →</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function TotalsTable({ bms, label }: { bms: TotalsBm[]; label: string }) {
  const pinnacle = bms.find((b) => b.key === 'pinnacle')
  const point = bms[0]?.point ?? 2.5
  const bestOver = best(bms.map((b) => b.over))
  const bestUnder = best(bms.map((b) => b.under))
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <THead>
          <Th align="left">{label}</Th>
          <Th>+{point}</Th><Th>-{point}</Th>
          <th className="px-3 sm:px-4 py-3" />
        </THead>
        <tbody className="divide-y divide-gray-50">
          {bms.map((bm, i) => {
            const ip = bm.key === 'pinnacle'
            return (
              <tr key={bm.key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                <td className="px-3 sm:px-4 py-3.5"><span className="font-semibold text-gray-700 text-sm">{bm.title}</span></td>
                <OddCell value={bm.over} isBest={bm.over === bestOver} ev={ip ? undefined : calcEV(pinnacle?.over, bm.over)} />
                <OddCell value={bm.under} isBest={bm.under === bestUnder} ev={ip ? undefined : calcEV(pinnacle?.under, bm.under)} />
                <td className="px-3 sm:px-4 py-3.5 text-right">
                  <a href={bm.url} target="_blank" rel="noopener noreferrer" className={betBtn} style={betStyle}>Apostar →</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function HTH2HTable({ bms, game }: { bms: HTH2HBm[]; game: Game }) {
  const pinnacle = bms.find((b) => b.key === 'pinnacle')
  const sh = shortName(game.home_team), sa = shortName(game.away_team)
  const bestHome = best(bms.map((b) => b.home))
  const bestDraw = best(bms.map((b) => b.draw))
  const bestAway = best(bms.map((b) => b.away))
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <THead>
          <Th align="left">Casa de apostas</Th>
          <Th>{sh}</Th><Th>Empate</Th><Th>{sa}</Th>
          <th className="px-3 sm:px-4 py-3" />
        </THead>
        <tbody className="divide-y divide-gray-50">
          {bms.map((bm, i) => {
            const ip = bm.key === 'pinnacle'
            return (
              <tr key={bm.key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                <td className="px-3 sm:px-4 py-3.5"><span className="font-semibold text-gray-700 text-sm">{bm.title}</span></td>
                <OddCell value={bm.home} isBest={bm.home === bestHome} ev={ip ? undefined : calcEV(pinnacle?.home, bm.home)} />
                <OddCell value={bm.draw} isBest={bm.draw === bestDraw} ev={ip ? undefined : calcEV(pinnacle?.draw, bm.draw)} />
                <OddCell value={bm.away} isBest={bm.away === bestAway} ev={ip ? undefined : calcEV(pinnacle?.away, bm.away)} />
                <td className="px-3 sm:px-4 py-3.5 text-right">
                  <a href={bm.url} target="_blank" rel="noopener noreferrer" className={betBtn} style={betStyle}>Apostar →</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function SpreadsTable({ bms, game }: { bms: SpreadsBm[]; game: Game }) {
  const pinnacle = bms.find((b) => b.key === 'pinnacle')
  const sh = shortName(game.home_team), sa = shortName(game.away_team)
  const bestHome = best(bms.map((b) => b.homeOdd))
  const bestAway = best(bms.map((b) => b.awayOdd))
  const hp = bms[0]?.homePoint ?? 0
  const ap = bms[0]?.awayPoint ?? 0
  const sign = (n: number) => n >= 0 ? `+${n}` : `${n}`
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <THead>
          <Th align="left">Casa de apostas</Th>
          <Th>{sh} ({sign(hp)})</Th>
          <Th>{sa} ({sign(ap)})</Th>
          <th className="px-3 sm:px-4 py-3" />
        </THead>
        <tbody className="divide-y divide-gray-50">
          {bms.map((bm, i) => {
            const ip = bm.key === 'pinnacle'
            return (
              <tr key={bm.key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                <td className="px-3 sm:px-4 py-3.5"><span className="font-semibold text-gray-700 text-sm">{bm.title}</span></td>
                <OddCell value={bm.homeOdd} isBest={bm.homeOdd === bestHome} ev={ip ? undefined : calcEV(pinnacle?.homeOdd, bm.homeOdd)} />
                <OddCell value={bm.awayOdd} isBest={bm.awayOdd === bestAway} ev={ip ? undefined : calcEV(pinnacle?.awayOdd, bm.awayOdd)} />
                <td className="px-3 sm:px-4 py-3.5 text-right">
                  <a href={bm.url} target="_blank" rel="noopener noreferrer" className={betBtn} style={betStyle}>Apostar →</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function AltTotalsTable({ bms, label }: { bms: ReturnType<typeof processAltTotals>; label: string }) {
  if (bms.length === 0) return null
  const pinnacle = bms.find((b) => b.key === 'pinnacle')
  const point = bms[0]?.point ?? 9.5
  const bestOver = best(bms.map((b) => b.over))
  const bestUnder = best(bms.map((b) => b.under))
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <THead>
          <Th align="left">{label}</Th>
          <Th>+{point}</Th><Th>-{point}</Th>
          <th className="px-3 sm:px-4 py-3" />
        </THead>
        <tbody className="divide-y divide-gray-50">
          {bms.map((bm, i) => {
            const ip = bm.key === 'pinnacle'
            return (
              <tr key={bm.key} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}>
                <td className="px-3 sm:px-4 py-3.5"><span className="font-semibold text-gray-700 text-sm">{bm.title}</span></td>
                <OddCell value={bm.over} isBest={bm.over === bestOver} ev={ip ? undefined : calcEV(pinnacle?.over, bm.over)} />
                <OddCell value={bm.under} isBest={bm.under === bestUnder} ev={ip ? undefined : calcEV(pinnacle?.under, bm.under)} />
                <td className="px-3 sm:px-4 py-3.5 text-right">
                  <a href={bm.url} target="_blank" rel="noopener noreferrer" className={betBtn} style={betStyle}>Apostar →</a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── Tab views ────────────────────────────────────────────────────────────────

function NoData({ label }: { label: string }) {
  return (
    <div className="px-5 py-12 text-center">
      <p className="text-gray-400 text-sm">Sem dados de <span className="font-semibold text-gray-500">{label}</span> para este jogo.</p>
    </div>
  )
}

function ResultView({ game }: { game: Game }) {
  const h2h = processH2H(game)
  const dnb = processDNB(game)
  if (h2h.length === 0 && dnb.length === 0) return <CardShell game={game}><NoData label="Resultado" /></CardShell>
  return (
    <CardShell game={game}>
      {h2h.length > 0 && <>
        <SubLabel label="1X2 — Resultado Final" />
        <H2HTable bms={h2h} game={game} />
      </>}
      {dnb.length > 0 && <>
        <SubLabel label="Empate Excluído (Draw No Bet)" />
        <DNBTable bms={dnb} game={game} />
      </>}
    </CardShell>
  )
}

function GoalsView({ game }: { game: Game }) {
  const totals = processTotals(game, 'totals')
  const htTotals = processTotals(game, 'first_half_totals')
  if (totals.length === 0 && htTotals.length === 0) return <CardShell game={game}><NoData label="Gols" /></CardShell>
  return (
    <CardShell game={game}>
      {totals.length > 0 && <>
        <SubLabel label="Total de Gols (Jogo Completo)" />
        <TotalsTable bms={totals} label="Casa de apostas" />
      </>}
      {htTotals.length > 0 && <>
        <SubLabel label="Total de Gols (1º Tempo)" />
        <TotalsTable bms={htTotals} label="Casa de apostas" />
      </>}
    </CardShell>
  )
}

function CornersView({ game }: { game: Game }) {
  const corners = processAltTotals(game, 'corner', false)
  const htCorners = processAltTotals(game, 'corner', true)
  if (corners.length === 0 && htCorners.length === 0) return <CardShell game={game}><NoData label="Escanteios" /></CardShell>
  return (
    <CardShell game={game}>
      {corners.length > 0 && <>
        <SubLabel label="Escanteios (Jogo Completo)" />
        <AltTotalsTable bms={corners} label="Casa de apostas" />
      </>}
      {htCorners.length > 0 && <>
        <SubLabel label="Escanteios (1º Tempo)" />
        <AltTotalsTable bms={htCorners} label="Casa de apostas" />
      </>}
    </CardShell>
  )
}

function CardsView({ game }: { game: Game }) {
  const cards = processAltTotals(game, 'card', false)
  const htCards = processAltTotals(game, 'card', true)
  if (cards.length === 0 && htCards.length === 0) return <CardShell game={game}><NoData label="Cartões" /></CardShell>
  return (
    <CardShell game={game}>
      {cards.length > 0 && <>
        <SubLabel label="Total de Cartões (Jogo Completo)" />
        <AltTotalsTable bms={cards} label="Casa de apostas" />
      </>}
      {htCards.length > 0 && <>
        <SubLabel label="Total de Cartões (1º Tempo)" />
        <AltTotalsTable bms={htCards} label="Casa de apostas" />
      </>}
    </CardShell>
  )
}

function HalfTimeView({ game }: { game: Game }) {
  const htH2H = processHTH2H(game)
  const htTotals = processTotals(game, 'first_half_totals')
  if (htH2H.length === 0 && htTotals.length === 0) return <CardShell game={game}><NoData label="Intervalo" /></CardShell>
  return (
    <CardShell game={game}>
      {htH2H.length > 0 && <>
        <SubLabel label="Resultado ao Intervalo (1º Tempo)" />
        <HTH2HTable bms={htH2H} game={game} />
      </>}
      {htTotals.length > 0 && <>
        <SubLabel label="Total de Gols (1º Tempo)" />
        <TotalsTable bms={htTotals} label="Casa de apostas" />
      </>}
    </CardShell>
  )
}

function SpecialsView({ game }: { game: Game }) {
  const spreads = processSpreads(game)
  if (spreads.length === 0) return <CardShell game={game}><NoData label="Especiais / Handicap" /></CardShell>
  return (
    <CardShell game={game}>
      {spreads.length > 0 && <>
        <SubLabel label="Handicap Asiático" />
        <SpreadsTable bms={spreads} game={game} />
      </>}
    </CardShell>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function GameCard({
  game,
  market = 'result',
  stake = 0,
}: {
  game: Game
  market?: MarketTab
  stake?: number
}) {
  let view: React.ReactNode
  if (market === 'goals')    view = <GoalsView game={game} />
  else if (market === 'corners')  view = <CornersView game={game} />
  else if (market === 'cards')    view = <CardsView game={game} />
  else if (market === 'halftime') view = <HalfTimeView game={game} />
  else if (market === 'specials') view = <SpecialsView game={game} />
  else                            view = <ResultView game={game} />

  return <StakeCtx.Provider value={stake}>{view}</StakeCtx.Provider>
}
