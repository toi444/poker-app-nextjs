import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  return NextResponse.json({
    success: true,
    data: {
      username: 'テストユーザー',
      koku: 100,
      rank: 1,
      totalPlayers: 1,
      attacksToday: 0,
      maxAttacks: 20,
      wins: 0,
      losses: 0,
      totalMatches: 0,
      pSpent: 0,
      totalAttacks: 0,
      totalDefenses: 0
    }
  })
}