<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { setToken, clearToken, isLoggedIn } from "@/service/authService";
import { useRouter } from "vue-router";

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;

const loginEmail = ref("");
const loginPassword = ref("");

const signupName = ref("");
const signupEmail = ref("");
const signupPassword = ref("");

const loggedIn = computed(() => isLoggedIn());

const router = useRouter();

//Warnung wird immer angezeigt
const showLoginHint = ref(true);

//einfache E-Mail-Validierung
function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

function getErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e !== null && "message" in e) {
    const msg = (e as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  if (typeof e === "string") return e;
  return "Fehler";
}

type RegisterErrorBody =
  | { message?: string; error?: string; details?: string }
  | string
  | null;

onMounted(() => {
  if (isLoggedIn()) router.replace("/ProfileView");
});

async function handleLogin() {
  try {
    // Frontend Validation
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

    const data: unknown = await res.json();

    const token =
      typeof data === "object" && data !== null && "token" in data
        ? (data as { token?: unknown }).token
        : undefined;

    if (typeof token !== "string" || !token) {
      alert("Login fehlgeschlagen: Ungültige Server-Antwort (token fehlt)");
      return;
    }

    setToken(token);
    alert("Login erfolgreich");
    await router.push("/ProfileView");
  } catch (e: unknown) {
    console.error(e);
    alert(`Login fehlgeschlagen: ${getErrorMessage(e)}`);
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
    let body: RegisterErrorBody = null;

    if (contentType.includes("application/json")) {
      body = (await res.json().catch(() => null)) as RegisterErrorBody;
    } else {
      body = await res.text().catch(() => "");
    }

    if (!res.ok) {
      const msg =
        (typeof body === "object" && body !== null && "message" in body && typeof body.message === "string"
          ? body.message
          : "") ||
        (typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
          ? body.error
          : "") ||
        (typeof body === "object" && body !== null && "details" in body && typeof body.details === "string"
          ? body.details
          : "") ||
        (typeof body === "string" ? body : "") ||
        "Unbekannter Fehler";

      alert(`Registrierung fehlgeschlagen (${res.status}): ${msg}`);
      return;
    }


  } catch (e: unknown) {
    console.error("REGISTER ERROR", e);
    alert(`Registrierung fehlgeschlagen (Netzwerk/CORS/Server nicht erreichbar): ${getErrorMessage(e)}`);
  }
}

function handleLogout() {
  clearToken();
}
</script>

<template>
  <main class="account">
    <header class="page-head">
      <h1>Account</h1>
      <p class="sub">Login & Registrierung</p>
    </header>

    <p v-if="showLoginHint" class="logged-in warning">
      Bitte logge dich ein, um die anderen Funktionen zu nutzen.
    </p>

    <p v-if="loggedIn" class="logged-in">
      Du bist aktuell eingeloggt.
    </p>

    <section class="grid">
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


          <button class="btn primary" data-testid="login-button" @click="handleLogin">
            Log In
          </button>

          <button v-if="loggedIn" class="btn ghost" @click="handleLogout">
            Logout
          </button>

          <p class="hint">
            Info: Nachdem du dich erfolgreich eingeloggt hast, kannst du in den Profileinstellungen deine E-Mail ändern.
          </p>
      </div>

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
          Info: Wenn die Registrierung klappt, kannst du dich direkt mit denselben Daten einloggen.
        </p>
      </div>
    </section>
  </main>
</template>

<style scoped>
.account {
  width: 900px;
  padding: 2rem;
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
  background: #a7dd91;
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
