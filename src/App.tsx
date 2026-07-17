import { useEffect, useState } from 'react'
import { type GroceryEntries } from './types'

import GroceryView from './components/groceries/GroceryView'
import FormGrocery from './components/forms/FormGrocery'
import AnimatedModal from './components/ui/AnimatedModal'
import { PhilippinePeso, Plus } from 'lucide-react'
import { calculateExpenses } from './utils/calculate.util'
import { loadSavedEntries } from './utils/storage'
import { type SaveDataInput, saveData, deleteEntry } from './utils/data.util'

function App() {
   const [entries, setEntries] = useState<GroceryEntries[] | null>(null)
   const [showEntryForm, setShowEntryForm] = useState<boolean>(false)

   useEffect(() => {
      const savedEntries = loadSavedEntries()
      setEntries(savedEntries)
   }, [])

   const handleAddEntry = (newEntry: SaveDataInput) => {
      const updatedEntries = saveData(entries ?? [], newEntry)
      setEntries(updatedEntries)
      setShowEntryForm(false)
   }

   const handleDeleteEntry = (entryId: number) => {
      if (!entries) return
      setEntries(deleteEntry(entries, entryId))
   }

   const isOverBudget = entries
      ? calculateExpenses(entries) > entries.reduce((sum, e) => sum + e.budget, 0)
      : false

   return (
      <div className="min-h-screen bg-gradient-to-b from-white to-green-50 pb-28">
         <div className="mx-auto max-w-2xl px-4 py-6">
            <div className="mb-6 flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm">
               <span className="text-sm font-medium text-neutral-500">Total Expenses</span>
               <span
                  className={`flex items-center gap-1 text-xl font-semibold ${
                     isOverBudget ? 'text-red-600' : 'text-neutral-900'
                  }`}
               >
                  <PhilippinePeso size={18} /> {calculateExpenses(entries ?? [])}
               </span>
            </div>

            <div className="flex flex-col gap-3">
               {entries?.map(entry => (
                  <GroceryView entry={entry} key={entry.id} onDelete={handleDeleteEntry} />
               ))}
            </div>
         </div>

         <div className="fixed inset-x-0 bottom-0 z-30 border-t border-green-100 bg-white px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
            <button
               type="button"
               onClick={() => setShowEntryForm(true)}
               className="mx-auto flex w-full max-w-2xl items-center justify-center gap-2 rounded-2xl bg-green-700 px-4 py-3 text-sm font-medium text-white hover:bg-green-800"
            >
               <Plus size={16} />
               Add Grocery Entry
            </button>
         </div>

         <AnimatedModal isOpen={showEntryForm} onClose={() => setShowEntryForm(false)}>
            <FormGrocery onAdd={handleAddEntry} />
         </AnimatedModal>
      </div>
   )
}

export default App
