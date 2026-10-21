type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Listener = () => void

let deferred: BeforeInstallPromptEvent | null = null
let installed = false
const listeners = new Set<Listener>()

function notify() {
  listeners.forEach((l) => l())
}

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    ('standalone' in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone))
  )
}

export function isIosDevice(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

export function isAppInstalled(): boolean {
  return installed || isStandalone()
}

export function canNativeInstall(): boolean {
  return deferred != null && !isAppInstalled()
}

export function subscribeInstallState(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  if (!deferred) return 'unavailable'
  const event = deferred
  deferred = null
  notify()
  await event.prompt()
  const { outcome } = await event.userChoice
  if (outcome === 'accepted') {
    installed = true
    notify()
  }
  return outcome
}

let listenersReady = false

/** Call once at app boot, before React mounts if possible. */
export function initPwaInstallListeners() {
  if (typeof window === 'undefined' || listenersReady) return
  listenersReady = true

  if (isStandalone()) {
    installed = true
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
    notify()
  })

  window.addEventListener('appinstalled', () => {
    installed = true
    deferred = null
    notify()
  })
}
