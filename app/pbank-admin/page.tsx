'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  ArrowLeft, 
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Shield,
  Users,
  DollarSign,
  Skull,
  Calendar,
  X,
  Save
} from 'lucide-react'

interface Profile {
  id: string
  username: string
  email: string
  active: boolean
}

interface Loan {
  id: string
  lender_id: string
  borrower_id: string
  amount: number
  remaining: number
  status: 'active' | 'completed'
  created_at: string
  lender?: Profile
  borrower?: Profile
}

export default function PBankAdminPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [loans, setLoans] = useState<Loan[]>([])
  const [users, setUsers] = useState<Profile[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null)
  
  // 新規作成フォーム
  const [newLoan, setNewLoan] = useState({
    lender_id: '',
    borrower_id: '',
    amount: 0,
    remaining: 0,
    created_at: new Date().toISOString().split('T')[0]
  })
  
  // 編集フォーム
  const [editForm, setEditForm] = useState({
    amount: 0,
    remaining: 0
  })

  useEffect(() => {
    checkAdmin()
  }, [])

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const checkAdmin = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    
    if (!authUser) {
      router.push('/login')
      return
    }
    
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authUser.id)
      .single()
    
    // 管理者チェック
    if (authUser.email !== 'toui.reigetsu@gmail.com' && profile?.role !== 'admin') {
      router.push('/dashboard')
      return
    }
    
    setUser({ ...authUser, ...profile })
    setLoading(false)
  }

  const loadData = async () => {
    try {
      // 全ユーザー取得
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('id, username, email, active')
        .eq('active', true)
        .order('username')
      
      if (usersError) {
        console.error('Users fetch error:', usersError)
        throw usersError
      }
      
      setUsers(usersData || [])
      
      // 全ローン取得
      const { data: loansData, error: loansError } = await supabase
        .from('loans')
        .select(`
          *,
          lender:profiles!loans_lender_id_fkey(id, username, email, active),
          borrower:profiles!loans_borrower_id_fkey(id, username, email, active)
        `)
        .order('created_at', { ascending: false })
      
      if (loansError) {
        console.error('Loans fetch error:', loansError)
        throw loansError
      }
      
      console.log('Loans loaded:', loansData?.length || 0)
      setLoans(loansData || [])
      
    } catch (error) {
      console.error('データ読み込みエラー:', error)
      alert('データの読み込みに失敗しました。ページを再読み込みしてください。')
    }
  }

  const handleCreateLoan = async () => {
    if (!newLoan.lender_id || !newLoan.borrower_id || newLoan.lender_id === newLoan.borrower_id) {
      alert('貸し手と借り手を正しく選択してください')
      return
    }
    
    if (newLoan.amount <= 0 || newLoan.remaining < 0) {
      alert('有効な金額を入力してください（元本は1以上、残高は0以上）')
      return
    }
    
    try {
      // ローンを作成
      const { data: loanData, error: loanError } = await supabase
        .from('loans')
        .insert({
          lender_id: newLoan.lender_id,
          borrower_id: newLoan.borrower_id,
          amount: Number(newLoan.amount),
          remaining: Number(newLoan.remaining),
          status: 'active',
          created_at: new Date(newLoan.created_at).toISOString(),
          last_interest_date: new Date().toISOString()
        })
        .select()
        .single()
      
      if (loanError) throw loanError
      
      // 残高が元本より大きい場合、その差額を利息として記録
      const interestAmount = Number(newLoan.remaining) - Number(newLoan.amount)
      if (interestAmount > 0 && loanData) {
        const { error: interestError } = await supabase
          .from('interest_records')
          .insert({
            loan_id: loanData.id,
            amount: interestAmount,
            from_user_id: newLoan.borrower_id,
            to_user_id: newLoan.lender_id,
            created_at: new Date(newLoan.created_at).toISOString()
          })
        
        if (interestError) {
          console.error('利息記録エラー:', interestError)
        }
      }
      
      alert('ローンを作成しました')
      setShowCreateForm(false)
      setNewLoan({
        lender_id: '',
        borrower_id: '',
        amount: 0,
        remaining: 0,
        created_at: new Date().toISOString().split('T')[0]
      })
      loadData()
      
    } catch (error) {
      console.error('作成エラー:', error)
      alert('ローンの作成に失敗しました')
    }
  }

  const handleUpdateLoan = async () => {
    if (!editingLoan) return
    
    try {
      const { error } = await supabase
        .from('loans')
        .update({
          amount: editForm.amount,
          remaining: editForm.remaining
        })
        .eq('id', editingLoan.id)
      
      if (error) throw error
      
      alert('ローンを更新しました')
      setEditingLoan(null)
      loadData()
      
    } catch (error) {
      console.error('更新エラー:', error)
      alert('ローンの更新に失敗しました')
    }
  }

  const handleCompleteLoan = async (loanId: string) => {
    if (!confirm('このローンを完済にしますか？')) return
    
    try {
      const { error } = await supabase
        .from('loans')
        .update({ 
          status: 'completed',
          remaining: 0
        })
        .eq('id', loanId)
      
      if (error) throw error
      
      alert('ローンを完済にしました')
      loadData()
      
    } catch (error) {
      console.error('完済エラー:', error)
      alert('ローンの完済処理に失敗しました')
    }
  }

  const handleDeleteLoan = async (loanId: string) => {
    if (!confirm('このローンを完全に削除しますか？この操作は取り消せません。\n\n関連する利息記録と返済申請も削除されます。')) return
    
    try {
      // 関連する利息記録を削除
      await supabase
        .from('interest_records')
        .delete()
        .eq('loan_id', loanId)
      
      // 関連する返済申請を削除
      await supabase
        .from('loan_applications')
        .delete()
        .eq('loan_id', loanId)
      
      // ローン本体を削除
      const { error } = await supabase
        .from('loans')
        .delete()
        .eq('id', loanId)
      
      if (error) throw error
      
      alert('ローンと関連データを削除しました')
      
      // ページ全体をリロード
      window.location.reload()
      
    } catch (error: any) {
      console.error('削除エラー:', error)
      alert(`削除に失敗しました: ${error?.message || '不明なエラー'}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield className="w-10 h-10 text-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* 背景エフェクト */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 via-black to-green-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative container max-w-md mx-auto p-4 pb-20">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border-2 border-emerald-500/30 hover:bg-white/10 hover:border-emerald-500/50 transition-all hover:scale-110 mb-4"
          >
            <ArrowLeft className="h-5 w-5 text-emerald-400" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-600 blur-xl animate-pulse" />
              <Shield className="relative w-8 h-8 text-emerald-500 drop-shadow-glow" />
            </div>
            <div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent animate-shimmer">
                P-BANK 管理
              </h1>
              <p className="text-emerald-400/60 mt-1 font-mono text-sm">SUPER ADMIN ONLY</p>
            </div>
          </div>
        </div>

        {/* 新規作成ボタン */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="relative w-full py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border-2 border-emerald-400"
          >
            <Plus className="w-5 h-5 drop-shadow-glow" />
            <span className="drop-shadow-glow">新規ローン作成</span>
          </button>
        </div>

        {/* 新規作成フォーム */}
        {showCreateForm && (
          <div className="relative group mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-emerald-500/30 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-white text-lg">新規ローン作成</h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-all"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">貸し手</label>
                  <select
                    value={newLoan.lender_id}
                    onChange={(e) => setNewLoan({...newLoan, lender_id: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border-2 border-emerald-500/30 text-white focus:border-emerald-500 focus:outline-none transition-all backdrop-blur-sm font-mono"
                  >
                    <option value="">選択してください</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">借り手</label>
                  <select
                    value={newLoan.borrower_id}
                    onChange={(e) => setNewLoan({...newLoan, borrower_id: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border-2 border-emerald-500/30 text-white focus:border-emerald-500 focus:outline-none transition-all backdrop-blur-sm font-mono"
                  >
                    <option value="">選択してください</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">元本 (P)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={newLoan.amount || ''}
                    onChange={(e) => setNewLoan({...newLoan, amount: e.target.value === '' ? 0 : Number(e.target.value)})}
                    placeholder="10000"
                    className="w-full px-4 py-3 border-2 border-emerald-500/30 rounded-xl text-center font-black text-white text-xl bg-black/40 focus:outline-none focus:border-emerald-500 transition-all backdrop-blur-sm font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">現在残高 (P)</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={newLoan.remaining || ''}
                    onChange={(e) => setNewLoan({...newLoan, remaining: e.target.value === '' ? 0 : Number(e.target.value)})}
                    placeholder="10000"
                    className="w-full px-4 py-3 border-2 border-emerald-500/30 rounded-xl text-center font-black text-white text-xl bg-black/40 focus:outline-none focus:border-emerald-500 transition-all backdrop-blur-sm font-mono"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-400 mb-2 font-mono flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    作成日
                  </label>
                  <input
                    type="date"
                    value={newLoan.created_at}
                    onChange={(e) => setNewLoan({...newLoan, created_at: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl bg-black/40 border-2 border-emerald-500/30 text-white focus:border-emerald-500 focus:outline-none transition-all backdrop-blur-sm font-mono"
                  />
                </div>
                
                <div className="flex gap-2 pt-2">
                  <div className="relative group flex-1">
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-green-600 rounded-lg blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                    <button
                      onClick={handleCreateLoan}
                      className="relative w-full py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg font-black border-2 border-emerald-400 hover:scale-105 active:scale-95 transition-all"
                    >
                      作成
                    </button>
                  </div>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 py-3 bg-gray-700 text-white rounded-lg font-black hover:bg-gray-600 transition-all border-2 border-gray-600"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ローン一覧 */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-emerald-500 drop-shadow-glow" />
            <h3 className="font-black text-white text-lg">全ローン一覧</h3>
            <div className="relative ml-auto">
              <div className="absolute inset-0 bg-emerald-600 blur-lg opacity-50" />
              <span className="relative px-3 py-1 bg-black/60 border-2 border-emerald-500/50 rounded-full text-sm font-black text-emerald-400 font-mono">
                {loans.length}件
              </span>
            </div>
          </div>
          
          {loans.map(loan => (
            <div key={loan.id} className="relative group">
              <div className={`absolute inset-0 ${
                loan.status === 'active' ? 'bg-emerald-600' : 'bg-gray-600'
              } rounded-2xl blur-xl opacity-30`} />
              <div className={`relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-l-4 shadow-2xl ${
                loan.status === 'active' ? 'border-emerald-500' : 'border-gray-500'
              }`}>
                {editingLoan?.id === loan.id ? (
                  // 編集モード
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="font-black text-white text-lg font-mono">
                          {loan.lender?.username} → {loan.borrower?.username}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {new Date(loan.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black font-mono ${
                        loan.status === 'active' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50' 
                          : 'bg-gray-500/20 text-gray-400 border-2 border-gray-500/50'
                      }`}>
                        {loan.status === 'active' ? '返済中' : '完済'}
                      </span>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">元本 (P)</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={editForm.amount || ''}
                        onChange={(e) => setEditForm({...editForm, amount: e.target.value === '' ? 0 : Number(e.target.value)})}
                        placeholder="10000"
                        className="w-full px-4 py-3 border-2 border-emerald-500/30 rounded-xl text-center font-black text-white text-lg bg-black/40 focus:outline-none focus:border-emerald-500 transition-all backdrop-blur-sm font-mono"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2 font-mono">現在残高 (P)</label>
                      <input
                        type="number"
                        step="1"
                        min="0"
                        value={editForm.remaining || ''}
                        onChange={(e) => setEditForm({...editForm, remaining: e.target.value === '' ? 0 : Number(e.target.value)})}
                        placeholder="10000"
                        className="w-full px-4 py-3 border-2 border-emerald-500/30 rounded-xl text-center font-black text-white text-lg bg-black/40 focus:outline-none focus:border-emerald-500 transition-all backdrop-blur-sm font-mono"
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={handleUpdateLoan}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 border-2 border-blue-400"
                      >
                        <Save className="w-4 h-4" />
                        保存
                      </button>
                      <button
                        onClick={() => setEditingLoan(null)}
                        className="flex-1 py-2 bg-gray-700 text-white rounded-lg font-black hover:bg-gray-600 transition-all border-2 border-gray-600"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  // 表示モード
                  <>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <p className="font-black text-white text-lg font-mono">
                          {loan.lender?.username} → {loan.borrower?.username}
                        </p>
                        <p className="text-xs text-gray-400 font-mono">
                          {new Date(loan.created_at).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-black font-mono ${
                        loan.status === 'active' 
                          ? 'bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/50' 
                          : 'bg-gray-500/20 text-gray-400 border-2 border-gray-500/50'
                      }`}>
                        {loan.status === 'active' ? '返済中' : '完済'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-cyan-600 rounded-xl blur-lg opacity-30" />
                        <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-3 border-2 border-cyan-500/30">
                          <p className="text-xs font-bold text-gray-400 font-mono">元本</p>
                          <p className="text-xl font-black text-white font-mono drop-shadow-glow">{loan.amount.toLocaleString()} P</p>
                        </div>
                      </div>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-emerald-600 rounded-xl blur-lg opacity-30" />
                        <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-3 border-2 border-emerald-500/30">
                          <p className="text-xs font-bold text-gray-400 font-mono">残高</p>
                          <p className="text-xl font-black text-emerald-400 font-mono drop-shadow-glow">{loan.remaining.toLocaleString()} P</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingLoan(loan)
                          setEditForm({ amount: loan.amount, remaining: loan.remaining })
                        }}
                        className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-2 border-2 border-blue-400"
                      >
                        <Edit className="w-4 h-4 drop-shadow-glow" />
                        編集
                      </button>
                      
                      {loan.status === 'active' && (
                        <button
                          onClick={() => handleCompleteLoan(loan.id)}
                          className="flex-1 py-2 bg-green-600 text-white rounded-lg font-black hover:bg-green-700 transition-all flex items-center justify-center gap-2 border-2 border-green-400"
                        >
                          <CheckCircle className="w-4 h-4 drop-shadow-glow" />
                          完済
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleDeleteLoan(loan.id)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-black hover:bg-red-700 transition-all flex items-center justify-center border-2 border-red-400"
                      >
                        <Trash2 className="w-4 h-4 drop-shadow-glow" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          
          {loans.length === 0 && (
            <div className="relative group">
              <div className="absolute inset-0 bg-gray-600 rounded-2xl blur-xl opacity-30" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-12 text-center border-2 border-gray-500/30 shadow-2xl">
                <Skull className="w-12 h-12 text-gray-600 mx-auto mb-3 opacity-50" />
                <p className="text-gray-500 font-bold font-mono">ローンはまだありません</p>
              </div>
            </div>
          )}
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
          background: rgba(16, 185, 129, 0.5);
          border-radius: 4px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.7);
        }
      `}</style>
    </div>
  )
}