import { useEffect, useState } from 'react'
import {
   LineChart,
   Line,
   XAxis,
   YAxis,
   CartesianGrid,
   Tooltip,
   ResponsiveContainer,
} from 'recharts'
import { Wallet, Tag, CalendarDays, AlertTriangle, Calculator, ShoppingBasket } from 'lucide-react'
import { type GroceryEntries } from '../../types'
import { loadSavedEntries } from '../../utils/storage'
import { groupExpenses, computeSummaryStats, type Granularity } from '../../utils/analytics.util'
import TopNav from '../ui/TopNav'

const GRANULARITIES: { key: Granularity; label: string }[] = [
   { key: 'day', label: 'Day' },
   { key: 'month', label: 'Month' },
   { key: 'year', label: 'Year' },
]

function ExpensesChart() {
   const [entries, setEntries] = useState<GroceryEntries[]>([])
   const [granularity, setGranularity] = useState<Granularity>('month')

   useEffect(() => {
      setEntries(loadSavedEntries())
   }, [])

   const data = groupExpenses(entries, granularity)
   const stats = computeSummaryStats(entries)

   const statCards: { icon: typeof Wallet; label: string; value: string }[] = [
      { icon: Wallet, label: 'Total Spent', value: `₱${stats.totalAllTime}` },
      {
         icon: Wallet,
         label: 'Highest Budget Entry',
         value: stats.highestBudgetEntry
            ? `${stats.highestBudgetEntry.label} (₱${stats.highestBudgetEntry.budget})`
            : '—',
      },
      {
         icon: Tag,
         label: 'Top Category',
         value: stats.topCategory ? `${stats.topCategory.name} (₱${stats.topCategory.total})` : '—',
      },
      {
         icon: CalendarDays,
         label: 'Highest Spend Month',
         value: stats.topMonth ? `${stats.topMonth.label} (₱${stats.topMonth.total})` : '—',
      },
      { icon: AlertTriangle, label: 'Entries Over Budget', value: `${stats.overBudgetCount}` },
      { icon: Calculator, label: 'Average per Entry', value: `₱${Math.round(stats.averagePerEntry)}` },
      {
         icon: ShoppingBasket,
         label: 'Most Purchased Item',
         value: stats.mostPurchasedItem
            ? `${stats.mostPurchasedItem.name} (×${stats.mostPurchasedItem.count})`
            : '—',
      },
      { icon: ShoppingBasket, label: 'Total Items Bought', value: `${stats.totalItemsBought}` },
   ]

   return (
      <div className="min-h-screen bg-gradient-to-b from-white to-green-50 pb-10">
         <TopNav />

         <div className="mx-auto max-w-2xl px-4 py-6">
            <div className="mb-6 grid grid-cols-2 gap-3">
               {statCards.map(card => (
                  <div key={card.label} className="rounded-2xl bg-white p-4 shadow-sm">
                     <card.icon size={16} className="mb-2 text-green-700" />
                     <p className="text-xs text-neutral-400">{card.label}</p>
                     <p className="mt-0.5 truncate text-sm font-semibold text-neutral-900">{card.value}</p>
                  </div>
               ))}
            </div>

            <div className="mb-4 flex gap-2">
               {GRANULARITIES.map(g => (
                  <button
                     key={g.key}
                     type="button"
                     onClick={() => setGranularity(g.key)}
                     className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                        granularity === g.key
                           ? 'bg-green-700 text-white'
                           : 'bg-white text-neutral-500 hover:bg-green-50'
                     }`}
                  >
                     {g.label}
                  </button>
               ))}
            </div>

            <div className="rounded-2xl bg-white p-4 shadow-sm">
               {data.length === 0 ? (
                  <p className="py-10 text-center text-sm text-neutral-400">
                     No expense data yet — add a grocery entry and check off some
                     items first.
                  </p>
               ) : (
                  <ResponsiveContainer width="100%" height={280}>
                     <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <Tooltip
                           formatter={(value) => [`₱${value ?? 0}`, 'Expenses']}
                           contentStyle={{
                              borderRadius: 8,
                              border: '1px solid #dcfce7',
                              fontSize: 12,
                           }}
                        />
                        <Line
                           type="monotone"
                           dataKey="total"
                           stroke="#15803d"
                           strokeWidth={2}
                           dot={{ r: 3, fill: '#15803d' }}
                        />
                     </LineChart>
                  </ResponsiveContainer>
               )}
            </div>
         </div>
      </div>
   )
}

export default ExpensesChart
