'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  DollarSign, 
  Save, 
  Trash2, 
  CheckCircle, 
  Coins, 
  TrendingUp,
  Trophy,
  Timer,
  Sparkles,
  Zap,
  Target,
  Award,
  ArrowUp,
  ArrowDown,
  Flame,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react'

interface GameSession {
  id: string
  user_id: string
  buy_in: number
  cash_out: number
  profit: number
  jackpot_contribution: number
  played_at: string
  start_time: string
  end_time: string
  play_hours: number
  created_at: string
}

// 紙吹雪アニメーションコンポーネント
const Confetti = ({ show }: { show: boolean }) => {
  if (!show) return null
  
  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-fall"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        >
          <div
            className={`w-2 h-2 ${
              i % 3 === 0 ? 'bg-purple-500' : i % 3 === 1 ? 'bg-pink-500' : 'bg-yellow-500'
            } rounded-full shadow-lg ${
              i % 3 === 0 ? 'shadow-purple-500/50' : i % 3 === 1 ? 'shadow-pink-500/50' : 'shadow-yellow-500/50'
            }`}
          />
        </div>
      ))}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-fall {
          animation: fall linear forwards;
        }
      `}</style>
    </div>
  )
}

export default function GameReportPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [sessions, setSessions] = useState<GameSession[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  
  // 個別登録フォーム状態
  const [date, setDate] = useState(getTodayDate())
  const [startTime, setStartTime] = useState('20:00')
  const [endTime, setEndTime] = useState('23:00')
  const [buyIn, setBuyIn] = useState(0)
  const [finalChips, setFinalChips] = useState(0)
  const [confirmSave, setConfirmSave] = useState(false)

  // タイムゾーン対応の今日の日付取得
  function getTodayDate() {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  // 計算値
  const jpContribution = finalChips % 1000
  const cashOut = finalChips - jpContribution
  const profit = cashOut - buyIn

  useEffect(() => {
    checkAuth()
    fetchSessions()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
    }
  }

  const fetchSessions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('played_at', { ascending: false })
        .limit(20)

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculatePlayHours = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)
    
    let startMinutes = startHour * 60 + startMin
    let endMinutes = endHour * 60 + endMin
    
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60
    }
    
    return Number(((endMinutes - startMinutes) / 60).toFixed(1))
  }

  // 個別登録
  const handleSingleSubmit = async () => {
    if (!confirmSave || saving) return
    
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        console.error('No user found')
        return
      }

      const playHours = calculatePlayHours(startTime, endTime)
      const playedAt = `${date}T${startTime}:00+09:00`

      const { error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          buy_in: buyIn,
          cash_out: cashOut,
          profit: profit,
          jackpot_contribution: jpContribution,
          played_at: playedAt,
          start_time: startTime,
          end_time: endTime,
          play_hours: playHours
        })

      if (sessionError) {
        console.error('Session save error:', sessionError)
        alert(`保存エラー: ${sessionError.message}`)
        setSaving(false)
        return
      }

      // ジャックポットに端数を追加
      if (jpContribution > 0) {
        await updateJackpot(jpContribution)
      }

      // 成功演出
      setShowSuccess(true)
      if (profit > 0) {
        setShowConfetti(true)
        setTimeout(() => setShowConfetti(false), 5000)
      }
      setTimeout(() => setShowSuccess(false), 3000)

      // フォームリセット
      setBuyIn(0)
      setFinalChips(0)
      setConfirmSave(false)

      await fetchSessions()
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  // ジャックポット更新
  const updateJackpot = async (amount: number) => {
    try {
      const { data: jpData } = await supabase
        .from('jackpot_pool')
        .select('*')
        .limit(1)

      if (!jpData || jpData.length === 0) {
        await supabase.from('jackpot_pool').insert({ current_amount: amount })
      } else {
        const currentJp = jpData[0]
        await supabase
          .from('jackpot_pool')
          .update({ current_amount: (currentJp.current_amount || 0) + amount })
          .eq('id', currentJp.id)
      }
    } catch (jpError) {
      console.error('JP update error:', jpError)
    }
  }

  // 削除
  const handleDelete = async (id: string) => {
    if (!confirm('この記録を削除しますか？\n（ジャックポット積立は戻りません）')) return

    try {
      const { error } = await supabase
        .from('game_sessions')
        .delete()
        .eq('id', id)

      if (error) throw error
      fetchSessions()
    } catch (error) {
      console.error('Error deleting session:', error)
    }
  }

  const playHours = calculatePlayHours(startTime, endTime)

  // 統計計算
  const totalSessions = sessions.length
  const totalProfit = sessions.reduce((sum, s) => sum + (s.profit || 0), 0)
  const totalJpContribution = sessions.reduce((sum, s) => sum + (s.jackpot_contribution || 0), 0)
  const totalPlayHours = sessions.reduce((sum, s) => sum + (s.play_hours || 0), 0)
  const winRate = totalSessions > 0 
    ? ((sessions.filter(s => (s.profit || 0) > 0).length / totalSessions) * 100).toFixed(1)
    : '0.0'
  const hourlyRate = totalPlayHours > 0 ? Math.round(totalProfit / totalPlayHours) : 0

  return (
    <div className="min-h-screen bg-black">
      <Confetti show={showConfetti} />
      
      {/* 背景エフェクト */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-black to-indigo-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative container max-w-md mx-auto p-4 pb-20">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border-2 border-purple-500/30 hover:bg-white/10 hover:border-purple-500/50 transition-all hover:scale-110 mb-4"
          >
            <ArrowLeft className="h-5 w-5 text-purple-400" />
          </button>
          
          <h1 className="text-3xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent animate-shimmer">
            個別記録登録
          </h1>
          <p className="text-purple-400/60 mt-2 font-mono text-sm">INDIVIDUAL GAME REPORT</p>
        </div>

        {/* 成功メッセージ */}
        {showSuccess && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 animate-pulse" />
              <div className="relative bg-black/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-2 border-green-500/50">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-600 blur-lg animate-pulse" />
                    <div className="relative w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center border-2 border-green-400">
                      <CheckCircle className="w-6 h-6 text-white drop-shadow-glow" />
                    </div>
                  </div>
                  <div>
                    <p className="font-black text-white text-lg drop-shadow-glow">保存完了！</p>
                    {jpContribution > 0 && (
                      <p className="text-sm font-bold text-yellow-400 font-mono">
                        JP +{jpContribution}P 積立
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 統計サマリー */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-30" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/30 shadow-2xl">
            <div className="grid grid-cols-2 gap-3">
              {/* 総収支 */}
              <div className="relative group">
                <div className={`absolute inset-0 ${totalProfit >= 0 ? 'bg-green-600' : 'bg-red-600'} rounded-xl blur-lg opacity-30`} />
                <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <Trophy className="w-4 h-4 text-purple-400 drop-shadow-glow" />
                    {totalProfit >= 0 ? (
                      <ArrowUp className="w-4 h-4 text-green-400" />
                    ) : (
                      <ArrowDown className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                  <p className="text-xs font-bold text-gray-400 mb-1 font-mono">総収支</p>
                  <p className={`text-2xl font-black font-mono drop-shadow-glow ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()}
                  </p>
                </div>
              </div>
              
              {/* 勝率 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-cyan-600 rounded-xl blur-lg opacity-30" />
                <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 border-cyan-500/30">
                  <Target className="w-4 h-4 text-cyan-400 drop-shadow-glow mb-2" />
                  <p className="text-xs font-bold text-gray-400 mb-1 font-mono">勝率</p>
                  <p className="text-2xl font-black text-white font-mono drop-shadow-glow">{winRate}%</p>
                  <div className="mt-2 bg-black/40 rounded-full h-1.5 overflow-hidden border border-cyan-500/30">
                    <div 
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all shadow-lg shadow-cyan-500/50"
                      style={{ width: `${winRate}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {/* 時給 */}
              <div className="relative group">
                <div className={`absolute inset-0 ${hourlyRate >= 0 ? 'bg-green-600' : 'bg-red-600'} rounded-xl blur-lg opacity-30`} />
                <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <Timer className="w-4 h-4 text-purple-400 drop-shadow-glow" />
                    <span className="text-xs font-bold text-gray-500 font-mono">{totalPlayHours.toFixed(1)}h</span>
                  </div>
                  <p className="text-xs font-bold text-gray-400 mb-1 font-mono">時給</p>
                  <p className={`text-2xl font-black font-mono drop-shadow-glow ${hourlyRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {hourlyRate >= 0 ? '+' : ''}{hourlyRate.toLocaleString()}
                  </p>
                </div>
              </div>
              
              {/* JP積立 */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-xl blur-lg opacity-50 animate-pulse" />
                <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 border-yellow-500/30">
                  <div className="flex items-center justify-between mb-2">
                    <Sparkles className="w-4 h-4 text-yellow-400 drop-shadow-glow" />
                    <Zap className="w-4 h-4 text-yellow-400 animate-pulse drop-shadow-glow" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 mb-1 font-mono">JP積立</p>
                  <p className="text-2xl font-black text-yellow-400 font-mono drop-shadow-glow">
                    {totalJpContribution.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 入力フォーム */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-indigo-500/30 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-600 blur-lg animate-pulse" />
                <div className="relative w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center border-2 border-indigo-400">
                  <Save className="w-4 h-4 text-white drop-shadow-glow" />
                </div>
              </div>
              <h2 className="text-lg font-black text-white">記録登録フォーム</h2>
            </div>
            
            {/* JP説明 */}
            <div className="relative mb-6 group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 border-yellow-500/30">
                <div className="flex items-start gap-3">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-yellow-600 blur-lg opacity-50" />
                    <div className="relative w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center border-2 border-yellow-400">
                      <Zap className="w-4 h-4 text-white drop-shadow-glow" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="font-black text-white mb-1 drop-shadow-glow">ジャックポット自動積立</p>
                    <p className="text-sm text-gray-300 font-mono">
                      最終チップの端数（1000P未満）は自動的にJPプールへ積立されます
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 日付 */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-400 mb-2 font-mono flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-cyan-500" />
                日付
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-black/40 border-2 border-cyan-500/30 text-white text-sm focus:border-cyan-500 focus:outline-none transition-all backdrop-blur-sm font-mono"
              />
            </div>

            {/* 時間 */}
            <div className="grid grid-cols-2 gap-1.5 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 font-mono flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-500" />
                  開始
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border-2 border-cyan-500/30 text-white text-sm focus:border-cyan-500 focus:outline-none transition-all backdrop-blur-sm font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-2 font-mono flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-cyan-500" />
                  終了
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/40 border-2 border-cyan-500/30 text-white text-sm focus:border-cyan-500 focus:outline-none transition-all backdrop-blur-sm font-mono"
                />
              </div>
            </div>

            {/* プレイ時間表示 */}
            <div className="relative group mb-4">
              <div className="absolute inset-0 bg-cyan-600 blur-lg opacity-50" />
              <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-4 text-center border-2 border-cyan-400/50 shadow-lg">
                <div className="flex items-center justify-center gap-3">
                  <Timer className="w-4 h-4 text-white drop-shadow-glow" />
                  <span className="font-bold text-white/80 font-mono">プレイ時間:</span>
                  <span className="text-2xl font-black text-white drop-shadow-glow font-mono">{playHours}h</span>
                </div>
                {playHours > 8 && (
                  <div className="mt-2 flex items-center justify-center gap-1.5 text-sm">
                    <AlertCircle className="w-4 h-4 text-orange-300 drop-shadow-glow" />
                    <span className="font-semibold text-orange-300 font-mono">長時間プレイです。休憩を忘れずに！</span>
                  </div>
                )}
              </div>
            </div>

            {/* バイイン */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-400 mb-2 font-mono flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-purple-500" />
                バイイン (P)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                value={buyIn || ''}
                onChange={(e) => {
                  const value = e.target.value
                  setBuyIn(value === '' ? 0 : Math.max(0, Number(value)))
                }}
                className="w-full px-3 py-2.5 border-2 border-purple-500/30 rounded-xl text-center font-black text-white text-lg bg-black/40 focus:outline-none focus:border-purple-500 transition-all backdrop-blur-sm font-mono"
                placeholder="20000"
              />
            </div>
            
            {/* 最終チップ */}
            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-400 mb-2 font-mono flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-purple-500" />
                最終チップ (P)
              </label>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setFinalChips(Math.max(0, finalChips - 1000))}
                  className="relative group px-2 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-black hover:shadow-lg hover:shadow-red-500/50 transition-all active:scale-95 border-2 border-red-400/50 flex-shrink-0"
                >
                  <div className="absolute inset-0 bg-red-600 blur-lg opacity-0 group-hover:opacity-50 rounded-xl transition-opacity" />
                  <Minus className="relative w-4 h-4 drop-shadow-glow" />
                </button>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={finalChips || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setFinalChips(value === '' ? 0 : Math.max(0, Number(value)))
                  }}
                  className="flex-1 min-w-0 px-2 py-2.5 border-2 border-purple-500/30 rounded-xl text-center font-black text-white text-lg bg-black/40 focus:outline-none focus:border-purple-500 transition-all backdrop-blur-sm font-mono"
                  placeholder="23456"
                />
                <button
                  type="button"
                  onClick={() => setFinalChips(finalChips + 1000)}
                  className="relative group px-2 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-black hover:shadow-lg hover:shadow-green-500/50 transition-all active:scale-95 border-2 border-green-400/50 flex-shrink-0"
                >
                  <div className="absolute inset-0 bg-green-600 blur-lg opacity-0 group-hover:opacity-50 rounded-xl transition-opacity" />
                  <Plus className="relative w-4 h-4 drop-shadow-glow" />
                </button>
              </div>
            </div>

            {/* 計算結果表示 */}
            {(finalChips >= 0) && buyIn > 0 && (
              <div className="relative group mb-4">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50" />
                <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-5 border-2 border-purple-500/30 animate-fadeIn">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-400 font-mono">最終チップ:</span>
                      <span className="font-black text-white text-lg font-mono">{finalChips.toLocaleString()} P</span>
                    </div>
                    
                    {jpContribution > 0 && (
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-lg blur-lg opacity-50" />
                        <div className="relative flex justify-between items-center bg-gradient-to-r from-yellow-600/30 to-amber-600/30 px-3 py-2 rounded-lg border border-yellow-500/30">
                          <span className="text-sm font-bold text-yellow-300 flex items-center gap-1.5 font-mono">
                            <Zap className="w-4 h-4 drop-shadow-glow" />
                            JP自動積立
                          </span>
                          <span className="font-black text-yellow-400 font-mono drop-shadow-glow">-{jpContribution} P</span>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-400 font-mono">キャッシュアウト:</span>
                      <span className="font-black text-white text-lg font-mono">{cashOut.toLocaleString()} P</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-400 font-mono">バイイン:</span>
                      <span className="font-black text-white text-lg font-mono">-{buyIn.toLocaleString()} P</span>
                    </div>
                    
                    <div className="relative pt-3 border-t border-purple-500/30">
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                      <div className="flex justify-between items-center">
                        <span className="font-black text-white font-mono flex items-center gap-1.5">
                          {profit >= 0 ? (
                            <Trophy className="w-4 h-4 text-green-400 drop-shadow-glow" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-400 drop-shadow-glow" />
                          )}
                          収支
                        </span>
                        <div className="flex items-center gap-1.5">
                          {profit >= 0 ? (
                            <ArrowUp className="w-4 h-4 text-green-400" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-red-400" />
                          )}
                          <div className="relative">
                            <div className={`absolute inset-0 ${profit >= 0 ? 'bg-green-600' : 'bg-red-600'} blur-lg opacity-50`} />
                            <span className={`relative text-3xl font-black font-mono drop-shadow-glow ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {profit >= 0 ? '+' : ''}{profit.toLocaleString()} P
                            </span>
                          </div>
                        </div>
                      </div>
                      {profit >= 30000 && (
                        <div className="mt-3 text-center">
                          <div className="relative inline-block">
                            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-600 blur-lg opacity-75 animate-pulse" />
                            <span className="relative inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-600 to-amber-600 text-white text-xs font-black rounded-full border-2 border-yellow-400">
                              <Flame className="w-3 h-3 drop-shadow-glow" />
                              大勝利！
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 確認チェックボックス */}
            <div className="mb-4">
              <label className="relative group flex items-center bg-black/40 backdrop-blur-sm rounded-xl p-4 cursor-pointer hover:bg-black/60 transition-all border-2 border-purple-500/30 hover:border-purple-500/50">
                <input
                  type="checkbox"
                  checked={confirmSave}
                  onChange={(e) => setConfirmSave(e.target.checked)}
                  className="mr-3 w-4 h-4 text-purple-600 border-gray-600 rounded focus:ring-purple-600 bg-black/40"
                />
                <div className="flex-1">
                  <span className="text-sm font-bold text-white font-mono">
                    上記の内容で登録することを確認しました
                  </span>
                  {jpContribution > 0 && (
                    <span className="block text-xs text-yellow-400 font-bold mt-1 font-mono">
                      {jpContribution}PがJPプールに自動積立されます
                    </span>
                  )}
                </div>
              </label>
            </div>

            {/* 保存ボタン */}
            <div className="relative group">
              <div className={`absolute inset-0 rounded-xl blur-lg transition-opacity ${
                confirmSave && !saving && buyIn >= 0
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 opacity-75 group-hover:opacity-100'
                  : 'bg-gray-600 opacity-30'
              }`} />
              <button
                onClick={handleSingleSubmit}
                disabled={!confirmSave || saving || buyIn < 0}
                className={`relative w-full py-4 rounded-xl font-black transition-all flex items-center justify-center gap-1.5 border-2 ${
                  confirmSave && !saving && buyIn >= 0
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-2xl hover:scale-105 active:scale-95'
                    : 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="font-mono">保存中...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 drop-shadow-glow" />
                    <span className="drop-shadow-glow font-mono">記録を保存</span>
                    {jpContribution > 0 && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-sm font-mono">
                        <Zap className="w-3 h-3" />
                        JP +{jpContribution}
                      </span>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 履歴リスト */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-pink-500/30 shadow-2xl">
            <div className="p-6 border-b border-pink-500/20">
              <h2 className="text-lg font-black text-white flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-pink-500 drop-shadow-glow" />
                最近の記録
              </h2>
            </div>
            
            {loading ? (
              <div className="p-12 text-center">
                <div className="relative mx-auto w-16 h-16">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full animate-spin" />
                  <div className="absolute inset-2 bg-black rounded-full" />
                </div>
              </div>
            ) : sessions.length === 0 ? (
              <div className="p-12 text-center">
                <Award className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                <p className="text-gray-500 font-bold font-mono">まだ記録がありません</p>
                <p className="text-sm text-gray-600 mt-1 font-mono">最初の記録を追加しましょう！</p>
              </div>
            ) : (
              <div className="divide-y divide-pink-500/10">
                {sessions.map((session) => {
                  const playedDate = new Date(session.played_at)
                  const displayDate = playedDate.toLocaleDateString('ja-JP', {
                    month: 'numeric',
                    day: 'numeric',
                    weekday: 'short'
                  })
                  
                  return (
                    <div key={session.id} className="p-5 hover:bg-white/5 transition-all">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="font-bold text-white text-sm font-mono">
                              {displayDate}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-white/5 px-2 py-1 rounded-full border border-white/10">
                              <Clock className="w-3 h-3" />
                              <span className="font-mono">{session.start_time} - {session.end_time}</span>
                            </div>
                            {session.play_hours && (
                              <span className="text-xs font-bold text-cyan-400 font-mono">
                                {session.play_hours}h
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 flex-wrap">
                            <div className="text-sm">
                              <span className="font-semibold text-gray-500 font-mono">IN:</span>
                              <span className="font-bold text-white ml-1 font-mono">
                                {session.buy_in.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="font-semibold text-gray-500 font-mono">OUT:</span>
                              <span className="font-bold text-white ml-1 font-mono">
                                {session.cash_out.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className="relative">
                                <div className={`absolute inset-0 ${(session.profit || 0) >= 0 ? 'bg-green-600' : 'bg-red-600'} blur-lg opacity-50`} />
                                <div className="relative flex items-center gap-1">
                                  {(session.profit || 0) >= 0 ? (
                                    <ArrowUp className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <ArrowDown className="w-4 h-4 text-red-400" />
                                  )}
                                  <span className={`font-black text-lg font-mono drop-shadow-glow ${(session.profit || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {(session.profit || 0) >= 0 ? '+' : ''}{(session.profit || 0).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {session.jackpot_contribution > 0 && (
                              <div className="relative group">
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-full blur-lg opacity-50" />
                                <div className="relative flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-600/30 to-amber-600/30 rounded-full border border-yellow-500/30">
                                  <Zap className="w-3 h-3 text-yellow-400 drop-shadow-glow" />
                                  <span className="text-xs font-bold text-yellow-400 font-mono">
                                    JP +{session.jackpot_contribution}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="relative group ml-4 p-2.5 hover:bg-red-600/20 rounded-xl transition-all active:scale-95 border-2 border-red-500/20 hover:border-red-500/50"
                        >
                          <div className="absolute inset-0 bg-red-600 blur-lg opacity-0 group-hover:opacity-50 rounded-xl transition-opacity" />
                          <Trash2 className="relative w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes shimmer {
          0% {
            background-position: -200% center;
          }
          100% {
            background-position: 200% center;
          }
        }

        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }

        /* カスタムスクロールバー */
        ::-webkit-scrollbar {
          width: 8px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.7);
        }
      `}</style>
    </div>
  )
}