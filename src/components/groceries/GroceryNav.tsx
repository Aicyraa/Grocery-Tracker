import { type GroceryEntries } from '../../types'
import { useNavigate } from 'react-router-dom'

function GroceryNav({
   entryPartial,
}: {
   entryPartial: Partial<GroceryEntries>
}) {
   const navigate = useNavigate()

   return (
      <div className="grocery-navigation">
         <button onClick={() => navigate('/')}> BacK </button>
         <h3> {entryPartial.name} </h3>
         <h3> {entryPartial.items?.length} </h3>
         <div className="group">
            <span> Budget </span>
            <span> {entryPartial.budget} </span>
         </div>
         <div className="group">
            <span>Total Expenses </span>
            <span>{entryPartial.expenses}</span>
         </div>
      </div>
   )
}

export default GroceryNav
