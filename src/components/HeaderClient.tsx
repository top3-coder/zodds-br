'use client'

import { useState, Suspense } from 'react'
import CompSelector from './CompSelector'
import NavTabs from './NavTabs'

function ChartBarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-green-600">
      <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
    </svg>
  )
}

function HamburgerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

export default function HeaderClient() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-10 shadow-md">
      {/* Barra verde — logo + hamburguer (mobile) */}
      <div className="bg-gradient-to-r from-green-800 to-green-600">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
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

          <button
            className="lg:hidden p-2 -mr-1 text-white hover:bg-white/10 rounded-lg transition-colors"
            onClick={() => setOpen(!open)}
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          >
            {open ? <CloseIcon /> : <HamburgerIcon />}
          </button>
        </div>
      </div>

      {/* Dropdown mobile */}
      {open && (
        <div
          className="lg:hidden bg-white border-b border-gray-200 shadow-lg"
          onClick={() => setOpen(false)}
        >
          <Suspense fallback={<div className="h-11" />}>
            <CompSelector />
          </Suspense>
          <div className="border-t border-gray-100 flex justify-center py-1">
            <Suspense fallback={<div className="h-10" />}>
              <NavTabs />
            </Suspense>
          </div>
        </div>
      )}

      {/* Desktop: barra de competições */}
      <div className="hidden lg:block bg-white border-b border-gray-100">
        <Suspense fallback={<div className="h-11" />}>
          <CompSelector />
        </Suspense>
      </div>

      {/* Desktop: navegação Jogos / Múltiplas */}
      <div className="hidden lg:block bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 flex justify-center">
          <Suspense fallback={<div className="h-10" />}>
            <NavTabs />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
