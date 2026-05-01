import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getPortfolios, createPortfolio, deletePortfolio } from '../services/api'
import type { Portfolio } from '../types'

export default function DashboardPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [currency, setCurrency] = useState('EUR')

  useEffect(() => { loadPortfolios() }, [])

  async function loadPortfolios() {
    try {
      const res = await getPortfolios()
      setPortfolios(res.data)
    } catch {}
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    await createPortfolio({ name, description, currency })
    setName(''); setDescription(''); setShowForm(false)
    loadPortfolios()
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer ce portefeuille ?')) return
    await deletePortfolio(id)
    loadPortfolios()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mes portefeuilles</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          + Nouveau portefeuille
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="card mb-6 space-y-4 max-w-md">
          <h2 className="font-semibold">Créer un portefeuille</h2>
          <div>
            <label className="label">Nom *</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="PEA Boursorama" />
          </div>
          <div>
            <label className="label">Description</label>
            <input className="input" value={description} onChange={e => setDescription(e.target.value)} placeholder="Optionnel" />
          </div>
          <div>
            <label className="label">Devise</label>
            <select className="input" value={currency} onChange={e => setCurrency(e.target.value)}>
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" type="submit">Créer</button>
            <button className="btn-secondary" type="button" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </form>
      )}

      {portfolios.length === 0 ? (
        <p className="text-gray-500">Aucun portefeuille. Créez-en un pour commencer.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {portfolios.map(p => (
            <div key={p.id} className="card hover:border-indigo-700 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{p.name}</h3>
                  {p.description && <p className="text-gray-500 text-sm">{p.description}</p>}
                  <span className="text-xs text-indigo-400 mt-1 inline-block">{p.currency}</span>
                </div>
                <button onClick={() => handleDelete(p.id)} className="text-gray-600 hover:text-red-400 text-xs">✕</button>
              </div>
              <div className="flex gap-2 flex-wrap">
                <Link to={`/portfolios/${p.id}`} className="btn-primary text-xs py-1">Dashboard</Link>
                <Link to={`/portfolios/${p.id}/transactions`} className="btn-secondary text-xs py-1">Transactions</Link>
                <Link to={`/portfolios/${p.id}/dividends`} className="btn-secondary text-xs py-1">Dividendes</Link>
                <Link to={`/portfolios/${p.id}/tax`} className="btn-secondary text-xs py-1">Fiscalité</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
