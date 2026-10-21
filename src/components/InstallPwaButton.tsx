import { useEffect, useState } from 'react'
import {
  canNativeInstall,
  isAppInstalled,
  isIosDevice,
  promptInstall,
  subscribeInstallState,
} from '../lib/pwaInstall'

export function InstallPwaButton() {
  const [, setTick] = useState(0)
  const [showIosHelp, setShowIosHelp] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => subscribeInstallState(() => setTick((n) => n + 1)), [])

  if (isAppInstalled()) {
    return (
      <p className="text-center text-sm font-bold text-sage-700">App instalada en este dispositivo</p>
    )
  }

  const native = canNativeInstall()
  const ios = isIosDevice()

  async function onInstall() {
    if (native) {
      setBusy(true)
      try {
        await promptInstall()
      } finally {
        setBusy(false)
      }
      return
    }
    if (ios) {
      setShowIosHelp(true)
      return
    }
    // Desktop browsers without prompt yet: still show guidance
    setShowIosHelp(true)
  }

  return (
    <div className="w-full max-w-sm space-y-3">
      <button
        type="button"
        disabled={busy}
        onClick={onInstall}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-sage-600 bg-cream px-6 py-3.5 font-display text-base font-extrabold text-sage-700 shadow-sm transition active:scale-[0.98] disabled:opacity-60"
      >
        <DownloadIcon />
        Descargar app
      </button>

      {showIosHelp ? (
        <div className="rounded-2xl bg-cream px-4 py-3 text-left text-sm font-semibold text-ink shadow-sm">
          {ios ? (
            <>
              <p className="font-extrabold text-ink">Para instalar en iPhone:</p>
              <ol className="mt-2 list-decimal space-y-1 pl-4 text-ink-muted">
                <li>Tocá el botón Compartir (□↑) en Safari</li>
                <li>Elegí “Agregar a pantalla de inicio”</li>
                <li>Confirmá con “Agregar”</li>
              </ol>
            </>
          ) : (
            <p className="text-ink-muted">
              Abrí esta página en Chrome o Edge del teléfono. Si el navegador lo permite, vas a ver el
              diálogo de instalación. También podés usar el menú del navegador → “Instalar app” /
              “Agregar a la pantalla de inicio”.
            </p>
          )}
          <button
            type="button"
            className="mt-3 text-sm font-extrabold text-sage-600"
            onClick={() => setShowIosHelp(false)}
          >
            Cerrar
          </button>
        </div>
      ) : null}
    </div>
  )
}

function DownloadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
      <path d="M12 3v12" strokeLinecap="round" />
      <path d="M7 11l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 19h16" strokeLinecap="round" />
    </svg>
  )
}
