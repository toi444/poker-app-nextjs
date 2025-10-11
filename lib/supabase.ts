import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// Next.js App Router用のクライアント（推奨）
// クライアントコンポーネントで使用
export const supabase = createClientComponentClient()

// 環境変数の確認
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '設定済み' : '未設定')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '設定済み' : '未設定')
}

// 従来のクライアント（互換性のため残す）
export const supabaseClient = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
)