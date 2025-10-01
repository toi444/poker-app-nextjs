'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  
  useEffect(() => {
    // ログインページへ自動リダイレクト
    router.push('/login')
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-4">読み込み中...</h1>
      </div>
    </div>
  )
}