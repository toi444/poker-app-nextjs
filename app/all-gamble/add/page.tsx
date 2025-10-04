'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles } from 'lucide-react'
import dynamic from 'next/dynamic'

// フォームコンポーネントを動的インポート
const PokerForm = dynamic(() => import('@/components/gamble-forms/PokerForm'))
const SlotForm = dynamic(() => import('@/components/gamble-forms/SlotForm'))
const PachinkoForm = dynamic(() => import('@/components/gamble-forms/PachinkoForm'))
const CasinoForm = dynamic(() => import('@/components/gamble-forms/CasinoForm'))
const RaceForm = dynamic(() => import('@/components/gamble-forms/RaceForm'))
const OtherForm = dynamic(() => import('@/components/gamble-forms/OtherForm'))

type Category = 'poker' | 'slot' | 'pachinko' | 'casino' | 'horse_race' | 'boat_race' | 'bicycle_race' | 'other' | null

const categories = [
  { 
    id: 'poker', 
    icon: '🃏', 
    name: 'ポーカー',
    subtitle: 'キャッシュ・トーナメント',
    gradient: 'from-purple-500 to-indigo-600',
    glowColor: 'purple'
  },
  { 
    id: 'slot', 
    icon: '🎰', 
    name: 'スロット',
    subtitle: 'パチスロ',
    gradient: 'from-red-500 to-pink-600',
    glowColor: 'red'
  },
  { 
    id: 'pachinko', 
    icon: '🎲', 
    name: 'パチンコ',
    subtitle: '1円〜4円パチンコ',
    gradient: 'from-pink-400 to-rose-500',
    glowColor: 'pink'
  },
  { 
    id: 'casino', 
    icon: '💎', 
    name: 'カジノ',
    subtitle: 'バカラ・BJ・ルーレット',
    gradient: 'from-yellow-500 to-amber-600',
    glowColor: 'yellow'
  },
  { 
    id: 'horse_race', 
    icon: '🏇', 
    name: '競馬',
    subtitle: '中央・地方競馬',
    gradient: 'from-green-500 to-emerald-600',
    glowColor: 'green'
  },
  { 
    id: 'boat_race', 
    icon: '🚤', 
    name: '競艇',
    subtitle: 'ボートレース',
    gradient: 'from-blue-500 to-cyan-600',
    glowColor: 'blue'
  },
  { 
    id: 'bicycle_race', 
    icon: '🚴', 
    name: '競輪',
    subtitle: 'KEIRINグランプリ',
    gradient: 'from-orange-500 to-yellow-600',
    glowColor: 'orange'
  },
  { 
    id: 'other', 
    icon: '💰', 
    name: 'その他',
    subtitle: '麻雀・宝くじ等',
    gradient: 'from-gray-400 to-slate-500',
    glowColor: 'gray'
  }
]

export default function AddGambleRecordPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<Category>(null)

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId as Category)
  }

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null)
    } else {
      router.push('/all-gamble')
    }
  }

  const handleSuccess = () => {
    router.push('/all-gamble')
  }

  const selectedCategoryData = selectedCategory ? categories.find(c => c.id === selectedCategory) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900">
      {/* ヘッダー */}
      <div className="bg-black/50 backdrop-blur-xl border-b border-purple-500/30 sticky top-0 z-50 shadow-lg shadow-purple-500/20">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="group relative"
            >
              <div className="absolute inset-0 bg-purple-600 blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
              <div className="relative w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20 hover:border-purple-400 transition-all group-hover:scale-105 active:scale-95">
                <ArrowLeft className="w-6 h-6 text-white" />
              </div>
            </button>
            
            <div className="text-center flex-1 mx-4">
              <h1 className="text-2xl font-black bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
                {selectedCategory ? selectedCategoryData?.name : '種目選択'}
              </h1>
              <p className="text-sm text-purple-300 mt-0.5 font-semibold">
                {selectedCategory ? '記録を追加' : 'プレイした種目を選択'}
              </p>
            </div>

            <div className="w-12" />
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6 pb-8">
        {!selectedCategory ? (
          // 種目選択画面
          <div className="animate-slide-in">
            {/* 説明カード */}
            <div className="mb-6 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-75 animate-pulse" />
              <div className="relative bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-1 shadow-2xl">
                <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-5 border-2 border-white/20">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5 drop-shadow-glow" />
                    <div>
                      <p className="text-base font-black text-white mb-2" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                        📝 記録を追加
                      </p>
                      <p className="text-sm text-white/90 leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>
                        プレイした種目を選択してください。詳細な記録で収支分析が可能になります。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 種目グリッド */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="group relative aspect-[4/5]"
                >
                  {/* グロー効果 */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} rounded-3xl blur-xl opacity-0 group-hover:opacity-75 transition-all duration-300`} />
                  
                  {/* カード本体 */}
                  <div className="relative h-full">
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} rounded-3xl blur-md opacity-50`} />
                    <div className="relative h-full bg-black/60 backdrop-blur-sm rounded-3xl p-5 border-2 border-white/20 hover:border-white/40 transition-all transform hover:scale-105 active:scale-95 shadow-2xl flex flex-col items-center justify-center">
                      {/* アイコン */}
                      <div className={`bg-gradient-to-br ${category.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-2xl shadow-${category.glowColor}-500/50 transform group-hover:rotate-6 group-hover:scale-110 transition-all`}>
                        <span className="text-3xl drop-shadow-glow">{category.icon}</span>
                      </div>
                      
                      {/* テキスト */}
                      <h3 className="font-black text-white text-base mb-1 drop-shadow-glow text-center" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 900 }}>
                        {category.name}
                      </h3>
                      <p className="text-xs text-white/70 text-center leading-tight" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>
                        {category.subtitle}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* ヒント */}
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/50">
                <p className="text-sm text-blue-100 leading-relaxed" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', fontWeight: 600 }}>
                  💡 <span className="font-black text-white">ヒント:</span> 各種目で開始時刻と終了時刻を記録すると、プレイ時間が自動計算されます。詳細な記録で収支パターンを分析できます。
                </p>
              </div>
            </div>
          </div>
        ) : (
          // フォーム表示
          <div className="animate-slide-in">
            {selectedCategory === 'poker' && <PokerForm onSuccess={handleSuccess} onCancel={() => setSelectedCategory(null)} />}
            {selectedCategory === 'slot' && <SlotForm onSuccess={handleSuccess} onCancel={() => setSelectedCategory(null)} />}
            {selectedCategory === 'pachinko' && <PachinkoForm onSuccess={handleSuccess} onCancel={() => setSelectedCategory(null)} />}
            {selectedCategory === 'casino' && <CasinoForm onSuccess={handleSuccess} onCancel={() => setSelectedCategory(null)} />}
            {(selectedCategory === 'horse_race' || selectedCategory === 'boat_race' || selectedCategory === 'bicycle_race') && (
              <RaceForm 
                raceType={selectedCategory.replace('_race', '') as 'horse' | 'boat' | 'bicycle'} 
                onSuccess={handleSuccess} 
                onCancel={() => setSelectedCategory(null)} 
              />
            )}
            {selectedCategory === 'other' && <OtherForm onSuccess={handleSuccess} onCancel={() => setSelectedCategory(null)} />}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }

        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  )
}