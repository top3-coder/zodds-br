import Header from '@/components/Header'
import GamesView from '@/components/GamesView'
import TopEVHighlights from '@/components/TopEVHighlights'
import type { EVOpp } from '@/components/TopEVHighlights'
import { groupGamesByDate, formatDateHeader, calcEV } from '@/lib/utils'
import { getOdds } from '@/lib/api'
import { getSportKey, COMP_INFO } from '@/lib/competitions'
import { ALLOWED_BOOKMAKERS, getBookmakerUrl } from '@/lib/bookmakers'
import type { Game } from '@/lib/types'

function computeTopEV(games: Game[]): EVOpp[] {
  const PINNACLE = 'pinnacle'
  // One entry per game — keeps only the highest-EV opportunity per game
  const best = new Map<string, EVOpp>()

  function tryAdd(gameId: string, opp: EVOpp) {
    const existing = best.get(gameId)
    if (!existing || opp.ev > existing.ev) best.set(gameId, opp)
  }

  for (const game of games) {
    const pinnacle = game.bookmakers.find((b) => b.key === PINNACLE)
    if (!pinnacle) continue

    const pinH2H = pinnacle.markets.find((m) => m.key === 'h2h')
    const pinTotals = pinnacle.markets.find((m) => m.key === 'totals')
    const gameLabel = `${game.home_team.split(' ')[0]} × ${game.away_team.split(' ')[0]}`

    for (const bm of game.bookmakers) {
      if (!ALLOWED_BOOKMAKERS.has(bm.key) || bm.key === PINNACLE) continue

      // 1X2
      if (pinH2H) {
        const bmH2H = bm.markets.find((m) => m.key === 'h2h')
        if (bmH2H) {
          const sides: [string, string][] = [
            [game.home_team, `Vitória ${game.home_team.split(' ')[0]}`],
            ['Draw', 'Empate'],
            [game.away_team, `Vitória ${game.away_team.split(' ')[0]}`],
          ]
          for (const [name, label] of sides) {
            const pinOdd = pinH2H.outcomes.find((o) => o.name === name)?.price
            const bmOdd = bmH2H.outcomes.find((o) => o.name === name)?.price
            const ev = calcEV(pinOdd, bmOdd)
            if (ev !== null && ev > 0.005 && bmOdd) {
              tryAdd(game.id, { gameLabel, outcomeLabel: label, odd: bmOdd, ev, bookmakerTitle: bm.title, bookmakerUrl: getBookmakerUrl(bm.key) })
            }
          }
        }
      }

      // Totais
      if (pinTotals) {
        const bmTotals = bm.markets.find((m) => m.key === 'totals')
        if (bmTotals) {
          const point = pinTotals.outcomes[0]?.point ?? 2.5
          for (const side of ['Over', 'Under'] as const) {
            const pinOdd = pinTotals.outcomes.find((o) => o.name === side)?.price
            const bmOdd = bmTotals.outcomes.find((o) => o.name === side)?.price
            const ev = calcEV(pinOdd, bmOdd)
            if (ev !== null && ev > 0.005 && bmOdd) {
              tryAdd(game.id, { gameLabel, outcomeLabel: side === 'Over' ? `+${point} Gols` : `-${point} Gols`, odd: bmOdd, ev, bookmakerTitle: bm.title, bookmakerUrl: getBookmakerUrl(bm.key) })
            }
          }
        }
      }
    }
  }

  return Array.from(best.values()).sort((a, b) => b.ev - a.ev).slice(0, 3)
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const comp = typeof searchParams?.comp === 'string' ? searchParams.comp : 'serie-b'
  const sportKey = getSportKey(comp)
  const compInfo = COMP_INFO[sportKey]

  const games = await getOdds(sportKey)

  const sorted = [...games].sort(
    (a, b) => new Date(a.commence_time).getTime() - new Date(b.commence_time).getTime()
  )
  const grouped = groupGamesByDate(sorted)
  const dateKeys = Object.keys(grouped).sort()
  const dateLabels = Object.fromEntries(dateKeys.map((k) => [k, formatDateHeader(k)]))

  const topEV = computeTopEV(games)

  return (
    <>
      <Header />

      <main className="max-w-5xl mx-auto px-4 py-8">
        {dateKeys.length === 0 ? (
          <div className="text-center py-28">
            <div className="text-6xl mb-5">{compInfo?.emoji ?? '⚽'}</div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">Nenhum jogo disponível</h2>
            <p className="text-gray-500">
              Não há jogos da {compInfo?.label ?? 'competição'} com odds disponíveis no momento.
            </p>
            <p className="text-gray-400 text-sm mt-1">Tente novamente mais tarde.</p>
          </div>
        ) : (
          <>
            <TopEVHighlights opportunities={topEV} />
            <GamesView grouped={grouped} dateKeys={dateKeys} dateLabels={dateLabels} />
          </>
        )}

        <footer className="mt-16 pb-8 border-t border-gray-200 pt-6 text-center space-y-1.5">
          <p className="text-xs text-gray-500">
            ⚠️ Jogue com responsabilidade. O jogo pode causar dependência.{' '}
            <strong>Proibido para menores de 18 anos.</strong>
          </p>
          <p className="text-xs text-gray-400">
            Zodd&apos;s BR é um comparador de odds e não realiza apostas. Odds atualizadas
            automaticamente. Verifique as odds diretamente na casa de apostas antes de jogar.
          </p>
        </footer>
      </main>
    </>
  )
}
