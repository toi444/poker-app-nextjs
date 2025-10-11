import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // セッションを更新（これにより認証状態が維持される）
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // 保護されたルートの定義
  const protectedRoutes = [
    '/dashboard',
    '/community',
    '/stats',
    '/profile',
    '/game-report',
    '/game-report-batch',
    '/all-gamble',
    '/all-gamble-community',
    '/pbank',
    '/admin'
  ]

  // 現在のパスが保護されたルートかチェック
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )

  // 認証が必要なページで未ログインの場合、ログインページへリダイレクト
  if (isProtectedRoute && !session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // ログイン済みでログインページにアクセスした場合、ダッシュボードへリダイレクト
  if (req.nextUrl.pathname === '/login' && session) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}