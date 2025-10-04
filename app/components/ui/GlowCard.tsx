// app/components/ui/GlowCard.tsx
import { ReactNode } from 'react'

type ColorVariant = 'purple' | 'blue' | 'orange' | 'pink' | 'emerald' | 'red' | 'green'

const colorStyles = {
  purple: {
    glow: 'bg-gradient-to-r from-purple-600 to-indigo-700',
    border: 'border-purple-500/50',
    hoverBorder: 'hover:border-purple-400'
  },
  blue: {
    glow: 'bg-gradient-to-r from-blue-600 to-cyan-700',
    border: 'border-blue-500/50',
    hoverBorder: 'hover:border-blue-400'
  },
  orange: {
    glow: 'bg-gradient-to-r from-orange-600 to-red-700',
    border: 'border-orange-500/50',
    hoverBorder: 'hover:border-orange-400'
  },
  pink: {
    glow: 'bg-gradient-to-r from-pink-600 to-rose-700',
    border: 'border-pink-500/50',
    hoverBorder: 'hover:border-pink-400'
  },
  emerald: {
    glow: 'bg-gradient-to-r from-emerald-600 to-green-700',
    border: 'border-emerald-500/50',
    hoverBorder: 'hover:border-emerald-400'
  },
  red: {
    glow: 'bg-gradient-to-r from-red-600 to-orange-700',
    border: 'border-red-500/50',
    hoverBorder: 'hover:border-red-400'
  },
  green: {
    glow: 'bg-gradient-to-r from-green-600 to-emerald-700',
    border: 'border-green-500/50',
    hoverBorder: 'hover:border-green-400'
  }
}

export function GlowCard({ 
  color = 'purple', 
  children, 
  className = '' 
}: {
  color?: ColorVariant
  children: ReactNode
  className?: string
}) {
  const styles = colorStyles[color]
  
  return (
    <div className={`relative group ${className}`}>
      <div className={`absolute inset-0 ${styles.glow} rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity`} />
      <div className={`relative bg-black/60 backdrop-blur-sm rounded-3xl p-6 border-2 ${styles.border}`}>
        {children}
      </div>
    </div>
  )
}