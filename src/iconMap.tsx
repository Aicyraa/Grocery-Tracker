import cart from './assets/shopping-cart.svg'
import {
   Apple,
   Box,
   Cookie,
   Drumstick,
   Package,
   ShoppingBag,
   ShoppingCart,
   Wheat,
   type LucideProps,
} from 'lucide-react'
import type { ComponentType } from 'react'

export const iconMap: Record<string, string | ComponentType<LucideProps>> = {
   cart,
   shoppingCart: ShoppingCart,
   Dairy: Package,
   Bakery: Cookie,
   Produce: Apple,
   Grains: Wheat,
   Cooking: Box,
   Snacks: ShoppingBag,
   Meat: Drumstick,
}
