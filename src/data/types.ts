export type ClaseEstado = 'completada' | 'ausente' | 'cancelada'

export interface SyncFields {
  id: string
  userId: string
  updatedAt: string
  deletedAt: string | null
}

export interface Perro extends SyncFields {
  nombre: string
  dueno: string
  telefono: string
  raza: string
  notas: string
  fotoUrl: string
}

export interface Pago extends SyncFields {
  perroId: string
  fecha: string
  cantidad: number
  monto: number | null
}

export interface Turno extends SyncFields {
  perroId: string
  /** ISO datetime of first occurrence (or the only occurrence if not recurring) */
  inicio: string
  duracionMin: number
  recurrente: boolean
  /** 0=Sunday … 6=Saturday; only used when recurrente */
  diaSemana: number | null
}

export interface Clase extends SyncFields {
  perroId: string
  turnoId: string | null
  /** ISO datetime of the session */
  fecha: string
  estado: ClaseEstado
}

export interface SaldoPerro {
  pagadas: number
  completadas: number
  disponibles: number
}

export interface TurnoInstancia {
  turno: Turno
  perro: Perro
  /** Concrete occurrence datetime for this day */
  fecha: Date
  clase: Clase | null
  saldo: SaldoPerro
}
