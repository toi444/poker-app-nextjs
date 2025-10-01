'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setError('確認メールを送信しました')
      } else {
        // ログイン処理
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        
        // ログイン成功後、ユーザーのアクティブ状態をチェック
        if (data.user) {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('active, username')
            .eq('id', data.user.id)
            .single()
          
          // プロフィールが取得できた場合のチェック
          if (profile) {
            // activeがfalseの場合はログアウトしてエラー表示
            if (profile.active === false) {
              await supabase.auth.signOut()
              setError('このアカウントは現在利用停止中です。管理者にお問い合わせください。')
              return
            }
          }
          // プロフィールが取得できない場合もログインを許可（初回ログインの可能性）
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
      {/* 左側 - グラデーション背景 */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-12 flex-col justify-between">
        <div>
          <h1 className="text-white text-5xl font-bold mb-4">
            We Are<br />Pretty Cure!
          </h1>
          <p className="text-white/80 text-lg">
            Poker Management System
          </p>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">収支管理</p>
                <p className="text-white/60 text-sm">ゲーム結果を簡単記録</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-2xl p-6 border border-white/20">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">P-BANK</p>
                <p className="text-white/60 text-sm">融資システム搭載</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右側 - ログインフォーム */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* モバイル用ロゴ */}
          <div className="lg:hidden mb-8 text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              We Are Pretty Cure!
            </h1>
            <p className="text-gray-600 mt-2">Poker Management System</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'アカウント作成' : 'ログイン'}
            </h2>
            <p className="text-gray-600 mb-8">
              {isSignUp ? '新規アカウントを作成します' : 'アカウントにログインします'}
            </p>

            {error && (
              <div className={`p-4 rounded-xl mb-6 ${
                error.includes('確認メール') 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : error.includes('利用停止中')
                  ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    処理中...
                  </span>
                ) : (
                  isSignUp ? 'アカウント作成' : 'ログイン'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-gray-600">
                {isSignUp ? 'すでにアカウントをお持ちですか？' : 'アカウントをお持ちでない方は'}
              </span>
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-violet-600 hover:text-violet-700 font-semibold"
              >
                {isSignUp ? 'ログイン' : '新規登録'}
              </button>
            </div>
          </div>

          {/* ソーシャルログイン（将来実装用） */}
          <div className="mt-8 text-center text-gray-500">
            <p className="text-sm">© 2024 We Are Pretty Cure!</p>
          </div>
        </div>
      </div>
    </div>
  )
}