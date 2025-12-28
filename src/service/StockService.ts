import type { Stock } from '@/models/Stock'

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

export async function getUserStocks(): Promise<Stock[]> {
  const response = await fetch(`${baseUrl}/api/stocks`, {
    credentials: 'include' // wichtig bei Session / Cookie Auth
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
      'Content-Type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify(stock)
  })

  if (!response.ok) {
    throw new Error('Stock konnte nicht gespeichert werden')
  }

  return response.json()
}

export async function getStockQuote(symbol: string): Promise<any> {
  const response = await fetch(
    `${baseUrl}/api/stocks/quote/${symbol}`,
    { credentials: 'include' }
  )

  if (!response.ok) {
    throw new Error('Kursdaten konnten nicht geladen werden')
  }

  return response.json()
}

export async function getStockChart(symbol: string): Promise<any> {
  const response = await fetch(
    `${baseUrl}/api/stocks/chart/${symbol}`,
    { credentials: 'include' }
  )

  if (!response.ok) {
    throw new Error('Chartdaten konnten nicht geladen werden')
  }

  return response.json()
}
