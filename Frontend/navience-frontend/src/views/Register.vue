<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/stores/auth";

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const fullName = ref('')

const showPassword = ref(false)
const auth = useAuthStore()
const router = useRouter()

const handleRegist = async () => {
  if (!email.value || !password.value || !confirmPassword.value || !fullName.value) {
    auth.authError = "Lengkapi data untuk melakukan mendaftar"
    return
  }

  if (password.value !== confirmPassword.value) {
    auth.authError = "Password tidak sama, mohon periksa ulang"
    return
  }

  try {
    await auth.register(
      email.value,
      password.value,
      { nama_lengkap: fullName.value }
    )
    router.push('/login')
  } catch (error) {
    return
  }
}

function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

</script>

<template>
    <div class="container">
        <div class="header">
            <h1>Register</h1>
            <form @submit.prevent="handleRegist" method="post">
                <input type="email" v-model="email" placeholder="email">
                <input type="text" v-model="fullName" placeholder="nama lengkap">
                <input :type="showPassword ? 'text' : 'password'" v-model="password" placeholder="password">
                <input :type="showPassword ? 'text' : 'password'" v-model="confirmPassword" placeholder="confirm password">
                <button type="submit">Daftar</button>
            </form>
            <p class="error-message" v-if="auth.authError">{{ auth.authError }}</p>
        </div>
    </div>
</template>