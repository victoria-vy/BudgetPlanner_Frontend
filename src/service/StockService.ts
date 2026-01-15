import type { Stock } from '@/models/Stock'
import { authHeader } from '@/service/authService.ts'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

export type Quote = { s: string; c: number; h: number; l: number; o: number; pc: number; message?: string }

export async function getUserStocks(): Promise<Stock[]> {
  const response = await fetch(`${baseUrl}/api/stocks`, { headers: { ...authHeader() } })
  if (!response.ok) throw new Error('Stocks konnten nicht geladen werden')
  return response.json()
}

export async function addStock(stock: Stock): Promise<Stock> {
  const response = await fetch(`${baseUrl}/api/stocks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeader() },
    body: JSON.stringify(stock)
  })
  if (!response.ok) throw new Error('Stock konnte nicht gespeichert werden')
  return response.json()
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

  const data = await safeJson(response)
  if (!response.ok) throw new Error(data?.message ?? 'Suche konnte nicht geladen werden')
  return data
}

export async function getStockQuote(symbol: string): Promise<Quote> {
  const response = await fetch(`${baseUrl}/api/stocks/quote/${encodeURIComponent(symbol)}`, {
    headers: { ...authHeader() }
  })

  const data = await safeJson(response)
  if (!response.ok) throw new Error(data?.message ?? 'Kursdaten konnten nicht geladen werden')
  return data
}

export async function getStockQuotes(symbols: string[]): Promise<any> {
  const csv = symbols.map(s => s.trim().toUpperCase()).filter(Boolean).join(',')
  if (!csv) return { s: 'ok', data: {} }

  const response = await fetch(`${baseUrl}/api/stocks/quotes?symbols=${encodeURIComponent(csv)}`, {
    headers: { ...authHeader() }
  })

  const data = await safeJson(response)
  if (!response.ok) throw new Error(data?.message ?? 'Kursdaten konnten nicht geladen werden')
  return data
}

async function safeJson(response: Response): Promise<any> {
  const txt = await response.text()
  if (!txt) return null
  try { return JSON.parse(txt) } catch { return { message: txt } }
}
