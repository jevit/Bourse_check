import type { TechnicalSnapshot } from '../types/analysis'

function fmt(n: number | null, digits = 2) {
  if (n == null) return '—'
  return n.toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

function RsiBar({ rsi }: { rsi: number | null }) {
  if (rsi == null) return <span className="text-gray-500">—</span>
  const pct = Math.min(100, Math.max(0, rsi))
  const color = rsi <= 30 ? 'bg-green-500' : rsi >= 70 ? 'bg-red-500' : 'bg-yellow-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-gray-700 rounded-full h-2">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-sm font-mono font-bold ${rsi <= 30 ? 'text-green-400' : rsi >= 70 ? 'text-red-400' : 'text-yellow-400'}`}>
        {fmt(rsi)}
      </span>
      {rsi <= 30 && <span className="text-xs text-green-400 font-bold">SURVENDU</span>}
      {rsi >= 70 && <span className="text-xs text-red-400 font-bold">SURACHAT</span>}
    </div>
  )
}

function SmaIndicator({ label, price, sma, pct }: { label: string; price: number; sma: number | null; pct: number }) {
  if (sma == null) return null
  const above = price > sma
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-mono">{fmt(sma)}</span>
        <span className={`text-xs font-bold ${above ? 'text-green-400' : 'text-red-400'}`}>
          {pct >= 0 ? '+' : ''}{fmt(pct)}%
          {above ? ' ↑' : ' ↓'}
        </span>
      </div>
    </div>
  )
}

export default function TechnicalIndicators({ tech }: { tech: TechnicalSnapshot }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs mb-1">Cours</p>
          <p className="font-mono font-bold text-lg">{fmt(tech.currentPrice)} €</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs mb-1">Plus haut 52S</p>
          <p className="font-mono font-bold text-orange-300">{fmt(tech.high52w)}</p>
          <p className="text-xs text-gray-500">{fmt(tech.pctFrom52wHigh)}%</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-3 text-center">
          <p className="text-gray-400 text-xs mb-1">Plus bas 52S</p>
          <p className="font-mono font-bold text-green-300">{fmt(tech.low52w)}</p>
          <p className="text-xs text-gray-500">+{fmt(tech.pctFrom52wLow)}%</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-gray-400 text-xs uppercase tracking-wide">RSI(14)</p>
        <RsiBar rsi={tech.rsi14} />
        <p className="text-xs text-gray-500">
          Zone 30-70 = neutre | &lt;30 = survendu (opportunité) | &gt;70 = surachat (prudence)
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-gray-400 text-xs uppercase tracking-wide">Moyennes mobiles</p>
        <SmaIndicator label="SMA-50" price={tech.currentPrice} sma={tech.sma50} pct={tech.sma50 ? ((tech.currentPrice - tech.sma50) / tech.sma50 * 100) : 0} />
        <SmaIndicator label="SMA-200" price={tech.currentPrice} sma={tech.sma200} pct={tech.pctFromSma200} />
        {tech.sma50 && tech.sma200 && (
          <p className={`text-xs font-bold ${tech.goldenCross ? 'text-green-400' : 'text-red-400'}`}>
            {tech.goldenCross ? '✓ Golden Cross (SMA50 > SMA200 — tendance haussière)' : '✗ Death Cross (SMA50 < SMA200 — potentiel retournement)'}
          </p>
        )}
      </div>
    </div>
  )
}
