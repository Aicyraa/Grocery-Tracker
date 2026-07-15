import type { GroceryEntries } from '../../types'
import { useOutletContext } from 'react-router-dom'

interface GroceryItems {
   currentEntry: GroceryEntries
   setCurrentEntry: (value: GroceryEntries) => void
}

function GroceryItems() {

   const {currentEntry, setCurrentEntry} = useOutletContext<GroceryItems>()

   return (
      <div className="grocery-items">
         {currentEntry?.items?.map(item => (
            <div className="grocery-item" key={item.id}>
               <span>{item.name}</span>
               <span>{item.category}</span>
               <span>${item.price}</span>
            </div>
         ))}
      </div>
   )
}

export default GroceryItems
