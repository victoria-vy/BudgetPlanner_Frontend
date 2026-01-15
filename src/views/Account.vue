<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { setToken, clearToken, isLoggedIn } from "@/service/authService";
import { useRouter, useRoute } from "vue-router";

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

const loginEmail = ref("");
const loginPassword = ref("");

const signupName = ref("");
const signupEmail = ref("");
const signupPassword = ref("");

const loggedIn = computed(() => isLoggedIn());

const router = useRouter();
const route = useRoute();

// Wenn du die Warnung IMMER sehen willst:
const showLoginHint = ref(true);

// einfache E-Mail-Validierung (Frontend UX)
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

onMounted(() => {
  if (isLoggedIn()) router.replace("/Profile");

  // Falls du die Warnung doch nur bei Redirect willst, dann:
//  showLoginHint.value = route.query.reason === "login_required";
});

async function handleLogin() {
  try {
    // ✅ Frontend Validation
    if (!isValidEmail(loginEmail.value)) {
      alert("Bitte eine gültige E-Mail-Adresse eingeben.");
      return;
    }
    if (!loginPassword.value.trim()) {
      alert("Bitte Passwort eingeben.");
      return;
    }

    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: loginEmail.value.trim(),
        password: loginPassword.value,
      }),
    });

    if (!res.ok) {
      const txt = await res.text();
      alert(`Login fehlgeschlagen: ${txt}`);
      return;
    }

    const data = await res.json();
    setToken(data.token);
    alert("Login erfolgreich");
    await router.push("/Profile");
  } catch (e) {
    console.error(e);
    alert("Login fehlgeschlagen");
  }
}

async function handleSignup() {
  try {
    //Frontend Validation
    if (!signupName.value.trim()) {
      alert("Bitte Name eingeben.");
      return;
    }
    if (!isValidEmail(signupEmail.value)) {
      alert("Bitte eine gültige E-Mail-Adresse eingeben.");
      return;
    }
    if ((signupPassword.value ?? "").length < 6) {
      alert("Passwort muss mindestens 6 Zeichen haben.");
      return;
    }

    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: signupName.value.trim(),
        email: signupEmail.value.trim(),
        password: signupPassword.value,
      }),
    });

    const contentType = res.headers.get("content-type") || "";
    let body: any = null;

    if (contentType.includes("application/json")) {
      body = await res.json().catch(() => null);
    } else {
      body = await res.text().catch(() => "");
    }

    if (!res.ok) {
      const msg =
        (body && body.message) ||
        (body && body.error) ||
        (body && body.details) ||
        (typeof body === "string" ? body : "") ||
        "Unbekannter Fehler";

      alert(`Registrierung fehlgeschlagen (${res.status}): ${msg}`);
      return;
    }

    alert("Registrierung erfolgreich");
    // Optional: direkt in Login-Felder übernehmen
    loginEmail.value = signupEmail.value.trim();
    loginPassword.value = signupPassword.value;
  } catch (e) {
    console.error("REGISTER ERROR", e);
    alert("Registrierung fehlgeschlagen (Netzwerk/CORS/Server nicht erreichbar)");
  }
}

function handleLogout() {
  clearToken();
  alert("Logout erfolgreich");
}
</script>

<template>
  <main class="account">
    <header class="page-head">
      <h1>Account</h1>
      <p class="sub">Login & Registrierung</p>
    </header>

    <!-- Dauerhafte Warnung (wie du es wolltest) -->
    <p v-if="showLoginHint" class="logged-in warning">
      Bitte logge dich ein, um die anderen Funktionen zu nutzen.
    </p>

    <p v-if="loggedIn" class="logged-in">
      Du bist aktuell eingeloggt.
    </p>

    <section class="grid">
      <!-- Login -->
      <div class="card">
        <h2>Log In</h2>

        <label class="label">E-Mail</label>
        <input
          type="email"
          placeholder="name@mail.de"
          v-model="loginEmail"
          class="input"
          data-testid="login-email"
        />

        <label class="label">Passwort</label>
        <input
          type="password"
          placeholder="••••••••"
          v-model="loginPassword"
          class="input"
          data-testid="login-password"
        />

        <div class="actions">
          <button class="btn primary" data-testid="login-button" @click="handleLogin">
            Log In
          </button>

          <button v-if="loggedIn" class="btn ghost" @click="handleLogout">
            Logout
          </button>
        </div>
      </div>

      <!-- Signup -->
      <div class="card">
        <h2>Sign Up</h2>

        <label class="label">Name</label>
        <input
          type="text"
          placeholder="Vorname Nachname"
          v-model="signupName"
          class="input"
          data-testid="signup-name"
        />

        <label class="label">E-Mail</label>
        <input
          type="email"
          placeholder="name@mail.de"
          v-model="signupEmail"
          class="input"
          data-testid="signup-email"
        />

        <label class="label">Passwort</label>
        <input
          type="password"
          placeholder="Mind. 6 Zeichen"
          v-model="signupPassword"
          class="input"
          data-testid="signup-password"
        />

        <button class="btn primary" data-testid="signup-button" @click="handleSignup">
          Sign Up
        </button>

        <p class="hint">
          Tipp: Wenn die Registrierung klappt, kannst du dich direkt mit denselben Daten einloggen.
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.account {
  width: 900px;
  padding: 2rem;
  font-family: "Apple Braille";
}

.page-head {
  margin-bottom: 1rem;
}

.page-head h1 {
  margin: 0;
}

.sub {
  margin: 0.25rem 0 0;
  color: #4b5563;
}

.logged-in {
  margin: 0.75rem 0 1.25rem;
  padding: 0.75rem 1rem;
  border-radius: 14px;
  border: 1px solid #e5e5e5;
  background: #f7fbff;
  color: #083a4b;
}

.warning {
  background: #fff7ed;
  border-color: #fed7aa;
  color: #9a3412;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1.25rem;
}

.card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 18px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.card h2 {
  margin: 0 0 1rem;
}

.label {
  display: block;
  margin: 0.5rem 0 0.25rem;
  color: #374151;
  font-size: 0.95rem;
}

.input {
  width: 100%;
  max-width: 100%;
  padding: 0.85rem;
  border-radius: 12px;
  border: 1px solid #ddd;
  background: #fff;
  font-size: 1rem;
}

.input:focus {
  outline: none;
  border-color: #9cc8ff;
}

.actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
  align-items: center;
}

.btn {
  border: none;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  cursor: pointer;
  font-size: 1.05rem;
}

.primary {
  background: #b4dda5;
  color: #000;
}

.primary:hover {
  background: #5c9644;
  color: white;
}

.ghost {
  background: #f1f1f1;
}

.ghost:hover {
  background: #e6e6e6;
}

.hint {
  margin-top: 1rem;
  color: #6b7280;
  font-size: 0.95rem;
}

@media (max-width: 980px) {
  .account {
    width: 100%;
  }
  .grid {
    grid-template-columns: 1fr;
  }
}

*,
*::before,
*::after {
  box-sizing: border-box;
}
</style>
