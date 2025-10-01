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
  Zap,
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
  avatar_url?: string  // アバターURL追加
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

// アバターコンポーネント
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
  
  return (
    <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-r from-violet-400 to-indigo-400 p-0.5 flex-shrink-0`}>
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.username}
          className="w-full h-full rounded-full object-cover bg-white"
        />
      ) : (
        <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
          <User className={`${iconSizes[size]} text-gray-400`} />
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
      // ジャックポット取得
      const { data: jpData } = await supabase
        .from('jackpot_pool')
        .select('current_amount')
        .single()
      
      if (jpData) {
        setCurrentJackpot(jpData.current_amount)
      }

      // JP獲得者を単体で取得（結合なし）
      const { data: winnersData, error: winnersError } = await supabase
        .from('jackpot_winners')
        .select('*')
        .order('created_at', { ascending: false })
      
      console.log('Winners data:', winnersData)
      console.log('Winners error:', winnersError)
      
      if (winnersError) {
        console.error('Error fetching winners:', winnersError)
      } else if (winnersData && winnersData.length > 0) {
        // 各勝者のプロフィール情報を個別に取得（アバター追加）
        const winnersWithProfiles = await Promise.all(
          winnersData.map(async (winner) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username, active, avatar_url')  // avatar_url追加
              .eq('id', winner.user_id)
              .single()
            
            return {
              ...winner,
              profiles: profileData
            }
          })
        )
        
        // アクティブユーザーのみフィルタリング
        const activeWinners = winnersWithProfiles.filter(
          winner => winner.profiles && winner.profiles.active !== false
        )
        
        console.log('Active winners:', activeWinners)
        
        if (activeWinners.length > 0) {
          setAllJackpotWinners(activeWinners)
          setLatestWinner(activeWinners[0])
        }
      }

      // 全体統計（アクティブユーザーのみ、アバター追加）
      const { data: sessions } = await supabase
        .from('game_sessions')
        .select(`
          *,
          profiles!inner(username, active, avatar_url)
        `)
        .eq('profiles.active', true)
      
      if (sessions) {
        const totalHours = sessions.reduce((sum, s) => sum + Number(s.play_hours), 0)
        const totalBuyin = sessions.reduce((sum, s) => sum + s.buy_in, 0)
        const uniquePlayers = new Set(sessions.map(s => s.user_id)).size
        
        setTotalStats({
          totalHours,
          totalBuyin,
          activePlayers: uniquePlayers
        })

        // 総合ランキング（アバター情報を含む）
        const playerStats = new Map()
        sessions.forEach(session => {
          const userId = session.user_id
          const username = session.profiles?.username
          const avatar_url = session.profiles?.avatar_url
          
          if (!playerStats.has(userId)) {
            playerStats.set(userId, {
              username,
              avatar_url,
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

        // 今月のランキング（アバター情報を含む）
        const currentMonth = new Date().toISOString().slice(0, 7)
        const monthlySessions = sessions.filter(s => 
          s.played_at.startsWith(currentMonth)
        )
        
        const monthlyPlayerStats = new Map()
        monthlySessions.forEach(session => {
          const userId = session.user_id
          const username = session.profiles?.username
          const avatar_url = session.profiles?.avatar_url
          
          if (!monthlyPlayerStats.has(userId)) {
            monthlyPlayerStats.set(userId, {
              username,
              avatar_url,
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

        // 大勝ち記録TOP5
        const topWins = [...sessions]
          .sort((a, b) => b.profit - a.profit)
          .slice(0, 5)
        setBigWins(topWins)

        // 大負け記録TOP5
        const topLosses = [...sessions]
          .sort((a, b) => a.profit - b.profit)
          .slice(0, 5)
        setBigLosses(topLosses)

        // 曜日別統計
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container max-w-md mx-auto p-4 pb-20">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all mb-4"
          >
            <ArrowLeft className="h-5 w-5 text-gray-900" />
          </button>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            <Trophy className="inline h-8 w-8 text-yellow-500 mr-2" />
            Community
          </h1>
          <p className="text-gray-900 mt-2 font-medium">みんなの成績とランキング</p>
        </div>

        {/* ジャックポットカード */}
        <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          <div className="relative text-center text-white">
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="w-6 h-6 mr-2" />
              <h3 className="text-lg font-bold">現在のジャックポット</h3>
              <Sparkles className="w-6 h-6 ml-2" />
            </div>
            <div className="text-5xl font-black mb-1">{currentJackpot.toLocaleString()}</div>
            <div className="text-xl font-bold">POINTS</div>
          </div>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 text-center border border-violet-100">
            <Clock className="h-6 w-6 text-violet-600 mx-auto mb-2" />
            <div className="text-2xl font-black text-gray-900">{totalStats.totalHours.toFixed(0)}</div>
            <div className="text-xs font-bold text-gray-800">時間</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 text-center border border-indigo-100">
            <DollarSign className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
            <div className="text-2xl font-black text-gray-900">{totalStats.totalBuyin.toLocaleString()}</div>
            <div className="text-xs font-bold text-gray-800">バイイン</div>
          </div>
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 text-center border border-purple-100">
            <Users className="h-6 w-6 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-black text-gray-900">{totalStats.activePlayers}</div>
            <div className="text-xs font-bold text-gray-800">プレイヤー</div>
          </div>
        </div>

        {/* 最新ジャックポット獲得者（アバター付き改善版） */}
        {latestWinner && (
          <div className="bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 rounded-2xl shadow-xl p-5 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-20 h-20 bg-white/10 rounded-full -ml-10 -mt-10"></div>
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mb-12"></div>
            <div className="text-center text-white relative">
              <p className="text-sm font-bold mb-2 opacity-90">🎊 最新ジャックポット獲得者 🎊</p>
              
              <div className="flex justify-center mb-3">
                <AvatarIcon profile={latestWinner.profiles} size="lg" />
              </div>
              
              <p className="text-2xl font-black mb-1">{latestWinner.profiles?.username}さん</p>
              <p className="text-lg font-bold mb-2">
                {latestWinner.hand_type}
              </p>
              <div className="bg-white/20 rounded-xl px-4 py-3 backdrop-blur-sm">
                <p className="text-3xl font-black mb-2">+{latestWinner.amount.toLocaleString()} P</p>
                <div className="space-y-1">
                  <p className="text-sm font-semibold">
                    <CreditCard className="inline w-4 h-4 mr-1" />
                    {latestWinner.hand_cards}
                  </p>
                  <p className="text-sm font-semibold">
                    <Trophy className="inline w-4 h-4 mr-1" />
                    {latestWinner.board_cards}
                  </p>
                  <p className="text-xs opacity-80 mt-2">
                    <Calendar className="inline w-3 h-3 mr-1" />
                    {new Date(latestWinner.created_at).toLocaleDateString('ja-JP')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* タブナビゲーション */}
        <div className="flex gap-1 mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg">
          {[
            { id: 'ranking', icon: '🏅', label: 'ランキング' },
            { id: 'stats', icon: '📈', label: '統計' },
            { id: 'records', icon: '🏆', label: '殿堂' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="block text-lg mb-1">{tab.icon}</span>
              <span className="text-xs font-bold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'ranking' && (
          <div className="space-y-4">
            {/* 総合収支ランキング（アバター付き） */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-violet-100">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <Trophy className="w-5 h-5 text-yellow-500" />
                総合収支ランキング
              </h2>
              <div className="space-y-3">
                {allTimeRanking.map((player, idx) => {
                  const avg = player.gamesPlayed > 0 ? player.totalProfit / player.gamesPlayed : 0
                  return (
                    <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl transition-all hover:scale-105 ${
                      idx === 0 ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-300' :
                      idx === 1 ? 'bg-gradient-to-r from-gray-100 to-slate-100 border border-gray-300' :
                      idx === 2 ? 'bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-300' :
                      'bg-gray-50 border border-gray-200'
                    }`}>
                      <span className={`text-2xl font-black w-10 text-center`}>
                        {getMedalEmoji(idx + 1)}
                      </span>
                      <AvatarIcon profile={{ username: player.username, avatar_url: player.avatar_url } as Profile} size="sm" />
                      <div className="flex-1">
                        <div className="font-bold text-gray-900">
                          {player.username}
                        </div>
                        <div className="text-xs font-semibold text-gray-800">
                          {player.gamesPlayed}戦 | 平均{avg >= 0 ? '+' : ''}{Math.round(avg).toLocaleString()}
                        </div>
                      </div>
                      <div className={`text-2xl font-black ${
                        player.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {player.totalProfit >= 0 ? '+' : ''}{player.totalProfit.toLocaleString()}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 今月のランキング（アバター付き） */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-indigo-100">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <Target className="w-5 h-5 text-indigo-600" />
                今月のランキング
              </h2>
              <div className="space-y-3">
                {monthlyRanking.map((player, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 hover:scale-105 transition-all">
                    <span className="text-xl font-black w-8 text-gray-900">{idx + 1}.</span>
                    <AvatarIcon profile={{ username: player.username, avatar_url: player.avatar_url } as Profile} size="sm" />
                    <div className="flex-1">
                      <div className="font-bold text-gray-900">{player.username}</div>
                      <div className="text-xs font-semibold text-gray-800">{player.gamesPlayed}戦</div>
                    </div>
                    <div className={`px-4 py-2 rounded-full font-black text-white ${
                      player.totalProfit >= 0 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                        : 'bg-gradient-to-r from-red-500 to-pink-600'
                    }`}>
                      {player.totalProfit >= 0 ? '+' : ''}{player.totalProfit.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-green-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
              <TrendingUp className="w-5 h-5 text-green-600" />
              曜日別プレイ統計
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weekdayStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="day" tick={{ fill: '#374151', fontWeight: 'bold' }} />
                <YAxis yAxisId="left" orientation="left" stroke="#8b5cf6" tick={{ fill: '#374151' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" tick={{ fill: '#374151' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                    border: '2px solid #8b5cf6',
                    borderRadius: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <Bar yAxisId="left" dataKey="count" fill="#8b5cf6" name="プレイ回数" radius={[8, 8, 0, 0]} />
                <Bar yAxisId="right" dataKey="avgProfit" name="平均収支" radius={[8, 8, 0, 0]}>
                  {weekdayStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.avgProfit >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-center gap-6 text-xs font-bold">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-violet-600 rounded"></div>
                <span className="text-gray-900">プレイ回数</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500 rounded"></div>
                <span className="text-gray-900">平均収支(+)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded"></div>
                <span className="text-gray-900">平均収支(-)</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="space-y-4">
            {/* ジャックポット殿堂（アバター付き） */}
            {allJackpotWinners.length > 0 && (
              <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 backdrop-blur-sm rounded-2xl shadow-xl p-5 border-2 border-yellow-300">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                  <Sparkles className="w-5 h-5 text-yellow-600" />
                  ジャックポット殿堂
                </h2>
                <div className="space-y-3">
                  {allJackpotWinners.map((winner, idx) => (
                    <div key={winner.id} className="relative">
                      <div className={`bg-gradient-to-r ${
                        winner.hand_type.includes('ロイヤル') 
                          ? 'from-purple-100 via-pink-100 to-indigo-100 border-purple-400' 
                          : 'from-blue-100 via-indigo-100 to-purple-100 border-blue-400'
                      } rounded-xl p-4 border-l-4`}>
                        <div className="flex items-start justify-between">
                          <div className="flex gap-3">
                            <AvatarIcon profile={winner.profiles} size="md" />
                            <div>
                              <div className="flex items-center gap-2">
                                {idx === 0 && <span className="text-2xl">👑</span>}
                                <span className="font-black text-gray-900 text-lg">
                                  {winner.profiles?.username}
                                </span>
                              </div>
                              <div className="text-purple-600 font-bold mt-1">
                                {winner.hand_type}
                              </div>
                              <div className="text-3xl font-black text-green-600 mt-2">
                                +{winner.amount.toLocaleString()} P
                              </div>
                              <div className="mt-2 space-y-1">
                                <p className="text-xs font-semibold text-gray-700">
                                  <CreditCard className="inline w-3 h-3 mr-1" />
                                  {winner.hand_cards}
                                </p>
                                <p className="text-xs font-semibold text-gray-700">
                                  <Trophy className="inline w-3 h-3 mr-1" />
                                  {winner.board_cards}
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-gray-800">
                              {new Date(winner.created_at).toLocaleDateString('ja-JP')}
                            </p>
                          </div>
                        </div>
                      </div>
                      {idx === 0 && (
                        <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg animate-pulse">
                          LATEST
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 大勝ち記録（アバター付き） */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-green-200">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <Award className="w-5 h-5 text-green-600" />
                大勝ち記録 TOP5
              </h2>
              <div className="space-y-3">
                {bigWins.map((session, idx) => (
                  <div key={idx} className="relative">
                    <div className="bg-gradient-to-r from-green-100 via-emerald-100 to-teal-100 rounded-xl p-4 border-l-4 border-green-500">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <AvatarIcon profile={session.profiles} size="sm" />
                          <div>
                            <div className="font-black text-gray-900 text-lg">
                              {idx + 1}. {session.profiles?.username}
                            </div>
                            <div className="text-xs font-semibold text-gray-800 mt-1">
                              {new Date(session.played_at).toLocaleDateString('ja-JP')} | {session.play_hours}時間
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-green-600">
                            +{session.profit.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                    {idx === 0 && (
                      <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-black px-2 py-1 rounded-full shadow-lg">
                        BEST
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 大負け記録（アバター付き） */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-red-200">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <Award className="w-5 h-5 text-red-600" />
                大負け記録 TOP5
              </h2>
              <div className="space-y-3">
                {bigLosses.map((session, idx) => (
                  <div key={idx} className="relative">
                    <div className="bg-gradient-to-r from-red-100 via-pink-100 to-rose-100 rounded-xl p-4 border-l-4 border-red-500">
                      <div className="flex items-start justify-between">
                        <div className="flex gap-3">
                          <AvatarIcon profile={session.profiles} size="sm" />
                          <div>
                            <div className="font-black text-gray-900 text-lg">
                              {idx + 1}. {session.profiles?.username}
                            </div>
                            <div className="text-xs font-semibold text-gray-800 mt-1">
                              {new Date(session.played_at).toLocaleDateString('ja-JP')} | {session.play_hours}時間
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-black text-red-600">
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
        )}
      </div>
    </div>
  )
}