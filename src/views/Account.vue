<script setup lang="ts">
  import { ref } from "vue";

  /* Log In */
  const loginEmail = ref("");
  const loginPassword = ref("");

  /* Sign Up */
  const signupName = ref("");
  const signupEmail = ref("");
  const signupPassword = ref("");

  const handleLogin = () => {
    console.log("Login:", loginEmail.value, loginPassword.value);
  };

  const handleSignup = () => {
    console.log("Signup:", signupName.value, signupEmail.value, signupPassword.value);
  };
</script>

<template>
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
  border: 2px solid #000;
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
  color: #000000;
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
