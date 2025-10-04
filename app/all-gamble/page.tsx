'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  Plus, TrendingUp, Calendar, DollarSign, 
  Target, ChevronRight, ArrowLeft, Filter,
  Sparkles, Trophy, Zap, TrendingDown
} from 'lucide-react'

interface PeriodStats {
  profit: number
  count: number
  winRate: number
  avgProfit: number
}

interface RecordItem {
  id: string
  date: string
  category: string
  icon: string
  name: string
  profit: number
  color: string
  feeling?: string
}

export default function AllGamblePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'total'>('month')
  const [periodStats, setPeriodStats] = useState<PeriodStats>({
    profit: 0, count: 0, winRate: 0, avgProfit: 0
  })
  const [recordItems, setRecordItems] = useState<RecordItem[]>([])
  const [budget, setBudget] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      fetchStats()
      fetchBudget()
    }
  }, [user, period])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUser(user)
    setLoading(false)
  }

  const fetchStats = async () => {
    if (!user) return

    const { startDate, endDate } = getPeriodDates()

    const { data: gambleData } = await supabase
      .from('gamble_records')
      .select('id, category, profit, played_date, feeling')
      .eq('user_id', user.id)
      .gte('played_date', startDate)
      .lte('played_date', endDate)

    const { data: gameData } = await supabase
      .from('game_sessions')
      .select('id, profit, played_at')
      .eq('user_id', user.id)

    const prettyCureData = gameData
      ?.map(g => {
        const playedDate = new Date(g.played_at)
        const jstDate = new Date(playedDate.getTime() + 9 * 60 * 60 * 1000)
        const dateStr = jstDate.toISOString().split('T')[0]
        
        return {
          id: g.id,
          category: 'pretty_cure',
          profit: g.profit,
          played_date: dateStr,
          feeling: undefined
        }
      })
      .filter(g => g.played_date >= startDate && g.played_date <= endDate) || []

    const allData = [...(gambleData || []), ...prettyCureData]

    if (allData.length > 0) {
      const totalProfit = allData.reduce((sum, r) => sum + r.profit, 0)
      const wins = allData.filter(r => r.profit > 0).length
      const winRate = (wins / allData.length) * 100
      const avgProfit = totalProfit / allData.length

      setPeriodStats({
        profit: totalProfit,
        count: allData.length,
        winRate,
        avgProfit
      })

      const categoryMap: Record<string, { icon: string, name: string, color: string }> = {
        'pretty_cure': { icon: '🎴', name: 'Pretty Cure!', color: 'from-violet-500 to-purple-600' },
        'poker': { icon: '🃏', name: 'ポーカー', color: 'from-purple-500 to-indigo-600' },
        'slot': { icon: '🎰', name: 'スロット', color: 'from-red-500 to-pink-600' },
        'pachinko': { icon: '🎲', name: 'パチンコ', color: 'from-pink-400 to-rose-500' },
        'casino': { icon: '💎', name: 'カジノ', color: 'from-yellow-500 to-amber-600' },
        'horse_race': { icon: '🏇', name: '競馬', color: 'from-green-500 to-emerald-600' },
        'boat_race': { icon: '🚤', name: '競艇', color: 'from-blue-500 to-cyan-600' },
        'bicycle_race': { icon: '🚴', name: '競輪', color: 'from-orange-500 to-yellow-600' },
        'other': { icon: '💰', name: 'その他', color: 'from-gray-500 to-slate-600' }
      }

      const items: RecordItem[] = allData.map(r => {
        const cat = categoryMap[r.category] || categoryMap['other']
        return {
          id: r.id,
          date: r.played_date,
          category: r.category,
          icon: cat.icon,
          name: cat.name,
          profit: r.profit,
          color: cat.color,
          feeling: r.feeling
        }
      }).sort((a, b) => b.date.localeCompare(a.date))

      setRecordItems(items)
    } else {
      setPeriodStats({
        profit: 0,
        count: 0,
        winRate: 0,
        avgProfit: 0
      })
      setRecordItems([])
    }
  }

  const fetchBudget = async () => {
    if (!user) return

    try {
      const today = new Date()
      const todayStr = today.toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('gamble_budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('period_type', 'monthly')
        .lte('period_start', todayStr)
        .gte('period_end', todayStr)
        .maybeSingle()

      if (error) throw error
      setBudget(data)
    } catch (error) {
      console.error('Budget fetch error:', error)
      setBudget(null)
    }
  }

  const getPeriodDates = () => {
    const now = new Date()
    let startDate: Date
    let endDate = now

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        break
      case 'week':
        const dayOfWeek = now.getDay()
        const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
        startDate = new Date(now.getTime() - daysFromMonday * 24 * 60 * 60 * 1000)
        startDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'total':
        startDate = new Date(2000, 0, 1)
        break
      default:
        startDate = now
    }

    const formatDate = (date: Date) => {
      const y = date.getFullYear()
      const m = String(date.getMonth() + 1).padStart(2, '0')
      const d = String(date.getDate()).padStart(2, '0')
      return `${y}-${m}-${d}`
    }

    return {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate)
    }
  }

  const getPeriodLabel = () => {
    switch (period) {
      case 'today': return '今日'
      case 'week': return '今週'
      case 'month': return '今月'
      case 'total': return '累計'
    }
  }

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    const weekday = weekdays[date.getDay()]
    return `${month}/${day}（${weekday}）`
  }

  const getFeelingEmoji = (feeling: string) => {
    const emojiMap: { [key: string]: string } = {
      'excellent': '😄',
      'good': '🙂',
      'normal': '😐',
      'bad': '😞',
      'terrible': '😡'
    }
    return emojiMap[feeling] || '😐'
  }

  const shouldShowBudget = () => {
    if (!budget) return false
    if (period === 'total') return false
    
    const { startDate, endDate } = getPeriodDates()
    const budgetStart = budget.period_start
    const budgetEnd = budget.period_end
    
    return startDate <= budgetEnd && endDate >= budgetStart
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <DollarSign className="w-10 h-10 text-orange-500 animate-pulse" />
          </div>
          <div className="absolute inset-0 animate-ping opacity-20">
            <div className="w-24 h-24 border-4 border-orange-500 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 pb-24">
      <div className="bg-black/60 backdrop-blur-xl border-b-2 border-orange-500/50 sticky top-0 z-50 shadow-lg shadow-orange-500/20">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="relative group"
            >
              <div className="absolute inset-0 bg-orange-600 blur-lg opacity-0 group-hover:opacity-75 transition-opacity rounded-full" />
              <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm border-2 border-orange-500/50 hover:border-orange-400 transition-all">
                <ArrowLeft className="h-5 w-5 text-orange-300" />
              </div>
            </button>
            
            <div className="text-center flex-1 mx-4">
              <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 drop-shadow-glow">
                All Gamble Manager
              </h1>
              <p className="text-xs text-orange-200 mt-0.5 font-semibold">総合収支管理</p>
            </div>

            <button
              onClick={() => router.push('/all-gamble/budget')}
              className="relative group"
            >
              <div className="absolute inset-0 bg-orange-600 blur-lg opacity-0 group-hover:opacity-75 transition-opacity rounded-full" />
              <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm border-2 border-orange-500/50 hover:border-orange-400 transition-all">
                <Target className="h-5 w-5 text-orange-300" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6">
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-blue-600 blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-blue-500/50">
            <p className="text-sm text-blue-100 leading-relaxed font-semibold">
              💡 Pretty Cure!だけではなく、他のポーカーやパチンコ・競馬などの収支も一元管理可能。
              <span className="text-xs text-blue-200 block mt-1">
                （便宜上、Pも円に変換しています）
              </span>
            </p>
          </div>
        </div>
        
        <div className="mb-6">
          {shouldShowBudget() ? (
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl blur-2xl opacity-75 animate-pulse" />
              <div className="relative bg-gradient-to-br from-orange-600 to-red-600 rounded-3xl p-1 shadow-2xl">
                <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 text-white">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-black drop-shadow-glow">今月の予算・目標</p>
                      <p className="text-xs opacity-90 mt-1 font-semibold">
                        {new Date().getFullYear()}年{new Date().getMonth() + 1}月
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/all-gamble/budget')}
                      className="relative group/btn"
                    >
                      <div className="absolute inset-0 bg-white blur-md opacity-0 group-hover/btn:opacity-50 transition-opacity rounded-xl" />
                      <div className="relative px-4 py-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2">
                        <Target className="w-5 h-5 text-orange-600" />
                        <div className="text-left">
                          <p className="text-xs leading-tight text-gray-900 font-black">予算・目標</p>
                          <p className="text-xs leading-tight text-gray-600 font-semibold">設定</p>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-black text-white/80">予算</p>
                      <p className="text-2xl font-black drop-shadow-glow">{budget.budget_amount.toLocaleString()}円</p>
                      <div className="mt-2">
                        <div className="flex justify-between text-xs mb-1 font-semibold text-white/90">
                          <span>使用: {budget.actual_spent?.toLocaleString() || 0}円</span>
                          <span>{budget.actual_spent ? ((budget.actual_spent / budget.budget_amount) * 100).toFixed(0) : 0}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden border border-white/30">
                          <div 
                            className="h-full bg-white rounded-full transition-all shadow-lg shadow-white/50"
                            style={{ width: `${budget.actual_spent ? Math.min((budget.actual_spent / budget.budget_amount) * 100, 100) : 0}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {budget.target_profit && (
                      <div>
                        <p className="text-xs font-black text-white/80">目標</p>
                        <p className="text-2xl font-black drop-shadow-glow">+{budget.target_profit.toLocaleString()}円</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs mb-1 font-semibold text-white/90">
                            <span>現在: {periodStats.profit >= 0 ? '+' : ''}{periodStats.profit.toLocaleString()}円</span>
                            <span>{((periodStats.profit / budget.target_profit) * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden border border-white/30">
                            <div 
                              className="h-full bg-yellow-300 rounded-full transition-all shadow-lg shadow-yellow-300/50"
                              style={{ width: `${Math.min(Math.max((periodStats.profit / budget.target_profit) * 100, 0), 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => router.push('/all-gamble/budget')}
              className="relative w-full group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-black/60 backdrop-blur-sm border-2 border-orange-500/50 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/50">
                      <Target className="w-8 h-8 text-white" />
                    </div>
                    <div className="text-left">
                      <p className="font-black text-white text-lg drop-shadow-glow">予算・目標を設定</p>
                      <p className="text-sm text-orange-200 mt-1 font-semibold">使える金額と目標を管理</p>
                    </div>
                  </div>
                  <ChevronRight className="w-6 h-6 text-orange-300" />
                </div>
              </div>
            </button>
          )}
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-2 border-2 border-purple-500/50">
            <div className="flex gap-2">
              {(['today', 'week', 'month', 'total'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`flex-1 py-3 rounded-xl font-black text-sm transition-all ${
                    period === p
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105'
                      : 'text-purple-200 hover:bg-white/10'
                  }`}
                >
                  {p === 'today' && '今日'}
                  {p === 'week' && '今週'}
                  {p === 'month' && '今月'}
                  {p === 'total' && '累計'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="relative group">
            <div className={`absolute inset-0 ${periodStats.profit >= 0 ? 'bg-green-600' : 'bg-red-600'} blur-lg opacity-50`} />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-gray-300" />
                <p className="text-xs font-black text-gray-300">{getPeriodLabel()}の収支</p>
              </div>
              <p className={`text-2xl font-black ${periodStats.profit >= 0 ? 'text-green-400' : 'text-red-400'} drop-shadow-glow`}>
                {periodStats.profit >= 0 ? '+' : ''}{periodStats.profit.toLocaleString()}
              </p>
              <p className="text-xs font-semibold text-gray-400">円</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-600 blur-lg opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-gray-300" />
                <p className="text-xs font-black text-gray-300">記録数</p>
              </div>
              <p className="text-2xl font-black text-white drop-shadow-glow">{periodStats.count}</p>
              <p className="text-xs font-semibold text-gray-400">回</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-yellow-600 blur-lg opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <Trophy className="w-4 h-4 text-gray-300" />
                <p className="text-xs font-black text-gray-300">勝率</p>
              </div>
              <p className="text-2xl font-black text-yellow-400 drop-shadow-glow">{periodStats.winRate.toFixed(0)}</p>
              <p className="text-xs font-semibold text-gray-400">%</p>
            </div>
          </div>

          <div className="relative group">
            <div className={`absolute inset-0 ${periodStats.avgProfit >= 0 ? 'bg-green-600' : 'bg-red-600'} blur-lg opacity-50`} />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-white/10">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gray-300" />
                <p className="text-xs font-black text-gray-300">平均収支</p>
              </div>
              <p className={`text-2xl font-black ${periodStats.avgProfit >= 0 ? 'text-green-400' : 'text-red-400'} drop-shadow-glow`}>
                {periodStats.avgProfit >= 0 ? '+' : ''}{Math.round(periodStats.avgProfit).toLocaleString()}
              </p>
              <p className="text-xs font-semibold text-gray-400">円</p>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 bg-orange-600 blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-orange-500/50">
            <h3 className="font-black text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-400" />
              記録一覧
            </h3>

            {recordItems.length === 0 ? (
              <p className="text-center text-gray-400 py-8 text-sm font-semibold">まだ記録がありません</p>
            ) : (
              <div className="space-y-2">
                {recordItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => router.push(`/all-gamble/detail/${item.category}/${item.id}`)}
                    className="w-full bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 hover:border-orange-400/50 transition-all active:scale-98 text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <p className="text-xs text-gray-400 font-semibold">{formatDisplayDate(item.date)}</p>
                          <p className="font-black text-white text-sm">{item.name}</p>
                          {item.feeling && (
                            <p className="text-sm mt-1">{getFeelingEmoji(item.feeling)}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-black ${item.profit >= 0 ? 'text-green-400' : 'text-red-400'} drop-shadow-glow`}>
                          {item.profit >= 0 ? '+' : ''}{item.profit.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 font-semibold">円</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/all-gamble/add')}
            className="relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95">
              <Plus className="w-6 h-6 mx-auto mb-2" />
              <p className="font-black text-sm">Add Record</p>
              <p className="text-xs opacity-90 mt-0.5 font-semibold">記録を追加</p>
            </div>
          </button>

          <button
            onClick={() => router.push('/all-gamble/history')}
            className="relative group"
          >
            <div className="absolute inset-0 bg-white blur-lg opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl" />
            <div className="relative bg-black/60 backdrop-blur-sm text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 border-2 border-white/10">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-orange-400" />
              <p className="font-black text-sm">History</p>
              <p className="text-xs text-gray-300 mt-0.5 font-semibold">履歴を見る</p>
            </div>
          </button>
        </div>
      </div>

      <button
        onClick={() => router.push('/all-gamble/add')}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 animate-pulse-slow"
      >
        <Plus className="w-8 h-8 text-white drop-shadow-glow" />
      </button>

      <style jsx global>{`
        @keyframes pulse-slow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(249, 115, 22, 0.5);
          }
          50% {
            box-shadow: 0 0 40px rgba(249, 115, 22, 0.8);
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  )
}