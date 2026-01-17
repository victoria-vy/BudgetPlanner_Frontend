<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

import AppHeader from './components/AppHeader.vue'
import AppFooter from '@/components/AppFooter.vue'

const route = useRoute()
const showHeader = computed(() => !route.meta.hideHeader)
</script>


<template>
  <div class="app-layout">
    <AppHeader v-if = "showHeader" />

    <main class="app-content">
      <RouterView />
    </main>

    <AppFooter />
  </div>
</template>

<style>


:root {
  font-family: Arial;
  color: #244a22;
}

button, input, select, textarea {
  font-family: inherit;
  color: inherit;
}

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

.btn-add {
  background: #b4dda5;
  color: #000;
}

.btn-add:hover {
  background: #b4dda5;
  color: #fff;
}

.btn-delete {
  background: #f1a6a6;
  color: #000;
}

.btn-delete:hover {
  background: #f1a6a6;
  color: #fff;
}
</style>


