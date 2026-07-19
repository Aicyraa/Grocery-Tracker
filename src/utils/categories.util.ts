import { type Category } from '../types'

const KEY = 'Storage-Grocery-Categories'

// Seeded once, on first load, so existing entries/items keep matching a category.
const DEFAULT_CATEGORIES: Category[] = [
   { id: 1, name: 'Fruits', iconKey: 'apple' },
   { id: 2, name: 'Vegetables', iconKey: 'carrot' },
   { id: 3, name: 'Meat', iconKey: 'beef' },
   { id: 4, name: 'Dairy', iconKey: 'milk' },
   { id: 5, name: 'Bakery', iconKey: 'wheat' },
   { id: 6, name: 'Snacks', iconKey: 'cookie' },
   { id: 7, name: 'Other', iconKey: 'package' },
]

export function loadCategories(): Category[] {
   const raw = localStorage.getItem(KEY)
   if (!raw) {
      persistCategories(DEFAULT_CATEGORIES)
      return DEFAULT_CATEGORIES
   }
   try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_CATEGORIES
   } catch {
      return DEFAULT_CATEGORIES
   }
}

export function persistCategories(categories: Category[]): void {
   localStorage.setItem(KEY, JSON.stringify(categories))
}

export interface NewCategoryInput {
   name: string
   iconKey: string
}

export class DuplicateCategoryError extends Error {}

// Fully open-ended category creation, guarded against duplicate names
// (case-insensitive, trimmed) so users can't create "Fruits" and "fruits " twice.
export function addCategory(
   categories: Category[],
   newCategory: NewCategoryInput,
): Category[] {
   const trimmedName = newCategory.name.trim()
   const isDuplicate = categories.some(
      category => category.name.toLowerCase() === trimmedName.toLowerCase(),
   )

   if (isDuplicate) {
      throw new DuplicateCategoryError('A category with this name already exists.')
   }

   const lastCategory = categories[categories.length - 1]
   const nextId = lastCategory ? lastCategory.id + 1 : 1

   const updatedCategories = [
      ...categories,
      { id: nextId, name: trimmedName, iconKey: newCategory.iconKey },
   ]

   persistCategories(updatedCategories)
   return updatedCategories
}

export class ProtectedCategoryError extends Error {}

// "Other" is protected since it's the fallback target items get reassigned
// to when their own category is deleted — deleting it too would leave
// reassignment with nowhere to go.
export function deleteCategory(categories: Category[], categoryId: number): Category[] {
   const target = categories.find(category => category.id === categoryId)
   if (target && target.name.toLowerCase() === 'other') {
      throw new ProtectedCategoryError('"Other" can\'t be deleted — it\'s the fallback category.')
   }

   const updatedCategories = categories.filter(category => category.id !== categoryId)
   persistCategories(updatedCategories)
   return updatedCategories
}

export function findCategory(
   categories: Category[],
   categoryName: string,
): Category | undefined {
   return categories.find(category => category.name === categoryName)
}
