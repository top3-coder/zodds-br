import NavTabs from './NavTabs'

function ChartBarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-6 h-6 text-green-600"
    >
      <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
    </svg>
  )
}

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-green-800 to-green-600 shadow-lg sticky top-0 z-10">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow">
            <ChartBarIcon />
          </div>
          <div>
            <h1 className="text-white text-2xl font-extrabold tracking-tight leading-none">
              Zodd&apos;s BR
            </h1>
            <p className="text-green-200 text-xs font-medium mt-0.5">Comparador de Odds</p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <p className="text-white text-sm font-semibold">Brasileirão Série B</p>
          <div className="flex items-center justify-end gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
            <p className="text-green-200 text-xs">Ao vivo · atualiza a cada 5 min</p>
          </div>
        </div>
      </div>

      <div className="border-t border-green-700/50">
        <div className="max-w-5xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          <NavTabs />
          <p className="text-green-200 text-xs hidden sm:block">
            Odds em <span className="font-semibold text-green-100">verde ↑</span> = melhores disponíveis
          </p>
        </div>
      </div>
    </header>
  )
}
