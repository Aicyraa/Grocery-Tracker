import { type GroceryEntries } from '../types'

export type Granularity = 'day' | 'month' | 'year'

export interface ExpensePoint {
   label: string
   total: number
   sortKey: string
}

// Entries only carry one date each (no per-item purchase dates), so grouping
// by day/month/year means bucketing entries by their date and summing
// `expenses`. Buckets are returned sorted chronologically for the chart.
export function groupExpenses(
   entries: GroceryEntries[],
   granularity: Granularity,
): ExpensePoint[] {
   const buckets = new Map<string, number>()

   entries.forEach(entry => {
      let key: string
      if (granularity === 'day') key = entry.date // already YYYY-MM-DD
      else if (granularity === 'month') key = entry.date.slice(0, 7) // YYYY-MM
      else key = entry.date.slice(0, 4) // YYYY

      buckets.set(key, (buckets.get(key) ?? 0) + entry.expenses)
   })

   const sortedKeys = Array.from(buckets.keys()).sort()

   return sortedKeys.map(key => {
      let label: string
      if (granularity === 'day') {
         label = new Date(key).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
         })
      } else if (granularity === 'month') {
         label = new Date(`${key}-01`).toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
         })
      } else {
         label = key
      }

      return { label, total: buckets.get(key) ?? 0, sortKey: key }
   })
}

export interface SummaryStats {
   totalAllTime: number
   highestBudgetEntry?: { label: string; budget: number }
   topCategory?: { name: string; total: number }
   topMonth?: { label: string; total: number }
   overBudgetCount: number
   averagePerEntry: number
   mostPurchasedItem?: { name: string; count: number }
   totalItemsBought: number
}

export function computeSummaryStats(entries: GroceryEntries[]): SummaryStats {
   const totalAllTime = entries.reduce((sum, entry) => sum + entry.expenses, 0)

   const highestBudgetEntry = entries.reduce<GroceryEntries | undefined>(
      (max, entry) => (!max || entry.budget > max.budget ? entry : max),
      undefined,
   )

   const categoryTotals: Record<string, number> = {}
   entries.forEach(entry => {
      entry.items
         .filter(item => item.isChecked)
         .forEach(item => {
            categoryTotals[item.category] =
               (categoryTotals[item.category] ?? 0) + item.price * (item.quantity ?? 1)
         })
   })
   const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]

   const monthTotals = groupExpenses(entries, 'month')
   const topMonthEntry = [...monthTotals].sort((a, b) => b.total - a.total)[0]

   const overBudgetCount = entries.filter(entry => entry.expenses > entry.budget).length
   const averagePerEntry = entries.length ? totalAllTime / entries.length : 0

   const itemCounts: Record<string, number> = {}
   let totalItemsBought = 0
   entries.forEach(entry => {
      entry.items
         .filter(item => item.isChecked)
         .forEach(item => {
            itemCounts[item.name] = (itemCounts[item.name] ?? 0) + 1
            totalItemsBought += 1
         })
   })
   const mostPurchasedEntry = Object.entries(itemCounts).sort((a, b) => b[1] - a[1])[0]

   return {
      totalAllTime,
      highestBudgetEntry: highestBudgetEntry
         ? { label: highestBudgetEntry.label, budget: highestBudgetEntry.budget }
         : undefined,
      topCategory: topCategoryEntry ? { name: topCategoryEntry[0], total: topCategoryEntry[1] } : undefined,
      topMonth: topMonthEntry ? { label: topMonthEntry.label, total: topMonthEntry.total } : undefined,
      overBudgetCount,
      averagePerEntry,
      mostPurchasedItem: mostPurchasedEntry
         ? { name: mostPurchasedEntry[0], count: mostPurchasedEntry[1] }
         : undefined,
      totalItemsBought,
   }
}
