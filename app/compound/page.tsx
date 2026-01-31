'use client'

import React, { useState, useEffect } from 'react'
import { Calculator, DollarSign, TrendingUp, Calendar, Percent } from 'lucide-react'
import Layout from '../components/Layout'
import { Panel } from '../components/Panel'

interface BreakdownItem {
  year: number
  startBalance: number
  contributions: number
  interest: number
  endBalance: number
  totalPrincipal: number
}

export default function CompoundCalculator() {
  const [principal, setPrincipal] = useState<string>('10000')
  const [contribution, setContribution] = useState<string>('0')
  const [rate, setRate] = useState<string>('5')
  const [years, setYears] = useState<string>('10')
  const [frequency, setFrequency] = useState<string>('annually')

  const [result, setResult] = useState<{
    futureValue: number
    totalPrincipal: number
    totalInterest: number
    breakdown: BreakdownItem[]
  } | null>(null)

  const calculate = React.useCallback(() => {
    const p = parseFloat(principal) || 0
    const pmt = parseFloat(contribution) || 0
    const r = parseFloat(rate) || 0
    const y = parseFloat(years) || 0

    if (y <= 0) return

    let currentBalance = p
    let totalContributed = p
    const breakdown: BreakdownItem[] = []

    // Convert rate to decimal
    const rDecimal = r / 100

    // Determine compounds per year
    let n = 1
    if (frequency === 'daily') n = 365
    else if (frequency === 'monthly') n = 12
    else if (frequency === 'quarterly') n = 4
    else if (frequency === 'annually') n = 1

    const totalMonths = Math.ceil(y * 12)

    // Track yearly stats
    let yearStartBalance = p
    let yearContributions = 0
    let yearInterest = 0

    // Simulation state
    let simBalance = p

    // We simulate month by month to handle monthly contributions
    for (let month = 1; month <= totalMonths; month++) {
      // Add monthly contribution
      simBalance += pmt
      yearContributions += pmt
      totalContributed += pmt

      // Calculate interest
      // If frequency >= monthly (n >= 12), we can apply effective monthly rate
      // If frequency < monthly (n < 12), we only apply interest at specific months

      if (n >= 12) {
        // Effective monthly rate based on compounding frequency
        // (1 + r/n)^(n/12) - 1
        const effectiveMonthlyRate = Math.pow(1 + rDecimal/n, n/12) - 1
        const interest = simBalance * effectiveMonthlyRate // Interest on balance (including just added contribution? usually no, but let's simplify)
        // Correction: usually contributions at end of month don't earn interest in that month.
        // Let's assume contribution at END of month.
        // So interest is calculated on balance BEFORE contribution.
        const interestBase = simBalance - pmt
        const monthlyInterest = interestBase * effectiveMonthlyRate
        simBalance += monthlyInterest
        yearInterest += monthlyInterest
      } else {
        // Discrete compounding for Quarterly/Annually
        // Check if this is a compounding month
        // Annually: month 12, 24...
        // Quarterly: month 3, 6, 9...
        const monthsPerCompound = 12 / n
        if (month % monthsPerCompound === 0) {
           // Apply interest for the period
           // Rate for the period is r/n
           // Applied to current balance
           const periodInterest = simBalance * (rDecimal / n) // Simplified.
           // Technically, with intra-period contributions, they might earn partial interest or none.
           // Standard Simple Interest for fractional periods? Or just compound at end.
           // We'll compound at end of period on the full balance.
           simBalance += periodInterest
           yearInterest += periodInterest
        }
      }

      // End of year snapshot
      if (month % 12 === 0) {
        breakdown.push({
          year: month / 12,
          startBalance: yearStartBalance,
          contributions: yearContributions,
          interest: yearInterest,
          endBalance: simBalance,
          totalPrincipal: totalContributed
        })

        // Reset yearly counters
        yearStartBalance = simBalance
        yearContributions = 0
        yearInterest = 0
      }
    }

    setResult({
      futureValue: simBalance,
      totalPrincipal: totalContributed,
      totalInterest: simBalance - totalContributed,
      breakdown
    })
  }, [principal, contribution, rate, years, frequency])

  useEffect(() => {
    calculate()
  }, [calculate])

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(val)
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6 max-w-6xl mx-auto p-4">

        {/* Input Panel */}
        <Panel
          title="参数设置"
          icon={<Calculator size={18} />}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <DollarSign size={14} /> 起始金额
              </label>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                className="w-full"
                min="0"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Calendar size={14} /> 每月定投
              </label>
              <input
                type="number"
                value={contribution}
                onChange={(e) => setContribution(e.target.value)}
                className="w-full"
                min="0"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Percent size={14} /> 年利率 (%)
              </label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="w-full"
                step="0.1"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <Calendar size={14} /> 投资年限
              </label>
              <input
                type="number"
                value={years}
                onChange={(e) => setYears(e.target.value)}
                className="w-full"
                min="1"
                max="100"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                <TrendingUp size={14} /> 复利频率
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full"
              >
                <option value="daily">每天 (Daily)</option>
                <option value="monthly">每月 (Monthly)</option>
                <option value="quarterly">每季 (Quarterly)</option>
                <option value="annually">每年 (Annually)</option>
              </select>
            </div>
          </div>
        </Panel>

        {/* Results Panel */}
        {result && (
          <Panel
            title="计算结果"
            icon={<TrendingUp size={18} />}
          >
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-surface-hover rounded-lg border border-theme">
                <div className="text-xs text-text-muted uppercase tracking-wider mb-1">期末总值</div>
                <div className="text-2xl font-bold text-primary">{formatCurrency(result.futureValue)}</div>
              </div>
              <div className="p-4 bg-surface-hover rounded-lg border border-theme">
                <div className="text-xs text-text-muted uppercase tracking-wider mb-1">本金总额</div>
                <div className="text-xl font-semibold text-text-primary">{formatCurrency(result.totalPrincipal)}</div>
              </div>
              <div className="p-4 bg-surface-hover rounded-lg border border-theme">
                <div className="text-xs text-text-muted uppercase tracking-wider mb-1">利息总额</div>
                <div className="text-xl font-semibold text-success">{formatCurrency(result.totalInterest)}</div>
              </div>
            </div>

            {/* Breakdown Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-surface-hover text-text-secondary">
                  <tr>
                    <th className="p-3 border-b border-theme font-medium">年份</th>
                    <th className="p-3 border-b border-theme font-medium">期初余额</th>
                    <th className="p-3 border-b border-theme font-medium">本年投入</th>
                    <th className="p-3 border-b border-theme font-medium">本年利息</th>
                    <th className="p-3 border-b border-theme font-medium">期末余额</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-theme">
                  {result.breakdown.map((item) => (
                    <tr key={item.year} className="hover:bg-surface-hover transition-colors">
                      <td className="p-3 font-mono">{item.year}</td>
                      <td className="p-3 font-mono text-text-muted">{formatCurrency(item.startBalance)}</td>
                      <td className="p-3 font-mono text-text-primary">{formatCurrency(item.contributions)}</td>
                      <td className="p-3 font-mono text-success">+{formatCurrency(item.interest)}</td>
                      <td className="p-3 font-mono font-semibold text-primary">{formatCurrency(item.endBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>
        )}
      </div>
    </Layout>
  )
}
