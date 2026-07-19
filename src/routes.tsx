import { createBrowserRouter } from 'react-router-dom'
import App from './App'
import GroceryTab from './components/groceries/GroceryTab'
import GroceryItems from './components/groceries/GroceryItems'
import ExpensesChart from './components/chart/ExpensesChart'

const routes = createBrowserRouter([
   {
      path: '/',
      element: <App />,
      errorElement: <h1> None </h1>,
   },
   {
      path: 'chart',
      element: <ExpensesChart />,
   },
   {
      path: 'grocery',
      element: <GroceryTab />,
      children: [{ path: ':groceryID', element: <GroceryItems /> }],
   },
])

export default routes
