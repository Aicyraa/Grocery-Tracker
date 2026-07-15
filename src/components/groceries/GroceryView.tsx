import '../../css/Grocery.css'
import type { GroceryEntries } from '../../types'

import { NavLink } from 'react-router-dom'
import { iconMap } from '../../iconMap'

function GroceryView({ entry }: { entry: GroceryEntries }) {
   const CartIcon = iconMap.shoppingCart
   return (
      <NavLink
         className="grocery-entry"
         to={`grocery/${entry.id}`}
         state={{ entry }}
      >
         <CartIcon />
         <div className="grocery-details">
            <h3> {entry.name} </h3>
            <div className="grocery-budget-info">
               <span> {entry.budget} </span>
               <span> {entry.expenses} </span>
               <span> {entry.remaining_balance}</span>
            </div>
            <h5> {entry.date} </h5>
         </div>
      </NavLink>
   )
}

export default GroceryView
