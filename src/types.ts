interface Items {
   name: string;
   price: number;
   category: string;
}

// Main Types

export interface GroceryEntries {
   id: number;
   name: string;
   budget: number;
   date: Date;
   expenses: number;
   remaining_balance: number;
   items: Items[];
}
