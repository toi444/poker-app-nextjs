'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Trophy, 
  TrendingUp,
  Clock,
  Calendar,
  Camera,
  Upload,
  Check,
  X,
  Edit2,
  Save
} from 'lucide-react'

interface GameSession {
  id: string
  buy_in: number
  cash_out: number
  profit: number
  played_at: string
  play_hours: number
}

export default function ProfilePage() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState<any>({
    totalGames: 0,
    totalProfit: 0,
    winRate: 0,
    avgProfit: 0,
    totalPlayHours: 0,
    bestWin: 0,
    worstLoss: 0,
    currentStreak: 0,
    winStreak: 0,
    lossStreak: 0
  })
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadError, setUploadError] = useState('')
  
  // ユーザーネーム編集用
  const [isEditingUsername, setIsEditingUsername] = useState(false)
  const [newUsername, setNewUsername] = useState('')
  const [savingUsername, setSavingUsername] = useState(false)
  const [usernameError, setUsernameError] = useState('')
  const [usernameSuccess, setUsernameSuccess] = useState(false)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/login')
        return
      }

      setUser(authUser)

      // プロフィール情報取得
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setNewUsername(profileData.username || '')
      }

      // ゲーム統計取得
      const { data: games } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', authUser.id)
        .order('played_at', { ascending: false })

      if (games && games.length > 0) {
        calculateStats(games)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading user data:', error)
      setLoading(false)
    }
  }

  const calculateStats = (games: GameSession[]) => {
    const totalGames = games.length
    const totalProfit = games.reduce((sum, game) => sum + (game.profit || 0), 0)
    const wins = games.filter(game => game.profit > 0).length
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0
    const avgProfit = totalGames > 0 ? totalProfit / totalGames : 0
    const totalPlayHours = games.reduce((sum, game) => sum + (game.play_hours || 0), 0)
    const bestWin = Math.max(...games.map(g => g.profit || 0), 0)
    const worstLoss = Math.min(...games.map(g => g.profit || 0), 0)

    // ストリーク計算
    let currentStreak = 0
    let winStreak = 0
    let lossStreak = 0
    let tempWinStreak = 0
    let tempLossStreak = 0
    
    for (let i = 0; i < games.length; i++) {
      if (games[i].profit > 0) {
        tempWinStreak++
        tempLossStreak = 0
        if (i === 0) currentStreak = tempWinStreak
      } else {
        tempLossStreak++
        tempWinStreak = 0
        if (i === 0) currentStreak = -tempLossStreak
      }
      
      winStreak = Math.max(winStreak, tempWinStreak)
      lossStreak = Math.max(lossStreak, tempLossStreak)
    }

    setStats({
      totalGames,
      totalProfit,
      winRate,
      avgProfit,
      totalPlayHours,
      bestWin,
      worstLoss,
      currentStreak,
      winStreak,
      lossStreak
    })
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      setUploadError('')
      setUploadSuccess(false)

      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('ファイルを選択してください')
      }

      const file = e.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${user.id}-${Date.now()}.${fileExt}`

      // 古いアバターを削除（あれば）
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').slice(-2).join('/')
        await supabase.storage.from('avatars').remove([oldPath])
      }

      // 新しいアバターをアップロード
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) throw uploadError

      // 公開URLを取得
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName)

      // プロフィールを更新
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile({ ...profile, avatar_url: publicUrl })
      setUploadSuccess(true)
      setTimeout(() => setUploadSuccess(false), 3000)

    } catch (error: any) {
      console.error('Avatar upload error:', error)
      setUploadError(error.message || 'アップロードに失敗しました')
      setTimeout(() => setUploadError(''), 5000)
    } finally {
      setUploading(false)
    }
  }

  const handleUsernameEdit = () => {
    setIsEditingUsername(true)
    setUsernameError('')
    setUsernameSuccess(false)
  }

  const handleUsernameCancel = () => {
    setIsEditingUsername(false)
    setNewUsername(profile?.username || '')
    setUsernameError('')
  }

  const handleUsernameSave = async () => {
    try {
      setSavingUsername(true)
      setUsernameError('')
      setUsernameSuccess(false)

      // バリデーション
      if (!newUsername.trim()) {
        throw new Error('ユーザー名を入力してください')
      }

      if (newUsername.trim().length < 3) {
        throw new Error('ユーザー名は3文字以上で入力してください')
      }

      if (newUsername.trim().length > 20) {
        throw new Error('ユーザー名は20文字以下で入力してください')
      }

      // 重複チェック（自分以外）
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', newUsername.trim())
        .neq('id', user.id)
        .single()

      if (existingUser) {
        throw new Error('このユーザー名は既に使用されています')
      }

      // プロフィール更新
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: newUsername.trim() })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile({ ...profile, username: newUsername.trim() })
      setIsEditingUsername(false)
      setUsernameSuccess(true)
      setTimeout(() => setUsernameSuccess(false), 3000)

    } catch (error: any) {
      console.error('Username update error:', error)
      setUsernameError(error.message || 'ユーザー名の更新に失敗しました')
    } finally {
      setSavingUsername(false)
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
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            プロフィール
          </h1>
          <p className="text-gray-800 mt-2 font-medium">アカウント情報と統計</p>
        </div>

        {/* アバターセクション */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-6 border border-violet-100">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-violet-400 to-indigo-400 p-1">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover bg-white"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                    <User className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              <label className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full flex items-center justify-center cursor-pointer hover:shadow-lg transition-all transform hover:scale-110">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={uploading}
                  className="hidden"
                />
                {uploading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </label>
            </div>

            {/* アップロード状態表示 */}
            {uploadSuccess && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl mb-3">
                <Check className="w-4 h-4" />
                <span className="text-sm font-bold">アップロード成功！</span>
              </div>
            )}
            
            {uploadError && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-xl mb-3">
                <X className="w-4 h-4" />
                <span className="text-sm font-bold">{uploadError}</span>
              </div>
            )}

            {/* ユーザーネーム編集 */}
            {usernameSuccess && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 px-4 py-2 rounded-xl mb-3">
                <Check className="w-4 h-4" />
                <span className="text-sm font-bold">ユーザー名を更新しました！</span>
              </div>
            )}

            <div className="flex items-center gap-2 mb-2">
              {isEditingUsername ? (
                <div className="flex flex-col items-center gap-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="新しいユーザー名"
                    className="px-4 py-2 border-2 border-violet-200 rounded-xl text-gray-900 font-bold text-xl text-center focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600"
                    disabled={savingUsername}
                    maxLength={20}
                  />
                  {usernameError && (
                    <div className="text-red-600 text-sm font-medium">{usernameError}</div>
                  )}
                  <div className="flex gap-2">
                    <button
                      onClick={handleUsernameSave}
                      disabled={savingUsername}
                      className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center gap-2"
                    >
                      {savingUsername ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      保存
                    </button>
                    <button
                      onClick={handleUsernameCancel}
                      disabled={savingUsername}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-xl font-bold hover:shadow-lg transition-all"
                    >
                      キャンセル
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-black text-gray-900">
                    {profile?.username || 'ユーザー名未設定'}
                  </h2>
                  <button
                    onClick={handleUsernameEdit}
                    className="w-8 h-8 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full flex items-center justify-center hover:shadow-lg transition-all transform hover:scale-110"
                  >
                    <Edit2 className="w-4 h-4 text-white" />
                  </button>
                </>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-gray-700">
              <Mail className="w-4 h-4" />
              <span className="text-sm font-medium">{user?.email}</span>
            </div>
          </div>
        </div>

        {/* メイン統計 */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-green-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-xs font-bold text-gray-800">総収支</p>
            </div>
            <p className={`text-2xl font-black ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toLocaleString()} P
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-blue-600" />
              <p className="text-xs font-bold text-gray-800">勝率</p>
            </div>
            <p className="text-2xl font-black text-blue-600">
              {stats.winRate.toFixed(1)}%
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-purple-100">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <p className="text-xs font-bold text-gray-800">総ゲーム数</p>
            </div>
            <p className="text-2xl font-black text-purple-600">
              {stats.totalGames.toLocaleString()} 回
            </p>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-orange-100">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <p className="text-xs font-bold text-gray-800">総プレイ時間</p>
            </div>
            <p className="text-2xl font-black text-orange-600">
              {stats.totalPlayHours.toFixed(1)} 時間
            </p>
          </div>
        </div>

        {/* 詳細統計 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-indigo-100">
          <h3 className="font-bold text-gray-900 mb-4 text-lg">📊 詳細統計</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <span className="text-sm font-bold text-gray-800">最高勝利</span>
              <span className="text-lg font-black text-green-600">
                +{stats.bestWin.toLocaleString()} P
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl">
              <span className="text-sm font-bold text-gray-800">最大敗北</span>
              <span className="text-lg font-black text-red-600">
                {stats.worstLoss.toLocaleString()} P
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <span className="text-sm font-bold text-gray-800">平均収支</span>
              <span className={`text-lg font-black ${stats.avgProfit >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
                {stats.avgProfit >= 0 ? '+' : ''}{Math.round(stats.avgProfit).toLocaleString()} P
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl">
              <span className="text-sm font-bold text-gray-800">現在のストリーク</span>
              <span className="text-lg font-black text-purple-600">
                {stats.currentStreak > 0 ? `${stats.currentStreak}連勝中` : 
                 stats.currentStreak < 0 ? `${Math.abs(stats.currentStreak)}連敗中` : 
                 'なし'}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl text-center">
                <p className="text-xs font-bold text-gray-800 mb-1">最大連勝</p>
                <p className="text-xl font-black text-orange-600">{stats.winStreak}連勝</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl text-center">
                <p className="text-xs font-bold text-gray-800 mb-1">最大連敗</p>
                <p className="text-xl font-black text-gray-600">{stats.lossStreak}連敗</p>
              </div>
            </div>
            
            {stats.totalGames > 0 && (
              <div className="p-3 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl">
                <p className="text-xs font-bold text-gray-800 mb-2">時給換算</p>
                <p className="text-2xl font-black text-indigo-600 text-center">
                  {stats.totalPlayHours > 0 ? 
                    `${Math.round(stats.totalProfit / stats.totalPlayHours).toLocaleString()} P/h` : 
                    '- P/h'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}