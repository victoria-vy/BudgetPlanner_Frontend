<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import { getBudgets, createBudget, deleteBudget } from "@/service/budgetService";
import type { Budget, BudgetCategory } from "@/models/Budget";

const budgets = ref<Budget[]>([]);
const errorMsg = ref("");

const title = ref("");

//UI-Eingabe (Monat, Jahr), Speicherung bleibt YYYY-MM
const monthText = ref("");

const category = ref<BudgetCategory>("FOOD");

// Limit: freie Eingabe + Dropdown Presets
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

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    const msg = (e as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  if (typeof e === "string") return e;
  return "Fehler";
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
  } catch (e: unknown) {
    errorMsg.value = getErrorMessage(e) ?? "Fehler beim Laden";
  }
}

/* ---------------- Monat Parser (UI -> YYYY-MM) ---------------- */

const monthNameToMM: Record<string, string> = {
  januar: "01",
  jan: "01",
  februar: "02",
  feb: "02",
  märz: "03",
  maerz: "03",
  mär: "03",
  april: "04",
  apr: "04",
  mai: "05",
  juni: "06",
  jun: "06",
  juli: "07",
  jul: "07",
  august: "08",
  aug: "08",
  september: "09",
  sep: "09",
  sept: "09",
  oktober: "10",
  okt: "10",
  november: "11",
  nov: "11",
  dezember: "12",
  dez: "12",
};

const mmToMonthName: Record<string, string> = {
  "01": "Januar",
  "02": "Februar",
  "03": "März",
  "04": "April",
  "05": "Mai",
  "06": "Juni",
  "07": "Juli",
  "08": "August",
  "09": "September",
  "10": "Oktober",
  "11": "November",
  "12": "Dezember",
};

function normalizeMonthInputToYYYYMM(input: string): string {
  const raw = input.trim();
  if (!raw) return "";

  // 1) Wenn User schon YYYY-MM eingibt
  const iso = raw.match(/^(\d{4})-(\d{1,2})$/);
  if (iso) {
    const [, y, mRaw] = iso;
    if (!y || !mRaw) return "";

    const m = mRaw.padStart(2, "0");
    const mi = Number(m);
    if (mi >= 1 && mi <= 12) return `${y}-${m}`;
    return "";
  }

  // 2) Komma optional: "Januar, 2026" -> "Januar 2026"
  const cleaned = raw.replace(/,/g, " ").replace(/\s+/g, " ").trim();

  // a) "01 2026" / "1 2026"
  const numFirst = cleaned.match(/^(\d{1,2})\s+(\d{4})$/);
  if (numFirst) {
    const [, mRaw, y] = numFirst;
    if (!mRaw || !y) return "";

    const m = mRaw.padStart(2, "0");
    const mi = Number(m);
    if (mi >= 1 && mi <= 12) return `${y}-${m}`;
  }

  // b) "2026 01" / "2026 1"
  const yearFirst = cleaned.match(/^(\d{4})\s+(\d{1,2})$/);
  if (yearFirst) {
    const [, y, mRaw] = yearFirst;
    if (!mRaw || !y) return "";

    const m = mRaw.padStart(2, "0");
    const mi = Number(m);
    if (mi >= 1 && mi <= 12) return `${y}-${m}`;
  }

  // c) Monatsname (de), z.B. "Januar 2026"
  const parts = cleaned.split(" ").filter(Boolean);
  if (parts.length >= 2) {
    const year = parts[parts.length - 1];
    if (!year || !/^\d{4}$/.test(year)) return "";

    const monthNameRaw = parts.slice(0, parts.length - 1).join(" ").toLowerCase();
    const monthName = monthNameRaw.replace(/\./g, "");

    const mm = monthNameToMM[monthName];
    if (mm) return `${year}-${mm}`;
  }

  return "";
}

function displayMonthYYYYMMToUser(yyyymm: string): string {
  const m = yyyymm.match(/^(\d{4})-(\d{2})$/);
  if (!m) return yyyymm;

  const [, y, mm] = m;
  if (!y || !mm) return yyyymm;

  return `${mmToMonthName[mm] ?? mm} ${y}`;
}

const month = computed(() => normalizeMonthInputToYYYYMM(monthText.value));

function normalizeMonthField() {
  const yyyymm = month.value;
  if (!yyyymm) return;
  monthText.value = displayMonthYYYYMMToUser(yyyymm);
}

// Parse Limit (akzeptiert Komma)
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
      month: month.value, // IMMER YYYY-MM in DB
      limitAmount: limitNumber.value,
      category: category.value,
    });

    budgets.value.unshift(created);

    title.value = "";
    monthText.value = "";
    limitText.value = "";
    category.value = "FOOD";
    closeAll();
  } catch (e: unknown) {
    errorMsg.value = getErrorMessage(e) ?? "Fehler beim Anlegen";
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

        <!-- Monat als "Monat, Jahr" (Komma egal), gespeichert als YYYY-MM -->
        <input
          v-model="monthText"
          placeholder="Monat, Jahr (z.B. Januar 2026)"
          @blur="normalizeMonthField"
        />

        <!-- Limit: Combo (Eingabe + Dropdown) -->
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

        <!-- Kategorie: Dropdown wie bisher -->
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
              <!-- Anzeige im UI: Monat Jahr -->
              <span>{{ displayMonthYYYYMMToUser(b.month) }}</span>
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

/* Limit Combo: Input + Pfeil */
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
