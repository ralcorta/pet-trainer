import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/hoy', label: 'Hoy', icon: PawIcon },
  { to: '/calendario', label: 'Calendario', icon: CalendarIcon },
  { to: '/perros', label: 'Perros', icon: DogIcon },
  { to: '/fichas', label: 'Fichas', icon: CardIcon },
] as const

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-sage-200/80 bg-cream/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-2 pt-2 pb-2">
        {tabs.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/hoy'}
            className={({ isActive }) =>
              `flex min-w-[4.5rem] flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-colors ${
                isActive ? 'text-sage-600' : 'text-ink-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon active={isActive} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

function PawIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8">
      <ellipse cx="8.5" cy="7" rx="2.2" ry="2.8" />
      <ellipse cx="15.5" cy="7" rx="2.2" ry="2.8" />
      <ellipse cx="5.5" cy="12.5" rx="2" ry="2.5" />
      <ellipse cx="18.5" cy="12.5" rx="2" ry="2.5" />
      <path d="M12 13c-3 0-5 2.2-5 4.5 0 1.5 1.2 2.5 5 2.5s5-1 5-2.5C17 15.2 15 13 12 13z" />
    </svg>
  )
}

function CalendarIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3.5v3M16 3.5v3" />
    </svg>
  )
}

function DogIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <path d="M6 14c0-3 2.5-6 6-6s6 3 6 6" />
      <circle cx="9.5" cy="12" r="1" fill="currentColor" />
      <circle cx="14.5" cy="12" r="1" fill="currentColor" />
      <path d="M10 15.5c.6.6 1.4.9 2 .9s1.4-.3 2-.9" />
      <path d="M5 10l-1.5-3M19 10l1.5-3" />
    </svg>
  )
}

function CardIcon({ active }: { active: boolean }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
      <rect x="5" y="4" width="14" height="16" rx="2.5" />
      <circle cx="12" cy="10" r="2.5" />
      <path d="M8.5 16.5c.8-1.4 2-2 3.5-2s2.7.6 3.5 2" />
    </svg>
  )
}
