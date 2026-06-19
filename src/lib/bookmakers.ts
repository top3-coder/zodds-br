// Keys allowed to appear in the comparison table
export const ALLOWED_BOOKMAKERS = new Set([
  'betsson',
  'betfair',
  'betfair_ex_eu',
  'betfair_ex_uk',
  '1xbet',
  '888sport',
  'pinnacle',
  'unibet',
  'unibet_eu',
  'williamhill',
  'marathonbet',
])

const bookmakerMap: Record<string, string> = {
  betsson: 'https://www.betsson.com',
  betfair: 'https://www.betfair.com',
  betfair_ex_eu: 'https://www.betfair.com',
  betfair_ex_uk: 'https://www.betfair.com',
  '1xbet': 'https://www.1xbet.com',
  '888sport': 'https://www.888sport.com',
  pinnacle: 'https://www.pinnacle.com',
  unibet: 'https://www.unibet.com',
  unibet_eu: 'https://www.unibet.com',
  williamhill: 'https://sports.williamhill.com',
  marathonbet: 'https://www.marathonbet.com',
}

export function getBookmakerUrl(key: string): string {
  return bookmakerMap[key] ?? '#'
}
