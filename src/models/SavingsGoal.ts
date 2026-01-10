export interface SavingsGoal {
  id?: number
  title: string
  targetAmount: number
  currentAmount: number
  deadline?: string | null
}
