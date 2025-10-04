'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { TrendingUp, BarChart3, BookOpen, Sparkles, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        
        setSuccess('アカウントを作成しました！')
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        if (data.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('active, username')
            .eq('id', data.user.id)
            .single()
          
          if (profile) {
            if (profile.active === false) {
              await supabase.auth.signOut()
              setError('このアカウントは現在利用停止中です。管理者にお問い合わせください。')
              return
            }
          }
        }
        
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* 左側 - ダークグラデーション背景 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-12 flex-col justify-between relative overflow-hidden">
        {/* 背景アニメーション */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-pink-600 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600 rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="relative z-10">
          <div className="inline-block mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl animate-pulse" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl transform rotate-12">
                <Sparkles className="w-10 h-10 text-white transform -rotate-12 drop-shadow-glow animate-spin-slow" />
              </div>
            </div>
          </div>
          <h1 className="text-white text-7xl font-black mb-4 leading-tight drop-shadow-2xl">
            We Are<br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent animate-shimmer">
              Pretty Cure!
            </span>
          </h1>
          <p className="text-white/90 text-2xl font-bold mb-8 drop-shadow-lg">
            Gamble Management System
          </p>
          <div className="flex items-center space-x-3 bg-black/30 backdrop-blur-sm rounded-2xl px-4 py-3 border-2 border-green-500/50 w-fit">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
            <span className="text-green-400 text-sm font-bold drop-shadow-glow">システム稼働中</span>
          </div>
        </div>
        
        <div className="space-y-4 relative z-10">
          {/* 1. Game Report */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-purple-500/50 hover:border-purple-400 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-purple-600 blur-lg animate-pulse" />
                  <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-2xl border-2 border-white/20">
                    <TrendingUp className="w-8 h-8 text-white drop-shadow-glow" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-black text-xl drop-shadow-glow">Game Report</p>
                  <p className="text-purple-200 text-sm font-bold">すべてのゲームの収支記録</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 2. Statistics */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-blue-500/50 hover:border-blue-400 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 blur-lg animate-pulse" />
                  <div className="relative w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center shadow-2xl border-2 border-white/20">
                    <BarChart3 className="w-8 h-8 text-white drop-shadow-glow" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-black text-xl drop-shadow-glow">Statistics</p>
                  <p className="text-blue-200 text-sm font-bold">個人データの分析</p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Lesson */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-black/40 backdrop-blur-lg rounded-2xl p-6 border-2 border-pink-500/50 hover:border-pink-400 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-pink-600 blur-lg animate-pulse" />
                  <div className="relative w-16 h-16 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center shadow-2xl border-2 border-white/20">
                    <BookOpen className="w-8 h-8 text-white drop-shadow-glow" />
                  </div>
                </div>
                <div>
                  <p className="text-white font-black text-xl drop-shadow-glow">Lesson</p>
                  <p className="text-pink-200 text-sm font-bold">ゲームの戦術や確率計算を学ぶ</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右側 - ログインフォーム */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-600 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1.5s' }} />
        
        <div className="w-full max-w-md relative z-10">
          {/* モバイル用ロゴ */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-block mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl animate-pulse" />
                <div className="relative w-20 h-20 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 rounded-2xl flex items-center justify-center shadow-2xl">
                  <Sparkles className="w-10 h-10 text-white drop-shadow-glow animate-spin-slow" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent animate-shimmer mb-2">
              We Are Pretty Cure!
            </h1>
            <p className="text-purple-200 text-lg font-bold">Gamble Management System</p>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-75" />
            <div className="relative bg-black/60 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border-2 border-purple-500/50">
              <h2 className="text-4xl font-black text-white mb-2 drop-shadow-glow">
                {isSignUp ? 'アカウント作成' : 'ログイン'}
              </h2>
              <p className="text-purple-200 mb-8 font-bold text-lg">
                {isSignUp ? '新規アカウントを作成します' : 'アカウントにログインします'}
              </p>

              {success && (
                <div className="relative group mb-6 animate-slide-in">
                  <div className="absolute inset-0 bg-green-600 blur-lg opacity-50" />
                  <div className="relative p-5 rounded-2xl bg-green-950/50 backdrop-blur-sm border-2 border-green-500/50">
                    <div className="flex items-start gap-3 mb-3">
                      <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1 drop-shadow-glow" />
                      <p className="text-green-300 font-bold text-lg">{success}</p>
                    </div>
                    <div className="bg-black/40 rounded-xl p-4 text-sm space-y-3 border border-green-500/30">
                      <p className="text-green-200 font-bold">確認メールが届かなくても大丈夫です</p>
                      <p className="text-green-100">
                        メール確認なしで<strong className="text-green-300">すぐにログイン</strong>していただけます。
                      </p>
                      <div className="border-t border-green-500/30 pt-3">
                        <p className="text-green-200 text-xs">
                          メールが届く場合もあります。念のため<strong>スパムフォルダ</strong>もご確認ください。
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="relative group mb-6 animate-slide-in">
                  <div className={`absolute inset-0 blur-lg opacity-50 ${
                    error.includes('利用停止中') ? 'bg-yellow-600' : 'bg-red-600'
                  }`} />
                  <div className={`relative p-5 rounded-2xl backdrop-blur-sm border-2 ${
                    error.includes('利用停止中')
                      ? 'bg-yellow-950/50 border-yellow-500/50'
                      : 'bg-red-950/50 border-red-500/50'
                  }`}>
                    <div className="flex items-start gap-3">
                      <AlertCircle className={`w-6 h-6 flex-shrink-0 mt-1 drop-shadow-glow ${
                        error.includes('利用停止中') ? 'text-yellow-400' : 'text-red-400'
                      }`} />
                      <p className={`font-bold text-lg ${
                        error.includes('利用停止中') ? 'text-yellow-300' : 'text-red-300'
                      }`}>
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-purple-200 mb-3">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-4 bg-black/60 backdrop-blur-sm border-2 border-purple-500/50 rounded-2xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 text-white font-medium text-base placeholder:text-purple-300/50 hover:border-purple-400"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-purple-200 mb-3">
                    パスワード
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 bg-black/60 backdrop-blur-sm border-2 border-purple-500/50 rounded-2xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400 transition-all duration-200 text-white font-medium text-base placeholder:text-purple-300/50 hover:border-purple-400"
                    placeholder="••••••••"
                  />
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={handleAuth}
                    disabled={loading}
                    className="relative w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-5 rounded-2xl font-black text-xl hover:shadow-2xl hover:scale-105 active:scale-95 transform transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-2xl border-2 border-white/20"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin drop-shadow-glow" />
                        <span className="drop-shadow-glow">処理中...</span>
                      </span>
                    ) : (
                      <span className="drop-shadow-glow">
                        {isSignUp ? 'アカウント作成' : 'ログイン'}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {isSignUp && (
                <div className="mt-6 bg-blue-950/50 backdrop-blur-sm border-2 border-blue-500/50 rounded-2xl p-5 animate-slide-in">
                  <p className="text-blue-300 font-bold text-base mb-3">
                    アカウント作成後について
                  </p>
                  <ul className="text-blue-200 text-sm space-y-2 ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>確認メールの受信を待たずに<strong className="text-blue-300">すぐログイン可能</strong>です</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>作成したメールアドレスとパスワードでログインしてください</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-400 font-bold">•</span>
                      <span>スパムフォルダも念のためご確認ください</span>
                    </li>
                  </ul>
                </div>
              )}

              <div className="mt-8 text-center">
                <span className="text-purple-200 font-medium text-base">
                  {isSignUp ? 'すでにアカウントをお持ちですか？' : 'アカウントをお持ちでない方は'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp)
                    setError('')
                    setSuccess('')
                  }}
                  className="ml-2 text-pink-400 hover:text-pink-300 font-black hover:underline transition-all text-base drop-shadow-glow"
                >
                  {isSignUp ? 'ログイン' : '新規登録'}
                </button>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-purple-300 text-sm font-medium">© 2024 We Are Pretty Cure! Gamble Management System</p>
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
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-shimmer {
          background: linear-gradient(90deg, #a855f7, #ec4899, #f97316, #a855f7);
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  )
}