'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { 
  Swords, Trophy, Target, Users, TrendingUp, Zap, Shield, 
  ChevronRight, Calendar, Flame, Coins, DollarSign, Info, X,
  History, Crown, TrendingDown, Medal
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
]

type RankingPlayer = {
  user_id: string
  player_name: string
  current_koku: number
  total_matches: number
  total_wins: number
  total_losses: number
  rank: number
  winRate: number
  kokuChange: number
}

type BattleMatch = {
  id: string
  challenger_name: string
  defender_name: string
  result: string
  koku_change: number
  created_at: string
  ally_type: string
  enemy_type: string
  ally_roll: number
  enemy_roll: number
  is_tank: boolean
}

export default function KokuTournamentDashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [daysLeft, setDaysLeft] = useState(0)
  const [showRuleModal, setShowRuleModal] = useState<typeof GAME_INFO[0] | null>(null)
  const [treasurePot, setTreasurePot] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // 新規追加
  const [rankings, setRankings] = useState<RankingPlayer[]>([])
  const [recentMatches, setRecentMatches] = useState<BattleMatch[]>([])
  const [showRankingModal, setShowRankingModal] = useState(false)
  const [showHistoryModal, setShowHistoryModal] = useState(false)

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
          await initializePlayer()
          await loadDashboardData()
          return
        }
        throw new Error(playerResult.error)
      }

      setUser(playerResult.data)

      // トーナメント情報を取得
      const tournamentResponse = await fetch('/koku-tournament/info', {
        cache: 'no-store'
      })
      const tournamentResult = await tournamentResponse.json()

      console.log('=== Tournament Info ===')
      console.log('Response:', tournamentResult)

      if (tournamentResult.success) {
        console.log('Setting treasurePot to:', tournamentResult.data.totalPot)
        setTreasurePot(tournamentResult.data.totalPot)
        setDaysLeft(tournamentResult.data.daysLeft)
      }

      // ランキングを取得
      const rankingResponse = await fetch('/koku-tournament/ranking')
      const rankingResult = await rankingResponse.json()
      
      if (rankingResult.success) {
        setRankings(rankingResult.data)
      }

      // 最近の対戦履歴を取得
      const historyResponse = await fetch('/koku-tournament/history?limit=10')
      const historyResult = await historyResponse.json()
      
      if (historyResult.success) {
        setRecentMatches(historyResult.data)
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (minutes < 1) return 'たった今'
    if (minutes < 60) return `${minutes}分前`
    if (hours < 24) return `${hours}時間前`
    return `${Math.floor(hours / 24)}日前`
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
      <div className="absolute inset-0 bg-[url('/brick-texture.png')] opacity-10" />

      {/* ルールモーダル */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
             onClick={() => setShowRuleModal(null)}>
          <div className="relative max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-xl opacity-75" />
            <div className="relative bg-black/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-red-500/50">
              <button
                onClick={() => setShowRuleModal(null)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <h3 className="text-2xl font-black text-white mb-4">{showRuleModal.ruleTitle}</h3>
              <p className="text-sm text-gray-300 whitespace-pre-line leading-relaxed">
                {showRuleModal.ruleDescription}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ランキングモーダル */}
      {showRankingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
             onClick={() => setShowRankingModal(false)}>
          <div className="relative max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur-xl opacity-75" />
            <div className="relative bg-black/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-yellow-500/50">
              <button
                onClick={() => setShowRankingModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                全体ランキング
              </h3>
              <div className="space-y-2">
                {rankings.map((player) => (
                  <div key={player.user_id}
                       className={`p-3 rounded-xl border-2 ${
                         player.user_id === user.userId 
                           ? 'bg-red-950/50 border-red-500/50' 
                           : 'bg-white/5 border-white/10'
                       }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {player.rank <= 3 ? (
                          <span className="text-3xl">
                            {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          <div className="w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                            <p className="text-lg font-black text-white">{player.rank}</p>
                          </div>
                        )}
                        <div>
                          <p className="font-black text-white">{player.player_name}</p>
                          <p className="text-xs text-gray-400">
                            {player.total_matches}戦 {player.total_wins}勝{player.total_losses}敗
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-yellow-400">{player.current_koku}</p>
                        <p className="text-xs text-gray-400">万石</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 履歴モーダル */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowHistoryModal(false)}>
          <div className="relative max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-75" />
            <div className="relative bg-black/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-500/50">
              <button
                onClick={() => setShowHistoryModal(false)}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
              <h3 className="text-2xl font-black text-white mb-4 flex items-center gap-2">
                <History className="w-6 h-6 text-purple-400" />
                最近の対戦履歴
              </h3>
              <div className="space-y-3">
                {recentMatches.map((match) => (
                  <div key={match.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-400">{formatDate(match.created_at)}</p>
                      {match.is_tank && (
                        <span className="text-xs bg-yellow-600/30 text-yellow-300 px-2 py-0.5 rounded flex items-center gap-1">
                          🚗 戦車隊出撃
                        </span>
                      )}
                    </div>
                    <div className="mb-2">
                      <p className="font-bold text-white text-lg">
                        {match.challenger_name}が{GAME_INFO[0].name}で宣戦布告
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      match.result === 'win' 
                        ? 'bg-green-600/20 border-2 border-green-500/50' 
                        : 'bg-red-600/20 border-2 border-red-500/50'
                    }`}>
                      <p className={`font-bold text-center ${
                        match.result === 'win' ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {match.result === 'win' 
                          ? `🎉 勝負に勝って ${match.koku_change > 0 ? '+' : ''}${match.koku_change}万石を手に入れた！` 
                          : `💔 勝負に負けて ${match.koku_change}万石を失った...`
                        }
                      </p>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-black/30 rounded p-2 text-center">
                        <p className="text-gray-400">攻撃側</p>
                        <p className="text-white font-bold">{match.challenger_name}</p>
                        <p className="text-gray-400 text-xs">{match.ally_roll}名討伐</p>
                      </div>
                      <div className="bg-black/30 rounded p-2 text-center">
                        <p className="text-gray-400">防御側</p>
                        <p className="text-white font-bold">{match.defender_name}</p>
                        <p className="text-gray-400 text-xs">{match.enemy_roll}名討伐</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
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
              style={{ textShadow: '0 0 40px rgba(239, 68, 68, 0.9)', letterSpacing: '0.05em' }}>
            石高トーナメント
          </h1>
          <p className="text-lg text-red-300/80 mb-4">
            {new Date().getFullYear()}年{new Date().getMonth() + 1}月
          </p>
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
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/40 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-gray-400 mb-1">総試合数</p>
                <p className="text-2xl font-black text-white">{user.totalMatches}</p>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-gray-400 mb-1">消費P</p>
                <p className="text-2xl font-black text-yellow-400">{user.totalPSpent || 0}P</p>
              </div>
            </div>
          </div>
        </div>

        {/* トップ3ランキング */}
        <div className="relative group mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-yellow-500/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                トップ3
              </h2>
              <button
                onClick={() => setShowRankingModal(true)}
                className="text-sm text-yellow-300 hover:text-yellow-200 flex items-center gap-1"
              >
                全体を見る
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-3">
              {rankings.slice(0, 3).map((player) => (
                <div key={player.user_id} className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">
                        {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                      </span>
                      <div>
                        <p className="font-black text-white">{player.player_name}</p>
                        <p className="text-xs text-gray-400">
                          {player.total_matches}戦 {player.winRate}%
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-yellow-400">{player.current_koku}</p>
                      <p className="text-xs text-gray-400">万石</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 最近の対戦 */}
        <div className="relative group mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-500/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <History className="w-6 h-6 text-purple-400" />
                最近の対戦
              </h2>
              <button
                onClick={() => setShowHistoryModal(true)}
                className="text-sm text-purple-300 hover:text-purple-200 flex items-center gap-1"
              >
                もっと見る
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2">
              {recentMatches.slice(0, 5).map((match) => (
                <div key={match.id} className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-white font-bold text-sm">
                        {match.challenger_name}が{GAME_INFO[0].name}で宣戦布告
                      </p>
                      <p className={`text-xs mt-1 ${
                        match.result === 'win' ? 'text-green-300' : 'text-red-300'
                      }`}>
                        {match.result === 'win' 
                          ? `勝負に勝って${match.koku_change > 0 ? '+' : ''}${match.koku_change}万石を手に入れた` 
                          : `勝負に負けて${match.koku_change}万石を失った`
                        }
                      </p>
                    </div>
                    {match.is_tank && (
                      <span className="ml-2 text-xl">🚗</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{formatDate(match.created_at)}</p>
                </div>
              ))}
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
                <div key={game.id} className="w-full group/card relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${game.bgGradient} rounded-xl blur-lg opacity-50 group-hover/card:opacity-75 transition-opacity`} />
                  <div className={`relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 ${game.borderColor}/50 hover:${game.borderColor} group-hover/card:scale-[1.02] transition-all`}>
                    <div className="flex items-center justify-between">
                      <button 
                        onClick={() => handleGameSelect(game.id)}
                        disabled={user.attacksToday >= user.maxAttacks}
                        className="flex items-center gap-4 flex-1 text-left"
                      >
                        <div className="text-4xl">{game.icon}</div>
                        <div>
                          <p className="text-xl font-black text-white">{game.name}</p>
                          <p className="text-sm text-gray-400">「{game.subtitle}」</p>
                        </div>
                      </button>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            setShowRuleModal(game)
                          }}
                          className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                          <Info className="w-5 h-5 text-white" />
                        </button>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">{game.description}</p>
                  </div>
                </div>
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