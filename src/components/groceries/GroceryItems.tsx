import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { type GroceryContext } from './GroceryTab'
import { ICON_LIBRARY } from '../../iconMap'
import { toggleItem, deleteItem, updateItem } from '../../utils/data.util'
import { findCategory } from '../../utils/categories.util'
import type { Items } from '../../types'

function GroceryItems() {
   const { currentEntry, setCurrentEntry, categories } =
      useOutletContext<GroceryContext>()

   const [editingId, setEditingId] = useState<number | null>(null)
   const [editName, setEditName] = useState('')
   const [editPrice, setEditPrice] = useState('')
   const [editQuantity, setEditQuantity] = useState('')
   const [editCategory, setEditCategory] = useState('')

   function handleToggle(id: number) {
      setCurrentEntry(toggleItem(currentEntry, id))
   }

   function handleDelete(id: number) {
      setCurrentEntry(deleteItem(currentEntry, id))
   }

   function startEditing(item: Items) {
      setEditingId(item.id)
      setEditName(item.name)
      setEditPrice(String(item.price))
      setEditQuantity(String(item.quantity ?? 1))
      setEditCategory(item.category)
   }

   function saveEdit(id: number) {
      const price = Number(editPrice)
      const quantity = Number(editQuantity)
      setCurrentEntry(
         updateItem(currentEntry, id, {
            name: editName.trim() || undefined,
            price: Number.isNaN(price) ? undefined : price,
            quantity: Number.isNaN(quantity) || quantity < 1 ? undefined : quantity,
            category: editCategory || undefined,
         }),
      )
      setEditingId(null)
   }

   // Group items by category, then within each group sort checked items to
   // the bottom (stable sort keeps relative order among unchecked / checked).
   const grouped = currentEntry.items.reduce<Record<string, Items[]>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = []
      acc[item.category].push(item)
      return acc
   }, {})

   const categoryNamesWithItems = Object.keys(grouped)

   if (!categoryNamesWithItems.length) {
      return (
         <div className="px-4 py-10 text-center text-sm text-neutral-400">
            No items yet — add your first grocery item above.
         </div>
      )
   }

   return (
      <div className="flex flex-col gap-6 px-4 py-4">
         {categoryNamesWithItems.map(categoryName => {
            const category = findCategory(categories, categoryName)
            const Icon = (category && ICON_LIBRARY[category.iconKey]) || ICON_LIBRARY.package
            const items = [...grouped[categoryName]].sort(
               (a, b) => Number(a.isChecked) - Number(b.isChecked),
            )

            return (
               <div key={categoryName}>
                  <div className="mb-2 flex items-center gap-2 text-neutral-500">
                     <Icon size={16} />
                     <span className="text-xs font-semibold uppercase tracking-wide">
                        {categoryName}
                     </span>
                  </div>

                  <div className="flex flex-col gap-2">
                     {items.map(item => (
                        <div
                           key={item.id}
                           className={`flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition ${
                              item.isChecked ? 'opacity-50' : ''
                           }`}
                        >
                           <input
                              type="checkbox"
                              checked={item.isChecked}
                              onChange={() => handleToggle(item.id)}
                              className="h-4 w-4 shrink-0 accent-green-700"
                           />

                           {editingId === item.id ? (
                              <div className="flex flex-1 flex-col gap-2">
                                 <div className="grid grid-cols-2 gap-2">
                                    <input
                                       value={editName}
                                       onChange={e => setEditName(e.target.value)}
                                       placeholder="Name"
                                       className="min-w-0 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                                    />
                                    <select
                                       value={editCategory}
                                       onChange={e => setEditCategory(e.target.value)}
                                       className="min-w-0 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                                    >
                                       {categories.map(c => (
                                          <option key={c.id} value={c.name}>
                                             {c.name}
                                          </option>
                                       ))}
                                    </select>
                                 </div>
                                 <div className="grid grid-cols-2 gap-2">
                                    <input
                                       type="number"
                                       step="0.01"
                                       value={editPrice}
                                       onChange={e => setEditPrice(e.target.value)}
                                       placeholder="Price"
                                       className="min-w-0 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                                    />
                                    <input
                                       type="number"
                                       min={1}
                                       value={editQuantity}
                                       onChange={e => setEditQuantity(e.target.value)}
                                       placeholder="Qty"
                                       className="min-w-0 rounded-md border border-neutral-300 px-2 py-1.5 text-sm"
                                    />
                                 </div>
                                 <div className="flex justify-end gap-1">
                                    <button
                                       type="button"
                                       onClick={() => saveEdit(item.id)}
                                       className="rounded-md p-1.5 text-green-700 hover:bg-green-50"
                                    >
                                       <Check size={16} />
                                    </button>
                                    <button
                                       type="button"
                                       onClick={() => setEditingId(null)}
                                       className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100"
                                    >
                                       <X size={16} />
                                    </button>
                                 </div>
                              </div>
                           ) : (
                              <>
                                 <div className="flex-1">
                                    <p
                                       className={`text-sm font-medium text-neutral-900 ${
                                          item.isChecked ? 'line-through' : ''
                                       }`}
                                    >
                                       {item.name}
                                    </p>
                                    <p className="text-xs text-neutral-400">
                                       {item.price} × {item.quantity ?? 1} = {item.price * (item.quantity ?? 1)}
                                    </p>
                                 </div>
                                 <button
                                    type="button"
                                    aria-label="Edit item"
                                    onClick={() => startEditing(item)}
                                    className="rounded-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
                                 >
                                    <Pencil size={15} />
                                 </button>
                                 <button
                                    type="button"
                                    aria-label="Delete item"
                                    onClick={() => handleDelete(item.id)}
                                    className="rounded-md p-1.5 text-neutral-400 hover:bg-red-50 hover:text-red-600"
                                 >
                                    <Trash2 size={15} />
                                 </button>
                              </>
                           )}
                        </div>
                     ))}
                  </div>
               </div>
            )
         })}
      </div>
   )
}

export default GroceryItems
