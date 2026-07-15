import { type GroceryEntries } from '../types'
import { loadSavedEntries, persistEntries } from './storage'

export interface SaveDataInput {
   label: string
   budget: number
   date: string | Date
}

export function saveData(
   entries: GroceryEntries[],
   newEntry: SaveDataInput,
): GroceryEntries[] {
   const existingEntries = entries.length ? entries : loadSavedEntries()
   const lastEntry = existingEntries[existingEntries.length - 1]
   const nextId = lastEntry ? lastEntry.id + 1 : 1

   const formattedDate =
      typeof newEntry.date === 'string'
         ? newEntry.date
         : newEntry.date.toISOString().split('T')[0]

   const entryToSave: GroceryEntries = {
      id: nextId,
      label: newEntry.label,
      budget: newEntry.budget,
      date: formattedDate,
      expenses: 0,
      remaining_balance: newEntry.budget,
      items: [],
   }

   const updatedEntries = [...existingEntries, entryToSave]
   persistEntries(updatedEntries)
   return updatedEntries
}
