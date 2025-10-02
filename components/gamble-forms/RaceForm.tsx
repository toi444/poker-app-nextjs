'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, X } from 'lucide-react'

interface RaceFormProps {
  raceType: 'horse' | 'boat' | 'bicycle'
  onSuccess: () => void
  onCancel: () => void
}

export default function RaceForm({ raceType, onSuccess, onCancel }: RaceFormProps) {
  const [loading, setLoading] = useState(false)
  
  const [track, setTrack] = useState('')
  const [playedDate, setPlayedDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [predictionTime, setPredictionTime] = useState('')
  
  const [raceNumbers, setRaceNumbers] = useState('')
  const [betTypes, setBetTypes] = useState<string[]>([])
  const [totalBets, setTotalBets] = useState('')
  const [totalPayout, setTotalPayout] = useState('')
  const [hits, setHits] = useState('')
  const [biggestWin, setBiggestWin] = useState('')
  
  const [feeling, setFeeling] = useState<'excellent' | 'good' | 'normal' | 'bad' | 'terrible'>('normal')
  const [memo, setMemo] = useState('')

  const getRaceTypeInfo = () => {
    switch (raceType) {
      case 'horse':
        return { icon: '🏇', name: '競馬', category: 'horse_race', color: 'green', placeholder: '東京競馬場' }
      case 'boat':
        return { icon: '🚤', name: '競艇', category: 'boat_race', color: 'blue', placeholder: '住之江競艇場' }
      case 'bicycle':
        return { icon: '🚴', name: '競輪', category: 'bicycle_race', color: 'orange', placeholder: '京王閣競輪場' }
    }
  }

  const info = getRaceTypeInfo()

  const calculateProfit = () => {
    const bets = parseInt(totalBets) || 0
    const payout = parseInt(totalPayout) || 0
    return payout - bets
  }

  const calculatePlayDuration = () => {
    if (!startTime || !endTime) return null
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(`2000-01-01T${endTime}`)
    let diff = (end.getTime() - start.getTime()) / (1000 * 60)
    if (diff < 0) diff += 24 * 60
    return Math.round(diff)
  }

  const addBetType = (type: string) => {
    if (!betTypes.includes(type)) {
      setBetTypes([...betTypes, type])
    }
  }

  const removeBetType = (type: string) => {
    setBetTypes(betTypes.filter(t => t !== type))
  }

  const suggestedBetTypes = ['単勝', '複勝', '馬連', '馬単', 'ワイド', '3連複', '3連単']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const profit = calculateProfit()
      const playDuration = calculatePlayDuration()
      const predTime = parseInt(predictionTime) || 0

      const raceDetails = {
        race_type: raceType,
        track: track,
        race_numbers: raceNumbers.split(',').map(n => n.trim()).filter(n => n),
        bet_types: betTypes,
        total_bets: parseInt(totalBets) || 0,
        hits: hits ? parseInt(hits) : null,
        biggest_win: biggestWin ? parseInt(biggestWin) : null,
        prediction_time: predTime
      }

      const { error } = await supabase
        .from('gamble_records')
        .insert({
          user_id: user.id,
          category: info.category,
          location: track,
          played_date: playedDate,
          start_time: startTime || null,
          end_time: endTime || null,
          play_duration: playDuration,
          buy_in: parseInt(totalBets) || null,
          cash_out: parseInt(totalPayout) || null,
          profit,
          race_details: raceDetails,
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
        <div className="flex items-center gap-2 mb-4">
          <span className="text-3xl">{info.icon}</span>
          <h3 className="font-black text-gray-900">{info.name}情報</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {info.name}場 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              placeholder={info.placeholder}
              className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-${info.color}-500 text-gray-900 focus:outline-none transition-colors`}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              開催日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={playedDate}
              onChange={(e) => setPlayedDate(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-${info.color}-500 text-gray-900 focus:outline-none transition-colors`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">開始時刻</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-${info.color}-500 text-gray-900 focus:outline-none transition-colors`}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">終了時刻</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-${info.color}-500 text-gray-900 focus:outline-none transition-colors`}
              />
            </div>
          </div>

          {startTime && endTime && (
            <div className={`bg-${info.color}-50 rounded-xl p-3 border border-${info.color}-200`}>
              <p className="text-sm text-gray-700">
                <span className="font-bold">滞在時間:</span> {calculatePlayDuration()}分
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              予想にかけた時間（分）
            </label>
            <input
              type="number"
              value={predictionTime}
              onChange={(e) => setPredictionTime(e.target.value)}
              placeholder="30"
              className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-${info.color}-500 text-gray-900 focus:outline-none transition-colors`}
            />
            <p className="text-xs text-gray-500 mt-1">
              新聞・情報サイトで予想した時間
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
        <h3 className="font-black text-gray-900 mb-4">投票内容</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">参加レース</label>
            <input
              type="text"
              value={raceNumbers}
              onChange={(e) => setRaceNumbers(e.target.value)}
              placeholder="1R, 3R, 11R"
              className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-${info.color}-500 text-gray-900 focus:outline-none transition-colors`}
            />
            <p className="text-xs text-gray-500 mt-1">
              カンマ区切りで入力
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">購入券種</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedBetTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => addBetType(type)}
                  disabled={betTypes.includes(type)}
                  className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                    betTypes.includes(type)
                      ? `bg-${info.color}-500 text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {betTypes.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {betTypes.map((type) => (
                  <div
                    key={type}
                    className={`px-3 py-1 bg-${info.color}-500 text-white rounded-full text-sm font-bold flex items-center gap-2`}
                  >
                    {type}
                    <button
                      type="button"
                      onClick={() => removeBetType(type)}
                      className="hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              総投資額 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={totalBets}
              onChange={(e) => setTotalBets(e.target.value)}
              placeholder="5000"
              className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-${info.color}-500 text-gray-900 focus:outline-none transition-colors`}
            />
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
        <h3 className="font-black text-gray-900 mb-4">結果</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              総払戻額 <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              required
              value={totalPayout}
              onChange={(e) => setTotalPayout(e.target.value)}
              placeholder="8000"
              className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-${info.color}-500 text-gray-900 focus:outline-none transition-colors`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">的中回数</label>
              <input
                type="number"
                value={hits}
                onChange={(e) => setHits(e.target.value)}
                placeholder="2"
                className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-${info.color}-500 text-gray-900 focus:outline-none transition-colors`}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">最高配当</label>
              <input
                type="number"
                value={biggestWin}
                onChange={(e) => setBiggestWin(e.target.value)}
                placeholder="3000"
                className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-${info.color}-500 text-gray-900 focus:outline-none transition-colors`}
              />
            </div>
          </div>

          {totalBets && totalPayout && (
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
                      ? `bg-${info.color}-500 text-white shadow-lg scale-105`
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
              placeholder="予想が的中した、穴馬が来た、など"
              rows={4}
              className={`w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-${info.color}-500 text-gray-900 focus:outline-none transition-colors resize-none`}
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
          className={`flex-1 py-4 rounded-xl bg-gradient-to-r from-${info.color}-500 to-${info.color}-600 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
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