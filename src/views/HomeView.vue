<script setup lang="ts">
import { useRouter } from 'vue-router'
import logo from '@/assets/Logo.png'

const router = useRouter()

function goTo(route: string) {
  router.push(route)
}
</script>

<template>
  <main class="home">
    <section class="layout">
      <!-- Links: Mascot + Speech Bubble -->
      <div class="panel mascot-card">
        <div class="speech">
          <div class="speech-title">Hallo 👋</div>
          <p class="speech-text">
            Ich bin dein <strong>MoneyManager</strong>!<br />
            Ich helfe dir, deine Einnahmen, Ausgaben und Sparziele im Blick zu behalten.<br /><br />
            👉 Starte am besten mit <strong>Account</strong> (Login/Registrierung).
          </p>
        </div>

        <div class="mascot">
          <img :src="logo" alt="MoneyManager Logo" class="logo" />
        </div>
      </div>

      <div class="feature-list">
        <!-- Budget -->
        <article class="feature-card" role="button" tabindex="0" @click="goTo('/BudgetView')">
          <div class="feature-left">
            <div class="feature-icon">💼</div>
            <div>
              <div class="feature-title">Budgets</div>
              <p class="feature-desc">Erstelle monatliche Budgets, um deine Ausgaben zu kontrollieren.</p>
            </div>
          </div>
          <span class="cta">Öffnen</span>
        </article>

        <!-- Expenses -->
        <article class="feature-card" role="button" tabindex="0" @click="goTo('/expenses')">
          <div class="feature-left">
            <div class="feature-icon">🧾</div>
            <div>
              <div class="feature-title">Expenses</div>
              <p class="feature-desc">Trage Ausgaben ein und behalte deine Kosten im Blick.</p>
            </div>
          </div>
          <span class="cta">Öffnen</span>
        </article>

        <!-- Income -->
        <article class="feature-card" role="button" tabindex="0" @click="goTo('/income')">
          <div class="feature-left">
            <div class="feature-icon">💶</div>
            <div>
              <div class="feature-title">Income</div>
              <p class="feature-desc">Erfasse Einnahmen und sieh, wie viel dir wirklich bleibt.</p>
            </div>
          </div>
          <span class="cta">Öffnen</span>
        </article>

        <!-- Stocks -->
        <article class="feature-card" role="button" tabindex="0" @click="goTo('/stocks')">
          <div class="feature-left">
            <div class="feature-icon">📈</div>
            <div>
              <div class="feature-title">Stocks</div>
              <p class="feature-desc">Speichere Aktien und verwalte dein Portfolio.</p>
            </div>
          </div>
          <span class="cta">Öffnen</span>
        </article>

        <!-- Savings -->
        <article class="feature-card" role="button" tabindex="0" @click="goTo('/saving')">
          <div class="feature-left">
            <div class="feature-icon">🎯</div>
            <div>
              <div class="feature-title">Savings</div>
              <p class="feature-desc">Lege Sparziele an und verfolge deinen Fortschritt.</p>
            </div>
          </div>
          <span class="cta">Öffnen</span>
        </article>

        <!-- Report -->
        <article class="feature-card" role="button" tabindex="0" @click="goTo('/report')">
          <div class="feature-left">
            <div class="feature-icon">📊</div>
            <div>
              <div class="feature-title">Report</div>
              <p class="feature-desc">Sieh Auswertungen und erkenne, wo du sparen kannst.</p>
            </div>
          </div>
          <span class="cta">Öffnen</span>
        </article>

        <!-- Account -->
        <article class="feature-card" role="button" tabindex="0" @click="goTo('/AccountView')">
          <div class="feature-left">
            <div class="feature-icon">👤</div>
            <div>
              <div class="feature-title">Account</div>
              <p class="feature-desc">Login, Registrierung und später deine Profileinstellungen.</p>
            </div>
          </div>
          <span class="cta">Öffnen</span>
        </article>
      </div>
    </section>
  </main>
</template>

<style scoped>
*,
*::before,
*::after {
  box-sizing: border-box;
}

/* Seite zentriert */
.home {
  width: 100%;
  display: flex;
  justify-content: center; /* horizontal */
  align-items: center; /* vertikal */
  padding: 2.5rem 2rem;
}

/* Grid: beide Spalten gleich hoch */
.layout {
  width: 100%;
  max-width: 1100px;

  display: grid;
  grid-template-columns: 420px 1fr;
  gap: 2rem;

  align-items: stretch;
}

/* Gemeinsamer Panel-Look (links + rechts) */
.mascot-card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 18px;
  padding: 1.25rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);

  height: 100%;
}

/* Links: Inhalt sauber verteilen */
.mascot-card {
  display: flex;
  flex-direction: column;
}

/* Speech bubble */
.speech {
  background: #f7fbff;
  border: 1px solid #d6e9ff;
  border-radius: 16px;
  padding: 1rem 1rem 1.1rem;
  position: relative;
}

.speech::after {
  content: "";
  position: absolute;
  left: 34px;
  bottom: -10px;
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #f7fbff;
}

.speech::before {
  content: "";
  position: absolute;
  left: 33px;
  bottom: -11px;
  width: 0;
  height: 0;
  border-left: 11px solid transparent;
  border-right: 11px solid transparent;
  border-top: 11px solid #d6e9ff;
}

.speech-title {
  font-weight: 700;
  color: #1b2550;
  margin-bottom: 0.35rem;
}

.speech-text {
  margin: 0;
  color: #1b2550;
  line-height: 1.35;
}

/* Mascot area: nach unten drücken, damit Card voll genutzt wird */
.mascot {
  margin-top: 45px;
  height: 260px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.logo {
  width: 100%;
  max-width: 320px;
  height: auto;
  object-fit: contain;
}

.feature-list {
  display: flex;
  flex-direction: column;
  gap: 0.9rem;

  /* wenn viele Items: bleibt Panel-Höhe gleich, Liste scrollt */
  overflow: auto;
  padding-right: 0.25rem;
}

.feature-card {
  background: #ffffff;
  border: 1px solid #e5e5e5;
  border-radius: 18px;
  padding: 1rem;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.feature-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.10);
}

.feature-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.feature-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #eaf3ff;
  font-size: 1.2rem;
}

.feature-title {
  font-weight: 700;
}

.feature-desc {
  margin: 0.15rem 0 0;
  font-size: 0.95rem;
}

/* Öffnen-Badge */
.cta {
  padding: 0.55rem 0.9rem;
  border-radius: 12px;
  background: #b4dda5;
  font-weight: 700;
  white-space: nowrap;
}

.feature-card:hover .cta {
  background: #b4dda5;
  color: #fff;
}

/* Mobile */
@media (max-width: 980px) {
  .home {
    align-items: flex-start;
  }

  .layout {
    grid-template-columns: 1fr;
  }

  .mascot {
    height: 240px;
  }

  .feature-list {
    overflow: visible;
  }
}
</style>

