'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Sparkles, Grid3x3, DollarSign, Info, RotateCcw,
  Trophy, AlertCircle, Target, Zap, TrendingUp, Eye, Undo
} from 'lucide-react'

// カード値取得
const getCardValue = (card: string) => {
  if (!card || card === 'NONE') return 0
  if (['J', 'Q', 'K', '10'].includes(card)) return 0
  if (card === 'A') return 1
  return parseInt(card)
}

// バカラシミュレーター（完全修正版）
const BaccaratSimulator = () => {
  const [p1, setP1] = useState('')
  const [p2, setP2] = useState('')
  const [p3, setP3] = useState('')
  const [b1, setB1] = useState('')
  const [b2, setB2] = useState('')
  const [b3, setB3] = useState('')
  const [result, setResult] = useState<any>(null)

  const cards = ['', 'NONE', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

  const calculateTotal = (c1: string, c2: string, c3: string) => {
    return (getCardValue(c1) + getCardValue(c2) + getCardValue(c3)) % 10
  }

  const shouldDrawThird = (pTotal: number, bTotal: number, pThirdValue: number | null) => {
    if (pTotal >= 8 || bTotal >= 8) return { p: false, b: false }
    
    const pDraw = pTotal <= 5
    let bDraw = false

    if (!pDraw) {
      bDraw = bTotal <= 5
    } else if (pThirdValue !== null) {
      if (bTotal <= 2) bDraw = true
      else if (bTotal === 3 && pThirdValue !== 8) bDraw = true
      else if (bTotal === 4 && [2,3,4,5,6,7].includes(pThirdValue)) bDraw = true
      else if (bTotal === 5 && [4,5,6,7].includes(pThirdValue)) bDraw = true
      else if (bTotal === 6 && [6,7].includes(pThirdValue)) bDraw = true
    }

    return { p: pDraw, b: bDraw }
  }

  const calculate = () => {
    const hasP1 = !!p1, hasP2 = !!p2, hasP3 = !!p3
    const hasB1 = !!b1, hasB2 = !!b2, hasB3 = !!b3

    let nextAction = ''
    let nextActionDetail = ''
    
    if (!hasP1) {
      nextAction = 'プレイヤーが1枚目を引く'
    } else if (!hasB1) {
      nextAction = 'バンカーが1枚目を引く'
    } else if (!hasP2) {
      nextAction = 'プレイヤーが2枚目を引く'
    } else if (!hasB2) {
      nextAction = 'バンカーが2枚目を引く'
    } else {
      const pTotal = calculateTotal(p1, p2, '')
      const bTotal = calculateTotal(b1, b2, '')
      
      if (pTotal >= 8 || bTotal >= 8) {
        nextAction = '勝負確定'
        nextActionDetail = `ナチュラル！ プレイヤー${pTotal}点、バンカー${bTotal}点`
      } else if (p3 === 'NONE' && b3 === 'NONE') {
        nextAction = '勝負確定'
        nextActionDetail = '両者とも3枚目は引きません'
      } else if (!hasP3 && p3 !== 'NONE' || !hasB3 && b3 !== 'NONE') {
        const p3Value = p3 && p3 !== 'NONE' ? getCardValue(p3) : null
        const rules = shouldDrawThird(pTotal, bTotal, p3Value)
        
        if (rules.p && !hasP3 && p3 !== 'NONE') {
          nextAction = 'プレイヤーが3枚目を引く'
          nextActionDetail = `プレイヤーの合計が${pTotal}なので3枚目を引きます`
        } else if (rules.b && !hasB3 && b3 !== 'NONE') {
          nextAction = 'バンカーが3枚目を引く'
          if (p3 && p3 !== 'NONE') {
            nextActionDetail = `バンカーの合計が${bTotal}、プレイヤーの3枚目が${getCardValue(p3)}なので、バンカーは3枚目を引きます`
          } else {
            nextActionDetail = `バンカーの合計が${bTotal}なので3枚目を引きます`
          }
        } else {
          nextAction = '勝負確定'
          nextActionDetail = '両者とも3枚目は引きません'
        }
      } else {
        nextAction = '勝負確定'
      }
    }

    let pWin = 0, bWin = 0, tie = 0, total = 0

    const simulate = (testP1: string, testP2: string, testP3: string, testB1: string, testB2: string, testB3: string) => {
      const pTotal2 = calculateTotal(testP1, testP2, '')
      const bTotal2 = calculateTotal(testB1, testB2, '')
      
      if (pTotal2 >= 8 || bTotal2 >= 8) {
        const finalP = pTotal2
        const finalB = bTotal2
        if (finalP > finalB) pWin++
        else if (finalB > finalP) bWin++
        else tie++
        total++
        return
      }
      
      const rules = shouldDrawThird(pTotal2, bTotal2, testP3 && testP3 !== 'NONE' ? getCardValue(testP3) : null)
      
      let finalP = pTotal2, finalB = bTotal2
      
      if (testP3 && testP3 !== 'NONE' && rules.p) finalP = calculateTotal(testP1, testP2, testP3)
      if (testB3 && testB3 !== 'NONE' && rules.b) finalB = calculateTotal(testB1, testB2, testB3)

      if (finalP > finalB) pWin++
      else if (finalB > finalP) bWin++
      else tie++
      total++
    }

    if (hasP1 && hasB1 && hasP2 && hasB2) {
      const pTotal = calculateTotal(p1, p2, '')
      const bTotal = calculateTotal(b1, b2, '')
      const p3Value = p3 && p3 !== 'NONE' ? getCardValue(p3) : null
      const rules = shouldDrawThird(pTotal, bTotal, p3Value)
      
      const p3Final = p3 === 'NONE' ? 'NONE' : !rules.p ? 'NONE' : p3
      const b3Final = b3 === 'NONE' ? 'NONE' : !rules.b ? 'NONE' : b3
      
      if ((hasP3 || p3Final === 'NONE') && (hasB3 || b3Final === 'NONE')) {
        simulate(p1, p2, p3Final, b1, b2, b3Final)
      } else {
        const allCards = cards.slice(2)
        
        if (p3Final !== 'NONE' && !hasP3 && b3Final !== 'NONE' && !hasB3) {
          for (const cp3 of allCards) {
            for (const cb3 of allCards) {
              simulate(p1, p2, cp3, b1, b2, cb3)
            }
          }
        } else if (p3Final !== 'NONE' && !hasP3) {
          for (const cp3 of allCards) {
            simulate(p1, p2, cp3, b1, b2, b3Final)
          }
        } else if (b3Final !== 'NONE' && !hasB3) {
          for (const cb3 of allCards) {
            simulate(p1, p2, p3Final, b1, b2, cb3)
          }
        }
      }
    } else {
      const allCards = cards.slice(2)
      for (const c1 of allCards) {
        for (const c2 of allCards) {
          for (const c3 of allCards) {
            for (const c4 of allCards) {
              for (const c5 of allCards) {
                for (const c6 of allCards) {
                  simulate(
                    p1 || c1, p2 || c2, p3 || c5,
                    b1 || c3, b2 || c4, b3 || c6
                  )
                }
              }
            }
          }
        }
      }
    }

    const pRate = total > 0 ? (pWin / total) * 100 : 0
    const bRate = total > 0 ? (bWin / total) * 100 : 0
    const tRate = total > 0 ? (tie / total) * 100 : 0

    setResult({
      player: pRate,
      banker: bRate,
      tie: tRate,
      nextAction,
      nextActionDetail
    })
  }

  const pTotal = calculateTotal(p1, p2, p3)
  const bTotal = calculateTotal(b1, b2, b3)

  return (
    <div className="space-y-4">
      <div className="relative group">
        <div className="absolute inset-0 bg-blue-600 rounded-xl blur-lg opacity-30" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-blue-500/50">
          <div className="text-sm font-black text-blue-300 mb-3">プレイヤー</div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[p1, p2, p3].map((val, idx) => (
              <select
                key={idx}
                value={val}
                onChange={(e) => {
                  const newVal = e.target.value
                  if (idx === 0) setP1(newVal)
                  if (idx === 1) setP2(newVal)
                  if (idx === 2) setP3(newVal)
                  setResult(null)
                }}
                className="w-full p-2 rounded-lg bg-white text-black font-black text-center"
              >
                {cards.map(c => <option key={c} value={c}>{c === '' ? '?' : c === 'NONE' ? '引かない' : c}</option>)}
              </select>
            ))}
          </div>
          <div className="text-2xl font-black text-white text-center">合計: {pTotal}</div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-red-600 rounded-xl blur-lg opacity-30" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-red-500/50">
          <div className="text-sm font-black text-red-300 mb-3">バンカー</div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[b1, b2, b3].map((val, idx) => (
              <select
                key={idx}
                value={val}
                onChange={(e) => {
                  const newVal = e.target.value
                  if (idx === 0) setB1(newVal)
                  if (idx === 1) setB2(newVal)
                  if (idx === 2) setB3(newVal)
                  setResult(null)
                }}
                className="w-full p-2 rounded-lg bg-white text-black font-black text-center"
              >
                {cards.map(c => <option key={c} value={c}>{c === '' ? '?' : c === 'NONE' ? '引かない' : c}</option>)}
              </select>
            ))}
          </div>
          <div className="text-2xl font-black text-white text-center">合計: {bTotal}</div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-purple-600 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
        <button
          onClick={calculate}
          className="relative w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black rounded-xl shadow-xl hover:scale-105 transition-all"
        >
          <Zap className="w-5 h-5 inline mr-2" />
          勝率を計算
        </button>
      </div>

      {result && (
        <div className="space-y-3 animate-fadeIn">
          {result.nextAction !== '勝負確定' && (
            <div className="relative group">
              <div className="absolute inset-0 bg-yellow-600 rounded-xl blur-lg opacity-50" />
              <div className="relative bg-yellow-600/20 backdrop-blur-sm rounded-xl p-3 border-2 border-yellow-500/50">
                <p className="text-lg font-black text-yellow-300 text-center mb-1">
                  {result.nextAction}
                </p>
                {result.nextActionDetail && (
                  <p className="text-sm text-yellow-200 text-center">
                    {result.nextActionDetail}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-green-600 to-red-600 rounded-xl blur-lg opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-black text-blue-300">プレイヤー</span>
                  <span className="text-2xl font-black text-blue-400">{result.player.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-red-300">バンカー</span>
                  <span className="text-2xl font-black text-red-400">{result.banker.toFixed(2)}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-black text-green-300">タイ</span>
                  <span className="text-2xl font-black text-green-400">{result.tie.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative group">
        <div className="absolute inset-0 bg-amber-600 rounded-xl blur-lg opacity-30" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-amber-500/50">
          <h3 className="text-sm font-black text-amber-300 mb-3">3枚目のカード条件ルール</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-amber-500/30">
                  <th className="p-2 text-amber-400 font-black">バンカー2枚の合計</th>
                  <th className="p-2 text-blue-400 font-black">プレイヤー3枚目の値</th>
                  <th className="p-2 text-red-400 font-black">バンカーの行動</th>
                </tr>
              </thead>
              <tbody className="text-white">
                <tr className="border-b border-white/10">
                  <td className="p-2 text-center font-bold">0-2</td>
                  <td className="p-2 text-center">すべて</td>
                  <td className="p-2 text-center text-green-400 font-bold">引く</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-2 text-center font-bold">3</td>
                  <td className="p-2 text-center">0,1,2,3,4,5,6,7,9</td>
                  <td className="p-2 text-center text-green-400 font-bold">引く</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-2 text-center font-bold">4</td>
                  <td className="p-2 text-center">2,3,4,5,6,7</td>
                  <td className="p-2 text-center text-green-400 font-bold">引く</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-2 text-center font-bold">5</td>
                  <td className="p-2 text-center">4,5,6,7</td>
                  <td className="p-2 text-center text-green-400 font-bold">引く</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-2 text-center font-bold">6</td>
                  <td className="p-2 text-center">6,7</td>
                  <td className="p-2 text-center text-green-400 font-bold">引く</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-2 text-center font-bold">7</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center text-red-400 font-bold">引かない</td>
                </tr>
                <tr className="border-b border-white/10">
                  <td className="p-2 text-center font-bold">8-9</td>
                  <td className="p-2 text-center">-</td>
                  <td className="p-2 text-center text-yellow-400 font-bold">ナチュラル</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-2">※プレイヤーは0-5で引く、6-7で引かない、8-9でナチュラル。最初の2枚がお互い6以上で同数はタイ。プレイヤーの最初の2枚が6,7でバンカーが5以下の場合はバンカーのみが3枚目を引く</p>
        </div>
      </div>
    </div>
  )
}

// 罫線シミュレーター（3つ同時表示版）
const RoadmapSimulator = () => {
  const [results, setResults] = useState<('B' | 'P' | 'T')[]>([])

  const addResult = (result: 'B' | 'P' | 'T') => {
    setResults([...results, result])
  }
  
  const reset = () => setResults([])
  
  const undoLast = () => {
    if (results.length > 0) {
      setResults(results.slice(0, -1))
    }
  }

  // 大路生成
  const generateBigRoad = () => {
    const road: ('B' | 'P')[][] = []
    let col = -1
    let row = 0
    let lastNonTieResult: 'B' | 'P' | null = null

    for (const result of results) {
      if (result === 'T') {
        continue
      }
      
      if (lastNonTieResult === null || lastNonTieResult !== result) {
        col++
        row = 0
        if (!road[col]) road[col] = []
        road[col][row] = result
        lastNonTieResult = result
      } else {
        if (row >= 5) {
          col++
          row = 5
          if (!road[col]) road[col] = []
        } else {
          row++
        }
        road[col][row] = result
        lastNonTieResult = result
      }
    }

    return road
  }

  // 珠盤路生成
  const generateBeadRoad = () => {
    const road: ('B' | 'P' | 'T')[][] = []
    
    results.forEach((result, idx) => {
      const col = Math.floor(idx / 6)
      const row = idx % 6
      
      if (!road[col]) road[col] = []
      road[col][row] = result
    })
    
    return road
  }

  // 大眼仔生成
  const generateBigEyeRoad = () => {
    const bigRoad = generateBigRoad()
    const road: ('R' | 'B')[][] = []
    
    if (bigRoad.length < 2) return road
    
    let col = 0
    let row = 0
    
    for (let i = 1; i < bigRoad.length; i++) {
      if (bigRoad[i].length === 0) continue
      
      const currentDepth = bigRoad[i].length
      const prevDepth = bigRoad[i - 1] ? bigRoad[i - 1].length : 0
      const twoColsBackDepth = bigRoad[i - 2] ? bigRoad[i - 2].length : 0
      
      let mark: 'R' | 'B'
      
      if (i === 1) {
        mark = currentDepth === prevDepth ? 'R' : 'B'
      } else {
        const currentPattern = currentDepth > prevDepth
        const previousPattern = prevDepth > twoColsBackDepth
        mark = currentPattern === previousPattern ? 'R' : 'B'
      }
      
      if (!road[col]) road[col] = []
      road[col][row] = mark
      
      row++
      if (row >= 6) {
        row = 0
        col++
      }
    }
    
    return road
  }

  const bigRoad = generateBigRoad()
  const beadRoad = generateBeadRoad()
  const bigEyeRoad = generateBigEyeRoad()

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'バンカー', val: 'B', color: 'bg-gradient-to-r from-red-600 to-red-700' },
          { label: 'プレイヤー', val: 'P', color: 'bg-gradient-to-r from-blue-600 to-blue-700' },
          { label: 'タイ', val: 'T', color: 'bg-gradient-to-r from-green-600 to-green-700' }
        ].map(item => (
          <div key={item.val} className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-current to-current rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
            <button
              onClick={() => addResult(item.val as 'B' | 'P' | 'T')}
              className={`relative w-full py-4 ${item.color} text-white font-black rounded-xl shadow-xl hover:scale-105 transition-all`}
            >
              {item.label}
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={undoLast}
          disabled={results.length === 0}
          className="w-full py-3 bg-orange-600/80 backdrop-blur-sm border-2 border-orange-500/50 text-white font-black rounded-xl hover:bg-orange-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo className="w-5 h-5 inline mr-2" />
          ひとつ戻る
        </button>
        <button
          onClick={reset}
          className="w-full py-3 bg-black/60 backdrop-blur-sm border-2 border-white/20 text-white font-black rounded-xl hover:bg-white/10 transition-all"
        >
          <RotateCcw className="w-5 h-5 inline mr-2" />
          リセット
        </button>
      </div>

      {/* 珠盤路 */}
      <div className="relative group">
        <div className="absolute inset-0 bg-cyan-600 rounded-xl blur-lg opacity-30" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-cyan-500/50">
          <h3 className="font-black text-cyan-300 mb-3">珠盤路（チューチャイロ）</h3>
          <div className="min-h-64 overflow-x-auto">
            {results.length > 0 ? (
              <div className="inline-flex gap-1">
                {beadRoad.map((col, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-1">
                    {Array.from({ length: 6 }).map((_, rowIdx) => {
                      const result = col[rowIdx]
                      const isTie = result === 'T'
                      return (
                        <div
                          key={rowIdx}
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border-2 ${
                            isTie
                              ? 'bg-green-600 text-white border-green-400'
                              : result === 'B'
                              ? 'bg-red-600 text-white border-red-400'
                              : result === 'P'
                              ? 'bg-blue-600 text-white border-blue-400'
                              : 'bg-transparent border-white/10'
                          }`}
                        >
                          {result === 'T' ? 'T' : result || ''}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p className="font-bold">結果を入力してください</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 大路 */}
      <div className="relative group">
        <div className="absolute inset-0 bg-purple-600 rounded-xl blur-lg opacity-30" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-purple-500/50">
          <h3 className="font-black text-purple-300 mb-3">大路（ダイロ）</h3>
          <div className="min-h-64 overflow-x-auto">
            {bigRoad.length > 0 ? (
              <div className="inline-flex gap-1">
                {bigRoad.map((col, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-1">
                    {Array.from({ length: 6 }).map((_, rowIdx) => {
                      const result = col[rowIdx]
                      return (
                        <div
                          key={rowIdx}
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${
                            result === 'B'
                              ? 'bg-red-600 text-white border-2 border-red-400'
                              : result === 'P'
                              ? 'bg-blue-600 text-white border-2 border-blue-400'
                              : 'bg-transparent border border-white/10'
                          }`}
                        >
                          {result || ''}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p className="font-bold">結果を入力してください</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 大眼仔 */}
      <div className="relative group">
        <div className="absolute inset-0 bg-indigo-600 rounded-xl blur-lg opacity-30" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-indigo-500/50">
          <h3 className="font-black text-indigo-300 mb-3">大眼仔（ダイガンチャイ）</h3>
          <div className="min-h-64 overflow-x-auto">
            {bigEyeRoad.length > 0 ? (
              <div className="inline-flex gap-1">
                {bigEyeRoad.map((col, colIdx) => (
                  <div key={colIdx} className="flex flex-col gap-1">
                    {Array.from({ length: 6 }).map((_, rowIdx) => {
                      const mark = col[rowIdx]
                      return (
                        <div
                          key={rowIdx}
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            mark === 'R'
                              ? 'border-2 border-red-500'
                              : mark === 'B'
                              ? 'border-2 border-blue-500 bg-blue-500'
                              : 'border border-white/10'
                          }`}
                        />
                      )
                    })}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p className="font-bold text-sm">大路が2列以上必要です</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {results.length > 0 && (
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-blue-600 to-green-600 rounded-xl blur-lg opacity-30" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-white/20">
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'バンカー', val: ['B'], color: 'red' },
                { label: 'プレイヤー', val: ['P'], color: 'blue' },
                { label: 'タイ', val: ['T'], color: 'green' }
              ].map(item => (
                <div key={item.label}>
                  <div className={`text-2xl font-black text-${item.color}-400`}>
                    {results.filter(r => item.val.includes(r)).length}
                  </div>
                  <div className={`text-xs font-bold text-${item.color}-300`}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// 罫線用語解説
const RoadmapTerms = () => {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl blur-lg opacity-30" />
      <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-5 border-2 border-orange-500/50">
        <h3 className="font-black text-orange-300 mb-4 text-lg">罫線のバカラ用語集</h3>
        
        <div className="space-y-3">
          <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
            <h4 className="font-black text-white mb-2">テレコ</h4>
            <p className="text-sm text-gray-300">バンカーとプレイヤーが交互に勝つ状態。罫線が横一直線に並ぶため視覚的にわかりやすい。この流れが続くと予測して、前回と反対側にベットする戦略が「テレコ狙い」。</p>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
            <h4 className="font-black text-white mb-2">ニコイチ</h4>
            <p className="text-sm text-gray-300">2連勝と1勝が交互に続くパターン。例えばバンカー2連勝→プレイヤー1勝→バンカー2連勝のように規則的に続く状態。リズムを読んでベットする上級テクニック。</p>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
            <h4 className="font-black text-white mb-2">ドラゴン</h4>
            <p className="text-sm text-gray-300">7連勝以上の長い連勝のこと。罫線が縦に長く伸びる様子が龍のように見えることから。ドラゴンが出ると、大路の6マス目を超えて右に折れ曲がる「ドラゴンテール」が形成される。</p>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
            <h4 className="font-black text-white mb-2">テンコ盛り</h4>
            <p className="text-sm text-gray-300">連勝が続いて罫線が縦に積み上がっている状態。「天高く盛り上がる」という意味。ドラゴンほどではないが、3〜6連勝程度が縦に並んでいる状況を指す。</p>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
            <h4 className="font-black text-white mb-2">ヨコヅラ</h4>
            <p className="text-sm text-gray-300">単発勝ちが続いて罫線が横に並ぶ状態。テレコと似ているが、必ずしも交互ではなく、散発的に勝敗が変わる状況。流れが読みにくく、ベットが難しい局面とされる。</p>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
            <h4 className="font-black text-white mb-2">ツラ追い</h4>
            <p className="text-sm text-gray-300">同じ結果が続くと予想して、連勝している側に賭け続ける戦略。「ツラが続く」と判断したらその流れに乗る。ドラゴンが出現しやすい局面で効果的だが、タイミングを見誤ると大損するリスクも。</p>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
            <h4 className="font-black text-white mb-2">ツラ変わり</h4>
            <p className="text-sm text-gray-300">連勝が途切れて結果が変わること。例えばバンカーの3連勝後にプレイヤーが勝つ状況。ツラ追いをしていたプレイヤーにとっては撤退のサイン。新しい流れの始まりを示唆する重要なポイント。</p>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
            <h4 className="font-black text-white mb-2">ニコニコ</h4>
            <p className="text-sm text-gray-300">2連勝が規則的に続く状態。バンカー2連勝→プレイヤー2連勝→バンカー2連勝のように、両者が2連勝ずつ交互に勝つパターン。罫線が階段状に見えるのが特徴で、パターンを読みやすい。</p>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
            <h4 className="font-black text-white mb-2">サンサン</h4>
            <p className="text-sm text-gray-300">3連勝が規則的に続く状態。ニコニコの3連勝版。バンカー3連勝→プレイヤー3連勝のように交互に続くパターン。このリズムに乗れば安定した利益を狙えるが、崩れた瞬間の見極めが重要。</p>
          </div>

          <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
            <h4 className="font-black text-white mb-2">単発（タンパツ）</h4>
            <p className="text-sm text-gray-300">1勝ずつが続く状態。完全なテレコではなく、不規則に1勝が続く局面。罫線が横に散らばって見え、流れが読めない難しい状況。こういう時は小さく賭けて様子を見るのが賢明とされる。</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// 罫線の見方解説
const RoadmapGuide = () => {
  return (
    <div className="space-y-4">
      <div className="relative group">
        <div className="absolute inset-0 bg-purple-600 rounded-xl blur-lg opacity-30" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-5 border-2 border-purple-500/50">
          <h3 className="font-black text-white mb-4 text-lg flex items-center gap-2">
            <Grid3x3 className="w-5 h-5 text-purple-400" />
            5種類の罫線の見方
          </h3>

          <div className="space-y-4">
            <div className="bg-white/5 rounded-lg p-4 border border-purple-500/30">
              <h4 className="font-black text-purple-300 mb-2">1. 大路（ダイロ）</h4>
              <p className="text-sm text-gray-300 leading-relaxed mb-3">
                最も基本的な罫線。バンカーは赤丸、プレイヤーは青丸で表示され、同じ結果が縦に並びます。6マス超えたら右にドラゴンテール（折り曲げ）。罫線の全ての基準となる最重要チャートで、これを見れば流れが一目瞭然。連勝・単発・交互などのパターンが視覚的にわかります。
              </p>
              <div className="bg-black/40 rounded p-2 text-xs text-green-300">
                <p className="font-black mb-1">タイの扱い:</p>
                <p>タイボタンを押すと珠盤路に記録されますが、大路では無視されます（バカラの正式ルール）。</p>
              </div>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-blue-500/30">
              <h4 className="font-black text-blue-300 mb-2">2. 大眼仔（ダイガンチャイ）</h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                大路の規則性を分析する罫線。赤は「前の列と同じパターン＝規則的」、青は「前と違うパターン＝不規則」を示します。大路が2列以上必要で、前の列と深さを比較してマークを付けます。ベテランプレイヤーが次の展開を予測するのに使う中級者向けツール。
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-green-500/30">
              <h4 className="font-black text-green-300 mb-2">3. 小路（シュウロ）</h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                大路の3列前と比較する罫線。大眼仔よりも長期的なパターンを分析します。赤は規則的、青は不規則。大路が4列以上必要で、より詳細な流れの傾向を掴むことができます。大眼仔と組み合わせて使うことで、より精度の高い予測が可能になる上級者向けツール。
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-yellow-500/30">
              <h4 className="font-black text-yellow-300 mb-2">4. 甲由路（カッチャロ）</h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                大路の4列前と比較する最も詳細な分析罫線。大路が5列以上必要で、小路よりもさらに長期的な流れを読み解きます。赤は規則的、青は不規則。プロプレイヤーが使う最上級の分析ツールで、大眼仔・小路と合わせて3つの罫線を総合的に見ることで、より確実な予測が可能になります。
              </p>
            </div>

            <div className="bg-white/5 rounded-lg p-4 border border-cyan-500/30">
              <h4 className="font-black text-cyan-300 mb-2">5. 珠盤路（チューチャイロ）</h4>
              <p className="text-sm text-gray-300 leading-relaxed">
                全ての結果を時系列で記録する最もシンプルな罫線。バンカーは赤、プレイヤーは青、タイは緑で表示。上から下に6マスずつ、左から右へ順番に並びます。大路とは違い、タイも記録されるので正確な履歴が確認できます。初心者にも分かりやすく、過去の結果を一覧で確認するのに最適です。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// 絞り解説
const SqueezeGuide = () => {
  const verticalImages = [
    { id: '1qckPP2w3cZhppdFENDI_pg-m819VmDBc', label: 'マークが1つ（2, 3）' },
    { id: '1wy0Y_kQWKOFzJwYHcaY4gF8FGZLAn-K9', label: 'マークが2つ（4, 5, 6, 7, 8, 9, 10）' },
    { id: '1UZKYvHGvGUSYbDks4yGfvvu7gI14kshp', label: '絵柄（J, Q, K）' },
    { id: '1m-IJ0kv8cEs3KD-W07QSkE2L2lG7eu8p', label: 'なし（A）' }
  ]

  const horizontalImages = [
    { id: '1qGvKPvgeOfA6aaxIGCR1uC7VYUDSoQCo', label: 'マークが3つ（6, 7, 8）' },
    { id: '13nRS0Q_wQve5UOijTkpBJNtuazb8W3eY', label: 'マークが4つ（9, 10）' },
    { id: '1TDvz8fZ1Ha0I6A7hRalZqz74ktCNiw5W', label: 'マークが2つ（2, 3）' }
  ]

  return (
    <div className="space-y-4">
      <div className="relative group">
        <div className="absolute inset-0 bg-yellow-600 rounded-xl blur-lg opacity-30" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-yellow-500/50">
          <h3 className="font-black text-white mb-3 text-lg flex items-center gap-2">
            <Eye className="w-5 h-5 text-yellow-400" />
            絞り（スクイーズ）とは？
          </h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            カードを少しずつめくって、マークの見え方から数字を予測する演出。バカラ最大の醍醐味！
          </p>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-yellow-600 rounded-xl blur-lg opacity-30" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-5 border-2 border-orange-500/50">
          <h3 className="font-black text-orange-300 mb-4 text-lg">絞りの専門用語集</h3>
          
          <div className="space-y-3">
            <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
              <h4 className="font-black text-white mb-2">タテ / 縦絞り</h4>
              <p className="text-sm text-gray-300">短辺から覗く最もポピュラーな絞り方。マークが徐々に現れる様子を楽しめる。</p>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
              <h4 className="font-black text-white mb-2">ヨコ / 横絞り</h4>
              <p className="text-sm text-gray-300">長辺から覗く絞り方。マークが早く見えるため、せっかちな人向け。</p>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
              <h4 className="font-black text-white mb-2">ナナメ / 斜め絞り</h4>
              <p className="text-sm text-gray-300">角から覗く上級者向けの絞り方。ドキドキ感MAX！</p>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
              <h4 className="font-black text-white mb-2">ノーサイド / モーピン</h4>
              <p className="text-sm text-gray-300">マークが見えない状態。A（エース）確定。「モーピン」は中国語由来の呼び方。</p>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
              <h4 className="font-black text-white mb-2">足あり / サイドあり</h4>
              <p className="text-sm text-gray-300">マークの「足」（端のマーク）が見える状態。2以上確定。</p>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
              <h4 className="font-black text-white mb-2">2サイド / リャンピン</h4>
              <p className="text-sm text-gray-300">マークが2つ見える。4または5確定。「リャンピン」は中国語で「2つの足」の意。</p>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
              <h4 className="font-black text-white mb-2">3サイド / サンピン</h4>
              <p className="text-sm text-gray-300">マークが3つ見える。6、7、8のいずれか。「サンピン」は中国語で「3つの足」。</p>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
              <h4 className="font-black text-white mb-2">4サイド / セイピン</h4>
              <p className="text-sm text-gray-300">マークが4つ見える。9または10確定。「セイピン」は中国語で「4つの足」。</p>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
              <h4 className="font-black text-white mb-2">アボジ / 絵柄</h4>
              <p className="text-sm text-gray-300">ピクチャーカード（J、Q、K）の総称。韓国語で「お父さん」を意味し、絵柄の人物を指す。0点確定なので「パパゼロ」とも。</p>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
              <h4 className="font-black text-white mb-2">ツラ / 面（メン）</h4>
              <p className="text-sm text-gray-300">カードの表面のこと。「ツラを見る」は絞りを行うことを意味する。罫線では同じ結果が続く流れを「ツラが続く」と表現する。</p>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
              <h4 className="font-black text-white mb-2">ナチュラル</h4>
              <p className="text-sm text-gray-300">最初の2枚で8または9になること。絞りの権利があっても、即座に勝負が決まる。</p>
            </div>

            <div className="bg-white/5 rounded-lg p-3 border border-orange-500/30">
              <h4 className="font-black text-white mb-2">バーン / 焼く</h4>
              <p className="text-sm text-gray-300">カードを破る演出。一部のVIPルームでのみ許可されている豪華な絞り方。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl blur-lg opacity-30" />
        <div className="relative bg-purple-900/40 backdrop-blur-sm rounded-xl p-5 border-2 border-purple-500/50">
          <h3 className="font-black text-purple-300 mb-3 text-lg">縦絞り（タテ）- 短辺から覗く</h3>
          <p className="text-sm text-purple-200 mb-4">最もポピュラーな絞り方。カードの短辺（上下）から少しずつめくって、マークの数を確認します。ゆっくりとマークが現れるため、ドキドキ感を最大限に味わえます。</p>
          
          <div className="space-y-4">
            {verticalImages.map((img, idx) => (
              <div key={idx} className="bg-purple-950/30 rounded-lg p-4 border border-purple-500/30">
                <h4 className="font-black text-white mb-3">{img.label}</h4>
                <div className="rounded-lg overflow-hidden bg-white min-h-[300px] flex items-center justify-center">
                  <img 
                    src={`https://lh3.googleusercontent.com/d/${img.id}=w1000`}
                    alt={img.label}
                    className="w-full h-auto object-contain max-h-[500px]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `https://drive.google.com/thumbnail?id=${img.id}&sz=w1000`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl blur-lg opacity-30" />
        <div className="relative bg-cyan-900/40 backdrop-blur-sm rounded-xl p-5 border-2 border-cyan-500/50">
          <h3 className="font-black text-cyan-300 mb-3 text-lg">横絞り（ヨコ）- 長辺から覗く</h3>
          <p className="text-sm text-cyan-200 mb-4">カードの長辺（左右）から覗く絞り方。縦絞りよりも早くマークが見えるため、結果を早く知りたい時に使います。マークの配置が横方向に広がるため、判別が縦絞りとは異なります。</p>
          
          <div className="space-y-4">
            {horizontalImages.map((img, idx) => (
              <div key={idx} className="bg-cyan-950/30 rounded-lg p-4 border border-cyan-500/30">
                <h4 className="font-black text-white mb-3">{img.label}</h4>
                <div className="rounded-lg overflow-hidden bg-white min-h-[300px] flex items-center justify-center">
                  <img 
                    src={`https://lh3.googleusercontent.com/d/${img.id}=w1000`}
                    alt={img.label}
                    className="w-full h-auto object-contain max-h-[500px]"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement
                      target.src = `https://drive.google.com/thumbnail?id=${img.id}&sz=w1000`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute inset-0 bg-green-600 rounded-xl blur-lg opacity-30" />
        <div className="relative bg-black/60 backdrop-blur-sm rounded-xl p-4 border-2 border-green-500/50">
          <h3 className="font-black text-green-300 mb-2">絞りの権利</h3>
          <p className="text-sm text-gray-300">
            その回で<span className="text-green-400 font-black">最高額をベットした人</span>に与えられる権利。他のプレイヤーに譲渡することも可能。
          </p>
        </div>
      </div>
    </div>
  )
}

export default function BaccaratLesson() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('basic')

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-black to-blue-950/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative container max-w-md mx-auto p-4 pb-20">
        <div className="mb-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border-2 border-red-500/30 hover:bg-white/10 hover:border-red-500/50 transition-all hover:scale-110 mb-4"
          >
            <ArrowLeft className="h-5 w-5 text-red-400" />
          </button>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-yellow-600 to-blue-600 blur-2xl opacity-50 animate-pulse" />
            <div className="relative">
              <h1 className="text-4xl font-black bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 bg-clip-text text-transparent animate-shimmer drop-shadow-glow">
                バカラレッスン
              </h1>
              <p className="text-red-400/80 mt-2 font-mono text-sm font-bold">BACCARAT MASTER</p>
            </div>
          </div>
        </div>

        <div className="relative group mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-blue-600 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-2 border-2 border-red-500/30 shadow-2xl">
            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'basic', icon: Info, label: '基本' },
                { id: 'simulator', icon: Target, label: 'シミュレーター' },
                { id: 'roadmap', icon: Grid3x3, label: '罫線' },
                { id: 'squeeze', icon: Eye, label: '絞り' },
                { id: 'betting', icon: DollarSign, label: '投資法' }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative group/tab py-3 px-1 rounded-xl text-[10px] font-black transition-all ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-red-600 to-blue-600 text-white shadow-xl scale-105'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="relative flex flex-col items-center gap-1">
                      <Icon className={`w-4 h-4 ${activeTab === tab.id ? 'drop-shadow-glow' : ''}`} />
                      <span className="font-mono">{tab.label}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-yellow-500/30 shadow-2xl">
                <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5 text-yellow-400 drop-shadow-glow" />
                  バカラの基本ルール
                </h2>
                
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-white font-bold mb-2">🎯 ゲームの目的</p>
                    <p className="text-gray-300">バンカーとプレイヤーのどちらが<span className="text-yellow-400 font-black">9に近い</span>かを予想</p>
                  </div>

                  <div>
                    <p className="text-white font-bold mb-2">🃏 カードの数え方</p>
                    <div className="bg-white/5 rounded-lg p-3 space-y-1">
                      <p className="text-gray-300">• A = 1点</p>
                      <p className="text-gray-300">• 2〜9 = そのままの数字</p>
                      <p className="text-gray-300">• 10, J, Q, K = 0点</p>
                      <p className="text-yellow-400 font-bold mt-2">※ 合計が10を超えたら10を引く（例：7+8=15→5点）</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-white font-bold mb-2">💰 配当（シックスバンカーハーフ / ロクハン）</p>
                    <div className="bg-gradient-to-r from-yellow-600/20 to-amber-600/20 rounded-lg p-3 border-2 border-yellow-500/50">
                      <div className="space-y-1">
                        <p className="text-white"><span className="text-blue-400 font-black">プレイヤー勝利:</span> 2倍</p>
                        <p className="text-white"><span className="text-red-400 font-black">バンカー勝利:</span> 2倍</p>
                        <p className="text-yellow-400 font-black">⚠️ バンカーが6で勝利: 1.5倍（半額）</p>
                        <p className="text-white"><span className="text-green-400 font-black">タイ:</span> 8〜9倍</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">※ コミッション不要でシンプル！</p>
                  </div>

                  <div>
                    <p className="text-white font-bold mb-2">💰 配当（通常ルール）</p>
                    <div className="bg-white/5 rounded-lg p-3 space-y-1">
                      <p className="text-white"><span className="text-blue-400 font-black">プレイヤー勝利:</span> 2倍</p>
                      <p className="text-white"><span className="text-red-400 font-black">バンカー勝利:</span> 1.95倍（5%コミッション）</p>
                      <p className="text-white"><span className="text-green-400 font-black">タイ:</span> 8〜9倍</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-white font-bold mb-2">🎴 3枚目を引く条件</p>
                    <div className="bg-white/5 rounded-lg p-3 space-y-2">
                      <p className="text-yellow-400 font-black">プレイヤー:</p>
                      <p className="text-gray-300">• 合計0〜5: 引く / 6〜7: 引かない / 8〜9: ナチュラル</p>
                      <p className="text-yellow-400 font-black mt-3">バンカー:</p>
                      <p className="text-gray-300 text-xs">プレイヤーの3枚目で変わる → シミュレーターで確認！</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* バカラ基本用語 */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-teal-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-cyan-500/30 shadow-2xl">
                <h2 className="text-lg font-black mb-3 flex items-center gap-2 text-white">
                  <Info className="w-5 h-5 text-cyan-400 drop-shadow-glow" />
                  バカラ基本用語
                </h2>

                <div className="space-y-3">
                  <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/30">
                    <h4 className="font-black text-white mb-2">ナチュラル（Natural）</h4>
                    <p className="text-sm text-gray-300">最初の2枚で8または9になること。8は「プチナチュラル」、9は「グランドナチュラル」と呼ばれ、3枚目を引かずに即座に勝負が決まる最強の手。ナチュラル同士の対決では点数が高い方が勝利。</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/30">
                    <h4 className="font-black text-white mb-2">クー（Coup）</h4>
                    <p className="text-sm text-gray-300">バカラの1ゲーム（1回の勝負）を指すフランス語。「今日は何クープレイした？」のように使う。カジノでのプレイ回数を数える単位として用いられる。</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/30">
                    <h4 className="font-black text-white mb-2">シュー（Shoe）</h4>
                    <p className="text-sm text-gray-300">複数デッキのカードを入れて配る箱。通常6〜8デッキを使用し、ディーラーがここからカードを引いて配る。シューが空になると新しいシューに交換され、罫線もリセットされる。</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/30">
                    <h4 className="font-black text-white mb-2">バーン（Burn）</h4>
                    <p className="text-sm text-gray-300">新しいシューの最初に捨てるカードのこと。通常、最初の1枚をめくり、その数字分のカードを廃棄する。例えば5が出たら5枚捨てる。不正防止とランダム性を高めるための儀式的な行為。</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/30">
                    <h4 className="font-black text-white mb-2">コミッション（Commission）</h4>
                    <p className="text-sm text-gray-300">バンカー勝利時にカジノが徴収する手数料。通常5%で、バンカーの配当が1.95倍になる理由。シックスバンカーハーフなどのノーコミッションルールでは不要。ハウスエッジを生み出す重要な要素。</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/30">
                    <h4 className="font-black text-white mb-2">スタンド（Stand）</h4>
                    <p className="text-sm text-gray-300">3枚目のカードを引かないこと。プレイヤーは6または7、バンカーは状況により6または7でスタンド。ナチュラルの場合は自動的にスタンドとなる。</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/30">
                    <h4 className="font-black text-white mb-2">ドロー / ヒット（Draw / Hit）</h4>
                    <p className="text-sm text-gray-300">3枚目のカードを引くこと。プレイヤーは0〜5で自動的にドロー、バンカーはプレイヤーの3枚目のカード次第で複雑な条件によりドローが決まる。全て自動で行われるためプレイヤーの判断は不要。</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/30">
                    <h4 className="font-black text-white mb-2">タブロー（Tableau）</h4>
                    <p className="text-sm text-gray-300">3枚目のカードを引くか引かないかを定めたルール表。バカラの全ての行動はこのタブローに従って機械的に決まるため、プレイヤーが戦略を考える余地はない。罫線を読むことが唯一の戦略要素となる。</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/30">
                    <h4 className="font-black text-white mb-2">プント（Punto）</h4>
                    <p className="text-sm text-gray-300">プレイヤーのイタリア語・スペイン語での呼び方。ヨーロッパのカジノでよく使われる。「プント」と「バンコ」という呼び方はバカラの伝統的な名残で、特にハイローラーの間で好まれる。</p>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 border border-cyan-500/30">
                    <h4 className="font-black text-white mb-2">バンコ（Banco）</h4>
                    <p className="text-sm text-gray-300">バンカーのイタリア語・スペイン語での呼び方。元々バカラは貴族のゲームで、「銀行家（バンカー）」と「客（プント）」という構図から名付けられた。高級カジノでは今でもこの呼び方が使われることがある。</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/30 shadow-2xl">
                <h2 className="text-lg font-black mb-3 flex items-center gap-2 text-white">
                  <Trophy className="w-5 h-5 text-purple-400 drop-shadow-glow" />
                  サイドベット完全図鑑
                </h2>
                <p className="text-xs text-purple-300 mb-4">※配当倍率・出現確率はカジノによって異なります</p>

                <div className="space-y-3">
                  {[
                    { name: 'プレイヤーペア', payout: '11倍', return100: '1100P', chance: '7.47%', desc: 'プレイヤーの最初の2枚が同じ数字' },
                    { name: 'バンカーペア', payout: '11倍', return100: '1100P', chance: '7.47%', desc: 'バンカーの最初の2枚が同じ数字' },
                    { name: 'パーフェクトペア', payout: '25倍', return100: '2500P', chance: '3.34%', desc: '同じ数字＋同じスート（♠♥♦♣）' },
                    { name: '4カードポーカー', payout: '変動', return100: '100-40000P', chance: '変動', desc: 'プレイヤー＋バンカーの4枚で役を作る（ロイヤルフラッシュ400倍、ストレートフラッシュ100倍、フォーカード50倍、フルハウス10倍、フラッシュ7倍、ストレート5倍、スリーカード3倍）' },
                    { name: 'パンダ8', payout: '25倍', return100: '2500P', chance: '3.26%', desc: 'プレイヤーが3枚で合計8で勝利' },
                    { name: 'ドラゴン7', payout: '40倍', return100: '4000P', chance: '2.25%', desc: 'バンカーが3枚で合計7で勝利' },
                    { name: 'ビッグ', payout: '1.54倍', return100: '154P', chance: '51.3%', desc: '5枚または6枚のカードが配られる（元本100P＋利益54P）' },
                    { name: 'スモール', payout: '2.5倍', return100: '250P', chance: '37.8%', desc: '4枚のカードで勝負が決まる' },
                    { name: 'タイ+ペア', payout: '200倍', return100: '20000P', chance: '0.57%', desc: 'タイ＋どちらかがペア' },
                    { name: 'ラッキー6', payout: '12-20倍', return100: '1200-2000P', chance: '5.4%', desc: 'バンカーが2枚で6で勝利：20倍 / 3枚で6で勝利：12倍' },
                    { name: 'スーパー6', payout: '15倍', return100: '1500P', chance: '5.4%', desc: 'バンカーが合計6で勝利' },
                    { name: 'ナチュラル9対8', payout: '80-100倍', return100: '8000-10000P', chance: '0.89%', desc: '最初の2枚でナチュラル9がナチュラル8に勝利' },
                    { name: 'ナチュラル8対7', payout: '50-80倍', return100: '5000-8000P', chance: '1.2%', desc: '最初の2枚でナチュラル8がナチュラル7に勝利' },
                    { name: 'ドラゴンボーナス', payout: '変動', return100: '100-3000P', chance: '変動', desc: '点差で配当変動：9点差30倍、8点差10倍、7点差6倍、6点差4倍、5点差2倍、4点差1倍' },
                    { name: 'ナチュラル', payout: '8-9倍', return100: '800-900P', chance: '15.9%', desc: '最初の2枚で8または9（どちらかが出れば当たり）' },
                    { name: 'ジャックポット', payout: '変動', return100: '変動', chance: '極小', desc: 'カジノ独自の大当たり（条件は店舗による）' }
                  ].map((bet, idx) => (
                    <div key={idx} className="bg-white/5 rounded-xl p-3 border border-purple-500/30">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <span className="font-black text-white block">{bet.name}</span>
                          <p className="text-xs text-gray-400 mt-1">{bet.desc}</p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="text-lg font-black text-purple-400 whitespace-nowrap">{bet.payout}</p>
                          <p className="text-xs text-green-400 font-mono">→{bet.return100}</p>
                          <p className="text-xs text-purple-300 mt-1">{bet.chance}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'simulator' && (
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-purple-500/30 shadow-2xl">
              <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-white">
                <Target className="w-5 h-5 text-purple-400 drop-shadow-glow" />
                バカラシミュレーター
              </h2>
              <BaccaratSimulator />
            </div>
          </div>
        )}

        {activeTab === 'roadmap' && (
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/30 shadow-2xl">
                <h2 className="text-lg font-black mb-4 flex items-center gap-2 text-white">
                  <Grid3x3 className="w-5 h-5 text-blue-400 drop-shadow-glow" />
                  罫線シミュレーター
                </h2>
                <RoadmapSimulator />
              </div>
            </div>
            <RoadmapTerms />
            <RoadmapGuide />
          </div>
        )}

        {activeTab === 'squeeze' && <SqueezeGuide />}

        {activeTab === 'betting' && (
          <div className="space-y-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-red-600 rounded-xl blur-xl opacity-50 animate-pulse" />
              <div className="relative bg-red-600/20 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/50 shadow-2xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0 animate-pulse" />
                  <div>
                    <h3 className="font-black text-red-300 text-lg mb-2">⚠️ 重要な注意事項</h3>
                    <p className="text-sm text-red-200 leading-relaxed">
                      バカラのハウスエッジは約1.06%（バンカー）です。<br />
                      どんな投資法を使っても、<span className="font-black text-red-400">長期的には必ず負ける確率が高く</span>なります。<br /><br />
                      投資法はあくまで<span className="font-black text-yellow-400">「楽しみ方の一つ」</span>であり、確実に勝てる方法ではありません。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-green-500/30 shadow-2xl">
                <h2 className="text-lg font-black mb-3 flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5 text-green-400 drop-shadow-glow" />
                  主な投資法の詳細
                </h2>
                <p className="text-xs text-gray-400 mb-4">★の数はリスク度を表します（★が多いほどハイリスク・ハイリターン）</p>

                <div className="space-y-4">
                  <div className="bg-white/5 rounded-xl p-4 border border-red-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-black text-white text-lg">マーチンゲール法</span>
                      <span className="text-sm text-red-400 font-bold">★★★★★</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">負けたら倍額、勝ったらリセット</p>
                    <div className="bg-black/40 rounded p-3 space-y-2">
                      <p className="text-xs text-white leading-relaxed"><span className="text-green-400 font-black">メリット:</span> 理論上は1回勝てば必ず利益が出る。シンプルで分かりやすい戦略。短期的には効果を発揮しやすい。</p>
                      <p className="text-xs text-white leading-relaxed"><span className="text-red-400 font-black">デメリット:</span> 連敗すると賭け金が指数関数的に増大し、テーブルリミットに到達してシステム崩壊。資金が尽きるリスクが非常に高い。</p>
                      <p className="text-xs text-yellow-300 leading-relaxed"><span className="font-black">具体例:</span> 初回$10で負け→$20で負け→$40で負け→$80で負け→$160で負け→$320で勝利。総賭け額$630で利益$10のみ。</p>
                      <p className="text-xs text-red-300 leading-relaxed"><span className="font-black">注意:</span> 10連敗で賭け金が$10,240に。ほとんどのカジノのテーブルリミットを超える。</p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-blue-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-black text-white text-lg">パーレー法（逆マーチン）</span>
                      <span className="text-sm text-yellow-400 font-bold">★★★☆☆</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">勝ったら倍額、負けたらリセット</p>
                    <div className="bg-black/40 rounded p-3 space-y-2">
                      <p className="text-xs text-white leading-relaxed"><span className="text-green-400 font-black">メリット:</span> 連勝時に利益が爆発的に増える。少額の資金でも大勝ちのチャンスあり。負けても初回ベット額のみの損失。</p>
                      <p className="text-xs text-white leading-relaxed"><span className="text-red-400 font-black">デメリット:</span> 1回負けると積み上げた利益が全て消える。連勝が続く確率は低いため、利益確定のタイミングが難しい。</p>
                      <p className="text-xs text-yellow-300 leading-relaxed"><span className="font-black">具体例:</span> $10（勝）→$20（勝）→$40（勝）→$80（勝）で利益$150。次に$160で負けると利益-$10。</p>
                      <p className="text-xs text-cyan-300 leading-relaxed"><span className="font-black">推奨:</span> 3〜5連勝したら利益確定してリセットするのが賢明。欲張りすぎない。</p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-purple-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-black text-white text-lg">モンテカルロ法</span>
                      <span className="text-sm text-green-400 font-bold">★★☆☆☆</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">数列を使った賭け金管理</p>
                    <div className="bg-black/40 rounded p-3 space-y-2">
                      <p className="text-xs text-white leading-relaxed"><span className="text-green-400 font-black">メリット:</span> リスクが比較的低く、マーチンゲールほど急激に賭け金が増えない。理論的に利益が出やすい設計。</p>
                      <p className="text-xs text-white leading-relaxed"><span className="text-red-400 font-black">デメリット:</span> 数列管理が複雑でメモが必要。連敗が続くと賭け金が徐々に膨らむ。初心者には難しい。</p>
                      <p className="text-xs text-yellow-300 leading-relaxed"><span className="font-black">仕組み:</span> [1,2,3]からスタート。両端の合計（1+3=$4）を賭ける。勝ったら両端を消し、負けたら賭け額を右端に追加。</p>
                      <p className="text-xs text-cyan-300 leading-relaxed"><span className="font-black">実例:</span> [1,2,3]→$4負け→[1,2,3,4]→$5負け→[1,2,3,4,5]→$6勝ち→[2,3,4]→$6勝ち→[3]→完了。</p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-orange-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-black text-white text-lg">ココモ法</span>
                      <span className="text-sm text-orange-400 font-bold">★★★★☆</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">前回＋前々回の賭け金を賭ける</p>
                    <div className="bg-black/40 rounded p-3 space-y-2">
                      <p className="text-xs text-white leading-relaxed"><span className="text-green-400 font-black">メリット:</span> マーチンゲールより緩やかに賭け金が増える。フィボナッチ数列的な増え方で計算しやすい。</p>
                      <p className="text-xs text-white leading-relaxed"><span className="text-red-400 font-black">デメリット:</span> 連敗が続くと回復に時間がかかる。3倍配当のゲーム向きで、バカラでは効率が悪い。</p>
                      <p className="text-xs text-yellow-300 leading-relaxed"><span className="font-black">賭け順:</span> $10→$10→$20（10+10）→$30（10+20）→$50（20+30）→$80（30+50）...</p>
                      <p className="text-xs text-red-300 leading-relaxed"><span className="font-black">警告:</span> 本来はルーレットのダズンベット（3倍配当）用。バカラの2倍配当では利益が出にくい。</p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-cyan-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-black text-white text-lg">ダランベール法</span>
                      <span className="text-sm text-cyan-400 font-bold">★★☆☆☆</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">負けたら1単位増、勝ったら1単位減</p>
                    <div className="bg-black/40 rounded p-3 space-y-2">
                      <p className="text-xs text-white leading-relaxed"><span className="text-green-400 font-black">メリット:</span> 非常に安定的で資金管理がしやすい。大負けのリスクが低く、初心者にも使いやすい。長期戦向き。</p>
                      <p className="text-xs text-white leading-relaxed"><span className="text-red-400 font-black">デメリット:</span> 利益が出にくく、大勝ちは期待できない。勝率50%以下だと徐々に資金が減る。</p>
                      <p className="text-xs text-yellow-300 leading-relaxed"><span className="font-black">具体例:</span> $10→負け→$20→負け→$30→勝ち→$20→勝ち→$10→勝ち→$10（最低ベット維持）</p>
                      <p className="text-xs text-cyan-300 leading-relaxed"><span className="font-black">推奨:</span> 堅実にプレイしたい人向け。エンターテイメントとして楽しむのに最適。</p>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-pink-500/30">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-black text-white text-lg">31システム</span>
                      <span className="text-sm text-pink-400 font-bold">★★★☆☆</span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">9回で$31を使い切る固定戦略</p>
                    <div className="bg-black/40 rounded p-3 space-y-2">
                      <p className="text-xs text-white leading-relaxed"><span className="text-green-400 font-black">メリット:</span> 損失額が明確（最大$31）で資金管理が簡単。2連勝で利益確定できるシンプルなルール。</p>
                      <p className="text-xs text-white leading-relaxed"><span className="text-red-400 font-black">デメリット:</span> 大勝ちは難しく、利益は小さめ。9回のサイクルを何度も繰り返す必要がある。</p>
                      <p className="text-xs text-yellow-300 leading-relaxed"><span className="font-black">賭け順:</span> A:$1→$1→$1 / B:$2→$2 / C:$4→$4 / D:$8→$8。各グループで2連勝したら終了、リセット。</p>
                      <p className="text-xs text-cyan-300 leading-relaxed"><span className="font-black">実例:</span> A組で1勝1敗→B組へ→2連勝で利益確定→リセット。最悪でも$31の損失で済む。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 3s linear infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  )
}