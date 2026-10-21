import { addDays, addWeeks, format, isSameDay, setHours, setMinutes } from 'date-fns'
import { es } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import { TimeGrid, type GridEvent } from '../components/calendar/TimeGrid'
import { deshacerClase, marcarClase } from '../data/repositories/clases'
import { createTurno, diasDeLaSemana, instanciasParaDia } from '../data/repositories/turnos'
import { useClases, usePerros, useTurnos } from '../hooks/useLiveData'
import { formatDuracion, formatHora, sameLocalDay } from '../lib/format'

type Vista = 'semana' | 'dia' | 'lista'

export function CalendarioPage() {
  const [vista, setVista] = useState<Vista>('semana')
  const [anchor, setAnchor] = useState(() => new Date())
  const days = useMemo(() => diasDeLaSemana(anchor), [anchor])
  const [selectedDay, setSelectedDay] = useState(() => new Date())
  const turnos = useTurnos()
  const perros = usePerros()
  const clases = useClases()
  const perroMap = useMemo(() => new Map(perros.map((p) => [p.id, p])), [perros])

  const dayInstancias = instanciasParaDia(turnos, selectedDay)

  function claseDe(turnoId: string, fecha: Date) {
    return clases.find((c) => c.turnoId === turnoId && sameLocalDay(c.fecha, fecha))
  }

  const eventsByDay = useMemo(() => {
    const map = new Map<string, GridEvent[]>()
    const scope = vista === 'dia' ? [selectedDay] : days
    for (const day of scope) {
      const key = format(day, 'yyyy-MM-dd')
      const list: GridEvent[] = []
      for (const { turno, fecha } of instanciasParaDia(turnos, day)) {
        const perro = perroMap.get(turno.perroId)
        if (perro) list.push({ turno, fecha, perro })
      }
      map.set(key, list)
    }
    return map
  }, [days, perroMap, selectedDay, turnos, vista])

  const [showForm, setShowForm] = useState(false)
  const [perroId, setPerroId] = useState('')
  const [hora, setHora] = useState('10:00')
  const [duracionMin, setDuracionMin] = useState(60)
  const [recurrente, setRecurrente] = useState(true)
  const [saving, setSaving] = useState(false)

  const [selectedEvent, setSelectedEvent] = useState<GridEvent | null>(null)

  function openForm(day: Date, hour?: number, minute = 0) {
    setSelectedDay(day)
    if (hour != null) {
      setHora(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
    }
    setPerroId(perros[0]?.id ?? '')
    setShowForm(true)
  }

  function shiftWeek(delta: number) {
    const nextSelected = addWeeks(selectedDay, delta)
    setSelectedDay(nextSelected)
    setAnchor(nextSelected)
  }

  function goPrev() {
    if (vista === 'dia') {
      const prev = addDays(selectedDay, -1)
      setSelectedDay(prev)
      setAnchor(prev)
    } else {
      shiftWeek(-1)
    }
  }

  function goNext() {
    if (vista === 'dia') {
      const next = addDays(selectedDay, 1)
      setSelectedDay(next)
      setAnchor(next)
    } else {
      shiftWeek(1)
    }
  }

  function goToday() {
    const t = new Date()
    setSelectedDay(t)
    setAnchor(t)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!perroId) return
    setSaving(true)
    try {
      const [h, m] = hora.split(':').map(Number)
      const inicio = setMinutes(setHours(selectedDay, h), m)
      await createTurno({ perroId, inicio, duracionMin, recurrente })
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  const rangeLabel =
    vista === 'dia'
      ? format(selectedDay, "EEEE d 'de' MMMM", { locale: es })
      : `${format(days[0], 'd MMM', { locale: es })} – ${format(days[6], 'd MMM yyyy', { locale: es })}`

  return (
    <div className="space-y-3">
      <header className="flex items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">Calendario</h1>
          <p className="mt-0.5 text-sm font-semibold capitalize text-ink-muted">{rangeLabel}</p>
        </div>
        <div className="flex items-center gap-1 pt-1">
          <button
            type="button"
            className="rounded-xl bg-cream px-2.5 py-2 text-sm font-bold text-ink shadow-sm"
            onClick={goPrev}
            aria-label="Anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="rounded-xl bg-cream px-2.5 py-2 text-xs font-extrabold text-sage-700 shadow-sm"
            onClick={goToday}
          >
            Hoy
          </button>
          <button
            type="button"
            className="rounded-xl bg-cream px-2.5 py-2 text-sm font-bold text-ink shadow-sm"
            onClick={goNext}
            aria-label="Siguiente"
          >
            ›
          </button>
        </div>
      </header>

      {/* View switcher */}
      <div className="flex rounded-2xl bg-cream p-1 shadow-sm">
        {(
          [
            { id: 'semana', label: 'Semana' },
            { id: 'dia', label: 'Día' },
            { id: 'lista', label: 'Lista' },
          ] as const
        ).map(({ id, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setVista(id)}
            className={`flex-1 rounded-xl py-2 text-sm font-extrabold transition ${
              vista === id ? 'bg-sage-600 text-white shadow-sm' : 'text-ink-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {(vista === 'semana' || vista === 'dia') && (
        <TimeGrid
          days={vista === 'dia' ? [selectedDay] : days}
          eventsByDay={eventsByDay}
          selectedDay={selectedDay}
          onSelectDay={setSelectedDay}
          onSlotClick={(day, hour) => openForm(day, hour)}
          onEventClick={setSelectedEvent}
          compact={vista === 'semana'}
        />
      )}

      {vista === 'lista' && (
        <>
          <div className="flex items-center gap-2 rounded-2xl bg-cream p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => shiftWeek(-1)}
              className="rounded-xl px-3 py-2.5 text-sm font-extrabold text-ink transition active:bg-sage-100"
              aria-label="Semana anterior"
            >
              ‹ Semana
            </button>
            <p className="min-w-0 flex-1 text-center text-xs font-extrabold capitalize text-sage-700">
              {format(days[0], 'd MMM', { locale: es })} – {format(days[6], 'd MMM', { locale: es })}
            </p>
            <button
              type="button"
              onClick={() => shiftWeek(1)}
              className="rounded-xl px-3 py-2.5 text-sm font-extrabold text-ink transition active:bg-sage-100"
              aria-label="Semana siguiente"
            >
              Semana ›
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {days.map((day) => {
              const active = isSameDay(day, selectedDay)
              const count = instanciasParaDia(turnos, day).length
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => {
                    setSelectedDay(day)
                    setAnchor(day)
                  }}
                  className={`flex flex-col items-center rounded-2xl px-1 py-2.5 transition ${
                    active ? 'bg-sage-600 text-white shadow-md' : 'bg-cream text-ink'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase opacity-80">
                    {format(day, 'EEE', { locale: es })}
                  </span>
                  <span className="font-display text-lg font-extrabold leading-none">
                    {format(day, 'd')}
                  </span>
                  {count > 0 ? (
                    <span
                      className={`mt-1 h-1.5 w-1.5 rounded-full ${active ? 'bg-white' : 'bg-sage-500'}`}
                    />
                  ) : (
                    <span className="mt-1 h-1.5 w-1.5" />
                  )}
                </button>
              )
            })}
          </div>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold capitalize">
                {format(selectedDay, 'EEEE d', { locale: es })}
              </h2>
              <button
                type="button"
                onClick={() => openForm(selectedDay)}
                className="rounded-xl bg-sage-600 px-3 py-2 text-sm font-extrabold text-white"
              >
                + Turno
              </button>
            </div>

            {dayInstancias.length === 0 ? (
              <button
                type="button"
                onClick={() => openForm(selectedDay)}
                className="w-full rounded-2xl border-2 border-dashed border-sage-300 bg-cream/50 px-4 py-8 text-sm font-bold text-ink-muted"
              >
                Hueco libre — tocar para agendar
              </button>
            ) : (
              dayInstancias.map(({ turno, fecha }) => {
                const perro = perroMap.get(turno.perroId)
                if (!perro) return null
                const clase = claseDe(turno.id, fecha)
                const done = clase?.estado === 'completada'
                const cancelled = clase?.estado === 'cancelada' || clase?.estado === 'ausente'
                return (
                  <div
                    key={`${turno.id}-${fecha.toISOString()}`}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-cream px-3.5 py-3 shadow-sm"
                  >
                    <div>
                      <p className="font-display font-extrabold text-ink">
                        {formatHora(fecha)} · {perro.nombre}
                      </p>
                      <p className="text-xs font-semibold text-ink-muted">
                        {formatDuracion(turno.duracionMin)}
                        {turno.recurrente ? ' • Recurrente' : ''}
                        {done ? ' · Realizado' : cancelled ? ' · Cancelado' : ''}
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      {clase ? (
                        <button
                          type="button"
                          className="rounded-lg bg-sage-200 px-2.5 py-1.5 text-xs font-extrabold text-ink"
                          onClick={() => deshacerClase({ claseId: clase.id })}
                        >
                          Deshacer
                        </button>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="rounded-lg bg-sage-600 px-2.5 py-1.5 text-xs font-extrabold text-white"
                            onClick={() =>
                              marcarClase({
                                perroId: perro.id,
                                turnoId: turno.id,
                                fecha,
                                estado: 'completada',
                              })
                            }
                          >
                            Realizado
                          </button>
                          <button
                            type="button"
                            className="rounded-lg bg-terracotta px-2.5 py-1.5 text-xs font-extrabold text-white"
                            onClick={() =>
                              marcarClase({
                                perroId: perro.id,
                                turnoId: turno.id,
                                fecha,
                                estado: 'cancelada',
                              })
                            }
                          >
                            Cancelado
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </section>
        </>
      )}

      {(vista === 'semana' || vista === 'dia') && (
        <button
          type="button"
          onClick={() => openForm(selectedDay)}
          className="w-full rounded-2xl bg-sage-600 py-3 font-display text-sm font-extrabold text-white shadow-sm"
        >
          + Nuevo turno
        </button>
      )}

      {/* Event detail sheet */}
      {selectedEvent ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="w-full max-w-md space-y-3 rounded-3xl bg-cream p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-xl font-extrabold">{selectedEvent.perro.nombre}</h3>
            <p className="text-sm font-semibold text-ink-muted">
              {format(selectedEvent.fecha, "EEEE d MMM · HH:mm", { locale: es })}
              {' · '}
              {formatDuracion(selectedEvent.turno.duracionMin)}
              {selectedEvent.turno.recurrente ? ' · Recurrente' : ''}
            </p>
            <p className="text-sm text-ink-muted">Dueño: {selectedEvent.perro.dueno}</p>
            {(() => {
              const clase = claseDe(selectedEvent.turno.id, selectedEvent.fecha)
              if (clase) {
                return (
                  <div className="space-y-2 pt-1">
                    <p
                      className={`text-sm font-extrabold ${
                        clase.estado === 'completada' ? 'text-sage-600' : 'text-terracotta'
                      }`}
                    >
                      {clase.estado === 'completada' ? '✓ Realizado' : '✕ Cancelado'}
                    </p>
                    <button
                      type="button"
                      className="w-full rounded-xl bg-sage-200 py-3 font-extrabold"
                      onClick={async () => {
                        await deshacerClase({ claseId: clase.id })
                        setSelectedEvent(null)
                      }}
                    >
                      Deshacer
                    </button>
                  </div>
                )
              }
              return (
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    className="flex-1 rounded-xl bg-sage-600 py-3 font-extrabold text-white"
                    onClick={async () => {
                      await marcarClase({
                        perroId: selectedEvent.perro.id,
                        turnoId: selectedEvent.turno.id,
                        fecha: selectedEvent.fecha,
                        estado: 'completada',
                      })
                      setSelectedEvent(null)
                    }}
                  >
                    ✓ Realizado
                  </button>
                  <button
                    type="button"
                    className="flex-1 rounded-xl bg-terracotta py-3 font-extrabold text-white"
                    onClick={async () => {
                      await marcarClase({
                        perroId: selectedEvent.perro.id,
                        turnoId: selectedEvent.turno.id,
                        fecha: selectedEvent.fecha,
                        estado: 'cancelada',
                      })
                      setSelectedEvent(null)
                    }}
                  >
                    ✕ Cancelado
                  </button>
                </div>
              )
            })()}
            <button
              type="button"
              className="w-full rounded-xl bg-sage-200 py-3 font-extrabold"
              onClick={() => setSelectedEvent(null)}
            >
              Cerrar
            </button>
          </div>
        </div>
      ) : null}

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <form
            onSubmit={onSubmit}
            className="w-full max-w-md space-y-3 rounded-3xl bg-cream p-5 shadow-xl"
          >
            <h3 className="font-display text-xl font-extrabold">Nuevo turno</h3>
            <p className="text-sm font-semibold capitalize text-ink-muted">
              {format(selectedDay, "EEEE d MMM", { locale: es })}
            </p>
            <label className="block text-sm font-bold">
              Perro
              <select
                className="mt-1 w-full rounded-xl border border-sage-200 bg-white px-3 py-2.5"
                value={perroId}
                onChange={(e) => setPerroId(e.target.value)}
                required
              >
                <option value="" disabled>
                  Elegir…
                </option>
                {perros.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} ({p.dueno})
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-bold">
              Hora
              <input
                type="time"
                className="mt-1 w-full rounded-xl border border-sage-200 bg-white px-3 py-2.5"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                required
              />
            </label>
            <label className="block text-sm font-bold">
              Duración (min)
              <input
                type="number"
                min={15}
                step={15}
                className="mt-1 w-full rounded-xl border border-sage-200 bg-white px-3 py-2.5"
                value={duracionMin}
                onChange={(e) => setDuracionMin(Number(e.target.value))}
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-bold">
              <input
                type="checkbox"
                checked={recurrente}
                onChange={(e) => setRecurrente(e.target.checked)}
                className="size-4 accent-sage-600"
              />
              Repetir semanalmente
            </label>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 rounded-xl bg-sage-200 py-3 font-extrabold text-ink"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || !perroId}
                className="flex-1 rounded-xl bg-sage-600 py-3 font-extrabold text-white disabled:opacity-60"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}
