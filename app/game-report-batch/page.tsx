'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Users, 
  Calendar,
  Clock,
  DollarSign,
  Save,
  CheckCircle,
  AlertCircle,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Plus,
  Minus,
  Trash2,
  Eye
} from 'lucide-react'

interface Profile {
  id: string
  username: string
  active: boolean
  avatar_url?: string
}

interface PlayerInput {
  userId: string
  username: string
  buyIn: number
  finalChips: number
  airLent: number
  airBorrowed: number
}

interface BatchSession {
  batch_id: string
  created_at: string
  created_by: string
  player_count: number
  sessions: any[]
}

// タイムゾーン対応の今日の日付
function getTodayDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const day = today.getDate()
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export default function BatchGameReportPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [step, setStep] = useState(1) // 1: プレイヤー選択, 2: 入力, 3: 履歴
  
  // プレイヤーリスト
  const [allPlayers, setAllPlayers] = useState<Profile[]>([])
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<Set<string>>(new Set())
  
  // 共通情報
  const [date, setDate] = useState(getTodayDate())
  const [startTime, setStartTime] = useState('20:00')
  const [endTime, setEndTime] = useState('23:00')
  
  // 各プレイヤー入力
  const [playerInputs, setPlayerInputs] = useState<PlayerInput[]>([])
  
  // 履歴
  const [batchHistory, setBatchHistory] = useState<BatchSession[]>([])
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchPlayers()
    fetchBatchHistory()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (profile?.role !== 'admin') {
      alert('管理者のみアクセス可能です')
      router.push('/dashboard')
      return
    }

    setIsAdmin(true)
    setLoading(false)
  }

  const fetchPlayers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, username, active, avatar_url')
      .eq('active', true)
      .order('username')

    if (data) setAllPlayers(data)
  }

  const fetchBatchHistory = async () => {
    try {
      const { data } = await supabase
        .from('game_sessions')
        .select(`
          *,
          profiles(username, avatar_url)
        `)
        .not('batch_id', 'is', null)
        .order('created_at', { ascending: false })

      if (data) {
        // batch_idでグループ化
        const grouped = new Map<string, any>()
        data.forEach(session => {
          if (!grouped.has(session.batch_id)) {
            grouped.set(session.batch_id, {
              batch_id: session.batch_id,
              created_at: session.created_at,
              created_by: session.created_by,
              player_count: 0,
              sessions: []
            })
          }
          const batch = grouped.get(session.batch_id)
          batch.player_count++
          batch.sessions.push(session)
        })

        setBatchHistory(Array.from(grouped.values()))
      }
    } catch (error) {
      console.error('Error fetching batch history:', error)
    }
  }

  const togglePlayer = (playerId: string) => {
    const newSelected = new Set(selectedPlayerIds)
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId)
    } else {
      if (newSelected.size >= 10) {
        alert('最大10名まで選択可能です')
        return
      }
      newSelected.add(playerId)
    }
    setSelectedPlayerIds(newSelected)
  }

  const proceedToInput = () => {
    if (selectedPlayerIds.size < 2) {
      alert('2名以上のプレイヤーを選択してください')
      return
    }

    const inputs: PlayerInput[] = Array.from(selectedPlayerIds).map(id => {
      const player = allPlayers.find(p => p.id === id)!
      return {
        userId: id,
        username: player.username,
        buyIn: 0,
        finalChips: 0,
        airLent: 0,
        airBorrowed: 0
      }
    })

    setPlayerInputs(inputs)
    setStep(2)
  }

  const updatePlayerInput = (index: number, field: keyof PlayerInput, value: number) => {
    const newInputs = [...playerInputs]
    newInputs[index] = { ...newInputs[index], [field]: Math.max(0, value) }
    setPlayerInputs(newInputs)
  }

  const adjustValue = (index: number, field: keyof PlayerInput, delta: number) => {
    const current = playerInputs[index][field] as number
    updatePlayerInput(index, field, current + delta)
  }

  // バリデーション
  const totalBuyIn = playerInputs.reduce((sum, p) => sum + p.buyIn, 0)
  const totalFinalChips = playerInputs.reduce((sum, p) => sum + p.finalChips, 0)
  const totalAirLent = playerInputs.reduce((sum, p) => sum + p.airLent, 0)
  const totalAirBorrowed = playerInputs.reduce((sum, p) => sum + p.airBorrowed, 0)
  
  const isBuyInValid = totalBuyIn === totalFinalChips && totalBuyIn > 0
  const isAirValid = totalAirLent === totalAirBorrowed
  const isValid = isBuyInValid && isAirValid

  // JP計算
  const totalJpContribution = playerInputs.reduce((sum, p) => sum + (p.finalChips % 1000), 0)

  const calculatePlayHours = () => {
    const [startH, startM] = startTime.split(':').map(Number)
    const [endH, endM] = endTime.split(':').map(Number)
    let startMin = startH * 60 + startM
    let endMin = endH * 60 + endM
    if (endMin < startMin) endMin += 24 * 60
    return Number(((endMin - startMin) / 60).toFixed(1))
  }

  const handleSave = async () => {
    if (!isValid) {
      alert('入力内容にエラーがあります')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const batchId = crypto.randomUUID()
      const playedAt = `${date}T${startTime}:00+09:00`
      const playHours = calculatePlayHours()

      // 各プレイヤーのセッションを作成
      const sessions = playerInputs.map(p => {
        const jpContribution = p.finalChips % 1000
        const cashOut = p.finalChips - jpContribution
        const profit = cashOut - p.buyIn

        return {
          user_id: p.userId,
          buy_in: p.buyIn,
          cash_out: cashOut,
          profit: profit,
          jackpot_contribution: jpContribution,
          air_lent: p.airLent,
          air_borrowed: p.airBorrowed,
          played_at: playedAt,
          start_time: startTime,
          end_time: endTime,
          play_hours: playHours,
          batch_id: batchId,
          created_by: user.id
        }
      })

      const { error } = await supabase
        .from('game_sessions')
        .insert(sessions)

      if (error) throw error

      // JPプールに積立
      if (totalJpContribution > 0) {
        const { data: jpData } = await supabase
          .from('jackpot_pool')
          .select('*')
          .limit(1)

        if (!jpData || jpData.length === 0) {
          await supabase.from('jackpot_pool').insert({ current_amount: totalJpContribution })
        } else {
          await supabase
            .from('jackpot_pool')
            .update({ current_amount: (jpData[0].current_amount || 0) + totalJpContribution })
            .eq('id', jpData[0].id)
        }
      }

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
      // リセット
      setSelectedPlayerIds(new Set())
      setPlayerInputs([])
      setStep(3)
      fetchBatchHistory()
    } catch (error) {
      console.error('Error saving batch:', error)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  const deleteBatch = async (batchId: string) => {
    if (!confirm('この一括登録を削除しますか？\n（ジャックポット積立は戻りません）')) return

    try {
      const { error } = await supabase
        .from('game_sessions')
        .delete()
        .eq('batch_id', batchId)

      if (error) throw error
      fetchBatchHistory()
    } catch (error) {
      console.error('Error deleting batch:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-32 w-32 border-b-4 border-violet-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container max-w-md mx-auto p-4 pb-20">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => step === 1 ? router.push('/dashboard') : setStep(step - 1)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all mb-4"
          >
            <ArrowLeft className="h-5 w-5 text-gray-900" />
          </button>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            <Users className="inline h-8 w-8 text-violet-600 mr-2" />
            Batch Report
          </h1>
          <p className="text-gray-900 mt-2 font-medium">一括記録（管理者専用）</p>
        </div>

        {/* 成功メッセージ */}
        {showSuccess && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-12 h-12 text-green-600" />
                <div>
                  <p className="font-black text-gray-900">一括登録完了！</p>
                  <p className="text-sm font-bold text-amber-600">JP +{totalJpContribution}P 積立</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* タブ */}
        <div className="flex gap-2 mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg">
          <button
            onClick={() => setStep(1)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              step === 1
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                : 'text-gray-900 hover:bg-gray-50'
            }`}
          >
            1. 選択
          </button>
          <button
            onClick={() => playerInputs.length > 0 && setStep(2)}
            disabled={playerInputs.length === 0}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              step === 2
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                : playerInputs.length > 0
                ? 'text-gray-900 hover:bg-gray-50'
                : 'text-gray-400 cursor-not-allowed'
            }`}
          >
            2. 入力
          </button>
          <button
            onClick={() => setStep(3)}
            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
              step === 3
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                : 'text-gray-900 hover:bg-gray-50'
            }`}
          >
            3. 履歴
          </button>
        </div>

        {/* Step 1: プレイヤー選択 */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-violet-100">
              <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-600" />
                参加プレイヤー ({selectedPlayerIds.size}/10名)
              </h2>
              <p className="text-sm text-gray-700 mb-4 font-medium">2名以上、最大10名まで選択可能</p>
              
              <div className="space-y-2">
                {allPlayers.map(player => (
                  <button
                    key={player.id}
                    onClick={() => togglePlayer(player.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all font-bold ${
                      selectedPlayerIds.has(player.id)
                        ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-lg scale-105'
                        : 'bg-gray-50 text-gray-900 hover:bg-gray-100 border border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{player.username}</span>
                      {selectedPlayerIds.has(player.id) && (
                        <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={proceedToInput}
              disabled={selectedPlayerIds.size < 2}
              className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                selectedPlayerIds.size >= 2
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              次へ：共通情報入力
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Step 2: 入力 */}
        {step === 2 && (
          <div className="space-y-4">
            {/* 共通情報 */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-indigo-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                共通情報
              </h2>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">日付</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900 font-semibold"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">開始</label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-900 mb-2">終了</label>
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-900 font-semibold"
                    />
                  </div>
                </div>

                <div className="bg-indigo-50 rounded-xl p-3 text-center border border-indigo-200">
                  <span className="text-sm font-bold text-gray-900">プレイ時間: </span>
                  <span className="text-lg font-black text-indigo-600">{calculatePlayHours()}h</span>
                </div>
              </div>
            </div>

            {/* 各プレイヤー入力 */}
            {playerInputs.map((player, idx) => {
              const jpAmount = player.finalChips % 1000
              const cashOut = player.finalChips - jpAmount
              const profit = cashOut - player.buyIn

              return (
                <div key={player.userId} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 border border-gray-200">
                  <h3 className="font-black text-gray-900 text-lg mb-3 truncate">
                    {idx + 1}. {player.username}
                  </h3>
                  
                  <div className="space-y-3">
                    {/* バイイン */}
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1">バイイン (P)</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => adjustValue(idx, 'buyIn', -1000)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 active:scale-95"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={player.buyIn}
                          onChange={(e) => updatePlayerInput(idx, 'buyIn', Number(e.target.value) || 0)}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-center font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600"
                        />
                        <button
                          onClick={() => adjustValue(idx, 'buyIn', 1000)}
                          className="px-3 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 最終チップ */}
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1">最終チップ (P)</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => adjustValue(idx, 'finalChips', -1000)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 active:scale-95"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={player.finalChips}
                          onChange={(e) => updatePlayerInput(idx, 'finalChips', Number(e.target.value) || 0)}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-center font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600"
                        />
                        <button
                          onClick={() => adjustValue(idx, 'finalChips', 1000)}
                          className="px-3 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* エアー貸出 */}
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1">エアー貸出 (P)</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => adjustValue(idx, 'airLent', -1000)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 active:scale-95"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={player.airLent}
                          onChange={(e) => updatePlayerInput(idx, 'airLent', Number(e.target.value) || 0)}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-center font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600"
                        />
                        <button
                          onClick={() => adjustValue(idx, 'airLent', 1000)}
                          className="px-3 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* エアー借入 */}
                    <div>
                      <label className="block text-xs font-bold text-gray-900 mb-1">エアー借入 (P)</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => adjustValue(idx, 'airBorrowed', -1000)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 active:scale-95"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={player.airBorrowed}
                          onChange={(e) => updatePlayerInput(idx, 'airBorrowed', Number(e.target.value) || 0)}
                          className="flex-1 px-3 py-2 border-2 border-gray-200 rounded-lg text-center font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-600"
                        />
                        <button
                          onClick={() => adjustValue(idx, 'airBorrowed', 1000)}
                          className="px-3 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* 収支表示 */}
                    {player.finalChips > 0 && player.buyIn > 0 && (
                      <div className="bg-gradient-to-r from-gray-50 to-violet-50 rounded-xl p-3 border border-violet-200">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-gray-700">JP積立:</span>
                          <span className="font-bold text-amber-600">-{jpAmount}P</span>
                        </div>
                        <div className="flex justify-between text-xs mb-2">
                          <span className="font-semibold text-gray-700">キャッシュアウト:</span>
                          <span className="font-bold text-gray-900">{cashOut.toLocaleString()}P</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-violet-300">
                          <span className="font-bold text-gray-900">収支:</span>
                          <span className={`text-xl font-black ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {profit >= 0 ? '+' : ''}{profit.toLocaleString()}P
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {/* バリデーション */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border-2 border-violet-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-violet-600" />
                入力チェック
              </h3>
              
              <div className="space-y-2">
                <div className={`flex items-center justify-between p-3 rounded-xl ${
                  isBuyInValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <span className="text-sm font-bold text-gray-900">バイイン = 最終チップ</span>
                  <div className="text-right">
                    <div className="text-xs text-gray-700 font-semibold">
                      {totalBuyIn.toLocaleString()} = {totalFinalChips.toLocaleString()}
                    </div>
                    {isBuyInValid ? (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 ml-auto" />
                    )}
                  </div>
                </div>

                <div className={`flex items-center justify-between p-3 rounded-xl ${
                  isAirValid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <span className="text-sm font-bold text-gray-900">エアー貸出 = 借入</span>
                  <div className="text-right">
                    <div className="text-xs text-gray-700 font-semibold">
                      {totalAirLent.toLocaleString()} = {totalAirBorrowed.toLocaleString()}
                    </div>
                    {isAirValid ? (
                      <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600 ml-auto" />
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-3 rounded-xl border border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      JP自動積立
                    </span>
                    <span className="text-lg font-black text-amber-600">
                      +{totalJpContribution.toLocaleString()}P
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 保存ボタン */}
            <button
              onClick={handleSave}
              disabled={!isValid || saving}
              className={`w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 ${
                isValid && !saving
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  保存中...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  一括登録を保存
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 3: 履歴 */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-indigo-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-indigo-600" />
                一括登録履歴
              </h2>

              {batchHistory.length === 0 ? (
                <p className="text-center text-gray-700 py-8 font-semibold">まだ履歴がありません</p>
              ) : (
                <div className="space-y-3">
                  {batchHistory.map(batch => {
                    const totalProfit = batch.sessions.reduce((sum: number, s: any) => sum + (s.profit || 0), 0)
                    const totalJp = batch.sessions.reduce((sum: number, s: any) => sum + (s.jackpot_contribution || 0), 0)
                    const date = new Date(batch.created_at).toLocaleDateString('ja-JP')

                    return (
                      <div key={batch.batch_id} className="bg-gradient-to-r from-violet-50 to-indigo-50 rounded-xl p-4 border border-violet-200">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-bold text-gray-900">{date}</div>
                            <div className="text-sm text-gray-700 font-semibold">{batch.player_count}名参加</div>
                          </div>
                          <button
                            onClick={() => deleteBatch(batch.batch_id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all active:scale-95"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                       <div className="space-y-2 mb-3">
                          {batch.sessions.map((s: any) => (
                            <div key={s.id} className="bg-white/50 rounded-lg p-2">
                              <div className="flex justify-between items-start mb-1">
                                <span className="font-bold text-gray-900 text-sm truncate">{s.profiles?.username}</span>
                                <span className={`font-black text-lg ${s.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  {s.profit >= 0 ? '+' : ''}{s.profit.toLocaleString()}
                                </span>
                              </div>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div className="flex justify-between">
                                  <span className="text-gray-600 font-semibold">IN:</span>
                                  <span className="text-gray-900 font-bold">{s.buy_in.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-600 font-semibold">OUT:</span>
                                  <span className="text-gray-900 font-bold">{s.cash_out.toLocaleString()}</span>
                                </div>
                                {(s.air_lent > 0 || s.air_borrowed > 0) && (
                                  <>
                                    <div className="flex justify-between">
                                      <span className="text-blue-600 font-semibold">エアー貸:</span>
                                      <span className="text-blue-700 font-bold">{s.air_lent.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-orange-600 font-semibold">エアー借:</span>
                                      <span className="text-orange-700 font-bold">{s.air_borrowed.toLocaleString()}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-violet-300">
                          <span className="text-sm font-bold text-gray-900">JP積立:</span>
                          <span className="text-sm font-black text-amber-600">+{totalJp.toLocaleString()}P</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setSelectedPlayerIds(new Set())
                setPlayerInputs([])
                setStep(1)
              }}
              className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
            >
              新しい一括登録を作成
            </button>
          </div>
        )}
      </div>
    </div>
  )
}