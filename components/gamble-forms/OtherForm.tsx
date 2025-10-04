'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, X, Clock, TrendingUp, Sparkles, MessageSquare, Dices } from 'lucide-react'

interface OtherFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function OtherForm({ onSuccess, onCancel }: OtherFormProps) {
  const [loading, setLoading] = useState(false)
  
  const [gambleName, setGambleName] = useState('')
  const [location, setLocation] = useState('')
  const [playedDate, setPlayedDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  
  const [investment, setInvestment] = useState(0)
  const [payout, setPayout] = useState(0)
  
  const [feeling, setFeeling] = useState<'excellent' | 'good' | 'normal' | 'bad' | 'terrible'>('normal')
  const [memo, setMemo] = useState('')

  const calculateProfit = () => {
    return payout - investment
  }

  const calculateDuration = () => {
    if (!startTime || !endTime) return null
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(`2000-01-01T${endTime}`)
    let diff = (end.getTime() - start.getTime()) / (1000 * 60)
    if (diff < 0) diff += 24 * 60
    return Math.round(diff)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const profit = calculateProfit()
      const duration = calculateDuration()

      const { error } = await supabase
        .from('gamble_records')
        .insert({
          user_id: user.id,
          category: 'other',
          location: location || gambleName,
          played_date: playedDate,
          start_time: startTime || null,
          end_time: endTime || null,
          play_duration: duration,
          buy_in: investment || null,
          cash_out: payout || null,
          profit,
          memo: `${gambleName ? gambleName + ': ' : ''}${memo}`,
          feeling
        })

      if (error) throw error
      onSuccess()
    } catch (error) {
      console.error('Submit error:', error)
      alert('保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const profit = calculateProfit()
  const duration = calculateDuration()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 pb-8">
      {/* ヘッダー */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-50 shadow-lg shadow-purple-500/20">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-slate-600 rounded-2xl blur-lg animate-pulse" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-gray-600 to-slate-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-2xl">🎲</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-white">その他ギャンブル記録</h1>
              <p className="text-sm text-gray-400">新しい記録を追加</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="container max-w-md mx-auto px-4 py-6 space-y-5">
        {/* 基本情報 */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-slate-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-gray-500/50 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-gray-400" />
              <h3 className="font-black text-white">基本情報</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  ギャンブル名 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={gambleName}
                  onChange={(e) => setGambleName(e.target.value)}
                  placeholder="例: 麻雀、宝くじ"
                  className="w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white placeholder-gray-500 focus:border-gray-500 focus:outline-none transition-all backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  場所 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="プレイした場所"
                  className="w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white placeholder-gray-500 focus:border-gray-500 focus:outline-none transition-all backdrop-blur-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  プレイ日 <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={playedDate}
                  onChange={(e) => setPlayedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white focus:border-gray-500 focus:outline-none transition-all backdrop-blur-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    開始時刻
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white focus:border-gray-500 focus:outline-none transition-all backdrop-blur-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    終了時刻
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white focus:border-gray-500 focus:outline-none transition-all backdrop-blur-sm"
                  />
                </div>
              </div>

              {duration && (
                <div className="bg-gradient-to-r from-gray-600 to-slate-600 rounded-xl p-4 shadow-lg">
                  <p className="text-white text-sm mb-1">プレイ時間</p>
                  <p className="text-white text-2xl font-black">{duration}分</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 収支 */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/50 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <h3 className="font-black text-white">収支</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  投資額 <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  required
                  value={investment || ''}
                  onChange={(e) => setInvestment(Number(e.target.value) || 0)}
                  placeholder="10000"
                  className="w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none transition-all backdrop-blur-sm text-2xl font-black"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  回収額 <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  required
                  value={payout || ''}
                  onChange={(e) => setPayout(Number(e.target.value) || 0)}
                  placeholder="15000"
                  className="w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-all backdrop-blur-sm text-2xl font-black"
                />
              </div>

              {(investment > 0 || payout > 0) && (
                <div className="relative group">
                  <div className={`absolute inset-0 ${
                    profit >= 0 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                      : 'bg-gradient-to-r from-red-600 to-pink-600'
                  } rounded-2xl blur-lg opacity-75 animate-pulse`} />
                  <div className={`relative rounded-2xl p-5 ${
                    profit >= 0 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
                      : 'bg-gradient-to-r from-red-600 to-pink-600'
                  } shadow-2xl`}>
                    <p className="text-white/80 text-sm mb-1">収支</p>
                    <p className="text-white text-4xl font-black drop-shadow-glow">
                      {profit >= 0 ? '+' : ''}{profit.toLocaleString()}円
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 振り返り */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-gray-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-slate-500/50 shadow-2xl">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-slate-400" />
              <h3 className="font-black text-white">振り返り</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3">満足度</label>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { value: 'excellent', emoji: '😄', label: '最高' },
                    { value: 'good', emoji: '🙂', label: '良い' },
                    { value: 'normal', emoji: '😐', label: '普通' },
                    { value: 'bad', emoji: '😞', label: '悪い' },
                    { value: 'terrible', emoji: '😡', label: '最悪' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFeeling(option.value as any)}
                      className={`py-3 rounded-xl font-bold text-sm transition-all ${
                        feeling === option.value
                          ? 'bg-gradient-to-br from-slate-600 to-gray-600 text-white shadow-2xl scale-105 border-2 border-white/30'
                          : 'bg-white/10 text-gray-400 hover:bg-white/20 border-2 border-white/10'
                      }`}
                    >
                      <div className="text-2xl mb-1">{option.emoji}</div>
                      <div className="text-xs">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">詳細メモ</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="ゲームの詳細、ルール、結果など"
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white placeholder-gray-500 focus:border-slate-500 focus:outline-none transition-all resize-none backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-4 rounded-xl bg-white/10 backdrop-blur-sm text-white font-bold hover:bg-white/20 transition-all border-2 border-white/10"
          >
            キャンセル
          </button>
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-slate-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
            <button
              type="submit"
              disabled={loading}
              className="relative w-full py-4 rounded-xl bg-gradient-to-r from-gray-600 to-slate-600 text-white font-black shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  保存中...
                </div>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  記録を保存
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <style jsx global>{`
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  )
}