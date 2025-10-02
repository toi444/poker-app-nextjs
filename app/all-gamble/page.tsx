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

    // 1. gamble_recordsを取得
    const { data: gambleData } = await supabase
      .from('gamble_records')
      .select('id, category, profit, played_date, feeling')
      .eq('user_id', user.id)
      .gte('played_date', startDate)
      .lte('played_date', endDate)

    // 2. game_sessionsを取得（Pretty Cure!）
    const { data: gameData } = await supabase
      .from('game_sessions')
      .select('id, profit, played_at')
      .eq('user_id', user.id)

    // 3. Pretty Cure!データを日付でフィルタリング＆変換
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

    // 4. 統合
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

      // カテゴリマスタ
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

      // 日付×種目別の一覧を作成（新しい順）
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
      }).sort((a, b) => b.date.localeCompare(a.date)) // 新しい日付順

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

    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    
    const { data } = await supabase
      .from('gamble_budgets')
      .select('*')
      .eq('user_id', user.id)
      .eq('period_type', 'monthly')
      .gte('period_end', startOfMonth.toISOString().split('T')[0])
      .single()

    setBudget(data)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-24">
      {/* ヘッダー */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <div className="text-center flex-1 mx-4">
              <h1 className="text-xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                All Gamble Manager
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">総合収支管理</p>
            </div>

            <button
              onClick={() => router.push('/all-gamble/budget')}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <Target className="w-5 h-5 text-orange-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6">
        {/* 説明文 */}
        <div className="mb-6 bg-blue-50 rounded-2xl p-4 border border-blue-200">
          <p className="text-sm text-gray-700 leading-relaxed">
            💡 Pretty Cure!だけではなく、他のポーカーやパチンコ・競馬などの収支も一元管理可能。
            <span className="text-xs text-gray-600 block mt-1">
              （便宜上、Pも円に変換しています）
            </span>
          </p>
        </div>
        
        {/* 予算・目標カード */}
        <div className="mb-6">
          {budget ? (
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-3xl p-6 shadow-2xl text-white">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-sm opacity-90">今月の予算・目標</p>
                  <p className="text-xs opacity-75 mt-1">
                    {new Date().getFullYear()}年{new Date().getMonth() + 1}月
                  </p>
                </div>
                <button
                  onClick={() => router.push('/all-gamble/budget')}
                  className="px-4 py-3 bg-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Target className="w-5 h-5 text-orange-600" />
                  <div className="text-left">
                    <p className="text-xs leading-tight text-gray-900">予算・目標</p>
                    <p className="text-xs leading-tight text-gray-600">設定</p>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs opacity-80">予算</p>
                  <p className="text-2xl font-black">{budget.budget_amount.toLocaleString()}円</p>
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1 opacity-90">
                      <span>使用: {budget.actual_spent?.toLocaleString() || 0}円</span>
                      <span>{((budget.actual_spent / budget.budget_amount) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="h-full bg-white rounded-full transition-all"
                        style={{ width: `${Math.min((budget.actual_spent / budget.budget_amount) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {budget.target_profit && (
                  <div>
                    <p className="text-xs opacity-80">目標</p>
                    <p className="text-2xl font-black">+{budget.target_profit.toLocaleString()}円</p>
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1 opacity-90">
                        <span>現在: {periodStats.profit >= 0 ? '+' : ''}{periodStats.profit.toLocaleString()}円</span>
                        <span>{((periodStats.profit / budget.target_profit) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-yellow-300 rounded-full transition-all"
                          style={{ width: `${Math.min((periodStats.profit / budget.target_profit) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={() => router.push('/all-gamble/budget')}
              className="w-full bg-gradient-to-br from-orange-100 to-red-100 border-2 border-orange-400 rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-black text-gray-900 text-lg">予算・目標を設定</p>
                    <p className="text-sm text-gray-600 mt-1">使える金額と目標を管理</p>
                  </div>
                </div>
                <ChevronRight className="w-6 h-6 text-gray-400" />
              </div>
            </button>
          )}
        </div>

        {/* 期間切り替えタブ */}
        <div className="flex gap-2 mb-6 bg-white/90 backdrop-blur-sm rounded-2xl p-2 shadow-lg">
          {(['today', 'week', 'month', 'total'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${
                period === p
                  ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg scale-105'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {p === 'today' && '今日'}
              {p === 'week' && '今週'}
              {p === 'month' && '今月'}
              {p === 'total' && '累計'}
            </button>
          ))}
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <p className="text-xs font-semibold text-gray-600">{getPeriodLabel()}の収支</p>
            </div>
            <p className={`text-2xl font-black ${periodStats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {periodStats.profit >= 0 ? '+' : ''}{periodStats.profit.toLocaleString()}円
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-gray-600" />
              <p className="text-xs font-semibold text-gray-600">記録数</p>
            </div>
            <p className="text-2xl font-black text-gray-900">{periodStats.count}回</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-gray-600" />
              <p className="text-xs font-semibold text-gray-600">勝率</p>
            </div>
            <p className="text-2xl font-black text-gray-900">{periodStats.winRate.toFixed(0)}%</p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-gray-600" />
              <p className="text-xs font-semibold text-gray-600">平均収支</p>
            </div>
            <p className={`text-2xl font-black ${periodStats.avgProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {periodStats.avgProfit >= 0 ? '+' : ''}{Math.round(periodStats.avgProfit).toLocaleString()}円
            </p>
          </div>
        </div>

        {/* 記録一覧（日付×種目別） */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg mb-6">
          <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-600" />
            記録一覧
          </h3>

          {recordItems.length === 0 ? (
            <p className="text-center text-gray-500 py-8 text-sm">まだ記録がありません</p>
          ) : (
            <div className="space-y-2">
              {recordItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => router.push(`/all-gamble/detail/${item.category}/${item.id}`)}
                  className="w-full bg-gray-50 rounded-xl p-3 border border-gray-100 hover:bg-gray-100 hover:border-gray-300 transition-all active:scale-98 text-left"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <p className="text-xs text-gray-600">{formatDisplayDate(item.date)}</p>
                        <p className="font-bold text-gray-900 text-sm">{item.name}</p>
                        {item.feeling && (
                          <p className="text-sm mt-1">{getFeelingEmoji(item.feeling)}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${item.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {item.profit >= 0 ? '+' : ''}{item.profit.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">円</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* クイックアクション */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => router.push('/all-gamble/add')}
            className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-6 h-6 mx-auto mb-2" />
            <p className="font-bold text-sm">Add Record</p>
            <p className="text-xs opacity-90 mt-0.5">記録を追加</p>
          </button>

          <button
            onClick={() => router.push('/all-gamble/history')}
            className="bg-white/90 backdrop-blur-sm text-gray-900 rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95 border border-gray-200"
          >
            <Calendar className="w-6 h-6 mx-auto mb-2 text-orange-600" />
            <p className="font-bold text-sm">History</p>
            <p className="text-xs text-gray-600 mt-0.5">履歴を見る</p>
          </button>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => router.push('/all-gamble/add')}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
      >
        <Plus className="w-8 h-8 text-white" />
      </button>
    </div>
  )
}