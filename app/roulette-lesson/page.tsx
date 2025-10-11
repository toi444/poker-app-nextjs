'use client'

import { useState } from 'react'
import { ArrowLeft, BookOpen, Info, Sparkles, Trophy, Target, TrendingUp, Zap, CheckCircle2, AlertCircle, DollarSign, CircleDot, ChevronDown, ChevronUp, Flame, Shield, Rocket, Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function RouletteLesson() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'basic' | 'rules' | 'bets' | 'strategy' | 'payouts' | 'systems'>('basic')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-black pb-20">
      {/* ヘッダー */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-red-500/30">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-white hover:text-red-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-black">戻る</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 blur-lg animate-pulse" />
              <CircleDot className="relative w-6 h-6 text-red-400" />
            </div>
            <h1 className="text-xl font-black text-white">ルーレット</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* タブナビゲーション */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-1 border-2 border-red-500/30">
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'basic', label: '基本', icon: Info },
                { id: 'rules', label: 'ルール', icon: BookOpen },
                { id: 'bets', label: 'ベット', icon: DollarSign }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/50'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-1 mt-1">
              {[
                { id: 'strategy', label: '攻略', icon: Target },
                { id: 'payouts', label: '配当表', icon: Trophy },
                { id: 'systems', label: '投資法', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg shadow-red-500/50'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 基本情報タブ */}
        {activeTab === 'basic' && (
          <div className="space-y-4 animate-slide-in">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-black text-white">ルーレットとは</h2>
                </div>
                <div className="space-y-3 text-gray-300">
                  <p className="leading-relaxed">
                    ルーレットは、<span className="text-white font-black">回転するホイール</span>に投げ込まれた玉がどこに落ちるかを予想するカジノゲームです。「カジノの女王」と呼ばれ、世界中で最も人気のあるゲームの一つです。
                  </p>
                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                    <p className="font-black text-red-400 mb-2">特徴</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>0〜36（または00含む）の数字を予想</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>赤黒、奇数偶数、ハイローなど多様なベット</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>1ゲーム約1分のスピーディーな展開</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>最大36倍の配当</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>華やかで優雅な雰囲気</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* ルーレットの種類 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-black text-white">ルーレットの種類</h2>
                </div>
                <div className="space-y-3">
                  {/* ヨーロピアン */}
                  <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-black text-green-400 text-lg">🇪🇺 ヨーロピアンルーレット</p>
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full font-black">おすすめ</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      <span className="text-white font-black">0のみ</span>の37個の数字。最も標準的でプレイヤーに有利なルーレットです。
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/40 rounded-lg p-2 border border-green-500/20">
                        <p className="text-xs text-gray-400 mb-1">還元率</p>
                        <p className="text-2xl font-black text-green-400">97.3%</p>
                      </div>
                      <div className="bg-black/40 rounded-lg p-2 border border-green-500/20">
                        <p className="text-xs text-gray-400 mb-1">ハウスエッジ</p>
                        <p className="text-2xl font-black text-green-400">2.7%</p>
                      </div>
                    </div>
                  </div>

                  {/* アメリカン */}
                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-black text-red-400 text-lg">🇺🇸 アメリカンルーレット</p>
                      <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full font-black">非推奨</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      <span className="text-white font-black">0と00</span>の38個の数字。カジノ側が有利な設定です。
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/40 rounded-lg p-2 border border-red-500/20">
                        <p className="text-xs text-gray-400 mb-1">還元率</p>
                        <p className="text-2xl font-black text-red-400">94.74%</p>
                      </div>
                      <div className="bg-black/40 rounded-lg p-2 border border-red-500/20">
                        <p className="text-xs text-gray-400 mb-1">ハウスエッジ</p>
                        <p className="text-2xl font-black text-red-400">5.26%</p>
                      </div>
                    </div>
                    <div className="bg-red-900/40 rounded-lg p-2 border border-red-500/30 mt-2">
                      <p className="text-xs text-red-300 font-black">⚠️ ヨーロピアンより2.5%も不利！避けるべき</p>
                    </div>
                  </div>

                  {/* フレンチ */}
                  <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-black text-purple-400 text-lg">🇫🇷 フレンチルーレット</p>
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full font-black">最高</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      ヨーロピアンと同じ37個の数字だが、<span className="text-white font-black">特別ルール</span>により更に有利！
                    </p>
                    <div className="bg-black/40 rounded-lg p-3 border border-purple-500/20 mb-2">
                      <p className="text-xs font-black text-purple-400 mb-2">ラ・パルタージュルール</p>
                      <p className="text-xs text-gray-300">0が出た時、赤黒や奇数偶数等のイーブンベットは<span className="text-white font-black">半額返金</span>される！</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/40 rounded-lg p-2 border border-purple-500/20">
                        <p className="text-xs text-gray-400 mb-1">還元率</p>
                        <p className="text-2xl font-black text-purple-400">98.65%</p>
                      </div>
                      <div className="bg-black/40 rounded-lg p-2 border border-purple-500/20">
                        <p className="text-xs text-gray-400 mb-1">ハウスエッジ</p>
                        <p className="text-2xl font-black text-purple-400">1.35%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 人気の理由 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-orange-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Flame className="w-6 h-6 text-orange-400" />
                  <h2 className="text-xl font-black text-white">人気の理由</h2>
                </div>
                <div className="space-y-2">
                  {[
                    {
                      title: 'シンプルで分かりやすい',
                      desc: '赤か黒かを選ぶだけでも楽しめる。複雑な戦略は不要。',
                      icon: CheckCircle2,
                      color: 'green'
                    },
                    {
                      title: '華やかな雰囲気',
                      desc: '回転するホイールと玉の動きが優雅で美しい。',
                      icon: Sparkles,
                      color: 'yellow'
                    },
                    {
                      title: '多様なベット方法',
                      desc: '安全な2倍配当から、ハイリスク36倍配当まで自由に選べる。',
                      icon: Target,
                      color: 'blue'
                    },
                    {
                      title: '社交的な楽しさ',
                      desc: '複数人で同時プレイ。周りの人と盛り上がれる。',
                      icon: Trophy,
                      color: 'purple'
                    },
                    {
                      title: '映画やドラマで有名',
                      desc: '007などで有名。カジノの象徴的存在。',
                      icon: Crown,
                      color: 'pink'
                    }
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.title} className={`bg-${item.color}-900/30 rounded-xl p-4 border border-${item.color}-500/30`}>
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 text-${item.color}-400 flex-shrink-0 mt-0.5`} />
                          <div>
                            <p className={`font-black text-${item.color}-400 mb-1`}>{item.title}</p>
                            <p className="text-sm text-gray-300 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ルールタブ */}
        {activeTab === 'rules' && (
          <div className="space-y-4 animate-slide-in">
            {/* ゲームの流れ */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-cyan-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-xl font-black text-white">ゲームの流れ</h2>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      step: 1,
                      title: 'ベットタイム開始',
                      desc: 'ディーラーが「Place your bets（賭けをどうぞ）」と言います',
                      color: 'pink'
                    },
                    {
                      step: 2,
                      title: 'チップを置く',
                      desc: 'テーブル上の好きな場所にチップを置きます（複数箇所OK）',
                      color: 'purple'
                    },
                    {
                      step: 3,
                      title: 'ホイールを回す',
                      desc: 'ディーラーがホイールを回し、玉を投げ込みます',
                      color: 'blue'
                    },
                    {
                      step: 4,
                      title: 'ベット締め切り',
                      desc: 'ディーラーが「No more bets（締め切り）」と言ったら終了',
                      color: 'green'
                    },
                    {
                      step: 5,
                      title: '結果発表',
                      desc: '玉が落ちた数字が発表され、的中したベットに配当が支払われます',
                      color: 'yellow'
                    }
                  ].map((item) => (
                    <div key={item.step} className={`bg-${item.color}-900/30 rounded-xl p-4 border border-${item.color}-500/30`}>
                      <div className="flex items-start gap-3">
                        <div className={`bg-${item.color}-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0`}>
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <p className={`font-black text-${item.color}-400 mb-1`}>{item.title}</p>
                          <p className="text-sm text-gray-300 leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* テーブルレイアウト */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-orange-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <CircleDot className="w-6 h-6 text-orange-400" />
                  <h2 className="text-xl font-black text-white">テーブルレイアウト</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-orange-900/30 rounded-xl p-4 border border-orange-500/30">
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      ルーレットテーブルは、<span className="text-white font-black">インサイドベット</span>と<span className="text-white font-black">アウトサイドベット</span>の2つのエリアに分かれています。
                    </p>
                    <div className="space-y-2">
                      <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                        <p className="text-xs font-black text-red-400 mb-2">インサイドベット</p>
                        <p className="text-xs text-gray-300">0〜36の数字が書かれたエリア。高配当だが当たりにくい。</p>
                      </div>
                      <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                        <p className="text-xs font-black text-blue-400 mb-2">アウトサイドベット</p>
                        <p className="text-xs text-gray-300">赤黒、奇数偶数、ダズンなどのエリア。低配当だが当たりやすい。</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 基本的なマナー */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-black text-white">基本的なマナー</h2>
                </div>
                <div className="space-y-2">
                  {[
                    'ベット締め切り後はチップに触らない',
                    '玉が回転中は静かに見守る',
                    '他人のチップを動かさない',
                    '配当を受け取ったらすぐに回収する',
                    'ディーラーの指示に従う',
                    '手をテーブルの上に置かない'
                  ].map((manner, index) => (
                    <div key={index} className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{manner}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ベット種類タブ */}
        {activeTab === 'bets' && (
          <div className="space-y-4 animate-slide-in">
            {/* アウトサイドベット */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-black text-white">アウトサイドベット</h2>
                  <span className="ml-auto text-xs bg-green-600 text-white px-2 py-1 rounded-full font-black">初心者向け</span>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-300">
                    当たりやすい代わりに配当が低い。初心者におすすめ。
                  </p>

                  {/* 赤黒 */}
                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-black text-red-400">赤・黒（Red/Black）</p>
                      <span className="text-lg font-black text-white font-mono">2倍</span>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">赤18個または黒18個のいずれかに賭ける</p>
                    <div className="bg-black/40 rounded-lg p-2 border border-red-500/20">
                      <p className="text-xs text-gray-400">的中率: 約48.6%（ヨーロピアン）</p>
                    </div>
                  </div>

                  {/* 奇数偶数 */}
                  <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-black text-purple-400">奇数・偶数（Odd/Even）</p>
                      <span className="text-lg font-black text-white font-mono">2倍</span>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">奇数18個または偶数18個のいずれかに賭ける</p>
                    <div className="bg-black/40 rounded-lg p-2 border border-purple-500/20">
                      <p className="text-xs text-gray-400">的中率: 約48.6%（ヨーロピアン）</p>
                    </div>
                  </div>

                  {/* ハイロー */}
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-black text-blue-400">ハイ・ロー（1-18/19-36）</p>
                      <span className="text-lg font-black text-white font-mono">2倍</span>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">1〜18（ロー）または19〜36（ハイ）に賭ける</p>
                    <div className="bg-black/40 rounded-lg p-2 border border-blue-500/20">
                      <p className="text-xs text-gray-400">的中率: 約48.6%（ヨーロピアン）</p>
                    </div>
                  </div>

                  {/* ダズン */}
                  <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-black text-yellow-400">ダズン（Dozen）</p>
                      <span className="text-lg font-black text-white font-mono">3倍</span>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">1〜12、13〜24、25〜36の3つのグループから選ぶ</p>
                    <div className="bg-black/40 rounded-lg p-2 border border-yellow-500/20">
                      <p className="text-xs text-gray-400">的中率: 約32.4%（ヨーロピアン）</p>
                    </div>
                  </div>

                  {/* カラム */}
                  <div className="bg-orange-900/30 rounded-xl p-4 border border-orange-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-black text-orange-400">カラム（Column）</p>
                      <span className="text-lg font-black text-white font-mono">3倍</span>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">縦3列のいずれかに賭ける（各12個の数字）</p>
                    <div className="bg-black/40 rounded-lg p-2 border border-orange-500/20">
                      <p className="text-xs text-gray-400">的中率: 約32.4%（ヨーロピアン）</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* インサイドベット */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Flame className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-black text-white">インサイドベット</h2>
                  <span className="ml-auto text-xs bg-red-600 text-white px-2 py-1 rounded-full font-black">高配当</span>
                </div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-300">
                    当たりにくい代わりに配当が高い。一攫千金を狙うならこれ！
                  </p>

                  {/* ストレートアップ */}
                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-black text-red-400">ストレートアップ</p>
                      <span className="text-2xl font-black text-white font-mono">36倍</span>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">1つの数字にピンポイントで賭ける</p>
                    <div className="bg-black/40 rounded-lg p-2 border border-red-500/20">
                      <p className="text-xs text-gray-400">的中率: 約2.7%（ヨーロピアン）</p>
                      <p className="text-xs text-red-300 mt-1">最高配当！ロマン型ベット</p>
                    </div>
                  </div>

                  {/* スプリット */}
                  <div className="bg-orange-900/30 rounded-xl p-4 border border-orange-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-black text-orange-400">スプリット</p>
                      <span className="text-xl font-black text-white font-mono">18倍</span>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">隣り合う2つの数字の境界線に賭ける</p>
                    <div className="bg-black/40 rounded-lg p-2 border border-orange-500/20">
                      <p className="text-xs text-gray-400">的中率: 約5.4%</p>
                    </div>
                  </div>

                  {/* ストリート */}
                  <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-black text-yellow-400">ストリート</p>
                      <span className="text-xl font-black text-white font-mono">12倍</span>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">横一列の3つの数字に賭ける</p>
                    <div className="bg-black/40 rounded-lg p-2 border border-yellow-500/20">
                      <p className="text-xs text-gray-400">的中率: 約8.1%</p>
                    </div>
                  </div>

                  {/* コーナー */}
                  <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-black text-green-400">コーナー</p>
                      <span className="text-xl font-black text-white font-mono">9倍</span>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">4つの数字の交点に賭ける</p>
                    <div className="bg-black/40 rounded-lg p-2 border border-green-500/20">
                      <p className="text-xs text-gray-400">的中率: 約10.8%</p>
                    </div>
                  </div>

                  {/* ライン */}
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-black text-blue-400">ライン</p>
                      <span className="text-xl font-black text-white font-mono">6倍</span>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">横2列の6つの数字に賭ける</p>
                    <div className="bg-black/40 rounded-lg p-2 border border-blue-500/20">
                      <p className="text-xs text-gray-400">的中率: 約16.2%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 攻略タブ */}
        {activeTab === 'strategy' && (
          <div className="space-y-4 animate-slide-in">
            {/* 基本戦略 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-black text-white">基本戦略</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
                    <p className="font-black text-green-400 mb-3 text-lg">ルーレットの真実</p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p className="leading-relaxed">
                        ルーレットは<span className="text-white font-black">完全な運ゲーム</span>です。どんな必勝法も長期的にはカジノが勝つように設計されています。
                      </p>
                      <div className="bg-red-900/40 rounded-lg p-3 border border-red-500/30 mt-2">
                        <p className="text-xs font-black text-red-400 mb-2">⚠️ 重要な認識</p>
                        <ul className="space-y-1 text-xs text-gray-300">
                          <li>• 過去の結果は次の結果に影響しない（独立事象）</li>
                          <li>• 赤が10回連続で出ても、次も赤黒は50:50</li>
                          <li>• 「パターン」や「クセ」は存在しない</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                    <p className="font-black text-blue-400 mb-3">それでも勝つために</p>
                    <div className="space-y-2">
                      {[
                        'ヨーロピアン/フレンチを選ぶ（アメリカンは避ける）',
                        '資金管理を徹底する',
                        '勝ち逃げのタイミングを決めておく',
                        '負けを追わない（冷静さを保つ）',
                        'エンターテイメントとして楽しむ'
                      ].map((tip, index) => (
                        <div key={index} className="bg-black/40 rounded-lg p-2 border border-blue-500/20 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-300">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 初心者向け戦略 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-black text-white">初心者向け戦略</h2>
                </div>
                <div className="space-y-2">
                  {[
                    {
                      title: 'アウトサイドベット中心',
                      desc: '赤黒、奇数偶数など2倍配当を中心に。当たりやすく資金が長持ち。',
                      icon: CheckCircle2,
                      color: 'green'
                    },
                    {
                      title: 'ダズン・カラムの併用',
                      desc: '3倍配当のダズンやカラムを組み合わせて、当選確率を上げる。',
                      icon: Sparkles,
                      color: 'blue'
                    },
                    {
                      title: '少額から始める',
                      desc: '最初は最小ベットで感覚を掴む。慣れてから金額を増やす。',
                      icon: DollarSign,
                      color: 'yellow'
                    },
                    {
                      title: '勝ち額の半分は確保',
                      desc: '2倍になったら元金を確保。残りで遊ぶ。',
                      icon: Trophy,
                      color: 'purple'
                    }
                  ].map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.title} className={`bg-${item.color}-900/30 rounded-xl p-4 border border-${item.color}-500/30`}>
                        <div className="flex items-start gap-3">
                          <Icon className={`w-5 h-5 text-${item.color}-400 flex-shrink-0 mt-0.5`} />
                          <div>
                            <p className={`font-black text-${item.color}-400 mb-1`}>{item.title}</p>
                            <p className="text-sm text-gray-300 leading-relaxed">{item.desc}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* 中級者向け戦略 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Rocket className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-black text-white">中級者向け戦略</h2>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => toggleSection('2thirds')}
                    className="w-full bg-purple-900/30 rounded-xl p-4 border border-purple-500/30 flex items-center justify-between"
                  >
                    <p className="font-black text-purple-400">2/3ベット法</p>
                    {expandedSection === '2thirds' ? <ChevronUp className="w-5 h-5 text-purple-400" /> : <ChevronDown className="w-5 h-5 text-purple-400" />}
                  </button>
                  {expandedSection === '2thirds' && (
                    <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20 space-y-3 animate-slide-in">
                      <p className="text-sm text-gray-300 mb-2">
                        ダズンまたはカラムの<span className="text-white font-black">2つ（2/3）</span>に同時ベットする方法。
                      </p>
                      <div className="bg-black/40 rounded-lg p-3 border border-purple-500/20">
                        <p className="text-xs font-black text-purple-400 mb-2">例</p>
                        <div className="space-y-1 text-xs text-gray-300">
                          <p>• 1st Dozen と 2nd Dozen に各$10</p>
                          <p>• 的中率: 約64.8%</p>
                          <p>• 当たれば+$10、外れれば-$20</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => toggleSection('flower')}
                    className="w-full bg-pink-900/30 rounded-xl p-4 border border-pink-500/30 flex items-center justify-between"
                  >
                    <p className="font-black text-pink-400">フラワーベット法</p>
                    {expandedSection === 'flower' ? <ChevronUp className="w-5 h-5 text-pink-400" /> : <ChevronDown className="w-5 h-5 text-pink-400" />}
                  </button>
                  {expandedSection === 'flower' && (
                    <div className="bg-pink-900/20 rounded-xl p-4 border border-pink-500/20 space-y-3 animate-slide-in">
                      <p className="text-sm text-gray-300 mb-2">
                        1つの数字とその周辺8個（計9個）に賭ける華やかな戦法。
                      </p>
                      <div className="bg-black/40 rounded-lg p-3 border border-pink-500/20">
                        <p className="text-xs font-black text-pink-400 mb-2">賭け方（中心を11とした場合）</p>
                        <div className="space-y-1 text-xs text-gray-300">
                          <p>• 11にストレート: $1</p>
                          <p>• 周辺8個にスプリット: 各$1</p>
                          <p>• 合計$9ベット</p>
                          <p className="text-pink-300 mt-2">中心が当たれば$36+$18=$54獲得！</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* やってはいけないこと */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-black text-white">やってはいけないこと</h2>
                </div>
                <div className="space-y-2">
                  {[
                    '「次は絶対○○が来る」と思い込む',
                    '負けを取り戻そうと賭け金を増やす',
                    'アメリカンルーレットでプレイする',
                    '予算を超えてプレイする',
                    '酔った状態でプレイする',
                    '借金してまでプレイする'
                  ].map((item, index) => (
                    <div key={index} className="bg-red-900/30 rounded-lg p-3 border border-red-500/30 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 配当表タブ */}
        {activeTab === 'payouts' && (
          <div className="space-y-4 animate-slide-in">
            {/* 完全配当表 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-yellow-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-black text-white">完全配当表</h2>
                </div>
                <div className="space-y-3">
                  {/* インサイドベット */}
                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                    <p className="font-black text-red-400 mb-3">インサイドベット</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-red-500/20">
                        <div>
                          <span className="text-sm text-gray-300">ストレートアップ</span>
                          <p className="text-xs text-gray-500">1個の数字</p>
                        </div>
                        <span className="text-xl font-black text-white font-mono">36倍</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-red-500/20">
                        <div>
                          <span className="text-sm text-gray-300">スプリット</span>
                          <p className="text-xs text-gray-500">2個の数字</p>
                        </div>
                        <span className="text-xl font-black text-white font-mono">18倍</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-red-500/20">
                        <div>
                          <span className="text-sm text-gray-300">ストリート</span>
                          <p className="text-xs text-gray-500">3個の数字</p>
                        </div>
                        <span className="text-xl font-black text-white font-mono">12倍</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-red-500/20">
                        <div>
                          <span className="text-sm text-gray-300">コーナー</span>
                          <p className="text-xs text-gray-500">4個の数字</p>
                        </div>
                        <span className="text-xl font-black text-white font-mono">9倍</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-red-500/20">
                        <div>
                          <span className="text-sm text-gray-300">ライン</span>
                          <p className="text-xs text-gray-500">6個の数字</p>
                        </div>
                        <span className="text-xl font-black text-white font-mono">6倍</span>
                      </div>
                    </div>
                  </div>

                  {/* アウトサイドベット */}
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                    <p className="font-black text-blue-400 mb-3">アウトサイドベット</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-blue-500/20">
                        <div>
                          <span className="text-sm text-gray-300">赤・黒</span>
                          <p className="text-xs text-gray-500">18個の数字</p>
                        </div>
                        <span className="text-xl font-black text-white font-mono">2倍</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-blue-500/20">
                        <div>
                          <span className="text-sm text-gray-300">奇数・偶数</span>
                          <p className="text-xs text-gray-500">18個の数字</p>
                        </div>
                        <span className="text-xl font-black text-white font-mono">2倍</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-blue-500/20">
                        <div>
                          <span className="text-sm text-gray-300">ハイ・ロー</span>
                          <p className="text-xs text-gray-500">1-18 / 19-36</p>
                        </div>
                        <span className="text-xl font-black text-white font-mono">2倍</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-blue-500/20">
                        <div>
                          <span className="text-sm text-gray-300">ダズン</span>
                          <p className="text-xs text-gray-500">12個の数字</p>
                        </div>
                        <span className="text-xl font-black text-white font-mono">3倍</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-blue-500/20">
                        <div>
                          <span className="text-sm text-gray-300">カラム</span>
                          <p className="text-xs text-gray-500">12個の数字</p>
                        </div>
                        <span className="text-xl font-black text-white font-mono">3倍</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30">
                    <p className="text-xs text-gray-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      配当は賭け金に対する倍率です。例: $10ベットで2倍なら$20獲得（元金含め$30）
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 投資法タブ */}
        {activeTab === 'systems' && (
          <div className="space-y-4 animate-slide-in">
            {/* マーチンゲール法 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-black text-white">マーチンゲール法</h2>
                  <span className="ml-auto text-xs bg-red-600 text-white px-2 py-1 rounded-full font-black">ハイリスク</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      赤黒などの2倍配当で使用。負けたら次のベット額を2倍にする。理論上は<span className="text-white font-black">必ず勝てる</span>が...
                    </p>
                    <div className="bg-black/40 rounded-lg p-3 border border-red-500/20 mb-3">
                      <p className="text-xs font-black text-red-400 mb-2">ベット例</p>
                      <div className="space-y-1 text-xs text-gray-300">
                        <p>1回目: $10 → 負け（-$10）</p>
                        <p>2回目: $20 → 負け（-$30）</p>
                        <p>3回目: $40 → 負け（-$70）</p>
                        <p>4回目: $80 → 負け（-$150）</p>
                        <p>5回目: $160 → 負け（-$310）</p>
                        <p className="text-green-400 font-black">6回目: $320 → 勝ち（+$10）</p>
                      </div>
                    </div>
                    <div className="bg-red-900/40 rounded-lg p-3 border border-red-500/30">
                      <p className="text-xs font-black text-red-400 mb-1">⚠️ 致命的な欠点</p>
                      <p className="text-xs text-gray-300">連敗すると賭け金が爆発的に増加。テーブルリミットや資金不足で破綻する。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ダランベール法 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-black text-white">ダランベール法</h2>
                  <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-black">堅実</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      負けたら<span className="text-white font-black">+1単位</span>、勝ったら<span className="text-white font-black">-1単位</span>。マーチンゲールより安全。
                    </p>
                    <div className="bg-black/40 rounded-lg p-3 border border-blue-500/20 mb-3">
                      <p className="text-xs font-black text-blue-400 mb-2">ベット例（1単位=$10）</p>
                      <div className="space-y-1 text-xs text-gray-300">
                        <p>1回目: $10 → 負け（次は+1単位）</p>
                        <p>2回目: $20 → 負け（次は+1単位）</p>
                        <p>3回目: $30 → 勝ち（次は-1単位）</p>
                        <p>4回目: $20 → 勝ち（次は-1単位）</p>
                        <p>5回目: $10 → 勝ち（最初に戻る）</p>
                      </div>
                    </div>
                    <p className="text-xs text-blue-300">緩やかに資金が増減。初心者におすすめ。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ココモ法 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Rocket className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-black text-white">ココモ法</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      <span className="text-white font-black">3倍配当</span>（ダズン・カラム）専用。負けたら前回と前々回の合計額をベット。
                    </p>
                    <div className="bg-black/40 rounded-lg p-3 border border-purple-500/20 mb-3">
                      <p className="text-xs font-black text-purple-400 mb-2">ベット例</p>
                      <div className="space-y-1 text-xs text-gray-300">
                        <p>1回目: $10 → 負け</p>
                        <p>2回目: $10 → 負け（前回+前々回=$10+$10）</p>
                        <p>3回目: $20 → 負け（$10+$10=$20）</p>
                        <p>4回目: $30 → 負け（$20+$10=$30）</p>
                        <p className="text-green-400 font-black">5回目: $50 → 勝ち（利益確定）</p>
                      </div>
                    </div>
                    <p className="text-xs text-purple-300">1回勝てば全損失を回収できる。マーチンゲールより賭け金の増加が緩やか。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 666戦略 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Flame className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-black text-white">666戦略</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      テーブルの<span className="text-white font-black">33個の数字</span>をカバーする大胆な戦略！
                    </p>
                    <div className="bg-black/40 rounded-lg p-3 border border-red-500/20 mb-3">
                      <p className="text-xs font-black text-red-400 mb-2">賭け方（合計$66）</p>
                      <div className="space-y-1 text-xs text-gray-300">
                        <p>• 赤に$36</p>
                        <p>• 黒の6つの数字にスプリット: 各$4（計$24）</p>
                        <p>• 0にストレート: $2</p>
                        <p>• 残り4つの黒にストレート: 各$2（計$8）</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-900/40 rounded-lg p-2 border border-green-500/30">
                        <p className="text-xs text-green-400 font-black mb-1">的中率</p>
                        <p className="text-lg font-black text-white">約89%</p>
                      </div>
                      <div className="bg-red-900/40 rounded-lg p-2 border border-red-500/30">
                        <p className="text-xs text-red-400 font-black mb-1">外れ時</p>
                        <p className="text-lg font-black text-white">-$66</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* モンテカルロ法 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-black text-white">モンテカルロ法</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      数列を使った複雑だが効果的な方法。<span className="text-white font-black">3倍配当</span>で威力を発揮。
                    </p>
                    <div className="bg-black/40 rounded-lg p-3 border border-green-500/20 mb-3">
                      <p className="text-xs font-black text-green-400 mb-2">手順</p>
                      <div className="space-y-1 text-xs text-gray-300">
                        <p>1. 数列「1・2・3」からスタート</p>
                        <p>2. 両端の合計額をベット（1+3=$4）</p>
                        <p>3. 負けたら右端に賭け金を追加</p>
                        <p>4. 勝ったら両端の数字を削除</p>
                        <p>5. 数列が全て消えたら終了</p>
                      </div>
                    </div>
                    <p className="text-xs text-green-300">資金の増減が緩やか。カジノに気づかれにくい。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 投資法比較 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-cyan-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-xl font-black text-white">投資法比較</h2>
                </div>
                <div className="space-y-2">
                  <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                    <p className="text-sm font-black text-green-400 mb-2">初心者におすすめ</p>
                    <p className="text-xs text-gray-300">ダランベール法、フラットベット（固定額）</p>
                  </div>
                  <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                    <p className="text-sm font-black text-blue-400 mb-2">少ない資金で楽しみたい</p>
                    <p className="text-xs text-gray-300">ダランベール法、モンテカルロ法</p>
                  </div>
                  <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
                    <p className="text-sm font-black text-purple-400 mb-2">ダズン・カラム派</p>
                    <p className="text-xs text-gray-300">ココモ法、モンテカルロ法</p>
                  </div>
                  <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                    <p className="text-sm font-black text-red-400 mb-2">おすすめしない</p>
                    <p className="text-xs text-gray-300">マーチンゲール法（資金が底をつくリスク大）</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
      `}</style>
    </div>
  )
}