export const SPORT_KEY_MAP: Record<string, string> = {
  'serie-b': 'soccer_brazil_serie_b',
  copa: 'soccer_fifa_world_cup',
}

export interface CompInfo {
  label: string
  emoji: string
  cardLabel: string
  gradient: string
}

export const COMP_INFO: Record<string, CompInfo> = {
  soccer_brazil_serie_b: {
    label: 'Brasileirão Série B',
    emoji: '⚽',
    cardLabel: '⚽ Brasileirão Série B',
    gradient: 'from-green-700 to-green-600',
  },
  soccer_fifa_world_cup: {
    label: 'Copa do Mundo 2026',
    emoji: '🌍',
    cardLabel: '🌍 Copa do Mundo 2026',
    gradient: 'from-green-800 to-green-700',
  },
}

export function getSportKey(comp: string | undefined): string {
  return SPORT_KEY_MAP[comp ?? ''] ?? 'soccer_brazil_serie_b'
}
