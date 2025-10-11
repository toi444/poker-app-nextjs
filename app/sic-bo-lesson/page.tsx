'use client'

import { useState } from 'react'
import { ArrowLeft, BookOpen, Info, Sparkles, Trophy, Target, TrendingUp, Zap, CheckCircle2, AlertCircle, DollarSign, Dices, ChevronDown, ChevronUp, Flame, Shield, Rocket } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function SicBoLesson() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'basic' | 'rules' | 'bets' | 'strategy' | 'payouts' | 'systems'>('basic')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 pb-20">
      {/* ヘッダー */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-green-500/30">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-white hover:text-green-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-black">戻る</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-green-600 blur-lg animate-pulse" />
              <Dices className="relative w-6 h-6 text-green-400" />
            </div>
            <h1 className="text-xl font-black text-white">シックボー（大小）</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* タブナビゲーション */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-1 border-2 border-green-500/30">
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
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/50'
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
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/50'
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
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-black text-white">シックボーとは</h2>
                </div>
                <div className="space-y-3 text-gray-300">
                  <p className="leading-relaxed">
                    シックボー（大小、タイサイ）は、<span className="text-white font-black">3つのサイコロ</span>を使った中国発祥のカジノゲームです。ディーラーが振ったサイコロの出目を予想するシンプルなゲームで、アジアを中心に世界中で人気があります。
                  </p>
                  <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
                    <p className="font-black text-green-400 mb-2">特徴</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>3つのサイコロの出目を予想</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>ルールが非常にシンプル</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>1ゲーム約30秒のスピーディーな展開</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>最大180倍の高配当あり</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>視覚的にわかりやすい</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* ゲームの目的 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-black text-white">ゲームの目的</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                    <p className="text-gray-300 mb-3 leading-relaxed">
                      3つのサイコロの<span className="text-white font-black">出目の組み合わせや合計値</span>を予想してベットします。的中すれば、ベット方法に応じた配当を獲得できます。
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                        <p className="text-xs font-black text-green-400 mb-1">最小ベット</p>
                        <p className="text-xs text-gray-300">$1〜$5程度</p>
                      </div>
                      <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
                        <p className="text-xs font-black text-purple-400 mb-1">最大配当</p>
                        <p className="text-xs text-gray-300">180倍</p>
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
                      title: '圧倒的なシンプルさ',
                      desc: 'サイコロの出目を予想するだけ。複雑な戦略や計算は不要です。',
                      icon: CheckCircle2,
                      color: 'green'
                    },
                    {
                      title: 'スピーディーな展開',
                      desc: '1ゲーム約30秒。短時間で何度も楽しめます。',
                      icon: Zap,
                      color: 'yellow'
                    },
                    {
                      title: '視覚的なわかりやすさ',
                      desc: 'サイコロの目を見るだけで勝敗が一目瞭然。',
                      icon: Sparkles,
                      color: 'blue'
                    },
                    {
                      title: '多様なベット方法',
                      desc: '安全な2倍配当から、ハイリスク180倍配当まで選べます。',
                      icon: DollarSign,
                      color: 'purple'
                    },
                    {
                      title: '少額から楽しめる',
                      desc: '$1から参加可能。初心者でも気軽に始められます。',
                      icon: Trophy,
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

            {/* 名前の由来 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-black text-white">名前の由来</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                    <div className="space-y-3 text-sm text-gray-300">
                      <div className="flex items-start gap-2">
                        <span className="text-purple-400 font-black">🎲</span>
                        <div>
                          <p className="font-black text-white mb-1">シックボー（Sic Bo）</p>
                          <p>中国語で「骰寶」。「貴重なサイコロ」という意味です。</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-pink-400 font-black">📊</span>
                        <div>
                          <p className="font-black text-white mb-1">大小（タイサイ/Big Small）</p>
                          <p>出目の合計が大きいか小さいかを当てることから。</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-400 font-black">🎰</span>
                        <div>
                          <p className="font-black text-white mb-1">その他の呼び名</p>
                          <p>タイサイ、ハイロー、ダイスー、ダイ・シウなど地域によって様々。</p>
                        </div>
                      </div>
                    </div>
                  </div>
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
                      desc: 'ディーラーが「Place your bets（ベットをどうぞ）」と言います',
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
                      title: 'ベット締め切り',
                      desc: 'ディーラーが「No more bets（締め切り）」と言ったら終了',
                      color: 'blue'
                    },
                    {
                      step: 4,
                      title: 'サイコロを振る',
                      desc: 'ディーラーが透明なケース内で3つのサイコロを振ります',
                      color: 'green'
                    },
                    {
                      step: 5,
                      title: '結果発表',
                      desc: 'サイコロの出目が表示され、的中したベットに配当が支払われます',
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
                  <Dices className="w-6 h-6 text-orange-400" />
                  <h2 className="text-xl font-black text-white">テーブルレイアウト</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-orange-900/30 rounded-xl p-4 border border-orange-500/30">
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      シックボーのテーブルは、様々なベットエリアが配置されています。それぞれのエリアに配当倍率が記載されています。
                    </p>
                    <div className="space-y-2">
                      <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                        <p className="text-xs font-black text-green-400 mb-2">主要エリア</p>
                        <div className="space-y-1 text-xs text-gray-300">
                          <p>• 大小（Big/Small）- 上下に大きく表示</p>
                          <p>• 奇数偶数（Odd/Even）- 大小の隣</p>
                          <p>• 合計値（Total）- 中央付近</p>
                        </div>
                      </div>
                      <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                        <p className="text-xs font-black text-blue-400 mb-2">その他エリア</p>
                        <div className="space-y-1 text-xs text-gray-300">
                          <p>• シングルナンバー（1〜6）- 左右</p>
                          <p>• コンビネーション - 中央</p>
                          <p>• ダブル・トリプル - 上部</p>
                        </div>
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
                    'サイコロが振られている最中は静かに',
                    '他人のベットエリアを邪魔しない',
                    '配当を受け取ったらすぐに回収する',
                    'ディーラーの指示に従う',
                    '大声を出さない'
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
            {/* 大小（Big/Small） */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-black text-white">大小（Big/Small）</h2>
                  <span className="ml-auto text-xs bg-green-600 text-white px-2 py-1 rounded-full font-black">最人気</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      3つのサイコロの<span className="text-white font-black">合計値</span>が大きいか小さいかを予想する、最も基本的なベット方法です。
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                        <p className="text-xs font-black text-blue-400 mb-2">小（Small）</p>
                        <p className="text-xs text-gray-300 mb-1">合計: 4〜10</p>
                        <p className="text-lg font-black text-white">1:1</p>
                      </div>
                      <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                        <p className="text-xs font-black text-red-400 mb-2">大（Big）</p>
                        <p className="text-xs text-gray-300 mb-1">合計: 11〜17</p>
                        <p className="text-lg font-black text-white">1:1</p>
                      </div>
                    </div>
                    <div className="bg-red-900/40 rounded-lg p-3 border border-red-500/30 mt-3">
                      <p className="text-xs font-black text-red-400 mb-1 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        重要な注意点
                      </p>
                      <p className="text-xs text-gray-300">トリプル（ゾロ目）が出た場合は負けになります！</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 奇数偶数 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-black text-white">奇数偶数（Odd/Even）</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                    <p className="text-sm text-gray-300 mb-3">
                      3つのサイコロの合計値が奇数か偶数かを予想します。
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-purple-900/40 rounded-lg p-3 border border-purple-500/30">
                        <p className="text-xs font-black text-purple-400 mb-1">奇数（Odd）</p>
                        <p className="text-lg font-black text-white">1:1</p>
                      </div>
                      <div className="bg-pink-900/40 rounded-lg p-3 border border-pink-500/30">
                        <p className="text-xs font-black text-pink-400 mb-1">偶数（Even）</p>
                        <p className="text-lg font-black text-white">1:1</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">※トリプル時は負け</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 合計値ベット */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-orange-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-6 h-6 text-orange-400" />
                  <h2 className="text-xl font-black text-white">合計値ベット（Total）</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-orange-900/30 rounded-xl p-4 border border-orange-500/30">
                    <p className="text-sm text-gray-300 mb-3">
                      3つのサイコロの合計値を直接予想します。高配当が狙えます！
                    </p>
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-blue-900/40 rounded-lg p-2 border border-blue-500/30 text-center">
                          <p className="text-xs text-blue-400 font-black">4 or 17</p>
                          <p className="text-lg font-black text-white">60:1</p>
                        </div>
                        <div className="bg-blue-900/40 rounded-lg p-2 border border-blue-500/30 text-center">
                          <p className="text-xs text-blue-400 font-black">5 or 16</p>
                          <p className="text-lg font-black text-white">30:1</p>
                        </div>
                        <div className="bg-blue-900/40 rounded-lg p-2 border border-blue-500/30 text-center">
                          <p className="text-xs text-blue-400 font-black">6 or 15</p>
                          <p className="text-lg font-black text-white">18:1</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-green-900/40 rounded-lg p-2 border border-green-500/30 text-center">
                          <p className="text-xs text-green-400 font-black">7 or 14</p>
                          <p className="text-lg font-black text-white">12:1</p>
                        </div>
                        <div className="bg-green-900/40 rounded-lg p-2 border border-green-500/30 text-center">
                          <p className="text-xs text-green-400 font-black">8 or 13</p>
                          <p className="text-lg font-black text-white">8:1</p>
                        </div>
                        <div className="bg-yellow-900/40 rounded-lg p-2 border border-yellow-500/30 text-center">
                          <p className="text-xs text-yellow-400 font-black">9〜12</p>
                          <p className="text-lg font-black text-white">6:1</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* シングルナンバー */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-black text-white">シングルナンバー</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                    <p className="text-sm text-gray-300 mb-3">
                      選んだ数字（1〜6）が3つのサイコロのうち何個出るかで配当が変わります。
                    </p>
                    <div className="space-y-2">
                      <div className="bg-green-900/40 rounded-lg p-3 border border-green-500/30">
                        <p className="text-xs font-black text-green-400 mb-2">1個出た場合</p>
                        <p className="text-lg font-black text-white">1:1</p>
                      </div>
                      <div className="bg-yellow-900/40 rounded-lg p-3 border border-yellow-500/30">
                        <p className="text-xs font-black text-yellow-400 mb-2">2個出た場合</p>
                        <p className="text-lg font-black text-white">2:1</p>
                      </div>
                      <div className="bg-red-900/40 rounded-lg p-3 border border-red-500/30">
                        <p className="text-xs font-black text-red-400 mb-2">3個出た場合（トリプル）</p>
                        <p className="text-lg font-black text-white">3:1</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* コンビネーション */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-yellow-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-black text-white">コンビネーション</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30">
                    <p className="text-sm text-gray-300 mb-3">
                      2つの数字の組み合わせが出ることを予想します。
                    </p>
                    <div className="bg-orange-900/40 rounded-lg p-3 border border-orange-500/30">
                      <p className="text-xs font-black text-orange-400 mb-2">例: 1と2、3と5など</p>
                      <p className="text-lg font-black text-white">6:1</p>
                      <p className="text-xs text-gray-400 mt-2">的中率が高めで人気のベット方法</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ダブル */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-pink-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Dices className="w-6 h-6 text-pink-400" />
                  <h2 className="text-xl font-black text-white">ダブル（ペア）</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-pink-900/30 rounded-xl p-4 border border-pink-500/30">
                    <p className="text-sm text-gray-300 mb-3">
                      特定の数字が2個以上出ることを予想します。
                    </p>
                    <div className="bg-pink-900/40 rounded-lg p-3 border border-pink-500/30">
                      <p className="text-xs font-black text-pink-400 mb-2">例: 2・2、5・5など</p>
                      <p className="text-lg font-black text-white">10:1</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* トリプル */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Flame className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-black text-white">トリプル（ゾロ目）</h2>
                  <span className="ml-auto text-xs bg-red-600 text-white px-2 py-1 rounded-full font-black">最高配当</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                    <p className="text-sm text-gray-300 mb-3">
                      3つのサイコロが全て同じ数字になることを予想します。
                    </p>
                    <div className="space-y-2">
                      <div className="bg-red-900/40 rounded-lg p-3 border border-red-500/30">
                        <p className="text-xs font-black text-red-400 mb-2">スペシフィックトリプル</p>
                        <p className="text-sm text-gray-300 mb-1">特定の数字を指定（例: 6・6・6）</p>
                        <p className="text-2xl font-black text-white">180:1</p>
                      </div>
                      <div className="bg-orange-900/40 rounded-lg p-3 border border-orange-500/30">
                        <p className="text-xs font-black text-orange-400 mb-2">エニートリプル</p>
                        <p className="text-sm text-gray-300 mb-1">どれでもゾロ目なら的中</p>
                        <p className="text-2xl font-black text-white">30:1</p>
                      </div>
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
                    <p className="font-black text-green-400 mb-3 text-lg">還元率を理解する</p>
                    <div className="space-y-2">
                      <div className="bg-green-900/40 rounded-lg p-3 border border-green-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-black text-green-400">大小・奇数偶数</p>
                          <p className="text-lg font-black text-white">約97.2%</p>
                        </div>
                        <p className="text-xs text-gray-300">最も還元率が高い。初心者におすすめ。</p>
                      </div>
                      <div className="bg-yellow-900/40 rounded-lg p-3 border border-yellow-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-black text-yellow-400">コンビネーション</p>
                          <p className="text-lg font-black text-white">約97.2%</p>
                        </div>
                        <p className="text-xs text-gray-300">配当6倍で還元率も良好。</p>
                      </div>
                      <div className="bg-orange-900/40 rounded-lg p-3 border border-orange-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-black text-orange-400">合計値ベット</p>
                          <p className="text-lg font-black text-white">約90-95%</p>
                        </div>
                        <p className="text-xs text-gray-300">配当は高いが還元率は低め。</p>
                      </div>
                      <div className="bg-red-900/40 rounded-lg p-3 border border-red-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-black text-red-400">トリプル</p>
                          <p className="text-lg font-black text-white">約70-90%</p>
                        </div>
                        <p className="text-xs text-gray-300">ロマンはあるが還元率は最低。</p>
                      </div>
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
                      title: '大小を基本にする',
                      desc: '還元率97.2%と高く、約50%の確率で当たります。',
                      icon: CheckCircle2,
                      color: 'green'
                    },
                    {
                      title: 'コンビネーションを併用',
                      desc: '大小と組み合わせて、配当を増やすことができます。',
                      icon: Sparkles,
                      color: 'blue'
                    },
                    {
                      title: '高配当は少額で',
                      desc: 'トリプルや合計値は$1程度の少額ベットに留める。',
                      icon: AlertCircle,
                      color: 'yellow'
                    },
                    {
                      title: '資金管理を徹底',
                      desc: '1ゲームのベット額を総資金の2-5%以内に抑える。',
                      icon: DollarSign,
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
                    onClick={() => toggleSection('coverage')}
                    className="w-full bg-purple-900/30 rounded-xl p-4 border border-purple-500/30 flex items-center justify-between"
                  >
                    <p className="font-black text-purple-400">カバレッジ戦略</p>
                    {expandedSection === 'coverage' ? <ChevronUp className="w-5 h-5 text-purple-400" /> : <ChevronDown className="w-5 h-5 text-purple-400" />}
                  </button>
                  {expandedSection === 'coverage' && (
                    <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20 space-y-3 animate-slide-in">
                      <p className="text-sm text-gray-300 mb-2">
                        複数のベットエリアをカバーして、当たる確率を上げる戦略です。
                      </p>
                      <div className="bg-black/40 rounded-lg p-3 border border-purple-500/20">
                        <p className="text-xs font-black text-purple-400 mb-2">例: 大小 + コンビネーション</p>
                        <div className="space-y-1 text-xs text-gray-300">
                          <p>• 大に$10</p>
                          <p>• コンビネーション（1-2、3-4、5-6）に各$2</p>
                          <p>• 合計$16のベットで高確率で利益</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => toggleSection('pattern')}
                    className="w-full bg-pink-900/30 rounded-xl p-4 border border-pink-500/30 flex items-center justify-between"
                  >
                    <p className="font-black text-pink-400">パターン読み戦略</p>
                    {expandedSection === 'pattern' ? <ChevronUp className="w-5 h-5 text-pink-400" /> : <ChevronDown className="w-5 h-5 text-pink-400" />}
                  </button>
                  {expandedSection === 'pattern' && (
                    <div className="bg-pink-900/20 rounded-xl p-4 border border-pink-500/20 space-y-3 animate-slide-in">
                      <p className="text-sm text-gray-300 mb-2">
                        過去の出目を観察して、次の予想に活かす戦略です。
                      </p>
                      <div className="bg-black/40 rounded-lg p-3 border border-pink-500/20">
                        <p className="text-xs font-black text-pink-400 mb-2">注意点</p>
                        <p className="text-xs text-gray-300">サイコロは独立事象なので、パターンに絶対的な法則はありません。あくまで参考程度に。</p>
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
                    '負けを取り戻そうと賭け金を増やす',
                    '感情的になって高配当ベットを連発',
                    '資金管理を無視した大きなベット',
                    'トリプルにばかり賭け続ける',
                    '予算を超えてプレイする',
                    '酔った状態でプレイする'
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
                  {/* 基本ベット */}
                  <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
                    <p className="font-black text-green-400 mb-3">基本ベット</p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-green-500/20">
                        <span className="text-sm text-gray-300">大（Big）</span>
                        <span className="text-lg font-black text-white font-mono">1:1</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-green-500/20">
                        <span className="text-sm text-gray-300">小（Small）</span>
                        <span className="text-lg font-black text-white font-mono">1:1</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-green-500/20">
                        <span className="text-sm text-gray-300">奇数（Odd）</span>
                        <span className="text-lg font-black text-white font-mono">1:1</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-green-500/20">
                        <span className="text-sm text-gray-300">偶数（Even）</span>
                        <span className="text-lg font-black text-white font-mono">1:1</span>
                      </div>
                    </div>
                  </div>

                  {/* 合計値 */}
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                    <p className="font-black text-blue-400 mb-3">合計値ベット</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-blue-500/20">
                        <span className="text-sm text-gray-300">4 or 17</span>
                        <span className="text-lg font-black text-white font-mono">60:1</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-blue-500/20">
                        <span className="text-sm text-gray-300">5 or 16</span>
                        <span className="text-lg font-black text-white font-mono">30:1</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-blue-500/20">
                        <span className="text-sm text-gray-300">6 or 15</span>
                        <span className="text-lg font-black text-white font-mono">18:1</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-blue-500/20">
                        <span className="text-sm text-gray-300">7 or 14</span>
                        <span className="text-lg font-black text-white font-mono">12:1</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-blue-500/20">
                        <span className="text-sm text-gray-300">8 or 13</span>
                        <span className="text-lg font-black text-white font-mono">8:1</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-blue-500/20">
                        <span className="text-sm text-gray-300">9, 10, 11, 12</span>
                        <span className="text-lg font-black text-white font-mono">6:1</span>
                      </div>
                    </div>
                  </div>

                  {/* その他 */}
                  <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                    <p className="font-black text-purple-400 mb-3">その他のベット</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-purple-500/20">
                        <span className="text-sm text-gray-300">スペシフィックトリプル</span>
                        <span className="text-lg font-black text-white font-mono">180:1</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-purple-500/20">
                        <span className="text-sm text-gray-300">エニートリプル</span>
                        <span className="text-lg font-black text-white font-mono">30:1</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-purple-500/20">
                        <span className="text-sm text-gray-300">ダブル（ペア）</span>
                        <span className="text-lg font-black text-white font-mono">10:1</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-purple-500/20">
                        <span className="text-sm text-gray-300">コンビネーション</span>
                        <span className="text-lg font-black text-white font-mono">6:1</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-purple-500/20">
                        <span className="text-sm text-gray-300">シングル（1個）</span>
                        <span className="text-lg font-black text-white font-mono">1:1</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-purple-500/20">
                        <span className="text-sm text-gray-300">シングル（2個）</span>
                        <span className="text-lg font-black text-white font-mono">2:1</span>
                      </div>
                      <div className="flex items-center justify-between bg-black/40 rounded-lg p-2 border border-purple-500/20">
                        <span className="text-sm text-gray-300">シングル（3個）</span>
                        <span className="text-lg font-black text-white font-mono">3:1</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30">
                    <p className="text-xs text-gray-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      配当はカジノによって若干異なる場合があります。プレイ前に必ず確認してください。
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
                      負けたら次のベット額を2倍にする方法。<span className="text-white font-black">1回勝てば損失を全て取り戻せる</span>理論上最強の投資法。
                    </p>
                    <div className="bg-black/40 rounded-lg p-3 border border-red-500/20 mb-3">
                      <p className="text-xs font-black text-red-400 mb-2">ベット例（大小で使用）</p>
                      <div className="space-y-1 text-xs text-gray-300">
                        <p>1回目: $10 → 負け（-$10）</p>
                        <p>2回目: $20 → 負け（-$30）</p>
                        <p>3回目: $40 → 負け（-$70）</p>
                        <p>4回目: $80 → 負け（-$150）</p>
                        <p className="text-green-400 font-black">5回目: $160 → 勝ち（+$10）</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-900/40 rounded-lg p-2 border border-green-500/30">
                        <p className="text-xs font-black text-green-400 mb-1">メリット</p>
                        <p className="text-xs text-gray-300">理論上必ず勝てる</p>
                      </div>
                      <div className="bg-red-900/40 rounded-lg p-2 border border-red-500/30">
                        <p className="text-xs font-black text-red-400 mb-1">デメリット</p>
                        <p className="text-xs text-gray-300">資金が底をつく</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* パーレー法 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Rocket className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-black text-white">パーレー法</h2>
                  <span className="ml-auto text-xs bg-green-600 text-white px-2 py-1 rounded-full font-black">攻撃的</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      勝ったら次のベット額を2倍にする方法。<span className="text-white font-black">連勝すれば爆発的に利益が増える</span>攻撃的な投資法。
                    </p>
                    <div className="bg-black/40 rounded-lg p-3 border border-green-500/20 mb-3">
                      <p className="text-xs font-black text-green-400 mb-2">ベット例</p>
                      <div className="space-y-1 text-xs text-gray-300">
                        <p className="text-green-400">1回目: $10 → 勝ち（+$10）</p>
                        <p className="text-green-400">2回目: $20 → 勝ち（+$30）</p>
                        <p className="text-green-400">3回目: $40 → 勝ち（+$70）</p>
                        <p className="text-green-400">4回目: $80 → 勝ち（+$150）</p>
                        <p className="text-red-400">5回目: $160 → 負け（-$10）</p>
                      </div>
                    </div>
                    <div className="bg-yellow-900/40 rounded-lg p-2 border border-yellow-500/30">
                      <p className="text-xs font-black text-yellow-400 mb-1">💡 重要</p>
                      <p className="text-xs text-gray-300">3〜4連勝したら利益を確定して最初に戻すのがコツ</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 10%法 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-black text-white">10%法</h2>
                  <span className="ml-auto text-xs bg-blue-600 text-white px-2 py-1 rounded-full font-black">堅実</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      常に<span className="text-white font-black">総資金の10%</span>をベットする方法。資金に応じてベット額が変動するため、破産リスクが低い。
                    </p>
                    <div className="bg-black/40 rounded-lg p-3 border border-blue-500/20 mb-3">
                      <p className="text-xs font-black text-blue-400 mb-2">ベット例（総資金$1000の場合）</p>
                      <div className="space-y-1 text-xs text-gray-300">
                        <p>総資金$1000 → $100ベット</p>
                        <p className="text-red-400">負け → 総資金$900 → $90ベット</p>
                        <p className="text-green-400">勝ち → 総資金$990 → $99ベット</p>
                        <p className="text-green-400">勝ち → 総資金$1089 → $108ベット</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">※初心者は5%程度から始めるのがおすすめ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* グッドマン法 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-black text-white">グッドマン法（1-2-3-5法）</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      勝った時に<span className="text-white font-black">1→2→3→5→5...</span>の順でベット額を増やす方法。負けたら最初に戻る。
                    </p>
                    <div className="bg-black/40 rounded-lg p-3 border border-purple-500/20 mb-3">
                      <p className="text-xs font-black text-purple-400 mb-2">ベット例（単位$10）</p>
                      <div className="space-y-1 text-xs text-gray-300">
                        <p className="text-green-400">1回目: $10 → 勝ち</p>
                        <p className="text-green-400">2回目: $20 → 勝ち</p>
                        <p className="text-green-400">3回目: $30 → 勝ち</p>
                        <p className="text-green-400">4回目: $50 → 勝ち</p>
                        <p className="text-green-400">5回目: $50 → 勝ち</p>
                        <p className="text-red-400">6回目: $50 → 負け（$10に戻る）</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">リスクを抑えつつ利益を伸ばせるバランス型</p>
                  </div>
                </div>
              </div>
            </div>

            {/* バーネット法 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-orange-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Flame className="w-6 h-6 text-orange-400" />
                  <h2 className="text-xl font-black text-white">バーネット法（1-3-2-6法）</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-orange-900/30 rounded-xl p-4 border border-orange-500/30">
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      <span className="text-white font-black">1→3→2→6→6...</span>の順でベット額を変える方法。グッドマン法より攻撃的。
                    </p>
                    <div className="bg-black/40 rounded-lg p-3 border border-orange-500/20 mb-3">
                      <p className="text-xs font-black text-orange-400 mb-2">ベット例（単位$10）</p>
                      <div className="space-y-1 text-xs text-gray-300">
                        <p className="text-green-400">1回目: $10 → 勝ち</p>
                        <p className="text-green-400">2回目: $30 → 勝ち</p>
                        <p className="text-green-400">3回目: $20 → 勝ち</p>
                        <p className="text-green-400">4回目: $60 → 勝ち（大きく稼げる）</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">4連勝すれば大きな利益。2連勝でも損失なし</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 投資法選びのコツ */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-cyan-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-xl font-black text-white">投資法選びのコツ</h2>
                </div>
                <div className="space-y-2">
                  <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                    <p className="text-sm font-black text-green-400 mb-2">初心者におすすめ</p>
                    <p className="text-xs text-gray-300">10%法、グッドマン法（1-2-3-5法）</p>
                  </div>
                  <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                    <p className="text-sm font-black text-blue-400 mb-2">少ない資金で楽しみたい</p>
                    <p className="text-xs text-gray-300">グッドマン法、フラットベット（固定額）</p>
                  </div>
                  <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
                    <p className="text-sm font-black text-purple-400 mb-2">大きく稼ぎたい</p>
                    <p className="text-xs text-gray-300">パーレー法、バーネット法（リスク高）</p>
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