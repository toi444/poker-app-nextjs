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
  Shield,
  Sparkles as SparklesIcon
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

// プレイスタイル診断コンポーネント
const PlayStyleDiagnosis = ({ sessions, stats }: { sessions: GameSession[], stats: any }) => {
  if (!sessions || sessions.length < 5) {
    return (
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center border border-purple-100">
        <Brain className="w-16 h-16 text-purple-300 mx-auto mb-4" />
        <p className="text-gray-900 font-bold mb-2">データ不足</p>
        <p className="text-gray-800 text-sm font-medium">
          プレイスタイル診断には最低5セッション以上のデータが必要です。
          もう少しプレイを記録してください。
        </p>
      </div>
    )
  }

  // プレイスタイルを収支データから推定
  const analyzePlayStyle = (): PlayStyleResult => {
    const totalSessions = sessions.length
    const winRate = stats.winRate
    const avgProfit = stats.avgProfit
    const volatility = stats.volatility
    const roi = stats.roi
    const maxWinStreak = stats.maxWinStreak
    const maxLossStreak = stats.maxLossStreak
    
    // バイイン対収支の比率から攻撃性を推定
    const avgBuyIn = sessions.reduce((sum, s) => sum + s.buy_in, 0) / totalSessions
    const profitVolatility = volatility / avgBuyIn * 100
    
    // 大勝ち・大負けの頻度
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
    
    // 詳細判定ロジック
    if (winRate >= 55 && profitVolatility < 30 && roi > 10) {
      style = {
        type: 'TAG',
        name: 'TAG（タイトアグレッシブ）',
        description: 'バランスの取れた堅実なプレイスタイル。選択的に参加し、参加時は積極的。',
        color: 'from-blue-500 to-indigo-600',
        icon: '⚔️',
        advice: 'TAGは最も安定した勝ちやすいスタイルです。このスタイルを維持しながら、時折プレイの幅を広げることで更なる成長が期待できます。',
        metrics: {
          winRate,
          volatility: profitVolatility,
          roi,
          bigSwingRate,
          sessions: totalSessions
        }
      }
    } else if (winRate >= 45 && profitVolatility > 50 && bigSwingRate > 40) {
      style = {
        type: 'LAG',
        name: 'LAG（ルースアグレッシブ）',
        description: '幅広いレンジで積極的にプレイ。大きな勝ちも負けも多い。',
        color: 'from-orange-500 to-red-600',
        icon: '🔥',
        advice: 'LAGスタイルは高い技術を要します。メンタル管理とバンクロール管理が特に重要です。',
        metrics: {
          winRate,
          volatility: profitVolatility,
          roi,
          bigSwingRate,
          sessions: totalSessions
        }
      }
    } else if (winRate < 40 && roi < -10) {
      style = {
        type: 'FISH',
        name: 'フィッシュ（要改善）',
        description: '改善が必要な状態。基礎から見直しが必要。',
        color: 'from-red-600 to-pink-700',
        icon: '🐟',
        advice: 'まず基礎戦略を学び直し、タイトなプレイから始めましょう。感情的なプレイ（ティルト）を避け、バンクロール管理を徹底してください。',
        metrics: {
          winRate,
          volatility: profitVolatility,
          roi,
          bigSwingRate,
          sessions: totalSessions
        }
      }
    } else if (winRate >= 50 && profitVolatility < 20 && bigSwingRate < 20) {
      style = {
        type: 'NIT',
        name: 'ニット（超タイトパッシブ）',
        description: '非常に慎重で保守的なプレイスタイル。',
        color: 'from-gray-500 to-slate-600',
        icon: '🛡️',
        advice: '安全ですが利益機会を逃している可能性があります。もう少しプレイレンジを広げてみましょう。',
        metrics: {
          winRate,
          volatility: profitVolatility,
          roi,
          bigSwingRate,
          sessions: totalSessions
        }
      }
    } else if (totalSessions < 10) {
      style = {
        type: 'BEGINNER',
        name: 'ビギナー',
        description: 'まだスタイルが確立されていない段階。',
        color: 'from-green-500 to-emerald-600',
        icon: '🌱',
        advice: 'もう少しデータが必要です。様々なプレイを試して自分のスタイルを見つけましょう。',
        metrics: {
          winRate,
          volatility: profitVolatility,
          roi,
          bigSwingRate,
          sessions: totalSessions
        }
      }
    } else {
      style = {
        type: 'ROCK',
        name: 'ロック（堅実型）',
        description: 'とても堅実で安定したプレイスタイル。',
        color: 'from-green-500 to-teal-600',
        icon: '🪨',
        advice: '安定したプレイですが、もう少し積極性を増やすことで収益を向上させられる可能性があります。',
        metrics: {
          winRate,
          volatility: profitVolatility,
          roi,
          bigSwingRate,
          sessions: totalSessions
        }
      }
    }
    
    return style
  }
  
  const diagnosis = analyzePlayStyle()
  
  return (
    <div className="space-y-4">
      {/* 注意事項 */}
      <div className="bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl p-4 border border-amber-300">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-amber-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-bold text-gray-900 mb-1">診断について</p>
            <p className="text-gray-800 font-medium">
              この診断は収支データから推定したものです。実際のハンドレンジやVPIP/PFR等の詳細データは含まれていません。
              あくまで収支パターンから見た傾向としてご参考ください。
            </p>
          </div>
        </div>
      </div>
      
      {/* 診断結果 */}
      <div className={`bg-gradient-to-br ${diagnosis.color} rounded-2xl shadow-xl p-6 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="relative">
          <div className="text-center mb-4">
            <div className="text-6xl mb-2">{diagnosis.icon}</div>
            <h3 className="text-2xl font-black mb-1">あなたのプレイスタイル</h3>
            <p className="text-3xl font-black">{diagnosis.name}</p>
          </div>
          <p className="text-sm font-medium opacity-90 mb-4">
            {diagnosis.description}
          </p>
          <div className="bg-white/20 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm font-bold mb-2">診断根拠：</p>
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <div>勝率: {diagnosis.metrics.winRate.toFixed(1)}%</div>
              <div>変動率: {diagnosis.metrics.volatility.toFixed(1)}%</div>
              <div>ROI: {diagnosis.metrics.roi.toFixed(1)}%</div>
              <div>大変動率: {diagnosis.metrics.bigSwingRate.toFixed(1)}%</div>
            </div>
            {diagnosis.metrics.sessions < 10 && (
              <p className="text-xs mt-2 opacity-80">
                ※データ数{diagnosis.metrics.sessions}セッション（推定精度：低）
              </p>
            )}
          </div>
        </div>
      </div>
      
      {/* アドバイス */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-indigo-100">
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5 text-indigo-600" />
          上達へのアドバイス
        </h3>
        <p className="text-sm font-medium text-gray-800 leading-relaxed">
          {diagnosis.advice}
        </p>
        {diagnosis.metrics.sessions < 30 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-xs font-bold text-blue-900">
              📊 より正確な診断のために
            </p>
            <p className="text-xs font-medium text-blue-800 mt-1">
              現在{diagnosis.metrics.sessions}セッションのデータです。
              30セッション以上で精度が向上し、50セッション以上で信頼性の高い診断が可能になります。
            </p>
          </div>
        )}
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

  // 統計計算
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
    
    // 時間帯別分析（プレイ開始時間で集計）
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

    // 曜日別分析
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

    // 連続記録の計算（修正版）
    let currentStreak = 0
    let maxWinStreak = 0
    let maxLossStreak = 0
    let tempWinStreak = 0
    let tempLossStreak = 0
    
    // 古い順から処理
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
        // profit = 0の場合は連続記録をリセット
        tempWinStreak = 0
        tempLossStreak = 0
      }
    })
    
    // 直近の連続記録（最新のセッションから判定）
    if (sortedSessions.length > 0) {
      const recent = sortedSessions[0]
      if (recent.profit > 0) {
        // 最新が勝ちの場合、現在の連勝数を計算
        let streak = 0
        for (const s of sortedSessions) {
          if (s.profit > 0) streak++
          else break
        }
        currentStreak = streak
      } else if (recent.profit < 0) {
        // 最新が負けの場合、現在の連敗数を計算
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

  // 累積収支データの生成
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container max-w-md mx-auto p-4 pb-20">
        {/* ヘッダー with 戻るボタン */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all mb-4"
          >
            <ArrowLeft className="h-5 w-5 text-gray-900" />
          </button>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            <TrendingUp className="inline h-8 w-8 text-violet-600 mr-2" />
            My Stats
          </h1>
          <p className="text-gray-900 mt-2 font-medium">詳細分析でプレイを改善</p>
        </div>

        {/* 期間選択 */}
        <div className="flex gap-2 mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg">
          {(['week', 'month', 'year', 'all'] as const).map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`flex-1 py-3 px-3 rounded-xl text-sm font-bold transition-all ${
                timeRange === range
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              {range === 'week' ? '1週間' : 
               range === 'month' ? '1ヶ月' : 
               range === 'year' ? '1年' : '全期間'}
            </button>
          ))}
        </div>

        {!stats || sessions.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-20 text-center">
            <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-900 font-semibold mb-4">まだデータがありません</p>
            <button
              onClick={() => router.push('/game-report')}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              ゲームを記録する
            </button>
          </div>
        ) : (
          <>
            {/* サマリーカード */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-violet-100">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-5 h-5 text-violet-600" />
                  <p className="text-xs font-bold text-gray-800">総収支</p>
                </div>
                <p className={`text-2xl font-black ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toLocaleString()}
                </p>
                <p className="text-xs font-semibold text-gray-700 mt-1">
                  ROI: {stats.roi.toFixed(1)}%
                </p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-indigo-100">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <p className="text-xs font-bold text-gray-800">勝率</p>
                </div>
                <p className="text-2xl font-black text-gray-900">{stats.winRate.toFixed(1)}%</p>
                <p className="text-xs font-semibold text-gray-700 mt-1">
                  {stats.winSessions}勝 {stats.lossSessions}敗
                </p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-5 h-5 text-green-600" />
                  <p className="text-xs font-bold text-gray-800">現在の調子</p>
                </div>
                <p className={`text-xl font-black ${
                  stats.currentStreak > 0 ? 'text-green-600' : 
                  stats.currentStreak < 0 ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {stats.currentStreak > 0 ? `${stats.currentStreak}連勝中` : 
                   stats.currentStreak < 0 ? `${Math.abs(stats.currentStreak)}連敗中` : 
                   'ニュートラル'}
                </p>
                <p className="text-xs font-semibold text-gray-700 mt-1">
                  最高: {stats.maxWinStreak}連勝
                </p>
              </div>
              
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-purple-100">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5 text-purple-600" />
                  <p className="text-xs font-bold text-gray-800">総プレイ</p>
                </div>
                <p className="text-2xl font-black text-gray-900">
                  {stats.totalPlayHours.toFixed(1)}h
                </p>
                <p className="text-xs font-semibold text-gray-700 mt-1">
                  {stats.totalSessions}セッション
                </p>
              </div>
            </div>

            {/* タブナビゲーション */}
            <div className="flex gap-1 mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg">
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
                  className={`flex-1 py-3 px-3 rounded-xl text-sm font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg transform scale-105'
                      : 'text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <span className="block text-lg mb-1">{tab.icon}</span>
                  <span className="text-xs font-bold">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* タブコンテンツ */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* 機能説明 */}
                <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-4 border border-blue-300">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold text-gray-900 mb-1">収支推移で分かること</p>
                      <p className="text-gray-800 font-medium">
                        累積収支の変化を視覚的に確認できます。右肩上がりなら好調、下降傾向なら戦略の見直しが必要です。
                      </p>
                    </div>
                  </div>
                </div>

                {/* 累積収支グラフ */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-violet-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-violet-600" />
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
                  
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs font-bold text-green-700">最高到達点</p>
                      <p className="text-xl font-black text-green-600">
                        +{Math.max(...cumulativeData.map(d => d.cumulative), 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-xs font-bold text-red-700">最低到達点</p>
                      <p className="text-xl font-black text-red-600">
                        {Math.min(...cumulativeData.map(d => d.cumulative), 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 直近セッション */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-indigo-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    直近のセッション
                  </h3>
                  <div className="space-y-3">
                    {sessions && sessions.length > 0 ? 
                      sessions
                        .map(session => ({ ...session }))
                        .sort((a, b) => 
                          new Date(b.played_at).getTime() - new Date(a.played_at).getTime()
                        )
                        .slice(0, 5)
                        .map(session => (
                          <div key={session.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                            <div>
                              <p className="font-bold text-gray-900">
                                {new Date(session.played_at).toLocaleDateString('ja-JP')}
                              </p>
                              <p className="text-xs font-semibold text-gray-700">
                                {session.start_time || '--:--'} - {session.end_time || '--:--'}
                                {session.play_hours && ` (${session.play_hours}h)`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`text-xl font-black ${(session.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {(session.profit || 0) >= 0 ? '+' : ''}{(session.profit || 0).toLocaleString()}
                              </p>
                              <p className="text-xs font-semibold text-gray-700">
                                IN: {session.buy_in.toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))
                      : (
                        <p className="text-center text-gray-500">データがありません</p>
                      )
                    }
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'time' && (
              <div className="space-y-4">
                {/* 機能説明 */}
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border border-purple-300">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold text-gray-900 mb-1">時間分析で分かること</p>
                      <p className="text-gray-800 font-medium">
                        最も勝率が高い時間帯や曜日を把握できます。調子が良い時間帯に集中してプレイすることで、
                        収支改善が期待できます。
                      </p>
                    </div>
                  </div>
                </div>

                {/* 時間帯別パフォーマンス */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-purple-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    時間帯別パフォーマンス
                  </h3>
                  
                  <div className="space-y-3">
                    {stats.hourlyStats
                      .filter(h => h.count > 0)
                      .sort((a, b) => b.profit - a.profit)
                      .slice(0, 5)
                      .map((hour, idx) => (
                        <div key={hour.hour} className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            {idx === 0 && <Star className="w-5 h-5 text-yellow-500" />}
                            <div>
                              <p className="font-bold text-gray-900">
                                {hour.hour}:00〜{hour.hour + 1}:00
                              </p>
                              <p className="text-xs font-semibold text-gray-700">
                                {hour.count}回 | 勝率{hour.winRate.toFixed(0)}%
                              </p>
                            </div>
                          </div>
                          <p className={`text-xl font-black ${hour.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {hour.profit >= 0 ? '+' : ''}{hour.profit.toLocaleString()}
                          </p>
                        </div>
                      ))}
                  </div>
                  
                  {stats.hourlyStats.filter(h => h.count > 0).length === 0 && (
                    <p className="text-center text-gray-500 py-8">データがありません</p>
                  )}
                </div>

                {/* 曜日別分析 */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-indigo-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-600" />
                    曜日別分析
                  </h3>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {stats.weekdayStats.map(day => {
                      const isPositive = day.profit > 0
                      const hasData = day.count > 0
                      
                      return (
                        <div key={day.day} className="text-center">
                          <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center font-bold mb-2 ${
                            !hasData ? 'bg-gray-100 text-gray-400' :
                            isPositive ? 'bg-gradient-to-br from-green-400 to-emerald-500 text-white' : 
                            'bg-gradient-to-br from-red-400 to-pink-500 text-white'
                          }`}>
                            {day.day}
                          </div>
                          {hasData && (
                            <>
                              <p className="text-xs font-bold text-gray-900">{day.count}回</p>
                              <p className={`text-xs font-black ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
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
            )}

            {activeTab === 'pattern' && (
              <div className="space-y-4">
                {/* 機能説明 */}
                <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl p-4 border border-green-300">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-green-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold text-gray-900 mb-1">パターン分析で分かること</p>
                      <p className="text-gray-800 font-medium">
                        勝敗の傾向や収支の分布を確認できます。連勝・連敗の記録から、
                        メンタルコントロールに役立てられます。
                      </p>
                    </div>
                  </div>
                </div>

                {/* 勝敗パターン */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-green-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-green-600" />
                    勝敗パターン
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-4 text-center">
                      <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-green-700">最大連勝</p>
                      <p className="text-3xl font-black text-green-600">{stats.maxWinStreak}</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-xl p-4 text-center">
                      <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                      <p className="text-xs font-bold text-red-700">最大連敗</p>
                      <p className="text-3xl font-black text-red-600">{stats.maxLossStreak}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="font-bold text-gray-900">最高勝利</span>
                      <span className="text-xl font-black text-green-600">
                        +{stats.maxWin.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="font-bold text-gray-900">最大損失</span>
                      <span className="text-xl font-black text-red-600">
                        {stats.maxLoss.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                      <span className="font-bold text-gray-900">平均収支</span>
                      <span className={`text-xl font-black ${stats.avgProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {stats.avgProfit >= 0 ? '+' : ''}{Math.round(stats.avgProfit).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 収支分布 */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-indigo-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-600" />
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
                          <span className="text-xs font-bold text-gray-900 w-32">{item.label}</span>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative overflow-hidden">
                            <div 
                              className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                                item.label.includes('+') || item.label.includes('0〜') ? 
                                'bg-gradient-to-r from-green-500 to-emerald-500' : 
                                'bg-gradient-to-r from-red-500 to-pink-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-700">
                              {count}回
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'style' && (
              <PlayStyleDiagnosis sessions={sessions} stats={stats} />
            )}

            {activeTab === 'roi' && (
              <div className="space-y-4">
                {/* 機能説明 */}
                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 rounded-xl p-4 border border-yellow-300">
                  <div className="flex items-start gap-2">
                    <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-bold text-gray-900 mb-1">ROI分析で分かること</p>
                      <p className="text-gray-800 font-medium">
                        投資収益率（ROI）を確認できます。バイイン額に対してどれだけ利益を出せているかが分かります。
                      </p>
                    </div>
                  </div>
                </div>

                {/* ROIメイン */}
                <div className="bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="relative text-center">
                    <h3 className="font-bold mb-2">投資収益率（ROI）</h3>
                    <div className="text-6xl font-black mb-2">
                      {stats.roi >= 0 ? '+' : ''}{stats.roi.toFixed(1)}%
                    </div>
                    <div className="text-sm font-semibold opacity-90">
                      投資額: {stats.totalBuyIn.toLocaleString()} P<br />
                      リターン: {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toLocaleString()} P
                    </div>
                  </div>
                </div>

                {/* バイイン別分析 */}
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-amber-100">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-600" />
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
                        <div key={buyIn} className="flex justify-between items-center p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                          <div>
                            <p className="font-bold text-gray-900">
                              {buyIn === 50000 ? '40,000P以上' : `${buyIn.toLocaleString()}P前後`}
                            </p>
                            <p className="text-xs font-semibold text-gray-700">
                              {filtered.length}回プレイ
                            </p>
                          </div>
                          <p className={`text-xl font-black ${roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {roi >= 0 ? '+' : ''}{roi.toFixed(1)}%
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* 改善提案 */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl shadow-xl p-5 text-white">
                  <h3 className="font-bold mb-3 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    改善提案
                  </h3>
                  <div className="space-y-2 text-sm font-medium">
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
            )}
          </>
        )}
      </div>
    </div>
  )
}