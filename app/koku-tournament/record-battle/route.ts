// app/api/koku-tournament/record-battle/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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
    const {
      challengerId,
      defenderId,
      challengerName,
      defenderName,
      enemyRoll,
      enemyType,
      allyRoll,
      allyType,
      isTank,
      result,
      kokuChange
    } = body

    // バリデーション
    if (!challengerId || !defenderId || !result) {
      return NextResponse.json(
        { success: false, error: 'パラメータが不正です' },
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

    // 2. 今日まだ攻撃可能かチェック
    const { data: canAttack, error: canAttackError } = await supabase
      .rpc('can_attack_today', {
        p_tournament_id: tournamentId,
        p_user_id: challengerId
      })
    
    if (canAttackError) {
      console.error('Attack check error:', canAttackError)
      return NextResponse.json(
        { success: false, error: '攻撃チェックに失敗しました' },
        { status: 500 }
      )
    }

    if (!canAttack) {
      return NextResponse.json(
        { success: false, error: '本日の攻撃回数を使い切りました' },
        { status: 429 }
      )
    }

    // 3. 攻撃回数をインクリメント
    const { error: incrementError } = await supabase
      .rpc('increment_daily_attacks', {
        p_tournament_id: tournamentId,
        p_user_id: challengerId
      })
    
    if (incrementError) {
      console.error('Increment error:', incrementError)
      return NextResponse.json(
        { success: false, error: '攻撃回数の更新に失敗しました' },
        { status: 500 }
      )
    }

    // 4. battle_matchesに記録挿入
    const { data: matchData, error: matchError } = await supabase
      .from('battle_matches')
      .insert({
        tournament_id: tournamentId,
        challenger_id: challengerId,
        defender_id: defenderId,
        challenger_name: challengerName,
        defender_name: defenderName,
        enemy_roll: enemyRoll,
        enemy_type: enemyType,
        ally_roll: allyRoll,
        ally_type: allyType,
        is_tank: isTank,
        result: result,
        koku_change: kokuChange,
        p_spent: 50
      })
      .select('id')
      .single()
    
    if (matchError) {
      console.error('Match insert error:', matchError)
      return NextResponse.json(
        { success: false, error: '対戦記録の保存に失敗しました' },
        { status: 500 }
      )
    }

    // 5. match_historyに記録挿入（攻め手のみ）
    const { error: historyError } = await supabase
      .from('match_history')
      .insert({
        tournament_id: tournamentId,
        player_id: challengerId,
        player_name: challengerName,
        game_type: 'battle',
        match_id: matchData.id,
        opponent_id: defenderId,
        result: result,
        koku_change: kokuChange,
        p_spent: 50
      })
    
    if (historyError) {
      console.error('History insert error:', historyError)
      // 履歴は補助的なので続行
    }

    // 6. player_monthly_statsを更新（攻め手）
    // 現在の値を取得
    const { data: challengerStats } = await supabase
      .from('player_monthly_stats')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('user_id', challengerId)
      .single()

    if (challengerStats) {
      const isWin = result === 'win'
      await supabase
        .from('player_monthly_stats')
        .update({
          current_koku: challengerStats.current_koku + kokuChange,
          total_matches: challengerStats.total_matches + 1,
          total_attacks: challengerStats.total_attacks + 1,
          total_wins: challengerStats.total_wins + (isWin ? 1 : 0),
          total_losses: challengerStats.total_losses + (isWin ? 0 : 1),
          total_p_spent: challengerStats.total_p_spent + 50,
          updated_at: new Date().toISOString()
        })
        .eq('tournament_id', tournamentId)
        .eq('user_id', challengerId)
    }

    // 7. player_monthly_statsを更新（守り手）
    const { data: defenderStats } = await supabase
      .from('player_monthly_stats')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('user_id', defenderId)
      .single()

    if (defenderStats) {
      const defenderIsWin = result === 'lose' // 守り手視点では逆
      const defenderKokuChange = -kokuChange
      
      await supabase
        .from('player_monthly_stats')
        .update({
          current_koku: defenderStats.current_koku + defenderKokuChange,
          total_matches: defenderStats.total_matches + 1,
          total_defenses: defenderStats.total_defenses + 1,
          total_wins: defenderStats.total_wins + (defenderIsWin ? 1 : 0),
          total_losses: defenderStats.total_losses + (defenderIsWin ? 0 : 1),
          updated_at: new Date().toISOString()
        })
        .eq('tournament_id', tournamentId)
        .eq('user_id', defenderId)
    }

    // 8. monthly_tournamentsを更新
    const { data: tournamentData } = await supabase
      .from('monthly_tournaments')
      .select('total_pot, total_games')
      .eq('id', tournamentId)
      .single()

    if (tournamentData) {
      await supabase
        .from('monthly_tournaments')
        .update({
          total_pot: tournamentData.total_pot + 50,
          total_games: tournamentData.total_games + 1
        })
        .eq('id', tournamentId)
    }

    // 9. 更新後のデータを取得
    const { data: updatedStats } = await supabase
      .from('player_monthly_stats')
      .select('current_koku')
      .eq('tournament_id', tournamentId)
      .eq('user_id', challengerId)
      .single()

    // ランキング計算
    const { data: rankData } = await supabase
      .from('player_monthly_stats')
      .select('user_id')
      .eq('tournament_id', tournamentId)
      .order('current_koku', { ascending: false })
      .order('rank_timestamp', { ascending: true })

    const newRank = rankData ? rankData.findIndex(p => p.user_id === challengerId) + 1 : 1

    // 宝物庫を取得
    const { data: treasureData } = await supabase
      .from('monthly_tournaments')
      .select('total_pot')
      .eq('id', tournamentId)
      .single()

    // 今日の攻撃回数を取得
    const { data: jstDate } = await supabase.rpc('get_jst_date')
    
    const { data: attackData } = await supabase
      .from('daily_attack_limits')
      .select('attack_count')
      .eq('tournament_id', tournamentId)
      .eq('user_id', challengerId)
      .eq('date', jstDate)
      .single()

    return NextResponse.json({
      success: true,
      message: '対戦結果を記録しました',
      data: {
        matchId: matchData.id,
        newKoku: updatedStats?.current_koku || 0,
        newRank: newRank,
        newAttackCount: attackData?.attack_count || 1,
        treasurePot: treasureData?.total_pot || 0
      }
    })

  } catch (error) {
    console.error('Record battle error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}