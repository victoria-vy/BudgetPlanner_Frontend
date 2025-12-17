<script setup lang="ts">
</script>

<template>
  <footer class="footer">

    <nav class="footer-menu">
      <p class="copyright">© 2025 BudgetPlaner</p>
      <RouterLink to="/impressum">Impressum</RouterLink>
      <RouterLink to="/datenschutzerklärung">Datenschutzerklärung</RouterLink>
      <RouterLink to="/agb">AGB</RouterLink>
    </nav>



  </footer>
</template>

<style scoped>
.footer {
  display: flex;                 /* Flexbox aktivieren */
  justify-content: space-between; /* Menü links, Copyright rechts */
  align-items: center;           /* vertikal zentrieren */
  max-width: 900px;
  margin: 2rem auto 0;           /* oben Abstand, zentriert */
  font-family: "Apple Braille";
}

.footer-menu {
  display: flex;
  gap: 2rem;                     /* Abstand zwischen Links */
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
  margin: 0;                     /* verhindert unerwünschten Abstand */
  font-size: 0.9rem;
  color: #000000;
}

</style>
