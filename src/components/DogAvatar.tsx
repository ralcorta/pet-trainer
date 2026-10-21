const palette = [
  'bg-sage-300 text-sage-800',
  'bg-amber-bg text-amber-badge',
  'bg-blue-bg text-blue-badge',
  'bg-red-bg text-red-badge',
  'bg-cream-dark text-terracotta',
]

function colorFor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i) * (i + 1)) % palette.length
  return palette[hash]
}

export function DogAvatar({ nombre, raza, size = 'md' }: { nombre: string; raza?: string; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'h-10 w-10 text-sm', md: 'h-12 w-12 text-base', lg: 'h-16 w-16 text-xl' }
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-display font-extrabold ${sizes[size]} ${colorFor(nombre)}`}
      title={raza || nombre}
    >
      {nombre.slice(0, 1).toUpperCase()}
    </div>
  )
}
