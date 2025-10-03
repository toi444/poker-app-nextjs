'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { 
  ArrowLeft, 
  BookOpen, 
  Calculator, 
  Library, 
  Trophy,
  ChevronRight,
  Target,
  TrendingUp,
  Info,
  Check,
  X,
  RotateCcw,
  Sparkles,
  Square, 
  CheckSquare
} from 'lucide-react'

// ハンドレンジデータ
const handRanges = {
  "UTG": {
    "タイト": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "AKs", "AKo", "AQs"],
      "call": [],
    },
    "スタンダード": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "AKs", "AKo", "AQs", "AQo", "AJs", "KQs"],
      "call": ["77", "66", "AJo", "KQo", "ATs"],
    },
    "アグレッシブ": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "AKs", "AKo", "AQs", "AQo", "AJs", "AJo", "ATs", "KQs", "KQo", "KJs", "QJs"],
      "call": ["55", "44", "ATo", "KJo", "QJo", "JTs"],
    }
  },
  "MP": {
    "タイト": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "AKs", "AKo", "AQs", "AQo", "AJs", "KQs"],
      "call": ["77", "AJo", "KQo"],
    },
    "スタンダード": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "AKs", "AKo", "AQs", "AQo", "AJs", "AJo", "ATs", "KQs", "KQo", "KJs", "QJs"],
      "call": ["66", "55", "ATo", "KJo", "QJo", "JTs"],
    },
    "アグレッシブ": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "AKs", "AKo", "AQs", "AQo", "AJs", "AJo", "ATs", "ATo", "A9s", "KQs", "KQo", "KJs", "KJo", "KTs", "QJs", "QJo", "QTs", "JTs", "JTo", "T9s", "98s"],
      "call": ["44", "A9o", "A8s", "KTo", "QTo", "J9s", "T8s", "87s", "76s"],
    }
  },
  "CO": {
    "タイト": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "AKs", "AKo", "AQs", "AQo", "AJs", "AJo", "ATs", "KQs", "KQo", "KJs", "QJs"],
      "call": ["66", "55", "ATo", "KJo", "QJo", "JTs"],
    },
    "スタンダード": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "AKs", "AKo", "AQs", "AQo", "AJs", "AJo", "ATs", "ATo", "A9s", "A8s", "KQs", "KQo", "KJs", "KJo", "KTs", "QJs", "QJo", "QTs", "JTs", "JTo", "T9s", "98s", "87s"],
      "call": ["44", "33", "A9o", "A7s", "A6s", "A5s", "KTo", "K9s", "QTo", "Q9s", "J9s", "T8s", "97s", "76s"],
    },
    "アグレッシブ": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44", "33", "AKs", "AKo", "AQs", "AQo", "AJs", "AJo", "ATs", "ATo", "A9s", "A9o", "A8s", "A8o", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s", "KQs", "KQo", "KJs", "KJo", "KTs", "KTo", "K9s", "QJs", "QJo", "QTs", "QTo", "Q9s", "JTs", "JTo", "J9s", "T9s", "T8s", "98s", "87s", "76s", "65s"],
      "call": ["22", "A7o", "A6o", "A5o", "K9o", "K8s", "Q9o", "Q8s", "J9o", "J8s", "T9o", "T7s", "97s", "86s", "75s", "54s"],
    }
  },
  "BTN": {
    "タイト": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "AKs", "AKo", "AQs", "AQo", "AJs", "AJo", "ATs", "ATo", "KQs", "KQo", "KJs", "KJo", "QJs", "QJo", "JTs"],
      "call": ["66", "55", "A9s", "KTs", "QTs", "J9s", "T9s"],
    },
    "スタンダード": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44", "AKs", "AKo", "AQs", "AQo", "AJs", "AJo", "ATs", "ATo", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s", "KQs", "KQo", "KJs", "KJo", "KTs", "QJs", "QJo", "QTs", "JTs", "JTo", "T9s", "98s", "87s", "76s"],
      "call": ["33", "22", "A9o", "KTo", "QTo", "J9s", "T8s", "97s", "86s", "75s", "65s"],
    },
    "アグレッシブ": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44", "33", "22", "AKs", "AKo", "AQs", "AQo", "AJs", "AJo", "ATs", "ATo", "A9s", "A9o", "A8s", "A8o", "A7s", "A7o", "A6s", "A5s", "A4s", "A3s", "A2s", "KQs", "KQo", "KJs", "KJo", "KTs", "KTo", "K9s", "QJs", "QJo", "QTs", "QTo", "Q9s", "JTs", "JTo", "J9s", "T9s", "T8s", "98s", "87s", "76s", "65s", "54s"],
      "call": ["A6o", "A5o", "K9o", "Q9o", "J9o", "T9o", "97s", "86s", "75s", "64s", "53s"],
    }
  },
  "SB": {
    "タイト": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "AKs", "AKo", "AQs", "AQo", "AJs", "AJo", "ATs", "KQs", "KQo", "KJs"],
      "call": ["55", "44", "ATo", "A9s", "KJo", "KTs", "QJs", "QJo", "JTs"],
    },
    "スタンダード": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44", "AKs", "AKo", "AQs", "AQo", "AJs", "AJo", "ATs", "ATo", "A9s", "A8s", "A7s", "A6s", "A5s", "A4s", "KQs", "KQo", "KJs", "KJo", "KTs", "QJs", "QJo", "QTs", "JTs", "T9s"],
      "call": ["33", "22", "A9o", "A3s", "A2s", "KTo", "K9s", "QTo", "Q9s", "JTo", "J9s", "T8s", "98s", "87s", "76s"],
    },
    "アグレッシブ": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44", "33", "22", "AKs", "AKo", "AQs", "AQo", "AJs", "AJo", "ATs", "ATo", "A9s", "A9o", "A8s", "A8o", "A7s", "A7o", "A6s", "A6o", "A5s", "A5o", "A4s", "A3s", "A2s", "KQs", "KQo", "KJs", "KJo", "KTs", "KTo", "K9s", "K9o", "K8s", "K7s", "QJs", "QJo", "QTs", "QTo", "Q9s", "Q8s", "JTs", "JTo", "J9s", "J8s", "T9s", "T8s", "98s", "87s", "76s", "65s", "54s"],
      "call": [],
    }
  },
  "BB": {
    "タイト": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "AKs", "AKo", "AQs"],
      "call": ["88", "77", "66", "55", "44", "33", "22", "AQo", "AJs", "AJo", "ATs", "ATo", "A9s", "A8s", "KQs", "KQo", "KJs", "KJo", "KTs", "QJs", "QJo", "QTs", "JTs"],
    },
    "スタンダード": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "AKs", "AKo", "AQs", "AQo", "AJs"],
      "call": ["77", "66", "55", "44", "33", "22", "AJo", "ATs", "ATo", "A9s", "A9o", "A8s", "A8o", "A7s", "A6s", "A5s", "A4s", "A3s", "A2s", "KQs", "KQo", "KJs", "KJo", "KTs", "KTo", "K9s", "QJs", "QJo", "QTs", "QTo", "Q9s", "JTs", "JTo", "J9s", "T9s", "T8s", "98s", "87s", "76s", "65s"],
    },
    "アグレッシブ": {
      "raise": ["AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "AKs", "AKo", "AQs", "AQo", "AJs", "AJo", "ATs", "KQs", "KQo"],
      "call": ["66", "55", "44", "33", "22", "ATo", "A9s", "A9o", "A8s", "A8o", "A7s", "A7o", "A6s", "A6o", "A5s", "A5o", "A4s", "A4o", "A3s", "A3o", "A2s", "A2o", "KJs", "KJo", "KTs", "KTo", "K9s", "K9o", "K8s", "K7s", "K6s", "K5s", "K4s", "K3s", "K2s", "QJs", "QJo", "QTs", "QTo", "Q9s", "Q9o", "Q8s", "Q7s", "JTs", "JTo", "J9s", "J9o", "J8s", "T9s", "T9o", "T8s", "T7s", "98s", "97s", "87s", "86s", "76s", "75s", "65s", "64s", "54s", "53s", "43s"],
    }
  }
}

// ポーカー用語データベース（234語）
const pokerTerms = {
  "基本アクション": {
    "オールイン": "手持ちのチップを全て賭けること。All-in。",
    "コール": "相手のベット額と同額を賭けること。Call。",
    "レイズ": "相手のベット額より多く賭けること。Raise。",
    "フォールド": "勝負を降りること。カードを捨てる。Fold。",
    "チェック": "賭けずに次のプレイヤーに回すこと。Check。",
    "ベット": "最初に賭け金を出すこと。Bet。",
    "リレイズ": "レイズに対して更にレイズすること。Re-raise。",
    "ミニレイズ": "最小限のレイズ。前のベットの2倍。",
    "リンプ": "プリフロップでBBと同額でコールすること。弱いプレイとされる。",
    "コールドコール": "レイズに対して初めてコールすること。",
    "フラットコール": "レイズできる状況でコールすること。",
    "マック": "Muck。負けを認めて手札を見せずに捨てること。",
  },
  "ポジション": {
    "UTG": "Under The Gun。BBの左隣で最初にアクションする最も不利なポジション。",
    "UTG+1": "UTGの左隣。アーリーポジション。",
    "UTG+2": "UTG+1の左隣。アーリーポジション後半。",
    "MP": "Middle Position。中間のポジション。",
    "MP2": "ミドルポジションの後半。",
    "MP3": "ミドルポジション最後尾。ハイジャックの前。",
    "HJ": "Hijack。ハイジャック。COの右隣。",
    "CO": "Cut Off。ボタンの右隣のポジション。",
    "BTN": "Button。ディーラーボタン。最後にアクションできる最も有利なポジション。",
    "SB": "Small Blind。強制ベットを払う位置。BTNの左隣。",
    "BB": "Big Blind。SBの2倍の強制ベットを払う位置。",
    "EP": "Early Position。アーリーポジション。序盤に行動。",
    "LP": "Late Position。レイトポジション。終盤に行動。",
    "IP": "In Position。相手より後にアクションできる有利なポジション。",
    "OOP": "Out Of Position。相手より先にアクションする不利なポジション。",
  },
  "戦略・戦術": {
    "GTO": "Game Theory Optimal。ゲーム理論的最適戦略。",
    "エクスプロイト": "相手の弱点を突いて利益を最大化する戦略。",
    "ブラフ": "弱い手で強い手を装って賭けること。",
    "セミブラフ": "現時点で弱いが改善可能性がある手でのブラフ。",
    "ピュアブラフ": "ほぼ逆転する可能性のないハンドでするブラフ。エアーブラフとも。",
    "バリューベット": "強い手で相手からチップを引き出すための賭け。",
    "シンバリュー": "薄いバリューベット。微妙な強さでのベット。",
    "ポラライズドベット": "ナッツか完全なブラフという両極端なレンジでのベット。",
    "ポラライズドレンジ": "強い手とブラフの両極端で構成されるレンジ。中間の手がない。",
    "マージドレンジ": "Merged Range。強い手から中程度の手まで幅広く含むレンジ。",
    "リニアレンジ": "Linear Range。上から順に強い手で構成されるレンジ。",
    "コンデンスドレンジ": "Condensed Range。中程度の強さに集中したレンジ。",
    "キャップドレンジ": "Capped Range。最強の手を含まないレンジ。",
    "アンキャップドレンジ": "Uncapped Range。ナッツを含む可能性があるレンジ。",
    "ポットオッズ": "ポットサイズとコール額の比率。期待値計算に使用。",
    "インプライドオッズ": "将来的に獲得できる可能性のあるチップを含めた期待値。",
    "リバースインプライドオッズ": "将来的に失う可能性のあるチップを考慮した期待値。",
    "3ベット": "プリフロップで最初のレイズに対する再レイズ。",
    "4ベット": "3ベットに対する再レイズ。",
    "5ベット": "4ベットに対する再レイズ。通常オールイン。",
    "Cベット": "Continuation Bet。プリフロップでレイズした人がフロップでも続けてベットすること。",
    "ダブルバレル": "フロップとターンで連続してベットすること。",
    "トリプルバレル": "フロップ、ターン、リバー全てでベットすること。",
    "チェックレイズ": "チェックした後、相手のベットに対してレイズすること。",
    "ドンクベット": "前のラウンドでアグレッサーでない人が先にベットすること。",
    "リードベット": "Lead Bet。OOPから主導権を取るために先にベットすること。",
    "ブロックベット": "相手の大きなベットを防ぐための小さなベット。",
    "プローブベット": "情報収集のためのベット。",
    "フロート": "ポジションを利用して後のストリートで奪う戦略。",
    "スクイーズ": "複数のコーラーがいる時に大きくレイズすること。",
    "リスクイーズ": "Re-squeeze。スクイーズに対してさらに大きくレイズすること。",
    "アイソレイズ": "Isolation Raise。特定の弱いプレイヤーと1対1になるようにレイズすること。",
    "アイソレーション": "弱いプレイヤーを隔離して1対1に持ち込む戦略。",
    "ストップアンドゴー": "プリフロップでコールし、フロップで先にオールインする戦略。",
    "リンプリレイズ": "リンプした後、レイズに対して再レイズすること。トラップ戦略。",
    "スチール": "Steal。ブラインドを奪うためのレイズ。",
    "リスチール": "Re-steal。スチールを狙ったレイズに対して再レイズすること。",
    "オーバーベット": "ポットサイズより大きなベット。プレッシャーをかける。",
    "アンダーベット": "ポットサイズより小さなベット。情報を得たりコントロールする。",
    "ポットコントロール": "ポットサイズを小さく保つ戦略。リスク管理。",
    "スロープレイ": "強い手で弱く見せかけるプレイ。トラップ戦略。",
    "ファストプレイ": "強い手で積極的にベットするプレイ。",
  },
  "ハンド・役": {
    "ナッツ": "その状況で最強の手。",
    "セカンドナッツ": "2番目に強い手。",
    "サードナッツ": "3番目に強い手。",
    "ナッツフラッシュ": "最強のフラッシュ。Aハイフラッシュ。",
    "セット": "ポケットペアがボードの1枚と合わせてスリーカードになること。",
    "トリップス": "ボードのペアと手札の1枚でスリーカードになること。",
    "クワッズ": "フォーカード。同じ数字4枚。",
    "ボート": "フルハウスの別名。",
    "ブロードウェイ": "A-K-Q-J-Tのストレート。",
    "ホイール": "A-2-3-4-5のストレート。最も弱いストレート。",
    "バイシクル": "Bicycleホイールの別名。A-2-3-4-5。",
    "トップペア": "自分の手札とボードの最高位カードでできるペア。",
    "ミドルペア": "自分の手札とボードの中位カードでできるペア。",
    "ボトムペア": "自分の手札とボードの最低位カードでできるペア。",
    "ポケットペア": "手札の2枚が同じランクのペア。",
    "オーバーペア": "ボードのどのカードよりも高いポケットペア。",
    "アンダーペア": "ボードに自分のポケットペアより高いカードがある状態。",
    "トップキッカー": "最高位のキッカー。通常はエース。",
    "キッカー": "Kicker。役が同じ時に勝敗を決める補助カード。",
    "マージナルハンド": "Marginal Hand。中程度の強さの微妙な手。",
    "モンスターハンド": "Monster Hand。非常に強い手。",
    "ドミネイト": "Dominate。相手の手を圧倒している状態。",
    "コネクター": "連続した数字のカード。例：89、JT。",
    "スーテッドコネクター": "同じスートで連続した数字。例：8♠9♠。",
    "ワンギャッパー": "1つ飛ばしの数字。例：79、QT。",
    "ツーギャッパー": "2つ飛ばしの数字。例：68、Q9。",
  },
  "ドロー・アウツ": {
    "フラッシュドロー": "あと1枚で同じスートが5枚揃う状態。",
    "ストレートドロー": "あと1枚でストレートが完成する状態。",
    "OESD": "Open Ended Straight Draw。両端が開いているストレートドロー。8アウツ。",
    "ガットショット": "内側の1枚でストレートが完成するドロー。インサイドストレートドロー。4アウツ。",
    "ダブルベリーバスター": "Double Belly Buster。ガットショットが2つある状態。8アウツ。",
    "ダブルガットショット": "ダブルベリーバスターの別名。",
    "バックドアドロー": "ターンとリバー両方で特定のカードが必要なドロー。",
    "バックドアフラッシュドロー": "ターンとリバーで2枚連続して同じスートが必要。",
    "バックドアストレートドロー": "ターンとリバーで2枚連続してストレートが必要。",
    "ランナーランナー": "Runner Runner。ターンとリバーで2回連続して欲しいカードを引くこと。",
    "コンボドロー": "複数のドローを持っている状態。例：フラッシュ+ストレート。",
    "モンスタードロー": "非常に強力なドロー。15アウツ以上。",
    "ナッツドロー": "完成すればナッツになるドロー。",
    "ラップ": "Wrap。オマハで多くのストレートアウツを持つドロー。",
    "オーバーカード": "Over Card。ボードのどのカードよりも高い手札のカード。",
    "ツーオーバー": "Two Overs。ボードより高いカード2枚を持つ状態。",
    "アウツ": "Outs。役を完成させるために必要な残りのカード。",
    "クリーンアウツ": "確実に勝てるアウツ。",
    "ダーティアウツ": "引いても勝てない可能性があるアウツ。",
    "ボトムエンド": "ストレートの最低位側。例：A234でのA。",
    "トップエンド": "ストレートの最高位側。例：TJQKでのK。",
  },
  "ゲーム進行": {
    "プリフロップ": "最初の2枚が配られた後、フロップが開く前の段階。",
    "フロップ": "共通カード3枚が開かれる段階。",
    "ターン": "4枚目の共通カードが開かれる段階。4thストリート。",
    "リバー": "5枚目（最後）の共通カードが開かれる段階。5thストリート。",
    "ショーダウン": "最後まで残ったプレイヤーが手札を公開すること。",
    "ストリート": "各ベッティングラウンドの総称。",
    "ボード": "Board。テーブル上の共通カード。コミュニティカード。",
    "テクスチャ": "Texture。ボードの特徴や性質。",
    "ドライボード": "ドローの可能性が少ないボード。例：K72レインボー。",
    "ウェットボード": "ドローの可能性が多いボード。例：QJTツートーン。",
    "スタティックボード": "Static Board。ターン・リバーで状況が変わりにくいボード。",
    "ダイナミックボード": "Dynamic Board。ターン・リバーで状況が大きく変わるボード。",
    "レインボー": "3枚とも異なるスートのフロップ。",
    "ツートーン": "2枚が同じスートのフロップ。",
    "モノトーン": "3枚とも同じスートのフロップ。",
    "ペアボード": "ボードにペアがある状態。",
    "トリップスボード": "ボードに同じランク3枚がある状態。",
    "ダブルペアボード": "ボードに2つのペアがある状態。",
    "コーディネート": "Coordinated。ボードがストレートやフラッシュになりやすい状態。",
    "ディスコネクト": "Disconnected。ボードがバラバラでドローしにくい状態。",
  },
  "プレイスタイル": {
    "タイト": "参加率が低く、強い手だけでプレイするスタイル。",
    "ルース": "参加率が高く、多くの手でプレイするスタイル。",
    "アグレッシブ": "積極的にベットやレイズをするスタイル。",
    "パッシブ": "消極的でコールが多いスタイル。",
    "TAG": "Tight Aggressive。タイトで攻撃的なプレイスタイル。",
    "LAG": "Loose Aggressive。ルースで攻撃的なプレイスタイル。",
    "ニット": "Nit。極端にタイトなプレイヤー。ロックとも。",
    "マニアック": "極端にルースアグレッシブなプレイヤー。",
    "フィッシュ": "Fish。弱いプレイヤーの蔑称。カモ。",
    "ドンキー": "Donkey。フィッシュと同義。下手なプレイヤー。",
    "シャーク": "Shark。強いプレイヤー。フィッシュを狩る側。",
    "ホエール": "Whale。大金を賭ける弱いプレイヤー。最高のカモ。",
    "レグ": "Reg。Regular。常連プレイヤー。実力者が多い。",
    "グラインダー": "Grinder。堅実に利益を積み重ねるプレイヤー。",
    "ステーション": "Calling Station。コールばかりするプレイヤー。",
    "ロック": "Rock。超タイトなプレイヤー。ニットと同義。",
    "タンク": "Tank。長考する人。時間をかけて考えること。",
    "オーバープレイ": "Over Play。手の強さに対して過剰に攻撃的にプレイすること。",
    "アンダープレイ": "Under Play。強い手を控えめにプレイすること。",
  },
  "アクション詳細": {
    "オープンレイズ": "最初のレイズをすること。",
    "リンプオーバー": "Limp Over。既にリンパーがいる状態でリンプすること。",
    "オーバーリンプ": "Over Limp。リンプオーバーと同義。",
    "チェックバック": "ベットできる状況でチェックすること。",
    "チェックコール": "チェックして相手のベットにコール。",
    "チェックレイズオールイン": "チェックした後、相手のベットに対してオールインすること。",
    "ベットフォールド": "Bet Fold。ベットしたが相手のレイズには降りる戦略。",
    "ベットコール": "Bet Call。ベットして相手のレイズにもコールする。",
    "バリューカット": "リバーで薄いバリューを取ること。",
    "マージナルレイズ": "微妙な強さでのレイズ。",
    "ソウルリード": "Soul Read。根拠の薄い読み。直感。",
    "スナップコール": "Snap Call。即座にコール。強い手を示唆。",
    "スナップフォールド": "即座にフォールド。",
    "ホールドアンドホープ": "Hold and Hope。弱い手で降りずに祈る状態。",
  },
  "メンタル・心理": {
    "ティルト": "感情的になって正常な判断ができない状態。",
    "モンキーティルト": "完全に理性を失った状態。激しいティルト。",
    "スチームティルト": "Steam Tilt。怒りで感情的になっている状態。",
    "レベリング": "相手の思考を読みすぎて逆に間違える。",
    "リバースレベリング": "あえて単純な思考で相手を欺く。",
    "FPS": "Fancy Play Syndrome。不必要に複雑なプレイをする症候群。",
    "結果論": "Results Oriented。結果だけで判断する間違った思考。",
    "ランガッド": "Run Good。幸運が続くこと。ヒーター。",
    "ランバッド": "Run Bad。不運が続くこと。ダウンスイング。",
    "ヒーター": "Heater。勝ちが続く幸運な期間。",
    "クーラー": "Cooler。両者が強い手同士で避けられない大きな損失。",
    "バリアンス": "Variance。分散。短期的な運の振れ。",
    "ダウンスイング": "負けが続く期間。",
    "アップスイング": "勝ちが続く期間。",
    "バッドビート": "大本命だったのに逆転負けすること。",
    "サックアウト": "Suck Out。格下のハンドが逆転勝ちすること。",
    "リバーラット": "River Rat。リバーで奇跡的に逆転する人。",
    "テル": "Tell。相手の手の強さを示す無意識の動作。",
    "タイミングテル": "ベットまでの時間で手の強さを推測。",
    "サイジングテル": "ベット額から手の強さを推測。",
    "リバーステル": "Reverse Tell。わざと誤った情報を与える演技。",
    "エゴ": "Ego。プライドが邪魔して正しい判断ができない状態。",
  },
  "トーナメント用語": {
    "MTT": "Multi Table Tournament。複数テーブルトーナメント。",
    "SNG": "Sit and Go。人数が揃ったら始まるトーナメント。",
    "STT": "Single Table Tournament。1テーブルのトーナメント。",
    "サテライト": "より大きな大会への出場権を争う予選。",
    "バブル": "入賞まであと1人の状況。",
    "バブルファクター": "ICMプレッシャーによる影響。",
    "バブルボーイ": "Bubble Boy。入賞直前で敗退したプレイヤー。",
    "ITM": "In The Money。入賞圏内。",
    "FT": "Final Table。ファイナルテーブル。最終卓。",
    "HU": "Heads Up。1対1の勝負。",
    "チップEV": "Chip EV。チップ期待値。",
    "ICM": "Independent Chip Model。トーナメントでのチップ価値計算モデル。",
    "ICMプレッシャー": "ICM計算により生じる判断の難しさ。",
    "バウンティ": "特定のプレイヤーを飛ばすともらえる賞金。",
    "PKO": "Progressive Knockout。賞金が累積するバウンティ形式。",
    "リバイ": "チップがなくなった時に追加で買い足すこと。",
    "アドオン": "特定のタイミングでチップを追加購入すること。",
    "ターボ": "ブラインドレベルが速く上がるトーナメント。",
    "ハイパーターボ": "超高速でブラインドが上がるトーナメント。",
    "ディープスタック": "初期チップが多いトーナメント。",
    "フリーズアウト": "Freezeout。リバイやアドオンがないトーナメント。",
    "レイトレジストレーション": "Late Registration。遅れて参加すること。",
  },
  "数学・統計": {
    "EV": "Expected Value。期待値。",
    "cEV": "Chip EV。チップ期待値。",
    "$EV": "賞金期待値。ICMを考慮した期待値。",
    "SPR": "Stack to Pot Ratio。スタックとポットの比率。",
    "MDF": "Minimum Defense Frequency。最小防御頻度。",
    "PFR": "Pre-Flop Raise。プリフロップレイズ率。",
    "VPIP": "Voluntarily Put In Pot。自発的参加率。",
    "AF": "Aggression Factor。アグレッション係数。",
    "WTSD": "Went To ShowDown。ショーダウン率。",
    "W$SD": "Won at ShowDown。ショーダウン勝率。",
    "WSD": "Won at ShowDown。W$SDと同義。",
    "ROI": "Return On Investment。投資収益率。",
    "BB/100": "100ハンドあたりのビッグブラインド獲得数。勝率指標。",
    "M値": "M-ratio。アンティ込みでブラインドを何周払えるか。",
    "Q値": "Q-ratio。テーブル平均スタックに対する自分のスタック比率。",
    "レーキ": "カジノやポーカールームが取る手数料。",
    "レーキバック": "支払ったレーキの一部が戻ってくること。",
    "エクイティ": "Equity。現時点での勝率・取り分。",
    "フォールドエクイティ": "Fold Equity。相手がフォールドする確率による利益。",
    "ポットエクイティ": "Pot Equity。ショーダウンで勝つ確率。",
    "レッドライン": "ショーダウンなしでの収支。",
    "ブルーライン": "ショーダウンでの収支。",
    "グリーンライン": "総収支。レッドライン+ブルーライン。",
  },
}

// ポジション別戦略の説明
const positionStrategies = {
  "UTG": {
    "タイト": "UTGは最初に行動する最も不利なポジション。情報が少ないため、非常に強い手（上位5%）のみでプレイ。後ろに8人もプレイヤーがいるため、誰かが強い手を持つ可能性が高く、慎重にプレイする必要があります。",
    "スタンダード": "UTGでも基本的なプレイングレンジ（上位8-10%）でプレイ。ただし、テーブルの傾向を見て調整。タイトなテーブルなら少し広げ、アグレッシブなテーブルならタイトにプレイします。",
    "アグレッシブ": "UTGからでも幅広いレンジ（上位12-15%）でアグレッシブにプレイ。イメージを作り、後のポジションでのプレイを有利にします。ただし、3ベットされるリスクも高いため、経験が必要です。"
  },
  "MP": {
    "タイト": "MPは中間ポジション。前のプレイヤーの動きは見えるが、後ろにまだ多くのプレイヤーがいます。UTGより少し広いレンジ（上位7-9%）でプレイ可能ですが、依然として慎重さが必要です。",
    "スタンダード": "標準的なMPレンジ（上位11-13%）。前のプレイヤーがフォールドした情報を活かしつつ、後ろのプレイヤーへのプレッシャーも考慮。バランスの取れたプレイが重要です。",
    "アグレッシブ": "MPから積極的にレンジを広げ（上位15-18%）、ポットを取りに行きます。前のプレイヤーがタイトなら、ブラインドスチールの機会も増えます。ただし、レイトポジションからの反撃に注意。"
  },
  "CO": {
    "タイト": "COはボタンの一つ前の有利なポジション。レンジを少し広げ（上位12-15%）ても大丈夫。ボタンのプレイヤーの傾向を把握し、調整することが重要です。",
    "スタンダード": "COからは標準的に広いレンジ（上位20-25%）でプレイ。特にボタンがタイトなら、実質的にボタンのような有利さを得られます。ブラインドスチールの絶好のポジションです。",
    "アグレッシブ": "COから非常に広いレンジ（上位30-35%）でアグレッシブにプレイ。多くのハンドでレイズし、ブラインドにプレッシャーをかけます。ポジションの優位性を最大限に活用する戦略です。"
  },
  "BTN": {
    "タイト": "BTNは最強ポジション。全てのラウンドで最後に行動できるため、タイトプレイヤーでも広めのレンジ（上位20%）でプレイ可能。情報優位を活かして、慎重ながらも積極的にプレイします。",
    "スタンダード": "BTNからは標準的に広いレンジ（上位40-45%）でプレイ。ポジションの優位性により、弱い手でもプロフィタブル。フロップ以降のコントロールが容易なため、多くのポットに参加します。",
    "アグレッシブ": "BTNから超広範囲（上位50-60%）でアグレッシブプレイ。ほぼ全てのプレイアブルハンドでレイズ。ポジションパワーを最大限活用し、ブラインドから多くのポットを奪います。"
  },
  "SB": {
    "タイト": "SBはポストフロップで最初に行動する不利なポジション。BTNより狭いレンジ（上位15-18%）でプレイ。ただし、BBに対してはヘッズアップなので、やや広くプレイ可能です。",
    "スタンダード": "SBからBBへのスチールを狙い、標準的に広いレンジ（上位35-40%）でレイズ。コンプリートよりレイズを選択し、主導権を握ります。BBの傾向に応じて調整が重要です。",
    "アグレッシブ": "SB vs BBの状況を最大限活用し、超広範囲（上位60-70%）でレイズ。BBがタイトなら特に有効。ただし、BBからの3ベットには注意が必要。ポラライズされたレンジ構成が重要。"
  },
  "BB": {
    "タイト": "BBは既に1BBを投資しているため、オッズが良い。タイトでもレイズには広くディフェンス（上位25-30%）。ただし、OOPでプレイするため、慎重な判断が必要です。",
    "スタンダード": "BBは最後に行動できるプリフロップの優位性を活用。標準的に広くディフェンス（上位40-50%）し、ポットオッズを活かします。3ベットと コールのバランスが重要です。",
    "アグレッシブ": "BBから積極的に3ベット（上位15-20%）し、主導権を取り返します。広いコールレンジ（上位60-70%）でディフェンスし、相手のスチールを防ぎます。逆転の発想で攻撃的にプレイ。"
  }
}

// ハンドvsハンド計算コンポーネント（正確な勝率データ付き）
const HandVsHandCalculator = () => {
  const [myHand, setMyHand] = useState('AA')
  const [oppHand, setOppHand] = useState('KK')
  const [showResult, setShowResult] = useState(false)
  
  const commonHands = [
    "AA", "KK", "QQ", "JJ", "TT", "99", "88", "77", "66", "55", "44", "33", "22",
    "AKs", "AKo", "AQs", "AQo", "AJs", "AJo", "ATs", "ATo",
    "KQs", "KQo", "KJs", "KJo", "KTs", "KTo",
    "QJs", "QJo", "QTs", "QTo",
    "JTs", "JTo", "J9s", "J9o",
    "T9s", "T9o", "T8s", "T8o",
    "98s", "98o", "87s", "87o", "76s", "76o", "65s", "65o",
    "54s", "54o", "43s", "43o", "32s", "32o",
    "72o"
  ]
  
  // より正確な勝率計算
  const getWinRate = (hand1: string, hand2: string) => {
    // 正確な勝率データベース（実際のシミュレーション結果に基づく）
    const exactMatchups: { [key: string]: number } = {
      // ペア vs ペア
      'AA-KK': 81.9, 'AA-QQ': 81.1, 'AA-JJ': 80.8, 'AA-TT': 80.7, 'AA-99': 80.5,
      'AA-88': 80.5, 'AA-77': 80.1, 'AA-66': 80.2, 'AA-55': 79.8, 'AA-44': 79.9,
      'AA-33': 79.8, 'AA-22': 79.6,
      'KK-AA': 18.1, 'KK-QQ': 81.2, 'KK-JJ': 80.8, 'KK-TT': 80.7, 'KK-99': 80.4,
      'KK-88': 80.3, 'KK-77': 80.1, 'KK-66': 79.9, 'KK-55': 79.9, 'KK-44': 79.5,
      'KK-33': 79.6, 'KK-22': 79.4,
      'QQ-AA': 18.9, 'QQ-KK': 18.8, 'QQ-JJ': 80.8, 'QQ-TT': 80.7, 'QQ-99': 80.2,
      'QQ-88': 80.1, 'QQ-77': 79.9, 'QQ-66': 79.7, 'QQ-55': 79.7, 'QQ-44': 79.6,
      'QQ-33': 79.4, 'QQ-22': 79.2,
      
      // ペア vs 高カード
      'AA-AKs': 87.2, 'AA-AKo': 92.6, 'AA-AQs': 87.0, 'AA-AQo': 92.5,
      'AA-AJs': 86.8, 'AA-AJo': 92.4, 'AA-KQs': 83.3, 'AA-KQo': 86.8,
      'AA-72o': 88.2,
      
      'KK-AKs': 65.5, 'KK-AKo': 69.6, 'KK-AQs': 70.0, 'KK-AQo': 73.4,
      'KK-AJs': 69.8, 'KK-AJo': 73.2, 'KK-KQs': 81.3, 'KK-KQo': 85.7,
      
      'QQ-AKs': 53.8, 'QQ-AKo': 56.8, 'QQ-AQs': 66.1, 'QQ-AQo': 70.0,
      'QQ-KQs': 66.2, 'QQ-KQo': 70.1, 'QQ-JTs': 68.1, 'QQ-JTo': 71.1,
      
      'JJ-AKs': 53.8, 'JJ-AKo': 56.9, 'JJ-AQs': 54.0, 'JJ-AQo': 57.0,
      'JJ-KQs': 54.1, 'JJ-KQo': 57.1, 'JJ-QJs': 65.9, 'JJ-QJo': 70.0,
      
      'TT-AKs': 53.7, 'TT-AKo': 56.7, 'TT-AQs': 53.9, 'TT-AQo': 56.9,
      'TT-KQs': 54.0, 'TT-KQo': 57.0, 'TT-JTs': 65.7, 'TT-JTo': 69.8,
      
      '99-AKs': 52.3, '99-AKo': 55.1, '88-AKs': 52.3, '88-AKo': 55.0,
      '77-AKs': 51.1, '77-AKo': 53.7, '66-AKs': 51.2, '66-AKo': 53.8,
      '55-AKs': 52.3, '55-AKo': 54.9, '44-AKs': 50.9, '44-AKo': 53.4,
      '33-AKs': 51.0, '33-AKo': 53.5, '22-AKs': 50.7, '22-AKo': 53.2,
      
      // 高カード vs 高カード
      'AKs-AQs': 69.5, 'AKs-AQo': 70.9, 'AKo-AQs': 68.1, 'AKo-AQo': 73.4,
      'AKs-KQs': 61.1, 'AKs-KQo': 63.3, 'AKo-KQs': 59.3, 'AKo-KQo': 64.3,
      'AKs-JTs': 59.7, 'AKs-JTo': 61.8, 'AKo-JTs': 57.9, 'AKo-JTo': 62.5,
      'AKs-76s': 59.1, 'AKs-72o': 65.3, 'AKo-72o': 66.7,
      
      'AQs-KQs': 66.1, 'AQs-KQo': 68.3, 'AQo-KQs': 64.3, 'AQo-KQo': 69.4,
      'AQs-JTs': 59.4, 'AQs-JTo': 61.5, 'AQo-JTs': 57.6, 'AQo-JTo': 62.2,
      
      'KQs-JTs': 59.1, 'KQs-JTo': 61.2, 'KQo-JTs': 57.3, 'KQo-JTo': 62.0,
    }
    
    // 逆のマッチアップをチェック
    const key = `${hand1}-${hand2}`
    const reverseKey = `${hand2}-${hand1}`
    
    if (exactMatchups[key]) {
      return exactMatchups[key]
    } else if (exactMatchups[reverseKey]) {
      return 100 - exactMatchups[reverseKey]
    }
    
    // データベースにない場合の推定計算
    const isPair1 = hand1.length === 2 && hand1[0] === hand1[1]
    const isPair2 = hand2.length === 2 && hand2[0] === hand2[1]
    
    // カードの強さを数値化
    const rankValue: { [key: string]: number } = {
      'A': 14, 'K': 13, 'Q': 12, 'J': 11, 'T': 10,
      '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
    }
    
    if (isPair1 && isPair2) {
      // ペア vs ペア
      const rank1 = rankValue[hand1[0]]
      const rank2 = rankValue[hand2[0]]
      if (rank1 > rank2) return 80.5
      if (rank1 < rank2) return 19.5
      return 50 // 同じペア（実際にはありえないが）
    } else if (isPair1 && !isPair2) {
      // ペア vs 非ペア
      const pairRank = rankValue[hand1[0]]
      const high1 = rankValue[hand2[0]]
      const high2 = rankValue[hand2[1]]
      
      // ペアが相手のカードを含む場合
      if (hand1[0] === hand2[0] || hand1[0] === hand2[1]) {
        return 88 // ドミネート状況
      }
      
      // 基本勝率
      let baseRate = 55
      
      // ペアのランクによる調整
      if (pairRank >= 12) baseRate += 10 // QQ以上
      else if (pairRank >= 10) baseRate += 5 // TT-JJ
      
      // 相手のカードによる調整
      if (high1 === 14 || high2 === 14) baseRate -= 3 // Aを含む
      if (high1 === 13 || high2 === 13) baseRate -= 2 // Kを含む
      if (hand2.endsWith('s')) baseRate -= 2 // スーテッド
      
      return Math.min(Math.max(baseRate, 45), 85)
    } else if (!isPair1 && isPair2) {
      // 非ペア vs ペア（上記の逆）
      return 100 - getWinRate(hand2, hand1)
    } else {
      // 非ペア vs 非ペア
      const high1a = rankValue[hand1[0]]
      const high1b = rankValue[hand1[1]]
      const high2a = rankValue[hand2[0]]
      const high2b = rankValue[hand2[1]]
      
      const max1 = Math.max(high1a, high1b)
      const max2 = Math.max(high2a, high2b)
      const min1 = Math.min(high1a, high1b)
      const min2 = Math.min(high2a, high2b)
      
      // ドミネート状況のチェック
      if (max1 === max2 && min1 > min2) return 70
      if (max1 === max2 && min1 < min2) return 30
      if (max1 > max2 && min1 === min2) return 70
      if (max1 < max2 && min1 === min2) return 30
      
      // 通常の高カード対決
      let winRate = 50
      const highDiff = (max1 + min1) - (max2 + min2)
      winRate += highDiff * 2
      
      // スーテッドボーナス
      if (hand1.endsWith('s')) winRate += 2
      if (hand2.endsWith('s')) winRate -= 2
      
      return Math.min(Math.max(winRate, 25), 75)
    }
  }
  
  const winRate = showResult ? getWinRate(myHand, oppHand) : 50
  const loseRate = showResult ? (100 - winRate) : 50
  
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-indigo-100">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
        ⚔️ ハンド vs ハンド勝率計算
      </h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* 自分のハンド */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="text-xs font-bold text-gray-700 mb-2 text-center">🎯 あなたのハンド</div>
          <select 
            value={myHand}
            onChange={(e) => {
              setMyHand(e.target.value)
              setShowResult(false)
            }}
            className="w-full p-2 border-2 border-blue-300 rounded-lg text-center font-bold bg-white text-gray-900"
          >
            {commonHands.map(hand => (
              <option key={hand} value={hand}>{hand}</option>
            ))}
          </select>
          <div className="mt-3 text-center">
            <div className="text-3xl font-black text-gray-900">
              {myHand.length === 2 && myHand[0] === myHand[1] ? 
                `${myHand[0]}♠ ${myHand[1]}♥` :
                myHand.endsWith('s') ? 
                `${myHand[0]}♠ ${myHand[1]}♠` :
                `${myHand[0]}♠ ${myHand[1]}♥`
              }
            </div>
            <div className="text-xs text-gray-600 font-semibold mt-1">
              {myHand.length === 2 && myHand[0] === myHand[1] ? 'ポケットペア' :
               myHand.endsWith('s') ? 'スーテッド' : 'オフスート'}
            </div>
          </div>
        </div>
        
        {/* 相手のハンド */}
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-200">
          <div className="text-xs font-bold text-gray-700 mb-2 text-center">👤 相手のハンド</div>
          <select 
            value={oppHand}
            onChange={(e) => {
              setOppHand(e.target.value)
              setShowResult(false)
            }}
            className="w-full p-2 border-2 border-red-300 rounded-lg text-center font-bold bg-white text-gray-900"
          >
            {commonHands.map(hand => (
              <option key={hand} value={hand}>{hand}</option>
            ))}
          </select>
          <div className="mt-3 text-center">
            <div className="text-3xl font-black text-gray-900">
              {oppHand.length === 2 && oppHand[0] === oppHand[1] ? 
                `${oppHand[0]}♦ ${oppHand[1]}♣` :
                oppHand.endsWith('s') ? 
                `${oppHand[0]}♦ ${oppHand[1]}♦` :
                `${oppHand[0]}♦ ${oppHand[1]}♣`
              }
            </div>
            <div className="text-xs text-gray-600 font-semibold mt-1">
              {oppHand.length === 2 && oppHand[0] === oppHand[1] ? 'ポケットペア' :
               oppHand.endsWith('s') ? 'スーテッド' : 'オフスート'}
            </div>
          </div>
        </div>
      </div>
      
      {/* バトルボタン */}
      <button
        onClick={() => setShowResult(true)}
        className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all mb-4"
      >
        ⚔️ 勝率を計算する
      </button>
      
      {/* 結果表示 */}
      {showResult && (
        <div className="space-y-3">
          {/* プログレスバー形式の結果 */}
          <div className="bg-gray-100 rounded-xl p-4">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-gray-900">{myHand}</span>
              <span className="text-xs font-semibold text-gray-600">VS</span>
              <span className="font-bold text-gray-900">{oppHand}</span>
            </div>
            <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="absolute left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                style={{ width: `${winRate}%` }}
              />
              <div 
                className="absolute right-0 h-full bg-gradient-to-l from-red-500 to-red-600"
                style={{ width: `${loseRate}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-sm drop-shadow-lg">
                  {winRate.toFixed(2)}% - {loseRate.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
          
          {/* 詳細結果 */}
          <div className="grid grid-cols-2 gap-2">
            <div className={`rounded-xl p-3 text-center ${
              winRate > loseRate ? 'bg-gradient-to-br from-green-100 to-emerald-200 border border-green-300' : 
              winRate < loseRate ? 'bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300' :
              'bg-gradient-to-br from-yellow-100 to-amber-200 border border-yellow-300'
            }`}>
              <div className="text-3xl font-black text-gray-900">{winRate.toFixed(2)}%</div>
              <div className="text-xs font-bold text-gray-700">勝率</div>
            </div>
            <div className={`rounded-xl p-3 text-center ${
              loseRate > winRate ? 'bg-gradient-to-br from-red-100 to-pink-200 border border-red-300' : 
              'bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300'
            }`}>
              <div className="text-3xl font-black text-gray-900">{loseRate.toFixed(2)}%</div>
              <div className="text-xs font-bold text-gray-700">敗率</div>
            </div>
          </div>
          
          {/* アドバイス */}
          <div className={`rounded-xl p-3 text-center ${
            winRate >= 70 ? 'bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300' :
            winRate >= 55 ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-300' :
            winRate >= 45 ? 'bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-300' :
            'bg-gradient-to-r from-red-100 to-pink-100 border border-red-300'
          }`}>
            <div className="text-sm font-bold text-gray-900">
              {winRate >= 70 ? '💪 圧倒的有利！積極的にプレイしましょう' :
               winRate >= 55 ? '👍 有利な状況です' :
               winRate >= 45 ? '⚖️ ほぼ互角。ポジションを考慮しましょう' :
               '⚠️ 不利な状況。慎重にプレイしましょう'}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ハンドレンジマトリックスを生成する関数
const HandRangeMatrix = ({ position, style }: { position: string; style: string }) => {
  const ranks = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']
  const selectedRange = handRanges[position]?.[style] || { raise: [], call: [] }
  
  const getHandColor = (hand: string) => {
    if (selectedRange.raise.includes(hand)) {
      return 'bg-gradient-to-br from-red-500 to-red-600 text-white border-red-700'
    }
    if (selectedRange.call.includes(hand)) {
      return 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white border-yellow-600'
    }
    return 'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-400 border-gray-300'
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="mx-auto">
        <thead>
          <tr>
            <th className="w-8 h-8"></th>
            {ranks.map(rank => (
              <th key={rank} className="w-8 h-8 text-xs font-bold text-gray-700">
                {rank}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ranks.map((rowRank, i) => (
            <tr key={rowRank}>
              <th className="w-8 h-8 text-xs font-bold text-gray-700">{rowRank}</th>
              {ranks.map((colRank, j) => {
                let hand = ''
                if (i < j) {
                  hand = `${rowRank}${colRank}s`
                } else if (i > j) {
                  hand = `${colRank}${rowRank}o`
                } else {
                  hand = `${rowRank}${rowRank}`
                }
                
                return (
                  <td key={`${i}-${j}`} className="p-0.5">
                    <div className={`w-7 h-7 flex items-center justify-center text-[10px] font-bold rounded border ${getHandColor(hand)} transition-all hover:scale-110 cursor-pointer`}>
                      {hand}
                    </div>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function LessonPage() {
  const router = useRouter() 
  const [user, setUser] = useState<any>(null)
  const [selectedPosition, setSelectedPosition] = useState('BTN')
  const [selectedStyle, setSelectedStyle] = useState('スタンダード')
  const [learnedTerms, setLearnedTerms] = useState<Set<string>>(new Set())
  const [selectedCategory, setSelectedCategory] = useState('全て')
  const [currentOuts, setCurrentOuts] = useState(9)
  const [potSize, setPotSize] = useState(10000)
  const [callAmount, setCallAmount] = useState(3000)
  const [activeTab, setActiveTab] = useState('range')
  const [currentStreet, setCurrentStreet] = useState<'flop' | 'turn'>('flop') //

  // ユーザー取得と学習済み用語の読み込み
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await fetchLearnedTerms(user.id)
      }
    }
    init()
  }, [])

  // 学習済み用語をSupabaseから取得
  const fetchLearnedTerms = async (userId: string) => {
    const { data } = await supabase
      .from('learned_terms')
      .select('term_name')
      .eq('user_id', userId)
    
    if (data) {
      setLearnedTerms(new Set(data.map(item => item.term_name)))
    }
  }

  // 用語のチェック/アンチェックを切り替え
  const toggleLearnedTerm = async (term: string) => {
    if (!user) return

    const newTerms = new Set(learnedTerms)
    
    if (newTerms.has(term)) {
      // 削除
      newTerms.delete(term)
      await supabase
        .from('learned_terms')
        .delete()
        .eq('user_id', user.id)
        .eq('term_name', term)
    } else {
      // 追加
      newTerms.add(term)
      await supabase
        .from('learned_terms')
        .insert({
          user_id: user.id,
          term_name: term
        })
    }
    
    setLearnedTerms(newTerms)
  }

  // 全リセット
  const resetLearnedTerms = async () => {
    if (!user) return
    
    await supabase
      .from('learned_terms')
      .delete()
      .eq('user_id', user.id)
    
    setLearnedTerms(new Set())
  }

  // アウツ計算
  const turnProb = (currentOuts / 47) * 100
  const riverProb = (currentOuts / 46) * 100
  const turnOrRiverProb = (1 - ((47 - currentOuts) / 47) * ((46 - currentOuts) / 46)) * 100

  // ポットオッズ計算
  const potOdds = callAmount > 0 ? (callAmount / (potSize + callAmount)) * 100 : 0
  const shouldCall = turnOrRiverProb >= potOdds

  // 用語の総数と習得率
  const totalTerms = Object.values(pokerTerms).reduce((acc, cat) => acc + Object.keys(cat).length, 0)
  const learnedPercentage = (learnedTerms.size / totalTerms) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container max-w-md mx-auto p-4 pb-20">
        <div className="mb-6">
          {/* 戻るボタンを追加 */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-sm shadow-md hover:shadow-lg transition-all mb-4"
          >
            <ArrowLeft className="h-5 w-5 text-gray-900" />
          </button>
          
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
            📖 ポーカーレッスン
          </h1>
          <p className="text-gray-800 mt-2 font-medium">戦略とスキルを磨こう</p>
        </div>

        {/* タブナビゲーション */}
        <div className="flex gap-1 mb-6 bg-white/80 backdrop-blur-sm rounded-2xl p-1.5 shadow-lg">
          {[
            { id: 'range', icon: '📊', label: 'レンジ' },
            { id: 'calc', icon: '🎲', label: '確率' },
            { id: 'terms', icon: '📚', label: '用語' },
            { id: 'tournament', icon: '🏆', label: '大会' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-3 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-700 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span className="block text-lg mb-1">{tab.icon}</span>
              <span className="text-xs font-semibold">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ハンドレンジタブ */}
        {activeTab === 'range' && (
          <div className="space-y-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-violet-100">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <Target className="w-5 h-5 text-violet-600" />
                オープニングハンドレンジ
              </h2>

              {/* ポジション選択 */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-bold text-gray-900">ポジション</label>
                <div className="grid grid-cols-3 gap-2">
                  {['UTG', 'MP', 'CO', 'BTN', 'SB', 'BB'].map((pos) => (
                    <button
                      key={pos}
                      onClick={() => setSelectedPosition(pos)}
                      className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                        selectedPosition === pos
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-white text-gray-800 hover:bg-violet-50 border border-gray-200'
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* スタイル選択 */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-bold text-gray-900">プレイスタイル</label>
                <div className="grid grid-cols-3 gap-2">
                  {['タイト', 'スタンダード', 'アグレッシブ'].map((style) => (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-all transform hover:scale-105 ${
                        selectedStyle === style
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg'
                          : 'bg-white text-gray-800 hover:bg-violet-50 border border-gray-200'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>

              {/* 統計表示 */}
              <div className="bg-gradient-to-r from-violet-100 to-indigo-100 rounded-2xl p-4 mb-4 border border-violet-200">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-3xl font-black text-violet-700">
                      {handRanges[selectedPosition]?.[selectedStyle]?.raise?.length || 0}
                    </div>
                    <div className="text-xs font-bold text-gray-800">レイズ</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-indigo-700">
                      {handRanges[selectedPosition]?.[selectedStyle]?.call?.length || 0}
                    </div>
                    <div className="text-xs font-bold text-gray-800">コール</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black text-purple-700">
                      {(((handRanges[selectedPosition]?.[selectedStyle]?.raise?.length || 0) + 
                         (handRanges[selectedPosition]?.[selectedStyle]?.call?.length || 0)) / 169 * 100).toFixed(1)}%
                    </div>
                    <div className="text-xs font-bold text-gray-800">参加率</div>
                  </div>
                </div>
              </div>

              {/* ハンドレンジマトリックス */}
              <div className="bg-gradient-to-br from-gray-50 to-violet-50 rounded-2xl p-4 border border-violet-100">
                <div className="text-sm font-bold mb-3 text-gray-900">
                  ハンドマトリックス（{selectedPosition} - {selectedStyle}）
                </div>
                <HandRangeMatrix position={selectedPosition} style={selectedStyle} />
                <div className="mt-3 flex gap-4 justify-center text-xs">
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gradient-to-br from-red-500 to-red-600 rounded border border-red-700"></div>
                    <span className="font-bold text-gray-700">レイズ</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-amber-500 rounded border border-yellow-600"></div>
                    <span className="font-bold text-gray-700">コール</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-4 h-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded border border-gray-300"></div>
                    <span className="font-bold text-gray-700">フォールド</span>
                  </div>
                </div>
              </div>

              {/* ポジション戦略の説明 */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-200 mt-4">
                <div className="text-sm font-bold mb-2 text-gray-900 flex items-center gap-2">
                  <Info className="w-4 h-4 text-indigo-600" />
                  なぜこの戦略なのか？
                </div>
                <p className="text-xs text-gray-800 font-medium leading-relaxed">
                  {positionStrategies[selectedPosition]?.[selectedStyle]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 確率計算タブ */}
        {activeTab === 'calc' && (
          <div className="space-y-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-green-100">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
                <TrendingUp className="w-5 h-5 text-green-600" />
                アウツ・改善確率計算
              </h2>

              {/* アウツ選択 */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-bold text-gray-900">ドローの種類</label>
                <select 
                  className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 focus:border-violet-600 bg-white text-gray-900 font-semibold"
                  onChange={(e) => {
                    const outsMap: { [key: string]: number } = {
                      'flush': 9,
                      'oesd': 8,
                      'gutshot': 4,
                      'twopair': 4,
                      'set': 2,
                      'overcards': 6
                    }
                    setCurrentOuts(outsMap[e.target.value] || 8)
                  }}
                >
                  <option value="flush">フラッシュドロー（9アウツ）</option>
                  <option value="oesd">オープンエンドストレート（8アウツ）</option>
                  <option value="gutshot">ガットショット（4アウツ）</option>
                  <option value="twopair">ツーペア→フルハウス（4アウツ）</option>
                  <option value="set">ペア→セット（2アウツ）</option>
                  <option value="overcards">オーバーカード2枚（6アウツ）</option>
                </select>
              </div>

              {/* カスタムアウツ */}
              <div className="space-y-2 mb-4">
                <label className="text-sm font-bold text-gray-900">
                  アウツ数: <span className="text-violet-600 text-lg font-black">{currentOuts}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={currentOuts}
                  onChange={(e) => setCurrentOuts(Number(e.target.value))}
                  className="w-full accent-violet-600"
                />
              </div>

              {/* 確率表示 */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-3 text-center border border-blue-300">
                  <div className="text-2xl font-black text-blue-800">
                    {turnProb.toFixed(1)}%
                  </div>
                  <div className="text-xs font-bold text-blue-900">ターン</div>
                </div>
                <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-3 text-center border border-green-300">
                  <div className="text-2xl font-black text-green-800">
                    {riverProb.toFixed(1)}%
                  </div>
                  <div className="text-xs font-bold text-green-900">リバー</div>
                </div>
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-3 text-center border border-purple-300">
                  <div className="text-2xl font-black text-purple-800">
                    {turnOrRiverProb.toFixed(1)}%
                  </div>
                  <div className="text-xs font-bold text-purple-900">どちらか</div>
                </div>
              </div>

              {/* ポットオッズ計算 */}
              <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl p-4 border border-orange-200">
                <h3 className="font-bold text-base mb-3 text-gray-900">💰 ポットオッズ判断</h3>
                
                {/* フロップ/ターン選択 */}
                <div className="mb-3">
                  <label className="text-xs font-bold text-gray-800 mb-2 block">現在のストリート</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCurrentStreet('flop')}
                      className={`py-2 rounded-lg text-sm font-bold transition-all ${
                        currentStreet === 'flop'
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-300'
                      }`}
                    >
                      🃏 フロップ
                    </button>
                    <button
                      onClick={() => setCurrentStreet('turn')}
                      className={`py-2 rounded-lg text-sm font-bold transition-all ${
                        currentStreet === 'turn'
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border border-gray-300'
                      }`}
                    >
                      🎴 ターン
                    </button>
                  </div>
                  <p className="text-xs text-gray-700 font-semibold mt-1 text-center">
                    {currentStreet === 'flop' ? 'ターン+リバー両方の確率を使用' : 'リバーのみの確率を使用'}
                  </p>
                </div>

                {/* ポットサイズ */}
                <div className="mb-3">
                  <label className="text-xs font-bold text-gray-800 mb-1 block">ポットサイズ (P)</label>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setPotSize(Math.max(0, potSize - 500))}
                      className="w-10 h-10 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 active:scale-95 flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={potSize === 0 ? '' : potSize}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === '') {
                          setPotSize(0)
                        } else {
                          setPotSize(Math.max(0, Number(val)))
                        }
                      }}
                      onBlur={() => {
                        if (potSize === 0) setPotSize(0)
                      }}
                      className="flex-1 p-2 border-2 border-orange-200 rounded-lg text-center font-bold text-gray-900 bg-white"
                      placeholder="0"
                      min="0"
                    />
                    <button
                      onClick={() => setPotSize(potSize + 500)}
                      className="w-10 h-10 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 active:scale-95 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* コール額 */}
                <div className="mb-3">
                  <label className="text-xs font-bold text-gray-800 mb-1 block">コール額 (P)</label>
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setCallAmount(Math.max(0, callAmount - 500))}
                      className="w-10 h-10 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 active:scale-95 flex items-center justify-center"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={callAmount === 0 ? '' : callAmount}
                      onChange={(e) => {
                        const val = e.target.value
                        if (val === '') {
                          setCallAmount(0)
                        } else {
                          setCallAmount(Math.max(0, Number(val)))
                        }
                      }}
                      onBlur={() => {
                        if (callAmount === 0) setCallAmount(0)
                      }}
                      className="flex-1 p-2 border-2 border-orange-200 rounded-lg text-center font-bold text-gray-900 bg-white"
                      placeholder="0"
                      min="0"
                    />
                    <button
                      onClick={() => setCallAmount(callAmount + 500)}
                      className="w-10 h-10 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 active:scale-95 flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* 判定結果 */}
                {(() => {
                  const relevantProb = currentStreet === 'turn' ? riverProb : turnOrRiverProb
                  const shouldCallNow = relevantProb >= potOdds
                  
                  return (
                    <div className={`rounded-xl p-3 ${shouldCallNow ? 'bg-gradient-to-r from-green-200 to-green-300 border border-green-400' : 'bg-gradient-to-r from-red-200 to-red-300 border border-red-400'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-gray-900">
                            必要勝率: {potOdds.toFixed(1)}%
                          </div>
                          <div className="text-xs font-semibold text-gray-800">
                            改善確率: {relevantProb.toFixed(1)}%
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-black ${
                          shouldCallNow ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                        }`}>
                          {shouldCallNow ? '✓ コール推奨' : '✗ フォールド推奨'}
                        </span>
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            {/* ハンドvsハンド勝率計算 */}
            <HandVsHandCalculator />

            {/* 簡易計算法 */}
            <div className="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl p-4 border border-cyan-200">
              <h3 className="font-bold text-base mb-3 flex items-center gap-2 text-gray-900">
                <Sparkles className="w-4 h-4" />
                2-4ルール（簡易暗算法）
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-blue-600 text-white rounded text-xs font-bold">ターン</span>
                  <span className="font-semibold text-gray-800">アウツ数 × 2 = おおよその確率(%)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-green-600 text-white rounded text-xs font-bold">ターン+リバー</span>
                  <span className="font-semibold text-gray-800">アウツ数 × 4 = おおよその確率(%)</span>
                </div>
                <div className="mt-3 p-2 bg-white rounded-lg text-xs font-semibold text-gray-700">
                  例：フラッシュドロー（9アウツ）<br />
                  ターン: 9×2=約18% / 両方: 9×4=約36%
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 用語集タブ */}
        {activeTab === 'terms' && (
          <div className="space-y-4">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-purple-100">
              <h2 className="text-lg font-bold mb-2 text-gray-900">📚 ポーカー用語集</h2>
              <div className="mb-4">
                <div className="bg-gradient-to-r from-violet-200 to-purple-200 rounded-lg h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-violet-600 to-purple-600 h-full transition-all"
                    style={{ width: `${learnedPercentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs font-bold text-gray-800 mt-1">
                  <span>{learnedTerms.size}/{totalTerms} 習得済み</span>
                  <span>{learnedPercentage.toFixed(1)}%</span>
                </div>
              </div>

              {/* カテゴリ選択 */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
                <button
                  onClick={() => setSelectedCategory('全て')}
                  className={`px-3 py-1 rounded-full text-xs whitespace-nowrap font-bold ${
                    selectedCategory === '全て'
                      ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  全て
                </button>
                {Object.keys(pokerTerms).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs whitespace-nowrap font-bold ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* 用語リスト */}
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {Object.entries(pokerTerms).map(([category, terms]) => {
                  if (selectedCategory !== '全て' && selectedCategory !== category) return null
                  
                  return (
                    <div key={category}>
                      {selectedCategory === '全て' && (
                        <h3 className="font-bold text-sm text-gray-900 mb-2 sticky top-0 bg-white/90 py-1">{category}</h3>
                      )}
                      <div className="space-y-2">
                        {Object.entries(terms).map(([term, description]) => (
                          <div 
                            key={term} 
                            className={`rounded-lg p-3 border transition-all ${
                              learnedTerms.has(term) 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' 
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <h4 className="font-bold text-sm text-gray-900">{term}</h4>
                                <p className="text-xs text-gray-700 mt-1 font-medium">{description}</p>
                              </div>
                              <button
                                onClick={() => toggleLearnedTerm(term)}
                                className="p-1 transition-transform hover:scale-110"
                              >
                                {learnedTerms.has(term) ? 
                                  <CheckSquare className="w-5 h-5 text-green-600" /> : 
                                  <Square className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                                }
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* リセットボタン */}
              {learnedTerms.size > 0 && (
                <button
                  onClick={resetLearnedTerms}
                  className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:from-gray-200 hover:to-gray-300 transition-all border border-gray-300"
                >
                  <RotateCcw className="w-4 h-4" />
                  習得状態をリセット
                </button>
              )}
            </div>
          </div>
        )}

        {/* 大会情報タブ */}
        {activeTab === 'tournament' && (
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-5 border border-yellow-100">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900">
              <Trophy className="w-5 h-5 text-yellow-600" />
              アジア大会情報
            </h2>
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full mb-4 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-bold mb-2 text-gray-900">Coming Soon!</h3>
              <p className="text-sm text-gray-700 font-semibold">
                アジア大会の情報は<br />
                次回アップデートで追加予定です
              </p>
              <div className="mt-6 bg-gradient-to-r from-gray-50 to-violet-50 rounded-xl p-4 border border-violet-200">
                <div className="text-xs font-bold text-gray-800 mb-2">予定コンテンツ</div>
                <ul className="text-sm text-left space-y-1">
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-violet-600" />
                    <span className="font-semibold text-gray-800">大会スケジュール</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-violet-600" />
                    <span className="font-semibold text-gray-800">参加方法・エントリー</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-violet-600" />
                    <span className="font-semibold text-gray-800">賞金・ポイント情報</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <ChevronRight className="w-3 h-3 text-violet-600" />
                    <span className="font-semibold text-gray-800">過去の結果・統計</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}