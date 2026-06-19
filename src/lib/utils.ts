const SP_TZ = 'America/Sao_Paulo'

export function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: SP_TZ,
  })
}

export function formatDateLabel(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: SP_TZ,
  })
}

export function groupGamesByDate<T extends { commence_time: string }>(
  games: T[]
): Record<string, T[]> {
  return games.reduce(
    (acc, game) => {
      const key = new Date(game.commence_time).toLocaleDateString('en-CA', {
        timeZone: SP_TZ,
      })
      if (!acc[key]) acc[key] = []
      acc[key].push(game)
      return acc
    },
    {} as Record<string, T[]>
  )
}

export function formatDateHeader(dateKey: string): string {
  const now = new Date()
  const todayKey = now.toLocaleDateString('en-CA', { timeZone: SP_TZ })

  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowKey = tomorrow.toLocaleDateString('en-CA', { timeZone: SP_TZ })

  if (dateKey === todayKey) return 'Hoje'
  if (dateKey === tomorrowKey) return 'Amanhã'

  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
}
