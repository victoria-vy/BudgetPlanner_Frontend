<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, nextTick, computed } from "vue";
import Chart from "chart.js/auto";
import type { ActiveElement, ChartEvent } from "chart.js";
import { getReport } from "@/service/reportService";
import type { ReportResponse } from "@/models/Report";
import { getUserStocks, getStockQuotes, type Quote } from "@/service/StockService";
import type { Stock } from "@/models/Stock";
import { getSavingsGoals } from "@/service/savingsService";
import type { SavingsGoal } from "@/models/SavingsGoal";

const data = ref<ReportResponse | null>(null);
const errorMsg = ref("");

// --- Dropdown state (wie Budgets) ---
const yearOpen = ref(false);
const monthOpen = ref(false);

function closeAll() {
  yearOpen.value = false;
  monthOpen.value = false;
}

function onDocClick(e: MouseEvent) {
  const t = e.target as HTMLElement | null;
  if (!t) return;
  if (!t.closest(".dd")) closeAll();
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    const msg = (e as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  if (typeof e === "string") return e;
  return "Fehler";
}

// --- Jahr/Monat Auswahl ---
const now = new Date();
const selectedYear = ref(String(now.getFullYear()));
const selectedMonth = ref(String(now.getMonth() + 1).padStart(2, "0")); // "01".."12"

// Backend bleibt YYYY-MM (Budgets sind so gespeichert)
const month = computed(() => `${selectedYear.value}-${selectedMonth.value}`);

const monthOptions = [
  { value: "01", label: "Januar" },
  { value: "02", label: "Februar" },
  { value: "03", label: "März" },
  { value: "04", label: "April" },
  { value: "05", label: "Mai" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Dezember" },
];

const yearOptions = computed(() => {
  const y = now.getFullYear();
  const years: string[] = [];
  for (let i = y - 5; i <= y + 1; i++) years.push(String(i));
  return years;
});

function monthLabel(mm: string) {
  return monthOptions.find((m) => m.value === mm)?.label ?? mm;
}

function setYear(y: string) {
  selectedYear.value = y;
  yearOpen.value = false;
}

function setMonth(m: string) {
  selectedMonth.value = m;
  monthOpen.value = false;
}

// --- Charts ---
const barCanvas = ref<HTMLCanvasElement | null>(null);
const pieCanvas = ref<HTMLCanvasElement | null>(null);

let barChart: Chart<"bar"> | null = null;
let pieChart: Chart<"doughnut"> | null = null;

// Klick-Info (zeigt Wert mit €)
const barClickInfo = ref<string>("");
const pieClickInfo = ref<string>("");

// --- Stocks/Savings state ---
const stocks = ref<Stock[]>([]);
const stockQuotes = ref<Record<string, Quote>>({});
const goals = ref<SavingsGoal[]>([]);

onMounted(() => {
  load();
  document.addEventListener("click", onDocClick);
});

async function load() {
  errorMsg.value = "";
  try {
    data.value = await getReport(month.value);

    await loadStocksSummary();
    await loadSavingsSummary();

    await nextTick();
    renderCharts();
  } catch (e: unknown) {
    errorMsg.value = getErrorMessage(e) ?? "Fehler";
  }
}

function renderCharts() {
  if (!data.value) return;

  barClickInfo.value = "";
  pieClickInfo.value = "";

  const labels = data.value.rows.map((r) => r.category);
  const budget = data.value.rows.map((r) => r.budgetLimit);
  const spent = data.value.rows.map((r) => r.spent);

  // Bar chart
  if (barCanvas.value) {
    if (barChart) barChart.destroy();

    barChart = new Chart(barCanvas.value, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Budget",
            data: budget,
            backgroundColor: "#90dcea",
            borderColor: "#90dcea",
          },
          {
            label: "Ausgaben",
            data: spent,
            backgroundColor: "#162865",
            borderColor: "#162865",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 8, right: 10, bottom: 22, left: 10 },
        },
        plugins: {
          legend: {
            position: "bottom",
            labels: { padding: 10, boxWidth: 18 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const parsed = ctx.parsed as unknown;
                const v =
                  typeof parsed === "object" &&
                  parsed !== null &&
                  "y" in (parsed as Record<string, unknown>)
                    ? Number((parsed as { y?: unknown }).y)
                    : Number(parsed);

                return `${ctx.dataset.label}: ${euro(Number.isFinite(v) ? v : 0)}`;
              },
            },
          },
        },
        onClick: (_evt: ChartEvent, elements: ActiveElement[]) => {
          if (!elements.length) return;

          const el = elements[0];
          if (!el) return; // <- Fix: el kann laut TS undefined sein

          const i = el.index;
          const ds = el.datasetIndex;

          const cat = labels[i];
          const value = Number(ds === 0 ? budget[i] : spent[i]);
          const which = ds === 0 ? "Budget" : "Ausgaben";

          barClickInfo.value = `${cat} · ${which}: ${euro(Number.isFinite(value) ? value : 0)}`;
        },
      },
    });
  }

  // Pie chart (nur Ausgaben > 0)
  if (pieCanvas.value) {
    const spentRows = data.value.rows.filter((r) => r.spent > 0);
    const pieLabels = spentRows.map((r) => r.category);
    const pieData = spentRows.map((r) => r.spent);

    if (pieChart) pieChart.destroy();

    pieChart = new Chart(pieCanvas.value, {
      type: "doughnut",
      data: {
        labels: pieLabels,
        datasets: [
          {
            label: "Ausgaben",
            data: pieData,
            borderWidth: 2,
            backgroundColor: pieData.map((_, i) => (i % 2 === 0 ? "#90dcea" : "#162865")),
            borderColor: "#ffffff",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: { top: 8, right: 10, bottom: 22, left: 10 },
        },
        // Fix: radius/cutout gehören bei dir als Typ offenbar in options, nicht ins Dataset
        radius: "90%",
        cutout: "60%",
        plugins: {
          legend: {
            position: "bottom",
            labels: { padding: 10, boxWidth: 18 },
          },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const v = Number(ctx.parsed);
                return `${ctx.label}: ${euro(Number.isFinite(v) ? v : 0)}`;
              },
            },
          },
        },
        onClick: (_evt: ChartEvent, elements: ActiveElement[]) => {
          if (!elements.length) return;

          const el = elements[0];
          if (!el) return; // <- Fix: el kann laut TS undefined sein

          const i = el.index;

          const cat = pieLabels[i];
          const value = Number(pieData[i]);

          pieClickInfo.value = `${cat}: ${euro(Number.isFinite(value) ? value : 0)}`;
        },
      },
    });
  }
}

// Stocks Summary Load
async function loadStocksSummary() {
  try {
    stocks.value = await getUserStocks();
    const symbols = stocks.value.map((s) => s.symbol?.toUpperCase()).filter(Boolean);
    if (symbols.length === 0) {
      stockQuotes.value = {};
      return;
    }
    const res = await getStockQuotes(symbols);
    stockQuotes.value = res?.data ?? {};
  } catch {
    stockQuotes.value = {};
  }
}

// Savings Summary Load
async function loadSavingsSummary() {
  try {
    goals.value = await getSavingsGoals();
  } catch {
    goals.value = [];
  }
}

onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);

  if (barChart) barChart.destroy();
  if (pieChart) pieChart.destroy();
  barChart = null;
  pieChart = null;
});

function euro(v: number) {
  return (
    v.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €"
  );
}

// --- Stocks KPIs ---
const stocksCount = computed(() => stocks.value.length);

const stocksInvested = computed(() =>
  stocks.value.reduce((sum, s) => {
    const buy = Number(s.buyPrice);
    const qty = Number(s.quantity ?? 1);
    return sum + (Number.isFinite(buy) ? buy * qty : 0);
  }, 0)
);

const stocksMarketValue = computed(() =>
  stocks.value.reduce((sum, s) => {
    const q = stockQuotes.value?.[s.symbol?.toUpperCase()];
    const price = Number(q?.c);
    const qty = Number(s.quantity ?? 1);
    return sum + (Number.isFinite(price) ? price * qty : 0);
  }, 0)
);

const stocksPnL = computed(() => stocksMarketValue.value - stocksInvested.value);

const stocksPnLPct = computed(() => {
  const inv = stocksInvested.value;
  if (inv <= 0) return 0;
  return (stocksPnL.value / inv) * 100;
});

// --- Savings KPIs ---
const goalsCount = computed(() => goals.value.length);

const savingsCurrentTotal = computed(() =>
  goals.value.reduce((sum, g) => sum + Number(g.currentAmount ?? 0), 0)
);

const savingsTargetTotal = computed(() =>
  goals.value.reduce((sum, g) => sum + Number(g.targetAmount ?? 0), 0)
);

const savingsPct = computed(() => {
  const target = savingsTargetTotal.value;
  if (target <= 0) return 0;
  return (savingsCurrentTotal.value / target) * 100;
});
</script>

<template>
  <main class="report">
    <h1>Report</h1>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

    <!-- Filter -->
    <section class="card">
      <h2>Monat auswählen</h2>

      <div class="row-filter">
        <!-- Jahr Dropdown (Budgets-Style) -->
        <div class="dd">
          <button
            class="field dd-btn"
            type="button"
            @click="yearOpen = !yearOpen; monthOpen = false"
          >
            <span class="dd-left">
              <span>{{ selectedYear }}</span>
            </span>
            <span class="arrow">▾</span>
          </button>

          <div v-if="yearOpen" class="dd-menu">
            <button
              v-for="y in yearOptions"
              :key="y"
              type="button"
              class="dd-item"
              @click="setYear(y)"
            >
              {{ y }}
            </button>
          </div>
        </div>

        <!-- Monat Dropdown (Budgets-Style) -->
        <div class="dd">
          <button
            class="field dd-btn"
            type="button"
            @click="monthOpen = !monthOpen; yearOpen = false"
          >
            <span class="dd-left">
              <span>{{ monthLabel(selectedMonth) }}</span>
            </span>
            <span class="arrow">▾</span>
          </button>

          <div v-if="monthOpen" class="dd-menu">
            <button
              v-for="m in monthOptions"
              :key="m.value"
              type="button"
              class="dd-item"
              @click="setMonth(m.value)"
            >
              {{ m.label }}
            </button>
          </div>
        </div>

        <button class="load-btn" @click="load">Laden</button>
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

    <!-- Stocks Summary -->
    <section class="card summary">
      <div class="summary-item">
        <div class="label">Stocks</div>
        <div class="value">{{ stocksCount }}</div>
      </div>

      <div class="summary-item">
        <div class="label">Stocks Wert</div>
        <div class="value">{{ euro(stocksMarketValue) }}</div>
      </div>

      <div class="summary-item">
        <div class="label">Stocks P/L</div>
        <div class="value" :class="stocksPnL >= 0 ? 'plus' : 'minus'">
          {{ euro(stocksPnL) }} ({{ stocksPnLPct.toFixed(2) }}%)
        </div>
      </div>
    </section>

    <!-- Savings Summary -->
    <section class="card summary">
      <div class="summary-item">
        <div class="label">Savings Ziele</div>
        <div class="value">{{ goalsCount }}</div>
      </div>

      <div class="summary-item">
        <div class="label">Gespart</div>
        <div class="value plus">{{ euro(savingsCurrentTotal) }}</div>
      </div>

      <div class="summary-item">
        <div class="label">Fortschritt</div>
        <div class="value">{{ savingsPct.toFixed(0) }}%</div>
      </div>
    </section>

    <!-- Table (Stocks-Style) -->
    <section v-if="data" class="card">
      <h2>Übersicht (Budget vs Ausgaben)</h2>

      <div class="quote-table">
        <table>
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
      </div>
    </section>

    <!-- Charts -->
    <section v-if="data" class="charts">
      <div class="card chart-card">
        <h2>Budget vs Ausgaben</h2>
        <canvas ref="barCanvas"></canvas>
        <div v-if="barClickInfo" class="click-info">{{ barClickInfo }}</div>
      </div>

      <div class="card chart-card">
        <h2>Ausgaben-Verteilung</h2>
        <canvas ref="pieCanvas"></canvas>
        <div v-if="pieClickInfo" class="click-info">{{ pieClickInfo }}</div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* (dein CSS unverändert) */
.report {
  width: 900px;
  padding: 2rem;
}
.error {
  color: red;
}

.card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

/* Filter: volle Breite (2 Dropdowns + Button) */
.row-filter {
  display: grid;
  grid-template-columns: 380px 380px 80px;
  gap: 0.75rem;
  align-items: center;
  width: 100%;
}

/* Dropdown Wrapper (wie Budgets) */
.dd {
  position: relative;
  width: 100%;
}

/* Field Button (wie Budgets) */
.field {
  height: 52px;
  width: 100%;
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid #ddd;
  background: #fff;
  text-align: left;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  box-sizing: border-box;
  line-height: 1;
}

.dd-left {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
}

.arrow {
  opacity: 0.8;
}

/* Dropdown Menu (wie Budgets) */
.dd-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  width: 100%;
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 12px;
  overflow: hidden;
  z-index: 50;
}

.dd-item {
  width: 100%;
  padding: 0.8rem;
  text-align: left;
  background: #fff;
  border: none;
  cursor: pointer;
}

.dd-item:hover {
  background: #f3f4f6;
}

/* Button wie bei dir, aber gleiche Höhe wie Felder */
button {
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}

.load-btn {
  height: 40px;
  align-self: center;
  background-color: #b4dda5;
  color: #000000;
}

.load-btn:hover{
  background-color: #b4dda5;
  color: white;
}

/* Summary */
.summary {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.summary-item {
  flex: 1;
  min-width: 220px;
  border: 1px solid #eee;
  border-radius: 14px;
  padding: 0.75rem;
}

.label {
  color: #666;
  font-size: 0.95rem;
}
.value {
  font-weight: 700;
  font-size: 1.2rem;
}
.plus {
  color: #15803d;
}
.minus {
  color: #b91c1c;
}

/* Tabelle wie Stocks (quote-table) */
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

.quote-table thead th {
  background: #f9fafb;
}

.quote-table th:last-child,
.quote-table td:last-child {
  border-right: none;
}

.quote-table tbody tr:last-child td {
  border-bottom: none;
}

/* Charts Layout */
.charts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

/* Chart-Karte */
.chart-card {
  height: 420px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 19px; /* ≈ 0,5 cm */
}

.chart-card h2 {
  margin: 0 0 0.75rem 0;
}

.chart-card canvas {
  flex: 1;
  width: 100% !important;
  height: 100% !important;
  max-height: 100% !important;
}

/* Klick-Info dezent */
.click-info {
  margin-top: 0.4rem;
  padding: 0.45rem 0.65rem;
  border: 1px solid #eee;
  border-radius: 12px;
  color: #374151;
  background: #fafafa;
  font-size: 0.95rem;
}

@media (max-width: 980px) {
  .report {
    width: 100%;
  }
  .charts {
    grid-template-columns: 1fr;
  }
  .summary {
    flex-direction: column;
  }
  .chart-card {
    height: 320px;
    padding-bottom: 19px;
  }

  .row-filter {
    grid-template-columns: 1fr;
  }

  .load-btn {
    width: 100%;
  }
}
</style>
