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
  if (!response.ok) throw new Error('Kursdaten konnten nicht geladen werden')

  // Finnhub kommt als String -> sicher parsen
  const txt = await response.text()
  return JSON.parse(txt)
}

export async function getStockChart(symbol: string): Promise<any> {
  const response = await fetch(`${baseUrl}/api/stocks/chart/${symbol}`, {
    headers: { ...authHeader() }
  })
  if (!response.ok) throw new Error('Chartdaten konnten nicht geladen werden')

  const txt = await response.text()
  return JSON.parse(txt)
}
