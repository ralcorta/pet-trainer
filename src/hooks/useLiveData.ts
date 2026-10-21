import { useLiveQuery } from 'dexie-react-hooks'
import { calcularSaldo } from '../data/saldo'
import { db, LOCAL_USER_ID } from '../data/db'
import type { Clase, Pago, Perro, SaldoPerro, Turno, TurnoInstancia } from '../data/types'
import { instanciasParaDia } from '../data/repositories/turnos'
import { sameLocalDay } from '../lib/format'

function aliveFilter<T extends { userId: string; deletedAt: string | null }>(rows: T[] | undefined) {
  return (rows ?? []).filter((r) => r.userId === LOCAL_USER_ID && r.deletedAt === null)
}

export function usePerros(): Perro[] {
  return (
    useLiveQuery(async () => {
      const rows = await db.perros.toArray()
      return aliveFilter(rows).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
    }, []) ?? []
  )
}

export function usePerro(id: string | undefined): Perro | undefined {
  return useLiveQuery(async () => {
    if (!id) return undefined
    const p = await db.perros.get(id)
    if (!p || p.deletedAt || p.userId !== LOCAL_USER_ID) return undefined
    return p
  }, [id])
}

export function usePagos(perroId?: string): Pago[] {
  return (
    useLiveQuery(async () => {
      const rows = await db.pagos.toArray()
      return aliveFilter(rows)
        .filter((p) => (perroId ? p.perroId === perroId : true))
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
    }, [perroId]) ?? []
  )
}

export function useClases(perroId?: string): Clase[] {
  return (
    useLiveQuery(async () => {
      const rows = await db.clases.toArray()
      return aliveFilter(rows)
        .filter((c) => (perroId ? c.perroId === perroId : true))
        .sort((a, b) => b.fecha.localeCompare(a.fecha))
    }, [perroId]) ?? []
  )
}

export function useTurnos(): Turno[] {
  return (
    useLiveQuery(async () => {
      const rows = await db.turnos.toArray()
      return aliveFilter(rows)
    }, []) ?? []
  )
}

export function useSaldos(): Map<string, SaldoPerro> {
  const pagos = usePagos()
  const clases = useClases()
  const map = new Map<string, SaldoPerro>()
  const perroIds = new Set([...pagos.map((p) => p.perroId), ...clases.map((c) => c.perroId)])
  for (const id of perroIds) {
    map.set(
      id,
      calcularSaldo(
        pagos.filter((p) => p.perroId === id),
        clases.filter((c) => c.perroId === id),
      ),
    )
  }
  return map
}

export function useSaldo(perroId: string | undefined): SaldoPerro {
  const pagos = usePagos(perroId)
  const clases = useClases(perroId)
  return calcularSaldo(pagos, clases)
}

export function useHoy(day: Date = new Date()): TurnoInstancia[] {
  const turnos = useTurnos()
  const perros = usePerros()
  const clases = useClases()
  const saldos = useSaldos()
  const perroMap = new Map(perros.map((p) => [p.id, p]))

  const instancias = instanciasParaDia(turnos, day)
  return instancias
    .map(({ turno, fecha }) => {
      const perro = perroMap.get(turno.perroId)
      if (!perro) return null
      const clase =
        clases.find(
          (c) => c.turnoId === turno.id && sameLocalDay(c.fecha, fecha),
        ) ?? null
      return {
        turno,
        perro,
        fecha,
        clase,
        saldo: saldos.get(perro.id) ?? { pagadas: 0, completadas: 0, disponibles: 0 },
      }
    })
    .filter((x): x is TurnoInstancia => x !== null)
}
