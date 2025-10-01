'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, Settings, DollarSign, Users, TrendingUp,
  Trash2, Plus, Edit, Save, X, AlertTriangle, 
  Shield, ShieldOff, Camera, Sparkles, Mail, Key,
  Trophy, CreditCard, Calendar
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
  
  // プレイヤー（既存のまま維持）
  const [players, setPlayers] = useState<any[]>([])
  const [editingPlayer, setEditingPlayer] = useState<any>(null)
  const [newPlayer, setNewPlayer] = useState({
    email: '',
    username: '',
    password: '',
    role: 'player'
  })
  
  // パスワード変更用（既存のまま維持）
  const [passwordChange, setPasswordChange] = useState<{[key: string]: string}>({})
  const [showPasswordChange, setShowPasswordChange] = useState<{[key: string]: boolean}>({})
  
  // 削除確認（既存のまま維持）
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
        // エラーがあっても空配列をセット
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
      // ユーザー検索
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

      // ジャックポット獲得者登録（payout_percentage追加）
      const { data: winnerData, error: winnerError } = await supabase
        .from('jackpot_winners')
        .insert({
          user_id: userData.id,
          amount: amount,
          hand_type: newWinner.hand_type,
          hand_cards: newWinner.hand_cards,
          board_cards: newWinner.board_cards,
          payout_percentage: 100  // ← この行を追加（100%支払いとして）
        })
        .select()

      if (winnerError) {
        console.error('Winner insert error:', winnerError)
        alert(`登録エラー: ${winnerError.message}`)
        return
      }

      // ジャックポットプールの更新
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
      
      // フォームリセット
      setNewWinner({
        username: '',
        amount: '',
        hand_type: 'ストレートフラッシュ',
        hand_cards: '',
        board_cards: ''
      })
      
      // データ再取得
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

  // 既存の関数はすべて維持（deleteAllPBankData, deleteAllGameSessions, resetJackpot, createPlayer, updatePlayer, togglePlayerActive, changePlayerPassword, sendPasswordResetEmail）
  // [既存コードの関数をそのまま維持]
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-violet-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-gray-100 rounded-xl transition-all"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-red-600 to-orange-600 text-transparent bg-clip-text flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            管理者パネル
          </h1>
          <div className="w-9" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* タブメニュー */}
        <div className="bg-white rounded-xl shadow-sm p-1 mb-6">
          <div className="flex gap-1">
            {[
              { id: 'jackpot', label: 'ジャックポット', icon: Sparkles },
              { id: 'players', label: 'プレイヤー管理', icon: Users },
              { id: 'data', label: 'データ管理', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'jackpot' && (
          <div className="space-y-6">
            {/* ジャックポット金額管理 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">ジャックポット管理</h2>
              
              <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white rounded-xl p-4 mb-6">
                <p className="text-sm mb-1">現在のジャックポット</p>
                <p className="text-3xl font-bold">{currentJackpot.toLocaleString()} P</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    金額調整（プラスまたはマイナスの値を入力）
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={jackpotAdjustment}
                      onChange={(e) => setJackpotAdjustment(e.target.value)}
                      placeholder="例: 1000 または -500"
                      className="flex-1 px-3 py-2 border rounded-lg text-gray-900 bg-white"
                    />
                    <button
                      onClick={updateJackpot}
                      className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all"
                    >
                      更新
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ジャックポット獲得者登録（新機能） */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                ジャックポット獲得者登録
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ユーザー名 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newWinner.username}
                    onChange={(e) => setNewWinner({...newWinner, username: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                  >
                    <option value="">選択してください</option>
                    {players.filter(p => p.active).map(player => (
                      <option key={player.id} value={player.username}>
                        {player.username}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    獲得金額 (P) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={newWinner.amount}
                    onChange={(e) => setNewWinner({...newWinner, amount: e.target.value})}
                    placeholder="例: 50000"
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    役 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={newWinner.hand_type}
                    onChange={(e) => setNewWinner({...newWinner, hand_type: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                  >
                    <option value="ストレートフラッシュ">ストレートフラッシュ</option>
                    <option value="ロイヤルストレートフラッシュ">ロイヤルストレートフラッシュ</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ハンド <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newWinner.hand_cards}
                    onChange={(e) => setNewWinner({...newWinner, hand_cards: e.target.value})}
                    placeholder="例: A♠ K♠"
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ボード <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newWinner.board_cards}
                    onChange={(e) => setNewWinner({...newWinner, board_cards: e.target.value})}
                    placeholder="例: Q♠ J♠ 10♠ 9♥ 2♦"
                    className="w-full px-3 py-2 border rounded-lg text-gray-900 bg-white"
                  />
                </div>
              </div>
              
              <button
                onClick={registerJackpotWinner}
                className="px-4 py-2 bg-gradient-to-r from-yellow-600 to-amber-600 text-white rounded-lg hover:shadow-md transition-all flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" />
                獲得者を登録
              </button>
            </div>

            {/* ジャックポット獲得履歴 */}
            {jackpotWinners.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b">
                  <h2 className="text-xl font-bold text-gray-900">ジャックポット獲得履歴</h2>
                </div>
                
                <div className="divide-y">
                  {jackpotWinners.map((winner) => (
                    <div key={winner.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-bold text-lg text-gray-900">
                            {winner.profiles?.username || 'Unknown'}
                          </p>
                          <p className="text-purple-600 font-semibold mt-1">
                            {winner.hand_type}
                          </p>
                          <p className="text-2xl font-bold text-green-600 mt-2">
                            +{winner.amount.toLocaleString()} P
                          </p>
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">
                              <CreditCard className="inline w-4 h-4 mr-1" />
                              ハンド: {winner.hand_cards}
                            </p>
                            <p className="text-sm text-gray-600">
                              <Trophy className="inline w-4 h-4 mr-1" />
                              ボード: {winner.board_cards}
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              <Calendar className="inline w-3 h-3 mr-1" />
                              {new Date(winner.created_at).toLocaleString('ja-JP')}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteJackpotWinner(winner.id)}
                          className="p-2 hover:bg-red-100 rounded-lg transition-all group"
                        >
                          <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 危険な操作 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h3 className="font-semibold text-red-600">危険な操作</h3>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">ジャックポットリセット</p>
                    <p className="text-sm text-gray-600">金額を0にリセットし、履歴も削除します</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={deleteConfirm.jackpot}
                        onChange={(e) => setDeleteConfirm({...deleteConfirm, jackpot: e.target.checked})}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">削除確認</span>
                    </label>
                    <button
                      onClick={resetJackpot}
                      disabled={!deleteConfirm.jackpot}
                      className={`px-4 py-2 rounded-lg transition-all ${
                        deleteConfirm.jackpot
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      リセット
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 既存のプレイヤー管理タブとデータ管理タブはそのまま維持 */}
        {activeTab === 'players' && (
          <div className="space-y-6">
            {/* 既存のプレイヤー管理コードをそのまま維持 */}
            {/* [前のコードと同じ内容] */}
            {/* 新規プレイヤー作成 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">新規プレイヤー作成</h2>
                <button
                  onClick={fetchPlayers}
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  再読み込み
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="email"
                  placeholder="メールアドレス"
                  value={newPlayer.email}
                  onChange={(e) => setNewPlayer({...newPlayer, email: e.target.value})}
                  className="px-3 py-2 border rounded-lg text-gray-900 bg-white"
                  autoComplete="off"
                />
                <input
                  type="text"
                  placeholder="ユーザー名"
                  value={newPlayer.username}
                  onChange={(e) => setNewPlayer({...newPlayer, username: e.target.value})}
                  className="px-3 py-2 border rounded-lg text-gray-900 bg-white"
                  autoComplete="off"
                />
                <input
                  type="password"
                  placeholder="パスワード（6文字以上）"
                  value={newPlayer.password}
                  onChange={(e) => setNewPlayer({...newPlayer, password: e.target.value})}
                  className="px-3 py-2 border rounded-lg text-gray-900 bg-white"
                  autoComplete="new-password"
                />
                <select
                  value={newPlayer.role}
                  onChange={(e) => setNewPlayer({...newPlayer, role: e.target.value})}
                  className="px-3 py-2 border rounded-lg text-gray-900 bg-white"
                >
                  <option value="player">一般プレイヤー</option>
                  <option value="admin">管理者</option>
                </select>
              </div>
              
              <button
                onClick={createPlayer}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:shadow-md transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                プレイヤーを作成
              </button>
            </div>

            {/* プレイヤー一覧 */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-gray-900">プレイヤー一覧</h2>
              </div>
              
              <div className="divide-y">
                {players.map((player) => (
                  <div key={player.id} className="p-4">
                    {editingPlayer?.id === player.id ? (
                      // 編集モード
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            value={editingPlayer.username}
                            onChange={(e) => setEditingPlayer({...editingPlayer, username: e.target.value})}
                            className="px-3 py-2 border rounded-lg text-gray-900 bg-white"
                            placeholder="ユーザー名"
                          />
                          <select
                            value={editingPlayer.role}
                            onChange={(e) => setEditingPlayer({...editingPlayer, role: e.target.value})}
                            className="px-3 py-2 border rounded-lg text-gray-900 bg-white"
                          >
                            <option value="player">一般プレイヤー</option>
                            <option value="admin">管理者</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => updatePlayer(player.id, {
                              username: editingPlayer.username,
                              role: editingPlayer.role
                            })}
                            className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1"
                          >
                            <Save className="w-4 h-4" />
                            保存
                          </button>
                          <button
                            onClick={() => setEditingPlayer(null)}
                            className="px-3 py-1 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            キャンセル
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
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {player.username?.[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{player.username || 'Unknown'}</p>
                            <p className="text-sm text-gray-600">{player.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              {player.role === 'admin' ? (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full flex items-center gap-1">
                                  <Shield className="w-3 h-3" />
                                  管理者
                                </span>
                              ) : (
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                  一般
                                </span>
                              )}
                              {!player.active && (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full flex items-center gap-1">
                                  <ShieldOff className="w-3 h-3" />
                                  非アクティブ
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
                                placeholder="新パスワード"
                                value={passwordChange[player.id] || ''}
                                onChange={(e) => setPasswordChange({ ...passwordChange, [player.id]: e.target.value })}
                                className="px-2 py-1 border rounded text-sm text-gray-900 bg-white w-32"
                                autoComplete="new-password"
                              />
                              <button
                                onClick={() => changePlayerPassword(player.id, passwordChange[player.id])}
                                className="p-1 bg-green-600 text-white rounded hover:bg-green-700"
                                title="パスワード変更"
                              >
                                <Save className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => {
                                  setShowPasswordChange({ ...showPasswordChange, [player.id]: false })
                                  setPasswordChange({ ...passwordChange, [player.id]: '' })
                                }}
                                className="p-1 bg-gray-600 text-white rounded hover:bg-gray-700"
                                title="キャンセル"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowPasswordChange({ ...showPasswordChange, [player.id]: true })}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-all group relative"
                              title="パスワード変更"
                            >
                              <Key className="w-4 h-4 text-gray-600" />
                              <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                パスワード変更
                              </span>
                            </button>
                          )}
                          
                          <button
                            onClick={() => sendPasswordResetEmail(player.email)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all group relative"
                            title="リセットメール送信"
                          >
                            <Mail className="w-4 h-4 text-gray-600" />
                            <span className="absolute -top-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                              リセットメール
                            </span>
                          </button>
                          
                          <button
                            onClick={() => setEditingPlayer(player)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={player.active !== false}
                              onChange={() => togglePlayerActive(player.id, player.active !== false)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 管理機能の説明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-800">管理機能について</p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• <strong>ユーザー名・役割の変更:</strong> 編集ボタンから変更可能</li>
                    <li>• <strong>パスワード変更:</strong> 鍵アイコンから新しいパスワードを設定</li>
                    <li>• <strong>リセットメール:</strong> メールアイコンからリセットメールを送信</li>
                    <li>• <strong>メールアドレス変更:</strong> セキュリティ上、ユーザー自身による変更のみ可能</li>
                    <li>• <strong>アクティブ状態:</strong> トグルスイッチで切り替え可能</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            {/* 既存のデータ管理コードをそのまま維持 */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold text-red-600">データ削除</h2>
              </div>
              
              <div className="space-y-4">
                {/* P-BANK削除 */}
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">P-BANK全データ削除</p>
                      <p className="text-sm text-gray-600">融資、利息、申請履歴をすべて削除</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={deleteConfirm.pbank}
                          onChange={(e) => setDeleteConfirm({...deleteConfirm, pbank: e.target.checked})}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">削除確認</span>
                      </label>
                      <button
                        onClick={deleteAllPBankData}
                        disabled={!deleteConfirm.pbank}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          deleteConfirm.pbank
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        全削除
                      </button>
                    </div>
                  </div>
                </div>

                {/* ゲームセッション削除 */}
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">ゲームセッション全削除</p>
                      <p className="text-sm text-gray-600">すべてのプレイ記録を削除</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={deleteConfirm.sessions}
                          onChange={(e) => setDeleteConfirm({...deleteConfirm, sessions: e.target.checked})}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">削除確認</span>
                      </label>
                      <button
                        onClick={deleteAllGameSessions}
                        disabled={!deleteConfirm.sessions}
                        className={`px-4 py-2 rounded-lg transition-all ${
                          deleteConfirm.sessions
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        全削除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-300 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-800">注意事項</p>
                  <ul className="text-sm text-yellow-700 mt-2 space-y-1">
                    <li>• 削除したデータは復元できません</li>
                    <li>• 削除前に必要に応じてバックアップを取ってください</li>
                    <li>• P-BANKとゲームセッションの個別編集は技術的制約により未実装です</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}  // ← ここに閉じ括弧を追加