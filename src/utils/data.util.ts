import { type GroceryEntries, type Items } from '../types'
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

export function deleteEntry(
   entries: GroceryEntries[],
   entryId: number,
): GroceryEntries[] {
   const updatedEntries = entries.filter(entry => entry.id !== entryId)
   persistEntries(updatedEntries)
   return updatedEntries
}

export interface NewItemInput {
   name: string
   price: number
   quantity: number
   category: string
}

export function addItem(
   entry: GroceryEntries,
   newItem: NewItemInput,
): GroceryEntries {
   const lastItem = entry.items[entry.items.length - 1]
   const nextId = lastItem ? lastItem.id + 1 : 1

   const itemToAdd: Items = {
      id: nextId,
      name: newItem.name,
      price: newItem.price,
      quantity: newItem.quantity,
      category: newItem.category,
      isChecked: false,
   }

   return { ...entry, items: [...entry.items, itemToAdd] }
}

// Recalculates expenses (sum of price × quantity for checked items) and
// remaining_balance whenever an item's checked state changes.
function recalculateEntry(entry: GroceryEntries, items: Items[]): GroceryEntries {
   const expenses = items
      .filter(item => item.isChecked)
      .reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0)

   return {
      ...entry,
      items,
      expenses,
      remaining_balance: entry.budget - expenses,
   }
}

export function toggleItem(entry: GroceryEntries, itemId: number): GroceryEntries {
   const updatedItems = entry.items.map(item =>
      item.id === itemId ? { ...item, isChecked: !item.isChecked } : item,
   )
   return recalculateEntry(entry, updatedItems)
}

export function updateItem(
   entry: GroceryEntries,
   itemId: number,
   updates: Partial<Pick<Items, 'name' | 'price' | 'quantity' | 'category'>>,
): GroceryEntries {
   const updatedItems = entry.items.map(item =>
      item.id === itemId ? { ...item, ...updates } : item,
   )
   return recalculateEntry(entry, updatedItems)
}

export function deleteItem(entry: GroceryEntries, itemId: number): GroceryEntries {
   const updatedItems = entry.items.filter(item => item.id !== itemId)
   return recalculateEntry(entry, updatedItems)
}

// After GroceryTab edits a single entry's items, this syncs that edit back
// into the full persisted entries list (App.tsx's source of truth) by id.
export function updateEntryInList(
   entries: GroceryEntries[],
   updatedEntry: GroceryEntries,
): GroceryEntries[] {
   const updatedEntries = entries.map(entry =>
      entry.id === updatedEntry.id ? updatedEntry : entry,
   )
   persistEntries(updatedEntries)
   return updatedEntries
}
