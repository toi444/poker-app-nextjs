export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center mb-2">
          🃏 We Are Pretty Cure! 🃏
        </h1>
        <p className="text-center text-gray-400 mb-8">
          Poker Management System
        </p>
        <div className="max-w-md mx-auto space-y-4">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold">
            ログイン
          </button>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold">
            新規登録
          </button>
        </div>
      </div>
    </main>
  )
}