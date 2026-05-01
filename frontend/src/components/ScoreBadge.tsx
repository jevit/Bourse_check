interface Props {
  score: number
  label?: string
  size?: 'sm' | 'md' | 'lg'
}

function scoreColor(score: number) {
  if (score >= 70) return 'bg-green-500 text-white'
  if (score >= 55) return 'bg-emerald-600 text-white'
  if (score >= 35) return 'bg-yellow-600 text-white'
  if (score >= 20) return 'bg-orange-600 text-white'
  return 'bg-red-700 text-white'
}

function scoreRing(score: number) {
  if (score >= 70) return 'ring-green-400'
  if (score >= 55) return 'ring-emerald-500'
  if (score >= 35) return 'ring-yellow-500'
  if (score >= 20) return 'ring-orange-500'
  return 'ring-red-600'
}

export default function ScoreBadge({ score, label, size = 'md' }: Props) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : size === 'lg' ? 'w-14 h-14 text-xl' : 'w-10 h-10 text-sm'
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`${sizeClass} rounded-full flex items-center justify-center font-bold ring-2 ${scoreColor(score)} ${scoreRing(score)}`}>
        {score}
      </div>
      {label && <span className="text-xs text-gray-400 text-center leading-tight">{label}</span>}
    </div>
  )
}

export function RecommendationBadge({ rec, label }: { rec: string; label: string }) {
  const colors: Record<string, string> = {
    RENFORCER_FORT: 'bg-green-500/20 text-green-300 border-green-500/30',
    RENFORCER:      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    ATTENDRE:       'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    PRUDENCE:       'bg-orange-500/20 text-orange-300 border-orange-500/30',
    VENDRE_PARTIEL: 'bg-red-500/20 text-red-300 border-red-500/30',
  }
  return (
    <span className={`text-xs font-bold px-2 py-1 rounded border ${colors[rec] || colors.ATTENDRE}`}>
      {label}
    </span>
  )
}
