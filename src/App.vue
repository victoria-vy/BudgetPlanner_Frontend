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


