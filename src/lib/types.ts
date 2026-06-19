export interface Outcome {
  name: string
  price: number
  point?: number
  description?: string
}

export interface Market {
  key: string
  last_update: string
  description?: string
  outcomes: Outcome[]
}

export interface Bookmaker {
  key: string
  title: string
  last_update: string
  markets: Market[]
}

export interface Game {
  id: string
  sport_key: string
  sport_title: string
  commence_time: string
  home_team: string
  away_team: string
  bookmakers: Bookmaker[]
}
