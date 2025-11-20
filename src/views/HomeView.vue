<script setup lang="ts">
import { ref, computed } from 'vue'
import BudgetList from '../components/BudgetList.vue'

const entries = ref([
  { id: 1, title: 'Gehalt', amount: 2500 },
  { id: 2, title: 'Miete', amount: -1200 },
  { id: 3, title: 'Einkauf', amount: -300 }
])

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

