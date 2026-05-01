import { useState } from 'react'

interface Section {
  id: string
  icon: string
  title: string
  content: React.ReactNode
}

function Accordion({ sections }: { sections: Section[] }) {
  const [open, setOpen] = useState<string | null>(sections[0]?.id ?? null)
  return (
    <div className="space-y-2">
      {sections.map(s => (
        <div key={s.id} className="card overflow-hidden">
          <button
            className="w-full flex items-center justify-between text-left p-1"
            onClick={() => setOpen(open === s.id ? null : s.id)}
          >
            <span className="flex items-center gap-3 font-semibold text-base">
              <span className="text-xl">{s.icon}</span>
              {s.title}
            </span>
            <span className="text-gray-500 text-lg">{open === s.id ? '▲' : '▼'}</span>
          </button>
          {open === s.id && (
            <div className="mt-4 border-t border-gray-800 pt-4 text-sm text-gray-300 leading-relaxed space-y-4">
              {s.content}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

function Formula({ label, formula }: { label: string; formula: string }) {
  return (
    <div className="bg-gray-800 rounded-lg p-3">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <code className="text-indigo-300 font-mono text-sm">{formula}</code>
    </div>
  )
}

function ActionBox({ color, title, text }: { color: string; title: string; text: string }) {
  const colors: Record<string, string> = {
    green: 'border-green-600 bg-green-900/20 text-green-300',
    yellow: 'border-yellow-600 bg-yellow-900/20 text-yellow-300',
    red: 'border-red-600 bg-red-900/20 text-red-300',
    blue: 'border-indigo-600 bg-indigo-900/20 text-indigo-300',
  }
  return (
    <div className={`border rounded-lg p-3 ${colors[color]}`}>
      <p className="font-bold text-sm mb-1">{title}</p>
      <p className="text-xs opacity-90">{text}</p>
    </div>
  )
}

const SECTIONS: Section[] = [
  {
    id: 'pru',
    icon: '🧮',
    title: 'PRU — Prix de Revient Unitaire',
    content: (
      <>
        <p>
          Le PRU est votre <strong className="text-white">coût réel par action</strong>, frais de courtage inclus.
          C'est le seuil en dessous duquel vous êtes en perte sur une ligne.
        </p>
        <Formula
          label="Formule (event-sourcing — recalculé sur tous les achats)"
          formula="PRU = Σ(quantité_i × prix_i + frais_i) / Σ(quantité_i)"
        />
        <p>
          Contrairement à un simple prix d'achat moyen, le PRU intègre les frais. Sur un achat de 1 000 € avec 5 € de frais,
          votre PRU est <code className="text-indigo-300">1 005 / nb_actions</code>, pas <code className="text-indigo-300">1 000 / nb_actions</code>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ActionBox color="green" title="✓ Comment utiliser"
            text="Comparez le cours actuel à votre PRU pour savoir si vous êtes gagnant. Lors d'un renforcement (achat supplémentaire sous le cours actuel), votre PRU baisse — c'est l'intérêt du DCA." />
          <ActionBox color="yellow" title="⚠ Erreur fréquente"
            text="Ne jamais stocker le PRU manuellement — la moindre correction de transaction le rendrait faux. Cette app le recalcule à chaque fois depuis l'historique complet des transactions." />
        </div>
      </>
    ),
  },
  {
    id: 'pv',
    icon: '📈',
    title: 'Plus-Value Latente',
    content: (
      <>
        <p>
          La PV latente est le <strong className="text-white">gain non réalisé</strong> sur une position encore ouverte.
          Elle fluctue avec le cours — elle ne devient réelle (et imposable) qu'à la vente.
        </p>
        <Formula
          label="Formule"
          formula="PV Latente = (Cours actuel − PRU) × Quantité détenue"
        />
        <Formula
          label="En pourcentage"
          formula="PV % = (Cours actuel − PRU) / PRU × 100"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ActionBox color="green" title="✓ PV positive (vert)"
            text="Le titre vaut plus que votre coût d'achat. Avant de vendre, simulez la fiscalité (onglet Fiscalité) — la flat tax 30% ou le régime PEA peuvent réduire significativement votre gain net." />
          <ActionBox color="red" title="✗ PV négative (rouge)"
            text="Vous êtes en moins-value latente. Ce n'est pas une perte tant que vous ne vendez pas. Si les fondamentaux restent solides, c'est souvent l'opportunité de renforcer (DCA) pour baisser votre PRU." />
        </div>
      </>
    ),
  },
  {
    id: 'yoc',
    icon: '💰',
    title: 'YoC — Yield on Cost (Rendement sur PRU)',
    content: (
      <>
        <p>
          Le YoC mesure le <strong className="text-white">rendement réel sur votre investissement initial</strong>,
          pas sur le cours actuel. C'est l'indicateur clé pour un investisseur FIRE orienté dividendes croissants.
        </p>
        <Formula
          label="Formule"
          formula="YoC = Dividende annuel net / (PRU × Quantité) × 100"
        />
        <p>
          Exemple : vous avez acheté Air Liquide à 120 € (PRU). Le dividende est aujourd'hui 3 €/action.
          Votre YoC = 3 / 120 × 100 = <strong className="text-yellow-300">2,5%</strong>.
          Si dans 10 ans le dividende est à 5 €, votre YoC sera de <strong className="text-green-300">4,2%</strong>
          — sans avoir mis un euro de plus.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ActionBox color="green" title="✓ YoC croissant"
            text="C'est l'effet boule de neige des dividendes croissants. Le YoC augmente chaque année même si le cours stagne, parce que la société augmente son dividende. Objectif FIRE : atteindre un YoC global de 4–5% sur l'ensemble du portefeuille." />
          <ActionBox color="blue" title="ℹ Différence yield vs YoC"
            text="Le yield affiché sur les sites financiers (dividende / cours actuel) change tous les jours. Le YoC, lui, est fixe sur votre prix d'achat — il récompense les investisseurs de long terme qui ont acheté tôt." />
        </div>
      </>
    ),
  },
  {
    id: 'rsi',
    icon: '📊',
    title: 'RSI(14) — Relative Strength Index',
    content: (
      <>
        <p>
          Créé par <strong className="text-white">J. Welles Wilder Jr. en 1978</strong>, le RSI mesure la vitesse et
          l'amplitude des mouvements de cours sur les 14 dernières séances. Il oscille entre 0 et 100.
        </p>
        <Formula
          label="Formule (lissage Wilder)"
          formula="RS = Moyenne gains(14) / Moyenne pertes(14)  →  RSI = 100 − (100 / (1 + RS))"
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ActionBox color="green" title="RSI < 30 — Survendu"
            text="Le titre a baissé trop vite par rapport à sa dynamique récente. Signal classique de rebond possible. Cette app lui attribue 22–25 pts sur le score composite." />
          <ActionBox color="yellow" title="RSI 30–70 — Zone neutre"
            text="Ni suracheté ni survendu. La tendance peut continuer dans les deux sens. Neutralité du signal — regardez les autres indicateurs." />
          <ActionBox color="red" title="RSI > 70 — Surachat"
            text="Le titre a monté trop vite. Risque de correction à court terme. Moment moins favorable pour acheter — attendez un repli." />
        </div>
        <p className="text-gray-400 text-xs">
          ⚠ Le RSI seul n'est pas suffisant. Un titre en tendance haussière forte peut rester en zone suracheté (RSI &gt; 70)
          pendant des semaines. Croisez toujours avec la SMA-200 et le rendement relatif.
        </p>
      </>
    ),
  },
  {
    id: 'sma',
    icon: '📉',
    title: 'SMA-50 & SMA-200 — Moyennes Mobiles Simples',
    content: (
      <>
        <p>
          La <strong className="text-white">SMA-200</strong> (200 dernières séances ≈ 10 mois) est la référence
          de la tendance long terme, popularisée par <strong className="text-white">Stan Weinstein</strong> dans
          son analyse en 4 phases de marché (1988).
        </p>
        <Formula
          label="Formule"
          formula="SMA(n) = Moyenne arithmétique des n derniers cours de clôture"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ActionBox color="green" title="✓ Cours > SMA-200 (Phase 2 Weinstein)"
            text="Le titre est en tendance haussière confirmée. Conserver et renforcer aux replis sur la SMA-200 est la stratégie classique des investisseurs de long terme." />
          <ActionBox color="red" title="✗ Cours < SMA-200 (Phase 4 Weinstein)"
            text="Tendance baissière. Prudence — soit le titre consolide avant un rebond (opportunité), soit il continue de chuter. Attendez un signal de retournement (RSI < 30 + cours remonte au-dessus SMA-200)." />
        </div>
        <p className="font-semibold text-white mt-2">Golden Cross & Death Cross</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ActionBox color="green" title="🟡 Golden Cross (SMA50 dépasse SMA200)"
            text="Signal haussier long terme majeur. Historiquement, les actions qui forment un golden cross surperforment sur les 12 mois suivants dans ~70% des cas (source : Investopedia, S&P500 historique)." />
          <ActionBox color="red" title="💀 Death Cross (SMA50 passe sous SMA200)"
            text="Signal baissier long terme. Souvent signe de correction prolongée. Cette app lui attribue 7–10 pts car il précède parfois un retournement haussier violent (exhaustion baissière)." />
        </div>
      </>
    ),
  },
  {
    id: 'score',
    icon: '🎯',
    title: 'Score Composite 0–100',
    content: (
      <>
        <p>
          Le score composite combine <strong className="text-white">5 méthodes indépendantes</strong> pour donner
          un signal unique actionnable. Plus le score est haut, plus les conditions sont réunies pour acheter.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-xs">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="text-left py-2 pr-4 text-gray-400">Composante</th>
                <th className="text-center py-2 pr-4 text-gray-400">Poids</th>
                <th className="text-left py-2 text-gray-400">Condition maximale (score plein)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/50">
              <tr>
                <td className="py-2 pr-4 text-white font-medium">Rendement relatif</td>
                <td className="py-2 pr-4 text-center text-indigo-300 font-mono">30 pts</td>
                <td className="py-2 text-gray-300">Yield actuel ≥ 130% du yield historique moyen</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-white font-medium">RSI(14)</td>
                <td className="py-2 pr-4 text-center text-indigo-300 font-mono">25 pts</td>
                <td className="py-2 text-gray-300">RSI ≤ 25 (fort survendu)</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-white font-medium">Distance SMA-200</td>
                <td className="py-2 pr-4 text-center text-indigo-300 font-mono">20 pts</td>
                <td className="py-2 text-gray-300">Cours ≥ 20% sous la SMA-200</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-white font-medium">Zone bas 52S</td>
                <td className="py-2 pr-4 text-center text-indigo-300 font-mono">15 pts</td>
                <td className="py-2 text-gray-300">Cours ≤ 5% au-dessus du plus bas annuel</td>
              </tr>
              <tr>
                <td className="py-2 pr-4 text-white font-medium">Momentum SMA50/200</td>
                <td className="py-2 pr-4 text-center text-indigo-300 font-mono">10 pts</td>
                <td className="py-2 text-gray-300">Death cross prononcé (SMA50 fortement sous SMA200)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          {[
            { score: '≥ 70', label: 'RENFORCER FORT', color: 'text-green-300', bg: 'bg-green-900/20 border-green-700', action: 'Tous les signaux sont alignés. Renforcement prioritaire ce mois-ci.' },
            { score: '55–69', label: 'RENFORCER', color: 'text-emerald-300', bg: 'bg-emerald-900/20 border-emerald-700', action: 'Bonne opportunité. Renforcement conseillé si enveloppe disponible.' },
            { score: '35–54', label: 'ATTENDRE', color: 'text-yellow-300', bg: 'bg-yellow-900/20 border-yellow-700', action: 'Situation neutre. Pas de signal fort. Surveillance recommandée.' },
            { score: '< 35', label: 'PRUDENCE', color: 'text-red-300', bg: 'bg-red-900/20 border-red-700', action: 'Signaux négatifs dominants. Évitez d\'acheter — attendez une correction.' },
          ].map(({ score, label, color, bg, action }) => (
            <div key={label} className={`border rounded-lg p-3 ${bg}`}>
              <p className={`text-xs font-bold mb-1 ${color}`}>{score} — {label}</p>
              <p className="text-xs text-gray-400">{action}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-400 text-xs">
          ⚠ Le score est un outil d'aide à la décision, pas une garantie de performance.
          Il ne remplace pas l'analyse des fondamentaux de l'entreprise (résultats, dette, secteur).
        </p>
      </>
    ),
  },
  {
    id: 'yield-theory',
    icon: '📐',
    title: 'Rendement Relatif & Valeur Juste (Dividend Yield Theory)',
    content: (
      <>
        <p>
          Théorie popularisée par <strong className="text-white">Peter Lynch</strong> et formalisée dans
          <em> "Beating the Street" (1993)</em> : pour une action à dividendes stables,
          le <strong className="text-white">cours tend à revenir vers le niveau où le yield égale sa moyenne historique</strong>.
        </p>
        <Formula
          label="Valeur juste (normalisation du yield)"
          formula="Valeur juste = Dividende annuel par action / Yield historique moyen (%/100)"
        />
        <Formula
          label="Prix d'achat cible — marge de sécurité Benjamin Graham (15%)"
          formula="Prix cible = Valeur juste × 0,85"
        />
        <p>
          Exemple — Air Liquide : dividende 3,20 €/action, yield historique moyen 2,0%.
          Valeur juste = 3,20 / 0,02 = <strong className="text-indigo-300">160 €</strong>.
          Prix cible (–15%) = <strong className="text-green-300">136 €</strong>.
          Si le cours est à 130 €, vous achetez avec une marge de sécurité — c'est le signal d'achat.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ActionBox color="green" title="✓ Cours < Prix cible"
            text="Le marché offre le titre en dessous de sa valeur intrinsèque estimée. C'est la zone d'achat selon Graham. Ajoutez-le à votre watchlist avec ce prix comme déclencheur." />
          <ActionBox color="yellow" title="ℹ Limites"
            text="Cette méthode suppose un dividende stable ou croissant. Elle est moins pertinente pour les entreprises en forte croissance qui ne versent pas (ou peu) de dividendes." />
        </div>
        <p className="text-gray-400 text-xs">
          Dans cette app, le yield historique moyen est calculé depuis les dividendes que vous avez saisis
          (table <code className="text-indigo-300">instrument_annual_dividend</code>).
          Plus vous saisissez d'historique, plus le signal est fiable.
        </p>
      </>
    ),
  },
  {
    id: 'dca',
    icon: '🔄',
    title: 'DCA Helper — Quel titre renforcer ce mois ?',
    content: (
      <>
        <p>
          Le <strong className="text-white">Dollar-Cost Averaging (DCA)</strong> consiste à investir régulièrement
          (mensuellement) indépendamment du cours. La question est : sur quel titre concentrer l'apport du mois ?
        </p>
        <p>
          Cette app répond à cette question en <strong className="text-white">classant vos positions par score composite</strong>.
          Le top 3 représente les positions où les conditions d'achat sont les plus favorables ce mois-ci.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <ActionBox color="blue" title="Priorité 1 (score le plus haut)"
            text="Renforcez en priorité. Plusieurs signaux techniques et fondamentaux sont alignés positivement. C'est là que votre capital travaillera le plus efficacement." />
          <ActionBox color="blue" title="Priorité 2"
            text="Bonne alternative si la priorité 1 représente déjà un poids trop important dans votre portefeuille (diversification)." />
          <ActionBox color="blue" title="Watchlist"
            text="Les instruments en watchlist avec un prix cible atteint (🎯) peuvent supplanter vos positions actuelles — c'est peut-être le bon moment d'initier une nouvelle ligne." />
        </div>
        <p className="text-gray-400 text-xs mt-1">
          Règle pratique : évitez qu'une ligne dépasse 10% du portefeuille total (risque de concentration).
          Le champ "poids max" de la watchlist vous aide à fixer cette limite à l'avance.
        </p>
      </>
    ),
  },
  {
    id: 'range52w',
    icon: '📏',
    title: 'Zone 52 Semaines (Plus haut / Plus bas annuel)',
    content: (
      <>
        <p>
          Le plus haut et le plus bas des 52 dernières semaines définissent le
          <strong className="text-white"> range annuel de négociation</strong> d'un titre. C'est une référence
          psychologique forte utilisée par les institutionnels.
        </p>
        <Formula
          label="Position dans le range (0% = au plus bas, 100% = au plus haut)"
          formula="Position = (Cours − Plus bas 52S) / (Plus haut 52S − Plus bas 52S) × 100"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ActionBox color="green" title="✓ Cours proche du plus bas (0–20%)"
            text="Zone de valeur historique. Le marché a déjà testé ce niveau et l'a considéré comme un support. Combiné à un RSI < 40 et un bon rendement relatif, c'est un signal d'achat fort." />
          <ActionBox color="red" title="✗ Cours proche du plus haut (80–100%)"
            text="Le titre est valorisé au maximum de l'année. Moment moins favorable pour initier une position. Attendez une consolidation." />
        </div>
        <p className="text-gray-400 text-xs">
          Attention : un nouveau plus haut annuel peut aussi être un signal haussier fort (breakout).
          Ne vendez pas mécaniquement parce que le cours touche son plus haut — regardez les fondamentaux.
        </p>
      </>
    ),
  },
  {
    id: 'fiscal',
    icon: '🏛',
    title: 'Simulation Fiscale — PEA, CTO, Assurance-Vie',
    content: (
      <>
        <p>
          La fiscalité peut représenter <strong className="text-white">20–30% de votre gain</strong>.
          Choisir la bonne enveloppe et le bon moment de vente est aussi important que choisir le bon titre.
        </p>
        <div className="space-y-3">
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-green-300 font-bold text-sm mb-2">PEA — Plan d'Épargne en Actions</p>
            <div className="space-y-1 text-xs text-gray-300">
              <p>• <strong className="text-white">Avant 5 ans</strong> : flat tax 30% (12,8% IR + 17,2% PS) + clôture du plan si retrait</p>
              <p>• <strong className="text-white">Après 5 ans</strong> : exonération d'IR ✓ — seulement 17,2% de prélèvements sociaux</p>
              <p>• <strong className="text-white">Stratégie</strong> : ne jamais retirer avant 5 ans. Le PEA est l'enveloppe reine pour les actions européennes.</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-blue-300 font-bold text-sm mb-2">CTO — Compte Titres Ordinaire</p>
            <div className="space-y-1 text-xs text-gray-300">
              <p>• <strong className="text-white">Toujours</strong> : Flat Tax 30% (PFU) sur les plus-values et dividendes</p>
              <p>• Option : barème progressif si TMI &lt; 11% (rare pour les investisseurs actifs)</p>
              <p>• <strong className="text-white">Stratégie</strong> : idéal pour les actions hors zone PEA (US, Asie). Moins-values = déductibles sur 10 ans.</p>
            </div>
          </div>
          <div className="bg-gray-800 rounded-lg p-3">
            <p className="text-yellow-300 font-bold text-sm mb-2">AV — Assurance-Vie</p>
            <div className="space-y-1 text-xs text-gray-300">
              <p>• <strong className="text-white">Avant 8 ans</strong> : flat tax 30%</p>
              <p>• <strong className="text-white">Après 8 ans</strong> : 7,5% IR (après abattement 4 600 €/an) + 17,2% PS</p>
              <p>• <strong className="text-white">Stratégie</strong> : attendre impérativement les 8 ans. L'abattement annuel de 4 600 € permet des rachats défiscalisés réguliers.</p>
            </div>
          </div>
        </div>
        <ActionBox color="yellow" title="⚠ Disclaimer"
          text="Ces simulations sont des estimations non contractuelles. Elles ne tiennent pas compte des situations fiscales personnelles (barème progressif, plus-values reportées, résidence fiscale). Consultez un conseiller fiscal pour les décisions importantes." />
      </>
    ),
  },
  {
    id: 'fire',
    icon: '🔥',
    title: 'Projection FIRE — Dividendes Futurs',
    content: (
      <>
        <p>
          L'objectif FIRE (Financial Independence, Retire Early) orienté dividendes consiste à construire
          un portefeuille qui génère <strong className="text-white">suffisamment de dividendes pour couvrir vos dépenses</strong>
          sans toucher au capital.
        </p>
        <Formula
          label="Projection à N ans avec taux de croissance des dividendes (DGR)"
          formula="Div(n) = Div(0) × (1 + DGR/100)^n"
        />
        <p>
          Exemple : 3 000 €/an de dividendes aujourd'hui, DGR = 7%/an.
          Dans 10 ans : 3 000 × 1,07^10 = <strong className="text-green-300">5 900 €/an</strong>.
          Dans 20 ans : <strong className="text-green-300">11 600 €/an</strong>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <ActionBox color="green" title="✓ DGR réaliste par catégorie"
            text="Aristocrates du dividende (20+ ans de hausse) : 5–8% / an. REIT : 3–5% / an. Technologie à dividende (MSFT, AAPL) : 8–12% / an. ETF dividendes : 6–9% / an." />
          <ActionBox color="blue" title="ℹ Comment utiliser la projection"
            text="Dans l'onglet Dividendes, saisissez votre DGR estimé et votre horizon. La courbe vous montre à quelle année vos dividendes couvrent votre objectif de revenu mensuel passif." />
        </div>
        <p className="text-gray-400 text-xs">
          Le YoC projeté (YoC actuel × (1 + DGR)^n) vous permet de voir que même avec un rendement initial modeste,
          l'effet composé sur 20 ans est considérable.
        </p>
      </>
    ),
  },
  {
    id: 'watchlist',
    icon: '👁',
    title: 'Watchlist & Alertes de Prix',
    content: (
      <>
        <p>
          La watchlist est votre <strong className="text-white">liste d'attente</strong> : des titres que vous
          voulez acheter, mais seulement au bon prix. Combinée aux alertes, elle automatise la surveillance.
        </p>
        <div className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <ActionBox color="blue" title="Watchlist (onglet Analyse)"
              text="Définissez un prix cible basé sur la valeur juste calculée. L'app affiche 🎯 quand le cours passe sous ce seuil. Le score composite est calculé en temps réel pour tous les instruments en watchlist." />
            <ActionBox color="blue" title="Alertes de prix (menu Alertes)"
              text="Notification in-app quand le cours franchit votre seuil (au-dessus ou en-dessous). Vérifiée toutes les 15 minutes via le scheduler. Se désactive automatiquement après déclenchement." />
          </div>
          <ActionBox color="green" title="✓ Workflow recommandé"
            text="1. Identifiez un titre solide. 2. Calculez le prix cible (valeur juste × 0,85). 3. Ajoutez à la watchlist avec ce prix. 4. Créez une alerte de prix BELOW. 5. Quand l'alerte se déclenche, consultez le score composite avant d'acheter." />
        </div>
      </>
    ),
  },
]

export default function HelpPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">Guide & Indicateurs</h1>
        <p className="text-gray-400 text-sm">
          Comprendre chaque métrique de l'application et comment l'utiliser pour prendre de meilleures décisions d'investissement.
        </p>
      </div>

      {/* Quick nav */}
      <div className="card">
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Navigation rapide</p>
        <div className="flex flex-wrap gap-2">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => document.getElementById(`help-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="text-xs px-3 py-1.5 rounded-full bg-gray-800 hover:bg-indigo-700 text-gray-300 hover:text-white transition-colors"
            >
              {s.icon} {s.title.split('—')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {SECTIONS.map(s => (
          <div key={s.id} id={`help-${s.id}`}>
            <Accordion sections={[s]} />
          </div>
        ))}
      </div>

      {/* Disclaimer */}
      <div className="border border-yellow-700 rounded-xl p-4 bg-yellow-900/10">
        <p className="text-yellow-300 font-bold text-sm mb-2">⚠ Avertissement important</p>
        <p className="text-yellow-200/80 text-xs leading-relaxed">
          Cette application est un outil personnel d'aide à la décision. Les indicateurs, scores et simulations
          présentés sont des estimations basées sur des méthodes techniques et fondamentales reconnues, mais ne
          constituent pas des conseils financiers. Les performances passées ne présagent pas des performances
          futures. Tout investissement comporte un risque de perte en capital. Consultez un conseiller financier
          agréé (CGP) pour les décisions importantes.
        </p>
      </div>
    </div>
  )
}
