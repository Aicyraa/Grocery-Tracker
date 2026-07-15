import { type GroceryEntries } from '../types'

export function calculateExpenses(entries: GroceryEntries[]): number {
   return entries
      .map(entry => entry.expenses)
      .reduce((prevVal, currVal) => prevVal + currVal, 0)
}
