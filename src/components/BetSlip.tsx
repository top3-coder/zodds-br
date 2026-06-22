'use client'

import { EVBadge } from './EVBadge'

export interface BetSlipItem {
  key: string
  gameLabel: string
  selectionLabel: string
  odd: number | null
}

interface Props {
  items: BetSlipItem[]
  totalOdd: number | null
  bestTitle: string | null
  bestUrl: string | null
  evTotal?: number | null
  onClear: () => void
}

export default function BetSlip({ items, totalOdd, bestTitle, bestUrl, evTotal, onClear }: Props) {
  const visible = items.length > 0
  const canBet = visible && totalOdd !== null && bestUrl !== null

  return (
    <>
      {/* ── Desktop: painel fixo à direita ─────────────────────────────────── */}
      <div
        className={`hidden lg:flex fixed top-40 right-4 w-72 flex-col bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-30 max-h-[calc(100vh-11rem)] transition-all duration-300 ${
          visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-800 to-green-600 px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">Minha Aposta</span>
            <span className="bg-white/25 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {items.length}
            </span>
          </div>
          <button
            onClick={onClear}
            className="text-green-200 hover:text-white text-xs font-medium transition-colors"
          >
            Limpar
          </button>
        </div>

        {/* Lista de seleções */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
          {items.map((item) => (
            <div key={item.key} className="px-4 py-3">
              <p className="text-xs text-gray-400 truncate mb-0.5">{item.gameLabel}</p>
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-gray-800 truncate">{item.selectionLabel}</p>
                {item.odd !== null && (
                  <span className="text-sm font-bold text-green-700 shrink-0 tabular-nums">
                    {item.odd.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Rodapé: odd total + botão */}
        <div className="shrink-0 border-t border-gray-100 px-4 pt-3 pb-4 bg-gray-50/60">
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-xs font-medium text-gray-500">Odd total</span>
            {bestTitle && <span className="text-xs text-gray-400">{bestTitle}</span>}
          </div>

          {totalOdd !== null ? (
            <div className="mb-3">
              <div className="text-4xl font-extrabold text-green-700 tabular-nums leading-none">
                {totalOdd.toFixed(2)}
              </div>
              {evTotal != null && (
                <div className="mt-1">
                  <EVBadge ev={evTotal} />
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm text-gray-400 mb-3 py-1">
              Sem casa com cobertura completa
            </div>
          )}

          {canBet ? (
            <a
              href={bestUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 w-full bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-sm py-3 rounded-xl transition-colors shadow-sm"
            >
              Apostar na {bestTitle} →
            </a>
          ) : (
            <button
              disabled
              className="flex items-center justify-center w-full bg-gray-100 text-gray-400 font-semibold text-sm py-3 rounded-xl cursor-not-allowed"
            >
              Apostar →
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile: barra fixa na parte inferior ───────────────────────────── */}
      <div
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t-2 border-green-600 shadow-2xl transition-transform duration-300 ${
          visible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 leading-none mb-0.5">
              {items.length} seleção{items.length !== 1 ? 'ões' : ''}
            </p>
            {totalOdd !== null ? (
              <div className="flex items-baseline gap-2 flex-wrap">
                <p className="text-xl font-extrabold text-green-700 tabular-nums leading-tight">
                  {totalOdd.toFixed(2)}
                  {bestTitle && (
                    <span className="text-xs font-normal text-gray-400 ml-1.5">{bestTitle}</span>
                  )}
                </p>
                {evTotal != null && <EVBadge ev={evTotal} />}
              </div>
            ) : (
              <p className="text-sm text-gray-400 leading-tight">Sem cobertura completa</p>
            )}
          </div>

          <button
            onClick={onClear}
            className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium px-2 py-1 shrink-0"
          >
            Limpar
          </button>

          {canBet && (
            <a
              href={bestUrl!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              Apostar →
            </a>
          )}
        </div>
      </div>

      {/* Espaçador mobile para conteúdo não ficar atrás da barra */}
      {visible && <div className="lg:hidden h-20" />}
    </>
  )
}
