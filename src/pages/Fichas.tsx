import { Link } from 'react-router-dom'
import { BackupPanel } from '../components/BackupPanel'
import { DogAvatar } from '../components/DogAvatar'
import { SaldoBadge } from '../components/SaldoBadge'
import { usePerros, useSaldos } from '../hooks/useLiveData'

export function FichasPage() {
  const perros = usePerros()
  const saldos = useSaldos()

  return (
    <div className="space-y-4">
      <header>
        <h1 className="font-display text-3xl font-extrabold text-ink">Fichas</h1>
        <p className="mt-1 text-sm font-semibold text-ink-muted">
          Abrí la ficha de un perro para historial y pagos.
        </p>
      </header>

      <ul className="space-y-2.5">
        {perros.map((perro) => {
          const saldo = saldos.get(perro.id) ?? { pagadas: 0, completadas: 0, disponibles: 0 }
          return (
            <li key={perro.id}>
              <Link
                to={`/perros/${perro.id}`}
                className="flex items-center gap-3 rounded-2xl bg-cream px-3.5 py-3 shadow-sm"
              >
                <DogAvatar nombre={perro.nombre} raza={perro.raza} />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-extrabold">{perro.nombre}</p>
                  <p className="text-sm text-ink-muted">{perro.dueno}</p>
                </div>
                <SaldoBadge saldo={saldo} compact />
              </Link>
            </li>
          )
        })}
      </ul>

      <BackupPanel />
    </div>
  )
}
