'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Save, X, Plus, Trash2 } from 'lucide-react'

interface CasinoFormProps {
  onSuccess: () => void
  onCancel: () => void
}

interface CasinoGame {
  game_type: 'baccarat' | 'blackjack' | 'roulette' | 'slot' | 'other'
  buy_in: string
  cash_out: string
  note: string
}

export default function CasinoForm({ onSuccess, onCancel }: CasinoFormProps) {
  const [loading, setLoading] = useState(false)
  
  const [casinoName, setCasinoName] = useState('')
  const [country, setCountry] = useState('')
  const [playedDate, setPlayedDate] = useState(new Date().toISOString().split('T')[0])
  
  const [games, setGames] = useState<CasinoGame[]>([
    { game_type: 'baccarat', buy_in: '', cash_out: '', note: '' }
  ])
  
  const [feeling, setFeeling] = useState<'excellent' | 'good' | 'normal' | 'bad' | 'terrible'>('normal')
  const [memo, setMemo] = useState('')

  const addGame = () => {
    setGames([...games, { game_type: 'baccarat', buy_in: '', cash_out: '', note: '' }])
  }

  const removeGame = (index: number) => {
    if (games.length > 1) {
      setGames(games.filter((_, i) => i !== index))
    }
  }

  const updateGame = (index: number, field: keyof CasinoGame, value: string) => {
    const newGames = [...games]
    newGames[index] = { ...newGames[index], [field]: value }
    setGames(newGames)
  }

  const calculateGameProfit = (game: CasinoGame) => {
    const buyIn = parseInt(game.buy_in) || 0
    const cashOut = parseInt(game.cash_out) || 0
    return cashOut - buyIn
  }

  const calculateTotalProfit = () => {
    return games.reduce((sum, game) => sum + calculateGameProfit(game), 0)
  }

  const calculateTotalBuyIn = () => {
    return games.reduce((sum, game) => sum + (parseInt(game.buy_in) || 0), 0)
  }

  const calculateTotalCashOut = () => {
    return games.reduce((sum, game) => sum + (parseInt(game.cash_out) || 0), 0)
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
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const totalProfit = calculateTotalProfit()
      const totalBuyIn = calculateTotalBuyIn()
      const totalCashOut = calculateTotalCashOut()

      const casinoDetails = {
        casino_name: casinoName,
        country: country || null,
        games: games.map(game => ({
          game_type: game.game_type,
          buy_in: parseInt(game.buy_in) || 0,
          cash_out: parseInt(game.cash_out) || 0,
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
          start_time: null,
          end_time: null,
          play_duration: null,
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
        <h3 className="font-black text-gray-900 mb-4">カジノ情報</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              カジノ名 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={casinoName}
              onChange={(e) => setCasinoName(e.target.value)}
              placeholder="マリーナベイサンズ"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 text-gray-900 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">国・地域</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="シンガポール"
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 text-gray-900 focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              訪問日 <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={playedDate}
              onChange={(e) => setPlayedDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 text-gray-900 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-black text-gray-900">ゲーム記録</h3>
          <p className="text-xs text-gray-600">プレイしたゲーム毎に記録</p>
        </div>

        <div className="space-y-4">
          {games.map((game, index) => (
            <div key={index} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-bold text-gray-900">ゲーム {index + 1}</h4>
                {games.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeGame(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    ゲーム種類 <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={game.game_type}
                    onChange={(e) => updateGame(index, 'game_type', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 text-gray-900 focus:outline-none transition-colors"
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
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      バイイン <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={game.buy_in}
                      onChange={(e) => updateGame(index, 'buy_in', e.target.value)}
                      placeholder="10000"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 text-gray-900 focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      現金化 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      value={game.cash_out}
                      onChange={(e) => updateGame(index, 'cash_out', e.target.value)}
                      placeholder="15000"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 text-gray-900 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {game.game_type === 'other' && (
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">ゲーム名・メモ</label>
                    <input
                      type="text"
                      value={game.note}
                      onChange={(e) => updateGame(index, 'note', e.target.value)}
                      placeholder="ゲーム名を入力"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 text-gray-900 focus:outline-none transition-colors"
                    />
                  </div>
                )}

                {game.buy_in && game.cash_out && (
                  <div className={`rounded-xl p-3 ${
                    calculateGameProfit(game) >= 0 
                      ? 'bg-green-100 border border-green-300' 
                      : 'bg-red-100 border border-red-300'
                  }`}>
                    <p className="text-xs text-gray-700 mb-1">このゲームの収支</p>
                    <p className={`text-xl font-black ${
                      calculateGameProfit(game) >= 0 ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {calculateGameProfit(game) >= 0 ? '+' : ''}{calculateGameProfit(game).toLocaleString()}円
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addGame}
            className="w-full py-3 rounded-xl bg-yellow-50 border-2 border-yellow-200 text-yellow-700 font-bold hover:bg-yellow-100 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            ゲームを追加
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-yellow-500 to-amber-600 rounded-2xl p-6 shadow-xl text-white">
        <h3 className="font-black text-lg mb-4">総合収支</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm opacity-90 mb-1">総バイイン</p>
            <p className="text-2xl font-black">{calculateTotalBuyIn().toLocaleString()}円</p>
          </div>
          <div>
            <p className="text-sm opacity-90 mb-1">総現金化</p>
            <p className="text-2xl font-black">{calculateTotalCashOut().toLocaleString()}円</p>
          </div>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
          <p className="text-sm opacity-90 mb-2">カジノ全体の収支</p>
          <p className="text-4xl font-black">
            {calculateTotalProfit() >= 0 ? '+' : ''}{calculateTotalProfit().toLocaleString()}円
          </p>
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
                      ? 'bg-yellow-500 text-white shadow-lg scale-105'
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
              placeholder="雰囲気が良かった、ディーラーが親切だった、など"
              rows={4}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-yellow-500 text-gray-900 focus:outline-none transition-colors resize-none"
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
          className="flex-1 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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