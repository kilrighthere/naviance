<script lang="ts">
export default {
  name: 'TargetView'
};
</script>

<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTargetStore } from '@/stores/target';
import { useTransaksiStore } from '@/stores/transaksi';
import { useAdaptiveStore } from '@/stores/adaptivePlanning';
import Sidebar from '@/components/sidebar.vue';
import ProfileDropdown from '@/components/profile.vue';
import ChatBot from '@/components/chatBot.vue';
import AddTargetModal from '@/components/AddTargetModal.vue';

const authStore = useAuthStore();
const targetStore = useTargetStore();
const transaksiStore = useTransaksiStore();
const adaptiveStore = useAdaptiveStore();

// ─── Data Loading ─────────────────────────────────────────────────────────────

const loadData = async () => {
  if (!authStore.user) return;

  await Promise.all([
    targetStore.fetchTargetAktif(authStore.user.id),
    transaksiStore.fetchAll(authStore.user.id),
  ]);

  // Only call adaptive predict when there is an active target
  if (targetStore.selected) {
    await adaptiveStore.predict();
  }
};

onMounted(loadData);

// Re-run prediction whenever the selected target changes (e.g. after create)
watch(
  () => targetStore.selected,
  async (newTarget) => {
    if (newTarget) {
      await adaptiveStore.predict();
    } else {
      adaptiveStore.reset();
    }
  }
);

// ─── Tabungan Progress ────────────────────────────────────────────────────────

const totalTabungan = computed(() => {
  if (!targetStore.selected) return 0;
  return transaksiStore.items
    .filter(
      (t) =>
        t.id_target === targetStore.selected?.id_target &&
        t.jenis_transaksi === 'tabungan'
    )
    .reduce((sum, t) => sum + t.nominal, 0);
});

const progressTabungan = computed(() => {
  if (!targetStore.selected || targetStore.selected.nominal_target === 0) return 0;
  const pct = (totalTabungan.value / targetStore.selected.nominal_target) * 100;
  return Math.min(100, Math.max(0, pct));
});

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null);
const isSidebarMinimized = computed(() => sidebarRef.value?.isMinimized ?? false);

// ─── Add Target Modal ─────────────────────────────────────────────────────────

const isAddTargetModalOpen = ref(false);

const openAddTargetModal = () => {
  isAddTargetModalOpen.value = true;
};

const closeAddTargetModal = () => {
  isAddTargetModalOpen.value = false;
};

const handleSaveTarget = async (data: {
  nama_target: string;
  nominal_target: number;
  deadline: string;
}) => {
  if (authStore.user) {
    await targetStore.createTarget(authStore.user.id, data);
    // Prediction is triggered by the watcher above after selected changes
  }
};

// ─── Adaptive helpers ─────────────────────────────────────────────────────────

/** Format currency compact, e.g. 150000 → "Rp 150.000" */
const formatRupiah = (val: number) =>
  'Rp ' + val.toLocaleString('id-ID');

/** Progress bar width for probability */
const probProgressWidth = computed(() => {
  if (!adaptiveStore.result) return '0%';
  return (adaptiveStore.result.prediction.prob_goal_achieved * 100).toFixed(1) + '%';
});
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
      <header
        class="flex justify-between items-center w-full px-margin-desktop h-20 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-10"
      >
        <div class="flex items-center gap-4">
          <h2 class="font-headline-md text-headline-md text-primary">Manajemen Target</h2>
        </div>
        <div class="flex items-center gap-6 text-on-surface-variant">
          <div class="relative hidden sm:block">
            <span
              class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"
              >search</span
            >
            <input
              class="pl-10 pr-4 py-2 rounded-full border border-outline-variant bg-surface-container-lowest focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-secondary-container transition-all text-body-md font-body-md w-48 lg:w-64"
              placeholder="Cari..."
              type="text"
            />
          </div>
          <ProfileDropdown />
        </div>
      </header>

      <!-- Scrollable Content Canvas -->
      <main class="flex-1 overflow-y-auto px-margin-desktop pb-margin-desktop pt-4 space-y-10">

        <!-- ── Top Row ──────────────────────────────────────────────────────── -->
        <div class="flex flex-col lg:flex-row gap-gutter">

          <!-- Active Target Card -->
          <div
            v-if="targetStore.selected"
            class="flex-1 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-8 md:p-12 flex flex-col justify-center relative overflow-hidden min-h-[400px]"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-transparent opacity-50 pointer-events-none"
            ></div>
            <div class="relative z-10 flex flex-col h-full">
              <div class="flex justify-between items-start mb-6">
                <div>
                  <h2
                    class="font-display-lg text-display-lg text-primary-container leading-tight tracking-tight"
                  >
                    {{ targetStore.selected.nama_target }}
                  </h2>
                  <p class="font-headline-md text-headline-md text-on-surface-variant mt-2 font-medium">
                    Rp {{ Number(targetStore.selected.nominal_target).toLocaleString('id-ID') }}
                  </p>
                </div>
                <span
                  class="bg-secondary-container text-black font-label-sm text-label-sm px-3 py-1.5 rounded-full uppercase tracking-wider"
                  >Active</span
                >
              </div>

              <div class="mt-auto">
                <div class="flex justify-between font-label-md text-label-md text-on-surface-variant mb-2">
                  <span>Progres (Rp {{ totalTabungan.toLocaleString('id-ID') }})</span>
                  <span>{{ progressTabungan.toFixed(1) }}%</span>
                </div>
                <div class="h-3 bg-surface-variant rounded-full w-full overflow-hidden">
                  <div
                    class="h-full bg-primary-container rounded-full transition-all duration-500"
                    :style="{ width: progressTabungan + '%' }"
                  ></div>
                </div>
                <p class="font-label-sm text-label-sm text-on-surface-variant mt-4">
                  Batas Waktu:
                  {{
                    new Date(targetStore.selected.deadline).toLocaleDateString('id-ID', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }}
                </p>
              </div>
            </div>
          </div>

          <!-- Empty State Hero Card -->
          <div
            v-else
            class="flex-1 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/30 p-8 md:p-12 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[400px]"
          >
            <div
              class="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 to-transparent opacity-50 pointer-events-none"
            ></div>
            <div class="relative z-10 flex flex-col items-center">
              <div
                class="w-24 h-24 bg-surface rounded-full flex items-center justify-center mb-6 shadow-sm border border-outline-variant/20"
              >
                <span class="material-symbols-outlined text-[48px] text-primary-container">tour</span>
              </div>
              <h2
                class="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary-container mb-4"
              >
                Mulai Perjalanan Menabung Anda
              </h2>
              <p class="font-body-md text-body-md text-on-surface-variant max-w-md mb-8">
                Belum Ada Target Aktif. Tentukan tujuan keuangan Anda, seperti dana liburan atau DP
                rumah, dan biarkan sistem kami membantu Anda mencapainya dengan cerdas.
              </p>
              <button
                class="bg-secondary-container text-on-secondary-container font-label-md text-label-md px-8 py-3.5 rounded-lg hover:brightness-105 transition-all shadow-sm flex items-center gap-2"
                @click="openAddTargetModal"
              >
                <span class="material-symbols-outlined text-[20px]">add_circle</span>
                Tambah Target Baru
              </button>
            </div>
          </div>

          <!-- ── Adaptive Planning AI Card (Right) ───────────────────────── -->
          <div
            class="lg:w-1/3 bg-surface/70 backdrop-blur-xl border border-white/40 shadow-sm rounded-2xl p-6 flex flex-col relative overflow-hidden"
          >
            <!-- Glassmorphism subtle glow -->
            <div
              class="absolute -top-10 -right-10 w-40 h-40 bg-secondary-fixed-dim/20 rounded-full blur-3xl pointer-events-none"
            ></div>

            <div class="flex items-center gap-2 mb-4">
              <span
                class="material-symbols-outlined text-secondary-container"
                style="font-variation-settings: 'FILL' 1"
                >auto_awesome</span
              >
              <span
                class="font-label-sm text-label-sm text-secondary-container tracking-wider uppercase font-bold"
                >Adaptive Planning AI</span
              >
            </div>

            <!-- ── Loading state ─────────────────────────────────────────── -->
            <template v-if="adaptiveStore.isLoading">
              <h3 class="font-headline-md text-headline-md text-primary-container mb-3 relative z-10">
                Menganalisis Pola Keuangan...
              </h3>
              <p class="font-body-md text-body-md text-on-surface-variant mb-6 relative z-10 flex-1">
                Model AI sedang memproses data transaksi dan target Anda.
              </p>
              <div
                class="bg-surface-container-lowest/50 rounded-xl p-4 border border-outline-variant/20 flex items-center gap-4 relative z-10"
              >
                <div class="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-secondary-container text-[20px] animate-spin"
                    >autorenew</span
                  >
                </div>
                <div class="flex-1">
                  <div class="h-2 bg-surface-variant rounded-full w-full overflow-hidden">
                    <div class="h-full bg-primary-fixed-dim w-1/3 rounded-full relative">
                      <div class="absolute inset-0 bg-white/40 animate-pulse"></div>
                    </div>
                  </div>
                  <p class="font-label-sm text-label-sm text-on-surface-variant mt-2">
                    Memuat prediksi...
                  </p>
                </div>
              </div>
            </template>

            <!-- ── Error state ───────────────────────────────────────────── -->
            <template v-else-if="adaptiveStore.storeError">
              <h3 class="font-headline-md text-headline-md text-primary-container mb-3 relative z-10">
                Siap Menganalisis Pola Keuangan Anda
              </h3>
              <div
                class="bg-error-container/40 rounded-xl p-4 border border-error/20 flex items-start gap-3 relative z-10 mt-auto"
              >
                <span class="material-symbols-outlined text-error text-[20px] mt-0.5">error</span>
                <p class="font-label-sm text-label-sm text-on-error-container">
                  {{ adaptiveStore.storeError }}
                </p>
              </div>
            </template>

            <!-- ── No target (idle) ──────────────────────────────────────── -->
            <template v-else-if="!targetStore.selected">
              <h3 class="font-headline-md text-headline-md text-primary-container mb-3 relative z-10">
                Siap Menganalisis Pola Keuangan Anda
              </h3>
              <p class="font-body-md text-body-md text-on-surface-variant mb-6 relative z-10 flex-1">
                Insight personal, rekomendasi pemotongan pengeluaran, dan prediksi waktu pencapaian
                akan muncul di sini segera setelah Anda membuat target tabungan pertama.
              </p>
              <div
                class="bg-surface-container-lowest/50 rounded-xl p-4 border border-outline-variant/20 flex items-center gap-4 relative z-10"
              >
                <div class="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-on-surface-variant text-[20px]"
                    >hourglass_empty</span
                  >
                </div>
                <div class="flex-1">
                  <div class="h-2 bg-surface-variant rounded-full w-full overflow-hidden">
                    <div class="h-full bg-primary-fixed-dim w-1/3 rounded-full relative">
                      <div class="absolute inset-0 bg-white/40 animate-pulse"></div>
                    </div>
                  </div>
                  <p class="font-label-sm text-label-sm text-on-surface-variant mt-2">
                    Menunggu input target...
                  </p>
                </div>
              </div>
            </template>

            <!-- ── Result state ──────────────────────────────────────────── -->
            <template v-else-if="adaptiveStore.result">
              <!-- Status headline -->
              <h3 class="font-headline-md text-headline-md text-primary-container mb-1 relative z-10">
                {{ adaptiveStore.result.prediction.status }}
              </h3>

              <!-- Probability bar -->
              <div class="relative z-10 mb-5">
                <div class="flex justify-between font-label-sm text-label-sm text-on-surface-variant mb-1">
                  <span>Probabilitas Tercapai</span>
                  <span :class="adaptiveStore.statusColor" class="font-semibold">
                    {{ adaptiveStore.probFormatted }}
                  </span>
                </div>
                <div class="h-2 bg-surface-variant rounded-full w-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-700"
                    :class="adaptiveStore.result.prediction.on_track ? 'bg-on-tertiary-container' : 'bg-error'"
                    :style="{ width: probProgressWidth }"
                  ></div>
                </div>
              </div>

              <!-- On-track badge -->
              <div
                class="flex items-center gap-2 mb-5 relative z-10 rounded-xl px-3 py-2 border"
                :class="
                  adaptiveStore.result.prediction.on_track
                    ? 'bg-tertiary-fixed/10 border-on-tertiary-container/20 text-on-tertiary-container'
                    : 'bg-error-container/30 border-error/20 text-error'
                "
              >
                <span class="material-symbols-outlined text-[18px]">
                  {{ adaptiveStore.statusIcon }}
                </span>
                <span class="font-label-sm text-label-sm font-medium">
                  {{
                    adaptiveStore.result.prediction.on_track
                      ? 'Target Anda sedang on-track!'
                      : 'Target berisiko tidak tercapai.'
                  }}
                </span>
              </div>

              <!-- Saving recommendations -->
              <div
                v-if="adaptiveStore.rekomendasiAktif.length > 0"
                class="relative z-10 flex-1"
              >
                <p class="font-label-md text-label-md text-on-background mb-3">
                  Rekomendasi Penghematan
                  <span class="text-on-surface-variant font-normal">
                    (hemat {{ formatRupiah(adaptiveStore.result.total_hemat_per_bulan) }}/bln)
                  </span>
                </p>
                <div class="space-y-2">
                  <div
                    v-for="item in adaptiveStore.rekomendasiAktif"
                    :key="item.kategori"
                    class="flex justify-between items-center bg-surface-container-lowest/60 rounded-lg px-3 py-2 border border-outline-variant/10"
                  >
                    <span class="font-label-sm text-label-sm text-on-surface-variant">
                      {{ item.kategori }}
                    </span>
                    <span class="font-label-sm text-label-sm font-semibold text-error">
                      -{{ formatRupiah(item.nominal) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- No recommendations (all zeros) -->
              <div v-else class="relative z-10 flex-1">
                <div
                  class="bg-surface-container-lowest/50 rounded-xl p-4 border border-outline-variant/20 flex items-start gap-3"
                >
                  <span
                    class="material-symbols-outlined text-on-tertiary-container text-[20px] mt-0.5"
                    style="font-variation-settings: 'FILL' 1"
                    >thumb_up</span
                  >
                  <p class="font-label-sm text-label-sm text-on-surface-variant">
                    Pengeluaran Anda sudah efisien. Tidak ada rekomendasi penghematan saat ini.
                  </p>
                </div>
              </div>

              <!-- Model version footer -->
              <p class="font-label-sm text-label-sm text-outline mt-4 relative z-10 text-right">
                Model v{{ adaptiveStore.result.model_version }}
              </p>
            </template>
          </div>
        </div>

        <!-- ── Riwayat Target & Proyeksi ──────────────────────────────────── -->
        <div class="mt-8">
          <h3 class="font-headline-md text-headline-md text-primary-container mb-6">
            Riwayat Target &amp; Proyeksi
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              class="bg-surface/50 border border-dashed border-outline-variant/50 rounded-2xl p-5 flex items-center justify-center min-h-[160px]"
            >
              <p class="font-label-sm text-label-sm text-on-surface-variant text-center opacity-60">
                Riwayat target Anda berikutnya akan muncul di sini.
              </p>
            </div>
          </div>
        </div>

        <!-- Bottom padding for FAB clearance -->
        <div class="h-16"></div>
      </main>

      <ChatBot id="btn-ai-chatbot" />
      <AddTargetModal
        :isOpen="isAddTargetModalOpen"
        @close="closeAddTargetModal"
        @save="handleSaveTarget"
      />
    </div>
  </div>
</template>