// app/components/ui/SectionHeader.tsx
import { LucideIcon } from 'lucide-react'

type ColorVariant = 'purple' | 'blue' | 'orange' | 'pink' | 'emerald'

const colorStyles = {
  purple: {
    glow: 'bg-purple-600',
    icon: 'text-purple-400'
  },
  blue: {
    glow: 'bg-blue-600',
    icon: 'text-blue-400'
  },
  orange: {
    glow: 'bg-orange-600',
    icon: 'text-orange-400'
  },
  pink: {
    glow: 'bg-pink-600',
    icon: 'text-pink-400'
  },
  emerald: {
    glow: 'bg-emerald-600',
    icon: 'text-emerald-400'
  }
}

export function SectionHeader({ 
  icon: Icon, 
  title, 
  color = 'purple' 
}: {
  icon: LucideIcon
  title: string
  color?: ColorVariant
}) {
  const styles = colorStyles[color]
  
  return (
    <h2 className="text-3xl font-black text-white flex items-center gap-3">
      <div className="relative">
        <div className={`absolute inset-0 ${styles.glow} blur-xl animate-pulse`} />
        <Icon className={`relative w-8 h-8 ${styles.icon}`} />
      </div>
      {title}
    </h2>
  )
}