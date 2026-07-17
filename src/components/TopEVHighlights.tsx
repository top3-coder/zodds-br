export interface EVOpp {
  gameLabel: string
  outcomeLabel: string
  odd: number
  ev: number
  bookmakerTitle: string
  bookmakerUrl: string
}

export default function TopEVHighlights({ opportunities }: { opportunities: EVOpp[] }) {
  if (opportunities.length === 0) return null

  return (
    <section className="mb-8">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-bold text-gray-800">🔥 Destaques do Dia</h2>
        <span className="text-xs text-gray-400 font-medium">Melhores oportunidades agora</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {opportunities.map((opp, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="bg-gradient-to-r from-green-800 to-green-600 px-4 py-2.5">
              <p className="text-green-100 text-xs font-medium truncate">{opp.gameLabel}</p>
            </div>

            <div className="px-4 pt-3 pb-4">
              <p className="text-sm font-bold text-gray-800 mb-2">{opp.outcomeLabel}</p>

              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-3xl font-extrabold text-gray-900 tabular-nums">
                  {opp.odd.toFixed(2)}
                </span>
                <span className="text-base font-extrabold text-green-600 tabular-nums">
                  🔥 +{(opp.ev * 100).toFixed(1)}%
                </span>
              </div>

              <p className="text-xs text-gray-400 mb-3">via {opp.bookmakerTitle}</p>

              <a
                href={opp.bookmakerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-sm py-3 rounded-xl transition-colors shadow-sm"
              >
                Apostar agora →
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
