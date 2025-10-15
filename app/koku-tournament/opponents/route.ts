// app/koku-tournament/opponents/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'ユーザーIDが必要です' },
        { status: 400 }
      )
    }

    // アクティブなトーナメントを取得
    const { data: tournament, error: tournamentError } = await supabase
      .rpc('get_active_tournament')
    
    if (tournamentError || !tournament) {
      return NextResponse.json(
        { success: false, error: 'アクティブなトーナメントがありません' },
        { status: 400 }
      )
    }

    const tournamentId = tournament

    // 全プレイヤーのデータを取得
    const { data: allPlayers, error: playersError } = await supabase
      .from('player_monthly_stats')
      .select('user_id, player_name, current_koku, total_matches, total_wins, total_losses, starting_koku, total_attacks, total_defenses')
      .eq('tournament_id', tournamentId)
      .order('current_koku', { ascending: false })
      .order('rank_timestamp', { ascending: true })

    if (playersError) {
      throw playersError
    }

    // 各プレイヤーの直近5戦を取得
    const playerIds = allPlayers?.map(p => p.user_id) || []
    
    const { data: recentMatches } = await supabase
      .from('battle_matches')
      .select('challenger_id, defender_id, result')
      .eq('tournament_id', tournamentId)
      .or(`challenger_id.in.(${playerIds.join(',')}),defender_id.in.(${playerIds.join(',')})`)
      .order('created_at', { ascending: false })
      .limit(500) // 直近500件から抽出

    // プレイヤーごとの直近5戦を計算
    const playerRecentForm: Record<string, boolean[]> = {}
    
    playerIds.forEach(playerId => {
      const playerMatches = recentMatches?.filter(match => 
        match.challenger_id === playerId || match.defender_id === playerId
      ).slice(0, 5) || []

      playerRecentForm[playerId] = playerMatches.map(match => {
        if (match.challenger_id === playerId) {
          return match.result === 'win'
        } else {
          return match.result === 'lose' // 防御側は逆
        }
      })

      // 5戦に満たない場合は空欄で埋める
      while (playerRecentForm[playerId].length < 5) {
        playerRecentForm[playerId].push(false)
      }
    })

    // 自分の情報
    const myInfo = allPlayers?.find(p => p.user_id === userId)
    const myRank = allPlayers?.findIndex(p => p.user_id === userId) + 1 || 0

    // 今日の攻撃回数を取得
    const { data: jstDate } = await supabase.rpc('get_jst_date')
    
    const { data: attackData } = await supabase
      .from('daily_attack_limits')
      .select('attack_count')
      .eq('tournament_id', tournamentId)
      .eq('user_id', userId)
      .eq('date', jstDate)
      .single()

    const attacksToday = attackData?.attack_count || 0

    // 対戦相手リスト（自分以外）
    const opponents = allPlayers
      ?.filter(p => p.user_id !== userId)
      .map((player, index) => ({
        id: player.user_id,
        username: player.player_name,
        rank: allPlayers.findIndex(p => p.user_id === player.user_id) + 1,
        koku: player.current_koku,
        winRate: player.total_matches > 0 
          ? Math.round((player.total_wins / player.total_matches) * 100) 
          : 0,
        totalMatches: player.total_matches,
        totalWins: player.total_wins,
        totalLosses: player.total_losses,
        kokuChange: player.current_koku - player.starting_koku,
        recentForm: playerRecentForm[player.user_id] || [false, false, false, false, false]
      })) || []

    // 自分の情報を整形
    const myInfoFormatted = myInfo ? {
      id: myInfo.user_id,
      username: myInfo.player_name,
      rank: myRank,
      koku: myInfo.current_koku,
      winRate: myInfo.total_matches > 0 
        ? Math.round((myInfo.total_wins / myInfo.total_matches) * 100) 
        : 0,
      totalMatches: myInfo.total_matches,
      totalWins: myInfo.total_wins,
      totalLosses: myInfo.total_losses,
      kokuChange: myInfo.current_koku - myInfo.starting_koku,
      recentForm: playerRecentForm[myInfo.user_id] || [false, false, false, false, false],
      attacksToday: attacksToday
    } : null

    return NextResponse.json({
      success: true,
      opponents: opponents,
      myInfo: myInfoFormatted
    })

  } catch (error) {
    console.error('Opponents fetch error:', error)
    return NextResponse.json(
      { success: false, error: '対戦相手の取得に失敗しました' },
      { status: 500 }
    )
  }
}