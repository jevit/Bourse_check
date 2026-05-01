import type { TechnicalSnapshot } from '../types/analysis'
import InfoTooltip from './InfoTooltip'

function fmt(n: number | null, digits = 2) {
  if (n == null) return '—'
  return n.toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

function RsiBar({ rsi }: { rsi: number | null }) {
  if (rsi == null) return <span className="text-gray-500 text-xs">Données insuffisantes (&lt; 28 séances)</span>
  const pct = Math.min(100, Math.max(0, rsi))
  const isOversold = rsi <= 30
  const isOverbought = rsi >= 70
  const color = isOversold ? 'bg-green-500' : isOverbought ? 'bg-red-500' : 'bg-yellow-500'
  const textColor = isOversold ? 'text-green-400' : isOverbought ? 'text-red-400' : 'text-yellow-400'
  const zone = isOversold ? '🟢 SURVENDU — signal achat possible' : isOverbought ? '🔴 SURACHAT — attendre repli' : '🟡 Zone neutre'

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2">
        {/* Zone markers */}
        <div className="flex-1 relative">
          <div className="bg-gray-700 rounded-full h-3 relative overflow-hidden">
            {/* Zone colors */}
            <div className="absolute left-0 top-0 h-full w-[30%] bg-green-900/40" />
            <div className="absolute left-[70%] top-0 h-full w-[30%] bg-red-900/40" />
            {/* Current RSI cursor */}
            <div
              className={`absolute top-0 h-full w-1 ${color} rounded-full shadow-lg transition-all`}
              style={{ left: `calc(${pct}% - 2px)` }}
            />
          </div>
          {/* Scale labels */}
          <div className="flex justify-between text-xs text-gray-600 mt-0.5">
            <span>0</span><span className="text-green-600">30</span><span>50</span><span className="text-red-600">70</span><span>100</span>
          </div>
        </div>
        <span className={`text-sm font-mono font-bold w-10 text-right ${textColor}`}>{fmt(rsi, 1)}</span>
      </div>
      <p className={`text-xs font-medium ${textColor}`}>{zone}</p>
    </div>
  )
}

function SmaRow({ label, price, sma, pct, tooltip }: {
  label: string; price: number; sma: number | null; pct: number; tooltip: string
}) {
  if (sma == null) return (
    <div className="flex items-center justify-between text-sm text-gray-600">
      <span>{label}</span><span className="text-xs">Historique insuffisant</span>
    </div>
  )
  const above = price > sma
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-400 flex items-center">
        {label}
        <InfoTooltip title={label} content={tooltip} />
      </span>
      <div className="flex items-center gap-2">
        <span className="font-mono text-gray-300">{fmt(sma)} €</span>
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${above ? 'bg-green-900/40 text-green-300' : 'bg-red-900/40 text-red-300'}`}>
          {above ? '↑ +' : '↓ '}{fmt(Math.abs(pct), 1)}%
        </span>
      </div>
    </div>
  )
}

export default function TechnicalIndicators({ tech }: { tech: TechnicalSnapshot }) {
  const pctFromSma50 = tech.sma50 && tech.sma50 !== 0
    ? ((tech.currentPrice - tech.sma50) / tech.sma50 * 100) : 0

  return (
    <div className="space-y-5">
      {/* Cours + Range 52S */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-gray-800 rounded-lg p-2.5 text-center">
          <p className="text-gray-400 text-xs mb-1">
            Cours
            <InfoTooltip content="Dernier cours de clôture disponible (Yahoo Finance, cache 15 min)." />
          </p>
          <p className="font-mono font-bold text-base">{fmt(tech.currentPrice)} €</p>
          <p className="text-xs text-gray-500">{tech.lastQuoteDate}</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-2.5 text-center">
          <p className="text-gray-400 text-xs mb-1">
            + haut 52S
            <InfoTooltip content="Plus haut cours de clôture des 52 dernières semaines. Résistance psychologique forte." />
          </p>
          <p className="font-mono font-bold text-orange-300">{fmt(tech.high52w)} €</p>
          <p className="text-xs text-orange-400/70">{fmt(tech.pctFrom52wHigh, 1)}%</p>
        </div>
        <div className="bg-gray-800 rounded-lg p-2.5 text-center">
          <p className="text-gray-400 text-xs mb-1">
            + bas 52S
            <InfoTooltip content="Plus bas cours de clôture des 52 dernières semaines. Zone de support historique — proche du plus bas = opportunité de valeur." />
          </p>
          <p className="font-mono font-bold text-green-300">{fmt(tech.low52w)} €</p>
          <p className="text-xs text-green-400/70">+{fmt(tech.pctFrom52wLow, 1)}%</p>
        </div>
      </div>

      {/* RSI */}
      <div className="space-y-2">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide flex items-center">
          RSI(14)
          <InfoTooltip
            title="RSI — Relative Strength Index"
            content="Oscillateur de momentum 0–100 (J.W. Wilder, 1978). En dessous de 30 : survendu → achat possible. Au-dessus de 70 : surachat → prudence. Calculé sur les 14 dernières séances."
          />
        </p>
        <RsiBar rsi={tech.rsi14} />
      </div>

      {/* Moyennes mobiles */}
      <div className="space-y-2">
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide flex items-center">
          Moyennes mobiles
          <InfoTooltip
            title="SMA — Simple Moving Average"
            content="Moyenne des N derniers cours de clôture. La SMA-200 représente la tendance long terme. La SMA-50 la tendance moyen terme."
          />
        </p>
        <SmaRow
          label="SMA-50"
          price={tech.currentPrice}
          sma={tech.sma50}
          pct={pctFromSma50}
          tooltip="Moyenne des 50 dernières séances (~2,5 mois). Indicateur de tendance moyen terme. Cours au-dessus = momentum positif à court terme."
        />
        <SmaRow
          label="SMA-200"
          price={tech.currentPrice}
          sma={tech.sma200}
          pct={tech.pctFromSma200}
          tooltip="Moyenne des 200 dernières séances (~10 mois). La référence de la tendance long terme (Stan Weinstein). Cours sous SMA-200 = zone de correction — potentielle opportunité."
        />
      </div>

      {/* Golden / Death Cross */}
      {tech.sma50 && tech.sma200 && (
        <div className={`rounded-lg p-3 border text-xs font-medium ${tech.goldenCross ? 'border-green-600/40 bg-green-900/20 text-green-300' : 'border-red-600/40 bg-red-900/20 text-red-300'}`}>
          {tech.goldenCross
            ? <>✨ <strong>Golden Cross</strong> — SMA50 au-dessus de la SMA200. Tendance haussière long terme confirmée. Signal d'achat classique.</>
            : <>💀 <strong>Death Cross</strong> — SMA50 sous la SMA200. Tendance baissière. Peut précéder un retournement haussier si RSI &lt; 35.
                <InfoTooltip content="Le death cross est plus utile comme signal de prudence que comme signal de vente. Combiné à un RSI survendu, il précède souvent un rebond." /></>
          }
        </div>
      )}
    </div>
  )
}
