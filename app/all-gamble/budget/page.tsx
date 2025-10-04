'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Save, Target, Calendar } from 'lucide-react'

interface Budget {
  id?: string
  period_type: 'daily' | 'weekly' | 'monthly'
  period_start: string
  period_end: string
  budget_amount: number
  target_profit: number | null
  actual_spent: number
  actual_profit: number
}

export default function BudgetPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [periodType, setPeriodType] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
  const [budgetAmount, setBudgetAmount] = useState<number>(0)
  const [targetProfit, setTargetProfit] = useState<number>(0)
  const [existingBudget, setExistingBudget] = useState<Budget | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchCurrentBudget = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !mounted) return

        const { start, end } = getPeriodDates()

        const { data, error } = await supabase
          .from('gamble_budgets')
          .select('*')
          .eq('user_id', user.id)
          .eq('period_type', periodType)
          .eq('period_start', start)
          .eq('period_end', end)
          .maybeSingle()

        if (!mounted) return

        if (data) {
          setExistingBudget(data)
          setBudgetAmount(data.budget_amount)
          setTargetProfit(data.target_profit || 0)
        } else {
          setExistingBudget(null)
          setBudgetAmount(0)
          setTargetProfit(0)
        }
      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchCurrentBudget()
    return () => { mounted = false }
  }, [periodType])

  const getPeriodDates = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()

    let startYear = year, startMonth = month, startDay = day
    let endYear = year, endMonth = month, endDay = day

    if (periodType === 'weekly') {
      const dayOfWeek = today.getDay()
      const daysFromMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1
      const weekStart = new Date(today.getTime() - daysFromMonday * 24 * 60 * 60 * 1000)
      const weekEnd = new Date(weekStart.getTime() + 6 * 24 * 60 * 60 * 1000)
      
      startYear = weekStart.getFullYear()
      startMonth = weekStart.getMonth() + 1
      startDay = weekStart.getDate()
      endYear = weekEnd.getFullYear()
      endMonth = weekEnd.getMonth() + 1
      endDay = weekEnd.getDate()
    } else if (periodType === 'monthly') {
      startDay = 1
      const lastDay = new Date(year, month, 0)
      endDay = lastDay.getDate()
    }

    const formatDate = (y: number, m: number, d: number) => 
      `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`

    return {
      start: formatDate(startYear, startMonth, startDay),
      end: formatDate(endYear, endMonth, endDay)
    }
  }

  const getPeriodLabel = () => {
    const { start, end } = getPeriodDates()
    
    if (periodType === 'daily') {
      const [, month, day] = start.split('-')
      return `${parseInt(month)}月${parseInt(day)}日`
    } else if (periodType === 'weekly') {
      const [, m1, d1] = start.split('-')
      const [, m2, d2] = end.split('-')
      return `${parseInt(m1)}/${parseInt(d1)} - ${parseInt(m2)}/${parseInt(d2)}`
    } else {
      const [year, month] = start.split('-')
      return `${year}年${parseInt(month)}月`
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { start, end } = getPeriodDates()

      const budgetData = {
        user_id: user.id,
        period_type: periodType,
        period_start: start,
        period_end: end,
        budget_amount: budgetAmount,
        target_profit: targetProfit || null
      }

      if (existingBudget?.id) {
        const { error } = await supabase
          .from('gamble_budgets')
          .update(budgetData)
          .eq('id', existingBudget.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('gamble_budgets')
          .insert(budgetData)
        if (error) throw error
      }

      alert('保存しました')
      router.push('/all-gamble')
    } catch (error) {
      console.error('Save error:', error)
      alert('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 flex items-center justify-center">
        <div className="relative">
          <div className="w-24 h-24 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Target className="w-10 h-10 text-orange-500 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 pb-8">
      <div className="bg-black/60 backdrop-blur-xl border-b-2 border-orange-500/50 sticky top-0 z-50">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => router.push('/all-gamble')} className="relative group">
              <div className="absolute inset-0 bg-orange-600 blur-lg opacity-0 group-hover:opacity-75 transition-opacity rounded-full" />
              <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-black/60 backdrop-blur-sm border-2 border-orange-500/50 hover:border-orange-400 transition-all">
                <ArrowLeft className="h-5 w-5 text-orange-300" />
              </div>
            </button>
            
            <div className="text-center flex-1 mx-4">
              <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 drop-shadow-glow">
                予算・目標設定
              </h1>
              <p className="text-xs text-orange-200 mt-0.5 font-semibold">Budget & Goals</p>
            </div>
            <div className="w-12" />
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6">
        <div className="space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-orange-600 blur-xl opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-orange-500/50">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-orange-400" />
                <h3 className="font-black text-white">期間選択</h3>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {(['daily', 'weekly', 'monthly'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setPeriodType(type)}
                    className={`py-3 rounded-xl font-black text-sm transition-all ${
                      periodType === type
                        ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                        : 'bg-white/10 text-orange-200 hover:bg-white/20'
                    }`}
                  >
                    {type === 'daily' ? '日毎' : type === 'weekly' ? '週毎' : '月毎'}
                  </button>
                ))}
              </div>

              <div className="mt-4 bg-orange-500/20 rounded-xl p-3 border border-orange-400/30">
                <p className="text-sm text-orange-100 font-semibold">
                  <span className="font-black">対象期間:</span> {getPeriodLabel()}
                </p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-red-600 blur-xl opacity-50" />
            <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-red-500/50">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-red-400" />
                <h3 className="font-black text-white">予算設定</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-black text-red-300 mb-2">
                    使える金額（予算） <span className="text-yellow-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    value={budgetAmount || ''}
                    onChange={(e) => setBudgetAmount(parseInt(e.target.value) || 0)}
                    placeholder="50000"
                    step={1000}
                    className="w-full px-4 py-3 rounded-xl border-2 border-red-500/50 bg-black/40 text-white focus:border-red-400 focus:outline-none transition-colors font-black text-lg backdrop-blur-sm placeholder-red-400"
                  />
                  <p className="text-xs text-red-200 mt-2 font-semibold">
                    この期間で使える最大金額を設定します
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-black text-red-300 mb-2">
                    勝ちたい金額（目標）
                  </label>
                  <input
                    type="number"
                    value={targetProfit || ''}
                    onChange={(e) => setTargetProfit(parseInt(e.target.value) || 0)}
                    placeholder="30000"
                    step={1000}
                    className="w-full px-4 py-3 rounded-xl border-2 border-red-500/50 bg-black/40 text-white focus:border-red-400 focus:outline-none transition-colors font-black text-lg backdrop-blur-sm placeholder-red-400"
                  />
                  <p className="text-xs text-red-200 mt-2 font-semibold">
                    この期間で達成したい収支目標を設定します（任意）
                  </p>
                </div>
              </div>
            </div>
          </div>

          {budgetAmount > 0 && (
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600 blur-xl opacity-50" />
              <div className="relative bg-black/60 backdrop-blur-sm rounded-2xl p-5 border-2 border-blue-500/50">
                <h4 className="font-black text-white mb-3">設定内容プレビュー</h4>
                <ul className="space-y-2 text-sm text-blue-100">
                  <li className="flex justify-between">
                    <span className="font-semibold">期間:</span>
                    <span className="font-black">{getPeriodLabel()}</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="font-semibold">予算:</span>
                    <span className="font-black">{budgetAmount.toLocaleString()}円</span>
                  </li>
                  {targetProfit > 0 && (
                    <li className="flex justify-between">
                      <span className="font-semibold">目標:</span>
                      <span className="font-black text-green-400">+{targetProfit.toLocaleString()}円</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/all-gamble')}
              className="flex-1 py-4 rounded-xl bg-white/10 text-white font-black hover:bg-white/20 transition-all border-2 border-white/20"
            >
              キャンセル
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || budgetAmount === 0}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-black shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? '保存中...' : <><Save className="w-5 h-5" />保存する</>}
            </button>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .drop-shadow-glow {
          filter: drop-shadow(0 0 8px currentColor);
        }
      `}</style>
    </div>
  )
}