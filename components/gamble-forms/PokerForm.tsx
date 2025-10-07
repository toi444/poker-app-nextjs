'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, X, Clock, MapPin, Trophy, TrendingUp, Sparkles, Tag as TagIcon } from 'lucide-react'

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
  const [tournamentBuyIn, setTournamentBuyIn] = useState(0)
  const [entryCount, setEntryCount] = useState(0)
  const [finishingPosition, setFinishingPosition] = useState(0)
  const [prize, setPrize] = useState(0)
  
  // 収支
  const [buyIn, setBuyIn] = useState(0)
  const [cashOut, setCashOut] = useState(0)
  
  // 振り返り
  const [feeling, setFeeling] = useState<'excellent' | 'good' | 'normal' | 'bad' | 'terrible'>('normal')
  const [memo, setMemo] = useState('')
  const [tags, setTags] = useState<string[]>([])

  const calculateProfit = () => {
    if (format === 'tournament') {
      return prize - tournamentBuyIn
    }
    return cashOut - buyIn
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
    
    if (!location) {
      alert('店名・場所を入力してください')
      return
    }

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
          buy_in_amount: tournamentBuyIn,
          entry_count: entryCount || null,
          finishing_position: finishingPosition || null,
          prize: prize || null
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
          buy_in: format === 'cash' ? buyIn : tournamentBuyIn,
          cash_out: format === 'cash' ? cashOut : prize,
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
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 基本情報 */}
      <div className="relative">
        <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/20 shadow-2xl">
          <h3 className="font-black text-white mb-4 flex items-center gap-2 text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
            <MapPin className="w-5 h-5 text-purple-400" />
            基本情報
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                店名・場所 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="○○ポーカールーム"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-purple-400 text-white placeholder-white/50 focus:outline-none transition-all"
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
                className="w-full px-3 py-3 rounded-xl text-sm ..."
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
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-purple-400 text-white focus:outline-none transition-all"
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
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-purple-400 text-white focus:outline-none transition-all"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}
                />
              </div>
            </div>

            {startTime && endTime && (
              <div className="bg-purple-500/20 rounded-xl p-3 border border-purple-400/30">
                <p className="text-sm text-purple-200 flex items-center gap-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>
                  <Clock className="w-4 h-4" />
                  <span className="font-black">プレイ時間:</span> {calculateDuration()}分
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                会場種別
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'other_store', label: 'アミューズ' },
                  { value: 'home_game', label: 'カジノ' },
                  { value: 'online', label: 'オンライン' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setVenueType(option.value as any)}
                    className={`py-3 px-3 rounded-xl font-black text-sm transition-all ${
                      venueType === option.value
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg scale-105'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 border-2 border-white/20'
                    }`}
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ゲーム詳細 */}
      <div className="relative">
        <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-50" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/20 shadow-2xl">
          <h3 className="font-black text-white mb-4 flex items-center gap-2 text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
            <Trophy className="w-5 h-5 text-indigo-400" />
            ゲーム詳細
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                形式
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'cash', label: 'キャッシュゲーム' },
                  { value: 'tournament', label: 'トーナメント' }
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormat(option.value as any)}
                    className={`py-4 px-4 rounded-xl font-black text-base transition-all ${
                      format === option.value
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg scale-105'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 border-2 border-white/20'
                    }`}
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {format === 'cash' && (
              <div>
                <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                  ブラインド
                </label>
                <input
                  type="text"
                  value={blind}
                  onChange={(e) => setBlind(e.target.value)}
                  placeholder="100/200"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-indigo-400 text-white placeholder-white/50 focus:outline-none transition-all"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}
                />
              </div>
            )}

            {format === 'tournament' && (
              <>
                <div>
                  <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                    トーナメント段階
                  </label>
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
                        className={`py-3 px-3 rounded-xl font-black text-sm transition-all ${
                          tournamentStage === option.value
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg'
                            : 'bg-white/10 text-white/70 hover:bg-white/20 border-2 border-white/20'
                        }`}
                        style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                    バイイン <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={tournamentBuyIn || ''}
                    onChange={(e) => setTournamentBuyIn(Number(e.target.value) || 0)}
                    placeholder="10000"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-indigo-400 text-white placeholder-white/50 focus:outline-none transition-all text-2xl font-black"
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                      参加人数
                    </label>
                    <input
                      type="number"
                      step="10"
                      min="0"
                      value={entryCount || ''}
                      onChange={(e) => setEntryCount(Number(e.target.value) || 0)}
                      placeholder="例: 120"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-blue-400 text-white placeholder-white/50 focus:outline-none transition-all text-lg font-black"
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                      順位
                    </label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={finishingPosition || ''}
                      onChange={(e) => setFinishingPosition(Number(e.target.value) || 0)}
                      placeholder="例: 15"
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-orange-400 text-white placeholder-white/50 focus:outline-none transition-all text-lg font-black"
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                    賞金
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={prize || ''}
                    onChange={(e) => setPrize(Number(e.target.value) || 0)}
                    placeholder="0（賞金圏外の場合）"
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-green-400 text-white placeholder-white/50 focus:outline-none transition-all text-2xl font-black"
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 収支（キャッシュゲーム） */}
      {format === 'cash' && (
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
                  バイイン <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={buyIn || ''}
                  onChange={(e) => setBuyIn(Number(e.target.value) || 0)}
                  placeholder="10000"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-red-400 text-white placeholder-white/50 focus:outline-none transition-all text-2xl font-black"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                />
              </div>

              <div>
                <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                  最終チップ <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={cashOut || ''}
                  onChange={(e) => setCashOut(Number(e.target.value) || 0)}
                  placeholder="15000"
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-green-400 text-white placeholder-white/50 focus:outline-none transition-all text-2xl font-black"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 収支プレビュー */}
      {((format === 'cash' && (buyIn > 0 || cashOut > 0)) || (format === 'tournament' && tournamentBuyIn > 0)) && (
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
        <div className="absolute inset-0 bg-pink-600 blur-xl opacity-50" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/20 shadow-2xl">
          <h3 className="font-black text-white mb-4 flex items-center gap-2 text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
            <Sparkles className="w-5 h-5 text-pink-400" />
            振り返り
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                プレイの質
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
                メモ・気づき
              </label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="良いプレイができた、ティルトしてしまった、など"
                rows={4}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-pink-400 text-white placeholder-white/50 focus:outline-none transition-all resize-none"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}
              />
            </div>

            <div>
              <label className="block text-sm font-black text-white mb-3" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                <TagIcon className="w-4 h-4 inline mr-1" />
                タグ
              </label>
              <div className="flex flex-wrap gap-2 mb-3">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => addTag(tag)}
                    disabled={tags.includes(tag)}
                    className={`px-3 py-2 rounded-full text-sm font-black transition-all ${
                      tags.includes(tag)
                        ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 border-2 border-white/20'
                    }`}
                    style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
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
                      className="px-3 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-full text-sm font-black flex items-center gap-2 shadow-lg"
                      style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:bg-white/20 rounded-full p-0.5 transition-all"
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
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
          <button
            type="submit"
            disabled={loading}
            className="relative w-full py-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-2xl hover:shadow-purple-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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