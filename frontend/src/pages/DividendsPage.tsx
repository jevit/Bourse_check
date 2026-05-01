import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getDividends, createDividend, deleteDividend, getDividendSummary, getDividendProjection } from '../services/api'
import type { DividendEvent, MonthlySummary, ProjectionYear } from '../types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts'
import { format } from 'date-fns'

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function DividendsPage() {
  const { id: portfolioId } = useParams<{ id: string }>()
  const [dividends, setDividends] = useState<DividendEvent[]>([])
  const [summary, setSummary] = useState<MonthlySummary | null>(null)
  const [projection, setProjection] = useState<ProjectionYear[]>([])
  const [showForm, setShowForm] = useState(false)
  const [dgr, setDgr] = useState(5)
  const [projYears, setProjYears] = useState(10)
  const [form, setForm] = useState({
    ticker: '', instrumentName: '', exDividendDate: format(new Date(), 'yyyy-MM-dd'),
    paymentDate: '', amountPerShare: '', quantity: '', currency: 'EUR', taxWithheld: '0',
  })

  useEffect(() => { if (portfolioId) { load(); loadSummary(); loadProjection() } }, [portfolioId])

  async function load() {
    try { const r = await getDividends(portfolioId!); setDividends(r.data) } catch {}
  }
  async function loadSummary() {
    try { const r = await getDividendSummary(portfolioId!); setSummary(r.data) } catch {}
  }
  async function loadProjection() {
    try { const r = await getDividendProjection(portfolioId!, projYears, dgr); setProjection(r.data) } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await createDividend(portfolioId!, {
        ticker: form.ticker, instrumentName: form.instrumentName || undefined,
        exDividendDate: form.exDividendDate, paymentDate: form.paymentDate || undefined,
        amountPerShare: parseFloat(form.amountPerShare),
        quantity: form.quantity ? parseFloat(form.quantity) : undefined,
        currency: form.currency, taxWithheld: parseFloat(form.taxWithheld) || 0,
      })
      setShowForm(false)
      load(); loadSummary(); loadProjection()
    } catch {}
  }

  const monthlyChartData = summary
    ? Object.entries(summary.byMonth).map(([month, amount]) => ({ month, amount }))
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dividendes</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Saisir</button>
      </div>

      {/* KPIs */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Année en cours</p>
            <p className="text-2xl font-bold text-green-400">{fmt(summary.totalCurrentYear)} €</p>
          </div>
          <div className="card">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">12 mois glissants</p>
            <p className="text-2xl font-bold text-green-300">{fmt(summary.rollingTwelveMonths)} €</p>
          </div>
          <div className="card">
            <p className="text-gray-400 text-xs uppercase tracking-wide mb-1">Mensuel moyen</p>
            <p className="text-2xl font-bold text-green-300">{fmt(summary.rollingTwelveMonths / 12)} €</p>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4 max-w-2xl">
          <h2 className="font-semibold">Enregistrer un dividende</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Ticker *</label>
              <input className="input uppercase" value={form.ticker} onChange={e => setForm(f => ({...f, ticker: e.target.value.toUpperCase()}))} required />
            </div>
            <div>
              <label className="label">Nom instrument</label>
              <input className="input" value={form.instrumentName} onChange={e => setForm(f => ({...f, instrumentName: e.target.value}))} />
            </div>
            <div>
              <label className="label">Date ex-dividende *</label>
              <input className="input" type="date" value={form.exDividendDate} onChange={e => setForm(f => ({...f, exDividendDate: e.target.value}))} required />
            </div>
            <div>
              <label className="label">Date paiement</label>
              <input className="input" type="date" value={form.paymentDate} onChange={e => setForm(f => ({...f, paymentDate: e.target.value}))} />
            </div>
            <div>
              <label className="label">Montant brut / action *</label>
              <input className="input" type="number" step="0.000001" value={form.amountPerShare} onChange={e => setForm(f => ({...f, amountPerShare: e.target.value}))} required min="0.000001" />
            </div>
            <div>
              <label className="label">Quantité détenue</label>
              <input className="input" type="number" step="0.000001" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))} min="0" />
            </div>
            <div>
              <label className="label">Retenue fiscale (€)</label>
              <input className="input" type="number" step="0.01" value={form.taxWithheld} onChange={e => setForm(f => ({...f, taxWithheld: e.target.value}))} min="0" />
            </div>
            <div>
              <label className="label">Devise</label>
              <select className="input" value={form.currency} onChange={e => setForm(f => ({...f, currency: e.target.value}))}>
                <option value="EUR">EUR</option><option value="USD">USD</option><option value="GBP">GBP</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" type="submit">Enregistrer</button>
            <button className="btn-secondary" type="button" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </form>
      )}

      {/* Monthly bar chart */}
      {monthlyChartData.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-4">Dividendes nets par mois (12 derniers mois)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyChartData}>
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} />
              <Tooltip formatter={(v: number) => [fmt(v) + ' €', 'Net']} contentStyle={{ background: '#1f2937', border: '1px solid #374151' }} />
              <Bar dataKey="amount" fill="#22c55e" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* US-304: Projection */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">Projection dividendes</h2>
          <div className="flex gap-3 items-center text-sm">
            <label className="text-gray-400">DGR :</label>
            <input type="number" className="input w-20 text-center" value={dgr} step="0.5" min="0" max="30"
              onChange={e => setDgr(parseFloat(e.target.value))} />
            <span className="text-gray-400">% /an</span>
            <label className="text-gray-400 ml-2">Horizon :</label>
            <select className="input w-24" value={projYears} onChange={e => { setProjYears(parseInt(e.target.value)); }}>
              <option value={5}>5 ans</option><option value={10}>10 ans</option><option value={20}>20 ans</option>
            </select>
            <button className="btn-primary py-1 px-3" onClick={loadProjection}>Calculer</button>
          </div>
        </div>
        {projection.length > 0 && (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={projection}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="year" stroke="#9ca3af" fontSize={11} />
              <YAxis stroke="#9ca3af" fontSize={11} />
              <Tooltip formatter={(v: number) => [fmt(v) + ' €', 'Dividende projeté']} contentStyle={{ background: '#1f2937', border: '1px solid #374151' }} />
              <Line type="monotone" dataKey="projectedAnnualDividend" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* List */}
      <div className="card overflow-x-auto">
        <h2 className="font-semibold mb-4">Historique</h2>
        {dividends.length === 0 ? (
          <p className="text-gray-500">Aucun dividende enregistré.</p>
        ) : (
          <table className="min-w-full">
            <thead className="border-b border-gray-800">
              <tr>
                {['Ticker','Ex-date','Paiement','€/action','Qté','Retenue','Net',''].map(h => <th key={h} className="th">{h}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {dividends.map(d => (
                <tr key={d.id} className="hover:bg-gray-800/30">
                  <td className="td font-mono text-indigo-300 font-semibold">{d.ticker}</td>
                  <td className="td">{d.exDividendDate}</td>
                  <td className="td text-gray-500">{d.paymentDate || '—'}</td>
                  <td className="td font-mono">{fmt(d.amountPerShare)}</td>
                  <td className="td font-mono">{fmt(d.quantity)}</td>
                  <td className="td font-mono text-red-400">-{fmt(d.taxWithheld)}</td>
                  <td className="td font-mono font-semibold text-green-400">{fmt(d.netAmount)} €</td>
                  <td className="td">
                    <button onClick={() => deleteDividend(portfolioId!, d.id).then(load)} className="text-gray-600 hover:text-red-400 text-xs">✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
