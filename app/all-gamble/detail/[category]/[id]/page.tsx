'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, Calendar, Clock, DollarSign, 
  Trash2, Edit, MapPin, Trophy, Target,
  TrendingUp, Sparkles, Tag, Timer, Zap,
  Heart, Flame, Cloud, Frown, Smile,
  TrendingDown
} from 'lucide-react'

interface RecordDetail {
  id: string
  category: string
  location?: string
  played_date: string
  start_time?: string
  end_time?: string
  play_duration?: number
  buy_in?: number
  cash_out?: number
  profit: number
  feeling?: string
  memo?: string
  tags?: string[]
  
  // カテゴリ別詳細
  poker_details?: any
  pachinko_details?: any
  slot_details?: any
  casino_details?: any
  race_details?: any
}

export default function DetailPage() {
  const router = useRouter()
  const params = useParams()
  const category = params.category as string
  const id = params.id as string
  
  const [record, setRecord] = useState<RecordDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDetail()
  }, [])

  const fetchDetail = async () => {
    try {
      if (category === 'pretty_cure') {
        // Pretty Cure!のデータはgame_sessionsから取得
        const { data, error } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        if (data) {
          // played_atから日付を抽出（JST変換）
          const playedDate = new Date(data.played_at)
          const jstDate = new Date(playedDate.getTime() + 9 * 60 * 60 * 1000)
          const dateStr = jstDate.toISOString().split('T')[0]

          setRecord({
            id: data.id,
            category: 'pretty_cure',
            location: 'Pretty Cure!',
            played_date: dateStr,
            start_time: data.start_time,
            end_time: data.end_time,
            play_duration: data.play_hours ? data.play_hours * 60 : null,
            buy_in: data.buy_in,
            cash_out: data.cash_out,
            profit: data.profit,
            feeling: undefined,
            memo: undefined
          })
        }
      } else {
        // その他のギャンブルはgamble_recordsから取得
        const { data, error } = await supabase
          .from('gamble_records')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error
        setRecord(data)
      }
    } catch (error) {
      console.error('Fetch error:', error)
      alert('データの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('この記録を削除しますか？')) return

    try {
      const tableName = category === 'pretty_cure' ? 'game_sessions' : 'gamble_records'
      
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id)

      if (error) throw error

      alert('削除しました')
      router.push('/all-gamble')
    } catch (error) {
      console.error('Delete error:', error)
      alert('削除に失敗しました')
    }
  }

  const getCategoryInfo = () => {
    const infoMap: Record<string, { icon: string, name: string, color: string, glowColor: string }> = {
      'pretty_cure': { icon: '🎴', name: 'Pretty Cure!', color: 'from-violet-500 to-purple-600', glowColor: 'purple' },
      'poker': { icon: '🃏', name: 'ポーカー', color: 'from-purple-500 to-indigo-600', glowColor: 'purple' },
      'slot': { icon: '🎰', name: 'スロット', color: 'from-red-500 to-pink-600', glowColor: 'red' },
      'pachinko': { icon: '🎲', name: 'パチンコ', color: 'from-pink-400 to-rose-500', glowColor: 'pink' },
      'casino': { icon: '💎', name: 'カジノ', color: 'from-yellow-500 to-amber-600', glowColor: 'yellow' },
      'horse_race': { icon: '🏇', name: '競馬', color: 'from-green-500 to-emerald-600', glowColor: 'green' },
      'boat_race': { icon: '🚤', name: '競艇', color: 'from-blue-500 to-cyan-600', glowColor: 'blue' },
      'bicycle_race': { icon: '🚴', name: '競輪', color: 'from-orange-500 to-yellow-600', glowColor: 'orange' },
      'other': { icon: '💰', name: 'その他', color: 'from-gray-500 to-slate-600', glowColor: 'gray' }
    }
    return infoMap[category] || infoMap['other']
  }

  const getFeelingInfo = (feeling?: string) => {
    if (!feeling) return null
    const feelingMap: Record<string, { emoji: any, label: string, color: string, gradient: string }> = {
      'excellent': { 
        emoji: Smile, 
        label: '最高', 
        color: 'text-green-400',
        gradient: 'from-green-600 to-emerald-600'
      },
      'good': { 
        emoji: Smile, 
        label: '良い', 
        color: 'text-blue-400',
        gradient: 'from-blue-600 to-cyan-600'
      },
      'normal': { 
        emoji: Cloud, 
        label: '普通', 
        color: 'text-gray-400',
        gradient: 'from-gray-600 to-slate-600'
      },
      'bad': { 
        emoji: Frown, 
        label: '悪い', 
        color: 'text-orange-400',
        gradient: 'from-orange-600 to-red-600'
      },
      'terrible': { 
        emoji: Frown, 
        label: '最悪', 
        color: 'text-red-400',
        gradient: 'from-red-600 to-pink-600'
      }
    }
    return feelingMap[feeling]
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const weekdays = ['日', '月', '火', '水', '木', '金', '土']
    const weekday = weekdays[date.getDay()]
    return `${year}年${month}月${day}日（${weekday}）`
  }

  const formatDuration = (minutes?: number) => {
    if (!minutes) return null
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}時間${mins}分` : `${mins}分`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-orange-500 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400 mb-4 font-bold">記録が見つかりませんでした</p>
          <div className="relative group inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl blur-lg opacity-75" />
            <button
              onClick={() => router.push('/all-gamble')}
              className="relative px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-black"
            >
              戻る
            </button>
          </div>
        </div>
      </div>
    )
  }

  const categoryInfo = getCategoryInfo()
  const feelingInfo = getFeelingInfo(record.feeling)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900">
      {/* 背景エフェクト */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950/20 via-black to-red-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* ヘッダー */}
      <div className="relative bg-black/60 backdrop-blur-xl border-b-2 border-orange-500/50 sticky top-0 z-50 shadow-lg shadow-orange-500/20">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="relative group"
            >
              <div className="absolute inset-0 bg-orange-600 blur-lg opacity-0 group-hover:opacity-75 transition-opacity rounded-full" />
              <div className="relative w-12 h-12 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center border-2 border-orange-500/50 hover:border-orange-400 transition-all">
                <ArrowLeft className="w-5 h-5 text-orange-300" />
              </div>
            </button>
            
            <h1 className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 drop-shadow-glow">
              記録詳細
            </h1>

            <button
              onClick={handleDelete}
              className="relative group"
            >
              <div className="absolute inset-0 bg-red-600 blur-lg opacity-0 group-hover:opacity-75 transition-opacity rounded-full" />
              <div className="relative w-12 h-12 rounded-full bg-red-600/20 backdrop-blur-sm flex items-center justify-center border-2 border-red-500/50 hover:border-red-400 transition-all">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
            </button>
          </div>
        </div>
      </div>

      <div className="relative container max-w-md mx-auto px-4 py-6 pb-20">
        {/* カテゴリヘッダー */}
        <div className="relative group mb-6">
          <div className={`absolute inset-0 bg-gradient-to-r ${categoryInfo.color} rounded-3xl blur-2xl opacity-75 animate-pulse`} />
          <div className={`relative bg-gradient-to-r ${categoryInfo.color} rounded-3xl p-1 shadow-2xl`}>
            <div className="bg-black/40 backdrop-blur-sm rounded-3xl p-6 border-2 border-white/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className={`absolute inset-0 bg-${categoryInfo.glowColor}-600 blur-xl opacity-75`} />
                  <span className="relative text-6xl drop-shadow-glow">{categoryInfo.icon}</span>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-black text-white drop-shadow-glow">{categoryInfo.name}</h2>
                  <p className="text-sm text-white/80 mt-2 font-bold">{formatDate(record.played_date)}</p>
                </div>
              </div>

              <div className="relative">
                <div className={`absolute inset-0 ${record.profit >= 0 ? 'bg-green-600' : 'bg-red-600'} blur-xl opacity-50`} />
                <div className="relative bg-white/20 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/30">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-black text-white/90 flex items-center gap-2">
                      {record.profit >= 0 ? (
                        <TrendingUp className="w-5 h-5 text-green-300" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-300" />
                      )}
                      収支
                    </p>
                  </div>
                  <p className="text-5xl font-black text-white drop-shadow-glow">
                    {record.profit >= 0 ? '+' : ''}{record.profit.toLocaleString()}
                  </p>
                  <p className="text-sm text-white/80 mt-1 font-bold">円</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="relative group mb-4">
          <div className="absolute inset-0 bg-cyan-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-cyan-500/30 shadow-2xl">
            <h3 className="font-black text-white mb-4 flex items-center gap-2 text-lg">
              <Calendar className="w-5 h-5 text-cyan-400 drop-shadow-glow" />
              基本情報
            </h3>

            <div className="space-y-4">
              {record.location && (
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <MapPin className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0 drop-shadow-glow" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-cyan-300 mb-1">場所</p>
                    <p className="font-black text-white">{record.location}</p>
                  </div>
                </div>
              )}

              {record.start_time && record.end_time && (
                <div className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                  <Clock className="w-5 h-5 text-cyan-400 mt-0.5 flex-shrink-0 drop-shadow-glow" />
                  <div className="flex-1">
                    <p className="text-xs font-bold text-cyan-300 mb-1">プレイ時間</p>
                    <p className="font-black text-white">
                      {record.start_time} - {record.end_time}
                    </p>
                    {record.play_duration && (
                      <p className="text-sm text-gray-400 mt-1 font-bold flex items-center gap-1">
                        <Timer className="w-4 h-4" />
                        {formatDuration(record.play_duration)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="relative group">
                  <div className="absolute inset-0 bg-purple-600 rounded-xl blur-lg opacity-30" />
                  <div className="relative bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-xs font-bold text-purple-300 mb-2 flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      バイイン
                    </p>
                    <p className="text-2xl font-black text-white drop-shadow-glow">
                      {record.buy_in?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-400 font-bold">円</p>
                  </div>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-green-600 rounded-xl blur-lg opacity-30" />
                  <div className="relative bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-xs font-bold text-green-300 mb-2 flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      現金化
                    </p>
                    <p className="text-2xl font-black text-white drop-shadow-glow">
                      {record.cash_out?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-gray-400 font-bold">円</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 感情・メモ */}
        {(record.feeling || record.memo) && (
          <div className="relative group mb-4">
            <div className="absolute inset-0 bg-pink-600 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-pink-500/30 shadow-2xl">
              <h3 className="font-black text-white mb-4 flex items-center gap-2 text-lg">
                <Heart className="w-5 h-5 text-pink-400 drop-shadow-glow" />
                振り返り
              </h3>

              {feelingInfo && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-pink-300 mb-2">満足度</p>
                  <div className="relative group/feeling inline-block">
                    <div className={`absolute inset-0 bg-gradient-to-r ${feelingInfo.gradient} blur-lg opacity-75`} />
                    <div className={`relative inline-flex items-center gap-3 px-6 py-3 rounded-2xl border-2 border-white/30 bg-gradient-to-r ${feelingInfo.gradient}`}>
                      <feelingInfo.emoji className="w-6 h-6 text-white drop-shadow-glow" />
                      <span className="font-black text-white text-lg drop-shadow-glow">{feelingInfo.label}</span>
                    </div>
                  </div>
                </div>
              )}

              {record.memo && (
                <div>
                  <p className="text-xs font-bold text-pink-300 mb-2">メモ</p>
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <p className="text-sm text-white whitespace-pre-wrap font-medium leading-relaxed">{record.memo}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* タグ */}
        {record.tags && record.tags.length > 0 && (
          <div className="relative group mb-4">
            <div className="absolute inset-0 bg-indigo-600 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-indigo-500/30 shadow-2xl">
              <h3 className="font-black text-white mb-3 flex items-center gap-2 text-lg">
                <Tag className="w-5 h-5 text-indigo-400 drop-shadow-glow" />
                タグ
              </h3>
              <div className="flex flex-wrap gap-2">
                {record.tags.map((tag, index) => (
                  <div key={index} className="relative group/tag">
                    <div className="absolute inset-0 bg-purple-600 blur-lg opacity-50" />
                    <span className="relative px-4 py-2 bg-purple-600/30 border-2 border-purple-500/50 text-purple-300 rounded-full text-sm font-black">
                      {tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ポーカー詳細 */}
        {record.poker_details && (
          <div className="relative group mb-4">
            <div className="absolute inset-0 bg-purple-600 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/30 shadow-2xl">
              <h3 className="font-black text-white mb-4 text-lg">ポーカー詳細</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-gray-400 font-bold">ゲーム種類</span>
                  <span className="font-black text-white">{record.poker_details.game_type || 'NLH'}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-gray-400 font-bold">形式</span>
                  <span className="font-black text-white">
                    {record.poker_details.format === 'cash' ? 'キャッシュゲーム' : 'トーナメント'}
                  </span>
                </div>
                {record.poker_details.blind && (
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-400 font-bold">ブラインド</span>
                    <span className="font-black text-white">{record.poker_details.blind}</span>
                  </div>
                )}
                {record.poker_details.venue_type && (
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-400 font-bold">会場</span>
                    <span className="font-black text-white">
                      {record.poker_details.venue_type === 'other_store' ? '他店舗' :
                       record.poker_details.venue_type === 'home_game' ? 'ホームゲーム' : 'オンライン'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* カジノ詳細 */}
        {record.casino_details && (
          <div className="relative group mb-4">
            <div className="absolute inset-0 bg-yellow-600 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-yellow-500/30 shadow-2xl">
              <h3 className="font-black text-white mb-4 text-lg">カジノ詳細</h3>
              {record.casino_details.country && (
                <p className="text-sm mb-4 p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-gray-400 font-bold">国・地域: </span>
                  <span className="font-black text-white">{record.casino_details.country}</span>
                </p>
              )}
              {record.casino_details.games && record.casino_details.games.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-yellow-300 mb-3">プレイしたゲーム</p>
                  <div className="space-y-3">
                    {record.casino_details.games.map((game: any, index: number) => (
                      <div key={index} className="relative group/game">
                        <div className={`absolute inset-0 ${game.profit >= 0 ? 'bg-green-600' : 'bg-red-600'} rounded-xl blur-lg opacity-30`} />
                        <div className="relative bg-white/5 rounded-xl p-4 border border-white/10">
                          <div className="flex justify-between items-center mb-3">
                            <span className="font-black text-white text-sm">
                              {game.game_type === 'baccarat' ? 'バカラ' :
                               game.game_type === 'blackjack' ? 'ブラックジャック' :
                               game.game_type === 'roulette' ? 'ルーレット' :
                               game.game_type === 'slot' ? 'スロット' : 'その他'}
                            </span>
                            <span className={`font-black text-lg ${game.profit >= 0 ? 'text-green-400' : 'text-red-400'} drop-shadow-glow`}>
                              {game.profit >= 0 ? '+' : ''}{game.profit.toLocaleString()}円
                            </span>
                          </div>
                          <div className="flex gap-4 text-xs text-gray-400 font-bold">
                            <span>IN: {game.buy_in.toLocaleString()}円</span>
                            <span>OUT: {game.cash_out.toLocaleString()}円</span>
                          </div>
                          {game.note && (
                            <p className="text-xs text-gray-400 mt-3 p-2 bg-black/20 rounded border border-white/5">{game.note}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* パチンコ詳細 */}
        {record.pachinko_details && (
          <div className="relative group mb-4">
            <div className="absolute inset-0 bg-pink-600 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-pink-500/30 shadow-2xl">
              <h3 className="font-black text-white mb-4 text-lg">パチンコ詳細</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-gray-400 font-bold">機種名</span>
                  <span className="font-black text-white">{record.pachinko_details.machine_name}</span>
                </div>
                {record.pachinko_details.machine_type && (
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-400 font-bold">タイプ</span>
                    <span className="font-black text-white">{record.pachinko_details.machine_type}</span>
                  </div>
                )}
                {record.pachinko_details.rotation_per_1k && (
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-400 font-bold">1k回転数</span>
                    <span className="font-black text-white">{record.pachinko_details.rotation_per_1k}回</span>
                  </div>
                )}
                {record.pachinko_details.jackpot_count != null && (
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-400 font-bold">大当たり回数</span>
                    <span className="font-black text-white">{record.pachinko_details.jackpot_count}回</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* スロット詳細 */}
        {record.slot_details && (
          <div className="relative group mb-4">
            <div className="absolute inset-0 bg-red-600 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/30 shadow-2xl">
              <h3 className="font-black text-white mb-4 text-lg">スロット詳細</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                  <span className="text-gray-400 font-bold">機種名</span>
                  <span className="font-black text-white">{record.slot_details.machine_name}</span>
                </div>
                {record.slot_details.estimated_setting && (
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-400 font-bold">予想設定</span>
                    <span className="font-black text-white">設定{record.slot_details.estimated_setting}</span>
                  </div>
                )}
                {record.slot_details.confirmed_setting && (
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-400 font-bold">確定設定</span>
                    <span className="font-black text-orange-400">設定{record.slot_details.confirmed_setting}以上</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* レース詳細 */}
        {record.race_details && (
          <div className="relative group mb-4">
            <div className="absolute inset-0 bg-green-600 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/30 shadow-2xl">
              <h3 className="font-black text-white mb-4 text-lg">
                {record.race_details.race_type === 'horse' ? '競馬' :
                 record.race_details.race_type === 'boat' ? '競艇' : '競輪'}詳細
              </h3>
              <div className="space-y-3">
                {record.race_details.track && (
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-400 font-bold">場所</span>
                    <span className="font-black text-white">{record.race_details.track}</span>
                  </div>
                )}
                {record.race_details.bet_types && record.race_details.bet_types.length > 0 && (
                  <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                    <p className="text-gray-400 mb-2 font-bold text-sm">購入券種</p>
                    <div className="flex flex-wrap gap-2">
                      {record.race_details.bet_types.map((type: string, index: number) => (
                        <span key={index} className="px-3 py-1 bg-blue-600/30 border-2 border-blue-500/50 text-blue-300 rounded-full text-xs font-black">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {record.race_details.hits != null && (
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-400 font-bold">的中回数</span>
                    <span className="font-black text-white">{record.race_details.hits}回</span>
                  </div>
                )}
                {record.race_details.biggest_win && (
                  <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10">
                    <span className="text-gray-400 font-bold">最高配当</span>
                    <span className="font-black text-green-400 drop-shadow-glow">{record.race_details.biggest_win.toLocaleString()}円</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  )
}