'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  TrendingUp, DollarSign, BarChart3, Users, 
  BookOpen, User, LogOut, Sparkles, Clock,
  Trophy, Zap, Shield, Bell, Star, Heart,
  Activity, Award, Target, Coins, Crown,
  ChevronRight, ArrowUp, ArrowDown
} from 'lucide-react'

interface NotificationData {
  count: number
  type: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentJackpot, setCurrentJackpot] = useState(0)
  const [recentStats, setRecentStats] = useState({ games: 0, profit: 0, winRate: 0, streak: 0 })
  const [pbankNotifications, setPbankNotifications] = useState<NotificationData>({ count: 0, type: '' })
  const [loading, setLoading] = useState(true)
  const [jackpotAnimation, setJackpotAnimation] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkUser()
    fetchJackpot()
    fetchRecentStats()
    fetchPbankNotifications()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    const jackpotTimer = setInterval(() => {
      setJackpotAnimation(prev => !prev)
    }, 3000)
    return () => {
      clearInterval(timer)
      clearInterval(jackpotTimer)
    }
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      
      const isAdmin = user.email === 'toui.reigetsu@gmail.com'
      
      setUser({
        ...user,
        username: user.email?.split('@')[0] || 'ユーザー',
        avatar_url: null,
        role: isAdmin ? 'admin' : 'player'
      })
      
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username, avatar_url, role')
          .eq('id', user.id)
          .single()
        
        if (profile) {
          setUser(prev => ({
            ...prev,
            username: profile.username || prev.username,
            avatar_url: profile.avatar_url,
            role: profile.role || prev.role
          }))
        }
      } catch (profileError) {
        console.log('Profile fetch failed, using email-based admin check')
      }
      setLoading(false)
    } catch (error) {
      console.error('Check user error:', error)
      setLoading(false)
    }
  }

  const fetchJackpot = async () => {
    try {
      const { data } = await supabase
        .from('jackpot_pool')
        .select('current_amount')
        .single()
      if (data) setCurrentJackpot(data.current_amount)
    } catch (error) {
      console.error('Jackpot fetch error:', error)
    }
  }

  const fetchRecentStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data } = await supabase
        .from('game_sessions')
        .select('profit, played_at')
        .eq('user_id', user.id)
        .gte('played_at', thirtyDaysAgo.toISOString())
        .order('played_at', { ascending: false })
      
      if (data && data.length > 0) {
        const totalProfit = data.reduce((sum, s) => sum + (s.profit || 0), 0)
        const wins = data.filter(s => s.profit > 0).length
        const winRate = (wins / data.length * 100)
        
        // 連勝・連敗計算
        let currentStreak = 0
        let streakType = null
        for (const session of data) {
          if (streakType === null) {
            streakType = session.profit > 0 ? 'win' : 'loss'
            currentStreak = 1
          } else if ((session.profit > 0 && streakType === 'win') || 
                     (session.profit <= 0 && streakType === 'loss')) {
            currentStreak++
          } else {
            break
          }
        }
        
        setRecentStats({
          games: data.length,
          profit: totalProfit,
          winRate: winRate,
          streak: streakType === 'win' ? currentStreak : -currentStreak
        })
      }
    } catch (error) {
      console.error('Stats fetch error:', error)
    }
  }

  const fetchPbankNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, count } = await supabase
        .from('loan_applications')
        .select('type', { count: 'exact', head: true })
        .eq('to_user_id', user.id)
        .eq('status', '申込中')
      
      if (count) {
        setPbankNotifications({ count, type: 'loan_request' })
      }
    } catch (error) {
      console.error('P-BANK notifications fetch error:', error)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const menuItems = [
    { 
      icon: TrendingUp,
      title: 'Game Report', 
      subtitle: '収支を記録',
      description: '今日の成績を登録',
      href: '/game-report',
      gradient: 'from-violet-500 via-purple-500 to-indigo-600',
      shadowColor: 'shadow-purple-500/25',
      accentIcon: Activity
    },
    { 
      icon: DollarSign,
      title: 'P-BANK', 
      subtitle: '融資管理',
      description: '貸借を管理',
      href: '/pbank',
      gradient: 'from-green-500 via-emerald-500 to-teal-600',
      shadowColor: 'shadow-emerald-500/25',
      accentIcon: Coins,
      badge: pbankNotifications.count > 0 ? pbankNotifications.count : null
    },
    { 
      icon: BarChart3,
      title: 'Statistics', 
      subtitle: '詳細分析',
      description: '勝率を確認',
      href: '/stats',
      gradient: 'from-blue-500 via-cyan-500 to-sky-600',
      shadowColor: 'shadow-blue-500/25',
      accentIcon: Target
    },
    { 
      icon: Users,
      title: 'Community', 
      subtitle: 'ランキング',
      description: '順位を確認',
      href: '/community',
      gradient: 'from-orange-500 via-amber-500 to-yellow-600',
      shadowColor: 'shadow-orange-500/25',
      accentIcon: Crown
    },
    { 
      icon: BookOpen,
      title: 'Lesson', 
      subtitle: 'ポーカー学習',
      description: 'スキルアップ',
      href: '/lesson',
      gradient: 'from-pink-500 via-rose-500 to-red-600',
      shadowColor: 'shadow-pink-500/25',
      accentIcon: Award
    },
    { 
      icon: User,
      title: 'Profile', 
      subtitle: 'プロフィール',
      description: '設定を変更',
      href: '/profile',
      gradient: 'from-indigo-500 via-violet-500 to-purple-600',
      shadowColor: 'shadow-indigo-500/25',
      accentIcon: Star
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-20 h-20 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* ヘッダー - グラスモーフィズム */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl blur-lg opacity-70 animate-pulse" />
                <h1 className="relative text-xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  We Are Pretty Cure!
                </h1>
              </div>
              <Sparkles className="w-5 h-5 text-yellow-500 animate-pulse" />
            </div>
            
            {/* プロフィールボタン - ニューモーフィズム */}
            <button
              onClick={() => router.push('/profile')}
              className="group relative bg-white/80 backdrop-blur-sm rounded-2xl p-2 pr-3 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-indigo-600 rounded-full flex items-center justify-center shadow-inner">
                    {user?.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt="avatar" 
                        className="w-full h-full rounded-full object-cover border-2 border-white/50"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                </div>
                <span className="text-sm font-bold text-gray-800 group-hover:text-violet-600 transition-colors">
                  {user?.username}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container max-w-md mx-auto px-4 py-6 pb-24">
        {/* 時刻とステータス - フローティングカード */}
        <div className="mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-3xl font-black text-gray-900 tabular-nums">
                  {currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="text-sm font-medium text-gray-600 mt-1">
                  {currentTime.toLocaleDateString('ja-JP', { 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'short'
                  })}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 justify-end mb-1">
                  {recentStats.streak > 0 ? (
                    <>
                      <div className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full">
                        {recentStats.streak}連勝中🔥
                      </div>
                    </>
                  ) : recentStats.streak < 0 ? (
                    <>
                      <div className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full">
                        {Math.abs(recentStats.streak)}連敗中
                      </div>
                    </>
                  ) : null}
                </div>
                <p className="text-sm font-medium text-gray-600">
                  30日間: {recentStats.games}戦
                </p>
                <p className={`text-lg font-black ${recentStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {recentStats.profit >= 0 ? '+' : ''}{recentStats.profit.toLocaleString()}P
                </p>
              </div>
            </div>

            {/* プログレスバー風の勝率表示 */}
            <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-violet-500 to-indigo-600 transition-all"
                style={{ width: `${recentStats.winRate}%` }}
              />
            </div>
            <p className="text-xs font-medium text-gray-600 mt-1 text-center">
              勝率 {recentStats.winRate.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* ジャックポット - 3Dエフェクト */}
        <div className="mb-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 rounded-3xl blur-xl opacity-70 group-hover:opacity-100 transition-opacity animate-pulse" />
            <div className="relative bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-600 rounded-3xl p-6 shadow-2xl transform transition-all hover:scale-105 active:scale-95">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className={`w-6 h-6 text-white ${jackpotAnimation ? 'animate-bounce' : ''}`} />
                    <p className="text-sm font-bold text-white/90 tracking-wider">MEGA JACKPOT</p>
                  </div>
                  <p className="text-4xl font-black text-white tracking-tight">
                    {currentJackpot.toLocaleString()}
                    <span className="text-2xl ml-1">P</span>
                  </p>
                  <p className="text-xs text-white/70 mt-1">
                    ロイヤルフラッシュで獲得！
                  </p>
                </div>
                <div className="relative">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Trophy className="w-10 h-10 text-white animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* P-BANK通知 - さりげなく表示 */}
        {pbankNotifications.count > 0 && (
          <div className="mb-4">
            <button
              onClick={() => router.push('/pbank')}
              className="w-full bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between group hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
                    {pbankNotifications.count}
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-gray-900">P-BANK承認待ち</p>
                  <p className="text-xs text-gray-600">タップして確認</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
            </button>
          </div>
        )}

        {/* 管理者パネル - 特別デザイン */}
        {user?.role === 'admin' && (
          <div className="mb-6">
            <button
              onClick={() => router.push('/admin')}
              className="w-full relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-3xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 text-white rounded-3xl p-5 shadow-2xl transform transition-all hover:scale-[1.02] active:scale-95">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Shield className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-lg">管理者パネル</p>
                      <p className="text-xs text-white/80">システム管理・JP設定</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/70" />
                </div>
              </div>
            </button>
          </div>
        )}

        {/* メインメニュー - ベントグリッド */}
        <div className="grid grid-cols-2 gap-4">
          {menuItems.map((item, index) => {
            const Icon = item.icon
            const AccentIcon = item.accentIcon
            return (
              <button
                key={index}
                onClick={() => router.push(item.href)}
                className="group relative"
              >
                {/* 背景のグロー効果 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity`} />
                
                {/* カード本体 */}
                <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 border border-white/50">
                  {/* バッジ */}
                  {item.badge && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse z-10">
                      {item.badge}
                    </div>
                  )}
                  
                  {/* アイコン */}
                  <div className={`bg-gradient-to-br ${item.gradient} w-14 h-14 rounded-2xl flex items-center justify-center mb-3 mx-auto ${item.shadowColor} shadow-lg transform group-hover:rotate-6 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  
                  {/* テキスト */}
                  <h3 className="font-black text-gray-900 text-sm mb-0.5">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-gray-600">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.description}
                  </p>
                  
                  {/* アクセントアイコン */}
                  <div className="absolute bottom-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <AccentIcon className="w-8 h-8 text-gray-900" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* ボトムナビゲーション - フローティング */}
      <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 px-2 py-2">
          <div className="flex items-center justify-around">
            <button
              onClick={() => router.push('/game-report')}
              className="flex flex-col items-center py-2 px-3 rounded-xl text-gray-600 hover:text-violet-600 hover:bg-violet-50 transition-all"
            >
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs mt-1 font-semibold">記録</span>
            </button>
            
            <button
              onClick={() => router.push('/community')}
              className="flex flex-col items-center py-2 px-3 rounded-xl text-gray-600 hover:text-violet-600 hover:bg-violet-50 transition-all"
            >
              <Users className="w-5 h-5" />
              <span className="text-xs mt-1 font-semibold">ランク</span>
            </button>
            
            <button
              onClick={() => router.push('/stats')}
              className="flex flex-col items-center py-2 px-3 rounded-xl text-gray-600 hover:text-violet-600 hover:bg-violet-50 transition-all"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-xs mt-1 font-semibold">統計</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="flex flex-col items-center py-2 px-3 rounded-xl text-gray-600 hover:text-red-600 hover:bg-red-50 transition-all"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs mt-1 font-semibold">ログアウト</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}