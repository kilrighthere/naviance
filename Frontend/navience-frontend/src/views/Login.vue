<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const showPassword = ref(false)

const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  if (!email.value || !password.value) {
    authStore.authError = "Username dan password wajib diisi"
    return
  }
  try {
    await authStore.login(
      email.value,
      password.value
    )

    router.push('/')
  } catch (error: any) {
    return
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

</script>

<template>
  <div>
    <h1>Login</h1>
    <form @submit.prevent="handleLogin">
      <input
        v-model="email"
        type="email"
        placeholder="Email"
      />

      <input
        v-model="password"
        :type="showPassword ? 'text' : 'password'"
        placeholder="Password"
      />
      <button
        v-if="password"
        type="button"
        @click="togglePasswordVisibility"
        class="password-toggle"
        tabindex="-1"
      >*</button>
      <button type="submit">
        Login
      </button>
      <p v-if="authStore.authError" class="error-message">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        {{ authStore.authError }}
      </p>
    </form>
  </div>
</template>