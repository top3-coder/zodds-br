import { NextResponse } from 'next/server'

export async function GET() {
  const apiKey = process.env.ODDS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'API key não configurada' }, { status: 500 })
  }

  const url = new URL('https://api.the-odds-api.com/v4/sports/soccer_brazil_serie_b/odds/')
  url.searchParams.set('apiKey', apiKey)
  url.searchParams.set('regions', 'eu,us')
  url.searchParams.set('markets', 'h2h')
  url.searchParams.set('dateFormat', 'iso')
  url.searchParams.set('oddsFormat', 'decimal')

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 300 } })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: text }, { status: res.status })
    }

    const data = await res.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Falha na requisição' }, { status: 500 })
  }
}
