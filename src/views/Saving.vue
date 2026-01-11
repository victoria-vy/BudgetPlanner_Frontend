<script setup lang="ts">
import { onMounted, ref } from 'vue'
import type { SavingsGoal, SavingsCategory } from '@/models/SavingsGoal'
import {
  createSavingsGoal,
  deleteSavingsGoal,
  getSavingsGoals,
  updateSavingsGoal
} from '@/service/savingsService.ts'

const goals = ref<SavingsGoal[]>([])
const errorMsg = ref('')

const newTitle = ref('')
const newTarget = ref<number>(0)
const newCurrent = ref<number>(0)
const newCategory = ref<SavingsCategory>('OTHER')

const CATEGORY_OPTIONS: { value: SavingsCategory; label: string }[] = [
  { value: 'HOME', label: 'Wohnen' },
  { value: 'TRAVEL', label: 'Reise' },
  { value: 'CAR', label: 'Auto' },
  { value: 'EDUCATION', label: 'Bildung' },
  { value: 'EMERGENCY', label: 'Notgroschen' },
  { value: 'GIFTS', label: 'Geschenke' },
  { value: 'TECH', label: 'Technik' },
  { value: 'OTHER', label: 'Sonstiges' }
]

onMounted(load)

async function load() {
  errorMsg.value = ''
  try {
    goals.value = await getSavingsGoals()
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler'
  }
}

function percent(goal: SavingsGoal) {
  if (goal.targetAmount <= 0) return 0
  const p = (goal.currentAmount / goal.targetAmount) * 100
  return Math.max(0, Math.min(100, Math.round(p)))
}

function formatEuro(v: number) {
  return (
    v.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }) + ' €'
  )
}

function iconForGoal(goal: SavingsGoal): string {
  const title = goal.title.toLowerCase()

  if (title.includes('reise') || title.includes('urlaub')) return '✈️'
  if (title.includes('auto') || title.includes('wagen')) return '🚗'
  if (title.includes('haus') || title.includes('wohnung')) return '🏠'
  if (title.includes('hochzeit')) return '💍'
  if (title.includes('technik') || title.includes('laptop') || title.includes('handy')) return '💻'
  if (title.includes('festival') || title.includes('konzert')) return '🎶'
  if (title.includes('notgroschen') || title.includes('reserve')) return '🛟'
  if (title.includes('bildung') || title.includes('studium')) return '🎓'

  return '💰' // Default
}

async function addGoal() {
  errorMsg.value = ''
  try {
    const created = await createSavingsGoal({
      title: newTitle.value,
      targetAmount: newTarget.value,
      currentAmount: newCurrent.value,
      category: newCategory.value
    })

    goals.value.unshift(created)

    newTitle.value = ''
    newTarget.value = 0
    newCurrent.value = 0
    newCategory.value = 'OTHER'
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler beim Erstellen'
  }
}

async function addAmount(goal: SavingsGoal, delta: number) {
  if (!goal.id) return

  const updated: SavingsGoal = {
    ...goal,
    currentAmount: Math.max(0, goal.currentAmount + delta)
  }

  try {
    const saved = await updateSavingsGoal(goal.id, updated)
    goals.value = goals.value.map((g) => (g.id === goal.id ? saved : g))
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler beim Aktualisieren'
  }
}

async function remove(goal: SavingsGoal) {
  if (!goal.id) return
  try {
    await deleteSavingsGoal(goal.id)
    goals.value = goals.value.filter((g) => g.id !== goal.id)
  } catch (e: any) {
    errorMsg.value = e?.message ?? 'Fehler beim Löschen'
  }
}
</script>

<template>
  <main class="savings">
    <h1>Savings</h1>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

    <!-- New Goal -->
    <section class="new-goal card">
      <h2>Neues Sparziel</h2>

      <div class="row">
        <input v-model="newTitle" placeholder="Titel (z.B. Sommer-Festival-Reise)" />

        <select v-model="newCategory" class="select">
          <option v-for="o in CATEGORY_OPTIONS" :key="o.value" :value="o.value">
            {{ o.label }}
          </option>
        </select>

        <input
          v-model.number="newCurrent"
          type="number"
          min="0"
          step="0.01"
          placeholder="Schon gespart (€)"
        />

        <input
          v-model.number="newTarget"
          type="number"
          min="1"
          step="0.01"
          placeholder="Ziel (€)"
        />

        <button @click="addGoal" :disabled="!newTitle || newTarget <= 0">Anlegen</button>
      </div>
    </section>

    <!-- Goals -->
    <section class="goals">
      <article v-for="g in goals" :key="g.id ?? g.title" class="goal-card">
        <div class="top">
          <div class="left">
            <div class="icon">{{ iconForGoal(g) }}</div>
            <div class="title">{{ g.title }}</div>
          </div>

          <div class="amount">{{ formatEuro(g.currentAmount) }}</div>
        </div>

        <!-- Strich-Progressbar -->
        <div class="bar">
          <div class="bar-fill" :style="{ width: percent(g) + '%' }"></div>
        </div>

        <div class="bottom">
          <span>{{ formatEuro(0) }}</span>
          <span class="pct">{{ percent(g) }}%</span>
          <span>{{ formatEuro(g.targetAmount) }}</span>
        </div>

        <div class="actions">
          <button @click="addAmount(g, 10)">+10€</button>
          <button @click="addAmount(g, 50)">+50€</button>
          <button class="danger" @click="remove(g)">Löschen</button>
        </div>
      </article>

      <p v-if="goals.length === 0" class="empty">Noch keine Sparziele vorhanden.</p>
    </section>
  </main>
</template>

<style scoped>
.savings {
  width: 900px;
  padding: 2rem;
  font-family: "Apple Braille";
}
.error {
  color: red;
}

/* Cards */
.card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1rem;
}

/* New Goal Row */
.row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto; /* ⭐ mit Kategorie */
  gap: 0.75rem;
  align-items: center;
}

input,
.select {
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid #ddd;
  background: white;
}

button {
  padding: 0.8rem 1rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
}

.goals {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.goal-card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 18px;
  padding: 1rem;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  background: #eaf3ff;
  color: #1f6feb;
}

.title {
  font-size: 1.1rem;
}

.amount {
  font-weight: 700;
  color: #1f6feb;
}

/* Strich-Bar */
.bar {
  margin: 0.75rem 0 0.4rem;
  height: 16px;
  border-radius: 999px;
  background: repeating-linear-gradient(
    90deg,
    #d6e9ff 0px,
    #d6e9ff 3px,
    transparent 3px,
    transparent 7px
  );
  overflow: hidden;
  position: relative;
}

.bar-fill {
  height: 100%;
  border-radius: 999px;
  background: repeating-linear-gradient(
    90deg,
    #4ea1ff 0px,
    #4ea1ff 3px,
    transparent 3px,
    transparent 7px
  );
}

.bottom {
  display: flex;
  justify-content: space-between;
  font-size: 0.95rem;
  color: #4b5563;
}

.pct {
  color: #111;
  font-weight: 600;
}

.actions {
  margin-top: 0.75rem;
  display: flex;
  gap: 0.5rem;
}

.danger {
  background: #ffe3e3;
}

.empty {
  color: #666;
}

/* Responsive */
@media (max-width: 980px) {
  .savings {
    width: 100%;
  }

  .row {
    grid-template-columns: 1fr;
  }
}
</style>
