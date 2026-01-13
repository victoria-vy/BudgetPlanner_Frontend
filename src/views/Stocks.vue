<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'

import {
  getUserStocks,
  addStock,
  getStockQuote,
  getStockChart,
  deleteStock,
  clearPortfolio,
  searchStockSymbols
} from '@/service/StockService'

import type { Stock } from '@/models/Stock'
import { isLoggedIn } from '@/service/authService.ts'

type SymbolMatch = {
  symbol: string
  name?: string
  region?: string
  currency?: string
  matchScore?: string
}

const symbol = ref('')
const quote = ref<any | null>(null)
const savedStocks = ref<Stock[]>([])
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null
const errorMsg = ref<string>('')

const searchResults = ref<SymbolMatch[]>([])
const isSearching = ref(false)

/** Beispiel-Symbole (klickbar) */
const exampleSymbols = ['AAPL', 'MSFT', 'TSLA', 'AMZN', 'NVDA', 'SAP', 'BMW.DE']

function pickExample(sym: string) {
  symbol.value = sym
  searchResults.value = []
  loadStockData()
}

function pickSearchResult(m: SymbolMatch) {
  symbol.value = (m.symbol ?? '').toUpperCase()
  loadStockData()
}

onMounted(async () => {
  if (!isLoggedIn()) {
    errorMsg.value = 'Bitte zuerst im Account einloggen.'
    return
  }
  await reloadPortfolio()
})

async function reloadPortfolio() {
  errorMsg.value = ''
  try {
    savedStocks.value = await getUserStocks()
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler beim Laden'
  }
}

async function runSymbolSearch() {
  errorMsg.value = ''
  searchResults.value = []
  const q = symbol.value.trim()
  if (!q) return

  try {
    isSearching.value = true
    const res = await searchStockSymbols(q)

    if (res?.s && res.s !== 'ok') {
      errorMsg.value = res?.message ?? 'Keine Suchergebnisse'
      return
    }

    searchResults.value = Array.isArray(res?.matches) ? res.matches : []
    if (searchResults.value.length === 0) {
      errorMsg.value = 'Keine Treffer gefunden.'
    }
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler bei der Suche'
  } finally {
    isSearching.value = false
  }
}

async function loadStockData() {
  errorMsg.value = ''
  const sym = symbol.value.trim().toUpperCase()
  if (!sym) return

  try {
    const q = await getStockQuote(sym)

    // Quote kann jetzt auch { s:"error", message:"..." } liefern
    if (q?.s && q.s !== 'ok') {
      errorMsg.value = q?.message ?? 'Keine Quotendaten verfügbar.'
      quote.value = null
      return
    }

    quote.value = q

    const chartData = await getStockChart(sym)
    if (chartData?.s && chartData.s !== 'ok') {
      errorMsg.value = chartData?.message ?? 'Keine Chartdaten verfügbar.'
      return
    }

    renderChart(chartData)
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler beim Laden der Kursdaten'
  }
}

async function saveStock() {
  errorMsg.value = ''
  const sym = symbol.value.trim().toUpperCase()
  if (!sym) return

  try {
    // Optional: Name mitschreiben, wenn aus Suche gewählt
    const hit = searchResults.value.find(m => (m.symbol ?? '').toUpperCase() === sym)

    const stock: Stock = {
      symbol: sym,
      name: hit?.name
    }

    const saved = await addStock(stock)
    savedStocks.value.push(saved)
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler beim Speichern'
  }
}

async function removeStock(stock: Stock) {
  if (!stock.id) {
    errorMsg.value = 'Stock hat keine ID (Backend muss getId() liefern).'
    return
  }

  errorMsg.value = ''
  try {
    await deleteStock(stock.id)
    savedStocks.value = savedStocks.value.filter(s => s.id !== stock.id)
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler beim Löschen'
  }
}

async function resetPortfolio() {
  errorMsg.value = ''
  try {
    await clearPortfolio()
    savedStocks.value = []
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler beim Zurücksetzen'
  }
}

function renderChart(data: any) {
  if (!chartCanvas.value) return
  if (chart) chart.destroy()

  // { s:"ok", t:[...], c:[...] } oder { s:"error", message:"..." }
  if (data?.s && data.s !== 'ok') {
    errorMsg.value = data?.message ?? 'Keine Chartdaten verfügbar (Rate Limit / Symbol falsch).'
    return
  }

  if (!data?.t || !data?.c || data.t.length === 0) {
    errorMsg.value = 'Chartdaten unvollständig'
    return
  }

  chart = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels: data.t.map((t: number) => new Date(t * 1000).toLocaleDateString()),
      datasets: [
        {
          label: 'Kursverlauf',
          data: data.c,
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false
    }
  })
}
</script>

<template>
  <main class="stocks">
    <h1>Stocks</h1>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

    <div class="card">
      <label>Symbol (z.B. AAPL)</label>
      <input v-model="symbol" placeholder="AAPL" />

      <!-- NEU: Symbolsuche (AlphaVantage SYMBOL_SEARCH) -->
      <div class="row">
        <button @click="runSymbolSearch" :disabled="!symbol.trim() || isSearching">
          {{ isSearching ? 'Suche...' : 'Symbol suchen' }}
        </button>
      </div>

      <div v-if="searchResults.length" class="search-results">
        <div class="examples">
          <span class="examples-label">Treffer:</span>

          <button
            v-for="m in searchResults.slice(0, 8)"
            :key="m.symbol"
            class="chip"
            @click="pickSearchResult(m)"
            :title="m.name"
          >
            {{ m.symbol }}
            <span class="chip-sub">
              {{ m.region }}<span v-if="m.currency"> · {{ m.currency }}</span>
            </span>
          </button>
        </div>

        <p class="hint">
          Tipp: Für EU/DE-Aktien wähle hier das passende Symbol (z.B. BMW.*), dann funktionieren Quote/Chart zuverlässiger.
        </p>
      </div>

      <!-- Beispiel-Symbole -->
      <div class="examples">
        <span class="examples-label">Beispiele:</span>
        <button
          v-for="ex in exampleSymbols"
          :key="ex"
          class="chip"
          @click="pickExample(ex)"
        >
          {{ ex }}
        </button>
      </div>

      <div class="row">
        <button @click="loadStockData" :disabled="!symbol.trim()">Kurs laden</button>
        <button @click="saveStock" :disabled="!symbol.trim()">Ins Portfolio</button>
        <button @click="reloadPortfolio">Portfolio neu laden</button>
        <button class="danger" @click="resetPortfolio" :disabled="savedStocks.length === 0">
          Portfolio resetten
        </button>
      </div>

      <div v-if="quote" class="quote">
        <p><strong>Aktuell:</strong> {{ quote.c }}</p>
        <p><strong>High:</strong> {{ quote.h }} | <strong>Low:</strong> {{ quote.l }}</p>
        <p><strong>Open:</strong> {{ quote.o }} | <strong>Prev:</strong> {{ quote.pc }}</p>
      </div>

      <div class="chart-wrap">
        <canvas ref="chartCanvas"></canvas>
      </div>
    </div>

    <div class="card">
      <h2>Dein Portfolio</h2>

      <ul v-if="savedStocks.length">
        <li v-for="s in savedStocks" :key="s.id ?? s.symbol" class="stock-row">
          <span>{{ s.symbol }}</span>
          <button class="danger" @click="removeStock(s)">Löschen</button>
        </li>
      </ul>

      <p v-else>Noch keine Stocks gespeichert.</p>
    </div>
  </main>
</template>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
}

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

.row {
  display: flex;
  gap: 0.5rem;
  margin: 0.75rem 0;
  flex-wrap: wrap;
}

input {
  width: 100%;
  padding: 0.75rem;
  border-radius: 10px;
  border: 1px solid #ccc;
}

button {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 10px;
  cursor: pointer;
}

.examples {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
  margin-top: 0.6rem;
}

.examples-label {
  color: #6b7280;
  font-size: 0.95rem;
  margin-right: 0.25rem;
}

.chip {
  padding: 0.45rem 0.75rem;
  border-radius: 999px;
  border: 1px solid #e5e5e5;
  background: #f7fbff;
  cursor: pointer;
  font-weight: 600;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.chip:hover {
  filter: brightness(0.98);
}

.chip-sub {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  margin-top: 0.15rem;
}

.chart-wrap {
  margin-top: 0.75rem;
  height: 220px;
}

.stock-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.4rem 0;
}

.danger {
  background: #ffe3e3;
}

.error {
  color: red;
}

.quote {
  margin: 0.75rem 0;
}

.search-results {
  margin-top: 0.25rem;
}

.hint {
  margin-top: 0.4rem;
  font-size: 0.9rem;
  color: #6b7280;
}
</style>
