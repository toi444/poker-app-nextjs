'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { 
  ArrowLeft, User, Mail, Trophy, TrendingUp, Clock, Calendar, Camera,
  Check, X, Edit2, Save, LogOut, Sparkles, Crown, Target, Zap, Award,
  DollarSign, Coins, Gem, TrendingDown, AlertTriangle, Flame, Skull,
  CloudRain, CloudOff, HeartCrack, Timer, Watch, Infinity, Shield, Moon,
  Lock, Star,
  FileText, Book, BookOpen, Library, Image, Dices, Gamepad2,
  HandCoins, Banknote, Landmark, Wallet, CreditCard, AlertCircle,
  Sunrise, Hourglass, CalendarCheck, Sun
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
  // ポーカー
  poker: '🃏',
  
  // 競技系ギャンブル
  horse_racing: '🏇',
  boat_racing: '🚤',
  bicycle_racing: '🚴',
  auto_racing: '🏎️',
  
  // カジノゲーム
  blackjack: '🎴',
  baccarat: '💎',
  roulette: '🎡',
  craps: '🎲',
  slot: '🎰',
  video_poker: '🖥️',
  keno: '🔢',
  sic_bo: '🎲',
  wheel_of_fortune: '🎪',
  three_card_poker: '🃏',
  caribbean_stud: '🏝️',
  pai_gow: '🀄',
  
  // パチンコ・パチスロ
  pachinko: '🎱',
  pachislot: '🎰',
  
  // 宝くじ・くじ
  lottery: '🎫',
  scratch: '🔖',
  numbers: '🔢',
  toto: '⚽',
  mini_loto: '🎟️',
  loto6: '🎫',
  loto7: '🎰',
  
  // 麻雀
  mahjong: '🀄',
  
  // スポーツベッティング
  sports_betting: '⚽',
  baseball_betting: '⚾',
  basketball_betting: '🏀',
  soccer_betting: '⚽',
  tennis_betting: '🎾',
  
  // オンラインカジノ特有
  live_casino: '📹',
  crash_game: '💥',
  dice_game: '🎲',
  mines: '💣',
  plinko: '🎯',
  
  // その他
  bingo: '🎰',
  fantasy_sports: '🏆',
  esports_betting: '🎮',
  other: '❓'
}

const GAME_NAMES: { [key: string]: string } = {
  // ポーカー
  poker: 'ポーカー',
  
  // 競技系ギャンブル
  horse_racing: '競馬',
  boat_racing: '競艇',
  bicycle_racing: '競輪',
  auto_racing: 'オートレース',
  
  // カジノゲーム
  blackjack: 'ブラックジャック',
  baccarat: 'バカラ',
  roulette: 'ルーレット',
  craps: 'クラップス',
  slot: 'スロット',
  video_poker: 'ビデオポーカー',
  keno: 'キノ',
  sic_bo: 'シックボー',
  wheel_of_fortune: 'ホイールオブフォーチュン',
  three_card_poker: 'スリーカードポーカー',
  caribbean_stud: 'カリビアンスタッド',
  pai_gow: 'パイゴウ',
  
  // パチンコ・パチスロ
  pachinko: 'パチンコ',
  pachislot: 'パチスロ',
  
  // 宝くじ・くじ
  lottery: '宝くじ',
  scratch: 'スクラッチ',
  numbers: 'ナンバーズ',
  toto: 'toto',
  mini_loto: 'ミニロト',
  loto6: 'ロト6',
  loto7: 'ロト7',
  
  // 麻雀
  mahjong: '麻雀',
  
  // スポーツベッティング
  sports_betting: 'スポーツベット',
  baseball_betting: '野球ベット',
  basketball_betting: 'バスケベット',
  soccer_betting: 'サッカーベット',
  tennis_betting: 'テニスベット',
  
  // オンラインカジノ特有
  live_casino: 'ライブカジノ',
  crash_game: 'クラッシュ',
  dice_game: 'ダイス',
  mines: 'マインズ',
  plinko: 'プリンコ',
  
  // その他
  bingo: 'ビンゴ',
  fantasy_sports: 'ファンタジースポーツ',
  esports_betting: 'eスポーツベット',
  other: 'その他'
}

const GAME_CATEGORIES = {
  'カジノテーブル': ['poker', 'blackjack', 'baccarat', 'roulette', 'craps', 'three_card_poker', 'caribbean_stud', 'pai_gow'],
  'カジノマシン': ['slot', 'video_poker', 'keno', 'sic_bo', 'wheel_of_fortune'],
  'パチンコ・パチスロ': ['pachinko', 'pachislot'],
  '公営競技': ['horse_racing', 'boat_racing', 'bicycle_racing', 'auto_racing'],
  '宝くじ': ['lottery', 'scratch', 'numbers', 'toto', 'mini_loto', 'loto6', 'loto7'],
  '麻雀': ['mahjong'],
  'スポーツベット': ['sports_betting', 'baseball_betting', 'basketball_betting', 'soccer_betting', 'tennis_betting', 'esports_betting'],
  'オンラインカジノ': ['live_casino', 'crash_game', 'dice_game', 'mines', 'plinko', 'bingo'],
  'その他': ['fantasy_sports', 'other']
}

const iconComponents: { [key: string]: any } = {
  Trophy, DollarSign, Coins, Gem, Crown, TrendingDown, AlertTriangle, Flame, Skull,
  Zap, Sparkles, CloudRain, CloudOff, HeartCrack, Clock, Timer, Watch, Infinity,
  Target, Shield, Moon, TrendingUp, Star, FileText, Book, BookOpen, Library, Camera, 
  Image, Dices, Gamepad2, HandCoins, Banknote, Landmark, Wallet, CreditCard, AlertCircle,
  Sunrise, Hourglass, CalendarCheck, Sun
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

  // アチーブメント説明を生成する関数
  const generateAchievementDescription = (achievement: Achievement): string => {
    const value = achievement.condition_value
    
    switch (achievement.condition_type) {
      case 'total_profit':
        return `累計収支が+${value.toLocaleString()}P以上`
      case 'total_loss':
        return `累計収支が${value.toLocaleString()}P以下`
      case 'win_streak':
        return `${value}連勝を達成`
      case 'loss_streak':
        return `${value}連敗を記録`
      case 'play_hours':
        return `累計${value}時間以上プレイ`
      case 'jackpot':
        return value === 1 ? 'ストレートフラッシュを獲得' : 'ロイヤルフラッシュを獲得'
      case 'perfect_winrate':
        return `${value}ゲーム以上プレイして勝率100%`
      case 'comeback':
        return '10連敗から勝利で復活'
      case 'night_owl':
        return '深夜2時〜5時にプレイ'
      case 'stable_profit':
        return '10ゲーム連続で収支±5000P以内'
      case 'total_records':
        return `${value}回以上の記録を達成`
      case 'photo_count':
        return `${value}枚以上の写真を投稿`
      case 'gamble_variety':
        return `${value}種類以上のギャンブルをプレイ`
      case 'pbank_lent':
        return `P-BANKで累計${value.toLocaleString()}P以上貸出`
      case 'pbank_borrowed':
        return `P-BANKで累計${value.toLocaleString()}P以上借入`
      case 'early_bird':
        return '朝5時〜7時にプレイ'
      case 'long_session':
        return `${value}分以上の長時間セッション`
      case 'daily_profit':
        return `1日で+${value.toLocaleString()}P以上の収支`
      case 'daily_loss':
        return `1日で${value.toLocaleString()}P以下の収支`
      case 'stable_range':
        return '30ゲーム連続で収支±10000P以内'
      case 'comeback_next_day':
        return '3万円以上の大負けの翌日にプラス収支'
      case 'monthly_rank':
        return '月間ランキング1位を獲得'
      case 'top_win_rank':
        return '歴代大勝ちTOP3入り'
      case 'top_loss_rank':
        return '歴代大負けTOP3入り'
      case 'daily_streak':
        return `${value}日連続でプレイ`
      case 'monthly_comeback':
        return '前月マイナス収支から当月プラス収支に転換'
      case 'phoenix_rise':
        return '累計-10万Pから+10万Pまで復活'
      default:
        return achievement.description || '条件未設定'
    }
  }

  // アチーブメント進捗を計算する関数
  const calculateAchievementProgress = (achievement: Achievement): { current: number; target: number; percentage: number } | null => {
    const value = achievement.condition_value
    
    switch (achievement.condition_type) {
      case 'total_profit':
        return {
          current: stats.totalProfit,
          target: value,
          percentage: Math.min((stats.totalProfit / value) * 100, 100)
        }
      case 'win_streak':
        return {
          current: stats.winStreak,
          target: value,
          percentage: Math.min((stats.winStreak / value) * 100, 100)
        }
      case 'loss_streak':
        return {
          current: stats.lossStreak,
          target: value,
          percentage: Math.min((stats.lossStreak / value) * 100, 100)
        }
      case 'play_hours':
        return {
          current: stats.totalPlayHours,
          target: value,
          percentage: Math.min((stats.totalPlayHours / value) * 100, 100)
        }
      case 'total_records':
        return {
          current: stats.totalGames,
          target: value,
          percentage: Math.min((stats.totalGames / value) * 100, 100)
        }
      default:
        return null
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

      // 基本統計計算
      const totalProfit = allGames.reduce((sum, game) => sum + (game.profit || 0), 0)
      const totalPlayHours = allGames.reduce((sum, game) => sum + (game.play_hours || 0), 0)
      const wins = allGames.filter(game => game.profit > 0).length
      const winRate = allGames.length > 0 ? (wins / allGames.length) * 100 : 0
      const totalRecords = allGames.length

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

      // 不屈の精神: 10連敗から復活
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

      // 夜更かし: 深夜2-5時
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

      // 早起き鳥: 朝5-7時
      let hasEarlyBird = false
      for (const game of allGames) {
        if (game.played_at) {
          const playedDate = new Date(game.played_at)
          const hour = playedDate.getHours()
          if (hour >= 5 && hour < 7) {
            hasEarlyBird = true
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

      // ブレない心: 30ゲーム連続で収支±10000円以内
      let hasStableRange = false
      if (allGames.length >= 30) {
        for (let i = 0; i <= allGames.length - 30; i++) {
          const slice = allGames.slice(i, i + 30)
          const allStable = slice.every(game => Math.abs(game.profit || 0) <= 10000)
          if (allStable) {
            hasStableRange = true
            break
          }
        }
      }

      // 長時間セッション
      const maxSessionHours = Math.max(...allGames.map(g => g.play_hours || 0), 0)
      const maxSessionMinutes = maxSessionHours * 60

      // ジャックポット取得チェック（日本語と英語の両方に対応）
      const { data: jackpots } = await supabase
        .from('jackpot_winners')
        .select('hand_type')
        .eq('user_id', userId)

      const hasStraightFlush = jackpots?.some(j => 
        j.hand_type === 'straight_flush' || 
        j.hand_type === 'ストレートフラッシュ'
      )
      const hasRoyalFlush = jackpots?.some(j => 
        j.hand_type === 'royal_flush' || 
        j.hand_type === 'ロイヤルフラッシュ'
      )

      // 写真投稿数チェック
      const { data: photos } = await supabase
        .from('gamble_photos')
        .select('id')
        .eq('user_id', userId)
      const photoCount = photos?.length || 0

      // ギャンブル種類チェック（gamble_recordsのみ）
      const { data: gambleRecords } = await supabase
        .from('gamble_records')
        .select('gamble_type')
        .eq('user_id', userId)
      const uniqueGambleTypes = new Set(gambleRecords?.map(r => r.gamble_type) || [])
      const gambleVariety = uniqueGambleTypes.size

      // P-BANK累計額チェック
      const { data: loansAsLender } = await supabase
        .from('loans')
        .select('amount')
        .eq('lender_id', userId)
      const totalLent = loansAsLender?.reduce((sum, loan) => sum + loan.amount, 0) || 0

      const { data: loansAsBorrower } = await supabase
        .from('loans')
        .select('amount')
        .eq('borrower_id', userId)
      const totalBorrowed = loansAsBorrower?.reduce((sum, loan) => sum + loan.amount, 0) || 0

      // 1日の最大収支チェック
      const dailyProfits: { [date: string]: number } = {}
      for (const game of allGames) {
        const date = game.played_at ? new Date(game.played_at).toISOString().split('T')[0] : 'unknown'
        dailyProfits[date] = (dailyProfits[date] || 0) + (game.profit || 0)
      }
      const maxDailyProfit = Math.max(...Object.values(dailyProfits), 0)
      const minDailyProfit = Math.min(...Object.values(dailyProfits), 0)

      // 大負け後の翌日プラス収支チェック
      let hasComebackNextDay = false
      const sortedGames = [...allGames].sort((a, b) => 
        new Date(a.played_at || 0).getTime() - new Date(b.played_at || 0).getTime()
      )
      for (let i = 0; i < sortedGames.length - 1; i++) {
        const currentGame = sortedGames[i]
        const nextGame = sortedGames[i + 1]
        
        if (currentGame.profit <= -30000 && nextGame.profit > 0) {
          const currentDate = new Date(currentGame.played_at || 0)
          const nextDate = new Date(nextGame.played_at || 0)
          const dayDiff = (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
          
          if (dayDiff >= 1 && dayDiff < 2) {
            hasComebackNextDay = true
            break
          }
        }
      }

      // 連続プレイ日数（daily_streak）
      let maxDailyStreak = 0
      if (allGames.length > 0) {
        const uniqueDates = Array.from(new Set(
          allGames
            .filter(g => g.played_at)
            .map(g => {
              const date = new Date(g.played_at)
              return date.toISOString().split('T')[0]
            })
        )).sort()

        if (uniqueDates.length > 0) {
          let currentStreak = 1
          maxDailyStreak = 1  // 最低でも1日はプレイしている
          
          for (let i = 1; i < uniqueDates.length; i++) {
            const prevDate = new Date(uniqueDates[i - 1])
            const currDate = new Date(uniqueDates[i])
            const diffDays = Math.floor((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))
            
            if (diffDays === 1) {
              currentStreak++
              maxDailyStreak = Math.max(maxDailyStreak, currentStreak)
            } else {
              currentStreak = 1
            }
          }
        }
      }

      // 月間カムバック（monthly_comeback）
      let hasMonthlyComeback = false
      if (allGames.length > 0) {
        const monthlyProfits: { [month: string]: number } = {}
        
        allGames.forEach(game => {
          if (game.played_at) {
            const date = new Date(game.played_at)
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            monthlyProfits[monthKey] = (monthlyProfits[monthKey] || 0) + (game.profit || 0)
          }
        })
        
        const sortedMonths = Object.keys(monthlyProfits).sort()
        
        for (let i = 1; i < sortedMonths.length; i++) {
          const prevMonth = sortedMonths[i - 1]
          const currMonth = sortedMonths[i]
          
          if (monthlyProfits[prevMonth] < 0 && monthlyProfits[currMonth] > 0) {
            hasMonthlyComeback = true
            break
          }
        }
      }

      // フェニックス復活（phoenix_rise）
      let hasPhoenixRise = false
      if (allGames.length > 0) {
        const timeOrderedGames = [...allGames].sort((a, b) => {
          const dateA = new Date(a.played_at || 0).getTime()
          const dateB = new Date(b.played_at || 0).getTime()
          return dateA - dateB
        })
        
        let cumulativeProfit = 0
        let reachedMinus100k = false
        
        for (const game of timeOrderedGames) {
          cumulativeProfit += (game.profit || 0)
          
          if (cumulativeProfit <= -100000) {
            reachedMinus100k = true
          }
          
          if (reachedMinus100k && cumulativeProfit >= 100000) {
            hasPhoenixRise = true
            break
          }
        }
      }

      // 大勝ち・大負けTOP3チェック（game_sessions + gamble_records）
      const { data: allProfitGameSessions } = await supabase
        .from('game_sessions')
        .select('user_id, profit')
        .order('profit', { ascending: false })
        .limit(100)  // TOP100を取得して後で絞る
      
      const { data: allProfitGambleRecords } = await supabase
        .from('gamble_records')
        .select('user_id, profit')
        .order('profit', { ascending: false })
        .limit(100)

      const allProfits = [
        ...(allProfitGameSessions || []),
        ...(allProfitGambleRecords || [])
      ].sort((a, b) => b.profit - a.profit).slice(0, 3)
      
      const isTopWinner = allProfits.some(g => g.user_id === userId)

      const { data: allLossGameSessions } = await supabase
        .from('game_sessions')
        .select('user_id, profit')
        .order('profit', { ascending: true })
        .limit(100)
      
      const { data: allLossGambleRecords } = await supabase
        .from('gamble_records')
        .select('user_id, profit')
        .order('profit', { ascending: true })
        .limit(100)

      const allLosses = [
        ...(allLossGameSessions || []),
        ...(allLossGambleRecords || [])
      ].sort((a, b) => a.profit - b.profit).slice(0, 3)
      
      const isTopLoser = allLosses.some(g => g.user_id === userId)

      // 各アチーブメントをチェック
      for (const achievement of allAchievements) {
        if (unlockedIds.includes(achievement.id)) continue

        let shouldUnlock = false

        switch (achievement.condition_type) {
          // 既存の条件
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

          // 新規条件
          case 'total_records':
            shouldUnlock = totalRecords >= achievement.condition_value
            break
          case 'photo_count':
            shouldUnlock = photoCount >= achievement.condition_value
            break
          case 'gamble_variety':
            shouldUnlock = gambleVariety >= achievement.condition_value
            break
          case 'pbank_lent':
            shouldUnlock = totalLent >= achievement.condition_value
            break
          case 'pbank_borrowed':
            shouldUnlock = totalBorrowed >= achievement.condition_value
            break
          case 'early_bird':
            shouldUnlock = hasEarlyBird
            break
          case 'long_session':
            shouldUnlock = maxSessionMinutes >= achievement.condition_value
            break
          case 'daily_profit':
            shouldUnlock = maxDailyProfit >= achievement.condition_value
            break
          case 'daily_loss':
            shouldUnlock = minDailyProfit <= achievement.condition_value
            break
          case 'stable_range':
            shouldUnlock = hasStableRange
            break
          case 'comeback_next_day':
            shouldUnlock = hasComebackNextDay
            break
          case 'top_win_rank':
            shouldUnlock = isTopWinner
            break
          case 'top_loss_rank':
            shouldUnlock = isTopLoser
            break
          case 'daily_streak':
            shouldUnlock = maxDailyStreak >= achievement.condition_value
            break
          case 'monthly_comeback':
            shouldUnlock = hasMonthlyComeback
            break
          case 'phoenix_rise':
            shouldUnlock = hasPhoenixRise
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
    setSelectedGames(prev => {
      if (prev.includes(gameType)) {
        // 既に選択されている場合は削除
        return prev.filter(g => g !== gameType)
      } else {
        // 新規選択の場合、3個未満なら追加
        if (prev.length < 3) {
          return [...prev, gameType]
        } else {
          // 3個以上選択しようとした場合は警告
          alert('お気に入りゲームは最大3個までです')
          return prev
        }
      }
    })
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
    // 絵文字の場合はそのまま返す
    if (/[\u{1F300}-\u{1F9FF}]/u.test(iconName)) {
      return () => <span className="text-2xl">{iconName}</span>
    }
    
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

        {/* お気に入りゲーム編集セクション */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-75" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-3xl p-6 border-2 border-purple-500/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-400" />
                お気に入りゲーム
              </h3>
              {!isEditingGames ? (
                <button
                  onClick={() => setIsEditingGames(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  <span className="text-sm font-bold">編集</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsEditingGames(false)
                      setSelectedGames(profile?.favorite_games || [])
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-xl transition-all"
                  >
                    <X className="w-4 h-4" />
                    <span className="text-sm font-bold">キャンセル</span>
                  </button>
                  <button
                    onClick={handleGamesSave}
                    disabled={savingGames}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 rounded-xl transition-all disabled:opacity-50"
                  >
                    {savingGames ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span className="text-sm font-bold">保存</span>
                  </button>
                </div>
              )}
            </div>

            {gamesSuccess && (
              <div className="flex items-center gap-2 text-green-400 bg-green-950/50 px-4 py-2 rounded-xl mb-3 border-2 border-green-500/50 animate-slide-in">
                <Check className="w-5 h-5" />
                <span className="text-sm font-bold">お気に入りゲームを更新しました！</span>
              </div>
            )}

            {!isEditingGames ? (
              // 表示モード
              <div className="flex flex-wrap gap-2">
                {(profile?.favorite_games || []).length > 0 ? (
                  (profile?.favorite_games || []).map((gameType: string) => (
                    <div
                      key={gameType}
                      className="flex items-center gap-2 px-3 py-2 bg-purple-950/50 border-2 border-purple-500/50 rounded-xl"
                    >
                      <span className="text-xl">{GAME_ICONS[gameType]}</span>
                      <span className="text-sm font-bold text-purple-200">{GAME_NAMES[gameType]}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-sm">お気に入りゲームが設定されていません</p>
                )}
              </div>
            ) : (
              // 編集モード（カテゴリ別）
              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                {Object.entries(GAME_CATEGORIES).map(([category, games]) => (
                  <div key={category}>
                    <h4 className="text-sm font-bold text-purple-300 mb-2 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-400" />
                      {category}
                    </h4>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {games.map((gameType) => {
                        const isSelected = selectedGames.includes(gameType)
                        return (
                          <button
                            key={gameType}
                            onClick={() => toggleGame(gameType)}
                            className={`
                              flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all
                              ${isSelected 
                                ? 'bg-purple-600 border-purple-400 shadow-lg shadow-purple-500/50' 
                                : 'bg-gray-800/50 border-gray-600/50 hover:border-purple-500/50'
                              }
                            `}
                          >
                            <span className="text-lg">{GAME_ICONS[gameType]}</span>
                            <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-gray-400'}`}>
                              {GAME_NAMES[gameType]}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-white ml-auto" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-purple-300/60 mt-3">
              最大3個まで選択可能
            </p>
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

        {/* アチーブメント表示セクション */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-3xl blur-xl opacity-75" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-3xl p-6 border-2 border-yellow-500/50">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent flex items-center gap-2">
                <Trophy className="w-7 h-7 text-yellow-400 drop-shadow-glow" />
                アチーブメント
              </h2>
              <div className="text-sm font-bold text-yellow-300 bg-black/50 px-3 py-1.5 rounded-full border border-yellow-500/50">
                {unlockedAchievements.length} / {achievements.length}
              </div>
            </div>

            {/* スクロール可能なアチーブメントリスト */}
            <div className="max-h-[500px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {achievements
                .sort((a, b) => {
                  // tierでソート（bronze < silver < gold < platinum < diamond）
                  const tierOrder = { bronze: 1, silver: 2, gold: 3, platinum: 4, diamond: 5 }
                  const tierDiff = (tierOrder[a.tier as keyof typeof tierOrder] || 0) - (tierOrder[b.tier as keyof typeof tierOrder] || 0)
                  if (tierDiff !== 0) return tierDiff
                  // 同じtierならcondition_typeでソート
                  return a.condition_type.localeCompare(b.condition_type)
                })
                .map((achievement) => {
                  const isUnlocked = unlockedAchievements.includes(achievement.id)
                  const IconComponent = getBadgeIcon(achievement.icon)
                  
                  // tierに応じたボーダーカラー
                  const tierBorderColor = {
                    bronze: 'border-orange-500/50',
                    silver: 'border-gray-400/50',
                    gold: 'border-yellow-500/50',
                    platinum: 'border-cyan-400/50',
                    diamond: 'border-purple-500/50'
                  }[achievement.tier] || 'border-gray-500/50'

                  return (
                    <div
                      key={achievement.id}
                      className={`
                        relative flex items-center gap-4 p-3 rounded-xl border-2 transition-all duration-300
                        ${isUnlocked 
                          ? `bg-gradient-to-r ${achievement.badge_gradient} ${tierBorderColor}` 
                          : 'bg-gray-900/50 border-gray-700/50 opacity-40'
                        }
                      `}
                    >
                      {/* アイコン部分 */}
                      <div className={`
                        flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center
                        ${isUnlocked 
                          ? 'bg-black/30 border-2 border-white/20' 
                          : 'bg-gray-800/50 border-2 border-gray-600/50'
                        }
                      `}>
                        {IconComponent && (
                          <IconComponent className={`w-6 h-6 ${isUnlocked ? 'text-white' : 'text-gray-600'}`} />
                        )}
                      </div>

                      {/* テキスト部分 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`font-black text-base ${isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                            {achievement.name}
                          </h3>
                          {/* tierバッジ */}
                          <span className={`
                            text-xs font-bold px-2 py-0.5 rounded-full
                            ${achievement.tier === 'bronze' && 'bg-amber-700 text-orange-100 border border-orange-400'}
                            ${achievement.tier === 'silver' && 'bg-gray-400 text-gray-900 border border-gray-300'}
                            ${achievement.tier === 'gold' && 'bg-yellow-500 text-yellow-950 border border-yellow-400'}
                            ${achievement.tier === 'platinum' && 'bg-cyan-400 text-cyan-950 border border-cyan-300'}
                            ${achievement.tier === 'diamond' && 'bg-purple-500 text-purple-100 border border-purple-400'}
                          `}>
                            {achievement.tier.toUpperCase()}
                          </span>
                        </div>
                        <p className={`text-sm mb-2 ${isUnlocked ? 'text-white/80' : 'text-gray-600'}`}>
                          {generateAchievementDescription(achievement)}
                        </p>
                        
                        {/* 進捗バー（未取得の場合のみ） */}
                        {!isUnlocked && (() => {
                          const progress = calculateAchievementProgress(achievement)
                          if (progress && progress.percentage > 0 && progress.percentage < 100) {
                            return (
                              <div className="mt-2">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-xs text-gray-400 font-bold">
                                    進捗: {progress.current.toLocaleString()} / {progress.target.toLocaleString()}
                                  </span>
                                  <span className="text-xs text-gray-400 font-bold">
                                    {progress.percentage.toFixed(0)}%
                                  </span>
                                </div>
                                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300"
                                    style={{ width: `${progress.percentage}%` }}
                                  />
                                </div>
                              </div>
                            )
                          }
                          return null
                        })()}
                      </div>

                      {/* 取得済みマーク */}
                      {isUnlocked && (
                        <div className="flex-shrink-0 bg-yellow-400 rounded-full p-1.5">
                          <Check className="w-4 h-4 text-black" />
                        </div>
                      )}

                      {/* 未取得ロックアイコン */}
                      {!isUnlocked && (
                        <div className="flex-shrink-0 text-gray-600">
                          <Lock className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
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

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #f59e0b, #d97706);
          border-radius: 10px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #fbbf24, #f59e0b);
        }

        /* Firefox用スクロールバー */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #f59e0b rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  )
}