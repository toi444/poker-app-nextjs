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
  Eye,
  Skull,
  Zap,
  Shield,
  ArrowRightLeft,
  Calculator
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

interface Settlement {
  from: string
  to: string
  amount: number
}

// タイムゾーン対応の今日の日付
function getTodayDate() {
  const today = new Date()
  const year = today.getFullYear()
  const month = today.getMonth() + 1
  const day = today.getDate()
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

// エアー精算計算関数
function calculateAirSettlement(playerInputs: PlayerInput[]): Settlement[] {
  // 各プレイヤーの純収支を計算
  const balances = playerInputs.map(p => {
    const jpAmount = p.finalChips % 1000
    const cashOut = p.finalChips - jpAmount
    const profit = cashOut - p.buyIn
    return {
      userId: p.userId,
      username: p.username,
      balance: profit // 正なら受け取る側、負なら支払う側
    }
  })

  // 支払う側と受け取る側に分ける
  const payers = balances.filter(b => b.balance < 0).map(b => ({
    ...b,
    balance: -b.balance // 絶対値にする
  })).sort((a, b) => b.balance - a.balance) // 降順

  const receivers = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance) // 降順

  // 精算計算
  const settlements: Settlement[] = []
  let payerIndex = 0
  let receiverIndex = 0

  while (payerIndex < payers.length && receiverIndex < receivers.length) {
    const payer = payers[payerIndex]
    const receiver = receivers[receiverIndex]
    
    const amount = Math.min(payer.balance, receiver.balance)
    
    if (amount > 0) {
      settlements.push({
        from: payer.username,
        to: receiver.username,
        amount: Math.round(amount) // 整数に丸める
      })
    }

    payer.balance -= amount
    receiver.balance -= amount

    if (payer.balance === 0) payerIndex++
    if (receiver.balance === 0) receiverIndex++
  }

  return settlements
}

// JP負担計算関数
function calculateJpBurden(playerInputs: PlayerInput[], totalJpContribution: number): { username: string; burden: number }[] {
  const playerCount = playerInputs.length
  const baseAmount = Math.floor(totalJpContribution / playerCount / 50) * 50 // 50円単位で切り捨て
  const remainder = totalJpContribution - (baseAmount * playerCount)
  
  // 収支でソート（昇順 = 負け順）
  const sorted = [...playerInputs].sort((a, b) => {
    const profitA = (a.finalChips - (a.finalChips % 1000)) - a.buyIn
    const profitB = (b.finalChips - (b.finalChips % 1000)) - b.buyIn
    return profitA - profitB
  })

  return sorted.map((p, index) => ({
    username: p.username,
    burden: index === 0 ? baseAmount + remainder : baseAmount // 最下位が残りを負担
  }))
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
  
  // エアー精算オプション
  const [isAllAir, setIsAllAir] = useState(false)
  
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

  // エアー精算計算
  const airSettlements = isAllAir && isValid ? calculateAirSettlement(playerInputs) : []
  const jpBurdens = isAllAir && isValid && totalJpContribution > 0 
    ? calculateJpBurden(playerInputs, totalJpContribution) 
    : []

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
      setIsAllAir(false)
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="w-10 h-10 text-purple-500 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* 背景エフェクト */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-950/20 via-black to-indigo-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* ヘッダー */}
      <div className="relative bg-black/80 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-50 shadow-lg shadow-purple-500/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => step === 1 ? router.push('/dashboard') : setStep(step - 1)}
              className="w-10 h-10 rounded-full bg-white/5 border-2 border-purple-500/30 flex items-center justify-center hover:bg-white/10 hover:border-purple-500/50 transition-all hover:scale-110"
            >
              <ArrowLeft className="w-4 h-4 text-purple-400" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600 blur-xl animate-pulse" />
                <Users className="relative w-8 h-8 text-purple-500 drop-shadow-glow" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent animate-shimmer">
                  一括記録登録
                </h1>
                <p className="text-xs text-purple-400/60 font-mono">管理者専用・複数プレイヤー</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8 pb-20">
        {/* 成功メッセージ */}
        {showSuccess && (
          <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-75 animate-pulse" />
              <div className="relative bg-black/90 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-2 border-green-500/50">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-600 blur-lg animate-pulse" />
                    <CheckCircle className="relative w-12 h-12 text-green-400 drop-shadow-glow" />
                  </div>
                  <div>
                    <p className="font-black text-white text-lg drop-shadow-glow">一括登録完了！</p>
                    <p className="text-sm font-bold text-yellow-400 font-mono">JP +{totalJpContribution}P 積立</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* タブメニュー */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 rounded-2xl blur-xl" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-2 border-2 border-purple-500/20 shadow-2xl">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 1, label: '選択', icon: Users, glow: 'purple' },
                { id: 2, label: '入力', icon: DollarSign, glow: 'cyan', disabled: playerInputs.length === 0 },
                { id: 3, label: '履歴', icon: Eye, glow: 'pink' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => !tab.disabled && setStep(tab.id)}
                  disabled={tab.disabled}
                  className={`relative group px-4 py-4 rounded-xl font-black text-sm transition-all ${
                    step === tab.id
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/50'
                      : tab.disabled
                      ? 'text-gray-600 cursor-not-allowed'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {step === tab.id && (
                    <div className={`absolute inset-0 bg-${tab.glow}-600 blur-xl opacity-50 rounded-xl`} />
                  )}
                  <div className="relative flex items-center justify-center gap-2">
                    <tab.icon className={`w-4 h-4 ${step === tab.id ? 'drop-shadow-glow' : ''}`} />
                    {tab.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Step 1: プレイヤー選択 */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-purple-500/30 shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-purple-500 drop-shadow-glow" />
                    <h2 className="text-lg font-black text-white">参加プレイヤー選択</h2>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 bg-cyan-600 blur-lg opacity-50" />
                    <div className="relative bg-black/40 backdrop-blur-sm rounded-xl px-4 py-2 border-2 border-cyan-500/50">
                      <span className="text-2xl font-black text-cyan-400 font-mono drop-shadow-glow">
                        {selectedPlayerIds.size}/10
                      </span>
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-gray-400 mb-6 font-mono">2名以上、最大10名まで選択可能</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {allPlayers.map(player => (
                    <button
                      key={player.id}
                      onClick={() => togglePlayer(player.id)}
                      className={`relative group p-4 rounded-xl text-left transition-all font-bold border-2 ${
                        selectedPlayerIds.has(player.id)
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 border-purple-400 shadow-lg shadow-purple-500/50 scale-105'
                          : 'bg-white/5 border-gray-700/50 hover:bg-white/10 hover:border-gray-600/50'
                      }`}
                    >
                      {selectedPlayerIds.has(player.id) && (
                        <div className="absolute inset-0 bg-purple-600 blur-lg opacity-50 rounded-xl" />
                      )}
                      <div className="relative flex items-center justify-between">
                        <span className={`truncate font-mono ${
                          selectedPlayerIds.has(player.id) ? 'text-white drop-shadow-glow' : 'text-gray-300'
                        }`}>
                          {player.username}
                        </span>
                        {selectedPlayerIds.has(player.id) && (
                          <CheckCircle className="w-4 h-4 flex-shrink-0 text-white drop-shadow-glow" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
              <button
                onClick={proceedToInput}
                disabled={selectedPlayerIds.size < 2}
                className={`relative w-full py-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 ${
                  selectedPlayerIds.size >= 2
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-2xl hover:scale-105 active:scale-95'
                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                }`}
              >
                <span className="relative">次へ：共通情報入力</span>
                <ArrowRight className="relative w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 入力 */}
        {step === 2 && (
          <div className="space-y-6">
            {/* 共通情報 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-cyan-500/30 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <Calendar className="w-6 h-6 text-cyan-500 drop-shadow-glow" />
                  <h2 className="text-lg font-black text-white">共通情報</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">日付</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/40 border-2 border-cyan-500/30 text-white text-sm focus:border-cyan-500 focus:outline-none transition-all backdrop-blur-sm font-mono"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">開始時刻</label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-black/40 border-2 border-cyan-500/30 text-white text-sm focus:border-cyan-500 focus:outline-none transition-all backdrop-blur-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">終了時刻</label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl bg-black/40 border-2 border-cyan-500/30 text-white text-sm focus:border-cyan-500 focus:outline-none transition-all backdrop-blur-sm font-mono"
                      />
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-cyan-600 blur-lg opacity-50" />
                    <div className="relative bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-4 text-center border-2 border-cyan-400/50 shadow-lg">
                      <span className="text-sm font-bold text-white/80 font-mono">プレイ時間: </span>
                      <span className="text-2xl font-black text-white drop-shadow-glow font-mono">{calculatePlayHours()}h</span>
                    </div>
                  </div>

                  {/* エアー精算オプション */}
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 rounded-xl blur-lg opacity-30" />
                    <label className="relative flex items-center gap-3 p-4 rounded-xl bg-black/40 border-2 border-orange-500/30 cursor-pointer hover:bg-black/60 transition-all">
                      <input
                        type="checkbox"
                        checked={isAllAir}
                        onChange={(e) => setIsAllAir(e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-orange-500/50 bg-black/40 checked:bg-orange-600 checked:border-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all cursor-pointer"
                      />
                      <div className="flex items-center gap-2">
                        <ArrowRightLeft className="w-5 h-5 text-orange-400" />
                        <span className="font-black text-white font-mono">すべてのプレイがエアーの場合</span>
                      </div>
                    </label>
                    {isAllAir && (
                      <p className="mt-2 text-xs text-orange-400 font-mono pl-4">
                        ✓ エアー精算とJP負担を自動計算して表示します（参考用）
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 各プレイヤー入力 */}
            {playerInputs.map((player, idx) => {
              const jpAmount = player.finalChips % 1000
              const cashOut = player.finalChips - jpAmount
              const profit = cashOut - player.buyIn

              return (
                <div key={player.userId} className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-30" />
                  <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/30 shadow-2xl">
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="absolute inset-0 bg-purple-600 blur-lg opacity-50" />
                          <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center border-2 border-purple-400 shadow-lg">
                            <span className="text-white font-black text-lg drop-shadow-glow font-mono">{idx + 1}</span>
                          </div>
                        </div>
                        <h3 className="font-black text-white text-lg truncate font-mono drop-shadow-glow">
                          {player.username}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* バイイン */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">バイイン (P)</label>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => adjustValue(idx, 'buyIn', -1000)}
                            className="relative group px-3 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-black hover:shadow-lg hover:shadow-red-500/50 transition-all active:scale-95 border-2 border-red-400/50"
                          >
                            <div className="absolute inset-0 bg-red-600 blur-lg opacity-0 group-hover:opacity-50 rounded-xl transition-opacity" />
                            <Minus className="relative w-4 h-4 drop-shadow-glow" />
                          </button>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={player.buyIn || ''}
                            onChange={(e) => updatePlayerInput(idx, 'buyIn', Number(e.target.value) || 0)}
                            className="flex-1 min-w-0 px-2 py-2.5 border-2 border-purple-500/30 rounded-xl text-center font-black text-white text-base bg-black/40 focus:outline-none focus:border-purple-500 transition-all backdrop-blur-sm font-mono"
                            placeholder="0"
                          />
                          <button
                            onClick={() => adjustValue(idx, 'buyIn', 1000)}
                            className="relative group px-3 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-black hover:shadow-lg hover:shadow-green-500/50 transition-all active:scale-95 border-2 border-green-400/50"
                          >
                            <div className="absolute inset-0 bg-green-600 blur-lg opacity-0 group-hover:opacity-50 rounded-xl transition-opacity" />
                            <Plus className="relative w-4 h-4 drop-shadow-glow" />
                          </button>
                        </div>
                      </div>

                      {/* 最終チップ */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">最終チップ (P)</label>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => adjustValue(idx, 'finalChips', -1000)}
                            className="relative group px-3 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-black hover:shadow-lg hover:shadow-red-500/50 transition-all active:scale-95 border-2 border-red-400/50"
                          >
                            <div className="absolute inset-0 bg-red-600 blur-lg opacity-0 group-hover:opacity-50 rounded-xl transition-opacity" />
                            <Minus className="relative w-4 h-4 drop-shadow-glow" />
                          </button>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={player.finalChips || ''}
                            onChange={(e) => updatePlayerInput(idx, 'finalChips', Number(e.target.value) || 0)}
                            className="flex-1 min-w-0 px-2 py-2.5 border-2 border-purple-500/30 rounded-xl text-center font-black text-white text-base bg-black/40 focus:outline-none focus:border-purple-500 transition-all backdrop-blur-sm font-mono"
                            placeholder="0"
                          />
                          <button
                            onClick={() => adjustValue(idx, 'finalChips', 1000)}
                            className="relative group px-3 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-black hover:shadow-lg hover:shadow-green-500/50 transition-all active:scale-95 border-2 border-green-400/50"
                          >
                            <div className="absolute inset-0 bg-green-600 blur-lg opacity-0 group-hover:opacity-50 rounded-xl transition-opacity" />
                            <Plus className="relative w-4 h-4 drop-shadow-glow" />
                          </button>
                        </div>
                      </div>

                      {/* エアー貸出 */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">エアー貸出 (P)</label>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => adjustValue(idx, 'airLent', -1000)}
                            className="relative group px-3 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-black hover:shadow-lg hover:shadow-red-500/50 transition-all active:scale-95 border-2 border-red-400/50"
                          >
                            <div className="absolute inset-0 bg-red-600 blur-lg opacity-0 group-hover:opacity-50 rounded-xl transition-opacity" />
                            <Minus className="relative w-4 h-4 drop-shadow-glow" />
                          </button>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={player.airLent || ''}
                            onChange={(e) => updatePlayerInput(idx, 'airLent', Number(e.target.value) || 0)}
                            className="flex-1 min-w-0 px-2 py-2.5 border-2 border-purple-500/30 rounded-xl text-center font-black text-white text-base bg-black/40 focus:outline-none focus:border-purple-500 transition-all backdrop-blur-sm font-mono"
                            placeholder="0"
                          />
                          <button
                            onClick={() => adjustValue(idx, 'airLent', 1000)}
                            className="relative group px-3 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-black hover:shadow-lg hover:shadow-green-500/50 transition-all active:scale-95 border-2 border-green-400/50"
                          >
                            <div className="absolute inset-0 bg-green-600 blur-lg opacity-0 group-hover:opacity-50 rounded-xl transition-opacity" />
                            <Plus className="relative w-4 h-4 drop-shadow-glow" />
                          </button>
                        </div>
                      </div>

                      {/* エアー借入 */}
                      <div>
                        <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">エアー借入 (P)</label>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => adjustValue(idx, 'airBorrowed', -1000)}
                            className="relative group px-3 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-black hover:shadow-lg hover:shadow-red-500/50 transition-all active:scale-95 border-2 border-red-400/50"
                          >
                            <div className="absolute inset-0 bg-red-600 blur-lg opacity-0 group-hover:opacity-50 rounded-xl transition-opacity" />
                            <Minus className="relative w-4 h-4 drop-shadow-glow" />
                          </button>
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={player.airBorrowed || ''}
                            onChange={(e) => updatePlayerInput(idx, 'airBorrowed', Number(e.target.value) || 0)}
                            className="flex-1 min-w-0 px-2 py-2.5 border-2 border-purple-500/30 rounded-xl text-center font-black text-white text-base bg-black/40 focus:outline-none focus:border-purple-500 transition-all backdrop-blur-sm font-mono"
                            placeholder="0"
                          />
                          <button
                            onClick={() => adjustValue(idx, 'airBorrowed', 1000)}
                            className="relative group px-3 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-black hover:shadow-lg hover:shadow-green-500/50 transition-all active:scale-95 border-2 border-green-400/50"
                          >
                            <div className="absolute inset-0 bg-green-600 blur-lg opacity-0 group-hover:opacity-50 rounded-xl transition-opacity" />
                            <Plus className="relative w-4 h-4 drop-shadow-glow" />
                          </button>
                        </div>
                      </div>

                      {/* 収支表示 */}
                      {player.finalChips > 0 && player.buyIn > 0 && (
                        <div className="relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50" />
                          <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-500/30">
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-bold text-gray-400 font-mono">JP積立:</span>
                              <span className="font-black text-yellow-400 font-mono drop-shadow-glow">-{jpAmount}P</span>
                            </div>
                            <div className="flex justify-between text-sm mb-3">
                              <span className="font-bold text-gray-400 font-mono">キャッシュアウト:</span>
                              <span className="font-black text-white font-mono">{cashOut.toLocaleString()}P</span>
                            </div>
                            <div className="relative pt-3 border-t border-purple-500/30">
                              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                              <div className="flex justify-between items-center">
                                <span className="font-black text-white font-mono">収支:</span>
                                <div className="relative">
                                  <div className={`absolute inset-0 ${profit >= 0 ? 'bg-green-600' : 'bg-red-600'} blur-lg opacity-50`} />
                                  <span className={`relative text-2xl font-black font-mono drop-shadow-glow ${profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {profit >= 0 ? '+' : ''}{profit.toLocaleString()}P
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

            {/* バリデーション */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-yellow-500/30 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <AlertCircle className="w-6 h-6 text-yellow-500 drop-shadow-glow animate-pulse" />
                  <h3 className="font-black text-white font-mono">入力チェック</h3>
                </div>
                
                <div className="space-y-3">
                  <div className={`relative group p-4 rounded-xl border-2 ${
                    isBuyInValid 
                      ? 'bg-green-950/30 border-green-500/50' 
                      : 'bg-red-950/30 border-red-500/50'
                  }`}>
                    {isBuyInValid && <div className="absolute inset-0 bg-green-600 blur-lg opacity-30 rounded-xl" />}
                    {!isBuyInValid && <div className="absolute inset-0 bg-red-600 blur-lg opacity-30 rounded-xl" />}
                    <div className="relative flex items-center justify-between">
                      <span className="text-sm font-bold text-white font-mono">バイイン = 最終チップ</span>
                      <div className="text-right">
                        <div className="text-xs text-gray-400 font-mono mb-1">
                          {totalBuyIn.toLocaleString()} = {totalFinalChips.toLocaleString()}
                        </div>
                        {isBuyInValid ? (
                          <CheckCircle className="w-6 h-6 text-green-400 ml-auto drop-shadow-glow" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-red-400 ml-auto drop-shadow-glow" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={`relative group p-4 rounded-xl border-2 ${
                    isAirValid 
                      ? 'bg-green-950/30 border-green-500/50' 
                      : 'bg-red-950/30 border-red-500/50'
                  }`}>
                    {isAirValid && <div className="absolute inset-0 bg-green-600 blur-lg opacity-30 rounded-xl" />}
                    {!isAirValid && <div className="absolute inset-0 bg-red-600 blur-lg opacity-30 rounded-xl" />}
                    <div className="relative flex items-center justify-between">
                      <span className="text-sm font-bold text-white font-mono">エアー貸出 = 借入</span>
                      <div className="text-right">
                        <div className="text-xs text-gray-400 font-mono mb-1">
                          {totalAirLent.toLocaleString()} = {totalAirBorrowed.toLocaleString()}
                        </div>
                        {isAirValid ? (
                          <CheckCircle className="w-6 h-6 text-green-400 ml-auto drop-shadow-glow" />
                        ) : (
                          <AlertCircle className="w-6 h-6 text-red-400 ml-auto drop-shadow-glow" />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-xl blur-lg opacity-75 animate-pulse" />
                    <div className="relative bg-gradient-to-r from-yellow-600 to-amber-600 p-4 rounded-xl border-2 border-yellow-400/50 shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-white flex items-center gap-2 font-mono">
                          <Sparkles className="w-4 h-4 drop-shadow-glow" />
                          JP自動積立
                        </span>
                        <span className="text-2xl font-black text-white drop-shadow-glow font-mono">
                          +{totalJpContribution.toLocaleString()}P
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* エアー精算表示 */}
            {isAllAir && isValid && airSettlements.length > 0 && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl blur-xl opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-orange-500/30 shadow-2xl">
                  <div className="flex items-center gap-2 mb-6">
                    <Calculator className="w-6 h-6 text-orange-500 drop-shadow-glow" />
                    <h3 className="font-black text-white font-mono">エアー精算（参考）</h3>
                  </div>
                  
                  <div className="space-y-3 mb-6">
                    {airSettlements.map((settlement, idx) => (
                      <div key={idx} className="relative group">
                        <div className="absolute inset-0 bg-orange-600 blur-lg opacity-20 rounded-xl" />
                        <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 border-orange-500/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <ArrowRight className="w-5 h-5 text-orange-400" />
                              <div>
                                <span className="font-black text-white font-mono">{settlement.from}</span>
                                <span className="text-gray-400 mx-2">→</span>
                                <span className="font-black text-white font-mono">{settlement.to}</span>
                              </div>
                            </div>
                            <span className="text-xl font-black text-orange-400 font-mono">
                              {settlement.amount.toLocaleString()}P
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {jpBurdens.length > 0 && (
                    <>
                      <div className="relative mb-4">
                        <div className="absolute inset-0 h-px bg-gradient-to-r from-transparent via-orange-500 to-transparent" />
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="w-5 h-5 text-yellow-500 drop-shadow-glow" />
                        <h4 className="font-black text-white text-sm font-mono">JP負担（均等割）</h4>
                      </div>
                      
                      <div className="space-y-2">
                        {jpBurdens.map((burden, idx) => (
                          <div key={idx} className="relative group">
                            <div className="absolute inset-0 bg-yellow-600 blur-lg opacity-10 rounded-lg" />
                            <div className="relative bg-black/30 backdrop-blur-sm rounded-lg p-3 border border-yellow-500/20">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-300 font-mono text-sm">{burden.username}</span>
                                <span className="font-black text-yellow-400 font-mono">
                                  {burden.burden.toLocaleString()}P
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <p className="mt-4 text-xs text-gray-400 font-mono">
                        ※ 50円単位で割り切れない場合、順位が最下位のプレイヤーが残額を負担
                      </p>
                    </>
                  )}
                  
                  <p className="mt-6 text-xs text-orange-400/80 font-mono border-t border-orange-500/20 pt-4">
                    ℹ️ この精算内容は参考情報です。記録には反映されません。
                  </p>
                </div>
              </div>
            )}

            {/* 保存ボタン */}
            <div className="relative group">
              <div className={`absolute inset-0 rounded-xl blur-lg transition-opacity ${
                isValid && !saving
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 opacity-75 group-hover:opacity-100'
                  : 'bg-gray-600 opacity-30'
              }`} />
              <button
                onClick={handleSave}
                disabled={!isValid || saving}
                className={`relative w-full py-5 rounded-xl font-black transition-all flex items-center justify-center gap-3 border-2 ${
                  isValid && !saving
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-2xl hover:scale-105 active:scale-95'
                    : 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
                }`}
              >
                {saving ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="text-lg font-mono">保存中...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-6 h-6 drop-shadow-glow" />
                    <span className="text-lg drop-shadow-glow font-mono">一括登録を保存</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 履歴 */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-pink-500/30 shadow-2xl">
                <div className="p-6 border-b border-pink-500/20">
                  <div className="flex items-center gap-2">
                    <Eye className="w-6 h-6 text-pink-500 drop-shadow-glow" />
                    <h2 className="text-lg font-black text-white">一括登録履歴</h2>
                  </div>
                </div>

                {batchHistory.length === 0 ? (
                  <div className="p-12 text-center">
                    <Skull className="w-16 h-16 text-gray-600 mx-auto mb-4 opacity-50" />
                    <p className="text-gray-500 font-bold font-mono">まだ履歴がありません</p>
                  </div>
                ) : (
                  <div className="divide-y divide-pink-500/10">
                    {batchHistory.map(batch => {
                      const totalProfit = batch.sessions.reduce((sum: number, s: any) => sum + (s.profit || 0), 0)
                      const totalJp = batch.sessions.reduce((sum: number, s: any) => sum + (s.jackpot_contribution || 0), 0)
                      const date = new Date(batch.created_at).toLocaleDateString('ja-JP')

                      return (
                        <div key={batch.batch_id} className="p-5 hover:bg-white/5 transition-all">
                          <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-xl blur-lg opacity-20" />
                            <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-5 border-2 border-pink-500/30">
                              <div className="flex items-start justify-between mb-5">
                                <div>
                                  <div className="font-black text-white text-lg font-mono mb-1">{date}</div>
                                  <div className="text-sm text-pink-400 font-bold font-mono">{batch.player_count}名参加</div>
                                </div>
                                <button
                                  onClick={() => deleteBatch(batch.batch_id)}
                                  className="relative group p-3 hover:bg-red-600/20 rounded-xl transition-all border-2 border-red-500/20 hover:border-red-500/50"
                                >
                                  <div className="absolute inset-0 bg-red-600 blur-lg opacity-0 group-hover:opacity-50 rounded-xl transition-opacity" />
                                  <Trash2 className="relative w-4 h-4 text-red-500" />
                                </button>
                              </div>

                              <div className="space-y-3 mb-5">
                                {batch.sessions.map((s: any) => (
                                  <div key={s.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                                    <div className="flex justify-between items-start mb-2">
                                      <span className="font-bold text-white text-sm truncate font-mono">{s.profiles?.username}</span>
                                      <div className="relative">
                                        <div className={`absolute inset-0 ${s.profit >= 0 ? 'bg-green-600' : 'bg-red-600'} blur-lg opacity-50`} />
                                        <span className={`relative font-black text-lg font-mono drop-shadow-glow ${s.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                          {s.profit >= 0 ? '+' : ''}{s.profit.toLocaleString()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-gray-500 font-mono">IN:</span>
                                        <span className="text-gray-300 font-bold font-mono">{s.buy_in.toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-gray-500 font-mono">OUT:</span>
                                        <span className="text-gray-300 font-bold font-mono">{s.cash_out.toLocaleString()}</span>
                                      </div>
                                      {(s.air_lent > 0 || s.air_borrowed > 0) && (
                                        <>
                                          <div className="flex justify-between">
                                            <span className="text-cyan-500 font-mono">貸:</span>
                                            <span className="text-cyan-400 font-bold font-mono">{s.air_lent.toLocaleString()}</span>
                                          </div>
                                          <div className="flex justify-between">
                                            <span className="text-orange-500 font-mono">借:</span>
                                            <span className="text-orange-400 font-bold font-mono">{s.air_borrowed.toLocaleString()}</span>
                                          </div>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              <div className="relative pt-4 border-t border-pink-500/30">
                                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-pink-500 to-transparent" />
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-bold text-white font-mono">JP積立:</span>
                                  <div className="relative">
                                    <div className="absolute inset-0 bg-yellow-600 blur-lg opacity-50" />
                                    <span className="relative text-lg font-black text-yellow-400 font-mono drop-shadow-glow">
                                      +{totalJp.toLocaleString()}P
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
              <button
                onClick={() => {
                  setSelectedPlayerIds(new Set())
                  setPlayerInputs([])
                  setIsAllAir(false)
                  setStep(1)
                }}
                className="relative w-full py-5 rounded-xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all border-2 border-purple-400 flex items-center justify-center gap-3"
              >
                <Plus className="w-6 h-6 drop-shadow-glow" />
                <span className="text-lg drop-shadow-glow font-mono">新しい一括登録を作成</span>
              </button>
            </div>
          </div>
        )}
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