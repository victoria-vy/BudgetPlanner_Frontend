<script setup lang="ts">
import logo from '@/assets/Logo.png'
import account from '@/assets/Account.png'
</script>

<template>
  <header class="header">


      <nav class="header-menu">

        <div class="header-left">
          <img :src="logo" alt="Logo" class="logo" />
        </div>

        <div class="header-center">
          <RouterLink to="/home">Home</RouterLink>
          <RouterLink to="/Budget">Budget</RouterLink>
          <RouterLink to="/expenses">Expenses</RouterLink>
          <RouterLink to="/income">Income</RouterLink>
          <RouterLink to="/stocks">Stocks</RouterLink>
          <RouterLink to="/saving">Saving</RouterLink>
          <RouterLink to="/report">Report</RouterLink>
        </div>

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

.header-menu a {
  color: #244a22;
  font-size: 1.2rem;
  text-decoration: none;
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

.account-link {
  display: flex;
  align-items: center;
}

.account-icon {
  width: 55px;
  height: 55px;
  cursor: pointer;
  transition: transform 0.15s ease, opacity 0.15s ease;
}

.account-icon:hover {
  transform: scale(1.05);
  opacity: 0.85;
}

</style>
