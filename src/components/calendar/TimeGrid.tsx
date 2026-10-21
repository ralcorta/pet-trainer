import { format, getHours, getMinutes, isSameDay, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Perro, Turno } from '../../data/types'
import { formatHora } from '../../lib/format'

export const GRID_START_HOUR = 7
export const GRID_END_HOUR = 21
export const PX_PER_HOUR = 56

export type GridEvent = {
  turno: Turno
  fecha: Date
  perro: Perro
}

const EVENT_COLORS = [
  'bg-sage-600/90 text-white border-sage-700',
  'bg-terracotta/90 text-white border-terracotta-dark',
  'bg-blue-badge/90 text-white border-blue-badge',
  'bg-amber-badge/90 text-white border-amber-badge',
  'bg-sage-500/90 text-white border-sage-700',
]

function colorFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i) * (i + 1)) % EVENT_COLORS.length
  return EVENT_COLORS[hash]
}

function minutesFromGridStart(date: Date): number {
  return (getHours(date) - GRID_START_HOUR) * 60 + getMinutes(date)
}

function eventStyle(fecha: Date, duracionMin: number) {
  const startMin = minutesFromGridStart(fecha)
  const top = (startMin / 60) * PX_PER_HOUR
  const height = Math.max((duracionMin / 60) * PX_PER_HOUR, 22)
  return { top, height }
}

const hours = Array.from({ length: GRID_END_HOUR - GRID_START_HOUR }, (_, i) => GRID_START_HOUR + i)

type Props = {
  days: Date[]
  eventsByDay: Map<string, GridEvent[]>
  selectedDay: Date
  onSelectDay: (day: Date) => void
  onSlotClick: (day: Date, hour: number) => void
  onEventClick: (event: GridEvent) => void
  compact?: boolean
}

function dayKey(d: Date) {
  return format(d, 'yyyy-MM-dd')
}

export function TimeGrid({
  days,
  eventsByDay,
  selectedDay,
  onSelectDay,
  onSlotClick,
  onEventClick,
  compact = false,
}: Props) {
  const gridHeight = (GRID_END_HOUR - GRID_START_HOUR) * PX_PER_HOUR
  const now = new Date()
  const showNow = days.some((d) => isSameDay(d, now))
  const nowTop =
    showNow && getHours(now) >= GRID_START_HOUR && getHours(now) < GRID_END_HOUR
      ? minutesFromGridStart(now) * (PX_PER_HOUR / 60)
      : null

  return (
    <div className="overflow-hidden rounded-2xl border border-sage-200/80 bg-cream shadow-sm">
      {/* Day headers */}
      <div
        className="grid border-b border-sage-200/80 bg-sage-50/80"
        style={{ gridTemplateColumns: `2.75rem repeat(${days.length}, minmax(0, 1fr))` }}
      >
        <div />
        {days.map((day) => {
          const active = isSameDay(day, selectedDay)
          const today = isToday(day)
          return (
            <button
              key={dayKey(day)}
              type="button"
              onClick={() => onSelectDay(day)}
              className={`flex flex-col items-center gap-0.5 py-2 transition ${
                active ? 'bg-sage-600/10' : ''
              }`}
            >
              <span
                className={`text-[10px] font-bold uppercase ${
                  today ? 'text-sage-600' : 'text-ink-muted'
                }`}
              >
                {format(day, compact ? 'EEEEE' : 'EEE', { locale: es })}
              </span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full font-display text-sm font-extrabold ${
                  today
                    ? 'bg-sage-600 text-white'
                    : active
                      ? 'bg-sage-200 text-sage-800'
                      : 'text-ink'
                }`}
              >
                {format(day, 'd')}
              </span>
            </button>
          )
        })}
      </div>

      {/* Scrollable time body */}
      <div className="max-h-[min(62dvh,560px)] overflow-auto overscroll-contain">
        <div
          className="relative grid"
          style={{
            gridTemplateColumns: `2.75rem repeat(${days.length}, minmax(0, 1fr))`,
            height: gridHeight,
          }}
        >
          {/* Hour labels + horizontal lines */}
          <div className="relative border-r border-sage-200/60">
            {hours.map((h) => (
              <div
                key={h}
                className="absolute right-1 -translate-y-1/2 text-[10px] font-bold text-ink-muted"
                style={{ top: (h - GRID_START_HOUR) * PX_PER_HOUR }}
              >
                {`${String(h).padStart(2, '0')}:00`}
              </div>
            ))}
          </div>

          {days.map((day) => {
            const key = dayKey(day)
            const events = eventsByDay.get(key) ?? []
            const isSelected = isSameDay(day, selectedDay)
            return (
              <div
                key={key}
                className={`relative border-r border-sage-200/50 last:border-r-0 ${
                  isSelected ? 'bg-sage-50/40' : ''
                }`}
              >
                {hours.map((h) => (
                  <button
                    key={h}
                    type="button"
                    aria-label={`Agendar ${format(day, 'd/M')} ${h}:00`}
                    className="absolute inset-x-0 w-full border-t border-sage-200/40 hover:bg-sage-200/30 active:bg-sage-300/40"
                    style={{ top: (h - GRID_START_HOUR) * PX_PER_HOUR, height: PX_PER_HOUR }}
                    onClick={() => {
                      onSelectDay(day)
                      onSlotClick(day, h)
                    }}
                  />
                ))}

                {nowTop != null && isSameDay(day, now) ? (
                  <div
                    className="pointer-events-none absolute inset-x-0 z-20 border-t-2 border-red-badge"
                    style={{ top: nowTop }}
                  >
                    <span className="absolute -left-1 -top-1.5 h-2.5 w-2.5 rounded-full bg-red-badge" />
                  </div>
                ) : null}

                {events.map((ev) => {
                  const { top, height } = eventStyle(ev.fecha, ev.turno.duracionMin)
                  // Clamp into visible grid
                  if (top + height < 0 || top > gridHeight) return null
                  const clampedTop = Math.max(0, top)
                  const clampedHeight = Math.min(height, gridHeight - clampedTop)
                  return (
                    <button
                      key={`${ev.turno.id}-${ev.fecha.toISOString()}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onSelectDay(day)
                        onEventClick(ev)
                      }}
                      className={`absolute inset-x-0.5 z-10 overflow-hidden rounded-md border-l-[3px] px-1 py-0.5 text-left shadow-sm transition active:scale-[0.98] ${colorFor(ev.perro.nombre)}`}
                      style={{ top: clampedTop, height: clampedHeight }}
                    >
                      <p className="truncate font-display text-[11px] font-extrabold leading-tight">
                        {ev.perro.nombre}
                      </p>
                      {!compact || days.length === 1 ? (
                        <p className="truncate text-[9px] font-semibold opacity-90">
                          {formatHora(ev.fecha)}
                        </p>
                      ) : null}
                    </button>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
