'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, TrendingUp, AlertCircle, Info, RotateCcw, 
  Zap, Target, RefreshCw, ChevronRight, Flame, Brain,
  DollarSign, Activity, BarChart3, Sparkles, Undo, X
} from 'lucide-react'

// 投資法の型定義
type BettingSystem = 'martingale' | 'paroli' | 'montecarlo' | 'cocomo' | 'dalembert' | 'system31'

// 履歴の型定義
type HistoryItem = {
  round: number
  bet: number
  result: 'win' | 'lose'
  profit: number
  balance: number
  // 投資法固有の状態を保存
  snapshot: {
    sequence?: number[]
    prevBet?: number
    prevPrevBet?: number
    system31Step?: number
    dalembertUnits?: number
    streakCount?: number
    lastResult?: 'win' | 'lose' | null
  }
}

// 投資法の説明データ
const systemDescriptions = {
  martingale: {
    name: 'マーチンゲール法',
    riskLevel: 5,
    description: '負けたら倍額、勝ったらリセット。最も有名だが最も危険な投資法。',
    history: '18世紀フランスのカジノで生まれた最古の投資法。「必ず勝てる」という誤解が広まったが、実際には破産リスクが極めて高い。',
    howItWorks: '初回ベット額から開始し、負ける度に前回の2倍を賭ける。1回勝てば初回ベット額分の利益が出る。2倍配当のゲーム専用。',
    probability: '10連敗の確率は約0.1%（1000回に1回）。しかし長期的には必ず発生する。',
    risk: '連敗が続くと賭け金が指数関数的に増大。7連敗で128倍、10連敗で1024倍になり、テーブルリミットや資金不足で破綻する。',
    advice: '短期的な小さな利益しか得られないのに、破産リスクは非常に高い。エンターテイメントとして楽しむ程度に留めるべき。'
  },
  paroli: {
    name: 'パーレー法（逆マーチンゲール）',
    riskLevel: 3,
    description: '勝ったら倍額、負けたらリセット。攻撃的な投資法。',
    history: '16世紀イタリアで生まれた投資法。「パーレー（Paroli）」はイタリア語で「倍にする」を意味する。',
    howItWorks: '初回ベット額から開始し、勝つ度に前回の2倍を賭ける。負けたら初回ベット額にリセット。2倍配当のゲーム専用。',
    probability: '3連勝の確率は約12.5%（8回に1回）。5連勝は約3.1%（32回に1回）。',
    risk: '連勝が続かないと利益が出ない。1回負けると積み上げた利益が全て消える。利益確定のタイミングが難しい。',
    advice: '3〜5連勝したら必ず利益確定してリセットする。欲張ると全てを失う。マーチンゲールよりは安全だが、連勝は続かない。'
  },
  montecarlo: {
    name: 'モンテカルロ法',
    riskLevel: 2,
    description: '数列を使った賭け金管理。最も理論的で安全性が高い。',
    history: 'モナコのモンテカルロカジノを破産させたという伝説がある投資法（実際には都市伝説）。19世紀後半に数学者が考案。',
    howItWorks: '数列[1,2,3]からスタート。両端の合計（1+3=4）×1ベット額を賭ける。勝ったら両端を消し、負けたら賭けた単位数を右端に追加。2倍配当では数列が全て消えたら1セット完了。',
    probability: '3倍配当のゲーム向けに設計されているが、2倍配当でも使用可能。マーチンゲールより緩やかに賭け金が増える。',
    risk: '連敗が続くと数列が長くなり賭け金が膨らむが、マーチンゲールほど急激ではない。メモが必要で初心者には難しい。',
    advice: '最も理論的で安全性が高い投資法。ただし長期的にはハウスエッジに負ける。数列管理が面倒なので、慣れが必要。'
  },
  cocomo: {
    name: 'ココモ法',
    riskLevel: 4,
    description: '前回+前々回の賭け金を賭ける。フィボナッチ数列的な増加。',
    history: '1980年代に考案された比較的新しい投資法。3倍配当のゲーム向けに設計されている。',
    howItWorks: '初回と2回目は1ベット額。3回目以降は前回+前々回の賭け金を賭ける（例：1000→1000→2000→3000→5000→8000...）',
    probability: '本来はルーレットのダズンベット（3倍配当）用。2倍配当では効率が悪い。',
    risk: 'マーチンゲールより緩やかだが、連敗が続くと回復に時間がかかる。2倍配当のゲームでは利益が出にくい。',
    advice: '3倍配当のゲーム専用。バカラやルーレットの赤黒など2倍配当では非推奨。連敗時の賭け金増加は比較的穏やか。'
  },
  dalembert: {
    name: "ダランベール法",
    riskLevel: 2,
    description: '負けたら+1単位、勝ったら-1単位。最も安定的。',
    history: '18世紀フランスの数学者ジャン・ル・ロン・ダランベールが考案。「自然の均衡理論」に基づく。',
    howItWorks: '1ベット額を1単位とし、負けたら1単位（1ベット額）増やし、勝ったら1単位減らす。最低ベット額より下がらない。',
    probability: '勝率50%の場合、長期的には損益がほぼ均衡する（ハウスエッジを除く）。',
    risk: '非常に安定的で大負けしにくい。ただし大勝ちも期待できない。勝率50%以下だと徐々に資金が減る。',
    advice: '最も堅実で初心者向け。エンターテイメントとして長く楽しみたい人に最適。利益は小さいが破産リスクも低い。'
  },
  system31: {
    name: '31システム',
    riskLevel: 3,
    description: '9回で31単位を使い切る固定戦略。損失が明確。',
    history: '2000年代に日本で考案された比較的新しいシステム。損失額が明確なのが特徴。',
    howItWorks: '9回のベットを4グループに分割（A:1,1,1 / B:2,2 / C:4,4 / D:8,8）×1ベット額。各グループで2連勝したら終了、リセット。全て負けても31単位×1ベット額の損失で済む。',
    probability: '2連勝の確率は約25%。各グループで2連勝を狙う。最悪でも31単位の損失で済む。',
    risk: '最大損失が31単位と明確。大勝ちは難しいが、リスク管理がしやすい。',
    advice: '損失額が明確なので資金管理が簡単。2連勝を狙うシンプルな戦略。初心者にも分かりやすい。'
  }
}

export default function BettingSimulator() {
  const router = useRouter()
  
  // 基本設定（配当は2倍固定）
  const [activeSystem, setActiveSystem] = useState<BettingSystem>('martingale')
  const [unitBet, setUnitBet] = useState(1000) // 「1ベット額」に変更
  const [budget, setBudget] = useState(30000)
  const payout = 2.0 // 固定
  
  // 投資法に応じた初期ベット額を計算
  const getInitialBet = (system: BettingSystem, unit: number) => {
    switch (system) {
      case 'montecarlo':
        return 4 * unit // [1,2,3]の両端の合計 = 1+3=4
      default:
        return unit
    }
  }
  
  // ゲーム状態
  const [currentBet, setCurrentBet] = useState(() => getInitialBet('martingale', 1000))
  const [totalInvested, setTotalInvested] = useState(0)
  const [totalProfit, setTotalProfit] = useState(0)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [sequence, setSequence] = useState([1, 2, 3]) // モンテカルロ用
  const [prevBet, setPrevBet] = useState(1000) // ココモ用：前々回のベット
  const [prevPrevBet, setPrevPrevBet] = useState(1000) // ココモ用：前回のベット
  const [system31Step, setSystem31Step] = useState(0) // 31システム用：0-8のステップ
  const [streakCount, setStreakCount] = useState(0) // 連勝/連敗カウント
  const [lastResult, setLastResult] = useState<'win' | 'lose' | null>(null)
  const [dalembertUnits, setDalembertUnits] = useState(1) // ダランベール用：現在の単位数
  const [showBankruptAlert, setShowBankruptAlert] = useState(false) // 破産アラート表示フラグ

  // 31システムのベット配列
  const system31Bets = [1, 1, 1, 2, 2, 4, 4, 8, 8]

  // 破産確率計算
  const calculateBankruptcyProbability = () => {
    if (unitBet === 0 || budget === 0) {
      return { probability: 0, losses: 0 }
    }
    
    const winRate = 0.5 // 2倍配当なので50%固定
    const loseRate = 0.5
    const initialBet = getInitialBet(activeSystem, unitBet)
    
    if (activeSystem === 'martingale') {
      // マーチンゲール：予算内で何連敗できるかを計算
      let bet = initialBet
      let totalNeeded = 0
      let losses = 0
      
      while (totalNeeded + bet <= budget) {
        totalNeeded += bet
        bet *= 2
        losses++
      }
      
      // n連敗する確率
      const bankruptcyProb = Math.pow(loseRate, losses) * 100
      return { probability: bankruptcyProb, losses }
      
    } else if (activeSystem === 'paroli') {
      // パーレー：予算を使い切るまでの連敗回数を計算
      const maxLosses = Math.floor(budget / initialBet)
      const bankruptcyProb = Math.pow(loseRate, maxLosses) * 100
      return { probability: bankruptcyProb, losses: maxLosses }
      
    } else if (activeSystem === 'montecarlo') {
      // モンテカルロ：簡易計算（平均的なケース）
      // 数列が[1,2,3]の場合、最初のベットは4単位
      // 負け続けると数列が伸びるが、簡易的に平均ベット額で計算
      const avgBetMultiplier = 4 // 初期ベットの倍率
      const avgBet = unitBet * avgBetMultiplier
      const estimatedLosses = Math.floor(budget / avgBet)
      
      // モンテカルロは複雑なので、保守的に見積もる
      // 実際には勝ち負けの組み合わせで変わるため、やや高めに設定
      const bankruptcyProb = Math.pow(loseRate, Math.floor(estimatedLosses * 0.7)) * 100
      return { probability: Math.max(bankruptcyProb, 0.01), losses: estimatedLosses }
      
    } else if (activeSystem === 'cocomo') {
      // ココモ：フィボナッチ数列的増加
      let bet1 = unitBet
      let bet2 = unitBet
      let totalNeeded = bet1 + bet2
      let losses = 2
      
      while (totalNeeded < budget) {
        const nextBet = bet1 + bet2
        if (totalNeeded + nextBet > budget) break
        totalNeeded += nextBet
        bet1 = bet2
        bet2 = nextBet
        losses++
      }
      
      const bankruptcyProb = Math.pow(loseRate, losses) * 100
      return { probability: bankruptcyProb, losses }
      
    } else if (activeSystem === 'dalembert') {
      // ダランベール：1単位ずつ増加
      let currentBet = unitBet
      let totalNeeded = 0
      let losses = 0
      
      while (totalNeeded + currentBet <= budget) {
        totalNeeded += currentBet
        currentBet += unitBet
        losses++
      }
      
      const bankruptcyProb = Math.pow(loseRate, losses) * 100
      return { probability: bankruptcyProb, losses }
      
    } else if (activeSystem === 'system31') {
    // 31システム：各ステップまでの累計必要額を計算
    const system31Bets = [1, 1, 1, 2, 2, 4, 4, 8, 8]
    let cumulativeCost = 0
    let affordableSteps = 0
    
    for (let i = 0; i < system31Bets.length; i++) {
        const stepCost = system31Bets[i] * unitBet
        if (cumulativeCost + stepCost <= budget) {
        cumulativeCost += stepCost
        affordableSteps++
        } else {
        break
        }
    }
    
    if (affordableSteps < 9) {
        // 9ステップ全てをプレイできない場合
        // そのステップまでに2連勝できない確率を概算
        // 簡易計算：各ステップで2連勝できない確率の近似
        const no2WinProb = Math.pow(0.75, affordableSteps) * 100 // 2連勝できない確率の近似
        return { probability: Math.min(99, no2WinProb), losses: affordableSteps }
    }
    
    // 9ステップ全て可能な場合：一度も2連勝できない確率
    // 非常に低い確率（実際の計算は複雑なので簡易版）
    const allLoseProbability = Math.pow(0.5, 9) * 100
    return { probability: allLoseProbability, losses: 9 }
}
    
    return { probability: 0, losses: 0 }
  }

  // 次のベット額を計算
  const calculateNextBet = (isWin: boolean) => {
    if (unitBet === 0) return 1
    
    switch (activeSystem) {
      case 'martingale':
        if (isWin) return unitBet
        return currentBet * 2
      
      case 'paroli':
        if (isWin) return currentBet * 2
        return unitBet
      
      case 'montecarlo': {
        if (isWin) {
          const newSeq = sequence.slice(1, -1)
          if (newSeq.length === 0) return 4 * unitBet // リセット時は4×unitBet
          if (newSeq.length === 1) return newSeq[0] * unitBet
          return (newSeq[0] + newSeq[newSeq.length - 1]) * unitBet
        } else {
          // 負けた場合：賭けた単位数を追加
          const betUnits = currentBet / unitBet
          const newSeq = [...sequence, betUnits]
          return (newSeq[0] + newSeq[newSeq.length - 1]) * unitBet
        }
      }
      
      case 'cocomo':
        if (isWin) return unitBet
        if (streakCount === 0) return unitBet // 初回
        if (streakCount === 1) return unitBet // 2回目
        return prevBet + prevPrevBet
      
      case 'dalembert':
        if (isWin) {
          const newUnits = Math.max(1, dalembertUnits - 1)
          return newUnits * unitBet
        } else {
          const newUnits = dalembertUnits + 1
          return newUnits * unitBet
        }
      
      case 'system31': {
        if (isWin && streakCount >= 1) {
          // 2連勝でリセット
          return system31Bets[0] * unitBet
        }
        const nextStep = system31Step >= 8 ? 0 : system31Step + 1
        return system31Bets[nextStep] * unitBet
      }
      
      default:
        return unitBet
    }
  }

  // 勝ち/負け処理
  const handleResult = (isWin: boolean) => {
    const profit = isWin ? currentBet * (payout - 1) : -currentBet
    const newTotalInvested = totalInvested + currentBet
    const newTotalProfit = totalProfit + profit
    const newBalance = budget + newTotalProfit
    
    // 破産チェック（初めて予算を下回った場合のみアラート表示）
    if (newBalance < 0 && currentBalance >= 0) {
      setShowBankruptAlert(true)
    }
    
    // 現在の状態のスナップショットを保存
    const snapshot = {
      sequence: [...sequence],
      prevBet,
      prevPrevBet,
      system31Step,
      dalembertUnits,
      streakCount,
      lastResult
    }
    
    const newHistoryItem: HistoryItem = {
      round: history.length + 1,
      bet: currentBet,
      result: isWin ? 'win' : 'lose',
      profit,
      balance: newBalance,
      snapshot
    }
    
    setHistory([...history, newHistoryItem])
    setTotalInvested(newTotalInvested)
    setTotalProfit(newTotalProfit)
    
    // 連勝/連敗カウント更新
    if (lastResult === null || lastResult !== (isWin ? 'win' : 'lose')) {
      setStreakCount(1)
    } else {
      setStreakCount(streakCount + 1)
    }
    setLastResult(isWin ? 'win' : 'lose')
    
    // 投資法別の状態更新
    if (activeSystem === 'montecarlo') {
      if (isWin) {
        const newSeq = sequence.slice(1, -1)
        if (newSeq.length === 0) {
          setSequence([1, 2, 3]) // リセット
        } else {
          setSequence(newSeq)
        }
      } else {
        const betUnits = currentBet / unitBet
        setSequence([...sequence, betUnits])
      }
    } else if (activeSystem === 'cocomo') {
      if (isWin) {
        setPrevBet(unitBet)
        setPrevPrevBet(unitBet)
      } else {
        setPrevPrevBet(prevBet)
        setPrevBet(currentBet)
      }
    } else if (activeSystem === 'system31') {
      if (isWin && streakCount >= 1) {
        // 2連勝でリセット
        setSystem31Step(0)
      } else if (!isWin || streakCount === 0) {
        // 負けた場合または1勝目の場合は次のステップへ
        const nextStep = system31Step >= 8 ? 0 : system31Step + 1
        setSystem31Step(nextStep)
      }
    } else if (activeSystem === 'dalembert') {
      if (isWin) {
        setDalembertUnits(Math.max(1, dalembertUnits - 1))
      } else {
        setDalembertUnits(dalembertUnits + 1)
      }
    }
    
    // 次のベット額を設定
    const nextBet = calculateNextBet(isWin)
    setCurrentBet(nextBet)
  }

  // ひとつ戻る
  const handleUndo = () => {
    if (history.length === 0) return
    
    const lastItem = history[history.length - 1]
    const newHistory = history.slice(0, -1)
    
    // 収支を元に戻す
    setTotalInvested(totalInvested - lastItem.bet)
    setTotalProfit(totalProfit - lastItem.profit)
    setHistory(newHistory)
    
    // 破産アラートを非表示（元に戻した結果、予算内に収まった場合）
    const newBalance = budget + totalProfit - lastItem.profit
    if (newBalance >= 0) {
      setShowBankruptAlert(false)
    }
    
    // 状態を復元
    if (lastItem.snapshot) {
      if (lastItem.snapshot.sequence) setSequence(lastItem.snapshot.sequence)
      if (lastItem.snapshot.prevBet !== undefined) setPrevBet(lastItem.snapshot.prevBet)
      if (lastItem.snapshot.prevPrevBet !== undefined) setPrevPrevBet(lastItem.snapshot.prevPrevBet)
      if (lastItem.snapshot.system31Step !== undefined) setSystem31Step(lastItem.snapshot.system31Step)
      if (lastItem.snapshot.dalembertUnits !== undefined) setDalembertUnits(lastItem.snapshot.dalembertUnits)
      if (lastItem.snapshot.streakCount !== undefined) setStreakCount(lastItem.snapshot.streakCount)
      setLastResult(lastItem.snapshot.lastResult || null)
    }
    
    // ベット額を元に戻す
    setCurrentBet(lastItem.bet)
  }

  // リセット
  const handleReset = () => {
    const initialBet = getInitialBet(activeSystem, unitBet)
    setCurrentBet(initialBet)
    setTotalInvested(0)
    setTotalProfit(0)
    setHistory([])
    setSequence([1, 2, 3])
    setPrevBet(unitBet)
    setPrevPrevBet(unitBet)
    setSystem31Step(0)
    setStreakCount(0)
    setLastResult(null)
    setDalembertUnits(1)
    setShowBankruptAlert(false)
  }

  // 再セット
  const handleRestart = () => {
    const initialBet = getInitialBet(activeSystem, unitBet)
    setCurrentBet(initialBet)
    setSequence([1, 2, 3])
    setPrevBet(unitBet)
    setPrevPrevBet(unitBet)
    setSystem31Step(0)
    setStreakCount(0)
    setLastResult(null)
    setDalembertUnits(1)
  }

  // 投資法変更時に初期値を再計算
  const handleSystemChange = (system: BettingSystem) => {
    setActiveSystem(system)
    const initialBet = getInitialBet(system, unitBet)
    setCurrentBet(initialBet)
    setTotalInvested(0)
    setTotalProfit(0)
    setHistory([])
    setSequence([1, 2, 3])
    setPrevBet(unitBet)
    setPrevPrevBet(unitBet)
    setSystem31Step(0)
    setStreakCount(0)
    setLastResult(null)
    setDalembertUnits(1)
    setShowBankruptAlert(false)
  }

  // 連敗/連勝の確率計算
  const getStreakProbability = () => {
    if (streakCount === 0 || lastResult === null) return null
    const rate = 0.5 // 2倍配当なので50%
    const probability = Math.pow(rate, streakCount) * 100
    return { count: streakCount, type: lastResult, probability }
  }

  const bankruptcyData = calculateBankruptcyProbability()
  const streakData = getStreakProbability()
  const currentBalance = budget + totalProfit
  const isOverLimit = Math.abs(totalProfit) >= 1000000000 // 10億円

  // 視覚的な進捗表示
  const getVisualProgress = () => {
    switch (activeSystem) {
      case 'martingale':
        return (
          <div className="bg-red-950/30 rounded-xl p-3 border border-red-500/30">
            <p className="text-xs font-bold text-red-300 mb-2">倍率推移</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white">現在：</span>
              <span className="text-2xl font-black text-red-400">{currentBet / unitBet}倍</span>
            </div>
            <p className="text-xs text-red-200 mt-2">
              {lastResult === 'lose' ? `${streakCount}連敗中 - 次は${(currentBet / unitBet) * 2}倍` : '初期値'}
            </p>
          </div>
        )
      
      case 'paroli':
        return (
          <div className="bg-green-950/30 rounded-xl p-3 border border-green-500/30">
            <p className="text-xs font-bold text-green-300 mb-2">倍率推移</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white">現在：</span>
              <span className="text-2xl font-black text-green-400">{currentBet / unitBet}倍</span>
            </div>
            <p className="text-xs text-green-200 mt-2">
              {lastResult === 'win' ? `${streakCount}連勝中 - 次は${(currentBet / unitBet) * 2}倍` : '初期値'}
            </p>
          </div>
        )
      
      case 'cocomo':
        return (
          <div className="bg-orange-950/30 rounded-xl p-3 border border-orange-500/30">
            <p className="text-xs font-bold text-orange-300 mb-2">ベット推移</p>
            <div className="flex gap-2 items-center justify-center">
              <div className="text-center">
                <div className="text-xs text-gray-400">前々回</div>
                <div className="text-lg font-black text-orange-400">{prevPrevBet.toLocaleString()}円</div>
              </div>
              <span className="text-white text-xl">+</span>
              <div className="text-center">
                <div className="text-xs text-gray-400">前回</div>
                <div className="text-lg font-black text-orange-400">{prevBet.toLocaleString()}円</div>
              </div>
              <span className="text-white text-xl">=</span>
              <div className="text-center">
                <div className="text-xs text-gray-400">次回</div>
                <div className="text-lg font-black text-orange-300">{(prevPrevBet + prevBet).toLocaleString()}円</div>
              </div>
            </div>
          </div>
        )
      
      case 'dalembert':
        return (
          <div className="bg-cyan-950/30 rounded-xl p-3 border border-cyan-500/30">
            <p className="text-xs font-bold text-cyan-300 mb-2">ユニット推移</p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-white">現在：</span>
              <span className="text-2xl font-black text-cyan-400">{dalembertUnits}単位</span>
              <span className="text-sm text-gray-400">({(dalembertUnits * unitBet).toLocaleString()}円)</span>
            </div>
            <p className="text-xs text-cyan-200 mt-2">
              勝てば{Math.max(1, dalembertUnits - 1)}単位、負ければ{dalembertUnits + 1}単位
            </p>
          </div>
        )
      
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* 背景エフェクト */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black to-orange-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative container max-w-md mx-auto p-4 pb-20">
        {/* ヘッダー */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border-2 border-red-500/30 hover:bg-white/10 hover:border-red-500/50 transition-all hover:scale-110 mb-4"
          >
            <ArrowLeft className="h-5 w-5 text-red-400" />
          </button>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 blur-2xl opacity-50 animate-pulse" />
            <div className="relative">
              <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent animate-shimmer drop-shadow-glow">
                投資法シミュレーター
              </h1>
              <p className="text-red-400/80 mt-2 font-mono text-sm font-bold">BETTING SYSTEM SIMULATOR (2倍配当専用)</p>
            </div>
          </div>
        </div>

        {/* 警告メッセージ */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-red-600 rounded-xl blur-xl opacity-50 animate-pulse" />
          <div className="relative bg-red-600/20 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/50">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0 animate-pulse" />
              <div>
                <h3 className="font-black text-red-300 text-base mb-2">⚠️ 重要な注意</h3>
                <p className="text-sm text-red-200 leading-relaxed">
                  これは教育用シミュレーターです。<br />
                  <span className="font-black text-red-400">長期的には必ず損失が発生します。</span><br />
                  実際の賭博で使用すると深刻な経済的損失を被る可能性があります。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* タブ選択 */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-3 border-2 border-purple-500/30">
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(systemDescriptions) as BettingSystem[]).map((system) => {
                const desc = systemDescriptions[system]
                return (
                  <button
                    key={system}
                    onClick={() => handleSystemChange(system)}
                    className={`relative py-3 px-2 rounded-xl text-xs font-black transition-all ${
                      activeSystem === system
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl scale-105'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {activeSystem === system && (
                      <div className="absolute inset-0 bg-purple-600 blur-lg opacity-75 rounded-xl" />
                    )}
                    <div className="relative flex flex-col items-center gap-1">
                      <span className="font-mono text-center leading-tight">{desc.name}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: desc.riskLevel }).map((_, i) => (
                          <span key={i} className="text-red-400">★</span>
                        ))}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* 設定パネル */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/30">
            <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-white">
              <Target className="w-5 h-5 text-blue-400 drop-shadow-glow" />
              初期設定
            </h2>

            {/* 1ベット額 */}
            <div className="mb-4">
              <label className="text-sm font-black text-blue-300 mb-2 block">1ベット額（最小単位）</label>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => {
                    const newUnitBet = Math.max(1, unitBet - 1000)
                    setUnitBet(newUnitBet)
                    const initialBet = getInitialBet(activeSystem, newUnitBet)
                    setCurrentBet(initialBet)
                  }}
                  className="w-12 h-12 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-black hover:shadow-lg hover:shadow-red-500/50 transition-all active:scale-95 flex items-center justify-center border-2 border-red-400"
                >
                  <span className="text-2xl">−</span>
                </button>
                <input
                  type="number"
                  value={unitBet === 0 ? '' : unitBet}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === '' || val === '0') {
                      setUnitBet(0)
                    } else {
                      const num = Number(val)
                      if (!isNaN(num) && num >= 1 && num <= 100000) {
                        setUnitBet(num)
                        const initialBet = getInitialBet(activeSystem, num)
                        setCurrentBet(initialBet)
                      }
                    }
                  }}
                  onBlur={() => {
                    if (unitBet === 0) {
                      setUnitBet(1)
                      const initialBet = getInitialBet(activeSystem, 1)
                      setCurrentBet(initialBet)
                    }
                  }}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-blue-500/50 bg-black/60 text-white text-center font-black text-2xl focus:outline-none focus:border-blue-500"
                  placeholder="1000"
                  min="1"
                  max="100000"
                />
                <button
                  onClick={() => {
                    const newUnitBet = Math.min(100000, unitBet + 1000)
                    setUnitBet(newUnitBet)
                    const initialBet = getInitialBet(activeSystem, newUnitBet)
                    setCurrentBet(initialBet)
                  }}
                  className="w-12 h-12 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-black hover:shadow-lg hover:shadow-green-500/50 transition-all active:scale-95 flex items-center justify-center border-2 border-green-400"
                >
                  <span className="text-2xl">＋</span>
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1 text-center">1円〜100,000円</p>
            </div>

            {/* 最初のベット額表示 */}
            {activeSystem === 'montecarlo' && (
              <div className="mb-4 bg-indigo-950/30 rounded-xl p-3 border border-indigo-500/30">
                <p className="text-xs text-indigo-300 mb-1 text-center">最初のベット額</p>
                <p className="text-2xl font-black text-indigo-400 text-center">
                  {getInitialBet(activeSystem, unitBet).toLocaleString()}円
                </p>
                <p className="text-xs text-indigo-200 mt-1 text-center">
                  (1+3) × {unitBet.toLocaleString()}円 = {getInitialBet(activeSystem, unitBet).toLocaleString()}円
                </p>
              </div>
            )}

            {/* 予算 - 修正版 */}
            <div className="mb-4">
              <label className="text-sm font-black text-blue-300 mb-2 block">予算</label>
              <div className="flex gap-2 items-center">
                <button
                  onClick={() => setBudget(Math.max(unitBet, budget - 1000))}
                  className="w-12 h-12 flex-shrink-0 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-black hover:shadow-lg hover:shadow-red-500/50 transition-all active:scale-95 flex items-center justify-center border-2 border-red-400"
                >
                  <span className="text-2xl">−</span>
                </button>
                <input
                  type="number"
                  value={budget === 0 ? '' : budget}
                  onChange={(e) => {
                    const val = e.target.value
                    if (val === '' || val === '0') {
                      setBudget(0)
                    } else {
                      const num = Number(val)
                      if (!isNaN(num) && num >= 0) {
                        setBudget(num)
                      }
                    }
                  }}
                  onBlur={() => {
                    if (budget < unitBet) {
                      setBudget(Math.max(unitBet, 1000))
                    }
                  }}
                  className="flex-1 min-w-0 px-3 py-3 rounded-xl border-2 border-blue-500/50 bg-black/60 text-white text-center font-black text-xl focus:outline-none focus:border-blue-500"
                  placeholder="30000"
                  min="1"
                />
                <button
                  onClick={() => setBudget(budget + 1000)}
                  className="w-12 h-12 flex-shrink-0 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-black hover:shadow-lg hover:shadow-green-500/50 transition-all active:scale-95 flex items-center justify-center border-2 border-green-400"
                >
                  <span className="text-2xl">＋</span>
                </button>
              </div>
            </div>

            {/* 配当倍率（固定表示） */}
            <div className="mb-4">
              <label className="text-sm font-black text-blue-300 mb-2 block">配当倍率（固定）</label>
              <div className="w-full px-4 py-3 rounded-xl border-2 border-blue-500/50 bg-black/40 text-white text-center font-black text-lg">
                2.0倍（勝率50%）
              </div>
              <p className="text-xs text-gray-400 mt-1 text-center">バカラ・ルーレット赤黒・ブラックジャック等</p>
            </div>

            {/* 破産確率表示 - 修正版 */}
            {bankruptcyData.probability > 0 && (
              <div className="relative group/risk">
                <div className={`absolute inset-0 ${
                  bankruptcyData.probability > 10 ? 'bg-red-600' :
                  bankruptcyData.probability > 5 ? 'bg-orange-600' :
                  'bg-yellow-600'
                } rounded-xl blur-lg opacity-50`} />
                <div className={`relative rounded-xl p-3 border-2 ${
                  bankruptcyData.probability > 10 ? 'bg-red-600/20 border-red-500/50' :
                  bankruptcyData.probability > 5 ? 'bg-orange-600/20 border-orange-500/50' :
                  'bg-yellow-600/20 border-yellow-500/50'
                }`}>
                  <div className="text-center">
                    <p className="text-xs font-bold text-white/80 mb-1">1セットあたり破産確率</p>
                    <p className={`text-3xl font-black ${
                      bankruptcyData.probability > 10 ? 'text-red-400' :
                      bankruptcyData.probability > 5 ? 'text-orange-400' :
                      'text-yellow-400'
                    } drop-shadow-glow`}>
                      {Math.max(0.01, bankruptcyData.probability).toFixed(2)}%
                    </p>
                    <p className="text-xs text-white/70 mt-2">
                      約{bankruptcyData.losses}連敗で破産
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ゲームパネル */}
        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/30">
            <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-white">
              <Zap className="w-5 h-5 text-purple-400 drop-shadow-glow" />
              シミュレーション
            </h2>

            {/* 現在の状態 */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-gray-400 mb-1">現在のベット額</p>
                <p className="text-2xl font-black text-purple-400">{currentBet.toLocaleString()}円</p>
              </div>
              <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                <p className="text-xs text-gray-400 mb-1">累計投資額</p>
                <p className="text-2xl font-black text-orange-400">-{totalInvested.toLocaleString()}円</p>
              </div>
              <div className={`bg-white/5 rounded-xl p-3 border border-white/10 col-span-2 ${
                isOverLimit ? 'animate-pulse' : ''
              }`}>
                <p className="text-xs text-gray-400 mb-1">総収支</p>
                <p className={`text-4xl font-black ${
                  totalProfit >= 0 ? 'text-green-400' : 'text-red-400'
                } drop-shadow-glow`}>
                  {totalProfit >= 0 ? '+' : ''}{totalProfit.toLocaleString()}円
                </p>
                {isOverLimit && (
                  <p className="text-sm font-black text-yellow-300 mt-2 text-center">
                    {totalProfit >= 1000000000 ? '💰 もう充分でしょう' : '😱 引き際です...'}
                  </p>
                )}
              </div>
            </div>

            {/* モンテカルロの数列表示 */}
            {activeSystem === 'montecarlo' && (
              <div className="bg-indigo-950/30 rounded-xl p-3 border border-indigo-500/30 mb-4">
                <p className="text-xs font-bold text-indigo-300 mb-2">現在の数列</p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {sequence.map((num, idx) => (
                    <div 
                      key={idx} 
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        idx === 0 || idx === sequence.length - 1 
                          ? 'bg-indigo-600 border-2 border-yellow-400' 
                          : 'bg-indigo-600/50'
                      }`}
                    >
                      <span className="text-white font-black">{num}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-indigo-200 mt-2 text-center">
                  次のベット: ({sequence[0]} + {sequence[sequence.length - 1]}) × {unitBet} = {((sequence[0] + sequence[sequence.length - 1]) * unitBet).toLocaleString()}円
                </p>
              </div>
            )}

            {/* 31システムの進捗 */}
            {activeSystem === 'system31' && (
              <div className="bg-pink-950/30 rounded-xl p-3 border border-pink-500/30 mb-4">
                <p className="text-xs font-bold text-pink-300 mb-2">31システム進捗</p>
                <div className="flex gap-1 mb-2">
                  {system31Bets.map((bet, idx) => (
                    <div 
                      key={idx} 
                      className={`flex-1 h-2 rounded ${
                        idx < system31Step ? 'bg-pink-600' : 
                        idx === system31Step ? 'bg-pink-400 animate-pulse' : 
                        'bg-white/10'
                      }`} 
                    />
                  ))}
                </div>
                <div className="grid grid-cols-9 gap-1 text-center text-xs text-pink-200">
                  {system31Bets.map((bet, idx) => (
                    <div key={idx} className={idx === system31Step ? 'font-black text-pink-300' : ''}>
                      {bet}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-pink-200 mt-2 text-center">
                  ステップ {system31Step + 1}/9 - 次のベット: {system31Bets[system31Step]} × {unitBet} = {(system31Bets[system31Step] * unitBet).toLocaleString()}円
                </p>
              </div>
            )}

            {/* その他の投資法の進捗表示 */}
            {getVisualProgress()}

            {/* 連勝/連敗表示 */}
            {streakData && (
              <div className="relative group/streak mb-4">
                <div className={`absolute inset-0 ${
                  streakData.type === 'win' ? 'bg-green-600' : 'bg-red-600'
                } rounded-xl blur-lg opacity-50`} />
                <div className={`relative rounded-xl p-3 border-2 ${
                  streakData.type === 'win' 
                    ? 'bg-green-600/20 border-green-500/50' 
                    : 'bg-red-600/20 border-red-500/50'
                }`}>
                  <p className={`text-lg font-black ${
                    streakData.type === 'win' ? 'text-green-400' : 'text-red-400'
                  } text-center`}>
                    現在{streakData.count}{streakData.type === 'win' ? '連勝' : '連敗'}中
                  </p>
                  <p className="text-sm text-white/80 text-center mt-1">
                    この確率で発生: {streakData.probability.toFixed(2)}%
                    {streakData.probability < 1 && ' (かなり珍しい！)'}
                  </p>
                </div>
              </div>
            )}

            {/* 破産アラート */}
            {showBankruptAlert && (
              <div className="relative group/bankrupt mb-4">
                <div className="absolute inset-0 bg-red-600 rounded-xl blur-2xl opacity-75 animate-pulse" />
                <div className="relative rounded-xl p-5 border-4 border-red-500 bg-red-600/30 backdrop-blur-sm">
                  <button
                    onClick={() => setShowBankruptAlert(false)}
                    className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 transition-all"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                  <div className="text-center">
                    <div className="text-5xl mb-3 animate-bounce">💀</div>
                    <p className="text-2xl font-black text-red-300 mb-2 drop-shadow-glow">
                      破産しました
                    </p>
                    <p className="text-base font-bold text-white/90 mb-3">
                      予算を使い果たしました
                    </p>
                    <div className="bg-black/40 rounded-lg p-3 mb-3">
                      <p className="text-sm text-red-200">
                        残高: <span className="font-black text-red-400">{currentBalance.toLocaleString()}円</span>
                      </p>
                      <p className="text-sm text-red-200">
                        総損失: <span className="font-black text-red-400">{totalProfit.toLocaleString()}円</span>
                      </p>
                    </div>
                    <p className="text-xs text-white/70 mb-3">
                      これが投資法の現実です。<br />
                      長期的には必ず資金を失います。
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShowBankruptAlert(false)}
                        className="py-2 bg-white/20 backdrop-blur-sm border-2 border-white/30 text-white font-black rounded-xl hover:bg-white/30 transition-all text-sm"
                      >
                        続ける
                      </button>
                      <button
                        onClick={handleReset}
                        className="py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white font-black rounded-xl hover:scale-105 transition-all shadow-lg text-sm"
                      >
                        <RotateCcw className="w-3 h-3 inline mr-1" />
                        リセット
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 勝ち/負けボタン */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-green-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={() => handleResult(true)}
                  disabled={isOverLimit}
                  className="relative w-full py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black rounded-xl shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✓ 勝ち
                </button>
              </div>
              <div className="relative group">
                <div className="absolute inset-0 bg-red-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={() => handleResult(false)}
                  disabled={isOverLimit}
                  className="relative w-full py-4 bg-gradient-to-r from-red-600 to-pink-600 text-white font-black rounded-xl shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ✗ 負け
                </button>
              </div>
            </div>

            {/* リセット/ひとつ戻る/再セットボタン */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={handleRestart}
                disabled={history.length === 0}
                className="py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-black rounded-xl hover:bg-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                <RefreshCw className="w-4 h-4 inline mr-1" />
                再セット
              </button>
              <button
                onClick={handleUndo}
                disabled={history.length === 0}
                className="py-3 bg-orange-600/80 backdrop-blur-sm border-2 border-orange-500/50 text-white font-black rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-xs"
              >
                <Undo className="w-4 h-4 inline mr-1" />
                戻る
              </button>
              <button
                onClick={handleReset}
                className="py-3 bg-white/10 backdrop-blur-sm border-2 border-white/20 text-white font-black rounded-xl hover:bg-white/20 transition-all text-xs"
              >
                <RotateCcw className="w-4 h-4 inline mr-1" />
                リセット
              </button>
            </div>
          </div>
        </div>

        {/* 履歴 */}
        {history.length > 0 && (
          <div className="relative group mb-6">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-cyan-500/30">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-white">
                <Activity className="w-5 h-5 text-cyan-400 drop-shadow-glow" />
                履歴（最新100件）
              </h2>
              
              <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
                {history.slice(-100).reverse().map((item, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl p-3 border border-white/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          item.result === 'win' ? 'bg-green-600' : 'bg-red-600'
                        }`}>
                          <span className="text-white font-black text-xs">{item.round}</span>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">
                            {item.result === 'win' ? '勝ち' : '負け'} / {item.bet.toLocaleString()}円
                          </p>
                          <p className={`text-xs ${
                            item.profit >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {item.profit >= 0 ? '+' : ''}{item.profit.toLocaleString()}円
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">残高</p>
                        <p className={`text-sm font-black ${
                          item.balance >= budget ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {item.balance.toLocaleString()}円
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 投資法の説明 */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-orange-500/30">
            <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-white">
              <Brain className="w-5 h-5 text-orange-400 drop-shadow-glow" />
              {systemDescriptions[activeSystem].name}の詳細
            </h2>

            <div className="space-y-4">
              {/* リスクレベル */}
              <div className="bg-white/5 rounded-xl p-3 border border-orange-500/30">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-orange-300">リスクレベル</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={`text-lg ${
                        i < systemDescriptions[activeSystem].riskLevel ? 'text-red-400' : 'text-gray-600'
                      }`}>★</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* 説明 */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm font-bold text-white mb-2">📝 概要</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {systemDescriptions[activeSystem].description}
                </p>
              </div>

              {/* 仕組み */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm font-bold text-white mb-2">⚙️ 仕組み</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {systemDescriptions[activeSystem].howItWorks}
                </p>
              </div>

              {/* 歴史 */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm font-bold text-white mb-2">📜 歴史的背景</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {systemDescriptions[activeSystem].history}
                </p>
              </div>

              {/* 確率 */}
              <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-sm font-bold text-white mb-2">📊 確率論</p>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {systemDescriptions[activeSystem].probability}
                </p>
              </div>

              {/* リスク */}
              <div className="bg-red-950/30 rounded-xl p-4 border border-red-500/30">
                <p className="text-sm font-bold text-red-300 mb-2">⚠️ リスク</p>
                <p className="text-sm text-red-200 leading-relaxed">
                  {systemDescriptions[activeSystem].risk}
                </p>
              </div>

              {/* アドバイス */}
              <div className="bg-blue-950/30 rounded-xl p-4 border border-blue-500/30">
                <p className="text-sm font-bold text-blue-300 mb-2">💡 アドバイス</p>
                <p className="text-sm text-blue-200 leading-relaxed">
                  {systemDescriptions[activeSystem].advice}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }

        /* スクロールバーのスタイリング */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }
        .overflow-y-auto::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.5);
          border-radius: 10px;
        }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.8);
        }
      `}</style>
    </div>
  )
}