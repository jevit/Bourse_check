export interface Portfolio {
  id: string
  name: string
  description?: string
  currency: string
  createdAt: string
  updatedAt: string
}

export interface Instrument {
  ticker: string
  name: string
  isin?: string
  type: string
  currency: string
  exchange?: string
  sector?: string
  country?: string
}

export type TransactionType = 'BUY' | 'SELL' | 'DIVIDEND' | 'FEE' | 'SPLIT' | 'TRANSFER_IN' | 'TRANSFER_OUT'
export type EnveloppeType = 'PEA' | 'CTO' | 'AV' | 'PEE' | 'PERCO'
export type AlertDirection = 'ABOVE' | 'BELOW'

export interface Transaction {
  id: string
  portfolioId: string
  ticker: string
  enveloppe: EnveloppeType
  type: TransactionType
  date: string
  quantity: number
  unitPrice: number
  fees: number
  currency: string
  notes?: string
  createdAt: string
}

export interface PositionSnapshot {
  ticker: string
  quantity: number
  pru: number
  currentPrice: number
  currentValue: number
  latentPnl: number
  latentPnlPct: number
  annualDividend: number
  yoc: number
  enveloppe: string
  lastUpdated: string
}

export interface DashboardSummary {
  totalValue: number
  totalCost: number
  totalPnl: number
  totalPnlPct: number
  annualDividends: number
  positions: PositionSnapshot[]
}

export interface DividendEvent {
  id: string
  ticker: string
  portfolioId: string
  exDividendDate: string
  paymentDate?: string
  amountPerShare: number
  quantity: number
  currency: string
  taxWithheld: number
  netAmount: number
  createdAt: string
}

export interface MonthlySummary {
  byMonth: Record<string, number>
  totalCurrentYear: number
  rollingTwelveMonths: number
}

export interface ProjectionYear {
  year: number
  projectedAnnualDividend: number
}

export interface TaxSimulation {
  grossGain: number
  taxAmount: number
  effectiveRate: number
  netGain: number
  regime: string
  enveloppe: string
}

export interface PriceAlert {
  id: string
  ticker: string
  portfolioId?: string
  direction: AlertDirection
  targetPrice: number
  active: boolean
  triggeredAt?: string
  createdAt: string
}
