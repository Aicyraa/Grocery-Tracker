export interface Items {
   id: number
   name: string
   price: number
   quantity: number
   category: string // matches a Category.name
   isChecked: boolean
}

export interface Category {
   id: number
   name: string
   iconKey: string // key into ICON_LIBRARY (see iconMap.tsx)
}

export interface GroceryEntries {
   id: number
   label: string
   budget: number
   date: string
   expenses: number
   remaining_balance: number
   items: Items[]
}
