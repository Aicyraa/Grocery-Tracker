import { type LucideProps } from 'lucide-react'
import React from 'react'

interface Items {
   id: number
   isChecked: boolean
   name: string
   price: number
   category: string
}

// Main Types

export type IconMap = Record<string, React.ElementType<LucideProps>>

export interface GroceryEntries {
   id: number
   label: string
   budget: number
   date: string
   expenses: number
   remaining_balance: number
   items: Items[]
}
