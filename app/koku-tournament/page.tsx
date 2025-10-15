'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { 
  Swords, Trophy, Target, Users, TrendingUp, Zap, Shield, 
  ChevronRight, Calendar, Flame, Coins, DollarSign, Info, X
} from 'lucide-react'

const GAME_INFO = [
  {
    id: 'battle',
    name: '壱之陣',
    subtitle: '合戦',
    icon: '⚔️',
    stake: '±1万石',
    winRate: '57.5%',
    cost: '50P',
    bgGradient: 'from-red-600 to-rose-600',
    borderColor: 'border-red-500',
    description: '兵種の数で勝負。安定した勝率。',
    ruleTitle: '合戦のルール',
    ruleDescription: `討ち取った兵の数で勝敗が決まる白熱の合戦！

🚩 足軽隊: 1〜60名（弱いが、敵が足軽なら有利）
🐴 騎馬隊: 30〜80名（バランス型、互角の勝負）
🔫 鉄砲隊: 50〜100名（強力だが、敵も鉄砲なら劣勢）

敵に強い兵種が来たらピンチ！でも安心してください...

🚗 15%の確率で味方に「戦車隊」が参戦！
→ 999名を討ち取り、確定勝利の大逆転！

最後までハラハラドキドキの戦いを楽しもう！`
  },
  // ... 他のゲームは省略
]

export default function KokuTournamentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [daysLeft, setDaysLeft] = useState(0)
  const [showRuleModal, setShowRuleModal] = useState<typeof GAME_INFO[0] | null>(null)
  const [treasurePot, setTreasurePot] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
    loadDashboardData()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    }
  }

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // プレイヤーデータを取得
      const playerResponse = await fetch('/koku-tournament/player-data')
      const playerResult = await playerResponse.json()

      if (!playerResult.success) {
        if (playerResult.needsInitialization) {
          // 初期化が必要な場合、初期化APIを呼ぶ
          await initializePlayer()
          await loadDashboardData() // 再読み込み
          return
        }
        throw new Error(playerResult.error)
      }

      setUser(playerResult.data)

      // トーナメント情報を取得
      const tournamentResponse = await fetch('/koku-tournament/info')
      const tournamentResult = await tournamentResponse.json()

      if (tournamentResult.success) {
        setTreasurePot(tournamentResult.data.totalPot)
        setDaysLeft(tournamentResult.data.daysLeft)
      }

    } catch (error: any) {
      console.error('Load dashboard error:', error)
      setError(error.message || 'データの読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const initializePlayer = async () => {
    try {
      const response = await fetch('/koku-tournament/initialize', {
        method: 'POST'
      })
      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error)
      }
    } catch (error: any) {
      console.error('Initialize error:', error)
      setError(error.message)
    }
  }

  const handleGameSelect = (gameId: string) => {
    if (gameId !== 'battle') {
      alert('このゲームはまだ実装されていません')
      return
    }
    
    if (user && user.attacksToday >= user.maxAttacks) {
      alert('本日の攻撃回数を使い切りました')
      return
    }
    
    router.push(`/koku-tournament/game/battle/opponent`)
  }

  const openRuleModal = (game: typeof GAME_INFO[0], e: React.MouseEvent) => {
    e.stopPropagation()
    setShowRuleModal(game)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black flex items-center justify-center">
        <div className="text-white text-xl">読み込み中...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl"
          >
            再読み込み
          </button>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black relative overflow-hidden">
      {/* 背景エフェクトは省略 */}

      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
             onClick={() => setShowRuleModal(null)}>
          {/* モーダルの中身は元のまま */}
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        
        {/* タイトル */}
        <div className="text-center mb-8">
          <div className="inline-block relative group mb-4">
            <div className="absolute inset-0 bg-red-600 rounded-full blur-2xl opacity-75 animate-pulse" />
            <div className="relative text-8xl filter drop-shadow-2xl">🏯</div>
          </div>
          <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-200 via-orange-200 to-yellow-200 mb-2"
              style={{ textShadow: '0 0 40px rgba(239, 68, 68, 0.9)', letterSpacing: '0.05em', fontFamily: "'Noto Serif JP', serif" }}>
            石高トーナメント
          </h1>
          <p className="text-lg text-red-300/80 mb-4">2025年2月</p>
          <div className="flex items-center justify-center gap-4">
            <div className="px-4 py-2 bg-orange-600/20 border-2 border-orange-500/50 rounded-full">
              <p className="text-sm font-black text-orange-300 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                残り {daysLeft}日
              </p>
            </div>
            <div className="px-4 py-2 bg-red-600/20 border-2 border-red-500/50 rounded-full">
              <p className="text-sm font-black text-red-300 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {user.totalPlayers}名参加中
              </p>
            </div>
          </div>
        </div>

        {/* 宝物庫 */}
        <div className="relative group mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 rounded-2xl blur-xl opacity-75 animate-pulse" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-yellow-500/50">
            <h2 className="text-xl font-black text-white mb-3 flex items-center gap-2">
              <Coins className="w-6 h-6 text-yellow-400" />
              宝物庫（賞金総額）
            </h2>
            <div className="flex items-baseline justify-center gap-2 mb-3">
              <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200"
                 style={{ textShadow: '0 0 30px rgba(251, 191, 36, 0.8)' }}>
                {treasurePot.toLocaleString()}
              </p>
              <p className="text-2xl font-bold text-yellow-300/80">P</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-yellow-950/30 rounded-lg p-2 border border-yellow-500/30">
                <p className="text-xs text-yellow-300/80 mb-1">1位</p>
                <p className="text-lg font-black text-yellow-300">50%</p>
              </div>
              <div className="bg-orange-950/30 rounded-lg p-2 border border-orange-500/30">
                <p className="text-xs text-orange-300/80 mb-1">2位</p>
                <p className="text-lg font-black text-orange-300">35%</p>
              </div>
              <div className="bg-red-950/30 rounded-lg p-2 border border-red-500/30">
                <p className="text-xs text-red-300/80 mb-1">3位</p>
                <p className="text-lg font-black text-red-300">15%</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 text-center mt-3">月末に上位3名で山分け！</p>
          </div>
        </div>

        {/* あなたの領地 */}
        <div className="relative group mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-red-500/50">
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <Shield className="w-6 h-6 text-red-400" />
              あなたの領地
            </h2>
            <div className="mb-6">
              <p className="text-sm text-gray-400 mb-2">石高</p>
              <div className="flex items-baseline gap-2">
                <p className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-orange-200"
                   style={{ textShadow: '0 0 30px rgba(251, 191, 36, 0.8)' }}>
                  {user.koku}
                </p>
                <p className="text-2xl font-bold text-yellow-300/80">万石</p>
              </div>
              <div className="mt-3 relative h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-yellow-500" 
                     style={{ width: `${Math.min((user.koku / 150) * 100, 100)}%` }} />
              </div>
              <p className="text-xs text-gray-500 mt-1">初期値: 100万石</p>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-black/40 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-gray-400 mb-1">現在順位</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-black text-white">{user.rank}</p>
                  <p className="text-lg text-gray-400">位</p>
                </div>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-gray-400 mb-1">今日の攻撃</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-black text-white">{user.attacksToday}</p>
                  <p className="text-lg text-gray-400">/ {user.maxAttacks}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 宣戦布告 */}
        <div className="relative group mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-red-500/50">
            <h2 className="text-xl font-black text-white mb-2 flex items-center gap-2">
              <Swords className="w-6 h-6 text-red-400" />
              宣戦布告
            </h2>
            <p className="text-sm text-gray-400 mb-4">ゲームを選んで相手に挑戦しよう</p>
            {user.attacksToday >= user.maxAttacks && (
              <div className="mb-4 p-3 bg-red-950/50 border-2 border-red-500/50 rounded-xl">
                <p className="text-sm font-bold text-red-300 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  本日の攻撃回数を使い切りました
                </p>
              </div>
            )}
            <div className="space-y-3">
              {GAME_INFO.map((game) => (
                <button key={game.id} onClick={() => handleGameSelect(game.id)}
                        disabled={user.attacksToday >= user.maxAttacks}
                        className="w-full group/card relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${game.bgGradient} rounded-xl blur-lg opacity-50 group-hover/card:opacity-75`} />
                  <div className={`relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 ${game.borderColor}/50 hover:${game.borderColor} group-hover/card:scale-[1.02] transition-all`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{game.icon}</div>
                        <div className="text-left">
                          <p className="text-xl font-black text-white">{game.name}</p>
                          <p className="text-sm text-gray-400">「{game.subtitle}」</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => openRuleModal(game, e)}
                                className="p-2 bg-white/10 hover:bg-white/20 rounded-full">
                          <Info className="w-5 h-5 text-white" />
                        </button>
                        <ChevronRight className="w-6 h-6 text-white group-hover/card:translate-x-1 transition-transform" />
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">{game.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <Link href="/dashboard"
              className="block w-full text-center py-3 bg-gray-800/50 hover:bg-gray-800 text-gray-400 hover:text-white rounded-xl transition-colors">
          メインダッシュボードに戻る
        </Link>

      </div>
    </div>
  )
}