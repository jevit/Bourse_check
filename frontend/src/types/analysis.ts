export interface TechnicalSnapshot {
  ticker: string
  currentPrice: number
  sma50: number | null
  sma200: number | null
  rsi14: number | null
  high52w: number
  low52w: number
  pctFrom52wLow: number
  pctFrom52wHigh: number
  pctFromSma200: number
  aboveSma50: boolean
  aboveSma200: boolean
  goldenCross: boolean
  rsiSignal: 'OVERSOLD' | 'NEUTRAL' | 'OVERBOUGHT'
  lastQuoteDate: string
}

export interface InvestmentScore {
  ticker: string
  totalScore: number
  yieldScore: number
  rsiScore: number
  sma200Score: number
  range52wScore: number
  momentumScore: number
  recommendation: 'RENFORCER_FORT' | 'RENFORCER' | 'ATTENDRE' | 'PRUDENCE' | 'VENDRE_PARTIEL'
  recommendationLabel: string
  fairValueEstimate: number | null
  marginOfSafetyPrice: number | null
  currentYield: number | null
  historicalAvgYield: number | null
  technical: TechnicalSnapshot
  rationale: string
}

export interface OpportunityItem {
  ticker: string
  source: 'POSITION' | 'WATCHLIST'
  score: InvestmentScore
  currentWeight: number
  suggestedAllocationPct: number | null
  isAlertTriggered: boolean
}
