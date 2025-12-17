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

  </main>
</template>

<style scoped>
.home {
  padding: 3rem 4rem;
}

/* Grid wie im Mockup */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 3rem;

  max-width: 900px;   /* ⭐ wichtig */
  margin: 0 auto;     /* zentrieren */
}


/* Einzelne Kachel */
.feature-card {
  background-color: #ffffff;
  border: 2px solid #000;
  padding: 2rem;
  min-height: 200px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

/* Titel */
.feature-card h2 {
  margin: 0;
  font-size: 1.5rem;
}

/* Beschreibung */
.feature-card p {
  margin: 1rem 0;
  font-size: 1rem;
  color: #333;
}

/* Button */
.feature-card button {
  align-self: flex-start;
  padding: 0.6rem 1.2rem;
  border: none;
  background-color: #000;
  color: #fff;
  cursor: pointer;
  font-size: 1rem;
}

.feature-card button:hover {
  opacity: 0.85;
}
</style>
