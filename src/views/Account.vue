<script setup lang="ts">
  import { ref } from "vue";

  /* Log In */
  const loginEmail = ref("");
  const loginPassword = ref("");

  /* Sign Up */
  const signupName = ref("");
  const signupEmail = ref("");
  const signupPassword = ref("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/login",{
      method: "POST",
        headers: {
        "Content-Type:":"application/json",
      },
      body: JSON.stringify({
        email: loginEmail.value,
        password: loginPassword.value,
      }),
      });

      const result = await response.text();
      alert(result);

    } catch(error){
      console.error("Login error:", error);
      alert("Anmeldung fehlgeschlagen");
    }
  };

  const handleSignup = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: signupName.value,
          email: signupEmail.value,
          password: signupPassword.value,
        }),
      });

      const result = await response.text();
      alert(result);
    } catch (error) {
      console.error("Signup error:", error);
      alert("Registrierung fehlgeschlagen");
    }
  };
</script>

<template>
  <!-- TODO: Backend einbinden, damit User gespeichert wird -->
  <main>
    <section class="feature-grid">
      <!-- Log In -->
      <div class="feature-card">
        <h2>Log In</h2>

        <input
          type="email"
          placeholder="E-Mail"
          v-model="loginEmail"
          class="input-field"
        />

        <input
          type="password"
          placeholder="Passwort"
          v-model="loginPassword"
          class="input-field"
        />

        <button class="primary-button" @click="handleLogin">
          Log In
        </button>
      </div>

      <!-- Sign Up -->
      <div class="feature-card">
        <h2>Sign Up</h2>

        <input
          type="text"
          placeholder="Vorname, Nachname"
          v-model="signupName"
          class="input-field"
        />

        <input
          type="email"
          placeholder="E-Mail"
          v-model="signupEmail"
          class="input-field"
        />

        <input
          type="password"
          placeholder="Passwort"
          v-model="signupPassword"
          class="input-field"
        />

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

.primary-button:hover {
  background-color: #5c9644;
}
</style>
