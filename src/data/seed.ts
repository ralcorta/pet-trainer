import { db } from './db'

/** Open the local DB. Never wipes data on load. */
export async function prepareDatabase(): Promise<void> {
  await db.open()
}

/** Explicit wipe only (e.g. after a confirmed user action). */
export async function resetLocalDatabase(): Promise<void> {
  await db.transaction('rw', db.perros, db.pagos, db.turnos, db.clases, async () => {
    await Promise.all([
      db.perros.clear(),
      db.pagos.clear(),
      db.turnos.clear(),
      db.clases.clear(),
    ])
  })
  localStorage.removeItem('pet-trainer-seeded-v1')
  localStorage.removeItem('pet-trainer-seeded-v2')
  localStorage.removeItem('pet-trainer-clean-v1')
}
