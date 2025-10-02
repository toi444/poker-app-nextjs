'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Calendar, DollarSign, Filter, Trash2, Edit } from 'lucide-react'

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
      poker: { icon: '🃏', name: 'ポーカー', color: 'purple' },
      slot: { icon: '🎰', name: 'スロット', color: 'red' },
      pachinko: { icon: '🎲', name: 'パチンコ', color: 'pink' },
      casino: { icon: '💎', name: 'カジノ', color: 'yellow' },
      horse_race: { icon: '🏇', name: '競馬', color: 'green' },
      boat_race: { icon: '🚤', name: '競艇', color: 'blue' },
      bicycle_race: { icon: '🚴', name: '競輪', color: 'orange' },
      other: { icon: '💰', name: 'その他', color: 'gray' }
    }
    return info[category] || { icon: '💰', name: category, color: 'gray' }
  }

  const getFeelingEmoji = (feeling: string) => {
    const emojis: any = {
      excellent: '😄',
      good: '🙂',
      normal: '😐',
      bad: '😞',
      terrible: '😡'
    }
    return emojis[feeling] || '😐'
  }

  const stats = {
    count: filteredRecords.length,
    profit: filteredRecords.reduce((sum, r) => sum + r.profit, 0),
    wins: filteredRecords.filter(r => r.profit > 0).length
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-8">
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/all-gamble')}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <div className="text-center flex-1 mx-4">
              <h1 className="text-xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                プレイ履歴
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">Play History</p>
            </div>

            <div className="w-10" />
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6">
        {/* フィルター */}
        <div className="mb-6 space-y-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-gray-600" />
              <p className="text-sm font-bold text-gray-700">フィルター</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-2">期間</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['today', 'week', 'month', 'all'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPeriodFilter(p)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        periodFilter === p
                          ? 'bg-orange-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                <label className="block text-xs font-bold text-gray-600 mb-2">種目</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 text-gray-900 text-sm focus:border-orange-500 focus:outline-none"
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
                <label className="block text-xs font-bold text-gray-600 mb-2">収支</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', 'plus', 'minus'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setProfitFilter(p)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${
                        profitFilter === p
                          ? 'bg-orange-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

        {/* サマリー */}
        <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">期間</p>
              <p className="text-sm font-bold text-gray-900">
                {periodFilter === 'today' && '今日'}
                {periodFilter === 'week' && '今週'}
                {periodFilter === 'month' && '今月'}
                {periodFilter === 'all' && '全期間'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">記録数</p>
              <p className="text-2xl font-black text-gray-900">{stats.count}回</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">収支</p>
              <p className={`text-2xl font-black ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {stats.profit >= 0 ? '+' : ''}{stats.profit.toLocaleString()}円
              </p>
            </div>
          </div>
        </div>

        {/* 記録リスト */}
        {filteredRecords.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg text-center">
            <p className="text-gray-500 text-sm">記録がありません</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredRecords.map((record) => {
              const categoryInfo = getCategoryInfo(record.category)
              return (
                <div key={record.id} className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="text-3xl">{categoryInfo.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{record.location}</h4>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {categoryInfo.name} | {new Date(record.played_date).toLocaleDateString('ja-JP')}
                        </p>
                        {record.play_duration && (
                          <p className="text-xs text-gray-500 mt-1">
                            {Math.floor(record.play_duration / 60)}時間{record.play_duration % 60}分
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-black ${record.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {record.profit >= 0 ? '+' : ''}{record.profit.toLocaleString()}円
                      </p>
                      <p className="text-xl mt-1">{getFeelingEmoji(record.feeling)}</p>
                    </div>
                  </div>

                  {record.memo && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {record.memo}
                    </p>
                  )}

                  {record.tags && record.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {record.tags.map((tag: string) => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => deleteRecord(record.id)}
                      className="flex-1 py-2 rounded-lg bg-red-50 text-red-600 text-sm font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
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
    </div>
  )
}