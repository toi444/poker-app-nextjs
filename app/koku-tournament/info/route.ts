// app/koku-tournament/info/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // アクティブなトーナメントを取得
    const { data: tournament, error: tournamentError } = await supabase
      .from('monthly_tournaments')
      .select('*')
      .eq('status', 'active')
      .single()
    
    if (tournamentError || !tournament) {
      console.error('Tournament fetch error:', tournamentError)
      return NextResponse.json(
        { success: false, error: 'アクティブなトーナメントがありません' },
        { status: 404 }
      )
    }

    console.log('Tournament data from DB:', {
      id: tournament.id,
      total_pot: tournament.total_pot,
      total_games: tournament.total_games
    })

    // 残り日数を計算
    const now = new Date()
    const endDate = new Date(tournament.end_date)
    const diffTime = endDate.getTime() - now.getTime()
    const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

    return NextResponse.json({
      success: true,
      data: {
        tournamentId: tournament.id,
        year: tournament.year,
        month: tournament.month,
        totalPot: tournament.total_pot || 0,
        totalGames: tournament.total_games || 0,
        daysLeft: daysLeft
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      }
    })

  } catch (error: any) {
    console.error('Info API error:', error)
    return NextResponse.json(
      { success: false, error: 'トーナメント情報の取得に失敗しました' },
      { status: 500 }
    )
  }
}