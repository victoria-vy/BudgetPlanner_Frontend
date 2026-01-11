<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Income, IncomeCategory } from '@/models/Income'
import { getIncome, createIncome, deleteIncome } from '@/service/incomeService'

const items = ref<Income[]>([])
const errorMsg = ref('')

const title = ref('')
const amount = ref<number>(0)
const category = ref<IncomeCategory>('SALARY')

onMounted(load)

async function load() {
  errorMsg.value = ''
  try {
    items.value = await getIncome()
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler'
  }
}

function iconForCategory(cat: IncomeCategory) {
  switch (cat) {
    case 'SALARY': return '💼'
    case 'SIDE': return '🧾'
    case 'GIFT': return '🎁'
    default: return '💰'
  }
}

async function add() {
  errorMsg.value = ''
  try {
    const created = await createIncome({
      title: title.value,
      amount: amount.value,
      category: category.value
    })
    items.value.unshift(created)
    title.value = ''
    amount.value = 0
    category.value = 'SALARY'
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler beim Speichern'
  }
}

async function remove(id?: number) {
  if (!id) return
  await deleteIncome(id)
  items.value = items.value.filter(i => i.id !== id)
}
</script>

<template>
  <main class="page">
    <h1>Income</h1>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

    <section class="card">
      <h2>Neue Einnahme</h2>

      <div class="row">
        <input v-model="title" placeholder="Titel (z.B. Gehalt)" />
        <input v-model.number="amount" type="number" min="0" step="0.01" placeholder="Betrag (€)" />

        <select v-model="category">
          <option value="SALARY">💼 Gehalt</option>
          <option value="SIDE">🧾 Nebenjob</option>
          <option value="GIFT">🎁 Geschenk</option>
          <option value="OTHER">💰 Sonstiges</option>
        </select>

        <button @click="add" :disabled="!title || amount <= 0" data-testid="add-income ">Anlegen</button>
      </div>
    </section>

    <section class="list">
      <article v-for="i in items" :key="i.id" class="item-card">
        <div class="left">
          <span class="icon">{{ iconForCategory(i.category) }}</span>
          <div>
            <div class="cat">{{ i.title }}</div>
            <small>{{ i.category }} <span v-if="i.date">• {{ i.date }}</span></small>
          </div>
        </div>

        <div class="right">
          <strong class="plus">+ {{ i.amount }} €</strong>
          <button class="danger" @click="remove(i.id)"data-testid="delete-income">Löschen</button>
        </div>
      </article>

      <p v-if="items.length === 0" class="empty">Noch keine Income Einträge vorhanden.</p>
    </section>
  </main>
</template>

<style scoped>
.page {
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
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr auto;
  gap: 0.75rem;
  align-items: center;
}

input, select {
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

.list { display: flex; flex-direction: column; gap: 1rem; }

.item-card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 18px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left { display: flex; align-items: center; gap: 0.75rem; }

.icon {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #eaf3ff;
  font-size: 1.2rem;
}

.cat { font-weight: 600; }

.right { display: flex; align-items: center; gap: 1rem; }

.plus { color: #15803d; }

.danger { background: #ffe3e3; }

.empty { color: #666; }
</style>
