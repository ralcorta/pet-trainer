import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { DogAvatar } from '../components/DogAvatar'
import { SaldoBadge } from '../components/SaldoBadge'
import { softDeleteClase, updateClaseEstado } from '../data/repositories/clases'
import { createPago } from '../data/repositories/pagos'
import { useClases, usePagos, usePerro, useSaldo } from '../hooks/useLiveData'

export function FichaPage() {
  const { id } = useParams()
  const perro = usePerro(id)
  const saldo = useSaldo(id)
  const clases = useClases(id)
  const pagos = usePagos(id)
  const [showPago, setShowPago] = useState(false)
  const [cantidad, setCantidad] = useState(8)
  const [monto, setMonto] = useState('')
  const [saving, setSaving] = useState(false)

  if (!perro) {
    return (
      <div className="space-y-3">
        <Link to="/perros" className="text-sm font-bold text-sage-600">
          ← Perros
        </Link>
        <p className="text-ink-muted">Perro no encontrado.</p>
      </div>
    )
  }

  async function onPago(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await createPago({
        perroId: perro!.id,
        cantidad,
        monto: monto ? Number(monto) : null,
      })
      setShowPago(false)
      setCantidad(8)
      setMonto('')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5">
      <Link to="/perros" className="inline-block text-sm font-bold text-sage-600">
        ← Perros
      </Link>

      <header className="flex items-center gap-4">
        <DogAvatar nombre={perro.nombre} raza={perro.raza} size="lg" />
        <div className="min-w-0">
          <h1 className="font-display text-3xl font-extrabold leading-none">{perro.nombre}</h1>
          <p className="mt-1 text-sm font-semibold text-ink-muted">
            Dueño: {perro.dueno}
            {perro.raza ? ` · ${perro.raza}` : ''}
          </p>
          <div className="mt-2">
            <SaldoBadge saldo={saldo} />
          </div>
        </div>
      </header>

      {perro.telefono || perro.notas ? (
        <section className="rounded-2xl bg-cream px-4 py-3 text-sm shadow-sm">
          {perro.telefono ? <p><span className="font-bold">Tel:</span> {perro.telefono}</p> : null}
          {perro.notas ? <p className="mt-1 text-ink-muted">{perro.notas}</p> : null}
        </section>
      ) : null}

      <button
        type="button"
        onClick={() => setShowPago(true)}
        className="w-full rounded-2xl bg-sage-600 py-3.5 font-display text-base font-extrabold text-white shadow-sm"
      >
        Cargar pago (+N clases)
      </button>

      <section>
        <h2 className="mb-2 font-display text-lg font-extrabold">Pagos</h2>
        <ul className="space-y-2">
          {pagos.length === 0 ? (
            <li className="rounded-xl bg-cream/80 px-3 py-4 text-sm text-ink-muted">Sin pagos aún.</li>
          ) : (
            pagos.map((p) => (
              <li key={p.id} className="flex justify-between rounded-xl bg-cream px-3.5 py-2.5 text-sm shadow-sm">
                <span className="font-semibold">
                  {format(parseISO(p.fecha), "d MMM yyyy", { locale: es })}
                </span>
                <span className="font-extrabold text-sage-700">
                  +{p.cantidad} clases
                  {p.monto != null ? ` · $${p.monto}` : ''}
                </span>
              </li>
            ))
          )}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 font-display text-lg font-extrabold">Historial de clases</h2>
        <ul className="space-y-2">
          {clases.length === 0 ? (
            <li className="rounded-xl bg-cream/80 px-3 py-4 text-sm text-ink-muted">Sin clases registradas.</li>
          ) : (
            clases.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-cream px-3.5 py-2.5 text-sm shadow-sm"
              >
                <div>
                  <p className="font-semibold">
                    {format(parseISO(c.fecha), "EEE d MMM · HH:mm", { locale: es })}
                  </p>
                  <p
                    className={`text-xs font-extrabold ${
                      c.estado === 'completada'
                        ? 'text-sage-600'
                        : c.estado === 'cancelada' || c.estado === 'ausente'
                          ? 'text-terracotta'
                          : 'text-ink-muted'
                    }`}
                  >
                    {c.estado === 'completada'
                      ? 'Realizado'
                      : c.estado === 'cancelada' || c.estado === 'ausente'
                        ? 'Cancelado'
                        : c.estado}
                  </p>
                </div>
                <div className="flex gap-1">
                  {c.estado !== 'completada' ? (
                    <button
                      type="button"
                      className="rounded-lg bg-sage-200 px-2 py-1 text-xs font-bold"
                      onClick={() => updateClaseEstado(c.id, 'completada')}
                    >
                      → Realizado
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="rounded-lg bg-sage-200 px-2 py-1 text-xs font-bold"
                    onClick={() => softDeleteClase(c.id)}
                  >
                    Deshacer
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>

      {showPago ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <form onSubmit={onPago} className="w-full max-w-md space-y-3 rounded-3xl bg-cream p-5 shadow-xl">
            <h3 className="font-display text-xl font-extrabold">Cargar pago</h3>
            <label className="block text-sm font-bold">
              Cantidad de clases
              <input
                type="number"
                min={1}
                className="mt-1 w-full rounded-xl border border-sage-200 bg-white px-3 py-2.5"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value))}
                required
              />
            </label>
            <label className="block text-sm font-bold">
              Monto (opcional)
              <input
                type="number"
                min={0}
                step="0.01"
                className="mt-1 w-full rounded-xl border border-sage-200 bg-white px-3 py-2.5"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
            </label>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowPago(false)}
                className="flex-1 rounded-xl bg-sage-200 py-3 font-extrabold"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
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
