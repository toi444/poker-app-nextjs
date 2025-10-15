// app/koku-tournament/player-data/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0
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
        { success: false, error: 'アクティブなトーナメントがありません', needsInitialization: false },
        { status: 400 }
      )
    }

    const tournamentId = tournament

    // 2. プレイヤーの統計データを取得
    const { data: playerStats, error: statsError } = await supabase
      .from('player_monthly_stats')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId)
      .single()
    
    if (statsError) {
      console.log('Player stats not found, needs initialization')
      // プレイヤーがまだ参加していない場合、初期化を促す
      return NextResponse.json({
        success: false,
        error: 'トーナメントに参加していません',
        needsInitialization: true
      })
    }

    // 3. ランキング計算
    const { data: allPlayers } = await supabase
      .from('player_monthly_stats')
      .select('user_id, current_koku, rank_timestamp')
      .eq('tournament_id', tournamentId)
      .order('current_koku', { ascending: false })
      .order('rank_timestamp', { ascending: true })

    const rank = allPlayers 
      ? allPlayers.findIndex(p => p.user_id === userId) + 1 
      : 1
    const totalPlayers = allPlayers?.length || 1

    // 4. 今日の攻撃回数を取得
    const { data: jstDate } = await supabase.rpc('get_jst_date')
    
    const { data: attackData } = await supabase
      .from('daily_attack_limits')
      .select('attack_count')
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId)
      .eq('date', jstDate)
      .single()

    const attacksToday = attackData?.attack_count || 0

    // 5. プロフィール情報を取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single()

    // 6. レスポンスを構築
    return NextResponse.json({
      success: true,
      data: {
        userId: session.user.id,
        username: playerStats.player_name,
        koku: playerStats.current_koku,
        rank: rank,
        totalMatches: playerStats.total_matches,
        totalWins: playerStats.total_wins,
        totalLosses: playerStats.total_losses,
        totalPSpent: playerStats.total_p_spent,  // ← これが必要
        attacksToday: attacksToday,
        maxAttacks: 20,
        totalPlayers: allPlayers?.length || 0
      }
    })

  } catch (error) {
    console.error('Get player data error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}