<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BudgetList from '../components/BudgetList.vue'

interface Budget {
  month: string
  limit: number
}

interface Entry {
  id: number
  title: string
  amount: number
}

const entries = ref<Entry[]>([])

// Daten vom Backend laden
onMounted(async () => {
  try {
    const response = await fetch('http://localhost:8080/budgets')
    const data = await response.json()
    // Backend liefert Budget-Objekte, wir mappen sie auf Entry
    entries.value = data.map((budget: Budget, index: number) => ({
      id: index,
      title: budget.month,
      amount: budget.limit
    }))
  } catch (error) {
      console.error('Fehler beim Laden der Budgets:', error)
  }})
const total = computed(() =>
  entries.value.reduce((sum, e) => sum + e.amount, 0)
)
</script>

<template>
  <div id="app">
    <header class ="app-header">
      <h1>Budget Planner</h1>
      <nav class="menu">
        <a href="#">TBD </a>
        <a href="#">TBD </a>
        <a href="#">TBD </a>
        <a href="#">TBD </a>
      </nav>
      <div class="header-logo">Logo</div>
    </header>
  </div>
  <main>

    <BudgetList :entries="entries" />

    <div class="summary">
      <p>Gesamt: {{ total }} €</p>
      <p v-if="total < 0" class="warning">Du bist im Minus!</p>
    </div>
  </main>
</template>

<style scoped>

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.warning {
  color: red;
  font-weight: bold;
}
</style>

