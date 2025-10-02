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
  const [budgetAmount, setBudgetAmount] = useState('')
  const [targetProfit, setTargetProfit] = useState('')
  const [existingBudget, setExistingBudget] = useState<Budget | null>(null)

  useEffect(() => {
    let mounted = true

    const fetchCurrentBudget = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user || !mounted) {
          return
        }

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
          setBudgetAmount(data.budget_amount.toString())
          setTargetProfit(data.target_profit?.toString() || '')
        } else {
          setExistingBudget(null)
          setBudgetAmount('')
          setTargetProfit('')
        }
      } catch (error) {
        console.error('Fetch error:', error)
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchCurrentBudget()

    return () => {
      mounted = false
    }
  }, [periodType])

  const getPeriodDates = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth() + 1
    const day = today.getDate()

    let startYear = year
    let startMonth = month
    let startDay = day
    let endYear = year
    let endMonth = month
    let endDay = day

    if (periodType === 'daily') {
      // そのまま
    } else if (periodType === 'weekly') {
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

    const formatDate = (y: number, m: number, d: number) => {
      return `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    }

    return {
      start: formatDate(startYear, startMonth, startDay),
      end: formatDate(endYear, endMonth, endDay)
    }
  }

  const getPeriodLabel = () => {
    const { start, end } = getPeriodDates()
    
    if (periodType === 'daily') {
      const [year, month, day] = start.split('-')
      return `${parseInt(month)}月${parseInt(day)}日`
    } else if (periodType === 'weekly') {
      const [y1, m1, d1] = start.split('-')
      const [y2, m2, d2] = end.split('-')
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
        budget_amount: parseInt(budgetAmount),
        target_profit: targetProfit ? parseInt(targetProfit) : null
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 pb-8">
      <div className="bg-white/70 backdrop-blur-xl border-b border-white/20 sticky top-0 z-50">
        <div className="container max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/all-gamble')}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            
            <div className="text-center flex-1 mx-4">
              <h1 className="text-xl font-black bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                予算・目標設定
              </h1>
              <p className="text-xs text-gray-600 mt-0.5">Budget & Goals</p>
            </div>

            <div className="w-10" />
          </div>
        </div>
      </div>

      <div className="container max-w-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-orange-600" />
              <h3 className="font-black text-gray-900">期間選択</h3>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['daily', 'weekly', 'monthly'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setPeriodType(type)}
                  className={`py-3 rounded-xl font-bold text-sm transition-all ${
                    periodType === type
                      ? 'bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'daily' && '日毎'}
                  {type === 'weekly' && '週毎'}
                  {type === 'monthly' && '月毎'}
                </button>
              ))}
            </div>

            <div className="mt-4 bg-orange-50 rounded-xl p-3 border border-orange-200">
              <p className="text-sm text-gray-700">
                <span className="font-bold">対象期間:</span> {getPeriodLabel()}
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-orange-600" />
              <h3 className="font-black text-gray-900">予算設定</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  使える金額（予算） <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="50000"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 text-gray-900 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  この期間で使える最大金額を設定します
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  勝ちたい金額（目標）
                </label>
                <input
                  type="number"
                  value={targetProfit}
                  onChange={(e) => setTargetProfit(e.target.value)}
                  placeholder="30000"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-500 text-gray-900 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">
                  この期間で達成したい収支目標を設定します（任意）
                </p>
              </div>
            </div>
          </div>

          {budgetAmount && (
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 shadow-lg border border-blue-200">
              <h4 className="font-bold text-gray-900 mb-3">設定内容プレビュー</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex justify-between">
                  <span>期間:</span>
                  <span className="font-bold">{getPeriodLabel()}</span>
                </li>
                <li className="flex justify-between">
                  <span>予算:</span>
                  <span className="font-bold">{parseInt(budgetAmount).toLocaleString()}円</span>
                </li>
                {targetProfit && (
                  <li className="flex justify-between">
                    <span>目標:</span>
                    <span className="font-bold text-green-600">+{parseInt(targetProfit).toLocaleString()}円</span>
                  </li>
                )}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.push('/all-gamble')}
              className="flex-1 py-4 rounded-xl bg-gray-200 text-gray-700 font-bold hover:bg-gray-300 transition-all"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? '保存中...' : (
                <>
                  <Save className="w-5 h-5" />
                  保存する
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}