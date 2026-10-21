import { db, LOCAL_USER_ID } from '../db'
import { newId, nowIso } from '../ids'
import type { Pago } from '../types'

export type PagoInput = {
  perroId: string
  cantidad: number
  monto?: number | null
  fecha?: string
}

export async function listPagosByPerro(perroId: string, userId = LOCAL_USER_ID): Promise<Pago[]> {
  const rows = await db.pagos
    .where('perroId')
    .equals(perroId)
    .filter((p) => p.userId === userId && p.deletedAt === null)
    .toArray()
  return rows.sort((a, b) => b.fecha.localeCompare(a.fecha))
}

export async function listAllPagos(userId = LOCAL_USER_ID): Promise<Pago[]> {
  return db.pagos.filter((p) => p.userId === userId && p.deletedAt === null).toArray()
}

export async function createPago(input: PagoInput, userId = LOCAL_USER_ID): Promise<Pago> {
  const now = nowIso()
  const pago: Pago = {
    id: newId(),
    userId,
    perroId: input.perroId,
    cantidad: input.cantidad,
    monto: input.monto ?? null,
    fecha: input.fecha ?? now.slice(0, 10),
    updatedAt: now,
    deletedAt: null,
  }
  await db.pagos.add(pago)
  return pago
}

export async function softDeletePago(id: string): Promise<void> {
  const existing = await db.pagos.get(id)
  if (!existing || existing.deletedAt) return
  await db.pagos.put({ ...existing, deletedAt: nowIso(), updatedAt: nowIso() })
}
