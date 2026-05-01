import { useState, useEffect } from 'react'
import { getAlerts, createAlert, toggleAlert, deleteAlert } from '../services/api'
import type { PriceAlert, AlertDirection } from '../types'

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    ticker: '', direction: 'BELOW' as AlertDirection, targetPrice: '',
  })

  useEffect(() => { load() }, [])

  async function load() {
    try { const r = await getAlerts(); setAlerts(r.data) } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    await createAlert({ ticker: form.ticker, direction: form.direction, targetPrice: parseFloat(form.targetPrice) })
    setForm(f => ({ ...f, ticker: '', targetPrice: '' }))
    setShowForm(false)
    load()
  }

  async function handleToggle(id: string) {
    await toggleAlert(id)
    load()
  }

  async function handleDelete(id: string) {
    await deleteAlert(id)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Alertes de prix</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Nouvelle alerte</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4 max-w-md">
          <h2 className="font-semibold">Créer une alerte</h2>
          <div>
            <label className="label">Ticker *</label>
            <input className="input uppercase" value={form.ticker} onChange={e => setForm(f => ({...f, ticker: e.target.value.toUpperCase()}))} required placeholder="AI.PA" />
          </div>
          <div>
            <label className="label">Direction</label>
            <select className="input" value={form.direction} onChange={e => setForm(f => ({...f, direction: e.target.value as AlertDirection}))}>
              <option value="BELOW">En dessous de (zone de renforcement)</option>
              <option value="ABOVE">Au-dessus de (objectif de vente)</option>
            </select>
          </div>
          <div>
            <label className="label">Prix cible *</label>
            <input className="input" type="number" step="0.01" value={form.targetPrice} onChange={e => setForm(f => ({...f, targetPrice: e.target.value}))} required min="0.01" />
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" type="submit">Créer</button>
            <button className="btn-secondary" type="button" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </form>
      )}

      <div className="card">
        {alerts.length === 0 ? (
          <p className="text-gray-500">Aucune alerte configurée.</p>
        ) : (
          <div className="space-y-3">
            {alerts.map(a => (
              <div key={a.id} className={`flex items-center justify-between p-3 rounded-lg border ${a.active ? 'border-indigo-700 bg-indigo-900/20' : 'border-gray-800 bg-gray-800/20 opacity-60'}`}>
                <div className="flex items-center gap-4">
                  <div>
                    <span className="font-mono text-indigo-300 font-semibold">{a.ticker}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded ${a.direction === 'BELOW' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'}`}>
                      {a.direction === 'BELOW' ? '↓ En dessous de' : '↑ Au-dessus de'}
                    </span>
                    <span className="ml-2 font-mono font-bold">{fmt(a.targetPrice)} €</span>
                  </div>
                  {a.triggeredAt && (
                    <span className="text-yellow-400 text-xs">Déclenchée le {new Date(a.triggeredAt).toLocaleDateString('fr-FR')}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleToggle(a.id)} className={`text-xs px-3 py-1 rounded-lg ${a.active ? 'bg-gray-700 hover:bg-gray-600' : 'bg-indigo-700 hover:bg-indigo-600'}`}>
                    {a.active ? 'Désactiver' : 'Réactiver'}
                  </button>
                  <button onClick={() => handleDelete(a.id)} className="text-gray-600 hover:text-red-400 text-xs px-2">✕</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
