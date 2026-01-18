export type ExpenseCategory =
  | 'FOOD'
  | 'RENT'
  | 'FUN'
  | 'TRAVEL'
  | 'TECH'
  | 'OTHER'

export interface Expense {
  id?: number
  title: string
  amount: number
  category: ExpenseCategory
  date?: string | null
}
