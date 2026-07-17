import { type SubmitHandler, useForm } from 'react-hook-form'
import { type GroceryEntries } from '../../types'

type FormInp = Pick<GroceryEntries, 'label' | 'budget' | 'date'>

interface FormGroceryProps {
   onAdd: (data: FormInp) => void
}

function FormGrocery({ onAdd }: FormGroceryProps) {
   const {
      register,
      handleSubmit,
      reset,
      formState: { errors },
   } = useForm<FormInp>()

   const formHandler: SubmitHandler<FormInp> = data => {
      onAdd(data)
      reset()
   }

   return (
      <form
         className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-xl"
         onSubmit={handleSubmit(formHandler)}
      >
         <div className="flex flex-col gap-1">
            <label htmlFor="label" className="text-sm font-medium text-neutral-700">
               Label
            </label>
            <input
               id="label"
               className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
               {...register('label', {
                  required: 'Entry name is required.',
               })}
            />
            <span className="text-xs text-red-600">
               {errors.label && errors.label.message}
            </span>
         </div>

         <div className="flex flex-col gap-1">
            <label htmlFor="budget" className="text-sm font-medium text-neutral-700">
               Budget
            </label>
            <input
               id="budget"
               type="number"
               className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
               {...register('budget', {
                  valueAsNumber: true,
                  required: 'Entry budget is required.',
               })}
            />
            <span className="text-xs text-red-600">
               {errors.budget && errors.budget.message}
            </span>
         </div>

         <div className="flex flex-col gap-1">
            <label htmlFor="date" className="text-sm font-medium text-neutral-700">
               Date
            </label>
            <input
               id="date"
               type="date"
               className="rounded-lg border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
               {...register('date', {
                  valueAsDate: true,
                  required: 'Entry date is required.',
               })}
            />
            <span className="text-xs text-red-600">
               {errors.date && errors.date.message}
            </span>
         </div>

         <button
            type="submit"
            className="w-full rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
         >
            Add
         </button>
      </form>
   )
}

export default FormGrocery
