// app/api/koku-tournament/opponents/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // 認証チェック
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user.id

    // 1. アクティブなトーナメントを取得
    const { data: tournament, error: tournamentError } = await supabase
      .rpc('get_active_tournament')
    
    if (tournamentError || !tournament) {
      return NextResponse.json(
        { success: false, error: 'アクティブなトーナメントがありません' },
        { status: 400 }
      )
    }

    const tournamentId = tournament

    // 2. 全プレイヤーの統計を取得（自分以外）
    const { data: allPlayers, error: playersError } = await supabase
      .from('player_monthly_stats')
      .select('user_id, player_name, current_koku, total_matches, total_wins, total_losses, rank_timestamp')
      .eq('tournament_id', tournamentId)
      .neq('user_id', userId)
      .order('current_koku', { ascending: false })
      .order('rank_timestamp', { ascending: true })
    
    if (playersError) {
      console.error('Players fetch error:', playersError)
      return NextResponse.json(
        { success: false, error: 'プレイヤー情報の取得に失敗しました' },
        { status: 500 }
      )
    }

    // 3. 各プレイヤーの直近5戦を取得
    const opponentsWithHistory = await Promise.all(
      allPlayers.map(async (player, index) => {
        // 直近5戦を取得
        const { data: recentMatches } = await supabase
          .from('match_history')
          .select('result')
          .eq('tournament_id', tournamentId)
          .eq('player_id', player.user_id)
          .order('created_at', { ascending: false })
          .limit(5)
        
        const recentForm = recentMatches?.map(m => m.result === 'win') || []
        
        // 勝率計算
        const winRate = player.total_matches > 0 
          ? Math.round((player.total_wins / player.total_matches) * 100)
          : 0

        // プロフィール情報を取得（アバター用）
        const { data: profile } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', player.user_id)
          .single()

        return {
          id: player.user_id,
          username: player.player_name,
          koku: player.current_koku,
          rank: index + 1, // 自分を除いた順位
          winRate: winRate,
          totalMatches: player.total_matches,
          recentForm: recentForm,
          avatarUrl: profile?.avatar_url || null
        }
      })
    )

    // 4. 自分の情報も取得（表示用）
    const { data: myStats } = await supabase
      .from('player_monthly_stats')
      .select('player_name, current_koku, total_matches, total_wins')
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId)
      .single()

    // 自分の順位を計算
    const { data: allPlayersIncludingMe } = await supabase
      .from('player_monthly_stats')
      .select('user_id, current_koku, rank_timestamp')
      .eq('tournament_id', tournamentId)
      .order('current_koku', { ascending: false })
      .order('rank_timestamp', { ascending: true })

    const myRank = allPlayersIncludingMe
      ? allPlayersIncludingMe.findIndex(p => p.user_id === userId) + 1
      : 1

    const myWinRate = myStats && myStats.total_matches > 0
      ? Math.round((myStats.total_wins / myStats.total_matches) * 100)
      : 0

    // 自分の直近5戦
    const { data: myRecentMatches } = await supabase
      .from('match_history')
      .select('result')
      .eq('tournament_id', tournamentId)
      .eq('player_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    const myRecentForm = myRecentMatches?.map(m => m.result === 'win') || []

    return NextResponse.json({
      success: true,
      opponents: opponentsWithHistory,
      myInfo: {
        id: userId,
        username: myStats?.player_name || '自分',
        koku: myStats?.current_koku || 100,
        rank: myRank,
        winRate: myWinRate,
        totalMatches: myStats?.total_matches || 0,
        recentForm: myRecentForm,
        isMe: true
      }
    })

  } catch (error) {
    console.error('Get opponents error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}