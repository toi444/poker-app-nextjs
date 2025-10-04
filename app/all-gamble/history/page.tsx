'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Filter, Trash2, Sparkles, TrendingUp, TrendingDown, Clock, Award } from 'lucide-react'

interface GambleRecord {
  id: string
  category: string
  location: string
  played_date: string
  profit: number
  play_duration: number | null
  feeling: string
  memo: string
  tags: string[]
  created_at: string
}

export default function HistoryPage() {
  const router = useRouter()
  const [records, setRecords] = useState<GambleRecord[]>([])
  const [filteredRecords, setFilteredRecords] = useState<GambleRecord[]>([])
  const [loading, setLoading] = useState(true)
  
  const [periodFilter, setPeriodFilter] = useState<'today' | 'week' | 'month' | 'all'>('month')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [profitFilter, setProfitFilter] = useState<'all' | 'plus' | 'minus'>('all')

  useEffect(() => {
    fetchRecords()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [records, periodFilter, categoryFilter, profitFilter])

  const fetchRecords = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('gamble_records')
        .select('*')
        .eq('user_id', user.id)
        .order('played_date', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('Fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...records]

    // 期間フィルター
    const today = new Date()
    if (periodFilter !== 'all') {
      filtered = filtered.filter(r => {
        const recordDate = new Date(r.played_date)
        if (periodFilter === 'today') {
          return recordDate.toDateString() === today.toDateString()
        } else if (periodFilter === 'week') {
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
          return recordDate >= weekAgo
        } else if (periodFilter === 'month') {
          return recordDate.getMonth() === today.getMonth() && 
                 recordDate.getFullYear() === today.getFullYear()
        }
        return true
      })
    }

    // 種目フィルター
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => r.category === categoryFilter)
    }

    // 収支フィルター
    if (profitFilter !== 'all') {
      filtered = filtered.filter(r => 
        profitFilter === 'plus' ? r.profit >= 0 : r.profit < 0
      )
    }

    setFilteredRecords(filtered)
  }

  const deleteRecord = async (id: string) => {
    if (!confirm('この記録を削除しますか？')) return

    try {
      const { error } = await supabase
        .from('gamble_records')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchRecords()
    } catch (error) {
      console.error('Delete error:', error)
      alert('削除に失敗しました')
    }
  }

  const getCategoryInfo = (category: string) => {
    const info: any = {
      poker: { icon: '🃏', name: 'ポーカー', gradient: 'from-purple-600 to-indigo-600', glow: 'purple' },
      slot: { icon: '🎰', name: 'スロット', gradient: 'from-red-600 to-pink-600', glow: 'red' },
      pachinko: { icon: '🎲', name: 'パチンコ', gradient: 'from-pink-600 to-rose-600', glow: 'pink' },
      casino: { icon: '💎', name: 'カジノ', gradient: 'from-yellow-600 to-orange-600', glow: 'yellow' },
      horse_race: { icon: '🏇', name: '競馬', gradient: 'from-green-600 to-emerald-600', glow: 'green' },
      boat_race: { icon: '🚤', name: '競艇', gradient: 'from-blue-600 to-cyan-600', glow: 'blue' },
      bicycle_race: { icon: '🚴', name: '競輪', gradient: 'from-orange-600 to-red-600', glow: 'orange' },
      other: { icon: '💰', name: 'その他', gradient: 'from-gray-600 to-slate-600', glow: 'gray' }
    }
    return info[category] || { icon: '💰', name: category, gradient: 'from-gray-600 to-slate-600', glow: 'gray' }
  }

  const getFeelingInfo = (feeling: string) => {
    const info: any = {
      excellent: { emoji: '😄', label: '最高', color: 'text-yellow-400' },
      good: { emoji: '🙂', label: '良い', color: 'text-green-400' },
      normal: { emoji: '😐', label: '普通', color: 'text-gray-400' },
      bad: { emoji: '😞', label: '悪い', color: 'text-orange-400' },
      terrible: { emoji: '😡', label: '最悪', color: 'text-red-400' }
    }
    return info[feeling] || { emoji: '😐', label: '普通', color: 'text-gray-400' }
  }

  const stats = {
    count: filteredRecords.length,
    profit: filteredRecords.reduce((sum, r) => sum + r.profit, 0),
    wins: filteredRecords.filter(r => r.profit > 0).length,
    totalDuration: filteredRecords.reduce((sum, r) => sum + (r.play_duration || 0), 0)
  }

  const winRate = stats.count > 0 ? Math.round((stats.wins / stats.count) * 100) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-orange-500 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 pb-8">
      {/* ヘッダー */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-50 shadow-lg shadow-purple-500/20">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/all-gamble')}
              className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 active:scale-95 border-2 border-white/20"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            
            <div className="flex-1">
              <h1 className="text-xl font-black bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                プレイ履歴
              </h1>
              <p className="text-xs text-gray-400">Play History</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6 space-y-6">
        {/* フィルター */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/50 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-purple-400" />
              <h3 className="font-black text-white">フィルター</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2">期間</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['today', 'week', 'month', 'all'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriodFilter(p)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        periodFilter === p
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50 scale-105'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20 border-2 border-white/10'
                      }`}
                    >
                      {p === 'today' && '今日'}
                      {p === 'week' && '今週'}
                      {p === 'month' && '今月'}
                      {p === 'all' && '全期間'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2">種目</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-white/10 bg-black/40 text-white text-sm focus:border-purple-500 focus:outline-none backdrop-blur-sm"
                >
                  <option value="all">すべて</option>
                  <option value="poker">ポーカー</option>
                  <option value="slot">スロット</option>
                  <option value="pachinko">パチンコ</option>
                  <option value="casino">カジノ</option>
                  <option value="horse_race">競馬</option>
                  <option value="boat_race">競艇</option>
                  <option value="bicycle_race">競輪</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-300 mb-2">収支</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', 'plus', 'minus'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setProfitFilter(p)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        profitFilter === p
                          ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/50 scale-105'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20 border-2 border-white/10'
                      }`}
                    >
                      {p === 'all' && 'すべて'}
                      {p === 'plus' && 'プラス'}
                      {p === 'minus' && 'マイナス'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 統計サマリー */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative group">
            <div className={`absolute inset-0 ${stats.profit >= 0 ? 'bg-green-600' : 'bg-red-600'} rounded-2xl blur-lg opacity-75 animate-pulse`} />
            <div className={`relative bg-gradient-to-br ${stats.profit >= 0 ? 'from-green-600 to-emerald-600' : 'from-red-600 to-pink-600'} rounded-2xl p-5 shadow-2xl`}>
              <div className="flex items-center gap-2 mb-2">
                {stats.profit >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-white" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-white" />
                )}
                <p className="text-xs text-white/80 font-bold">総収支</p>
              </div>
              <p className="text-3xl font-black text-white drop-shadow-glow">
                {stats.profit >= 0 ? '+' : ''}{stats.profit.toLocaleString()}
              </p>
              <p className="text-xs text-white/80 mt-1">円</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-lg opacity-75 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="relative bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-white" />
                <p className="text-xs text-white/80 font-bold">勝率</p>
              </div>
              <p className="text-3xl font-black text-white drop-shadow-glow">
                {winRate}
              </p>
              <p className="text-xs text-white/80 mt-1">% ({stats.wins}/{stats.count}回)</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-purple-600 rounded-2xl blur-lg opacity-75 animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="relative bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-white" />
                <p className="text-xs text-white/80 font-bold">記録数</p>
              </div>
              <p className="text-3xl font-black text-white drop-shadow-glow">
                {stats.count}
              </p>
              <p className="text-xs text-white/80 mt-1">回</p>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-orange-600 rounded-2xl blur-lg opacity-75 animate-pulse" style={{ animationDelay: '1.5s' }} />
            <div className="relative bg-gradient-to-br from-orange-600 to-red-600 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-white" />
                <p className="text-xs text-white/80 font-bold">総時間</p>
              </div>
              <p className="text-3xl font-black text-white drop-shadow-glow">
                {Math.floor(stats.totalDuration / 60)}
              </p>
              <p className="text-xs text-white/80 mt-1">時間</p>
            </div>
          </div>
        </div>

        {/* 記録リスト */}
        {filteredRecords.length === 0 ? (
          <div className="relative group">
            <div className="absolute inset-0 bg-gray-600 rounded-2xl blur-lg opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-8 shadow-2xl text-center border-2 border-white/10">
              <p className="text-gray-400 text-sm">記録がありません</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRecords.map((record, index) => {
              const categoryInfo = getCategoryInfo(record.category)
              const feelingInfo = getFeelingInfo(record.feeling)
              return (
                <div 
                  key={record.id} 
                  className="relative group animate-slide-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${categoryInfo.gradient} rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity`} />
                  <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/20 shadow-2xl hover:scale-[1.02] transition-all">
                    {/* ヘッダー */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="relative">
                          <div className={`absolute inset-0 bg-${categoryInfo.glow}-500 blur-xl opacity-50`} />
                          <div className="relative text-5xl drop-shadow-glow">{categoryInfo.icon}</div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-white text-lg">{record.location}</h4>
                          <p className="text-sm text-gray-400 mt-1">
                            {categoryInfo.name} | {new Date(record.played_date).toLocaleDateString('ja-JP', { month: 'long', day: 'numeric' })}
                          </p>
                          {record.play_duration && (
                            <div className="flex items-center gap-1 mt-2">
                              <Clock className="w-3 h-3 text-gray-500" />
                              <p className="text-xs text-gray-500">
                                {Math.floor(record.play_duration / 60)}h {record.play_duration % 60}m
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* 収支バッジ */}
                      <div className="relative">
                        <div className={`absolute inset-0 ${record.profit >= 0 ? 'bg-green-500' : 'bg-red-500'} blur-lg opacity-75`} />
                        <div className={`relative px-4 py-2 rounded-xl ${record.profit >= 0 ? 'bg-gradient-to-r from-green-600 to-emerald-600' : 'bg-gradient-to-r from-red-600 to-pink-600'} shadow-2xl`}>
                          <p className="text-xs text-white/80 text-center">収支</p>
                          <p className="text-2xl font-black text-white drop-shadow-glow text-center">
                            {record.profit >= 0 ? '+' : ''}{record.profit.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* メモ */}
                    {record.memo && (
                      <div className="mb-3 bg-white/5 rounded-xl p-3 border border-white/10">
                        <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
                          {record.memo}
                        </p>
                      </div>
                    )}

                    {/* タグ&感情 */}
                    <div className="flex items-center justify-between mb-3">
                      {record.tags && record.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2 flex-1">
                          {record.tags.slice(0, 3).map((tag: string) => (
                            <span key={tag} className={`px-3 py-1 bg-gradient-to-r ${categoryInfo.gradient} text-white rounded-full text-xs font-bold shadow-lg`}>
                              {tag}
                            </span>
                          ))}
                          {record.tags.length > 3 && (
                            <span className="px-3 py-1 bg-white/10 text-gray-400 rounded-full text-xs font-bold">
                              +{record.tags.length - 3}
                            </span>
                          )}
                        </div>
                      ) : <div />}
                      
                      <div className="flex items-center gap-2">
                        <span className={`text-3xl drop-shadow-glow`}>{feelingInfo.emoji}</span>
                      </div>
                    </div>

                    {/* アクション */}
                    <button
                      onClick={() => deleteRecord(record.id)}
                      className="w-full py-3 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-bold transition-all flex items-center justify-center gap-2 border-2 border-red-500/30 hover:border-red-500/50"
                    >
                      <Trash2 className="w-4 h-4" />
                      削除
                    </button>
                  </div>
                </div>
              )
            })}
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

        .animate-slide-in {
          animation: slide-in 0.4s ease-out backwards;
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }

        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  )
}