export interface ReportRow {
  category: string
  budgetLimit: number
  spent: number
  remaining: number
  percentUsed: number
}

export interface ReportResponse {
  month: string
  incomeSum: number
  expenseSum: number
  net: number
  rows: ReportRow[]
}
