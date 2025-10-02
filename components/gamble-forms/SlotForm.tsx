'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, X } from 'lucide-react'

interface SlotFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function SlotForm({ onSuccess, onCancel }: SlotFormProps) {
  const [loading, setLoading] = useState(false)
  
  const [location, setLocation] = useState('')
  const [playedDate, setPlayedDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  
  const [machineName, setMachineName] = useState('')
  const [estimatedSetting, setEstimatedSetting] = useState('')
  const [confirmedSetting, setConfirmedSetting] = useState('')
  
  const [investment, setInvestment] = useState('')
  const [payout, setPayout] = useState('')
  
  const [feeling, setFeeling] = useState<'excellent' | 'good' | 'normal' | 'bad' | 'terrible'>('normal')
  const [memo, setMemo] = useState('')

  const calculateProfit = () => {
    const inv = parseInt(investment) || 0
    const pay = parseInt(payout) || 0
    return pay - inv
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

      const slotDetails = {
        machine_name: machineName,
        estimated_setting: estimatedSetting || null,
        confirmed_setting: confirmedSetting || null,
        investment: parseInt(investment) || 0,
        payout: parseInt(payout) || 0
      }

      const { error } = await supabase
        .from('gamble_records')
        .insert({
          user_id: user.id,
          category: 'slot',
          location,
          played_date: playedDate,
          start_time: startTime || null,
          end_time: endTime || null,
          play_duration: duration,
          buy_in: parseInt(investment) || null,
          cash_out: parseInt(payout) || null,
          profit,
          slot_details: slotDetails,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
        <h3 className="font-black text-gray-900 mb-4">基本情報</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              店名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="○○スロット"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 text-gray-900 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              プレイ日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={playedDate}
              onChange={(e) => setPlayedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 text-gray-900 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                開始時刻 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 text-gray-900 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                終了時刻 <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 text-gray-900 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {startTime && endTime && (
            <div className="bg-red-50 rounded-xl p-3 border border-red-200">
              <p className="text-sm text-gray-700">
                <span className="font-bold">プレイ時間:</span> {calculateDuration()}分
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
        <h3 className="font-black text-gray-900 mb-4">機種情報</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              機種名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={machineName}
              onChange={(e) => setMachineName(e.target.value)}
              placeholder="課長熊田工作"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 text-gray-900 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">予想設定</label>
            <select
              value={estimatedSetting}
              onChange={(e) => setEstimatedSetting(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 text-gray-900 focus:outline-none transition-colors"
            >
              <option value="">不明</option>
              <option value="1">設定1</option>
              <option value="2">設定2</option>
              <option value="3">設定3</option>
              <option value="4">設定4</option>
              <option value="5">設定5</option>
              <option value="6">設定6</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">確定設定（2以上のみ）</label>
            <select
              value={confirmedSetting}
              onChange={(e) => setConfirmedSetting(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 text-gray-900 focus:outline-none transition-colors"
            >
              <option value="">確定せず</option>
              <option value="2">設定2以上</option>
              <option value="4">設定4以上</option>
              <option value="5">設定5以上</option>
              <option value="6">設定6確定</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
        <h3 className="font-black text-gray-900 mb-4">収支</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              投資額 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={investment}
              onChange={(e) => setInvestment(e.target.value)}
              placeholder="10000"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 text-gray-900 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              回収額 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={payout}
              onChange={(e) => setPayout(e.target.value)}
              placeholder="15000"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 text-gray-900 focus:outline-none transition-colors"
            />
          </div>

          {investment && payout && (
            <div className={`rounded-xl p-4 ${
              calculateProfit() >= 0 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                : 'bg-gradient-to-r from-red-500 to-pink-600'
            }`}>
              <p className="text-white text-sm mb-1">収支</p>
              <p className="text-white text-3xl font-black">
                {calculateProfit() >= 0 ? '+' : ''}{calculateProfit().toLocaleString()}円
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
        <h3 className="font-black text-gray-900 mb-4">振り返り</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">満足度</label>
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
                      ? 'bg-red-500 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.emoji}</div>
                  <div className="text-xs">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">メモ</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="ATに入った、設定が良かった、など"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 text-gray-900 focus:outline-none transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-4 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-all"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-4 rounded-xl bg-gradient-to-r from-red-500 to-pink-600 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? '保存中...' : (
            <>
              <Save className="w-5 h-5" />
              記録を保存
            </>
          )}
        </button>
      </div>
    </form>
  )
}