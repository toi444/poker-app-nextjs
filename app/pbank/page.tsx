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

const SuccessAnimation = ({ message, show }: { message: string; show: boolean }) => {
  if (!show) return null

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-3xl blur-2xl opacity-75 animate-pulse" />
        <div className="relative bg-gradient-to-br from-green-600 to-emerald-600 rounded-3xl p-1 shadow-2xl animate-bounce-in pointer-events-auto">
          <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-8 text-center">
            <div className="text-6xl mb-3 animate-spin-slow">🎉</div>
            <p className="text-2xl font-black text-white drop-shadow-glow">{message}</p>
          </div>
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
  
  const [totalLent, setTotalLent] = useState(0)
  const [totalBorrowed, setTotalBorrowed] = useState(0)
  const [pendingApps, setPendingApps] = useState(0)
  const [netInterest, setNetInterest] = useState(0)
  
  const [selectedLender, setSelectedLender] = useState('')
  const [loanAmount, setLoanAmount] = useState(1000)
  const [loanMessage, setLoanMessage] = useState('')
  const [confirmApply, setConfirmApply] = useState(false)
  
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
      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, username, email, active')
        .eq('active', true)
        .neq('id', user.id)
      
      setActiveUsers(usersData || [])
      
      const { data: loansData } = await supabase
        .from('loans')
        .select(`
          *,
          lender:profiles!loans_lender_id_fkey(id, username, active),
          borrower:profiles!loans_borrower_id_fkey(id, username, active)
        `)
        .or(`lender_id.eq.${user.id},borrower_id.eq.${user.id}`)
      
      setLoans(loansData || [])
      
      const { data: appsData } = await supabase
        .from('loan_applications')
        .select(`
          *,
          from_user:profiles!loan_applications_from_user_id_fkey(id, username, active),
          to_user:profiles!loan_applications_to_user_id_fkey(id, username, active)
        `)
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      
      setApplications(appsData || [])
      
      const { data: interestData } = await supabase
        .from('interest_records')
        .select('*')
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
      
      setInterests(interestData || [])
      
      calculateStats(loansData || [], appsData || [], interestData || [])
      
    } catch (error) {
      console.error('データ読み込みエラー:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (loansData: Loan[], appsData: LoanApplication[], interestData: InterestRecord[]) => {
    if (!user) return
    
    const lentSum = loansData
      .filter(loan => loan.lender_id === user.id && loan.status === 'active')
      .reduce((sum, loan) => sum + (loan.remaining || 0), 0)
    setTotalLent(lentSum)
    
    const borrowedSum = loansData
      .filter(loan => loan.borrower_id === user.id && loan.status === 'active')
      .reduce((sum, loan) => sum + (loan.remaining || 0), 0)
    setTotalBorrowed(borrowedSum)
    
    const pendingCount = appsData
      .filter(app => app.to_user_id === user.id && app.status === '申込中')
      .length
    setPendingApps(pendingCount)
    
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
          
          await supabase
            .from('loans')
            .update({
              remaining: newRemaining,
              last_interest_date: today.toISOString()
            })
            .eq('id', loan.id)
          
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
      
      showSuccessMessage(`${lenderUser?.username}さんに${loanAmount.toLocaleString()} Pの融資を申込みました！`)
      setLoanAmount(1000)
      setLoanMessage('')
      setSelectedLender('')
      setConfirmApply(false)
      
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
      const { error: updateError } = await supabase
        .from('loan_applications')
        .update({ status: '承認済' })
        .eq('id', appId)
      
      if (updateError) throw updateError
      
      if (app.type === 'loan') {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <PiggyBank className="w-10 h-10 text-emerald-500 animate-pulse" />
          </div>
          <div className="absolute inset-0 animate-ping opacity-20">
            <div className="w-24 h-24 border-4 border-emerald-500 rounded-full" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
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

        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
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

        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
      
      <SuccessAnimation message={successMessage} show={showSuccess} />
      
      <div className="container max-w-md mx-auto p-4 pb-20">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="relative group mb-4"
          >
            <div className="absolute inset-0 bg-emerald-600 blur-lg opacity-0 group-hover:opacity-75 transition-opacity rounded-full" />
            <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm border-2 border-emerald-500/50 hover:border-emerald-400 transition-all">
              <ArrowLeft className="h-5 w-5 text-emerald-300" />
            </div>
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-600 blur-2xl opacity-50" />
            <h1 className="relative text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-400 to-teal-400 flex items-center gap-3 drop-shadow-glow">
              <PiggyBank className="w-10 h-10 text-emerald-400" />
              P-BANK
            </h1>
          </div>
          <p className="text-emerald-200 mt-2 font-semibold">融資管理システム</p>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-600 blur-xl opacity-50 animate-pulse" />
          <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-4 text-white shadow-2xl border-2 border-blue-400/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 animate-pulse" />
              <p className="text-sm font-black drop-shadow-glow">毎月1日に残高の10%が利息として自動加算されます</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-green-600 blur-lg opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-green-500/50">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <p className="text-xs font-black text-green-300">貸出額</p>
              </div>
              <p className="text-2xl font-black text-green-400 drop-shadow-glow">{totalLent.toLocaleString()}</p>
              <p className="text-xs font-semibold text-green-200 mt-1">P</p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-red-600 blur-lg opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-red-500/50">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-red-400" />
                <p className="text-xs font-black text-red-300">借入額</p>
              </div>
              <p className="text-2xl font-black text-red-400 drop-shadow-glow">{totalBorrowed.toLocaleString()}</p>
              <p className="text-xs font-semibold text-red-200 mt-1">P</p>
            </div>
          </div>
          
          <div className="relative group">
            <div className={`absolute inset-0 ${netInterest >= 0 ? 'bg-blue-600' : 'bg-orange-600'} blur-lg opacity-50`} />
            <div className={`relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 ${
              netInterest >= 0 ? 'border-blue-500/50' : 'border-orange-500/50'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className={`w-5 h-5 ${netInterest >= 0 ? 'text-blue-400' : 'text-orange-400'}`} />
                <p className={`text-xs font-black ${netInterest >= 0 ? 'text-blue-300' : 'text-orange-300'}`}>利息収支</p>
              </div>
              <p className={`text-2xl font-black ${netInterest >= 0 ? 'text-blue-400' : 'text-orange-400'} drop-shadow-glow`}>
                {netInterest >= 0 ? '+' : ''}{netInterest.toLocaleString()}
              </p>
              <p className={`text-xs font-semibold ${netInterest >= 0 ? 'text-blue-200' : 'text-orange-200'} mt-1`}>P</p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-yellow-600 blur-lg opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-yellow-500/50">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <p className="text-xs font-black text-yellow-300">承認待ち</p>
              </div>
              <p className="text-2xl font-black text-yellow-400 drop-shadow-glow">{pendingApps}</p>
              <p className="text-xs font-semibold text-yellow-200 mt-1">件</p>
            </div>
          </div>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-1.5 border-2 border-purple-500/50">
            <div className="grid grid-cols-3 gap-1">
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
                  className={`py-3 px-2 rounded-xl text-xs font-medium transition-all relative ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg transform scale-105'
                      : 'text-purple-200 hover:bg-white/10'
                  }`}
                >
                  <span className="block text-base mb-1">{tab.icon}</span>
                  <span className="text-[10px] font-black leading-tight">{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTab === 'apply' && (
          <div className="space-y-4 animate-slide-in">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-600 blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-violet-500/50">
                <h3 className="font-black text-white mb-4 flex items-center gap-2">
                  <Send className="w-5 h-5 text-violet-400" />
                  新規融資申込
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-black text-violet-300 mb-2">
                      融資元を選択
                    </label>
                    <select
                      value={selectedLender}
                      onChange={(e) => setSelectedLender(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-violet-500/50 rounded-xl text-white bg-black/40 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 font-semibold backdrop-blur-sm"
                    >
                      <option value="" className="bg-gray-900">選択してください</option>
                      {activeUsers.map(u => (
                        <option key={u.id} value={u.id} className="bg-gray-900">{u.username}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-black text-violet-300 mb-2">
                      申込金額 (P)
                    </label>
                    <input
                      type="number"
                      value={loanAmount || ''}
                      onChange={(e) => setLoanAmount(parseInt(e.target.value) || 0)}
                      min={1000}
                      step={1000}
                      className="w-full px-4 py-3 border-2 border-violet-500/50 rounded-xl text-white bg-black/40 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 font-black text-lg backdrop-blur-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-black text-violet-300 mb-2">
                      メッセージ (任意)
                    </label>
                    <textarea
                      value={loanMessage}
                      onChange={(e) => setLoanMessage(e.target.value)}
                      placeholder="融資の目的など..."
                      className="w-full px-4 py-3 border-2 border-violet-500/50 rounded-xl text-white bg-black/40 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 font-medium backdrop-blur-sm placeholder-purple-400"
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center bg-white/5 rounded-xl p-3 border border-white/10">
                    <input
                      type="checkbox"
                      checked={confirmApply}
                      onChange={(e) => setConfirmApply(e.target.checked)}
                      className="mr-3 w-5 h-5 text-violet-600"
                      id="confirm-apply"
                    />
                    <label htmlFor="confirm-apply" className="text-sm font-semibold text-white">
                      上記の内容で申込することを確認しました
                    </label>
                  </div>
                  
                  <button
                    onClick={handleLoanApplication}
                    disabled={!confirmApply || !selectedLender || loanAmount < 100}
                    className={`w-full py-4 rounded-xl font-black transition-all transform ${
                      confirmApply && selectedLender && loanAmount >= 100
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                        : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    📤 申込する
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'repay' && (
          <div className="space-y-4 animate-slide-in">
            {loans.filter(loan => loan.borrower_id === user?.id && loan.status === 'active').map(loan => (
              <div key={loan.id} className="relative">
                <div className="absolute inset-0 bg-red-600 blur-xl opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-white text-lg">
                        {loan.lender?.username}さんへの借入
                      </h4>
                      <p className="text-xs font-semibold text-red-200 mt-1">
                        借入日: {new Date(loan.created_at).toLocaleDateString('ja-JP')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-red-300">現在残高</p>
                      <p className="text-3xl font-black text-red-400 drop-shadow-glow">{loan.remaining.toLocaleString()}</p>
                      <p className="text-xs font-semibold text-red-200">P</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-red-500/20 to-pink-500/20 rounded-xl p-4 mb-4 border border-red-400/30">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs font-black text-red-300">元本:</span>
                        <p className="font-black text-white text-lg">{loan.amount.toLocaleString()} P</p>
                      </div>
                      <div>
                        <span className="text-xs font-black text-orange-300">利息合計:</span>
                        <p className="font-black text-orange-400 text-lg drop-shadow-glow">
                          +{(loan.remaining - loan.amount).toLocaleString()} P
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="返済額"
                      defaultValue=""
                      min={1000}
                      max={loan.remaining}
                      step={1000}
                      className="flex-1 px-4 py-3 border-2 border-red-500/50 rounded-xl text-white bg-black/40 font-black backdrop-blur-sm placeholder-red-400"
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
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-black hover:shadow-lg transition-all"
                    >
                      返済申請
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {loans.filter(loan => loan.borrower_id === user?.id && loan.status === 'active').length === 0 && (
              <div className="relative">
                <div className="absolute inset-0 bg-green-600 blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-green-500/50">
                  <p className="text-white font-black text-xl">🎉 現在借入はありません</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'lending' && (
          <div className="space-y-4 animate-slide-in">
            {loans.filter(loan => loan.lender_id === user?.id && loan.status === 'active').map(loan => (
              <div key={loan.id} className="relative">
                <div className="absolute inset-0 bg-green-600 blur-xl opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-white text-lg">
                        {loan.borrower?.username}さん
                      </h4>
                      <p className="text-xs font-semibold text-green-200 mt-1">
                        貸付日: {new Date(loan.created_at).toLocaleDateString('ja-JP')}
                      </p>
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-green-300">元本:</span>
                          <span className="font-black text-white">{loan.amount.toLocaleString()} P</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-emerald-300">利息収入:</span>
                          <span className="font-black text-emerald-400 drop-shadow-glow">
                            +{(loan.remaining - loan.amount).toLocaleString()} P
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-green-300">現在残高</p>
                      <p className="text-3xl font-black text-green-400 drop-shadow-glow">{loan.remaining.toLocaleString()}</p>
                      <p className="text-xs font-semibold text-green-200">P</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {loans.filter(loan => loan.lender_id === user?.id && loan.status === 'active').length === 0 && (
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-purple-500/50">
                  <p className="text-white font-black text-xl">📝 貸出中の融資はありません</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="space-y-4 animate-slide-in">
            <h3 className="font-black text-white text-lg">受信した申請</h3>
            
            {applications.filter(app => app.to_user_id === user?.id && app.status === '申込中').map(app => (
              <div key={app.id} className="relative">
                <div className="absolute inset-0 bg-yellow-600 blur-xl opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-l-4 border-yellow-400">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-black text-white">
                        {app.from_user?.username}さんからの{app.type === 'loan' ? '融資' : '返済'}申請
                      </h4>
                      <p className="text-xs font-semibold text-yellow-200 mt-1">
                        {new Date(app.created_at).toLocaleString('ja-JP')}
                      </p>
                      {app.message && (
                        <p className="text-sm font-medium text-white mt-3 bg-white/5 rounded-xl p-3 border border-white/10">
                          {app.message}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-yellow-300">申請額</p>
                      <p className="text-2xl font-black text-yellow-400 drop-shadow-glow">{app.amount.toLocaleString()}</p>
                      <p className="text-xs font-semibold text-yellow-200">P</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(app.id, app)}
                      className="flex-1 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-black hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      承認
                    </button>
                    <button
                      onClick={() => handleReject(app.id)}
                      className="flex-1 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-black hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      却下
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {applications.filter(app => app.to_user_id === user?.id && app.status === '申込中').length === 0 && (
              <div className="relative">
                <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-50 animate-pulse" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-8 text-center border-2 border-indigo-500/50">
                  <p className="text-white font-black text-xl">📝 承認待ちの申請はありません</p>
                </div>
              </div>
            )}
            
            <h3 className="font-black text-white text-lg mt-6">自分の申請状況</h3>
            
            {applications.filter(app => app.from_user_id === user?.id && app.status === '申込中').map(app => (
              <div key={app.id} className="bg-black/40 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <p className="text-sm font-semibold text-white">
                  • {app.to_user?.username}さんへの{app.type === 'loan' ? '融資' : '返済'}申請
                  <span className="font-black text-violet-400 ml-2">{app.amount.toLocaleString()} P</span>
                  <span className="text-yellow-400 ml-2 text-xs">(承認待ち)</span>
                </p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'interest' && (
          <div className="space-y-4 animate-slide-in">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/50">
                <h3 className="font-black text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  利息収支サマリー
                </h3>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-3 text-center border border-green-400/30">
                    <p className="text-xs font-black text-green-300">受取累計</p>
                    <p className="text-xl font-black text-green-400 drop-shadow-glow">
                      {interests.filter(i => i.to_user_id === user?.id)
                        .reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                    </p>
                    <p className="text-xs font-semibold text-green-200">P</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl p-3 text-center border border-red-400/30">
                    <p className="text-xs font-black text-red-300">支払累計</p>
                    <p className="text-xl font-black text-red-400 drop-shadow-glow">
                      {interests.filter(i => i.from_user_id === user?.id)
                        .reduce((sum, i) => sum + i.amount, 0).toLocaleString()}
                    </p>
                    <p className="text-xs font-semibold text-red-200">P</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-xl p-3 text-center border border-blue-400/30">
                    <p className="text-xs font-black text-blue-300">収支</p>
                    <p className="text-xl font-black text-blue-400 drop-shadow-glow">
                      {netInterest >= 0 ? '+' : ''}{netInterest.toLocaleString()}
                    </p>
                    <p className="text-xs font-semibold text-blue-200">P</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/50">
                <h3 className="font-black text-white mb-4">💡 次回利息予測（翌月1日）</h3>
                
                <div className="space-y-3">
                  {loans.filter(loan => loan.lender_id === user?.id && loan.status === 'active').map(loan => (
                    <div key={loan.id} className="flex items-center justify-between p-3 bg-green-500/20 rounded-xl border border-green-400/30">
                      <span className="text-sm font-semibold text-white">{loan.borrower?.username}さんから</span>
                      <span className="font-black text-green-400 drop-shadow-glow">+{Math.floor(loan.remaining * 0.1).toLocaleString()} P</span>
                    </div>
                  ))}
                  
                  {loans.filter(loan => loan.borrower_id === user?.id && loan.status === 'active').map(loan => (
                    <div key={loan.id} className="flex items-center justify-between p-3 bg-red-500/20 rounded-xl border border-red-400/30">
                      <span className="text-sm font-semibold text-white">{loan.lender?.username}さんへ</span>
                      <span className="font-black text-red-400 drop-shadow-glow">-{Math.floor(loan.remaining * 0.1).toLocaleString()} P</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-3 animate-slide-in">
            {[...loans, ...applications]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .slice(0, 20)
              .map((item, index) => (
                <div key={index} className="bg-black/60 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-black text-white">
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
                      <p className="text-xs font-semibold text-purple-200">
                        {new Date(item.created_at).toLocaleString('ja-JP')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-white">
                        {item.amount.toLocaleString()} P
                      </p>
                      <p className="text-xs font-black text-gray-300">
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