import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initPwaInstallListeners } from './lib/pwaInstall'
import { setupPwaUpdates } from './pwa'

initPwaInstallListeners()
setupPwaUpdates()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
