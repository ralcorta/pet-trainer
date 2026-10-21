import type { Clase, Pago, SaldoPerro } from './types'

export function calcularSaldo(pagos: Pago[], clases: Clase[]): SaldoPerro {
  const pagadas = pagos.reduce((sum, p) => sum + p.cantidad, 0)
  const completadas = clases.filter((c) => c.estado === 'completada').length
  return {
    pagadas,
    completadas,
    disponibles: pagadas - completadas,
  }
}

export function saldoLabel(saldo: SaldoPerro): {
  text: string
  tone: 'ok' | 'warn' | 'danger' | 'full'
} {
  const { disponibles, pagadas } = saldo
  if (disponibles <= 0) {
    return { text: `${disponibles} / ${pagadas} clases (¡Debe pago!)`, tone: 'danger' }
  }
  if (disponibles <= 2) {
    const ultima = disponibles === 1 ? ' (¡Última!)' : ''
    return { text: `${disponibles} / ${pagadas} clases${ultima}`, tone: 'warn' }
  }
  if (pagadas > 0 && disponibles === pagadas) {
    return { text: `${disponibles} / ${pagadas} clases`, tone: 'full' }
  }
  return { text: `${disponibles} / ${pagadas} clases`, tone: 'ok' }
}
