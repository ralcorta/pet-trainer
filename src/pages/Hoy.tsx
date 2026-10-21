import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SearchPanel } from '../components/SearchPanel'
import { TurnoCard } from '../components/TurnoCard'
import { deshacerClase, marcarClase } from '../data/repositories/clases'
import type { ClaseEstado } from '../data/types'
import { useHoy } from '../hooks/useLiveData'
import { formatFechaLarga } from '../lib/format'

export function HoyPage() {
  const today = new Date()
  const items = useHoy(today)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [searchOpen, setSearchOpen] = useState(false)

  const marked = items.filter((i) => i.clase).length
  const progress = items.length === 0 ? 0 : marked / items.length

  async function handle(
    itemKey: string,
    perroId: string,
    turnoId: string,
    fecha: Date,
    estado: ClaseEstado,
  ) {
    setBusyId(itemKey)
    try {
      await marcarClase({ perroId, turnoId, fecha, estado })
    } catch (err) {
      console.error('No se pudo marcar la clase', err)
    } finally {
      setBusyId(null)
    }
  }

  async function handleDeshacer(itemKey: string, claseId: string | undefined, turnoId: string, fecha: Date) {
    setBusyId(itemKey)
    try {
      await deshacerClase({ claseId, turnoId, fecha })
    } catch (err) {
      console.error('No se pudo deshacer', err)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink">Hoy</h1>
            <PawMark />
          </div>
          <p className="mt-0.5 text-sm font-semibold text-ink-muted">{formatFechaLarga(today)}</p>
        </div>
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className={`flex h-10 w-10 items-center justify-center rounded-full shadow-sm transition active:scale-95 ${
              searchOpen ? 'bg-sage-600 text-white' : 'bg-cream text-ink-muted'
            }`}
            aria-label="Buscar"
            aria-expanded={searchOpen}
          >
            <SearchIcon />
          </button>
          <Link
            to="/"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-sage-600 font-display text-sm font-extrabold text-white shadow-sm"
            aria-label="Ir al inicio"
            title="Inicio"
          >
            PT
          </Link>
        </div>
      </header>

      <SearchPanel open={searchOpen} onClose={() => setSearchOpen(false)} />

      <section>
        <p className="text-sm font-bold text-ink">
          {items.length === 0
            ? 'Sin turnos para hoy'
            : `${items.length} turno${items.length === 1 ? '' : 's'} programado${items.length === 1 ? '' : 's'} para hoy`}
        </p>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-sage-200">
          <div
            className="h-full rounded-full bg-sage-600 transition-all duration-500 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </section>

      <section className="space-y-3">
        {items.map((item) => {
          const key = `${item.turno.id}-${item.fecha.toISOString()}`
          return (
            <TurnoCard
              key={key}
              item={item}
              busy={busyId === key}
              onRealizado={() =>
                handle(key, item.perro.id, item.turno.id, item.fecha, 'completada')
              }
              onCancelado={() =>
                handle(key, item.perro.id, item.turno.id, item.fecha, 'cancelada')
              }
              onDeshacer={() =>
                handleDeshacer(key, item.clase?.id, item.turno.id, item.fecha)
              }
            />
          )
        })}
        {items.length === 0 ? (
          <div className="rounded-2xl bg-cream/80 px-4 py-10 text-center text-sm font-semibold text-ink-muted">
            Agregá turnos desde Calendario.
          </div>
        ) : null}
      </section>
    </div>
  )
}

function PawMark() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" className="text-sage-600" fill="currentColor">
      <ellipse cx="8.5" cy="7" rx="2.2" ry="2.8" />
      <ellipse cx="15.5" cy="7" rx="2.2" ry="2.8" />
      <ellipse cx="5.5" cy="12.5" rx="2" ry="2.5" />
      <ellipse cx="18.5" cy="12.5" rx="2" ry="2.5" />
      <path d="M12 13c-3 0-5 2.2-5 4.5 0 1.5 1.2 2.5 5 2.5s5-1 5-2.5C17 15.2 15 13 12 13z" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16.5 16.5L21 21" strokeLinecap="round" />
    </svg>
  )
}
