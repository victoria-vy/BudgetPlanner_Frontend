<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import TradingViewChart from '@/components/TradingViewChart.vue'
import { mapToTradingViewSymbol } from '@/service/tradingViewSymbol'

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

const symbol = ref('AAPL') // Startsymbol, damit immer etwas angezeigt wird
const errorMsg = ref('')

const savedStocks = ref<Stock[]>([])
const tvSymbol = ref(mapToTradingViewSymbol(symbol.value))

const quote = ref<Quote | null>(null)
const portfolioQuotes = ref<Record<string, Quote>>({})

// Mehr Beispiele
const exampleSymbols = [
  'AAPL','MSFT','TSLA','AMZN','NVDA','META','GOOGL','NFLX','AMD','INTC',
  'BRK.B','JPM','V','MA','DIS','NKE','KO','PEP','WMT','COST',
  'SAP','ASML','SIE.DE','BMW.DE','VOW3.DE','BAS.DE','ALV.DE','AIR.PA'
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

onMounted(async () => {
  if (!isLoggedIn()) {
    errorMsg.value = 'Bitte zuerst im Account einloggen.'
    return
  }
  await reloadPortfolio()
  // immer initial laden
  await loadStockData()
})

watch(
  () => symbol.value,
  () => {
    // immer Kurs+Widget anzeigen: bei Änderung automatisch laden
    scheduleAutoLoad()
  }
)

async function reloadPortfolio() {
  errorMsg.value = ''
  try {
    savedStocks.value = await getUserStocks()
    await reloadPortfolioQuotes()
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler beim Laden'
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
  } catch (e: any) {
    quote.value = null
    errorMsg.value = e?.message ?? 'Fehler beim Laden der Kursdaten'
  }
}

// Buttons bleiben (gewünscht), aber Kurs wird sowieso automatisch geladen
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
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler beim Speichern'
  }
}

async function removeStock(stock: Stock) {
  if (!stock.id) {
    errorMsg.value = 'Stock hat keine ID.'
    return
  }
  errorMsg.value = ''
  try {
    await deleteStock(stock.id)
    savedStocks.value = savedStocks.value.filter(s => s.id !== stock.id)
    await reloadPortfolioQuotes()
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler beim Löschen'
  }
}

async function resetPortfolio() {
  errorMsg.value = ''
  try {
    await clearPortfolio()
    savedStocks.value = []
    portfolioQuotes.value = {}
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler beim Zurücksetzen'
  }
}

function openFromPortfolio(s: Stock) {
  symbol.value = s.symbol
  tvSymbol.value = s.tvSymbol
  // Kurs lädt automatisch durch watch(symbol)
}

function perfForStock(s: Stock): { pct: number; text: string } | null {
  const q = portfolioQuotes.value?.[s.symbol?.toUpperCase()]
  if (!q?.c || !s.buyPrice || s.buyPrice <= 0) return null

  const pct = ((Number(q.c) - Number(s.buyPrice)) / Number(s.buyPrice)) * 100
  const sign = pct >= 0 ? '+' : ''
  return { pct, text: `${sign}${pct.toFixed(2)}%` }
}
</script>

<template>
  <main class="stocks">
    <h1>Stocks</h1>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

    <!-- OBERER KASTEN -->
    <div class="card">
      <!-- Beispiele: oben, volle Breite, gleiche Höhe wie Input -->
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

      <!-- Symbol Input: volle Breite -->
      <label class="label">Symbol</label>

      <input
        v-model="symbol"
        placeholder="AAPL oder BMW.DE"
        class="symbol-input"
      />

      <!-- Buttons darunter, eine Zeile, gleich groß -->
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
            <th>Aktuell</th>
            <th>Open</th>
            <th>High</th>
            <th>Low</th>
            <th>Prev Close</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <td>{{ quote.c }}</td>
            <td>{{ quote.o }}</td>
            <td>{{ quote.h }}</td>
            <td>{{ quote.l }}</td>
            <td>{{ quote.pc }}</td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Hinweis: immer sichtbar, orange, abgerundet, nah am Widget -->
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
        <li v-for="s in savedStocks" :key="s.id ?? s.symbol" class="stock-row">
          <button class="pf-btn" @click="openFromPortfolio(s)" :title="s.name ?? s.symbol">
            {{ s.name ? `${s.name} (${s.symbol})` : s.symbol }}
          </button>

          <span
            v-if="perfForStock(s)"
            class="perf"
            :class="perfForStock(s)!.pct >= 0 ? 'pos' : 'neg'"
            title="Performance seit Kauf (gegen buyPrice)"
          >
            {{ perfForStock(s)!.text }}
          </span>
          <span v-else class="perf neutral">—</span>

          <button class="btn danger" @click="removeStock(s)">Löschen</button>
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
  font-family: "Apple Braille";
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
  background: #e5e7eb;
}
.btn:hover { filter: brightness(0.98); }
.danger { background: #ffe3e3; }

/* Beispiele: oben, volle Breite, gleiche Höhe wie input */
.examples-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 44px;               /* gleiche Höhe wie Input */
  padding: 0 0.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fafafa;
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

.input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid #ccc;
  height: 44px;            /* gleiche Höhe wie Beispiele */
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
  flex: 1;                 /* exakt gleich breit */
  text-align: center;
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

/* Hinweis: immer sichtbar, orange, abgerundet, nah am Widget */
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
</style>
