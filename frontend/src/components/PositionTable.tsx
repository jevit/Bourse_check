import { useState } from 'react'
import type { PositionSnapshot } from '../types'

type SortKey = keyof PositionSnapshot
type SortDir = 'asc' | 'desc'

function fmt(n: number, digits = 2) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

function fmtPct(n: number) {
  return (n >= 0 ? '+' : '') + fmt(n) + '%'
}

interface Props {
  positions: PositionSnapshot[]
}

export default function PositionTable({ positions }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('currentValue')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('desc') }
  }

  const sorted = [...positions].sort((a, b) => {
    const av = a[sortKey] as number | string
    const bv = b[sortKey] as number | string
    const cmp = typeof av === 'number' ? av - (bv as number) : String(av).localeCompare(String(bv))
    return sortDir === 'asc' ? cmp : -cmp
  })

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="text-gray-600"> ↕</span>
    return <span className="text-indigo-400">{sortDir === 'asc' ? ' ↑' : ' ↓'}</span>
  }

  if (positions.length === 0) {
    return <p className="text-gray-500 py-4">Aucune position ouverte.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="border-b border-gray-800">
          <tr>
            {[
              ['ticker', 'Ticker'],
              ['enveloppe', 'Enveloppe'],
              ['quantity', 'Qté'],
              ['pru', 'PRU'],
              ['currentPrice', 'Cours'],
              ['currentValue', 'Valeur'],
              ['latentPnl', 'PV Latente'],
              ['latentPnlPct', 'PV %'],
              ['yoc', 'YoC'],
              ['annualDividend', 'Div/an'],
            ].map(([k, label]) => (
              <th key={k} className="th" onClick={() => toggleSort(k as SortKey)}>
                {label}<SortIcon k={k as SortKey} />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {sorted.map(p => (
            <tr key={p.ticker} className="hover:bg-gray-800/30 transition-colors">
              <td className="td font-mono font-semibold text-indigo-300">{p.ticker}</td>
              <td className="td">
                <span className="text-xs bg-gray-800 px-2 py-0.5 rounded">{p.enveloppe}</span>
              </td>
              <td className="td font-mono">{fmt(p.quantity, 4)}</td>
              <td className="td font-mono">{fmt(p.pru)}</td>
              <td className="td font-mono">{fmt(p.currentPrice)}</td>
              <td className="td font-mono font-semibold">{fmt(p.currentValue)} €</td>
              <td className={`td font-mono ${p.latentPnl >= 0 ? 'gain' : 'loss'}`}>
                {p.latentPnl >= 0 ? '+' : ''}{fmt(p.latentPnl)} €
              </td>
              <td className={`td font-mono ${p.latentPnlPct >= 0 ? 'gain' : 'loss'}`}>
                {fmtPct(p.latentPnlPct)}
              </td>
              <td className="td font-mono text-yellow-400">
                {p.yoc > 0 ? fmt(p.yoc) + '%' : '—'}
              </td>
              <td className="td font-mono text-green-300">
                {p.annualDividend > 0 ? fmt(p.annualDividend) + ' €' : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
