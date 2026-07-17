export const SPORT_KEY_MAP: Record<string, string> = {
  // Brasil
  'serie-a':        'soccer_brazil_campeonato',
  'serie-b':        'soccer_brazil_serie_b',
  // Sul-americana
  'libertadores':   'soccer_conmebol_copa_libertadores',
  'copa-america':   'soccer_conmebol_copa_america',
  // Europa — Ligas
  'champions':      'soccer_uefa_champs_league',
  'premier':        'soccer_epl',
  'la-liga':        'soccer_spain_la_liga',
  'serie-a-it':     'soccer_italy_serie_a',
  'bundesliga':     'soccer_germany_bundesliga',
  'ligue-1':        'soccer_france_ligue_one',
  'liga-portugal':  'soccer_portugal_primeira_liga',
  'eredivisie':     'soccer_netherlands_eredivisie',
  // Europa — Copas
  'fa-cup':         'soccer_england_fa_cup',
  'copa-rei':       'soccer_spain_copa_del_rey',
  'eurocopa':       'soccer_uefa_euro_qualification',
  // Americas
  'liga-mx':        'soccer_mexico_ligamx',
  'mls':            'soccer_usa_mls',
  // Mundial
  'copa':           'soccer_fifa_world_cup',
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
  soccer_conmebol_copa_america: {
    label: 'Copa América',
    emoji: '🌎',
    cardLabel: '🌎 Copa América',
    gradient: 'from-red-700 to-red-600',
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
  soccer_spain_la_liga: {
    label: 'La Liga',
    emoji: '🇪🇸',
    cardLabel: '🇪🇸 La Liga',
    gradient: 'from-red-800 to-red-600',
  },
  soccer_italy_serie_a: {
    label: 'Serie A Itália',
    emoji: '🇮🇹',
    cardLabel: '🇮🇹 Serie A',
    gradient: 'from-blue-700 to-blue-500',
  },
  soccer_germany_bundesliga: {
    label: 'Bundesliga',
    emoji: '🇩🇪',
    cardLabel: '🇩🇪 Bundesliga',
    gradient: 'from-red-900 to-red-700',
  },
  soccer_france_ligue_one: {
    label: 'Ligue 1',
    emoji: '🇫🇷',
    cardLabel: '🇫🇷 Ligue 1',
    gradient: 'from-blue-900 to-blue-700',
  },
  soccer_portugal_primeira_liga: {
    label: 'Liga Portugal',
    emoji: '🇵🇹',
    cardLabel: '🇵🇹 Liga Portugal',
    gradient: 'from-green-900 to-red-700',
  },
  soccer_netherlands_eredivisie: {
    label: 'Eredivisie',
    emoji: '🇳🇱',
    cardLabel: '🇳🇱 Eredivisie',
    gradient: 'from-orange-700 to-orange-500',
  },
  soccer_england_fa_cup: {
    label: 'FA Cup',
    emoji: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
    cardLabel: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 FA Cup',
    gradient: 'from-red-700 to-red-500',
  },
  soccer_spain_copa_del_rey: {
    label: 'Copa del Rey',
    emoji: '👑',
    cardLabel: '👑 Copa del Rey',
    gradient: 'from-yellow-700 to-red-600',
  },
  soccer_uefa_euro_qualification: {
    label: 'Eurocopa',
    emoji: '🇪🇺',
    cardLabel: '🇪🇺 Eurocopa',
    gradient: 'from-blue-800 to-yellow-500',
  },
  soccer_mexico_ligamx: {
    label: 'Liga MX',
    emoji: '🇲🇽',
    cardLabel: '🇲🇽 Liga MX',
    gradient: 'from-green-700 to-red-700',
  },
  soccer_usa_mls: {
    label: 'MLS',
    emoji: '🇺🇸',
    cardLabel: '🇺🇸 MLS',
    gradient: 'from-blue-700 to-red-600',
  },
  soccer_fifa_world_cup: {
    label: 'Copa do Mundo 2026',
    emoji: '🌍',
    cardLabel: '🌍 Copa 2026',
    gradient: 'from-green-800 to-green-700',
  },
}

export const COMP_LIST = [
  // Brasil
  { slug: 'serie-a',       label: '🇧🇷 Série A' },
  { slug: 'serie-b',       label: '⚽ Série B' },
  // Mundial / Sul-americana
  { slug: 'copa',          label: '🌍 Copa 2026' },
  { slug: 'libertadores',  label: '🏆 Libertadores' },
  { slug: 'copa-america',  label: '🌎 Copa América' },
  // Europa — Ligas
  { slug: 'champions',     label: '⭐ Champions' },
  { slug: 'premier',       label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier' },
  { slug: 'la-liga',       label: '🇪🇸 La Liga' },
  { slug: 'serie-a-it',    label: '🇮🇹 Serie A' },
  { slug: 'bundesliga',    label: '🇩🇪 Bundesliga' },
  { slug: 'ligue-1',       label: '🇫🇷 Ligue 1' },
  { slug: 'liga-portugal', label: '🇵🇹 Liga Portugal' },
  { slug: 'eredivisie',    label: '🇳🇱 Eredivisie' },
  // Europa — Copas
  { slug: 'fa-cup',        label: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 FA Cup' },
  { slug: 'copa-rei',      label: '👑 Copa del Rey' },
  { slug: 'eurocopa',      label: '🇪🇺 Eurocopa' },
  // Americas
  { slug: 'liga-mx',       label: '🇲🇽 Liga MX' },
  { slug: 'mls',           label: '🇺🇸 MLS' },
]

export function getSportKey(comp: string | undefined): string {
  return SPORT_KEY_MAP[comp ?? ''] ?? 'soccer_brazil_serie_b'
}
