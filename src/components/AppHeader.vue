<script setup lang="ts">
import logo from '@/assets/Logo.png'
</script>

<template>
  <header class="header">
    <!-- Mitte -->

      <nav class="header-menu">
        <!-- Links -->
        <div class="header-left">
          <img :src="logo" alt="Logo" class="logo" />
        </div>

        <!-- Mitte (zentriertes Menü) -->
        <div class="header-center">
          <RouterLink to="/home">Home</RouterLink>
          <RouterLink to="/expenses">Expenses</RouterLink>
          <RouterLink to="/income">Income</RouterLink>
          <RouterLink to="/report">Report</RouterLink>
          <RouterLink to="/stocks">Stocks</RouterLink>
          <RouterLink to="/saving">Saving</RouterLink>
        </div>

        <!-- Rechts (leer oder Account später) -->
        <div class="header-right">
          <RouterLink to="/account">Account</RouterLink>
        </div>
      </nav>

  </header>
</template>

<style scoped>
.header-menu {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;

  max-width: 1100px;
  margin: 0 auto;
  font-family: "Apple Braille";
}

.header-menu a {
  color: #244a22;
  font-size: 1.5rem;
  text-decoration: none;
}

.router-link-active {
  color: #356e33;
  border-bottom: 2px solid #356e33;
}

/* Links */
.header-left {
  justify-self: start;
}

.logo {
  height: 100px;
}

/* Mitte */
.header-center {
  justify-self: center;
  display: flex;
  gap: 3rem;
}

/* Rechts */
.header-right {
  justify-self: end;
}

</style>
