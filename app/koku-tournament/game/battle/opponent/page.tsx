'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, Swords, Search, Crown, Trophy, 
  TrendingUp, Shield, Target, Flame, ChevronRight
} from 'lucide-react'

const GAME_INFO = {
  id: 'battle',
  name: '壱之陣',
  subtitle: '合戦',
  icon: '⚔️',
  stake: '±1万石',
  winRate: '57.5%',
  cost: '50P',
  color: 'red',
  bgGradient: 'from-red-600 to-rose-600',
  borderColor: 'border-red-500'
}

type Player = {
  id: string
  username: string
  rank: number
  koku: number
  winRate: number
  totalMatches: number
  recentForm: boolean[]
  isMe?: boolean
  avatarUrl?: string | null
}

export default function OpponentSelectPage() {
  const router = useRouter()
  const [players, setPlayers] = useState<Player[]>([])
  const [myInfo, setMyInfo] = useState<Player | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [attacksLeft, setAttacksLeft] = useState(20)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadOpponents()
  }, [])

  useEffect(() => {
    if (searchQuery === '') {
      setFilteredPlayers(players)
    } else {
      setFilteredPlayers(
        players.filter(p => 
          p.username.toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }
  }, [searchQuery, players])

  const loadOpponents = async () => {
    try {
      setIsLoading(true)
      
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.push('/login')
        return
      }

      const response = await fetch(`/api/koku-tournament/opponents?userId=${session.user.id}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error)
      }

      setPlayers(result.opponents)
      setMyInfo(result.myInfo)
      setAttacksLeft(20 - result.myInfo.attacksToday)

    } catch (error: any) {
      console.error('Load opponents error:', error)
      setError(error.message || '対戦相手の読み込みに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectOpponent = (playerId: string) => {
    if (myInfo?.id === playerId) return
    
    setSelectedPlayer(playerId)
    setShowConfirmModal(true)
  }

  const handleConfirmChallenge = () => {
    if (!selectedPlayer) return
    
    const opponent = players.find(p => p.id === selectedPlayer)
    if (!opponent) return

    // 相手の情報をクエリパラメータで渡す
    router.push(
      `/koku-tournament/game/battle/phase1?` +
      `opponentId=${opponent.id}&` +
      `opponentName=${encodeURIComponent(opponent.username)}`
    )
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-950 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/brick-texture.png')] opacity-10" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-conic-gradient(#8B4513 0% 25%, transparent 0% 50%)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        
        <div className="flex items-center gap-4 mb-6">
          <Link 
            href="/koku-tournament"
            className="p-2 bg-black/40 hover:bg-black/60 border border-white/20 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-black text-white">相手を選択</h1>
            <p className="text-sm text-gray-400">{GAME_INFO.name}「{GAME_INFO.subtitle}」</p>
          </div>
        </div>

        <div className="relative group mb-6">
          <div className={`absolute inset-0 bg-gradient-to-r ${GAME_INFO.bgGradient} rounded-2xl blur-xl opacity-50`} />
          <div className={`relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 ${GAME_INFO.borderColor}/50`}>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-5xl">{GAME_INFO.icon}</div>
              <div className="flex-1">
                <p className="text-2xl font-black text-white">{GAME_INFO.name}</p>
                <p className="text-sm text-gray-400">「{GAME_INFO.subtitle}」</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-black/40 rounded-xl p-3 border border-white/10 text-center">
                <p className="text-xs text-gray-400 mb-1">賭け金</p>
                <p className="text-lg font-black text-white">{GAME_INFO.stake}</p>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-white/10 text-center">
                <p className="text-xs text-gray-400 mb-1">勝率</p>
                <p className="text-lg font-black text-green-400">{GAME_INFO.winRate}</p>
              </div>
              <div className="bg-black/40 rounded-xl p-3 border border-white/10 text-center">
                <p className="text-xs text-gray-400 mb-1">コスト</p>
                <p className="text-lg font-black text-yellow-400">{GAME_INFO.cost}</p>
              </div>
            </div>

            <div className="bg-orange-950/30 border-2 border-orange-500/30 rounded-xl p-3">
              <p className="text-sm font-bold text-orange-300 flex items-center gap-2">
                <Flame className="w-4 h-4" />
                今日の攻撃残り: {attacksLeft}/20回
              </p>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 bg-cyan-600 rounded-xl blur-lg opacity-30" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-xl border-2 border-cyan-500/50 p-1 flex items-center gap-2">
            <Search className="w-5 h-5 text-cyan-400 ml-3" />
            <input
              type="text"
              placeholder="プレイヤー名で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent text-white placeholder-gray-500 py-2 px-2 outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="mr-3 text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/50">
            <h2 className="text-lg font-black text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-400" />
              挑戦可能なプレイヤー
            </h2>

            <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
              {/* 自分の情報を表示 */}
              {myInfo && (
                <div className="w-full relative opacity-50 cursor-not-allowed">
                  <div className="absolute inset-0 rounded-xl blur-lg opacity-50 bg-red-600" />
                  <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-red-500/50">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {myInfo.rank <= 3 ? (
                          <span className="text-4xl">
                            {myInfo.rank === 1 ? '🥇' : myInfo.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                            <p className="text-xl font-black text-white">{myInfo.rank}</p>
                          </div>
                        )}
                        <div className="text-left">
                          <p className="text-xl font-black text-white flex items-center gap-2">
                            {myInfo.username}
                            <span className="px-2 py-0.5 bg-red-600/30 border border-red-500/50 rounded text-xs">
                              自分
                            </span>
                          </p>
                          <p className="text-sm text-gray-400">
                            石高 {myInfo.koku}万石
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-black/40 rounded-lg p-2 border border-white/10 text-center">
                        <p className="text-xs text-gray-400">順位</p>
                        <p className="text-lg font-black text-white">{myInfo.rank}位</p>
                      </div>
                      <div className="bg-black/40 rounded-lg p-2 border border-white/10 text-center">
                        <p className="text-xs text-gray-400">勝率</p>
                        <p className="text-lg font-black text-green-400">{myInfo.winRate}%</p>
                      </div>
                      <div className="bg-black/40 rounded-lg p-2 border border-white/10 text-center">
                        <p className="text-xs text-gray-400">総試合</p>
                        <p className="text-lg font-black text-cyan-400">{myInfo.totalMatches}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-1">直近5戦</p>
                      <div className="flex gap-1">
                        {myInfo.recentForm.map((win, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 h-2 rounded-full ${
                              win ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 text-center">
                      <p className="text-sm text-gray-500">自分には挑戦できません</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 他のプレイヤー */}
              {filteredPlayers.map((player) => (
                <button
                  key={player.id}
                  onClick={() => handleSelectOpponent(player.id)}
                  className="w-full group/card relative"
                >
                  <div className={`absolute inset-0 rounded-xl blur-lg opacity-50 transition-opacity ${
                    player.rank === 1 ? 'bg-yellow-600' :
                    player.rank === 2 ? 'bg-gray-400' :
                    player.rank === 3 ? 'bg-orange-600' :
                    'bg-blue-600'
                  } group-hover/card:opacity-75`} />
                  
                  <div className={`relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 transition-all ${
                    player.rank === 1 ? 'border-yellow-500/50 hover:border-yellow-500' :
                    player.rank === 2 ? 'border-gray-400/50 hover:border-gray-400' :
                    player.rank === 3 ? 'border-orange-500/50 hover:border-orange-500' :
                    'border-blue-500/50 hover:border-blue-500'
                  } group-hover/card:scale-[1.02]`}>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {player.rank <= 3 ? (
                          <span className="text-4xl">
                            {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-full flex items-center justify-center">
                            <p className="text-xl font-black text-white">{player.rank}</p>
                          </div>
                        )}

                        <div className="text-left">
                          <p className="text-xl font-black text-white">
                            {player.username}
                          </p>
                          <p className="text-sm text-gray-400">
                            石高 {player.koku}万石
                          </p>
                        </div>
                      </div>

                      <ChevronRight className="w-6 h-6 text-white group-hover/card:translate-x-1 transition-transform" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="bg-black/40 rounded-lg p-2 border border-white/10 text-center">
                        <p className="text-xs text-gray-400">順位</p>
                        <p className="text-lg font-black text-white">{player.rank}位</p>
                      </div>
                      <div className="bg-black/40 rounded-lg p-2 border border-white/10 text-center">
                        <p className="text-xs text-gray-400">勝率</p>
                        <p className="text-lg font-black text-green-400">{player.winRate}%</p>
                      </div>
                      <div className="bg-black/40 rounded-lg p-2 border border-white/10 text-center">
                        <p className="text-xs text-gray-400">総試合</p>
                        <p className="text-lg font-black text-cyan-400">{player.totalMatches}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-400 mb-1">直近5戦</p>
                      <div className="flex gap-1">
                        {player.recentForm.map((win, idx) => (
                          <div
                            key={idx}
                            className={`flex-1 h-2 rounded-full ${
                              win ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {filteredPlayers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">該当するプレイヤーが見つかりません</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {showConfirmModal && selectedPlayer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-xl opacity-75" />
            <div className="relative bg-black/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-red-500/50">
              <h3 className="text-2xl font-black text-white mb-4 text-center">
                宣戦布告の確認
              </h3>

              <div className="mb-6 space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-400">ゲーム</span>
                  <span className="font-black text-white">{GAME_INFO.name}「{GAME_INFO.subtitle}」</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-400">相手</span>
                  <span className="font-black text-white">
                    {players.find(p => p.id === selectedPlayer)?.username}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-400">賭け金</span>
                  <span className="font-black text-white">{GAME_INFO.stake}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-gray-400">コスト</span>
                  <span className="font-black text-yellow-400">{GAME_INFO.cost}</span>
                </div>
              </div>

              <div className="mb-6 p-4 bg-orange-950/30 border-2 border-orange-500/50 rounded-xl">
                <p className="text-sm text-orange-300 text-center">
                  ⚠️ 結果に関わらず{GAME_INFO.cost}が消費されます
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-bold transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleConfirmChallenge}
                  className="flex-1 relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                  <div className="relative py-3 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl font-black text-white">
                    宣戦布告する!
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(239, 68, 68, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.8);
        }
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}