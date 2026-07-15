import type { GroceryEntries } from '../../types'
import { useOutletContext } from 'react-router-dom'

interface GroceryItems {
   currentEntry: GroceryEntries
   setCurrentEntry: (value: GroceryEntries) => void
}

function GroceryItems() {
   const { currentEntry, setCurrentEntry } = useOutletContext<GroceryItems>()

   // Change name and price when hold then update the expenses

   function handleItem(e: React.ChangeEvent<HTMLInputElement>, id: number) {
      
   }

   return (
      <div className="grocery-items">
         {currentEntry?.items?.map(item => (
            <div className="grocery-item" key={item.id}>
               <input
                  type="checkbox"
                  checked={item.isChecked}
                  onChange={(e) => handleItem(e, item.id)}
               />
               <div className="group">
                  <h2> {item.name} </h2>
                  <span> {item.price} </span>
               </div>
            </div>
         ))}
      </div>
   )
}

export default GroceryItems
