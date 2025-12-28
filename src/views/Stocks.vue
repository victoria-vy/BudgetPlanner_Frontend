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

const symbol = ref('')
const quote = ref(" ")
const savedStocks = ref<Stock[]>([])
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

onMounted(async () => {
  savedStocks.value = await getUserStocks()
})

async function loadStockData() {
  quote.value = await getStockQuote(symbol.value)
  const chartData = await getStockChart(symbol.value)
  renderChart(chartData)
}

async function saveStock() {
  const stock: Stock = {
    symbol: symbol.value
  }

  const saved = await addStock(stock)
  savedStocks.value.push(saved)
}

function renderChart(data: any) {
  if (!chartCanvas.value) return

  if (chart) {
    chart.destroy()
  }

  chart = new Chart(chartCanvas.value, {
    type: 'line',
    data: {
      labels: data.t.map((t: number) =>
        new Date(t * 1000).toLocaleDateString()
      ),
      datasets: [
        {
          label: 'Kursverlauf',
          data: data.c,
          borderColor: '#4f46e5',
          fill: false
        }
      ]
    }
  })
}
</script>

<template>
  <!-- TODO: Backend einbinden, damit Stock für User gespeichert wird -->
  <!-- TODO: Aussehen implementieren -->
</template>

<style scoped>
</style>
