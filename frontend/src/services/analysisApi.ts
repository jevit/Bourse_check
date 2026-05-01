import api from './api'
import type { TechnicalSnapshot, InvestmentScore, OpportunityItem } from '../types/analysis'

export const getTechnicalAnalysis = (ticker: string) =>
  api.get<TechnicalSnapshot>(`/instruments/${ticker}/analysis/technical`)

export const getInvestmentScore = (portfolioId: string, ticker: string) =>
  api.get<InvestmentScore>(`/portfolios/${portfolioId}/positions/${ticker}/score`)

export const getOpportunities = (portfolioId: string) =>
  api.get<OpportunityItem[]>(`/portfolios/${portfolioId}/opportunities`)

// Watchlist
export interface WatchlistItem {
  id: string; ticker: string; portfolioId: string
  targetPrice: number | null; maxWeightPct: number; notes: string | null
  active: boolean; createdAt: string
}

export const getWatchlist = (portfolioId: string) =>
  api.get<WatchlistItem[]>(`/portfolios/${portfolioId}/watchlist`)

export const addToWatchlist = (portfolioId: string, data: {
  ticker: string; instrumentName?: string; targetPrice?: number; maxWeightPct?: number; notes?: string
}) => api.post<WatchlistItem>(`/portfolios/${portfolioId}/watchlist`, data)

export const removeFromWatchlist = (portfolioId: string, itemId: string) =>
  api.delete(`/portfolios/${portfolioId}/watchlist/${itemId}`)

export const updateWatchlistItem = (portfolioId: string, itemId: string, data: {
  targetPrice?: number; maxWeightPct?: number; notes?: string
}) => api.put<WatchlistItem>(`/portfolios/${portfolioId}/watchlist/${itemId}`, data)
