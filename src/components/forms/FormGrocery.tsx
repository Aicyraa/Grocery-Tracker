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
      <form className="add-grocery-entry" onSubmit={handleSubmit(formHandler)}>
         <div className="group">
            <label htmlFor="name"> Label </label>
            <input
               {...register('label', {
                  required: 'Entry name is required.',
               })}
            />
            <span className="form-errors">
               {errors.label && errors.label.message}
            </span>
         </div>
         <div className="group">
            <label htmlFor="budget"> Budget </label>
            <input
               type="number"
               {...register('budget', {
                  valueAsNumber: true,
                  required: 'Entry budget is required.',
               })}
            />
            <span className="form-errors">
               {errors.budget && errors.budget.message}
            </span>
         </div>
         <div className="group">
            <label htmlFor="date"> Date </label>
            <input
               type="date"
               {...register('date', {
                  valueAsDate: true,
                  required: 'Entry date is required.',
               })}
            />
            <span className="form-errors">
               {errors.date && errors.date.message}
            </span>
         </div>
         <button type="submit"> Add </button>
      </form>
   )
}

export default FormGrocery
