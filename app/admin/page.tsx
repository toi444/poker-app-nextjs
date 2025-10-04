'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, Settings, DollarSign, Users, TrendingUp,
  Trash2, Plus, Edit, Save, X, AlertTriangle, 
  Shield, ShieldOff, Mail, Key,
  Trophy, CreditCard, Calendar, ChevronRight, Sparkles, Skull
} from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('jackpot')
  
  // ジャックポット
  const [currentJackpot, setCurrentJackpot] = useState(0)
  const [jackpotAdjustment, setJackpotAdjustment] = useState('')
  const [jackpotWinners, setJackpotWinners] = useState<any[]>([])
  
  // ジャックポット獲得者登録用
  const [newWinner, setNewWinner] = useState({
    username: '',
    amount: '',
    hand_type: 'ストレートフラッシュ',
    hand_cards: '',
    board_cards: ''
  })
  
  // プレイヤー
  const [players, setPlayers] = useState<any[]>([])
  const [editingPlayer, setEditingPlayer] = useState<any>(null)
  const [newPlayer, setNewPlayer] = useState({
    email: '',
    username: '',
    password: '',
    role: 'player'
  })
  
  // パスワード変更用
  const [passwordChange, setPasswordChange] = useState<{[key: string]: string}>({})
  const [showPasswordChange, setShowPasswordChange] = useState<{[key: string]: boolean}>({})
  
  // 削除確認
  const [deleteConfirm, setDeleteConfirm] = useState({
    pbank: false,
    sessions: false,
    jackpot: false
  })

  useEffect(() => {
    checkAdminAuth()
  }, [])

  useEffect(() => {
    setNewPlayer({
      email: '',
      username: '',
      password: '',
      role: 'player'
    })
  }, [])

  const checkAdminAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      if (user.email === 'toui.reigetsu@gmail.com') {
        setUser(user)
        loadAllData()
        return
      }

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role !== 'admin') {
          alert('管理者権限がありません')
          router.push('/dashboard')
          return
        }
      } catch (profileError) {
        console.log('Profile check skipped due to error, using email-based check')
      }

      setUser(user)
      loadAllData()
    } catch (error) {
      console.error('Auth error:', error)
      router.push('/login')
    }
  }

  const loadAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchJackpot(),
        fetchJackpotWinners(),
        fetchPlayers()
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchJackpot = async () => {
    try {
      const { data } = await supabase
        .from('jackpot_pool')
        .select('current_amount')
        .single()
      
      if (data) {
        setCurrentJackpot(data.current_amount || 0)
      }
    } catch (error) {
      console.error('Jackpot fetch error:', error)
    }
  }

  const fetchJackpotWinners = async () => {
    try {
      const { data, error } = await supabase
        .from('jackpot_winners')
        .select(`
          id,
          user_id,
          amount,
          hand_type,
          hand_cards,
          board_cards,
          created_at,
          profiles!inner(username, active)
        `)
        .eq('profiles.active', true)
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Jackpot winners fetch error:', error)
        setJackpotWinners([])
        return
      }
      
      setJackpotWinners(data || [])
    } catch (error) {
      console.error('Jackpot winners fetch error:', error)
      setJackpotWinners([])
    }
  }

  const fetchPlayers = async () => {
    try {
      console.log('Fetching players...')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Fetch error:', error)
        alert(`プレイヤー取得エラー: ${error.message}`)
      } else {
        console.log('Players fetched:', data)
        setPlayers(data || [])
      }
    } catch (error) {
      console.error('Players fetch error:', error)
    }
  }

  const registerJackpotWinner = async () => {
    if (!newWinner.username || !newWinner.amount || !newWinner.hand_cards || !newWinner.board_cards) {
      alert('すべての項目を入力してください')
      return
    }

    const amount = parseInt(newWinner.amount)
    if (isNaN(amount) || amount <= 0) {
      alert('有効な金額を入力してください')
      return
    }

    try {
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', newWinner.username)
        .maybeSingle()

      if (userError) {
        console.error('User search error:', userError)
        alert(`ユーザー検索エラー: ${userError.message}`)
        return
      }

      if (!userData) {
        alert('ユーザーが見つかりません')
        return
      }

      const { data: winnerData, error: winnerError } = await supabase
        .from('jackpot_winners')
        .insert({
          user_id: userData.id,
          amount: amount,
          hand_type: newWinner.hand_type,
          hand_cards: newWinner.hand_cards,
          board_cards: newWinner.board_cards,
          payout_percentage: 100
        })
        .select()

      if (winnerError) {
        console.error('Winner insert error:', winnerError)
        alert(`登録エラー: ${winnerError.message}`)
        return
      }

      try {
        const { data: poolData, error: poolError } = await supabase
          .from('jackpot_pool')
          .select('id, current_amount')
          .single()

        if (poolError || !poolData) {
          console.error('Pool fetch error:', poolError)
          const { error: createError } = await supabase
            .from('jackpot_pool')
            .insert({
              current_amount: 0
            })
          
          if (createError) {
            console.error('Pool creation error:', createError)
          }
        } else {
          const newJackpotAmount = Math.max(0, (poolData.current_amount || 0) - amount)
          const { error: updateError } = await supabase
            .from('jackpot_pool')
            .update({ 
              current_amount: newJackpotAmount,
              updated_at: new Date().toISOString()
            })
            .eq('id', poolData.id)

          if (updateError) {
            console.error('Pool update error:', updateError)
          }
        }
      } catch (poolError) {
        console.error('Pool operation error:', poolError)
      }

      alert('ジャックポット獲得者を登録しました！')
      
      setNewWinner({
        username: '',
        amount: '',
        hand_type: 'ストレートフラッシュ',
        hand_cards: '',
        board_cards: ''
      })
      
      fetchJackpot()
      fetchJackpotWinners()
      
    } catch (error) {
      console.error('Register winner error:', error)
      alert('登録に失敗しました')
    }
  }

  const deleteJackpotWinner = async (winnerId: string) => {
    if (!confirm('このジャックポット記録を削除しますか？')) return

    try {
      const { error } = await supabase
        .from('jackpot_winners')
        .delete()
        .eq('id', winnerId)

      if (error) throw error

      alert('削除しました')
      fetchJackpotWinners()
    } catch (error) {
      console.error('Delete winner error:', error)
      alert('削除に失敗しました')
    }
  }

  const updateJackpot = async () => {
    const adjustment = parseInt(jackpotAdjustment)
    if (isNaN(adjustment)) {
      alert('数値を入力してください')
      return
    }

    try {
      const newAmount = Math.max(0, currentJackpot + adjustment)
      
      const { error } = await supabase
        .from('jackpot_pool')
        .update({ 
          current_amount: newAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', await getJackpotId())

      if (error) throw error

      try {
        await supabase
          .from('jackpot_transactions')
          .insert({
            type: adjustment > 0 ? 'admin_add' : 'admin_subtract',
            amount: Math.abs(adjustment),
            notes: `管理者による調整: ${adjustment > 0 ? '+' : ''}${adjustment}P`
          })
      } catch (transError) {
        console.log('Transaction recording skipped:', transError)
      }

      setCurrentJackpot(newAmount)
      setJackpotAdjustment('')
      alert('ジャックポット金額を更新しました')
    } catch (error) {
      console.error('Jackpot update error:', error)
      alert('更新に失敗しました')
    }
  }

  const getJackpotId = async () => {
    const { data } = await supabase
      .from('jackpot_pool')
      .select('id')
      .single()
    return data?.id
  }

  const deleteAllPBankData = async () => {
    if (!deleteConfirm.pbank) {
      alert('削除確認にチェックを入れてください')
      return
    }

    if (!confirm('本当にP-BANKの全データを削除しますか？この操作は取り消せません。')) {
      return
    }

    try {
      await supabase.from('loan_applications').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('interest_records').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('loans').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      
      alert('P-BANKデータを全削除しました')
      setDeleteConfirm({ ...deleteConfirm, pbank: false })
    } catch (error) {
      console.error('Delete error:', error)
      alert('削除に失敗しました')
    }
  }

  const deleteAllGameSessions = async () => {
    if (!deleteConfirm.sessions) {
      alert('削除確認にチェックを入れてください')
      return
    }

    if (!confirm('本当に全ゲームセッションを削除しますか？この操作は取り消せません。')) {
      return
    }

    try {
      await supabase.from('game_sessions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      
      alert('全ゲームセッションを削除しました')
      setDeleteConfirm({ ...deleteConfirm, sessions: false })
    } catch (error) {
      console.error('Delete error:', error)
      alert('削除に失敗しました')
    }
  }

  const resetJackpot = async () => {
    if (!deleteConfirm.jackpot) {
      alert('削除確認にチェックを入れてください')
      return
    }

    if (!confirm('本当にジャックポットをリセットしますか？')) {
      return
    }

    try {
      await supabase
        .from('jackpot_pool')
        .update({ 
          current_amount: 0,
          updated_at: new Date().toISOString()
        })
        .eq('id', await getJackpotId())

      await supabase.from('jackpot_winners').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      
      try {
        await supabase.from('jackpot_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      } catch (transError) {
        console.log('Transaction deletion skipped:', transError)
      }
      
      setCurrentJackpot(0)
      setJackpotWinners([])
      alert('ジャックポットをリセットしました')
      setDeleteConfirm({ ...deleteConfirm, jackpot: false })
    } catch (error) {
      console.error('Reset error:', error)
      alert('リセットに失敗しました')
    }
  }

  const createPlayer = async () => {
    if (!newPlayer.email || !newPlayer.username || !newPlayer.password) {
      alert('すべての項目を入力してください')
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newPlayer.email)) {
      alert('有効なメールアドレスを入力してください')
      return
    }

    if (newPlayer.password.length < 6) {
      alert('パスワードは6文字以上にしてください')
      return
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newPlayer.email,
        password: newPlayer.password,
        options: {
          data: {
            username: newPlayer.username
          },
          emailRedirectTo: undefined
        }
      })

      if (authError) throw authError

      if (authData.user) {
        await supabase
          .from('profiles')
          .update({
            username: newPlayer.username,
            role: newPlayer.role,
            email: newPlayer.email
          })
          .eq('id', authData.user.id)
      }

      alert('プレイヤーを作成しました')
      setNewPlayer({ email: '', username: '', password: '', role: 'player' })
      fetchPlayers()
    } catch (error: any) {
      console.error('Create player error:', error)
      if (error.message?.includes('already registered')) {
        alert('このメールアドレスは既に登録されています')
      } else {
        alert(error.message || '作成に失敗しました')
      }
    }
  }

  const updatePlayer = async (playerId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', playerId)

      if (error) throw error

      alert('プレイヤー情報を更新しました')
      setEditingPlayer(null)
      fetchPlayers()
    } catch (error) {
      console.error('Update player error:', error)
      alert('更新に失敗しました')
    }
  }

  const togglePlayerActive = async (playerId: string, currentStatus: boolean) => {
    try {
      const newStatus = !currentStatus
      
      const { error } = await supabase
        .from('profiles')
        .update({
          active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', playerId)

      if (error) throw error

      fetchPlayers()
      alert(`ユーザーを${newStatus ? 'アクティブ' : '非アクティブ'}にしました`)
    } catch (error) {
      console.error('Toggle active error:', error)
      alert('更新に失敗しました')
    }
  }

  const changePlayerPassword = async (playerId: string, newPassword: string) => {
    if (!newPassword || newPassword.length < 6) {
      alert('パスワードは6文字以上にしてください')
      return
    }

    try {
      const { data, error } = await supabase.auth.admin.updateUserById(
        playerId,
        { password: newPassword }
      )

      if (error) {
        const player = players.find(p => p.id === playerId)
        if (player?.email) {
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(player.email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })
          
          if (resetError) throw resetError
          
          alert('Admin APIが利用できないため、パスワードリセットメールを送信しました')
        } else {
          alert('ユーザー情報が見つかりません')
        }
        return
      }

      alert('パスワードを変更しました')
      setPasswordChange({ ...passwordChange, [playerId]: '' })
      setShowPasswordChange({ ...showPasswordChange, [playerId]: false })
    } catch (error: any) {
      console.error('Password change error:', error)
      
      const player = players.find(p => p.id === playerId)
      if (player?.email) {
        try {
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(player.email, {
            redirectTo: `${window.location.origin}/reset-password`,
          })
          
          if (!resetError) {
            alert('直接変更できないため、パスワードリセットメールを送信しました')
            return
          }
        } catch (resetErr) {
          console.error('Reset email error:', resetErr)
        }
      }
      
      alert('パスワード変更に失敗しました。ユーザーにリセットメールを送信してください。')
    }
  }

  const sendPasswordResetEmail = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })

      if (error) throw error

      alert(`${email} にパスワードリセットメールを送信しました`)
    } catch (error: any) {
      console.error('Password reset error:', error)
      alert(error.message || 'パスワードリセットメールの送信に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Skull className="w-10 h-10 text-red-500 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* 背景エフェクト */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black to-purple-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* ヘッダー */}
      <div className="relative bg-black/80 backdrop-blur-xl border-b border-red-500/30 sticky top-0 z-50 shadow-lg shadow-red-500/10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard')}
              className="w-10 h-10 rounded-full bg-white/5 border-2 border-red-500/30 flex items-center justify-center hover:bg-white/10 hover:border-red-500/50 transition-all hover:scale-110"
            >
              <ArrowLeft className="w-5 h-5 text-red-400" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-red-600 blur-xl animate-pulse" />
                <Shield className="relative w-8 h-8 text-red-500 drop-shadow-glow" />
              </div>
              <div>
                <h1 className="text-2xl font-black bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 bg-clip-text text-transparent animate-shimmer">
                  ADMIN CONTROL
                </h1>
                <p className="text-xs text-red-400/60 font-mono">RESTRICTED ACCESS</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-8">
        {/* タブメニュー */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-purple-600/20 rounded-2xl blur-xl" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-2 border-2 border-red-500/20 shadow-2xl">
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'jackpot', label: 'JACKPOT', icon: Sparkles, glow: 'yellow' },
                { id: 'players', label: 'PLAYERS', icon: Users, glow: 'cyan' },
                { id: 'data', label: 'DANGER ZONE', icon: Skull, glow: 'red' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative group px-4 py-4 rounded-xl font-black text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-red-600 to-pink-600 text-white shadow-lg shadow-red-500/50'
                      : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {activeTab === tab.id && (
                    <div className={`absolute inset-0 bg-${tab.glow}-600 blur-xl opacity-50 rounded-xl`} />
                  )}
                  <div className="relative flex items-center justify-center gap-2">
                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'drop-shadow-glow' : ''}`} />
                    {tab.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* P-BANK管理ボタン（特権管理者専用） */}
        {user?.email === 'toui.reigetsu@gmail.com' && (
          <div className="relative mb-8 group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl blur-xl opacity-75 animate-pulse" />
            <button
              onClick={() => router.push('/pbank-admin')}
              className="relative w-full bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl p-6 shadow-2xl hover:scale-[1.02] transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-black/40 rounded-2xl flex items-center justify-center backdrop-blur-sm border-2 border-white/20">
                    <DollarSign className="w-8 h-8 text-white drop-shadow-glow" />
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-black text-white drop-shadow-glow">P-BANK CONTROL 🔐</p>
                    <p className="text-sm text-white/80 font-mono">SUPER ADMIN ONLY</p>
                  </div>
                </div>
                <ChevronRight className="w-7 h-7 text-white/70" />
              </div>
            </button>
          </div>
        )}

        {/* タブコンテンツ */}
        {activeTab === 'jackpot' && (
          <div className="space-y-6">
            {/* ジャックポット金額管理 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-yellow-500/30 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <Sparkles className="w-6 h-6 text-yellow-500 drop-shadow-glow" />
                  <h2 className="text-xl font-black text-white">JACKPOT CONTROL</h2>
                </div>
                
                <div className="relative mb-6 group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-xl blur-lg opacity-75 animate-pulse" />
                  <div className="relative bg-gradient-to-r from-yellow-600 to-amber-600 rounded-xl p-6 shadow-2xl">
                    <p className="text-sm text-white/80 mb-2 font-mono">CURRENT POOL</p>
                    <p className="text-5xl font-black text-white drop-shadow-glow">{currentJackpot.toLocaleString()}</p>
                    <p className="text-xl text-white/80 mt-1 font-bold">POINTS</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-bold text-gray-400 font-mono">ADJUST AMOUNT</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      value={jackpotAdjustment}
                      onChange={(e) => setJackpotAdjustment(e.target.value)}
                      placeholder="±1000"
                      className="flex-1 px-4 py-3 rounded-xl bg-black/40 border-2 border-yellow-500/30 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-all backdrop-blur-sm font-mono text-lg"
                    />
                    <button
                      onClick={updateJackpot}
                      className="relative group px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-black hover:shadow-lg hover:shadow-yellow-500/50 transition-all"
                    >
                      <div className="absolute inset-0 bg-yellow-600 blur-lg opacity-0 group-hover:opacity-50 rounded-xl transition-opacity" />
                      <span className="relative">UPDATE</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ジャックポット獲得者登録 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-yellow-500/30 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <Trophy className="w-6 h-6 text-yellow-500 drop-shadow-glow" />
                  <h2 className="text-xl font-black text-white">REGISTER WINNER</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">USERNAME *</label>
                    <select
                      value={newWinner.username}
                      onChange={(e) => setNewWinner({...newWinner, username: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border-2 border-yellow-500/30 text-white focus:border-yellow-500 focus:outline-none transition-all backdrop-blur-sm"
                    >
                      <option value="">SELECT PLAYER</option>
                      {players.filter(p => p.active).map(player => (
                        <option key={player.id} value={player.username}>
                          {player.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">AMOUNT *</label>
                    <input
                      type="number"
                      value={newWinner.amount}
                      onChange={(e) => setNewWinner({...newWinner, amount: e.target.value})}
                      placeholder="50000"
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border-2 border-yellow-500/30 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-all backdrop-blur-sm font-mono"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">HAND TYPE *</label>
                    <select
                      value={newWinner.hand_type}
                      onChange={(e) => setNewWinner({...newWinner, hand_type: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border-2 border-yellow-500/30 text-white focus:border-yellow-500 focus:outline-none transition-all backdrop-blur-sm"
                    >
                      <option value="ストレートフラッシュ">STRAIGHT FLUSH</option>
                      <option value="ロイヤルストレートフラッシュ">ROYAL STRAIGHT FLUSH</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">HAND CARDS *</label>
                    <input
                      type="text"
                      value={newWinner.hand_cards}
                      onChange={(e) => setNewWinner({...newWinner, hand_cards: e.target.value})}
                      placeholder="A♠ K♠"
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border-2 border-yellow-500/30 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-all backdrop-blur-sm"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">BOARD CARDS *</label>
                    <input
                      type="text"
                      value={newWinner.board_cards}
                      onChange={(e) => setNewWinner({...newWinner, board_cards: e.target.value})}
                      placeholder="Q♠ J♠ 10♠ 9♥ 2♦"
                      className="w-full px-4 py-3 rounded-xl bg-black/40 border-2 border-yellow-500/30 text-white placeholder-gray-600 focus:border-yellow-500 focus:outline-none transition-all backdrop-blur-sm"
                    />
                  </div>
                </div>
                
                <button
                  onClick={registerJackpotWinner}
                  className="relative group px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-600 to-amber-600 text-white font-black hover:shadow-lg hover:shadow-yellow-500/50 transition-all flex items-center gap-2"
                >
                  <div className="absolute inset-0 bg-yellow-600 blur-lg opacity-0 group-hover:opacity-50 rounded-xl transition-opacity" />
                  <Trophy className="relative w-5 h-5" />
                  <span className="relative">REGISTER</span>
                </button>
              </div>
            </div>

            {/* ジャックポット獲得履歴 */}
            {jackpotWinners.length > 0 && (
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-yellow-500/30 shadow-2xl">
                  <div className="p-6 border-b border-yellow-500/20">
                    <h2 className="text-xl font-black text-white">WINNER HISTORY</h2>
                  </div>
                  
                  <div className="divide-y divide-yellow-500/10">
                    {jackpotWinners.map((winner) => (
                      <div key={winner.id} className="p-5 hover:bg-white/5 transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xl font-black text-white mb-2">
                              {winner.profiles?.username || 'UNKNOWN'}
                            </p>
                            <p className="text-purple-400 font-bold mb-3 font-mono">
                              {winner.hand_type}
                            </p>
                            <div className="relative inline-block mb-4">
                              <div className="absolute inset-0 bg-green-600 blur-lg opacity-50" />
                              <p className="relative text-3xl font-black text-green-400 drop-shadow-glow">
                                +{winner.amount.toLocaleString()} P
                              </p>
                            </div>
                            <div className="space-y-2">
                              <p className="text-sm text-gray-400 font-mono flex items-center gap-2">
                                <CreditCard className="w-4 h-4" />
                                HAND: {winner.hand_cards}
                              </p>
                              <p className="text-sm text-gray-400 font-mono flex items-center gap-2">
                                <Trophy className="w-4 h-4" />
                                BOARD: {winner.board_cards}
                              </p>
                              <p className="text-xs text-gray-600 font-mono mt-3">
                                <Calendar className="inline w-3 h-3 mr-1" />
                                {new Date(winner.created_at).toLocaleString('ja-JP')}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteJackpotWinner(winner.id)}
                            className="p-3 hover:bg-red-600/20 rounded-xl transition-all group border-2 border-red-500/20 hover:border-red-500/50"
                          >
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 危険な操作 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-red-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-red-500/50 shadow-2xl">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500 drop-shadow-glow animate-pulse" />
                  <h3 className="font-black text-red-500">DANGER ZONE</h3>
                </div>
                <div className="bg-red-950/30 rounded-xl p-5 border-2 border-red-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-white mb-1">RESET JACKPOT</p>
                      <p className="text-sm text-gray-400 font-mono">IRREVERSIBLE ACTION</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={deleteConfirm.jackpot}
                          onChange={(e) => setDeleteConfirm({...deleteConfirm, jackpot: e.target.checked})}
                          className="w-4 h-4 accent-red-600"
                        />
                        <span className="text-sm text-gray-400 font-mono">CONFIRM</span>
                      </label>
                      <button
                        onClick={resetJackpot}
                        disabled={!deleteConfirm.jackpot}
                        className={`px-5 py-2 rounded-xl font-black transition-all ${
                          deleteConfirm.jackpot
                            ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/50'
                            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                        }`}
                      >
                        RESET
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'players' && (
          <div className="space-y-6">
            {/* 新規プレイヤー作成 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-cyan-500/30 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <Users className="w-6 h-6 text-cyan-500 drop-shadow-glow" />
                    <h2 className="text-xl font-black text-white">CREATE PLAYER</h2>
                  </div>
                  <button
                    onClick={fetchPlayers}
                    className="px-4 py-2 bg-blue-600/20 border-2 border-blue-500/30 text-blue-400 rounded-xl hover:bg-blue-600/30 hover:border-blue-500/50 font-bold transition-all"
                  >
                    RELOAD
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <input
                    type="email"
                    placeholder="EMAIL ADDRESS"
                    value={newPlayer.email}
                    onChange={(e) => setNewPlayer({...newPlayer, email: e.target.value})}
                    className="px-4 py-3 rounded-xl bg-black/40 border-2 border-cyan-500/30 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none transition-all backdrop-blur-sm font-mono"
                    autoComplete="off"
                  />
                  <input
                    type="text"
                    placeholder="USERNAME"
                    value={newPlayer.username}
                    onChange={(e) => setNewPlayer({...newPlayer, username: e.target.value})}
                    className="px-4 py-3 rounded-xl bg-black/40 border-2 border-cyan-500/30 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none transition-all backdrop-blur-sm font-mono"
                    autoComplete="off"
                  />
                  <input
                    type="password"
                    placeholder="PASSWORD (6+ CHARS)"
                    value={newPlayer.password}
                    onChange={(e) => setNewPlayer({...newPlayer, password: e.target.value})}
                    className="px-4 py-3 rounded-xl bg-black/40 border-2 border-cyan-500/30 text-white placeholder-gray-600 focus:border-cyan-500 focus:outline-none transition-all backdrop-blur-sm font-mono"
                    autoComplete="new-password"
                  />
                  <select
                    value={newPlayer.role}
                    onChange={(e) => setNewPlayer({...newPlayer, role: e.target.value})}
                    className="px-4 py-3 rounded-xl bg-black/40 border-2 border-cyan-500/30 text-white focus:border-cyan-500 focus:outline-none transition-all backdrop-blur-sm font-mono"
                  >
                    <option value="player">PLAYER</option>
                    <option value="admin">ADMIN</option>
                  </select>
                </div>
                
                <button
                  onClick={createPlayer}
                  className="relative group px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-black hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex items-center gap-2"
                >
                  <div className="absolute inset-0 bg-cyan-600 blur-lg opacity-0 group-hover:opacity-50 rounded-xl transition-opacity" />
                  <Plus className="relative w-5 h-5" />
                  <span className="relative">CREATE</span>
                </button>
              </div>
            </div>

            {/* プレイヤー一覧 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl overflow-hidden border-2 border-cyan-500/30 shadow-2xl">
                <div className="p-6 border-b border-cyan-500/20">
                  <h2 className="text-xl font-black text-white">PLAYER LIST</h2>
                </div>
                
                <div className="divide-y divide-cyan-500/10">
                  {players.map((player) => (
                    <div key={player.id} className="p-5 hover:bg-white/5 transition-all">
                      {editingPlayer?.id === player.id ? (
                        // 編集モード
                        <div className="space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                              type="text"
                              value={editingPlayer.username}
                              onChange={(e) => setEditingPlayer({...editingPlayer, username: e.target.value})}
                              className="px-4 py-3 rounded-xl bg-black/40 border-2 border-cyan-500/30 text-white focus:border-cyan-500 focus:outline-none transition-all backdrop-blur-sm font-mono"
                              placeholder="USERNAME"
                            />
                            <select
                              value={editingPlayer.role}
                              onChange={(e) => setEditingPlayer({...editingPlayer, role: e.target.value})}
                              className="px-4 py-3 rounded-xl bg-black/40 border-2 border-cyan-500/30 text-white focus:border-cyan-500 focus:outline-none transition-all backdrop-blur-sm font-mono"
                            >
                              <option value="player">PLAYER</option>
                              <option value="admin">ADMIN</option>
                            </select>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => updatePlayer(player.id, {
                                username: editingPlayer.username,
                                role: editingPlayer.role
                              })}
                              className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-all flex items-center gap-1 font-bold"
                            >
                              <Save className="w-4 h-4" />
                              SAVE
                            </button>
                            <button
                              onClick={() => setEditingPlayer(null)}
                              className="px-4 py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-all flex items-center gap-1 font-bold"
                            >
                              <X className="w-4 h-4" />
                              CANCEL
                            </button>
                          </div>
                        </div>
                      ) : (
                        // 表示モード
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {player.avatar_url ? (
                              <img
                                src={player.avatar_url}
                                alt={player.username}
                                className="w-14 h-14 rounded-full object-cover border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/30"
                              />
                            ) : (
                              <div className="relative">
                                <div className="absolute inset-0 bg-cyan-600 blur-lg opacity-50" />
                                <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center border-2 border-cyan-400/50 shadow-lg">
                                  <span className="text-white font-black text-xl drop-shadow-glow">
                                    {player.username?.[0]?.toUpperCase() || '?'}
                                  </span>
                                </div>
                              </div>
                            )}
                            <div>
                              <p className="font-black text-white text-lg">{player.username || 'UNKNOWN'}</p>
                              <p className="text-sm text-gray-500 font-mono">{player.email}</p>
                              <div className="flex items-center gap-2 mt-2">
                                {player.role === 'admin' ? (
                                  <span className="text-xs bg-red-600/20 border border-red-500/50 text-red-400 px-2 py-1 rounded-full flex items-center gap-1 font-mono">
                                    <Shield className="w-3 h-3" />
                                    ADMIN
                                  </span>
                                ) : (
                                  <span className="text-xs bg-gray-700/50 border border-gray-600/50 text-gray-400 px-2 py-1 rounded-full font-mono">
                                    PLAYER
                                  </span>
                                )}
                                {!player.active && (
                                  <span className="text-xs bg-yellow-600/20 border border-yellow-500/50 text-yellow-400 px-2 py-1 rounded-full flex items-center gap-1 font-mono">
                                    <ShieldOff className="w-3 h-3" />
                                    INACTIVE
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            {/* パスワード変更機能 */}
                            {showPasswordChange[player.id] ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="password"
                                  placeholder="NEW PASSWORD"
                                  value={passwordChange[player.id] || ''}
                                  onChange={(e) => setPasswordChange({ ...passwordChange, [player.id]: e.target.value })}
                                  className="px-3 py-2 rounded-xl bg-black/40 border-2 border-cyan-500/30 text-white text-sm focus:border-cyan-500 focus:outline-none w-32 font-mono"
                                  autoComplete="new-password"
                                />
                                <button
                                  onClick={() => changePlayerPassword(player.id, passwordChange[player.id])}
                                  className="p-2 bg-green-600/20 border-2 border-green-500/30 text-green-400 rounded-xl hover:bg-green-600/30 hover:border-green-500/50 transition-all"
                                  title="SAVE"
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setShowPasswordChange({ ...showPasswordChange, [player.id]: false })
                                    setPasswordChange({ ...passwordChange, [player.id]: '' })
                                  }}
                                  className="p-2 bg-gray-700/20 border-2 border-gray-600/30 text-gray-400 rounded-xl hover:bg-gray-700/30 hover:border-gray-600/50 transition-all"
                                  title="CANCEL"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setShowPasswordChange({ ...showPasswordChange, [player.id]: true })}
                                className="p-2 hover:bg-white/5 rounded-xl transition-all border-2 border-transparent hover:border-cyan-500/30"
                                title="CHANGE PASSWORD"
                              >
                                <Key className="w-4 h-4 text-gray-500" />
                              </button>
                            )}
                            
                            <button
                              onClick={() => sendPasswordResetEmail(player.email)}
                              className="p-2 hover:bg-white/5 rounded-xl transition-all border-2 border-transparent hover:border-cyan-500/30"
                              title="SEND RESET EMAIL"
                            >
                              <Mail className="w-4 h-4 text-gray-500" />
                            </button>
                            
                            <button
                              onClick={() => setEditingPlayer(player)}
                              className="p-2 hover:bg-white/5 rounded-xl transition-all border-2 border-transparent hover:border-cyan-500/30"
                            >
                              <Edit className="w-4 h-4 text-gray-500" />
                            </button>
                            
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={player.active !== false}
                                onChange={() => togglePlayerActive(player.id, player.active !== false)}
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 shadow-inner"></div>
                            </label>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 説明 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-blue-600/30 rounded-xl blur-lg" />
              <div className="relative bg-black/40 border-2 border-blue-500/30 rounded-xl p-5 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-500 mt-0.5 drop-shadow-glow" />
                  <div>
                    <p className="font-bold text-blue-400 mb-2 font-mono">ADMIN FUNCTIONS</p>
                    <ul className="text-sm text-gray-400 space-y-1 font-mono">
                      <li>• EDIT: Change username & role</li>
                      <li>• KEY: Set new password</li>
                      <li>• MAIL: Send reset email</li>
                      <li>• TOGGLE: Activate/Deactivate user</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-red-600 rounded-2xl blur-xl opacity-75" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-red-500/50 shadow-2xl">
                <div className="flex items-center gap-2 mb-6">
                  <Skull className="w-7 h-7 text-red-500 drop-shadow-glow animate-pulse" />
                  <h2 className="text-2xl font-black text-red-500">DANGER ZONE</h2>
                </div>
                
                <div className="space-y-4">
                  {/* P-BANK削除 */}
                  <div className="bg-red-950/30 rounded-xl p-5 border-2 border-red-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-white mb-1">DELETE P-BANK DATA</p>
                        <p className="text-sm text-gray-400 font-mono">ERASE ALL LOANS & RECORDS</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={deleteConfirm.pbank}
                            onChange={(e) => setDeleteConfirm({...deleteConfirm, pbank: e.target.checked})}
                            className="w-4 h-4 accent-red-600"
                          />
                          <span className="text-sm text-gray-400 font-mono">CONFIRM</span>
                        </label>
                        <button
                          onClick={deleteAllPBankData}
                          disabled={!deleteConfirm.pbank}
                          className={`px-5 py-2 rounded-xl font-black transition-all ${
                            deleteConfirm.pbank
                              ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/50'
                              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ゲームセッション削除 */}
                  <div className="bg-red-950/30 rounded-xl p-5 border-2 border-red-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-black text-white mb-1">DELETE GAME SESSIONS</p>
                        <p className="text-sm text-gray-400 font-mono">ERASE ALL PLAY RECORDS</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={deleteConfirm.sessions}
                            onChange={(e) => setDeleteConfirm({...deleteConfirm, sessions: e.target.checked})}
                            className="w-4 h-4 accent-red-600"
                          />
                          <span className="text-sm text-gray-400 font-mono">CONFIRM</span>
                        </label>
                        <button
                          onClick={deleteAllGameSessions}
                          disabled={!deleteConfirm.sessions}
                          className={`px-5 py-2 rounded-xl font-black transition-all ${
                            deleteConfirm.sessions
                              ? 'bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-500/50'
                              : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                          }`}
                        >
                          DELETE
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-yellow-600/30 rounded-xl blur-lg" />
              <div className="relative bg-black/40 border-2 border-yellow-500/30 rounded-xl p-5 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 drop-shadow-glow" />
                  <div>
                    <p className="font-bold text-yellow-400 mb-2 font-mono">WARNING</p>
                    <ul className="text-sm text-gray-400 space-y-1 font-mono">
                      <li>• DELETED DATA CANNOT BE RECOVERED</li>
                      <li>• CREATE BACKUPS BEFORE DELETION</li>
                      <li>• INDIVIDUAL EDITS NOT IMPLEMENTED</li>
                    </ul>
                  </div>
                </div>
              </div>
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
          background: rgba(239, 68, 68, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(239, 68, 68, 0.7);
        }
      `}</style>
    </div>
  )
}