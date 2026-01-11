export type SavingsCategory =
  | 'HOME'
  | 'TRAVEL'
  | 'CAR'
  | 'EDUCATION'
  | 'EMERGENCY'
  | 'GIFTS'
  | 'TECH'
  | 'OTHER'

export interface SavingsGoal {
  id?: number
  title: string
  targetAmount: number
  currentAmount: number
  deadline?: string | null
  category?: SavingsCategory
}
