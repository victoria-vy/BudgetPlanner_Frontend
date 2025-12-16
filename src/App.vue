<script setup lang="ts">
import AppMenu from '@/components/AppMenu.vue'
</script>

<template>
  <header class="app-header">
    <!-- Linke Seite: Titel -->
    <div class="header-left">
      <h1>Budget Planner</h1>
    </div>

    <!-- Rechte Seite: Menü + Icons -->
    <div class="header-center">
      <AppMenu/>
    </div>
  </header>

  <main>
    <RouterView/>
  </main>
</template>

<style>
.app-header {
display: flex;
justify-content: space-between; /* Titel links, Menü/Icons rechts */
align-items: center;           /* Alles vertikal zentrieren */
padding: 0 20px;
height: 60px;
background-color: #f8f8f8;
border-bottom: 1px solid #ddd;
}

.header-left h1 {
margin: 0;
font-size: 1.5rem;
}

.header-center{
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-right {
display: flex;
align-items: center;
gap: 20px; /* Abstand zwischen Menü und Icons */
}

.header-icons {
display: flex;
align-items: center;
gap: 10px; /* Abstand zwischen Logo und Login */
}

.icon {
width: 24px;
height: 24px;
cursor: pointer;
}
</style>


