import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') ?? ''
  if (!q) return NextResponse.json({ id: null })

  try {
    const res = await fetch(
      `https://api.sofascore.com/api/v1/team/search?q=${encodeURIComponent(q)}`,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept: 'application/json',
          Referer: 'https://www.sofascore.com/',
        },
        next: { revalidate: 86400 },
      }
    )

    if (!res.ok) return NextResponse.json({ id: null })

    const data: unknown = await res.json()
    const teams = (data as { teams?: { id: number; name: string }[] }).teams ?? []

    // Prefer exact name match, fall back to first result
    const exact = teams.find(
      (t) => t.name.toLowerCase() === q.toLowerCase()
    )
    const id = (exact ?? teams[0])?.id ?? null

    return NextResponse.json({ id }, { headers: { 'Cache-Control': 'public, max-age=86400' } })
  } catch {
    return NextResponse.json({ id: null })
  }
}
