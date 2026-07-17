import { useState } from 'react'
import type { GroceryEntries } from '../../types'

import { NavLink } from 'react-router-dom'
import { iconMap } from '../../iconMap'
import { Trash2 } from 'lucide-react'
import Modal from '../ui/Modal'

interface GroceryViewProps {
   entry: GroceryEntries
   onDelete: (entryId: number) => void
}

function GroceryView({ entry, onDelete }: GroceryViewProps) {
   const [confirmingDelete, setConfirmingDelete] = useState(false)
   const CartIcon = iconMap.shoppingCart

   return (
      <>
         <div className="group relative rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md">
            <NavLink
               to={`/grocery/${entry.id}`}
               state={{ entry }}
               className="flex items-center gap-4"
            >
               <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
                  <CartIcon size={22} />
               </div>
               <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900">{entry.label}</h3>
                  <div className="mt-1 flex gap-4 text-sm text-neutral-500">
                     <span>Budget: {entry.budget}</span>
                     <span>Spent: {entry.expenses}</span>
                     <span>Left: {entry.remaining_balance}</span>
                  </div>
                  <h5 className="mt-1 text-xs text-neutral-400">{entry.date}</h5>
               </div>
            </NavLink>

            <button
               type="button"
               aria-label="Delete entry"
               onClick={() => setConfirmingDelete(true)}
               className="absolute right-3 top-3 rounded-lg p-1.5 text-neutral-300 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
            >
               <Trash2 size={16} />
            </button>
         </div>

         {confirmingDelete && (
            <Modal
               title="Delete this entry?"
               message={`"${entry.label}" and all its items will be permanently removed.`}
               confirmLabel="Delete"
               onConfirm={() => {
                  onDelete(entry.id)
                  setConfirmingDelete(false)
               }}
               onCancel={() => setConfirmingDelete(false)}
            />
         )}
      </>
   )
}

export default GroceryView
