import { saldoLabel } from '../data/saldo'
import type { SaldoPerro } from '../data/types'

const tones = {
  ok: 'bg-green-bg text-green-badge',
  warn: 'bg-amber-bg text-amber-badge',
  danger: 'bg-red-bg text-red-badge',
  full: 'bg-blue-bg text-blue-badge',
} as const

export function SaldoBadge({ saldo, compact = false }: { saldo: SaldoPerro; compact?: boolean }) {
  const { text, tone } = saldoLabel(saldo)
  const short = compact ? `${saldo.disponibles} / ${saldo.pagadas}` : text
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${tones[tone]}`}
    >
      {short}
      {!compact && tone === 'warn' && saldo.disponibles === 1 ? '' : null}
    </span>
  )
}
