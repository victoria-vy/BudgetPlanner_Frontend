<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import TradingViewChart from '@/components/TradingViewChart.vue'
import { mapToTradingViewSymbol } from '@/service/TradingViewSymbol'

import {
  getUserStocks,
  addStock,
  deleteStock,
  clearPortfolio,
  getStockQuote,
  getStockQuotes,
  type Quote
} from '@/service/StockService'

import type { Stock } from '@/models/Stock'
import { isLoggedIn } from '@/service/authService.ts'

type StockId = Exclude<Stock['id'], null | undefined>

type PortfolioRow = {
  symbol: string
  tvSymbol: string
  name?: string
  quantity: number
  avgBuyPrice?: number
  buyDate?: string
  ids: StockId[]
}

function hasId(s: Stock): s is Stock & { id: StockId } {
  return s.id !== null && s.id !== undefined
}

const symbol = ref('AAPL') //Startsymbol
const errorMsg = ref('')

const savedStocks = ref<Stock[]>([])
const tvSymbol = ref(mapToTradingViewSymbol(symbol.value))

const quote = ref<Quote | null>(null)
const portfolioQuotes = ref<Record<string, Quote>>({})

const exampleSymbols = [
  'AAPL','MSFT','TSLA','AMZN','NVDA','META','GOOGL','NFLX','AMD','INTC',
  'PEP','WMT','COST', 'ASML'
]

// --- Auto-load debounce ---
let debounceTimer: number | null = null
function scheduleAutoLoad() {
  if (debounceTimer) window.clearTimeout(debounceTimer)
  debounceTimer = window.setTimeout(() => {
    loadStockData()
  }, 350)
}

function pickExample(sym: string) {
  symbol.value = sym
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message
  if (typeof e === 'object' && e !== null && 'message' in e) {
    const msg = (e as { message?: unknown }).message
    if (typeof msg === 'string') return msg
  }
  if (typeof e === 'string') return e
  return 'Fehler'
}

onMounted(async () => {
  if (!isLoggedIn()) {
    errorMsg.value = 'Bitte zuerst im Account einloggen.'
    return
  }
  await reloadPortfolio()
  await loadStockData()
})

watch(
  () => symbol.value,
  () => {
    // immer Kurs und Widget anzeigen, bei Änderung automatisch laden
    scheduleAutoLoad()
  }
)

async function reloadPortfolio() {
  errorMsg.value = ''
  try {
    savedStocks.value = await getUserStocks()
    await reloadPortfolioQuotes()
  } catch (e: unknown) {
    errorMsg.value = getErrorMessage(e) || 'Fehler beim Laden'
  }
}

async function reloadPortfolioQuotes() {
  const symbols = savedStocks.value.map(s => s.symbol)
  try {
    const res = await getStockQuotes(symbols)
    portfolioQuotes.value = res?.data ?? {}
  } catch {
    portfolioQuotes.value = {}
  }
}

async function loadStockData() {
  errorMsg.value = ''
  const sym = symbol.value.trim().toUpperCase()
  if (!sym) return

  try {
    tvSymbol.value = mapToTradingViewSymbol(sym)

    const q = await getStockQuote(sym)
    if (q?.s && q.s !== 'ok') {
      quote.value = null
      errorMsg.value = q?.message ?? 'Keine Quotendaten verfügbar.'
      return
    }
    quote.value = q
  } catch (e: unknown) {
    quote.value = null
    errorMsg.value = getErrorMessage(e) || 'Fehler beim Laden der Kursdaten'
  }
}

// Buttons bleiben, aber Kurs wird automatisch geladen
async function forceLoad() {
  await loadStockData()
}

async function saveStock() {
  errorMsg.value = ''
  const sym = symbol.value.trim().toUpperCase()
  if (!sym) return

  try {
    const q = quote.value?.c ? quote.value : await getStockQuote(sym)
    const buyPrice = Number(q?.c)

    const stock: Stock = {
      symbol: sym,
      tvSymbol: mapToTradingViewSymbol(sym),
      buyPrice: isFinite(buyPrice) ? buyPrice : undefined,
      quantity: 1
    }

    const saved = await addStock(stock)
    savedStocks.value.push(saved)
    await reloadPortfolioQuotes()
  } catch (e: unknown) {
    errorMsg.value = getErrorMessage(e) || 'Fehler beim Speichern'
  }
}

async function removeRow(row: PortfolioRow) {
  errorMsg.value = ''
  try {
    await Promise.all(row.ids.map(id => deleteStock(id)))
    savedStocks.value = savedStocks.value.filter(s => (s.symbol ?? '').toUpperCase() !== row.symbol)
    await reloadPortfolioQuotes()
  } catch (e: unknown) {
    errorMsg.value = getErrorMessage(e) || 'Fehler beim Löschen'
  }
}

async function resetPortfolio() {
  errorMsg.value = ''
  try {
    await clearPortfolio()
    savedStocks.value = []
    portfolioQuotes.value = {}
  } catch (e: unknown) {
    errorMsg.value = getErrorMessage(e) || 'Fehler beim Zurücksetzen'
  }
}

function openFromPortfolio(s: Stock) {
  symbol.value = s.symbol
  tvSymbol.value = s.tvSymbol
  // Kurs lädt automatisch
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('de-DE')
}

const todayFormatted = new Date().toLocaleDateString('de-DE')

function formatMoney(n?: number): string {
  if (typeof n !== 'number' || !isFinite(n)) return '—'
  return n.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatQuote(
  value?: number,
  currency: 'USD' | 'EUR' = 'USD'
): string {
  if (typeof value !== 'number' || !isFinite(value)) return '—'

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

function currencyForSymbol(sym: string): 'USD' | 'EUR' {
  return sym.endsWith('.DE') ? 'EUR' : 'USD'
}

function currentPriceFor(sym: string): number | undefined {
  const q = portfolioQuotes.value?.[sym.toUpperCase()]
  const c = Number(q?.c)
  return isFinite(c) ? c : undefined
}

function positionValueForRow(row: PortfolioRow): number | undefined {
  const c = currentPriceFor(row.symbol)
  if (c === undefined) return undefined
  return c * row.quantity
}

//Aggregiert savedStocks, genau 1 UI-Zeile pro Symbol (Stückzahl + Ø Kaufpreis + IDs sammeln)
const portfolioRows = computed<PortfolioRow[]>(() => {
  const map = new Map<string, PortfolioRow>()

  for (const s of savedStocks.value) {
    const sym = (s.symbol ?? '').toUpperCase()
    if (!sym) continue

    const qty = Number(s.quantity ?? 1) || 1
    const bp = typeof s.buyPrice === 'number' ? s.buyPrice : undefined

    const ex = map.get(sym)
    if (!ex) {
      map.set(sym, {
        symbol: sym,
        tvSymbol: s.tvSymbol ?? mapToTradingViewSymbol(sym),
        name: s.name,
        quantity: qty,
        avgBuyPrice: bp,
        buyDate: s.buyDate,
        ids: hasId(s) ? [s.id] : []
      })
      continue
    }

    const prevQty = ex.quantity
    ex.quantity = prevQty + qty

    if (hasId(s)) ex.ids.push(s.id)

    // frühestes Kaufdatum behalten
    if (s.buyDate) {
      if (!ex.buyDate) ex.buyDate = s.buyDate
      else if (new Date(s.buyDate).getTime() < new Date(ex.buyDate).getTime()) ex.buyDate = s.buyDate
    }

    // gewichteter Ø Kaufpreis
    if (bp !== undefined) {
      if (ex.avgBuyPrice === undefined) {
        ex.avgBuyPrice = bp
      } else {
        const prevTotal = ex.avgBuyPrice * prevQty
        const newTotal = bp * qty
        const denom = prevQty + qty
        ex.avgBuyPrice = denom > 0 ? (prevTotal + newTotal) / denom : ex.avgBuyPrice
      }
    }

    if (!ex.name && s.name) ex.name = s.name
  }

  return Array.from(map.values())
})

function perfForRow(row: PortfolioRow): { pct: number; text: string } | null {
  const c = currentPriceFor(row.symbol)
  if (c === undefined) return null
  if (!row.avgBuyPrice || row.avgBuyPrice <= 0) return null

  const pct = ((c - row.avgBuyPrice) / row.avgBuyPrice) * 100
  const sign = pct >= 0 ? '+' : ''
  return { pct, text: `${sign}${pct.toFixed(2)}%` }
}
</script>

<template>
  <main class="stocks">
    <h1>Stocks</h1>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>


    <div class="card">
      <!-- Beispiele -->
      <div class="examples-bar">
        <span class="examples-label">Beispiele:</span>
        <div class="examples-scroll" aria-label="Beispiele horizontal scroll">
          <button
            v-for="ex in exampleSymbols"
            :key="ex"
            class="chip"
            @click="pickExample(ex)"
          >
            {{ ex }}
          </button>
        </div>
      </div>

      <!-- Symbol Input-->
      <label class="label">Symbol eingeben:</label>

      <input
        v-model="symbol"
        placeholder="AAPL oder BMW.DE"
        class="symbol-input"
      />

      <div class="symbol-buttons">
        <button class="btn btn-wide" @click="forceLoad" :disabled="!symbol.trim()">
          Kurs laden
        </button>
        <button class="btn btn-wide" @click="saveStock" :disabled="!symbol.trim()">
          Speichern (Portfolio)
        </button>
      </div>

      <!-- Quote Tabelle -->
      <div v-if="quote" class="quote-table">
        <table>
          <thead>
          <tr>
            <th>Aktuell:</th>
            <th>Open:</th>
            <th>High:</th>
            <th>Low:</th>
            <th>Prev Close:</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>{{ formatQuote(quote.c, currencyForSymbol(symbol)) }}</td>
            <td>{{ formatQuote(quote.o, currencyForSymbol(symbol)) }}</td>
            <td>{{ formatQuote(quote.h, currencyForSymbol(symbol)) }}</td>
            <td>{{ formatQuote(quote.l, currencyForSymbol(symbol)) }}</td>
            <td>{{ formatQuote(quote.pc, currencyForSymbol(symbol)) }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Hinweis-->
      <div class="widget-note">
        Hinweis: Die Daten im Chart-Widget können (je nach Markt/Session) vom letzten Handelstag/Vortag stammen.
      </div>

      <!-- Chart -->
      <div class="chart-wrap">
        <TradingViewChart :symbol="tvSymbol" :height="300" interval="D" theme="light" locale="de" />
      </div>
    </div>

    <!-- PORTFOLIO KASTEN -->
    <div class="card">
      <div class="portfolio-header">
        <h2>Dein Portfolio</h2>

        <div class="portfolio-actions">
          <button class="btn" @click="reloadPortfolio">Portfolio neu laden</button>
          <button class="btn danger" @click="resetPortfolio" :disabled="savedStocks.length === 0">
            Portfolio resetten
          </button>
        </div>
      </div>

      <ul v-if="savedStocks.length">
        <li v-for="r in portfolioRows" :key="r.symbol" class="stock-row">
          <button class="pf-btn" @click="openFromPortfolio(r as any)">
             <span class="pf-title">
             {{ r.name ? `${r.name} (${r.symbol})` : r.symbol }}
             </span>

              <span class="pf-dates pf-inline">
             · {{ r.quantity }} Stk
             · Ø Kauf: {{ formatMoney(r.avgBuyPrice) }}
             · Jetzt: {{ formatMoney(currentPriceFor(r.symbol)) }}
             · Gesamt: {{ formatMoney(positionValueForRow(r)) }}
             · {{ formatDate(r.buyDate) }} → {{ todayFormatted }}
             </span>
          </button>

          <span
            v-if="perfForRow(r)"
            class="perf"
            :class="perfForRow(r)!.pct >= 0 ? 'pos' : 'neg'"
            title="Performance seit Kauf (gegen Ø buyPrice)">
           {{ perfForRow(r)!.text }}
           </span>
          <span v-else class="perf neutral">—</span>

          <button class="btn danger" @click="removeRow(r)">Löschen</button>
        </li>
      </ul>

      <p v-else>Noch keine Stocks gespeichert.</p>
    </div>
  </main>
</template>

<style scoped>
*,
*::before,
*::after { box-sizing: border-box; }

.stocks {
  width: 900px;
  padding: 2rem;
}

.card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.error { color: red; }

.btn {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  background: #b4dda5;
  color: #000000;
}

.btn:hover {
  background-color: #a7dd91;
  color: white;
}

.danger {
  background: #ffe3e3;
  color: #000000;
}

.danger:hover {
  background-color: #ffd2d2;
  color: white;
}

/* Beispiele */
.examples-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 44px;
  padding: 0 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fafafa;
  color: #000000;
}

.examples-label {
  color: #6b7280;
  font-size: 0.95rem;
  white-space: nowrap;
}

.examples-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  flex: 1;
  padding-bottom: 2px;
  scrollbar-width: thin;
}

.chip {
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  border: 1px solid #e5e5e5;
  background: #f7fbff;
  cursor: pointer;
  font-weight: 600;
  flex: 0 0 auto;
}

/* Symbol */
.label {
  display: block;
  margin-top: 0.9rem;
  margin-bottom: 0.35rem;
}

.symbol-input {
  width: 100%;
  height: 44px;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid #ccc;
}

.symbol-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.6rem;
}

.btn-wide {
  flex: 1;
  text-align: center;
  background-color: #b4dda5;
  color: #000000;
}

.btn-wide:hover {
  background-color: #b4dda5;
  color: white;
}

/* Quote Tabelle */
.quote-table {
  margin-top: 1rem;
  overflow-x: auto;
}

.quote-table table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.quote-table th,
.quote-table td {
  padding: 0.65rem;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
  font-size: 0.95rem;
}

.quote-table thead th { background: #f9fafb; }
.quote-table th:last-child,
.quote-table td:last-child { border-right: none; }
.quote-table tbody tr:last-child td { border-bottom: none; }

/* Hinweis */
.widget-note {
  margin-top: 0.55rem;
  margin-bottom: 0.35rem; /* wenig Abstand zum Widget */
  padding: 0.55rem 0.75rem;
  border-radius: 12px;
  background: #fff3e0;
  border: 1px solid #ffd39c;
  color: #8a4b00;
  font-size: 0.95rem;
}

/* Chart */
.chart-wrap {
  margin-top: 0.25rem; /* enger dran */
  height: 300px;
}

/* Portfolio Header */
.portfolio-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.portfolio-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.stock-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 0;
}

.pf-btn {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.6rem 1rem;
  cursor: pointer;
  flex: 1;
  text-align: left;
}

.perf {
  min-width: 70px;
  font-weight: 800;
  text-align: right;
}
.perf.pos { color: #0a7a2f; }
.perf.neg { color: #b00020; }
.perf.neutral { color: #9ca3af; }

.pf-btn {
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 0.6rem 1rem;
  cursor: pointer;
  flex: 1;
  text-align: left;

  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.pf-title {
  font-weight: 600;
}

.pf-dates {
  font-size: 0.85rem;
  color: #6b7280;
  white-space: nowrap;
}

/* Inline-Infos  */
.pf-inline {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

</style>
