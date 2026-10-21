import { Navigate, Outlet } from 'react-router-dom'
import { hasEnteredApp } from '../lib/session'

/** Redirects to the welcome screen until the user taps Entrar this session. */
export function RequireEntered() {
  if (!hasEnteredApp()) {
    return <Navigate to="/" replace />
  }
  return <Outlet />
}
