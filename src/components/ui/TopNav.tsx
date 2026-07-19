import { NavLink } from 'react-router-dom'
import { Home, LineChart } from 'lucide-react'

function TopNav() {
   const linkClass = ({ isActive }: { isActive: boolean }) =>
      `flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium transition ${
         isActive ? 'bg-green-700 text-white' : 'text-neutral-500 hover:bg-green-50'
      }`

   return (
      <div className="sticky top-0 z-20 px-4 py-3">
         <div className="mx-auto flex max-w-2xl gap-2">
            <NavLink to="/" end className={linkClass}>
               <Home size={18} /> Home
            </NavLink>
            <NavLink to="/chart" className={linkClass}>
               <LineChart size={18} /> Chart
            </NavLink>
         </div>
      </div>
   )
}

export default TopNav
