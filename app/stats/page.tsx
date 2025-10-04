'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  TrendingUp,
  Trophy,
  Clock,
  Target,
  Activity,
  DollarSign,
  Calendar,
  Award,
  AlertCircle,
  Info,
  Zap,
  Star,
  Brain,
  Sparkles
} from 'lucide-react'

interface GameSession {
  id: string
  user_id: string
  played_at: string
  start_time: string
  end_time: string
  play_hours: number
  buy_in: number
  cash_out: number
  profit: number
  created_at: string
}

interface ChartData {
  date: string
  value: number
  cumulative: number
}

interface PlayStyleMetrics {
  winRate: number
  volatility: number
  roi: number
  bigSwingRate: number
  sessions: number
}

interface PlayStyleResult {
  type: string
  name: string
  description: string
  color: string
  icon: string
  advice: string
  metrics: PlayStyleMetrics
}

const PlayStyleDiagnosis = ({ sessions, stats }: { sessions: GameSession[], stats: any }) => {
  if (!sessions || sessions.length < 5) {
    return (
      <div className="relative group">
        <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50 animate-pulse" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-purple-500/50">
          <Brain className="w-16 h-16 text-purple-400 mx-auto mb-4 animate-pulse" />
          <p className="text-white font-black text-xl mb-2">データ不足</p>
          <p className="text-purple-200 text-sm font-semibold">
            プレイスタイル診断には最低5セッション以上のデータが必要です。
            もう少しプレイを記録してください。
          </p>
        </div>
      </div>
    )
  }

  const analyzePlayStyle = (): PlayStyleResult => {
    const totalSessions = sessions.length
    const winRate = stats.winRate
    const volatility = stats.volatility
    const roi = stats.roi
    
    const avgBuyIn = sessions.reduce((sum, s) => sum + s.buy_in, 0) / totalSessions
    const profitVolatility = volatility / avgBuyIn * 100
    
    const bigWins = sessions.filter(s => s.profit > avgBuyIn * 0.5).length
    const bigLosses = sessions.filter(s => s.profit < -avgBuyIn * 0.5).length
    const bigSwingRate = ((bigWins + bigLosses) / totalSessions) * 100
    
    let style: PlayStyleResult = {
      type: '',
      name: '',
      description: '',
      color: '',
      icon: '🎯',
      advice: '',
      metrics: {
        winRate: 0,
        volatility: 0,
        roi: 0,
        bigSwingRate: 0,
        sessions: 0
      }
    }
    
    if (winRate >= 55 && profitVolatility < 30 && roi > 10) {
      style = {
        type: 'TAG',
        name: 'TAG（タイトアグレッシブ）',
        description: 'バランスの取れた堅実なプレイスタイル。選択的に参加し、参加時は積極的。',
        color: 'from-blue-500 via-indigo-600 to-purple-600',
        icon: '⚔️',
        advice: 'TAGは最も安定した勝ちやすいスタイルです。このスタイルを維持しながら、時折プレイの幅を広げることで更なる成長が期待できます。',
        metrics: { winRate, volatility: profitVolatility, roi, bigSwingRate, sessions: totalSessions }
      }
    } else if (winRate >= 45 && profitVolatility > 50 && bigSwingRate > 40) {
      style = {
        type: 'LAG',
        name: 'LAG（ルースアグレッシブ）',
        description: '幅広いレンジで積極的にプレイ。大きな勝ちも負けも多い。',
        color: 'from-orange-500 via-red-600 to-pink-600',
        icon: '🔥',
        advice: 'LAGスタイルは高い技術を要します。メンタル管理とバンクロール管理が特に重要です。',
        metrics: { winRate, volatility: profitVolatility, roi, bigSwingRate, sessions: totalSessions }
      }
    } else if (winRate < 40 && roi < -10) {
      style = {
        type: 'FISH',
        name: 'フィッシュ（要改善）',
        description: '改善が必要な状態。基礎から見直しが必要。',
        color: 'from-red-600 via-pink-700 to-rose-600',
        icon: '🐟',
        advice: 'まず基礎戦略を学び直し、タイトなプレイから始めましょう。感情的なプレイ（ティルト）を避け、バンクロール管理を徹底してください。',
        metrics: { winRate, volatility: profitVolatility, roi, bigSwingRate, sessions: totalSessions }
      }
    } else if (winRate >= 50 && profitVolatility < 20 && bigSwingRate < 20) {
      style = {
        type: 'NIT',
        name: 'ニット（超タイトパッシブ）',
        description: '非常に慎重で保守的なプレイスタイル。',
        color: 'from-gray-500 via-slate-600 to-gray-700',
        icon: '🛡️',
        advice: '安全ですが利益機会を逃している可能性があります。もう少しプレイレンジを広げてみましょう。',
        metrics: { winRate, volatility: profitVolatility, roi, bigSwingRate, sessions: totalSessions }
      }
    } else if (totalSessions < 10) {
      style = {
        type: 'BEGINNER',
        name: 'ビギナー',
        description: 'まだスタイルが確立されていない段階。',
        color: 'from-green-500 via-emerald-600 to-teal-600',
        icon: '🌱',
        advice: 'もう少しデータが必要です。様々なプレイを試して自分のスタイルを見つけましょう。',
        metrics: { winRate, volatility: profitVolatility, roi, bigSwingRate, sessions: totalSessions }
      }
    } else {
      style = {
        type: 'ROCK',
        name: 'ロック（堅実型）',
        description: 'とても堅実で安定したプレイスタイル。',
        color: 'from-green-500 via-teal-600 to-cyan-600',
        icon: '🪨',
        advice: '安定したプレイですが、もう少し積極性を増やすことで収益を向上させられる可能性があります。',
        metrics: { winRate, volatility: profitVolatility, roi, bigSwingRate, sessions: totalSessions }
      }
    }
    
    return style
  }
  
  const diagnosis = analyzePlayStyle()
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="absolute inset-0 bg-amber-600 blur-xl opacity-50" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-amber-500/50">
          <div className="flex items-start gap-2">
            <Info className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-black text-amber-300 mb-1">診断について</p>
              <p className="text-amber-100 font-semibold leading-relaxed">
                この診断は収支データから推定したものです。実際のハンドレンジやVPIP/PFR等の詳細データは含まれていません。
                あくまで収支パターンから見た傾向としてご参考ください。
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative group">
        <div className={`absolute inset-0 bg-gradient-to-r ${diagnosis.color} rounded-3xl blur-2xl opacity-75 animate-pulse`} />
        <div className={`relative bg-gradient-to-br ${diagnosis.color} rounded-3xl p-1 shadow-2xl`}>
          <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
            <div className="relative">
              <div className="text-center mb-4">
                <div className="text-6xl mb-3 animate-bounce-slow">{diagnosis.icon}</div>
                <h3 className="text-xl font-black text-white/90 mb-2 drop-shadow-glow">あなたのプレイスタイル</h3>
                <p className="text-3xl font-black text-white drop-shadow-glow">{diagnosis.name}</p>
              </div>
              <p className="text-sm font-semibold text-white/90 mb-4 text-center">
                {diagnosis.description}
              </p>
              <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm border-2 border-white/30">
                <p className="text-sm font-black mb-3 text-white">診断根拠：</p>
                <div className="grid grid-cols-2 gap-3 text-sm font-semibold text-white/90">
                  <div>勝率: {diagnosis.metrics.winRate.toFixed(1)}%</div>
                  <div>変動率: {diagnosis.metrics.volatility.toFixed(1)}%</div>
                  <div>ROI: {diagnosis.metrics.roi.toFixed(1)}%</div>
                  <div>大変動率: {diagnosis.metrics.bigSwingRate.toFixed(1)}%</div>
                </div>
                {diagnosis.metrics.sessions < 10 && (
                  <p className="text-xs mt-3 text-white/70">
                    ※データ数{diagnosis.metrics.sessions}セッション（推定精度：低）
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-50" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-indigo-500/50">
          <h3 className="font-black text-white mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            上達へのアドバイス
          </h3>
          <p className="text-sm font-semibold text-indigo-100 leading-relaxed">
            {diagnosis.advice}
          </p>
          {diagnosis.metrics.sessions < 30 && (
            <div className="mt-4 p-3 bg-blue-500/20 rounded-lg border border-blue-400/30">
              <p className="text-xs font-black text-blue-300">
                📊 より正確な診断のために
              </p>
              <p className="text-xs font-semibold text-blue-200 mt-1">
                現在{diagnosis.metrics.sessions}セッションのデータです。
                30セッション以上で精度が向上し、50セッション以上で信頼性の高い診断が可能になります。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function StatsPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'time' | 'pattern' | 'style' | 'roi'>('overview')
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('month')

  useEffect(() => {
    checkAuth()
    loadSessions()
  }, [timeRange])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    }
  }

  const loadSessions = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('played_at', { ascending: true })

      if (timeRange !== 'all') {
        const now = new Date()
        let startDate = new Date()
        
        if (timeRange === 'week') {
          startDate.setDate(now.getDate() - 7)
        } else if (timeRange === 'month') {
          startDate.setMonth(now.getMonth() - 1)
        } else if (timeRange === 'year') {
          startDate.setFullYear(now.getFullYear() - 1)
        }
        
        query = query.gte('played_at', startDate.toISOString())
      }

      const { data, error } = await query
      
      if (error) {
        console.error('Error loading sessions:', error)
      } else {
        setSessions(data || [])
      }
    } catch (error) {
      console.error('セッション読み込みエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = () => {
    if (sessions.length === 0) return null

    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.played_at).getTime() - new Date(a.played_at).getTime()
    )

    const totalProfit = sessions.reduce((sum, s) => sum + (s.profit || 0), 0)
    const totalBuyIn = sessions.reduce((sum, s) => sum + (s.buy_in || 0), 0)
    const totalPlayHours = sessions.reduce((sum, s) => sum + (s.play_hours || 0), 0)
    const winSessions = sessions.filter(s => (s.profit || 0) > 0)
    const lossSessions = sessions.filter(s => (s.profit || 0) < 0)
    
    const hourlyStats = new Array(24).fill(0).map((_, hour) => {
      const hourSessions = sessions.filter(s => {
        if (s.start_time) {
          const startHour = parseInt(s.start_time.split(':')[0])
          return startHour === hour
        }
        return false
      })
      
      const totalProfit = hourSessions.reduce((sum, s) => sum + (s.profit || 0), 0)
      const winCount = hourSessions.filter(s => (s.profit || 0) > 0).length
      
      return {
        hour,
        count: hourSessions.length,
        profit: totalProfit,
        winRate: hourSessions.length > 0 ? (winCount / hourSessions.length * 100) : 0
      }
    })

    const weekdayStats = ['日', '月', '火', '水', '木', '金', '土'].map((day, index) => {
      const daySessions = sessions.filter(s => {
        const d = new Date(s.played_at).getDay()
        return d === index
      })
      
      const totalProfit = daySessions.reduce((sum, s) => sum + (s.profit || 0), 0)
      const avgProfit = daySessions.length > 0 ? totalProfit / daySessions.length : 0
      
      return {
        day,
        count: daySessions.length,
        profit: totalProfit,
        avgProfit
      }
    })

    let currentStreak = 0
    let maxWinStreak = 0
    let maxLossStreak = 0
    let tempWinStreak = 0
    let tempLossStreak = 0
    
    const sortedByDate = Array.from(sessions).sort((a, b) => 
      new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
    )
    sortedByDate.forEach(s => {
      if (s.profit > 0) {
        tempWinStreak++
        tempLossStreak = 0
        maxWinStreak = Math.max(maxWinStreak, tempWinStreak)
      } else if (s.profit < 0) {
        tempLossStreak++
        tempWinStreak = 0
        maxLossStreak = Math.max(maxLossStreak, tempLossStreak)
      } else {
        tempWinStreak = 0
        tempLossStreak = 0
      }
    })
    
    if (sortedSessions.length > 0) {
      const recent = sortedSessions[0]
      if (recent.profit > 0) {
        let streak = 0
        for (const s of sortedSessions) {
          if (s.profit > 0) streak++
          else break
        }
        currentStreak = streak
      } else if (recent.profit < 0) {
        let streak = 0
        for (const s of sortedSessions) {
          if (s.profit < 0) streak++
          else break
        }
        currentStreak = -streak
      }
    }

    return {
      totalSessions: sessions.length,
      totalProfit,
      totalBuyIn,
      totalPlayHours,
      roi: totalBuyIn > 0 ? (totalProfit / totalBuyIn * 100) : 0,
      winRate: sessions.length > 0 ? (winSessions.length / sessions.length * 100) : 0,
      avgProfit: sessions.length > 0 ? totalProfit / sessions.length : 0,
      maxWin: sessions.length > 0 ? Math.max(...sessions.map(s => s.profit || 0)) : 0,
      maxLoss: sessions.length > 0 ? Math.min(...sessions.map(s => s.profit || 0)) : 0,
      winSessions: winSessions.length,
      lossSessions: lossSessions.length,
      currentStreak,
      maxWinStreak,
      maxLossStreak,
      hourlyStats,
      weekdayStats,
      volatility: sessions.length > 1 ? calculateVolatility(sessions) : 0
    }
  }

  const calculateVolatility = (sessions: GameSession[]) => {
    const profits = sessions.map(s => s.profit || 0)
    const avg = profits.reduce((sum, p) => sum + p, 0) / profits.length
    const variance = profits.reduce((sum, p) => sum + Math.pow(p - avg, 2), 0) / profits.length
    return Math.sqrt(variance)
  }

  const stats = calculateStats()

  const getCumulativeData = (): ChartData[] => {
    if (sessions.length === 0) return []
    
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.played_at).getTime() - new Date(b.played_at).getTime()
    )
    
    let cumulative = 0
    return sortedSessions.map(s => {
      cumulative += (s.profit || 0)
      return {
        date: new Date(s.played_at).toLocaleDateString('ja-JP'),
        value: s.profit || 0,
        cumulative
      }
    })
  }

  const cumulativeData = getCumulativeData()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-purple-500 animate-pulse" />
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
      <div className="container max-w-md mx-auto p-4 pb-20">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="relative group mb-4"
          >
            <div className="absolute inset-0 bg-purple-600 blur-lg opacity-0 group-hover:opacity-75 transition-opacity rounded-full" />
            <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm border-2 border-purple-500/50 hover:border-purple-400 transition-all">
              <ArrowLeft className="h-5 w-5 text-purple-300" />
            </div>
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 bg-violet-600 blur-2xl opacity-50" />
            <h1 className="relative text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 flex items-center gap-3 drop-shadow-glow">
              <TrendingUp className="w-10 h-10 text-purple-400" />
              My Stats
            </h1>
          </div>
          <p className="text-purple-200 mt-2 font-semibold">詳細分析でプレイを改善</p>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-1.5 border-2 border-purple-500/50">
            <div className="flex gap-2">
              {(['week', 'month', 'year', 'all'] as const).map(range => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`flex-1 py-3 px-3 rounded-xl text-sm font-black transition-all ${
                    timeRange === range
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-purple-200 hover:bg-white/10'
                  }`}
                >
                  {range === 'week' ? '1週間' : 
                   range === 'month' ? '1ヶ月' : 
                   range === 'year' ? '1年' : '全期間'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!stats || sessions.length === 0 ? (
          <div className="relative group">
            <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50 animate-pulse" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-20 text-center border-2 border-purple-500/50">
              <Trophy className="w-20 h-20 text-purple-400 mx-auto mb-4 animate-bounce-slow" />
              <p className="text-white font-black text-xl mb-4">まだデータがありません</p>
              <button
                onClick={() => router.push('/game-report')}
                className="relative group/btn"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-xl blur-lg opacity-75 group-hover/btn:opacity-100 transition-opacity" />
                <div className="relative px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-black hover:shadow-lg transition-all">
                  ゲームを記録する
                </div>
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="relative group">
                <div className="absolute inset-0 bg-violet-600 blur-lg opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-violet-500/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="w-5 h-5 text-violet-400" />
                    <p className="text-xs font-black text-violet-300">総収支</p>
                  </div>
                  <p className={`text-2xl font-black ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'} drop-shadow-glow`}>
                    {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toLocaleString()}
                  </p>
                  <p className="text-xs font-semibold text-violet-200 mt-1">
                    ROI: {stats.roi.toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-600 blur-lg opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-indigo-500/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-indigo-400" />
                    <p className="text-xs font-black text-indigo-300">勝率</p>
                  </div>
                  <p className="text-2xl font-black text-white drop-shadow-glow">{stats.winRate.toFixed(1)}%</p>
                  <p className="text-xs font-semibold text-indigo-200 mt-1">
                    {stats.winSessions}勝 {stats.lossSessions}敗
                  </p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-green-600 blur-lg opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-green-500/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="w-5 h-5 text-green-400" />
                    <p className="text-xs font-black text-green-300">現在の調子</p>
                  </div>
                  <p className={`text-lg font-black ${
                    stats.currentStreak > 0 ? 'text-green-400' : 
                    stats.currentStreak < 0 ? 'text-red-400' : 
                    'text-gray-400'
                  } drop-shadow-glow`}>
                    {stats.currentStreak > 0 ? `${stats.currentStreak}連勝中` : 
                     stats.currentStreak < 0 ? `${Math.abs(stats.currentStreak)}連敗中` : 
                     'ニュートラル'}
                  </p>
                  <p className="text-xs font-semibold text-green-200 mt-1">
                    最高: {stats.maxWinStreak}連勝
                  </p>
                </div>
              </div>
              
              <div className="relative group">
                <div className="absolute inset-0 bg-purple-600 blur-lg opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-purple-500/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-5 h-5 text-purple-400" />
                    <p className="text-xs font-black text-purple-300">総プレイ</p>
                  </div>
                  <p className="text-2xl font-black text-white drop-shadow-glow">
                    {stats.totalPlayHours.toFixed(1)}h
                  </p>
                  <p className="text-xs font-semibold text-purple-200 mt-1">
                    {stats.totalSessions}セッション
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-1.5 border-2 border-purple-500/50">
                <div className="grid grid-cols-5 gap-1">
                  {[
                    { key: 'overview', icon: '📈', label: '収支推移' },
                    { key: 'time', icon: '🕐', label: '時間分析' },
                    { key: 'pattern', icon: '🎯', label: 'パターン' },
                    { key: 'style', icon: '🧠', label: 'スタイル診断' },
                    { key: 'roi', icon: '💰', label: 'ROI分析' }
                  ].map(tab => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                        activeTab === tab.key
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg transform scale-105'
                          : 'text-purple-200 hover:bg-white/10'
                      }`}
                    >
                      <span className="block text-lg mb-1">{tab.icon}</span>
                      <span className="text-[10px] font-black leading-tight">{tab.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-4 animate-slide-in">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 blur-xl opacity-50" />
                  <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-blue-500/50">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-black text-blue-300 mb-1">収支推移で分かること</p>
                        <p className="text-blue-100 font-semibold">
                          累積収支の変化を視覚的に確認できます。右肩上がりなら好調、下降傾向なら戦略の見直しが必要です。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-violet-600 blur-xl opacity-50" />
                  <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-violet-500/50">
                    <h3 className="font-black text-white mb-4 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-violet-400" />
                      累積収支グラフ
                    </h3>
                    
                    {cumulativeData.length > 0 && (
                      <div className="h-48 flex items-end justify-between gap-1 mb-4">
                        {cumulativeData.slice(-20).map((data, i) => {
                          const maxValue = Math.max(...cumulativeData.map(d => Math.abs(d.cumulative)))
                          const heightPercent = maxValue > 0 ? (Math.abs(data.cumulative) / maxValue * 100) : 0
                          
                          return (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                              {data.cumulative !== 0 && (
                                <div 
                                  className={`w-full ${data.cumulative >= 0 ? 'bg-gradient-to-t from-green-500 to-emerald-400' : 'bg-gradient-to-b from-red-500 to-pink-400'} rounded-t transition-all hover:opacity-80`}
                                  style={{
                                    height: `${heightPercent}%`,
                                    minHeight: '2px'
                                  }}
                                />
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                      <div className="bg-green-500/20 rounded-lg p-3 border border-green-400/30">
                        <p className="text-xs font-black text-green-300">最高到達点</p>
                        <p className="text-xl font-black text-green-400 drop-shadow-glow">
                          +{Math.max(...cumulativeData.map(d => d.cumulative), 0).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-red-500/20 rounded-lg p-3 border border-red-400/30">
                        <p className="text-xs font-black text-red-300">最低到達点</p>
                        <p className="text-xl font-black text-red-400 drop-shadow-glow">
                          {Math.min(...cumulativeData.map(d => d.cumulative), 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-50" />
                  <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-indigo-500/50">
                    <h3 className="font-black text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-400" />
                      直近のセッション
                    </h3>
                    <div className="space-y-3">
                      {sessions
                        .map(session => ({ ...session }))
                        .sort((a, b) => 
                          new Date(b.played_at).getTime() - new Date(a.played_at).getTime()
                        )
                        .slice(0, 5)
                        .map(session => (
                          <div key={session.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors border border-white/10">
                            <div>
                              <p className="font-black text-white">
                                {new Date(session.played_at).toLocaleDateString('ja-JP')}
                              </p>
                              <p className="text-xs font-semibold text-purple-200">
                                {session.start_time || '--:--'} - {session.end_time || '--:--'}
                                {session.play_hours && ` (${session.play_hours}h)`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-xl font-black ${(session.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'} drop-shadow-glow`}>
                                {(session.profit || 0) >= 0 ? '+' : ''}{(session.profit || 0).toLocaleString()}
                              </p>
                              <p className="text-xs font-semibold text-indigo-200">
                                IN: {session.buy_in.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'time' && (
              <div className="space-y-4 animate-slide-in">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50" />
                  <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-500/50">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-black text-purple-300 mb-1">時間分析で分かること</p>
                        <p className="text-purple-100 font-semibold">
                          最も勝率が高い時間帯や曜日を把握できます。調子が良い時間帯に集中してプレイすることで、
                          収支改善が期待できます。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50" />
                  <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/50">
                    <h3 className="font-black text-white mb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-purple-400" />
                      時間帯別パフォーマンス
                    </h3>
                    
                    <div className="space-y-3">
                      {stats.hourlyStats
                        .filter(h => h.count > 0)
                        .sort((a, b) => b.profit - a.profit)
                        .slice(0, 5)
                        .map((hour, idx) => (
                          <div key={hour.hour} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
                            <div className="flex items-center gap-3">
                              {idx === 0 && <Star className="w-5 h-5 text-yellow-400 animate-pulse" />}
                              <div>
                                <p className="font-black text-white">
                                  {hour.hour}:00〜{hour.hour + 1}:00
                                </p>
                                <p className="text-xs font-semibold text-purple-200">
                                  {hour.count}回 | 勝率{hour.winRate.toFixed(0)}%
                                </p>
                              </div>
                            </div>
                            <p className={`text-xl font-black ${hour.profit >= 0 ? 'text-green-400' : 'text-red-400'} drop-shadow-glow`}>
                              {hour.profit >= 0 ? '+' : ''}{hour.profit.toLocaleString()}
                            </p>
                          </div>
                        ))}
                    </div>
                    
                    {stats.hourlyStats.filter(h => h.count > 0).length === 0 && (
                      <p className="text-center text-purple-300 py-8">データがありません</p>
                    )}
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-50" />
                  <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-indigo-500/50">
                    <h3 className="font-black text-white mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-400" />
                      曜日別分析
                    </h3>
                    
                    <div className="grid grid-cols-7 gap-2">
                      {stats.weekdayStats.map(day => {
                        const isPositive = day.profit > 0
                        const hasData = day.count > 0
                        
                        return (
                          <div key={day.day} className="text-center">
                            <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-black mb-2 border-2 ${
                              !hasData ? 'bg-gray-700/50 text-gray-500 border-gray-600' :
                              isPositive ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white border-green-400 shadow-lg shadow-green-500/50' : 
                              'bg-gradient-to-br from-red-500 to-pink-600 text-white border-red-400 shadow-lg shadow-red-500/50'
                            }`}>
                              {day.day}
                            </div>
                            {hasData && (
                              <>
                                <p className="text-xs font-black text-white">{day.count}回</p>
                                <p className={`text-xs font-black ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                                  {isPositive ? '+' : ''}{(day.profit / 1000).toFixed(0)}k
                                </p>
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pattern' && (
              <div className="space-y-4 animate-slide-in">
                <div className="relative">
                  <div className="absolute inset-0 bg-green-600 blur-xl opacity-50" />
                  <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-green-500/50">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-black text-green-300 mb-1">パターン分析で分かること</p>
                        <p className="text-green-100 font-semibold">
                          勝敗の傾向や収支の分布を確認できます。連勝・連敗の記録から、
                          メンタルコントロールに役立てられます。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-green-600 blur-xl opacity-50" />
                  <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/50">
                    <h3 className="font-black text-white mb-4 flex items-center gap-2">
                      <Target className="w-5 h-5 text-green-400" />
                      勝敗パターン
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="relative group/card">
                        <div className="absolute inset-0 bg-green-600 blur-lg opacity-50" />
                        <div className="relative bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 text-center border-2 border-green-400/50">
                          <Trophy className="w-8 h-8 text-green-400 mx-auto mb-2 animate-bounce-slow" />
                          <p className="text-xs font-black text-green-300">最大連勝</p>
                          <p className="text-3xl font-black text-green-400 drop-shadow-glow">{stats.maxWinStreak}</p>
                        </div>
                      </div>
                      <div className="relative group/card">
                        <div className="absolute inset-0 bg-red-600 blur-lg opacity-50" />
                        <div className="relative bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl p-4 text-center border-2 border-red-400/50">
                          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2 animate-pulse" />
                          <p className="text-xs font-black text-red-300">最大連敗</p>
                          <p className="text-3xl font-black text-red-400 drop-shadow-glow">{stats.maxLossStreak}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                        <span className="font-black text-white">最高勝利</span>
                        <span className="text-xl font-black text-green-400 drop-shadow-glow">
                          +{stats.maxWin.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                        <span className="font-black text-white">最大損失</span>
                        <span className="text-xl font-black text-red-400 drop-shadow-glow">
                          {stats.maxLoss.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                        <span className="font-black text-white">平均収支</span>
                        <span className={`text-xl font-black ${stats.avgProfit >= 0 ? 'text-green-400' : 'text-red-400'} drop-shadow-glow`}>
                          {stats.avgProfit >= 0 ? '+' : ''}{Math.round(stats.avgProfit).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-50" />
                  <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-indigo-500/50">
                    <h3 className="font-black text-white mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-400" />
                      収支分布
                    </h3>
                    
                    <div className="space-y-2">
                      {[
                        { label: '+20,000以上', range: (s: GameSession) => s.profit >= 20000 },
                        { label: '+10,000〜+20,000', range: (s: GameSession) => s.profit >= 10000 && s.profit < 20000 },
                        { label: '0〜+10,000', range: (s: GameSession) => s.profit >= 0 && s.profit < 10000 },
                        { label: '-10,000〜0', range: (s: GameSession) => s.profit >= -10000 && s.profit < 0 },
                        { label: '-20,000〜-10,000', range: (s: GameSession) => s.profit >= -20000 && s.profit < -10000 },
                        { label: '-20,000未満', range: (s: GameSession) => s.profit < -20000 }
                      ].map(item => {
                        const count = sessions.filter(item.range).length
                        const percentage = sessions.length > 0 ? (count / sessions.length * 100) : 0
                        
                        return (
                          <div key={item.label} className="flex items-center gap-3">
                            <span className="text-xs font-black text-white w-32">{item.label}</span>
                            <div className="flex-1 bg-white/10 rounded-full h-6 relative overflow-hidden border border-white/20">
                              <div 
                                className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                                  item.label.includes('+') || item.label.includes('0〜') ? 
                                  'bg-gradient-to-r from-green-500 to-emerald-500' : 
                                  'bg-gradient-to-r from-red-500 to-pink-500'
                                }`}
                                style={{ width: `${percentage}%` }}
                              />
                              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-black text-white drop-shadow-glow">
                                {count}回
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'style' && (
              <PlayStyleDiagnosis sessions={sessions} stats={stats} />
            )}

            {activeTab === 'roi' && (
              <div className="space-y-4 animate-slide-in">
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-600 blur-xl opacity-50" />
                  <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-amber-500/50">
                    <div className="flex items-start gap-2">
                      <Info className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">
                        <p className="font-black text-amber-300 mb-1">ROI分析で分かること</p>
                        <p className="text-amber-100 font-semibold">
                          投資収益率（ROI）を確認できます。バイイン額に対してどれだけ利益を出せているかが分かります。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 rounded-3xl blur-2xl opacity-75 animate-pulse" />
                  <div className="relative bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 rounded-3xl p-1 shadow-2xl">
                    <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
                      <div className="relative text-center">
                        <h3 className="font-black text-white mb-2 drop-shadow-glow">投資収益率（ROI）</h3>
                        <div className="text-6xl font-black text-white mb-2 drop-shadow-glow">
                          {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(1)}%
                        </div>
                        <div className="text-sm font-semibold text-white/90">
                          投資額: {stats.totalBuyIn.toLocaleString()} P<br />
                          リターン: {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toLocaleString()} P
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-amber-600 blur-xl opacity-50" />
                  <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-amber-500/50">
                    <h3 className="font-black text-white mb-4 flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-amber-400" />
                      バイイン別分析
                    </h3>
                    
                    <div className="space-y-3">
                      {[10000, 20000, 30000, 50000].map(buyIn => {
                        const filtered = sessions.filter(s => {
                          if (buyIn === 50000) {
                            return s.buy_in >= 40000
                          }
                          return s.buy_in >= buyIn - 5000 && s.buy_in < buyIn + 5000
                        })
                        
                        const totalBuyIn = filtered.reduce((sum, s) => sum + s.buy_in, 0)
                        const totalProfit = filtered.reduce((sum, s) => sum + (s.profit || 0), 0)
                        const roi = totalBuyIn > 0 ? (totalProfit / totalBuyIn * 100) : 0
                        
                        return (
                          <div key={buyIn} className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl border border-amber-400/30">
                            <div>
                              <p className="font-black text-white">
                                {buyIn === 50000 ? '40,000P以上' : `${buyIn.toLocaleString()}P前後`}
                              </p>
                              <p className="text-xs font-semibold text-amber-200">
                                {filtered.length}回プレイ
                              </p>
                            </div>
                            <p className={`text-xl font-black ${roi >= 0 ? 'text-green-400' : 'text-red-400'} drop-shadow-glow`}>
                              {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                            </p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur-xl opacity-75" />
                  <div className="relative bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-5 text-white shadow-2xl border-2 border-violet-400/50">
                    <h3 className="font-black mb-3 flex items-center gap-2 drop-shadow-glow">
                      <AlertCircle className="w-5 h-5" />
                      改善提案
                    </h3>
                    <div className="space-y-2 text-sm font-semibold">
                      {stats.winRate < 50 && (
                        <p>• 勝率が50%未満です。プレイ選択を見直しましょう</p>
                      )}
                      {stats.volatility > 15000 && (
                        <p>• 収支の変動が大きいです。安定したプレイを心がけましょう</p>
                      )}
                      {stats.maxLossStreak > 5 && (
                        <p>• 連敗が続いています。休憩を取ることも大切です</p>
                      )}
                      {stats.roi < -20 && (
                        <p>• ROIがマイナスです。バイイン額の見直しを検討しましょう</p>
                      )}
                      {stats.winRate >= 50 && stats.roi >= 0 && (
                        <p>• 好調です！この調子を維持しましょう</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
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
            transform: translateY(-10px);
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