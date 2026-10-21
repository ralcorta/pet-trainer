import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DogAvatar } from '../components/DogAvatar'
import { SaldoBadge } from '../components/SaldoBadge'
import { createPerro } from '../data/repositories/perros'
import { usePerros, useSaldos } from '../hooks/useLiveData'

export function PerrosPage() {
  const perros = usePerros()
  const saldos = useSaldos()
  const [showForm, setShowForm] = useState(false)
  const [nombre, setNombre] = useState('')
  const [dueno, setDueno] = useState('')
  const [raza, setRaza] = useState('')
  const [telefono, setTelefono] = useState('')
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    try {
      await createPerro({ nombre, dueno, raza, telefono })
      setNombre('')
      setDueno('')
      setRaza('')
      setTelefono('')
      setShowForm(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold text-ink">Perros</h1>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="rounded-xl bg-sage-600 px-3 py-2 text-sm font-extrabold text-white"
        >
          + Nuevo
        </button>
      </header>

      <ul className="space-y-2.5">
        {perros.map((perro) => {
          const saldo = saldos.get(perro.id) ?? { pagadas: 0, completadas: 0, disponibles: 0 }
          return (
            <li key={perro.id}>
              <Link
                to={`/perros/${perro.id}`}
                className="flex items-center gap-3 rounded-2xl bg-cream px-3.5 py-3 shadow-sm transition active:scale-[0.99]"
              >
                <DogAvatar nombre={perro.nombre} raza={perro.raza} />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-extrabold leading-tight">{perro.nombre}</p>
                  <p className="truncate text-sm text-ink-muted">
                    {perro.dueno}
                    {perro.raza ? ` · ${perro.raza}` : ''}
                  </p>
                </div>
                <SaldoBadge saldo={saldo} compact />
              </Link>
            </li>
          )
        })}
      </ul>

      {showForm ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 sm:items-center">
          <form onSubmit={onSubmit} className="w-full max-w-md space-y-3 rounded-3xl bg-cream p-5 shadow-xl">
            <h3 className="font-display text-xl font-extrabold">Nuevo perro</h3>
            <Field label="Nombre" value={nombre} onChange={setNombre} required />
            <Field label="Dueño" value={dueno} onChange={setDueno} required />
            <Field label="Raza" value={raza} onChange={setRaza} />
            <Field label="Teléfono" value={telefono} onChange={setTelefono} />
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
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

function Field({
  label,
  value,
  onChange,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <label className="block text-sm font-bold">
      {label}
      <input
        className="mt-1 w-full rounded-xl border border-sage-200 bg-white px-3 py-2.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    </label>
  )
}
