<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const fullName = ref('')

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isSubmitting = ref(false)
const registerSuccess = ref(false)

const auth = useAuthStore()
const router = useRouter()

const handleRegist = async () => {
  if (!fullName.value || !email.value || !password.value || !confirmPassword.value) {
    auth.authError = 'Lengkapi semua data untuk mendaftar'
    return
  }

  if (password.value.length < 8) {
    auth.authError = 'Kata sandi minimal 8 karakter'
    return
  }

  if (password.value !== confirmPassword.value) {
    auth.authError = 'Kata sandi tidak cocok, mohon periksa ulang'
    return
  }

  isSubmitting.value = true
  try {
    await auth.register(email.value, password.value, {
      nama_lengkap: fullName.value
    })
    registerSuccess.value = true
    auth.authError = null
    // Clear form
    fullName.value = ''
    email.value = ''
    password.value = ''
    confirmPassword.value = ''
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
      <span class="material-symbols-outlined brand-icon">account_balance</span>
      <p class="brand-text">Navigate Your Finance</p>
    </div>

    <!-- Auth Card -->
    <div class="auth-card">
      <!-- Header -->
      <div class="auth-header">
        <h2 class="auth-title">Mulai Perjalanan Anda</h2>
        <p class="auth-subtitle">Buat akun Naviance untuk mulai mengelola keuangan.</p>
      </div>

      <!-- Tab Switcher -->
      <div class="tab-switcher">
        <button id="tab-login" class="tab-btn" @click="router.push('/login')">Masuk</button>
        <button id="tab-register" class="tab-btn active">Daftar</button>
      </div>

      <!-- Error Alert -->
      <Transition name="alert">
        <div v-if="auth.authError" class="error-alert">
          <span class="material-symbols-outlined error-icon">error</span>
          <span>{{ auth.authError }}</span>
        </div>
      </Transition>

      <!-- Success Alert -->
      <Transition name="alert">
        <div v-if="registerSuccess" class="success-alert">
          <span class="material-symbols-outlined success-icon">check_circle</span>
          <span>Pendaftaran berhasil! Silakan <a href="#" class="success-link" @click.prevent="router.push('/login')">masuk</a> dengan akun baru Anda.</span>
        </div>
      </Transition>

      <!-- Register Form -->
      <form class="auth-form" @submit.prevent="handleRegist">
        <!-- Full Name -->
        <div class="field-group">
          <label class="field-label" for="reg-name">Nama Lengkap</label>
          <div class="input-wrapper">
            <span class="material-symbols-outlined input-icon">person</span>
            <input
              id="reg-name"
              v-model="fullName"
              type="text"
              class="auth-input"
              placeholder="Nama Lengkap Anda"
              required
              autocomplete="name"
            />
          </div>
        </div>

        <!-- Email -->
        <div class="field-group">
          <label class="field-label" for="reg-email">Alamat Email</label>
          <div class="input-wrapper">
            <span class="material-symbols-outlined input-icon">mail</span>
            <input
              id="reg-email"
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
          <label class="field-label" for="reg-password">Kata Sandi</label>
          <div class="input-wrapper">
            <span class="material-symbols-outlined input-icon">lock</span>
            <input
              id="reg-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="auth-input has-toggle"
              placeholder="Minimal 8 karakter"
              required
              autocomplete="new-password"
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

        <!-- Confirm Password -->
        <div class="field-group">
          <label class="field-label" for="reg-password-confirm">Konfirmasi Kata Sandi</label>
          <div class="input-wrapper">
            <span class="material-symbols-outlined input-icon">lock_reset</span>
            <input
              id="reg-password-confirm"
              v-model="confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              class="auth-input has-toggle"
              placeholder="Ulangi kata sandi"
              required
              autocomplete="new-password"
            />
            <button
              type="button"
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
              tabindex="-1"
            >
              <span class="material-symbols-outlined" :class="{ 'icon-active': showConfirmPassword }">
                {{ showConfirmPassword ? 'visibility' : 'visibility_off' }}
              </span>
            </button>
          </div>
        </div>

        <!-- Submit -->
        <button type="submit" class="submit-btn" :disabled="isSubmitting">
          <span v-if="isSubmitting" class="spinner"></span>
          <span v-else>Daftar Sekarang</span>
          <span v-if="!isSubmitting" class="material-symbols-outlined submit-arrow">person_add</span>
        </button>

        <p class="terms-text">
          Dengan mendaftar, Anda menyetujui
          <a href="#" class="terms-link">Syarat &amp; Ketentuan</a> kami.
        </p>
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

.brand-icon {
  font-size: 36px;
  color: #fea619;
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
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

/* ===== ERROR / SUCCESS ALERTS ===== */
.error-alert,
.success-alert {
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
}

.error-alert {
  background: #ffdad6;
  color: #93000a;
  border: 1px solid rgba(186, 26, 26, 0.15);
}

.success-alert {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid rgba(16, 185, 129, 0.2);
}

.error-icon,
.success-icon {
  font-size: 18px;
  flex-shrink: 0;
}

.success-link {
  color: #065f46;
  font-weight: 700;
  text-decoration: underline;
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

/* ===== TERMS TEXT ===== */
.terms-text {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
  color: #45474c;
  text-align: center;
  margin-top: 4px;
}

.terms-link {
  color: #091426;
  text-decoration: none;
  font-weight: 600;
}

.terms-link:hover {
  text-decoration: underline;
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