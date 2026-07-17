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
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-xl font-extrabold text-gray-900" style={{ letterSpacing: '-0.02em' }}>
          Destaques do Dia
        </h2>
        <span
          className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest"
          style={{ background: '#f0faf4', color: '#1a7a3c' }}
        >
          Maior EV agora
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {opportunities.map((opp, idx) => (
          <div
            key={idx}
            className="rounded-2xl overflow-hidden transition-all duration-200 hover:-translate-y-1"
            style={{ boxShadow: '0 4px 20px 0 rgba(15,92,46,0.13)' }}
          >
            {/* Gradient header */}
            <div
              className="px-5 py-3"
              style={{ background: 'linear-gradient(135deg, #0f5c2e 0%, #1a7a3c 60%, #22963f 100%)' }}
            >
              <p className="text-green-200 text-xs font-medium truncate">{opp.gameLabel}</p>
            </div>

            {/* Body */}
            <div className="bg-white px-5 pt-4 pb-5">
              <p className="text-sm font-bold text-gray-800 mb-3 leading-tight">{opp.outcomeLabel}</p>

              <div className="flex items-end gap-3 mb-1">
                <span
                  className="text-4xl font-extrabold tabular-nums leading-none"
                  style={{ color: '#0f5c2e', letterSpacing: '-0.03em' }}
                >
                  {opp.odd.toFixed(2)}
                </span>
                <span
                  className="text-sm font-extrabold tabular-nums pb-0.5 leading-none"
                  style={{ color: '#1a7a3c' }}
                >
                  +{(opp.ev * 100).toFixed(1)}% EV
                </span>
              </div>

              <p className="text-xs text-gray-400 mb-4 font-medium">via {opp.bookmakerTitle}</p>

              <a
                href={opp.bookmakerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-full text-white font-bold text-sm py-3 rounded-xl transition-all hover:shadow-md active:scale-95"
                style={{ background: 'linear-gradient(135deg, #0f5c2e 0%, #1a7a3c 100%)' }}
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
