const KEY = 'budgetplanner_token'

export function setToken(token: string) {
  localStorage.setItem(KEY, token)
}

export function getToken(): string | null {
  return localStorage.getItem(KEY)
}

export function clearToken() {
  localStorage.removeItem(KEY)
}

export function authHeader(): Record<string, string> {
  const token = getToken()
  if (!token) throw new Error('Nicht eingeloggt')
  return { Authorization: `Bearer ${token}` }
}

export function isLoggedIn(): boolean {
  return !!getToken()
}
