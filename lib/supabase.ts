import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'

// Next.js App Router用のクライアント（推奨）
export const supabase = createClientComponentClient()

// 従来のクライアント（互換性のため残す）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey)