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

export async function getOdds(sportKey = 'soccer_brazil_serie_b'): Promise<Game[]> {
  try {
    const withAlt = await tryFetch(sportKey, 'h2h,totals,alternate_totals')
    if (withAlt !== null) return withAlt
    return (await tryFetch(sportKey, 'h2h,totals')) ?? []
  } catch {
    return []
  }
}
