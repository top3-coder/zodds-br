import { Game } from './types'

async function tryFetch(sportKey: string, markets: string): Promise<Game[] | null> {
  const url = new URL(
    `https://api.the-odds-api.com/v4/sports/${encodeURIComponent(sportKey)}/odds/`
  )
  url.searchParams.set('apiKey', process.env.ODDS_API_KEY ?? '')
  url.searchParams.set('regions', 'eu,us')
  url.searchParams.set('markets', markets)
  url.searchParams.set('dateFormat', 'iso')
  url.searchParams.set('oddsFormat', 'decimal')
  const res = await fetch(url.toString(), { next: { revalidate: 300 } })
  if (!res.ok) return null
  const data: unknown = await res.json()
  if (!Array.isArray(data)) return null
  const now = new Date()
  return (data as Game[]).filter((g) => new Date(g.commence_time) > now)
}

// Try richest set first, degrade gracefully on 422 / API limits
const MARKETS_FULL = 'h2h,totals,alternate_totals,draw_no_bet,h2h_h1,first_half_totals,spreads'
const MARKETS_ALT  = 'h2h,totals,alternate_totals'
const MARKETS_BASE = 'h2h,totals'

export async function getOdds(sportKey = 'soccer_brazil_serie_b'): Promise<Game[]> {
  try {
    const full = await tryFetch(sportKey, MARKETS_FULL)
    if (full !== null) return full
    const alt = await tryFetch(sportKey, MARKETS_ALT)
    if (alt !== null) return alt
    return (await tryFetch(sportKey, MARKETS_BASE)) ?? []
  } catch {
    return []
  }
}
