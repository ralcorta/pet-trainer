import { useRef, useState } from 'react'
import { downloadCsvBackup, importBackupFile } from '../data/backup'

type Props = {
  compact?: boolean
}

export function BackupPanel({ compact = false }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onExport() {
    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      await downloadCsvBackup()
      setMessage('Respaldo descargado (ZIP con CSV).')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo exportar')
    } finally {
      setBusy(false)
    }
  }

  async function onPickFile(file: File | undefined) {
    if (!file) return
    const ok = window.confirm(
      'Esto reemplaza todos los datos actuales de la app por los del archivo. ¿Continuar?',
    )
    if (!ok) return

    setBusy(true)
    setError(null)
    setMessage(null)
    try {
      const counts = await importBackupFile(file)
      setMessage(
        `Importado: ${counts.perros} perros, ${counts.pagos} pagos, ${counts.turnos} turnos, ${counts.clases} clases.`,
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo importar')
    } finally {
      setBusy(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={compact ? 'space-y-2' : 'space-y-3 rounded-2xl bg-cream/90 p-4 shadow-sm'}>
      {!compact ? (
        <>
          <h2 className="font-display text-lg font-extrabold text-ink">Respaldo de datos</h2>
          <p className="text-sm font-semibold text-ink-muted">
            Descargá un ZIP con CSV (y un JSON de seguridad) para guardarlo o pasarlo a otro
            dispositivo. Al importar, se reemplaza toda la base local.
          </p>
        </>
      ) : null}

      <div className={`flex ${compact ? 'flex-col' : 'flex-col sm:flex-row'} gap-2`}>
        <button
          type="button"
          disabled={busy}
          onClick={onExport}
          className="flex-1 rounded-xl bg-sage-600 px-4 py-3 text-sm font-extrabold text-white disabled:opacity-60"
        >
          Descargar CSV (ZIP)
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
          className="flex-1 rounded-xl bg-sage-200 px-4 py-3 text-sm font-extrabold text-ink disabled:opacity-60"
        >
          Importar respaldo
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".zip,.json,application/zip,application/json"
          className="hidden"
          onChange={(e) => onPickFile(e.target.files?.[0])}
        />
      </div>

      {message ? <p className="text-sm font-bold text-sage-700">{message}</p> : null}
      {error ? <p className="text-sm font-bold text-red-badge">{error}</p> : null}
    </div>
  )
}
