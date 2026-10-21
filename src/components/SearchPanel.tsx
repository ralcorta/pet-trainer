import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { DogAvatar } from './DogAvatar'
import { SaldoBadge } from './SaldoBadge'
import { usePerros, useSaldos } from '../hooks/useLiveData'

type Props = {
  open: boolean
  onClose: () => void
}

/** Inline search that expands under the header — no overlay, no dimmed background. */
export function SearchPanel({ open, onClose }: Props) {
  const [q, setQ] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const perros = usePerros()
  const saldos = useSaldos()

  useEffect(() => {
    if (open) {
      setQ('')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }, [open])

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase()
    if (!needle) return perros
    return perros.filter(
      (p) =>
        p.nombre.toLowerCase().includes(needle) ||
        p.dueno.toLowerCase().includes(needle) ||
        p.raza.toLowerCase().includes(needle) ||
        p.telefono.includes(needle),
    )
  }, [perros, q])

  return (
    <div
      className={`grid transition-[grid-template-rows] duration-300 ease-out ${
        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
      }`}
      aria-hidden={!open}
    >
      <div className="min-h-0 overflow-hidden">
        <div className="rounded-2xl bg-cream shadow-sm">
          <div className="flex items-center gap-2 px-3.5 py-3">
            <SearchIcon />
            <input
              ref={inputRef}
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Perro, dueño, raza…"
              tabIndex={open ? 0 : -1}
              className="min-w-0 flex-1 bg-transparent text-base font-semibold outline-none placeholder:text-ink-muted"
            />
            <button
              type="button"
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              className="rounded-xl px-2 py-1 text-sm font-extrabold text-sage-600"
            >
              Cerrar
            </button>
          </div>

          <ul className="max-h-56 overflow-y-auto border-t border-sage-200/70 px-2 py-1.5">
            {results.length === 0 ? (
              <li className="px-2 py-5 text-center text-sm font-semibold text-ink-muted">
                Sin resultados
              </li>
            ) : (
              results.map((perro) => {
                const saldo = saldos.get(perro.id) ?? {
                  pagadas: 0,
                  completadas: 0,
                  disponibles: 0,
                }
                return (
                  <li key={perro.id}>
                    <Link
                      to={`/perros/${perro.id}`}
                      onClick={onClose}
                      tabIndex={open ? 0 : -1}
                      className="flex items-center gap-3 rounded-xl px-2 py-2 transition active:bg-sage-100"
                    >
                      <DogAvatar nombre={perro.nombre} raza={perro.raza} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="font-display font-extrabold leading-tight">{perro.nombre}</p>
                        <p className="truncate text-xs text-ink-muted">
                          {perro.dueno}
                          {perro.raza ? ` · ${perro.raza}` : ''}
                        </p>
                      </div>
                      <SaldoBadge saldo={saldo} compact />
                    </Link>
                  </li>
                )
              })
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      className="shrink-0 text-ink-muted"
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16.5 16.5L21 21" strokeLinecap="round" />
    </svg>
  )
}
