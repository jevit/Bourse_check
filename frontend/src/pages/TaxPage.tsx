import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { simulateTax } from '../services/api'
import type { EnveloppeType, TaxSimulation } from '../types'
import { format } from 'date-fns'
import InfoTooltip from '../components/InfoTooltip'

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function TaxPage() {
  const { id: portfolioId } = useParams<{ id: string }>()
  const [form, setForm] = useState({
    ticker: '', sellQuantity: '', sellPrice: '', enveloppe: 'PEA' as EnveloppeType,
    openDate: format(new Date(Date.now() - 5 * 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
  })
  const [result, setResult] = useState<{ simulation: TaxSimulation; disclaimer: string } | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setResult(null)
    try {
      const r = await simulateTax(portfolioId!, {
        ticker: form.ticker, sellQuantity: parseFloat(form.sellQuantity),
        sellPrice: parseFloat(form.sellPrice), enveloppe: form.enveloppe,
        openDate: form.openDate || undefined,
      })
      setResult(r.data)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Erreur de simulation')
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Simulation fiscale</h1>
        <Link to="/help#help-fiscal" className="text-xs text-indigo-400 hover:text-indigo-300">Guide fiscal →</Link>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-4">
        <h2 className="font-semibold">Paramètres de la vente simulée</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Ticker *</label>
            <input className="input uppercase" value={form.ticker} onChange={e => setForm(f => ({...f, ticker: e.target.value.toUpperCase()}))} required placeholder="AI.PA" />
          </div>
          <div>
            <label className="label">
              Enveloppe *
              <InfoTooltip title="Impact de l'enveloppe" content="PEA ≥5 ans : 17,2% PS seulement. CTO : flat tax 30%. AV ≥8 ans : 7,5% IR + 17,2% PS avec abattement 4 600€." />
            </label>
            <select className="input" value={form.enveloppe} onChange={e => setForm(f => ({...f, enveloppe: e.target.value as EnveloppeType}))}>
              {(['PEA','CTO','AV','PEE','PERCO'] as EnveloppeType[]).map(e => <option key={e}>{e}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Quantité à vendre *</label>
            <input className="input" type="number" step="0.000001" value={form.sellQuantity} onChange={e => setForm(f => ({...f, sellQuantity: e.target.value}))} required min="0.000001" />
          </div>
          <div>
            <label className="label">Prix de vente simulé *</label>
            <input className="input" type="number" step="0.01" value={form.sellPrice} onChange={e => setForm(f => ({...f, sellPrice: e.target.value}))} required min="0.01" />
          </div>
          <div className="col-span-2">
            <label className="label">Date d'ouverture de la position (pour PEA/AV)</label>
            <input className="input" type="date" value={form.openDate} onChange={e => setForm(f => ({...f, openDate: e.target.value}))} />
          </div>
        </div>
        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button className="btn-primary" type="submit">Simuler</button>
      </form>

      {result && (
        <div className="card space-y-4">
          <h2 className="font-semibold text-lg">Résultat</h2>
          <p className="text-indigo-300 text-sm font-medium">{result.simulation.regime}</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Plus-value brute</p>
              <p className={`text-xl font-bold ${result.simulation.grossGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {fmt(result.simulation.grossGain)} €
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <p className="text-gray-400 text-xs mb-1">Impôts estimés</p>
              <p className="text-xl font-bold text-red-400">{fmt(result.simulation.taxAmount)} €</p>
              <p className="text-xs text-gray-500">({(result.simulation.effectiveRate * 100).toFixed(1)}% effectif)</p>
            </div>
            <div className="bg-gray-800 rounded-lg p-3 col-span-2">
              <p className="text-gray-400 text-xs mb-1">Gain net après impôts</p>
              <p className={`text-2xl font-bold ${result.simulation.netGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {fmt(result.simulation.netGain)} €
              </p>
            </div>
          </div>
          <div className="border border-yellow-700 rounded-lg p-3 bg-yellow-900/20">
            <p className="text-yellow-300 text-xs">{result.disclaimer}</p>
          </div>
        </div>
      )}
    </div>
  )
}
