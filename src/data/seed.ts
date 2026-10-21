import { db } from './db'

const CLEAN_KEY = 'pet-trainer-clean-v1'

/** Open DB and wipe once so the app starts empty (no demo data). */
export async function prepareDatabase(): Promise<void> {
  await db.open()

  if (localStorage.getItem(CLEAN_KEY) === '1') return

  await resetLocalDatabase()
  localStorage.setItem(CLEAN_KEY, '1')
}

/** Clear all local tables and old seed flags. */
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
}
