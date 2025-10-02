'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, Calendar, Clock, DollarSign, 
  Trash2, Edit, MapPin, Trophy, Target,
  TrendingUp, Sparkles, Tag
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
    const infoMap: Record<string, { icon: string, name: string, color: string }> = {
      'pretty_cure': { icon: '🎴', name: 'Pretty Cure!', color: 'from-violet-500 to-purple-600' },
      'poker': { icon: '🃏', name: 'ポーカー', color: 'from-purple-500 to-indigo-600' },
      'slot': { icon: '🎰', name: 'スロット', color: 'from-red-500 to-pink-600' },
      'pachinko': { icon: '🎲', name: 'パチンコ', color: 'from-pink-400 to-rose-500' },
      'casino': { icon: '💎', name: 'カジノ', color: 'from-yellow-500 to-amber-600' },
      'horse_race': { icon: '🏇', name: '競馬', color: 'from-green-500 to-emerald-600' },
      'boat_race': { icon: '🚤', name: '競艇', color: 'from-blue-500 to-cyan-600' },
      'bicycle_race': { icon: '🚴', name: '競輪', color: 'from-orange-500 to-yellow-600' },
      'other': { icon: '💰', name: 'その他', color: 'from-gray-500 to-slate-600' }
    }
    return infoMap[category] || infoMap['other']
  }

  const getFeelingEmoji = (feeling?: string) => {
    if (!feeling) return null
    const emojiMap: Record<string, { emoji: string, label: string, color: string }> = {
      'excellent': { emoji: '😄', label: '最高', color: 'bg-green-100 text-green-700 border-green-300' },
      'good': { emoji: '🙂', label: '良い', color: 'bg-blue-100 text-blue-700 border-blue-300' },
      'normal': { emoji: '😐', label: '普通', color: 'bg-gray-100 text-gray-700 border-gray-300' },
      'bad': { emoji: '😞', label: '悪い', color: 'bg-orange-100 text-orange-700 border-orange-300' },
      'terrible': { emoji: '😡', label: '最悪', color: 'bg-red-100 text-red-700 border-red-300' }
    }
    return emojiMap[feeling]
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full" />
        </div>
      </div>
    )
  }

  if (!record) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-700 mb-4">記録が見つかりませんでした</p>
          <button
            onClick={() => router.push('/all-gamble')}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold"
          >
            戻る
          </button>
        </div>
      </div>
    )
  }

  const categoryInfo = getCategoryInfo()
  const feelingInfo = getFeelingEmoji(record.feeling)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-24">
      {/* ヘッダー */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <h1 className="text-lg font-black text-gray-900">記録詳細</h1>

            <button
              onClick={handleDelete}
              className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center hover:bg-red-100 transition-all"
            >
              <Trash2 className="w-5 h-5 text-red-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6">
        {/* カテゴリヘッダー */}
        <div className={`bg-gradient-to-r ${categoryInfo.color} rounded-3xl p-6 shadow-2xl text-white mb-6`}>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-5xl">{categoryInfo.icon}</span>
            <div className="flex-1">
              <h2 className="text-2xl font-black">{categoryInfo.name}</h2>
              <p className="text-sm opacity-90 mt-1">{formatDate(record.played_date)}</p>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4">
            <p className="text-sm opacity-90 mb-2">収支</p>
            <p className="text-4xl font-black">
              {record.profit >= 0 ? '+' : ''}{record.profit.toLocaleString()}円
            </p>
          </div>
        </div>

        {/* 基本情報 */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg mb-4">
          <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            基本情報
          </h3>

          <div className="space-y-3">
            {record.location && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">場所</p>
                  <p className="font-bold text-gray-900">{record.location}</p>
                </div>
              </div>
            )}

            {record.start_time && record.end_time && (
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mb-1">プレイ時間</p>
                  <p className="font-bold text-gray-900">
                    {record.start_time} - {record.end_time}
                    {record.play_duration && (
                      <span className="text-sm text-gray-600 ml-2">
                        ({formatDuration(record.play_duration)})
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
              <div>
                <p className="text-xs text-gray-600 mb-1">バイイン</p>
                <p className="text-xl font-black text-gray-900">
                  {record.buy_in?.toLocaleString() || 0}円
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">現金化</p>
                <p className="text-xl font-black text-gray-900">
                  {record.cash_out?.toLocaleString() || 0}円
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 感情・メモ */}
        {(record.feeling || record.memo) && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg mb-4">
            <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-gray-600" />
              振り返り
            </h3>

            {feelingInfo && (
              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-2">満足度</p>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${feelingInfo.color}`}>
                  <span className="text-2xl">{feelingInfo.emoji}</span>
                  <span className="font-bold">{feelingInfo.label}</span>
                </div>
              </div>
            )}

            {record.memo && (
              <div>
                <p className="text-xs text-gray-600 mb-2">メモ</p>
                <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{record.memo}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* タグ（ポーカーの場合） */}
        {record.tags && record.tags.length > 0 && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg mb-4">
            <h3 className="font-black text-gray-900 mb-3 flex items-center gap-2">
              <Tag className="w-5 h-5 text-gray-600" />
              タグ
            </h3>
            <div className="flex flex-wrap gap-2">
              {record.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-bold"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* カテゴリ別詳細情報 */}
        {record.poker_details && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg mb-4">
            <h3 className="font-black text-gray-900 mb-4">ポーカー詳細</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ゲーム種類</span>
                <span className="font-bold text-gray-900">{record.poker_details.game_type || 'NLH'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">形式</span>
                <span className="font-bold text-gray-900">
                  {record.poker_details.format === 'cash' ? 'キャッシュゲーム' : 'トーナメント'}
                </span>
              </div>
              {record.poker_details.blind && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ブラインド</span>
                  <span className="font-bold text-gray-900">{record.poker_details.blind}</span>
                </div>
              )}
              {record.poker_details.venue_type && (
                <div className="flex justify-between">
                  <span className="text-gray-600">会場</span>
                  <span className="font-bold text-gray-900">
                    {record.poker_details.venue_type === 'other_store' ? '他店舗' :
                     record.poker_details.venue_type === 'home_game' ? 'ホームゲーム' : 'オンライン'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {record.casino_details && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg mb-4">
            <h3 className="font-black text-gray-900 mb-4">カジノ詳細</h3>
            {record.casino_details.country && (
              <p className="text-sm mb-3">
                <span className="text-gray-600">国・地域: </span>
                <span className="font-bold text-gray-900">{record.casino_details.country}</span>
              </p>
            )}
            {record.casino_details.games && record.casino_details.games.length > 0 && (
              <div>
                <p className="text-xs text-gray-600 mb-2">プレイしたゲーム</p>
                <div className="space-y-2">
                  {record.casino_details.games.map((game: any, index: number) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-900 text-sm">
                          {game.game_type === 'baccarat' ? 'バカラ' :
                           game.game_type === 'blackjack' ? 'ブラックジャック' :
                           game.game_type === 'roulette' ? 'ルーレット' :
                           game.game_type === 'slot' ? 'スロット' : 'その他'}
                        </span>
                        <span className={`font-black ${game.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {game.profit >= 0 ? '+' : ''}{game.profit.toLocaleString()}円
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-600">
                        <span>IN: {game.buy_in.toLocaleString()}円</span>
                        <span>OUT: {game.cash_out.toLocaleString()}円</span>
                      </div>
                      {game.note && (
                        <p className="text-xs text-gray-600 mt-2">{game.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {record.pachinko_details && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg mb-4">
            <h3 className="font-black text-gray-900 mb-4">パチンコ詳細</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">機種名</span>
                <span className="font-bold text-gray-900">{record.pachinko_details.machine_name}</span>
              </div>
              {record.pachinko_details.machine_type && (
                <div className="flex justify-between">
                  <span className="text-gray-600">タイプ</span>
                  <span className="font-bold text-gray-900">{record.pachinko_details.machine_type}</span>
                </div>
              )}
              {record.pachinko_details.rotation_per_1k && (
                <div className="flex justify-between">
                  <span className="text-gray-600">1k回転数</span>
                  <span className="font-bold text-gray-900">{record.pachinko_details.rotation_per_1k}回</span>
                </div>
              )}
              {record.pachinko_details.jackpot_count != null && (
                <div className="flex justify-between">
                  <span className="text-gray-600">大当たり回数</span>
                  <span className="font-bold text-gray-900">{record.pachinko_details.jackpot_count}回</span>
                </div>
              )}
            </div>
          </div>
        )}

        {record.slot_details && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg mb-4">
            <h3 className="font-black text-gray-900 mb-4">スロット詳細</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">機種名</span>
                <span className="font-bold text-gray-900">{record.slot_details.machine_name}</span>
              </div>
              {record.slot_details.estimated_setting && (
                <div className="flex justify-between">
                  <span className="text-gray-600">予想設定</span>
                  <span className="font-bold text-gray-900">設定{record.slot_details.estimated_setting}</span>
                </div>
              )}
              {record.slot_details.confirmed_setting && (
                <div className="flex justify-between">
                  <span className="text-gray-600">確定設定</span>
                  <span className="font-bold text-orange-600">設定{record.slot_details.confirmed_setting}以上</span>
                </div>
              )}
            </div>
          </div>
        )}

        {record.race_details && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg mb-4">
            <h3 className="font-black text-gray-900 mb-4">
              {record.race_details.race_type === 'horse' ? '競馬' :
               record.race_details.race_type === 'boat' ? '競艇' : '競輪'}詳細
            </h3>
            <div className="space-y-2 text-sm">
              {record.race_details.track && (
                <div className="flex justify-between">
                  <span className="text-gray-600">場所</span>
                  <span className="font-bold text-gray-900">{record.race_details.track}</span>
                </div>
              )}
              {record.race_details.bet_types && record.race_details.bet_types.length > 0 && (
                <div>
                  <p className="text-gray-600 mb-1">購入券種</p>
                  <div className="flex flex-wrap gap-1">
                    {record.race_details.bet_types.map((type: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">
                        {type}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {record.race_details.hits != null && (
                <div className="flex justify-between">
                  <span className="text-gray-600">的中回数</span>
                  <span className="font-bold text-gray-900">{record.race_details.hits}回</span>
                </div>
              )}
              {record.race_details.biggest_win && (
                <div className="flex justify-between">
                  <span className="text-gray-600">最高配当</span>
                  <span className="font-bold text-green-600">{record.race_details.biggest_win.toLocaleString()}円</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}