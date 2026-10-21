import { useEffect, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { RequireEntered } from './components/RequireEntered'
import { prepareDatabase } from './data/seed'
import { CalendarioPage } from './pages/Calendario'
import { FichaPage } from './pages/Ficha'
import { FichasPage } from './pages/Fichas'
import { HoyPage } from './pages/Hoy'
import { InicioPage } from './pages/Inicio'
import { PerrosPage } from './pages/Perros'

export default function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    prepareDatabase().finally(() => setReady(true))
  }, [])

  if (!ready) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-sage-100 font-display font-bold text-sage-700">
        Cargando…
      </div>
    )
  }

  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || '/'}>
      <Routes>
        <Route index element={<InicioPage />} />
        <Route element={<RequireEntered />}>
          <Route element={<AppShell />}>
            <Route path="hoy" element={<HoyPage />} />
            <Route path="calendario" element={<CalendarioPage />} />
            <Route path="perros" element={<PerrosPage />} />
            <Route path="perros/:id" element={<FichaPage />} />
            <Route path="fichas" element={<FichasPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
