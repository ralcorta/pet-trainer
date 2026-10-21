import { db, LOCAL_USER_ID } from '../db'
import { newId, nowIso } from '../ids'
import type { Perro } from '../types'

export type PerroInput = {
  nombre: string
  dueno: string
  telefono?: string
  raza?: string
  notas?: string
  fotoUrl?: string
}

function alive(userId = LOCAL_USER_ID) {
  return db.perros.filter((p) => p.userId === userId && p.deletedAt === null)
}

export async function listPerros(userId = LOCAL_USER_ID): Promise<Perro[]> {
  const rows = await alive(userId).toArray()
  return rows.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'))
}

export async function getPerro(id: string): Promise<Perro | undefined> {
  const p = await db.perros.get(id)
  if (!p || p.deletedAt) return undefined
  return p
}

export async function createPerro(input: PerroInput, userId = LOCAL_USER_ID): Promise<Perro> {
  const now = nowIso()
  const perro: Perro = {
    id: newId(),
    userId,
    nombre: input.nombre.trim(),
    dueno: input.dueno.trim(),
    telefono: input.telefono?.trim() ?? '',
    raza: input.raza?.trim() ?? '',
    notas: input.notas?.trim() ?? '',
    fotoUrl: input.fotoUrl?.trim() ?? '',
    updatedAt: now,
    deletedAt: null,
  }
  await db.perros.add(perro)
  return perro
}

export async function updatePerro(id: string, patch: Partial<PerroInput>): Promise<Perro | undefined> {
  const existing = await getPerro(id)
  if (!existing) return undefined
  const updated: Perro = {
    ...existing,
    ...Object.fromEntries(
      Object.entries(patch).map(([k, v]) => [k, typeof v === 'string' ? v.trim() : v]),
    ),
    updatedAt: nowIso(),
  }
  await db.perros.put(updated)
  return updated
}

export async function softDeletePerro(id: string): Promise<void> {
  const existing = await getPerro(id)
  if (!existing) return
  await db.perros.put({ ...existing, deletedAt: nowIso(), updatedAt: nowIso() })
}
