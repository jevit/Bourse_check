import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getDashboard } from '../services/api'
import type { DashboardSummary } from '../types'
import PositionTable from '../components/PositionTable'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Legend } from 'recharts'

const COLORS = ['#6366f1','#22c55e','#f59e0b','#ec4899','#06b6d4','#a78bfa','#fb923c']

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function PortfolioDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) getDashboard(id).then(r => { setSummary(r.data); setLoading(false) }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-gray-500">Chargement…</div>
  if (!summary) return <div className="text-red-400">Erreur de chargement.</div>

  const enveloppeData = summary.positions.reduce<Record<string, number>>((acc, p) => {
    acc[p.enveloppe] = (acc[p.enveloppe] || 0) + p.currentValue
    return acc
  }, {})
  const pieData = Object.entries(enveloppeData).map(([name, value]) => ({ name, value }))

  const sectorData = summary.positions.reduce<Record<string, number>>((acc, p) => {
    const key = p.enveloppe
    acc[key] = (acc[key] || 0) + p.currentValue
    return acc
  }, {})
  const barData = Object.entries(sectorData).map(([name, value]) => ({ name, value: Math.round(value) }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard portefeuille</h1>
        <div className="flex gap-2">
          <Link to={`/portfolios/${id}/transactions`} className="btn-secondary text-sm">Transactions</Link>
          <Link to={`/portfolios/${id}/dividends`} className="btn-secondary text-sm">Dividendes</Link>
          <Link to={`/portfolios/${id}/tax`} className="btn-secondary text-sm">Fiscalité</Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Valeur totale</p>
          <p className="text-2xl font-bold">{fmt(summary.totalValue)} €</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">PV Latente</p>
          <p className={`text-2xl font-bold ${summary.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {summary.totalPnl >= 0 ? '+' : ''}{fmt(summary.totalPnl)} €
          </p>
          <p className={`text-sm ${summary.totalPnlPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {summary.totalPnlPct >= 0 ? '+' : ''}{fmt(summary.totalPnlPct)}%
          </p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Coût total</p>
          <p className="text-2xl font-bold">{fmt(summary.totalCost)} €</p>
        </div>
        <div className="card">
          <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Dividendes / an</p>
          <p className="text-2xl font-bold text-green-400">{fmt(summary.annualDividends)} €</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold mb-4">Répartition par enveloppe</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({name, percent}) => `${name} ${(percent*100).toFixed(0)}%`}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v) + ' €'} contentStyle={{ background: '#1f2937', border: '1px solid #374151' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4">Valeur par enveloppe</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip formatter={(v: number) => fmt(v) + ' €'} contentStyle={{ background: '#1f2937', border: '1px solid #374151' }} />
              <Bar dataKey="value" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Positions table */}
      <div className="card">
        <h2 className="font-semibold mb-4">Positions ouvertes</h2>
        <PositionTable positions={summary.positions} />
      </div>
    </div>
  )
}
