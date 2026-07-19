import { type GroceryEntries } from '../../types'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ShoppingBasket, Pencil } from 'lucide-react'

function GroceryNav({
   entryPartial,
   onEdit,
}: {
   entryPartial: Partial<GroceryEntries>
   onEdit: () => void
}) {
   const navigate = useNavigate()

   return (
      <div className="sticky top-0 z-10 border-b border-green-100 bg-white/90 px-4 py-4 backdrop-blur">
         <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
               <button
                  onClick={() => navigate('/')}
                  aria-label="Back"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-neutral-500 hover:bg-green-50 hover:text-green-700"
               >
                  <ArrowLeft size={18} />
               </button>

               <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                     <h3 className="text-lg font-semibold leading-tight text-neutral-900">
                        {entryPartial.label}
                     </h3>
                     <button
                        type="button"
                        onClick={onEdit}
                        aria-label="Edit entry"
                        className="rounded-md p-1 text-neutral-300 hover:bg-green-50 hover:text-green-700"
                     >
                        <Pencil size={13} />
                     </button>
                  </div>
                  <span className="text-xs text-neutral-400">{entryPartial.date}</span>
               </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5 text-green-700">
               <ShoppingBasket size={20} className="shrink-0" />
               <span className="text-base font-semibold leading-none">
                  {entryPartial.items?.length ?? 0}
               </span>
            </div>
         </div>
      </div>
   )
}

export default GroceryNav
