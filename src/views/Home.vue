<script setup lang="ts">
import {useRouter} from 'vue-router'
import logo from '@/assets/Logo.png'
const router = useRouter()
function goTo (route: string){
  router.push(route)
}
</script>

<template>
  <!-- TODO: Aussehen implementieren -->
  <main class="home">
    <section class="layout">
      <!-- Links: großes Logo-Feld -->
      <div class="logo-box">
        <img :src="logo" alt="Logo" class="logo" />
      </div>

      <!-- Rechts: Buttons -->
      <div class="button-column">
        <button class="nav-button" @click="goTo('/expenses')">Expenses</button>
        <button class="nav-button" @click="goTo('/income')">Income</button>
        <button class="nav-button" @click="goTo('/report')">Report</button>
        <button class="nav-button" @click="goTo('/stocks')">Stocks</button>
        <button class="nav-button" @click="goTo('/saving')">Savings</button>
        <button class="nav-button" @click="goTo('/account')">Account</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home {
  width: 100%;
  display: flex;
  justify-content: center;
  padding: 3rem 2rem;
  font-family: "Apple Braille";
}

/* Gesamt-Layout: 2 Spalten */
.layout {
  width: 100%;
  max-width: 1100px;

  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
}

/* Links: großer Block */
.logo-box {
  height: 500px;
  background: #ffffff;
  border: 2px solid #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.logo {
  max-width: 150%;
  max-height: 150%;
  object-fit: contain;
}

/* Rechts: Button-Spalte */
.button-column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding-top: 1rem;
}

.nav-button {
  width: 100%;
  padding: 1.4rem 1rem;

  background: #bcefbc;
  border: 2px solid #bcffbc;
  color: #244a22;

  font-size: 1.4rem;
  font-weight: 600;
  cursor: pointer;
  text-align: center;

  border-radius: 16px;
}

.nav-button:hover {
  filter: brightness(1.05);
}

@media (max-width: 900px) {
  .layout {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .logo-box {
    height: 360px;
  }
}
</style>
