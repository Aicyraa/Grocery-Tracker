import type { GroceryEntries } from '../../types'
import { useLocation, Navigate, Outlet } from 'react-router-dom'
import { useEffect, useState } from 'react'

import GroceryNav from './GroceryNav'

function GroceryTab() {
   const data = useLocation()
   const [currentEntry, setCurrentEntry] = useState<GroceryEntries | undefined>(
      data.state?.entry,
   )

   useEffect(() => {
      //  For saving the entry
   }, [currentEntry, setCurrentEntry])

   if (!currentEntry) {
      return <Navigate to="/" replace />
   }

   return (
      <div className="grocery-tab">
         <GroceryNav
            entryPartial={{
               name: currentEntry.name,
               budget: currentEntry.budget,
               expenses: currentEntry.expenses,
               items: currentEntry.items,
            }}
         />
         <Outlet context={{ currentEntry, setCurrentEntry }}></Outlet>
      </div>
   )
}

export default GroceryTab
