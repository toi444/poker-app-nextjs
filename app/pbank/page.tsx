'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  ArrowLeft, 
  DollarSign, 
  TrendingUp, 
  Users, 
  Clock,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Sparkles,
  CreditCard,
  FileText,
  PiggyBank,
  BarChart3
} from 'lucide-react'

// 型定義
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
  due_date?: string
  last_interest_date?: string
  lender?: Profile
  borrower?: Profile
}

interface LoanApplication {
  id: string
  type: 'loan' | 'repayment'
  from_user_id: string
  to_user_id: string
  amount: number
  loan_id?: string
  status: '申込中' | '承認済' | '却下'
  message?: string
  created_at: string
  expire_date: string
  from_user?: Profile
  to_user?: Profile
}

interface InterestRecord {
  id: string
  loan_id: string
  amount: number
  created_at: string
  from_user_id: string
  to_user_id: string
}

// 成功メッセージコンポーネント
const SuccessAnimation = ({ message, show }: { message: string; show: boolean }) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-6 animate-bounce-in pointer-events-auto">
        <div className="text-center">
          <div className="text-6xl mb-3 animate-spin-slow">🎉</div>
          <p className="text-xl font-bold text-gray-900">{message}</p>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-confetti"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              fontSize: `${Math.random() * 20 + 10}px`
            }}
          >
            {['🎊', '✨', '🎈', '🎉'][Math.floor(Math.random() * 4)]}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PBankPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState<'apply' | 'repay' | 'lending' | 'pending' | 'interest' | 'history'>('apply')
  const [loans, setLoans] = useState<Loan[]>([])
  const [applications, setApplications] = useState<LoanApplication[]>([])
  const [interests, setInterests] = useState<InterestRecord[]>([])
  const [activeUsers, setActiveUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  
  // 統計情報
  const [totalLent, setTotalLent] = useState(0)
  const [totalBorrowed, setTotalBorrowed] = useState(0)
  const [pendingApps, setPendingApps] = useState(0)
  const [netInterest, setNetInterest] = useState(0)
  
  // フォーム用の状態
  const [selectedLender, setSelectedLender] = useState('')
  const [loanAmount, setLoanAmount] = useState(1000)
  const [loanMessage, setLoanMessage] = useState('')
  const [confirmApply, setConfirmApply] = useState(false)
  
  // 成功メッセージ用
  const [successMessage, setSuccessMessage] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (user) {
      loadData()
      applyMonthlyInterest()
    }
  }, [user])

  const checkUser = async () => {
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
    
    if (profile) {
      setUser({ ...authUser, ...profile })
    }
  }

  const loadData = async () => {
    if (!user) return
    
    setLoading(true)
    
    try {
      // アクティブユーザーのみ取得
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, username, email, active')
        .eq('active', true)
        .neq('id', user.id)
      
      setActiveUsers(usersData || [])
      
      // 融資情報を取得（関連プロフィール付き）
      const { data: loansData } = await supabase
        .from('loans')
        .select(`
          *,
          lender:profiles!loans_lender_id_fkey(id, username, active),
          borrower:profiles!loans_borrower_id_fkey(id, username, active)
        `)
        .or(`lender_id.eq.${user.id},borrower_id.eq.${user.id}`)
      
      setLoans(loansData || [])
      
      // 申請情報を取得
      const { data: appsData } = await supabase
        .from('loan_applications')
        .select(`
          *,
          from_user:profiles!loan_applications_from_user_id_fkey(id, username, active),
          to_user:profiles!loan_applications_to_user_id_fkey(id, username, active)
        `)
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      
      setApplications(appsData || [])
      
      // 利息記録を取得
      const { data: interestData } = await supabase
        .from('interest_records')
        .select('*')
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      
      setInterests(interestData || [])
      
      // 統計情報を計算
      calculateStats(loansData || [], appsData || [], interestData || [])
      
    } catch (error) {
      console.error('データ読み込みエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (loansData: Loan[], appsData: LoanApplication[], interestData: InterestRecord[]) => {
    if (!user) return
    
    // 貸出額合計
    const lentSum = loansData
      .filter(loan => loan.lender_id === user.id && loan.status === 'active')
      .reduce((sum, loan) => sum + (loan.remaining || 0), 0)
    setTotalLent(lentSum)
    
    // 借入額合計
    const borrowedSum = loansData
      .filter(loan => loan.borrower_id === user.id && loan.status === 'active')
      .reduce((sum, loan) => sum + (loan.remaining || 0), 0)
    setTotalBorrowed(borrowedSum)
    
    // 承認待ち件数
    const pendingCount = appsData
      .filter(app => app.to_user_id === user.id && app.status === '申込中')
      .length
    setPendingApps(pendingCount)
    
    // 利息収支
    const earnedInterest = interestData
      .filter(record => record.to_user_id === user.id)
      .reduce((sum, record) => sum + record.amount, 0)
    
    const paidInterest = interestData
      .filter(record => record.from_user_id === user.id)
      .reduce((sum, record) => sum + record.amount, 0)
    
    setNetInterest(earnedInterest - paidInterest)
  }

  const applyMonthlyInterest = async () => {
    const today = new Date()
    if (today.getDate() !== 1) return
    
    try {
      const { data: loansData } = await supabase
        .from('loans')
        .select('*')
        .eq('status', 'active')
      
      if (!loansData) return
      
      for (const loan of loansData) {
        const lastInterestDate = loan.last_interest_date ? new Date(loan.last_interest_date) : null
        const shouldApplyInterest = !lastInterestDate || 
          (lastInterestDate.getMonth() !== today.getMonth() || 
           lastInterestDate.getFullYear() !== today.getFullYear())
        
        if (shouldApplyInterest) {
          const interestAmount = Math.floor(loan.remaining * 0.1)
          const newRemaining = loan.remaining + interestAmount
          
          // ローン残高を更新
          await supabase
            .from('loans')
            .update({
              remaining: newRemaining,
              last_interest_date: today.toISOString()
            })
            .eq('id', loan.id)
          
          // 利息記録を作成
          await supabase
            .from('interest_records')
            .insert({
              loan_id: loan.id,
              amount: interestAmount,
              from_user_id: loan.borrower_id,
              to_user_id: loan.lender_id
            })
        }
      }
      
      // データを再読み込み
      loadData()
    } catch (error) {
      console.error('利息適用エラー:', error)
    }
  }

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message)
    setShowSuccess(true)
    setTimeout(() => {
      setShowSuccess(false)
    }, 3000)
  }

  const handleLoanApplication = async () => {
    if (!user || !selectedLender || loanAmount < 100) return
    
    const lenderUser = activeUsers.find(u => u.id === selectedLender)
    
    try {
      const { error } = await supabase
        .from('loan_applications')
        .insert({
          type: 'loan',
          from_user_id: user.id,
          to_user_id: selectedLender,
          amount: loanAmount,
          status: '申込中',
          message: loanMessage,
          expire_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      
      if (error) throw error
      
      // 成功処理
      showSuccessMessage(`${lenderUser?.username}さんに${loanAmount.toLocaleString()} Pの融資を申込みました！`)
      setLoanAmount(1000)
      setLoanMessage('')
      setSelectedLender('')
      setConfirmApply(false)
      
      // データ再読み込み
      setTimeout(() => {
        loadData()
      }, 500)
      
    } catch (error) {
      console.error('申込エラー:', error)
      alert('申込に失敗しました')
    }
  }

  const handleRepayment = async (loanId: string, amount: number) => {
    if (!user || amount <= 0) return
    
    const loan = loans.find(l => l.id === loanId)
    if (!loan) return
    
    try {
      const { error } = await supabase
        .from('loan_applications')
        .insert({
          type: 'repayment',
          from_user_id: user.id,
          to_user_id: loan.lender_id,
          amount: Math.min(amount, loan.remaining),
          loan_id: loanId,
          status: '申込中',
          expire_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        })
      
      if (error) throw error
      
      showSuccessMessage(`${amount.toLocaleString()} Pの返済申請を送信しました！`)
      loadData()
      
    } catch (error) {
      console.error('返済申請エラー:', error)
      alert('返済申請に失敗しました')
    }
  }

  const handleApprove = async (appId: string, app: LoanApplication) => {
    try {
      // 申請を承認済みに更新
      const { error: updateError } = await supabase
        .from('loan_applications')
        .update({ status: '承認済' })
        .eq('id', appId)
      
      if (updateError) throw updateError
      
      if (app.type === 'loan') {
        // 新規融資を作成
        const { error: loanError } = await supabase
          .from('loans')
          .insert({
            lender_id: app.to_user_id,
            borrower_id: app.from_user_id,
            amount: app.amount,
            remaining: app.amount,
            status: 'active',
            last_interest_date: new Date().toISOString()
          })
        
        if (loanError) throw loanError
        showSuccessMessage('融資を承認しました！')
        
      } else if (app.type === 'repayment' && app.loan_id) {
        // 返済処理
        const loan = loans.find(l => l.id === app.loan_id)
        if (loan) {
          const newRemaining = Math.max(0, loan.remaining - app.amount)
          
          const { error: loanUpdateError } = await supabase
            .from('loans')
            .update({
              remaining: newRemaining,
              status: newRemaining === 0 ? 'completed' : 'active'
            })
            .eq('id', app.loan_id)
          
          if (loanUpdateError) throw loanUpdateError
          showSuccessMessage('返済を承認しました！')
        }
      }
      
      loadData()
      
    } catch (error) {
      console.error('承認エラー:', error)
      alert('承認処理に失敗しました')
    }
  }

  const handleReject = async (appId: string) => {
    try {
      const { error } = await supabase
        .from('loan_applications')
        .update({ status: '却下' })
        .eq('id', appId)
      
      if (error) throw error
      
      showSuccessMessage('申請を却下しました')
      loadData()
      
    } catch (error) {
      console.error('却下エラー:', error)
      alert('却下処理に失敗しました')
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
      <style jsx global>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        
        @keyframes confetti {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.5s ease-out;
        }
        
        .animate-confetti {
          animation: confetti 3s linear;
        }
        
        .animate-spin-slow {
          animation: spin-slow 2s linear infinite;
        }
      `}</style>
      
      <SuccessAnimation message={successMessage} show={showSuccess} />
      
      <div className="container max-w-md mx-auto p-4 pb-20">
        {/* ヘッダー with 戻るボタン */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all mb-4"
          >
            <ArrowLeft className="h-5 w-5 text-gray-900" />
          </button>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            <PiggyBank className="inline h-8 w-8 text-emerald-500 mr-2" />
            P-BANK
          </h1>
          <p className="text-gray-900 mt-2 font-medium">融資管理システム</p>
        </div>

        {/* 利息通知バナー */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl p-4 mb-6 text-white shadow-xl">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <p className="text-sm font-bold">毎月1日に残高の10%が利息として自動加算されます</p>
          </div>
        </div>

        {/* 統計カード - 数値表示に修正 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-xs font-bold text-gray-800">貸出額</p>
            </div>
            <p className="text-2xl font-black text-green-600">{totalLent.toLocaleString()} P</p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-red-100">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-5 h-5 text-red-600" />
              <p className="text-xs font-bold text-gray-800">借入額</p>
            </div>
            <p className="text-2xl font-black text-red-600">{totalBorrowed.toLocaleString()} P</p>
          </div>
          
          <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border ${
            netInterest >= 0 ? 'border-blue-100' : 'border-orange-100'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className={`w-5 h-5 ${netInterest >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              <p className="text-xs font-bold text-gray-800">利息収支</p>
            </div>
            <p className={`text-2xl font-black ${netInterest >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {netInterest >= 0 ? '+' : ''}{netInterest.toLocaleString()} P
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-yellow-100">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <p className="text-xs font-bold text-gray-800">承認待ち</p>
            </div>
            <p className="text-2xl font-black text-yellow-600">{pendingApps}件</p>
          </div>
        </div>

        {/* タブナビゲーション */}
        <div className="flex gap-1 mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg">
          {[
            { id: 'apply', icon: '💸', label: '融資申込', badge: 0 },
            { id: 'repay', icon: '💰', label: '返済', badge: 0 },
            { id: 'lending', icon: '📋', label: '貸出一覧', badge: 0 },
            { id: 'pending', icon: '✅', label: '承認待ち', badge: pendingApps },
            { id: 'interest', icon: '📈', label: '利息', badge: 0 },
            { id: 'history', icon: '📊', label: '履歴', badge: 0 }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-3 px-2 rounded-xl text-xs font-medium transition-all relative ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="block text-base mb-1">{tab.icon}</span>
              <span className="text-[10px] font-bold">{tab.label}</span>
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'apply' && (
          <div className="space-y-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-violet-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-violet-600" />
                新規融資申込
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    融資元を選択
                  </label>
                  <select
                    value={selectedLender}
                    onChange={(e) => setSelectedLender(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 font-semibold"
                  >
                    <option value="">選択してください</option>
                    {activeUsers.map(u => (
                      <option key={u.id} value={u.id}>{u.username}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    申込金額 (P)
                  </label>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(Math.max(100, parseInt(e.target.value) || 0))}
                    min={100}
                    step={1000}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 font-bold text-lg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    メッセージ (任意)
                  </label>
                  <textarea
                    value={loanMessage}
                    onChange={(e) => setLoanMessage(e.target.value)}
                    placeholder="融資の目的など..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 font-medium"
                    rows={3}
                  />
                </div>
                
                <div className="flex items-center bg-gray-50 rounded-xl p-3">
                  <input
                    type="checkbox"
                    checked={confirmApply}
                    onChange={(e) => setConfirmApply(e.target.checked)}
                    className="mr-3 w-5 h-5 text-violet-600"
                    id="confirm-apply"
                  />
                  <label htmlFor="confirm-apply" className="text-sm font-semibold text-gray-900">
                    上記の内容で申込することを確認しました
                  </label>
                </div>
                
                <button
                  onClick={handleLoanApplication}
                  disabled={!confirmApply || !selectedLender || loanAmount < 100}
                  className={`w-full py-4 rounded-xl font-bold transition-all transform ${
                    confirmApply && selectedLender && loanAmount >= 100
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  📤 申込する
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'repay' && (
          <div className="space-y-4">
            {loans.filter(loan => loan.borrower_id === user?.id && loan.status === 'active').map(loan => (
              <div key={loan.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-red-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {loan.lender?.username}さんへの借入
                    </h4>
                    <p className="text-xs font-semibold text-gray-800 mt-1">
                      借入日: {new Date(loan.created_at).toLocaleDateString('ja-JP')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-800">現在残高</p>
                    <p className="text-3xl font-black text-red-600">{loan.remaining.toLocaleString()} P</p>
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-gray-50 to-red-50 rounded-xl p-4 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs font-bold text-gray-800">元本:</span>
                      <p className="font-black text-gray-900 text-lg">{loan.amount.toLocaleString()} P</p>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-800">利息合計:</span>
                      <p className="font-black text-orange-600 text-lg">
                        +{(loan.remaining - loan.amount).toLocaleString()} P
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="返済額"
                    min={100}
                    max={loan.remaining}
                    step={1000}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-900 bg-white font-bold"
                    id={`repay-${loan.id}`}
                  />
                  <button
                    onClick={() => {
                      const input = document.getElementById(`repay-${loan.id}`) as HTMLInputElement
                      const amount = parseInt(input.value) || 0
                      if (amount >= 100) {
                        handleRepayment(loan.id, amount)
                      }
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                  >
                    返済申請
                  </button>
                </div>
              </div>
            ))}
            
            {loans.filter(loan => loan.borrower_id === user?.id && loan.status === 'active').length === 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
                <p className="text-gray-900 font-bold">🎉 現在借入はありません</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'lending' && (
          <div className="space-y-4">
            {loans.filter(loan => loan.lender_id === user?.id && loan.status === 'active').map(loan => (
              <div key={loan.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-green-100">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">
                      {loan.borrower?.username}さん
                    </h4>
                    <p className="text-xs font-semibold text-gray-800 mt-1">
                      貸付日: {new Date(loan.created_at).toLocaleDateString('ja-JP')}
                    </p>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-800">元本:</span>
                        <span className="font-black text-gray-900">{loan.amount.toLocaleString()} P</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-800">利息収入:</span>
                        <span className="font-black text-green-600">
                          +{(loan.remaining - loan.amount).toLocaleString()} P
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-800">現在残高</p>
                    <p className="text-3xl font-black text-green-600">{loan.remaining.toLocaleString()} P</p>
                  </div>
                </div>
              </div>
            ))}
            
            {loans.filter(loan => loan.lender_id === user?.id && loan.status === 'active').length === 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
                <p className="text-gray-900 font-bold">📝 貸出中の融資はありません</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 text-lg">受信した申請</h3>
            
            {applications.filter(app => app.to_user_id === user?.id && app.status === '申込中').map(app => (
              <div key={app.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border-l-4 border-yellow-400">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900">
                      {app.from_user?.username}さんからの{app.type === 'loan' ? '融資' : '返済'}申請
                    </h4>
                    <p className="text-xs font-semibold text-gray-800 mt-1">
                      {new Date(app.created_at).toLocaleString('ja-JP')}
                    </p>
                    {app.message && (
                      <p className="text-sm font-medium text-gray-900 mt-3 bg-gray-50 rounded-xl p-3">
                        {app.message}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-800">申請額</p>
                    <p className="text-2xl font-black text-gray-900">{app.amount.toLocaleString()} P</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(app.id, app)}
                    className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    承認
                  </button>
                  <button
                    onClick={() => handleReject(app.id)}
                    className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-5 h-5" />
                    却下
                  </button>
                </div>
              </div>
            ))}
            
            {applications.filter(app => app.to_user_id === user?.id && app.status === '申込中').length === 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8 text-center">
                <p className="text-gray-900 font-bold">📝 承認待ちの申請はありません</p>
              </div>
            )}
            
            <h3 className="font-bold text-gray-900 text-lg mt-6">自分の申請状況</h3>
            
            {applications.filter(app => app.from_user_id === user?.id && app.status === '申込中').map(app => (
              <div key={app.id} className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md">
                <p className="text-sm font-semibold text-gray-900">
                  • {app.to_user?.username}さんへの{app.type === 'loan' ? '融資' : '返済'}申請
                  <span className="font-black text-violet-600 ml-2">{app.amount.toLocaleString()} P</span>
                  <span className="text-yellow-600 ml-2 text-xs">(承認待ち)</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'interest' && (
          <div className="space-y-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-blue-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                利息収支サマリー
              </h3>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-3 text-center">
                  <p className="text-xs font-bold text-gray-800">受取累計</p>
                  <p className="text-xl font-black text-green-600">
                    {interests.filter(i => i.to_user_id === user?.id)
                      .reduce((sum, i) => sum + i.amount, 0).toLocaleString()} P
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-100 to-pink-100 rounded-xl p-3 text-center">
                  <p className="text-xs font-bold text-gray-800">支払累計</p>
                  <p className="text-xl font-black text-red-600">
                    {interests.filter(i => i.from_user_id === user?.id)
                      .reduce((sum, i) => sum + i.amount, 0).toLocaleString()} P
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl p-3 text-center">
                  <p className="text-xs font-bold text-gray-800">収支</p>
                  <p className="text-xl font-black text-blue-600">
                    {netInterest >= 0 ? '+' : ''}{netInterest.toLocaleString()} P
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-purple-100">
              <h3 className="font-bold text-gray-900 mb-4">💡 次回利息予測（翌月1日）</h3>
              
              <div className="space-y-3">
                {loans.filter(loan => loan.lender_id === user?.id && loan.status === 'active').map(loan => (
                  <div key={loan.id} className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                    <span className="text-sm font-semibold text-gray-900">{loan.borrower?.username}さんから</span>
                    <span className="font-black text-green-600">+{Math.floor(loan.remaining * 0.1).toLocaleString()} P</span>
                  </div>
                ))}
                
                {loans.filter(loan => loan.borrower_id === user?.id && loan.status === 'active').map(loan => (
                  <div key={loan.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                    <span className="text-sm font-semibold text-gray-900">{loan.lender?.username}さんへ</span>
                    <span className="font-black text-red-600">-{Math.floor(loan.remaining * 0.1).toLocaleString()} P</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3">
            {[...loans, ...applications]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 20)
              .map((item, index) => (
                <div key={index} className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-md">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {'lender_id' in item ? (
                          item.lender_id === user?.id ? 
                            `貸出: ${item.borrower?.username}さんへ` :
                            `借入: ${item.lender?.username}さんから`
                        ) : (
                          item.from_user_id === user?.id ?
                            `${item.type === 'loan' ? '融資' : '返済'}申請(送信)` :
                            `${item.type === 'loan' ? '融資' : '返済'}申請(受信)`
                        )}
                      </p>
                      <p className="text-xs font-semibold text-gray-800">
                        {new Date(item.created_at).toLocaleString('ja-JP')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-gray-900">
                        {item.amount.toLocaleString()} P
                      </p>
                      <p className="text-xs font-bold text-gray-800">
                        {item.status === 'active' ? '返済中' :
                         item.status === 'completed' ? '完済' :
                         item.status === '申込中' ? '承認待ち' :
                         item.status === '承認済' ? '承認済' : '却下'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}