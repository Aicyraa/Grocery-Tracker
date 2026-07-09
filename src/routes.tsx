import { createBrowserRouter } from "react-router-dom";
import App from "./App";

const routes = createBrowserRouter([
   {
      path: '/',
      element: <App />,
      errorElement: <h1> None </h1>
   },
   {
      path: 'grocery',
      element: <h1> Grocery </h1>,
      children: [
         {path: ':groceryID', element: <p> Test Grocery</p>}
      ]
   }
])

export default routes