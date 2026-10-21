import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatFechaLarga(date: Date): string {
  const raw = format(date, "EEEE d 'de' MMM, yyyy", { locale: es })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}

export function formatHora(date: Date): string {
  return format(date, 'HH:mm')
}

export function formatDuracion(min: number): string {
  if (min === 60) return '1 hora'
  if (min === 90) return '1.5 horas'
  return `${min} min`
}

export function formatDiaCorto(date: Date): string {
  return format(date, 'EEE d', { locale: es })
}

/** Calendar day in local timezone (avoids UTC ISO day-boundary bugs). */
export function localDayKey(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return format(d, 'yyyy-MM-dd')
}

export function sameLocalDay(a: Date | string, b: Date | string): boolean {
  return localDayKey(a) === localDayKey(b)
}
