<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const isSubmitting = ref(false)

const authStore = useAuthStore()
const router = useRouter()

const handleLogin = async () => {
  if (!email.value || !password.value) {
    authStore.authError = 'Email dan kata sandi wajib diisi'
    return
  }

  isSubmitting.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch {
    // Error handled by auth store
  } finally {
    isSubmitting.value = false
  }
}

</script>

<template>
  <div class="auth-page">
    <!-- Logo / Branding -->
    <div class="auth-brand">
      <img src="/logo.png" alt="Naviance Logo" class="brand-icon-img" />
      <p class="brand-text">Navigate Your Finance</p>
    </div>

    <!-- Auth Card -->
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <h2 class="auth-title">Selamat Datang</h2>
        <p class="auth-subtitle">Masuk untuk melanjutkan ke dasbor Anda.</p>
      </div>

      <!-- Tab Switcher -->
      <div class="tab-switcher">
        <button id="tab-login" class="tab-btn active">Masuk</button>
        <button id="tab-register" class="tab-btn" @click="router.push('/register')">Daftar</button>
      </div>

      <!-- Error Alert -->
      <Transition name="alert">
        <div v-if="authStore.authError" class="error-alert">
          <span class="material-symbols-outlined error-icon">error</span>
          <span>{{ authStore.authError }}</span>
        </div>
      </Transition>

      <!-- Login Form -->
      <form class="auth-form" @submit.prevent="handleLogin">
        <!-- Email -->
        <div class="field-group">
          <label class="field-label" for="login-email">Email</label>
          <div class="input-wrapper">
            <span class="material-symbols-outlined input-icon">mail</span>
            <input
              id="login-email"
              v-model="email"
              type="email"
              class="auth-input"
              placeholder="nama@email.com"
              required
              autocomplete="email"
            />
          </div>
        </div>

        <!-- Password -->
        <div class="field-group">
          <div class="label-row">
            <label class="field-label" for="login-password">Kata Sandi</label>
            <a href="#" class="forgot-link">Lupa kata sandi?</a>
          </div>
          <div class="input-wrapper">
            <span class="material-symbols-outlined input-icon">lock</span>
            <input
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="auth-input has-toggle"
              placeholder="••••••••"
              required
              autocomplete="current-password"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
              tabindex="-1"
            >
              <span class="material-symbols-outlined" :class="{ 'icon-active': showPassword }">
                {{ showPassword ? 'visibility' : 'visibility_off' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Submit -->
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner"></span>
          <span v-else>Masuk</span>
          <span v-if="!isSubmitting" class="material-symbols-outlined submit-arrow">arrow_forward</span>
        </button>
      </form>

    </div>
  </div>
</template>

<style scoped>
/* ===== PAGE LAYOUT ===== */
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fbf8fa;
  color: #1b1b1d;
  padding: 16px;
  position: relative;
}

@media (min-width: 1024px) {
  .auth-page {
    padding: 40px;
  }
}

/* ===== BRANDING ===== */
.auth-brand {
  position: absolute;
  top: 32px;
  left: 32px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 30;
}

.brand-icon, .brand-icon-img {
  font-size: 36px;
  color: #fea619;
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
.brand-icon-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
}

.brand-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: #091426;
  letter-spacing: 0.02em;
}

/* ===== AUTH CARD ===== */
.auth-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(30, 41, 59, 0.05);
  border: 1px solid rgba(197, 198, 205, 0.3);
  padding: 32px;
}

@media (min-width: 1024px) {
  .auth-card {
    padding: 40px;
  }
}

/* ===== HEADER ===== */
.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.auth-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 28px;
  font-weight: 700;
  line-height: 36px;
  color: #091426;
  margin: 0 0 8px 0;
}

@media (min-width: 1024px) {
  .auth-title {
    font-size: 32px;
    line-height: 40px;
    letter-spacing: -0.01em;
  }
}

.auth-subtitle {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 24px;
  color: #45474c;
  margin: 0;
}

/* ===== TAB SWITCHER ===== */
.tab-switcher {
  display: flex;
  background: #eae7e9;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 32px;
}

.tab-btn {
  flex: 1;
  padding: 10px 0;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0.01em;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: #45474c;
}

.tab-btn:hover {
  color: #091426;
}

.tab-btn.active {
  background: #ffffff;
  color: #091426;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

/* ===== ERROR ALERT ===== */
.error-alert {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  line-height: 18px;
  font-weight: 500;
  background: #ffdad6;
  color: #93000a;
  border: 1px solid rgba(186, 26, 26, 0.15);
}

.error-icon {
  font-size: 18px;
  flex-shrink: 0;
}

/* ===== FORM ===== */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0.01em;
  color: #1b1b1d;
}

.label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-link {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: #091426;
  text-decoration: none;
}

.forgot-link:hover {
  text-decoration: underline;
}

/* ===== INPUT ===== */
.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 18px;
  color: rgba(69, 71, 76, 0.7);
  pointer-events: none;
  z-index: 1;
}

.auth-input {
  width: 100%;
  padding: 12px 16px 12px 40px;
  background: #fbf8fa;
  border: 1px solid #c5c6cd;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 24px;
  color: #1b1b1d;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.auth-input.has-toggle {
  padding-right: 44px;
}

.auth-input::placeholder {
  color: rgba(69, 71, 76, 0.5);
}

.auth-input:focus {
  border-color: #091426;
  box-shadow: 0 0 0 2px rgba(254, 166, 25, 0.4);
}

/* ===== PASSWORD TOGGLE ===== */
.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(69, 71, 76, 0.7);
  transition: color 0.15s;
}

.toggle-password:hover {
  color: #091426;
}

.toggle-password .material-symbols-outlined {
  font-size: 18px;
}

.toggle-password .icon-active {
  color: #091426;
}

/* ===== SUBMIT BUTTON ===== */
.submit-btn {
  width: 100%;
  padding: 14px 0;
  margin-top: 8px;
  background: #fea619;
  border: none;
  border-radius: 12px;
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  letter-spacing: 0.01em;
  color: #091426;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s, transform 0.1s, box-shadow 0.2s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.submit-btn:hover:not(:disabled) {
  background: rgba(254, 166, 25, 0.9);
  box-shadow: 0 4px 12px rgba(254, 166, 25, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-arrow {
  font-size: 16px;
  transition: transform 0.2s;
}

.submit-btn:hover:not(:disabled) .submit-arrow {
  transform: translateX(4px);
}

/* ===== SPINNER ===== */
.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(9, 20, 38, 0.2);
  border-top-color: #091426;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ===== TRANSITIONS ===== */
.alert-enter-active {
  animation: fadeInUp 0.25s ease-out;
}

.alert-leave-active {
  animation: fadeOutUp 0.15s ease-in;
}

@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeOutUp {
  from { opacity: 1; transform: translateY(0); }
  to { opacity: 0; transform: translateY(-5px); }
}

/* ===== MATERIAL SYMBOLS ===== */
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
</style>