import { NavLink } from 'react-router-dom';
import type { GroceryEntries } from '../../types';

function GroceryView({
   id,
   name,
   budget,
   date,
   expenses,
   remaining_balance,
   items,
}: GroceryEntries) {
   return (
      <NavLink to={`grocery/${id}`} state={{ items }}>
         <div className='grocery-entry'>
            <img src='' alt='icon' />
            <div className='grocery-details'>
               <h3> {name} </h3>
               <div className='grocery-budget-info'>
                  <span> {budget} </span>
                  <span> {expenses} </span>
                  <span> {remaining_balance}</span>
               </div>
               <h5> {date.toDateString()} </h5>
            </div>
         </div>
      </NavLink>
   );
}

export default GroceryView;
