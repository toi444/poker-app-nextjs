'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, X, Plus, Trash2, MapPin, Sparkles, TrendingUp, DollarSign, Clock } from 'lucide-react'

interface CasinoFormProps {
  onSuccess: () => void
  onCancel: () => void
}

interface CasinoGame {
  game_type: 'baccarat' | 'blackjack' | 'roulette' | 'slot' | 'other'
  buy_in: number
  cash_out: number
  note: string
}

export default function CasinoForm({ onSuccess, onCancel }: CasinoFormProps) {
  const [loading, setLoading] = useState(false)
  
  const [casinoName, setCasinoName] = useState('')
  const [country, setCountry] = useState('')
  const [playedDate, setPlayedDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  
  const [games, setGames] = useState<CasinoGame[]>([
    { game_type: 'baccarat', buy_in: 0, cash_out: 0, note: '' }
  ])
  
  const [feeling, setFeeling] = useState<'excellent' | 'good' | 'normal' | 'bad' | 'terrible'>('normal')
  const [memo, setMemo] = useState('')

  const calculateDuration = () => {
    if (!startTime || !endTime) return null
    const start = new Date(`2000-01-01T${startTime}`)
    const end = new Date(`2000-01-01T${endTime}`)
    let diff = (end.getTime() - start.getTime()) / (1000 * 60)
    if (diff < 0) diff += 24 * 60
    return Math.round(diff)
  }

  const addGame = () => {
    setGames([...games, { game_type: 'baccarat', buy_in: 0, cash_out: 0, note: '' }])
  }

  const removeGame = (index: number) => {
    if (games.length > 1) {
      setGames(games.filter((_, i) => i !== index))
    }
  }

  const updateGame = (index: number, field: keyof CasinoGame, value: any) => {
    const newGames = [...games]
    newGames[index] = { ...newGames[index], [field]: value }
    setGames(newGames)
  }

  const calculateGameProfit = (game: CasinoGame) => {
    return game.cash_out - game.buy_in
  }

  const calculateTotalProfit = () => {
    return games.reduce((sum, game) => sum + calculateGameProfit(game), 0)
  }

  const calculateTotalBuyIn = () => {
    return games.reduce((sum, game) => sum + game.buy_in, 0)
  }

  const calculateTotalCashOut = () => {
    return games.reduce((sum, game) => sum + game.cash_out, 0)
  }

  const getGameTypeLabel = (type: string) => {
    const labels = {
      baccarat: 'バカラ',
      blackjack: 'ブラックジャック',
      roulette: 'ルーレット',
      slot: 'スロット',
      other: 'その他'
    }
    return labels[type as keyof typeof labels] || type
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!casinoName) {
      alert('カジノ名を入力してください')
      return
    }

    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const totalProfit = calculateTotalProfit()
      const totalBuyIn = calculateTotalBuyIn()
      const totalCashOut = calculateTotalCashOut()
      const duration = calculateDuration()

      const casinoDetails = {
        casino_name: casinoName,
        country: country || null,
        games: games.map(game => ({
          game_type: game.game_type,
          buy_in: game.buy_in,
          cash_out: game.cash_out,
          profit: calculateGameProfit(game),
          note: game.note || null
        }))
      }

      const { error } = await supabase
        .from('gamble_records')
        .insert({
          user_id: user.id,
          category: 'casino',
          location: casinoName,
          played_date: playedDate,
          start_time: startTime || null,
          end_time: endTime || null,
          play_duration: duration,
          buy_in: totalBuyIn,
          cash_out: totalCashOut,
          profit: totalProfit,
          casino_details: casinoDetails,
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
      {/* カジノ情報 */}
      <div className="relative">
        <div className="absolute inset-0 bg-yellow-600 blur-xl opacity-50" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/20 shadow-2xl">
          <h3 className="font-black text-white mb-4 flex items-center gap-2 text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
            <MapPin className="w-5 h-5 text-yellow-400" />
            カジノ情報
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                カジノ名 <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={casinoName}
                onChange={(e) => setCasinoName(e.target.value)}
                placeholder="パラダイスシティ"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-yellow-400 text-white placeholder-white/50 focus:outline-none transition-all"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}
              />
            </div>

            <div>
              <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                国・地域
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="韓国"
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-yellow-400 text-white placeholder-white/50 focus:outline-none transition-all"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}
              />
            </div>

            <div>
              <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                訪問日 <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={playedDate}
                onChange={(e) => setPlayedDate(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-yellow-400 text-white focus:outline-none transition-all"
                style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                  <Clock className="w-4 h-4 inline mr-1" />
                  開始時刻
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-yellow-400 text-white focus:outline-none transition-all"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}
                />
              </div>
              <div>
                <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                  <Clock className="w-4 h-4 inline mr-1" />
                  終了時刻
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-yellow-400 text-white focus:outline-none transition-all"
                  style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}
                />
              </div>
            </div>

            {calculateDuration() && (
              <div className="bg-gradient-to-r from-yellow-600 to-amber-600 rounded-xl p-4 shadow-lg">
                <p className="text-white text-sm mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>
                  プレイ時間
                </p>
                <p className="text-white text-2xl font-black" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                  {calculateDuration()}分
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ゲーム記録 */}
      <div className="relative">
        <div className="absolute inset-0 bg-amber-600 blur-xl opacity-50" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/20 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-black text-white text-lg" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
              <DollarSign className="w-5 h-5 inline mr-1 text-amber-400" />
              ゲーム記録
            </h3>
            <p className="text-xs text-white/60" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>
              プレイしたゲーム毎に記録
            </p>
          </div>

          <div className="space-y-4">
            {games.map((game, index) => (
              <div key={index} className="relative">
                <div className="absolute inset-0 bg-white/5 rounded-xl blur-sm" />
                <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="font-black text-white text-base" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                      ゲーム {index + 1}
                    </h4>
                    {games.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeGame(index)}
                        className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                        ゲーム種類 <span className="text-red-400">*</span>
                      </label>
                      <select
                        value={game.game_type}
                        onChange={(e) => updateGame(index, 'game_type', e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-yellow-400 text-white focus:outline-none transition-all"
                        style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}
                      >
                        <option value="baccarat">バカラ</option>
                        <option value="blackjack">ブラックジャック</option>
                        <option value="roulette">ルーレット</option>
                        <option value="slot">スロット</option>
                        <option value="other">その他</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                          バイイン <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={game.buy_in || ''}
                          onChange={(e) => updateGame(index, 'buy_in', Number(e.target.value) || 0)}
                          placeholder="10000"
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-red-400 text-white placeholder-white/50 focus:outline-none transition-all text-lg font-black"
                          style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                          現金化 <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="number"
                          step="1"
                          min="0"
                          value={game.cash_out || ''}
                          onChange={(e) => updateGame(index, 'cash_out', Number(e.target.value) || 0)}
                          placeholder="15000"
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-green-400 text-white placeholder-white/50 focus:outline-none transition-all text-lg font-black"
                          style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
                        />
                      </div>
                    </div>

                    {game.game_type === 'other' && (
                      <div>
                        <label className="block text-sm font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                          ゲーム名・メモ
                        </label>
                        <input
                          type="text"
                          value={game.note}
                          onChange={(e) => updateGame(index, 'note', e.target.value)}
                          placeholder="ゲーム名を入力"
                          className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-white/20 focus:border-yellow-400 text-white placeholder-white/50 focus:outline-none transition-all"
                          style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}
                        />
                      </div>
                    )}

                    {(game.buy_in > 0 || game.cash_out > 0) && (
                      <div className={`rounded-xl p-3 ${
                        calculateGameProfit(game) >= 0 
                          ? 'bg-green-500/20 border border-green-400/30' 
                          : 'bg-red-500/20 border border-red-400/30'
                      }`}>
                        <p className="text-xs text-white/70 mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>
                          このゲームの収支
                        </p>
                        <p className={`text-xl font-black ${
                          calculateGameProfit(game) >= 0 ? 'text-green-400' : 'text-red-400'
                        }`} style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                          {calculateGameProfit(game) >= 0 ? '+' : ''}{calculateGameProfit(game).toLocaleString()}円
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addGame}
              className="w-full py-4 rounded-xl bg-yellow-500/20 border-2 border-yellow-400/30 text-yellow-300 font-black hover:bg-yellow-500/30 transition-all flex items-center justify-center gap-2"
              style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}
            >
              <Plus className="w-5 h-5" />
              ゲームを追加
            </button>
          </div>
        </div>
      </div>

      {/* 総合収支 */}
      <div className="relative group">
        <div className={`absolute inset-0 ${calculateTotalProfit() >= 0 ? 'bg-green-600' : 'bg-red-600'} blur-xl opacity-75 animate-pulse`} />
        <div className={`relative bg-gradient-to-r ${
          calculateTotalProfit() >= 0 
            ? 'from-green-500 to-emerald-600' 
            : 'from-red-500 to-pink-600'
        } rounded-2xl p-1 shadow-2xl`}>
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-6">
            <h3 className="font-black text-white text-lg mb-4" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
              <TrendingUp className="w-5 h-5 inline mr-1" />
              総合収支
            </h3>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-white/80 mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>
                  総バイイン
                </p>
                <p className="text-2xl font-black text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                  {calculateTotalBuyIn().toLocaleString()}円
                </p>
              </div>
              <div>
                <p className="text-sm text-white/80 mb-1" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>
                  総現金化
                </p>
                <p className="text-2xl font-black text-white" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                  {calculateTotalCashOut().toLocaleString()}円
                </p>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-white/80 mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>
                カジノ全体の収支
              </p>
              <p className="text-4xl font-black text-white drop-shadow-glow" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                {calculateTotalProfit() >= 0 ? '+' : ''}{calculateTotalProfit().toLocaleString()}
                <span className="text-2xl ml-1">円</span>
              </p>
            </div>
          </div>
        </div>
      </div>

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
                        ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg scale-105'
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
                placeholder="雰囲気が良かった、ディーラーが親切だった、など"
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
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-600 blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
          <button
            type="submit"
            disabled={loading}
            className="relative w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-black shadow-2xl hover:shadow-yellow-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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