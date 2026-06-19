import { Game } from './types'

export async function getOdds(sportKey = 'soccer_brazil_serie_b'): Promise<Game[]> {
  try {
    const url = new URL(
      `https://api.the-odds-api.com/v4/sports/${encodeURIComponent(sportKey)}/odds/`
    )
    url.searchParams.set('apiKey', process.env.ODDS_API_KEY ?? '')
    url.searchParams.set('regions', 'eu,us')
    url.searchParams.set('markets', 'h2h')
    url.searchParams.set('dateFormat', 'iso')
    url.searchParams.set('oddsFormat', 'decimal')

    const res = await fetch(url.toString(), { next: { revalidate: 300 } })
    if (!res.ok) return []
    const data: unknown = await res.json()
    if (!Array.isArray(data)) return []

    // Exclude in-progress matches — live odds are extreme and useless for pre-match comparison
    const now = new Date()
    return data.filter((g: Game) => new Date(g.commence_time) > now)
  } catch {
    return []
  }
}
