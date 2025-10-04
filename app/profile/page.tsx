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
  Check,
  X,
  Edit2,
  Save,
  LogOut,
  Sparkles,
  Crown,
  Target,
  Zap,
  Award,
  DollarSign,
  Coins,
  Gem,
  TrendingDown,
  AlertTriangle,
  Flame,
  Skull,
  CloudRain,
  CloudOff,
  HeartCrack,
  Timer,
  Watch,
  Infinity,
  Shield,
  Moon,
  Lock,
  Star
} from 'lucide-react'

interface GameSession {
  id: string
  buy_in: number
  cash_out: number
  profit: number
  played_at: string
  play_hours: number
}

interface GambleRecord {
  id: string
  profit: number
  play_hours: number
  played_at: string
}

interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  badge_gradient: string
  condition_type: string
  condition_value: number
  tier: string
}

const GAME_ICONS: { [key: string]: string } = {
  poker: '🃏',
  horse_racing: '🏇',
  boat_racing: '🚤',
  bicycle_racing: '🚴',
  slot: '🎰',
  other: '🎲'
}

const GAME_NAMES: { [key: string]: string } = {
  poker: 'ポーカー',
  horse_racing: '競馬',
  boat_racing: '競艇',
  bicycle_racing: '競輪',
  slot: 'スロット',
  other: 'その他'
}

const iconComponents: { [key: string]: any } = {
  Trophy, DollarSign, Coins, Gem, Crown, TrendingDown, AlertTriangle, Flame, Skull,
  Zap, Sparkles, CloudRain, CloudOff, HeartCrack, Clock, Timer, Watch, Infinity,
  Target, Shield, Moon, TrendingUp, Star
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

  // お気に入りゲーム編集用
  const [isEditingGames, setIsEditingGames] = useState(false)
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [savingGames, setSavingGames] = useState(false)
  const [gamesSuccess, setGamesSuccess] = useState(false)

  // アチーブメント用
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [unlockedAchievements, setUnlockedAchievements] = useState<string[]>([])
  const [showBadgeModal, setShowBadgeModal] = useState(false)
  const [equippingBadge, setEquippingBadge] = useState(false)

  // ログアウト用
  const [loggingOut, setLoggingOut] = useState(false)

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
        .select('*, equipped_badge(*)')
        .eq('id', authUser.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setNewUsername(profileData.username || '')
        setSelectedGames(profileData.favorite_games || [])
      }

      // ポーカーゲーム統計取得（game_sessions）
      const { data: pokerGames } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('user_id', authUser.id)
        .order('played_at', { ascending: false })

      // All-Gambleデータ取得（gamble_records）
      const { data: gambleRecords } = await supabase
        .from('gamble_records')
        .select('*')
        .eq('user_id', authUser.id)
        .order('played_at', { ascending: false })

      // 統合統計計算
      const allGames = [...(pokerGames || []), ...(gambleRecords || [])]
      if (allGames.length > 0) {
        calculateStats(allGames)
      }

      // アチーブメント取得
      await loadAchievements(authUser.id, allGames)

      setLoading(false)
    } catch (error) {
      console.error('Error loading user data:', error)
      setLoading(false)
    }
  }

  const loadAchievements = async (userId: string, allGames: any[]) => {
    try {
      // 全アチーブメント取得
      const { data: achievementsData } = await supabase
        .from('achievements')
        .select('*')
        .order('tier', { ascending: true })

      if (achievementsData) {
        setAchievements(achievementsData)
      }

      // 取得済みアチーブメント取得
      const { data: unlockedData } = await supabase
        .from('user_achievements')
        .select('achievement_id')
        .eq('user_id', userId)

      if (unlockedData) {
        setUnlockedAchievements(unlockedData.map(u => u.achievement_id))
      }

      // アチーブメント自動判定・アンロック
      if (achievementsData && allGames.length > 0) {
        await checkAndUnlockAchievements(userId, allGames, achievementsData, unlockedData || [])
      }
    } catch (error) {
      console.error('Error loading achievements:', error)
    }
  }

  const checkAndUnlockAchievements = async (
    userId: string, 
    allGames: any[], 
    allAchievements: Achievement[],
    currentUnlocked: any[]
  ) => {
    try {
      const unlockedIds = currentUnlocked.map(u => u.achievement_id)
      const newUnlocks: string[] = []

      // 統計計算
      const totalProfit = allGames.reduce((sum, game) => sum + (game.profit || 0), 0)
      const totalPlayHours = allGames.reduce((sum, game) => sum + (game.play_hours || 0), 0)
      const wins = allGames.filter(game => game.profit > 0).length
      const winRate = allGames.length > 0 ? (wins / allGames.length) * 100 : 0

      // 連勝・連敗計算
      let maxWinStreak = 0
      let maxLossStreak = 0
      let currentWinStreak = 0
      let currentLossStreak = 0

      for (const game of allGames) {
        if (game.profit > 0) {
          currentWinStreak++
          currentLossStreak = 0
          maxWinStreak = Math.max(maxWinStreak, currentWinStreak)
        } else if (game.profit < 0) {
          currentLossStreak++
          currentWinStreak = 0
          maxLossStreak = Math.max(maxLossStreak, currentLossStreak)
        }
      }

      // 不屈の精神: 10連敗から復活（10連敗後に勝利）
      let hasComeback = false
      let tempLossStreak = 0
      for (const game of allGames) {
        if (game.profit < 0) {
          tempLossStreak++
        } else if (game.profit > 0) {
          if (tempLossStreak >= 10) {
            hasComeback = true
            break
          }
          tempLossStreak = 0
        }
      }

      // 夜更かし: 深夜2-5時にプレイ（played_atをチェック）
      let hasNightOwl = false
      for (const game of allGames) {
        if (game.played_at) {
          const playedDate = new Date(game.played_at)
          const hour = playedDate.getHours()
          if (hour >= 2 && hour < 5) {
            hasNightOwl = true
            break
          }
        }
      }

      // 安定志向: 10ゲーム連続で収支±5000P以内
      let hasStableProfit = false
      if (allGames.length >= 10) {
        for (let i = 0; i <= allGames.length - 10; i++) {
          const slice = allGames.slice(i, i + 10)
          const allStable = slice.every(game => Math.abs(game.profit || 0) <= 5000)
          if (allStable) {
            hasStableProfit = true
            break
          }
        }
      }

      // ジャックポット取得チェック
      const { data: jackpots } = await supabase
        .from('jackpot_winners')
        .select('hand_type')
        .eq('user_id', userId)

      const hasStraightFlush = jackpots?.some(j => j.hand_type === 'straight_flush')
      const hasRoyalFlush = jackpots?.some(j => j.hand_type === 'royal_flush')

      // 各アチーブメントをチェック
      for (const achievement of allAchievements) {
        if (unlockedIds.includes(achievement.id)) continue

        let shouldUnlock = false

        switch (achievement.condition_type) {
          case 'total_profit':
            shouldUnlock = totalProfit >= achievement.condition_value
            break
          case 'total_loss':
            shouldUnlock = totalProfit <= achievement.condition_value
            break
          case 'win_streak':
            shouldUnlock = maxWinStreak >= achievement.condition_value
            break
          case 'loss_streak':
            shouldUnlock = maxLossStreak >= achievement.condition_value
            break
          case 'play_hours':
            shouldUnlock = totalPlayHours >= achievement.condition_value
            break
          case 'jackpot':
            if (achievement.condition_value === 1) shouldUnlock = hasStraightFlush
            if (achievement.condition_value === 2) shouldUnlock = hasRoyalFlush
            break
          case 'perfect_winrate':
            shouldUnlock = allGames.length >= achievement.condition_value && winRate === 100
            break
          case 'comeback':
            shouldUnlock = hasComeback
            break
          case 'night_owl':
            shouldUnlock = hasNightOwl
            break
          case 'stable_profit':
            shouldUnlock = hasStableProfit
            break
        }

        if (shouldUnlock) {
          newUnlocks.push(achievement.id)
        }
      }

      // 新規アンロックを保存
      if (newUnlocks.length > 0) {
        const inserts = newUnlocks.map(achievementId => ({
          user_id: userId,
          achievement_id: achievementId
        }))

        await supabase.from('user_achievements').insert(inserts)
        setUnlockedAchievements([...unlockedIds, ...newUnlocks])
      }
    } catch (error) {
      console.error('Error checking achievements:', error)
    }
  }

  const calculateStats = (games: any[]) => {
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

      if (!newUsername.trim()) {
        throw new Error('ユーザー名を入力してください')
      }

      if (newUsername.trim().length < 3) {
        throw new Error('ユーザー名は3文字以上で入力してください')
      }

      if (newUsername.trim().length > 20) {
        throw new Error('ユーザー名は20文字以下で入力してください')
      }

      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', newUsername.trim())
        .neq('id', user.id)
        .single()

      if (existingUser) {
        throw new Error('このユーザー名は既に使用されています')
      }

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

  const handleGamesEdit = () => {
    setIsEditingGames(true)
    setGamesSuccess(false)
  }

  const handleGamesCancel = () => {
    setIsEditingGames(false)
    setSelectedGames(profile?.favorite_games || [])
  }

  const toggleGame = (gameType: string) => {
    setSelectedGames(prev => 
      prev.includes(gameType)
        ? prev.filter(g => g !== gameType)
        : [...prev, gameType]
    )
  }

  const handleGamesSave = async () => {
    try {
      setSavingGames(true)
      setGamesSuccess(false)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ favorite_games: selectedGames })
        .eq('id', user.id)

      if (updateError) throw updateError

      setProfile({ ...profile, favorite_games: selectedGames })
      setIsEditingGames(false)
      setGamesSuccess(true)
      setTimeout(() => setGamesSuccess(false), 3000)

    } catch (error: any) {
      console.error('Games update error:', error)
      alert('お気に入りゲームの更新に失敗しました')
    } finally {
      setSavingGames(false)
    }
  }

  const handleEquipBadge = async (achievementId: string | null) => {
    try {
      setEquippingBadge(true)

      const { error } = await supabase
        .from('profiles')
        .update({ equipped_badge: achievementId })
        .eq('id', user.id)

      if (error) throw error

      // プロフィール再読み込み
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*, equipped_badge(*)')
        .eq('id', user.id)
        .single()

      if (updatedProfile) {
        setProfile(updatedProfile)
      }

      setShowBadgeModal(false)
    } catch (error) {
      console.error('Badge equip error:', error)
      alert('バッジの装備に失敗しました')
    } finally {
      setEquippingBadge(false)
    }
  }

  const handleLogout = async () => {
    try {
      setLoggingOut(true)
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      alert('ログアウトに失敗しました')
      setLoggingOut(false)
    }
  }

  const getAvatarBorderGradient = () => {
    if (profile?.equipped_badge) {
      return `bg-gradient-to-r ${profile.equipped_badge.badge_gradient}`
    }
    return 'bg-gradient-to-r from-purple-500 to-pink-500'
  }

  const getBadgeIcon = (iconName: string) => {
    const IconComponent = iconComponents[iconName]
    return IconComponent || Trophy
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-purple-500 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const unlockedBadges = achievements.filter(a => unlockedAchievements.includes(a.id))

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      <div className="container max-w-md mx-auto px-4 py-6 pb-20">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="relative group"
          >
            <div className="absolute inset-0 bg-purple-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-12 h-12 bg-black/60 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-purple-500/50 hover:border-purple-400 transition-all">
              <ArrowLeft className="w-6 h-6 text-purple-400" />
            </div>
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-black text-white drop-shadow-glow">Profile</h1>
            <p className="text-sm text-purple-300">アカウント情報</p>
          </div>

          {/* 管理者アイコン */}
          <div className="flex items-center gap-2">
            {/* P-BANK管理ボタン（特権管理者 or 一般管理者） */}
            {(user?.email === 'toui.reigetsu@gmail.com' || profile?.role === 'admin') && (
              <button
                onClick={() => router.push('/pbank-admin')}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
                <div className="relative w-12 h-12 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-emerald-500/50 hover:border-emerald-400 transition-all">
                  <Shield className="w-6 h-6 text-emerald-400 drop-shadow-glow" />
                </div>
              </button>
            )}

            {/* 特権管理者メニュー（特権管理者のみ） */}
            {user?.email === 'toui.reigetsu@gmail.com' ? (
              <button
                onClick={() => router.push('/admin')}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-cyan-500 to-yellow-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
                <div className="relative w-12 h-12 bg-black/80 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-red-500/50 hover:border-red-400 transition-all">
                  <Crown className="w-6 h-6 text-red-400 drop-shadow-glow" />
                </div>
              </button>
            ) : (
              <div className="w-0" />
            )}
          </div>
        </div>

        {/* アバターセクション */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-75" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-3xl p-6 border-2 border-purple-500/50">
            <div className="flex flex-col items-center">
              <div className="relative mb-4">
                <div className={`absolute inset-0 ${getAvatarBorderGradient()} rounded-full blur-xl animate-pulse`} />
                <div className={`relative w-32 h-32 rounded-full ${getAvatarBorderGradient()} p-1`}>
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Avatar"
                      className="w-full h-full rounded-full object-cover bg-black"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-900 to-pink-900 flex items-center justify-center">
                      <User className="w-16 h-16 text-purple-300" />
                    </div>
                  )}
                </div>
                
                {/* バッジアイコン */}
                {profile?.equipped_badge && (
                  <div className={`absolute -bottom-2 -right-2 w-12 h-12 ${getAvatarBorderGradient()} rounded-full flex items-center justify-center border-2 border-white shadow-2xl`}>
                    {(() => {
                      const IconComponent = getBadgeIcon(profile.equipped_badge.icon)
                      return <IconComponent className="w-6 h-6 text-white drop-shadow-glow" />
                    })()}
                  </div>
                )}

                <label className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center cursor-pointer hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-110 border-2 border-white/20">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                  {uploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                  ) : (
                    <Camera className="w-6 h-6 text-white drop-shadow-glow" />
                  )}
                </label>
              </div>

              {uploadSuccess && (
                <div className="flex items-center gap-2 text-green-400 bg-green-950/50 px-4 py-2 rounded-xl mb-3 border-2 border-green-500/50 animate-slide-in">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-bold">アップロード成功！</span>
                </div>
              )}
              
              {uploadError && (
                <div className="flex items-center gap-2 text-red-400 bg-red-950/50 px-4 py-2 rounded-xl mb-3 border-2 border-red-500/50 animate-slide-in">
                  <X className="w-5 h-5" />
                  <span className="text-sm font-bold">{uploadError}</span>
                </div>
              )}

              {usernameSuccess && (
                <div className="flex items-center gap-2 text-green-400 bg-green-950/50 px-4 py-2 rounded-xl mb-3 border-2 border-green-500/50 animate-slide-in">
                  <Check className="w-5 h-5" />
                  <span className="text-sm font-bold">ユーザー名を更新しました！</span>
                </div>
              )}

              <div className="flex items-center gap-3 mb-3">
                {isEditingUsername ? (
                  <div className="flex flex-col items-center gap-3">
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="新しいユーザー名"
                      className="px-4 py-3 bg-black/60 backdrop-blur-sm border-2 border-purple-500/50 rounded-2xl text-white font-bold text-xl text-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      disabled={savingUsername}
                      maxLength={20}
                    />
                    {usernameError && (
                      <div className="text-red-400 text-sm font-bold bg-red-950/50 px-3 py-2 rounded-xl border-2 border-red-500/50">
                        {usernameError}
                      </div>
                    )}
                    <div className="flex gap-3">
                      <button
                        onClick={handleUsernameSave}
                        disabled={savingUsername}
                        className="relative group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                        <div className="relative px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl font-bold text-white flex items-center gap-2 border-2 border-white/20">
                          {savingUsername ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          ) : (
                            <Save className="w-5 h-5" />
                          )}
                          保存
                        </div>
                      </button>
                      <button
                        onClick={handleUsernameCancel}
                        disabled={savingUsername}
                        className="px-6 py-3 bg-gray-700/50 backdrop-blur-sm text-gray-300 rounded-2xl font-bold hover:bg-gray-600/50 transition-all border-2 border-gray-600/50"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-3xl font-black text-white drop-shadow-glow">
                      {profile?.username || 'ユーザー名未設定'}
                    </h2>
                    <button
                      onClick={handleUsernameEdit}
                      className="relative group"
                    >
                      <div className="absolute inset-0 bg-purple-600 blur-lg animate-pulse" />
                      <div className="relative w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center hover:shadow-2xl hover:shadow-purple-500/50 transition-all transform hover:scale-110 border-2 border-white/20">
                        <Edit2 className="w-5 h-5 text-white drop-shadow-glow" />
                      </div>
                    </button>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-purple-300 bg-purple-950/30 px-4 py-2 rounded-xl mb-4">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">{user?.email}</span>
              </div>

              {/* バッジ変更ボタン */}
              <button
                onClick={() => setShowBadgeModal(true)}
                className="relative group w-full"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                <div className="relative px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl font-bold text-white flex items-center justify-center gap-2 border-2 border-white/20">
                  <Award className="w-5 h-5" />
                  バッジを変更
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* お気に入りゲーム */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-pink-500/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Star className="w-5 h-5 text-pink-400" />
                お気に入りゲーム
              </h3>
              {!isEditingGames && (
                <button
                  onClick={handleGamesEdit}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-pink-600 blur-lg animate-pulse" />
                  <div className="relative w-8 h-8 bg-gradient-to-r from-pink-600 to-purple-600 rounded-full flex items-center justify-center hover:shadow-2xl hover:shadow-pink-500/50 transition-all transform hover:scale-110 border-2 border-white/20">
                    <Edit2 className="w-4 h-4 text-white" />
                  </div>
                </button>
              )}
            </div>

            {gamesSuccess && (
              <div className="flex items-center gap-2 text-green-400 bg-green-950/50 px-4 py-2 rounded-xl mb-3 border-2 border-green-500/50 animate-slide-in">
                <Check className="w-5 h-5" />
                <span className="text-sm font-bold">更新しました！</span>
              </div>
            )}

            {isEditingGames ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(GAME_NAMES).map(([key, name]) => (
                    <button
                      key={key}
                      onClick={() => toggleGame(key)}
                      className={`p-4 rounded-xl font-bold transition-all border-2 ${
                        selectedGames.includes(key)
                          ? 'bg-pink-600/30 border-pink-500 text-white'
                          : 'bg-gray-800/30 border-gray-600/50 text-gray-400'
                      }`}
                    >
                      <div className="text-3xl mb-2">{GAME_ICONS[key]}</div>
                      <div className="text-sm">{name}</div>
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleGamesSave}
                    disabled={savingGames}
                    className="relative group flex-1"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                    <div className="relative px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl font-bold text-white flex items-center justify-center gap-2 border-2 border-white/20">
                      {savingGames ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                      ) : (
                        <Save className="w-5 h-5" />
                      )}
                      保存
                    </div>
                  </button>
                  <button
                    onClick={handleGamesCancel}
                    disabled={savingGames}
                    className="px-6 py-3 bg-gray-700/50 backdrop-blur-sm text-gray-300 rounded-2xl font-bold hover:bg-gray-600/50 transition-all border-2 border-gray-600/50"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedGames.length > 0 ? (
                  selectedGames.map(gameType => (
                    <span
                      key={gameType}
                      className="px-4 py-2 bg-pink-600/20 border-2 border-pink-500/50 rounded-full text-white font-bold flex items-center gap-2"
                    >
                      <span className="text-lg">{GAME_ICONS[gameType]}</span>
                      <span className="text-sm">{GAME_NAMES[gameType]}</span>
                    </span>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">未設定</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* メイン統計（統合版） */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-cyan-500/50">
            <p className="text-xs text-cyan-300 text-center mb-4 font-bold">すべてのギャンブルの統合データ</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <p className="text-sm font-bold text-cyan-300">総収支</p>
                </div>
                <p className={`text-3xl font-black ${stats.totalProfit >= 0 ? 'text-green-400' : 'text-red-400'} drop-shadow-glow`}>
                  {stats.totalProfit >= 0 ? '+' : ''}{stats.totalProfit.toLocaleString()}
                </p>
                <p className="text-xs text-cyan-300 mt-1">P</p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="w-5 h-5 text-cyan-400" />
                  <p className="text-sm font-bold text-cyan-300">総プレイ時間</p>
                </div>
                <p className="text-3xl font-black text-cyan-400 drop-shadow-glow">
                  {stats.totalPlayHours.toFixed(1)}
                </p>
                <p className="text-xs text-cyan-300 mt-1">時間</p>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-cyan-950/30 rounded-xl border-2 border-cyan-500/30">
              <p className="text-sm font-bold text-cyan-300 mb-2 text-center">時給換算</p>
              <p className="text-4xl font-black text-cyan-400 text-center drop-shadow-glow">
                {stats.totalPlayHours > 0 ? 
                  `${Math.round(stats.totalProfit / stats.totalPlayHours).toLocaleString()}` : 
                  '-'}
              </p>
              <p className="text-sm text-cyan-300 mt-2 text-center">P/h</p>
            </div>
          </div>
        </div>

        {/* その他統計 */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-blue-600 blur-lg opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/50">
              <div className="flex items-center gap-2 mb-3">
                <Trophy className="w-6 h-6 text-blue-400 drop-shadow-glow" />
                <p className="text-sm font-bold text-blue-300">勝率</p>
              </div>
              <p className="text-3xl font-black text-blue-400 drop-shadow-glow">
                {stats.winRate.toFixed(1)}
              </p>
              <p className="text-xs text-blue-300 mt-1">%</p>
            </div>
          </div>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-purple-600 blur-lg opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/50">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-6 h-6 text-purple-400 drop-shadow-glow" />
                <p className="text-sm font-bold text-purple-300">ゲーム数</p>
              </div>
              <p className="text-3xl font-black text-purple-400 drop-shadow-glow">
                {stats.totalGames.toLocaleString()}
              </p>
              <p className="text-xs text-purple-300 mt-1">回</p>
            </div>
          </div>
        </div>

        {/* アチーブメント表示 */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-yellow-500/50">
            <h3 className="font-bold text-white mb-4 text-lg flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-400 drop-shadow-glow" />
              アチーブメント
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {unlockedBadges.slice(0, 8).map(achievement => {
                const IconComponent = getBadgeIcon(achievement.icon)
                return (
                  <div
                    key={achievement.id}
                    className="relative group/badge"
                  >
                    <div className={`absolute inset-0 ${achievement.badge_gradient} rounded-xl blur-lg opacity-50`} />
                    <div className={`relative w-full aspect-square ${achievement.badge_gradient} rounded-xl flex items-center justify-center border-2 border-white/20`}>
                      <IconComponent className="w-8 h-8 text-white drop-shadow-glow" />
                    </div>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 rounded-lg text-white text-xs font-bold whitespace-nowrap opacity-0 group-hover/badge:opacity-100 transition-opacity pointer-events-none">
                      {achievement.name}
                    </div>
                  </div>
                )
              })}
              {[...Array(Math.max(0, 8 - unlockedBadges.length))].map((_, i) => (
                <div key={`locked-${i}`} className="relative">
                  <div className="w-full aspect-square bg-gray-800/50 rounded-xl flex items-center justify-center border-2 border-gray-600/50">
                    <Lock className="w-6 h-6 text-gray-600" />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-yellow-300 mt-4 font-bold">
              {unlockedBadges.length} / {achievements.length} 取得済み
            </p>
          </div>
        </div>

        {/* 詳細統計 */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-6 border-2 border-indigo-500/50">
            <h3 className="font-bold text-white mb-5 text-xl flex items-center gap-2">
              <Target className="w-6 h-6 text-indigo-400 drop-shadow-glow" />
              詳細統計
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-green-950/30 rounded-xl border-2 border-green-500/30">
                <span className="text-sm font-bold text-green-300 flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  最高勝利
                </span>
                <span className="text-xl font-black text-green-400 drop-shadow-glow">
                  +{stats.bestWin.toLocaleString()} P
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-red-950/30 rounded-xl border-2 border-red-500/30">
                <span className="text-sm font-bold text-red-300 flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  最大敗北
                </span>
                <span className="text-xl font-black text-red-400 drop-shadow-glow">
                  {stats.worstLoss.toLocaleString()} P
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-blue-950/30 rounded-xl border-2 border-blue-500/30">
                <span className="text-sm font-bold text-blue-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  平均収支
                </span>
                <span className={`text-xl font-black ${stats.avgProfit >= 0 ? 'text-blue-400' : 'text-orange-400'} drop-shadow-glow`}>
                  {stats.avgProfit >= 0 ? '+' : ''}{Math.round(stats.avgProfit).toLocaleString()} P
                </span>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-purple-950/30 rounded-xl border-2 border-purple-500/30">
                <span className="text-sm font-bold text-purple-300 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  現在のストリーク
                </span>
                <span className="text-xl font-black text-purple-400 drop-shadow-glow">
                  {stats.currentStreak > 0 ? `${stats.currentStreak}連勝中` : 
                   stats.currentStreak < 0 ? `${Math.abs(stats.currentStreak)}連敗中` : 
                   'なし'}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-yellow-950/30 rounded-xl text-center border-2 border-yellow-500/30">
                  <p className="text-xs font-bold text-yellow-300 mb-2">最大連勝</p>
                  <p className="text-2xl font-black text-yellow-400 drop-shadow-glow">{stats.winStreak}</p>
                  <p className="text-xs text-yellow-300 mt-1">連勝</p>
                </div>
                <div className="p-4 bg-gray-950/30 rounded-xl text-center border-2 border-gray-500/30">
                  <p className="text-xs font-bold text-gray-300 mb-2">最大連敗</p>
                  <p className="text-2xl font-black text-gray-400 drop-shadow-glow">{stats.lossStreak}</p>
                  <p className="text-xs text-gray-300 mt-1">連敗</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ログアウトボタン */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity" />
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="relative w-full bg-gradient-to-r from-red-600 to-pink-600 rounded-3xl p-1 shadow-2xl"
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-5 border-2 border-white/20">
              <div className="flex items-center justify-center gap-3 text-white">
                {loggingOut ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white" />
                    <span className="text-lg font-black">ログアウト中...</span>
                  </>
                ) : (
                  <>
                    <LogOut className="w-6 h-6 drop-shadow-glow" />
                    <span className="text-lg font-black drop-shadow-glow">ログアウト</span>
                  </>
                )}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* バッジ選択モーダル */}
      {showBadgeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl blur-xl opacity-75" />
            <div className="relative bg-black/90 backdrop-blur-sm rounded-3xl p-6 border-2 border-yellow-500/50 max-h-[80vh] overflow-y-auto">
              <h2 className="text-2xl font-black text-white mb-4 text-center drop-shadow-glow">バッジを選択</h2>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                {/* バッジなし */}
                <button
                  onClick={() => handleEquipBadge(null)}
                  disabled={equippingBadge}
                  className="relative group"
                >
                  <div className="w-full aspect-square bg-gray-800/50 rounded-xl flex flex-col items-center justify-center border-2 border-gray-600/50 hover:border-gray-400 transition-all">
                    <X className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-xs text-gray-400 font-bold">なし</p>
                  </div>
                </button>

                {/* 取得済みバッジ */}
                {unlockedBadges.map(achievement => {
                  const IconComponent = getBadgeIcon(achievement.icon)
                  const isEquipped = profile?.equipped_badge?.id === achievement.id
                  return (
                    <button
                      key={achievement.id}
                      onClick={() => handleEquipBadge(achievement.id)}
                      disabled={equippingBadge}
                      className="relative group"
                    >
                      <div className={`absolute inset-0 ${achievement.badge_gradient} rounded-xl blur-lg opacity-50`} />
                      <div className={`relative w-full aspect-square ${achievement.badge_gradient} rounded-xl flex flex-col items-center justify-center border-2 ${isEquipped ? 'border-white' : 'border-white/20'} hover:border-white transition-all`}>
                        <IconComponent className="w-8 h-8 text-white drop-shadow-glow mb-2" />
                        <p className="text-xs text-white font-bold text-center px-1">{achievement.name}</p>
                        {isEquipped && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center border-2 border-white">
                            <Check className="w-4 h-4 text-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setShowBadgeModal(false)}
                disabled={equippingBadge}
                className="w-full px-6 py-3 bg-gray-700/50 backdrop-blur-sm text-white rounded-2xl font-bold hover:bg-gray-600/50 transition-all border-2 border-gray-600/50"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
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