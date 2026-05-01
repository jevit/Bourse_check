import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getOpportunities, getWatchlist, addToWatchlist, removeFromWatchlist } from '../services/analysisApi'
import type { OpportunityItem, WatchlistItem } from '../services/analysisApi'
import ScoreBadge, { RecommendationBadge } from '../components/ScoreBadge'
import TechnicalIndicators from '../components/TechnicalIndicators'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts'

function fmt(n: number | null | undefined, d = 2) {
  if (n == null) return '—'
  return n.toLocaleString('fr-FR', { minimumFractionDigits: d, maximumFractionDigits: d })
}

function ScoreBreakdown({ item }: { item: OpportunityItem }) {
  const s = item.score
  const radarData = [
    { subject: 'Rendement', score: s.yieldScore, max: 30 },
    { subject: 'RSI', score: s.rsiScore, max: 25 },
    { subject: 'SMA-200', score: s.sma200Score, max: 20 },
    { subject: '52S low', score: s.range52wScore, max: 15 },
    { subject: 'Momentum', score: s.momentumScore, max: 10 },
  ].map(d => ({ ...d, pct: Math.round(d.score / d.max * 100) }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
      {/* Score breakdown bars */}
      <div className="space-y-2">
        {[
          { label: 'Rendement relatif', score: s.yieldScore, max: 30, hint: 'Cours yield / yield historique' },
          { label: 'RSI(14)', score: s.rsiScore, max: 25, hint: 'Wilder 1978 — <30 survendu' },
          { label: 'Distance SMA-200', score: s.sma200Score, max: 20, hint: 'Weinstein — correction vs tendance long terme' },
          { label: 'Bas 52 semaines', score: s.range52wScore, max: 15, hint: 'Zone de valeur relative' },
          { label: 'Momentum SMA50/200', score: s.momentumScore, max: 10, hint: 'Death cross = retournement potentiel' },
        ].map(({ label, score, max, hint }) => (
          <div key={label}>
            <div className="flex justify-between text-xs text-gray-400 mb-0.5">
              <span title={hint}>{label}</span>
              <span className="font-mono">{score}/{max}</span>
            </div>
            <div className="bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full bg-indigo-500 transition-all"
                style={{ width: `${Math.round(score / max * 100)}%` }}
              />
            </div>
          </div>
        ))}
        <p className="text-xs text-gray-500 italic mt-2">{s.rationale}</p>
      </div>

      {/* Technical indicators */}
      <div>
        <TechnicalIndicators tech={s.technical} />
      </div>

      {/* Fair value */}
      {(s.fairValueEstimate || s.marginOfSafetyPrice) && (
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          <div className="bg-gray-800/60 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Valeur juste estimée</p>
            <p className="font-mono font-bold text-indigo-300">{fmt(s.fairValueEstimate)} €</p>
            <p className="text-xs text-gray-500">dividende annuel / yield normatif</p>
          </div>
          <div className="bg-gray-800/60 rounded-lg p-3">
            <p className="text-gray-400 text-xs mb-1">Prix d'achat cible (–15%)</p>
            <p className="font-mono font-bold text-green-300">{fmt(s.marginOfSafetyPrice)} €</p>
            <p className="text-xs text-gray-500">marge de sécurité Graham</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AnalysisPage() {
  const { id: portfolioId } = useParams<{ id: string }>()
  const [tab, setTab] = useState<'opportunities' | 'watchlist'>('opportunities')
  const [opportunities, setOpportunities] = useState<OpportunityItem[]>([])
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAddWatch, setShowAddWatch] = useState(false)
  const [newTicker, setNewTicker] = useState('')
  const [newTargetPrice, setNewTargetPrice] = useState('')
  const [newMaxWeight, setNewMaxWeight] = useState('5')
  const [newNotes, setNewNotes] = useState('')

  useEffect(() => {
    if (!portfolioId) return
    setLoading(true)
    Promise.all([
      getOpportunities(portfolioId).then(r => setOpportunities(r.data)).catch(() => {}),
      getWatchlist(portfolioId).then(r => setWatchlist(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false))
  }, [portfolioId])

  async function handleAddWatch(e: React.FormEvent) {
    e.preventDefault()
    if (!portfolioId) return
    await addToWatchlist(portfolioId, {
      ticker: newTicker.toUpperCase(),
      targetPrice: newTargetPrice ? parseFloat(newTargetPrice) : undefined,
      maxWeightPct: newMaxWeight ? parseFloat(newMaxWeight) : undefined,
      notes: newNotes || undefined,
    })
    setShowAddWatch(false)
    setNewTicker(''); setNewTargetPrice(''); setNewMaxWeight('5'); setNewNotes('')
    getWatchlist(portfolioId).then(r => setWatchlist(r.data))
  }

  async function handleRemoveWatch(itemId: string) {
    if (!portfolioId) return
    await removeFromWatchlist(portfolioId, itemId)
    setWatchlist(w => w.filter(i => i.id !== itemId))
  }

  if (loading) return <div className="text-gray-500">Analyse en cours…</div>

  const positions = opportunities.filter(o => o.source === 'POSITION')
  const watchOpps = opportunities.filter(o => o.source === 'WATCHLIST')
  const topDca = positions.slice(0, 3)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analyse & Opportunités</h1>
        <Link to={`/portfolios/${portfolioId}`} className="btn-secondary text-sm">← Dashboard</Link>
      </div>

      {/* DCA Helper — top 3 */}
      {topDca.length > 0 && (
        <div className="card">
          <h2 className="font-semibold mb-1">Renforcement mensuel conseillé</h2>
          <p className="text-gray-500 text-xs mb-4">Top 3 positions selon score composite (rendement relatif + RSI + SMA-200 + zone 52S)</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topDca.map((opp, i) => (
              <div key={opp.ticker} className={`bg-gray-800 rounded-xl p-4 border ${i === 0 ? 'border-green-600' : 'border-gray-700'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-mono font-bold text-lg text-indigo-300">{opp.ticker}</span>
                    {i === 0 && <span className="ml-2 text-xs bg-green-700/50 text-green-300 px-2 py-0.5 rounded">Priorité 1</span>}
                  </div>
                  <ScoreBadge score={opp.score.totalScore} size="md" />
                </div>
                <RecommendationBadge rec={opp.score.recommendation} label={opp.score.recommendationLabel} />
                <div className="mt-3 text-xs text-gray-400 space-y-1">
                  <p>Cours : <span className="text-gray-200 font-mono">{fmt(opp.score.technical.currentPrice)} €</span></p>
                  {opp.score.marginOfSafetyPrice && (
                    <p>Cible : <span className="text-green-300 font-mono">{fmt(opp.score.marginOfSafetyPrice)} €</span></p>
                  )}
                  <p>RSI : <span className={`font-mono font-bold ${(opp.score.technical.rsi14 ?? 50) < 40 ? 'text-green-400' : (opp.score.technical.rsi14 ?? 50) > 65 ? 'text-red-400' : 'text-yellow-400'}`}>
                    {fmt(opp.score.technical.rsi14)}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-2">
        <button onClick={() => setTab('opportunities')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'opportunities' ? 'bg-indigo-700 text-white' : 'text-gray-400 hover:text-white'}`}>
          Toutes les opportunités ({opportunities.length})
        </button>
        <button onClick={() => setTab('watchlist')} className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${tab === 'watchlist' ? 'bg-indigo-700 text-white' : 'text-gray-400 hover:text-white'}`}>
          Watchlist ({watchlist.length})
        </button>
      </div>

      {tab === 'opportunities' && (
        <div className="space-y-3">
          {opportunities.length === 0 && (
            <p className="text-gray-500">Aucune position. Ajoutez des transactions ou des instruments en watchlist.</p>
          )}
          {opportunities.map(opp => (
            <div key={opp.ticker} className="card">
              <div
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(expanded === opp.ticker ? null : opp.ticker)}
              >
                <div className="flex items-center gap-4">
                  <ScoreBadge score={opp.score.totalScore} size="md" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-lg text-indigo-300">{opp.ticker}</span>
                      <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400">{opp.source}</span>
                      {opp.isAlertTriggered && (
                        <span className="text-xs bg-green-700/50 text-green-300 px-2 py-0.5 rounded font-bold">🎯 PRIX CIBLE ATTEINT</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{opp.score.rationale}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RecommendationBadge rec={opp.score.recommendation} label={opp.score.recommendationLabel} />
                  <span className="text-gray-600">{expanded === opp.ticker ? '▲' : '▼'}</span>
                </div>
              </div>
              {expanded === opp.ticker && <ScoreBreakdown item={opp} />}
            </div>
          ))}
        </div>
      )}

      {tab === 'watchlist' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn-primary" onClick={() => setShowAddWatch(!showAddWatch)}>+ Ajouter à la watchlist</button>
          </div>

          {showAddWatch && (
            <form onSubmit={handleAddWatch} className="card space-y-4 max-w-md">
              <h2 className="font-semibold">Ajouter un instrument</h2>
              <div>
                <label className="label">Ticker *</label>
                <input className="input uppercase" value={newTicker} onChange={e => setNewTicker(e.target.value.toUpperCase())} required placeholder="AI.PA" />
              </div>
              <div>
                <label className="label">Prix cible d'achat</label>
                <input className="input" type="number" step="0.01" value={newTargetPrice} onChange={e => setNewTargetPrice(e.target.value)} placeholder="155.00" />
              </div>
              <div>
                <label className="label">Poids max portefeuille (%)</label>
                <input className="input" type="number" step="0.5" value={newMaxWeight} onChange={e => setNewMaxWeight(e.target.value)} />
              </div>
              <div>
                <label className="label">Notes</label>
                <input className="input" value={newNotes} onChange={e => setNewNotes(e.target.value)} placeholder="Raison du suivi…" />
              </div>
              <div className="flex gap-2">
                <button className="btn-primary" type="submit">Ajouter</button>
                <button className="btn-secondary" type="button" onClick={() => setShowAddWatch(false)}>Annuler</button>
              </div>
            </form>
          )}

          {watchlist.length === 0 ? (
            <p className="text-gray-500">Watchlist vide. Ajoutez des instruments à surveiller.</p>
          ) : (
            <div className="card overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-gray-800">
                  <tr>
                    {['Ticker','Cours actuel','Prix cible','Poids max','Notes',''].map(h => <th key={h} className="th">{h}</th>)}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {watchlist.map(item => {
                    const opp = watchOpps.find(o => o.ticker === item.ticker)
                    const price = opp?.score.technical.currentPrice
                    const triggered = item.targetPrice && price && price <= item.targetPrice
                    return (
                      <tr key={item.id} className={`hover:bg-gray-800/30 ${triggered ? 'bg-green-900/10' : ''}`}>
                        <td className="td">
                          <div className="flex items-center gap-2">
                            {opp && <ScoreBadge score={opp.score.totalScore} size="sm" />}
                            <span className="font-mono text-indigo-300 font-semibold">{item.ticker}</span>
                            {triggered && <span className="text-xs text-green-300 font-bold">🎯</span>}
                          </div>
                        </td>
                        <td className="td font-mono">{price ? fmt(price) + ' €' : '—'}</td>
                        <td className="td font-mono text-green-300">{item.targetPrice ? fmt(item.targetPrice) + ' €' : '—'}</td>
                        <td className="td">{item.maxWeightPct}%</td>
                        <td className="td text-gray-500 text-xs max-w-40 truncate">{item.notes || '—'}</td>
                        <td className="td">
                          <button onClick={() => handleRemoveWatch(item.id)} className="text-gray-600 hover:text-red-400 text-xs">✕</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
