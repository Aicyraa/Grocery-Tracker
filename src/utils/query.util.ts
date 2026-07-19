import { type GroceryEntries, type Category } from '../types'

export type Metric =
   | 'total'
   | 'budget'
   | 'remaining'
   | 'itemCount'
   | 'topCategory'
   | 'overBudget'
   | 'compare'

export type Period =
   | 'today'
   | 'week'
   | 'month'
   | 'year'
   | 'lastWeek'
   | 'lastMonth'
   | 'lastYear'
   | 'all'

export interface QueryFacts {
   metric: Metric
   period: Period
   category?: string
   value: number
   compareValue?: number
   summarySentence: string
}

// Carried from the previous turn so short follow-ups like "what about last
// month?" or "and dairy?" can inherit whatever wasn't re-specified.
export interface PreviousContext {
   metric: Metric
   period: Period
   category?: string
}

function isWithinPeriod(dateStr: string, period: Period): boolean {
   if (period === 'all') return true

   const entryDate = new Date(dateStr)
   const now = new Date()

   if (period === 'today') return entryDate.toDateString() === now.toDateString()

   if (period === 'week') {
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      return entryDate >= weekAgo && entryDate <= now
   }
   if (period === 'lastWeek') {
      const twoWeeksAgo = new Date(now)
      twoWeeksAgo.setDate(now.getDate() - 14)
      const weekAgo = new Date(now)
      weekAgo.setDate(now.getDate() - 7)
      return entryDate >= twoWeeksAgo && entryDate < weekAgo
   }
   if (period === 'month') {
      return (
         entryDate.getFullYear() === now.getFullYear() &&
         entryDate.getMonth() === now.getMonth()
      )
   }
   if (period === 'lastMonth') {
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      return (
         entryDate.getFullYear() === lastMonth.getFullYear() &&
         entryDate.getMonth() === lastMonth.getMonth()
      )
   }
   if (period === 'year') return entryDate.getFullYear() === now.getFullYear()
   // lastYear
   return entryDate.getFullYear() === now.getFullYear() - 1
}

function detectPeriod(question: string): Period | undefined {
   const q = question.toLowerCase()
   if (q.includes('last week')) return 'lastWeek'
   if (q.includes('last month')) return 'lastMonth'
   if (q.includes('last year')) return 'lastYear'
   if (q.includes('today')) return 'today'
   if (q.includes('week')) return 'week'
   if (q.includes('month')) return 'month'
   if (q.includes('year')) return 'year'
   return undefined
}

function detectMetric(question: string): Metric | undefined {
   const q = question.toLowerCase()
   if (q.includes('compare') || q.includes(' vs ') || q.includes('versus') || q.includes('compared to')) {
      return 'compare'
   }
   if (
      q.includes('top category') ||
      q.includes('most spent') ||
      q.includes('which category') ||
      q.includes('highest category')
   ) {
      return 'topCategory'
   }
   if (q.includes('over budget') || q.includes('overspent') || q.includes('exceeded')) {
      return 'overBudget'
   }
   if (q.includes('budget')) return 'budget'
   if (q.includes('remaining') || q.includes('left')) return 'remaining'
   if (q.includes('how many') || q.includes('item count') || q.includes('items')) {
      return 'itemCount'
   }
   if (q.includes('spent') || q.includes('spend') || q.includes('expense') || q.includes('cost')) {
      return 'total'
   }
   return undefined
}

function normalizeWord(word: string): string {
   return word.toLowerCase().replace(/[^a-z]/g, '').replace(/s$/, '')
}

function levenshtein(a: string, b: string): number {
   const dp: number[][] = Array.from({ length: a.length + 1 }, () =>
      new Array(b.length + 1).fill(0),
   )
   for (let i = 0; i <= a.length; i++) dp[i][0] = i
   for (let j = 0; j <= b.length; j++) dp[0][j] = j
   for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
         dp[i][j] =
            a[i - 1] === b[j - 1]
               ? dp[i - 1][j - 1]
               : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1])
      }
   }
   return dp[a.length][b.length]
}

// Fuzzy: tolerates plurals ("veggies" vs "Vegetables") and small typos.
function detectCategory(question: string, categories: Category[]): string | undefined {
   const words = question
      .toLowerCase()
      .split(/\W+/)
      .filter(Boolean)
      .map(normalizeWord)

   let best: { name: string; distance: number } | undefined

   for (const category of categories) {
      const catNorm = normalizeWord(category.name)
      for (const word of words) {
         if (word.length < 3) continue
         const distance =
            word.includes(catNorm) || catNorm.includes(word) ? 0 : levenshtein(word, catNorm)
         const threshold = catNorm.length <= 4 ? 1 : 2
         if (distance <= threshold && (!best || distance < best.distance)) {
            best = { name: category.name, distance }
         }
      }
   }

   return best?.name
}

function computeTotal(entries: GroceryEntries[], category?: string): number {
   return entries.reduce((sum, entry) => {
      const items = category ? entry.items.filter(item => item.category === category) : entry.items
      const entryTotal = items
         .filter(item => item.isChecked)
         .reduce((itemSum, item) => itemSum + item.price * (item.quantity ?? 1), 0)
      return sum + entryTotal
   }, 0)
}

function computeCategoryTotals(entries: GroceryEntries[]): Record<string, number> {
   const totals: Record<string, number> = {}
   entries.forEach(entry => {
      entry.items
         .filter(item => item.isChecked)
         .forEach(item => {
            totals[item.category] = (totals[item.category] ?? 0) + item.price * (item.quantity ?? 1)
         })
   })
   return totals
}

// Parses a natural-language question into a deterministic fact computed
// directly from the entries — the AI model never does the arithmetic itself,
// it only phrases the sentence. Falls back to `previous` context for
// whatever the question doesn't explicitly re-specify (multi-turn support).
export function parseQuery(
   question: string,
   entries: GroceryEntries[],
   categories: Category[],
   previous?: PreviousContext,
): QueryFacts {
   const q = question.toLowerCase()
   const explicitReset = q.includes('overall') || q.includes('all categories') || q.includes('every category')

   const detectedPeriod = detectPeriod(question)
   const detectedMetric = detectMetric(question)
   const detectedCategory = explicitReset ? undefined : detectCategory(question, categories)

   const period = detectedPeriod ?? previous?.period ?? 'all'
   const metric = detectedMetric ?? previous?.metric ?? 'total'
   const category = explicitReset ? undefined : detectedCategory ?? previous?.category

   const relevantEntries = entries.filter(entry => isWithinPeriod(entry.date, period))

   let value = 0
   let compareValue: number | undefined
   let extra: string | undefined

   if (metric === 'budget') {
      value = relevantEntries.reduce((sum, entry) => sum + entry.budget, 0)
   } else if (metric === 'remaining') {
      value = relevantEntries.reduce((sum, entry) => sum + entry.remaining_balance, 0)
   } else if (metric === 'itemCount') {
      value = relevantEntries.reduce((sum, entry) => {
         const items = category ? entry.items.filter(item => item.category === category) : entry.items
         return sum + items.length
      }, 0)
   } else if (metric === 'topCategory') {
      const totals = computeCategoryTotals(relevantEntries)
      const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1])
      if (sorted.length) {
         extra = sorted[0][0]
         value = sorted[0][1]
      }
   } else if (metric === 'overBudget') {
      const overBudgetEntries = relevantEntries.filter(entry => entry.expenses > entry.budget)
      value = overBudgetEntries.length
      extra = overBudgetEntries.slice(0, 3).map(entry => entry.label).join(', ')
   } else if (metric === 'compare') {
      const baseUnit: 'week' | 'month' | 'year' =
         period === 'week' || period === 'lastWeek'
            ? 'week'
            : period === 'year' || period === 'lastYear'
              ? 'year'
              : 'month'
      const previousUnitKey = (
         'last' + baseUnit[0].toUpperCase() + baseUnit.slice(1)
      ) as Period

      value = computeTotal(entries.filter(entry => isWithinPeriod(entry.date, baseUnit)), category)
      compareValue = computeTotal(
         entries.filter(entry => isWithinPeriod(entry.date, previousUnitKey)),
         category,
      )
   } else {
      value = computeTotal(relevantEntries, category)
   }

   const periodLabel =
      period === 'all'
         ? 'overall'
         : period === 'today'
           ? 'today'
           : period === 'lastWeek'
             ? 'last week'
             : period === 'lastMonth'
               ? 'last month'
               : period === 'lastYear'
                 ? 'last year'
                 : `this ${period}`

   const categoryLabel = category ? ` on ${category}` : ''

   let summarySentence: string

   if (metric === 'topCategory') {
      summarySentence = extra
         ? `The top spending category ${periodLabel} is ${extra}, at ₱${value}.`
         : `No spending recorded ${periodLabel} yet.`
   } else if (metric === 'overBudget') {
      summarySentence =
         value > 0
            ? `${value} ${value === 1 ? 'entry' : 'entries'} went over budget ${periodLabel}${
                 extra ? ` (${extra})` : ''
              }.`
            : `No entries went over budget ${periodLabel}.`
   } else if (metric === 'compare') {
      const diff = value - (compareValue ?? 0)
      const direction = diff > 0 ? 'more' : diff < 0 ? 'less' : 'the same as'
      summarySentence = `₱${value}${categoryLabel} this period vs ₱${compareValue ?? 0} the previous period — that's ₱${Math.abs(
         diff,
      )} ${direction}.`
   } else if (metric === 'itemCount') {
      summarySentence = `${value} items${categoryLabel} ${periodLabel}.`
   } else {
      const metricLabel = metric === 'budget' ? 'budget' : metric === 'remaining' ? 'remaining balance' : 'spent'
      summarySentence = `₱${value}${categoryLabel} ${metricLabel} ${periodLabel}.`
   }

   return { metric, period, category, value, compareValue, summarySentence }
}

// A compact, always-true snapshot of the data, given to the model as extra
// context so it can handle looser phrasing without needing a hand-written
// pattern for every possible question.
export function buildContextSummary(entries: GroceryEntries[]): string {
   const totalAllTime = computeTotal(entries)
   const totalThisMonth = computeTotal(entries.filter(entry => isWithinPeriod(entry.date, 'month')))
   const totalThisYear = computeTotal(entries.filter(entry => isWithinPeriod(entry.date, 'year')))
   const categoryTotals = computeCategoryTotals(entries)
   const topCategoryEntry = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0]
   const overBudgetCount = entries.filter(entry => entry.expenses > entry.budget).length

   return [
      `Total spent all-time: ₱${totalAllTime}`,
      `Total spent this month: ₱${totalThisMonth}`,
      `Total spent this year: ₱${totalThisYear}`,
      topCategoryEntry
         ? `Top spending category overall: ${topCategoryEntry[0]} (₱${topCategoryEntry[1]})`
         : 'No category spending recorded yet.',
      `Entries currently over budget: ${overBudgetCount}`,
   ].join('\n')
}
