'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, X, Clock, MapPin, Target, TrendingUp, Sparkles } from 'lucide-react'

interface PachinkoFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function PachinkoForm({ onSuccess, onCancel }: PachinkoFormProps) {
  const [loading, setLoading] = useState(false)
  
  const [location, setLocation] = useState('')
  const [playedDate, setPlayedDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  
  const [machineName, setMachineName] = useState('')
  const [machineType, setMachineType] = useState('')
  const [rotationPer1k, setRotationPer1k] = useState(0)
  const [firstHitCount, setFirstHitCount] = useState(0)
  const [probabilityChange, setProbabilityChange] = useState(0)
  
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
    
    if (!location || !machineName) {
      alert('必須項目を入力してください')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const profit = calculateProfit()
      const duration = calculateDuration()

      const pachinkoDetails = {
        machine_name: machineName,
        machine_type: machineType || null,
        rotation_per_1k: rotationPer1k || null,
        first_hit_count: firstHitCount || null,
        probability_change: probabilityChange || null
      }

      const { error } = await supabase
        .from('gamble_records')
        .insert({
          user_id: user.id,
          category: 'pachinko',
          location,
          played_date: playedDate,
          start_time: startTime || null,
          end_time: endTime || null,
          play_duration: duration,
          buy_in: investment,
          cash_out: payout,
          profit,
          pachinko_details: pachinkoDetails,
          memo,
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

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 基本情報 */}
      <div className="relative">
        <div className="absolute inset-0 bg-pink-600 blur-xl opacity-50" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/20 shadow-2xl">
          <h3 className="font-black text-white mb-4 flex items-center gap-2 text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
            <MapPin className="w-5 h-5 text-pink-400" />
            基本情報
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                店名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="○○パチンコ"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-pink-400 text-white placeholder-white/50 focus:outline-none transition-all"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}
              />
            </div>

            <div>
              <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                プレイ日 <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={playedDate}
                onChange={(e) => setPlayedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-pink-400 text-white focus:outline-none transition-all"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                  開始時刻
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-pink-400 text-white focus:outline-none transition-all"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}
                />
              </div>
              <div>
                <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                  終了時刻
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-pink-400 text-white focus:outline-none transition-all"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}
                />
              </div>
            </div>

            {startTime && endTime && (
              <div className="bg-pink-500/20 rounded-xl p-3 border border-pink-400/30">
                <p className="text-sm text-pink-200 flex items-center gap-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>
                  <Clock className="w-4 h-4" />
                  <span className="font-black">プレイ時間:</span> {calculateDuration()}分
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 機種情報 */}
      <div className="relative">
        <div className="absolute inset-0 bg-rose-600 blur-xl opacity-50" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/20 shadow-2xl">
          <h3 className="font-black text-white mb-4 flex items-center gap-2 text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
            <Target className="w-5 h-5 text-rose-400" />
            機種情報
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                機種名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={machineName}
                onChange={(e) => setMachineName(e.target.value)}
                placeholder="P大海物語5"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-rose-400 text-white placeholder-white/50 focus:outline-none transition-all"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}
              />
            </div>

            <div>
              <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                タイプ
              </label>
              <input
                type="text"
                value={machineType}
                onChange={(e) => setMachineType(e.target.value)}
                placeholder="例: 1/319"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-rose-400 text-white placeholder-white/50 focus:outline-none transition-all"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}
              />
            </div>

            <div>
              <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                1kあたりの回転数
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={rotationPer1k || ''}
                onChange={(e) => setRotationPer1k(Number(e.target.value) || 0)}
                placeholder="18.5"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-rose-400 text-white placeholder-white/50 focus:outline-none transition-all text-lg font-black"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
              />
              <p className="text-xs text-white/60 mt-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>
                例: 1000円で18.5回転
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                  初当たり回数
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={firstHitCount || ''}
                  onChange={(e) => setFirstHitCount(Number(e.target.value) || 0)}
                  placeholder="3"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-orange-400 text-white placeholder-white/50 focus:outline-none transition-all text-lg font-black"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                />
              </div>
              <div>
                <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                  確変回数
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={probabilityChange || ''}
                  onChange={(e) => setProbabilityChange(Number(e.target.value) || 0)}
                  placeholder="2"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-blue-400 text-white placeholder-white/50 focus:outline-none transition-all text-lg font-black"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 収支 */}
      <div className="relative">
        <div className="absolute inset-0 bg-green-600 blur-xl opacity-50" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/20 shadow-2xl">
          <h3 className="font-black text-white mb-4 flex items-center gap-2 text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
            <TrendingUp className="w-5 h-5 text-green-400" />
            収支
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                投資額 <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="1000"
                min="0"
                value={investment || ''}
                onChange={(e) => setInvestment(Number(e.target.value) || 0)}
                placeholder="20000"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-red-400 text-white placeholder-white/50 focus:outline-none transition-all text-2xl font-black"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
              />
            </div>

            <div>
              <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                回収額 <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                step="1000"
                min="0"
                value={payout || ''}
                onChange={(e) => setPayout(Number(e.target.value) || 0)}
                placeholder="25000"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-green-400 text-white placeholder-white/50 focus:outline-none transition-all text-2xl font-black"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 収支プレビュー */}
      {(investment > 0 || payout > 0) && (
        <div className="relative group">
          <div className={`absolute inset-0 ${calculateProfit() >= 0 ? 'bg-green-600' : 'bg-red-600'} blur-xl opacity-75 animate-pulse`} />
          <div className={`relative bg-gradient-to-r ${
            calculateProfit() >= 0 
              ? 'from-green-500 to-emerald-600' 
              : 'from-red-500 to-pink-600'
          } rounded-2xl p-1 shadow-2xl`}>
            <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5">
              <p className="text-white/90 text-sm mb-2 font-bold" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 700 }}>
                収支
              </p>
              <p className="text-white text-4xl font-black drop-shadow-glow" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                {calculateProfit() >= 0 ? '+' : ''}{calculateProfit().toLocaleString()}
                <span className="text-2xl ml-1">円</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 振り返り */}
      <div className="relative">
        <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/20 shadow-2xl">
          <h3 className="font-black text-white mb-4 flex items-center gap-2 text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
            <Sparkles className="w-5 h-5 text-purple-400" />
            振り返り
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                満足度
              </label>
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
                    className={`py-3 rounded-xl font-black text-xs transition-all ${
                      feeling === option.value
                        ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg scale-105'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 border-2 border-white/20'
                    }`}
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                  >
                    <div className="text-2xl mb-1">{option.emoji}</div>
                    <div>{option.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                メモ
              </label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="回転が良かった、確変が続いた、など"
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-purple-400 text-white placeholder-white/50 focus:outline-none transition-all resize-none"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 送信ボタン */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 rounded-xl bg-white/10 border-2 border-white/20 text-white font-black hover:bg-white/20 transition-all"
          style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
        >
          キャンセル
        </button>
        <div className="flex-1 relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
          <button
            type="submit"
            disabled={loading}
            className="relative w-full py-4 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-black shadow-2xl hover:shadow-pink-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
          >
            {loading ? '保存中...' : (
              <>
                <Save className="w-5 h-5" />
                記録を保存
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx global>{`
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </form>
  )
}