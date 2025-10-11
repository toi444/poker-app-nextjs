'use client'

import { useState } from 'react'
import { ArrowLeft, BookOpen, Info, Sparkles, Trophy, Target, TrendingUp, Zap, CheckCircle2, AlertCircle, DollarSign, Users, ChevronDown, ChevronUp } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function ThreeCardPokerLesson() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'basic' | 'rules' | 'hands' | 'betting' | 'strategy' | 'dealer'>('basic')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 pb-20">
      {/* ヘッダー */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-pink-500/30">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-white hover:text-pink-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-black">戻る</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-pink-600 blur-lg animate-pulse" />
              <BookOpen className="relative w-6 h-6 text-pink-400" />
            </div>
            <h1 className="text-xl font-black text-white">スリーカードポーカー</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* タブナビゲーション */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-1 border-2 border-pink-500/30">
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'basic', label: '基本', icon: Info },
                { id: 'rules', label: 'ルール', icon: BookOpen },
                { id: 'hands', label: '役', icon: Trophy }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/50'
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
                { id: 'betting', label: 'ベット', icon: DollarSign },
                { id: 'strategy', label: '攻略', icon: Target },
                { id: 'dealer', label: 'ディーラー', icon: Users }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-500/50'
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
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-pink-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-pink-400" />
                  <h2 className="text-xl font-black text-white">スリーカードポーカーとは</h2>
                </div>
                <div className="space-y-3 text-gray-300">
                  <p className="leading-relaxed">
                    スリーカードポーカーは、3枚のカードだけで勝負するシンプルで爽快なポーカーゲームです。ディーラーと1対1で対決し、より強い役を作った方が勝利します。
                  </p>
                  <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                    <p className="font-black text-pink-400 mb-2">特徴</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>3枚のカードのみで勝負（交換なし）</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>ストレート＞フラッシュ（通常と逆）</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>ディーラーはQ以上で勝負成立</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>初心者でも理解しやすいルール</span>
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
                    <p className="text-gray-300 mb-3">
                      配られた3枚のカードでディーラーより強い役を作ることが目的です。フォールド（降りる）するか、プレイ（勝負する）かを選択できます。
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                        <p className="text-xs font-black text-green-400 mb-1">勝利条件</p>
                        <p className="text-xs text-gray-300">ディーラーより強い役を作る</p>
                      </div>
                      <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                        <p className="text-xs font-black text-yellow-400 mb-1">選択肢</p>
                        <p className="text-xs text-gray-300">プレイ or フォールド</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 通常のポーカーとの違い */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-orange-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-orange-400" />
                  <h2 className="text-xl font-black text-white">通常のポーカーとの違い</h2>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-orange-900/30 rounded-xl p-4 border border-orange-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-orange-400">カード枚数</span>
                        <span className="text-xs bg-orange-600 text-white px-2 py-1 rounded-full">重要</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-400">通常: 5枚</div>
                        <div className="text-white font-black">3カード: 3枚</div>
                      </div>
                    </div>
                    <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-red-400">役の強さ</span>
                        <span className="text-xs bg-red-600 text-white px-2 py-1 rounded-full">注意</span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">通常</span>
                          <span className="text-gray-300">フラッシュ ＞ ストレート</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white font-black">3カード</span>
                          <span className="text-white font-black">ストレート ＞ フラッシュ</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-purple-400">カード交換</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-gray-400">通常: あり</div>
                        <div className="text-white font-black">3カード: なし</div>
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
            {/* カジノでの実践ガイド */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-pink-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-pink-400" />
                  <h2 className="text-xl font-black text-white">カジノでの実践ガイド</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-pink-900/30 rounded-xl p-4 border border-pink-500/30">
                    <p className="font-black text-pink-400 mb-3 text-lg flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      テーブルに座ってから配当を受け取るまで
                    </p>
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      初めてでも安心！以下の流れに沿って進めれば大丈夫です。各ステップを詳しく解説します。
                    </p>
                  </div>

                  {/* STEP 1 */}
                  <button
                    onClick={() => toggleSection('step1')}
                    className="w-full bg-gradient-to-r from-pink-900/40 to-rose-900/40 rounded-xl p-4 border-2 border-pink-500/50 flex items-center justify-between hover:border-pink-400 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-pink-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl">
                        1
                      </div>
                      <div className="text-left">
                        <p className="font-black text-pink-400 text-lg">テーブルに座る</p>
                        <p className="text-xs text-gray-400">空席を見つけて着席</p>
                      </div>
                    </div>
                    {expandedSection === 'step1' ? <ChevronUp className="w-5 h-5 text-pink-400" /> : <ChevronDown className="w-5 h-5 text-pink-400" />}
                  </button>
                  {expandedSection === 'step1' && (
                    <div className="bg-pink-900/20 rounded-xl p-4 border border-pink-500/20 space-y-3 animate-slide-in">
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>スリーカードポーカーのテーブルを探す（テーブル看板を確認）</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>空いている席に座る（複数人同時プレイ可能）</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>テーブルのミニマムベット額を確認する（通常$5～$25）</span>
                        </div>
                      </div>
                      <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                        <p className="text-xs font-black text-yellow-400 mb-1">💡 初心者向けTips</p>
                        <p className="text-xs text-gray-300">ミニマムベットが低いテーブルから始めましょう。慣れるまでは$5～$10のテーブルがおすすめです。</p>
                      </div>
                    </div>
                  )}

                  {/* STEP 2 */}
                  <button
                    onClick={() => toggleSection('step2')}
                    className="w-full bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-xl p-4 border-2 border-purple-500/50 flex items-center justify-between hover:border-purple-400 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl">
                        2
                      </div>
                      <div className="text-left">
                        <p className="font-black text-purple-400 text-lg">チップを両替</p>
                        <p className="text-xs text-gray-400">現金をカジノチップに交換</p>
                      </div>
                    </div>
                    {expandedSection === 'step2' ? <ChevronUp className="w-5 h-5 text-purple-400" /> : <ChevronDown className="w-5 h-5 text-purple-400" />}
                  </button>
                  {expandedSection === 'step2' && (
                    <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20 space-y-3 animate-slide-in">
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>現金をテーブルの上に置く（ディーラーに直接渡さない）</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>ディーラーが「チェンジ」と言って現金をチップに交換してくれる</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>チップを受け取る</span>
                        </div>
                      </div>
                      <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                        <p className="text-xs font-black text-blue-400 mb-1">💡 重要なマナー</p>
                        <p className="text-xs text-gray-300">ディーラーに現金を直接手渡ししてはいけません。必ずテーブルの上に置きましょう。</p>
                      </div>
                    </div>
                  )}

                  {/* STEP 3 */}
                  <button
                    onClick={() => toggleSection('step3')}
                    className="w-full bg-gradient-to-r from-blue-900/40 to-cyan-900/40 rounded-xl p-4 border-2 border-blue-500/50 flex items-center justify-between hover:border-blue-400 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl">
                        3
                      </div>
                      <div className="text-left">
                        <p className="font-black text-blue-400 text-lg">ベットエリアを確認</p>
                        <p className="text-xs text-gray-400">3つのベットエリアの位置を把握</p>
                      </div>
                    </div>
                    {expandedSection === 'step3' ? <ChevronUp className="w-5 h-5 text-blue-400" /> : <ChevronDown className="w-5 h-5 text-blue-400" />}
                  </button>
                  {expandedSection === 'step3' && (
                    <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-500/20 space-y-3 animate-slide-in">
                      <div className="space-y-2">
                        <div className="bg-black/40 rounded-lg p-3 border border-blue-500/20">
                          <p className="text-xs font-black text-blue-400 mb-2">左側: ANTE（アンティ）</p>
                          <p className="text-xs text-gray-300">ゲーム参加料。ここには必ずベットが必要です。</p>
                        </div>
                        <div className="bg-black/40 rounded-lg p-3 border border-purple-500/20">
                          <p className="text-xs font-black text-purple-400 mb-2">中央: PAIR PLUS（ペアプラス）</p>
                          <p className="text-xs text-gray-300">オプション。ペア以上で配当が出るサイドベット。</p>
                        </div>
                        <div className="bg-black/40 rounded-lg p-3 border border-green-500/20">
                          <p className="text-xs font-black text-green-400 mb-2">右側: PLAY/CALL（プレイ）</p>
                          <p className="text-xs text-gray-300">後で使用。カードを見た後、勝負する時にベット。</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4 - 重要！ */}
                  <button
                    onClick={() => toggleSection('step4')}
                    className="w-full bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-xl p-4 border-2 border-yellow-500/50 flex items-center justify-between hover:border-yellow-400 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl">
                        4
                      </div>
                      <div className="text-left">
                        <p className="font-black text-yellow-400 text-lg">最初のベット 🔥</p>
                        <p className="text-xs text-gray-400">アンティとペアプラスを同時にベット</p>
                      </div>
                    </div>
                    {expandedSection === 'step4' ? <ChevronUp className="w-5 h-5 text-yellow-400" /> : <ChevronDown className="w-5 h-5 text-yellow-400" />}
                  </button>
                  {expandedSection === 'step4' && (
                    <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-500/20 space-y-3 animate-slide-in">
                      <div className="bg-orange-900/40 rounded-lg p-3 border border-orange-500/30 mb-3">
                        <p className="text-sm font-black text-orange-400 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          超重要！ベットのタイミング
                        </p>
                        <p className="text-sm text-white font-black leading-relaxed mb-2">
                          アンティとペアプラスは「カードが配られる前」に同時にベットします！
                        </p>
                        <p className="text-xs text-gray-300">
                          これが初心者が最も混乱するポイント。カードを見てから「やっぱりペアプラスに賭ける」はできません。
                        </p>
                      </div>

                      <div className="space-y-2 text-sm text-gray-300">
                        <p className="font-black text-white mb-2">✅ 正しいベット手順</p>
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <span className="text-yellow-400 font-black">1.</span>
                            <span>ディーラーが「Place your bets（ベットをどうぞ）」と言う</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-yellow-400 font-black">2.</span>
                            <span>「ANTE」エリアにチップを置く（例：$10）</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-yellow-400 font-black">3.</span>
                            <span className="text-white font-black">同時に「PAIR PLUS」にもチップを置く（例：$5）← ここがポイント！</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <span className="text-yellow-400 font-black">4.</span>
                            <span>ディーラーが「No more bets（ベット締め切り）」と言ったらベット終了</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3">
                        <div className="bg-green-900/30 rounded-lg p-2 border border-green-500/30">
                          <p className="text-xs font-black text-green-400 mb-1">👍 おすすめ</p>
                          <p className="text-xs text-gray-300">アンティ$10 + ペアプラス$5</p>
                        </div>
                        <div className="bg-blue-900/30 rounded-lg p-2 border border-blue-500/30">
                          <p className="text-xs font-black text-blue-400 mb-1">📊 バランス型</p>
                          <p className="text-xs text-gray-300">アンティ$10 + ペアプラス$10</p>
                        </div>
                      </div>

                      <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30 mt-3">
                        <p className="text-xs font-black text-red-400 mb-2 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          ペアプラスに賭けるべき？
                        </p>
                        <div className="space-y-1 text-xs text-gray-300">
                          <p>• 毎回賭ける：資金が減りやすい（控除率7%）</p>
                          <p>• 3～4回ハイカードが続いた後：おすすめ！</p>
                          <p>• 気分で賭ける：エンターテイメントとして◎</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 5 */}
                  <button
                    onClick={() => toggleSection('step5')}
                    className="w-full bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-xl p-4 border-2 border-green-500/50 flex items-center justify-between hover:border-green-400 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl">
                        5
                      </div>
                      <div className="text-left">
                        <p className="font-black text-green-400 text-lg">カードを受け取る</p>
                        <p className="text-xs text-gray-400">3枚のカードが配られる</p>
                      </div>
                    </div>
                    {expandedSection === 'step5' ? <ChevronUp className="w-5 h-5 text-green-400" /> : <ChevronDown className="w-5 h-5 text-green-400" />}
                  </button>
                  {expandedSection === 'step5' && (
                    <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/20 space-y-3 animate-slide-in">
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>ディーラーが各プレイヤーに3枚ずつカードを配る</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>ディーラーにも3枚配られるが、全て裏向き</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>自分のカードを確認する（周りに見えないように）</span>
                        </div>
                      </div>
                      <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
                        <p className="text-xs font-black text-purple-400 mb-2">🎴 ペアプラス判定</p>
                        <p className="text-xs text-gray-300 mb-2">カードを見た瞬間、ペアプラスの勝敗は確定します！</p>
                        <p className="text-xs text-white font-black">ペア以上 → 配当確定（後で受け取り）</p>
                        <p className="text-xs text-gray-400">ハイカードのみ → ペアプラスは没収</p>
                      </div>
                    </div>
                  )}

                  {/* STEP 6 */}
                  <button
                    onClick={() => toggleSection('step6')}
                    className="w-full bg-gradient-to-r from-red-900/40 to-pink-900/40 rounded-xl p-4 border-2 border-red-500/50 flex items-center justify-between hover:border-red-400 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl">
                        6
                      </div>
                      <div className="text-left">
                        <p className="font-black text-red-400 text-lg">プレイorフォールド決断</p>
                        <p className="text-xs text-gray-400">Q-6-4ルールで判断</p>
                      </div>
                    </div>
                    {expandedSection === 'step6' ? <ChevronUp className="w-5 h-5 text-red-400" /> : <ChevronDown className="w-5 h-5 text-red-400" />}
                  </button>
                  {expandedSection === 'step6' && (
                    <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/20 space-y-3 animate-slide-in">
                      <div className="bg-orange-900/40 rounded-lg p-3 border border-orange-500/30 mb-3">
                        <p className="text-sm font-black text-orange-400 mb-2">判断のポイント</p>
                        <p className="text-sm text-white font-black">Q-6-4以上 または ペア以上 → PLAY</p>
                        <p className="text-sm text-gray-400">それより弱い → FOLD</p>
                      </div>

                      <div className="space-y-2">
                        <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                          <p className="text-xs font-black text-green-400 mb-2">✅ PLAYを選んだ場合</p>
                          <div className="space-y-1 text-xs text-gray-300">
                            <p>1. 「PLAY」エリアにアンティと同額をベット</p>
                            <p>2. 例：アンティ$10 → PLAY$10を追加</p>
                            <p>3. 合計$20で勝負！</p>
                          </div>
                        </div>
                        <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                          <p className="text-xs font-black text-red-400 mb-2">❌ FOLDを選んだ場合</p>
                          <div className="space-y-1 text-xs text-gray-300">
                            <p>1. カードをディーラーに返す</p>
                            <p>2. アンティベット$10は没収</p>
                            <p>3. このゲームは終了</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                        <p className="text-xs font-black text-blue-400 mb-2">💡 実践例</p>
                        <div className="space-y-1 text-xs text-gray-300">
                          <p>手札: ♥K ♦9 ♠4 → PLAY（Kがある）</p>
                          <p>手札: ♣Q ♠6 ♥4 → PLAY（ちょうどQ-6-4）</p>
                          <p>手札: ♦Q ♥6 ♠3 → FOLD（Q-6-4未満）</p>
                          <p>手札: ♠J ♥9 ♣8 → FOLD（J以下）</p>
                          <p>手札: ♥7 ♦7 ♠2 → PLAY（ペアあり）</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 7 */}
                  <button
                    onClick={() => toggleSection('step7')}
                    className="w-full bg-gradient-to-r from-cyan-900/40 to-blue-900/40 rounded-xl p-4 border-2 border-cyan-500/50 flex items-center justify-between hover:border-cyan-400 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-cyan-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl">
                        7
                      </div>
                      <div className="text-left">
                        <p className="font-black text-cyan-400 text-lg">ディーラーオープン</p>
                        <p className="text-xs text-gray-400">ディーラーのカードが公開</p>
                      </div>
                    </div>
                    {expandedSection === 'step7' ? <ChevronUp className="w-5 h-5 text-cyan-400" /> : <ChevronDown className="w-5 h-5 text-cyan-400" />}
                  </button>
                  {expandedSection === 'step7' && (
                    <div className="bg-cyan-900/20 rounded-xl p-4 border border-cyan-500/20 space-y-3 animate-slide-in">
                      <div className="space-y-2 text-sm text-gray-300">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>全プレイヤーの判断が終わったら、ディーラーがカードをオープン</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span>ディーラーが「クオリファイ」するか確認</span>
                        </div>
                      </div>

                      <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                        <p className="text-xs font-black text-yellow-400 mb-2">📋 クオリファイ判定</p>
                        <div className="space-y-1 text-xs text-gray-300">
                          <p className="text-white font-black">✅ Q以上のハイカード or ペア以上</p>
                          <p>→「Dealer qualifies（クオリファイ）」→ 勝負成立</p>
                          <p className="text-white font-black mt-2">❌ J以下のハイカードのみ</p>
                          <p>→「Dealer does not qualify（ノットクオリファイ）」→ アンティ配当＋プレイ返却</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 8 */}
                  <button
                    onClick={() => toggleSection('step8')}
                    className="w-full bg-gradient-to-r from-yellow-600/40 to-orange-600/40 rounded-xl p-4 border-2 border-yellow-500/50 flex items-center justify-between hover:border-yellow-400 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl">
                        8
                      </div>
                      <div className="text-left">
                        <p className="font-black text-yellow-400 text-lg">配当を受け取る 💰</p>
                        <p className="text-xs text-gray-400">勝敗に応じた配当</p>
                      </div>
                    </div>
                    {expandedSection === 'step8' ? <ChevronUp className="w-5 h-5 text-yellow-400" /> : <ChevronDown className="w-5 h-5 text-yellow-400" />}
                  </button>
                  {expandedSection === 'step8' && (
                    <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-500/20 space-y-3 animate-slide-in">
                      {/* アンティボーナスの詳細説明 */}
                      <div className="bg-gradient-to-r from-orange-900/50 to-yellow-900/50 rounded-xl p-4 border-2 border-orange-500/50">
                        <p className="text-sm font-black text-orange-400 mb-3 flex items-center gap-2">
                          <Sparkles className="w-5 h-5" />
                          アンティボーナスとは？
                        </p>
                        <p className="text-xs text-white font-black mb-3 leading-relaxed">
                          ストレート以上の役ができた時に、アンティに対して支払われる特別ボーナスです。重要なのは、<span className="text-yellow-400">勝敗に関係なく必ず支払われる</span>という点！
                        </p>
                        
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="bg-red-900/40 rounded-lg p-2 border border-red-500/30">
                            <p className="text-xs text-red-400 font-black mb-1">ストレート</p>
                            <p className="text-lg font-black text-white">1:1</p>
                          </div>
                          <div className="bg-purple-900/40 rounded-lg p-2 border border-purple-500/30">
                            <p className="text-xs text-purple-400 font-black mb-1">スリーカード</p>
                            <p className="text-lg font-black text-white">4:1</p>
                          </div>
                          <div className="bg-pink-900/40 rounded-lg p-2 border border-pink-500/30">
                            <p className="text-xs text-pink-400 font-black mb-1">StFlush</p>
                            <p className="text-lg font-black text-white">5:1</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="bg-black/40 rounded-lg p-2 border border-green-500/30">
                            <p className="text-xs text-green-400 font-black mb-1">✅ 勝った場合</p>
                            <p className="text-xs text-gray-300">アンティボーナス + 基本配当の両方もらえる</p>
                          </div>
                          <div className="bg-black/40 rounded-lg p-2 border border-yellow-500/30">
                            <p className="text-xs text-yellow-400 font-black mb-1">✅ ノットクオリファイの場合</p>
                            <p className="text-xs text-gray-300">アンティボーナスだけもらえる（プレイは返却）</p>
                          </div>
                          <div className="bg-black/40 rounded-lg p-2 border border-orange-500/30">
                            <p className="text-xs text-orange-400 font-black mb-1">✅ 負けた場合でも</p>
                            <p className="text-xs text-gray-300">アンティボーナスはもらえる！（これが凄い）</p>
                          </div>
                        </div>

                        <div className="bg-blue-900/40 rounded-lg p-2 border border-blue-500/30 mt-2">
                          <p className="text-xs text-blue-400 font-black mb-1">💡 重要ポイント</p>
                          <p className="text-xs text-gray-300">ペアやフラッシュではアンティボーナスは出ません。ストレート以上の時だけです！</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                          <p className="text-sm font-black text-green-400 mb-2">🎉 勝利した場合</p>
                          <div className="space-y-1 text-xs text-gray-300">
                            <p>• アンティ: 1:1配当（基本配当）</p>
                            <p>• プレイ: 1:1配当</p>
                            <p>• アンティボーナス: ストレート以上で追加配当</p>
                            <p>• ペアプラス: ペア以上なら配当</p>
                          </div>
                        </div>
                        <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                          <p className="text-sm font-black text-yellow-400 mb-2">⚖️ ノットクオリファイの場合</p>
                          <div className="space-y-1 text-xs text-gray-300">
                            <p>• アンティ: 1:1配当</p>
                            <p>• プレイ: 返却（引き分け）</p>
                            <p>• アンティボーナス: ストレート以上なら配当</p>
                          </div>
                        </div>
                        <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                          <p className="text-sm font-black text-red-400 mb-2">😢 負けた場合</p>
                          <div className="space-y-1 text-xs text-gray-300">
                            <p>• アンティとプレイは没収</p>
                            <p className="text-white font-black">• アンティボーナス: ストレート以上なら配当！</p>
                            <p>• ペアプラス: ペア以上なら配当</p>
                          </div>
                        </div>
                      </div>

                      {/* 配当計算例を詳細化 */}
                      <div className="space-y-2">
                        <p className="text-sm font-black text-white flex items-center gap-2">
                          <Zap className="w-4 h-4 text-yellow-400" />
                          配当計算例（詳細版）
                        </p>

                        <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                          <p className="text-xs font-black text-green-400 mb-2">例1: ストレートで勝利（最高のパターン）</p>
                          <p className="text-xs text-gray-300 mb-2">アンティ$10、プレイ$10、ペアプラス$5</p>
                          <div className="space-y-1 text-xs text-white">
                            <p>• アンティ配当: $10 (1:1)</p>
                            <p>• プレイ配当: $10 (1:1)</p>
                            <p>• アンティボーナス: $10 (1:1)</p>
                            <p>• ペアプラス: $30 (6:1)</p>
                            <p className="text-yellow-400 font-black text-sm pt-2 border-t border-green-500/30">合計: $60 獲得！ 🎉</p>
                          </div>
                        </div>

                        <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                          <p className="text-xs font-black text-yellow-400 mb-2">例2: ストレートでノットクオリファイ</p>
                          <p className="text-xs text-gray-300 mb-2">アンティ$10、プレイ$10</p>
                          <div className="space-y-1 text-xs text-white">
                            <p>• アンティ配当: $10 (1:1)</p>
                            <p>• プレイ配当: $10 返却</p>
                            <p>• アンティボーナス: $10 (1:1) ← もらえる！</p>
                            <p className="text-yellow-400 font-black text-sm pt-2 border-t border-yellow-500/30">合計: $20 獲得 + $10返却</p>
                          </div>
                        </div>

                        <div className="bg-orange-900/30 rounded-lg p-3 border border-orange-500/30">
                          <p className="text-xs font-black text-orange-400 mb-2">例3: スリーカードで負けた場合</p>
                          <p className="text-xs text-gray-300 mb-2">アンティ$10、プレイ$10（ディーラーの方が強い）</p>
                          <div className="space-y-1 text-xs text-white">
                            <p className="line-through text-gray-500">• アンティ: 没収</p>
                            <p className="line-through text-gray-500">• プレイ: 没収</p>
                            <p>• アンティボーナス: $40 (4:1) ← もらえる！</p>
                            <p className="text-orange-400 font-black text-sm pt-2 border-t border-orange-500/30">損失: -$20 + ボーナス$40 = $20プラス！ 💪</p>
                          </div>
                        </div>

                        <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                          <p className="text-xs font-black text-blue-400 mb-2">例4: ペアで勝利（ボーナスなし）</p>
                          <p className="text-xs text-gray-300 mb-2">アンティ$10、プレイ$10</p>
                          <div className="space-y-1 text-xs text-white">
                            <p>• アンティ配当: $10 (1:1)</p>
                            <p>• プレイ配当: $10 (1:1)</p>
                            <p>• アンティボーナス: なし（ペアは対象外）</p>
                            <p className="text-blue-400 font-black text-sm pt-2 border-t border-blue-500/30">合計: $20 獲得</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 簡易ゲームフロー */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-cyan-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-xl font-black text-white">ゲームフロー早見表</h2>
                </div>
                <div className="space-y-3">
                  {[
                    {
                      step: 1,
                      title: 'ベット',
                      desc: 'アンティ＋ペアプラス（オプション）を同時にベット',
                      color: 'pink'
                    },
                    {
                      step: 2,
                      title: 'カード配布',
                      desc: 'プレイヤーとディーラーに3枚ずつ配布',
                      color: 'purple'
                    },
                    {
                      step: 3,
                      title: 'プレイorフォールド',
                      desc: 'Q-6-4以上ならプレイ、それ以下ならフォールド',
                      color: 'blue'
                    },
                    {
                      step: 4,
                      title: 'ディーラー判定',
                      desc: 'Q以上でクオリファイ、J以下でノットクオリファイ',
                      color: 'green'
                    },
                    {
                      step: 5,
                      title: '配当',
                      desc: '勝敗に応じて配当を受け取る',
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

            {/* ディーラーのクオリファイ */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-black text-white">ディーラーのクオリファイ</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                    <p className="font-black text-red-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      最重要ルール
                    </p>
                    <p className="text-gray-300 mb-3 leading-relaxed">
                      ディーラーは<span className="text-white font-black">「Q（クイーン）以上のハイカード」</span>または<span className="text-white font-black">「ペア以上の役」</span>がない場合、強制的にフォールド（ノットクオリファイ）となります。
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                        <p className="text-xs font-black text-green-400 mb-2">クオリファイ成立</p>
                        <div className="space-y-1 text-xs text-gray-300">
                          <p>• Q以上のハイカード</p>
                          <p>• ペア以上の役</p>
                        </div>
                      </div>
                      <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                        <p className="text-xs font-black text-red-400 mb-2">ノットクオリファイ</p>
                        <div className="space-y-1 text-xs text-gray-300">
                          <p>• J以下のハイカード</p>
                          <p>• 役なし</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30">
                    <p className="font-black text-yellow-400 mb-2">ノットクオリファイ時の配当</p>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>アンティに対して1:1の配当</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>プレイベットは返却（引き分け）</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>ストレート以上ならアンティボーナスも獲得</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 役タブ */}
        {activeTab === 'hands' && (
          <div className="space-y-4 animate-slide-in">
            {/* 役の一覧 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-yellow-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-black text-white">役の強さランキング</h2>
                </div>
                <div className="space-y-2">
                  {[
                    {
                      rank: 1,
                      name: 'ストレートフラッシュ',
                      eng: 'Straight Flush',
                      desc: '同じスートで連続した3枚',
                      example: '♠️A ♠️K ♠️Q',
                      prob: '0.22%',
                      color: 'from-red-600 to-pink-600'
                    },
                    {
                      rank: 2,
                      name: 'スリーカード',
                      eng: 'Three of a Kind',
                      desc: '同じ数字3枚',
                      example: '♥️K ♦️K ♣️K',
                      prob: '0.24%',
                      color: 'from-purple-600 to-pink-600'
                    },
                    {
                      rank: 3,
                      name: 'ストレート',
                      eng: 'Straight',
                      desc: '連続した3枚（スート不問）',
                      example: '♣️9 ♦️8 ♠️7',
                      prob: '3.26%',
                      color: 'from-blue-600 to-cyan-600'
                    },
                    {
                      rank: 4,
                      name: 'フラッシュ',
                      eng: 'Flush',
                      desc: '同じスート3枚（連続不要）',
                      example: '♥️K ♥️9 ♥️4',
                      prob: '4.96%',
                      color: 'from-green-600 to-emerald-600'
                    },
                    {
                      rank: 5,
                      name: 'ペア',
                      eng: 'Pair',
                      desc: '同じ数字2枚',
                      example: '♠️Q ♥️Q ♦️7',
                      prob: '16.94%',
                      color: 'from-yellow-600 to-orange-600'
                    },
                    {
                      rank: 6,
                      name: 'ハイカード',
                      eng: 'High Card',
                      desc: '役なし（最高位カードで勝負）',
                      example: '♦️A ♣️J ♠️5',
                      prob: '74.39%',
                      color: 'from-gray-600 to-gray-700'
                    }
                  ].map((hand) => (
                    <div key={hand.rank} className="relative group/hand">
                      <div className={`absolute inset-0 bg-gradient-to-r ${hand.color} rounded-xl blur-md opacity-30`} />
                      <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20">
                        <div className="flex items-start gap-3">
                          <div className={`bg-gradient-to-r ${hand.color} text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0`}>
                            {hand.rank}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <p className="font-black text-white text-lg">{hand.name}</p>
                                <p className="text-xs text-gray-400">{hand.eng}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-gray-400">出現率</p>
                                <p className="text-sm font-black text-yellow-400">{hand.prob}</p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-300 mb-2">{hand.desc}</p>
                            <div className="bg-black/40 rounded-lg p-2 border border-white/10">
                              <p className="text-xs text-gray-400 mb-1">例</p>
                              <p className="text-white font-black font-mono">{hand.example}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 重要な注意点 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-black text-white">重要な注意点</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                    <p className="font-black text-red-400 mb-2 text-lg">ストレート ＞ フラッシュ</p>
                    <p className="text-gray-300 text-sm leading-relaxed mb-3">
                      3枚のカードでは、フラッシュよりストレートの方が出にくいため、役の強さが逆転しています。これは非常に重要なルールです！
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-blue-900/40 rounded-lg p-2 border border-blue-500/30">
                        <p className="text-xs text-blue-400 font-black mb-1">ストレート</p>
                        <p className="text-xs text-gray-300">出現率: 3.26%</p>
                      </div>
                      <div className="bg-green-900/40 rounded-lg p-2 border border-green-500/30">
                        <p className="text-xs text-green-400 font-black mb-1">フラッシュ</p>
                        <p className="text-xs text-gray-300">出現率: 4.96%</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                    <p className="font-black text-purple-400 mb-2">ハイカードの強さ比較</p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      同じ役の場合、最も高いカードから順に比較します。A ＞ K ＞ Q ＞ J ＞ 10 ＞ ... ＞ 2 の順です。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ベットタブ */}
        {activeTab === 'betting' && (
          <div className="space-y-4 animate-slide-in">
            {/* ベットの種類 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-black text-white">ベットの種類</h2>
                </div>
                <div className="space-y-3">
                  {/* アンティ */}
                  <div className="bg-pink-900/30 rounded-xl p-4 border border-pink-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-black text-pink-400 text-lg">アンティ（Ante）</p>
                      <span className="text-xs bg-pink-600 text-white px-2 py-1 rounded-full">必須</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      ゲーム参加料。必ずベットする必要があります。ディーラーと勝負する場合の基本ベットです。
                    </p>
                    <div className="bg-black/40 rounded-lg p-3 border border-pink-500/20">
                      <p className="text-xs font-black text-pink-400 mb-2">配当</p>
                      <ul className="space-y-1 text-xs text-gray-300">
                        <li>• 勝利時: 1:1（賭け金と同額）</li>
                        <li>• ノットクオリファイ時: 1:1 + プレイ返却</li>
                        <li>• アンティボーナス: 役に応じて追加配当</li>
                      </ul>
                    </div>
                  </div>

                  {/* プレイ/コール */}
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-black text-blue-400 text-lg">プレイ/コール（Play/Call）</p>
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">勝負時</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      勝負を続ける場合にベット。<span className="text-white font-black">アンティと同額</span>を賭ける必要があります。
                    </p>
                    <div className="bg-black/40 rounded-lg p-3 border border-blue-500/20">
                      <p className="text-xs font-black text-blue-400 mb-2">配当</p>
                      <p className="text-xs text-gray-300">勝利時: 1:1（賭け金と同額）</p>
                    </div>
                  </div>

                  {/* ペアプラス */}
                  <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-black text-purple-400 text-lg">ペアプラス（Pair Plus）</p>
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">サイド</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                      オプションのサイドベット。勝敗に関係なく、<span className="text-white font-black">ペア以上の役</span>が出れば配当獲得。アンティなしでもベット可能。
                    </p>
                    <div className="bg-black/40 rounded-lg p-3 border border-purple-500/20">
                      <p className="text-xs font-black text-purple-400 mb-2">配当</p>
                      <ul className="space-y-1 text-xs text-gray-300">
                        <li>• ペア以上で配当発生</li>
                        <li>• 役の強さに応じて高配当</li>
                        <li>• ディーラーの結果は無関係</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 配当表 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-yellow-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-black text-white">配当表</h2>
                </div>
                <div className="space-y-3">
                  {/* アンティボーナス */}
                  <div>
                    <p className="font-black text-yellow-400 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      アンティボーナス
                    </p>
                    <div className="space-y-1">
                      {[
                        { hand: 'ストレートフラッシュ', payout: '5:1', bg: 'red' },
                        { hand: 'スリーカード', payout: '4:1', bg: 'purple' },
                        { hand: 'ストレート', payout: '1:1', bg: 'blue' }
                      ].map((item) => (
                        <div key={item.hand} className={`bg-${item.bg}-900/30 rounded-lg p-3 border border-${item.bg}-500/30 flex items-center justify-between`}>
                          <span className="text-sm text-gray-300">{item.hand}</span>
                          <span className="text-lg font-black text-white font-mono">{item.payout}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ペアプラス配当 */}
                  <div>
                    <p className="font-black text-purple-400 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      ペアプラス配当
                    </p>
                    <div className="space-y-1">
                      {[
                        { hand: 'ストレートフラッシュ', payout: '40:1', bg: 'red' },
                        { hand: 'スリーカード', payout: '30:1', bg: 'purple' },
                        { hand: 'ストレート', payout: '6:1', bg: 'blue' },
                        { hand: 'フラッシュ', payout: '3:1', bg: 'green' },
                        { hand: 'ペア', payout: '1:1', bg: 'yellow' }
                      ].map((item) => (
                        <div key={item.hand} className={`bg-${item.bg}-900/30 rounded-lg p-3 border border-${item.bg}-500/30 flex items-center justify-between`}>
                          <span className="text-sm text-gray-300">{item.hand}</span>
                          <span className="text-lg font-black text-white font-mono">{item.payout}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-orange-900/30 rounded-xl p-4 border border-orange-500/30">
                    <p className="text-xs text-gray-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      配当は1:1の場合、賭け金と同額の利益を意味します。例: $10ベットで$10利益（合計$20受取）
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 配当計算例 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-cyan-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-xl font-black text-white">配当計算例</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-cyan-900/30 rounded-xl p-4 border border-cyan-500/30">
                    <p className="font-black text-cyan-400 mb-3">例1: ストレートフラッシュで勝利</p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>• アンティ: $10</p>
                      <p>• プレイ: $10</p>
                      <p className="text-white font-black pt-2 border-t border-cyan-500/30">配当計算:</p>
                      <p>• アンティ配当: $10 × 1 = $10</p>
                      <p>• プレイ配当: $10 × 1 = $10</p>
                      <p>• アンティボーナス: $10 × 5 = $50</p>
                      <p className="text-yellow-400 font-black pt-2">合計: $20 (賭け金) + $70 (配当) = $90</p>
                    </div>
                  </div>
                  <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                    <p className="font-black text-purple-400 mb-3">例2: ペアプラスでペア成立</p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <p>• ペアプラス: $10</p>
                      <p>• 手札: ペア</p>
                      <p className="text-white font-black pt-2 border-t border-purple-500/30">配当計算:</p>
                      <p>• ペアプラス配当: $10 × 1 = $10</p>
                      <p className="text-yellow-400 font-black pt-2">合計: $10 (賭け金) + $10 (配当) = $20</p>
                      <p className="text-xs text-gray-400 pt-2">※ディーラーとの勝敗に関係なく獲得</p>
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
            {/* Q-6-4ルール */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-black text-white">Q-6-4ルール</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                    <p className="font-black text-red-400 mb-3 text-lg flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      最も重要な戦略
                    </p>
                    <p className="text-gray-300 mb-3 leading-relaxed">
                      「Q-6-4」とは、フォールドするかプレイするかの判断基準です。<span className="text-white font-black">最高位がQ、2番目が6、3番目が4</span>以上ならプレイ、それより弱ければフォールドします。
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                        <p className="text-xs font-black text-green-400 mb-2">プレイすべき</p>
                        <div className="space-y-1 text-xs text-gray-300">
                          <p>• Q-6-4 以上</p>
                          <p>• Q-7-2</p>
                          <p>• K-5-3</p>
                          <p>• A-2-3</p>
                          <p>• ペア以上の役</p>
                        </div>
                      </div>
                      <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                        <p className="text-xs font-black text-red-400 mb-2">フォールドすべき</p>
                        <div className="space-y-1 text-xs text-gray-300">
                          <p>• Q-6-3</p>
                          <p>• Q-5-4</p>
                          <p>• J-9-8</p>
                          <p>• Q-6-2</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30">
                    <p className="font-black text-yellow-400 mb-2 flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      なぜQ-6-4なのか？
                    </p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      数学的に計算すると、この基準で判断することで最も還元率が高くなります。ディーラーのノットクオリファイ率（約27.5%）を考慮した最適戦略です。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 基本戦略 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-black text-white">基本戦略</h2>
                </div>
                <div className="space-y-2">
                  {[
                    {
                      title: 'ペア以上は必ずプレイ',
                      desc: 'ペア、フラッシュ、ストレート、スリーカード、ストレートフラッシュがあれば必ず勝負します。',
                      color: 'green',
                      icon: CheckCircle2
                    },
                    {
                      title: 'Q以上があればプレイ検討',
                      desc: 'ハイカードでもQ、K、Aがあれば、ディーラーがノットクオリファイになる可能性を考えて勝負を検討します。',
                      color: 'yellow',
                      icon: Info
                    },
                    {
                      title: 'J以下のハイカードは慎重に',
                      desc: 'J-9-8などの場合、Q-6-4ルールに従ってフォールドを検討します。',
                      color: 'orange',
                      icon: AlertCircle
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

            {/* ペアプラス戦略 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-black text-white">ペアプラス完全攻略</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                    <p className="font-black text-purple-400 mb-3 text-lg">基本データ</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-black/40 rounded-lg p-3 border border-purple-500/20">
                        <p className="text-xs text-gray-400 mb-1">ペア以上出現率</p>
                        <p className="text-2xl font-black text-purple-400">25.6%</p>
                        <p className="text-xs text-gray-400 mt-1">約4回に1回</p>
                      </div>
                      <div className="bg-black/40 rounded-lg p-3 border border-red-500/20">
                        <p className="text-xs text-gray-400 mb-1">控除率</p>
                        <p className="text-2xl font-black text-red-400">7.28%</p>
                        <p className="text-xs text-gray-400 mt-1">アンティより高め</p>
                      </div>
                    </div>
                  </div>

                  {/* ベット戦略3パターン */}
                  <div className="bg-gradient-to-r from-orange-900/30 to-red-900/30 rounded-xl p-4 border border-orange-500/30">
                    <p className="font-black text-orange-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      3つの戦略パターン
                    </p>
                    
                    <div className="space-y-3">
                      {/* パターン1: 毎回ベット */}
                      <button
                        onClick={() => toggleSection('pattern1')}
                        className="w-full bg-red-900/40 rounded-lg p-3 border border-red-500/30 flex items-center justify-between hover:border-red-400 transition-all"
                      >
                        <div className="text-left">
                          <p className="text-sm font-black text-red-400">❌ パターン1: 毎回ベット</p>
                          <p className="text-xs text-gray-400">おすすめ度: ★☆☆☆☆</p>
                        </div>
                        {expandedSection === 'pattern1' ? <ChevronUp className="w-4 h-4 text-red-400" /> : <ChevronDown className="w-4 h-4 text-red-400" />}
                      </button>
                      {expandedSection === 'pattern1' && (
                        <div className="bg-red-900/20 rounded-lg p-3 border border-red-500/20 space-y-2 animate-slide-in">
                          <p className="text-xs text-gray-300 mb-2">アンティ$10 + ペアプラス$10を毎回ベット</p>
                          <div className="space-y-1 text-xs text-gray-300">
                            <p className="text-red-400 font-black">デメリット</p>
                            <p>• 控除率7.28%が毎回かかる</p>
                            <p>• 長期的に見て資金が減りやすい</p>
                            <p>• 100ゲームで約$72.8の損失期待値</p>
                          </div>
                          <div className="bg-yellow-900/30 rounded-lg p-2 border border-yellow-500/30 mt-2">
                            <p className="text-xs text-yellow-400">💡 こんな人向け: 高配当のスリルを常に楽しみたい人、資金に余裕がある人</p>
                          </div>
                        </div>
                      )}

                      {/* パターン2: タイミングベット */}
                      <button
                        onClick={() => toggleSection('pattern2')}
                        className="w-full bg-green-900/40 rounded-lg p-3 border border-green-500/30 flex items-center justify-between hover:border-green-400 transition-all"
                      >
                        <div className="text-left">
                          <p className="text-sm font-black text-green-400">✅ パターン2: タイミングベット</p>
                          <p className="text-xs text-gray-400">おすすめ度: ★★★★★</p>
                        </div>
                        {expandedSection === 'pattern2' ? <ChevronUp className="w-4 h-4 text-green-400" /> : <ChevronDown className="w-4 h-4 text-green-400" />}
                      </button>
                      {expandedSection === 'pattern2' && (
                        <div className="bg-green-900/20 rounded-lg p-3 border border-green-500/20 space-y-2 animate-slide-in">
                          <p className="text-xs text-white font-black mb-2">最もおすすめ！バランス型戦略</p>
                          <div className="space-y-2 text-xs text-gray-300">
                            <div className="bg-black/40 rounded-lg p-2 border border-green-500/20">
                              <p className="text-green-400 font-black mb-1">ベットするタイミング</p>
                              <p>• 3～4回連続でハイカードが続いた後</p>
                              <p>• 直感的に「そろそろ来そう」と感じた時</p>
                              <p>• テーブル全体でペアが出ていない時</p>
                            </div>
                            <div className="bg-black/40 rounded-lg p-2 border border-green-500/20">
                              <p className="text-green-400 font-black mb-1">ベット額の調整</p>
                              <p>• 通常: アンティ$10 + ペアプラス$5</p>
                              <p>• ここぞという時: ペアプラス$10～15</p>
                            </div>
                          </div>
                          <div className="bg-blue-900/30 rounded-lg p-2 border border-blue-500/30 mt-2">
                            <p className="text-xs text-blue-400 font-black mb-1">📊 確率的根拠</p>
                            <p className="text-xs text-gray-300">4回連続でハイカードが出る確率は約31%。つまり3～4回続いた後は、統計的にペアが出やすくなっている可能性があります。</p>
                          </div>
                        </div>
                      )}

                      {/* パターン3: 一切ベットしない */}
                      <button
                        onClick={() => toggleSection('pattern3')}
                        className="w-full bg-blue-900/40 rounded-lg p-3 border border-blue-500/30 flex items-center justify-between hover:border-blue-400 transition-all"
                      >
                        <div className="text-left">
                          <p className="text-sm font-black text-blue-400">⚖️ パターン3: 一切ベットしない</p>
                          <p className="text-xs text-gray-400">おすすめ度: ★★★☆☆</p>
                        </div>
                        {expandedSection === 'pattern3' ? <ChevronUp className="w-4 h-4 text-blue-400" /> : <ChevronDown className="w-4 h-4 text-blue-400" />}
                      </button>
                      {expandedSection === 'pattern3' && (
                        <div className="bg-blue-900/20 rounded-lg p-3 border border-blue-500/20 space-y-2 animate-slide-in">
                          <p className="text-xs text-gray-300 mb-2">アンティのみで勝負、ペアプラスには一切賭けない</p>
                          <div className="space-y-1 text-xs text-gray-300">
                            <p className="text-green-400 font-black">メリット</p>
                            <p>• 控除率が最小（約2%）</p>
                            <p>• 資金管理がしやすい</p>
                            <p>• 長期的に最も負けにくい</p>
                          </div>
                          <div className="space-y-1 text-xs text-gray-300 mt-2">
                            <p className="text-red-400 font-black">デメリット</p>
                            <p>• 高配当のチャンスを逃す</p>
                            <p>• エンターテイメント性が低い</p>
                          </div>
                          <div className="bg-purple-900/30 rounded-lg p-2 border border-purple-500/30 mt-2">
                            <p className="text-xs text-purple-400">💡 こんな人向け: 堅実派、資金を守りたい人、数学的に最適な戦略を取りたい人</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 実践的なベット例 */}
                  <div className="bg-cyan-900/30 rounded-xl p-4 border border-cyan-500/30">
                    <p className="font-black text-cyan-400 mb-3 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      実践シミュレーション
                    </p>
                    <div className="space-y-2 text-xs text-gray-300">
                      <div className="bg-black/40 rounded-lg p-2 border border-cyan-500/20">
                        <p className="text-white font-black mb-1">1回目: ♦K ♥9 ♠4（ハイカード）</p>
                        <p className="text-gray-400">→ ペアプラス賭けず、様子見</p>
                      </div>
                      <div className="bg-black/40 rounded-lg p-2 border border-cyan-500/20">
                        <p className="text-white font-black mb-1">2回目: ♣Q ♠8 ♥2（ハイカード）</p>
                        <p className="text-gray-400">→ まだ賭けない</p>
                      </div>
                      <div className="bg-black/40 rounded-lg p-2 border border-cyan-500/20">
                        <p className="text-white font-black mb-1">3回目: ♥J ♦7 ♠3（ハイカード）</p>
                        <p className="text-gray-400">→ まだ賭けない</p>
                      </div>
                      <div className="bg-black/40 rounded-lg p-2 border border-cyan-500/20">
                        <p className="text-white font-black mb-1">4回目: ♠A ♣6 ♥4（ハイカード）</p>
                        <p className="text-yellow-400 font-black">→ そろそろ来そう！アンティ$10 + ペアプラス$10</p>
                      </div>
                      <div className="bg-green-900/40 rounded-lg p-2 border border-green-500/30">
                        <p className="text-white font-black mb-1">5回目: ♥9 ♦9 ♠2（ペア！）</p>
                        <p className="text-green-400 font-black">→ ペアプラス的中！$10配当獲得 🎉</p>
                      </div>
                    </div>
                  </div>

                  {/* 資金管理のコツ */}
                  <div className="bg-orange-900/30 rounded-xl p-4 border border-orange-500/30">
                    <p className="font-black text-orange-400 mb-3">資金管理のコツ</p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>ペアプラスは総ベット額の20～30%程度に抑える</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>連続で外れたら一旦休憩（熱くならない）</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>ペアプラスで勝ったら、その分を確保する</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>エンターテイメントとして楽しむ心構え</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 還元率情報 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-black text-white">還元率・控除率</h2>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
                      <p className="text-xs text-gray-400 mb-2">アンティ+プレイ</p>
                      <p className="text-2xl font-black text-green-400 mb-1">97.99%</p>
                      <p className="text-xs text-gray-400">還元率</p>
                      <p className="text-xs text-red-400 mt-2">控除率: 2.01%</p>
                    </div>
                    <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                      <p className="text-xs text-gray-400 mb-2">ペアプラス</p>
                      <p className="text-2xl font-black text-purple-400 mb-1">92.72%</p>
                      <p className="text-xs text-gray-400">還元率</p>
                      <p className="text-xs text-red-400 mt-2">控除率: 7.28%</p>
                    </div>
                  </div>
                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                    <p className="font-black text-blue-400 mb-2">他のギャンブルとの比較</p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex justify-between">
                        <span>スリーカードポーカー</span>
                        <span className="text-green-400 font-black">2-7%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ブラックジャック</span>
                        <span className="text-gray-400">0.5-1%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ルーレット</span>
                        <span className="text-gray-400">2.7-5.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>スロット</span>
                        <span className="text-gray-400">2-15%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>宝くじ</span>
                        <span className="text-red-400">約55%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ディーラータブ */}
        {activeTab === 'dealer' && (
          <div className="space-y-4 animate-slide-in">
            {/* ディーラーの役割 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-orange-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-orange-400" />
                  <h2 className="text-xl font-black text-white">ディーラーの役割</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-orange-900/30 rounded-xl p-4 border border-orange-500/30">
                    <p className="font-black text-orange-400 mb-3">ディーラーが行うこと</p>
                    <ol className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="text-orange-400 font-black">1.</span>
                        <span>プレイヤーのベットを受け付ける</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-400 font-black">2.</span>
                        <span>各プレイヤーとディーラーに3枚ずつカードを配る（ディーラーは全て裏向き）</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-400 font-black">3.</span>
                        <span>プレイヤーのプレイorフォールドの選択を待つ</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-400 font-black">4.</span>
                        <span>自分のカードをオープン</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-400 font-black">5.</span>
                        <span>クオリファイ判定を行う</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-orange-400 font-black">6.</span>
                        <span>各プレイヤーと勝敗を判定し、配当を支払う</span>
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>

            {/* クオリファイ判定手順 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-black text-white">クオリファイ判定手順</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                    <p className="font-black text-red-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      ディーラーが必ず確認すること
                    </p>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded-lg p-3 border border-red-500/20">
                        <p className="text-xs font-black text-red-400 mb-2">STEP 1: 役の確認</p>
                        <p className="text-sm text-gray-300">ペア以上の役があるか確認。あればクオリファイ成立。</p>
                      </div>
                      <div className="bg-black/40 rounded-lg p-3 border border-red-500/20">
                        <p className="text-xs font-black text-red-400 mb-2">STEP 2: ハイカードの確認</p>
                        <p className="text-sm text-gray-300">役がない場合、最高位カードがQ以上か確認。Q以上ならクオリファイ成立。</p>
                      </div>
                      <div className="bg-black/40 rounded-lg p-3 border border-red-500/20">
                        <p className="text-xs font-black text-red-400 mb-2">STEP 3: ノットクオリファイ</p>
                        <p className="text-sm text-gray-300">J以下のハイカードなら「ノットクオリファイ」と宣言し、アンティのみ配当。</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 配当支払い手順 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-black text-white">配当支払い手順</h2>
                </div>
                <div className="space-y-3">
                  <button
                    onClick={() => toggleSection('notqualify')}
                    className="w-full bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30 flex items-center justify-between"
                  >
                    <p className="font-black text-yellow-400 flex items-center gap-2">
                      <Info className="w-5 h-5" />
                      ノットクオリファイ時の配当
                    </p>
                    {expandedSection === 'notqualify' ? <ChevronUp className="w-5 h-5 text-yellow-400" /> : <ChevronDown className="w-5 h-5 text-yellow-400" />}
                  </button>
                  {expandedSection === 'notqualify' && (
                    <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-500/20 space-y-2 animate-slide-in">
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>アンティに1:1の配当を支払う</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>プレイベットは返却（引き分け）</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>プレイヤーがストレート以上ならアンティボーナスも支払う</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => toggleSection('playerwin')}
                    className="w-full bg-green-900/30 rounded-xl p-4 border border-green-500/30 flex items-center justify-between"
                  >
                    <p className="font-black text-green-400 flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      プレイヤー勝利時の配当
                    </p>
                    {expandedSection === 'playerwin' ? <ChevronUp className="w-5 h-5 text-green-400" /> : <ChevronDown className="w-5 h-5 text-green-400" />}
                  </button>
                  {expandedSection === 'playerwin' && (
                    <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/20 space-y-2 animate-slide-in">
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>アンティに1:1の配当</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>プレイに1:1の配当</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>ストレート以上ならアンティボーナス</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => toggleSection('dealerwin')}
                    className="w-full bg-red-900/30 rounded-xl p-4 border border-red-500/30 flex items-center justify-between"
                  >
                    <p className="font-black text-red-400 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      ディーラー勝利時
                    </p>
                    {expandedSection === 'dealerwin' ? <ChevronUp className="w-5 h-5 text-red-400" /> : <ChevronDown className="w-5 h-5 text-red-400" />}
                  </button>
                  {expandedSection === 'dealerwin' && (
                    <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/20 space-y-2 animate-slide-in">
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>アンティとプレイベットを回収</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                        <span>配当は支払わない</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => toggleSection('pairplus')}
                    className="w-full bg-purple-900/30 rounded-xl p-4 border border-purple-500/30 flex items-center justify-between"
                  >
                    <p className="font-black text-purple-400 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      ペアプラスの配当
                    </p>
                    {expandedSection === 'pairplus' ? <ChevronUp className="w-5 h-5 text-purple-400" /> : <ChevronDown className="w-5 h-5 text-purple-400" />}
                  </button>
                  {expandedSection === 'pairplus' && (
                    <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20 space-y-2 animate-slide-in">
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>勝敗に関係なく、ペア以上で配当</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>役の強さに応じた倍率で支払う</span>
                      </div>
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <Sparkles className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                        <span>ハイカードのみの場合は回収</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ディーラーのマナー */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-black text-white">ディーラーのマナー</h2>
                </div>
                <div className="space-y-2">
                  {[
                    '明確な声でアクションを宣言する',
                    'カードは必ず裏向きで配る',
                    '判定は正確に、素早く行う',
                    'プレイヤーに対して丁寧に接する',
                    'ミスがあれば素直に認めて訂正する',
                    'ゲームのペースを適切に保つ'
                  ].map((manner, index) => (
                    <div key={index} className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-300">{manner}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 初心者向けチェックリスト */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-pink-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="w-6 h-6 text-pink-400" />
                  <h2 className="text-xl font-black text-white">プレイヤー向けクイックチェックリスト</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-pink-900/30 rounded-xl p-4 border border-pink-500/30">
                    <p className="font-black text-pink-400 mb-3">カジノに行く前に確認</p>
                    <div className="space-y-2">
                      {[
                        'Q-6-4ルールを覚えた',
                        'ペア以上の役を全て覚えた',
                        'ストレート＞フラッシュを理解した',
                        '予算を決めた（使っても良い金額）',
                        'ミニマムベットを確認した'
                      ].map((item, index) => (
                        <div key={index} className="bg-black/40 rounded-lg p-2 border border-pink-500/20 flex items-center gap-2">
                          <div className="w-5 h-5 rounded border-2 border-pink-500/50 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-pink-400">✓</span>
                          </div>
                          <span className="text-sm text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
                    <p className="font-black text-green-400 mb-3">テーブルで確認すること</p>
                    <div className="space-y-2">
                      {[
                        'ミニマムベット額を確認',
                        'ベットエリア（ANTE/PAIR PLUS/PLAY）の位置確認',
                        'ディーラーの顔を見て挨拶',
                        'チップの色と金額を確認',
                        '他のプレイヤーの流れを1～2ゲーム観察'
                      ].map((item, index) => (
                        <div key={index} className="bg-black/40 rounded-lg p-2 border border-green-500/20 flex items-center gap-2">
                          <div className="w-5 h-5 rounded border-2 border-green-500/50 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-green-400">✓</span>
                          </div>
                          <span className="text-sm text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                    <p className="font-black text-blue-400 mb-3">ゲーム中に思い出すこと</p>
                    <div className="space-y-2">
                      {[
                        'アンティとペアプラスは同時にベット',
                        'Q-6-4未満ならフォールド',
                        'ペア以上なら必ずプレイ',
                        '焦らず、ゆっくり判断',
                        '分からなければディーラーに聞いてOK'
                      ].map((item, index) => (
                        <div key={index} className="bg-black/40 rounded-lg p-2 border border-blue-500/20 flex items-center gap-2">
                          <div className="w-5 h-5 rounded border-2 border-blue-500/50 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-blue-400">✓</span>
                          </div>
                          <span className="text-sm text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* よくある質問 */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-yellow-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-black text-white">よくある質問 FAQ</h2>
                </div>
                <div className="space-y-2">
                  {[
                    {
                      q: 'ペアプラスに賭けずにアンティだけでもいい？',
                      a: 'もちろんOKです！ペアプラスはオプションなので、賭けなくても問題ありません。'
                    },
                    {
                      q: 'ペアプラスだけに賭けることはできる？',
                      a: 'カジノによります。多くの場所では可能ですが、アンティが必須の場合もあります。'
                    },
                    {
                      q: 'カードを見た後でペアプラスに賭けられる？',
                      a: 'できません！ペアプラスはカードが配られる前に賭ける必要があります。'
                    },
                    {
                      q: '同じテーブルの他のプレイヤーと勝負する？',
                      a: 'いいえ。全員がディーラーと1対1で勝負します。他のプレイヤーは関係ありません。'
                    },
                    {
                      q: 'ディーラーがノットクオリファイだと損する？',
                      a: 'いいえ！アンティの配当は貰えて、プレイベットは返ってくるので実質勝ちです。'
                    },
                    {
                      q: '英語が苦手でも大丈夫？',
                      a: 'チップを置くだけで意思表示できます。「Play」「Fold」の2語だけ覚えればOK！'
                    }
                  ].map((faq, index) => (
                    <button
                      key={index}
                      onClick={() => toggleSection(`faq${index}`)}
                      className="w-full text-left"
                    >
                      <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30 hover:border-yellow-400 transition-all">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className="font-black text-yellow-400 text-sm mb-2">Q. {faq.q}</p>
                            {expandedSection === `faq${index}` && (
                              <p className="text-sm text-gray-300 animate-slide-in">{faq.a}</p>
                            )}
                          </div>
                          {expandedSection === `faq${index}` ? 
                            <ChevronUp className="w-5 h-5 text-yellow-400 flex-shrink-0" /> : 
                            <ChevronDown className="w-5 h-5 text-yellow-400 flex-shrink-0" />
                          }
                        </div>
                      </div>
                    </button>
                  ))}
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