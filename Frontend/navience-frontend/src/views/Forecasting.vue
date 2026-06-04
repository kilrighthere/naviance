<script lang="ts">
export default {
  name: 'ForecastingView'
};
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useForecastingStore } from '@/stores/forecasting';
import Sidebar from '@/components/sidebar.vue';
import ChatBot from '@/components/chatBot.vue';
import ProfileDropdown from '@/components/profile.vue';

const authStore = useAuthStore();
const forecastingStore = useForecastingStore();

const userID = computed(() => authStore.user?.id ?? '');

// Sidebar ref
const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null);
const isSidebarMinimized = computed(() => sidebarRef.value?.isMinimized ?? false);

// Category color palette — curated for the donut chart
const CATEGORY_COLORS: Record<string, string> = {
  'af5dc46e-26bf-48b1-8ba8-2124d0928a49': '#1e293b', // makanan dan minuman - Navy
  '146489bd-fb7d-4e5c-bbec-932c9245697a': '#f59e0b', // fashion - Amber
  '3cbd5118-8524-4dd8-b1a0-f2c83a16d245': '#10b981', // kesehatan - Emerald
  '38f317d7-034f-4900-912b-7328042381de': '#684000', // transportasi - Brown
  '3eab81f1-8a6b-4bb7-b195-0e644ca41ca0': '#6366f1', // pendidikan - Indigo
  '96f5a9c1-da72-43d7-bbdf-d5888e10c6aa': '#ec4899', // belanja - Pink
  'cc700e23-4002-4bf1-bfe2-d9447af4e6b4': '#14b8a6', // bonus - Teal
  '8c36ed44-1a2b-4b47-a50e-7e525660ed5d': '#8b5cf6', // gaji - Violet
  '80a90f45-811b-48d3-8f9c-0137873aff53': '#00a472', // hiburan - Green
  'c3bf77bf-aed9-4c01-a554-407ec8237bcb': '#0ea5e9', // investasi - Sky
  '83a23757-6790-487c-9868-c8e39453ad28': '#f97316', // tabungan - Orange
  'c0751a34-b2d0-4094-a5be-83b5068be5bb': '#ef4444', // tagihan - Red
  '563483bf-ae5b-41d2-82dd-7289c18aba7b': '#bcc7de', // lainnya - Light Blue-Gray
};

// Category icon mapping
const CATEGORY_ICONS: Record<string, string> = {
  'af5dc46e-26bf-48b1-8ba8-2124d0928a49': 'restaurant',
  '146489bd-fb7d-4e5c-bbec-932c9245697a': 'checkroom',
  '3cbd5118-8524-4dd8-b1a0-f2c83a16d245': 'health_and_safety',
  '38f317d7-034f-4900-912b-7328042381de': 'directions_car',
  '3eab81f1-8a6b-4bb7-b195-0e644ca41ca0': 'school',
  '96f5a9c1-da72-43d7-bbdf-d5888e10c6aa': 'shopping_bag',
  'cc700e23-4002-4bf1-bfe2-d9447af4e6b4': 'card_giftcard',
  '8c36ed44-1a2b-4b47-a50e-7e525660ed5d': 'payments',
  '80a90f45-811b-48d3-8f9c-0137873aff53': 'sports_esports',
  'c3bf77bf-aed9-4c01-a554-407ec8237bcb': 'trending_up',
  '83a23757-6790-487c-9868-c8e39453ad28': 'savings',
  'c0751a34-b2d0-4094-a5be-83b5068be5bb': 'receipt',
  '563483bf-ae5b-41d2-82dd-7289c18aba7b': 'more_horiz',
};

const getCategoryColor = (id: string) => CATEGORY_COLORS[id] ?? '#94a3b8';
const getCategoryIcon = (id: string) => CATEGORY_ICONS[id] ?? 'category';

// Only show categories with predicted_amount > 0
const activeItems = computed(() =>
  forecastingStore.items.filter(item => item.predicted_amount > 0)
);

// Donut chart conic-gradient
const donutGradient = computed(() => {
  const items = activeItems.value;
  if (items.length === 0) return 'conic-gradient(#e4e2e3 0% 100%)';

  const total = items.reduce((sum, item) => sum + item.predicted_amount, 0);
  if (total === 0) return 'conic-gradient(#e4e2e3 0% 100%)';

  let acc = 0;
  const stops: string[] = [];

  items.forEach((item) => {
    const start = acc;
    const pct = (item.predicted_amount / total) * 100;
    acc += pct;
    const color = getCategoryColor(item.id_kategori);
    stops.push(`${color} ${start.toFixed(2)}% ${acc.toFixed(2)}%`);
  });

  return `conic-gradient(${stops.join(', ')})`;
});

// Format currency
const formatCurrency = (val: number) => {
  if (val >= 1_000_000) return `Rp ${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `Rp ${(val / 1_000).toFixed(0)}K`;
  return `Rp ${val.toLocaleString('id-ID')}`;
};

const formatFullCurrency = (val: number) => {
  return `Rp ${val.toLocaleString('id-ID')}`;
};

// Capitalize first letter of each word
const capitalize = (str: string) =>
  str.replace(/\b\w/g, (c) => c.toUpperCase());

// Hovered legend item
const hoveredCategory = ref<string | null>(null);

// Load data
const loadData = async (id: string) => {
  if (!id) return;
  await forecastingStore.fetchForecast(id);
};

onMounted(() => {
  if (userID.value) {
    void loadData(userID.value);
  }
});

watch(userID, (id) => {
  if (id) {
    void loadData(id);
  }
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
      <header class="flex justify-between items-center w-full px-margin-desktop h-20 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-10">
        <div class="flex items-center gap-4">
          <h2 class="font-headline-md text-headline-md text-primary">Prediksi</h2>
        </div>
        <div class="flex items-center gap-6 text-on-surface-variant">

          <ProfileDropdown />
        </div>
      </header>

      <!-- Scrollable Canvas -->
      <main class="flex-1 overflow-y-auto p-margin-desktop space-y-6">
        <!-- Page Header -->
        <section>
          <div>
            <h2 class="font-headline-lg text-headline-lg text-on-background mb-2">
              Prediksi AI
            </h2>
            <p class="font-body-md text-body-md text-on-surface-variant">
              Prediksi cerdas untuk masa depan finansial Anda.
            </p>
          </div>
        </section>

        <!-- Loading State -->
        <section v-if="forecastingStore.isLoading" class="flex flex-col items-center justify-center py-24 gap-4">
          <div class="forecast-spinner"></div>
          <p class="font-body-md text-body-md text-on-surface-variant animate-pulse">
            AI sedang menganalisis pola pengeluaran Anda...
          </p>
        </section>

        <!-- Error State -->
        <section v-else-if="forecastingStore.error" class="bg-error-container/30 border border-error/20 rounded-2xl p-8 flex items-center gap-4">
          <span class="material-symbols-outlined text-error text-3xl">error</span>
          <div>
            <p class="font-label-md text-label-md text-on-error-container">Gagal Memuat Prediksi</p>
            <p class="font-body-md text-body-md text-on-surface-variant mt-1">{{ forecastingStore.error }}</p>
          </div>
        </section>

        <!-- Main Content -->
        <template v-else>
          <!-- Main Forecasting Card -->
          <section
            id="forecast-main-card"
            class="bg-surface-container-lowest rounded-2xl p-5 md:p-6 shadow-[0_4px_12px_rgba(30,41,59,0.05)] border border-outline-variant/30 forecast-card-enter"
          >
            <div class="flex justify-between items-center mb-6">
              <h3 class="font-headline-md text-headline-md text-primary">Prediksi Pengeluaran Bulan Depan</h3>
              <span class="px-4 py-1 bg-surface-container-low text-on-surface-variant rounded-full font-label-sm text-label-sm border border-outline-variant/50 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[14px]">calendar_month</span>
                {{ forecastingStore.forecastMonth }}
              </span>
            </div>

            <div class="flex flex-col lg:flex-row items-center gap-6 justify-center">
              <!-- Donut Chart -->
              <div class="relative flex-shrink-0">
                <div
                  class="donut-chart"
                  :style="{ background: donutGradient }"
                >
                  <div class="donut-hole">
                    <span class="font-label-sm text-label-sm text-on-surface-variant mb-1">Total Prediksi</span>
                    <span class="font-headline-md text-headline-md text-primary font-bold">
                      {{ formatCurrency(forecastingStore.totalPrediksi) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Chart Legend — All Categories -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:flex-1">
                <div
                  v-for="item in activeItems"
                  :key="item.id_kategori"
                  class="flex items-center justify-between gap-6 p-3 rounded-xl transition-all duration-200 cursor-default"
                  :class="hoveredCategory === item.id_kategori
                    ? 'bg-surface-container-high shadow-sm scale-[1.02]'
                    : 'hover:bg-surface-container-low'"
                  @mouseenter="hoveredCategory = item.id_kategori"
                  @mouseleave="hoveredCategory = null"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200"
                      :style="{ backgroundColor: getCategoryColor(item.id_kategori) + '18' }"
                      :class="hoveredCategory === item.id_kategori ? 'scale-110' : ''"
                    >
                      <span
                        class="material-symbols-outlined text-[18px]"
                        :style="{ color: getCategoryColor(item.id_kategori) }"
                      >{{ getCategoryIcon(item.id_kategori) }}</span>
                    </div>
                    <span class="font-body-md text-body-md text-primary">{{ capitalize(item.nama_kategori) }}</span>
                  </div>
                  <div class="text-right">
                    <div class="font-label-md text-label-md text-primary">{{ item.percentage }}%</div>
                    <div class="font-label-sm text-label-sm text-on-surface-variant">{{ formatFullCurrency(item.predicted_amount) }}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Category Breakdown Cards -->
          <section>
            <h3 class="font-headline-md text-headline-md text-on-background mb-6">Detail Prediksi per Kategori</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter">
              <div
                v-for="(item, index) in forecastingStore.items"
                :key="item.id_kategori"
                class="forecast-detail-card bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-4 hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
                :style="{ animationDelay: `${index * 50}ms` }"
              >
                <div class="flex items-center gap-3 mb-4">
                  <div
                    class="w-11 h-11 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                    :style="{ backgroundColor: getCategoryColor(item.id_kategori) + '18' }"
                  >
                    <span
                      class="material-symbols-outlined text-xl"
                      :style="{ color: getCategoryColor(item.id_kategori) }"
                    >{{ getCategoryIcon(item.id_kategori) }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="font-label-md text-label-md text-on-background truncate">{{ capitalize(item.nama_kategori) }}</p>
                    <p class="font-label-sm text-label-sm text-on-surface-variant">{{ item.percentage }}% dari total</p>
                  </div>
                </div>

                <!-- Mini progress bar -->
                <div class="w-full h-2 bg-surface-container-high rounded-full overflow-hidden mb-3">
                  <div
                    class="h-full rounded-full transition-all duration-700 ease-out"
                    :style="{
                      width: `${item.percentage}%`,
                      backgroundColor: getCategoryColor(item.id_kategori)
                    }"
                  ></div>
                </div>

                <p class="font-headline-md text-headline-md text-on-background text-lg">
                  {{ formatFullCurrency(item.predicted_amount) }}
                </p>
              </div>
            </div>
          </section>

          <!-- AI Insight Card (Glassmorphism) -->
          <section class="glass-ai rounded-2xl p-6 md:p-8 border border-outline-variant/20 forecast-card-enter" style="animation-delay: 200ms;">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-secondary-container/20 flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-secondary-container text-2xl" style="font-variation-settings: 'FILL' 1;">auto_awesome</span>
              </div>
              <div>
                <h4 class="font-label-md text-label-md text-on-background mb-2">AI Insight</h4>
                <p class="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  Berdasarkan pola pengeluaran Anda, total prediksi untuk bulan depan adalah
                  <strong class="text-primary">{{ formatFullCurrency(forecastingStore.totalPrediksi) }}</strong>.
                  Kategori terbesar diprediksi adalah
                  <strong class="text-primary">{{ capitalize(activeItems[0]?.nama_kategori ?? '-') }}</strong>
                  dengan kontribusi {{ activeItems[0]?.percentage ?? 0 }}%.
                  Pertimbangkan untuk meninjau alokasi budget Anda agar tetap sesuai target keuangan.
                </p>
              </div>
            </div>
          </section>
        </template>

        <!-- Bottom padding -->
        <div class="h-16"></div>
      </main>

      <ChatBot id="btn-ai-chatbot-forecasting" />
    </div>
  </div>
</template>

<style scoped>
/* Donut Chart */
.donut-chart {
  width: 200px;
  height: 200px;
  border-radius: 50%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.3s ease;
}

.donut-chart:hover {
  transform: scale(1.03);
}

.donut-hole {
  width: 135px;
  height: 135px;
  border-radius: 50%;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0px 4px 12px rgba(30, 41, 59, 0.05);
}

/* Loading Spinner */
.forecast-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid #e4e2e3;
  border-top-color: #1e293b;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Card entrance animation */
.forecast-card-enter {
  animation: fadeSlideUp 0.6s ease-out both;
}

.forecast-detail-card {
  animation: fadeSlideUp 0.5s ease-out both;
}

@keyframes fadeSlideUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
