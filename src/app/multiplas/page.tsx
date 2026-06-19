import Header from '@/components/Header'
import MultiplasBuilder from '@/components/MultiplasBuilder'
import { getOdds } from '@/lib/api'

export default async function MultiplasPage() {
  const games = await getOdds()

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 py-8">
        <MultiplasBuilder games={games} />

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
