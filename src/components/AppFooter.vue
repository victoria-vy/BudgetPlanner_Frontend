<script setup lang="ts">
</script>

<template>
  <footer class="footer">

    <nav class="footer-menu">
      <p class="copyright">© 2025 MoneyManager</p>
      <RouterLink to="/impressum">Impressum</RouterLink>
      <RouterLink to="/datenschutzerklärung">Datenschutzerklärung</RouterLink>
      <RouterLink to="/agb">AGB</RouterLink>
    </nav>

  </footer>
</template>

<style scoped>
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 900px;
  margin: 2rem auto 0;
}

.footer-menu {
  display: flex;
  gap: 2rem;
}

.footer-menu a {
  color: darkblue;
  text-decoration: none;
  font-size: 1rem;
}

.footer-menu a:hover {
  color: navy;
}

.footer p {
  margin: 0;
  font-size: 0.9rem;
  color: #000000;
}

</style>
