'use client'
import React, { useState } from 'react';
import { Spade, Zap, TrendingUp, AlertCircle, Info, ChevronDown, ChevronUp, Target, Award, Star, DollarSign, Lightbulb, Eye, Split, BookOpen, Users, CheckCircle2, Crown, ArrowLeft } from 'lucide-react';

const BlackjackLesson = () => {
  const [activeTab, setActiveTab] = useState('basic');
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        
        {/* ヘッダー */}
        <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl blur-xl opacity-60" />
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-2xl p-6 border-2 border-amber-500/30 shadow-2xl">
                {/* 戻るボタン */}
                <button
                onClick={() => window.history.back()}
                className="absolute top-4 left-4 bg-slate-700/80 hover:bg-slate-600/80 p-2 rounded-lg transition-all flex items-center gap-1 border border-amber-500/30 hover:border-amber-400/50"
                >
                <ArrowLeft className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold text-amber-300">戻る</span>
                </button>
                
                <div className="flex items-center gap-3 mt-8">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl shadow-lg">
                    <Spade className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-red-300">
                    ブラックジャック完全攻略
                    </h1>
                    <p className="text-gray-300 text-xs mt-1">カジノの王道！21を目指す究極の頭脳戦</p>
                </div>
                </div>
            </div>
            </div>

        {/* タブナビゲーション */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-1 border-2 border-amber-500/30">
            <div className="grid grid-cols-3 gap-1">
              {[
                { id: 'basic', label: '基本', icon: Info },
                { id: 'howto', label: '遊び方', icon: BookOpen },
                { id: 'actions', label: 'アクション', icon: Zap }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/50'
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
                { id: 'strategy', label: '戦略', icon: Target },
                { id: 'variants', label: '特殊ルール', icon: Star },
                { id: 'sidebets', label: 'サイド', icon: DollarSign }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2.5 px-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/50'
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

        {/* 基本タブ */}
        {activeTab === 'basic' && (
          <div className="space-y-4 animate-slide-in">
            {/* ゲーム概要 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-blue-500/30">
                <h2 className="text-lg font-black mb-3 flex items-center gap-2 text-white">
                  <Target className="w-5 h-5 text-blue-400" />
                  ブラックジャックとは？
                </h2>
                <div className="space-y-3">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    <span className="font-bold text-blue-300">ブラックジャック</span>は、カジノゲームの中で最も人気が高く、プレイヤーの判断が勝敗を大きく左右する戦略性の高いカードゲームです。
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-green-500/20 rounded-lg p-2 border border-green-500/30 text-center">
                      <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
                      <p className="text-xs font-bold text-white">高還元率</p>
                      <p className="text-xs text-gray-300">99%以上</p>
                    </div>
                    <div className="bg-purple-500/20 rounded-lg p-2 border border-purple-500/30 text-center">
                      <Lightbulb className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                      <p className="text-xs font-bold text-white">戦略性</p>
                      <p className="text-xs text-gray-300">判断力重要</p>
                    </div>
                    <div className="bg-orange-500/20 rounded-lg p-2 border border-orange-500/30 text-center">
                      <Zap className="w-4 h-4 text-orange-400 mx-auto mb-1" />
                      <p className="text-xs font-bold text-white">スピード</p>
                      <p className="text-xs text-gray-300">約1分/回</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 基本ルール */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-red-500/30">
                <h2 className="text-lg font-black mb-3 flex items-center gap-2 text-white">
                  <Award className="w-5 h-5 text-red-400" />
                  基本ルール
                </h2>
                
                <div className="space-y-3">
                  <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                    <h3 className="text-sm font-black text-white mb-2">🎯 ゲームの目的</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      カードの合計値を<span className="font-bold text-red-300">21に近づける</span>ことが目標。ただし<span className="font-bold text-red-300">21を超える（バースト）と即負け</span>！
                    </p>
                  </div>

                  <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
                    <h3 className="text-sm font-black text-white mb-2">🃏 カードの数え方</h3>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-black/40 rounded p-2 border border-purple-500/30 text-center">
                        <p className="text-lg font-bold text-purple-300">2〜10</p>
                        <p className="text-xs text-gray-400">数字通り</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-pink-500/30 text-center">
                        <p className="text-lg font-bold text-pink-300">J・Q・K</p>
                        <p className="text-xs text-gray-400">全て10点</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-amber-500/30 text-center col-span-2">
                        <p className="text-lg font-bold text-amber-300">A（エース）</p>
                        <p className="text-xs text-gray-400">1点 or 11点（有利な方を選択）</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
                    <h3 className="text-sm font-black text-white mb-2 flex items-center gap-1">
                      <Crown className="w-4 h-4 text-amber-400" />
                      ブラックジャック = 最強の役
                    </h3>
                    <p className="text-xs text-gray-300 leading-relaxed mb-2">
                      最初の2枚で<span className="font-bold text-amber-300">「A + 10点札」</span>が揃うと<span className="font-bold text-amber-300 text-sm">配当1.5倍（3 to 2）</span>！
                    </p>
                    <div className="bg-black/40 rounded p-2 border border-amber-500/50">
                      <p className="text-xs text-amber-300 font-bold">例：$100ベット→$250獲得</p>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                    <h3 className="text-sm font-black text-white mb-2">🎮 ゲームの流れ</h3>
                    <div className="space-y-1 text-xs text-gray-300">
                      <p>1. ベット → 2. カード配布 → 3. アクション選択</p>
                      <p>4. ディーラーのアクション → 5. 勝敗決定</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* その他の特殊ルール */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-indigo-500/30">
                <h2 className="text-lg font-black mb-3 flex items-center gap-2 text-white">
                  <Star className="w-5 h-5 text-indigo-400" />
                  その他の特殊ルール
                </h2>
                
                <div className="space-y-3">
                  {/* スパニッシュ21 */}
                  <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/30">
                    <h3 className="text-sm font-black text-orange-300 mb-2">🇪🇸 スパニッシュ21</h3>
                    <p className="text-xs text-gray-300 mb-2">デッキから<span className="font-bold text-orange-300">全ての10カード（10のみ）を除いた48枚</span>で行う特殊ルール。</p>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded p-2 border border-green-500/30">
                        <p className="text-green-400 font-bold text-xs mb-1">プレイヤー有利ルール</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          • プレイヤー21 vs ディーラー21 → プレイヤー勝利<br />
                          • 5枚で21：3:2配当、6枚で21：2:1配当<br />
                          • 6-7-8の21：3:2配当、7-7-7の21：3:1配当<br />
                          • スプリット後もダブルダウン可能
                        </p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-yellow-500/30">
                        <p className="text-yellow-400 font-bold text-xs mb-1">⚠️ 10カード除外の影響</p>
                        <p className="text-xs text-gray-400">10が無いため、BJや20を作りにくい。ボーナスルールで補填されているが、初心者には難易度高め</p>
                      </div>
                    </div>
                  </div>

                  {/* ポントゥーン */}
                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                    <h3 className="text-sm font-black text-blue-300 mb-2">🇬🇧 ポントゥーン</h3>
                    <p className="text-xs text-gray-300 mb-2">イギリス版ブラックジャック。<span className="font-bold text-blue-300">ディーラーのカードが両方とも伏せられている</span>独特のルール。</p>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded p-2 border border-blue-500/30">
                        <p className="text-blue-400 font-bold text-xs mb-1">特徴的なルール</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          • ディーラーのカードは2枚とも裏向き<br />
                          • BJ（ポントゥーン）の配当は2:1<br />
                          • 5枚で21以下（ファイブカードトリック）：2:1配当<br />
                          • 15以上でないとスタンド不可<br />
                          • 引き分けはディーラー勝利
                        </p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-red-500/30">
                        <p className="text-red-400 font-bold text-xs mb-1">⚠️ カジノ有利</p>
                        <p className="text-xs text-gray-400">情報が少なく、引き分けでも負け。還元率は通常より低め</p>
                      </div>
                    </div>
                  </div>

                  {/* ダブルエクスポージャー */}
                  <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
                    <h3 className="text-sm font-black text-purple-300 mb-2">👀 ダブルエクスポージャー</h3>
                    <p className="text-xs text-gray-300 mb-2"><span className="font-bold text-purple-300">ディーラーのカードが2枚とも表向き</span>。完全な情報でプレイできる。</p>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded p-2 border border-green-500/30">
                        <p className="text-green-400 font-bold text-xs mb-1">プレイヤー有利</p>
                        <p className="text-xs text-gray-400">ディーラーの手札が完全に見えるため、最適な判断が可能</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-red-500/30">
                        <p className="text-red-400 font-bold text-xs mb-1">カジノ側有利ルール</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          • BJの配当は1:1（1.5倍ではない）<br />
                          • 引き分けはディーラー勝利（BJを除く）<br />
                          • インシュアランス不可
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* プログレッシブ */}
                  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
                    <h3 className="text-sm font-black text-amber-300 mb-2">💎 プログレッシブブラックジャック</h3>
                    <p className="text-xs text-gray-300 mb-2">連続してAが出る度に<span className="font-bold text-amber-300">ジャックポット</span>が当たる。最大で数千万円規模！</p>
                    <div className="bg-black/40 rounded p-2 border border-amber-500/40">
                      <p className="text-amber-400 font-bold text-xs mb-1">ジャックポット配当（例）</p>
                      <p className="text-xs text-gray-400 leading-relaxed">
                        • A1枚：5倍程度<br />
                        • A2枚連続：25倍程度<br />
                        • A3枚連続：100倍程度<br />
                        • A4枚連続（全て同じマーク）：<span className="font-bold text-amber-300">ジャックポット全額！</span>
                      </p>
                    </div>
                  </div>

                  {/* ダブルアタック */}
                  <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                    <h3 className="text-sm font-black text-red-300 mb-2">⚔️ ダブルアタックブラックジャック</h3>
                    <p className="text-xs text-gray-300 mb-2">スペイン製デッキ（10カード除外）使用。<span className="font-bold text-red-300">ディーラーの1枚目を見てからベット額を増やせる</span>革新的ルール。</p>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded p-2 border border-green-500/30">
                        <p className="text-green-400 font-bold text-xs mb-1">プレイヤー有利ルール</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          • ディーラーの1枚目確認後、ベットを2倍まで増額可能<br />
                          • レイトサレンダー可能<br />
                          • ダブルダウン後のサレンダー可能
                        </p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-red-500/30">
                        <p className="text-red-400 font-bold text-xs mb-1">デメリット</p>
                        <p className="text-xs text-gray-400">10カード除外、BJは1:1配当、バストボーナスというサイドベットが半強制的</p>
                      </div>
                    </div>
                  </div>

                  {/* スーパーファン21 */}
                  <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                    <h3 className="text-sm font-black text-green-300 mb-2">🎊 スーパーファン21</h3>
                    <p className="text-xs text-gray-300 mb-2">プレイヤー超有利ルール満載！ただし<span className="font-bold text-green-300">BJは1:1配当でダイヤのBJのみ2:1</span>。</p>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded p-2 border border-green-500/30">
                        <p className="text-green-400 font-bold text-xs mb-1">超有利ルール</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          • いつでもダブルダウン可能<br />
                          • スプリット後もダブル・サレンダー可能<br />
                          • 6枚で21以下なら自動勝利<br />
                          • プレイヤー21はディーラーBJ以外に勝利<br />
                          • 5枚以上で21なら2:1配当
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ライトニング */}
                  <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/30">
                    <h3 className="text-sm font-black text-yellow-300 mb-2">⚡ ライトニングブラックジャック</h3>
                    <p className="text-xs text-gray-300 mb-2">Evolution Gaming社開発。毎ラウンド<span className="font-bold text-yellow-300">ランダムでマルチプライヤー（2〜25倍）</span>が発生！</p>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded p-2 border border-yellow-500/30">
                        <p className="text-yellow-400 font-bold text-xs mb-1">特徴</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          • 手札合計値にマルチプライヤーが適用される<br />
                          • 最大25倍の配当！<br />
                          • ただし通常勝利時は手数料あり（RTP調整済み）
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* インフィニット */}
                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                    <h3 className="text-sm font-black text-blue-300 mb-2">♾️ インフィニットブラックジャック</h3>
                    <p className="text-xs text-gray-300 mb-2">Evolution Gaming社開発。<span className="font-bold text-blue-300">無制限のプレイヤーが同時プレイ可能</span>。全員が同じハンドを共有。</p>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded p-2 border border-blue-500/30">
                        <p className="text-blue-400 font-bold text-xs mb-1">特徴</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          • 席が埋まる心配なし<br />
                          • 各プレイヤーが個別にアクション選択<br />
                          • 4つのサイドベット（21+3、ホット3等）<br />
                          • オートスプリット機能あり
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* パワーブラックジャック */}
                  <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
                    <h3 className="text-sm font-black text-purple-300 mb-2">💪 パワーブラックジャック</h3>
                    <p className="text-xs text-gray-300 mb-2">Evolution Gaming開発。<span className="font-bold text-purple-300">9・10・Jのカード4枚ずつ除外、トリプル・クアドラプルダウン可能</span>。</p>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded p-2 border border-green-500/30">
                        <p className="text-green-400 font-bold text-xs mb-1">ユニーク機能</p>
                        <p className="text-xs text-gray-400 leading-relaxed">
                          • ダブルダウンを最大4回まで可能（2倍→4倍→8倍→16倍）<br />
                          • ハード15・16・17でもダブル可能<br />
                          • プッシュ時、次ラウンドでチップ倍増オプション
                        </p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-red-500/30">
                        <p className="text-red-400 font-bold text-xs mb-1">デメリット</p>
                        <p className="text-xs text-gray-400">BJは1:1配当、9・10・Jが減っているため20を作りにくい</p>
                      </div>
                    </div>
                  </div>

                  {/* その他クイック紹介 */}
                  <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/30">
                    <h3 className="text-sm font-black text-cyan-300 mb-2">✨ その他のバリエーション</h3>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded p-2 border border-cyan-500/30">
                        <p className="text-cyan-400 font-bold text-xs mb-1">パーフェクトペアブラックジャック</p>
                        <p className="text-xs text-gray-400">通常BJ + パーフェクトペアサイドベット特化型</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-pink-500/30">
                        <p className="text-pink-400 font-bold text-xs mb-1">ラッキー7ブラックジャック</p>
                        <p className="text-xs text-gray-400">最初の7で配当。3枚とも7（同マーク）で最大配当。サイドベット特化型</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-orange-500/30">
                        <p className="text-orange-400 font-bold text-xs mb-1">ラッキーラッキーブラックジャック</p>
                        <p className="text-xs text-gray-400">最初2枚の合計が19・20・21で高配当。特に同マークなら超高配当</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-blue-500/30">
                        <p className="text-blue-400 font-bold text-xs mb-1">ブラックジャックエクスチェンジ</p>
                        <p className="text-xs text-gray-400">プレイヤー同士でカードを交換可能。新感覚の対人要素</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-green-500/30">
                        <p className="text-green-400 font-bold text-xs mb-1">マルチハンドブラックジャック</p>
                        <p className="text-xs text-gray-400">1人で最大5ハンド同時プレイ。効率重視のプレイヤー向け</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-purple-500/30">
                        <p className="text-purple-400 font-bold text-xs mb-1">ブラックジャックサレンダー</p>
                        <p className="text-xs text-gray-400">レイトサレンダー（カード確認後に降参）可能。ベット半額返却</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-lg p-3 border border-red-500/30">
                    <p className="text-red-400 font-bold text-xs mb-2">⚠️ 重要な注意事項</p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      特殊ルールのブラックジャックは、カジノやソフトウェアプロバイダーによって細かいルール・配当が異なります。プレイ前に必ずヘルプページや配当表を確認してください。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 遊び方タブ */}
        {activeTab === 'howto' && (
          <div className="space-y-4 animate-slide-in">
            {/* カジノでの実践ガイド */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-pink-500/30">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-5 h-5 text-pink-400" />
                  <h2 className="text-lg font-black text-white">カジノでの実践ガイド</h2>
                </div>
                <div className="space-y-2">
                  <div className="bg-pink-900/30 rounded-lg p-3 border border-pink-500/30">
                    <p className="font-black text-pink-400 mb-2 text-sm">
                      テーブルに座ってから配当を受け取るまで
                    </p>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      初めてでも安心！以下の流れに沿って進めれば大丈夫です。
                    </p>
                  </div>

                  {/* ステップ1-3 */}
                  {[
                    {
                      step: 1,
                      title: 'テーブルに座る',
                      id: 'step1',
                      content: (
                        <div className="space-y-2 text-xs text-gray-300">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>ブラックジャックテーブルを探す</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>ミニマムベット額を確認（通常$5〜$25）</span>
                          </div>
                          <div className="bg-yellow-900/30 rounded p-2 border border-yellow-500/30 mt-2">
                            <p className="text-yellow-400 font-bold text-xs">💡 初心者向けTips</p>
                            <p className="text-xs text-gray-300">$5〜$10のテーブルがおすすめ</p>
                          </div>
                        </div>
                      )
                    },
                    {
                      step: 2,
                      title: 'チップを両替',
                      id: 'step2',
                      content: (
                        <div className="space-y-2 text-xs text-gray-300">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>現金をテーブルの上に置く</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>ディーラーがチップに交換</span>
                          </div>
                          <div className="bg-blue-900/30 rounded p-2 border border-blue-500/30 mt-2">
                            <p className="text-blue-400 font-bold text-xs">💡 重要なマナー</p>
                            <p className="text-xs text-gray-300">ディーラーに直接手渡ししない</p>
                          </div>
                        </div>
                      )
                    },
                    {
                      step: 3,
                      title: 'ベットする',
                      id: 'step3',
                      content: (
                        <div className="space-y-2 text-xs text-gray-300">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>ベットエリアにチップを置く</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3 h-3 text-green-400 mt-0.5 flex-shrink-0" />
                            <span>ミニマム〜マキシマムの範囲内で</span>
                          </div>
                          <div className="bg-green-900/30 rounded p-2 border border-green-500/30 mt-2">
                            <p className="text-green-400 font-bold text-xs">👍 おすすめ</p>
                            <p className="text-xs text-gray-300">最初は最小ベットで練習</p>
                          </div>
                        </div>
                      )
                    }
                  ].map((item) => (
                    <React.Fragment key={item.id}>
                      <button
                        onClick={() => toggleSection(item.id)}
                        className="w-full bg-gradient-to-r from-pink-900/40 to-rose-900/40 rounded-lg p-3 border-2 border-pink-500/50 flex items-center justify-between hover:border-pink-400 transition-all"
                      >
                        <div className="flex items-center gap-2">
                          <div className="bg-pink-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-black text-sm">
                            {item.step}
                          </div>
                          <div className="text-left">
                            <p className="font-black text-pink-400 text-sm">{item.title}</p>
                          </div>
                        </div>
                        {expandedSection === item.id ? 
                          <ChevronUp className="w-4 h-4 text-pink-400" /> : 
                          <ChevronDown className="w-4 h-4 text-pink-400" />
                        }
                      </button>
                      {expandedSection === item.id && (
                        <div className="bg-pink-900/20 rounded-lg p-3 border border-pink-500/20 animate-slide-in">
                          {item.content}
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* 続きのステップ */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-cyan-500/30">
                <h2 className="text-lg font-black mb-3 flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  ゲームの流れ
                </h2>
                <div className="space-y-2">
                  {[
                    { step: 4, title: 'カード配布', desc: 'プレイヤーに2枚表向き、ディーラーに1枚表・1枚裏', bgColor: 'bg-cyan-900/30', borderColor: 'border-cyan-500/30', buttonBg: 'bg-cyan-600', textColor: 'text-cyan-400' },
                    { step: 5, title: 'プレイヤーのアクション', desc: 'ヒット・スタンド・ダブル・スプリット等を選択', bgColor: 'bg-blue-900/30', borderColor: 'border-blue-500/30', buttonBg: 'bg-blue-600', textColor: 'text-blue-400' },
                    { step: 6, title: 'ディーラーのアクション', desc: 'ディーラーは17以上まで自動的にヒット', bgColor: 'bg-green-900/30', borderColor: 'border-green-500/30', buttonBg: 'bg-green-600', textColor: 'text-green-400' },
                    { step: 7, title: '勝敗決定', desc: 'バーストせず21に近い方が勝利', bgColor: 'bg-yellow-900/30', borderColor: 'border-yellow-500/30', buttonBg: 'bg-yellow-600', textColor: 'text-yellow-400' }
                  ].map((item) => (
                    <div key={item.step} className={`${item.bgColor} rounded-lg p-3 border ${item.borderColor}`}>
                      <div className="flex items-start gap-2">
                        <div className={`${item.buttonBg} text-white w-6 h-6 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0`}>
                          {item.step}
                        </div>
                        <div className="flex-1">
                          <p className={`font-black ${item.textColor} text-sm`}>{item.title}</p>
                          <p className="text-xs text-gray-300">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* アクションタブ */}
        {activeTab === 'actions' && (
          <div className="space-y-4 animate-slide-in">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-green-500/30">
                <h2 className="text-lg font-black mb-3 flex items-center gap-2 text-white">
                  <Zap className="w-5 h-5 text-green-400" />
                  プレイヤーのアクション
                </h2>
                
                <div className="space-y-3">
                  {/* ヒット */}
                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-blue-500 text-white font-black text-xs rounded px-3 py-1">HIT</div>
                      <h3 className="text-sm font-black text-blue-300">ヒット（追加）</h3>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">カードを1枚追加。バーストするまで何度でも可能。</p>
                    <div className="bg-black/40 rounded p-2 border border-blue-500/30">
                      <p className="text-xs text-blue-300 font-bold">📍 使うタイミング</p>
                      <p className="text-xs text-gray-400">手札が11以下、または合計値が低い時</p>
                    </div>
                  </div>

                  {/* スタンド */}
                  <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-green-500 text-white font-black text-xs rounded px-3 py-1">STAND</div>
                      <h3 className="text-sm font-black text-green-300">スタンド（勝負）</h3>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">現在の手札で勝負。追加カードは引かない。</p>
                    <div className="bg-black/40 rounded p-2 border border-green-500/30">
                      <p className="text-xs text-green-300 font-bold">📍 使うタイミング</p>
                      <p className="text-xs text-gray-400">手札が17以上、または合計値が十分高い時</p>
                    </div>
                  </div>

                  {/* ダブルダウン */}
                  <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white font-black text-xs rounded px-3 py-1">DOUBLE</div>
                      <h3 className="text-sm font-black text-purple-300">ダブルダウン</h3>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">ベット額を2倍にして、カードを<span className="font-bold text-purple-300">1枚だけ</span>追加。</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-black/40 rounded p-2 border border-purple-500/30">
                        <p className="text-xs text-purple-300 font-bold">📍 使う時</p>
                        <p className="text-xs text-gray-400">手札9・10・11</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-amber-500/30">
                        <p className="text-xs text-amber-300 font-bold">⚠️ 注意</p>
                        <p className="text-xs text-gray-400">1枚のみ</p>
                      </div>
                    </div>
                  </div>

                  {/* スプリット */}
                  <div className="bg-orange-500/10 rounded-lg p-3 border border-orange-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-xs rounded px-3 py-1 flex items-center gap-1">
                        <Split className="w-3 h-3" />
                        SPLIT
                      </div>
                      <h3 className="text-sm font-black text-orange-300">スプリット（分割）</h3>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">同じ数字のペアを2つのハンドに分割。追加ベットして2手でプレイ。</p>
                    <div className="bg-black/40 rounded p-2 border border-orange-500/30">
                      <p className="text-xs text-orange-300 font-bold mb-1">📍 スプリットすべき</p>
                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                        <p>✓ <span className="text-green-400 font-bold">A・A</span>：必須！</p>
                        <p>✓ <span className="text-green-400 font-bold">8・8</span>：必須！</p>
                        <p>✗ <span className="text-red-400 font-bold">10・10</span>：×</p>
                        <p>✗ <span className="text-red-400 font-bold">5・5</span>：×</p>
                      </div>
                    </div>
                  </div>

                  {/* インシュアランス */}
                  <div className="bg-cyan-500/10 rounded-lg p-3 border border-cyan-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="bg-cyan-600 text-white font-black text-xs rounded px-3 py-1">INSURANCE</div>
                      <h3 className="text-sm font-black text-cyan-300">インシュアランス</h3>
                    </div>
                    <p className="text-xs text-gray-300 mb-2">ディーラーの表向きカードがAの時のみ選択可能。</p>
                    <div className="bg-black/40 rounded p-2 border border-red-500/30">
                      <p className="text-xs text-red-300 font-bold">⚠️ 基本的に非推奨</p>
                      <p className="text-xs text-gray-400">長期的にはプレイヤーが不利な賭け</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 戦略タブ */}
        {activeTab === 'strategy' && (
          <div className="space-y-4 animate-slide-in">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-amber-500/30">
                <h2 className="text-lg font-black mb-3 flex items-center gap-2 text-white">
                  <Eye className="w-5 h-5 text-amber-400" />
                  ベーシックストラテジー
                </h2>
                
                <div className="space-y-3">
                  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
                    <h3 className="text-sm font-black text-white mb-2">🎯 とは？</h3>
                    <p className="text-xs text-gray-300 leading-relaxed mb-2">
                      確率論に基づき、<span className="font-bold text-amber-300">全ての組み合わせで最も期待値が高いアクション</span>をまとめた戦略表。
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-black/40 rounded p-2 border border-green-500/20 text-center">
                        <p className="text-lg font-black text-green-400">99%+</p>
                        <p className="text-xs text-gray-400">還元率</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-blue-500/20 text-center">
                        <p className="text-lg font-black text-blue-400">270通り</p>
                        <p className="text-xs text-gray-400">組み合わせ</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-purple-500/20 text-center">
                        <p className="text-lg font-black text-purple-400">数学的</p>
                        <p className="text-xs text-gray-400">確率判断</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                    <h3 className="text-sm font-black text-white mb-2">💡 覚えやすい基本パターン</h3>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded p-2 border border-green-500/30">
                        <p className="text-green-400 font-bold text-xs mb-1">✓ 手札17以上 → 常にスタンド</p>
                        <p className="text-xs text-gray-400">バーストリスクが高いため引かない</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-blue-500/30">
                        <p className="text-blue-400 font-bold text-xs mb-1">✓ 手札11以下 → 常にヒット</p>
                        <p className="text-xs text-gray-400">絶対にバーストしないので必ず引く</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-purple-500/30">
                        <p className="text-purple-400 font-bold text-xs mb-1">✓ 手札10・11 → ダブル推奨</p>
                        <p className="text-xs text-gray-400">10点札で20・21のチャンス</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-orange-500/30">
                        <p className="text-orange-400 font-bold text-xs mb-1">✓ A・A / 8・8 → 常にスプリット</p>
                        <p className="text-xs text-gray-400">最も有利なスプリット</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                    <h3 className="text-sm font-black text-blue-300 mb-2">📊 還元率比較</h3>
                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between bg-black/40 rounded p-2 border border-green-500/30">
                        <span className="text-green-400 font-bold">ブラックジャック（BS使用）</span>
                        <span className="text-green-300 font-black">99%+</span>
                      </div>
                      <div className="flex justify-between bg-black/40 rounded p-2 border border-blue-500/30">
                        <span className="text-blue-400 font-bold">バカラ（バンカー）</span>
                        <span className="text-blue-300 font-black">98.94%</span>
                      </div>
                      <div className="flex justify-between bg-black/40 rounded p-2 border border-gray-500/30">
                        <span className="text-gray-400 font-bold">スロット</span>
                        <span className="text-gray-300 font-black">95-97%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 特殊ルールタブ */}
        {activeTab === 'variants' && (
          <div className="space-y-4 animate-slide-in">
            {/* フリーベット */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-emerald-500/30">
                <h2 className="text-lg font-black mb-3 flex items-center gap-2 text-white">
                  <DollarSign className="w-5 h-5 text-emerald-400" />
                  フリーベットブラックジャック
                </h2>
                
                <div className="space-y-3">
                  <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30">
                    <h3 className="text-sm font-black text-white mb-2">✨ 最大の特徴</h3>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      <span className="font-bold text-emerald-300">追加チップなしでダブル・スプリット</span>ができる！
                    </p>
                  </div>

                  <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                    <h3 className="text-sm font-black text-white mb-2">✨ 有利なルール詳細</h3>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded p-2 border border-green-500/30">
                        <p className="text-green-400 font-bold text-xs mb-1">フリーダブルダウン</p>
                        <p className="text-xs text-gray-300 leading-relaxed mb-1">
                          手札が<span className="font-bold text-green-300">9・10・11</span>の時、追加ベット不要でダブルダウン可能！
                        </p>
                        <div className="bg-black/40 rounded p-2 border border-green-500/30 mt-1">
                          <p className="text-xs text-gray-400">例：100ドルベット、手札11でフリーダブル → ベット額100ドルのまま、勝てば200ドル獲得（元金含め300ドル）</p>
                        </div>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-emerald-500/30">
                        <p className="text-emerald-400 font-bold text-xs mb-1">フリースプリット</p>
                        <p className="text-xs text-gray-300 leading-relaxed mb-1">
                          ペア（<span className="font-bold text-red-300">10・J・Q・K除く</span>）が出たら、追加ベット不要でスプリット可能！
                        </p>
                        <div className="bg-black/40 rounded p-2 border border-emerald-500/30 mt-1">
                          <p className="text-xs text-gray-400">対象：2・2〜9・9、A・A ／ 対象外：10・10、J・J、Q・Q、K・K</p>
                        </div>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-blue-500/30">
                        <p className="text-blue-400 font-bold text-xs mb-1">シックスカードチャーリー</p>
                        <p className="text-xs text-gray-300">6枚のカードで21以下なら、ディーラーがBJでも自動的に勝利！超レアだが強力</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                    <h3 className="text-sm font-black text-white mb-2">⚠️ デメリット</h3>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded p-2 border border-red-500/30">
                        <p className="text-red-400 font-bold text-xs mb-1">ディーラー22はプッシュ（引き分け）</p>
                        <p className="text-xs text-gray-300 leading-relaxed mb-1">
                          通常はディーラーがバーストすればプレイヤーの勝ちだが、<span className="font-bold text-red-300">ディーラーが22でバーストした場合は引き分け扱い</span>。これがフリーベットの最大のデメリット。
                        </p>
                        <p className="text-xs text-gray-500">※プレイヤーがBJや21の時も22プッシュルールが適用される</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-yellow-500/30">
                        <p className="text-yellow-400 font-bold text-xs mb-1">サレンダー不可</p>
                        <p className="text-xs text-gray-400">降参による損切りができない</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
                    <h3 className="text-sm font-black text-white mb-2">💰 配当</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-black/40 rounded p-2 border border-amber-500/30 text-center">
                        <p className="text-xs text-amber-300 font-bold mb-1">BJ</p>
                        <p className="text-lg font-black text-amber-400">1.5倍</p>
                        <p className="text-xs text-gray-500">通常通り</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-green-500/30 text-center">
                        <p className="text-xs text-green-300 font-bold mb-1">通常勝利</p>
                        <p className="text-lg font-black text-green-400">2倍</p>
                        <p className="text-xs text-gray-500">1:1配当</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-gray-500/30 text-center">
                        <p className="text-xs text-gray-300 font-bold mb-1">プッシュ</p>
                        <p className="text-lg font-black text-gray-400">1倍</p>
                        <p className="text-xs text-gray-500">引き分け</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                    <h3 className="text-sm font-black text-white mb-2">🎰 サイドベット</h3>
                    <p className="text-xs text-gray-300 mb-2">最大<span className="font-bold text-blue-300">251倍</span>の配当が狙える豪華なサイドベット！</p>
                    <div className="space-y-1">
                      <div className="bg-black/40 rounded p-2 border border-blue-500/30">
                        <p className="text-blue-400 font-bold text-xs mb-1">21+3</p>
                        <p className="text-xs text-gray-400">プレイヤー2枚＋ディーラー1枚でポーカー役。スーテッドトリップス100倍など</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-purple-500/30">
                        <p className="text-purple-400 font-bold text-xs mb-1">パーフェクトペア</p>
                        <p className="text-xs text-gray-400">最初の2枚がペア。パーフェクトペア25倍、カラーペア12倍、ミックスペア6倍</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-pink-500/30">
                        <p className="text-pink-400 font-bold text-xs mb-1">ホット3</p>
                        <p className="text-xs text-gray-400">3枚の合計値を予想。21（同マーク）20倍、21（異マーク）4倍、20は2倍、19は1倍</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-red-500/30">
                        <p className="text-red-400 font-bold text-xs mb-1">バストイット</p>
                        <p className="text-xs text-gray-400">ディーラーのバーストを予想。8枚以上で251倍！確率約28%で比較的当たりやすい</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-500/10 rounded-lg p-3 border border-yellow-500/30">
                    <h3 className="text-sm font-black text-white mb-2">📊 戦略・還元率</h3>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded p-2 border border-green-500/30">
                        <p className="text-green-400 font-bold text-xs mb-1">✓ ベーシックストラテジー調整が必要</p>
                        <p className="text-xs text-gray-300 leading-relaxed mb-1">フリーダブル・フリースプリットがあるため、通常のストラテジーより攻撃的に。</p>
                        <div className="bg-black/40 rounded p-2 border border-green-500/30 mt-1">
                          <p className="text-xs text-gray-400">• 9・10・11は積極的にダブル（ディーラー関係なし）</p>
                          <p className="text-xs text-gray-400 mt-1">• ペア（10カード除く）は積極的にスプリット</p>
                        </div>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-blue-500/30">
                        <p className="text-blue-400 font-bold text-xs mb-1">還元率</p>
                        <p className="text-xs text-gray-400">メインゲーム約98.45%。22プッシュルールで通常より若干低め。サイドベットは94〜96%</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded p-2 border border-cyan-500/30">
                    <p className="text-cyan-400 font-bold text-xs mb-1">💡 総評</p>
                    <p className="text-xs text-gray-400">フリーダブル・フリースプリットで攻撃的なプレイが可能だが、22プッシュルールが痛い。一撃大勝狙いには向いているが、コツコツ稼ぐには通常ブラックジャックがおすすめ。</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ブラックジャックスイッチ */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-pink-500/30">
                <h2 className="text-lg font-black mb-3 flex items-center gap-2 text-white">
                  <Split className="w-5 h-5 text-pink-400" />
                  ブラックジャックスイッチ
                </h2>
                
                <div className="space-y-3">
                  <div className="bg-pink-500/10 rounded-lg p-3 border border-pink-500/30">
                    <h3 className="text-sm font-black text-white mb-2">🔀 革命的なルール！</h3>
                    <p className="text-xs text-gray-300 leading-relaxed mb-2">
                      <span className="font-bold text-pink-300">2つのハンドで同時にプレイし、2枚目のカードを交換できる</span>という斬新なブラックジャック！Playtech社が開発。カードを入れ替えてBJや強い手を作れる戦略性の高さが魅力。
                    </p>
                  </div>

                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                    <h3 className="text-sm font-black text-white mb-2">🎮 基本ルール</h3>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded p-2 border border-blue-500/30">
                        <p className="text-blue-400 font-bold text-xs mb-1">1️⃣ 2つのハンドに同額ベット</p>
                        <p className="text-xs text-gray-400">両方のハンドに必ず同じ金額を賭ける必要あり</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-cyan-500/30">
                        <p className="text-cyan-400 font-bold text-xs mb-1">2️⃣ 4枚のカードが配られる</p>
                        <p className="text-xs text-gray-400">各ハンドに2枚ずつ、計4枚が配布される</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-purple-500/30">
                        <p className="text-purple-400 font-bold text-xs mb-1">3️⃣ スイッチ判断</p>
                        <p className="text-xs text-gray-400">2枚目のカード同士を交換するか選択。交換は任意で、しなくてもOK</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-pink-500/30">
                        <p className="text-pink-400 font-bold text-xs mb-1">4️⃣ 通常通りプレイ</p>
                        <p className="text-xs text-gray-400">各ハンドで通常のブラックジャック同様にヒット・スタンド等を選択</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-900/50 to-red-900/50 rounded-lg p-3 border-2 border-orange-500/50">
                    <p className="text-sm font-black text-orange-400 mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      超重要！スイッチのルール
                    </p>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded p-2 border border-orange-500/30">
                        <p className="text-xs text-white font-bold mb-1">✅ 交換できるのは「2枚目同士」のみ</p>
                        <p className="text-xs text-gray-300 leading-relaxed">
                          ハンドAの2枚目とハンドBの2枚目を交換できます。<br />
                          1枚目は交換できません。
                        </p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-red-500/30">
                        <p className="text-xs text-red-400 font-bold mb-1">❌ できないこと</p>
                        <p className="text-xs text-gray-300">
                          ・1枚目と2枚目の交換<br />
                          ・1枚目同士の交換<br />
                          ・3枚目以降の交換
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-900/30 rounded-lg p-3 border border-blue-500/30">
                    <h3 className="text-sm font-black text-white mb-2">🎮 正しい具体例</h3>
                    <div className="space-y-2">
                      <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded p-2 border border-pink-500/50">
                        <p className="text-xs text-pink-200 font-bold mb-2">配られた状態：</p>
                        <p className="text-xs text-white">ハンドA: <span className="text-red-300">10・6</span>（合計16）</p>
                        <p className="text-xs text-white">ハンドB: <span className="text-blue-300">7・A</span>（合計18）</p>
                        <p className="text-xs text-yellow-300 my-2">↓ 2枚目同士（6とA）を交換 ↓</p>
                        <p className="text-xs text-green-300">ハンドA: <span className="text-green-300">10・A</span>（BJ！）</p>
                        <p className="text-xs text-green-300">ハンドB: <span className="text-green-300">7・6</span>（合計13）</p>
                      </div>
                      <div className="bg-cyan-900/30 rounded p-2 border border-cyan-500/30">
                        <p className="text-xs text-cyan-400 font-bold mb-1">💡 別の例</p>
                        <p className="text-xs text-gray-300">
                          配布：ハンドA「5・10」、ハンドB「6・A」<br />
                          交換：2枚目（10とA）を入れ替え<br />
                          結果：ハンドA「5・A」、ハンドB「6・10」
                        </p>
                      </div>
                      <div className="bg-red-900/30 rounded p-2 border border-red-500/30">
                        <p className="text-xs text-red-400 font-bold mb-1">⚠️ 間違った例</p>
                        <p className="text-xs text-gray-300">
                          「10（1枚目）」と「6（2枚目）」を交換 → ❌ できません<br />
                          「10（1枚目）」と「7（1枚目）」を交換 → ❌ できません
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                    <h3 className="text-sm font-black text-white mb-2">⚠️ カジノ側有利なルール</h3>
                    <p className="text-xs text-gray-300 mb-2">スイッチという強力な武器がある分、通常より不利なルールも...</p>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded p-2 border border-red-500/40">
                        <p className="text-red-400 font-bold text-xs mb-1">ブラックジャックの配当は1倍</p>
                        <p className="text-xs text-gray-300 leading-relaxed mb-1">
                          通常1.5倍だが、スイッチでは<span className="font-bold text-red-300">1倍（2倍配当）</span>に。スイッチでBJを作りやすいため。
                        </p>
                        <p className="text-xs text-gray-500">※自然BJでもスイッチBJでも配当は同じ</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-orange-500/30">
                        <p className="text-orange-400 font-bold text-xs mb-1">ディーラー22はプッシュ（引き分け）</p>
                        <p className="text-xs text-gray-400">ディーラーが22でバーストした場合は、フリーベット同様に引き分け扱い</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
                    <h3 className="text-sm font-black text-white mb-2">💰 配当</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-black/40 rounded p-2 border border-yellow-500/30 text-center">
                        <p className="text-xs text-yellow-300 font-bold mb-1">BJ</p>
                        <p className="text-lg font-black text-yellow-400">1倍</p>
                        <p className="text-xs text-gray-500">2倍配当</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-green-500/30 text-center">
                        <p className="text-xs text-green-300 font-bold mb-1">通常勝利</p>
                        <p className="text-lg font-black text-green-400">1倍</p>
                        <p className="text-xs text-gray-500">2倍配当</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-gray-500/30 text-center">
                        <p className="text-xs text-gray-300 font-bold mb-1">プッシュ</p>
                        <p className="text-lg font-black text-gray-400">0倍</p>
                        <p className="text-xs text-gray-500">引き分け</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-amber-500/10 rounded-lg p-3 border border-amber-500/30">
                    <h3 className="text-sm font-black text-white mb-2">🎰 スーパーマッチ（サイドベット）</h3>
                    <p className="text-xs text-gray-300 mb-2">最初に配られる<span className="font-bold text-amber-300">4枚のカード</span>で役を作るサイドベット。メインゲームとは独立！</p>
                    <div className="space-y-1">
                      <div className="bg-black/40 rounded p-2 border border-amber-500/40 flex items-center justify-between">
                        <div>
                          <p className="text-amber-300 font-bold text-xs">フォーカード</p>
                          <p className="text-xs text-gray-400">4枚とも同じ数字</p>
                        </div>
                        <div className="text-amber-300 font-black text-sm">40倍</div>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-orange-500/30 flex items-center justify-between">
                        <div>
                          <p className="text-orange-300 font-bold text-xs">ツーペア</p>
                          <p className="text-xs text-gray-400">2組のペア</p>
                        </div>
                        <div className="text-orange-300 font-black text-sm">8倍</div>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-pink-500/30 flex items-center justify-between">
                        <div>
                          <p className="text-pink-300 font-bold text-xs">スリーカード</p>
                          <p className="text-xs text-gray-400">同じ数字3枚</p>
                        </div>
                        <div className="text-pink-300 font-black text-sm">5倍</div>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-purple-500/30 flex items-center justify-between">
                        <div>
                          <p className="text-purple-300 font-bold text-xs">ワンペア</p>
                          <p className="text-xs text-gray-400">同じ数字2枚</p>
                        </div>
                        <div className="text-purple-300 font-black text-sm">1倍</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">※配当はカジノにより異なる場合あり</p>
                  </div>

                  <div className="bg-green-500/10 rounded-lg p-3 border border-green-500/30">
                    <h3 className="text-sm font-black text-white mb-2">📊 戦略・還元率</h3>
                    <div className="space-y-2">
                      <div className="bg-black/40 rounded p-2 border border-green-500/30">
                        <p className="text-green-400 font-bold text-xs mb-1">✓ スイッチ判断が最重要</p>
                        <p className="text-xs text-gray-300 leading-relaxed mb-1">どう交換すれば最も有利かを瞬時に判断する能力が必要。複雑だが面白い！</p>
                        <div className="bg-black/40 rounded p-2 border border-green-500/30 mt-1">
                          <p className="text-xs text-gray-400">• BJを作れるなら最優先でスイッチ</p>
                          <p className="text-xs text-gray-400 mt-1">• 2つの弱い手 → 1強1弱にするのも有効</p>
                          <p className="text-xs text-gray-400 mt-1">• ペアができるならスプリット考慮</p>
                        </div>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-blue-500/30">
                        <p className="text-blue-400 font-bold text-xs mb-1">還元率</p>
                        <p className="text-xs text-gray-400">メインゲーム約99%。スイッチという強力な武器があるため、通常とほぼ同等の還元率を実現</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/40 rounded p-2 border border-pink-500/30">
                    <p className="text-pink-400 font-bold text-xs mb-1">💡 総評</p>
                    <p className="text-xs text-gray-400">カード交換という独特の戦略性が魅力。2つのハンドを同時に管理する必要があり、初心者には難しいが、慣れれば非常に楽しい。BJ配当1倍と22プッシュがネックだが、スイッチで十分カバー可能。</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* サイドベットタブ */}
        {activeTab === 'sidebets' && (
          <div className="space-y-4 animate-slide-in">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-500/30">
                <h2 className="text-lg font-black mb-3 flex items-center gap-2 text-white">
                  <Star className="w-5 h-5 text-purple-400" />
                  サイドベット完全ガイド
                </h2>
                
                <div className="space-y-3">
                  <div className="bg-purple-500/10 rounded-lg p-3 border border-purple-500/30">
                    <h3 className="text-sm font-black text-white mb-2">サイドベットとは？</h3>
                    <p className="text-xs text-gray-300 leading-relaxed mb-2">
                      メインゲームとは別に、カードの組み合わせを予想する賭け方。<span className="font-bold text-purple-300">最大250倍</span>の高配当！
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-black/40 rounded p-2 border border-green-500/30">
                        <p className="text-green-400 font-bold text-xs mb-1">✓ メリット</p>
                        <p className="text-xs text-gray-400">超高配当のチャンス</p>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-red-500/30">
                        <p className="text-red-400 font-bold text-xs mb-1">✗ デメリット</p>
                        <p className="text-xs text-gray-400">還元率94〜96%</p>
                      </div>
                    </div>
                  </div>

                  {/* パーフェクトペア */}
                  <div className="bg-pink-500/10 rounded-lg p-3 border border-pink-500/30">
                    <h3 className="text-sm font-black text-pink-300 mb-2">💎 パーフェクトペア</h3>
                    <p className="text-xs text-gray-300 mb-2">プレイヤーの最初の2枚が同じ数字の場合に配当</p>
                    <div className="space-y-1">
                      <div className="bg-black/40 rounded p-2 border border-amber-500/50 flex items-center justify-between">
                        <div>
                          <p className="text-amber-300 font-bold text-xs">パーフェクトペア</p>
                          <p className="text-xs text-gray-400">数字・色・マーク全て同じ</p>
                        </div>
                        <div className="text-amber-300 font-black text-sm">25倍</div>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-pink-500/30 flex items-center justify-between">
                        <div>
                          <p className="text-pink-300 font-bold text-xs">カラーペア</p>
                          <p className="text-xs text-gray-400">数字・色が同じ</p>
                        </div>
                        <div className="text-pink-300 font-black text-sm">12倍</div>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-purple-500/30 flex items-center justify-between">
                        <div>
                          <p className="text-purple-300 font-bold text-xs">ミックスペア</p>
                          <p className="text-xs text-gray-400">数字のみ同じ</p>
                        </div>
                        <div className="text-purple-300 font-black text-sm">6倍</div>
                      </div>
                    </div>
                  </div>

                  {/* 21+3 */}
                  <div className="bg-blue-500/10 rounded-lg p-3 border border-blue-500/30">
                    <h3 className="text-sm font-black text-blue-300 mb-2">🃏 21+3</h3>
                    <p className="text-xs text-gray-300 mb-2">プレイヤーの2枚＋ディーラーの表向き1枚でポーカー役を作る</p>
                    <div className="space-y-1">
                      <div className="bg-black/40 rounded p-2 border border-amber-500/50 flex items-center justify-between">
                        <p className="text-amber-300 font-bold text-xs">スーテッドトリップス</p>
                        <div className="text-amber-300 font-black text-sm">100倍</div>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-orange-500/40 flex items-center justify-between">
                        <p className="text-orange-300 font-bold text-xs">ストレートフラッシュ</p>
                        <div className="text-orange-300 font-black text-sm">40倍</div>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-pink-500/30 flex items-center justify-between">
                        <p className="text-pink-300 font-bold text-xs">スリーカード</p>
                        <div className="text-pink-300 font-black text-sm">30倍</div>
                      </div>
                    </div>
                  </div>

                  {/* バストイット */}
                  <div className="bg-red-500/10 rounded-lg p-3 border border-red-500/30">
                    <h3 className="text-sm font-black text-red-300 mb-2">💥 バストイット</h3>
                    <p className="text-xs text-gray-300 mb-2">ディーラーがバーストすることに賭ける</p>
                    <div className="space-y-1">
                      <div className="bg-black/40 rounded p-2 border border-amber-500/40 flex items-center justify-between">
                        <p className="text-amber-300 font-bold text-xs">8枚以上でバースト</p>
                        <div className="text-amber-300 font-black text-sm">250倍</div>
                      </div>
                      <div className="bg-black/40 rounded p-2 border border-orange-500/30 flex items-center justify-between">
                        <p className="text-orange-300 font-bold text-xs">7枚でバースト</p>
                        <div className="text-orange-300 font-black text-sm">100倍</div>
                      </div>
                    </div>
                    <div className="mt-2 bg-black/40 rounded p-2 border border-green-500/30">
                      <p className="text-green-400 font-bold text-xs mb-1">💡 確率：約28%</p>
                      <p className="text-xs text-gray-400">比較的当たりやすい</p>
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
        .animate-slide-in {
          animation: slide-in 0.4s ease-out;
        }
      `}</style>
    </div>
  );
};

export default BlackjackLesson;