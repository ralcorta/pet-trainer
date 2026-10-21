import { Outlet } from 'react-router-dom'
import { BottomNav } from './BottomNav'

export function AppShell() {
  return (
    <div className="relative mx-auto min-h-dvh max-w-lg bg-sage-100">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at top, rgba(107,154,114,0.25), transparent 55%), radial-gradient(ellipse at bottom right, rgba(166,107,74,0.12), transparent 45%)',
        }}
      />
      <main className="relative px-4 pb-28 pt-[max(1rem,env(safe-area-inset-top))]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
