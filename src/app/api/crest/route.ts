import { NextRequest, NextResponse } from 'next/server'

interface TsdbTeam {
  strTeam: string
  strBadge: string | null
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') ?? '').trim()
  if (!q) return NextResponse.json({ url: null })

  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(q)}`,
      { next: { revalidate: 86400 } }
    )

    if (!res.ok) return NextResponse.json({ url: null })

    const data = await res.json() as { teams: TsdbTeam[] | null }
    const teams = data.teams ?? []
    if (teams.length === 0) return NextResponse.json({ url: null })

    // Prefer exact name match, fall back to first result
    const ql = q.toLowerCase()
    const match =
      teams.find((t) => t.strTeam.toLowerCase() === ql) ?? teams[0]

    const url = match?.strBadge ?? null

    return NextResponse.json(
      { url },
      { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=86400' } }
    )
  } catch {
    return NextResponse.json({ url: null })
  }
}
