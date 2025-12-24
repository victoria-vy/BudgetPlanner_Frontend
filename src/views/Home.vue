<script setup lang="ts">
import {useRouter} from 'vue-router'
const router = useRouter()
function goTo (route: string){
  router.push(route)
}
</script>

<template>
  <main class="home">

    <section class="feature-grid">

      <!-- Kachel 1 -->
      <div class="feature-card">
        <h2>Platzhalter</h2>
        <p>Platzhalter</p>
        <button @click="goTo('/budgets')">
          Öffnen
        </button>
      </div>

      <!-- Kachel 2 -->
      <div class="feature-card">
        <h2>Platzhalter</h2>
        <p>Platzhalter</p>
        <button @click="goTo('/expenses')">
          Öffnen
        </button>
      </div>

      <!-- Kachel 3 -->
      <div class="feature-card">
        <h2>Platzhalter</h2>
        <p>Platzhalter</p>
        <button @click="goTo('/stats')">
          Öffnen
        </button>
      </div>

      <!-- Kachel 4 -->
      <div class="feature-card">
        <h2>Platzhalter</h2>
        <p>Platzhalter</p>
        <button @click="goTo('/settings')">
          Öffnen
        </button>
      </div>
    </section>

    <!-- Inhaltsübersicht -->
    <section class="overview-box">
      <h2>Platzhalter</h2>
      <p>Kurze Inhaltsübersicht</p>
    </section>

  </main>
</template>

<style scoped>
.home {
padding: 3rem 4rem;
}

/* Grid */
.feature-grid {
display: grid;
grid-template-columns: repeat(2, 1fr);
gap: 2.5rem;

width: auto;
margin: 0 auto 3rem;
}

/* Einzelne Kachel */
.feature-card {
background-color: #d9d9d9;
border: 2px solid #000;
padding: 1.5rem;
height: 100px;

display: flex;
flex-direction: column;
justify-content: space-between;
}

/* Titel */
.feature-card h2 {
margin: 0;
font-size: 1.4rem;
}

/* Beschreibung */
.feature-card p {
margin: 0.5rem 0;
font-size: 1rem;
color: #333;
}

/* Button mittig */
.feature-card button {
align-self: center;   /* ⭐ mittig */
padding: 0.5rem 1.8rem;
border: none;
background-color: #000;
color: #fff;
cursor: pointer;
font-size: 1rem;
}

.feature-card button:hover {
opacity: 0.85;
}

/* 🔽 Platzhalter-Kasten unten */
.overview-box {
max-width: 1100px;   /* exakt wie Grid */
margin: 0 auto;
padding: 2rem;

background-color: #d9d9d9;
border: 2px solid #000;
height: 220px;
}
</style>
