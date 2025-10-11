'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, Coins, Trophy, Crown, Award, User, TrendingUp, TrendingDown,
  Calendar, Camera, Image as ImageIcon, Upload, X, Sparkles, Target, Zap,
  Star, Flame, Skull, HeartCrack
} from 'lucide-react'

type Period = '7days' | 'month' | 'all' | 'custom'
type Tab = 'rankings' | 'hall-of-fame' | 'photos' | 'players'

interface UserStat {
  userId: string
  username: string
  avatarUrl: string | null
  equippedBadge: any
  profit: number
  sessions: number
}

interface HallOfFameRecord {
  id: string
  userId: string
  username: string
  avatarUrl: string | null
  equippedBadge: any
  profit: number
  category: string
  location: string
  playedDate: string
  feeling?: string
  memo?: string
  details?: string
  buy_in?: number
  cash_out?: number
}

interface GamblePhoto {
  id: string
  userId: string
  username: string
  avatarUrl: string | null
  equippedBadge: any
  favoriteGames: string[]
  imageUrl: string
  comment: string
  feeling: string
  createdAt: string
}

const FEELING_EMOJIS = {
  excellent: '😄',
  good: '🙂',
  normal: '😐',
  bad: '😞',
  terrible: '😡'
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

export default function AllGambleCommunity() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('rankings')
  const [period, setPeriod] = useState<Period>('month')
  const [rankings, setRankings] = useState<UserStat[]>([])
  const [topWins, setTopWins] = useState<HallOfFameRecord[]>([])
  const [topLosses, setTopLosses] = useState<HallOfFameRecord[]>([])
  const [photos, setPhotos] = useState<GamblePhoto[]>([])
  
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string>('')
  const [photoComment, setPhotoComment] = useState('')
  const [photoFeeling, setPhotoFeeling] = useState<'excellent' | 'good' | 'normal' | 'bad' | 'terrible'>('excellent')
  
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false)
  
  const [allPlayers, setAllPlayers] = useState<UserStat[]>([])
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null)
  const [playerHistory, setPlayerHistory] = useState<any[]>([])
  const [playerPeriod, setPlayerPeriod] = useState<Period>('7days')

  useEffect(() => {
    checkUser()
  }, [])

  useEffect(() => {
    if (activeTab === 'rankings') {
      loadRankings()
    } else if (activeTab === 'hall-of-fame') {
      loadHallOfFame()
    } else if (activeTab === 'photos') {
      loadPhotos()
    } else if (activeTab === 'players') {
      loadPlayers()
    }
  }, [activeTab, period, customStartDate, customEndDate])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setCurrentUser({ ...user, ...profile })
    }
    setLoading(false)
  }

  const loadRankings = async () => {
    setLoading(true)
    
    let startDate: string | null = null
    let endDate: string | null = null
    const now = new Date()
    
    if (period === '7days') {
      const sevenDaysAgo = new Date(now)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      startDate = sevenDaysAgo.toISOString().split('T')[0]
    } else if (period === 'month') {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      startDate = firstDayOfMonth.toISOString().split('T')[0]
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      endDate = lastDayOfMonth.toISOString().split('T')[0]
    } else if (period === 'custom') {
      startDate = customStartDate || null
      endDate = customEndDate || null
    }

    let gambleQuery = supabase
      .from('gamble_records')
      .select('user_id, profit, played_date')
    
    if (startDate) {
      gambleQuery = gambleQuery.gte('played_date', startDate)
    }
    if (endDate) {
      gambleQuery = gambleQuery.lte('played_date', endDate)
    }
    
    const { data: gambleData, error: gambleError } = await gambleQuery
    
    if (gambleError) {
      console.error('Error loading gamble_records:', gambleError)
    }

    let gameQuery = supabase
      .from('game_sessions')
      .select('user_id, profit, played_at')
    
    if (startDate) {
      gameQuery = gameQuery.gte('played_at', new Date(startDate).toISOString())
    }
    if (endDate) {
      const endDateTime = new Date(endDate)
      endDateTime.setHours(23, 59, 59, 999)
      gameQuery = gameQuery.lte('played_at', endDateTime.toISOString())
    }
    
    const { data: gameData, error: gameError } = await gameQuery
    
    if (gameError) {
      console.error('Error loading game_sessions:', gameError)
    }

    const prettyCureData = gameData?.map(g => {
      const playedDate = new Date(g.played_at)
      const jstDate = new Date(playedDate.getTime() + 9 * 60 * 60 * 1000)
      const dateStr = jstDate.toISOString().split('T')[0]
      return {
        user_id: g.user_id,
        profit: g.profit,
        played_date: dateStr
      }
    }).filter(g => {
      if (!startDate && !endDate) return true
      if (startDate && !endDate) return g.played_date >= startDate
      if (!startDate && endDate) return g.played_date <= endDate
      return g.played_date >= startDate && g.played_date <= endDate
    }) || []

    const combinedData = [...(gambleData || []), ...prettyCureData]

    if (combinedData.length > 0) {
      const userIds = [...new Set(combinedData.map(r => r.user_id))]
      
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, equipped_badge(*)')
        .in('id', userIds)

      const profilesMap = new Map()
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile)
      })

      const userStatsMap = new Map<string, UserStat>()
      combinedData.forEach((record: any) => {
        const profile = profilesMap.get(record.user_id)
        const username = profile?.username || 'Unknown'
        const avatarUrl = profile?.avatar_url || null
        const equippedBadge = profile?.equipped_badge || null
        
        const current = userStatsMap.get(record.user_id) || {
          userId: record.user_id,
          username,
          avatarUrl,
          equippedBadge,
          profit: 0,
          sessions: 0
        }
        current.profit += record.profit || 0
        current.sessions += 1
        userStatsMap.set(record.user_id, current)
      })

      const rankingsList = Array.from(userStatsMap.values())
        .sort((a, b) => b.profit - a.profit)

      setRankings(rankingsList)
    } else {
      setRankings([])
    }
    
    setLoading(false)
  }

  const loadHallOfFame = async () => {
    setLoading(true)

    const { data: gambleData, error: gambleError } = await supabase
      .from('gamble_records')
      .select('*')
      .order('profit', { ascending: false })
    
    if (gambleError) {
      console.error('Error loading gamble_records:', gambleError)
    }

    const { data: gameData, error: gameError } = await supabase
      .from('game_sessions')
      .select('*')
      .order('profit', { ascending: false })
    
    if (gameError) {
      console.error('Error loading game_sessions:', gameError)
    }

    const allRecords = [
      ...(gambleData?.map(r => ({
        ...r,
        playedDate: r.played_date,
        category: r.category || 'other',
        location: r.location || '不明',
        details: r.details || '',
        buy_in: r.buy_in || null,
        cash_out: r.cash_out || null
      })) || []),
      ...(gameData?.map(r => {
        const playedDate = new Date(r.played_at)
        const jstDate = new Date(playedDate.getTime() + 9 * 60 * 60 * 1000)
        return {
          ...r,
          playedDate: jstDate.toISOString().split('T')[0],
          category: 'poker',
          location: 'ホームゲーム',
          details: '',
          buy_in: null,
          cash_out: null
        }
      }) || [])
    ]

    const sortedByProfit = [...allRecords].sort((a, b) => b.profit - a.profit)
    const top10Wins = sortedByProfit.slice(0, 10)
    const top10Losses = [...allRecords].sort((a, b) => a.profit - b.profit).slice(0, 10)

    const userIds = [...new Set([...top10Wins, ...top10Losses].map(r => r.user_id))]
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, equipped_badge(*)')
      .in('id', userIds)

    const profilesMap = new Map()
    profilesData?.forEach(profile => {
      profilesMap.set(profile.id, profile)
    })

    const enrichRecord = (record: any): HallOfFameRecord => {
      const profile = profilesMap.get(record.user_id)
      return {
        ...record,
        username: profile?.username || 'Unknown',
        avatarUrl: profile?.avatar_url || null,
        equippedBadge: profile?.equipped_badge || null
      }
    }

    setTopWins(top10Wins.map(enrichRecord))
    setTopLosses(top10Losses.map(enrichRecord))
    setLoading(false)
  }

  const loadPhotos = async () => {
    setLoading(true)

    const { data: photosData } = await supabase
      .from('gamble_photos')
      .select('*')
      .order('created_at', { ascending: false })

    if (photosData && photosData.length > 0) {
      const userIds = [...new Set(photosData.map(p => p.user_id))]
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, equipped_badge(*), favorite_games')
        .in('id', userIds)

      const profilesMap = new Map()
      profilesData?.forEach(profile => {
        profilesMap.set(profile.id, profile)
      })

      const enrichedPhotos: GamblePhoto[] = photosData.map(photo => {
        const profile = profilesMap.get(photo.user_id)
        return {
          id: photo.id,
          userId: photo.user_id,
          username: profile?.username || 'Unknown',
          avatarUrl: profile?.avatar_url || null,
          equippedBadge: profile?.equipped_badge || null,
          favoriteGames: profile?.favorite_games || [],
          imageUrl: photo.image_url,
          comment: photo.comment,
          feeling: photo.feeling,
          createdAt: photo.created_at
        }
      })

      const shuffled = enrichedPhotos.sort(() => Math.random() - 0.5)
      setPhotos(shuffled)
    } else {
      setPhotos([])
    }

    setLoading(false)
  }

  const loadPlayers = async () => {
    setLoading(true)

    const { data: gambleData } = await supabase
      .from('gamble_records')
      .select('user_id')
    
    const { data: gameData } = await supabase
      .from('game_sessions')
      .select('user_id')

    const allUserIds = [
      ...(gambleData?.map(r => r.user_id) || []),
      ...(gameData?.map(r => r.user_id) || [])
    ]
    const uniqueUserIds = [...new Set(allUserIds)]

    if (uniqueUserIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username, avatar_url, equipped_badge(*)')
        .in('id', uniqueUserIds)

      const players = profilesData?.map(profile => ({
        userId: profile.id,
        username: profile.username || 'Unknown',
        avatarUrl: profile.avatar_url || null,
        equippedBadge: profile.equipped_badge || null,
        profit: 0,
        sessions: 0
      })) || []

      players.sort((a, b) => a.username.localeCompare(b.username))
      setAllPlayers(players)
    }

    setLoading(false)
  }

  const loadPlayerHistory = async (userId: string, period: Period) => {
    let startDate: string | null = null
    let endDate: string | null = null
    const now = new Date()
    
    if (period === '7days') {
      const sevenDaysAgo = new Date(now)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      startDate = sevenDaysAgo.toISOString().split('T')[0]
    } else if (period === 'month') {
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      startDate = firstDayOfMonth.toISOString().split('T')[0]
      const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      endDate = lastDayOfMonth.toISOString().split('T')[0]
    } else if (period === 'custom') {
      startDate = customStartDate || null
      endDate = customEndDate || null
    }

    let gambleQuery = supabase
      .from('gamble_records')
      .select('*')
      .eq('user_id', userId)
    
    if (startDate) gambleQuery = gambleQuery.gte('played_date', startDate)
    if (endDate) gambleQuery = gambleQuery.lte('played_date', endDate)
    
    const { data: gambleData } = await gambleQuery

    let gameQuery = supabase
      .from('game_sessions')
      .select('*')
      .eq('user_id', userId)
    
    if (startDate) {
      gameQuery = gameQuery.gte('played_at', new Date(startDate).toISOString())
    }
    if (endDate) {
      const endDateTime = new Date(endDate)
      endDateTime.setHours(23, 59, 59, 999)
      gameQuery = gameQuery.lte('played_at', endDateTime.toISOString())
    }
    
    const { data: gameData } = await gameQuery

    const history = [
      ...(gambleData?.map(r => ({
        ...r,
        playedDate: r.played_date,
        category: r.category || 'other',
        location: r.location || '不明',
        details: r.details || '',
        type: 'gamble'
      })) || []),
      ...(gameData?.map(r => {
        const playedDate = new Date(r.played_at)
        const jstDate = new Date(playedDate.getTime() + 9 * 60 * 60 * 1000)
        return {
          ...r,
          playedDate: jstDate.toISOString().split('T')[0],
          category: 'poker',
          location: 'ホームゲーム',
          details: '',
          type: 'game'
        }
      }) || [])
    ]

    history.sort((a, b) => new Date(b.playedDate).getTime() - new Date(a.playedDate).getTime())
    setPlayerHistory(history)
  }

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setPhotoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePhotoUpload = async () => {
    if (!photoFile || !currentUser) return

    setUploadingPhoto(true)

    try {
      const fileExt = photoFile.name.split('.').pop()
      const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('gamble-photos')
        .upload(fileName, photoFile)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('gamble-photos')
        .getPublicUrl(fileName)

      const { error: insertError } = await supabase
        .from('gamble_photos')
        .insert({
          user_id: currentUser.id,
          image_url: publicUrl,
          comment: photoComment,
          feeling: photoFeeling
        })

      if (insertError) throw insertError

      setShowUploadModal(false)
      setPhotoFile(null)
      setPhotoPreview('')
      setPhotoComment('')
      setPhotoFeeling('excellent')
      
      loadPhotos()
    } catch (error) {
      console.error('Photo upload error:', error)
      alert('写真のアップロードに失敗しました')
    } finally {
      setUploadingPhoto(false)
    }
  }

  const getPeriodLabel = () => {
    switch (period) {
      case '7days': return '直近7日間'
      case 'month': return '今月'
      case 'all': return '全期間'
      case 'custom': return 'カスタム期間'
    }
  }

  if (loading && activeTab === 'rankings' && rankings.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-yellow-500 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container max-w-md mx-auto px-4 py-6 pb-20">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="relative group"
          >
            <div className="absolute inset-0 bg-yellow-600 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity animate-pulse" />
            <div className="relative w-12 h-12 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-yellow-500/50 hover:border-yellow-400 transition-all">
              <ArrowLeft className="w-6 h-6 text-yellow-400" />
            </div>
          </button>
          
          <div className="text-center">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-yellow-500 blur-2xl opacity-50 animate-pulse" />
              <h1 className="relative text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-300 drop-shadow-2xl"
                  style={{ 
                    textShadow: '0 0 20px rgba(251, 191, 36, 0.8), 0 0 40px rgba(245, 158, 11, 0.6)',
                    WebkitTextStroke: '1px rgba(251, 191, 36, 0.3)'
                  }}>
                Community Data
              </h1>
            </div>
            <p className="text-sm text-yellow-400/80 font-bold">みんなのオールギャンブルデータ</p>
          </div>

          <div className="w-12" />
        </div>

        {/* タブ */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-1 border-2 border-yellow-500/50">
            <div className="grid grid-cols-4 gap-1">
              {[
                { id: 'rankings', label: 'ランキング', icon: Trophy },
                { id: 'hall-of-fame', label: '殿堂入り', icon: Crown },
                { id: 'photos', label: '写真', icon: ImageIcon },
                { id: 'players', label: 'プレイヤー', icon: User }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`py-3 px-1 rounded-xl font-black text-xs transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-lg shadow-yellow-500/50'
                      : 'text-yellow-400/60 hover:text-yellow-400'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mx-auto mb-1" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ランキングタブ */}
        {activeTab === 'rankings' && (
          <div className="space-y-5 animate-slide-in">
            {/* 期間フィルター */}
            <div className="relative">
              <div className="absolute inset-0 bg-yellow-600 blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-1 border-2 border-yellow-500/50">
                <div className="grid grid-cols-4 gap-1">
                  {[
                    { value: '7days', label: '7日間' },
                    { value: 'month', label: '今月' },
                    { value: 'all', label: '全期間' },
                    { value: 'custom', label: 'カスタム' }
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => {
                        setPeriod(p.value as Period)
                        if (p.value === 'custom') {
                          setShowCustomDatePicker(true)
                        }
                      }}
                      className={`py-2 px-2 rounded-xl font-black text-xs transition-all ${
                        period === p.value
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-lg'
                          : 'text-yellow-400/60 hover:text-yellow-400'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* カスタム期間選択 */}
            {period === 'custom' && (
              <div className="relative">
                <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-purple-500/50">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-black text-purple-300 mb-2">開始日</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border-2 border-purple-500/30 text-purple-100 text-sm focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-purple-300 mb-2">終了日</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white/10 border-2 border-purple-500/30 text-purple-100 text-sm focus:outline-none focus:border-purple-400"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ランキングリスト */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-600 blur-2xl opacity-50 animate-pulse" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-yellow-500/50">
                <h2 className="font-black text-yellow-300 mb-4 text-xl flex items-center gap-2">
                  <Trophy className="w-6 h-6 drop-shadow-glow" />
                  {getPeriodLabel()}ランキング
                </h2>

                {rankings.length > 0 ? (
                  <div className="space-y-3">
                    {rankings.map((rank, idx) => (
                      <div key={rank.userId} className="relative group">
                        <div className={`absolute inset-0 ${
                          idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : idx === 2 ? 'bg-orange-500' : 'bg-amber-600'
                        } blur-lg opacity-30 group-hover:opacity-50 transition-opacity`} />
                        <div className="relative flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 border-yellow-500/30 hover:border-yellow-400/50 transition-all">
                          <div className="flex-shrink-0">
                            {idx < 3 ? (
                              <div className="relative">
                                <div className={`absolute inset-0 ${
                                  idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-500'
                                } blur-xl animate-pulse`} />
                                {idx === 0 && <Crown className="relative w-10 h-10 text-yellow-400 drop-shadow-glow" />}
                                {idx === 1 && <Award className="relative w-10 h-10 text-gray-300 drop-shadow-glow" />}
                                {idx === 2 && <Trophy className="relative w-10 h-10 text-orange-400 drop-shadow-glow" />}
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-black bg-gradient-to-br from-yellow-600 to-amber-700 border-2 border-yellow-500/50 text-black">
                                {idx + 1}
                              </div>
                            )}
                          </div>

                          <div className="relative flex-shrink-0">
                            <div className={`w-14 h-14 rounded-full p-0.5 ${
                              rank.equippedBadge 
                                ? `bg-gradient-to-r ${rank.equippedBadge.badge_gradient}`
                                : 'bg-gradient-to-r from-yellow-500 to-amber-500'
                            }`}>
                              {rank.avatarUrl ? (
                                <img 
                                  src={rank.avatarUrl} 
                                  alt={rank.username}
                                  className="w-full h-full rounded-full object-cover bg-black"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                                  <User className="w-7 h-7 text-black" />
                                </div>
                              )}
                            </div>
                            
                            {rank.equippedBadge && (
                              <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-black shadow-lg bg-gradient-to-r ${rank.equippedBadge.badge_gradient}`}>
                                {(() => {
                                  const iconMap: { [key: string]: any } = {
                                    Trophy, Crown, Target, Zap, Award, Sparkles
                                  }
                                  const IconComponent = iconMap[rank.equippedBadge.icon] || Trophy
                                  return <IconComponent className="w-3 h-3 text-white" />
                                })()}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-black text-yellow-100 text-lg truncate">{rank.username}</p>
                            <p className="text-sm text-yellow-400/80">{rank.sessions}回プレイ</p>
                          </div>

                          <div className="flex-shrink-0 text-right">
                            <p className={`font-black text-2xl ${rank.profit >= 0 ? 'text-green-400' : 'text-red-400'} drop-shadow-glow`}>
                              {rank.profit >= 0 ? '+' : ''}{rank.profit.toLocaleString()}
                            </p>
                            <p className="text-xs text-yellow-400/60">P</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-yellow-400/60 py-8">データがありません</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 殿堂入りタブ */}
        {activeTab === 'hall-of-fame' && (
          <div className="space-y-5 animate-slide-in">
            {/* 大勝ちトップ10 */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 blur-2xl opacity-50 animate-pulse" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/50">
                <h2 className="font-black text-green-300 mb-4 text-xl flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 drop-shadow-glow" />
                  大勝ちトップ10
                </h2>

                <div className="space-y-3">
                  {topWins.map((record, idx) => (
                    <div key={record.id} className="relative group">
                      <div className="absolute inset-0 bg-green-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                      <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 border-green-500/30">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black bg-gradient-to-br from-green-500 to-emerald-600 border-2 border-green-400 text-black flex-shrink-0">
                            {idx + 1}
                          </div>

                          <div className="relative flex-shrink-0">
                            <div className={`w-12 h-12 rounded-full p-0.5 ${
                              record.equippedBadge 
                                ? `bg-gradient-to-r ${record.equippedBadge.badge_gradient}`
                                : 'bg-gradient-to-r from-green-500 to-emerald-500'
                            }`}>
                              {record.avatarUrl ? (
                                <img 
                                  src={record.avatarUrl} 
                                  alt={record.username}
                                  className="w-full h-full rounded-full object-cover bg-black"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-black text-green-100 text-base">{record.username}</p>
                            <div className="flex items-center gap-2 text-sm text-green-400/80">
                              <span>{GAME_ICONS[record.category] || '🎲'}</span>
                              <span>{GAME_NAMES[record.category] || record.category}</span>
                            </div>
                            <p className="text-xs text-green-400/70">{record.location} - {record.playedDate}</p>
                          </div>

                          <div className="flex-shrink-0 text-right">
                            <p className="font-black text-2xl text-green-400 drop-shadow-glow">
                              +{record.profit.toLocaleString()}
                            </p>
                            <p className="text-xs text-green-400/60">P</p>
                          </div>
                        </div>

                        {record.details && (
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-xs text-green-300/70">詳細:</span>
                            <span className="text-sm text-green-200/90">{record.details}</span>
                          </div>
                        )}

                        {(record.buy_in || record.cash_out) && (
                          <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
                            {record.buy_in && (
                              <div className="bg-black/30 rounded-lg p-2 border border-green-500/20">
                                <span className="text-green-300/70">バイイン: </span>
                                <span className="text-green-200 font-bold">{record.buy_in.toLocaleString()}円</span>
                              </div>
                            )}
                            {record.cash_out && (
                              <div className="bg-black/30 rounded-lg p-2 border border-green-500/20">
                                <span className="text-green-300/70">払戻: </span>
                                <span className="text-green-200 font-bold">{record.cash_out.toLocaleString()}円</span>
                              </div>
                            )}
                          </div>
                        )}

                        {record.feeling && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{FEELING_EMOJIS[record.feeling as keyof typeof FEELING_EMOJIS]}</span>
                            <span className="text-sm text-green-300/80">
                              {record.feeling === 'excellent' && '最高！'}
                              {record.feeling === 'good' && '良かった'}
                              {record.feeling === 'normal' && '普通'}
                              {record.feeling === 'bad' && 'イマイチ'}
                              {record.feeling === 'terrible' && '最悪'}
                            </span>
                          </div>
                        )}

                        {record.memo && (
                          <p className="text-sm text-green-200/90 bg-black/30 rounded-lg p-3 border border-green-500/20">
                            {record.memo}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 大負けトップ10 */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 blur-2xl opacity-50 animate-pulse" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/50">
                <h2 className="font-black text-red-300 mb-4 text-xl flex items-center gap-2">
                  <TrendingDown className="w-6 h-6 drop-shadow-glow" />
                  大負けトップ10
                </h2>

                <div className="space-y-3">
                  {topLosses.map((record, idx) => (
                    <div key={record.id} className="relative group">
                      <div className="absolute inset-0 bg-red-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                      <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 border-red-500/30">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black bg-gradient-to-br from-red-500 to-pink-600 border-2 border-red-400 text-black flex-shrink-0">
                            {idx + 1}
                          </div>

                          <div className="relative flex-shrink-0">
                            <div className={`w-12 h-12 rounded-full p-0.5 ${
                              record.equippedBadge 
                                ? `bg-gradient-to-r ${record.equippedBadge.badge_gradient}`
                                : 'bg-gradient-to-r from-red-500 to-pink-500'
                            }`}>
                              {record.avatarUrl ? (
                                <img 
                                  src={record.avatarUrl} 
                                  alt={record.username}
                                  className="w-full h-full rounded-full object-cover bg-black"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-red-500 to-pink-600 flex items-center justify-center">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="font-black text-red-100 text-base">{record.username}</p>
                            <div className="flex items-center gap-2 text-sm text-red-400/80">
                              <span>{GAME_ICONS[record.category] || '🎲'}</span>
                              <span>{GAME_NAMES[record.category] || record.category}</span>
                            </div>
                            <p className="text-xs text-red-400/70">{record.location} - {record.playedDate}</p>
                          </div>

                          <div className="flex-shrink-0 text-right">
                            <p className="font-black text-2xl text-red-400 drop-shadow-glow">
                              {record.profit.toLocaleString()}
                            </p>
                            <p className="text-xs text-red-400/60">P</p>
                          </div>
                        </div>

                        {record.details && (
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-xs text-red-300/70">詳細:</span>
                            <span className="text-sm text-red-200/90">{record.details}</span>
                          </div>
                        )}

                        {(record.buy_in || record.cash_out) && (
                          <div className="mb-2 grid grid-cols-2 gap-2 text-xs">
                            {record.buy_in && (
                              <div className="bg-black/30 rounded-lg p-2 border border-red-500/20">
                                <span className="text-red-300/70">バイイン: </span>
                                <span className="text-red-200 font-bold">{record.buy_in.toLocaleString()}円</span>
                              </div>
                            )}
                            {record.cash_out && (
                              <div className="bg-black/30 rounded-lg p-2 border border-red-500/20">
                                <span className="text-red-300/70">払戻: </span>
                                <span className="text-red-200 font-bold">{record.cash_out.toLocaleString()}円</span>
                              </div>
                            )}
                          </div>
                        )}

                        {record.feeling && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-2xl">{FEELING_EMOJIS[record.feeling as keyof typeof FEELING_EMOJIS]}</span>
                            <span className="text-sm text-red-300/80">
                              {record.feeling === 'excellent' && '最高！'}
                              {record.feeling === 'good' && '良かった'}
                              {record.feeling === 'normal' && '普通'}
                              {record.feeling === 'bad' && 'イマイチ'}
                              {record.feeling === 'terrible' && '最悪'}
                            </span>
                          </div>
                        )}

                        {record.memo && (
                          <p className="text-sm text-red-200/90 bg-black/30 rounded-lg p-3 border border-red-500/20">
                            {record.memo}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 写真タブ */}
        {activeTab === 'photos' && (
          <div className="space-y-5 animate-slide-in">
            {currentUser && (
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-600 blur-xl opacity-75 animate-pulse" />
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="relative w-full bg-gradient-to-r from-yellow-500 to-amber-600 rounded-2xl p-1 shadow-2xl"
                >
                  <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/20">
                    <div className="flex items-center justify-center gap-3 text-black">
                      <Upload className="w-6 h-6 drop-shadow-glow" />
                      <span className="text-xl font-black drop-shadow-glow">写真を投稿</span>
                    </div>
                  </div>
                </button>
              </div>
            )}

            {photos.length > 0 ? (
              <div className="space-y-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="absolute inset-0 bg-yellow-500 blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                    <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-yellow-500/50">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative flex-shrink-0">
                          <div className={`w-12 h-12 rounded-full p-0.5 ${
                            photo.equippedBadge 
                              ? `bg-gradient-to-r ${photo.equippedBadge.badge_gradient}`
                              : 'bg-gradient-to-r from-yellow-500 to-amber-500'
                          }`}>
                            {photo.avatarUrl ? (
                              <img 
                                src={photo.avatarUrl} 
                                alt={photo.username}
                                className="w-full h-full rounded-full object-cover bg-black"
                              />
                            ) : (
                              <div className="w-full h-full rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center">
                                <User className="w-6 h-6 text-black" />
                              </div>
                            )}
                          </div>
                          
                          {photo.equippedBadge && (
                            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-black shadow-lg bg-gradient-to-r ${photo.equippedBadge.badge_gradient}`}>
                              {(() => {
                                const iconMap: { [key: string]: any } = {
                                  Trophy, Crown, Target, Zap, Award, Sparkles
                                }
                                const IconComponent = iconMap[photo.equippedBadge.icon] || Trophy
                                return <IconComponent className="w-2.5 h-2.5 text-white" />
                              })()}
                            </div>
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="font-black text-yellow-100 text-base">{photo.username}</p>
                          <div className="flex items-center gap-2 mt-1">
                            {photo.favoriteGames.slice(0, 3).map((game, idx) => (
                              <span key={idx} className="text-sm">{GAME_ICONS[game]}</span>
                            ))}
                          </div>
                        </div>

                        <span className="text-2xl">{FEELING_EMOJIS[photo.feeling as keyof typeof FEELING_EMOJIS]}</span>
                      </div>

                      <img 
                        src={photo.imageUrl} 
                        alt="gamble photo"
                        className="w-full max-h-96 object-contain rounded-xl mb-3 border-2 border-yellow-500/30 bg-black/30"
                        />

                      <p className="text-yellow-100 text-base leading-relaxed bg-black/30 rounded-lg p-3 border border-yellow-500/20">
                        {photo.comment}
                      </p>

                      <p className="text-xs text-yellow-400/60 mt-2">
                        {new Date(photo.createdAt).toLocaleString('ja-JP')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-yellow-400/40" />
                <p className="text-yellow-400/60">まだ写真が投稿されていません</p>
              </div>
            )}
          </div>
        )}

        {/* プレイヤータブ */}
        {activeTab === 'players' && (
          <div className="space-y-5 animate-slide-in">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 blur-2xl opacity-50 animate-pulse" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/50">
                <h2 className="font-black text-blue-300 mb-4 text-xl flex items-center gap-2">
                  <User className="w-6 h-6 drop-shadow-glow" />
                  プレイヤー一覧
                </h2>

                {allPlayers.length > 0 ? (
                  <div className="space-y-2">
                    {allPlayers.map((player) => (
                      <button
                        key={player.userId}
                        onClick={() => {
                          setSelectedPlayer(player)
                          loadPlayerHistory(player.userId, '7days')
                          setPlayerPeriod('7days')
                        }}
                        className="w-full relative group"
                      >
                        <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
                        <div className="relative flex items-center gap-3 bg-black/40 backdrop-blur-sm rounded-xl p-3 border-2 border-blue-500/30 hover:border-blue-400/50 transition-all">
                          <div className="relative flex-shrink-0">
                            <div className={`w-12 h-12 rounded-full p-0.5 ${
                              player.equippedBadge 
                                ? `bg-gradient-to-r ${player.equippedBadge.badge_gradient}`
                                : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                            }`}>
                              {player.avatarUrl ? (
                                <img 
                                  src={player.avatarUrl} 
                                  alt={player.username}
                                  className="w-full h-full rounded-full object-cover bg-black"
                                />
                              ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                              )}
                            </div>
                            
                            {player.equippedBadge && (
                              <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-black shadow-lg bg-gradient-to-r ${player.equippedBadge.badge_gradient}`}>
                                {(() => {
                                  const iconMap: { [key: string]: any } = {
                                    Trophy, Crown, Target, Zap, Award, Sparkles
                                  }
                                  const IconComponent = iconMap[player.equippedBadge.icon] || Trophy
                                  return <IconComponent className="w-2.5 h-2.5 text-white" />
                                })()}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 text-left">
                            <p className="font-black text-blue-100 text-base">{player.username}</p>
                          </div>

                          <ArrowLeft className="w-5 h-5 text-blue-400 transform rotate-180" />
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-blue-400/60 py-8">プレイヤーがいません</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 写真投稿モーダル */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative max-w-md w-full">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-3xl blur-xl opacity-75 animate-pulse" />
            <div className="relative bg-black/90 backdrop-blur-sm rounded-3xl p-6 border-2 border-yellow-500/50">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black text-yellow-300">写真を投稿</h2>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {!photoPreview ? (
                  <label className="block w-full h-64 border-2 border-dashed border-yellow-500/50 rounded-xl hover:border-yellow-400 transition-all cursor-pointer bg-yellow-500/10">
                    <div className="h-full flex flex-col items-center justify-center text-yellow-400">
                      <Camera className="w-12 h-12 mb-3" />
                      <p className="font-bold">写真を選択</p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoSelect}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div className="relative">
                    <img 
                      src={photoPreview} 
                      alt="preview"
                      className="w-full h-64 object-cover rounded-xl border-2 border-yellow-500/50"
                    />
                    <button
                      onClick={() => {
                        setPhotoFile(null)
                        setPhotoPreview('')
                      }}
                      className="absolute top-2 right-2 p-2 bg-black/60 text-red-400 rounded-lg hover:bg-black/80 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-black text-yellow-300 mb-2">
                    コメント（50文字以内）
                  </label>
                  <textarea
                    value={photoComment}
                    onChange={(e) => setPhotoComment(e.target.value.slice(0, 50))}
                    placeholder="今日の一枚..."
                    rows={3}
                    maxLength={50}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border-2 border-yellow-500/30 focus:border-yellow-400 text-yellow-100 placeholder-yellow-400/50 focus:outline-none transition-all resize-none"
                  />
                  <p className="text-xs text-yellow-400/60 mt-1 text-right">
                    {photoComment.length}/50文字
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-black text-yellow-300 mb-2">
                    感情
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {[
                      { value: 'excellent', emoji: '😄' },
                      { value: 'good', emoji: '🙂' },
                      { value: 'normal', emoji: '😐' },
                      { value: 'bad', emoji: '😞' },
                      { value: 'terrible', emoji: '😡' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setPhotoFeeling(option.value as any)}
                        className={`py-3 rounded-xl transition-all ${
                          photoFeeling === option.value
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-600 scale-110'
                            : 'bg-white/10 hover:bg-white/20 border-2 border-yellow-500/30'
                        }`}
                      >
                        <div className="text-2xl">{option.emoji}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-600 blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                  <button
                    onClick={handlePhotoUpload}
                    disabled={!photoFile || uploadingPhoto}
                    className="relative w-full py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-600 text-black font-black shadow-2xl hover:shadow-yellow-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {uploadingPhoto ? '投稿中...' : (
                      <>
                        <Upload className="w-5 h-5" />
                        投稿する
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* プレイヤー詳細モーダル */}
      {selectedPlayer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="relative max-w-2xl w-full my-8">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl blur-xl opacity-75 animate-pulse" />
            <div className="relative bg-black/90 backdrop-blur-sm rounded-3xl p-6 border-2 border-blue-500/50 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6 sticky top-0 bg-black/90 pb-4 border-b border-blue-500/30">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-full p-0.5 ${
                      selectedPlayer.equippedBadge 
                        ? `bg-gradient-to-r ${selectedPlayer.equippedBadge.badge_gradient}`
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}>
                      {selectedPlayer.avatarUrl ? (
                        <img 
                          src={selectedPlayer.avatarUrl} 
                          alt={selectedPlayer.username}
                          className="w-full h-full rounded-full object-cover bg-black"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-blue-100">{selectedPlayer.username}</h2>
                    <p className="text-sm text-blue-400/80">プレイヤーデータ</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlayer(null)}
                  className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* 期間フィルター */}
              <div className="mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-blue-600 blur-xl opacity-50" />
                  <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-1 border-2 border-blue-500/50">
                    <div className="grid grid-cols-4 gap-1">
                      {[
                        { value: '7days', label: '7日間' },
                        { value: 'month', label: '今月' },
                        { value: 'all', label: '全履歴' },
                        { value: 'custom', label: 'カスタム' }
                      ].map((p) => (
                        <button
                          key={p.value}
                          onClick={() => {
                            setPlayerPeriod(p.value as Period)
                            if (p.value === 'custom') {
                              setShowCustomDatePicker(true)
                            } else {
                              loadPlayerHistory(selectedPlayer.userId, p.value as Period)
                            }
                          }}
                          className={`py-2 px-2 rounded-xl font-black text-xs transition-all ${
                            playerPeriod === p.value
                              ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-black shadow-lg'
                              : 'text-blue-400/60 hover:text-blue-400'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {playerPeriod === 'custom' && (
                  <div className="relative mt-3">
                    <div className="absolute inset-0 bg-purple-600 blur-xl opacity-50" />
                    <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-4 border-2 border-purple-500/50">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-black text-purple-300 mb-2">開始日</label>
                          <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/10 border-2 border-purple-500/30 text-purple-100 text-sm focus:outline-none focus:border-purple-400"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-black text-purple-300 mb-2">終了日</label>
                          <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl bg-white/10 border-2 border-purple-500/30 text-purple-100 text-sm focus:outline-none focus:border-purple-400"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => loadPlayerHistory(selectedPlayer.userId, 'custom')}
                        className="mt-3 w-full py-2 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-black text-sm hover:shadow-lg transition-all"
                      >
                        適用
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 履歴リスト */}
              <div className="space-y-3">
                <h3 className="font-black text-blue-300 text-lg mb-3">プレイ履歴</h3>
                {playerHistory.length > 0 ? (
                  playerHistory.map((record, idx) => (
                    <div key={idx} className="relative group">
                      <div className={`absolute inset-0 ${
                        record.profit >= 0 ? 'bg-green-500' : 'bg-red-500'
                      } blur-lg opacity-20 group-hover:opacity-40 transition-opacity`} />
                      <div className="relative bg-black/40 backdrop-blur-sm rounded-xl p-4 border-2 border-blue-500/30">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">{GAME_ICONS[record.category] || '🎲'}</span>
                              <span className="font-black text-blue-100">{GAME_NAMES[record.category] || record.category}</span>
                            </div>
                            <p className="text-sm text-blue-400/80">{record.location}</p>
                            <p className="text-xs text-blue-400/60">{record.playedDate}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-black text-2xl ${
                              record.profit >= 0 ? 'text-green-400' : 'text-red-400'
                            } drop-shadow-glow`}>
                              {record.profit >= 0 ? '+' : ''}{record.profit.toLocaleString()}
                            </p>
                            <p className="text-xs text-blue-400/60">P</p>
                          </div>
                        </div>

                        {record.details && (
                          <div className="mb-2 flex items-center gap-2">
                            <span className="text-xs text-blue-300/70">詳細:</span>
                            <span className="text-sm text-blue-200/90">{record.details}</span>
                          </div>
                        )}

                        {(record.buy_in || record.cash_out) && (
                          <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                            {record.buy_in && (
                              <div className="bg-black/30 rounded-lg p-2 border border-blue-500/20">
                                <span className="text-blue-300/70">バイイン: </span>
                                <span className="text-blue-200 font-bold">{record.buy_in.toLocaleString()}円</span>
                              </div>
                            )}
                            {record.cash_out && (
                              <div className="bg-black/30 rounded-lg p-2 border border-blue-500/20">
                                <span className="text-blue-300/70">払戻: </span>
                                <span className="text-blue-200 font-bold">{record.cash_out.toLocaleString()}円</span>
                              </div>
                            )}
                          </div>
                        )}

                        {record.feeling && (
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg">{FEELING_EMOJIS[record.feeling as keyof typeof FEELING_EMOJIS]}</span>
                          </div>
                        )}

                        {record.memo && (
                          <p className="text-sm text-blue-200/90 bg-black/30 rounded-lg p-3 border border-blue-500/20 mt-2">
                            {record.memo}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-blue-400/60 py-8">履歴がありません</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
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

        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  )
}