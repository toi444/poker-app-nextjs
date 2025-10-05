'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  TrendingUp, Users, BarChart3, BookOpen, DollarSign,
  User, Trophy, Sparkles, Shield, ChevronRight,
  Target, Link2, ArrowRight, Zap, Crown, Award, Coins
} from 'lucide-react'

type Section = 'game-report' | 'data' | 'all-gamble' | 'lesson' | 'pbank'

export default function DashboardV2() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [activeSection, setActiveSection] = useState<Section>('all-gamble')
  const [loading, setLoading] = useState(true)
  
  const [allGamble30Days, setAllGamble30Days] = useState(0)
  const [currentJackpot, setCurrentJackpot] = useState(0)
  const [weeklyRanking, setWeeklyRanking] = useState<any[]>([])
  const [roastComment, setRoastComment] = useState('')
  const [pbankData, setPbankData] = useState({ lent: 0, borrowed: 0, interest: 0, nextInterest: 0 })

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user && activeSection === 'data') {
      loadDataSection()
    } else if (user && activeSection === 'pbank') {
      loadPBankData()
    }
  }, [user, activeSection])

  const checkUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/login')
        return
      }
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, equipped_badge(*)')
        .eq('id', authUser.id)
        .single()
      
      const isAdmin = authUser.email === 'toui.reigetsu@gmail.com'
      
      setUser({
        ...authUser,
        ...profile,
        role: isAdmin ? 'admin' : (profile?.role || 'player')
      })
      
      await loadAllGamble30Days(authUser.id)
      setLoading(false)
    } catch (error) {
      console.error('User check error:', error)
      setLoading(false)
    }
  }

  const loadAllGamble30Days = async (userId: string) => {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const startDate = thirtyDaysAgo.toISOString().split('T')[0]
    const endDate = new Date().toISOString().split('T')[0]

    const { data: gambleData } = await supabase
      .from('gamble_records')
      .select('profit')
      .eq('user_id', userId)
      .gte('played_date', startDate)
      .lte('played_date', endDate)

    const { data: gameData } = await supabase
      .from('game_sessions')
      .select('profit, played_at')
      .eq('user_id', userId)

    const prettyCureData = gameData
      ?.map(g => {
        const playedDate = new Date(g.played_at)
        const jstDate = new Date(playedDate.getTime() + 9 * 60 * 60 * 1000)
        const dateStr = jstDate.toISOString().split('T')[0]
        return { profit: g.profit, date: dateStr }
      })
      .filter(g => g.date >= startDate && g.date <= endDate) || []

    const allData = [...(gambleData || []), ...prettyCureData]
    const totalProfit = allData.reduce((sum, r) => sum + r.profit, 0)
    setAllGamble30Days(totalProfit)
  }

  const loadDataSection = async () => {
    const { data: jpData } = await supabase
      .from('jackpot_pool')
      .select('current_amount')
      .single()
    if (jpData) setCurrentJackpot(jpData.current_amount)

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: rankData } = await supabase
      .from('game_sessions')
      .select(`
        user_id,
        profit,
        profiles(username, avatar_url, equipped_badge(*))
      `)
      .gte('played_at', sevenDaysAgo.toISOString())

    if (rankData) {
      const playerStats = new Map()
      rankData.forEach((session: any) => {
        const username = session.profiles?.username || 'Unknown'
        const avatarUrl = session.profiles?.avatar_url || null
        const equippedBadge = session.profiles?.equipped_badge || null
        const current = playerStats.get(session.user_id) || { 
          profit: 0, 
          username, 
          avatarUrl, 
          equippedBadge 
        }
        current.profit += session.profit || 0
        playerStats.set(session.user_id, current)
      })

      const rankings = Array.from(playerStats.values())
        .sort((a, b) => b.profit - a.profit)

      setWeeklyRanking(rankings)

      if (rankings.length >= 3) {
        const topThree = rankings.slice(0, 3).filter(r => r.profit > 0)
        const bottomThree = rankings.slice(-3).filter(r => r.profit < 0)
        
        const roasts = [
          "最近の{{player}}ほんま負けすぎやろ！",
          "{{player}}、みんなよりハンド1枚少ないんか？",
          "{{player}}、お前全然変わってへんやんけ！",
          "{{player}}フォールドって知ってる？",
          "{{player}}のプレイ、見てられへんわ",
          "{{player}}チップ配るボランティアでもやってんのか？",
          "{{player}}はポーカーよりジャグラー打った方がええで",
          "{{player}}金ドブに捨ててるだけやん",
          "{{player}}センスの欠片もないな",
          "{{player}}、ほんまに心配やわ",
          "最近の{{player}}、大丈夫かほんま",
          "{{player}}みたいな打ち方してたら破産するで",
          "{{player}}、ルール知ってる？",
          "{{player}}、そんなんで勝てると思ってるん？",
          "{{player}}、ボード見えてる？",
          "{{player}}、ハンドレンジって知ってるか？",
          "{{player}}いつからティルトなん？もしかしてずっとか？",
          "{{player}}、、、まぁ、俺はええけどな。",
          "{{player}}より俺の娘の方がうまいわ",
          "{{player}}、イカサマされてんのか？",
          "{{player}}、そのプレイ小学生以下やで",
          "{{player}}、もしかしてルール覚えてないんか？",
          "{{player}}、ポーカー教えたるから連絡してこい",
          "{{player}}とポーカー打てるなら俺メシに困らんわ",
          "{{player}}、相当カネに余裕あるんやな",
          "{{player}}、フィッシュ確定やな",
          "{{player}}、「コール」って誰かに言わされてんのか？",
          "{{player}}は参加率高すぎんねんほんま",
          "{{player}}ハンド見ていい？・・はよ降りとけ！",
          "{{player}}、ほんまおもろいな、おまえ"
        ]
        
        const praise = [
          "最近の{{player}}、強いやんけ！流石やな！",
          "{{player}}くん、やっぱり才能あると思っててん。",
          "{{player}}お前、最近調子ええやんけ！"
        ]

        // 5%の確率で上位3名を褒める（プラスの場合のみ）
        // 95%の確率で下位3名を罵る（マイナスの場合のみ）
        const shouldPraise = Math.random() < 0.05

        if (shouldPraise && topThree.length > 0) {
          const winner = topThree[Math.floor(Math.random() * topThree.length)]
          const comment = praise[Math.floor(Math.random() * praise.length)]
          setRoastComment(comment.replace('{{player}}', winner.username))
        } else if (bottomThree.length > 0) {
          const loser = bottomThree[Math.floor(Math.random() * bottomThree.length)]
          const comment = roasts[Math.floor(Math.random() * roasts.length)]
          setRoastComment(comment.replace('{{player}}', loser.username))
        }
      }
    }
  }

  const loadPBankData = async () => {
    if (!user) return

    const { data: loansData } = await supabase
      .from('loans')
      .select('*')
      .or(`lender_id.eq.${user.id},borrower_id.eq.${user.id}`)

    if (loansData) {
      const lent = loansData
        .filter(l => l.lender_id === user.id && l.status === 'active')
        .reduce((sum, l) => sum + l.remaining, 0)
      
      const borrowed = loansData
        .filter(l => l.borrower_id === user.id && l.status === 'active')
        .reduce((sum, l) => sum + l.remaining, 0)

      const nextInterestLent = Math.floor(lent * 0.1)
      const nextInterestBorrowed = Math.floor(borrowed * 0.1)
      const netNextInterest = nextInterestLent - nextInterestBorrowed

      const { data: interestData } = await supabase
        .from('interest_records')
        .select('amount, from_user_id, to_user_id')
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)

      const earnedInterest = interestData?.filter(i => i.to_user_id === user.id).reduce((sum, i) => sum + i.amount, 0) || 0
      const paidInterest = interestData?.filter(i => i.from_user_id === user.id).reduce((sum, i) => sum + i.amount, 0) || 0

      setPbankData({
        lent,
        borrowed,
        interest: earnedInterest - paidInterest,
        nextInterest: netNextInterest
      })
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
          <div className="absolute inset-0 animate-ping opacity-20">
            <div className="w-24 h-24 border-4 border-purple-500 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* ヘッダー */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-50 shadow-lg shadow-purple-500/20">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg animate-pulse" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-2xl flex items-center justify-center shadow-xl">
                  <Sparkles className="w-6 h-6 text-white animate-spin-slow" />
                </div>
              </div>
              <div>
                <h1 className="text-lg font-black bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent animate-shimmer">
                  Pretty Cure!
                </h1>
                <p className="text-xs text-purple-300">Gamble Manager</p>
              </div>
            </div>
            
            <button
              onClick={() => router.push('/profile')}
              className="group relative"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-md opacity-75 group-hover:opacity-100 transition-opacity" />
              <div className="relative flex items-center gap-3 bg-black/80 backdrop-blur-sm rounded-2xl px-3 py-2 border-2 border-purple-500/50">
                <div className="relative">
                  <div className={`w-10 h-10 rounded-full p-0.5 ${
                    user?.equipped_badge 
                      ? `bg-gradient-to-r ${user.equipped_badge.badge_gradient}`
                      : 'bg-gradient-to-r from-purple-500 to-pink-500'
                  }`}>
                    {user?.avatar_url ? (
                      <img 
                        src={user.avatar_url} 
                        alt="avatar" 
                        className="w-full h-full rounded-full object-cover bg-black"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* バッジアイコン */}
                  {user?.equipped_badge && (
                    <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${
                      `bg-gradient-to-r ${user.equipped_badge.badge_gradient}`
                    } rounded-full flex items-center justify-center border-2 border-white shadow-lg`}>
                      {(() => {
                        const iconMap: { [key: string]: any } = {
                          Trophy, Crown, Target, Zap, Award, Sparkles
                        }
                        const IconComponent = iconMap[user.equipped_badge.icon] || Trophy
                        return <IconComponent className="w-2.5 h-2.5 text-white" />
                      })()}
                    </div>
                  )}
                  
                  <div className="absolute -bottom-1 -left-1 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-black animate-pulse shadow-lg shadow-green-500/50" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-purple-300">30日収支</p>
                  <p className={`text-sm font-black ${allGamble30Days >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {allGamble30Days >= 0 ? '+' : ''}{allGamble30Days.toLocaleString()}P
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="container max-w-md mx-auto px-4 py-6 pb-32">
        {/* Game Report Section */}
        {activeSection === 'game-report' && (
          <div className="space-y-5 animate-slide-in">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600 blur-xl animate-pulse" />
                <TrendingUp className="relative w-8 h-8 text-purple-400" />
              </div>
              Game Report
            </h2>

            {user?.role === 'admin' ? (
              <>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
                  <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-3xl p-1 shadow-2xl">
                    <button
                      onClick={() => router.push('/game-report-batch')}
                      className="w-full bg-black/40 backdrop-blur-sm rounded-3xl p-6 border-2 border-white/20 hover:bg-black/60 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
                            <Users className="w-10 h-10 text-white drop-shadow-glow" />
                          </div>
                          <div className="text-left">
                            <p className="text-2xl font-black text-white drop-shadow-glow" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>一括記録登録</p>
                            <p className="text-base text-white/80 mt-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>複数プレイヤーを一括管理</p>
                          </div>
                        </div>
                        <ChevronRight className="w-7 h-7 text-white/70 group-hover:text-white group-hover:translate-x-2 transition-all" />
                      </div>
                    </button>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 blur-xl opacity-50" />
                  <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/50">
                    <p className="text-base text-blue-100 leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>
                      📝 <span className="font-black text-white">ホームゲームの収支記録は、基本的に管理者が一括登録します。</span>
                      <br /><br />
                      各プレイヤーは以下を申告してください：
                    </p>
                    <ul className="mt-3 space-y-2 text-base text-blue-100" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>
                      <li>• バイイン数</li>
                      <li>• 最終チップ数（端数含む）</li>
                      <li>• エアーでの貸し借り金額</li>
                    </ul>
                    <p className="mt-4 text-sm text-blue-200 bg-black/40 rounded-xl p-3 border border-blue-500/30" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>
                      ⚠️ 一括登録では全プレイヤーの開始・終了時刻が同じになります。<br />
                      また、数字が一致していなければ一括登録はできないため、誰かひとりが個別登録した場合は全員が個別登録をお願いします。もしくは過去の記録を追加したい方も、個別登録をお願いします。
                    </p>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={() => router.push('/game-report')}
                    className="relative w-full bg-black/60 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-2 border-indigo-500/50 hover:border-indigo-400 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/50">
                          <TrendingUp className="w-10 h-10 text-white" />
                        </div>
                        <div className="text-left">
                          <p className="text-2xl font-black text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>個別記録登録</p>
                          <p className="text-base text-indigo-200 mt-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>自分の成績を記録</p>
                        </div>
                      </div>
                      <ChevronRight className="w-7 h-7 text-indigo-300 group-hover:text-white group-hover:translate-x-2 transition-all" />
                    </div>
                  </button>
                </div>
              </>
            ) : (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={() => router.push('/game-report')}
                  className="relative w-full bg-black/60 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-2 border-purple-500/50 hover:border-purple-400 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/50">
                        <TrendingUp className="w-10 h-10 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-black text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>個別記録登録</p>
                        <p className="text-base text-purple-200 mt-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>自分の成績を記録</p>
                      </div>
                    </div>
                    <ChevronRight className="w-7 h-7 text-purple-300 group-hover:text-white group-hover:translate-x-2 transition-all" />
                  </div>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Data Section */}
        {activeSection === 'data' && (
          <div className="space-y-5 animate-slide-in">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-600 blur-xl animate-pulse" />
                <BarChart3 className="relative w-8 h-8 text-blue-400" />
              </div>
              Data & Analytics
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => router.push('/community')}
                className="relative group overflow-hidden rounded-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 to-red-600 animate-gradient" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="relative p-6 text-white">
                  <Users className="w-12 h-12 mb-3 drop-shadow-glow animate-float" />
                  <p className="font-black text-lg drop-shadow-glow">みんなの記録</p>
                  <p className="text-xs opacity-90 mt-1">Community</p>
                </div>
              </button>

              <button
                onClick={() => router.push('/stats')}
                className="relative group overflow-hidden rounded-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 animate-gradient" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="relative p-6 text-white">
                  <BarChart3 className="w-12 h-12 mb-3 drop-shadow-glow animate-float" />
                  <p className="font-black text-lg drop-shadow-glow">自分の記録</p>
                  <p className="text-xs opacity-90 mt-1">Statistics</p>
                </div>
              </button>
            </div>

            {/* ジャックポット */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 rounded-3xl blur-2xl opacity-75 animate-pulse" />
              <div className="relative bg-gradient-to-r from-yellow-500 via-orange-500 to-red-600 rounded-3xl p-1 shadow-2xl">
                <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Trophy className="w-8 h-8 text-yellow-300 drop-shadow-glow animate-bounce-slow" />
                      <p className="text-lg font-black text-yellow-300 drop-shadow-glow">MEGA JACKPOT</p>
                    </div>
                    <Zap className="w-7 h-7 text-yellow-300 animate-pulse drop-shadow-glow" />
                  </div>
                  <p className="text-5xl font-black text-white drop-shadow-glow mb-2">{currentJackpot.toLocaleString()}<span className="text-3xl ml-1">P</span></p>
                  <p className="text-sm text-yellow-200">ロイヤルフラッシュで獲得！</p>
                </div>
              </div>
            </div>

            {/* ???さんからのアドバイス */}
            {roastComment && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl blur-lg opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-orange-500/50">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="absolute inset-0 bg-orange-600 blur-lg animate-pulse" />
                      <div className="relative w-14 h-14 bg-gradient-to-br from-orange-600 to-amber-600 rounded-full flex items-center justify-center flex-shrink-0 border-2 border-orange-400">
                        <span className="text-white text-2xl font-black drop-shadow-glow">?</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-base font-black text-orange-300 mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>???さんからのアドバイス</p>
                      <p className="text-lg font-bold text-white leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 700 }}>「{roastComment}」</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 週間ランキング */}
            {weeklyRanking.length > 0 && (
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/50">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
                    <Crown className="w-6 h-6 text-yellow-400 drop-shadow-glow" />
                    直近7日間ランキング
                  </h3>
                  <div className="space-y-3">
                    {weeklyRanking.slice(0, 5).map((rank, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                        {/* 順位アイコン */}
                        <div className="flex-shrink-0">
                          {idx === 0 && (
                            <div className="relative">
                              <div className="absolute inset-0 bg-yellow-500 blur-lg animate-pulse" />
                              <Crown className="relative w-8 h-8 text-yellow-400 drop-shadow-glow" />
                            </div>
                          )}
                          {idx === 1 && (
                            <div className="relative">
                              <div className="absolute inset-0 bg-gray-400 blur-lg animate-pulse" />
                              <Award className="relative w-8 h-8 text-gray-300 drop-shadow-glow" />
                            </div>
                          )}
                          {idx === 2 && (
                            <div className="relative">
                              <div className="absolute inset-0 bg-orange-500 blur-lg animate-pulse" />
                              <Trophy className="relative w-8 h-8 text-orange-400 drop-shadow-glow" />
                            </div>
                          )}
                          {idx >= 3 && (
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black bg-gradient-to-br from-purple-500 to-indigo-600 border-2 border-purple-400`}>
                              <span className="text-white drop-shadow-glow">{idx + 1}</span>
                            </div>
                          )}
                        </div>

                        {/* アバター + バッジ */}
                        <div className="relative flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full p-0.5 ${
                            rank.equippedBadge 
                              ? `bg-gradient-to-r ${rank.equippedBadge.badge_gradient}`
                              : 'bg-gradient-to-r from-purple-500 to-pink-500'
                          }`}>
                            {rank.avatarUrl ? (
                              <img 
                                src={rank.avatarUrl} 
                                alt={rank.username}
                                className="w-full h-full rounded-full object-cover bg-black"
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                                <User className="w-6 h-6 text-white" />
                              </div>
                            )}
                          </div>
                          
                          {/* バッジアイコン */}
                          {rank.equippedBadge && (
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-lg bg-gradient-to-r ${rank.equippedBadge.badge_gradient}`}>
                              {(() => {
                                const iconMap: { [key: string]: any } = {
                                  Trophy, Crown, Target, Zap, Award, Sparkles
                                }
                                const IconComponent = iconMap[rank.equippedBadge.icon] || Trophy
                                return <IconComponent className="w-2.5 h-2.5 text-white" />
                              })()}
                            </div>
                          )}
                        </div>

                        {/* ユーザー名 */}
                        <p className="font-bold text-white text-lg flex-1 truncate">{rank.username}</p>

                        {/* 収支 */}
                        <p className={`font-black text-xl ${rank.profit >= 0 ? 'text-green-400' : 'text-red-400'} drop-shadow-glow flex-shrink-0`}>
                          {rank.profit >= 0 ? '+' : ''}{rank.profit.toLocaleString()}P
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Coming Soon */}
            <div className="space-y-3">
              {[
                { icon: BarChart3, title: 'トーナメントデータ', desc: 'Coming Soon' },
                { icon: Users, title: 'みんなのAll-Gambleデータ', desc: 'Coming Soon（公開設定した記録を閲覧）' },
                { icon: Trophy, title: '記念写真ギャラリー', desc: 'Coming Soon（大勝ち・珍演出をシェア）' }
              ].map((item, idx) => (
                <div key={idx} className="bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-white/10 opacity-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <item.icon className="w-10 h-10 text-gray-500" />
                      <div>
                        <p className="font-bold text-gray-400 text-lg">{item.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
                      </div>
                    </div>
                    <span className="px-4 py-2 bg-gray-700/50 text-gray-400 rounded-full text-xs font-bold">準備中</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}


        {/* All-Gamble Section */}
        {activeSection === 'all-gamble' && (
          <>
            <div className="space-y-8 animate-slide-in">
              <h2 className="text-3xl font-black text-white flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-600 blur-xl animate-pulse" />
                  <Coins className="relative w-8 h-8 text-orange-400" />
                </div>
                All-Gamble
              </h2>
            </div>

            {/* KVを全幅表示 */}
            <div className="relative overflow-hidden" style={{ height: '450px', margin: '0 -1rem' }}>
              <div className="absolute inset-0 bg-black" />
              
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `linear-gradient(90deg, #3b82f6 1px, transparent 1px), linear-gradient(0deg, #3b82f6 1px, transparent 1px)`,
                  backgroundSize: '30px 30px'
                }} />
              </div>
              
              <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-0" style={{
                  backgroundImage: `linear-gradient(90deg, #8b5cf6 1px, transparent 1px), linear-gradient(0deg, #8b5cf6 1px, transparent 1px)`,
                  backgroundSize: '60px 60px',
                  animation: 'grid-drift 20s linear infinite'
                }} />
              </div>
              
              <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/30 rounded-full blur-[120px] animate-pulse" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600/30 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '0.5s' }} />
              
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/10 to-transparent h-32 animate-scan-line-slow" />
              </div>
              
              <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full bg-repeat animate-noise" style={{
                  backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' /%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' /%3E%3C/svg%3E")',
                  backgroundSize: '200px 200px'
                }} />
              </div>
              
              <div className="relative h-full flex flex-col items-center justify-center px-6">
                <div className="text-center space-y-10">
                  <div className="relative">
                    <div className="absolute inset-0 blur-xl bg-cyan-500/40 animate-pulse" />
                    <p className="relative text-sm font-black tracking-[0.3em] text-cyan-300/80 drop-shadow-lg uppercase"
                      style={{ 
                        textShadow: '0 0 10px rgba(6, 182, 212, 0.8), 0 0 20px rgba(6, 182, 212, 0.4)',
                        fontFamily: 'monospace',
                        letterSpacing: '0.3em'
                      }}>
                      ALL GAMBLE MANAGER
                    </p>
                  </div>
                  
                  <div className="relative space-y-6">
                    <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 opacity-50 animate-pulse" />
                    
                    <div className="relative">
                      <p className="absolute inset-0 text-4xl font-black text-red-500/20 blur-sm"
                        style={{ transform: 'translate(-2px, -2px)', animation: 'glitch-1 3s infinite' }}>
                        あらゆるギャンブル、
                      </p>
                      <p className="absolute inset-0 text-4xl font-black text-blue-500/20 blur-sm"
                        style={{ transform: 'translate(2px, 2px)', animation: 'glitch-2 3s infinite' }}>
                        あらゆるギャンブル、
                      </p>
                      <p className="relative text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-blue-200 to-cyan-200 leading-tight whitespace-nowrap"
                        style={{ 
                          textShadow: '0 0 30px rgba(147, 51, 234, 0.9), 0 0 60px rgba(59, 130, 246, 0.6), 0 0 90px rgba(6, 182, 212, 0.4)',
                          WebkitTextStroke: '1px rgba(147, 51, 234, 0.3)',
                          letterSpacing: '0.05em',
                          animation: 'neon-pulse 2s ease-in-out infinite'
                        }}>
                        あらゆるギャンブル、
                      </p>
                    </div>
                    
                    <div className="relative">
                      <p className="absolute inset-0 text-6xl font-black text-red-500/20 blur-sm"
                        style={{ transform: 'translate(-2px, -2px)', animation: 'glitch-1 3s infinite', animationDelay: '0.15s' }}>
                        一元管理
                      </p>
                      <p className="absolute inset-0 text-6xl font-black text-blue-500/20 blur-sm"
                        style={{ transform: 'translate(2px, 2px)', animation: 'glitch-2 3s infinite', animationDelay: '0.15s' }}>
                        一元管理
                      </p>
                      <p className="relative text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 leading-tight whitespace-nowrap"
                        style={{ 
                          textShadow: '0 0 30px rgba(6, 182, 212, 0.9), 0 0 60px rgba(59, 130, 246, 0.6), 0 0 90px rgba(147, 51, 234, 0.4)',
                          WebkitTextStroke: '1.5px rgba(6, 182, 212, 0.3)',
                          letterSpacing: '0.08em',
                          animation: 'neon-pulse 2s ease-in-out infinite',
                          animationDelay: '0.3s'
                        }}>
                        一元管理
                      </p>
                    </div>
                  </div>
                  
                  <div className="relative flex items-center justify-center gap-3 mt-8">
                    <div className="flex gap-1.5">
                      {[...Array(4)].map((_, i) => (
                        <div 
                          key={`left-${i}`}
                          className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-400 to-blue-500 shadow-lg shadow-purple-400/50"
                          style={{ animation: 'led-flow 2s ease-in-out infinite', animationDelay: `${i * 0.15}s` }}
                        />
                      ))}
                    </div>
                    
                    <div className="relative w-10 h-10">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-full blur-md animate-pulse" />
                      <div className="relative w-full h-full rounded-full bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 flex items-center justify-center border-2 border-cyan-400/50 shadow-lg shadow-blue-500/50">
                        <Coins className="w-5 h-5 text-white drop-shadow-glow" />
                      </div>
                    </div>
                    
                    <div className="flex gap-1.5">
                      {[...Array(4)].map((_, i) => (
                        <div 
                          key={`right-${i}`}
                          className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 shadow-lg shadow-cyan-400/50"
                          style={{ animation: 'led-flow 2s ease-in-out infinite', animationDelay: `${(i + 4) * 0.15}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-purple-500/50" />
              <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-cyan-500/50" />
              <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-blue-500/50" />
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-purple-500/50" />
              
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"
                  style={{ top: '30%', animation: 'scan-horizontal 4s ease-in-out infinite' }} />
                <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400/50 to-transparent"
                  style={{ top: '70%', animation: 'scan-horizontal 5s ease-in-out infinite', animationDelay: '1s' }} />
              </div>
            </div>

            <div className="space-y-8 mt-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
                <button
                  onClick={() => router.push('/all-gamble')}
                  className="relative w-full bg-gradient-to-br from-orange-600 to-red-600 rounded-3xl p-1 shadow-2xl"
                >
                  <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 border-2 border-white/20">
                    <div className="flex items-center justify-between text-white">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                          <DollarSign className="w-12 h-12 drop-shadow-glow" />
                        </div>
                        <div className="text-left">
                          <p className="text-2xl font-black drop-shadow-glow">収支管理</p>
                          <p className="text-sm opacity-90 mt-1">All Gamble Manager</p>
                        </div>
                      </div>
                      <ChevronRight className="w-7 h-7 opacity-70 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                    </div>
                  </div>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 bg-orange-600 blur-xl opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-orange-500/50">
                  <h3 className="font-bold text-white mb-4 flex items-center gap-2 text-lg">
                    <Link2 className="w-6 h-6 text-orange-400" />
                    役立つリンク集
                  </h3>
                  {[
                    { category: '🎴 ポーカー関連', color: 'purple', links: [
                      { name: 'ポーカーギルド', desc: '国内トーナメント情報', url: 'https://pokerguild.jp/tourneys' },
                      { name: 'ポーカースター', desc: '国際トーナメント情報', url: 'https://www.pokerstarslive.com/ja/?&no_redirect=1' }
                    ]},
                    { category: '🎰 スロット関連', color: 'red', links: [
                      { name: '一撃', desc: 'スロット情報サイト', url: 'https://1geki.jp/' },
                      { name: '台データオンライン', desc: 'スロットデータサイト', url: 'https://daidata.goraggio.com/' }
                    ]},
                    { category: '🏇 競馬関連', color: 'green', links: [
                      { name: 'ネットケイバ', desc: '競馬情報サイト', url: 'https://www.netkeiba.com/' },
                      { name: '即PAT・A-PAT', desc: '中央競馬ネット投票', url: 'https://www.ipat.jra.go.jp/sp/' },
                      { name: '地方競馬ネット投票', desc: '地方競馬', url: 'https://gn.ipat.jra.go.jp/' }
                    ]}
                  ].map((section, idx) => (
                    <div key={idx} className="mb-5 last:mb-0">
                      <p className="text-sm font-bold text-orange-300 mb-3">{section.category}</p>
                      <div className="space-y-2">
                        {section.links.map((link, linkIdx) => (
                          <a 
                            key={linkIdx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`block rounded-xl p-4 border-2 transition-all group ${
                              section.color === 'purple' ? 'bg-purple-950/30 border-purple-500/30 hover:border-purple-400 hover:bg-purple-950/50' :
                              section.color === 'red' ? 'bg-red-950/30 border-red-500/30 hover:border-red-400 hover:bg-red-950/50' :
                              'bg-green-950/30 border-green-500/30 hover:border-green-400 hover:bg-green-950/50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-base font-bold text-white">{link.name}</p>
                                <p className="text-xs text-gray-400 mt-1">{link.desc}</p>
                              </div>
                              <ArrowRight className={`w-5 h-5 group-hover:translate-x-1 transition-transform ${
                                section.color === 'purple' ? 'text-purple-400' :
                                section.color === 'red' ? 'text-red-400' :
                                'text-green-400'
                              }`} />
                            </div>
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Lesson Section */}
        {activeSection === 'lesson' && (
          <div className="space-y-5 animate-slide-in">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-pink-600 blur-xl animate-pulse" />
                <BookOpen className="relative w-8 h-8 text-pink-400" />
              </div>
              Lesson
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* 1. ポーカーレッスン - そのまま */}
              <button
                onClick={() => router.push('/lesson')}
                className="relative group overflow-hidden rounded-2xl aspect-[3/4]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-pink-600 to-rose-700 animate-gradient" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="relative h-full flex flex-col items-center justify-center p-5 text-white">
                  <span className="text-7xl drop-shadow-glow animate-float mb-6">🎴</span>
                  <div className="text-center">
                    <p className="font-black text-lg drop-shadow-glow" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>テキサスホールデム</p>
                    <p className="text-sm opacity-90 mt-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 700 }}>確率・用語</p>
                  </div>
                </div>
                <div className="absolute inset-0 border-4 border-pink-400/50 rounded-2xl" />
              </button>

              {/* 2. バカラレッスン - そのまま */}
              <button
                onClick={() => router.push('/baccarat-lesson')}
                className="relative group overflow-hidden rounded-2xl aspect-[3/4]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-yellow-600 to-blue-600 animate-gradient" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="relative h-full flex flex-col items-center justify-center p-5 text-white">
                  <span className="text-7xl drop-shadow-glow animate-float mb-6">💎</span>
                  <div className="text-center">
                    <p className="font-black text-lg drop-shadow-glow" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>バカラ</p>
                    <p className="text-sm opacity-90 mt-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 700 }}>ルール・確率</p>
                  </div>
                </div>
                <div className="absolute inset-0 border-4 border-red-400/50 rounded-2xl" />
              </button>

              {/* 3. 投資法シミュレーター - 新規追加！ */}
              <button
                onClick={() => router.push('/betting-simulator')}
                className="relative group overflow-hidden rounded-2xl aspect-[3/4]"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 animate-gradient" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="relative h-full flex flex-col items-center justify-center p-5 text-white">
                  <span className="text-7xl drop-shadow-glow animate-float mb-6">📊</span>
                  <div className="text-center">
                    <p className="font-black text-lg drop-shadow-glow" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>投資法</p>
                    <p className="text-sm opacity-90 mt-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 700 }}>シミュレーター</p>
                  </div>
                </div>
                <div className="absolute inset-0 border-4 border-orange-400/50 rounded-2xl" />
              </button>

              {/* Coming Soon - 基本ルール */}
              <div className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-black/40 backdrop-blur-sm border-2 border-white/10 opacity-50">
                <div className="h-full flex flex-col items-center justify-center p-5 text-center">
                  <span className="text-6xl mb-6">📖</span>
                  <div>
                    <p className="font-bold text-gray-400 text-base" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 700 }}>テキサスホールデム</p>
                    <p className="text-sm text-gray-500 mt-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>基本ルール</p>
                    <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>Coming Soon</p>
                  </div>
                </div>
              </div>

              {/* Coming Soon */}
              {[
                { icon: '🎲', name: 'パチンコ' },
                { icon: '🎰', name: 'スロット' },
                { icon: '🏇', name: '競馬' },
                { icon: '🚴', name: '競輪' },
                { icon: '🚤', name: '競艇' },
                { icon: '💎', name: 'バカラ' },
                { icon: '🎯', name: 'ルーレット' },
                { icon: '🃏', name: 'ブラックジャック' },
                { icon: '🎲', name: 'シックボー' },
                { icon: '🀄', name: 'チャイニーズポーカー' },
                { icon: '🎲', name: 'クラップス' },
                { icon: '🃏', name: 'オマハ' },
                { icon: '🃏', name: 'スタッド' },
                { icon: '🎲', name: '大小' },
                { icon: '🎴', name: 'ファンタン' },
                { icon: '🀄', name: '麻雀' },
                { icon: '🐓', name: '闘鶏' },
                { icon: '🎫', name: '宝くじ' },
                { icon: '⚽', name: 'スポーツベット' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="relative overflow-hidden rounded-2xl aspect-[3/4] bg-black/40 backdrop-blur-sm border-2 border-white/10 opacity-50"
                >
                  <div className="h-full flex flex-col items-center justify-center p-5 text-center">
                    <span className="text-6xl mb-6">{item.icon}</span>
                    <div>
                      <p className="font-bold text-gray-400 text-base" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 700 }}>{item.name}</p>
                      <p className="text-xs text-gray-500 mt-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>Coming Soon</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* P-BANK Section */}
        {activeSection === 'pbank' && (
          <div className="space-y-5 animate-slide-in">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-emerald-600 blur-xl animate-pulse" />
                <DollarSign className="relative w-8 h-8 text-emerald-400" />
              </div>
              P-BANK
            </h2>

            {/* 筆文字風 */}
            <div className="text-center py-8 relative">
              <div className="absolute inset-0 bg-red-600 blur-2xl opacity-30 animate-pulse" />
              <p className="relative text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 drop-shadow-2xl" 
                 style={{ 
                   textShadow: '0 0 20px rgba(239, 68, 68, 0.8), 0 0 40px rgba(249, 115, 22, 0.6)',
                   WebkitTextStroke: '2px rgba(239, 68, 68, 0.3)',
                   letterSpacing: '0.1em'
                 }}>
                チップや感謝の貸し借りはこちら
              </p>
            </div>

            {/* 4分割 */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="relative group">
                <div className="absolute inset-0 bg-green-600 blur-lg opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/50">
                  <p className="text-base font-black text-green-300 mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>貸出額</p>
                  <p className="text-3xl font-black text-green-400 drop-shadow-glow" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>{pbankData.lent.toLocaleString()}</p>
                  <p className="text-sm text-green-300 mt-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 700 }}>P</p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-red-600 blur-lg opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/50">
                  <p className="text-base font-black text-red-300 mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>借入額</p>
                  <p className="text-3xl font-black text-red-400 drop-shadow-glow" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>{pbankData.borrowed.toLocaleString()}</p>
                  <p className="text-sm text-red-300 mt-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 700 }}>P</p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-blue-600 blur-lg opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/50">
                  <p className="text-base font-black text-blue-300 mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>利息総額</p>
                  <p className={`text-3xl font-black ${pbankData.interest >= 0 ? 'text-blue-400' : 'text-orange-400'} drop-shadow-glow`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                    {pbankData.interest >= 0 ? '+' : ''}{pbankData.interest.toLocaleString()}
                  </p>
                  <p className="text-sm text-blue-300 mt-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 700 }}>P</p>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-purple-600 blur-lg opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/50">
                  <p className="text-base font-black text-purple-300 mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>今月末利息</p>
                  <p className={`text-3xl font-black ${pbankData.nextInterest >= 0 ? 'text-purple-400' : 'text-orange-400'} drop-shadow-glow`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                    {pbankData.nextInterest >= 0 ? '+' : ''}{pbankData.nextInterest.toLocaleString()}
                  </p>
                  <p className="text-sm text-purple-300 mt-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 700 }}>P (予測)</p>
                </div>
              </div>
            </div>

            {/* P-BANKへ */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
              <button
                onClick={() => router.push('/pbank')}
                className="relative w-full bg-gradient-to-br from-emerald-600 to-green-600 rounded-3xl p-1 shadow-2xl"
              >
                <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 border-2 border-white/20">
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30">
                        <DollarSign className="w-12 h-12 drop-shadow-glow" />
                      </div>
                      <div className="text-left">
                        <p className="text-2xl font-black drop-shadow-glow">P-BANK管理</p>
                        <p className="text-sm opacity-90 mt-1">融資・返済の詳細</p>
                      </div>
                    </div>
                    <ChevronRight className="w-7 h-7 opacity-70 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ボトムナビゲーション */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-2xl border-t-2 border-purple-500/50 shadow-2xl shadow-purple-500/20 z-50">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-end justify-around">
            {[
              { id: 'game-report', icon: TrendingUp, label: 'Report', color: 'violet' },
              { id: 'data', icon: BarChart3, label: 'Data', color: 'blue' },
              { id: 'all-gamble', icon: Coins, label: 'ALL-Gamble', color: 'orange', big: true },
              { id: 'lesson', icon: BookOpen, label: 'Lesson', color: 'pink' },
              { id: 'pbank', icon: DollarSign, label: 'P-BANK', color: 'emerald' }
            ].map((item) => {
              const isActive = activeSection === item.id
              const colorClasses = {
                violet: {
                  text: 'text-violet-400',
                  bg: 'bg-violet-600',
                  gradient: 'from-violet-600 to-violet-700',
                  shadow: 'shadow-violet-500/50',
                  border: 'border-violet-400'
                },
                blue: {
                  text: 'text-blue-400',
                  bg: 'bg-blue-600',
                  gradient: 'from-blue-600 to-blue-700',
                  shadow: 'shadow-blue-500/50',
                  border: 'border-blue-400'
                },
                orange: {
                  text: 'text-orange-400',
                  bg: 'bg-orange-600',
                  gradient: 'from-orange-600 to-orange-700',
                  shadow: 'shadow-orange-500/50',
                  border: 'border-orange-400'
                },
                pink: {
                  text: 'text-pink-400',
                  bg: 'bg-pink-600',
                  gradient: 'from-pink-600 to-pink-700',
                  shadow: 'shadow-pink-500/50',
                  border: 'border-pink-400'
                },
                emerald: {
                  text: 'text-emerald-400',
                  bg: 'bg-emerald-600',
                  gradient: 'from-emerald-600 to-emerald-700',
                  shadow: 'shadow-emerald-500/50',
                  border: 'border-emerald-400'
                }
              }
              const colors = colorClasses[item.color as keyof typeof colorClasses]
              
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as Section)}
                  className={`flex flex-col items-center transition-all ${item.big ? '-mt-6' : ''} ${
                    isActive ? colors.text : 'text-gray-500'
                  }`}
                >
                  <div className="relative">
                    {isActive && (
                      <div className={`absolute inset-0 ${colors.bg} blur-xl animate-pulse`} />
                    )}
                    <div className={`relative ${item.big ? 'w-20 h-20' : 'w-14 h-14'} rounded-3xl flex items-center justify-center transition-all ${
                      isActive
                        ? `bg-gradient-to-br ${colors.gradient} shadow-2xl ${colors.shadow} scale-110 border-2 ${colors.border}`
                        : 'bg-gray-800/50 border-2 border-gray-700/50'
                    }`}>
                      <item.icon className={`${item.big ? 'w-10 h-10' : 'w-7 h-7'} ${isActive ? 'text-white drop-shadow-glow' : 'text-gray-500'}`} />
                    </div>
                  </div>
                  <span className={`text-xs font-bold mt-2 ${isActive ? 'text-white' : 'text-gray-500'}`}>
                    {item.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes led-blink {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.3;
            transform: scale(0.8);
          }
        }

        @keyframes light-beam {
          0%, 100% {
            opacity: 0.3;
            transform: translateY(-100%);
          }
          50% {
            opacity: 0.6;
            transform: translateY(100%);
          }
        }

        .animate-light-beam {
          animation: light-beam 3s ease-in-out infinite;
        }
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

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
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

        @keyframes particle-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.8;
          }
          50% {
            transform: translate(30px, -20px) scale(1.5);
            opacity: 1;
          }
        }

        @keyframes particle-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(-25px, 25px) scale(1.3);
            opacity: 1;
          }
        }

        @keyframes particle-3 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.7;
          }
          50% {
            transform: translate(20px, 30px) scale(1.4);
            opacity: 1;
          }
        }

        @keyframes particle-4 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.9;
          }
          50% {
            transform: translate(-30px, -25px) scale(1.6);
            opacity: 1;
          }
        }

        @keyframes neon-flicker {
          0%, 100% {
            opacity: 1;
            text-shadow: 0 0 30px currentColor, 0 0 60px currentColor, 0 0 90px currentColor;
          }
          50% {
            opacity: 0.95;
            text-shadow: 0 0 20px currentColor, 0 0 40px currentColor, 0 0 60px currentColor;
          }
        }

        @keyframes grid-move {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(50px);
          }
        }

        @keyframes scan-line {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(100%);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-shimmer {
          background: linear-gradient(90deg, #a855f7, #ec4899, #f97316, #a855f7);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        .animate-particle-1 {
          animation: particle-1 6s ease-in-out infinite;
        }

        .animate-particle-2 {
          animation: particle-2 7s ease-in-out infinite;
        }

        .animate-particle-3 {
          animation: particle-3 5s ease-in-out infinite;
        }

        .animate-particle-4 {
          animation: particle-4 8s ease-in-out infinite;
        }

        .animate-neon-flicker {
          animation: neon-flicker 3s ease-in-out infinite;
        }

        .animate-scan-line {
          animation: scan-line 4s linear infinite;
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }

        @keyframes grid-drift {
          0% {
            transform: translate(0, 0);
          }
          100% {
            transform: translate(60px, 60px);
          }
        }

        @keyframes scan-line-slow {
          0% {
            transform: translateY(-100%);
          }
          100% {
            transform: translateY(400%);
          }
        }

        @keyframes noise {
          0%, 100% {
            transform: translate(0, 0);
          }
          10% {
            transform: translate(-5%, -5%);
          }
          20% {
            transform: translate(-10%, 5%);
          }
          30% {
            transform: translate(5%, -10%);
          }
          40% {
            transform: translate(-5%, 15%);
          }
          50% {
            transform: translate(-10%, 5%);
          }
          60% {
            transform: translate(15%, 0);
          }
          70% {
            transform: translate(0, 10%);
          }
          80% {
            transform: translate(-15%, 0);
          }
          90% {
            transform: translate(10%, 5%);
          }
        }

        @keyframes glitch-1 {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.2;
          }
          33% {
            transform: translate(-3px, -2px);
            opacity: 0.3;
          }
          66% {
            transform: translate(3px, 2px);
            opacity: 0.1;
          }
        }

        @keyframes glitch-2 {
          0%, 100% {
            transform: translate(0, 0);
            opacity: 0.2;
          }
          33% {
            transform: translate(2px, 3px);
            opacity: 0.1;
          }
          66% {
            transform: translate(-2px, -3px);
            opacity: 0.3;
          }
        }

        @keyframes neon-pulse {
          0%, 100% {
            opacity: 1;
            filter: brightness(1);
          }
          50% {
            opacity: 0.95;
            filter: brightness(1.2);
          }
        }

        @keyframes led-flow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes scan-horizontal {
          0%, 100% {
            left: -100%;
            opacity: 0;
          }
          50% {
            left: 50%;
            opacity: 1;
          }
          100% {
            left: 200%;
            opacity: 0;
          }
        }

        .animate-noise {
          animation: noise 0.5s steps(10) infinite;
        }



      `}</style>
    </div>
  )
}