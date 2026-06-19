import Header from '@/components/Header'
import MultiplasBuilder from '@/components/MultiplasBuilder'
import { getOdds } from '@/lib/api'

export default async function MultiplasPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>
}) {
  const comp = typeof searchParams?.comp === 'string' ? searchParams.comp : 'serie-b'
  const sportKey = comp === 'copa' ? 'soccer_fifa_world_cup' : 'soccer_brazil_serie_b'
  const games = await getOdds(sportKey)

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <MultiplasBuilder key={sportKey} games={games} />

        <footer className="mt-16 pb-8 border-t border-gray-200 pt-6 text-center space-y-1.5">
          <p className="text-xs text-gray-500">
            ⚠️ Jogue com responsabilidade. O jogo pode causar dependência.{' '}
            <strong>Proibido para menores de 18 anos.</strong>
          </p>
          <p className="text-xs text-gray-400">
            Zodd&apos;s BR é um comparador de odds e não realiza apostas.
          </p>
        </footer>
      </main>
    </>
  )
}
