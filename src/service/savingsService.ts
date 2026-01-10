import type { SavingsGoal } from '@/models/SavingsGoal'
import { authHeader } from '@/service/authService.ts'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

export async function getSavingsGoals(): Promise<SavingsGoal[]> {
  const res = await fetch(`${baseUrl}/api/savings`, {
    headers: { ...authHeader() }
  })
  if (!res.ok) throw new Error('Sparziele konnten nicht geladen werden')
  return res.json()
}

export async function createSavingsGoal(goal: SavingsGoal): Promise<SavingsGoal> {
  const res = await fetch(`${baseUrl}/api/savings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(goal)
  })
  if (!res.ok) throw new Error('Sparziel konnte nicht erstellt werden')
  return res.json()
}

export async function updateSavingsGoal(id: number, goal: SavingsGoal): Promise<SavingsGoal> {
  const res = await fetch(`${baseUrl}/api/savings/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(goal)
  })
  if (!res.ok) throw new Error('Sparziel konnte nicht aktualisiert werden')
  return res.json()
}

export async function deleteSavingsGoal(id: number): Promise<void> {
  const res = await fetch(`${baseUrl}/api/savings/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() }
  })
  if (!res.ok) throw new Error('Sparziel konnte nicht gelöscht werden')
}
