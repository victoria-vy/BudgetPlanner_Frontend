<script setup lang="ts"></script>

<template>
  <main>
    <section class="feature-grid">
      <!-- Kachel 1 -->
      <div class="feature-card">
        <h2>Sign up</h2>
        <p>Platzhalter</p>
      </div>

      <!-- Kachel 2 -->
      <div class="feature-card">
        <h2>Log in</h2>
        <p>Platzhalter</p>
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

  max-width: 900px;
  margin: 0 auto;
}

/* Einzelne Kachel */
.feature-card {
  background-color: #ffffff;
  border: 2px solid #a3a3a3;
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
  font-family: "Apple Braille";
}

/* Beschreibung */
.feature-card p {
  margin: 1rem 0;
  font-size: 1rem;
  color: #333;
  font-family: "Apple Braille";
}
</style>
