import './css/App.css'
import type { GroceryEntries } from './types'

import { useEffect, useState } from 'react'
import GroceryView from './components/groceries/GroceryView'
import { PhilippinePeso } from 'lucide-react'

function App() {
   const [groceryEntries, setGroceryEntries] = useState<
      GroceryEntries[] | null
   >(null)

   // Category, Edit Item, Computation

   useEffect(() => {
      fetch('/Grocery-Entries.json')
         .then(response => response.json())
         .then(response => setGroceryEntries(response))
   }, [])

   const totalGroceryExpenses = groceryEntries
      ?.map(entry => entry.expenses)
      .reduce((prevVal, currVal) => prevVal + currVal)

   return (
      <div className="app">
         <div className="grocery-informations">
            <span> Total Grocery Expenses </span>
            <span> <PhilippinePeso /> {totalGroceryExpenses} </span>
         </div>
         <div className="grocery-entries">
            {groceryEntries?.map(entry => (
               <GroceryView entry={entry} key={entry.id} />
            ))}
         </div>
      </div>
   )
}

export default App
