'use client'

import { useState } from 'react'
import { Plus, Minus } from 'lucide-react'

interface NumberInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  step?: number
  min?: number
  max?: number
  unit?: string
  gradient?: string
  glowColor?: string
}

export default function NumberInput({
  label,
  value,
  onChange,
  step = 1000,
  min = 0,
  max,
  unit = '',
  gradient = 'from-purple-500 to-indigo-600',
  glowColor = 'purple'
}: NumberInputProps) {
  const [inputValue, setInputValue] = useState(value.toString())

  const handleIncrement = () => {
    const newValue = value + step
    if (max === undefined || newValue <= max) {
      onChange(newValue)
      setInputValue(newValue.toString())
    }
  }

  const handleDecrement = () => {
    const newValue = value - step
    if (newValue >= min) {
      onChange(newValue)
      setInputValue(newValue.toString())
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = e.target.value
    setInputValue(inputVal)

    if (inputVal === '' || inputVal === '-') {
      onChange(0)
      return
    }

    const numValue = Number(inputVal)
    if (!isNaN(numValue) && numValue >= min && (max === undefined || numValue <= max)) {
      onChange(numValue)
    }
  }

  const handleInputBlur = () => {
    const numValue = Number(inputValue)
    if (isNaN(numValue) || inputValue === '' || inputValue === '-') {
      setInputValue('0')
      onChange(0)
    } else {
      let correctedValue = numValue
      if (correctedValue < min) correctedValue = min
      if (max !== undefined && correctedValue > max) correctedValue = max
      setInputValue(correctedValue.toString())
      onChange(correctedValue)
    }
  }

  return (
    <div className="space-y-3">
      <label className="block text-base font-black text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
        {label}
      </label>
      
      <div className="relative">
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-lg opacity-50`} />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/20">
          <div className="flex items-center justify-center mb-4">
            <input
              type="text"
              inputMode="numeric"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className="w-full bg-transparent text-center text-4xl font-black text-white focus:outline-none"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
            />
            {unit && (
              <span className="text-2xl font-black text-white/70 ml-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                {unit}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={value <= min}
              className="group relative disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-red-600 rounded-xl blur-md opacity-0 group-hover:opacity-75 group-disabled:opacity-0 transition-opacity" />
              <div className="relative bg-red-600/80 hover:bg-red-600 disabled:bg-red-600/30 rounded-xl px-4 py-3 border-2 border-red-400/50 transition-all active:scale-95">
                <div className="flex items-center justify-center gap-2">
                  <Minus className="w-5 h-5 text-white" />
                  <span className="text-lg font-black text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                    {step.toLocaleString()}
                  </span>
                </div>
              </div>
            </button>

            <button
              type="button"
              onClick={handleIncrement}
              disabled={max !== undefined && value >= max}
              className="group relative disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-green-600 rounded-xl blur-md opacity-0 group-hover:opacity-75 group-disabled:opacity-0 transition-opacity" />
              <div className="relative bg-green-600/80 hover:bg-green-600 disabled:bg-green-600/30 rounded-xl px-4 py-3 border-2 border-green-400/50 transition-all active:scale-95">
                <div className="flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5 text-white" />
                  <span className="text-lg font-black text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                    {step.toLocaleString()}
                  </span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}