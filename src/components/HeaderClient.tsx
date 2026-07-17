'use client'

import { useState, Suspense } from 'react'
import CompSelector from './CompSelector'
import NavTabs from './NavTabs'

function LogoIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <rect width="32" height="32" rx="8" fill="#1a7a3c" />
      <rect x="6" y="18" width="4" height="8" rx="1.5" fill="white" fillOpacity="0.9" />
      <rect x="14" y="12" width="4" height="14" rx="1.5" fill="white" />
      <rect x="22" y="6" width="4" height="20" rx="1.5" fill="white" fillOpacity="0.7" />
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
    <header className="sticky top-0 z-10" style={{ boxShadow: '0 2px 16px 0 rgba(15,92,46,0.13)' }}>
      {/* Barra principal */}
      <div style={{ background: 'linear-gradient(135deg, #0f5c2e 0%, #1a7a3c 60%, #22963f 100%)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 shrink-0 drop-shadow-md">
              <LogoIcon />
            </div>
            <div>
              <h1 className="text-white text-xl font-extrabold tracking-tight leading-none" style={{ letterSpacing: '-0.02em' }}>
                Zodd&apos;s BR
              </h1>
              <p className="text-green-200 text-[11px] font-medium mt-0.5 tracking-wide uppercase">
                Comparador de Odds
              </p>
            </div>
          </div>

          <button
            className="lg:hidden p-2 -mr-1 text-white hover:bg-white/10 rounded-xl transition-colors"
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
          className="lg:hidden bg-white border-b border-gray-100 shadow-lg"
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

      {/* Desktop: abas Jogos / Múltiplas */}
      <div className="hidden lg:block bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 flex justify-center">
          <Suspense fallback={<div className="h-10" />}>
            <NavTabs />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
