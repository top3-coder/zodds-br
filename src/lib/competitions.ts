export const SPORT_KEY_MAP: Record<string, string> = {
  'serie-a': 'soccer_brazil_campeonato',
  'serie-b': 'soccer_brazil_serie_b',
  'libertadores': 'soccer_conmebol_copa_libertadores',
  'champions': 'soccer_uefa_champs_league',
  'premier': 'soccer_epl',
  'copa': 'soccer_fifa_world_cup',
}

export interface CompInfo {
  label: string
  emoji: string
  cardLabel: string
  gradient: string
}

export const COMP_INFO: Record<string, CompInfo> = {
  soccer_brazil_campeonato: {
    label: 'Brasileirão Série A',
    emoji: '🇧🇷',
    cardLabel: '🇧🇷 Série A',
    gradient: 'from-green-800 to-green-700',
  },
  soccer_brazil_serie_b: {
    label: 'Brasileirão Série B',
    emoji: '⚽',
    cardLabel: '⚽ Série B',
    gradient: 'from-green-700 to-green-600',
  },
  soccer_conmebol_copa_libertadores: {
    label: 'Copa Libertadores',
    emoji: '🏆',
    cardLabel: '🏆 Libertadores',
    gradient: 'from-amber-700 to-amber-600',
  },
  soccer_uefa_champs_league: {
    label: 'Champions League',
    emoji: '⭐',
    cardLabel: '⭐ Champions',
    gradient: 'from-blue-800 to-blue-600',
  },
  soccer_epl: {
    label: 'Premier League',
    emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    cardLabel: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',
    gradient: 'from-purple-800 to-purple-600',
  },
  soccer_fifa_world_cup: {
    label: 'Copa do Mundo 2026',
    emoji: '🌍',
    cardLabel: '🌍 Copa 2026',
    gradient: 'from-green-800 to-green-700',
  },
}

export const COMP_LIST = [
  { slug: 'serie-a', label: '🇧🇷 Série A' },
  { slug: 'serie-b', label: '⚽ Série B' },
  { slug: 'copa', label: '🌍 Copa 2026' },
  { slug: 'libertadores', label: '🏆 Libertadores' },
  { slug: 'champions', label: '⭐ Champions' },
  { slug: 'premier', label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier' },
]

export function getSportKey(comp: string | undefined): string {
  return SPORT_KEY_MAP[comp ?? ''] ?? 'soccer_brazil_serie_b'
}
