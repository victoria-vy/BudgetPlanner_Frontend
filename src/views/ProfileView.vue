<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { authHeader, clearToken, setToken } from "@/service/authService";
import { useRouter } from "vue-router";

const baseUrl = import.meta.env.VITE_BACKEND_BASE_URL;
const router = useRouter();

const currentName = ref("");
const currentEmail = ref("");

const newEmail = ref("");
const currentPassword = ref("");

const loading = ref(false);

// einfache E-Mail-Validierung
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

// Typen für Responses
type UpdateEmailResponse = { token: string; email: string; message?: string; error?: string } | string | null;

const trimmedNewEmail = computed(() => newEmail.value.trim());
const emailIsValid = computed(() => isValidEmail(trimmedNewEmail.value));
const showEmailInvalidHint = computed(() => trimmedNewEmail.value.length > 0 && !emailIsValid.value);

const saveDisabled = computed(() => {
  return (
    loading.value ||
    !emailIsValid.value ||
    !currentPassword.value.trim() ||
    trimmedNewEmail.value.length === 0 ||
    trimmedNewEmail.value === currentEmail.value // optional: nichts geändert
  );
});

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

  const data: unknown = await res.json();

  const name =
    typeof data === "object" && data !== null && "name" in data ? (data as { name?: unknown }).name : undefined;
  const email =
    typeof data === "object" && data !== null && "email" in data ? (data as { email?: unknown }).email : undefined;

  if (typeof name !== "string" || typeof email !== "string") {
    clearToken();
    await router.push("/account");
    return;
  }

  currentName.value = name;
  currentEmail.value = email;
  newEmail.value = email;
}

async function updateEmail() {
  // Frontend-Validierung
  if (!emailIsValid.value) {
    alert("Bitte eine gültige E-Mail-Adresse eingeben.");
    return;
  }
  if (!currentPassword.value.trim()) {
    alert("Bitte aktuelles Passwort eingeben.");
    return;
  }
  if (trimmedNewEmail.value === currentEmail.value) {
    alert("Die neue E-Mail ist identisch mit der aktuellen.");
    return;
  }

  loading.value = true;
  try {
    const res = await fetch(`${baseUrl}/api/auth/me/email`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(),
      },
      body: JSON.stringify({
        newEmail: trimmedNewEmail.value,
        currentPassword: currentPassword.value,
      }),
    });

    const contentType = res.headers.get("content-type") || "";
    let body: UpdateEmailResponse = null;

    if (contentType.includes("application/json")) {
      body = (await res.json().catch(() => null)) as UpdateEmailResponse;
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
        (typeof body === "string" ? body : "") ||
        "Unbekannter Fehler";

      alert(`E-Mail ändern fehlgeschlagen (${res.status}): ${msg}`);
      return;
    }

    // Backend gibt neuen Token zurück
    if (typeof body !== "object" || body === null) {
      alert("E-Mail ändern fehlgeschlagen: Ungültige Server-Antwort");
      return;
    }

    const token = "token" in body ? (body as { token?: unknown }).token : undefined;
    const email = "email" in body ? (body as { email?: unknown }).email : undefined;

    if (typeof token !== "string" || typeof email !== "string") {
      alert("E-Mail ändern fehlgeschlagen: Ungültige Server-Antwort (token/email fehlt)");
      return;
    }

    setToken(token);
    currentEmail.value = email;
    newEmail.value = email;

    alert("E-Mail erfolgreich geändert");
    currentPassword.value = "";
  } catch (e: unknown) {
    console.error(e);
    alert(`Netzwerkfehler beim Speichern: ${getErrorMessage(e)}`);
  } finally {
    loading.value = false;
  }
}

function logout() {
  clearToken();
  router.push("/AccountView");
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

        <p class="label">Name</p>
        <input class="input" :value="currentName" disabled />

        <p class="label">Aktuelle E-Mail</p>
        <input class="input" :value="currentEmail" disabled />

        <div>
          <button class="btn logout" @click="logout">Logout</button>
        </div>

        <p class="hint">
          Hinweis: Wenn du dich ausloggst, kannst du die Funktionen nicht mehr nutzen.
        </p>
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

        <!-- Meldung wenn ungültig -->
        <p v-if="showEmailInvalidHint" class="validation">
          Bitte gib eine gültige E-Mail-Adresse ein.
        </p>

        <label class="label">Aktuelles Passwort</label>
        <input
          class="input"
          type="password"
          placeholder="••••••••"
          v-model="currentPassword"
        />

        <div>
          <button class="btn primary" @click="updateEmail" :disabled="saveDisabled">
            {{ loading ? "Speichern..." : "Speichern" }}
          </button>
        </div>

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

.btn {
  border: none;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  cursor: pointer;
  font-size: 1.05rem;
  width: 100%;

  min-height: 47px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout {
  background: #ffd2d2;
  color: #000;
}

.logout:hover {
  background: #ffd2d2;
  color: white;
}

.primary {
  background: #b4dda5;
  color: #000;
}

.primary:hover {
  background: #a7dd91;
  color: white;
}

.hint {
  margin-top: 0rem;
  color: #6b7280;
  font-size: 0.95rem;
}

/* Validierungs-Meldung */
.validation {
  margin: 0.25rem 0 0.5rem;
  padding: 0.6rem 0.85rem;
  border-radius: 12px;
  border: 1px solid #fed7aa;
  background: #fff7ed;
  color: #9a3412;
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
