import { authHeader } from '@/service/authService'
import type { ReportResponse } from '@/models/Report'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

export async function getReport(month: string): Promise<ReportResponse> {
  const res = await fetch(`${baseUrl}/api/report?month=${encodeURIComponent(month)}`, {
    headers: { ...authHeader() }
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`Report konnte nicht geladen werden (${res.status}): ${txt}`)
  }
  return res.json()
}
