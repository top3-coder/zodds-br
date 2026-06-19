export default function Loading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-pulse"
        >
          <div className="h-11 bg-green-200" />
          <div className="p-6 flex justify-center items-center gap-6">
            <div className="h-5 bg-gray-200 rounded w-36" />
            <div className="h-9 w-9 bg-gray-100 rounded-full" />
            <div className="h-5 bg-gray-200 rounded w-36" />
          </div>
          <div className="border-t border-gray-100">
            {[1, 2, 3].map((j) => (
              <div key={j} className="flex gap-4 px-4 py-3 border-b border-gray-50">
                <div className="h-4 bg-gray-200 rounded w-28" />
                <div className="flex-1 flex gap-4 justify-end">
                  <div className="h-8 bg-gray-100 rounded w-16" />
                  <div className="h-8 bg-gray-100 rounded w-16" />
                  <div className="h-8 bg-gray-100 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
