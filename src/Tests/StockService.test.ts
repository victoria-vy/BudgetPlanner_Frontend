import {
  getUserStocks,
  addStock,
  getStockQuote,
  clearPortfolio
} from '@/service/StockService'
import type { Stock } from '@/models/Stock'
import { describe, it, expect, vi, beforeEach } from 'vitest'


vi.mock('@/service/authService', () => ({
  authHeader: () => ({
    Authorization: 'Bearer test-token'
  })
}))

const mockFetch = vi.fn()

global.fetch = mockFetch as unknown as typeof fetch


const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL

describe('stockService', () => {

  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('lädt User Stocks', async () => {
    const mockStocks: Stock[] = [
      { id: 1, symbol: 'AAPL', tvSymbol: 'NASDAQ:AAPL', quantity: 10 },
      { id: 2, symbol: 'TSLA', tvSymbol: 'NASDAQ:TSLA', quantity: 5 }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockStocks
    })

    const result = await getUserStocks()

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/api/stocks`, {
      headers: { Authorization: 'Bearer test-token' }
    })
    expect(result).toEqual(mockStocks)
  })

  it('speichert einen Stock', async () => {
    const stock: Stock = { id: 1, symbol: 'AAPL',tvSymbol: 'NASDAQ:AAPL', quantity: 10 }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => stock
    })

    const result = await addStock(stock)

    expect(fetch).toHaveBeenCalledWith(`${baseUrl}/api/stocks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-token'
      },
      body: JSON.stringify(stock)
    })

    expect(result).toEqual(stock)
  })

  it('holt Kursdaten eines Stocks', async () => {
    const quoteResponse = { c: 123.45 }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify(quoteResponse)
    })

    const result = await getStockQuote('AAPL')

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/api/stocks/quote/AAPL`,
      { headers: { Authorization: 'Bearer test-token' } }
    )

    expect(result).toEqual(quoteResponse)
  })



  it('setzt das Portfolio zurück', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true })

    await clearPortfolio()

    expect(fetch).toHaveBeenCalledWith(
      `${baseUrl}/api/stocks`,
      {
        method: 'DELETE',
        headers: { Authorization: 'Bearer test-token' }
      }
    )
  })

  it('wirft Fehler wenn Backend nicht erreichbar ist', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false })

    await expect(getUserStocks()).rejects.toThrow(
      'Stocks konnten nicht geladen werden'
    )
  })
})
