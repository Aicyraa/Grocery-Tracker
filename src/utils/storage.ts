import { type GroceryEntries } from '../types'

const KEY = 'Storage-Grocery-Entries'

export function loadSavedEntries(): GroceryEntries[] {
   const raw = localStorage.getItem(KEY)
   try {
      const parsed = JSON.parse(raw as string)
      return Array.isArray(parsed) ? parsed : []
   } catch {
      return []
   }
}

export function persistEntries(entries: GroceryEntries[]): void {
   localStorage.setItem(KEY, JSON.stringify(entries))
}
