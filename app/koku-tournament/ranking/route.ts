// app/koku-tournament/ranking/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // アクティブなトーナメントを取得
    const { data: tournament } = await supabase.rpc('get_active_tournament')
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'アクティブなトーナメントがありません' },
        { status: 400 }
      )
    }

    // ランキングデータを取得
    const { data: rankings, error: rankError } = await supabase
      .from('player_monthly_stats')
      .select('user_id, player_name, current_koku, total_matches, total_wins, total_losses, total_attacks, total_defenses, starting_koku')
      .eq('tournament_id', tournament)
      .order('current_koku', { ascending: false })
      .order('rank_timestamp', { ascending: true })

    if (rankError) {
      throw rankError
    }

    // ランク番号を付与
    const rankedPlayers = rankings?.map((player, index) => ({
      ...player,
      rank: index + 1,
      winRate: player.total_matches > 0 
        ? Math.round((player.total_wins / player.total_matches) * 100) 
        : 0,
      kokuChange: player.current_koku - player.starting_koku
    })) || []

    return NextResponse.json({
      success: true,
      data: rankedPlayers
    })

  } catch (error) {
    console.error('Ranking fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'ランキング取得に失敗しました' },
      { status: 500 }
    )
  }
}