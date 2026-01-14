<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { getBudgets, createBudget, deleteBudget } from "@/service/budgetService";
import type { Budget, BudgetCategory } from "@/models/Budget";

const budgets = ref<Budget[]>([]);
const errorMsg = ref("");

const title = ref("");
const month = ref("");
const category = ref<BudgetCategory>("FOOD");

// ✅ Limit: freie Eingabe + Dropdown Presets
const limitText = ref<string>("");
const limitPresets = [10, 20, 50, 100, 200, 500, 1000];

const catOpen = ref(false);
const limitOpen = ref(false);

function closeAll() {
  catOpen.value = false;
  limitOpen.value = false;
}

function onDocClick(e: MouseEvent) {
  const t = e.target as HTMLElement | null;
  if (!t) return;
  if (!t.closest(".dd")) closeAll();
}

onMounted(() => {
  load();
  document.addEventListener("click", onDocClick);
});
onBeforeUnmount(() => {
  document.removeEventListener("click", onDocClick);
});

async function load() {
  errorMsg.value = "";
  try {
    budgets.value = await getBudgets();
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Fehler beim Laden";
  }
}

// ✅ Parse Limit (akzeptiert Komma)
const limitNumber = computed(() => {
  const raw = limitText.value.trim().replace(",", ".");
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
});

const canCreate = computed(() => {
  return title.value.trim() !== "" && month.value.trim() !== "" && limitNumber.value > 0;
});

function sanitizeLimitInput() {
  limitText.value = limitText.value.replace(/[^\d.,]/g, "");
}

function setPresetLimit(v: number) {
  limitText.value = String(v);
  limitOpen.value = false;
}

async function addBudget() {
  errorMsg.value = "";
  try {
    const created = await createBudget({
      title: title.value,
      month: month.value,
      limitAmount: limitNumber.value,  // ✅ kommt aus Textfeld
      category: category.value,
    });

    budgets.value.unshift(created);

    title.value = "";
    month.value = "";
    limitText.value = "";
    category.value = "FOOD";
    closeAll();
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Fehler beim Anlegen";
  }
}

async function remove(id?: number) {
  if (!id) return;
  await deleteBudget(id);
  budgets.value = budgets.value.filter((b) => b.id !== id);
}

function iconForCategory(cat: BudgetCategory) {
  switch (cat) {
    case "FOOD": return "🍔";
    case "RENT": return "🏠";
    case "FUN": return "🎉";
    case "TRAVEL": return "✈️";
    case "TECH": return "💻";
    case "OTHER": return "💰";
    default: return "💰";
  }
}

function labelForCategory(cat: BudgetCategory) {
  switch (cat) {
    case "FOOD": return "Essen";
    case "RENT": return "Miete";
    case "FUN": return "Freizeit";
    case "TRAVEL": return "Reisen";
    case "TECH": return "Technik";
    case "OTHER": return "Sonstiges";
    default: return "Sonstiges";
  }
}

function displayTitle(b: Budget) {
  return b.title && b.title.trim() !== "" ? b.title : b.category;
}
</script>

<template>
  <main class="budgets">
    <h1>Budgets</h1>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

    <section class="card">
      <h2>Neues Budget</h2>

      <div class="row">
        <input v-model="title" placeholder="Titel (z.B. Wocheneinkauf)" />
        <input v-model="month" placeholder="Monat (YYYY-MM)" />

        <!-- ✅ Limit: Combo (Eingabe + Dropdown) -->
        <div class="dd">
          <div class="combo">
            <input
              v-model="limitText"
              class="combo-input"
              inputmode="decimal"
              placeholder="Limit (€)"
              @input="sanitizeLimitInput"
              @focus="limitOpen = false"
            />
            <button
              class="combo-arrow"
              type="button"
              aria-label="Limit auswählen"
              @click="limitOpen = !limitOpen; catOpen = false"
            >
              ▾
            </button>
          </div>

          <div v-if="limitOpen" class="dd-menu">
            <button
              v-for="p in limitPresets"
              :key="p"
              type="button"
              class="dd-item"
              @click="setPresetLimit(p)"
            >
              {{ p }} €
            </button>
          </div>
        </div>

        <!-- ✅ Kategorie: Dropdown wie bisher -->
        <div class="dd">
          <button
            class="field dd-btn"
            type="button"
            @click="catOpen = !catOpen; limitOpen = false"
          >
            <span class="dd-left">
              <span class="dd-icon">{{ iconForCategory(category) }}</span>
              <span>{{ labelForCategory(category) }}</span>
            </span>
            <span class="arrow">▾</span>
          </button>

          <div v-if="catOpen" class="dd-menu">
            <button type="button" class="dd-item" @click="category = 'FOOD'; catOpen = false">🍔 Essen</button>
            <button type="button" class="dd-item" @click="category = 'RENT'; catOpen = false">🏠 Miete</button>
            <button type="button" class="dd-item" @click="category = 'FUN'; catOpen = false">🎉 Freizeit</button>
            <button type="button" class="dd-item" @click="category = 'TRAVEL'; catOpen = false">✈️ Reisen</button>
            <button type="button" class="dd-item" @click="category = 'TECH'; catOpen = false">💻 Technik</button>
            <button type="button" class="dd-item" @click="category = 'OTHER'; catOpen = false">💰 Sonstiges</button>
          </div>
        </div>

        <button @click="addBudget" :disabled="!canCreate">Anlegen</button>
      </div>
    </section>

    <section class="list">
      <article v-for="b in budgets" :key="b.id" class="budget-card">
        <div class="left">
          <span class="icon">{{ iconForCategory(b.category) }}</span>

          <div>
            <div class="cat">{{ displayTitle(b) }}</div>

            <small class="meta">
              <span>{{ b.month }}</span>
              <span class="dot">•</span>
              <span class="small-cat">{{ labelForCategory(b.category) }}</span>
            </small>
          </div>
        </div>

        <div class="right">
          <strong>{{ b.limitAmount }} €</strong>
          <button class="danger" @click="remove(b.id)">Löschen</button>
        </div>
      </article>

      <p v-if="budgets.length === 0" class="empty">Noch keine Budgets angelegt.</p>
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

.card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 16px;
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.row {
  display: grid;
  grid-template-columns: 1.5fr 1.2fr 1fr 1fr auto;
  gap: 0.75rem;
  align-items: center;
}

/* Einheitliche Feldhöhe */
input {
  height: 52px;
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid #ddd;
  background: #fff;
  box-sizing: border-box;
}

.dd {
  position: relative;
  width: 100%;
}

/* Kategorie Button */
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

.dd-icon {
  width: 22px;
  height: 22px;
  display: grid;
  place-items: center;
}

.arrow {
  opacity: 0.8;
}

/* ✅ Limit Combo: Input + Pfeil */
.combo {
  height: 52px;
  display: grid;
  grid-template-columns: 1fr 44px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
}

.combo-input {
  height: 100%;
  border: none;
  outline: none;
  padding: 0.8rem;
  background: transparent;
}

.combo-arrow {
  height: 100%;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 1.1rem;
  opacity: 0.8;
}

.combo-arrow:hover {
  background: #f3f4f6;
}

/* Dropdown Menu */
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

.meta {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
}

.dot {
  opacity: 0.6;
}

.small-cat {
  opacity: 0.75;
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

@media (max-width: 980px) {
  .budgets {
    width: 100%;
  }
  .row {
    grid-template-columns: 1fr;
  }
  button {
    width: 100%;
  }
}
</style>
