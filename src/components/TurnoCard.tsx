import type { TurnoInstancia } from '../data/types'
import { formatDuracion, formatHora } from '../lib/format'
import { DogAvatar } from './DogAvatar'
import { SaldoBadge } from './SaldoBadge'

type Props = {
  item: TurnoInstancia
  onRealizado: () => void
  onCancelado: () => void
  onDeshacer: () => void
  busy?: boolean
}

export function TurnoCard({ item, onRealizado, onCancelado, onDeshacer, busy }: Props) {
  const { turno, perro, fecha, clase, saldo } = item
  const done = clase?.estado === 'completada'
  const cancelled = clase?.estado === 'cancelada' || clase?.estado === 'ausente'
  const marked = done || cancelled
  const meta = [
    formatDuracion(turno.duracionMin),
    turno.recurrente ? 'Recurrente' : null,
  ]
    .filter(Boolean)
    .join(' • ')

  return (
    <article className="rounded-2xl bg-cream p-3.5 shadow-[0_2px_12px_rgba(47,79,57,0.08)]">
      <div className="flex gap-3">
        <div className="flex w-14 shrink-0 flex-col items-center gap-1 pt-0.5">
          <span className="font-display text-sm font-extrabold text-sage-700">
            {formatHora(fecha)}
          </span>
          <DogAvatar nombre={perro.nombre} raza={perro.raza} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-extrabold text-ink leading-tight">
              {perro.nombre}
            </h3>
            {perro.raza ? (
              <span className="truncate text-xs font-semibold text-ink-muted">{perro.raza}</span>
            ) : null}
          </div>
          <p className="mt-0.5 text-sm text-ink-muted">Dueño: {perro.dueno}</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <SaldoBadge saldo={saldo} />
            <span className="text-xs font-semibold text-ink-muted">{meta}</span>
          </div>

          {marked ? (
            <div className="mt-3 flex items-center gap-2">
              <p
                className={`flex-1 text-sm font-bold ${done ? 'text-sage-600' : 'text-terracotta'}`}
              >
                {done ? '✓ Realizado' : '✕ Cancelado'}
              </p>
              <button
                type="button"
                disabled={busy}
                onClick={onDeshacer}
                className="rounded-xl bg-sage-200 px-3 py-2 text-sm font-extrabold text-ink transition active:scale-[0.98] disabled:opacity-60"
              >
                Deshacer
              </button>
            </div>
          ) : (
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={onRealizado}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-sage-600 px-3 py-2.5 text-sm font-extrabold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-60"
              >
                <span aria-hidden>✓</span> Realizado
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={onCancelado}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-terracotta px-3 py-2.5 text-sm font-extrabold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-60"
              >
                <span aria-hidden>✕</span> Cancelado
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
