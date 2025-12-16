import type {Budget} from '@/models/Budget'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

export async function getBudgets(): Promise<Budget[]> {
  const response = await fetch ('baseUrl/budgets' )
  if (!response.ok) {
    throw new Error ('Budgets konnten nicht geladen werden')
  }
  return response.json()
}
