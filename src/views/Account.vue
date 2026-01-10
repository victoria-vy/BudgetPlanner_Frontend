<script setup lang="ts">
import { ref, computed } from "vue";
import { setBasicAuth, clearBasicAuth, isLoggedIn } from "@/service/authService.ts";

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

// Log In
const loginEmail = ref("");
const loginPassword = ref("");

// Sign Up
const signupName = ref("");
const signupEmail = ref("");
const signupPassword = ref("");

const loggedIn = computed(() => isLoggedIn());

async function handleLogin() {
  try {
    // 1) Credentials speichern (Basic Auth)
    setBasicAuth(loginEmail.value, loginPassword.value);

    // 2) Test-Call auf protected endpoint, um zu prüfen ob creds stimmen
    const auth = localStorage.getItem("budgetplanner_basic_auth");
    const res = await fetch(`${baseUrl}/api/stocks`, {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!res.ok) {
      // creds falsch -> wieder löschen
      clearBasicAuth();
      alert("Login fehlgeschlagen (E-Mail/Passwort falsch?)");
      return;
    }

    alert("Login erfolgreich");
  } catch (e) {
    clearBasicAuth();
    console.error(e);
    alert("Login fehlgeschlagen");
  }
}

async function handleSignup() {
  try {
    const response = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: signupName.value,
        email: signupEmail.value,
        password: signupPassword.value,
      }),
    });

    if (!response.ok) {
      const msg = await response.text();
      alert(`Registrierung fehlgeschlagen: ${msg}`);
      return;
    }

    alert("Registrierung erfolgreich");
  } catch (error) {
    console.error("Signup error:", error);
    alert("Registrierung fehlgeschlagen");
  }
}

function handleLogout() {
  clearBasicAuth();
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

        <button class="primary-button" @click="handleLogin">
          Log In
        </button>

        <button v-if="loggedIn" class="secondary-button" @click="handleLogout">
          Logout
        </button>
      </div>

      <div class="feature-card">
        <h2>Sign Up</h2>

        <input type="text" placeholder="Vorname, Nachname" v-model="signupName" class="input-field" />
        <input type="email" placeholder="E-Mail" v-model="signupEmail" class="input-field" />
        <input type="password" placeholder="Passwort" v-model="signupPassword" class="input-field" />

        <button class="primary-button" @click="handleSignup">
          Sign Up
        </button>
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

.feature-card h2 {
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 1rem;
}

/* Input-Felder */
.input-field {
  background-color: #e4e4e4;
  color: #dadada;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1.1rem;
  font-family: "Apple Braille";
}

.input-field::placeholder {
  color: #000000;
}

/* Button */
.primary-button {
  margin-top: auto;
  background-color: #b4dda5;
  color: #000000;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1.2rem;
  cursor: pointer;
  font-family: "Apple Braille";
}

.secondary-button {
  background: #ddd;
  color: #000;
  border: none;
  border-radius: 12px;
  padding: 1rem;
  font-size: 1.1rem;
  cursor: pointer;
  font-family: "Apple Braille";
}

.primary-button:hover {
  background-color: #5c9644;
}
</style>
