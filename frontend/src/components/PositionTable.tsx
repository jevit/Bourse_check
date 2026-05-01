import { useState } from 'react'
import type { PositionSnapshot } from '../types'
import InfoTooltip from './InfoTooltip'

type SortKey = keyof PositionSnapshot
type SortDir = 'asc' | 'desc'

function fmt(n: number, digits = 2) {
  return n.toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

function fmtPct(n: number) {
  return (n >= 0 ? '+' : '') + fmt(n) + '%'
}

// Indicateur coloré générique
function Pill({ value, label, positive }: { value: string; label?: string; positive: boolean | null }) {
  const color = positive === null ? 'bg-gray-700 text-gray-300'
    : positive ? 'bg-green-900/50 text-green-300 ring-1 ring-green-600/30'
    : 'bg-red-900/50 text-red-300 ring-1 ring-red-600/30'
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded-full ${color}`}>
      {positive === true && <span>▲</span>}
      {positive === false && <span>▼</span>}
      {value}
      {label && <span className="text-xs opacity-70 ml-0.5">{label}</span>}
    </span>
  )
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
            <th className="th" onClick={() => toggleSort('ticker')}>
              Ticker<SortIcon k="ticker" />
            </th>
            <th className="th">Env.</th>
            <th className="th" onClick={() => toggleSort('quantity')}>
              Qté<SortIcon k="quantity" />
            </th>
            <th className="th" onClick={() => toggleSort('pru')}>
              PRU<InfoTooltip title="Prix de Revient Unitaire" content="Coût réel par action, frais inclus. Seuil de rentabilité de votre position. Recalculé depuis toutes vos transactions." />
              <SortIcon k="pru" />
            </th>
            <th className="th" onClick={() => toggleSort('currentPrice')}>
              Cours<SortIcon k="currentPrice" />
            </th>
            <th className="th" onClick={() => toggleSort('currentValue')}>
              Valeur<SortIcon k="currentValue" />
            </th>
            <th className="th" onClick={() => toggleSort('latentPnl')}>
              PV Latente<InfoTooltip title="Plus-Value Latente" content="Gain non réalisé = (cours actuel − PRU) × quantité. Devient imposable uniquement à la vente." />
              <SortIcon k="latentPnl" />
            </th>
            <th className="th" onClick={() => toggleSort('latentPnlPct')}>
              PV %<SortIcon k="latentPnlPct" />
            </th>
            <th className="th" onClick={() => toggleSort('yoc')}>
              YoC<InfoTooltip title="Yield on Cost" content="Rendement sur votre prix d'achat = dividende annuel net / (PRU × quantité) × 100. Plus fidèle que le yield de marché pour un investisseur long terme." />
              <SortIcon k="yoc" />
            </th>
            <th className="th" onClick={() => toggleSort('annualDividend')}>
              Div/an<InfoTooltip title="Dividendes annuels nets" content="Somme des dividendes nets perçus sur les 12 derniers mois pour cette position." />
              <SortIcon k="annualDividend" />
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800/50">
          {sorted.map(p => {
            const pnlPositive = p.latentPnl >= 0
            const yocGood = p.yoc >= 3
            const yocGreat = p.yoc >= 5

            return (
              <tr key={p.ticker} className="hover:bg-gray-800/30 transition-colors">
                <td className="td font-mono font-semibold text-indigo-300">{p.ticker}</td>
                <td className="td">
                  <span className="text-xs bg-gray-800 px-2 py-0.5 rounded font-mono">{p.enveloppe}</span>
                </td>
                <td className="td font-mono text-gray-300">{fmt(p.quantity, 4)}</td>
                <td className="td font-mono text-gray-300">{fmt(p.pru)} €</td>
                <td className="td font-mono font-semibold">{fmt(p.currentPrice)} €</td>
                <td className="td font-mono font-bold">{fmt(p.currentValue)} €</td>
                <td className="td">
                  <Pill
                    value={(pnlPositive ? '+' : '') + fmt(p.latentPnl) + ' €'}
                    positive={pnlPositive}
                  />
                </td>
                <td className="td">
                  <Pill
                    value={(p.latentPnlPct >= 0 ? '+' : '') + fmt(p.latentPnlPct) + '%'}
                    positive={pnlPositive}
                  />
                </td>
                <td className="td">
                  {p.yoc > 0
                    ? <Pill
                        value={fmt(p.yoc) + '%'}
                        positive={yocGood}
                        label={yocGreat ? '🔥' : undefined}
                      />
                    : <span className="text-gray-600">—</span>
                  }
                </td>
                <td className="td font-mono text-green-300">
                  {p.annualDividend > 0 ? fmt(p.annualDividend) + ' €' : '—'}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
