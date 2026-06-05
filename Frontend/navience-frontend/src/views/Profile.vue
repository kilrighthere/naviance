<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { supabase } from '@/services/supabase';
import Sidebar from '@/components/sidebar.vue';
import ChatBot from '@/components/chatBot.vue';

const router = useRouter();
const authStore = useAuthStore();

const userName = computed(() => authStore.user?.user_metadata?.nama_lengkap ?? 'User');
const userEmail = computed(() => authStore.user?.email ?? '');
const userInitials = computed(() => {
  const name = userName.value;
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
});

const memberSince = computed(() => {
  const createdAt = authStore.user?.created_at;
  if (!createdAt) return '';
  const date = new Date(createdAt);
  return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
});

// Sidebar ref
const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null);
const isSidebarMinimized = computed(() => sidebarRef.value?.isMinimized ?? false);

// Edit states
const isEditingName = ref(false);
const isEditingEmail = ref(false);
const editName = ref('');
const editEmail = ref('');
const isSavingName = ref(false);
const isSavingEmail = ref(false);
const saveNameSuccess = ref(false);
const saveEmailSuccess = ref(false);
const saveError = ref<string | null>(null);

// Delete account
const showDeleteConfirm = ref(false);
const deleteConfirmText = ref('');
const isDeleting = ref(false);

function startEditName() {
  editName.value = userName.value;
  isEditingName.value = true;
  saveNameSuccess.value = false;
  saveError.value = null;
}

function cancelEditName() {
  isEditingName.value = false;
  saveError.value = null;
}

async function saveName() {
  if (!editName.value.trim()) return;
  isSavingName.value = true;
  saveError.value = null;
  try {
    const { error } = await supabase.auth.updateUser({
      data: { nama_lengkap: editName.value.trim() }
    });
    if (error) throw error;
    // Refresh user state
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      authStore.user = data.user;
    }
    isEditingName.value = false;
    saveNameSuccess.value = true;
    setTimeout(() => { saveNameSuccess.value = false; }, 2000);
  } catch (err: any) {
    saveError.value = err.message || 'Gagal menyimpan nama.';
  } finally {
    isSavingName.value = false;
  }
}

function startEditEmail() {
  editEmail.value = userEmail.value;
  isEditingEmail.value = true;
  saveEmailSuccess.value = false;
  saveError.value = null;
}

function cancelEditEmail() {
  isEditingEmail.value = false;
  saveError.value = null;
}

async function saveEmail() {
  if (!editEmail.value.trim()) return;
  isSavingEmail.value = true;
  saveError.value = null;
  try {
    const { error } = await supabase.auth.updateUser({
      email: editEmail.value.trim()
    });
    if (error) throw error;
    isEditingEmail.value = false;
    saveEmailSuccess.value = true;
    setTimeout(() => { saveEmailSuccess.value = false; }, 3000);
  } catch (err: any) {
    saveError.value = err.message || 'Gagal menyimpan email.';
  } finally {
    isSavingEmail.value = false;
  }
}

// Change password
const showChangePassword = ref(false);
const newPassword = ref('');
const confirmPassword = ref('');
const isSavingPassword = ref(false);
const savePasswordSuccess = ref(false);
const passwordError = ref<string | null>(null);

function toggleChangePassword() {
  showChangePassword.value = !showChangePassword.value;
  newPassword.value = '';
  confirmPassword.value = '';
  passwordError.value = null;
  savePasswordSuccess.value = false;
}

async function savePassword() {
  passwordError.value = null;
  if (newPassword.value.length < 8) {
    passwordError.value = 'Password minimal 8 karakter.';
    return;
  }
  if (newPassword.value !== confirmPassword.value) {
    passwordError.value = 'Konfirmasi password tidak cocok.';
    return;
  }
  isSavingPassword.value = true;
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value
    });
    if (error) throw error;
    savePasswordSuccess.value = true;
    newPassword.value = '';
    confirmPassword.value = '';
    setTimeout(() => {
      savePasswordSuccess.value = false;
      showChangePassword.value = false;
    }, 2000);
  } catch (err: any) {
    passwordError.value = err.message || 'Gagal mengubah password.';
  } finally {
    isSavingPassword.value = false;
  }
}

async function handleDeleteAccount() {
  if (deleteConfirmText.value !== 'HAPUS AKUN') return;
  isDeleting.value = true;
  try {
    await authStore.logout();
    router.push('/login');
  } catch (err) {
    console.error('Delete account error:', err);
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <div class="bg-background text-on-background flex h-screen overflow-hidden">
    <!-- Sidebar Component -->
    <Sidebar ref="sidebarRef" />

    <!-- Main Content Wrapper -->
    <div
      class="dashboard-main-content flex-1 flex flex-col h-full bg-background relative"
      :class="{ 'content-expanded': isSidebarMinimized }"
    >
      <!-- Top App Bar -->
      <header class="flex justify-between items-center w-full px-margin-desktop h-20 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-10">
        <div class="flex items-center gap-4">
          <h2 class="font-headline-md text-headline-md text-primary">Profil</h2>
        </div>
        <div class="flex items-center gap-6 text-on-surface-variant">

          <button class="hover:text-primary transition-colors flex items-center" id="btn-profile-avatar">
            <span class="material-symbols-outlined text-3xl">account_circle</span>
          </button>
        </div>
      </header>

      <!-- Scrollable Main Canvas -->
      <main class="flex-1 overflow-y-auto px-margin-desktop pb-margin-desktop pt-4 space-y-10">
        <div class="max-w-6xl mx-auto pb-6 w-full px-4 md:px-0 mt-4 md:mt-0">

          <!-- Section 1: Header/Avatar -->
          <section class="flex flex-col items-center text-center profile-header-section mb-6">
            <div class="relative group cursor-pointer mb-4">
              <div class="w-24 h-24 rounded-full bg-primary-container border-4 border-surface-container-lowest shadow-sm flex items-center justify-center relative overflow-hidden profile-avatar-ring">
                <span class="text-white font-headline-lg text-3xl select-none">{{ userInitials }}</span>
                <!-- Hover overlay -->
                <div class="absolute inset-0 bg-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <span class="material-symbols-outlined text-on-primary" style="font-variation-settings: 'FILL' 1;">photo_camera</span>
                </div>
              </div>
            </div>
            <h2 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-1">
              {{ userName }}
            </h2>
            <p class="font-body-md text-body-md text-on-surface-variant flex items-center gap-2 justify-center">
              <span class="material-symbols-outlined text-secondary-container" style="font-variation-settings: 'FILL' 1;">verified</span>
              Anggota sejak {{ memberSince }}
            </p>
          </section>

          <!-- Combined Account & Security Card -->
          <section class="bg-surface-container-lowest rounded-2xl shadow-[0_4px_12px_rgba(30,41,59,0.05)] border border-outline-variant/30 p-6 md:p-8 profile-account-section mb-4 w-full" id="profile-combined-info">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              
              <!-- Left side: Account Info -->
              <div>
                <div class="flex items-center gap-3 mb-6 border-b border-outline-variant/20 pb-4">
                  <span class="material-symbols-outlined text-primary">badge</span>
                  <h3 class="font-headline-md text-headline-md text-primary">Informasi Akun</h3>
                </div>

            <!-- Error message -->
            <div v-if="saveError" class="mb-4 p-3 bg-error-container/30 border border-error/20 rounded-lg flex items-center gap-2 animate-fade-in">
              <span class="material-symbols-outlined text-error text-[20px]">error</span>
              <span class="font-label-sm text-label-sm text-error">{{ saveError }}</span>
            </div>

            <div class="flex flex-col gap-4">
              <!-- Full Name -->
              <div class="flex flex-col gap-1.5">
                <label class="font-label-sm text-label-sm text-on-surface-variant">Nama Lengkap</label>
                <!-- Display mode -->
                <div v-if="!isEditingName" class="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 transition-all hover:border-outline-variant/40">
                  <span class="font-body-md text-body-md text-on-background">{{ userName }}</span>
                  <button @click="startEditName" class="text-secondary hover:text-secondary-container transition-colors" id="btn-edit-name">
                    <span class="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                </div>
                <!-- Edit mode -->
                <div v-else class="flex flex-col gap-2 animate-fade-in">
                  <input
                    v-model="editName"
                    type="text"
                    class="p-3 rounded-lg bg-surface-container-lowest border border-primary/40 font-body-md text-body-md text-on-background focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                    placeholder="Masukkan nama lengkap"
                    id="input-edit-name"
                    @keyup.enter="saveName"
                  />
                  <div class="flex gap-2">
                    <button
                      @click="saveName"
                      :disabled="isSavingName"
                      class="flex-1 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <span v-if="isSavingName" class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      <span v-else class="material-symbols-outlined text-[18px]">check</span>
                      Simpan
                    </button>
                    <button
                      @click="cancelEditName"
                      class="px-4 py-2 border border-outline-variant/40 text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container-low transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
                <!-- Success message -->
                <div v-if="saveNameSuccess" class="flex items-center gap-1 animate-fade-in">
                  <span class="material-symbols-outlined text-on-tertiary-container text-[16px]">check_circle</span>
                  <span class="font-label-sm text-label-sm text-on-tertiary-container">Nama berhasil diperbarui!</span>
                </div>
              </div>

              <!-- Email Address -->
              <div class="flex flex-col gap-1.5">
                <label class="font-label-sm text-label-sm text-on-surface-variant">Alamat Email</label>
                <!-- Display mode -->
                <div v-if="!isEditingEmail" class="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 transition-all hover:border-outline-variant/40">
                  <span class="font-body-md text-body-md text-on-background">{{ userEmail }}</span>
                  <button @click="startEditEmail" class="text-secondary hover:text-secondary-container transition-colors" id="btn-edit-email">
                    <span class="material-symbols-outlined text-[20px]">edit</span>
                  </button>
                </div>
                <!-- Edit mode -->
                <div v-else class="flex flex-col gap-2 animate-fade-in">
                  <input
                    v-model="editEmail"
                    type="email"
                    class="p-3 rounded-lg bg-surface-container-lowest border border-primary/40 font-body-md text-body-md text-on-background focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                    placeholder="Masukkan email baru"
                    id="input-edit-email"
                    @keyup.enter="saveEmail"
                  />
                  <div class="flex gap-2">
                    <button
                      @click="saveEmail"
                      :disabled="isSavingEmail"
                      class="flex-1 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                    >
                      <span v-if="isSavingEmail" class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      <span v-else class="material-symbols-outlined text-[18px]">check</span>
                      Simpan
                    </button>
                    <button
                      @click="cancelEditEmail"
                      class="px-4 py-2 border border-outline-variant/40 text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container-low transition-colors"
                    >
                      Batal
                    </button>
                  </div>
                </div>
                <!-- Success message -->
                <div v-if="saveEmailSuccess" class="flex items-center gap-1 animate-fade-in">
                  <span class="material-symbols-outlined text-on-tertiary-container text-[16px]">check_circle</span>
                  <span class="font-label-sm text-label-sm text-on-tertiary-container">Cek email baru Anda untuk konfirmasi.</span>
                </div>
              </div>
            </div>
              </div> <!-- End Account Info -->

              <!-- Right side: Security -->
              <div>
                <div class="flex items-center gap-3 mb-6 border-b border-outline-variant/20 pb-4">
                  <span class="material-symbols-outlined text-primary">shield_lock</span>
                  <h3 class="font-headline-md text-headline-md text-primary">Keamanan</h3>
                </div>

                <div class="flex flex-col gap-4">
                  <div class="flex flex-col gap-1.5">
                    <label class="font-label-sm text-label-sm text-on-surface-variant">Autentikasi</label>
                    <div class="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20">
                    <div class="flex items-center gap-3">
                      <span class="material-symbols-outlined text-on-surface-variant">lock</span>
                      <div>
                        <p class="font-label-md text-label-md text-on-background">Kata Sandi</p>
                        <p class="font-label-sm text-label-sm text-on-surface-variant">Ubah kata sandi akun Anda</p>
                      </div>
                </div>
                <button
                  @click="toggleChangePassword"
                  class="text-secondary hover:text-secondary-container transition-colors"
                  id="btn-change-password"
                >
                  <span class="material-symbols-outlined text-[20px]">{{ showChangePassword ? 'expand_less' : 'expand_more' }}</span>
                </button>
              </div>
            </div>

              <!-- Change password form -->
              <div v-if="showChangePassword" class="p-4 bg-surface-container-low rounded-xl border border-outline-variant/20 space-y-4 animate-fade-in">
                <div class="flex flex-col gap-1.5">
                  <label class="font-label-sm text-label-sm text-on-surface-variant">Password Baru</label>
                  <input
                    v-model="newPassword"
                    type="password"
                    class="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 font-body-md text-body-md text-on-background focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                    placeholder="Minimal 6 karakter"
                    id="input-new-password"
                  />
                </div>
                <div class="flex flex-col gap-1.5">
                  <label class="font-label-sm text-label-sm text-on-surface-variant">Konfirmasi Kata Sandi</label>
                  <input
                    v-model="confirmPassword"
                    type="password"
                    class="p-3 rounded-lg bg-surface-container-lowest border border-outline-variant/30 font-body-md text-body-md text-on-background focus:outline-none focus:ring-2 focus:ring-secondary-container/50 transition-all"
                    placeholder="Ulangi password baru"
                    id="input-confirm-password"
                    @keyup.enter="savePassword"
                  />
                </div>

                <!-- Password error -->
                <div v-if="passwordError" class="p-3 bg-error-container/30 border border-error/20 rounded-lg flex items-center gap-2">
                  <span class="material-symbols-outlined text-error text-[20px]">error</span>
                  <span class="font-label-sm text-label-sm text-error">{{ passwordError }}</span>
                </div>

                <!-- Password success -->
                <div v-if="savePasswordSuccess" class="p-3 bg-tertiary-fixed/20 border border-on-tertiary-container/20 rounded-lg flex items-center gap-2">
                  <span class="material-symbols-outlined text-on-tertiary-container text-[20px]">check_circle</span>
                  <span class="font-label-sm text-label-sm text-on-tertiary-container">Password berhasil diperbarui!</span>
                </div>

                <div class="flex gap-2">
                  <button
                    @click="savePassword"
                    :disabled="isSavingPassword"
                    class="flex-1 py-2.5 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                    id="btn-save-password"
                  >
                    <span v-if="isSavingPassword" class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                    <span v-else class="material-symbols-outlined text-[18px]">check</span>
                    Simpan Kata Sandi
                  </button>
                  <button
                    @click="toggleChangePassword"
                    class="px-4 py-2.5 border border-outline-variant/40 text-on-surface-variant font-label-md text-label-md rounded-lg hover:bg-surface-container-low transition-colors"
                  >
                    Batal
                  </button>
                </div>
              </div>
              </div>
              </div> <!-- End Security -->
            </div> <!-- End inner grid -->
          </section> <!-- End Combined Card -->

          <!-- Section 4: Delete Account -->
          <section class="w-full flex justify-start mt-4" id="profile-danger-zone">
                <div v-if="!showDeleteConfirm" class="w-full sm:w-auto">
                  <button
                    @click="showDeleteConfirm = true"
                    class="w-full sm:w-auto px-6 py-3 border border-error/50 text-error rounded-xl font-label-md text-label-md hover:bg-error/10 transition-colors flex items-center justify-center gap-2"
                    id="btn-delete-account"
                  >
                    <span class="material-symbols-outlined">delete_forever</span>
                    Hapus Akun
                  </button>
                </div>

            <!-- Delete confirmation -->
            <div v-else class="bg-error-container/10 border-2 border-error/30 rounded-2xl p-6 space-y-4 animate-fade-in">
              <div class="flex items-center gap-3">
                <span class="material-symbols-outlined text-error text-2xl">warning</span>
                <h4 class="font-headline-md text-headline-md text-error" style="font-size: 20px;">Hapus Akun Permanen</h4>
              </div>
              <p class="font-body-md text-body-md text-on-surface-variant">
                Tindakan ini tidak dapat dibatalkan. Semua data Anda akan dihapus secara permanen.
                Ketik <strong class="text-error">HAPUS AKUN</strong> untuk mengonfirmasi.
              </p>
              <input
                v-model="deleteConfirmText"
                type="text"
                class="w-full p-3 rounded-lg bg-surface-container-lowest border border-error/30 font-body-md text-body-md text-on-background focus:outline-none focus:ring-2 focus:ring-error/30 transition-all"
                placeholder="Ketik HAPUS AKUN"
                id="input-delete-confirm"
              />
              <div class="flex gap-3">
                <button
                  @click="handleDeleteAccount"
                  :disabled="deleteConfirmText !== 'HAPUS AKUN' || isDeleting"
                  class="flex-1 py-3 bg-error text-on-error font-label-md text-label-md rounded-xl hover:bg-error/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  id="btn-confirm-delete"
                >
                  <span v-if="isDeleting" class="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                  <span class="material-symbols-outlined">delete_forever</span>
                  Hapus Akun Saya
                </button>
                <button
                  @click="showDeleteConfirm = false; deleteConfirmText = ''"
                  class="px-6 py-3 border border-outline-variant/40 text-on-surface-variant font-label-md text-label-md rounded-xl hover:bg-surface-container-low transition-colors"
                >
                  Batal
                </button>
              </div>
            </div> <!-- End v-else div -->
          </section>
        </div>
      </main>

      <ChatBot id="btn-ai-chatbot-profile" />
    </div>
  </div>
</template>

<style scoped>
/* Avatar hover ring animation */
.profile-avatar-ring {
  transition: box-shadow 300ms ease-in-out, transform 300ms ease-in-out;
}

.profile-avatar-ring:hover {
  box-shadow: 0 0 0 4px rgba(254, 166, 25, 0.3);
}

/* Smooth fade-in for edit forms */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 200ms ease-out;
}

/* Section hover effect */
.profile-account-section,
.profile-security-section {
  transition: box-shadow 300ms ease, transform 300ms ease;
}

.profile-account-section:hover,
.profile-security-section:hover {
  box-shadow: 0 8px 24px rgba(30, 41, 59, 0.08);
}

/* Spin animation for loading */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}
</style>
