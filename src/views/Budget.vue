<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getBudgets, createBudget, deleteBudget } from '@/service/budgetService.ts'
import type { Budget, BudgetCategory } from '@/models/Budget'

const budgets = ref<Budget[]>([])
const errorMsg = ref('')

const month = ref('')
const limitAmount = ref<number>(0)
const category = ref<BudgetCategory>('FOOD')

onMounted(load)

async function load() {
  errorMsg.value = ''
  try {
    budgets.value = await getBudgets()
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler beim Laden'
  }
}

async function addBudget() {
  errorMsg.value = ''
  try {
    const created = await createBudget({
      month: month.value,
      limitAmount: limitAmount.value,
      category: category.value  //
    })
    budgets.value.unshift(created)
    month.value = ''
    limitAmount.value = 0
    category.value = 'FOOD'
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler beim Anlegen'
  }
}

async function remove(id?: number) {
  if (!id) return
  await deleteBudget(id)
  budgets.value = budgets.value.filter(b => b.id !== id)
}

function iconForCategory(cat: BudgetCategory) {
  switch (cat) {
    case 'FOOD': return '🍔'
    case 'RENT': return '🏠'
    case 'FUN': return '🎉'
    case 'TRAVEL': return '✈️'
    case 'TECH': return '💻'
    default: return '💰'
  }
}
</script>

<template>
  <main class="budgets">
    <h1>Budgets</h1>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

    <!-- Neues Budget -->
    <section class="card">
      <h2>Neues Budget</h2>

      <div class="row">
        <input v-model="month" placeholder="Monat (YYYY-MM)" />
        <input
          v-model.number="limitAmount"
          type="number"
          min="0"
          placeholder="Limit (€)"
        />

        <select v-model="category">
          <option value="FOOD">🍔 Essen</option>
          <option value="RENT">🏠 Miete</option>
          <option value="FUN">🎉 Freizeit</option>
          <option value="TRAVEL">✈️ Reisen</option>
          <option value="TECH">💻 Technik</option>
        </select>

        <button @click="addBudget" :disabled="!month || limitAmount <= 0">
          Anlegen
        </button>
      </div>
    </section>

    <!-- Budget Liste -->
    <section class="list">
      <article v-for="b in budgets" :key="b.id" class="budget-card">
        <div class="left">

          <span class="icon">{{ iconForCategory(b.category) }}</span>

          <div>
            <div class="cat">{{ b.category }}</div>
            <small>{{ b.month }}</small>
          </div>
        </div>

        <div class="right">
          <strong>{{ b.limitAmount }} €</strong>
          <button class="danger" @click="remove(b.id)">Löschen</button>
        </div>
      </article>

      <p v-if="budgets.length === 0" class="empty">
        Noch keine Budgets angelegt.
      </p>
    </section>
  </main>
</template>

<style scoped>
.budgets {
  width: 900px;
  padding: 2rem;
  font-family: "Apple Braille";
}

.error {
  color: red;
}

/* Card wie Savings */
.card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.row {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr auto;
  gap: 0.75rem;
  align-items: center;
}

input,
select {
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid #ddd;
}

button {
  padding: 0.8rem 1.2rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Einzelnes Budget */
.budget-card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 18px;
  padding: 1rem;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #eaf3ff;
  font-size: 1.2rem;
}

.cat {
  font-weight: 600;
}

.right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.danger {
  background: #ffe3e3;
}

.empty {
  color: #666;
}
</style>
