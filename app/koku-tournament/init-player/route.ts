// app/api/koku-tournament/init-player/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: Request) {
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

    const body = await request.json()
    const userId = body.userId || session.user.id
    const username = body.username

    if (!username) {
      return NextResponse.json(
        { success: false, error: 'ユーザー名が必要です' },
        { status: 400 }
      )
    }

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

    // 2. 既に参加済みかチェック
    const { data: existingPlayer } = await supabase
      .from('player_monthly_stats')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId)
      .single()

    if (existingPlayer) {
      return NextResponse.json({
        success: true,
        message: '既に参加済みです',
        stats: existingPlayer
      })
    }

    // 3. プレイヤーを初期化
    const { data: newPlayer, error: insertError } = await supabase
      .from('player_monthly_stats')
      .insert({
        tournament_id: tournamentId,
        user_id: userId,
        player_name: username,
        starting_koku: 100,
        current_koku: 100,
        total_matches: 0,
        total_attacks: 0,
        total_defenses: 0,
        total_wins: 0,
        total_losses: 0,
        total_p_spent: 0,
        rank_timestamp: new Date().toISOString()
      })
      .select()
      .single()

    if (insertError) {
      console.error('Player init error:', insertError)
      return NextResponse.json(
        { success: false, error: 'プレイヤーの初期化に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'トーナメントに参加しました！',
      stats: newPlayer
    })

  } catch (error) {
    console.error('Init player error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}