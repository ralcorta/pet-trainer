import { registerSW } from 'virtual:pwa-register'

/**
 * Register the service worker and actively look for new deploys.
 * Installed PWAs (especially iOS) won't pick up updates unless we call update().
 */
export function setupPwaUpdates() {
  if (!('serviceWorker' in navigator)) return

  const updateSW = registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return

      const check = () => {
        void registration.update().catch(() => {
          // ignore network errors while offline
        })
      }

      // When the user comes back to the app
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check()
      })
      window.addEventListener('focus', check)

      // Periodic check while the app stays open
      window.setInterval(check, 15 * 60 * 1000)

      // First check shortly after launch
      window.setTimeout(check, 5_000)
    },
    onNeedRefresh() {
      // With registerType: 'autoUpdate' the page usually reloads alone;
      // if it doesn't, force apply the waiting worker.
      void updateSW(true)
    },
  })
}
