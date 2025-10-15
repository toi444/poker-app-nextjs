// app/koku-tournament/game/battle/phase4/page.tsx

'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Trophy, TrendingUp, TrendingDown, Home, Swords, Target, Sparkles, Flame } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type UnitInfo = {
  id: string
  name: string
  icon: string
}

const ALL_UNITS: Record<string, UnitInfo> = {
  ashigaru: { id: 'ashigaru', name: '足軽隊', icon: '🚩' },
  cavalry: { id: 'cavalry', name: '騎馬隊', icon: '🐴' },
  gunner: { id: 'gunner', name: '鉄砲隊', icon: '🔫' },
  tank: { id: 'tank', name: '戦車隊', icon: '🚗' }
}

export default function BattlePhase4() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const opponentName = searchParams.get('opponent') || 'プレイヤーA'
  const isWin = searchParams.get('win') === 'true'
  const allyValue = parseInt(searchParams.get('ally') || '0')
  const enemyValue = parseInt(searchParams.get('enemy') || '0')
  const allyUnitId = searchParams.get('allyUnit') || 'cavalry'
  const enemyUnitId = searchParams.get('enemyUnit') || 'cavalry'
  const isTank = searchParams.get('tank') === 'true'
  
  const allyUnit = ALL_UNITS[allyUnitId] || ALL_UNITS.cavalry
  const enemyUnit = ALL_UNITS[enemyUnitId] || ALL_UNITS.cavalry
  
  const [beforeKoku, setBeforeKoku] = useState(123)
  const [afterKoku, setAfterKoku] = useState(123)
  const [beforeRank, setBeforeRank] = useState(3)
  const [afterRank, setAfterRank] = useState(3)
  const [treasurePot, setTreasurePot] = useState(36000)
  const [attacksLeft, setAttacksLeft] = useState(12)

  const [showContent, setShowContent] = useState(false)
  const [showButtons, setShowButtons] = useState(false)
  const [isSaving, setIsSaving] = useState(true)
  const [saveError, setSaveError] = useState<string | null>(null)

  useEffect(() => {
    const timer1 = setTimeout(() => setShowContent(true), 300)
    const timer2 = setTimeout(() => {
      // データを保存してから表示
      saveResultToDatabase()
    }, 800)
    
    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
    }
  }, [])

  const saveResultToDatabase = async () => {
    try {
      setIsSaving(true)
      
      // セッション取得
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const challengerId = session.user.id
      
      // プロフィール取得
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', challengerId)
        .single()

      const challengerName = profile?.username || 'あなた'

      // 相手のIDを取得（実際は相手選択画面から渡されるべき）
      // 暫定的にランダムな相手を選択
      const { data: opponents } = await supabase
        .from('player_monthly_stats')
        .select('user_id, player_name')
        .neq('user_id', challengerId)
        .limit(1)
        .single()

      if (!opponents) {
        setSaveError('相手プレイヤーが見つかりません')
        setShowButtons(true)
        return
      }

      const defenderId = opponents.user_id
      const defenderName = opponents.player_name

      // APIを呼び出し
      const response = await fetch('/api/koku-tournament/record-battle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          challengerId,
          defenderId,
          challengerName,
          defenderName,
          enemyRoll: enemyValue,
          enemyType: enemyUnitId,
          allyRoll: allyValue,
          allyType: allyUnitId,
          isTank,
          result: isWin ? 'win' : 'lose',
          kokuChange: isWin ? 1 : -1
        })
      })

      const result = await response.json()

      if (result.success) {
        // 更新後のデータを反映
        setBeforeKoku(result.data.newKoku - (isWin ? 1 : -1))
        setAfterKoku(result.data.newKoku)
        setAfterRank(result.data.newRank)
        setBeforeRank(result.data.newRank + (isWin ? 1 : -1))
        setTreasurePot(result.data.treasurePot)
        setAttacksLeft(20 - result.data.newAttackCount)
      } else {
        setSaveError(result.error)
      }

    } catch (error) {
      console.error('Save error:', error)
      setSaveError('データの保存に失敗しました')
    } finally {
      setIsSaving(false)
      setShowButtons(true)
    }
  }

  const rankChange = afterRank - beforeRank
  const kokuChange = isWin ? 1 : -1

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      isWin 
        ? 'bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900'
        : 'bg-gradient-to-br from-red-900 via-rose-900 to-pink-900'
    }`}>
      <div className="absolute inset-0 bg-[url('/brick-texture.png')] opacity-10" />
      
      {isWin && (
        <>
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent animate-pulse" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-yellow-400 rounded-full opacity-70"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-10%`,
                  animation: `confetti ${2 + Math.random() * 2}s linear infinite`,
                  animationDelay: `${Math.random() * 2}s`
                }}
              />
            ))}
          </div>
        </>
      )}
      
      <div className="relative z-10 container mx-auto px-4 py-6 max-w-md">
        
        {/* 勝敗タイトル */}
        <div className="text-center mb-6">
          <div className={`inline-block relative group transition-all duration-500 ${
            showContent ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}>
            <div className={`absolute inset-0 ${
              isWin ? 'bg-yellow-600' : 'bg-red-600'
            } rounded-xl blur-xl opacity-75 animate-pulse`} />
            <div className={`relative bg-black/60 backdrop-blur-sm border-4 ${
              isWin ? 'border-yellow-500' : 'border-red-500'
            } rounded-xl px-6 py-4`}>
              {isWin ? (
                <>
                  <div className="text-5xl mb-2">🎊</div>
                  <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-green-200"
                      style={{ 
                        textShadow: '0 0 30px rgba(251, 191, 36, 0.9)',
                        letterSpacing: '0.05em'
                      }}>
                    勝利！
                  </h1>
                </>
              ) : (
                <>
                  <div className="text-5xl mb-2">😢</div>
                  <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-200 to-pink-200"
                      style={{ 
                        textShadow: '0 0 30px rgba(239, 68, 68, 0.9)',
                        letterSpacing: '0.05em'
                      }}>
                    敗北...
                  </h1>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 保存中表示 */}
        {isSaving && (
          <div className="mb-4 text-center animate-fade-in">
            <div className="inline-block px-4 py-2 bg-cyan-600/20 border border-cyan-500/50 rounded-xl">
              <p className="text-sm text-cyan-300">📝 結果を記録中...</p>
            </div>
          </div>
        )}

        {/* エラー表示 */}
        {saveError && (
          <div className="mb-4 text-center animate-fade-in">
            <div className="inline-block px-4 py-2 bg-red-600/20 border border-red-500/50 rounded-xl">
              <p className="text-sm text-red-300">⚠️ {saveError}</p>
            </div>
          </div>
        )}

        {/* 戦果カード */}
        {showContent && (
          <div className="relative group mb-4 animate-fade-in">
            <div className={`absolute inset-0 bg-gradient-to-r ${
              isWin ? 'from-green-600 to-emerald-600' : 'from-red-600 to-rose-600'
            } rounded-lg blur-md opacity-50`} />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-lg p-4 border-2 border-white/20">
              <h2 className="text-sm font-black text-white mb-2 flex items-center gap-1.5">
                <Target className="w-4 h-4 text-white" />
                戦果
              </h2>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-black/40 rounded-md p-2 border border-green-500/30">
                  <p className="text-xs text-gray-400 mb-0.5">味方の攻撃</p>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xl">{allyUnit.icon}</span>
                    <div>
                      <p className="text-xs text-gray-400">{allyUnit.name}</p>
                      <p className="text-2xl font-black text-green-400">{allyValue}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">名</p>
                </div>
                <div className="bg-black/40 rounded-md p-2 border border-red-500/30">
                  <p className="text-xs text-gray-400 mb-0.5">敵軍の攻撃</p>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-xl">{enemyUnit.icon}</span>
                    <div>
                      <p className="text-xs text-gray-400">{enemyUnit.name}</p>
                      <p className="text-2xl font-black text-red-400">{enemyValue}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">名</p>
                </div>
              </div>

              <div className="bg-black/40 rounded-md p-2 border border-white/10 text-center">
                <p className="text-xs text-gray-400 mb-0.5">差分</p>
                <p className={`text-3xl font-black ${
                  (allyValue - enemyValue) > 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {(allyValue - enemyValue) > 0 ? '+' : ''}{allyValue - enemyValue}
                </p>
              </div>
              
              {isTank && (
                <div className="mt-2 bg-yellow-900/30 border-2 border-yellow-500/50 rounded-md p-2 text-center">
                  <p className="text-yellow-300 font-black text-base">
                    🚗 戦車隊ボーナス！
                  </p>
                  <p className="text-yellow-200 text-xs mt-0.5">
                    圧倒的な戦力で確定勝利！
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 石高変動カード */}
        {showContent && !isSaving && (
          <div className="relative group mb-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className={`absolute inset-0 bg-gradient-to-r ${
              isWin ? 'from-yellow-600 to-orange-600' : 'from-gray-600 to-gray-700'
            } rounded-lg blur-md opacity-50`} />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-lg p-4 border-2 border-white/20">
              <h2 className="text-sm font-black text-white mb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                石高変動
              </h2>

              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-0.5">変動前</p>
                  <p className="text-3xl font-black text-white">{beforeKoku}</p>
                  <p className="text-xs text-gray-400 mt-0.5">万石</p>
                </div>

                <div className="text-2xl">→</div>

                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-0.5">変動後</p>
                  <p className={`text-3xl font-black ${
                    isWin ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {afterKoku}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">万石</p>
                </div>
              </div>

              <div className={`p-2 rounded-md border-2 text-center ${
                isWin 
                  ? 'bg-green-950/30 border-green-500/50' 
                  : 'bg-red-950/30 border-red-500/50'
              }`}>
                <p className={`text-xl font-black ${
                  isWin ? 'text-green-300' : 'text-red-300'
                }`}>
                  {isWin ? '🎁 ' : '💔 '}
                  {kokuChange > 0 ? '+' : ''}{kokuChange}万石
                  {isWin ? ' 獲得!' : ' 失う...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ランキング変動カード */}
        {showContent && !isSaving && (
          <div className="relative group mb-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur-md opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-lg p-4 border-2 border-white/20">
              <h2 className="text-sm font-black text-white mb-2 flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-purple-400" />
                ランキング変動
              </h2>

              <div className="flex items-center justify-center gap-3">
                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-0.5">変動前</p>
                  <div className="flex items-center gap-1.5 justify-center">
                    {beforeRank <= 3 && (
                      <span className="text-2xl">
                        {beforeRank === 1 ? '🥇' : beforeRank === 2 ? '🥈' : '🥉'}
                      </span>
                    )}
                    <p className="text-3xl font-black text-white">{beforeRank}</p>
                    <p className="text-base text-gray-400">位</p>
                  </div>
                </div>

                <div className="text-center">
                  {rankChange < 0 ? (
                    <TrendingUp className="w-8 h-8 text-green-400" />
                  ) : rankChange > 0 ? (
                    <TrendingDown className="w-8 h-8 text-red-400" />
                  ) : (
                    <div className="w-8 h-8 flex items-center justify-center">
                      <div className="w-5 h-0.5 bg-gray-500 rounded-full" />
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-xs text-gray-400 mb-0.5">変動後</p>
                  <div className="flex items-center gap-1.5 justify-center">
                    {afterRank <= 3 && (
                      <span className="text-2xl">
                        {afterRank === 1 ? '🥇' : afterRank === 2 ? '🥈' : '🥉'}
                      </span>
                    )}
                    <p className={`text-3xl font-black ${
                      rankChange < 0 ? 'text-green-400' : 
                      rankChange > 0 ? 'text-red-400' : 
                      'text-white'
                    }`}>
                      {afterRank}
                    </p>
                    <p className="text-base text-gray-400">位</p>
                  </div>
                </div>
              </div>

              <p className="text-center text-gray-400 mt-2 text-xs">
                {rankChange < 0 && `⬆️ ${Math.abs(rankChange)}ランクアップ!`}
                {rankChange > 0 && `⬇️ ${rankChange}ランクダウン...`}
                {rankChange === 0 && '変動なし'}
              </p>
            </div>
          </div>
        )}

        {/* コスト表示 */}
        {showContent && (
          <div className="relative group mb-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg blur-md opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-lg p-3 border-2 border-orange-500/50">
              <h2 className="text-xs font-black text-white mb-1.5 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                コスト
              </h2>
              <div className="text-center">
                <p className="text-xl font-black text-orange-300">💰 50P 支払い</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  今日の攻撃残り: {attacksLeft}/20回
                </p>
              </div>
            </div>
          </div>
        )}

        {/* アクションボタン */}
        {showButtons && (
          <div className="space-y-2.5 animate-fade-in">
            <Link 
              href="/koku-tournament"
              className="block relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-md blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-black/40 backdrop-blur-sm border-2 border-cyan-500/50 rounded-md py-2.5 hover:border-cyan-500 transition-colors">
                <p className="font-black text-white text-base text-center flex items-center justify-center gap-1.5">
                  <Home className="w-4 h-4" />
                  ホームに戻る
                </p>
              </div>
            </Link>

            {attacksLeft > 0 && (
              <Link 
                href="/koku-tournament/game/battle/opponent"
                className="block relative group"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${
                  isWin ? 'from-green-600 to-emerald-600' : 'from-red-600 to-rose-600'
                } rounded-md blur-md opacity-75 group-hover:opacity-100 transition-opacity`} />
                <div className={`relative bg-black/40 backdrop-blur-sm border-2 ${
                  isWin ? 'border-green-500/50 hover:border-green-500' : 'border-red-500/50 hover:border-red-500'
                } rounded-md py-2.5 transition-colors`}>
                  <p className="font-black text-white text-base text-center flex items-center justify-center gap-1.5">
                    <Swords className="w-4 h-4" />
                    {isWin ? 'もう一度挑戦' : 'リベンジする'}
                  </p>
                </div>
              </Link>
            )}
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
          animation: fade-in 0.5s ease-out forwards;
        }
        @keyframes confetti {
          0% {
            transform: translateY(-10vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(110vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}