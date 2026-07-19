import { useEffect, useState } from 'react'
import { type GroceryEntries } from './types'

import GroceryView from './components/groceries/GroceryView'
import FormGrocery from './components/forms/FormGrocery'
import AnimatedModal from './components/ui/AnimatedModal'
import TopNav from './components/ui/TopNav'
import { Plus } from 'lucide-react'
import { loadSavedEntries } from './utils/storage'
import { type SaveDataInput, saveData, deleteEntry, updateEntry } from './utils/data.util'

function App() {
   const [entries, setEntries] = useState<GroceryEntries[] | null>(null)
   const [showEntryForm, setShowEntryForm] = useState<boolean>(false)
   const [editingEntry, setEditingEntry] = useState<GroceryEntries | null>(null)

   useEffect(() => {
      const savedEntries = loadSavedEntries()
      setEntries(savedEntries)
   }, [])

   const handleAddEntry = (newEntry: SaveDataInput) => {
      const updatedEntries = saveData(entries ?? [], newEntry)
      setEntries(updatedEntries)
      setShowEntryForm(false)
   }

   const handleUpdateEntry = (updates: SaveDataInput) => {
      if (!entries || !editingEntry) return
      const updatedEntries = updateEntry(entries, editingEntry.id, updates)
      setEntries(updatedEntries)
      setEditingEntry(null)
   }

   const handleDeleteEntry = (entryId: number) => {
      if (!entries) return
      setEntries(deleteEntry(entries, entryId))
   }

   return (
      <div className="min-h-screen bg-gradient-to-b from-white to-green-50 pb-28">
         <TopNav />

         <div className="mx-auto max-w-2xl px-4 py-6">
            <div className="flex flex-col gap-3">
               {entries?.map(entry => (
                  <GroceryView
                     entry={entry}
                     key={entry.id}
                     onDelete={handleDeleteEntry}
                     onEdit={() => setEditingEntry(entry)}
                  />
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

         <AnimatedModal isOpen={editingEntry !== null} onClose={() => setEditingEntry(null)}>
            {editingEntry && (
               <FormGrocery
                  onAdd={handleUpdateEntry}
                  initialValues={{
                     label: editingEntry.label,
                     budget: editingEntry.budget,
                     date: editingEntry.date,
                  }}
                  submitLabel="Save Changes"
               />
            )}
         </AnimatedModal>
      </div>
   )
}

export default App
