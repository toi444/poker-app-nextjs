'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
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
    shadowColor: 'shadow-purple-500/25'
  },
  { 
    id: 'slot', 
    icon: '🎰', 
    name: 'スロット',
    subtitle: 'パチスロ',
    gradient: 'from-red-500 to-pink-600',
    shadowColor: 'shadow-red-500/25'
  },
  { 
    id: 'pachinko', 
    icon: '🎲', 
    name: 'パチンコ',
    subtitle: '1円〜4円パチンコ',
    gradient: 'from-pink-400 to-rose-500',
    shadowColor: 'shadow-pink-500/25'
  },
  { 
    id: 'casino', 
    icon: '💎', 
    name: 'カジノ',
    subtitle: 'バカラ・BJ・ルーレット',
    gradient: 'from-yellow-500 to-amber-600',
    shadowColor: 'shadow-yellow-500/25'
  },
  { 
    id: 'horse_race', 
    icon: '🏇', 
    name: '競馬',
    subtitle: '中央・地方競馬',
    gradient: 'from-green-500 to-emerald-600',
    shadowColor: 'shadow-green-500/25'
  },
  { 
    id: 'boat_race', 
    icon: '🚤', 
    name: '競艇',
    subtitle: 'ボートレース',
    gradient: 'from-blue-500 to-cyan-600',
    shadowColor: 'shadow-blue-500/25'
  },
  { 
    id: 'bicycle_race', 
    icon: '🚴', 
    name: '競輪',
    subtitle: 'KEIRINグランプリ',
    gradient: 'from-orange-500 to-yellow-600',
    shadowColor: 'shadow-orange-500/25'
  },
  { 
    id: 'other', 
    icon: '💰', 
    name: 'その他',
    subtitle: 'ルーレット・麻雀等',
    gradient: 'from-gray-500 to-slate-600',
    shadowColor: 'shadow-gray-500/25'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-8">
      {/* ヘッダー */}
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <div className="text-center flex-1 mx-4">
              <h1 className="text-xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : '種目選択'}
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">
                {selectedCategory ? '記録を追加' : 'プレイした種目を選択'}
              </p>
            </div>

            <div className="w-10" />
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6">
        {!selectedCategory ? (
          // 種目選択画面
          <>
            <div className="mb-6 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl p-5 shadow-xl text-white">
              <p className="text-sm font-semibold mb-1">📝 記録を追加</p>
              <p className="text-xs opacity-90">
                プレイした種目を選択してください。詳細な記録で収支分析が可能になります。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className="group relative"
                >
                  {/* グロー効果 */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} rounded-2xl blur-lg opacity-0 group-hover:opacity-30 transition-opacity`} />
                  
                  {/* カード本体 */}
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 active:scale-95 border border-white/50">
                    {/* アイコン */}
                    <div className={`bg-gradient-to-br ${category.gradient} w-16 h-16 rounded-2xl flex items-center justify-center mb-3 mx-auto ${category.shadowColor} shadow-lg transform group-hover:rotate-6 transition-transform`}>
                      <span className="text-3xl">{category.icon}</span>
                    </div>
                    
                    {/* テキスト */}
                    <h3 className="font-black text-gray-900 text-base mb-1">
                      {category.name}
                    </h3>
                    <p className="text-xs text-gray-600">
                      {category.subtitle}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 bg-blue-50 rounded-2xl p-4 border border-blue-100">
              <p className="text-xs text-gray-700 leading-relaxed">
                💡 <span className="font-bold">ヒント:</span> 各種目で開始時刻と終了時刻を記録すると、プレイ時間が自動計算されます。詳細な記録で収支パターンを分析できます。
              </p>
            </div>
          </>
        ) : (
          // フォーム表示
          <div>
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
    </div>
  )
}