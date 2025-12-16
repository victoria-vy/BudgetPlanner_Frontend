<script setup lang="ts">
import AppMenu from '@/components/AppMenu.vue'
</script>

<template>
  <header class = "app-header">
    <h1>Budget Planner</h1>
    <AppMenu/>
  </header>

  <main>
    <RouterView/>
  </main>
</template>

<style>
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background-color: #ffffff;
}
</style>

