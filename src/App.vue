<script setup lang="ts">
import AppHeader from './components/AppHeader.vue';
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
  <div class="app-layout">
    <AppHeader />

    <main class="app-content">
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>

<style>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-content {
  flex: 1;
  display: flex;
  justify-content: center;
}
</style>


