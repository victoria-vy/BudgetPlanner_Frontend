<script setup lang="ts">
import logo from '@/assets/Logo_mitSchrift.png'
</script>

<template>
  <header class="header">
    <!-- Obere Zeile -->
    <div class="header-top">
      <img :src="logo" alt="Logo BudgetPlaner">
      <h1>BudgetPlaner</h1>
    </div>

    <!-- Mitte -->
    <nav class="header-menu">
      <RouterLink to="/home">Home</RouterLink>
      <RouterLink to="/expenses">Expenses</RouterLink>
      <RouterLink to="/income">Income</RouterLink>
      <RouterLink to="/report">Report</RouterLink>
      <RouterLink to="/stocks">Stocks</RouterLink>
      <RouterLink to="/Saving">Saving</RouterLink>
      <RouterLink to="/account">Account</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.header {
  padding: 2rem 0;
  text-align: center;
  background-color: white;
}

/* Logo + Titel */
.header-top {
  font-family: "Apple Braille";
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0rem;
}

h1 {
  margin: 0;
  font-size: 2.5rem;
}

/* Menü mit Flexbox */
.header-menu {
  font-family: "Apple Braille";

  margin-top: 2rem;

  display: flex;
  justify-content: space-between; /* gleichmäßig */
  align-items: center;

  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
}

/* Links */
.header-menu a {
  text-decoration: none;
  color: #000;
  font-size: 1.2rem;
}

.header-menu a:hover {
  text-decoration: underline;
}
</style>
