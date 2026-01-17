<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import type { Income, IncomeCategory } from "@/models/Income";
import { getIncome, createIncome, deleteIncome } from "@/service/incomeService";

const items = ref<Income[]>([]);
const errorMsg = ref("");

const title = ref("");
const category = ref<IncomeCategory>("SALARY");

// Betrag als Text für freie Eingabe + Placeholder
const amountText = ref<string>("");

// Presets fürs Dropdown (anpassbar)
const amountPresets = [50, 100, 250, 500, 1000, 2000];

// Dropdown State
const catOpen = ref(false);
const amountOpen = ref(false);

function closeAll() {
  catOpen.value = false;
  amountOpen.value = false;
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
    items.value = await getIncome();
  } catch (e: unknown) {
    if (e instanceof Error) errorMsg.value = e.message;
    else errorMsg.value = "Fehler";
  }
}

// Parse Betrag (akzeptiert Komma)
const amountNumber = computed(() => {
  const raw = amountText.value.trim().replace(",", ".");
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
});

const canCreate = computed(() => title.value.trim() !== "" && amountNumber.value > 0);

function sanitizeAmountInput() {
  amountText.value = amountText.value.replace(/[^\d.,]/g, "");
}

function setPresetAmount(v: number) {
  amountText.value = String(v);
  amountOpen.value = false;
}

function iconForCategory(cat: IncomeCategory) {
  switch (cat) {
    case "SALARY": return "💼";
    case "SIDE": return "🧾";
    case "GIFT": return "🎁";
    case "OTHER": return "💰";
    default: return "💰";
  }
}

function labelForCategory(cat: IncomeCategory) {
  switch (cat) {
    case "SALARY": return "Gehalt";
    case "SIDE": return "Nebenjob";
    case "GIFT": return "Geschenk";
    case "OTHER": return "Sonstiges";
    default: return "Sonstiges";
  }
}

async function add() {
  errorMsg.value = "";
  try {
    const created = await createIncome({
      title: title.value,
      amount: amountNumber.value,
      category: category.value,
    });

    items.value.unshift(created);

    title.value = "";
    amountText.value = "";
    category.value = "SALARY";
    closeAll();
  } catch (e: unknown) {
    if (e instanceof Error) errorMsg.value = e.message;
    else errorMsg.value = "Fehler beim Speichern";
  }
}

async function remove(id?: number) {
  if (!id) return;
  await deleteIncome(id);
  items.value = items.value.filter((i) => i.id !== id);
}
</script>

<template>
  <main class="page">
    <h1>Income</h1>

    <p v-if="errorMsg" class="error">{{ errorMsg }}</p>

    <section class="card">
      <h2>Neue Einnahme eintragen: </h2>

      <div class="row">
        <input v-model="title" placeholder="Titel (z.B. Gehalt)" />

        <!-- Betrag: editierbar + Dropdown Presets -->
        <div class="dd">
          <div class="combo">
            <input
              v-model="amountText"
              class="combo-input"
              inputmode="decimal"
              placeholder="Betrag (€)"
              @input="sanitizeAmountInput"
              @focus="amountOpen = false"
            />
            <button
              class="combo-arrow"
              type="button"
              aria-label="Betrag auswählen"
              @click="amountOpen = !amountOpen; catOpen = false"
            >
              ▾
            </button>
          </div>

          <div v-if="amountOpen" class="dd-menu">
            <button
              v-for="p in amountPresets"
              :key="p"
              type="button"
              class="dd-item"
              @click="setPresetAmount(p)"
            >
              {{ p }} €
            </button>
          </div>
        </div>

        <div class="dd">
          <button
            class="field dd-btn"
            type="button"
            @click="catOpen = !catOpen; amountOpen = false"
          >
            <span class="dd-left">
              <span class="dd-icon">{{ iconForCategory(category) }}</span>
              <span>{{ labelForCategory(category) }}</span>
            </span>
            <span class="arrow">▾</span>
          </button>

          <div v-if="catOpen" class="dd-menu">
            <button type="button" class="dd-item" @click="category = 'SALARY'; catOpen = false">💼 Gehalt</button>
            <button type="button" class="dd-item" @click="category = 'SIDE'; catOpen = false">🧾 Nebenjob</button>
            <button type="button" class="dd-item" @click="category = 'GIFT'; catOpen = false">🎁 Geschenk</button>
            <button type="button" class="dd-item" @click="category = 'OTHER'; catOpen = false">💰 Sonstiges</button>
          </div>
        </div>

        <button class="add" @click="add" :disabled="!canCreate" data-testid="add-income">
          Anlegen
        </button>
      </div>
    </section>

    <section class="list">
      <article v-for="i in items" :key="i.id" class="item-card">
        <div class="left">
          <span class="icon">{{ iconForCategory(i.category) }}</span>
          <div>
            <div class="cat">{{ i.title }}</div>
            <!-- Kategorie Deutsch -->
            <small>
              {{ labelForCategory(i.category) }}
              <span v-if="i.date">• {{ i.date }}</span>
            </small>
          </div>
        </div>

        <div class="right">
          <strong class="plus">+ {{ i.amount }} €</strong>
          <button class="delete" @click="remove(i.id)" data-testid="delete-income">
            Löschen
          </button>
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
  grid-template-columns: 1.5fr 1fr 1fr auto;
  gap: 0.75rem;
  align-items: center;
}

/* Einheitliche Höhe */
input {
  height: 52px;
  padding: 0.8rem;
  border-radius: 12px;
  border: 1px solid #ddd;
  background: #fff;
  box-sizing: border-box;
}

/* Dropdown Wrapper */
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

/* Betrag Combo: Input + Pfeil */
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
  height: 52px;
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

.item-card {
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

.plus {
  color: #15803d;
}

.delete {
  background: #ffe3e3;
  color: #000000;
}

.delete:hover {
  background-color: #ffe3e3;
  color: white;
}

.add {
  color: #000000;
  background-color: #b4dda5;
}

.add:hover {
  color: white;
  background-color: #a7dd91;
}

.empty {
  color: #666;
}

@media (max-width: 980px) {
  .page {
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
