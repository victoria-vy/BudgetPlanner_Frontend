//Funktion für TradingView Chart

export function mapToTradingViewSymbol(input: string): string {
  const s = input.trim().toUpperCase()

  if (s.includes(':')) return s
  if (s.endsWith('.DE')) return `XETR:${s.replace('.DE', '')}`

  // Fallback
  return `NASDAQ:${s}`
}
