<script setup lang="ts">
import { onMounted, ref, computed, onBeforeUnmount } from "vue";
import type { SavingsGoal, SavingsCategory } from "@/models/SavingsGoal";
import {
  createSavingsGoal,
  deleteSavingsGoal,
  getSavingsGoals,
  updateSavingsGoal,
} from "@/service/savingsService.ts";

const goals = ref<SavingsGoal[]>([]);
const errorMsg = ref("");

// ✅ statt number=0 -> leer starten
const newTitle = ref("");
const newTargetText = ref<string>("");
const newCurrentText = ref<string>("");
const newCategory = ref<SavingsCategory>("OTHER");

// Presets (anpassbar)
const currentPresets = [10, 25, 50, 100, 200, 500];
const targetPresets = [100, 250, 500, 1000, 2000, 5000, 10000];

// Dropdown state
const catOpen = ref(false);
const currentOpen = ref(false);
const targetOpen = ref(false);

function closeAll() {
  catOpen.value = false;
  currentOpen.value = false;
  targetOpen.value = false;
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
    goals.value = await getSavingsGoals();
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Fehler";
  }
}

function percent(goal: SavingsGoal) {
  if (goal.targetAmount <= 0) return 0;
  const p = (goal.currentAmount / goal.targetAmount) * 100;
  return Math.max(0, Math.min(100, Math.round(p)));
}

function formatEuro(v: number) {
  return (
    v.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + " €"
  );
}

// ✅ Emoji pro Kategorie
function iconForCategory(cat: SavingsCategory): string {
  switch (cat) {
    case "HOME": return "🏠";
    case "TRAVEL": return "✈️";
    case "CAR": return "🚗";
    case "EDUCATION": return "🎓";
    case "EMERGENCY": return "🛟";
    case "GIFTS": return "🎁";
    case "TECH": return "💻";
    case "OTHER": return "💰";
    default: return "💰";
  }
}

function labelForCategory(cat: SavingsCategory): string {
  switch (cat) {
    case "HOME": return "Wohnen";
    case "TRAVEL": return "Reise";
    case "CAR": return "Auto";
    case "EDUCATION": return "Bildung";
    case "EMERGENCY": return "Notgroschen";
    case "GIFTS": return "Geschenke";
    case "TECH": return "Technik";
    case "OTHER": return "Sonstiges";
    default: return "Sonstiges";
  }
}

// ✅ Parse (Komma erlaubt)
function parseEuro(text: string) {
  const raw = text.trim().replace(",", ".");
  if (!raw) return 0;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

const newCurrent = computed(() => parseEuro(newCurrentText.value));
const newTarget = computed(() => parseEuro(newTargetText.value));

function sanitizeEuroInput(which: "current" | "target") {
  if (which === "current") newCurrentText.value = newCurrentText.value.replace(/[^\d.,]/g, "");
  else newTargetText.value = newTargetText.value.replace(/[^\d.,]/g, "");
}

function setPreset(which: "current" | "target", v: number) {
  if (which === "current") {
    newCurrentText.value = String(v);
    currentOpen.value = false;
  } else {
    newTargetText.value = String(v);
    targetOpen.value = false;
  }
}

const canCreate = computed(() => {
  return newTitle.value.trim() !== "" && newTarget.value > 0;
});

async function addGoal() {
  errorMsg.value = "";
  try {
    const created = await createSavingsGoal({
      title: newTitle.value,
      targetAmount: newTarget.value,
      currentAmount: newCurrent.value,
      category: newCategory.value,
    });

    goals.value.unshift(created);

    newTitle.value = "";
    newTargetText.value = "";
    newCurrentText.value = "";
    newCategory.value = "OTHER";
    closeAll();
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Fehler beim Erstellen";
  }
}

async function addAmount(goal: SavingsGoal, delta: number) {
  if (!goal.id) return;

  const updated: SavingsGoal = {
    ...goal,
    currentAmount: Math.max(0, goal.currentAmount + delta),
  };

  try {
    const saved = await updateSavingsGoal(goal.id, updated);
    goals.value = goals.value.map((g) => (g.id === goal.id ? saved : g));
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Fehler beim Aktualisieren";
  }
}

async function remove(goal: SavingsGoal) {
  if (!goal.id) return;
  try {
    await deleteSavingsGoal(goal.id);
    goals.value = goals.value.filter((g) => g.id !== goal.id);
  } catch (e: any) {
    errorMsg.value = e?.message ?? "Fehler beim Löschen";
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

        <!-- ✅ Schon gespart: Combo -->
        <div class="dd">
          <div class="combo">
            <input
              v-model="newCurrentText"
              class="combo-input"
              inputmode="decimal"
              placeholder="Schon gespart (€)"
              @input="sanitizeEuroInput('current')"
              @focus="currentOpen = false"
            />
            <button
              class="combo-arrow"
              type="button"
              aria-label="Schon gespart auswählen"
              @click="currentOpen = !currentOpen; targetOpen = false; catOpen = false"
            >
              ▾
            </button>
          </div>

          <div v-if="currentOpen" class="dd-menu">
            <button
              v-for="p in currentPresets"
              :key="'c' + p"
              type="button"
              class="dd-item"
              @click="setPreset('current', p)"
            >
              {{ p }} €
            </button>
          </div>
        </div>

        <!-- ✅ Ziel: Combo -->
        <div class="dd">
          <div class="combo">
            <input
              v-model="newTargetText"
              class="combo-input"
              inputmode="decimal"
              placeholder="Ziel (€)"
              @input="sanitizeEuroInput('target')"
              @focus="targetOpen = false"
            />
            <button
              class="combo-arrow"
              type="button"
              aria-label="Ziel auswählen"
              @click="targetOpen = !targetOpen; currentOpen = false; catOpen = false"
            >
              ▾
            </button>
          </div>

          <div v-if="targetOpen" class="dd-menu">
            <button
              v-for="p in targetPresets"
              :key="'t' + p"
              type="button"
              class="dd-item"
              @click="setPreset('target', p)"
            >
              {{ p }} €
            </button>
          </div>
        </div>

        <!-- ✅ Kategorie: ganz rechts vor Button -->
        <div class="dd">
          <button
            class="field dd-btn"
            type="button"
            @click="catOpen = !catOpen; currentOpen = false; targetOpen = false"
          >
            <span class="dd-left">
              <span class="dd-icon">{{ iconForCategory(newCategory) }}</span>
              <span>{{ labelForCategory(newCategory) }}</span>
            </span>
            <span class="arrow">▾</span>
          </button>

          <div v-if="catOpen" class="dd-menu">
            <button type="button" class="dd-item" @click="newCategory = 'HOME'; catOpen = false">🏠 Wohnen</button>
            <button type="button" class="dd-item" @click="newCategory = 'TRAVEL'; catOpen = false">✈️ Reise</button>
            <button type="button" class="dd-item" @click="newCategory = 'CAR'; catOpen = false">🚗 Auto</button>
            <button type="button" class="dd-item" @click="newCategory = 'EDUCATION'; catOpen = false">🎓 Bildung</button>
            <button type="button" class="dd-item" @click="newCategory = 'EMERGENCY'; catOpen = false">🛟 Notgroschen</button>
            <button type="button" class="dd-item" @click="newCategory = 'GIFTS'; catOpen = false">🎁 Geschenke</button>
            <button type="button" class="dd-item" @click="newCategory = 'TECH'; catOpen = false">💻 Technik</button>
            <button type="button" class="dd-item" @click="newCategory = 'OTHER'; catOpen = false">💰 Sonstiges</button>
          </div>
        </div>

        <button @click="addGoal" :disabled="!canCreate">Anlegen</button>
      </div>
    </section>

    <!-- Goals -->
    <section class="goals">
      <article v-for="g in goals" :key="g.id ?? g.title" class="goal-card">
        <div class="top">
          <div class="left">
            <div class="icon">{{ iconForCategory(g.category) }}</div>
            <div class="title">{{ g.title }}</div>
          </div>

          <div class="amount">{{ formatEuro(g.currentAmount) }}</div>
        </div>

        <div class="bar">
          <div class="bar-fill" :style="{ width: percent(g) + '%' }"></div>
        </div>

        <div class="bottom">
          <span>{{ formatEuro(0) }}</span>
          <span class="pct">{{ percent(g) }}%</span>
          <span>{{ formatEuro(g.targetAmount) }}</span>
        </div>

        <div class="actions">
          <div class="actions-left">
            <button @click="addAmount(g, 10)">+10€</button>
            <button @click="addAmount(g, 50)">+50€</button>
          </div>

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

/* ✅ New Goal Row: Kategorie ganz rechts vor Button */
.row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
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

/* ✅ Combo: Input + Pfeil */
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
  display: grid;
  grid-template-columns: auto 1fr auto; /* links | frei | rechts */
  align-items: center;
}

.actions-left {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start; /* ganz links */
}

.danger {
  justify-self: end; /* ganz rechts */
  background-color: #ffe3e3;
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

  .actions {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .actions-left {
    justify-content: center;
  }

  .danger {
    justify-self: stretch;
  }
}
</style>
