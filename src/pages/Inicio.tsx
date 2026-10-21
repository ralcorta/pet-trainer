import { useNavigate } from 'react-router-dom'
import { markAppEntered } from '../lib/session'

export function InicioPage() {
  const navigate = useNavigate()

  function entrar() {
    markAppEntered()
    navigate('/hoy')
  }

  return (
    <div className="relative mx-auto flex min-h-dvh max-w-lg flex-col overflow-hidden bg-sage-100">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 120% 80% at 50% -10%, rgba(74,124,89,0.35), transparent 55%), radial-gradient(ellipse at bottom, rgba(166,107,74,0.14), transparent 50%)',
        }}
      />

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 pb-10 pt-[max(2rem,env(safe-area-inset-top))]">
        <div className="inicio-mark mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-sage-600 shadow-lg shadow-sage-700/25">
          <PawIcon />
        </div>

        <h1 className="inicio-title font-display text-4xl font-extrabold tracking-tight text-ink">
          Pet Trainer
        </h1>
        <p className="inicio-sub mt-3 max-w-[16rem] text-center text-base font-semibold leading-snug text-ink-muted">
          Tus turnos, clases y pagos en un solo lugar.
        </p>

        <button
          type="button"
          onClick={entrar}
          className="inicio-cta mt-8 inline-flex min-w-[12rem] items-center justify-center rounded-2xl bg-sage-600 px-8 py-3.5 font-display text-base font-extrabold text-white shadow-md shadow-sage-700/20 transition active:scale-[0.98]"
        >
          Entrar
        </button>
      </div>
    </div>
  )
}

function PawIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="#faf7f2" aria-hidden>
      <ellipse cx="8.5" cy="7" rx="2.2" ry="2.8" />
      <ellipse cx="15.5" cy="7" rx="2.2" ry="2.8" />
      <ellipse cx="5.5" cy="12.5" rx="2" ry="2.5" />
      <ellipse cx="18.5" cy="12.5" rx="2" ry="2.5" />
      <path d="M12 13c-3 0-5 2.2-5 4.5 0 1.5 1.2 2.5 5 2.5s5-1 5-2.5C17 15.2 15 13 12 13z" />
    </svg>
  )
}
