import { db, LOCAL_USER_ID } from '../db'
import { newId, nowIso } from '../ids'
import type { Clase, ClaseEstado } from '../types'
import { sameLocalDay } from '../../lib/format'

export async function listClasesByPerro(perroId: string, userId = LOCAL_USER_ID): Promise<Clase[]> {
  const rows = await db.clases
    .where('perroId')
    .equals(perroId)
    .filter((c) => c.userId === userId && c.deletedAt === null)
    .toArray()
  return rows.sort((a, b) => b.fecha.localeCompare(a.fecha))
}

export async function listAllClases(userId = LOCAL_USER_ID): Promise<Clase[]> {
  return db.clases.filter((c) => c.userId === userId && c.deletedAt === null).toArray()
}

export async function findClaseForTurnoDay(
  turnoId: string,
  fecha: Date,
  userId = LOCAL_USER_ID,
): Promise<Clase | undefined> {
  const rows = await db.clases
    .filter(
      (c) =>
        c.userId === userId &&
        c.deletedAt === null &&
        c.turnoId === turnoId &&
        sameLocalDay(c.fecha, fecha),
    )
    .toArray()
  return rows[0]
}

export async function marcarClase(params: {
  perroId: string
  turnoId: string | null
  fecha: Date
  estado: ClaseEstado
  userId?: string
}): Promise<Clase> {
  const userId = params.userId ?? LOCAL_USER_ID
  const fechaIso = params.fecha.toISOString()

  if (params.turnoId) {
    const existing = await findClaseForTurnoDay(params.turnoId, params.fecha, userId)
    if (existing) {
      const updated: Clase = {
        ...existing,
        estado: params.estado,
        fecha: fechaIso,
        updatedAt: nowIso(),
      }
      await db.clases.put(updated)
      return updated
    }
  }

  const clase: Clase = {
    id: newId(),
    userId,
    perroId: params.perroId,
    turnoId: params.turnoId,
    fecha: fechaIso,
    estado: params.estado,
    updatedAt: nowIso(),
    deletedAt: null,
  }
  await db.clases.add(clase)
  return clase
}

export async function softDeleteClase(id: string): Promise<void> {
  const existing = await db.clases.get(id)
  if (!existing || existing.deletedAt) return
  await db.clases.put({ ...existing, deletedAt: nowIso(), updatedAt: nowIso() })
}

/** Undo Realizado/Cancelado for a turno on a given day (restores pending state). */
export async function deshacerClase(params: {
  claseId?: string | null
  turnoId?: string | null
  fecha?: Date
}): Promise<void> {
  if (params.claseId) {
    await softDeleteClase(params.claseId)
    return
  }
  if (params.turnoId && params.fecha) {
    const existing = await findClaseForTurnoDay(params.turnoId, params.fecha)
    if (existing) await softDeleteClase(existing.id)
  }
}

export async function updateClaseEstado(id: string, estado: ClaseEstado): Promise<void> {
  const existing = await db.clases.get(id)
  if (!existing || existing.deletedAt) return
  await db.clases.put({ ...existing, estado, updatedAt: nowIso() })
}
