<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BudgetList from '../components/BudgetList.vue'
import type {Entry} from '@/models/Entry.ts'
import {getBudgets} from '@/service/budgetService.ts'

const entries = ref<Entry[]>([])

onMounted(async () => {
  try {
    const budget = await getBudgets()
    entries.value = budget.map((b, index) => ({
      id: index,
      title: b.month,
      amount: b.limit
    }))
  } catch (error) {
      console.error(error)
  }})

const total = computed(() =>
  entries.value.reduce((sum, e) => sum + e.amount, 0)
)
</script>

<template>
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
  padding: 0px 0px;
  background-color: whitesmoke;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.warning {
  color: red;
  font-weight: bold;
}
</style>

