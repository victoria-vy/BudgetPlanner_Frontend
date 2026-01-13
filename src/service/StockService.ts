import type { Stock } from '@/models/Stock'
import { authHeader } from '@/service/authService.ts'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

export async function getUserStocks(): Promise<Stock[]> {
  const response = await fetch(`${baseUrl}/api/stocks`, {
    headers: { ...authHeader() }
  })

  if (!response.ok) throw new Error('Stocks konnten nicht geladen werden')
  return response.json()
}

export async function addStock(stock: Stock): Promise<Stock> {
  const response = await fetch(`${baseUrl}/api/stocks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeader()
    },
    body: JSON.stringify(stock)
  })

  if (!response.ok) throw new Error('Stock konnte nicht gespeichert werden')
  return response.json()
}

export async function getStockQuote(symbol: string): Promise<any> {
  const response = await fetch(`${baseUrl}/api/stocks/quote/${symbol}`, {
    headers: { ...authHeader() }
  })

  // Wenn Backend z.B. 429 oder 400 sendet, kommt hier ok=false
  // Wir versuchen trotzdem JSON zu lesen, um message anzuzeigen
  if (!response.ok) {
    try {
      const err = await response.json()
      throw new Error(err?.message ?? 'Kursdaten konnten nicht geladen werden')
    } catch {
      throw new Error('Kursdaten konnten nicht geladen werden')
    }
  }

  return response.json()
}

export async function getStockChart(symbol: string): Promise<any> {
  const response = await fetch(`${baseUrl}/api/stocks/chart/${encodeURIComponent(symbol)}`, {
    headers: { ...authHeader() }
  })

  // Immer Body lesen (auch bei 400/429), sonst verlierst du die Message
  const txt = await response.text()

  // Versuche JSON zu parsen (dein Backend sendet JSON). Falls nicht: fallback.
  let data: any = null
  try {
    data = txt ? JSON.parse(txt) : null
  } catch {
    data = null
  }

  if (!response.ok) {
    // Beste Fehlermeldung bauen
    const msg =
      data?.message ||
      data?.error ||
      (txt && txt.length < 300 ? txt : '') ||
      `HTTP ${response.status}`

    throw new Error(msg || 'Chartdaten konnten nicht geladen werden')
  }

  return data
}


export async function deleteStock(id: number): Promise<void> {
  const response = await fetch(`${baseUrl}/api/stocks/${id}`, {
    method: 'DELETE',
    headers: { ...authHeader() }
  })

  if (!response.ok) throw new Error('Stock konnte nicht gelöscht werden')
}

export async function clearPortfolio(): Promise<void> {
  const response = await fetch(`${baseUrl}/api/stocks`, {
    method: 'DELETE',
    headers: { ...authHeader() }
  })

  if (!response.ok) throw new Error('Portfolio konnte nicht zurückgesetzt werden')
}

export async function searchStockSymbols(keywords: string): Promise<any> {
  const q = keywords.trim()
  if (!q) return { s: 'ok', matches: [] }

  const response = await fetch(`${baseUrl}/api/stocks/search/${encodeURIComponent(q)}`, {
    headers: { ...authHeader() }
  })

  if (!response.ok) {
    try {
      const err = await response.json()
      throw new Error(err?.message ?? 'Suche konnte nicht geladen werden')
    } catch {
      throw new Error('Suche konnte nicht geladen werden')
    }
  }

  return response.json()
}

