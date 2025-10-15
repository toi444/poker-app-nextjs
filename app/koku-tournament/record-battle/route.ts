// app/koku-tournament/record-battle/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

    console.log('=== Battle Record Start ===')
    console.log('Challenger:', challengerId, challengerName)
    console.log('Defender:', defenderId, defenderName)
    console.log('Result:', result, 'KokuChange:', kokuChange)

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
      console.error('Tournament error:', tournamentError)
      return NextResponse.json(
        { success: false, error: 'アクティブなトーナメントがありません' },
        { status: 400 }
      )
    }

    const tournamentId = tournament

    // 2. 今日まだ攻撃可能かチェック
    const { data: jstDateData } = await supabase.rpc('get_jst_date')
    const today = jstDateData

    const { data: attackLimit } = await supabase
      .from('daily_attack_limits')
      .select('attack_count')
      .eq('tournament_id', tournamentId)
      .eq('user_id', challengerId)
      .eq('date', today)
      .single()

    if (attackLimit && attackLimit.attack_count >= 20) {
      return NextResponse.json(
        { success: false, error: '本日の攻撃回数を使い切りました' },
        { status: 429 }
      )
    }

    // 3. 攻撃回数を記録/更新
    if (attackLimit) {
      await supabase
        .from('daily_attack_limits')
        .update({ 
          attack_count: attackLimit.attack_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('tournament_id', tournamentId)
        .eq('user_id', challengerId)
        .eq('date', today)
    } else {
      await supabase
        .from('daily_attack_limits')
        .insert({
          tournament_id: tournamentId,
          user_id: challengerId,
          date: today,
          attack_count: 1
        })
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
        { success: false, error: '対戦記録の保存に失敗しました: ' + matchError.message },
        { status: 500 }
      )
    }

    console.log('Match created:', matchData.id)

    // 5. match_historyに記録挿入（攻め手のみ）
    await supabase
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

    // 6. 攻め手の現在の統計を取得
    const { data: challengerStats, error: challengerFetchError } = await supabase
      .from('player_monthly_stats')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('user_id', challengerId)
      .single()

    if (challengerFetchError || !challengerStats) {
      console.error('Challenger fetch error:', challengerFetchError)
      return NextResponse.json(
        { success: false, error: '攻撃者のデータ取得に失敗しました' },
        { status: 500 }
      )
    }

    const isWin = result === 'win'
    const newChallengerKoku = challengerStats.current_koku + kokuChange

    console.log('Challenger update:', {
      before: challengerStats.current_koku,
      change: kokuChange,
      after: newChallengerKoku
    })

    // 7. 攻め手の統計を更新
    const { error: challengerUpdateError } = await supabase
      .from('player_monthly_stats')
      .update({
        current_koku: newChallengerKoku,
        total_matches: challengerStats.total_matches + 1,
        total_attacks: challengerStats.total_attacks + 1,
        total_wins: challengerStats.total_wins + (isWin ? 1 : 0),
        total_losses: challengerStats.total_losses + (isWin ? 0 : 1),
        total_p_spent: challengerStats.total_p_spent + 50,
        rank_timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('tournament_id', tournamentId)
      .eq('user_id', challengerId)

    if (challengerUpdateError) {
      console.error('Challenger update error:', challengerUpdateError)
      return NextResponse.json(
        { success: false, error: '攻撃者の更新に失敗しました: ' + challengerUpdateError.message },
        { status: 500 }
      )
    }

    console.log('Challenger updated successfully')

    // 8. 守り手の現在の統計を取得
    const { data: defenderStats, error: defenderFetchError } = await supabase
      .from('player_monthly_stats')
      .select('*')
      .eq('tournament_id', tournamentId)
      .eq('user_id', defenderId)
      .single()

    if (defenderFetchError || !defenderStats) {
      console.error('Defender fetch error:', defenderFetchError)
      return NextResponse.json(
        { success: false, error: '防御者のデータ取得に失敗しました: ' + defenderFetchError.message },
        { status: 500 }
      )
    }

    const defenderIsWin = result === 'lose' // 守り手視点では逆
    const defenderKokuChange = -kokuChange // 石高変動は逆（攻撃者が+1なら守り手は-1）
    const newDefenderKoku = defenderStats.current_koku + defenderKokuChange

    console.log('Defender update:', {
      before: defenderStats.current_koku,
      change: defenderKokuChange,
      after: newDefenderKoku
    })

    // 9. 守り手の統計を更新
    const { error: defenderUpdateError } = await supabase
      .from('player_monthly_stats')
      .update({
        current_koku: newDefenderKoku,
        total_matches: defenderStats.total_matches + 1,
        total_defenses: defenderStats.total_defenses + 1,
        total_wins: defenderStats.total_wins + (defenderIsWin ? 1 : 0),
        total_losses: defenderStats.total_losses + (defenderIsWin ? 0 : 1),
        rank_timestamp: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('tournament_id', tournamentId)
      .eq('user_id', defenderId)

    if (defenderUpdateError) {
      console.error('Defender update error:', defenderUpdateError)
      return NextResponse.json(
        { success: false, error: '防御者の更新に失敗しました: ' + defenderUpdateError.message },
        { status: 500 }
      )
    }

    console.log('Defender updated successfully')

    // 10. monthly_tournamentsを更新（宝物庫）
    const { data: tournamentData, error: tournamentFetchError } = await supabase
      .from('monthly_tournaments')
      .select('total_pot, total_games')
      .eq('id', tournamentId)
      .single()

    if (tournamentFetchError) {
      console.error('Tournament fetch error:', tournamentFetchError)
    } else if (tournamentData) {
      const newPot = (tournamentData.total_pot || 0) + 50
      const newGames = (tournamentData.total_games || 0) + 1
      
      console.log('Updating tournament:', {
        before: { pot: tournamentData.total_pot, games: tournamentData.total_games },
        after: { pot: newPot, games: newGames }
      })
      
      const { error: tournamentUpdateError } = await supabase
        .from('monthly_tournaments')
        .update({
          total_pot: newPot,
          total_games: newGames
        })
        .eq('id', tournamentId)

      if (tournamentUpdateError) {
        console.error('Tournament update error:', tournamentUpdateError)
      } else {
        console.log('Tournament updated successfully:', { pot: newPot, games: newGames })
      }
    }

    // 11. 更新後のデータを取得
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
    const { data: updatedAttackData } = await supabase
      .from('daily_attack_limits')
      .select('attack_count')
      .eq('tournament_id', tournamentId)
      .eq('user_id', challengerId)
      .eq('date', today)
      .single()

    console.log('=== Battle Record Complete ===')

    return NextResponse.json({
      success: true,
      message: '対戦結果を記録しました',
      data: {
        matchId: matchData.id,
        newKoku: updatedStats?.current_koku || 0,
        newRank: newRank,
        newAttackCount: updatedAttackData?.attack_count || 1,
        treasurePot: treasureData?.total_pot || 0
      }
    })

  } catch (error: any) {
    console.error('Record battle error:', error)
    return NextResponse.json(
      { success: false, error: 'サーバーエラー: ' + error.message },
      { status: 500 }
    )
  }
}