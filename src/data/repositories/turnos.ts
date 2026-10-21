import {
  addDays,
  formatISO,
  getDay,
  isSameDay,
  setHours,
  setMinutes,
  setSeconds,
  startOfDay,
  startOfWeek,
} from 'date-fns'
import { db, LOCAL_USER_ID } from '../db'
import { newId, nowIso } from '../ids'
import type { Turno } from '../types'

export type TurnoInput = {
  perroId: string
  inicio: Date
  duracionMin: number
  recurrente: boolean
}

export async function listTurnos(userId = LOCAL_USER_ID): Promise<Turno[]> {
  return db.turnos.filter((t) => t.userId === userId && t.deletedAt === null).toArray()
}

export async function createTurno(input: TurnoInput, userId = LOCAL_USER_ID): Promise<Turno> {
  const now = nowIso()
  const turno: Turno = {
    id: newId(),
    userId,
    perroId: input.perroId,
    inicio: input.inicio.toISOString(),
    duracionMin: input.duracionMin,
    recurrente: input.recurrente,
    diaSemana: input.recurrente ? getDay(input.inicio) : null,
    updatedAt: now,
    deletedAt: null,
  }
  await db.turnos.add(turno)
  return turno
}

export async function softDeleteTurno(id: string): Promise<void> {
  const existing = await db.turnos.get(id)
  if (!existing || existing.deletedAt) return
  await db.turnos.put({ ...existing, deletedAt: nowIso(), updatedAt: nowIso() })
}

/** Materialize concrete occurrences for a calendar day from turno definitions. */
export function instanciasParaDia(turnos: Turno[], day: Date): { turno: Turno; fecha: Date }[] {
  const dayStart = startOfDay(day)
  const result: { turno: Turno; fecha: Date }[] = []

  for (const turno of turnos) {
    const inicio = new Date(turno.inicio)

    if (turno.recurrente && turno.diaSemana !== null) {
      if (getDay(dayStart) !== turno.diaSemana) continue
      // Don't show recurring instances before the series started
      if (dayStart < startOfDay(inicio)) continue
      const fecha = setSeconds(
        setMinutes(setHours(dayStart, inicio.getHours()), inicio.getMinutes()),
        0,
      )
      result.push({ turno, fecha })
    } else if (isSameDay(inicio, dayStart)) {
      result.push({ turno, fecha: inicio })
    }
  }

  return result.sort((a, b) => a.fecha.getTime() - b.fecha.getTime())
}

export function diasDeLaSemana(anchor: Date): Date[] {
  const start = startOfWeek(anchor, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

export function isoDayKey(date: Date): string {
  return formatISO(date, { representation: 'date' })
}
