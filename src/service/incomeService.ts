import { authHeader } from '@/service/authService'
import type { Income } from '@/models/Income'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

export async function getIncome(): Promise<Income[]> {
  const res = await fetch(`${baseUrl}/api/income`, { headers: { ...authHeader() } })
  if (!res.ok) throw new Error('Income konnte nicht geladen werden')
  return res.json()
}

export async function createIncome(income: Income): Promise<Income> {
  const res = await fetch(`${baseUrl}/api/income`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(income)
  })
  if (!res.ok) throw new Error('Income konnte nicht gespeichert werden')
  return res.json()
}

export async function deleteIncome(id: number): Promise<void> {
  const res = await fetch(`${baseUrl}/api/income/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() }
  })
  if (!res.ok) throw new Error('Income konnte nicht gelöscht werden')
}
