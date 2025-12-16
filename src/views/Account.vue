<script setup lang="ts"></script>

<template>
  <body>
  <form action="/register" method="post">
    <input type="text" name="username" placeholder="Benutzername">
    <input type="email" name="email" placeholder="E-Mail">
    <input type="password" name="password" placeholder="Passwort">
    <button type="submit">Registrieren</button>
  </form>
  </body>
</template>

<style scoped></style>
