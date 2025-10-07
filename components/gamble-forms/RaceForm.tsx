'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, X, Clock, TrendingUp, Star, MessageSquare, Sparkles } from 'lucide-react'

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
  const [predictionTime, setPredictionTime] = useState(0)
  
  const [raceNumbers, setRaceNumbers] = useState('')
  const [betTypes, setBetTypes] = useState<string[]>([])
  const [totalBets, setTotalBets] = useState(0)
  const [totalPayout, setTotalPayout] = useState(0)
  const [hits, setHits] = useState(0)
  const [biggestWin, setBiggestWin] = useState(0)
  
  const [feeling, setFeeling] = useState<'excellent' | 'good' | 'normal' | 'bad' | 'terrible'>('normal')
  const [memo, setMemo] = useState('')

  const getRaceTypeInfo = () => {
    switch (raceType) {
      case 'horse':
        return { 
          icon: '🏇', 
          name: '競馬', 
          category: 'horse_race', 
          color: 'green',
          gradientFrom: 'from-green-600',
          gradientTo: 'to-emerald-600',
          borderColor: 'border-green-500/50',
          focusBorder: 'focus:border-green-500',
          textColor: 'text-green-400',
          placeholder: '東京競馬場' 
        }
      case 'boat':
        return { 
          icon: '🚤', 
          name: '競艇', 
          category: 'boat_race', 
          color: 'blue',
          gradientFrom: 'from-blue-600',
          gradientTo: 'to-cyan-600',
          borderColor: 'border-blue-500/50',
          focusBorder: 'focus:border-blue-500',
          textColor: 'text-blue-400',
          placeholder: '住之江競艇場' 
        }
      case 'bicycle':
        return { 
          icon: '🚴', 
          name: '競輪', 
          category: 'bicycle_race', 
          color: 'orange',
          gradientFrom: 'from-orange-600',
          gradientTo: 'to-red-600',
          borderColor: 'border-orange-500/50',
          focusBorder: 'focus:border-orange-500',
          textColor: 'text-orange-400',
          placeholder: '京王閣競輪場' 
        }
    }
  }

  const info = getRaceTypeInfo()

  const calculateProfit = () => {
    return totalPayout - totalBets
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

      const raceDetails = {
        race_type: raceType,
        track: track,
        race_numbers: raceNumbers.split(',').map(n => n.trim()).filter(n => n),
        bet_types: betTypes,
        total_bets: totalBets,
        hits: hits || null,
        biggest_win: biggestWin || null,
        prediction_time: predictionTime
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
          buy_in: totalBets || null,
          cash_out: totalPayout || null,
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

  const profit = calculateProfit()
  const playDuration = calculatePlayDuration()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 pb-8">
      {/* ヘッダー */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-50 shadow-lg shadow-purple-500/20">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${info.gradientFrom} ${info.gradientTo} rounded-2xl blur-lg animate-pulse`} />
              <div className={`relative w-12 h-12 bg-gradient-to-br ${info.gradientFrom} ${info.gradientTo} rounded-2xl flex items-center justify-center shadow-xl`}>
                <span className="text-2xl">{info.icon}</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{info.name}記録</h1>
              <p className={`text-sm ${info.textColor}`}>新しい記録を追加</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="container max-w-md mx-auto px-4 py-6 space-y-5">
        {/* 基本情報 */}
        <div className="relative group">
          <div className={`absolute inset-0 bg-gradient-to-r ${info.gradientFrom} ${info.gradientTo} rounded-2xl blur-xl opacity-50`} />
          <div className={`relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 ${info.borderColor} shadow-2xl`}>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className={`w-5 h-5 ${info.textColor}`} />
              <h3 className="font-black text-white">{info.name}場情報</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  {info.name}場 <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  placeholder={info.placeholder}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white placeholder-gray-500 ${info.focusBorder} focus:outline-none transition-all backdrop-blur-sm`}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  開催日 <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={playedDate}
                  onChange={(e) => setPlayedDate(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl text-sm ..."
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
                    className={`w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white ${info.focusBorder} focus:outline-none transition-all backdrop-blur-sm`}
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
                    className={`w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white ${info.focusBorder} focus:outline-none transition-all backdrop-blur-sm`}
                  />
                </div>
              </div>

              {playDuration && (
                <div className={`bg-gradient-to-r ${info.gradientFrom} ${info.gradientTo} rounded-xl p-4 shadow-lg`}>
                  <p className="text-white text-sm mb-1">滞在時間</p>
                  <p className="text-white text-2xl font-black">{playDuration}分</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  予想にかけた時間（分）
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={predictionTime || ''}
                  onChange={(e) => setPredictionTime(Number(e.target.value) || 0)}
                  placeholder="30"
                  className={`w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white placeholder-gray-500 ${info.focusBorder} focus:outline-none transition-all backdrop-blur-sm`}
                />
                <p className="text-xs text-gray-400 mt-1">
                  新聞・情報サイトで予想した時間
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 投票内容 */}
        <div className="relative group">
          <div className={`absolute inset-0 bg-gradient-to-r ${info.gradientFrom} ${info.gradientTo} rounded-2xl blur-xl opacity-50`} />
          <div className={`relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 ${info.borderColor} shadow-2xl`}>
            <div className="flex items-center gap-2 mb-4">
              <Star className={`w-5 h-5 ${info.textColor}`} />
              <h3 className="font-black text-white">投票内容</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">参加レース</label>
                <input
                  type="text"
                  value={raceNumbers}
                  onChange={(e) => setRaceNumbers(e.target.value)}
                  placeholder="1R, 3R, 11R"
                  className={`w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white placeholder-gray-500 ${info.focusBorder} focus:outline-none transition-all backdrop-blur-sm`}
                />
                <p className="text-xs text-gray-400 mt-1">
                  カンマ区切りで入力
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">購入券種</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {suggestedBetTypes.map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => addBetType(type)}
                      disabled={betTypes.includes(type)}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                        betTypes.includes(type)
                          ? `bg-gradient-to-r ${info.gradientFrom} ${info.gradientTo} text-white shadow-lg`
                          : 'bg-white/10 text-gray-300 hover:bg-white/20 border-2 border-white/10'
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
                        className={`px-4 py-2 bg-gradient-to-r ${info.gradientFrom} ${info.gradientTo} text-white rounded-full text-sm font-bold flex items-center gap-2 shadow-lg`}
                      >
                        {type}
                        <button
                          type="button"
                          onClick={() => removeBetType(type)}
                          className="hover:bg-white/20 rounded-full p-1 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  総投資額 <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={totalBets || ''}
                  onChange={(e) => setTotalBets(Number(e.target.value) || 0)}
                  placeholder="5000"
                  className={`w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white placeholder-gray-500 ${info.focusBorder} focus:outline-none transition-all backdrop-blur-sm text-2xl font-black`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 結果 */}
        <div className="relative group">
          <div className={`absolute inset-0 bg-gradient-to-r ${info.gradientFrom} ${info.gradientTo} rounded-2xl blur-xl opacity-50`} />
          <div className={`relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 ${info.borderColor} shadow-2xl`}>
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className={`w-5 h-5 ${info.textColor}`} />
              <h3 className="font-black text-white">結果</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2">
                  総払戻額 <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  required
                  value={totalPayout || ''}
                  onChange={(e) => setTotalPayout(Number(e.target.value) || 0)}
                  placeholder="8000"
                  className={`w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white placeholder-gray-500 ${info.focusBorder} focus:outline-none transition-all backdrop-blur-sm text-2xl font-black`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">的中回数</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={hits || ''}
                    onChange={(e) => setHits(Number(e.target.value) || 0)}
                    placeholder="2"
                    className={`w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white placeholder-gray-500 ${info.focusBorder} focus:outline-none transition-all backdrop-blur-sm text-lg font-black`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-300 mb-2">最高配当</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={biggestWin || ''}
                    onChange={(e) => setBiggestWin(Number(e.target.value) || 0)}
                    placeholder="3000"
                    className={`w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white placeholder-gray-500 ${info.focusBorder} focus:outline-none transition-all backdrop-blur-sm text-lg font-black`}
                  />
                </div>
              </div>

              {(totalBets > 0 || totalPayout > 0) && (
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
          <div className={`absolute inset-0 bg-gradient-to-r ${info.gradientFrom} ${info.gradientTo} rounded-2xl blur-xl opacity-50`} />
          <div className={`relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 ${info.borderColor} shadow-2xl`}>
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className={`w-5 h-5 ${info.textColor}`} />
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
                          ? `bg-gradient-to-br ${info.gradientFrom} ${info.gradientTo} text-white shadow-2xl scale-105 border-2 border-white/30`
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
                <label className="block text-sm font-bold text-gray-300 mb-2">メモ</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="予想が的中した、穴馬が来た、など"
                  rows={4}
                  className={`w-full px-4 py-3 rounded-xl border-2 border-white/10 bg-black/40 text-white placeholder-gray-500 ${info.focusBorder} focus:outline-none transition-all resize-none backdrop-blur-sm`}
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
            <div className={`absolute inset-0 bg-gradient-to-r ${info.gradientFrom} ${info.gradientTo} rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity`} />
            <button
              type="submit"
              disabled={loading}
              className={`relative w-full py-4 rounded-xl bg-gradient-to-r ${info.gradientFrom} ${info.gradientTo} text-white font-black shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2`}
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