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
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl" />
        
        <div className="relative z-10">
          <div className="inline-block mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl transform rotate-12">
              <span className="text-3xl transform -rotate-12">🎰</span>
            </div>
          </div>
          <h1 className="text-white text-6xl font-black mb-4 leading-tight">
            We Are<br />Pretty Cure!
          </h1>
          <p className="text-white/90 text-xl font-medium">
            Poker Management System
          </p>
          <div className="mt-6 flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/80 text-sm">システム稼働中</span>
          </div>
        </div>
        
        <div className="space-y-4 relative z-10">
          {/* 1つ目：統計分析 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-lg">統計分析</p>
                <p className="text-white/70 text-sm">AIプレイスタイル診断</p>
              </div>
            </div>
          </div>
          
          {/* 2つ目：ポーカーレッスン */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-lg">ポーカーレッスン</p>
                <p className="text-white/70 text-sm">戦略とテクニックを学ぶ</p>
              </div>
            </div>
          </div>

          {/* 3つ目：収支管理 */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 transform hover:scale-105">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-white font-bold text-lg">収支管理</p>
                <p className="text-white/70 text-sm">ゲーム結果を簡単記録</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右側 - ログインフォーム */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
        {/* 背景装飾 */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-violet-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        
        <div className="w-full max-w-md relative z-10">
          {/* モバイル用ロゴ */}
          <div className="lg:hidden mb-8 text-center">
            <div className="inline-block mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl">
                <span className="text-3xl">🎰</span>
              </div>
            </div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              We Are Pretty Cure!
            </h1>
            <p className="text-gray-700 mt-2 font-medium">Poker Management System</p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              {isSignUp ? 'アカウント作成' : 'ログイン'}
            </h2>
            <p className="text-gray-700 mb-8 font-medium">
              {isSignUp ? '新規アカウントを作成します' : 'アカウントにログインします'}
            </p>

            {/* 成功メッセージ表示 */}
            {success && (
              <div className="p-4 rounded-2xl mb-6 border-2 bg-green-50 border-green-300">
                <p className="text-green-800 font-semibold mb-3">{success}</p>
                <div className="bg-white rounded-xl p-4 text-sm space-y-2.5">
                  <p className="text-gray-800 font-semibold">確認メールが届かなくても大丈夫です</p>
                  <p className="text-gray-700">
                    メール確認なしで<strong>すぐにログイン</strong>していただけます。
                    上記のログインフォームからログインしてください。
                  </p>
                  <div className="border-t pt-2 mt-2">
                    <p className="text-gray-600 text-xs">
                      メールが届く場合もあります。念のため<strong>スパムフォルダ</strong>もご確認ください。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* エラーメッセージ表示 */}
            {error && (
              <div className={`p-4 rounded-2xl mb-6 font-semibold border-2 ${
                error.includes('利用停止中')
                  ? 'bg-yellow-50 text-yellow-800 border-yellow-300'
                  : 'bg-red-50 text-red-800 border-red-300'
              }`}>
                {error}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  メールアドレス
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl 
                    focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 
                    transition-all duration-200 
                    text-gray-900 font-medium text-base
                    placeholder:text-gray-500
                    hover:border-gray-300
                    bg-white/50"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  パスワード
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl 
                    focus:ring-4 focus:ring-violet-500/20 focus:border-violet-500 
                    transition-all duration-200 
                    text-gray-900 font-medium text-base
                    placeholder:text-gray-500
                    hover:border-gray-300
                    bg-white/50"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white py-4 rounded-xl 
                  font-bold text-lg
                  hover:shadow-2xl hover:scale-105 
                  active:scale-95
                  transform transition-all duration-200 
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  shadow-lg"
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

            {/* 新規登録時の補足説明 */}
            {isSignUp && (
              <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-blue-800 font-semibold text-sm mb-2">
                  アカウント作成後について
                </p>
                <ul className="text-blue-700 text-xs space-y-1.5 ml-4">
                  <li>• 確認メールの受信を待たずに<strong>すぐログイン可能</strong>です</li>
                  <li>• 作成したメールアドレスとパスワードでログインしてください</li>
                  <li>• スパムフォルダも念のためご確認ください</li>
                </ul>
              </div>
            )}

            <div className="mt-8 text-center">
              <span className="text-gray-700 font-medium">
                {isSignUp ? 'すでにアカウントをお持ちですか？' : 'アカウントをお持ちでない方は'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                  setSuccess('')
                }}
                className="ml-2 text-violet-600 hover:text-violet-700 font-bold hover:underline transition-all"
              >
                {isSignUp ? 'ログイン' : '新規登録'}
              </button>
            </div>
          </div>

          {/* フッター */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 text-sm font-medium">© 2024 We Are Pretty Cure! Poker Management System</p>
          </div>
        </div>
      </div>
    </div>
  )
}