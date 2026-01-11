<script setup lang="ts">
import { onMounted, ref, nextTick} from 'vue'
import Chart from 'chart.js/auto'
import { getReport } from '@/service/reportService'
import type { ReportResponse } from '@/models/Report'

const month = ref(new Date().toISOString().slice(0, 7)) // YYYY-MM
const data = ref<ReportResponse | null>(null)
const errorMsg = ref('')

const barCanvas = ref<HTMLCanvasElement | null>(null)
const pieCanvas = ref<HTMLCanvasElement | null>(null)
let barChart: Chart | null = null
let pieChart: Chart | null = null

onMounted(load)

async function load() {
  errorMsg.value = ''
  try {
    data.value = await getReport(month.value)
    await nextTick()
    renderCharts()
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler'
  }
}

function renderCharts() {
  if (!data.value) return

  const labels = data.value.rows.map(r => r.category)
  const budget = data.value.rows.map(r => r.budgetLimit)
  const spent = data.value.rows.map(r => r.spent)

  // Bar chart
  if (barCanvas.value) {
    if (barChart) barChart.destroy()
    barChart = new Chart(barCanvas.value, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Budget', data: budget },
          { label: 'Ausgaben', data: spent }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    })
  }

  // Pie chart (nur Ausgaben > 0)
  if (pieCanvas.value) {
    const spentRows = data.value.rows.filter(r => r.spent > 0)
    const pieLabels = spentRows.map(r => r.category)
    const pieData = spentRows.map(r => r.spent)

    if (pieChart) pieChart.destroy()
    pieChart = new Chart(pieCanvas.value, {
      type: 'doughnut',
      data: {
        labels: pieLabels,
        datasets: [
          {
            label: 'Ausgaben',
            data: pieData,
            borderWidth: 2,
            radius: '90%',
            cutout: '60%'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    })


  }
}

function euro(v: number) {
  return v.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €'
}
</script>

<template>
  <main class="report">
    <h1>Report</h1>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

    <!-- Filter -->
    <section class="card">
      <h2>Monat auswählen</h2>
      <div class="row">
        <input v-model="month" placeholder="YYYY-MM" />
        <button @click="load">Laden</button>
      </div>
    </section>

    <!-- Summary -->
    <section v-if="data" class="card summary">
      <div class="summary-item">
        <div class="label">Income</div>
        <div class="value plus">{{ euro(data.incomeSum) }}</div>
      </div>

      <div class="summary-item">
        <div class="label">Expenses</div>
        <div class="value minus">{{ euro(data.expenseSum) }}</div>
      </div>

      <div class="summary-item">
        <div class="label">Netto</div>
        <div class="value" :class="data.net >= 0 ? 'plus' : 'minus'">{{ euro(data.net) }}</div>
      </div>
    </section>

    <!-- Table -->
    <section v-if="data" class="card">
      <h2>Übersicht (Budget vs Ausgaben)</h2>

      <table class="table">
        <thead>
        <tr>
          <th>Kategorie</th>
          <th>Budget</th>
          <th>Ausgaben</th>
          <th>Rest</th>
          <th>%</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="r in data.rows" :key="r.category">
          <td>{{ r.category }}</td>
          <td>{{ euro(r.budgetLimit) }}</td>
          <td class="minus">{{ euro(r.spent) }}</td>
          <td :class="r.remaining >= 0 ? 'plus' : 'minus'">{{ euro(r.remaining) }}</td>
          <td>{{ r.percentUsed }}%</td>
        </tr>
        </tbody>
      </table>
    </section>

    <!-- Charts -->
    <section v-if="data" class="charts">
      <div class="card chart-card">
        <h2>Budget vs Ausgaben</h2>
        <canvas ref="barCanvas"></canvas>
      </div>

      <div class="card chart-card">
        <h2>Ausgaben-Verteilung</h2>
        <canvas ref="pieCanvas"></canvas>
      </div>
    </section>
  </main>
</template>

<style scoped>
.report {
  width: 900px;
  padding: 2rem;
  font-family: "Apple Braille";
}
.error { color: red; }

.card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

input {
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid #ddd;
  width: 200px;
}

button {
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}

/* Summary */
.summary {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.summary-item {
  flex: 1;
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 0.75rem;
}

.label { color: #666; font-size: 0.95rem; }
.value { font-weight: 700; font-size: 1.2rem; }
.plus { color: #15803d; }
.minus { color: #b91c1c; }

/* Table */
.table {
  width: 100%;
  border-collapse: collapse;
}
.table th, .table td {
  padding: 0.6rem;
  border-bottom: 1px solid #eee;
  text-align: left;
}

/* Charts Layout */
.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* ⭐ Wichtig: Karte bekommt feste Höhe, Canvas füllt sie */
.chart-card {
  height: 360px;
  display: flex;
  flex-direction: column;
}

.chart-card h2 {
  margin: 0 0 0.75rem 0;
}

/* Canvas nimmt den restlichen Platz ein */
.chart-card canvas {
  flex: 1;
  width: 100% !important;
  height: 100% !important;
}

@media (max-width: 980px) {
  .report { width: 100%; }
  .charts { grid-template-columns: 1fr; }
  .summary { flex-direction: column; }
  .chart-card { height: 320px; }
}

</style>
