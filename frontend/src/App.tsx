import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import PortfolioDetailPage from './pages/PortfolioDetailPage'
import TransactionsPage from './pages/TransactionsPage'
import DividendsPage from './pages/DividendsPage'
import TaxPage from './pages/TaxPage'
import AlertsPage from './pages/AlertsPage'
import AnalysisPage from './pages/AnalysisPage'
import Layout from './components/Layout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/portfolios" replace />} />
        <Route path="portfolios" element={<DashboardPage />} />
        <Route path="portfolios/:id" element={<PortfolioDetailPage />} />
        <Route path="portfolios/:id/transactions" element={<TransactionsPage />} />
        <Route path="portfolios/:id/dividends" element={<DividendsPage />} />
        <Route path="portfolios/:id/tax" element={<TaxPage />} />
        <Route path="portfolios/:id/analysis" element={<AnalysisPage />} />
        <Route path="alerts" element={<AlertsPage />} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
