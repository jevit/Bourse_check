import axios from 'axios'
import type {
  Portfolio, Transaction, PositionSnapshot, DashboardSummary,
  DividendEvent, MonthlySummary, ProjectionYear, TaxSimulation,
  PriceAlert, Instrument, EnveloppeType, TransactionType, AlertDirection,
} from '../types'

const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jwt')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

// Auth
export const login = (username: string, password: string) =>
  api.post<{ token: string; username: string }>('/auth/login', { username, password })

// Portfolios
export const getPortfolios = () => api.get<Portfolio[]>('/portfolios')
export const createPortfolio = (data: { name: string; description?: string; currency?: string }) =>
  api.post<Portfolio>('/portfolios', data)
export const updatePortfolio = (id: string, data: { name: string; description?: string; currency?: string }) =>
  api.put<Portfolio>(`/portfolios/${id}`, data)
export const deletePortfolio = (id: string) => api.delete(`/portfolios/${id}`)
export const getDashboard = (id: string) => api.get<DashboardSummary>(`/portfolios/${id}/dashboard`)

// Positions
export const getPositions = (portfolioId: string) =>
  api.get<PositionSnapshot[]>(`/portfolios/${portfolioId}/positions`)

// Transactions
export const getTransactions = (portfolioId: string) =>
  api.get<Transaction[]>(`/portfolios/${portfolioId}/transactions`)

export const createTransaction = (portfolioId: string, data: {
  ticker: string; instrumentName?: string; enveloppe: EnveloppeType;
  type: TransactionType; date: string; quantity: number; unitPrice: number;
  fees?: number; currency?: string; notes?: string;
}) => api.post<Transaction>(`/portfolios/${portfolioId}/transactions`, data)

export const updateTransaction = (portfolioId: string, txId: string, data: object) =>
  api.put<Transaction>(`/portfolios/${portfolioId}/transactions/${txId}`, data)

export const deleteTransaction = (portfolioId: string, txId: string) =>
  api.delete(`/portfolios/${portfolioId}/transactions/${txId}`)

// Dividends
export const getDividends = (portfolioId: string) =>
  api.get<DividendEvent[]>(`/portfolios/${portfolioId}/dividends`)

export const createDividend = (portfolioId: string, data: {
  ticker: string; instrumentName?: string; exDividendDate: string;
  paymentDate?: string; amountPerShare: number; quantity?: number;
  currency?: string; taxWithheld?: number;
}) => api.post<DividendEvent>(`/portfolios/${portfolioId}/dividends`, data)

export const deleteDividend = (portfolioId: string, id: string) =>
  api.delete(`/portfolios/${portfolioId}/dividends/${id}`)

export const getDividendSummary = (portfolioId: string) =>
  api.get<MonthlySummary>(`/portfolios/${portfolioId}/dividends/summary`)

export const getDividendProjection = (portfolioId: string, years = 10, dgr = 5) =>
  api.get<ProjectionYear[]>(`/portfolios/${portfolioId}/dividends/projection?years=${years}&dgr=${dgr}`)

// Tax
export const simulateTax = (portfolioId: string, data: {
  ticker: string; sellQuantity: number; sellPrice: number;
  enveloppe: EnveloppeType; openDate?: string;
}) => api.post<{ simulation: TaxSimulation; disclaimer: string }>(
  `/portfolios/${portfolioId}/tax/simulate`, data)

// Alerts
export const getAlerts = () => api.get<PriceAlert[]>('/alerts')
export const createAlert = (data: {
  ticker: string; portfolioId?: string; direction: AlertDirection; targetPrice: number;
}) => api.post<PriceAlert>('/alerts', data)
export const toggleAlert = (id: string) => api.put<PriceAlert>(`/alerts/${id}/toggle`)
export const deleteAlert = (id: string) => api.delete(`/alerts/${id}`)

// Quotes
export const getLatestQuote = (ticker: string) =>
  api.get<{ ticker: string; price: number; date: string }>(`/quotes/${ticker}/latest`)
export const refreshQuote = (ticker: string) => api.post(`/quotes/${ticker}/refresh`)

// Instruments
export const searchInstruments = (q: string) =>
  api.get<Instrument[]>(`/instruments?q=${encodeURIComponent(q)}`)
export const createInstrument = (data: Partial<Instrument>) => api.post<Instrument>('/instruments', data)

export default api
