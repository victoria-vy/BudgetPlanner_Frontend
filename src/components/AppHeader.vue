<script setup lang="ts">
import logo from '@/assets/Logo.png'
import account from '@/assets/Account.png'
</script>

<template>
  <header class="header">
    <nav class="header-menu">

      <!-- Log -->
      <div class="header-left">
        <RouterLink to="/home" class="logo-link">
          <img :src="logo" alt="Logo" class="logo" />
        </RouterLink>
      </div>

      <!-- Navigation -->
      <div class="header-center">
        <RouterLink to="/home">Home</RouterLink>
        <RouterLink to="/Budget">Budgets</RouterLink>
        <RouterLink to="/expenses">Expenses</RouterLink>
        <RouterLink to="/income">Income</RouterLink>
        <RouterLink to="/stocks">Stocks</RouterLink>
        <RouterLink to="/saving">Savings</RouterLink>
        <RouterLink to="/report">Report</RouterLink>
      </div>

      <!-- Account -->
      <div class="header-right">
        <RouterLink to="/account" class="account-link">
          <img :src="account" alt="Account" class="account-icon" />
        </RouterLink>
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
}

/* Links allgemein */
.header-menu a {
  color: #244a22;
  font-size: 1.2rem;
  text-decoration: none;
  padding-bottom: 6px;
  transition: color 0.2s ease;
}

/* Hover */
.header-menu a:hover {
  color: #4f8a4c;
}

/* Aktiver Link */
.header-menu a.router-link-exact-active {
  border-bottom: 3px solid #244a22;
  font-weight: 600;
}

/* Logo */
.header-left {
  justify-self: start;
}

.logo-link {
  border-bottom: none !important;
}

.logo {
  height: 100px;
}

/* Navigation Mitte */
.header-center {
  justify-self: center;
  display: flex;
  gap: 3rem;
}

/* Rechts */
.header-right {
  justify-self: end;
}

.account-link {
  display: flex;
  align-items: center;
}

.account-icon {
  width: 50px;
  height: 50px;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.account-icon:hover {
  transform: scale(1.10);
  opacity: 0.85;
}

.logo:hover {
  transform: scale(1.10);
  opacity: 0.85;
}
</style>
