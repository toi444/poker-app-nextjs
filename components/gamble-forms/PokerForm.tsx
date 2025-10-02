'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, X } from 'lucide-react'

interface PokerFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function PokerForm({ onSuccess, onCancel }: PokerFormProps) {
  const [loading, setLoading] = useState(false)
  
  // 基本情報
  const [location, setLocation] = useState('')
  const [playedDate, setPlayedDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [venueType, setVenueType] = useState<'other_store' | 'home_game' | 'online'>('other_store')
  
  // ゲーム詳細
  const [gameType, setGameType] = useState<'NLH' | 'tournament'>('NLH')
  const [format, setFormat] = useState<'cash' | 'tournament'>('cash')
  const [blind, setBlind] = useState('')
  
  // トーナメント詳細
  const [tournamentStage, setTournamentStage] = useState<'satellite' | 'day1' | 'day2' | 'final'>('day1')
  const [tournamentBuyIn, setTournamentBuyIn] = useState('')
  const [entryCount, setEntryCount] = useState('')
  const [finishingPosition, setFinishingPosition] = useState('')
  const [prize, setPrize] = useState('')
  
  // 収支
  const [buyIn, setBuyIn] = useState('')
  const [cashOut, setCashOut] = useState('')
  
  // 振り返り
  const [feeling, setFeeling] = useState<'excellent' | 'good' | 'normal' | 'bad' | 'terrible'>('normal')
  const [memo, setMemo] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const calculateProfit = () => {
    if (format === 'tournament' && prize) {
      const buyInNum = parseInt(tournamentBuyIn) || 0
      const prizeNum = parseInt(prize) || 0
      return prizeNum - buyInNum
    }
    const buyInNum = parseInt(buyIn) || 0
    const cashOutNum = parseInt(cashOut) || 0
    return cashOutNum - buyInNum
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

      const pokerDetails: any = {
        game_type: gameType,
        format: format,
        venue_type: venueType
      }

      if (format === 'cash') {
        pokerDetails.blind = blind
      }

      if (format === 'tournament') {
        pokerDetails.tournament_details = {
          stage: tournamentStage,
          buy_in_amount: parseInt(tournamentBuyIn) || 0,
          entry_count: entryCount ? parseInt(entryCount) : null,
          finishing_position: finishingPosition ? parseInt(finishingPosition) : null,
          prize: prize ? parseInt(prize) : null
        }
      }

      const { error } = await supabase
        .from('gamble_records')
        .insert({
          user_id: user.id,
          category: 'poker',
          location,
          played_date: playedDate,
          start_time: startTime || null,
          end_time: endTime || null,
          play_duration: duration,
          buy_in: format === 'cash' ? (parseInt(buyIn) || null) : (parseInt(tournamentBuyIn) || null),
          cash_out: format === 'cash' ? (parseInt(cashOut) || null) : (parseInt(prize) || null),
          profit,
          poker_details: pokerDetails,
          memo,
          feeling,
          tags
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

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag])
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag))
  }

  const suggestedTags = ['好調', 'ティルト', '学びあり', 'バッドビート', 'ビッグウィン', '集中力欠如']

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本情報 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
        <h3 className="font-black text-gray-900 mb-4">基本情報</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              店名・場所 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="○○ポーカールーム"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-gray-900 focus:outline-none transition-colors"
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
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-gray-900 focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">開始時刻</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-gray-900 focus:outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">終了時刻</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-gray-900 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {startTime && endTime && (
            <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
              <p className="text-sm text-gray-700">
                <span className="font-bold">プレイ時間:</span> {calculateDuration()}分
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">会場種別</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'other_store', label: '他店舗' },
                { value: 'home_game', label: 'ホームゲーム' },
                { value: 'online', label: 'オンライン' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setVenueType(option.value as any)}
                  className={`py-2 px-3 rounded-xl font-bold text-sm transition-all ${
                    venueType === option.value
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ゲーム詳細 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
        <h3 className="font-black text-gray-900 mb-4">ゲーム詳細</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">形式</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'cash', label: 'キャッシュゲーム' },
                { value: 'tournament', label: 'トーナメント' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormat(option.value as any)}
                  className={`py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                    format === option.value
                      ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {format === 'cash' && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">ブラインド</label>
              <input
                type="text"
                value={blind}
                onChange={(e) => setBlind(e.target.value)}
                placeholder="100/200"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-gray-900 focus:outline-none transition-colors"
              />
            </div>
          )}

          {format === 'tournament' && (
            <>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">トーナメント段階</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'satellite', label: 'サテライト' },
                    { value: 'day1', label: 'Day1' },
                    { value: 'day2', label: 'Day2' },
                    { value: 'final', label: '本戦/決勝' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTournamentStage(option.value as any)}
                      className={`py-2 px-3 rounded-xl font-bold text-sm transition-all ${
                        tournamentStage === option.value
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  バイイン <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={tournamentBuyIn}
                  onChange={(e) => setTournamentBuyIn(e.target.value)}
                  placeholder="10000"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-gray-900 focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">参加人数</label>
                  <input
                    type="number"
                    value={entryCount}
                    onChange={(e) => setEntryCount(e.target.value)}
                    placeholder="例: 120"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-gray-900 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">順位</label>
                  <input
                    type="number"
                    value={finishingPosition}
                    onChange={(e) => setFinishingPosition(e.target.value)}
                    placeholder="例: 15"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-gray-900 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">賞金</label>
                <input
                  type="number"
                  value={prize}
                  onChange={(e) => setPrize(e.target.value)}
                  placeholder="0（賞金圏外の場合）"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-gray-900 focus:outline-none transition-colors"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* 収支（キャッシュゲームのみ） */}
      {format === 'cash' && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
          <h3 className="font-black text-gray-900 mb-4">収支</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                バイイン <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={buyIn}
                onChange={(e) => setBuyIn(e.target.value)}
                placeholder="10000"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-gray-900 focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                最終チップ <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={cashOut}
                onChange={(e) => setCashOut(e.target.value)}
                placeholder="15000"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-gray-900 focus:outline-none transition-colors"
              />
            </div>

            {buyIn && cashOut && (
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
      )}

      {/* 収支プレビュー（トーナメント） */}
      {format === 'tournament' && tournamentBuyIn && (
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

      {/* 振り返り */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
        <h3 className="font-black text-gray-900 mb-4">振り返り</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">プレイの質</label>
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
                      ? 'bg-purple-500 text-white shadow-lg scale-105'
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
            <label className="block text-sm font-bold text-gray-700 mb-2">メモ・気づき</label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="良いプレイができた、ティルトしてしまった、など"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 text-gray-900 focus:outline-none transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">タグ</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  disabled={tags.includes(tag)}
                  className={`px-3 py-1 rounded-full text-sm font-bold transition-all ${
                    tags.includes(tag)
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold flex items-center gap-2"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 送信ボタン */}
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
          className="flex-1 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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