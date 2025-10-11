'use client'

import { useState } from 'react'
import { ArrowLeft, BookOpen, Info, Sparkles, Trophy, Target, TrendingUp, Zap, CheckCircle2, AlertCircle, DollarSign, Users, ChevronDown, ChevronUp, Crown, Star } from 'lucide-react'

export default function ProgressiveTexasHoldemLesson() {
  const [activeTab, setActiveTab] = useState<'basic' | 'rules' | 'hands' | 'betting' | 'strategy' | 'progressive'>('basic')
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-red-900 to-orange-900 pb-20">
      {/* ヘッダー */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-red-500/30">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-white hover:text-red-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-black">戻る</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-red-600 blur-lg animate-pulse" />
              <Crown className="relative w-6 h-6 text-red-400" />
            </div>
            <h1 className="text-xl font-black text-white">Progressive Texas Hold'em</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-4">
        {/* タブナビゲーション */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-1 border-2 border-red-500/30">
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
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/50'
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
                { id: 'progressive', label: 'JP', icon: Crown }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/50'
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
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-black text-white">プログレッシブテキサスホールデムとは</h2>
                </div>
                <div className="space-y-3 text-gray-300">
                  <p className="leading-relaxed">
                    プログレッシブテキサスホールデムは、本場のテキサスホールデムポーカーをカジノ向けにアレンジしたゲームです。ディーラーと1対1で対決し、<span className="text-white font-black">5枚のコミュニティカード</span>と<span className="text-white font-black">2枚のホールカード</span>で最強の5枚役を作ります。
                  </p>
                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                    <p className="font-black text-red-400 mb-2">特徴</p>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>ディーラーと1対1の対戦</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>7枚から最強の5枚役を作る</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>プログレッシブジャックポットで一攫千金</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>フロップ後にコール/フォールドを判断</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

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
                      自分の<span className="text-white font-black">2枚のホールカード</span>と<span className="text-white font-black">5枚のコミュニティカード</span>の合計7枚から、最強の5枚役を作ってディーラーに勝つことが目的です。
                    </p>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                        <p className="text-xs font-black text-green-400 mb-1">勝利条件</p>
                        <p className="text-xs text-gray-300">ディーラーより強い役を作る</p>
                      </div>
                      <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                        <p className="text-xs font-black text-yellow-400 mb-1">選択肢</p>
                        <p className="text-xs text-gray-300">コール or フォールド</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-black text-white">カードの構成</h2>
                </div>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
                    <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-purple-400">ホールカード</span>
                        <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">2枚</span>
                      </div>
                      <p className="text-sm text-gray-300">プレイヤーとディーラーに配られる、自分だけが見られるカード</p>
                    </div>
                    <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-black text-blue-400">コミュニティカード</span>
                        <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">5枚</span>
                      </div>
                      <p className="text-sm text-gray-300">テーブル中央に公開される、全員が使える共通カード</p>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        <div className="bg-black/40 rounded p-2 border border-blue-500/30 text-center">
                          <p className="text-xs text-blue-300 font-bold">フロップ</p>
                          <p className="text-xs text-gray-400">3枚同時</p>
                        </div>
                        <div className="bg-black/40 rounded p-2 border border-cyan-500/30 text-center">
                          <p className="text-xs text-cyan-300 font-bold">ターン</p>
                          <p className="text-xs text-gray-400">4枚目</p>
                        </div>
                        <div className="bg-black/40 rounded p-2 border border-green-500/30 text-center">
                          <p className="text-xs text-green-300 font-bold">リバー</p>
                          <p className="text-xs text-gray-400">5枚目</p>
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
            <div className="space-y-4">
                <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
                <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/30">
                    <div className="flex items-center gap-3 mb-4">
                    <Users className="w-6 h-6 text-red-400" />
                    <h2 className="text-xl font-black text-white">カジノでの実践ガイド</h2>
                    </div>
                    <div className="space-y-3">
                    <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                        <p className="font-black text-red-400 mb-3 text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        テーブルに座ってから配当を受け取るまで（13ステップ）
                        </p>
                        <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                        初めてでも安心！各ステップをクリックして詳細を確認できます。
                        </p>
                    </div>

                    {/* STEP 1 */}
                    <button
                        onClick={() => toggleSection('step1')}
                        className="w-full bg-gradient-to-r from-pink-900/40 to-rose-900/40 rounded-xl p-4 border-2 border-pink-500/50 flex items-center justify-between hover:border-pink-400 transition-all"
                    >
                        <div className="flex items-center gap-3">
                        <div className="bg-pink-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0">1</div>
                        <div className="text-left">
                            <p className="font-black text-pink-400 text-lg">テーブルに座る</p>
                            <p className="text-xs text-gray-400">Progressive Texas Hold'emテーブルを探す</p>
                        </div>
                        </div>
                        {expandedSection === 'step1' ? <ChevronUp className="w-5 h-5 text-pink-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-pink-400 flex-shrink-0" />}
                    </button>
                    {expandedSection === 'step1' && (
                        <div className="bg-pink-900/20 rounded-xl p-4 border border-pink-500/20 space-y-3">
                        <div className="space-y-2 text-sm text-gray-300">
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>「Progressive Texas Hold'em」または「Ultimate Texas Hold'em」のテーブルを探す</span>
                            </div>
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>空いている席に座る（複数人同時プレイ可能）</span>
                            </div>
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>テーブルのミニマムベット額を確認（通常$5～$25）</span>
                            </div>
                        </div>
                        <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                            <p className="text-xs font-black text-yellow-400 mb-1">💡 初心者向けTips</p>
                            <p className="text-xs text-gray-300">ミニマムベットが低いテーブルから始めましょう。$5～$10のテーブルがおすすめです。</p>
                        </div>
                        </div>
                    )}

                    {/* STEP 2 */}
                    <button
                        onClick={() => toggleSection('step2')}
                        className="w-full bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-xl p-4 border-2 border-purple-500/50 flex items-center justify-between hover:border-purple-400 transition-all"
                    >
                        <div className="flex items-center gap-3">
                        <div className="bg-purple-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0">2</div>
                        <div className="text-left">
                            <p className="font-black text-purple-400 text-lg">チップを両替</p>
                            <p className="text-xs text-gray-400">現金をカジノチップに交換</p>
                        </div>
                        </div>
                        {expandedSection === 'step2' ? <ChevronUp className="w-5 h-5 text-purple-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-purple-400 flex-shrink-0" />}
                    </button>
                    {expandedSection === 'step2' && (
                        <div className="bg-purple-900/20 rounded-xl p-4 border border-purple-500/20 space-y-3">
                        <div className="space-y-2 text-sm text-gray-300">
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>現金をテーブルの上に置く（ディーラーに直接渡さない）</span>
                            </div>
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>ディーラーが「Change（チェンジ）」と言って現金をチップに交換</span>
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
                        <div className="bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0">3</div>
                        <div className="text-left">
                            <p className="font-black text-blue-400 text-lg">ベットエリアを確認</p>
                            <p className="text-xs text-gray-400">4つのベットエリアの位置を把握</p>
                        </div>
                        </div>
                        {expandedSection === 'step3' ? <ChevronUp className="w-5 h-5 text-blue-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-blue-400 flex-shrink-0" />}
                    </button>
                    {expandedSection === 'step3' && (
                        <div className="bg-blue-900/20 rounded-xl p-4 border border-blue-500/20 space-y-3">
                        <div className="space-y-2">
                            <div className="bg-black/40 rounded-lg p-3 border border-red-500/30">
                            <p className="text-xs font-black text-red-400 mb-2 flex items-center gap-1">
                                ANTE（アンティ）<span className="text-xs px-1.5 py-0.5 rounded-full bg-red-600 text-white ml-2">必須</span>
                            </p>
                            <p className="text-xs text-gray-300">ゲーム参加料。このゲームの基本ベット。必ず賭ける必要があります。</p>
                            </div>
                            <div className="bg-black/40 rounded-lg p-3 border border-orange-500/30">
                            <p className="text-xs font-black text-orange-400 mb-2 flex items-center gap-1">
                                BLIND（ブラインド）<span className="text-xs px-1.5 py-0.5 rounded-full bg-red-600 text-white ml-2">必須</span>
                            </p>
                            <p className="text-xs text-gray-300">アンティと同額を必ずベット。ストレート以上で配当が出る特別ベット。</p>
                            </div>
                            <div className="bg-black/40 rounded-lg p-3 border border-purple-500/30">
                            <p className="text-xs font-black text-purple-400 mb-2 flex items-center gap-1">
                                TRIPS（トリップス）<span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-600 text-white ml-2">選択</span>
                            </p>
                            <p className="text-xs text-gray-300">オプション。スリーカード以上で配当。勝敗に関係なく支払われる。</p>
                            </div>
                            <div className="bg-black/40 rounded-lg p-3 border border-yellow-500/30">
                            <p className="text-xs font-black text-yellow-400 mb-2 flex items-center gap-1">
                                PROGRESSIVE（プログレッシブ）<span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-600 text-white ml-2">選択</span>
                            </p>
                            <p className="text-xs text-gray-300">$1固定。フルハウス以上でジャックポット配当。ロイヤルフラッシュで大当たり！</p>
                            </div>
                            <div className="bg-black/40 rounded-lg p-3 border border-green-500/30">
                            <p className="text-xs font-black text-green-400 mb-2">PLAY（プレイ）</p>
                            <p className="text-xs text-gray-300">後で使用。カードを見た後、勝負を続ける時にベットするエリア。</p>
                            </div>
                        </div>
                        </div>
                    )}

                    {/* STEP 4 */}
                    <button
                        onClick={() => toggleSection('step4')}
                        className="w-full bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-xl p-4 border-2 border-yellow-500/50 flex items-center justify-between hover:border-yellow-400 transition-all"
                    >
                        <div className="flex items-center gap-3">
                        <div className="bg-yellow-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0">4</div>
                        <div className="text-left">
                            <p className="font-black text-yellow-400 text-lg">最初のベット 🔥</p>
                            <p className="text-xs text-gray-400">カード配布前のベット</p>
                        </div>
                        </div>
                        {expandedSection === 'step4' ? <ChevronUp className="w-5 h-5 text-yellow-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-yellow-400 flex-shrink-0" />}
                    </button>
                    {expandedSection === 'step4' && (
                        <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-500/20 space-y-3">
                        <div className="bg-orange-900/40 rounded-lg p-3 border border-orange-500/30 mb-3">
                            <p className="text-sm font-black text-orange-400 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            超重要！ベットのタイミング
                            </p>
                            <p className="text-sm text-white font-black leading-relaxed">
                            カードが配られる前に、ANTEとBLINDに同額をベットします！
                            </p>
                        </div>
                        <div className="space-y-2 text-sm text-gray-300">
                            <p className="font-black text-white mb-2">✅ 正しいベット手順</p>
                            <div className="space-y-2">
                            <div className="flex items-start gap-2">
                                <span className="text-yellow-400 font-black">1.</span>
                                <span>「ANTE」エリアにチップを置く（例：$10）</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-yellow-400 font-black">2.</span>
                                <span className="text-white font-black">「BLIND」エリアにも同額を置く（$10）</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-yellow-400 font-black">3.</span>
                                <span>「PROGRESSIVE」に$1をベット（推奨）</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="text-yellow-400 font-black">4.</span>
                                <span>「TRIPS」に好きな額をベット（オプション）</span>
                            </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-3">
                            <div className="bg-green-900/30 rounded-lg p-2 border border-green-500/30">
                            <p className="text-xs font-black text-green-400 mb-1">👍 推奨例</p>
                            <p className="text-xs text-gray-300">ANTE$10 + BLIND$10 + PROG$1</p>
                            </div>
                            <div className="bg-blue-900/30 rounded-lg p-2 border border-blue-500/30">
                            <p className="text-xs font-black text-blue-400 mb-1">📊 フル</p>
                            <p className="text-xs text-gray-300">上記 + TRIPS$5</p>
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
                        <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0">5</div>
                        <div className="text-left">
                            <p className="font-black text-green-400 text-lg">ホールカード配布</p>
                            <p className="text-xs text-gray-400">自分だけが見られる2枚のカード</p>
                        </div>
                        </div>
                        {expandedSection === 'step5' ? <ChevronUp className="w-5 h-5 text-green-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-green-400 flex-shrink-0" />}
                    </button>
                    {expandedSection === 'step5' && (
                        <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/20 space-y-3">
                        <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30 mb-3">
                            <p className="text-sm font-black text-purple-400 mb-2">📖 用語解説：ホールカード</p>
                            <p className="text-sm text-gray-300">
                            「ホールカード」とは、各プレイヤーに配られる<span className="text-white font-black">自分だけが見られる2枚の裏向きカード</span>です。他のプレイヤーやディーラーには見えません。
                            </p>
                        </div>
                        <div className="space-y-2 text-sm text-gray-300">
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>ディーラーが各プレイヤーに2枚ずつカードを配る（裏向き）</span>
                            </div>
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>ディーラーにも2枚配られるが、全て裏向き</span>
                            </div>
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>自分のカードを確認する（周りに見えないように）</span>
                            </div>
                        </div>
                        <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                            <p className="text-xs font-black text-yellow-400 mb-2">💡 カードの見方</p>
                            <p className="text-xs text-gray-300">カードを手で覆いながら、端を少し持ち上げて確認します。他のプレイヤーに見られないよう注意！</p>
                        </div>
                        </div>
                    )}

                    {/* STEP 6 */}
                    <button
                        onClick={() => toggleSection('step6')}
                        className="w-full bg-gradient-to-r from-red-900/40 to-pink-900/40 rounded-xl p-4 border-2 border-red-500/50 flex items-center justify-between hover:border-red-400 transition-all"
                    >
                        <div className="flex items-center gap-3">
                        <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0">6</div>
                        <div className="text-left">
                            <p className="font-black text-red-400 text-lg">プリフロップの判断</p>
                            <p className="text-xs text-gray-400">3x/4xレイズ or チェック</p>
                        </div>
                        </div>
                        {expandedSection === 'step6' ? <ChevronUp className="w-5 h-5 text-red-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-red-400 flex-shrink-0" />}
                    </button>
                    {expandedSection === 'step6' && (
                        <div className="bg-red-900/20 rounded-xl p-4 border border-red-500/20 space-y-3">
                        <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30 mb-3">
                            <p className="text-sm font-black text-purple-400 mb-2">📖 用語解説</p>
                            <div className="space-y-2 text-xs text-gray-300">
                            <p><span className="text-white font-black">プリフロップ：</span>フロップ（最初の3枚の共通カード）が出る前の段階</p>
                            <p><span className="text-white font-black">レイズ：</span>プレイエリアにベットして勝負を続けること</p>
                            <p><span className="text-white font-black">チェック：</span>この段階ではベットせず、次のカードを待つこと</p>
                            </div>
                        </div>
                        <div className="bg-orange-900/40 rounded-lg p-3 border border-orange-500/30 mb-3">
                            <p className="text-sm font-black text-orange-400 mb-2">選択肢</p>
                            <div className="space-y-2">
                            <div className="bg-green-900/30 rounded-lg p-2 border border-green-500/30">
                                <p className="text-xs font-black text-green-400 mb-1">✅ 3xまたは4xレイズ</p>
                                <p className="text-xs text-gray-300">プレイエリアにアンティの3倍または4倍をベット（選択可）</p>
                                <p className="text-xs text-white font-black mt-1">例：アンティ$10 → プレイ$30または$40</p>
                            </div>
                            <div className="bg-blue-900/30 rounded-lg p-2 border border-blue-500/30">
                                <p className="text-xs font-black text-blue-400 mb-1">⏸️ チェック</p>
                                <p className="text-xs text-gray-300">ベットせずに次のカード（フロップ）を待つ</p>
                            </div>
                            </div>
                        </div>
                        <div className="bg-cyan-900/30 rounded-lg p-3 border border-cyan-500/30">
                            <p className="text-xs font-black text-cyan-400 mb-2">💡 判断基準</p>
                            <div className="space-y-1 text-xs text-gray-300">
                            <p className="text-white font-black">4xレイズすべき手：</p>
                            <p>• AA, KK, QQ, JJ（プレミアムペア）</p>
                            <p>• AK, AQ（強いエース）</p>
                            <p className="text-white font-black mt-2">3xレイズすべき手：</p>
                            <p>• TT, 99, 88（中程度のペア）</p>
                            <p>• AJ, AT（やや強いエース）</p>
                            <p className="text-white font-black mt-2">チェックすべき手：</p>
                            <p>• それ以外の手札</p>
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
                        <div className="bg-cyan-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0">7</div>
                        <div className="text-left">
                            <p className="font-black text-cyan-400 text-lg">フロップ公開</p>
                            <p className="text-xs text-gray-400">3枚のコミュニティカードが登場</p>
                        </div>
                        </div>
                        {expandedSection === 'step7' ? <ChevronUp className="w-5 h-5 text-cyan-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-cyan-400 flex-shrink-0" />}
                    </button>
                    {expandedSection === 'step7' && (
                        <div className="bg-cyan-900/20 rounded-xl p-4 border border-cyan-500/20 space-y-3">
                        <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30 mb-3">
                            <p className="text-sm font-black text-purple-400 mb-2">📖 用語解説：フロップ</p>
                            <p className="text-sm text-gray-300">
                            「フロップ」とは、テーブル中央に公開される<span className="text-white font-black">最初の3枚のコミュニティカード</span>です。全員が使える共通カードで、自分のホールカードと組み合わせて役を作ります。
                            </p>
                        </div>
                        <div className="space-y-2 text-sm text-gray-300">
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>ディーラーがテーブル中央に3枚のカードを表向きに並べる</span>
                            </div>
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>このカードは全員が見ることができ、全員が使える</span>
                            </div>
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>自分の2枚 + フロップ3枚 = 合計5枚で役を考える</span>
                            </div>
                        </div>
                        <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                            <p className="text-xs font-black text-blue-400 mb-2">💡 この時点での状況</p>
                            <p className="text-xs text-gray-300">まだ2枚（ターンとリバー）のカードが残っています。この5枚を見て、次のアクションを決めます。</p>
                        </div>
                        </div>
                    )}

                    {/* STEP 8 */}
                    <button
                        onClick={() => toggleSection('step8')}
                        className="w-full bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl p-4 border-2 border-indigo-500/50 flex items-center justify-between hover:border-indigo-400 transition-all"
                    >
                        <div className="flex items-center gap-3">
                        <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0">8</div>
                        <div className="text-left">
                            <p className="font-black text-indigo-400 text-lg">フロップ後の判断 🔥</p>
                            <p className="text-xs text-gray-400">2xレイズ or チェック</p>
                        </div>
                        </div>
                        {expandedSection === 'step8' ? <ChevronUp className="w-5 h-5 text-indigo-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-indigo-400 flex-shrink-0" />}
                    </button>
                    {expandedSection === 'step8' && (
                        <div className="bg-indigo-900/20 rounded-xl p-4 border border-indigo-500/20 space-y-3">
                        <div className="bg-orange-900/40 rounded-lg p-3 border border-orange-500/30 mb-3">
                            <p className="text-sm font-black text-orange-400 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            重要！この判断は「プリフロップでチェックした人のみ」
                            </p>
                            <p className="text-sm text-white font-black">
                            プリフロップで既にレイズした人は、ここでは何もできません！
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="bg-green-900/30 rounded-lg p-2 border border-green-500/30">
                            <p className="text-xs font-black text-green-400 mb-1">✅ 2xレイズ</p>
                            <p className="text-xs text-gray-300 mb-1">プレイエリアにアンティの2倍をベット</p>
                            <p className="text-xs text-white font-black">例：アンティ$10 → プレイ$20</p>
                            </div>
                            <div className="bg-blue-900/30 rounded-lg p-2 border border-blue-500/30">
                            <p className="text-xs font-black text-blue-400 mb-1">⏸️ チェック</p>
                            <p className="text-xs text-gray-300">ベットせずに次のカード（ターン・リバー）を待つ</p>
                            </div>
                        </div>
                        <div className="bg-cyan-900/30 rounded-lg p-3 border border-cyan-500/30">
                            <p className="text-xs font-black text-cyan-400 mb-2">💡 判断基準</p>
                            <div className="space-y-1 text-xs text-gray-300">
                            <p className="text-white font-black">2xレイズすべき状況：</p>
                            <p>• ツーペア以上ができた</p>
                            <p>• ヒドゥンペア（手札でペア）がある</p>
                            <p>• フラッシュドロー + 10以上</p>
                            <p className="text-white font-black mt-2">チェックすべき状況：</p>
                            <p>• それ以外の手札</p>
                            </div>
                        </div>
                        </div>
                    )}

                    {/* STEP 9 */}
                    <button
                        onClick={() => toggleSection('step9')}
                        className="w-full bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-xl p-4 border-2 border-green-500/50 flex items-center justify-between hover:border-green-400 transition-all"
                    >
                        <div className="flex items-center gap-3">
                        <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0">9</div>
                        <div className="text-left">
                            <p className="font-black text-green-400 text-lg">ターン公開</p>
                            <p className="text-xs text-gray-400">4枚目のコミュニティカード</p>
                        </div>
                        </div>
                        {expandedSection === 'step9' ? <ChevronUp className="w-5 h-5 text-green-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-green-400 flex-shrink-0" />}
                    </button>
                    {expandedSection === 'step9' && (
                        <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/20 space-y-3">
                        <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30 mb-3">
                            <p className="text-sm font-black text-purple-400 mb-2">📖 用語解説：ターン</p>
                            <p className="text-sm text-gray-300">
                            「ターン」とは、フロップの後に公開される<span className="text-white font-black">4枚目のコミュニティカード</span>です。「4th Street（フォースストリート）」とも呼ばれます。
                            </p>
                        </div>
                        <div className="space-y-2 text-sm text-gray-300">
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>ディーラーが4枚目のカードを公開</span>
                            </div>
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>自分の2枚 + コミュニティ4枚 = 合計6枚</span>
                            </div>
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>あと1枚（リバー）が残っている</span>
                            </div>
                        </div>
                        <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                            <p className="text-xs font-black text-blue-400 mb-2">💡 この段階での状況</p>
                            <p className="text-xs text-gray-300">ターンが出た時点では、追加のアクションはありません。すぐにリバーが公開されます。</p>
                        </div>
                        </div>
                    )}

                    {/* STEP 10 */}
                    <button
                        onClick={() => toggleSection('step10')}
                        className="w-full bg-gradient-to-r from-teal-900/40 to-cyan-900/40 rounded-xl p-4 border-2 border-teal-500/50 flex items-center justify-between hover:border-teal-400 transition-all"
                    >
                        <div className="flex items-center gap-3">
                        <div className="bg-teal-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0">10</div>
                        <div className="text-left">
                            <p className="font-black text-teal-400 text-lg">リバー公開</p>
                            <p className="text-xs text-gray-400">5枚目（最後）のコミュニティカード</p>
                        </div>
                        </div>
                        {expandedSection === 'step10' ? <ChevronUp className="w-5 h-5 text-teal-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-teal-400 flex-shrink-0" />}
                    </button>
                    {expandedSection === 'step10' && (
                        <div className="bg-teal-900/20 rounded-xl p-4 border border-teal-500/20 space-y-3">
                        <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30 mb-3">
                            <p className="text-sm font-black text-purple-400 mb-2">📖 用語解説：リバー</p>
                            <p className="text-sm text-gray-300">
                            「リバー」とは、ターンの後に公開される<span className="text-white font-black">5枚目（最後）のコミュニティカード</span>です。「5th Street（フィフスストリート）」とも呼ばれます。これで全てのカードが出揃います。
                            </p>
                        </div>
                        <div className="space-y-2 text-sm text-gray-300">
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>ディーラーが5枚目（最後）のカードを公開</span>
                            </div>
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>自分の2枚 + コミュニティ5枚 = 合計7枚</span>
                            </div>
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>この7枚から最強の5枚役を作る</span>
                            </div>
                        </div>
                        <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                            <p className="text-xs font-black text-yellow-400 mb-2">💡 最終カード！</p>
                            <p className="text-xs text-gray-300">これ以上カードは出ません。次は最終判断のターンです。</p>
                        </div>
                        </div>
                    )}

                    {/* STEP 11 */}
                    <button
                        onClick={() => toggleSection('step11')}
                        className="w-full bg-gradient-to-r from-orange-900/40 to-red-900/40 rounded-xl p-4 border-2 border-orange-500/50 flex items-center justify-between hover:border-orange-400 transition-all"
                    >
                        <div className="flex items-center gap-3">
                        <div className="bg-orange-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0">11</div>
                        <div className="text-left">
                            <p className="font-black text-orange-400 text-lg">最終判断 🔥</p>
                            <p className="text-xs text-gray-400">1xコール or フォールド</p>
                        </div>
                        </div>
                        {expandedSection === 'step11' ? <ChevronUp className="w-5 h-5 text-orange-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-orange-400 flex-shrink-0" />}
                    </button>
                    {expandedSection === 'step11' && (
                        <div className="bg-orange-900/20 rounded-xl p-4 border border-orange-500/20 space-y-3">
                        <div className="bg-red-900/40 rounded-lg p-3 border border-red-500/30 mb-3">
                            <p className="text-sm font-black text-red-400 mb-2 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" />
                            最重要！これまで一度もレイズしていない人のみ
                            </p>
                            <p className="text-sm text-white font-black">
                            プリフロップかフロップで既にレイズした人は、ここでは何もできません！
                            </p>
                        </div>
                        <div className="space-y-2">
                            <div className="bg-green-900/30 rounded-lg p-2 border border-green-500/30">
                            <p className="text-xs font-black text-green-400 mb-1">✅ 1xコール</p>
                            <p className="text-xs text-gray-300 mb-1">プレイエリアにアンティと同額をベット</p>
                            <p className="text-xs text-white font-black">例：アンティ$10 → プレイ$10</p>
                            </div>
                            <div className="bg-red-900/30 rounded-lg p-2 border border-red-500/30">
                            <p className="text-xs font-black text-red-400 mb-1">❌ フォールド</p>
                            <p className="text-xs text-gray-300">勝負を降りる。アンティとブラインドは没収。</p>
                            </div>
                        </div>
                        <div className="bg-cyan-900/30 rounded-lg p-3 border border-cyan-500/30">
                            <p className="text-xs font-black text-cyan-400 mb-2">💡 判断基準</p>
                            <div className="space-y-1 text-xs text-gray-300">
                            <p className="text-white font-black">1xコールすべき状況：</p>
                            <p>• ヒドゥンペア以上の役がある</p>
                            <p className="text-white font-black mt-2">フォールドすべき状況：</p>
                            <p>• ノーペア（ハイカードのみ）</p>
                            </div>
                        </div>
                        <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                            <p className="text-xs font-black text-yellow-400 mb-2">📖 用語解説</p>
                            <p className="text-xs text-gray-300"><span className="text-white font-black">ヒドゥンペア：</span>自分の手札2枚でペアができていること。例：手札が♥K♦K</p>
                        </div>
                        </div>
                    )}

                    {/* STEP 12 */}
                    <button
                        onClick={() => toggleSection('step12')}
                        className="w-full bg-gradient-to-r from-yellow-600/40 to-orange-600/40 rounded-xl p-4 border-2 border-yellow-500/50 flex items-center justify-between hover:border-yellow-400 transition-all"
                    >
                        <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0">12</div>
                        <div className="text-left">
                            <p className="font-black text-yellow-400 text-lg">ショーダウン</p>
                            <p className="text-xs text-gray-400">ディーラーのカードオープン・勝敗判定</p>
                        </div>
                        </div>
                        {expandedSection === 'step12' ? <ChevronUp className="w-5 h-5 text-yellow-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-yellow-400 flex-shrink-0" />}
                    </button>
                    {expandedSection === 'step12' && (
                        <div className="bg-yellow-900/20 rounded-xl p-4 border border-yellow-500/20 space-y-3">
                        <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30 mb-3">
                            <p className="text-sm font-black text-purple-400 mb-2">📖 用語解説：ショーダウン</p>
                            <p className="text-sm text-gray-300">
                            「ショーダウン」とは、全てのベットが終わった後、お互いの手札を公開して勝敗を決める最終段階です。
                            </p>
                        </div>
                        <div className="space-y-2 text-sm text-gray-300">
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>ディーラーが自分の2枚のホールカードをオープン</span>
                            </div>
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>ディーラーの7枚から最強の5枚役を作る</span>
                            </div>
                            <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>プレイヤーの役と比較して勝敗を判定</span>
                            </div>
                        </div>
                        <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                            <p className="text-xs font-black text-red-400 mb-2">📋 ディーラークオリファイ</p>
                            <p className="text-xs text-gray-300 mb-2">ディーラーは<span className="text-white font-black">ペア以上</span>の役が必要です（クオリファイ）</p>
                            <p className="text-xs text-white font-black">ノーペアの場合：</p>
                            <p className="text-xs text-gray-300">アンティに1:1配当 + プレイは返却</p>
                        </div>
                        </div>
                    )}

                    {/* STEP 13 */}
                    <button
                        onClick={() => toggleSection('step13')}
                        className="w-full bg-gradient-to-r from-green-600/40 to-emerald-600/40 rounded-xl p-4 border-2 border-green-500/50 flex items-center justify-between hover:border-green-400 transition-all"
                    >
                        <div className="flex items-center gap-3">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xl flex-shrink-0">13</div>
                        <div className="text-left">
                            <p className="font-black text-green-400 text-lg">配当を受け取る 💰</p>
                            <p className="text-xs text-gray-400">勝敗に応じた配当</p>
                        </div>
                        </div>
                        {expandedSection === 'step13' ? <ChevronUp className="w-5 h-5 text-green-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-green-400 flex-shrink-0" />}
                    </button>
                    {expandedSection === 'step13' && (
                        <div className="bg-green-900/20 rounded-xl p-4 border border-green-500/20 space-y-3">
                        <div className="space-y-2">
                            <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                            <p className="text-sm font-black text-green-400 mb-2">🎉 勝利した場合</p>
                            <div className="space-y-1 text-xs text-gray-300">
                                <p>• アンティ: 1:1配当</p>
                                <p>• プレイ: 1:1配当</p>
                                <p>• ブラインド: ストレート以上で配当</p>
                                <p>• トリップス: スリーカード以上で配当</p>
                                <p>• プログレッシブ: フルハウス以上で配当</p>
                            </div>
                            </div>
                            <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30">
                            <p className="text-sm font-black text-yellow-400 mb-2">⚖️ ノットクオリファイの場合</p>
                            <div className="space-y-1 text-xs text-gray-300">
                                <p>• アンティ: 1:1配当</p>
                                <p>• プレイ: 返却（引き分け）</p>
                                <p>• ブラインド: ストレート以上で配当</p>
                            </div>
                            </div>
                            <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                            <p className="text-sm font-black text-red-400 mb-2">😢 負けた場合</p>
                            <div className="space-y-1 text-xs text-gray-300">
                                <p>• アンティ、プレイ、ブラインドは没収</p>
                                <p>• トリップス: スリーカード以上なら配当</p>
                                <p>• プログレッシブ: フルハウス以上なら配当</p>
                            </div>
                            </div>
                        </div>
                        <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/30">
                            <p className="text-xs font-black text-purple-400 mb-2">💡 ポイント</p>
                            <p className="text-xs text-gray-300">トリップスとプログレッシブは勝敗に関係なく、役ができれば配当がもらえます！</p>
                        </div>
                        </div>
                    )}
                    </div>
                </div>
                </div>

                {/* ディーラークオリファイ */}
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
                        ディーラーは<span className="text-white font-black">「ペア以上の役」</span>がない場合、強制的にフォールド（ノットクオリファイ）となります。
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                        <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                            <p className="text-xs font-black text-green-400 mb-2">クオリファイ成立</p>
                            <p className="text-xs text-gray-300">ペア以上の役</p>
                        </div>
                        <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                            <p className="text-xs font-black text-red-400 mb-2">ノットクオリファイ</p>
                            <p className="text-xs text-gray-300">ハイカードのみ</p>
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
                        </ul>
                    </div>
                    </div>
                </div>
                </div>
            </div>
            )}

        {/* 役タブ */}
        {activeTab === 'hands' && (
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-yellow-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-black text-white">ポーカーの役 完全ガイド</h2>
                </div>
                <div className="space-y-2">
                  {[
                    { rank: 1, name: 'ロイヤルフラッシュ', eng: 'Royal Flush', desc: '同じスートのA-K-Q-J-10', example: '♠A ♠K ♠Q ♠J ♠10', prob: '0.00015%', gradient: 'from-yellow-600 to-orange-600' },
                    { rank: 2, name: 'ストレートフラッシュ', eng: 'Straight Flush', desc: '同じスートで連続した5枚', example: '♥9 ♥8 ♥7 ♥6 ♥5', prob: '0.00139%', gradient: 'from-red-600 to-pink-600' },
                    { rank: 3, name: 'フォーカード', eng: 'Four of a Kind', desc: '同じ数字4枚', example: '♣K ♥K ♦K ♠K ♣8', prob: '0.024%', gradient: 'from-purple-600 to-pink-600' },
                    { rank: 4, name: 'フルハウス', eng: 'Full House', desc: 'スリーカード+ペア', example: '♠J ♥J ♦J ♣9 ♠9', prob: '0.144%', gradient: 'from-blue-600 to-cyan-600' },
                    { rank: 5, name: 'フラッシュ', eng: 'Flush', desc: '同じスート5枚', example: '♦K ♦10 ♦7 ♦6 ♦4', prob: '0.197%', gradient: 'from-green-600 to-emerald-600' },
                    { rank: 6, name: 'ストレート', eng: 'Straight', desc: '連続した5枚', example: '♠9 ♥8 ♦7 ♣6 ♠5', prob: '0.392%', gradient: 'from-cyan-600 to-blue-600' },
                    { rank: 7, name: 'スリーカード', eng: 'Three of a Kind', desc: '同じ数字3枚', example: '♥7 ♦7 ♠7 ♣K ♠2', prob: '2.11%', gradient: 'from-indigo-600 to-purple-600' },
                    { rank: 8, name: 'ツーペア', eng: 'Two Pair', desc: 'ペアが2組', example: '♣J ♠J ♥8 ♦8 ♠K', prob: '4.75%', gradient: 'from-pink-600 to-rose-600' },
                    { rank: 9, name: 'ワンペア', eng: 'One Pair', desc: '同じ数字2枚', example: '♠Q ♥Q ♦9 ♣7 ♠4', prob: '42.26%', gradient: 'from-orange-600 to-yellow-600' },
                    { rank: 10, name: 'ハイカード', eng: 'High Card', desc: '役なし', example: '♦A ♠K ♣9 ♥6 ♠3', prob: '50.12%', gradient: 'from-gray-600 to-gray-700' }
                  ].map((hand) => (
                    <div key={hand.rank} className="relative group/hand">
                      <div className={`absolute inset-0 bg-gradient-to-r ${hand.gradient} rounded-xl blur-md opacity-30`} />
                      <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20">
                        <div className="flex items-start gap-3">
                          <div className={`bg-gradient-to-r ${hand.gradient} text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-lg flex-shrink-0`}>
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
                              <p className="text-white font-black font-mono text-sm">{hand.example}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ベットタブ */}
        {activeTab === 'betting' && (
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <DollarSign className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-black text-white">ベット構造の全体像</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-red-400 text-lg">アンティ（ANTE）</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-red-600 text-white font-bold">必須</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">ゲーム参加料。ブラインドと同額を必ずベット。</p>
                    <div className="bg-black/40 rounded p-2">
                      <p className="text-xs text-gray-400">ベット例</p>
                      <p className="text-sm text-white font-black">$10ベット例</p>
                    </div>
                  </div>

                  <div className="bg-orange-900/30 rounded-xl p-4 border border-orange-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-orange-400 text-lg">ブラインド（BLIND）</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-red-600 text-white font-bold">必須</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">アンティと同額の必須ベット。ストレート以上で配当。</p>
                    <div className="bg-black/40 rounded p-2">
                      <p className="text-xs text-gray-400">ベット例</p>
                      <p className="text-sm text-white font-black">$10ベット例</p>
                    </div>
                  </div>

                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-blue-400 text-lg">プレイ（PLAY）</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white font-bold">選択</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">プリフロップ：3-4x / フロップ：2x / リバー：1x</p>
                    <div className="bg-black/40 rounded p-2">
                      <p className="text-xs text-gray-400">ベット例</p>
                      <p className="text-sm text-white font-black">$40（4x）～$10（1x）</p>
                    </div>
                  </div>

                  <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-purple-400 text-lg">トリップス（TRIPS）</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white font-bold">オプション</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">スリーカード以上で配当。ディーラーの手に関係なく支払い。</p>
                    <div className="bg-black/40 rounded p-2">
                      <p className="text-xs text-gray-400">ベット例</p>
                      <p className="text-sm text-white font-black">$5～$100</p>
                    </div>
                  </div>

                  <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-yellow-400 text-lg">プログレッシブ</span>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-600 text-white font-bold">オプション</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">$1固定。フルハウス以上でジャックポット配当。</p>
                    <div className="bg-black/40 rounded p-2">
                      <p className="text-xs text-gray-400">ベット例</p>
                      <p className="text-sm text-white font-black">$1固定</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ブラインド配当表 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-6 h-6 text-blue-400" />
                  <h2 className="text-xl font-black text-white">ブラインドベット配当表</h2>
                </div>
                <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30 mb-3">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <span className="text-white font-black">ストレート以上</span>でディーラーに勝った場合のみ配当。ストレート未満で勝った場合はプッシュ（返金）。
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    { hand: 'ロイヤルフラッシュ', payout: '500:1', bg: 'bg-yellow-900/30', border: 'border-yellow-500/30', text: 'text-yellow-400' },
                    { hand: 'ストレートフラッシュ', payout: '50:1', bg: 'bg-red-900/30', border: 'border-red-500/30', text: 'text-red-400' },
                    { hand: 'フォーカード', payout: '10:1', bg: 'bg-purple-900/30', border: 'border-purple-500/30', text: 'text-purple-400' },
                    { hand: 'フルハウス', payout: '3:1', bg: 'bg-blue-900/30', border: 'border-blue-500/30', text: 'text-blue-400' },
                    { hand: 'フラッシュ', payout: '3:2', bg: 'bg-green-900/30', border: 'border-green-500/30', text: 'text-green-400' },
                    { hand: 'ストレート', payout: '1:1', bg: 'bg-cyan-900/30', border: 'border-cyan-500/30', text: 'text-cyan-400' },
                    { hand: 'ストレート未満', payout: 'プッシュ', bg: 'bg-gray-900/30', border: 'border-gray-500/30', text: 'text-gray-400' }
                  ].map((item, idx) => (
                    <div key={idx} className={`${item.bg} rounded-lg p-3 border ${item.border} flex items-center justify-between`}>
                      <span className="font-black text-white">{item.hand}</span>
                      <span className={`text-lg font-black ${item.text}`}>{item.payout}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* トリップス配当表 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-black text-white">トリップス（ボーナス）配当表</h2>
                </div>
                <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-500/30 mb-3">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <span className="text-white font-black">スリーカード以上</span>の役ができたら配当。ディーラーの手や勝敗に関係なく支払われる。
                  </p>
                </div>
                <div className="space-y-2">
                  {[
                    { hand: 'ロイヤルフラッシュ', payout: '50:1', bg: 'bg-yellow-900/30', border: 'border-yellow-500/30', text: 'text-yellow-400' },
                    { hand: 'ストレートフラッシュ', payout: '40:1', bg: 'bg-red-900/30', border: 'border-red-500/30', text: 'text-red-400' },
                    { hand: 'フォーカード', payout: '30:1', bg: 'bg-purple-900/30', border: 'border-purple-500/30', text: 'text-purple-400' },
                    { hand: 'フルハウス', payout: '8:1', bg: 'bg-blue-900/30', border: 'border-blue-500/30', text: 'text-blue-400' },
                    { hand: 'フラッシュ', payout: '7:1', bg: 'bg-green-900/30', border: 'border-green-500/30', text: 'text-green-400' },
                    { hand: 'ストレート', payout: '4:1', bg: 'bg-cyan-900/30', border: 'border-cyan-500/30', text: 'text-cyan-400' },
                    { hand: 'スリーカード', payout: '3:1', bg: 'bg-indigo-900/30', border: 'border-indigo-500/30', text: 'text-indigo-400' }
                  ].map((item, idx) => (
                    <div key={idx} className={`${item.bg} rounded-lg p-3 border ${item.border} flex items-center justify-between`}>
                      <span className="font-black text-white">{item.hand}</span>
                      <span className={`text-lg font-black ${item.text}`}>{item.payout}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 攻略タブ */}
        {activeTab === 'strategy' && (
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-cyan-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="w-6 h-6 text-cyan-400" />
                  <h2 className="text-xl font-black text-white">基本戦略の考え方</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-cyan-900/30 rounded-xl p-4 border border-cyan-500/30">
                    <p className="text-gray-300 leading-relaxed mb-3">
                      Progressive Texas Hold'emの戦略は<span className="text-white font-black">「いつ・いくらベットするか」</span>の判断が全て。早めに大きくベットするほど配当が大きくなるが、リスクも高くなる。
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30 text-center">
                        <p className="text-xs font-black text-green-400 mb-1">プリフロップ</p>
                        <p className="text-lg font-black text-white">3-4x</p>
                        <p className="text-xs text-gray-400">最大ベット</p>
                      </div>
                      <div className="bg-yellow-900/30 rounded-lg p-3 border border-yellow-500/30 text-center">
                        <p className="text-xs font-black text-yellow-400 mb-1">フロップ</p>
                        <p className="text-lg font-black text-white">2x</p>
                        <p className="text-xs text-gray-400">中程度</p>
                      </div>
                      <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30 text-center">
                        <p className="text-xs font-black text-red-400 mb-1">リバー</p>
                        <p className="text-lg font-black text-white">1x</p>
                        <p className="text-xs text-gray-400">最小ベット</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* プリフロップ戦略 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-black text-white">プリフロップ戦略（4xレイズ）</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
                    <p className="font-black text-green-400 mb-3 text-lg">最強の手で即4xレイズ！</p>
                    <p className="text-sm text-gray-300 mb-3">
                      プリフロップで4xレイズすべき手：
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-black/40 rounded p-3">
                        <p className="text-xs font-black text-yellow-400 mb-2">プレミアムペア</p>
                        <p className="text-sm text-white font-mono">AA, KK, QQ, JJ</p>
                      </div>
                      <div className="bg-black/40 rounded p-3">
                        <p className="text-xs font-black text-yellow-400 mb-2">強いエース</p>
                        <p className="text-sm text-white font-mono">AK, AQ</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30">
                    <p className="font-black text-yellow-400 mb-2">3xレイズ（やや弱い手）</p>
                    <p className="text-sm text-gray-300 mb-2">
                      TT, 99, 88, AJ, AT など
                    </p>
                    <p className="text-xs text-gray-400">
                      💡 3xと4xの違いはリスク管理。確信度で使い分け。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* フロップ戦略 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-yellow-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-yellow-400" />
                  <h2 className="text-xl font-black text-white">フロップ戦略（2xレイズ）</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
                    <p className="font-black text-green-400 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      2xレイズすべき状況
                    </p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-start gap-2">
                        <span className="text-green-400">✓</span>
                        <span><span className="text-white font-black">ツーペア以上</span>の役ができた</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400">✓</span>
                        <span><span className="text-white font-black">ヒドゥンペア</span>（ホールカードでペア）</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-green-400">✓</span>
                        <span><span className="text-white font-black">フラッシュドロー</span> + 10以上</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* リバー戦略 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                  <h2 className="text-xl font-black text-white">リバー戦略（最終判断）</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
                    <p className="font-black text-green-400 mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5" />
                      1xレイズすべき状況
                    </p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-start gap-2">
                        <span className="text-green-400">✓</span>
                        <span><span className="text-white font-black">ヒドゥンペア以上</span>の役がある</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                    <p className="font-black text-red-400 mb-3 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      フォールドすべき状況
                    </p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-start gap-2">
                        <span className="text-red-400">✗</span>
                        <span><span className="text-white font-black">ノーペア</span>（ハイカードのみ）</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* プログレッシブタブ */}
        {activeTab === 'progressive' && (
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 rounded-2xl blur-xl opacity-60 animate-pulse" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-yellow-500/50">
                <div className="flex items-center gap-3 mb-4">
                  <Crown className="w-7 h-7 text-yellow-400" />
                  <h2 className="text-2xl font-black text-white">プログレッシブジャックポットとは</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-yellow-900/40 rounded-xl p-4 border border-yellow-500/40">
                    <p className="text-gray-300 leading-relaxed mb-3">
                      プログレッシブジャックポットは、<span className="text-white font-black">$1の固定ベット</span>で参加できる特別なサイドベット。<span className="text-yellow-400 font-black">フルハウス以上</span>の役で配当があり、<span className="text-yellow-400 font-black">ロイヤルフラッシュ</span>なら累積されたジャックポットの<span className="text-white font-black">100%</span>を獲得！
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/30">
                        <p className="text-xs font-black text-green-400 mb-1">ベット額</p>
                        <p className="text-2xl font-black text-white">$1</p>
                        <p className="text-xs text-gray-400">固定</p>
                      </div>
                      <div className="bg-red-900/30 rounded-lg p-3 border border-red-500/30">
                        <p className="text-xs font-black text-red-400 mb-1">最低配当</p>
                        <p className="text-2xl font-black text-white">$50</p>
                        <p className="text-xs text-gray-400">フルハウス</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* プログレッシブ配当表 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Trophy className="w-6 h-6 text-purple-400" />
                  <h2 className="text-xl font-black text-white">プログレッシブ配当表</h2>
                </div>
                <div className="space-y-2">
                  {[
                    { hand: 'ロイヤルフラッシュ', payout: '100% JP', envy: '+$100', bg: 'bg-yellow-900/40', border: 'border-yellow-500/40', text: 'text-yellow-400' },
                    { hand: 'コミュニティロイヤル', payout: '$1,000', envy: '-', bg: 'bg-cyan-900/30', border: 'border-cyan-500/30', text: 'text-cyan-400' },
                    { hand: 'ストレートフラッシュ', payout: '$300-350', envy: '-', bg: 'bg-red-900/30', border: 'border-red-500/30', text: 'text-red-400' },
                    { hand: 'フォーカード', payout: '$200', envy: '-', bg: 'bg-purple-900/30', border: 'border-purple-500/30', text: 'text-purple-400' },
                    { hand: 'フルハウス', payout: '$50', envy: '-', bg: 'bg-blue-900/30', border: 'border-blue-500/30', text: 'text-blue-400' }
                  ].map((item, idx) => (
                    <div key={idx} className={`${item.bg} rounded-xl p-4 border ${item.border} flex items-center justify-between`}>
                      <div className="flex-1">
                        <p className="font-black text-white text-lg mb-1">{item.hand}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-2xl font-black ${item.text}`}>{item.payout}</p>
                        {item.envy !== '-' && (
                          <p className="text-xs text-green-400 font-bold mt-1">エンビー{item.envy}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* エンビーボーナスの仕組み */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="w-6 h-6 text-green-400" />
                  <h2 className="text-xl font-black text-white">エンビーボーナスとは</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-red-900/40 rounded-xl p-4 border-2 border-red-500/40">
                    <p className="text-sm font-black text-red-400 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      最重要：エンビーの受け取り条件
                    </p>
                    <p className="text-sm text-white font-black leading-relaxed mb-3">
                      エンビーボーナスを受け取るには、自分もプログレッシブ$1をベットしている必要があります！
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-green-900/30 rounded-lg p-2 border border-green-500/30">
                        <p className="text-xs font-black text-green-400 mb-1">✅ もらえる</p>
                        <p className="text-xs text-gray-300">自分がプログレッシブ$1をベット</p>
                      </div>
                      <div className="bg-red-900/30 rounded-lg p-2 border border-red-500/30">
                        <p className="text-xs font-black text-red-400 mb-1">❌ もらえない</p>
                        <p className="text-xs text-gray-300">プログレッシブにベットしていない</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-900/30 rounded-xl p-4 border border-green-500/30">
                    <p className="text-gray-300 leading-relaxed mb-3">
                      <span className="text-white font-black">エンビーボーナス</span>は、同じテーブルの<span className="text-yellow-400 font-black">他のプレイヤー</span>がロイヤルフラッシュを出した時に、プログレッシブベットをしていた全員がもらえる<span className="text-green-400 font-black">$100のボーナス</span>です。
                    </p>
                    <div className="bg-black/40 rounded-lg p-3">
                      <p className="text-xs font-black text-green-400 mb-2">シミュレーション</p>
                      <div className="space-y-1 text-xs text-gray-300">
                        <p>• テーブルに6人のプレイヤー</p>
                        <p>• 全員がプログレッシブ$1ベット済み</p>
                        <p>• プレイヤーAがロイヤルフラッシュ達成！</p>
                        <p className="text-yellow-400 font-black mt-2 pt-2 border-t border-green-500/30">配当の内訳：</p>
                        <p className="text-white font-black">→ プレイヤーA：$100,000（JP 100%）</p>
                        <p className="text-green-400 font-black">→ プレイヤーB, C, D, E, F：各$100（エンビー）</p>
                        <p className="text-xs text-gray-400 mt-2">※自分が何もしなくても、$1ベットしていれば他人の幸運で$100もらえる！</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30">
                    <p className="font-black text-yellow-400 mb-2 flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      エンビーボーナスの魅力
                    </p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>$1ベットで$100のチャンス（100倍）</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>自分の手札に関係なくもらえる</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>テーブルメイトが多いほどチャンス増</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>フォールドしていてももらえる</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900/30 rounded-xl p-4 border border-blue-500/30">
                    <p className="font-black text-blue-400 mb-2">💡 実践的な確率</p>
                    <div className="space-y-2 text-xs text-gray-300">
                      <p>• 1人がロイヤルフラッシュを引く確率：約1/649,740（0.00015%）</p>
                      <p>• 6人テーブルなら、誰かが引く確率は約6倍に</p>
                      <p>• 100ゲームプレイすれば、テーブル全体で約0.09%の確率</p>
                      <p className="text-white font-black mt-2">→ 非常に稀だが、$1で夢が買える！</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ジャックポットの仕組み */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-orange-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="w-6 h-6 text-orange-400" />
                  <h2 className="text-xl font-black text-white">ジャックポットはどう増える？</h2>
                </div>
                <div className="space-y-3">
                  <div className="bg-orange-900/30 rounded-xl p-4 border border-orange-500/30">
                    <p className="font-black text-orange-400 mb-3 text-lg">累積の仕組み</p>
                    <p className="text-sm text-gray-300 leading-relaxed mb-3">
                      プレイヤーがプログレッシブに$1ベットするたびに、その一部（約70-80%）がジャックポットに蓄積されていきます。
                    </p>
                  </div>

                  <div className="bg-red-900/30 rounded-xl p-4 border border-red-500/30">
                    <p className="font-black text-red-400 mb-3 text-lg">払い出しとリセット</p>
                    <div className="space-y-2 text-sm text-gray-300">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>ロイヤルフラッシュが出たら<span className="text-white font-black">100%全額払い出し</span></span>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span>払い出し後、ジャックポットはシード額からリスタート</span>
                      </div>
                    </div>
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
      `}</style>
    </div>
  )
}