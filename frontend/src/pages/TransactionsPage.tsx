import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getTransactions, createTransaction, deleteTransaction } from '../services/api'
import type { Transaction, EnveloppeType, TransactionType } from '../types'
import { format } from 'date-fns'

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const TYPE_COLORS: Record<TransactionType, string> = {
  BUY: 'text-green-400', SELL: 'text-red-400', DIVIDEND: 'text-yellow-400',
  FEE: 'text-gray-400', SPLIT: 'text-blue-400', TRANSFER_IN: 'text-cyan-400', TRANSFER_OUT: 'text-orange-400',
}

export default function TransactionsPage() {
  const { id: portfolioId } = useParams<{ id: string }>()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    ticker: '', instrumentName: '', enveloppe: 'PEA' as EnveloppeType,
    type: 'BUY' as TransactionType, date: format(new Date(), 'yyyy-MM-dd'),
    quantity: '', unitPrice: '', fees: '0', currency: 'EUR', notes: '',
  })
  const [error, setError] = useState('')

  useEffect(() => { if (portfolioId) load() }, [portfolioId])

  async function load() {
    try { const r = await getTransactions(portfolioId!); setTransactions(r.data) } catch {}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setError('')
    try {
      await createTransaction(portfolioId!, {
        ticker: form.ticker, instrumentName: form.instrumentName || undefined,
        enveloppe: form.enveloppe, type: form.type, date: form.date,
        quantity: parseFloat(form.quantity), unitPrice: parseFloat(form.unitPrice),
        fees: parseFloat(form.fees) || 0, currency: form.currency, notes: form.notes || undefined,
      })
      setShowForm(false)
      setForm(f => ({ ...f, ticker: '', instrumentName: '', quantity: '', unitPrice: '', fees: '0', notes: '' }))
      load()
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } }
      setError(e.response?.data?.error || 'Erreur')
    }
  }

  async function handleDelete(txId: string) {
    if (!confirm('Supprimer cette transaction ?')) return
    await deleteTransaction(portfolioId!, txId)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Transactions</h1>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>+ Ajouter</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="card space-y-4 max-w-2xl">
          <h2 className="font-semibold">Nouvelle transaction</h2>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Ticker *</label>
              <input className="input uppercase" value={form.ticker} onChange={e => setForm(f => ({...f, ticker: e.target.value.toUpperCase()}))} required placeholder="AI.PA" />
            </div>
            <div>
              <label className="label">Nom instrument</label>
              <input className="input" value={form.instrumentName} onChange={e => setForm(f => ({...f, instrumentName: e.target.value}))} placeholder="Air Liquide" />
            </div>
            <div>
              <label className="label">Type *</label>
              <select className="input" value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value as TransactionType}))}>
                {(['BUY','SELL','DIVIDEND','FEE','SPLIT','TRANSFER_IN','TRANSFER_OUT'] as TransactionType[]).map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Enveloppe *</label>
              <select className="input" value={form.enveloppe} onChange={e => setForm(f => ({...f, enveloppe: e.target.value as EnveloppeType}))}>
                {(['PEA','CTO','AV','PEE','PERCO'] as EnveloppeType[]).map(e => <option key={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Date *</label>
              <input className="input" type="date" value={form.date} onChange={e => setForm(f => ({...f, date: e.target.value}))} required />
            </div>
            <div>
              <label className="label">Quantité *</label>
              <input className="input" type="number" step="0.000001" value={form.quantity} onChange={e => setForm(f => ({...f, quantity: e.target.value}))} required min="0.000001" />
            </div>
            <div>
              <label className="label">Prix unitaire *</label>
              <input className="input" type="number" step="0.000001" value={form.unitPrice} onChange={e => setForm(f => ({...f, unitPrice: e.target.value}))} required min="0" />
            </div>
            <div>
              <label className="label">Frais</label>
              <input className="input" type="number" step="0.01" value={form.fees} onChange={e => setForm(f => ({...f, fees: e.target.value}))} min="0" />
            </div>
            <div className="col-span-2">
              <label className="label">Notes</label>
              <input className="input" value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))} placeholder="Optionnel" />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" type="submit">Enregistrer</button>
            <button className="btn-secondary" type="button" onClick={() => setShowForm(false)}>Annuler</button>
          </div>
        </form>
      )}

      <div className="card overflow-x-auto">
        {transactions.length === 0 ? (
          <p className="text-gray-500">Aucune transaction. Saisissez votre premier achat.</p>
        ) : (
          <table className="min-w-full">
            <thead className="border-b border-gray-800">
              <tr>
                {['Date','Ticker','Type','Enveloppe','Qté','Prix','Frais','Total','Notes',''].map(h => (
                  <th key={h} className="th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              {transactions.map(t => (
                <tr key={t.id} className="hover:bg-gray-800/30">
                  <td className="td">{t.date}</td>
                  <td className="td font-mono text-indigo-300 font-semibold">{t.ticker}</td>
                  <td className={`td font-semibold ${TYPE_COLORS[t.type]}`}>{t.type}</td>
                  <td className="td"><span className="text-xs bg-gray-800 px-2 py-0.5 rounded">{t.enveloppe}</span></td>
                  <td className="td font-mono">{fmt(t.quantity)}</td>
                  <td className="td font-mono">{fmt(t.unitPrice)}</td>
                  <td className="td font-mono text-gray-500">{fmt(t.fees)}</td>
                  <td className="td font-mono font-semibold">{fmt(t.quantity * t.unitPrice + t.fees)} €</td>
                  <td className="td text-gray-500 text-xs max-w-32 truncate">{t.notes || '—'}</td>
                  <td className="td">
                    <button onClick={() => handleDelete(t.id)} className="text-gray-600 hover:text-red-400 text-xs">✕</button>
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
