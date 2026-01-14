<script setup lang="ts">
import { ref, onMounted } from "vue";
import { authHeader, clearToken, setToken } from "@/service/authService";
import { useRouter } from "vue-router";

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
const router = useRouter();

const currentName = ref("");
const currentEmail = ref("");

const newEmail = ref("");
const currentPassword = ref(""); // optionaler Sicherheits-Check (Backend prüft)

const loading = ref(false);

async function loadMe() {
  const res = await fetch(`${baseUrl}/api/auth/me`, {
    method: "GET",
    headers: { ...authHeader() },
  });

  if (!res.ok) {
    clearToken();
    await router.push("/account");
    return;
  }

  const data = await res.json();
  currentName.value = data.name;
  currentEmail.value = data.email;
  newEmail.value = data.email;
}

async function updateEmail() {
  loading.value = true;
  try {
    const res = await fetch(`${baseUrl}/api/auth/me/email`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      body: JSON.stringify({
        newEmail: newEmail.value,
        currentPassword: currentPassword.value,
      }),
    });

    const contentType = res.headers.get("content-type") || "";
    const body = contentType.includes("application/json")
      ? await res.json().catch(() => null)
      : await res.text().catch(() => "");

    if (!res.ok) {
      const msg =
        (body && body.message) ||
        (body && body.error) ||
        (typeof body === "string" ? body : "") ||
        "Unbekannter Fehler";
      alert(`E-Mail ändern fehlgeschlagen (${res.status}): ${msg}`);
      return;
    }

    // Backend gibt neuen Token zurück (weil subject=email geändert wurde)
    setToken(body.token);
    currentEmail.value = body.email;
    alert("E-Mail erfolgreich geändert");
    currentPassword.value = "";
  } catch (e) {
    console.error(e);
    alert("Netzwerkfehler beim Speichern");
  } finally {
    loading.value = false;
  }
}

function logout() {
  clearToken();
  router.push("/account");
}
onMounted(loadMe);
</script>

<template>
  <main class="account">
    <header class="page-head">
      <h1>Profileinstellungen</h1>
      <p class="sub">Profil verwalten</p>
    </header>

    <section class="grid">
      <div class="card">
        <h2>Dein Profil</h2>

        <p class="hint">Name</p>
        <input class="input" :value="currentName" disabled />

        <p class="hint">Aktuelle E-Mail</p>
        <input class="input" :value="currentEmail" disabled />

        <div class="actions">
          <button class="btn ghost" @click="logout">Logout</button>
        </div>
      </div>

      <div class="card">
        <h2>E-Mail ändern</h2>

        <label class="label">Neue E-Mail</label>
        <input
          class="input"
          type="email"
          placeholder="name@mail.de"
          v-model="newEmail"
        />

        <label class="label">Aktuelles Passwort</label>
        <input
          class="input"
          type="password"
          placeholder="••••••••"
          v-model="currentPassword"
        />

        <button class="btn primary" :disabled="loading" @click="updateEmail">
          {{ loading ? "Speichern..." : "Speichern" }}
        </button>

        <p class="hint">
          Hinweis: Nach E-Mail-Änderung bekommst du automatisch einen neuen Token.
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
  margin-top: 0.75rem;
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
