// app/koku-tournament/history/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const userId = searchParams.get('userId')
    
    // アクティブなトーナメントを取得
    const { data: tournament } = await supabase.rpc('get_active_tournament')
    
    if (!tournament) {
      return NextResponse.json(
        { success: false, error: 'アクティブなトーナメントがありません' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('battle_matches')
      .select('*')
      .eq('tournament_id', tournament)
      .order('created_at', { ascending: false })
      .limit(limit)

    // 特定ユーザーの履歴を取得する場合
    if (userId) {
      query = query.or(`challenger_id.eq.${userId},defender_id.eq.${userId}`)
    }

    const { data: matches, error: matchError } = await query

    if (matchError) {
      throw matchError
    }

    return NextResponse.json({
      success: true,
      data: matches || []
    })

  } catch (error) {
    console.error('History fetch error:', error)
    return NextResponse.json(
      { success: false, error: '履歴取得に失敗しました' },
      { status: 500 }
    )
  }
}