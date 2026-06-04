<script lang="ts">
export default {
  name: 'TargetView'
};
</script>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTargetStore } from '@/stores/target';
import { useTransaksiStore } from '@/stores/transaksi';
import Sidebar from '@/components/sidebar.vue';
import ProfileDropdown from '@/components/profile.vue';
import ChatBot from '@/components/chatBot.vue';
import AddTargetModal from '@/components/AddTargetModal.vue';

const authStore = useAuthStore();
const targetStore = useTargetStore();
const transaksiStore = useTransaksiStore();

onMounted(async () => {
  if (authStore.user) {
    await targetStore.fetchTargetAktif(authStore.user.id);
    await transaksiStore.fetchAll(authStore.user.id);
  }
});

const totalTabungan = computed(() => {
  if (!targetStore.selected) return 0;
  return transaksiStore.items
    .filter(t => t.id_target === targetStore.selected?.id_target && t.jenis_transaksi === 'tabungan')
    .reduce((sum, t) => sum + t.nominal, 0);
});

const progressTabungan = computed(() => {
  if (!targetStore.selected || targetStore.selected.nominal_target === 0) return 0;
  const percentage = (totalTabungan.value / targetStore.selected.nominal_target) * 100;
  return Math.min(100, Math.max(0, percentage));
});

// Sidebar ref
const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null);
const isSidebarMinimized = computed(() => sidebarRef.value?.isMinimized ?? false);

const isAddTargetModalOpen = ref(false);

const openAddTargetModal = () => {
  isAddTargetModalOpen.value = true;
};

const closeAddTargetModal = () => {
  isAddTargetModalOpen.value = false;
};

const handleSaveTarget = async (data: { nama_target: string; nominal_target: number; deadline: string }) => {
  if (authStore.user) {
    await targetStore.createTarget(authStore.user.id, data);
  }
};
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
          <h2 class="font-headline-md text-headline-md text-primary">Manajemen Target</h2>
        </div>
        <div class="flex items-center gap-6 text-on-surface-variant">
          <div class="relative hidden sm:block">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input class="pl-10 pr-4 py-2 rounded-full border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-secondary-container transition-all text-body-md font-body-md w-48 lg:w-64" placeholder="Cari..." type="text"/>
          </div>

          <!-- Profile Dropdown Component -->
          <ProfileDropdown />
        </div>
      </header>

      <!-- Scrollable Content Canvas -->
      <main class="flex-1 overflow-y-auto p-margin-desktop space-y-10">
        
        <!-- Top Row: Empty State & AI Insights -->
        <div class="flex flex-col lg:flex-row gap-gutter">
          <!-- Active Target Card -->
          <div v-if="targetStore.selected" class="flex-1 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden min-h-[400px]">
              <div class="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-transparent opacity-50 pointer-events-none"></div>
              <div class="relative z-10 flex flex-col h-full">
                  <div class="flex justify-between items-start mb-6">
                      <div>
                          <h2 class="font-display-lg text-display-lg text-primary-container leading-tight tracking-tight">{{ targetStore.selected.nama_target }}</h2>
                          <p class="font-headline-md text-headline-md text-on-surface-variant mt-2 font-medium">Rp {{ Number(targetStore.selected.nominal_target).toLocaleString('id-ID') }}</p>
                      </div>
                      <span class="bg-primary-container text-on-primary-container font-label-sm text-label-sm px-3 py-1.5 rounded-full uppercase tracking-wider">Active</span>
                  </div>
                  
                  <div class="mt-auto">
                      <div class="flex justify-between font-label-md text-label-md text-on-surface-variant mb-2">
                          <span>Progres (Rp {{ totalTabungan.toLocaleString('id-ID') }})</span>
                          <span>{{ progressTabungan.toFixed(1) }}%</span>
                      </div>
                      <div class="h-3 bg-surface-variant rounded-full w-full overflow-hidden">
                          <div class="h-full bg-primary-container rounded-full transition-all duration-500" :style="{ width: progressTabungan + '%' }"></div>
                      </div>
                      <p class="font-label-sm text-label-sm text-on-surface-variant mt-4">Batas Waktu: {{ new Date(targetStore.selected.deadline).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
                  </div>
              </div>
          </div>

          <!-- Main Empty State Hero Card (Left) -->
          <div v-else class="flex-1 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-8 md:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[400px]">
            <!-- Decorative background element for depth -->
            <div class="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-transparent opacity-50 pointer-events-none"></div>
            <div class="relative z-10 flex flex-col items-center">
              <div class="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 shadow-sm border border-outline-variant/20">
                <span class="material-symbols-outlined text-[48px] text-primary-container">tour</span>
              </div>
              <h2 class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary-container mb-4">
                  Mulai Perjalanan Menabung Anda
              </h2>
              <p class="font-body-md text-body-md text-on-surface-variant max-w-md mb-8">
                  Belum Ada Target Aktif. Tentukan tujuan keuangan Anda, seperti dana liburan atau DP rumah, dan biarkan sistem kami membantu Anda mencapainya dengan cerdas.
              </p>
              <button @click="openAddTargetModal" class="bg-secondary-container text-on-secondary-container font-label-md text-label-md px-8 py-3.5 rounded-lg hover:brightness-105 transition-all shadow-sm flex items-center gap-2">
                  <span class="material-symbols-outlined text-[20px]">add_circle</span>
                  Tambah Target Baru
              </button>
            </div>
          </div>
          
          <!-- AI Ready State Card (Right) -->
          <div class="lg:w-1/3 bg-surface/70 backdrop-blur-xl border border-white/40 shadow-sm rounded-2xl p-6 flex flex-col relative overflow-hidden">
            <!-- Glassmorphism subtle glow -->
            <div class="absolute -top-10 -right-10 w-40 h-40 bg-secondary-fixed-dim/20 rounded-full blur-3xl pointer-events-none"></div>
            <div class="flex items-center gap-2 mb-4">
                <span class="material-symbols-outlined text-secondary-container" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
                <span class="font-label-sm text-label-sm text-secondary-container tracking-wider uppercase font-bold">Adaptive Planning AI</span>
            </div>
            <h3 class="font-headline-md text-headline-md text-primary-container mb-3 relative z-10">
                Siap Menganalisis Pola Keuangan Anda
            </h3>
            <p class="font-body-md text-body-md text-on-surface-variant mb-6 relative z-10 flex-1">
                Sistem AI kami dalam posisi bersiap. Insight personal, rekomendasi pemotongan pengeluaran, dan prediksi waktu pencapaian akan muncul di sini segera setelah Anda membuat target tabungan pertama.
            </p>
            <div class="bg-surface-container-lowest/50 rounded-xl p-4 border border-outline-variant/20 flex items-center gap-4 relative z-10">
                <div class="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0">
                    <span class="material-symbols-outlined text-on-surface-variant text-[20px]">hourglass_empty</span>
                </div>
                <div class="flex-1">
                    <div class="h-2 bg-surface-variant rounded-full w-full overflow-hidden">
                        <!-- Loading animation bar -->
                        <div class="h-full bg-primary-fixed-dim w-1/3 rounded-full relative">
                            <div class="absolute inset-0 bg-white/40 animate-pulse"></div>
                        </div>
                    </div>
                    <p class="font-label-sm text-label-sm text-on-surface-variant mt-2">Menunggu input target...</p>
                </div>
            </div>
          </div>
        </div>

        <!-- Bottom Section: History Context -->
        <div class="mt-8">
            <h3 class="font-headline-md text-headline-md text-primary-container mb-6">Riwayat Target &amp; Proyeksi</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <!-- Ghost Card to imply more space -->
                <div class="bg-surface/50 border border-dashed border-outline-variant/50 rounded-2xl p-5 flex items-center justify-center min-h-[160px]">
                    <p class="font-label-sm text-label-sm text-on-surface-variant text-center opacity-60">Riwayat target Anda berikutnya akan muncul di sini.</p>
                </div>
            </div>
        </div>

        <!-- Bottom padding for FAB clearance -->
        <div class="h-16"></div>
      </main>

      <ChatBot id="btn-ai-chatbot" />
      <AddTargetModal :isOpen="isAddTargetModalOpen" @close="closeAddTargetModal" @save="handleSaveTarget" />
    </div>
  </div>
</template>

<style scoped>
/* Scoped styles can be added here if needed */
</style>
