import { type IconMap } from './types'
import {
   Apple,
   Beef,
   Carrot,
   Cookie,
   Milk,
   ShoppingCart,
   Wheat,
   Package,
} from 'lucide-react'

export const iconMap: IconMap = {
   shoppingCart: ShoppingCart, 
   fruits: Apple,
   vegetables: Carrot,
   meat: Beef,
   dairy: Milk,
   bakery: Wheat,
   snacks: Cookie,
   other: Package, 
}