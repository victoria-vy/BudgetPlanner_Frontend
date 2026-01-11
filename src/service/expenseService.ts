import { authHeader } from '@/service/authService'
import type { Expense } from '@/models/Expense'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

export async function getExpenses(): Promise<Expense[]> {
  const res = await fetch(`${baseUrl}/api/expenses`, { headers: { ...authHeader() } })
  if (!res.ok) throw new Error('Expenses konnten nicht geladen werden')
  return res.json()
}

export async function createExpense(expense: Expense): Promise<Expense> {
  const res = await fetch(`${baseUrl}/api/expenses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(expense)
  })
  if (!res.ok) throw new Error('Expense konnte nicht gespeichert werden')
  return res.json()
}

export async function deleteExpense(id: number): Promise<void> {
  const res = await fetch(`${baseUrl}/api/expenses/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() }
  })
  if (!res.ok) throw new Error('Expense konnte nicht gelöscht werden')
}
