<script setup lang="ts">
import { ref, computed } from "vue";
import { setToken, clearToken, isLoggedIn } from "@/service/authService.ts";

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

const loginEmail = ref("");
const loginPassword = ref("");

const signupName = ref("");
const signupEmail = ref("");
const signupPassword = ref("");

const loggedIn = computed(() => isLoggedIn());

async function handleLogin() {
  try {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: loginEmail.value,
        password: loginPassword.value,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      alert(`Login fehlgeschlagen: ${txt}`);
      return;
    }

    const data = await res.json(); // { token, name, email }
    setToken(data.token);
    alert("Login erfolgreich");

  } catch (e) {
    console.error(e);
    alert("Login fehlgeschlagen");
  }
}

async function handleSignup() {
  try {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: signupName.value,
        email: signupEmail.value,
        password: signupPassword.value,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      alert(`Registrierung fehlgeschlagen: ${txt}`);
      return;
    }

    alert("Registrierung erfolgreich");
  } catch (e) {
    console.error(e);
    alert("Registrierung fehlgeschlagen");
  }
}

function handleLogout() {
  clearToken();
  alert("Logout erfolgreich");
}
</script>

<template>
  <main>
    <section class="feature-grid">
      <div class="feature-card">
        <h2>Log In</h2>

        <input type="email" placeholder="E-Mail" v-model="loginEmail" class="input-field" />
        <input type="password" placeholder="Passwort" v-model="loginPassword" class="input-field" />

        <button class="primary-button" @click="handleLogin">Log In</button>

        <button v-if="loggedIn" class="secondary-button" @click="handleLogout">
          Logout
        </button>
      </div>

      <div class="feature-card">
        <h2>Sign Up</h2>

        <input type="text" placeholder="Vorname, Nachname" v-model="signupName" class="input-field" />
        <input type="email" placeholder="E-Mail" v-model="signupEmail" class="input-field" />
        <input type="password" placeholder="Passwort" v-model="signupPassword" class="input-field" />

        <button class="primary-button" @click="handleSignup">Sign Up</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 3rem;
  max-width: 900px;
  margin: 0 auto;
  font-family: "Apple Braille";
}
.feature-card {
  background-color: #ffffff;
  border: 2px solid #dadada;
  padding: 2.5rem;
  min-height: 450px;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.input-field {
  background-color: #e4e4e4;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1.1rem;
  font-family: "Apple Braille";
}
.primary-button {
  margin-top: auto;
  background-color: #b4dda5;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1.2rem;
  cursor: pointer;
  font-family: "Apple Braille";
}
.secondary-button {
  background: #ddd;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1.1rem;
  cursor: pointer;
  font-family: "Apple Braille";
}
</style>
