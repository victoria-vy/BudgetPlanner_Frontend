export type IncomeCategory =
  |'SALARY'
  | 'SIDE'
  | 'GIFT'
  | 'OTHER'

export interface Income {
  id?: number
  title: string
  amount: number
  category: IncomeCategory
  date?: string | null
}
