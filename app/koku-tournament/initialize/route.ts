// app/api/koku-tournament/initialize/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
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

    const userId = session.user.id

    // プロフィール取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single()

    // アクティブなトーナメントを取得
    const { data: tournament, error: tournamentError } = await supabase
      .rpc('get_active_tournament')
    
    if (tournamentError || !tournament) {
      return NextResponse.json(
        { success: false, error: 'アクティブなトーナメントがありません' },
        { status: 400 }
      )
    }

    // すでに参加しているかチェック
    const { data: existing } = await supabase
      .from('player_monthly_stats')
      .select('id')
      .eq('tournament_id', tournament)
      .eq('user_id', userId)
      .single()

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'すでに参加しています'
      })
    }

    // 初期データを挿入
    const { error: insertError } = await supabase
      .from('player_monthly_stats')
      .insert({
        tournament_id: tournament,
        user_id: userId,
        player_name: profile?.username || 'プレイヤー',
        current_koku: 100,
        total_matches: 0,
        total_wins: 0,
        total_losses: 0,
        total_attacks: 0,
        total_defenses: 0,
        total_p_spent: 0
      })

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { success: false, error: 'データの作成に失敗しました' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'トーナメントに参加しました'
    })

  } catch (error) {
    console.error('Initialize error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}