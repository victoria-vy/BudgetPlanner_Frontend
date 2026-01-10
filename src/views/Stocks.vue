<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Chart from 'chart.js/auto'

import {
  getUserStocks,
  addStock,
  getStockQuote,
  getStockChart
} from '@/service/StockService'

import type { Stock } from '@/models/Stock'
import { isLoggedIn } from '@/service/authService.ts'

const symbol = ref('')
const quote = ref<any | null>(null)
const savedStocks = ref<Stock[]>([])
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null
const errorMsg = ref<string>('')

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

async function loadStockData() {
  errorMsg.value = ''
  try {
    quote.value = await getStockQuote(symbol.value.trim())
    const chartData = await getStockChart(symbol.value.trim())
    renderChart(chartData)
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler beim Laden der Kursdaten'
  }
}

async function saveStock() {
  errorMsg.value = ''
  try {
    const stock: Stock = { symbol: symbol.value.trim() }
    const saved = await addStock(stock)
    savedStocks.value.push(saved)
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler beim Speichern'
  }
}

function renderChart(data: any) {
  if (!chartCanvas.value) return

  if (chart) chart.destroy()

  // Finnhub candle liefert: t (timestamps), c (close)
  if (!data?.t || !data?.c) {
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

      <div class="row">
        <button @click="loadStockData" :disabled="!symbol.trim()">Kurs laden</button>
        <button @click="saveStock" :disabled="!symbol.trim()">Ins Portfolio</button>
        <button @click="reloadPortfolio">Portfolio neu laden</button>
      </div>

      <div v-if="quote" class="quote">
        <p><strong>Aktuell:</strong> {{ quote.c }}</p>
        <p><strong>High:</strong> {{ quote.h }} | <strong>Low:</strong> {{ quote.l }}</p>
        <p><strong>Open:</strong> {{ quote.o }} | <strong>Prev:</strong> {{ quote.pc }}</p>
      </div>

      <canvas ref="chartCanvas" height="120"></canvas>
    </div>

    <div class="card">
      <h2>Dein Portfolio</h2>
      <ul v-if="savedStocks.length">
        <li v-for="s in savedStocks" :key="s.id ?? s.symbol">
          {{ s.symbol }}
        </li>
      </ul>
      <p v-else>Noch keine Stocks gespeichert.</p>
    </div>
  </main>
</template>

<style scoped>
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
.error { color: red; }
.quote { margin: 0.75rem 0; }
</style>
