<script setup lang="ts">
interface Entry {
  id: number
  title: string
  amount: number
}

defineProps<{entries: Entry[] }>()
</script>

<template>
  <div class="budget-list">
    <h2>Budgetübersicht</h2>

    <ul>
      <li v-for="item in entries" :key="item.id">
        <span>{{ item.title }}</span> —
        <strong :class="item.amount >= 0 ? 'income' : 'expense'">
          {{ item.amount }} €
        </strong>
      </li>
    </ul>

    <p v-if="entries.length === 0">Keine Einträge vorhanden!</p>
  </div>
</template>

<style scoped>
.budget-list {
  background-color: #fff;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
}
.income {
  color: green;
  font-weight: bold;
}

.expense {
  color: red;
  font-weight: bold;
}
</style>
