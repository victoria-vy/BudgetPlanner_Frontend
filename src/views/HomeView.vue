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
  <main>
    <h1>Mein Budget Planer</h1>

    <BudgetList :entries="entries" />

    <div class="summary">
      <p>Gesamt: {{ total }} €</p>
      <p v-if="total < 0" class="warning">Du bist im Minus!</p>
    </div>
  </main>
</template>

<style scoped>
.warning {
  color: red;
  font-weight: bold;
}
</style>

