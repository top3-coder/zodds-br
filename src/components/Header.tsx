import { Suspense } from 'react'
import NavTabs from './NavTabs'
import CompSelector from './CompSelector'

function ChartBarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-5 h-5 text-green-600"
    >
      <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
    </svg>
  )
}

export default function Header() {
  return (
    <header className="sticky top-0 z-10 shadow-md">
      {/* Barra verde — logo */}
      <div className="bg-gradient-to-r from-green-800 to-green-600">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow shrink-0">
            <ChartBarIcon />
          </div>
          <div>
            <h1 className="text-white text-xl font-extrabold tracking-tight leading-none">
              Zodd&apos;s BR
            </h1>
            <p className="text-green-200 text-[11px] font-medium mt-0.5">Comparador de Odds</p>
          </div>
        </div>
      </div>

      {/* Barra de competições */}
      <div className="bg-white border-b border-gray-100">
        <Suspense fallback={<div className="h-11" />}>
          <CompSelector />
        </Suspense>
      </div>

      {/* Navegação Jogos / Múltiplas */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 flex justify-center">
          <Suspense fallback={<div className="h-10" />}>
            <NavTabs />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
