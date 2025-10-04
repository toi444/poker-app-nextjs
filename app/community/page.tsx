'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Trophy, 
  TrendingUp, 
  Award, 
  Users, 
  Clock, 
  DollarSign, 
  Calendar,
  Sparkles,
  Target,
  CreditCard,
  User
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts'

interface Profile {
  id: string
  username: string
  email: string
  active: boolean
  avatar_url?: string
  equipped_badge?: {
    id: string
    name: string
    icon: string
    badge_gradient: string
    tier: string
  } | null
}

interface GameSession {
  id: string
  user_id: string
  played_at: string
  play_hours: number
  buy_in: number
  cash_out: number
  profit: number
  profiles?: Profile
}

interface JackpotWinner {
  id: string
  user_id: string
  amount: number
  hand_type: string
  hand_cards: string
  board_cards: string
  created_at: string
  profiles?: Profile
}

const AvatarIcon = ({ profile, size = 'sm' }: { profile?: Profile | null, size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16'
  }
  
  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }
  
  const badgeSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  }
  
  const badgeIconSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }
  
  const getBorderGradient = () => {
    if (profile?.equipped_badge) {
      return `bg-gradient-to-r ${profile.equipped_badge.badge_gradient}`
    }
    return 'bg-gradient-to-r from-purple-500 to-pink-500'
  }
  
  return (
    <div className="relative flex-shrink-0">
      <div className={`${sizeClasses[size]} rounded-full ${getBorderGradient()} p-0.5`}>
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.username}
            className="w-full h-full rounded-full object-cover bg-black"
          />
        ) : (
          <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
            <User className={`${iconSizes[size]} text-purple-300`} />
          </div>
        )}
      </div>
      
      {/* バッジアイコン */}
      {profile?.equipped_badge && (
        <div className={`absolute -bottom-0.5 -right-0.5 ${badgeSizes[size]} rounded-full flex items-center justify-center border border-white shadow-lg ${getBorderGradient()}`}>
          <Award className={`${badgeIconSizes[size]} text-white`} />
        </div>
      )}
    </div>
  )
}

export default function CommunityPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [currentJackpot, setCurrentJackpot] = useState(0)
  const [latestWinner, setLatestWinner] = useState<JackpotWinner | null>(null)
  const [allJackpotWinners, setAllJackpotWinners] = useState<JackpotWinner[]>([])
  const [totalStats, setTotalStats] = useState({
    totalHours: 0,
    totalBuyin: 0,
    activePlayers: 0
  })
  const [allTimeRanking, setAllTimeRanking] = useState<any[]>([])
  const [monthlyRanking, setMonthlyRanking] = useState<any[]>([])
  const [bigWins, setBigWins] = useState<GameSession[]>([])
  const [bigLosses, setBigLosses] = useState<GameSession[]>([])
  const [weekdayStats, setWeekdayStats] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState('ranking')

  useEffect(() => {
    loadCommunityData()
  }, [])

  const loadCommunityData = async () => {
    try {
      const { data: jpData } = await supabase
        .from('jackpot_pool')
        .select('current_amount')
        .single()
      
      if (jpData) {
        setCurrentJackpot(jpData.current_amount)
      }

      const { data: winnersData, error: winnersError } = await supabase
        .from('jackpot_winners')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (winnersError) {
        console.error('Error fetching winners:', winnersError)
      } else if (winnersData && winnersData.length > 0) {
        const winnersWithProfiles = await Promise.all(
          winnersData.map(async (winner) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username, active, avatar_url, equipped_badge(*)')
              .eq('id', winner.user_id)
              .single()
            
            return {
              ...winner,
              profiles: profileData
            }
          })
        )
        
        const activeWinners = winnersWithProfiles.filter(
          winner => winner.profiles && winner.profiles.active !== false
        )
        
        if (activeWinners.length > 0) {
          setAllJackpotWinners(activeWinners)
          setLatestWinner(activeWinners[0])
        }
      }

      const { data: allSessions } = await supabase
        .from('game_sessions')
        .select(`
          *,
          profiles(username, active, avatar_url, equipped_badge(*))
        `)
      
      const sessions = allSessions?.filter(s => 
        s.profiles && s.profiles.active !== false
      ) || []
      
      if (sessions.length > 0) {
        const totalHours = sessions.reduce((sum, s) => sum + Number(s.play_hours), 0)
        const totalBuyin = sessions.reduce((sum, s) => sum + s.buy_in, 0)
        const uniquePlayers = new Set(sessions.map(s => s.user_id)).size
        
        setTotalStats({
          totalHours,
          totalBuyin,
          activePlayers: uniquePlayers
        })

        const playerStats = new Map()
        sessions.forEach(session => {
          const userId = session.user_id
          const username = session.profiles?.username
          const avatar_url = session.profiles?.avatar_url
          const equipped_badge = session.profiles?.equipped_badge
          
          if (!playerStats.has(userId)) {
            playerStats.set(userId, {
              username,
              avatar_url,
              equipped_badge,
              totalProfit: 0,
              gamesPlayed: 0,
              totalHours: 0
            })
          }
          
          const stats = playerStats.get(userId)
          stats.totalProfit += session.profit
          stats.gamesPlayed += 1
          stats.totalHours += Number(session.play_hours)
          playerStats.set(userId, stats)
        })
        
        const rankingData = Array.from(playerStats.values())
          .sort((a, b) => b.totalProfit - a.totalProfit)
          .slice(0, 10)
        
        setAllTimeRanking(rankingData)

        const currentMonth = new Date().toISOString().slice(0, 7)
        const monthlySessions = sessions.filter(s => 
          s.played_at.startsWith(currentMonth)
        )
        
        const monthlyPlayerStats = new Map()
        monthlySessions.forEach(session => {
          const userId = session.user_id
          const username = session.profiles?.username
          const avatar_url = session.profiles?.avatar_url
          const equipped_badge = session.profiles?.equipped_badge
          
          if (!monthlyPlayerStats.has(userId)) {
            monthlyPlayerStats.set(userId, {
              username,
              avatar_url,
              equipped_badge,
              totalProfit: 0,
              gamesPlayed: 0
            })
          }
          
          const stats = monthlyPlayerStats.get(userId)
          stats.totalProfit += session.profit
          stats.gamesPlayed += 1
          monthlyPlayerStats.set(userId, stats)
        })
        
        const monthlyRankingData = Array.from(monthlyPlayerStats.values())
          .sort((a, b) => b.totalProfit - a.totalProfit)
          .slice(0, 5)
        
        setMonthlyRanking(monthlyRankingData)

        const topWins = [...sessions]
          .sort((a, b) => b.profit - a.profit)
          .slice(0, 5)
        setBigWins(topWins)

        const topLosses = [...sessions]
          .sort((a, b) => a.profit - b.profit)
          .slice(0, 5)
        setBigLosses(topLosses)

        const weekdayData = new Map()
        const weekdays = ['日', '月', '火', '水', '木', '金', '土']
        
        sessions.forEach(session => {
          const date = new Date(session.played_at)
          const weekday = weekdays[date.getDay()]
          
          if (!weekdayData.has(weekday)) {
            weekdayData.set(weekday, { count: 0, avgProfit: 0, totalProfit: 0 })
          }
          
          const stats = weekdayData.get(weekday)
          stats.count += 1
          stats.totalProfit += session.profit
          stats.avgProfit = stats.totalProfit / stats.count
        })
        
        const weekdayArray = weekdays.map(day => ({
          day,
          count: weekdayData.get(day)?.count || 0,
          avgProfit: weekdayData.get(day)?.avgProfit || 0
        }))
        
        setWeekdayStats(weekdayArray)
      }
      
    } catch (error) {
      console.error('Error loading community data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇'
      case 2: return '🥈'
      case 3: return '🥉'
      default: return `${rank}.`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-purple-500 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <div className="container max-w-md mx-auto px-4 py-6 pb-20">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="relative group"
          >
            <div className="absolute inset-0 bg-purple-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-12 h-12 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-purple-500/50 hover:border-purple-400 transition-all">
              <ArrowLeft className="w-6 h-6 text-purple-400" />
            </div>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-black text-white drop-shadow-glow flex items-center gap-2">
              <Trophy className="w-7 h-7 text-yellow-400 drop-shadow-glow" />
              Community
            </h1>
            <p className="text-sm text-purple-300">みんなの成績とランキング</p>
          </div>

          <div className="w-12" />
        </div>

        {/* ジャックポットカード */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 rounded-3xl blur-2xl opacity-75 animate-pulse" />
          <div className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 rounded-3xl p-1 shadow-2xl">
            <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6">
              <div className="text-center text-white">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <Sparkles className="w-7 h-7 drop-shadow-glow animate-bounce-slow" />
                  <h3 className="text-xl font-black drop-shadow-glow">MEGA JACKPOT</h3>
                  <Sparkles className="w-7 h-7 drop-shadow-glow animate-bounce-slow" />
                </div>
                <div className="text-6xl font-black mb-2 drop-shadow-glow">{currentJackpot.toLocaleString()}</div>
                <div className="text-xl font-bold opacity-90">POINTS</div>
              </div>
            </div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-orange-600 blur-lg opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-orange-500/50 text-center">
              <Clock className="w-7 h-7 text-orange-400 mx-auto mb-2 drop-shadow-glow" />
              <div className="text-3xl font-black text-orange-400 drop-shadow-glow">{totalStats.totalHours.toFixed(0)}</div>
              <div className="text-xs font-bold text-orange-300 mt-1">時間</div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-green-600 blur-lg opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-green-500/50 text-center">
              <DollarSign className="w-7 h-7 text-green-400 mx-auto mb-2 drop-shadow-glow" />
              <div className="text-3xl font-black text-green-400 drop-shadow-glow">{(totalStats.totalBuyin / 1000).toFixed(0)}k</div>
              <div className="text-xs font-bold text-green-300 mt-1">バイイン</div>
            </div>
          </div>
          <div className="relative group">
            <div className="absolute inset-0 bg-purple-600 blur-lg opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-purple-500/50 text-center">
              <Users className="w-7 h-7 text-purple-400 mx-auto mb-2 drop-shadow-glow" />
              <div className="text-3xl font-black text-purple-400 drop-shadow-glow">{totalStats.activePlayers}</div>
              <div className="text-xs font-bold text-purple-300 mt-1">プレイヤー</div>
            </div>
          </div>
        </div>

        {/* 最新ジャックポット獲得者 */}
        {latestWinner && (
          <div className="relative group mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl blur-xl opacity-75 animate-pulse" />
            <div className="relative bg-gradient-to-r from-pink-600 to-purple-600 rounded-3xl p-1 shadow-2xl">
              <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6">
                <div className="text-center text-white">
                  <p className="text-base font-bold mb-3 opacity-90 drop-shadow-glow">🎊 最新ジャックポット獲得者 🎊</p>
                  
                  <div className="flex justify-center mb-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl animate-pulse" />
                      <AvatarIcon profile={latestWinner.profiles} size="lg" />
                    </div>
                  </div>
                  
                  <p className="text-3xl font-black mb-2 drop-shadow-glow">{latestWinner.profiles?.username}さん</p>
                  <p className="text-xl font-bold mb-3 text-yellow-300 drop-shadow-glow">
                    {latestWinner.hand_type}
                  </p>
                  <div className="bg-black/40 rounded-2xl px-5 py-4 backdrop-blur-sm border-2 border-white/20">
                    <p className="text-4xl font-black mb-3 text-green-400 drop-shadow-glow">+{latestWinner.amount.toLocaleString()} P</p>
                    <div className="space-y-2 text-sm">
                      <p className="font-bold flex items-center justify-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        {latestWinner.hand_cards}
                      </p>
                      <p className="font-bold flex items-center justify-center gap-2">
                        <Trophy className="w-4 h-4" />
                        {latestWinner.board_cards}
                      </p>
                      <p className="text-xs opacity-80 mt-3 flex items-center justify-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(latestWinner.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* タブナビゲーション */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-purple-600 blur-lg opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-2 border-2 border-purple-500/50">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ranking', icon: Trophy, label: 'ランキング', color: 'yellow' },
                { id: 'stats', icon: TrendingUp, label: '統計', color: 'blue' },
                { id: 'records', icon: Award, label: '殿堂', color: 'pink' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-4 px-3 rounded-xl text-sm font-bold transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-xl scale-105 border-2 border-white/20'
                      : 'text-purple-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-6 h-6 mx-auto mb-1 drop-shadow-glow" />
                  <span className="text-xs drop-shadow-glow">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'ranking' && (
          <div className="space-y-5 animate-slide-in">
            {/* 今月のランキング */}
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-indigo-500/50">
                <h2 className="text-xl font-black mb-5 flex items-center gap-2 text-white drop-shadow-glow">
                  <Target className="w-6 h-6 text-indigo-400 drop-shadow-glow" />
                  今月のランキング
                </h2>
                <div className="space-y-3">
                  {monthlyRanking.map((player, idx) => (
                    <div key={idx} className="relative group">
                      <div className={`absolute inset-0 blur-lg opacity-50 ${idx < 3 ? 'bg-yellow-600' : 'bg-purple-600'}`} />
                      <div className={`relative flex items-center gap-3 p-4 rounded-xl backdrop-blur-sm border-2 hover:scale-105 transition-all ${idx < 3 ? 'bg-yellow-950/30 border-yellow-500/50' : 'bg-purple-950/30 border-purple-500/50'}`}>
                        <span className="text-2xl font-black w-10 text-white drop-shadow-glow">{idx + 1}.</span>
                        <AvatarIcon profile={{ username: player.username, avatar_url: player.avatar_url, equipped_badge: player.equipped_badge } as Profile} size="sm" />
                        <div className="flex-1">
                          <div className="font-bold text-white drop-shadow-glow">{player.username}</div>
                          <div className="text-xs font-semibold text-purple-300">{player.gamesPlayed}戦</div>
                        </div>
                        <div className={`px-4 py-2 rounded-full font-black ${
                          player.totalProfit >= 0 
                            ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white' 
                            : 'bg-gradient-to-r from-red-600 to-pink-600 text-white'
                        } shadow-lg drop-shadow-glow`}>
                          {player.totalProfit >= 0 ? '+' : ''}{player.totalProfit.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 総合収支ランキング */}
            <div className="relative group">
              <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-500/50">
                <h2 className="text-xl font-black mb-5 flex items-center gap-2 text-white drop-shadow-glow">
                  <Trophy className="w-6 h-6 text-yellow-400 drop-shadow-glow" />
                  総合収支ランキング
                </h2>
                <div className="space-y-3">
                  {allTimeRanking.map((player, idx) => {
                    const avg = player.gamesPlayed > 0 ? player.totalProfit / player.gamesPlayed : 0
                    return (
                      <div key={idx} className="relative group">
                        <div className={`absolute inset-0 blur-lg opacity-50 ${
                          idx === 0 ? 'bg-yellow-600' :
                          idx === 1 ? 'bg-gray-600' :
                          idx === 2 ? 'bg-orange-600' :
                          'bg-purple-600'
                        }`} />
                        <div className={`relative flex items-center gap-3 p-4 rounded-xl backdrop-blur-sm border-2 hover:scale-105 transition-all ${
                          idx === 0 ? 'bg-yellow-950/30 border-yellow-500/50' :
                          idx === 1 ? 'bg-gray-950/30 border-gray-500/50' :
                          idx === 2 ? 'bg-orange-950/30 border-orange-500/50' :
                          'bg-purple-950/30 border-purple-500/50'
                        }`}>
                          <span className="text-2xl font-black w-12 text-center text-white drop-shadow-glow">
                            {getMedalEmoji(idx + 1)}
                          </span>
                          <AvatarIcon profile={{ username: player.username, avatar_url: player.avatar_url, equipped_badge: player.equipped_badge } as Profile} size="sm" />
                          <div className="flex-1">
                            <div className="font-bold text-white drop-shadow-glow">{player.username}</div>
                            <div className="text-xs font-semibold text-purple-300">
                              {player.gamesPlayed}戦 | 平均{avg >= 0 ? '+' : ''}{Math.round(avg).toLocaleString()}
                            </div>
                          </div>
                          <div className={`text-2xl font-black ${
                            player.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
                          } drop-shadow-glow`}>
                            {player.totalProfit >= 0 ? '+' : ''}{player.totalProfit.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="relative group animate-slide-in">
            <div className="absolute inset-0 bg-green-600 blur-xl opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-500/50">
              <h2 className="text-xl font-black mb-5 flex items-center gap-2 text-white drop-shadow-glow">
                <TrendingUp className="w-6 h-6 text-green-400 drop-shadow-glow" />
                曜日別プレイ統計
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weekdayStats}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#4b5563" />
                  <XAxis dataKey="day" tick={{ fill: '#ffffff', fontWeight: 'bold' }} />
                  <YAxis yAxisId="left" orientation="left" stroke="#a855f7" tick={{ fill: '#ffffff' }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fill: '#ffffff' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.9)', 
                      border: '2px solid #8b5cf6',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      color: '#ffffff'
                    }} 
                  />
                  <Bar yAxisId="left" dataKey="count" fill="#a855f7" name="プレイ回数" radius={[8, 8, 0, 0]} />
                  <Bar yAxisId="right" dataKey="avgProfit" name="平均収支" radius={[8, 8, 0, 0]}>
                    {weekdayStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.avgProfit >= 0 ? '#10b981' : '#ef4444'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-6 flex justify-center gap-6 text-xs font-bold">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-600 rounded" />
                  <span className="text-white">プレイ回数</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded" />
                  <span className="text-white">平均収支(+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded" />
                  <span className="text-white">平均収支(-)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="space-y-5 animate-slide-in">
            {/* ジャックポット殿堂 */}
            {allJackpotWinners.length > 0 && (
              <div className="relative group">
                <div className="absolute inset-0 bg-yellow-600 blur-xl opacity-50" />
                <div className="relative bg-gradient-to-br from-yellow-950/50 to-orange-950/50 backdrop-blur-sm rounded-2xl p-6 border-2 border-yellow-500/50">
                  <h2 className="text-xl font-black mb-5 flex items-center gap-2 text-white drop-shadow-glow">
                    <Sparkles className="w-6 h-6 text-yellow-400 drop-shadow-glow" />
                    ジャックポット殿堂
                  </h2>
                  <div className="space-y-4">
                    {allJackpotWinners.map((winner, idx) => (
                      <div key={winner.id} className="relative">
                        <div className={`absolute inset-0 blur-lg opacity-50 ${
                          winner.hand_type.includes('ロイヤル') ? 'bg-purple-600' : 'bg-blue-600'
                        }`} />
                        <div className={`relative backdrop-blur-sm rounded-xl p-5 border-l-4 ${
                          winner.hand_type.includes('ロイヤル')
                            ? 'bg-purple-950/30 border-purple-400' 
                            : 'bg-blue-950/30 border-blue-400'
                        }`}>
                          <div className="flex items-start justify-between">
                            <div className="flex gap-3">
                              <div className="relative">
                                {idx === 0 && <div className="absolute -top-2 -right-2 text-2xl">👑</div>}
                                <AvatarIcon profile={winner.profiles} size="md" />
                              </div>
                              <div>
                                <div className="font-black text-white text-lg drop-shadow-glow">{winner.profiles?.username}</div>
                                <div className="text-purple-300 font-bold mt-1">{winner.hand_type}</div>
                                <div className="text-3xl font-black text-green-400 mt-2 drop-shadow-glow">
                                  +{winner.amount.toLocaleString()} P
                                </div>
                                <div className="mt-3 space-y-1">
                                  <p className="text-xs font-semibold text-purple-200 flex items-center gap-1">
                                    <CreditCard className="w-3 h-3" />
                                    {winner.hand_cards}
                                  </p>
                                  <p className="text-xs font-semibold text-purple-200 flex items-center gap-1">
                                    <Trophy className="w-3 h-3" />
                                    {winner.board_cards}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-purple-200">
                                {new Date(winner.created_at).toLocaleDateString('ja-JP')}
                              </p>
                            </div>
                          </div>
                        </div>
                        {idx === 0 && (
                          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-black px-3 py-1 rounded-full shadow-lg animate-pulse">
                            LATEST
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 大勝ち記録 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-green-600 blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-green-500/50">
                <h2 className="text-xl font-black mb-5 flex items-center gap-2 text-white drop-shadow-glow">
                  <Award className="w-6 h-6 text-green-400 drop-shadow-glow" />
                  大勝ち記録 TOP5
                </h2>
                <div className="space-y-3">
                  {bigWins.map((session, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute inset-0 bg-green-600 blur-lg opacity-50" />
                      <div className="relative bg-green-950/30 backdrop-blur-sm rounded-xl p-4 border-l-4 border-green-400">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <AvatarIcon profile={session.profiles} size="sm" />
                            <div>
                              <div className="font-black text-white text-lg drop-shadow-glow">
                                {idx + 1}. {session.profiles?.username}
                              </div>
                              <div className="text-xs font-semibold text-green-300 mt-1">
                                {new Date(session.played_at).toLocaleDateString('ja-JP')} | {session.play_hours}時間
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-black text-green-400 drop-shadow-glow">
                              +{session.profit.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      {idx === 0 && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black text-xs font-black px-2 py-1 rounded-full shadow-lg">
                          BEST
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 大負け記録 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-red-600 blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-red-500/50">
                <h2 className="text-xl font-black mb-5 flex items-center gap-2 text-white drop-shadow-glow">
                  <Award className="w-6 h-6 text-red-400 drop-shadow-glow" />
                  大負け記録 TOP5
                </h2>
                <div className="space-y-3">
                  {bigLosses.map((session, idx) => (
                    <div key={idx} className="relative">
                      <div className="absolute inset-0 bg-red-600 blur-lg opacity-50" />
                      <div className="relative bg-red-950/30 backdrop-blur-sm rounded-xl p-4 border-l-4 border-red-400">
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <AvatarIcon profile={session.profiles} size="sm" />
                            <div>
                              <div className="font-black text-white text-lg drop-shadow-glow">
                                {idx + 1}. {session.profiles?.username}
                              </div>
                              <div className="text-xs font-semibold text-red-300 mt-1">
                                {new Date(session.played_at).toLocaleDateString('ja-JP')} | {session.play_hours}時間
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-black text-red-400 drop-shadow-glow">
                              {session.profit.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                      {idx === 0 && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-gray-600 to-gray-800 text-white text-xs font-black px-2 py-1 rounded-full shadow-lg">
                          WORST
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  )
}