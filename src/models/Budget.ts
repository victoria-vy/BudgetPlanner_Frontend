export type BudgetCategory =
  | 'FOOD'
  | 'RENT'
  | 'FUN'
  | 'TRAVEL'
  | 'TECH'
  | 'OTHER'

export interface Budget {
  id?: number
  month: string
  limitAmount: number
  category: BudgetCategory
}
