'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-5xl mx-auto px-4 py-24 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h2 className="text-xl font-bold text-gray-700 mb-2">Erro ao carregar as odds</h2>
      <p className="text-gray-500 mb-6">Não foi possível buscar os dados no momento.</p>
      <button
        onClick={reset}
        className="bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors"
      >
        Tentar novamente
      </button>
    </div>
  )
}
