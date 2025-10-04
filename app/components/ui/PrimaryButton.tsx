// app/components/ui/PrimaryButton.tsx
import { LucideIcon, ChevronRight } from 'lucide-react'

type ColorVariant = 'purple' | 'blue' | 'orange' | 'pink' | 'emerald' | 'red' | 'green'

const colorStyles = {
  purple: {
    glow: 'bg-gradient-to-r from-purple-600 to-indigo-700',
    bg: 'bg-gradient-to-br from-purple-600 to-indigo-700'
  },
  blue: {
    glow: 'bg-gradient-to-r from-blue-600 to-cyan-700',
    bg: 'bg-gradient-to-br from-blue-600 to-cyan-700'
  },
  orange: {
    glow: 'bg-gradient-to-r from-orange-600 to-red-700',
    bg: 'bg-gradient-to-br from-orange-600 to-red-700'
  },
  pink: {
    glow: 'bg-gradient-to-r from-pink-600 to-rose-700',
    bg: 'bg-gradient-to-br from-pink-600 to-rose-700'
  },
  emerald: {
    glow: 'bg-gradient-to-r from-emerald-600 to-green-700',
    bg: 'bg-gradient-to-br from-emerald-600 to-green-700'
  },
  red: {
    glow: 'bg-gradient-to-r from-red-600 to-orange-700',
    bg: 'bg-gradient-to-br from-red-600 to-orange-700'
  },
  green: {
    glow: 'bg-gradient-to-r from-green-600 to-emerald-700',
    bg: 'bg-gradient-to-br from-green-600 to-emerald-700'
  }
}

export function PrimaryButton({
  icon: Icon,
  title,
  subtitle,
  onClick,
  color = 'purple'
}: {
  icon: LucideIcon
  title: string
  subtitle: string
  onClick: () => void
  color?: ColorVariant
}) {
  const styles = colorStyles[color]
  
  return (
    <div className="relative group">
      <div className={`absolute inset-0 ${styles.glow} rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity`} />
      <button
        onClick={onClick}
        className={`relative w-full ${styles.bg} rounded-3xl p-1 shadow-2xl`}
      >
        <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 border-2 border-white/20">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                <Icon className="w-12 h-12 drop-shadow-glow" />
              </div>
              <div className="text-left">
                <p className="text-2xl font-black drop-shadow-glow">{title}</p>
                <p className="text-sm opacity-90 mt-1">{subtitle}</p>
              </div>
            </div>
            <ChevronRight className="w-7 h-7 opacity-70 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
          </div>
        </div>
      </button>
    </div>
  )
}