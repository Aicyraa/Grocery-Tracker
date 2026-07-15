import './css/App.css'
import { useEffect, useState } from 'react'
import { type GroceryEntries } from './types'

import GroceryView from './components/groceries/GroceryView'
import FormGrocery from './components/forms/FormGrocery'
import { PhilippinePeso } from 'lucide-react'
import { calculateExpenses } from './utils/calculate.util'
import { loadSavedEntries } from './utils/storage'
import { type SaveDataInput, saveData } from './utils/data.util'

function App() {
   const [entries, setEntries] = useState<GroceryEntries[] | null>(null)
   const [toggleForm, setToggleForm] = useState<boolean>(false)

   useEffect(() => {
      const savedEntries = loadSavedEntries()
      if (savedEntries.length) {
         setEntries(savedEntries)
         return
      }
   }, [])

   const handleAddEntry = (newEntry: SaveDataInput) => {
      if (!entries) return
      const updatedEntries = saveData(entries, newEntry)
      setEntries(updatedEntries)
   }

   return (
      <div className="app">
         {toggleForm && <FormGrocery onAdd={handleAddEntry} />}
         <div className="grocery-informations">
            <span> Total Expenses </span>
            <span>
               <PhilippinePeso /> {calculateExpenses(entries ?? [])}
            </span>
         </div>
         <div className="grocery-entries">
            {entries?.map(entry => (
               <GroceryView entry={entry} key={entry.id} />
            ))}
         </div>
         <button type="button" onClick={() => setToggleForm(prev => !prev)}>
            Add Grocery Entry
         </button>
      </div>
   )
}

export default App
