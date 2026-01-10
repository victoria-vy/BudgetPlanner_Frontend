const STORAGE_KEY = 'budgetplanner_basic_auth'

export function setBasicAuth(email: string, password: string) {
  const token = btoa(`${email}:${password}`)
  localStorage.setItem(STORAGE_KEY, token)
}

export function getBasicAuthHeader(): string | null {
  const token = localStorage.getItem(STORAGE_KEY)
  if (!token) return null
  return `Basic ${token}`
}

export function clearBasicAuth() {
  localStorage.removeItem(STORAGE_KEY)
}

export function isLoggedIn(): boolean {
  return !!localStorage.getItem(STORAGE_KEY)
}
