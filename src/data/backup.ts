import JSZip from 'jszip'
import { db } from './db'
import type { Clase, Pago, Perro, Turno } from './types'

export type BackupPayload = {
  version: 1
  exportedAt: string
  perros: Perro[]
  pagos: Pago[]
  turnos: Turno[]
  clases: Clase[]
}

const PERRO_COLS = [
  'id',
  'userId',
  'nombre',
  'dueno',
  'telefono',
  'raza',
  'notas',
  'fotoUrl',
  'updatedAt',
  'deletedAt',
] as const

const PAGO_COLS = ['id', 'userId', 'perroId', 'fecha', 'cantidad', 'monto', 'updatedAt', 'deletedAt'] as const

const TURNO_COLS = [
  'id',
  'userId',
  'perroId',
  'inicio',
  'duracionMin',
  'recurrente',
  'diaSemana',
  'updatedAt',
  'deletedAt',
] as const

const CLASE_COLS = [
  'id',
  'userId',
  'perroId',
  'turnoId',
  'fecha',
  'estado',
  'updatedAt',
  'deletedAt',
] as const

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function rowsToCsv(columns: readonly string[], rows: Record<string, unknown>[]): string {
  const header = columns.join(',')
  const lines = rows.map((row) => columns.map((col) => escapeCsv(row[col])).join(','))
  return [header, ...lines].join('\n')
}

function parseCsv(text: string): Record<string, string>[] {
  const normalized = text.replace(/^\uFEFF/, '').trim()
  if (!normalized) return []

  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i]
    const next = normalized[i + 1]

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        cell += '"'
        i++
      } else if (ch === '"') {
        inQuotes = false
      } else {
        cell += ch
      }
      continue
    }

    if (ch === '"') {
      inQuotes = true
    } else if (ch === ',') {
      row.push(cell)
      cell = ''
    } else if (ch === '\n') {
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else if (ch === '\r') {
      // skip
    } else {
      cell += ch
    }
  }
  row.push(cell)
  if (row.length > 1 || row[0] !== '') rows.push(row)

  const [header, ...body] = rows
  if (!header) return []
  return body.map((cols) => {
    const obj: Record<string, string> = {}
    header.forEach((key, idx) => {
      obj[key] = cols[idx] ?? ''
    })
    return obj
  })
}

function emptyToNull(v: string): string | null {
  return v === '' ? null : v
}

function toBool(v: string): boolean {
  return v === 'true' || v === '1'
}

function toNumber(v: string): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function toNumberOrNull(v: string): number | null {
  if (v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

async function collectPayload(): Promise<BackupPayload> {
  const [perros, pagos, turnos, clases] = await Promise.all([
    db.perros.toArray(),
    db.pagos.toArray(),
    db.turnos.toArray(),
    db.clases.toArray(),
  ])
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    perros,
    pagos,
    turnos,
    clases,
  }
}

function stamp(): string {
  return new Date().toISOString().slice(0, 10)
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Download a ZIP with one CSV per table + backup.json (for safe restore). */
export async function downloadCsvBackup(): Promise<void> {
  const data = await collectPayload()
  const zip = new JSZip()

  zip.file(
    'perros.csv',
    rowsToCsv(PERRO_COLS, data.perros as unknown as Record<string, unknown>[]),
  )
  zip.file(
    'pagos.csv',
    rowsToCsv(PAGO_COLS, data.pagos as unknown as Record<string, unknown>[]),
  )
  zip.file(
    'turnos.csv',
    rowsToCsv(TURNO_COLS, data.turnos as unknown as Record<string, unknown>[]),
  )
  zip.file(
    'clases.csv',
    rowsToCsv(CLASE_COLS, data.clases as unknown as Record<string, unknown>[]),
  )
  zip.file('backup.json', JSON.stringify(data, null, 2))

  const blob = await zip.generateAsync({ type: 'blob' })
  downloadBlob(blob, `pet-trainer-backup-${stamp()}.zip`)
}

export async function downloadJsonBackup(): Promise<void> {
  const data = await collectPayload()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  downloadBlob(blob, `pet-trainer-backup-${stamp()}.json`)
}

function parsePerros(rows: Record<string, string>[]): Perro[] {
  return rows.map((r) => ({
    id: r.id,
    userId: r.userId || 'local',
    nombre: r.nombre ?? '',
    dueno: r.dueno ?? '',
    telefono: r.telefono ?? '',
    raza: r.raza ?? '',
    notas: r.notas ?? '',
    fotoUrl: r.fotoUrl ?? '',
    updatedAt: r.updatedAt || new Date().toISOString(),
    deletedAt: emptyToNull(r.deletedAt ?? ''),
  }))
}

function parsePagos(rows: Record<string, string>[]): Pago[] {
  return rows.map((r) => ({
    id: r.id,
    userId: r.userId || 'local',
    perroId: r.perroId,
    fecha: r.fecha,
    cantidad: toNumber(r.cantidad),
    monto: toNumberOrNull(r.monto ?? ''),
    updatedAt: r.updatedAt || new Date().toISOString(),
    deletedAt: emptyToNull(r.deletedAt ?? ''),
  }))
}

function parseTurnos(rows: Record<string, string>[]): Turno[] {
  return rows.map((r) => ({
    id: r.id,
    userId: r.userId || 'local',
    perroId: r.perroId,
    inicio: r.inicio,
    duracionMin: toNumber(r.duracionMin),
    recurrente: toBool(r.recurrente),
    diaSemana: r.diaSemana === '' ? null : toNumber(r.diaSemana),
    updatedAt: r.updatedAt || new Date().toISOString(),
    deletedAt: emptyToNull(r.deletedAt ?? ''),
  }))
}

function parseClases(rows: Record<string, string>[]): Clase[] {
  return rows.map((r) => ({
    id: r.id,
    userId: r.userId || 'local',
    perroId: r.perroId,
    turnoId: emptyToNull(r.turnoId ?? ''),
    fecha: r.fecha,
    estado: (r.estado as Clase['estado']) || 'completada',
    updatedAt: r.updatedAt || new Date().toISOString(),
    deletedAt: emptyToNull(r.deletedAt ?? ''),
  }))
}

async function replaceAll(data: BackupPayload): Promise<void> {
  await db.transaction('rw', db.perros, db.pagos, db.turnos, db.clases, async () => {
    await Promise.all([
      db.perros.clear(),
      db.pagos.clear(),
      db.turnos.clear(),
      db.clases.clear(),
    ])
    if (data.perros.length) await db.perros.bulkAdd(data.perros)
    if (data.pagos.length) await db.pagos.bulkAdd(data.pagos)
    if (data.turnos.length) await db.turnos.bulkAdd(data.turnos)
    if (data.clases.length) await db.clases.bulkAdd(data.clases)
  })
}

function isBackupPayload(value: unknown): value is BackupPayload {
  if (!value || typeof value !== 'object') return false
  const v = value as BackupPayload
  return (
    Array.isArray(v.perros) &&
    Array.isArray(v.pagos) &&
    Array.isArray(v.turnos) &&
    Array.isArray(v.clases)
  )
}

async function importFromZip(file: File): Promise<BackupPayload> {
  const zip = await JSZip.loadAsync(file)

  const jsonFile = zip.file('backup.json')
  if (jsonFile) {
    const text = await jsonFile.async('text')
    const parsed = JSON.parse(text) as unknown
    if (isBackupPayload(parsed)) return parsed
  }

  const perrosFile = zip.file('perros.csv')
  const pagosFile = zip.file('pagos.csv')
  const turnosFile = zip.file('turnos.csv')
  const clasesFile = zip.file('clases.csv')

  if (!perrosFile) {
    throw new Error('El ZIP no contiene perros.csv ni backup.json')
  }

  const [perrosCsv, pagosCsv, turnosCsv, clasesCsv] = await Promise.all([
    perrosFile.async('text'),
    pagosFile ? pagosFile.async('text') : Promise.resolve(''),
    turnosFile ? turnosFile.async('text') : Promise.resolve(''),
    clasesFile ? clasesFile.async('text') : Promise.resolve(''),
  ])

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    perros: parsePerros(parseCsv(perrosCsv)),
    pagos: parsePagos(parseCsv(pagosCsv)),
    turnos: parseTurnos(parseCsv(turnosCsv)),
    clases: parseClases(parseCsv(clasesCsv)),
  }
}

async function importFromJson(file: File): Promise<BackupPayload> {
  const text = await file.text()
  const parsed = JSON.parse(text) as unknown
  if (!isBackupPayload(parsed)) {
    throw new Error('JSON inválido: faltan tablas perros/pagos/turnos/clases')
  }
  return parsed
}

/** Replace local DB with data from a .zip (CSVs) or .json backup. */
export async function importBackupFile(file: File): Promise<{
  perros: number
  pagos: number
  turnos: number
  clases: number
}> {
  const name = file.name.toLowerCase()
  let data: BackupPayload

  if (name.endsWith('.zip')) {
    data = await importFromZip(file)
  } else if (name.endsWith('.json')) {
    data = await importFromJson(file)
  } else {
    throw new Error('Usá un archivo .zip (CSV) o .json de respaldo')
  }

  await replaceAll(data)
  return {
    perros: data.perros.length,
    pagos: data.pagos.length,
    turnos: data.turnos.length,
    clases: data.clases.length,
  }
}
