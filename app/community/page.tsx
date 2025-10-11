'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Trophy, TrendingUp, Award, Users, Clock, DollarSign, 
  Calendar, Sparkles, Target, CreditCard, User, X, ChevronRight,
  Crown, Zap, Star, TrendingDown, Activity, BarChart3, Shield,
  Percent, Brain, Filter, Search
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie
} from 'recharts'

interface Profile {
  id: string
  username: string
  email: string
  active: boolean
  avatar_url?: string
  favorite_games?: string[]
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

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  tier: string
  badge_gradient: string
  condition_type: string
  condition_value: number
}

interface PlayerDetail {
  userId: string
  username: string
  avatar_url?: string
  equipped_badge?: any
  favorite_games?: string[]
  stats: {
    totalGames: number
    totalProfit: number
    winRate: number
    avgProfit: number
    totalPlayHours: number
    bestWin: number
    worstLoss: number
    roi: number
    hourlyRate: number
    volatility: number
    maxWinStreak: number
    maxLossStreak: number
    currentStreak: number
  }
  achievements: Achievement[]
  playStyle: any
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
      
      {profile?.equipped_badge && (
        <div className={`absolute -bottom-0.5 -right-0.5 ${badgeSizes[size]} rounded-full flex items-center justify-center border border-white shadow-lg ${getBorderGradient()}`}>
          <Award className={`${badgeIconSizes[size]} text-white`} />
        </div>
      )}
    </div>
  )
}

const PlayerDetailModal = ({ player, onClose }: { player: PlayerDetail, onClose: () => void }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'style' | 'achievements'>('overview')
  
  const playStyleInfo = {
    TAG: { name: 'TAG', icon: '⚔️', color: 'from-blue-500 to-purple-600' },
    LAG: { name: 'LAG', icon: '🔥', color: 'from-orange-500 to-red-600' },
    ROCK: { name: 'ROCK', icon: '🪨', color: 'from-green-500 to-teal-600' },
    NIT: { name: 'NIT', icon: '🛡️', color: 'from-gray-500 to-slate-600' },
    FISH: { name: 'FISH', icon: '🐟', color: 'from-red-600 to-rose-600' },
    BEGINNER: { name: 'BEGINNER', icon: '🌱', color: 'from-green-500 to-emerald-600' }
  }
  
  const style = playStyleInfo[player.playStyle?.type] || playStyleInfo.BEGINNER
  
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500/50 shadow-2xl">
        <div className="sticky top-0 bg-black/60 backdrop-blur-sm p-6 border-b-2 border-purple-500/30 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <AvatarIcon profile={{ username: player.username, avatar_url: player.avatar_url, equipped_badge: player.equipped_badge } as Profile} size="md" />
            <div>
              <h2 className="text-xl font-black text-white">{player.username}</h2>
              <p className="text-sm text-purple-300 font-semibold">{player.stats.totalGames}戦のデータ</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-red-600/80 hover:bg-red-500 flex items-center justify-center transition-all">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="p-4">
          {/* タブナビゲーション */}
          <div className="grid grid-cols-3 gap-2 mb-6 bg-black/40 p-2 rounded-2xl">
            {[
              { id: 'overview', icon: BarChart3, label: '統計' },
              { id: 'style', icon: Brain, label: 'スタイル' },
              { id: 'achievements', icon: Trophy, label: '実績' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-purple-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5 mx-auto mb-1" />
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-4 animate-slide-in">
              {/* 主要統計 */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-4 border-2 border-green-400/30">
                  <DollarSign className="w-6 h-6 text-green-200 mb-2" />
                  <div className="text-3xl font-black text-white">
                    {player.stats.totalProfit >= 0 ? '+' : ''}{player.stats.totalProfit.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-200 font-bold mt-1">総収支</div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-4 border-2 border-blue-400/30">
                  <Trophy className="w-6 h-6 text-blue-200 mb-2" />
                  <div className="text-3xl font-black text-white">
                    {player.stats.winRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-blue-200 font-bold mt-1">勝率</div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-600 to-pink-700 rounded-2xl p-4 border-2 border-purple-400/30">
                  <Zap className="w-6 h-6 text-purple-200 mb-2" />
                  <div className="text-3xl font-black text-white">
                    {player.stats.hourlyRate >= 0 ? '+' : ''}{Math.round(player.stats.hourlyRate).toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-200 font-bold mt-1">時給 (P/h)</div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-600 to-red-700 rounded-2xl p-4 border-2 border-orange-400/30">
                  <Percent className="w-6 h-6 text-orange-200 mb-2" />
                  <div className="text-3xl font-black text-white">
                    {player.stats.roi.toFixed(1)}%
                  </div>
                  <div className="text-sm text-orange-200 font-bold mt-1">ROI</div>
                </div>
              </div>

              {/* 詳細統計 */}
              <div className="space-y-3 bg-black/40 rounded-2xl p-4">
                <div className="flex justify-between items-center p-3 bg-green-950/50 rounded-xl">
                  <span className="text-sm font-bold text-green-300 flex items-center gap-2">
                    <Crown className="w-4 h-4" />
                    最高勝利
                  </span>
                  <span className="text-lg font-black text-green-400">
                    +{player.stats.bestWin.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-red-950/50 rounded-xl">
                  <span className="text-sm font-bold text-red-300 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    最大敗北
                  </span>
                  <span className="text-lg font-black text-red-400">
                    {player.stats.worstLoss.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-blue-950/50 rounded-xl">
                  <span className="text-sm font-bold text-blue-300 flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    平均収支
                  </span>
                  <span className="text-lg font-black text-blue-400">
                    {player.stats.avgProfit >= 0 ? '+' : ''}{Math.round(player.stats.avgProfit).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-purple-950/50 rounded-xl">
                  <span className="text-sm font-bold text-purple-300 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    最高連勝
                  </span>
                  <span className="text-lg font-black text-purple-400">
                    {player.stats.maxWinStreak}連勝
                  </span>
                </div>
                
                <div className="flex justify-between items-center p-3 bg-gray-950/50 rounded-xl">
                  <span className="text-sm font-bold text-gray-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    総プレイ時間
                  </span>
                  <span className="text-lg font-black text-gray-400">
                    {player.stats.totalPlayHours.toFixed(1)}h
                  </span>
                </div>
              </div>

              {/* お気に入りゲーム */}
              {player.favorite_games && player.favorite_games.length > 0 && (
                <div className="bg-black/40 rounded-2xl p-4">
                  <h3 className="text-sm font-black text-purple-300 mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    お気に入りゲーム
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {player.favorite_games.map((game, idx) => (
                      <div key={idx} className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xs font-bold text-white">
                        {game}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'style' && player.playStyle && (
            <div className="space-y-4 animate-slide-in">
              <div className={`relative bg-gradient-to-br ${style.color} rounded-3xl p-1`}>
                <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6">
                  <div className="text-center">
                    <div className="text-6xl mb-3">{style.icon}</div>
                    <h3 className="text-xl font-black text-white mb-2">プレイスタイル</h3>
                    <p className="text-2xl font-black text-white">{player.playStyle.name}</p>
                    <p className="text-sm text-white/80 mt-3">{player.playStyle.description}</p>
                  </div>
                </div>
              </div>

              <div className="bg-black/40 rounded-2xl p-4">
                <h3 className="text-sm font-black text-white mb-3">診断根拠</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-950/50 rounded-xl p-3">
                    <div className="text-xs text-blue-300 font-bold mb-1">勝率</div>
                    <div className="text-2xl font-black text-blue-400">
                      {player.playStyle.metrics.winRate.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-purple-950/50 rounded-xl p-3">
                    <div className="text-xs text-purple-300 font-bold mb-1">変動率</div>
                    <div className="text-2xl font-black text-purple-400">
                      {player.playStyle.metrics.volatility.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-green-950/50 rounded-xl p-3">
                    <div className="text-xs text-green-300 font-bold mb-1">ROI</div>
                    <div className="text-2xl font-black text-green-400">
                      {player.playStyle.metrics.roi.toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-orange-950/50 rounded-xl p-3">
                    <div className="text-xs text-orange-300 font-bold mb-1">大変動率</div>
                    <div className="text-2xl font-black text-orange-400">
                      {player.playStyle.metrics.bigSwingRate.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-950/50 rounded-2xl p-4 border-2 border-indigo-500/30">
                <h3 className="text-sm font-black text-indigo-300 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  上達へのアドバイス
                </h3>
                <p className="text-sm text-indigo-100 leading-relaxed">
                  {player.playStyle.advice}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="space-y-4 animate-slide-in">
              <div className="text-center bg-black/40 rounded-2xl p-4">
                <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-2" />
                <div className="text-3xl font-black text-white">{player.achievements.length}</div>
                <div className="text-sm text-purple-300 font-bold">アチーブメント取得済み</div>
              </div>

              <div className="space-y-2">
                {player.achievements.map((achievement) => (
                  <div key={achievement.id} className={`bg-gradient-to-r ${achievement.badge_gradient} rounded-2xl p-1`}>
                    <div className="bg-black/60 rounded-2xl p-4 flex items-center gap-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div className="flex-1">
                        <div className="font-black text-white text-sm">{achievement.name}</div>
                        <div className="text-xs text-white/70">{achievement.description}</div>
                      </div>
                      <div className={`px-2 py-1 rounded-lg text-xs font-black ${
                        achievement.tier === 'legendary' ? 'bg-yellow-500 text-black' :
                        achievement.tier === 'epic' ? 'bg-purple-500 text-white' :
                        achievement.tier === 'rare' ? 'bg-blue-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {achievement.tier.toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
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
  
  const [activeTab, setActiveTab] = useState('ranking')
  const [rankingType, setRankingType] = useState<'profit' | 'winrate' | 'roi' | 'hourly' | 'streak' | 'weekday'>('profit')
  const [timeRange, setTimeRange] = useState<'7days' | 'month' | 'all' | 'custom'>('month')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  
  const [rankings, setRankings] = useState<any[]>([])
  const [weekdayChampions, setWeekdayChampions] = useState<any[]>([])
  const [weekdayStats, setWeekdayStats] = useState<any[]>([])
  const [bigWins, setBigWins] = useState<GameSession[]>([])
  const [bigLosses, setBigLosses] = useState<GameSession[]>([])
  
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDetail | null>(null)

  useEffect(() => {
    loadCommunityData()
  }, [timeRange, customStartDate, customEndDate])

  const getDateRange = () => {
    const now = new Date()
    let startDate = new Date(0)
    let endDate = now

    switch (timeRange) {
      case '7days':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        break
      case 'custom':
        if (customStartDate) startDate = new Date(customStartDate)
        if (customEndDate) endDate = new Date(customEndDate)
        break
      case 'all':
      default:
        break
    }

    return { startDate, endDate }
  }

  const loadCommunityData = async () => {
    try {
      const { data: jpData } = await supabase
        .from('jackpot_pool')
        .select('current_amount')
        .single()
      
      if (jpData) {
        setCurrentJackpot(jpData.current_amount)
      }

      const { data: winnersData } = await supabase
        .from('jackpot_winners')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (winnersData && winnersData.length > 0) {
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

      const { startDate, endDate } = getDateRange()
      
      const { data: allSessions } = await supabase
        .from('game_sessions')
        .select(`
          *,
          profiles(username, active, avatar_url, equipped_badge(*), favorite_games)
        `)
        .gte('played_at', startDate.toISOString())
        .lte('played_at', endDate.toISOString())
      
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

        calculateRankings(sessions)
        calculateWeekdayStats(sessions)
        
        const topWins = [...sessions]
          .sort((a, b) => b.profit - a.profit)
          .slice(0, 5)
        setBigWins(topWins)

        const topLosses = [...sessions]
          .sort((a, b) => a.profit - b.profit)
          .slice(0, 5)
        setBigLosses(topLosses)
      }
      
    } catch (error) {
      console.error('Error loading community data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateRankings = (sessions: GameSession[]) => {
    const playerStats = new Map()
    
    sessions.forEach(session => {
      const userId = session.user_id
      const profile = session.profiles
      
      if (!playerStats.has(userId)) {
        playerStats.set(userId, {
          userId,
          username: profile?.username,
          avatar_url: profile?.avatar_url,
          equipped_badge: profile?.equipped_badge,
          favorite_games: profile?.favorite_games,
          totalProfit: 0,
          gamesPlayed: 0,
          wins: 0,
          totalHours: 0,
          totalBuyin: 0,
          bestWin: 0,
          worstLoss: 0,
          profits: [],
          currentStreak: 0,
          maxWinStreak: 0,
          maxLossStreak: 0,
          tempWinStreak: 0,
          tempLossStreak: 0
        })
      }
      
      const stats = playerStats.get(userId)
      stats.totalProfit += session.profit
      stats.gamesPlayed += 1
      stats.totalHours += Number(session.play_hours)
      stats.totalBuyin += session.buy_in
      stats.profits.push(session.profit)
      
      if (session.profit > 0) {
        stats.wins += 1
        stats.tempWinStreak += 1
        stats.tempLossStreak = 0
        stats.maxWinStreak = Math.max(stats.maxWinStreak, stats.tempWinStreak)
      } else if (session.profit < 0) {
        stats.tempLossStreak += 1
        stats.tempWinStreak = 0
        stats.maxLossStreak = Math.max(stats.maxLossStreak, stats.tempLossStreak)
      }
      
      stats.bestWin = Math.max(stats.bestWin, session.profit)
      stats.worstLoss = Math.min(stats.worstLoss, session.profit)
      stats.currentStreak = stats.tempWinStreak > 0 ? stats.tempWinStreak : -stats.tempLossStreak
      
      playerStats.set(userId, stats)
    })
    
    const rankingData = Array.from(playerStats.values()).map(stats => {
      const winRate = stats.gamesPlayed > 0 ? (stats.wins / stats.gamesPlayed) * 100 : 0
      const roi = stats.totalBuyin > 0 ? (stats.totalProfit / stats.totalBuyin) * 100 : 0
      const hourlyRate = stats.totalHours > 0 ? stats.totalProfit / stats.totalHours : 0
      const avgProfit = stats.gamesPlayed > 0 ? stats.totalProfit / stats.gamesPlayed : 0
      
      const mean = avgProfit
      const variance = stats.profits.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / stats.profits.length
      const volatility = Math.sqrt(variance)
      
      return {
        ...stats,
        winRate,
        roi,
        hourlyRate,
        avgProfit,
        volatility
      }
    })
    
    setRankings(rankingData)
  }

  const calculateWeekdayStats = (sessions: GameSession[]) => {
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    const weekdayData = new Map()
    const weekdayPlayers = new Map()
    
    sessions.forEach(session => {
      const date = new Date(session.played_at)
      const weekday = weekdays[date.getDay()]
      const userId = session.user_id
      
      if (!weekdayData.has(weekday)) {
        weekdayData.set(weekday, { count: 0, totalProfit: 0, avgProfit: 0 })
      }
      
      if (!weekdayPlayers.has(weekday)) {
        weekdayPlayers.set(weekday, new Map())
      }
      
      const dayStats = weekdayData.get(weekday)
      dayStats.count += 1
      dayStats.totalProfit += session.profit
      dayStats.avgProfit = dayStats.totalProfit / dayStats.count
      
      const dayPlayerMap = weekdayPlayers.get(weekday)
      if (!dayPlayerMap.has(userId)) {
        dayPlayerMap.set(userId, {
          username: session.profiles?.username,
          avatar_url: session.profiles?.avatar_url,
          equipped_badge: session.profiles?.equipped_badge,
          totalProfit: 0,
          games: 0
        })
      }
      
      const playerStats = dayPlayerMap.get(userId)
      playerStats.totalProfit += session.profit
      playerStats.games += 1
    })
    
    const weekdayArray = weekdays.map(day => ({
      day,
      count: weekdayData.get(day)?.count || 0,
      avgProfit: weekdayData.get(day)?.avgProfit || 0
    }))
    
    setWeekdayStats(weekdayArray)
    
    const champions = weekdays.map(day => {
      const players = weekdayPlayers.get(day)
      if (!players || players.size === 0) return null
      
      const topPlayer = Array.from(players.values())
        .sort((a: any, b: any) => b.totalProfit - a.totalProfit)[0]
      
      return {
        day,
        player: topPlayer
      }
    }).filter((c): c is { day: string; player: any } => c !== null)
    
    setWeekdayChampions(champions)
  }

  const getSortedRankings = () => {
    let sorted = [...rankings]
    
    switch (rankingType) {
      case 'profit':
        sorted.sort((a, b) => b.totalProfit - a.totalProfit)
        break
      case 'winrate':
        sorted = sorted.filter(p => p.gamesPlayed >= 5)
        sorted.sort((a, b) => b.winRate - a.winRate)
        break
      case 'roi':
        sorted = sorted.filter(p => p.gamesPlayed >= 5)
        sorted.sort((a, b) => b.roi - a.roi)
        break
      case 'hourly':
        sorted = sorted.filter(p => p.totalHours >= 3)
        sorted.sort((a, b) => b.hourlyRate - a.hourlyRate)
        break
      case 'streak':
        sorted.sort((a, b) => b.maxWinStreak - a.maxWinStreak)
        break
    }
    
    return sorted.slice(0, 10)
  }

  const analyzePlayStyle = (stats: any) => {
    const { winRate, volatility, roi, totalProfit, avgProfit, gamesPlayed, totalBuyin } = stats
    
    if (gamesPlayed < 5) {
      return {
        type: 'BEGINNER',
        name: 'ビギナー',
        description: 'まだスタイルが確立されていない段階。',
        color: 'from-green-500 to-emerald-600',
        icon: '🌱',
        advice: 'もう少しデータが必要です。',
        metrics: { winRate, volatility: 0, roi, bigSwingRate: 0, sessions: gamesPlayed }
      }
    }

    const avgBuyIn = totalBuyin / gamesPlayed
    const profitVolatility = avgBuyIn > 0 ? (volatility / avgBuyIn) * 100 : 0
    
    const bigWins = stats.profits.filter((p: number) => p > avgBuyIn * 0.5).length
    const bigLosses = stats.profits.filter((p: number) => p < -avgBuyIn * 0.5).length
    const bigSwingRate = ((bigWins + bigLosses) / gamesPlayed) * 100
    
    if (winRate >= 55 && profitVolatility < 30 && roi > 10) {
      return {
        type: 'TAG',
        name: 'TAG（タイトアグレッシブ）',
        description: 'バランスの取れた堅実なプレイスタイル。',
        color: 'from-blue-500 to-purple-600',
        icon: '⚔️',
        advice: 'TAGは最も安定した勝ちやすいスタイルです。',
        metrics: { winRate, volatility: profitVolatility, roi, bigSwingRate, sessions: gamesPlayed }
      }
    } else if (winRate >= 45 && profitVolatility > 50 && bigSwingRate > 40) {
      return {
        type: 'LAG',
        name: 'LAG（ルースアグレッシブ）',
        description: '幅広いレンジで積極的にプレイ。',
        color: 'from-orange-500 to-red-600',
        icon: '🔥',
        advice: 'LAGスタイルは高い技術を要します。',
        metrics: { winRate, volatility: profitVolatility, roi, bigSwingRate, sessions: gamesPlayed }
      }
    }
    
    return {
      type: 'ROCK',
      name: 'ロック（堅実型）',
      description: 'とても堅実で安定したプレイスタイル。',
      color: 'from-green-500 to-teal-600',
      icon: '🪨',
      advice: '安定したプレイです。',
      metrics: { winRate, volatility: profitVolatility, roi, bigSwingRate, sessions: gamesPlayed }
    }
  }

  const loadPlayerDetail = async (stats: any) => {
    try {
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('achievement_id, achievements(*)')
        .eq('user_id', stats.userId)

      const achievements: Achievement[] = achievementsData?.map((ua: any) => ua.achievements).filter(Boolean) || []
      
      const playStyle = analyzePlayStyle(stats)
      
      const playerDetail: PlayerDetail = {
        userId: stats.userId,
        username: stats.username,
        avatar_url: stats.avatar_url,
        equipped_badge: stats.equipped_badge,
        favorite_games: stats.favorite_games,
        stats: {
          totalGames: stats.gamesPlayed,
          totalProfit: stats.totalProfit,
          winRate: stats.winRate,
          avgProfit: stats.avgProfit,
          totalPlayHours: stats.totalHours,
          bestWin: stats.bestWin,
          worstLoss: stats.worstLoss,
          roi: stats.roi,
          hourlyRate: stats.hourlyRate,
          volatility: stats.volatility,
          maxWinStreak: stats.maxWinStreak,
          maxLossStreak: stats.maxLossStreak,
          currentStreak: stats.currentStreak
        },
        achievements,
        playStyle
      }
      
      setSelectedPlayer(playerDetail)
    } catch (error) {
      console.error('Error loading player detail:', error)
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

  const getRankingTitle = () => {
    const titles = {
      profit: '💰 総収支ランキング',
      winrate: '🎯 勝率ランキング',
      roi: '📊 ROIランキング',
      hourly: '⚡ 時給ランキング',
      streak: '🔥 最高連勝ランキング'
    }
    return titles[rankingType]
  }

  const getRankingValue = (player: any) => {
    switch (rankingType) {
      case 'profit':
        return `${player.totalProfit >= 0 ? '+' : ''}${player.totalProfit.toLocaleString()}`
      case 'winrate':
        return `${player.winRate.toFixed(1)}%`
      case 'roi':
        return `${player.roi >= 0 ? '+' : ''}${player.roi.toFixed(1)}%`
      case 'hourly':
        return `${player.hourlyRate >= 0 ? '+' : ''}${Math.round(player.hourlyRate).toLocaleString()} P/h`
      case 'streak':
        return `${player.maxWinStreak}連勝`
      default:
        return ''
    }
  }

  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case '7days': return '過去7日間'
      case 'month': return '今月'
      case 'all': return '全期間'
      case 'custom': return 'カスタム期間'
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
            {/* 期間選択 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-600 blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-blue-500/50">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-black text-blue-300">期間設定</h3>
                </div>
                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { value: '7days', label: '7日間' },
                    { value: 'month', label: '今月' },
                    { value: 'all', label: '全期間' },
                    { value: 'custom', label: 'カスタム' }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setTimeRange(option.value as any)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                        timeRange === option.value
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                          : 'bg-white/10 text-blue-300 hover:bg-white/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                
                {timeRange === 'custom' && (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full bg-black/40 border-2 border-blue-500/30 rounded-xl px-3 py-2 text-sm text-white"
                      placeholder="開始日"
                    />
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full bg-black/40 border-2 border-blue-500/30 rounded-xl px-3 py-2 text-sm text-white"
                      placeholder="終了日"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* ランキングタイプ選択 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-purple-500/50">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-black text-purple-300">ランキング種別</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'profit', label: '💰 総収支', icon: DollarSign },
                    { value: 'winrate', label: '🎯 勝率', icon: Target },
                    { value: 'roi', label: '📊 ROI', icon: TrendingUp },
                    { value: 'hourly', label: '⚡ 時給', icon: Zap },
                    { value: 'streak', label: '🔥 連勝', icon: Activity }
                  ].map(option => (
                    <button
                      key={option.value}
                      onClick={() => setRankingType(option.value as any)}
                      className={`py-3 px-3 rounded-xl text-xs font-bold transition-all ${
                        rankingType === option.value
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : 'bg-white/10 text-purple-300 hover:bg-white/20'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ランキング表示 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-indigo-500/50">
                <h2 className="text-xl font-black mb-2 flex items-center gap-2 text-white drop-shadow-glow">
                  {getRankingTitle()}
                </h2>
                <p className="text-sm text-indigo-300 font-bold mb-5">
                  {getTimeRangeLabel()}
                </p>
                <div className="space-y-3">
                  {getSortedRankings().map((player, idx) => (
                    <button
                      key={idx}
                      onClick={() => loadPlayerDetail(player)}
                      className="w-full text-left relative group"
                    >
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
                            {player.gamesPlayed}戦 | {player.totalHours.toFixed(1)}h
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-xl font-black text-white drop-shadow-glow">
                            {getRankingValue(player)}
                          </div>
                          <ChevronRight className="w-5 h-5 text-white/50" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 曜日別チャンピオン */}
            {rankingType === 'weekday' && (
              <div className="relative group">
                <div className="absolute inset-0 bg-yellow-600 blur-xl opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-yellow-500/50">
                  <h2 className="text-xl font-black mb-5 flex items-center gap-2 text-white drop-shadow-glow">
                    <Crown className="w-6 h-6 text-yellow-400 drop-shadow-glow" />
                    曜日別チャンピオン
                  </h2>
                  <div className="space-y-3">
                    {weekdayChampions.map((champion, idx) => champion && (
                      <div key={idx} className="relative">
                        <div className="absolute inset-0 bg-yellow-600 blur-lg opacity-50" />
                        <div className="relative bg-yellow-950/30 backdrop-blur-sm rounded-xl p-4 border-2 border-yellow-500/50">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl font-black text-yellow-400 w-10">
                              {champion.day}
                            </div>
                            <AvatarIcon profile={{ username: champion.player.username, avatar_url: champion.player.avatar_url, equipped_badge: champion.player.equipped_badge } as Profile} size="sm" />
                            <div className="flex-1">
                              <div className="font-bold text-white">{champion.player.username}</div>
                              <div className="text-xs text-yellow-300 font-semibold">
                                {champion.player.games}戦
                              </div>
                            </div>
                            <div className="text-xl font-black text-yellow-400">
                              +{champion.player.totalProfit.toLocaleString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
                    {allJackpotWinners.slice(0, 10).map((winner, idx) => (
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
                              </div>
                            </div>
                          </div>
                        </div>
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
                                {new Date(session.played_at).toLocaleDateString('ja-JP')}
                              </div>
                            </div>
                          </div>
                          <div className="text-3xl font-black text-green-400 drop-shadow-glow">
                            +{session.profit.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedPlayer && (
        <PlayerDetailModal player={selectedPlayer} onClose={() => setSelectedPlayer(null)} />
      )}

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

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
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

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
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