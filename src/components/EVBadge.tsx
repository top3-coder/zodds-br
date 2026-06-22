export function EVBadge({ ev }: { ev: number | null | undefined }) {
  if (ev == null) return null
  const pct = (ev * 100).toFixed(1)
  const positive = ev >= 0
  return (
    <span
      className={`text-[10px] font-semibold tabular-nums leading-none ${
        positive ? 'text-green-600' : 'text-red-500'
      }`}
    >
      🔥 {positive ? '+' : ''}
      {pct}%
    </span>
  )
}
