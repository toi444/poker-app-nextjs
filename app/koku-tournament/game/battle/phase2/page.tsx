'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

// 敵軍の兵種データ（こちらから見た有利不利で色分け）
const ENEMY_UNIT_TYPES = [
  { 
    id: 'ashigaru',
    name: '足軽隊', 
    icon: '🚩',
    colorType: 'advantage',  // 敵が足軽 = こちら有利 = 青
    min: 1, 
    max: 60,
    bgGradient: 'from-blue-600 to-cyan-600',
    borderColor: 'border-blue-500',
    glowColor: 'shadow-blue-500/50',
    situationText: '優勢！',
    situationColor: 'text-blue-300'
  },
  { 
    id: 'cavalry',
    name: '騎馬隊', 
    icon: '🐴',
    colorType: 'normal',  // 敵が騎馬 = 互角 = 緑
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
    colorType: 'disadvantage',  // 敵が鉄砲 = こちら不利 = 赤
    min: 50, 
    max: 100,
    bgGradient: 'from-red-600 to-rose-600',
    borderColor: 'border-red-500',
    glowColor: 'shadow-red-500/50',
    situationText: '劣勢！',
    situationColor: 'text-red-300'
  }
]

export default function BattlePhase2() {
  const searchParams = useSearchParams()
  const opponentName = searchParams.get('opponent') || 'プレイヤーA'
  
  const [count, setCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showNextButton, setShowNextButton] = useState(false)
  
  // ランダムに敵の兵種を選択（Phase 2で一度だけ決定）
  const [enemyUnit] = useState(() => 
    ENEMY_UNIT_TYPES[Math.floor(Math.random() * ENEMY_UNIT_TYPES.length)]
  )
  
  // ランダムな最終値（Phase 2で一度だけ決定）
  const [finalValue] = useState(() => 
    Math.floor(Math.random() * (enemyUnit.max - enemyUnit.min + 1)) + enemyUnit.min
  )

  useEffect(() => {
    const startTimer = setTimeout(() => {
      setIsAnimating(true)
      animateCount()
    }, 1000)

    return () => clearTimeout(startTimer)
  }, [])

  // カウントアップアニメーション(後半ゆっくり)
  const animateCount = () => {
    const duration = 5000
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden flex items-center">
      <div className="absolute inset-0 bg-[url('/brick-texture.png')] opacity-20" />
      
      <div className="relative z-10 container mx-auto px-4 w-full max-w-md">
        
        {/* ヘッダー - コンパクト */}
        <div className="text-center mb-4">
          <div className="inline-block relative group">
            <div className={`absolute inset-0 bg-gradient-to-r ${enemyUnit.bgGradient} rounded-lg blur-lg opacity-75`} />
            <div className={`relative bg-black/60 backdrop-blur-sm border-2 ${enemyUnit.borderColor} rounded-lg px-4 py-2`}>
              <h1 className="font-black text-white text-base">壱之陣「合戦」 vs {opponentName}</h1>
            </div>
          </div>
        </div>

        {/* フェーズタイトル - コンパクト */}
        <div className="text-center mb-4">
          <div className="inline-block relative group">
            <div className="absolute inset-0 bg-cyan-600 rounded-lg blur-md opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm border-2 border-cyan-500/50 rounded-lg px-3 py-1.5">
              <h2 className="font-black text-cyan-300 text-sm">敵軍の攻撃フェーズ</h2>
            </div>
          </div>
        </div>

        {/* 状況表示 - コンパクト */}
        <div className="text-center mb-4">
          <div className="inline-block px-3 py-1.5 bg-black/60 backdrop-blur-sm border-2 border-white/30 rounded-lg">
            <p className={`text-lg font-black ${enemyUnit.situationColor}`}
               style={{ textShadow: '0 0 12px currentColor' }}>
              {enemyUnit.situationText}
            </p>
          </div>
        </div>

        {/* 敵軍の旗 - コンパクト */}
        <div className="flex justify-center mb-4">
          <div className={`relative group transition-all duration-1000 ${isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}`}>
            <div className={`absolute inset-0 bg-gradient-to-r ${enemyUnit.bgGradient} rounded-xl blur-xl opacity-50`} />
            <div className={`relative bg-black/60 backdrop-blur-sm border-4 ${enemyUnit.borderColor} rounded-xl p-4 ${enemyUnit.glowColor} shadow-2xl`}>
              <div className="text-5xl mb-1 filter drop-shadow-2xl text-center">
                {enemyUnit.icon}
              </div>
              <div className="text-base font-black text-white text-center">
                {enemyUnit.name}
              </div>
            </div>
          </div>
        </div>

        {/* メッセージ - コンパクト */}
        <div className="text-center mb-4">
          <p className="text-base font-black text-white drop-shadow-lg">
            敵軍の{enemyUnit.name}が現れた!
          </p>
        </div>

        {/* カウント表示 - コンパクト */}
        <div className="flex justify-center mb-4">
          <div className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r ${enemyUnit.bgGradient} rounded-2xl blur-xl ${showNextButton ? 'animate-pulse' : ''}`} 
                 style={{ opacity: 0.8 }} />
            <div className={`relative bg-black/80 backdrop-blur-sm border-4 ${enemyUnit.borderColor} rounded-2xl p-6 ${enemyUnit.glowColor} shadow-2xl`}>
              <div className={`text-6xl font-black text-white text-center tracking-wider filter drop-shadow-2xl transition-all duration-300 ${showNextButton ? 'scale-110' : 'scale-100'}`}>
                {count}
              </div>
            </div>
          </div>
        </div>

        {/* 結果メッセージ - コンパクト */}
        {showNextButton && (
          <div className="text-center mb-4 animate-fade-in">
            <p className="text-lg font-black text-red-400 drop-shadow-lg">
              自軍 {finalValue}名 討ち取られる...!
            </p>
          </div>
        )}

        {/* 次へボタン - コンパクト */}
        {showNextButton && (
          <div className="flex justify-center animate-fade-in">
            <Link 
              href={`/koku-tournament/game/battle/phase3?opponent=${encodeURIComponent(opponentName)}&enemyValue=${finalValue}&enemyUnit=${enemyUnit.id}`}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-black/40 backdrop-blur-sm border-2 border-red-500/50 rounded-full px-8 py-2.5 hover:border-red-500 transition-colors">
                <span className="font-black text-white text-base flex items-center gap-2">
                  次へ
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
      `}</style>
    </div>
  )
}