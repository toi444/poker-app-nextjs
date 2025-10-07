'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, Coins, Trophy, Crown, Award, User, TrendingUp, TrendingDown,
  Calendar, Camera, Image as ImageIcon, Upload, X, Sparkles, Target, Zap,
  Star, Flame, Skull, HeartCrack
} from 'lucide-react'

type Period = '7days' | '30days' | 'all'
type Tab = 'rankings' | 'hall-of-fame' | 'photos'

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
  const [period, setPeriod] = useState<Period>('30days')
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
    }
  }, [activeTab, period])

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
    const now = new Date()
    
    if (period === '7days') {
      const sevenDaysAgo = new Date(now)
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      startDate = sevenDaysAgo.toISOString().split('T')[0]
    } else if (period === '30days') {
      const thirtyDaysAgo = new Date(now)
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      startDate = thirtyDaysAgo.toISOString().split('T')[0]
    }

    let gambleQuery = supabase
      .from('gamble_records')
      .select('user_id, profit, played_date')
    
    if (startDate) {
      gambleQuery = gambleQuery.gte('played_date', startDate)
    }
    
    const { data: gambleData } = await gambleQuery

    let gameQuery = supabase
      .from('game_sessions')
      .select('user_id, profit, played_at')
    
    if (startDate) {
      gameQuery = gameQuery.gte('played_at', new Date(startDate).toISOString())
    }
    
    const { data: gameData } = await gameQuery

    const prettyCureData = gameData?.map(g => {
      const playedDate = new Date(g.played_at)
      const jstDate = new Date(playedDate.getTime() + 9 * 60 * 60 * 1000)
      const dateStr = jstDate.toISOString().split('T')[0]
      return {
        user_id: g.user_id,
        profit: g.profit,
        played_date: dateStr
      }
    }).filter(g => !startDate || g.played_date >= startDate) || []

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

    const { data: gambleData } = await supabase
      .from('gamble_records')
      .select('id, user_id, profit, category, location, played_date, feeling, memo')
      .order('profit', { ascending: false })

    const { data: gameData } = await supabase
      .from('game_sessions')
      .select('id, user_id, profit, played_at')
      .order('profit', { ascending: false })

    const allRecords = [
      ...(gambleData?.map(r => ({
        ...r,
        playedDate: r.played_date,
        category: r.category || 'other',
        location: r.location || '不明'
      })) || []),
      ...(gameData?.map(r => {
        const playedDate = new Date(r.played_at)
        const jstDate = new Date(playedDate.getTime() + 9 * 60 * 60 * 1000)
        return {
          ...r,
          playedDate: jstDate.toISOString().split('T')[0],
          category: 'poker',
          location: 'ホームゲーム'
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
      case '30days': return '直近30日間'
      case 'all': return '全期間'
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
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'rankings', label: 'ランキング', icon: Trophy },
                { id: 'hall-of-fame', label: '殿堂入り', icon: Crown },
                { id: 'photos', label: '写真', icon: ImageIcon }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as Tab)}
                  className={`py-3 px-2 rounded-xl font-black text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-yellow-500 to-amber-600 text-black shadow-lg shadow-yellow-500/50'
                      : 'text-yellow-400/60 hover:text-yellow-400'
                  }`}
                >
                  <tab.icon className="w-5 h-5 mx-auto mb-1" />
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
                <div className="grid grid-cols-3 gap-1">
                  {[
                    { value: '7days', label: '7日間' },
                    { value: '30days', label: '30日間' },
                    { value: 'all', label: '全期間' }
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPeriod(p.value as Period)}
                      className={`py-2 px-3 rounded-xl font-black text-sm transition-all ${
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
                            <p className="text-sm text-green-400/80">{record.location} - {record.playedDate}</p>
                          </div>

                          <div className="flex-shrink-0 text-right">
                            <p className="font-black text-2xl text-green-400 drop-shadow-glow">
                              +{record.profit.toLocaleString()}
                            </p>
                            <p className="text-xs text-green-400/60">P</p>
                          </div>
                        </div>

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
                            <p className="text-sm text-red-400/80">{record.location} - {record.playedDate}</p>
                          </div>

                          <div className="flex-shrink-0 text-right">
                            <p className="font-black text-2xl text-red-400 drop-shadow-glow">
                              {record.profit.toLocaleString()}
                            </p>
                            <p className="text-xs text-red-400/60">P</p>
                          </div>
                        </div>

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