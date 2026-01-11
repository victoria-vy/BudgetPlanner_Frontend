import { authHeader } from '@/service/authService'
import type { Budget } from '@/models/Budget'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

export async function getBudgets(): Promise<Budget[]> {
  const res = await fetch(`${baseUrl}/api/budgets`, {
    headers: { ...authHeader() }
  })
  if (!res.ok) throw new Error('Budgets konnten nicht geladen werden')
  return res.json()
}

export async function createBudget(budget: Budget): Promise<Budget> {
  const res = await fetch(`${baseUrl}/api/budgets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    },
    body: JSON.stringify(budget)
  })
  if (!res.ok) throw new Error('Budget konnte nicht gespeichert werden')
  return res.json()
}

export async function deleteBudget(id: number) {
  await fetch(`${baseUrl}/api/budgets/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() }
  })
}


