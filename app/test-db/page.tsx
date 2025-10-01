'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

export default function TestDB() {
  const [status, setStatus] = useState('接続テスト中...')

  useEffect(() => {
    async function test() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        const { error } = await supabase
          .from('profiles')
          .select('*')
          .limit(1)
        
        if (error) {
          setStatus(`エラー: ${error.message}`)
        } else {
          setStatus('✅ データベース接続成功！')
        }
      } catch (err: any) {
        setStatus(`エラー: ${err.message}`)
      }
    }
    
    test()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">データベース接続テスト</h1>
      <p className="text-lg mb-4">{status}</p>
      
      <a href="/" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
        トップページに戻る
      </a>
    </div>
  )
}