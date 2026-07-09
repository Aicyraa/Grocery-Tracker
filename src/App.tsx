import './css/App.css';
import type { GroceryEntries } from './types';

import { useEffect, useState } from 'react';
import GroceryView from './components/groceries/GroceryView';

function App() {
   const [groceryEntries, setGroceryEntries] = useState<GroceryEntries[] | null>(
      null,
   );

   useEffect(() => {
      fetch('/Grocery-Entries.json')
         .then(response => response.json())
         .then(response => setGroceryEntries(response));
   }, []);

   return <div className='grocery-entries'>
      {groceryEntries?.map(entry => <GroceryView entry={entry} key={entry.id}/>)}
   </div>;
}

export default App;
