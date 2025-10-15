'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

type UnitType = {
  id: string
  name: string
  icon: string
  colorType: 'advantage' | 'normal' | 'disadvantage'
  min: number
  max: number
  bgGradient: string
  borderColor: string
  glowColor: string
  situationText: string
  situationColor: string
}

// 味方の兵種データ
const ALLY_UNIT_TYPES: UnitType[] = [
  { 
    id: 'ashigaru',
    name: '足軽隊', 
    icon: '🚩',
    colorType: 'disadvantage',
    min: 1, 
    max: 60,
    bgGradient: 'from-red-600 to-rose-600',
    borderColor: 'border-red-500',
    glowColor: 'shadow-red-500/50',
    situationText: '劣勢！',
    situationColor: 'text-red-300'
  },
  { 
    id: 'cavalry',
    name: '騎馬隊', 
    icon: '🐴',
    colorType: 'normal',
    min: 30, 
    max: 80,
    bgGradient: 'from-green-600 to-emerald-600',
    borderColor: 'border-green-500',
    glowColor: 'shadow-green-500/50',
    situationText: '互角',
    situationColor: 'text-green-300'
  },
  { 
    id: 'gunner',
    name: '鉄砲隊', 
    icon: '🔫',
    colorType: 'advantage',
    min: 50, 
    max: 100,
    bgGradient: 'from-blue-600 to-cyan-600',
    borderColor: 'border-blue-500',
    glowColor: 'shadow-blue-500/50',
    situationText: '優勢！',
    situationColor: 'text-blue-300'
  }
]

// 戦車隊データ
const TANK_UNIT: UnitType = {
  id: 'tank',
  name: '戦車隊',
  icon: '🚗',
  colorType: 'advantage',
  min: 999,
  max: 999,
  bgGradient: 'from-yellow-600 to-orange-600',
  borderColor: 'border-yellow-500',
  glowColor: 'shadow-yellow-500/50',
  situationText: '圧倒的優勢！',
  situationColor: 'text-yellow-300'
}

function BattlePhase3Content() {
  const searchParams = useSearchParams()
  
  const opponentName = searchParams.get('opponent') || 'プレイヤーA'
  const enemyValue = parseInt(searchParams.get('enemyValue') || '67')
  const enemyUnitId = searchParams.get('enemyUnit') || 'cavalry'
  
  const [count, setCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showNextButton, setShowNextButton] = useState(false)
  
  const [isTankMode] = useState(() => Math.random() < 0.15)
  
  const [allyUnit] = useState<UnitType>(() => {
    if (isTankMode) {
      return TANK_UNIT
    } else {
      return ALLY_UNIT_TYPES[Math.floor(Math.random() * ALLY_UNIT_TYPES.length)]
    }
  })
  
  const [finalValue] = useState(() => {
    if (isTankMode) {
      return 999
    } else {
      return Math.floor(Math.random() * (allyUnit.max - allyUnit.min + 1)) + allyUnit.min
    }
  })

  useEffect(() => {
    const delay = isTankMode ? 500 : 1000
    const startTimer = setTimeout(() => {
      setIsAnimating(true)
      animateCount()
    }, delay)

    return () => clearTimeout(startTimer)
  }, [isTankMode, finalValue])

  const animateCount = () => {
    const duration = isTankMode ? 3000 : 5000
    const fps = 60
    const totalFrames = (duration / 1000) * fps
    let currentFrame = 0

    const interval = setInterval(() => {
      currentFrame++
      const progress = currentFrame / totalFrames
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = Math.floor(finalValue * easeOutQuart)

      setCount(currentValue)

      if (currentFrame >= totalFrames) {
        clearInterval(interval)
        setCount(finalValue)
        setShowNextButton(true)
      }
    }, 1000 / fps)
  }

  const isWin = finalValue > enemyValue

  return (
    <div className={`min-h-screen relative overflow-hidden transition-all duration-500 flex items-center ${
      isTankMode 
        ? 'bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900' 
        : 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'
    }`}>
      <div className="absolute inset-0 bg-[url('/brick-texture.png')] opacity-20" />
      
      {isTankMode && isAnimating && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 animate-pulse opacity-30" />
          <div className="absolute inset-0" style={{
            background: 'radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)',
            animation: 'pulse 1s ease-in-out infinite'
          }} />
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `sparkle ${1 + Math.random()}s ease-in-out infinite`,
                  animationDelay: `${Math.random()}s`
                }}
              />
            ))}
          </div>
        </>
      )}
      
      <div className="relative z-10 container mx-auto px-4 w-full max-w-md">
        
        <div className="text-center mb-4">
          <div className="inline-block relative group">
            <div className={`absolute inset-0 bg-gradient-to-r ${
              isTankMode ? 'from-yellow-600 to-orange-600' : allyUnit.bgGradient
            } rounded-lg blur-lg opacity-75`} />
            <div className={`relative bg-black/60 backdrop-blur-sm border-2 ${
              isTankMode ? 'border-yellow-500' : allyUnit.borderColor
            } rounded-lg px-4 py-2`}>
              <h1 className="font-black text-white text-base">壱之陣「合戦」 vs {opponentName}</h1>
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="inline-block relative group">
            <div className={`absolute inset-0 ${
              isTankMode ? 'bg-yellow-600' : allyUnit.bgGradient.includes('red') ? 'bg-red-600' : allyUnit.bgGradient.includes('blue') ? 'bg-blue-600' : 'bg-green-600'
            } rounded-lg blur-md opacity-50`} />
            <div className={`relative bg-black/60 backdrop-blur-sm border-2 ${
              isTankMode ? 'border-yellow-500/50' : allyUnit.borderColor + '/50'
            } rounded-lg px-3 py-1.5`}>
              <h2 className={`font-black text-sm ${allyUnit.situationColor}`}>
                味方の反撃フェーズ
              </h2>
            </div>
          </div>
        </div>

        <div className="text-center mb-3">
          <div className="inline-block px-3 py-1.5 bg-black/60 backdrop-blur-sm border-2 border-white/30 rounded-lg">
            <p className={`text-lg font-black ${allyUnit.situationColor}`}
               style={{ textShadow: '0 0 12px currentColor' }}>
              {allyUnit.situationText}
            </p>
          </div>
        </div>

        <div className="text-center mb-4">
          <p className="text-gray-400 text-xs mb-0.5">敵軍の攻撃</p>
          <p className="text-base font-black text-red-400">
            敵軍: {enemyValue}名
          </p>
        </div>

        <div className="flex justify-center mb-4">
          <div className={`relative group transition-all duration-1000 ${
            isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'
          } ${isTankMode && isAnimating ? 'scale-110' : 'scale-100'}`}>
            <div className={`absolute inset-0 bg-gradient-to-r ${allyUnit.bgGradient} rounded-xl blur-xl ${
              isTankMode ? 'opacity-80 animate-pulse' : 'opacity-50'
            }`} />
            <div className={`relative bg-black/60 backdrop-blur-sm border-4 ${
              isTankMode ? 'border-yellow-500 animate-pulse' : allyUnit.borderColor
            } rounded-xl p-4 ${
              isTankMode ? 'shadow-yellow-500/80' : allyUnit.glowColor
            } shadow-2xl`}>
              <div className={`text-5xl mb-1 filter drop-shadow-2xl text-center ${
                isTankMode ? 'animate-bounce' : ''
              }`}>
                {allyUnit.icon}
              </div>
              <div className={`text-base font-black text-center ${
                isTankMode ? 'text-yellow-300' : 'text-white'
              }`}>
                {allyUnit.name}
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-5">
          {isTankMode ? (
            <p className={`text-xl font-black drop-shadow-lg transition-all duration-500 ${
              isAnimating 
                ? 'text-yellow-300 scale-110' 
                : 'text-white scale-100'
            }`}
               style={{ 
                 textShadow: isAnimating ? '0 0 20px rgba(251, 191, 36, 0.8)' : 'none',
                 animation: isAnimating ? 'pulse 1s ease-in-out infinite' : 'none'
               }}>
              🎉 戦車隊、参戦!! 🎉
            </p>
          ) : (
            <p className="text-base font-black text-white drop-shadow-lg">
              味方の{allyUnit.name}が応戦！
            </p>
          )}
        </div>

        <div className="flex justify-center mb-4">
          <div className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r ${allyUnit.bgGradient} rounded-2xl blur-xl ${
              showNextButton ? 'animate-pulse' : ''
            }`} 
                 style={{ opacity: isTankMode ? 0.9 : 0.8 }} />
            <div className={`relative bg-black/80 backdrop-blur-sm border-4 ${
              isTankMode ? 'border-yellow-500' : allyUnit.borderColor
            } rounded-2xl p-6 ${
              isTankMode ? 'shadow-yellow-500/80' : allyUnit.glowColor
            } shadow-2xl`}>
              <div className={`text-6xl font-black text-center tracking-wider filter drop-shadow-2xl transition-all duration-300 ${
                isTankMode ? 'text-yellow-300' : 'text-white'
              } ${showNextButton ? 'scale-110' : 'scale-100'}`}>
                {count}
              </div>
            </div>
          </div>
        </div>

        {showNextButton && (
          <div className="text-center mb-5 animate-fade-in">
            {isTankMode ? (
              <p className="text-2xl font-black text-yellow-300 drop-shadow-lg mb-2"
                 style={{ textShadow: '0 0 20px rgba(251, 191, 36, 0.8)' }}>
                🎊 敵軍 {finalValue}名 討ち取る!!! 🎊
              </p>
            ) : (
              <p className={`text-lg font-black drop-shadow-lg ${
                isWin ? 'text-green-400' : 'text-orange-400'
              }`}>
                敵軍 {finalValue}名 討ち取る!!
              </p>
            )}
            
            <div className="mt-2">
              <p className="text-xs font-bold text-gray-400 mb-1">戦果比較</p>
              <div className="flex items-center justify-center gap-2">
                <div className="text-center">
                  <p className="text-xs text-gray-500">味方</p>
                  <p className={`text-xl font-black ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                    {finalValue}
                  </p>
                </div>
                <p className="text-lg font-black text-white">VS</p>
                <div className="text-center">
                  <p className="text-xs text-gray-500">敵軍</p>
                  <p className={`text-xl font-black ${isWin ? 'text-red-400' : 'text-green-400'}`}>
                    {enemyValue}
                  </p>
                </div>
              </div>
              <p className={`text-base font-black mt-1 ${isWin ? 'text-green-400' : 'text-red-400'}`}>
                差: {isWin ? '+' : ''}{finalValue - enemyValue}
              </p>
            </div>
          </div>
        )}

        {showNextButton && (
          <div className="flex justify-center animate-fade-in">
            <Link 
              href={`/koku-tournament/game/battle/phase4?opponent=${encodeURIComponent(opponentName)}&win=${isWin}&ally=${finalValue}&enemy=${enemyValue}&allyUnit=${allyUnit.id}&enemyUnit=${enemyUnitId}&tank=${isTankMode}`}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-r ${
                isWin ? 'from-green-600 to-emerald-600' : 'from-red-600 to-orange-600'
              } rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity`} />
              <div className={`relative bg-black/40 backdrop-blur-sm border-2 ${
                isWin ? 'border-green-500/50 hover:border-green-500' : 'border-red-500/50 hover:border-red-500'
              } rounded-full px-8 py-2.5 transition-colors`}>
                <span className="font-black text-white text-base flex items-center gap-2">
                  結果を見る
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  )
}

export default function BattlePhase3() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <p className="text-white text-lg">読み込み中...</p>
      </div>
    }>
      <BattlePhase3Content />
    </Suspense>
  )
}