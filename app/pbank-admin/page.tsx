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
  DollarSign
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
    
    console.log('Loans loaded:', loansData?.length || 0)  // デバッグ用
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
        // エラーでも続行（ローン自体は作成済み）
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
    
    // ページ全体をリロード（確実に最新データを表示）
    window.location.reload()
    
  } catch (error: any) {
    console.error('削除エラー:', error)
    alert(`削除に失敗しました: ${error?.message || '不明なエラー'}`)
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
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all mb-4"
          >
            <ArrowLeft className="h-5 w-5 text-gray-900" />
          </button>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            <Shield className="inline h-8 w-8 text-red-600 mr-2" />
            P-BANK 管理
          </h1>
          <p className="text-gray-900 mt-2 font-medium">管理者専用ページ</p>
        </div>

        {/* 新規作成ボタン */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full mb-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl font-bold shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          新規ローン作成
        </button>

        {/* 新規作成フォーム */}
        {showCreateForm && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 mb-6 border border-green-100">
            <h3 className="font-bold text-gray-900 mb-4 text-lg">新規ローン作成</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">貸し手</label>
                <select
                  value={newLoan.lender_id}
                  onChange={(e) => setNewLoan({...newLoan, lender_id: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 bg-white font-semibold"
                >
                  <option value="">選択してください</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.username}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">借り手</label>
                <select
                  value={newLoan.borrower_id}
                  onChange={(e) => setNewLoan({...newLoan, borrower_id: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 bg-white font-semibold"
                >
                  <option value="">選択してください</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.username}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">元本 (P)</label>
                <input
                  type="number"
                  value={newLoan.amount || ''}  
                  onChange={(e) => setNewLoan({...newLoan, amount: e.target.value === '' ? 0 : Number(e.target.value)})}
                  placeholder="例: 10000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 bg-white font-bold"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">現在残高 (P)</label>
                <input
                  type="number"
                  value={newLoan.remaining || ''} 
                  onChange={(e) => setNewLoan({...newLoan, remaining: e.target.value === '' ? 0 : Number(e.target.value)})} 
                  placeholder="例: 10000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 bg-white font-bold"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">作成日</label>
                <input
                  type="date"
                  value={newLoan.created_at}
                  onChange={(e) => setNewLoan({...newLoan, created_at: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 bg-white font-semibold"
                />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleCreateLoan}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                  作成
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 py-3 bg-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-400 transition-all"
                >
                  キャンセル
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ローン一覧 */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-600" />
            全ローン一覧 ({loans.length}件)
          </h3>
          
          {loans.map(loan => (
            <div key={loan.id} className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border-l-4 ${
              loan.status === 'active' ? 'border-green-500' : 'border-gray-400'
            }`}>
              {editingLoan?.id === loan.id ? (
                // 編集モード
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {loan.lender?.username} → {loan.borrower?.username}
                      </p>
                      <p className="text-xs text-gray-800 font-semibold">
                        作成日: {new Date(loan.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      loan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {loan.status === 'active' ? '返済中' : '完済'}
                    </span>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1">元本 (P)</label>
                    <input
                      type="number"
                      value={editForm.amount || ''}
                      onChange={(e) => setEditForm({...editForm, amount: e.target.value === '' ? 0 : Number(e.target.value)})} 
                      placeholder="例: 10000"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-gray-900 font-bold"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-900 mb-1">現在残高 (P)</label>
                    <input
                      type="number"
                      value={editForm.remaining || ''} 
                      onChange={(e) => setEditForm({...editForm, remaining: e.target.value === '' ? 0 : Number(e.target.value)})}
                      placeholder="例: 10000"
                      className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg text-gray-900 font-bold"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={handleUpdateLoan}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700"
                    >
                      保存
                    </button>
                    <button
                      onClick={() => setEditingLoan(null)}
                      className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                // 表示モード
                <>
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="font-bold text-gray-900 text-lg">
                        {loan.lender?.username} → {loan.borrower?.username}
                      </p>
                      <p className="text-xs text-gray-800 font-semibold">
                        作成日: {new Date(loan.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      loan.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {loan.status === 'active' ? '返済中' : '完済'}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs font-bold text-gray-800">元本</p>
                      <p className="text-xl font-black text-gray-900">{loan.amount.toLocaleString()} P</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs font-bold text-gray-800">残高</p>
                      <p className="text-xl font-black text-violet-600">{loan.remaining.toLocaleString()} P</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingLoan(loan)
                        setEditForm({ amount: loan.amount, remaining: loan.remaining })
                      }}
                      className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      編集
                    </button>
                    
                    {loan.status === 'active' && (
                      <button
                        onClick={() => handleCompleteLoan(loan.id)}
                        className="flex-1 py-2 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        完済
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteLoan(loan.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
          
          {loans.length === 0 && (
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
              <p className="text-gray-900 font-bold">ローンはまだありません</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}