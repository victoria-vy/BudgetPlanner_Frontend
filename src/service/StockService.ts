import type { Stock } from '@/models/Stock'
import { getBasicAuthHeader } from '@/service/authService.ts'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

function authHeaders() {
  const auth = getBasicAuthHeader()
  if (!auth) throw new Error('Nicht eingeloggt')
  return { Authorization: auth }
}

export async function getUserStocks(): Promise<Stock[]> {
  const response = await fetch(`${baseUrl}/api/stocks`, {
    headers: {
      ...authHeaders()
    }
  })

  if (!response.ok) {
    throw new Error('Stocks konnten nicht geladen werden')
  }
  return response.json()
}

export async function addStock(stock: Stock): Promise<Stock> {
  const response = await fetch(`${baseUrl}/api/stocks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders()
    },
    body: JSON.stringify(stock)
  })

  if (!response.ok) {
    throw new Error('Stock konnte nicht gespeichert werden')
  }
  return response.json()
}

export async function getStockQuote(symbol: string): Promise<any> {
  const response = await fetch(`${baseUrl}/api/stocks/quote/${symbol}`, {
    headers: { ...authHeaders() }
  })

  if (!response.ok) {
    throw new Error('Kursdaten konnten nicht geladen werden')
  }
  return response.json() // Backend liefert JSON-String, Browser parsed OK wenn Content-Type stimmt; sonst unten Hinweis
}

export async function getStockChart(symbol: string): Promise<any> {
  const response = await fetch(`${baseUrl}/api/stocks/chart/${symbol}`, {
    headers: { ...authHeaders() }
  })

  if (!response.ok) {
    throw new Error('Chartdaten konnten nicht geladen werden')
  }
  return response.json()
}
