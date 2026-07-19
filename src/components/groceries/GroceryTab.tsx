import { useEffect, useState } from 'react'
import type { GroceryEntries, Category } from '../../types'
import { useLocation, Navigate, Outlet } from 'react-router-dom'
import { PhilippinePeso, Plus, FolderPlus } from 'lucide-react'

import GroceryNav from './GroceryNav'
import FormItem from '../forms/FormItem'
import FormCategory from '../forms/FormCategory'
import FormGrocery from '../forms/FormGrocery'
import AnimatedModal from '../ui/AnimatedModal'
import Modal from '../ui/Modal'
import {
   addItem,
   updateEntryInList,
   applyEntryEdits,
   reassignItemsCategory,
   type SaveDataInput,
} from '../../utils/data.util'
import { loadSavedEntries } from '../../utils/storage'
import {
   loadCategories,
   addCategory,
   deleteCategory,
   DuplicateCategoryError,
   ProtectedCategoryError,
   type NewCategoryInput,
} from '../../utils/categories.util'

// Shared shape passed down to nested routes (GroceryItems) via <Outlet context>.
export interface GroceryContext {
   currentEntry: GroceryEntries
   setCurrentEntry: (value: GroceryEntries) => void
   categories: Category[]
}

const FALLBACK_CATEGORY = 'Other'

function GroceryTab() {
   const data = useLocation()
   const [currentEntry, setCurrentEntry] = useState<GroceryEntries | undefined>(
      data.state?.entry,
   )
   const [categories, setCategories] = useState<Category[]>(() => loadCategories())
   const [showItemForm, setShowItemForm] = useState(false)
   const [showCategoryForm, setShowCategoryForm] = useState(false)
   const [showEntryEditForm, setShowEntryEditForm] = useState(false)
   const [categoryError, setCategoryError] = useState<string | null>(null)
   const [categoryPendingDelete, setCategoryPendingDelete] = useState<Category | null>(null)

   // Whenever this entry's items/expenses change, sync it back into the full
   // persisted entries list so App.tsx's list view and localStorage stay current.
   useEffect(() => {
      if (!currentEntry) return
      const allEntries = loadSavedEntries()
      updateEntryInList(allEntries, currentEntry)
   }, [currentEntry])

   if (!currentEntry) {
      return <Navigate to="/" replace />
   }

   function handleAddItem(newItem: Parameters<typeof addItem>[1]) {
      if (!currentEntry) return
      setCurrentEntry(addItem(currentEntry, newItem))
      setShowItemForm(false)
   }

   function handleEditEntry(updates: SaveDataInput) {
      if (!currentEntry) return
      setCurrentEntry(applyEntryEdits(currentEntry, updates))
      setShowEntryEditForm(false)
   }

   function handleAddCategory(newCategory: NewCategoryInput) {
      try {
         const updated = addCategory(categories, newCategory)
         setCategories(updated)
         setCategoryError(null)
      } catch (error) {
         if (error instanceof DuplicateCategoryError) {
            setCategoryError(error.message)
         }
      }
   }

   function requestDeleteCategory(category: Category) {
      setCategoryError(null)
      setCategoryPendingDelete(category)
   }

   function confirmDeleteCategory() {
      if (!categoryPendingDelete || !currentEntry) return
      try {
         const updatedCategories = deleteCategory(categories, categoryPendingDelete.id)
         setCategories(updatedCategories)

         const allEntries = loadSavedEntries()
         const hasAffectedItems = allEntries.some(entry =>
            entry.items.some(item => item.category === categoryPendingDelete.name),
         )
         if (hasAffectedItems) {
            const reassigned = reassignItemsCategory(
               allEntries,
               categoryPendingDelete.name,
               FALLBACK_CATEGORY,
            )
            const refreshedCurrent = reassigned.find(entry => entry.id === currentEntry.id)
            if (refreshedCurrent) setCurrentEntry(refreshedCurrent)
         }
      } catch (error) {
         if (error instanceof ProtectedCategoryError) {
            setCategoryError(error.message)
         }
      }
      setCategoryPendingDelete(null)
   }

   const affectedItemCount = categoryPendingDelete
      ? loadSavedEntries().reduce(
           (count, entry) =>
              count + entry.items.filter(item => item.category === categoryPendingDelete.name).length,
           0,
        )
      : 0

   const isOverBudget = currentEntry.expenses > currentEntry.budget

   return (
      <div className="min-h-screen bg-gradient-to-b from-white to-green-50 pb-40">
         <GroceryNav
            entryPartial={{
               label: currentEntry.label,
               date: currentEntry.date,
               items: currentEntry.items,
            }}
            onEdit={() => setShowEntryEditForm(true)}
         />

         <Outlet context={{ currentEntry, setCurrentEntry, categories } satisfies GroceryContext} />

         {/* Fixed bottom stack: action row (Add Item + new category) sits directly
             above the calculation footer, which is otherwise untouched. */}
         <div className="fixed inset-x-0 bottom-0 z-30">
            <div className="px-4 pb-3">
               <div className="mx-auto flex max-w-2xl items-center gap-3">
                  <button
                     type="button"
                     onClick={() => setShowItemForm(true)}
                     className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-green-700 px-4 py-3 text-sm font-medium text-white hover:bg-green-800"
                  >
                     <Plus size={16} /> Add Item
                  </button>
                  <button
                     type="button"
                     onClick={() => setShowCategoryForm(true)}
                     aria-label="Manage categories"
                     className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-700 text-white hover:bg-green-800"
                  >
                     <FolderPlus size={20} />
                  </button>
               </div>
            </div>

            <footer className="border-t border-green-100 bg-white px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
               <div className="mx-auto flex max-w-2xl items-center justify-between text-sm">
                  <div className="flex flex-col">
                     <span className="text-xs text-neutral-400">Budget</span>
                     <span className="flex items-center gap-1 font-semibold text-neutral-900">
                        <PhilippinePeso size={13} /> {currentEntry.budget}
                     </span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-xs text-neutral-400">Expenses</span>
                     <span
                        className={`flex items-center gap-1 font-semibold ${
                           isOverBudget ? 'text-red-600' : 'text-neutral-900'
                        }`}
                     >
                        <PhilippinePeso size={13} /> {currentEntry.expenses}
                     </span>
                  </div>
                  <div className="flex flex-col">
                     <span className="text-xs text-neutral-400">Remaining</span>
                     <span className="flex items-center gap-1 font-semibold text-green-700">
                        <PhilippinePeso size={13} /> {currentEntry.remaining_balance}
                     </span>
                  </div>
               </div>
            </footer>
         </div>

         <AnimatedModal isOpen={showItemForm} onClose={() => setShowItemForm(false)}>
            <FormItem categories={categories} onAdd={handleAddItem} />
         </AnimatedModal>

         <AnimatedModal isOpen={showEntryEditForm} onClose={() => setShowEntryEditForm(false)}>
            <FormGrocery
               onAdd={handleEditEntry}
               initialValues={{
                  label: currentEntry.label,
                  budget: currentEntry.budget,
                  date: currentEntry.date,
               }}
               submitLabel="Save Changes"
            />
         </AnimatedModal>

         <AnimatedModal
            isOpen={showCategoryForm}
            onClose={() => {
               setShowCategoryForm(false)
               setCategoryError(null)
            }}
         >
            <FormCategory
               existingCategories={categories}
               onAdd={handleAddCategory}
               onDeleteCategory={requestDeleteCategory}
               onCancel={() => {
                  setShowCategoryForm(false)
                  setCategoryError(null)
               }}
            />
            {categoryError && (
               <p className="mt-2 rounded-lg bg-white px-4 py-2 text-xs text-red-600 shadow">
                  {categoryError}
               </p>
            )}
         </AnimatedModal>

         {categoryPendingDelete && (
            <Modal
               title={`Delete "${categoryPendingDelete.name}"?`}
               message={
                  affectedItemCount > 0
                     ? `${affectedItemCount} item${affectedItemCount === 1 ? '' : 's'} using this category will move to "Other".`
                     : 'No items are currently using this category.'
               }
               confirmLabel="Delete"
               onConfirm={confirmDeleteCategory}
               onCancel={() => setCategoryPendingDelete(null)}
            />
         )}
      </div>
   )
}

export default GroceryTab
