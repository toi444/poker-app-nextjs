'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function BattlePhase1() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [showTitle, setShowTitle] = useState(false)
  const [showOpponent, setShowOpponent] = useState(false)
  const [showIcon, setShowIcon] = useState(false)
  const [showMessage, setShowMessage] = useState(false)

  const opponentId = searchParams.get('opponentId') || ''
  const opponentName = searchParams.get('opponentName') || 'プレイヤーA'

  useEffect(() => {
    const timer1 = setTimeout(() => setShowTitle(true), 300)
    const timer2 = setTimeout(() => setShowOpponent(true), 800)
    const timer3 = setTimeout(() => setShowIcon(true), 1300)
    const timer4 = setTimeout(() => setShowMessage(true), 1800)
    
    const progressTimer = setTimeout(() => {
      let currentProgress = 0
      const progressInterval = setInterval(() => {
        currentProgress += 2
        setProgress(currentProgress)
        
        if (currentProgress >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => {
            router.push(
              `/koku-tournament/game/battle/phase2?` +
              `opponentId=${opponentId}&` +
              `opponentName=${encodeURIComponent(opponentName)}`
            )
          }, 500)
        }
      }, 40)
      
      return () => clearInterval(progressInterval)
    }, 2000)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(progressTimer)
    }
  }, [router, opponentId, opponentName])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black relative overflow-hidden flex items-center">
      <div className="absolute inset-0 bg-[url('/brick-texture.png')] opacity-10" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-conic-gradient(#8B4513 0% 25%, transparent 0% 50%)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-red-600 rounded-full blur-[100px] opacity-30 animate-pulse" />
      <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-64 h-64 bg-orange-600 rounded-full blur-[100px] opacity-30 animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500 to-transparent w-1" 
             style={{ animation: 'scan-line 4s linear infinite' }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 w-full max-w-md">
        
        {showTitle && (
          <div className="mb-6 animate-fade-in">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl blur-lg opacity-75" />
              <div className="relative bg-black/60 backdrop-blur-sm border-2 border-red-500/50 rounded-xl px-6 py-3 shadow-2xl">
                <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-orange-200 text-center"
                    style={{ 
                      textShadow: '0 0 25px rgba(239, 68, 68, 0.9)',
                      letterSpacing: '0.1em',
                      fontFamily: "'Noto Serif JP', serif"
                    }}>
                  壱之陣「合戦」
                </h1>
              </div>
            </div>
          </div>
        )}

        {showOpponent && (
          <div className="mb-6 animate-fade-in">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur-lg opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm border-2 border-purple-500/50 rounded-lg px-5 py-2">
                <p className="text-xl font-black text-white text-center">
                  VS {opponentName}
                </p>
              </div>
            </div>
          </div>
        )}

        {showIcon && (
          <div className="mb-6 animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-75 animate-pulse" />
              <div className="relative text-6xl animate-spin-slow filter drop-shadow-2xl text-center">
                ⚔️
              </div>
            </div>
          </div>
        )}

        {showMessage && (
          <div className="mb-6 animate-fade-in">
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200 text-center"
               style={{ 
                 textShadow: '0 0 20px rgba(251, 191, 36, 0.8)',
                 letterSpacing: '0.05em'
               }}>
              合戦開始！
            </p>
          </div>
        )}

        {progress > 0 && (
          <div className="w-full animate-fade-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-full blur-md opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-full overflow-hidden border-2 border-red-500/50 h-2.5">
                <div 
                  className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 transition-all duration-300 ease-out relative overflow-hidden"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
                </div>
              </div>
            </div>
            
            <p className="text-center text-gray-400 text-xs mt-2 font-bold">
              自軍集結中... {progress}%
            </p>
          </div>
        )}

        {progress > 0 && progress < 100 && (
          <div className="mt-5 text-center animate-fade-in">
            <button
              onClick={() => router.push(
                `/koku-tournament/game/battle/phase2?` +
                `opponentId=${opponentId}&` +
                `opponentName=${encodeURIComponent(opponentName)}`
              )}
              className="relative group inline-block"
            >
              <div className="absolute inset-0 bg-gray-600 rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-black/40 backdrop-blur-sm border border-gray-500/50 rounded-lg px-4 py-1.5 hover:border-gray-400 transition-colors">
                <span className="text-xs text-gray-400 group-hover:text-gray-300">
                  スキップ →
                </span>
              </div>
            </button>
          </div>
        )}

      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg) scale(1);
          }
          50% {
            transform: rotate(180deg) scale(1.1);
          }
          to {
            transform: rotate(360deg) scale(1);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 2s ease-in-out infinite;
        }
        @keyframes scan-line {
          0% {
            left: 0%;
          }
          100% {
            left: 100%;
          }
        }
        @keyframes shine {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shine {
          animation: shine 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}