import Dexie, { type EntityTable } from 'dexie'
import type { Clase, Pago, Perro, Turno } from './types'

export const LOCAL_USER_ID = 'local'

export class PetTrainerDB extends Dexie {
  perros!: EntityTable<Perro, 'id'>
  pagos!: EntityTable<Pago, 'id'>
  turnos!: EntityTable<Turno, 'id'>
  clases!: EntityTable<Clase, 'id'>

  constructor() {
    super('pet-trainer')
    this.version(1).stores({
      perros: 'id, userId, deletedAt, nombre',
      pagos: 'id, userId, perroId, deletedAt, fecha',
      turnos: 'id, userId, perroId, deletedAt, inicio, recurrente, diaSemana',
      clases: 'id, userId, perroId, turnoId, deletedAt, fecha, estado',
    })
  }
}

export const db = new PetTrainerDB()
