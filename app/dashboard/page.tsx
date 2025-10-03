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

interface WeeklyRanking {
  player: string
  profit: number
  avatar_url?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [currentJackpot, setCurrentJackpot] = useState(0)
  const [recentStats, setRecentStats] = useState({ games: 0, profit: 0, winRate: 0, streak: 0 })
  const [pbankNotifications, setPbankNotifications] = useState<NotificationData>({ count: 0, type: '' })
  const [weeklyRanking, setWeeklyRanking] = useState<WeeklyRanking[]>([])
  const [roastComment, setRoastComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [jackpotAnimation, setJackpotAnimation] = useState(false)
  const router = useRouter()

  // 煽り系セリフ（27パターン）
  const roastComments = [
    "最近の{{player}}は負けすぎやろ！なんも変わってへんな！",
    "最近の{{player}}、また負けとるんかい！学習能力ないんか！",
    "{{player}}、ハンド見てるか？",
    "{{player}}、絶好調に負けとるな！(笑)",
    "{{player}}、フォールドボタン壊れとんのか？",
    "{{player}}、チップの色、間違えて覚えてんのか？",
    "最近の{{player}}、全ハンドフォールドした方がマシちゃうか？",
    "最近の{{player}}、運がないんとちゃう、実力がないんや！",
    "最近の{{player}}、ハンド1枚しかもらってないんか？",
    "最近の{{player}}、捨てるほど金もってるってこと？",
    "最近の{{player}}、負けんのが趣味なんか？",
    "{{player}}、ポジション理解してる？まぁしてへんやろな！",
    "最近の{{player}}、逆に才能やな。",
    "最近の{{player}}、チップ配るボランティアご苦労さん！",
    "最近の{{player}}、風邪でもひいてんのか？",
    "大丈夫か？{{player}}、お前の人生やから俺はええけどな。",
    "最近の{{player}}、フィッシュって自分のことやで？気づいてる？",
    "{{player}}、コールばっかりしとったらアカンって！",
    "{{player}}、ハンドレンジって知っとる？",
    "{{player}}(笑)",
    "{{player}}、いつからティルトや？もしかしてずっとか？",
    "最近の{{player}}、ポットオッズ計算できてる？足し算から始めよか！",
    "最近の{{player}}、相手のレンジ考えてプレイしてる？いや、してへんな！",
    "{{player}}とポーカーするだけで家買えるんちゃうか(笑)",
    "{{player}}みたいなプレイヤーばっかりやったら楽やねんけどな！(笑)",
    "{{player}}、そろそろ勝ち方教えたろか？",
    "最近の{{player}}、負けるのが趣味なんか？"
  ]

  // 褒め系セリフ（3パターン）
  const praiseComments = [
    "最近の{{player}}、強いやんけ！流石やな！",
    "{{player}}、才能あると思っててん。嬉しいわ。",
    "{{player}}、ええ打ち方しているわ。お前らも見習えよホンマ！"
  ]

  const fetchWeeklyRanking = async () => {
    try {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data } = await supabase
        .from('game_sessions')
        .select(`
          user_id,
          profit,
          profiles(username, avatar_url)
        `)
        .gte('played_at', sevenDaysAgo.toISOString())

      if (data) {
        // プレイヤーごとに集計
        const playerStats = new Map<string, { profit: number; username: string; avatar_url?: string }>()
        
        data.forEach((session: any) => {
          const username = session.profiles?.username || 'Unknown'
          const current = playerStats.get(session.user_id) || { profit: 0, username, avatar_url: session.profiles?.avatar_url }
          current.profit += session.profit || 0
          playerStats.set(session.user_id, current)
        })

        // 配列に変換してソート
        const rankings: WeeklyRanking[] = Array.from(playerStats.values())
          .map(stat => ({
            player: stat.username,
            profit: stat.profit,
            avatar_url: stat.avatar_url
          }))
          .sort((a, b) => b.profit - a.profit)

        setWeeklyRanking(rankings)

        // コメント生成
        if (rankings.length >= 3) {
          // 上位3名でプラスの人を抽出
          const topThreeWithProfit = rankings.slice(0, 3).filter(r => r.profit > 0)
          
          // 下位3名でマイナスの人を抽出
          const bottomThreeWithLoss = rankings.slice(-3).filter(r => r.profit < 0)
          
          // 両方いる場合はランダムで選択
          const hasPraise = topThreeWithProfit.length > 0
          const hasRoast = bottomThreeWithLoss.length > 0
          
          if (hasPraise && hasRoast) {
            // 50%の確率で褒めるか煽るか
            if (Math.random() < 0.5) {
              const winner = topThreeWithProfit[Math.floor(Math.random() * topThreeWithProfit.length)]
              const comment = praiseComments[Math.floor(Math.random() * praiseComments.length)]
              setRoastComment(comment.replace('{{player}}', winner.player))
            } else {
              const loser = bottomThreeWithLoss[Math.floor(Math.random() * bottomThreeWithLoss.length)]
              const comment = roastComments[Math.floor(Math.random() * roastComments.length)]
              setRoastComment(comment.replace('{{player}}', loser.player))
            }
          } else if (hasPraise) {
            // 褒める人だけいる
            const winner = topThreeWithProfit[Math.floor(Math.random() * topThreeWithProfit.length)]
            const comment = praiseComments[Math.floor(Math.random() * praiseComments.length)]
            setRoastComment(comment.replace('{{player}}', winner.player))
          } else if (hasRoast) {
            // 煽る人だけいる
            const loser = bottomThreeWithLoss[Math.floor(Math.random() * bottomThreeWithLoss.length)]
            const comment = roastComments[Math.floor(Math.random() * roastComments.length)]
            setRoastComment(comment.replace('{{player}}', loser.player))
          }
          // どちらの条件にも該当しない場合はコメントなし
        }
      }
    } catch (error) {
      console.error('Weekly ranking fetch error:', error)
    }
  }

  useEffect(() => {
    checkUser()
    fetchJackpot()
    fetchRecentStats()
    fetchPbankNotifications()
    fetchWeeklyRanking()
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    const jackpotTimer = setInterval(() => {
      setJackpotAnimation(prev => !prev)
    }, 3000)
    return () => {
      clearInterval(timer)
      clearInterval(jackpotTimer)
    }
  }, [])

  // コメント5秒更新
  useEffect(() => {
    if (weeklyRanking.length >= 3) {
      const updateComment = () => {
        const topThreeWithProfit = weeklyRanking.slice(0, 3).filter(r => r.profit > 0)
        const bottomThreeWithLoss = weeklyRanking.slice(-3).filter(r => r.profit < 0)
        
        const hasPraise = topThreeWithProfit.length > 0
        const hasRoast = bottomThreeWithLoss.length > 0
        
        // 90%の確率で煽り、10%の確率で褒め
        const shouldRoast = Math.random() < 0.9
        
        if (shouldRoast && hasRoast) {
          // 煽りたいし煽れる人がいる
          const loser = bottomThreeWithLoss[Math.floor(Math.random() * bottomThreeWithLoss.length)]
          const comment = roastComments[Math.floor(Math.random() * roastComments.length)]
          setRoastComment(comment.replace('{{player}}', loser.player))
        } else if (!shouldRoast && hasPraise) {
          // 褒めたいし褒める人がいる
          const winner = topThreeWithProfit[Math.floor(Math.random() * topThreeWithProfit.length)]
          const comment = praiseComments[Math.floor(Math.random() * praiseComments.length)]
          setRoastComment(comment.replace('{{player}}', winner.player))
        } else if (hasRoast) {
          // 第一希望が叶わないが煽れる人がいる
          const loser = bottomThreeWithLoss[Math.floor(Math.random() * bottomThreeWithLoss.length)]
          const comment = roastComments[Math.floor(Math.random() * roastComments.length)]
          setRoastComment(comment.replace('{{player}}', loser.player))
        } else if (hasPraise) {
          // 第一希望が叶わないが褒める人がいる
          const winner = topThreeWithProfit[Math.floor(Math.random() * topThreeWithProfit.length)]
          const comment = praiseComments[Math.floor(Math.random() * praiseComments.length)]
          setRoastComment(comment.replace('{{player}}', winner.player))
        }
      }

      const commentTimer = setInterval(updateComment, 5000)
      return () => clearInterval(commentTimer)
    }
  }, [weeklyRanking])

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

  const mainMenuItems = [
    { 
      icon: TrendingUp,
      title: 'Game Report', 
      subtitle: '収支を記録',
      description: 'Pretty Cure!成績',
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
      icon: Trophy,
      title: 'All Gamble', 
      subtitle: '総合収支管理',
      description: '全ギャンブル記録',
      href: '/all-gamble',
      gradient: 'from-amber-500 via-orange-500 to-red-600',
      shadowColor: 'shadow-orange-500/25',
      accentIcon: Coins
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
      {/* ヘッダー */}
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
        {/* 時刻とステータス */}
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
                    <div className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold rounded-full">
                      {recentStats.streak}連勝中🔥
                    </div>
                  ) : recentStats.streak < 0 ? (
                    <div className="px-2 py-1 bg-gradient-to-r from-red-500 to-pink-600 text-white text-xs font-bold rounded-full">
                      {Math.abs(recentStats.streak)}連敗中
                    </div>
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

        {/* ジャックポット */}
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

        {/* 直近7日間ランキング */}
        {weeklyRanking.length > 0 && (
          <div className="mb-6">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-violet-100 overflow-hidden">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-600" />
                直近7日間ランキング
              </h3>
              
              {/* カルーセル */}
              <div className="relative">
                <div className="flex gap-3 animate-scroll">
                  {[...weeklyRanking, ...weeklyRanking].map((rank, idx) => (
                    <div 
                      key={idx}
                      className="flex-shrink-0 w-40 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl p-3 border border-violet-200"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {(idx % weeklyRanking.length) + 1}
                        </div>
                        <span className="text-sm font-bold text-gray-900 truncate flex-1">
                          {rank.player}
                        </span>
                      </div>
                      <div className={`text-lg font-black text-center ${
                        rank.profit >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {rank.profit >= 0 ? '+' : ''}{rank.profit.toLocaleString()}P
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 煽りコメント */}
            {roastComment && (
              <div className="mt-3 bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl p-4 border border-orange-200">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-lg font-bold">?</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-gray-700 mb-1">???さん</p>
                    <p className="text-sm font-bold text-gray-900 leading-relaxed">
                      「{roastComment}」
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* P-BANK通知 */}
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

        {/* 管理者パネル */}
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

        {/* 管理者：一括登録ボタン */}
        {user?.role === 'admin' && (
          <div className="mb-6">
            <button
              onClick={() => router.push('/game-report-batch')}
              className="w-full relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-3xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
              <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white rounded-3xl p-5 shadow-2xl transform transition-all hover:scale-[1.02] active:scale-95">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                      <Users className="w-7 h-7" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-lg">一括記録登録</p>
                      <p className="text-xs text-white/80">複数プレイヤーの記録を一括管理</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-white/70" />
                </div>
              </div>
            </button>
          </div>
        )}

        {/* メインメニュー */}
        <div className="grid grid-cols-2 gap-4">
          {mainMenuItems.map((item, index) => {
            const Icon = item.icon
            const AccentIcon = item.accentIcon
            const isAllGamble = item.href === '/all-gamble'
            
            return (
              <button
                key={index}
                onClick={() => router.push(item.href)}
                className="group relative"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity`} />
                
                <div className={`relative backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 ${
                  isAllGamble 
                    ? 'bg-gradient-to-br from-purple-100 via-violet-100 to-indigo-100 border-2 border-purple-400'
                    : 'bg-white/90 border border-white/50'
                }`}>
                  
                  {item.badge && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse z-10">
                      {item.badge}
                    </div>
                  )}
          
                  <div className={`bg-gradient-to-br ${item.gradient} w-14 h-14 rounded-2xl flex items-center justify-center mb-3 mx-auto ${item.shadowColor} shadow-lg transform group-hover:rotate-6 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
          
                  <h3 className="font-black text-gray-900 text-sm mb-0.5">
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold text-gray-600">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {item.description}
                  </p>
          
                  <div className="absolute bottom-2 right-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <AccentIcon className="w-8 h-8 text-gray-900" />
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* プロフィールカード（横長） */}
        <div className="mt-4">
          <button
            onClick={() => router.push('/profile')}
            className="w-full group relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity" />
            
            <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-2xl transition-all transform hover:scale-[1.02] active:scale-95 border border-white/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 w-12 h-12 rounded-xl flex items-center justify-center shadow-indigo-500/25 shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-black text-gray-900 text-sm">Profile</h3>
                    <p className="text-xs font-semibold text-gray-600">プロフィール・設定</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-600 transition-colors" />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* ボトムナビゲーション */}
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

      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-scroll {
          animation: scroll 7s linear infinite;
        }

        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}