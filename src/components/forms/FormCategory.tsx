import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { Trash2 } from 'lucide-react'
import { ICON_GROUPS, ICON_LIBRARY } from '../../iconMap'
import { type Category } from '../../types'
import { type NewCategoryInput } from '../../utils/categories.util'

interface FormCategoryProps {
   existingCategories: Category[]
   onAdd: (data: NewCategoryInput) => void
   onDeleteCategory: (category: Category) => void
   onCancel: () => void
}

type FormInp = { name: string }

function FormCategory({ existingCategories, onAdd, onDeleteCategory, onCancel }: FormCategoryProps) {
   const [selectedIconKey, setSelectedIconKey] = useState<string | null>(null)
   const [iconError, setIconError] = useState<string | null>(null)

   const {
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<FormInp>()

   const formHandler: SubmitHandler<FormInp> = data => {
      if (!selectedIconKey) {
         setIconError('Pick an icon for this category.')
         return
      }
      onAdd({ name: data.name.trim(), iconKey: selectedIconKey })
   }

   return (
      <form
         className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-xl"
         onSubmit={handleSubmit(formHandler)}
      >
         {existingCategories.length > 0 && (
            <div className="flex flex-col gap-1">
               <span className="text-sm font-medium text-neutral-700">Your categories</span>
               <div className="max-h-32 overflow-y-auto rounded-lg border border-neutral-200">
                  {existingCategories.map(category => {
                     const Icon = ICON_LIBRARY[category.iconKey] ?? ICON_LIBRARY.package
                     const isProtected = category.name.toLowerCase() === 'other'
                     return (
                        <div
                           key={category.id}
                           className="flex items-center justify-between border-b border-neutral-100 px-3 py-2 last:border-b-0"
                        >
                           <span className="flex items-center gap-2 text-sm text-neutral-700">
                              <Icon size={15} className="text-green-700" />
                              {category.name}
                           </span>
                           {!isProtected && (
                              <button
                                 type="button"
                                 onClick={() => onDeleteCategory(category)}
                                 aria-label={`Delete ${category.name}`}
                                 className="rounded-md p-1 text-neutral-300 hover:bg-red-50 hover:text-red-600"
                              >
                                 <Trash2 size={14} />
                              </button>
                           )}
                        </div>
                     )
                  })}
               </div>
            </div>
         )}

         <div className="flex flex-col gap-1">
            <label htmlFor="categoryName" className="text-sm font-medium text-neutral-700">
               Category name
            </label>
            <input
               id="categoryName"
               className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
               {...register('name', {
                  required: 'Category name is required.',
                  validate: value =>
                     !existingCategories.some(
                        category => category.name.toLowerCase() === value.trim().toLowerCase(),
                     ) || 'A category with this name already exists.',
               })}
            />
            {errors.name && <span className="text-xs text-red-600">{errors.name.message}</span>}
         </div>

         <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-neutral-700">Choose an icon</span>
            <div className="max-h-64 overflow-y-auto rounded-lg border border-neutral-200 p-3">
               {ICON_GROUPS.map(group => (
                  <div key={group.label} className="mb-3 last:mb-0">
                     <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                        {group.label}
                     </p>
                     <div className="grid grid-cols-6 gap-2">
                        {group.keys.map(key => {
                           const Icon = ICON_LIBRARY[key]
                           const isSelected = selectedIconKey === key
                           return (
                              <button
                                 key={key}
                                 type="button"
                                 onClick={() => {
                                    setSelectedIconKey(key)
                                    setIconError(null)
                                 }}
                                 className={`flex items-center justify-center rounded-lg border p-2 transition ${
                                    isSelected
                                       ? 'border-green-500 bg-green-50 text-green-700'
                                       : 'border-neutral-200 text-neutral-500 hover:border-neutral-400'
                                 }`}
                              >
                                 <Icon size={18} />
                              </button>
                           )
                        })}
                     </div>
                  </div>
               ))}
            </div>
            {iconError && <span className="text-xs text-red-600">{iconError}</span>}
         </div>

         <div className="flex flex-col gap-2">
            <button
               type="submit"
               className="w-full rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
            >
               Add category
            </button>
            <button
               type="button"
               onClick={onCancel}
               className="w-full rounded-lg px-4 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-100"
            >
               Cancel
            </button>
         </div>
      </form>
   )
}

export default FormCategory
