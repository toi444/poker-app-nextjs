// app/api/koku-tournament/info/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // アクティブなトーナメントを取得
    const { data: tournament, error: tournamentError } = await supabase
      .rpc('get_active_tournament')
    
    if (tournamentError || !tournament) {
      return NextResponse.json(
        { success: false, error: 'アクティブなトーナメントがありません' },
        { status: 400 }
      )
    }

    // トーナメント情報を取得
    const { data: tournamentData, error: dataError } = await supabase
      .from('monthly_tournaments')
      .select('*')
      .eq('id', tournament)
      .single()
    
    if (dataError) {
      console.error('Tournament data error:', dataError)
      return NextResponse.json(
        { success: false, error: 'トーナメント情報の取得に失敗しました' },
        { status: 500 }
      )
    }

    // 残り日数を計算
    const endDate = new Date(tournamentData.end_date)
    const now = new Date()
    const diffTime = endDate.getTime() - now.getTime()
    const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

    return NextResponse.json({
      success: true,
      data: {
        totalPot: tournamentData.total_pot,
        totalGames: tournamentData.total_games,
        daysLeft: daysLeft,
        month: tournamentData.month,
        year: tournamentData.year
      }
    })

  } catch (error) {
    console.error('Get tournament info error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}