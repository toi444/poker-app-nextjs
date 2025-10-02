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
  Info,
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
  AlertCircle
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
              i % 3 === 0 ? 'bg-violet-500' : i % 3 === 1 ? 'bg-pink-500' : 'bg-yellow-500'
            } rounded-full`}
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
  
  // フォーム状態
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [startTime, setStartTime] = useState('20:00')
  const [endTime, setEndTime] = useState('23:00')
  const [buyIn, setBuyIn] = useState(0)
  const [finalChips, setFinalChips] = useState(0)
  const [confirmSave, setConfirmSave] = useState(false)

  // 計算値
  const jpContribution = finalChips % 1000 // 1000P未満の端数
  const cashOut = finalChips - jpContribution // 1000P単位に切り捨て
  const profit = cashOut - buyIn // 実際の収支

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
        .limit(10)

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
    
    // 日跨ぎ対応
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60
    }
    
    return Number(((endMinutes - startMinutes) / 60).toFixed(1))
  }

  const handleSubmit = async () => {
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

      // ゲームセッションを保存
      const { data: sessionData, error: sessionError } = await supabase
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
        .select()
        .single()

      if (sessionError) {
        console.error('Session save error:', sessionError)
        alert(`保存エラー: ${sessionError.message}`)
        setSaving(false)
        return
      }

      // ジャックポットに端数を追加
      if (jpContribution > 0) {
        try {
          const { data: jpData } = await supabase
            .from('jackpot_pool')
            .select('*')
            .limit(1)

          if (!jpData || jpData.length === 0) {
            await supabase
              .from('jackpot_pool')
              .insert({
                current_amount: jpContribution
              })
          } else {
            const currentJp = jpData[0]
            await supabase
              .from('jackpot_pool')
              .update({
                current_amount: (currentJp.current_amount || 0) + jpContribution
              })
              .eq('id', currentJp.id)
          }
        } catch (jpError) {
          console.error('JP update error:', jpError)
        }
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

      // リスト更新
      await fetchSessions()
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

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
  
  // 時給計算
  const hourlyRate = totalPlayHours > 0 ? Math.round(totalProfit / totalPlayHours) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Confetti show={showConfetti} />
      
      <div className="container max-w-md mx-auto p-4 pb-20">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all mb-4"
          >
            <ArrowLeft className="h-5 w-5 text-gray-900" />
          </button>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            Game Report
          </h1>
          <p className="text-gray-800 mt-2 font-medium">今日の成績を記録しよう</p>
        </div>

        {/* 成功メッセージ */}
        {showSuccess && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-green-200 animate-bounce">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-black text-gray-900">保存完了！</p>
                  {jpContribution > 0 && (
                    <p className="text-sm font-bold text-amber-600">
                      JP +{jpContribution}P 積立
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 統計サマリー - グラスモーフィズム */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-5 border border-white/50 mb-6">
          <div className="grid grid-cols-2 gap-3">
            {/* 総収支 */}
            <div className="bg-gradient-to-br from-violet-100 to-indigo-100 rounded-2xl p-4 border border-violet-200">
              <div className="flex items-center justify-between mb-1">
                <Trophy className="w-5 h-5 text-violet-600" />
                {totalProfit >= 0 ? (
                  <ArrowUp className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowDown className="w-4 h-4 text-red-600" />
                )}
              </div>
              <p className="text-xs font-bold text-gray-700 mb-1">総収支</p>
              <p className={`text-2xl font-black ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()}
              </p>
            </div>
            
            {/* 勝率 */}
            <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-2xl p-4 border border-blue-200">
              <Target className="w-5 h-5 text-blue-600 mb-1" />
              <p className="text-xs font-bold text-gray-700 mb-1">勝率</p>
              <p className="text-2xl font-black text-gray-900">{winRate}%</p>
              <div className="mt-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-600 transition-all"
                  style={{ width: `${winRate}%` }}
                />
              </div>
            </div>
            
            {/* 時給 */}
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl p-4 border border-green-200">
              <div className="flex items-center justify-between mb-1">
                <Timer className="w-5 h-5 text-green-600" />
                <span className="text-xs font-bold text-gray-600">{totalPlayHours.toFixed(1)}h</span>
              </div>
              <p className="text-xs font-bold text-gray-700 mb-1">時給</p>
              <p className={`text-2xl font-black ${hourlyRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {hourlyRate >= 0 ? '+' : ''}{hourlyRate.toLocaleString()}
              </p>
            </div>
            
            {/* JP積立 */}
            <div className="bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl p-4 border border-amber-200">
              <div className="flex items-center justify-between mb-1">
                <Sparkles className="w-5 h-5 text-amber-600" />
                <Zap className="w-4 h-4 text-amber-600 animate-pulse" />
              </div>
              <p className="text-xs font-bold text-gray-700 mb-1">JP積立</p>
              <p className="text-2xl font-black text-amber-600">
                {totalJpContribution.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* 入力フォーム - ニューモーフィズム */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-white/50 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <Save className="w-4 h-4 text-white" />
            </div>
            新規記録
          </h2>
          
          {/* JP説明 - より魅力的に */}
          <div className="relative mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-2xl blur-xl opacity-20" />
            <div className="relative bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-black text-gray-900 mb-1">🎰 ジャックポット自動積立</p>
                  <p className="text-sm text-gray-800 font-semibold">
                    最終チップの端数（1000P未満）は自動的にJPプールへ積立されます
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 日付 */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-violet-600" />
              日付
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 text-gray-900 bg-white font-semibold transition-all hover:border-gray-300"
            />
          </div>

          {/* 時間 */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-600" />
                開始
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 text-gray-900 bg-white font-semibold transition-all hover:border-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-600" />
                終了
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 text-gray-900 bg-white font-semibold transition-all hover:border-gray-300"
              />
            </div>
          </div>

          {/* プレイ時間表示 */}
          <div className="bg-gradient-to-r from-indigo-100 to-blue-100 rounded-2xl p-4 mb-4 text-center border border-indigo-200">
            <div className="flex items-center justify-center gap-3">
              <Timer className="w-5 h-5 text-indigo-600" />
              <span className="font-bold text-gray-900">プレイ時間:</span>
              <span className="text-2xl font-black text-indigo-600">{playHours}時間</span>
            </div>
            {playHours > 8 && (
              <div className="mt-2 flex items-center justify-center gap-2 text-sm">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                <span className="font-semibold text-orange-600">長時間プレイです。休憩を忘れずに！</span>
              </div>
            )}
          </div>

          {/* バイインと最終チップ */}
          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-violet-600" />
                バイイン (P)
              </label>
              <input
                type="number"
                value={buyIn || ''}
                onChange={(e) => {
                  const value = e.target.value
                  setBuyIn(value === '' ? 0 : Math.max(0, Number(value)))
                }}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 text-gray-900 bg-white font-bold text-lg transition-all hover:border-gray-300"
                step="1000"
                placeholder="20000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <Coins className="w-4 h-4 text-violet-600" />
                最終チップ (P)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFinalChips(Math.max(0, finalChips - 1000))}
                  className="px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                >
                  -1K
                </button>
                <input
                  type="number"
                  value={finalChips || ''}
                  onChange={(e) => {
                    const value = e.target.value
                    setFinalChips(value === '' ? 0 : Math.max(0, Number(value)))
                  }}
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 text-gray-900 bg-white font-bold text-lg text-center transition-all hover:border-gray-300"
                  step="1"
                  placeholder="23456"
                />
                <button
                  type="button"
                  onClick={() => setFinalChips(finalChips + 1000)}
                  className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                >
                  +1K
                </button>
              </div>
            </div>
          </div>

          {/* 計算結果表示 - アニメーション付き */}
          {finalChips > 0 && (
            <div className="bg-gradient-to-br from-gray-50 via-violet-50 to-indigo-50 rounded-2xl p-5 mb-4 border border-violet-200 animate-fadeIn">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">最終チップ:</span>
                  <span className="font-black text-gray-900 text-lg">{finalChips.toLocaleString()} P</span>
                </div>
                
                {jpContribution > 0 && (
                  <div className="flex justify-between items-center bg-gradient-to-r from-amber-100 to-yellow-100 -mx-2 px-3 py-2 rounded-lg">
                    <span className="text-sm font-bold text-amber-700 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      JP自動積立
                    </span>
                    <span className="font-black text-amber-700">-{jpContribution} P</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">キャッシュアウト:</span>
                  <span className="font-black text-gray-900 text-lg">{cashOut.toLocaleString()} P</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-gray-700">バイイン:</span>
                  <span className="font-black text-gray-900 text-lg">-{buyIn.toLocaleString()} P</span>
                </div>
                
                <div className="border-t-2 border-violet-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900 flex items-center gap-2">
                      {profit >= 0 ? (
                        <Trophy className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      収支
                    </span>
                    <div className="flex items-center gap-2">
                      {profit >= 0 ? (
                        <ArrowUp className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowDown className="w-5 h-5 text-red-600" />
                      )}
                      <span className={`text-3xl font-black ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profit >= 0 ? '+' : ''}{profit.toLocaleString()} P
                      </span>
                    </div>
                  </div>
                  {profit >= 30000 && (
                    <div className="mt-2 text-center">
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-xs font-bold rounded-full">
                        <Flame className="w-3 h-3" />
                        大勝利！
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 確認チェックボックス */}
          <div className="mb-4">
            <label className="flex items-center bg-gradient-to-r from-violet-50 to-indigo-50 rounded-2xl p-4 cursor-pointer hover:from-violet-100 hover:to-indigo-100 transition-all border border-violet-200">
              <input
                type="checkbox"
                checked={confirmSave}
                onChange={(e) => setConfirmSave(e.target.checked)}
                className="mr-3 w-5 h-5 text-violet-600 border-gray-300 rounded focus:ring-violet-600"
              />
              <div className="flex-1">
                <span className="text-sm font-bold text-gray-900">
                  上記の内容で登録することを確認しました
                </span>
                {jpContribution > 0 && (
                  <span className="block text-xs text-amber-600 font-bold mt-1">
                    ※ {jpContribution}PがジャックポットプールYに自動積立されます
                  </span>
                )}
              </div>
            </label>
          </div>

          {/* 保存ボタン */}
          <button
            onClick={handleSubmit}
            disabled={!confirmSave || saving || buyIn < 0 || finalChips < 0}
            className={`w-full py-4 rounded-2xl font-bold transition-all transform ${
              confirmSave && !saving && buyIn >= 0 && finalChips >= 0
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                保存中...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Save className="w-5 h-5" />
                記録を保存
                {jpContribution > 0 && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full text-sm">
                    <Zap className="w-3 h-3" />
                    JP +{jpContribution}
                  </span>
                )}
              </span>
            )}
          </button>
        </div>

        {/* 履歴リスト */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            最近の記録
          </h2>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full animate-spin">
                <div className="w-12 h-12 bg-white rounded-full" />
              </div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 text-center border border-white/50">
              <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-700 font-semibold">まだ記録がありません</p>
              <p className="text-sm text-gray-600 mt-1">最初の記録を追加しましょう！</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((session) => {
                const playedDate = new Date(session.played_at)
                const displayDate = playedDate.toLocaleDateString('ja-JP', {
                  month: 'numeric',
                  day: 'numeric',
                  weekday: 'short'
                })
                
                return (
                  <div key={session.id} className="group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all border border-white/50">
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="font-bold text-gray-900 text-sm">
                              {displayDate}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gradient-to-r from-gray-100 to-violet-100 px-2 py-1 rounded-full">
                              <Clock className="w-3 h-3" />
                              {session.start_time} - {session.end_time}
                            </div>
                            {session.play_hours && (
                              <span className="text-xs font-bold text-indigo-600">
                                {session.play_hours}h
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-sm">
                              <span className="font-semibold text-gray-600">IN:</span>
                              <span className="font-bold text-gray-900 ml-1">
                                {session.buy_in.toLocaleString()}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="font-semibold text-gray-600">OUT:</span>
                              <span className="font-bold text-gray-900 ml-1">
                                {session.cash_out.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {(session.profit || 0) >= 0 ? (
                                <ArrowUp className="w-4 h-4 text-green-600" />
                              ) : (
                                <ArrowDown className="w-4 h-4 text-red-600" />
                              )}
                              <span className={`font-black text-lg ${(session.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {(session.profit || 0) >= 0 ? '+' : ''}{(session.profit || 0).toLocaleString()}
                              </span>
                            </div>
                            {session.jackpot_contribution > 0 && (
                              <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full">
                                <Zap className="w-3 h-3 text-amber-600" />
                                <span className="text-xs font-bold text-amber-700">
                                  JP +{session.jackpot_contribution}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleDelete(session.id)}
                          className="ml-4 p-2.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all active:scale-95"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
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
      `}</style>
    </div>
  )
}