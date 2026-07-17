export function EVBadge({ ev }: { ev: number | null | undefined }) {
  if (ev == null) return null
  const pct = (ev * 100).toFixed(1)
  const positive = ev >= 0
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[9px] font-bold tabular-nums px-1.5 py-0.5 rounded-full leading-none tracking-tight ${
        positive
          ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
          : 'bg-red-50 text-red-600 ring-1 ring-red-200'
      }`}
    >
      {positive ? '▲' : '▼'} {positive ? '+' : ''}{pct}%
    </span>
  )
}
