<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BudgetList from '../components/BudgetList.vue'


interface Budget {
  month: string
  limit: number
  //TODO alle Variablen übergeben lassen
}

interface Entry {
  id: number
  title: string
  amount: number
}

const entries = ref<Entry[]>([])

// TODO aufräumen
onMounted(async () => {
  try {
    const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
    const response = await fetch(baseUrl + "/budgets");
    const data = await response.json()
    // TODO aufräumen
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
        <a href="#">Home</a> &nbsp;
        <a href="#">Expenses</a> &nbsp;
        <a href="#">Income</a> &nbsp;
        <a href="#">Report</a> &nbsp;
        <a href="#">Account</a> &nbsp;
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
  <footer>
    //TODO hier steht ein footer
  </footer>
</template>

<style scoped>

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0px 0px;
  background-color: whitesmoke;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.warning {
  color: red;
  font-weight: bold;
}
</style>

