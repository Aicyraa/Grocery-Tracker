import { useForm, type SubmitHandler } from 'react-hook-form'
import { type Category } from '../../types'
import { type NewItemInput } from '../../utils/data.util'

interface FormItemProps {
   categories: Category[]
   onAdd: (data: NewItemInput) => void
}

function FormItem({ categories, onAdd }: FormItemProps) {
   const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
   } = useForm<NewItemInput>()

   const formHandler: SubmitHandler<NewItemInput> = data => {
      onAdd(data)
      reset()
   }

   return (
      <form
         className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-xl"
         onSubmit={handleSubmit(formHandler)}
      >
         <div className="flex flex-col gap-1">
            <label htmlFor="itemName" className="text-sm font-medium text-neutral-700">
               Name
            </label>
            <input
               id="itemName"
               className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
               {...register('name', { required: 'Item name is required.' })}
            />
            {errors.name && <span className="text-xs text-red-600">{errors.name.message}</span>}
         </div>

         <div className="flex flex-col gap-1">
            <label htmlFor="itemPrice" className="text-sm font-medium text-neutral-700">
               Price
            </label>
            <input
               id="itemPrice"
               type="number"
               step="0.01"
               className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
               {...register('price', {
                  valueAsNumber: true,
                  required: 'Price is required.',
                  min: { value: 0, message: 'Price must be positive.' },
               })}
            />
            {errors.price && <span className="text-xs text-red-600">{errors.price.message}</span>}
         </div>

         <div className="flex flex-col gap-1">
            <label htmlFor="itemQuantity" className="text-sm font-medium text-neutral-700">
               Quantity
            </label>
            <input
               id="itemQuantity"
               type="number"
               defaultValue={1}
               className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
               {...register('quantity', {
                  valueAsNumber: true,
                  required: 'Quantity is required.',
                  min: { value: 1, message: 'Quantity must be at least 1.' },
               })}
            />
            {errors.quantity && (
               <span className="text-xs text-red-600">{errors.quantity.message}</span>
            )}
         </div>

         <div className="flex flex-col gap-1">
            <label htmlFor="itemCategory" className="text-sm font-medium text-neutral-700">
               Category
            </label>
            <select
               id="itemCategory"
               className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
               {...register('category', { required: 'Category is required.' })}
            >
               <option value="">Select category</option>
               {categories.map(category => (
                  <option key={category.id} value={category.name}>
                     {category.name}
                  </option>
               ))}
            </select>
            {errors.category && (
               <span className="text-xs text-red-600">{errors.category.message}</span>
            )}
         </div>

         <button
            type="submit"
            className="w-full rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
         >
            Add item
         </button>
      </form>
   )
}

export default FormItem
