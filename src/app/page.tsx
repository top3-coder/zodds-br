import Header from '@/components/Header'
import GameCard from '@/components/GameCard'
import { groupGamesByDate, formatDateHeader } from '@/lib/utils'
import { getOdds } from '@/lib/api'
import { getSportKey, COMP_INFO } from '@/lib/competitions'

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
          <div className="space-y-10">
            {dateKeys.map((dateKey) => (
              <section key={dateKey}>
                <div className="flex items-center gap-3 mb-4">
                  <h2 className="text-xl font-bold text-gray-800 capitalize">
                    {formatDateHeader(dateKey)}
                  </h2>
                  <span className="bg-green-100 text-green-700 text-sm font-semibold px-2.5 py-0.5 rounded-full">
                    {grouped[dateKey].length}{' '}
                    {grouped[dateKey].length === 1 ? 'jogo' : 'jogos'}
                  </span>
                </div>
                <div className="space-y-4">
                  {grouped[dateKey].map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </div>
              </section>
            ))}
          </div>
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
