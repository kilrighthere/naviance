<script lang="ts">
export default {
  name: 'DashboardView'
};
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useTransaksiStore } from '@/stores/transaksi';
import { useAnggaranStore } from '@/stores/anggaran';
import { useTargetStore } from '@/stores/target';
import Sidebar from '@/components/sidebar.vue';
import ChatBot from '@/components/chatBot.vue';
import FormTransaksi from '@/components/formTransaksi.vue';
import ProfileDropdown from '@/components/profile.vue';
import LoadingScreen from '@/components/loading.vue';

const transaksiStore = useTransaksiStore();
const authStore = useAuthStore();
const anggaranStore = useAnggaranStore();
const targetStore = useTargetStore();

const userID = computed(() => authStore.user?.id ?? '');
const userName = computed(() => authStore.user?.user_metadata?.nama_lengkap ?? 'User');

const { transaksiByJenis, ringkasan6BulanApex } = storeToRefs(transaksiStore);
const { items: anggaranItems } = storeToRefs(anggaranStore);

const transaksiPemasukan = computed(() => transaksiByJenis.value?.['pemasukan'] ?? []);
const transaksiPengeluaran = computed(() => transaksiByJenis.value?.['pengeluaran'] ?? []);

const totalPemasukan = computed(() =>
  transaksiPemasukan.value.reduce((sum, item) => sum + item.nominal, 0)
);
const totalPengeluaran = computed(() =>
  transaksiPengeluaran.value.reduce((sum, item) => sum + item.nominal, 0)
);

const periodeAktif = computed(() => {
  const now = new Date();
  return now.toISOString().slice(0, 7);
});

const totalSisaAnggaran = computed(() => {
  const aktif = anggaranItems.value.filter(item => item.periode.slice(0, 7) === periodeAktif.value);
  const kategoriAktif = new Set(aktif.map(item => item.id_kategori));
  const totalAnggaran = aktif.reduce((sum, item) => sum + (item.total_anggaran ?? 0), 0);
  const totalTerpakai = transaksiPengeluaran.value
    .filter(item => item.tanggal_transaksi.slice(0, 7) === periodeAktif.value)
    .filter(item => kategoriAktif.has(item.id_kategori))
    .reduce((sum, item) => sum + item.nominal, 0);

  return totalAnggaran - totalTerpakai;
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

// ─── SVG Line Chart Data ───────────────────────────
const chartPeriod = ref('6bulan');

// Build chart data from store
const chartData = computed(() => {
  const apex = ringkasan6BulanApex.value;
  const categories = apex.categories;
  const incomeData = apex.series[0]?.data ?? [];
  const expenseData = apex.series[1]?.data ?? [];

  // Find max value for Y-axis scaling
  const allValues = [...incomeData, ...expenseData];
  const maxVal = Math.max(...allValues, 1);

  const viewBoxWidth = 600;
  const viewBoxHeight = 160;
  const pointCount = categories.length || 1;

  return categories.map((month: string, i: number) => {
    const inc = incomeData[i] ?? 0;
    const exp = expenseData[i] ?? 0;
    const x = pointCount > 1 ? (i / (pointCount - 1)) * viewBoxWidth : viewBoxWidth / 2;
    const yInc = viewBoxHeight - (inc / maxVal) * (viewBoxHeight - 10);
    const yExp = viewBoxHeight - (exp / maxVal) * (viewBoxHeight - 10);
    return {
      month,
      income: inc,
      expense: exp,
      x,
      yInc,
      yExp,
    };
  });
});

const incomePath = computed(() => {
  if (chartData.value.length === 0) return '';
  return chartData.value.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x},${d.yInc}`).join(' ');
});

const incomeAreaPath = computed(() => {
  if (chartData.value.length === 0) return '';
  const linePart = chartData.value.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x},${d.yInc}`).join(' ');
  const last = chartData.value[chartData.value.length - 1];
  const first = chartData.value[0];
  return `${linePart} L ${last?.x ?? 0},160 L ${first?.x ?? 0},160 Z`;
});

const expensePath = computed(() => {
  if (chartData.value.length === 0) return '';
  return chartData.value.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x},${d.yExp}`).join(' ');
});

const expenseAreaPath = computed(() => {
  if (chartData.value.length === 0) return '';
  const linePart = chartData.value.map((d, i) => `${i === 0 ? 'M' : 'L'} ${d.x},${d.yExp}`).join(' ');
  const last = chartData.value[chartData.value.length - 1];
  const first = chartData.value[0];
  return `${linePart} L ${last?.x ?? 0},160 L ${first?.x ?? 0},160 Z`;
});

// Chart tooltip state
const chartAreaRef = ref<HTMLElement | null>(null);
const svgWrapperRef = ref<SVGSVGElement | null>(null);
const activeChartIndex = ref(-1);
const tooltipStyle = ref({ left: '0px', top: '0px', opacity: '0', transform: 'translate(-50%, -100%)' });
const guideStyle = ref({ left: '0px', opacity: '0' });
const incomePointStyle = ref({ left: '0px', top: '0px', opacity: '0' });
const expensePointStyle = ref({ left: '0px', top: '0px', opacity: '0' });

const tooltipData = computed(() => {
  if (activeChartIndex.value < 0 || activeChartIndex.value >= chartData.value.length) {
    return { month: '', income: '', expense: '' };
  }
  const d = chartData.value[activeChartIndex.value];
  if (!d) return { month: '', income: '', expense: '' };
  return {
    month: d.month,
    income: `Rp ${formatCompact(d.income)}`,
    expense: `Rp ${formatCompact(d.expense)}`,
  };
});

const formatCompact = (val: number) => {
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
  if (val >= 1_000) return (val / 1_000).toFixed(0) + 'K';
  return val.toLocaleString('id-ID');
};

const onChartMouseMove = (e: MouseEvent) => {
  const el = chartAreaRef.value;
  const svgEl = svgWrapperRef.value;
  if (!el || !svgEl || chartData.value.length === 0) return;

  const containerRect = el.getBoundingClientRect();
  const svgRect = svgEl.getBoundingClientRect();

  // SVG offset relative to the chart area container
  const svgOffsetTop = svgRect.top - containerRect.top;
  const svgHeight = svgRect.height;

  const padding = 8;
  const x = e.clientX - containerRect.left - padding;
  const width = containerRect.width - padding * 2;

  const ratio = Math.max(0, Math.min(1, x / width));
  const maxIdx = chartData.value.length - 1;
  const closestIndex = Math.round(ratio * maxIdx);

  if (closestIndex !== activeChartIndex.value && closestIndex >= 0 && closestIndex <= maxIdx) {
    activeChartIndex.value = closestIndex;
    const data = chartData.value[closestIndex];
    if (!data) return;

    const xPos = (data.x / 600) * width + padding;
    // Y positions: map viewBox coordinates to actual SVG pixel height, then add SVG offset
    const yIncPos = (data.yInc / 160) * svgHeight + svgOffsetTop;
    const yExpPos = (data.yExp / 160) * svgHeight + svgOffsetTop;

    guideStyle.value = { left: `${xPos}px`, opacity: '1' };
    incomePointStyle.value = { left: `${xPos}px`, top: `${yIncPos}px`, opacity: '1' };
    expensePointStyle.value = { left: `${xPos}px`, top: `${yExpPos}px`, opacity: '1' };

    let transform = 'translate(-50%, -100%)';
    if (closestIndex === 0) transform = 'translate(0%, -100%)';
    else if (closestIndex === maxIdx) transform = 'translate(-100%, -100%)';

    tooltipStyle.value = {
      left: `${xPos}px`,
      top: `${Math.min(yIncPos, yExpPos) - 15}px`,
      opacity: '1',
      transform,
    };
  }
};

const onChartMouseLeave = () => {
  activeChartIndex.value = -1;
  guideStyle.value = { left: '0px', opacity: '0' };
  incomePointStyle.value = { left: '0px', top: '0px', opacity: '0' };
  expensePointStyle.value = { left: '0px', top: '0px', opacity: '0' };
  tooltipStyle.value = { left: '0px', top: '0px', opacity: '0', transform: 'translate(-50%, -100%)' };
};

// ─── Recent transactions (latest 5) ───────────────
const recentTransactions = computed(() => {
  const sorted = [...transaksiStore.items].sort((a, b) =>
    new Date(b.tanggal_transaksi).getTime() - new Date(a.tanggal_transaksi).getTime()
  );
  return sorted.slice(0, 5);
});

// Transaction icon mapping
const getCategoryIcon = (item: typeof transaksiStore.items[0]) => {
  const name = (item.nama_transaksi ?? '').toLowerCase();
  if (name.includes('coffee') || name.includes('makan') || name.includes('starbucks') || name.includes('resto')) return 'restaurant';
  if (name.includes('gaji') || name.includes('salary') || name.includes('pendapatan')) return 'payments';
  if (name.includes('uniqlo') || name.includes('belanja') || name.includes('store') || name.includes('toko')) return 'shopping_bag';
  if (name.includes('gojek') || name.includes('grab') || name.includes('transport')) return 'directions_car';
  if (name.includes('netflix') || name.includes('spotify') || name.includes('hiburan')) return 'subscriptions';
  if (name.includes('listrik') || name.includes('air') || name.includes('gas')) return 'bolt';
  if (item.jenis_transaksi === 'pemasukan') return 'payments';
  return 'receipt_long';
};

const getCategoryLabel = (item: typeof transaksiStore.items[0]) => {
  const name = (item.nama_transaksi ?? '').toLowerCase();
  if (name.includes('coffee') || name.includes('makan') || name.includes('starbucks') || name.includes('resto')) return 'Makanan & Minuman';
  if (name.includes('gaji') || name.includes('salary') || name.includes('pendapatan')) return 'Pendapatan';
  if (name.includes('uniqlo') || name.includes('belanja') || name.includes('store') || name.includes('toko')) return 'Belanja';
  if (name.includes('gojek') || name.includes('grab') || name.includes('transport')) return 'Transportasi';
  if (name.includes('netflix') || name.includes('spotify') || name.includes('hiburan')) return 'Hiburan';
  if (name.includes('listrik') || name.includes('air') || name.includes('gas')) return 'Utilitas';
  if (item.jenis_transaksi === 'pemasukan') return 'Pendapatan';
  return 'Lainnya';
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

// ─── Sidebar ref ──────────────────────────────────
const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null);
const isSidebarMinimized = computed(() => sidebarRef.value?.isMinimized ?? false);

// ─── Form Transaksi Modal ─────────────────────────
const showFormTransaksi = ref(false);

const openFormTransaksi = () => {
  transaksiStore.resetPayload();
  showFormTransaksi.value = true;
};



// ─── Data Loading ─────────────────────────────────
const isPageLoading = ref(true);

const loadData = async (id: string) => {
  if (!id) return;
  isPageLoading.value = true;
  await Promise.all([
    transaksiStore.fetchAll(id),
    anggaranStore.fetchAll(id),
    targetStore.fetchTargetAktif(id)
  ]);
  isPageLoading.value = false;
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
    <!-- Loading Screen -->
    <LoadingScreen :is-loading="isPageLoading" message="Memuat dashboard..." />

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
          <h2 class="font-headline-md text-headline-md text-primary">Overview</h2>
        </div>
        <div class="flex items-center gap-6 text-on-surface-variant">

          <!-- Profile Dropdown Component -->
          <ProfileDropdown />
        </div>
      </header>

      <!-- Scrollable Dashboard Canvas -->
      <main class="flex-1 overflow-y-auto p-margin-desktop space-y-10">
        <!-- Page Header -->
        <section class="flex justify-between items-end flex-wrap gap-4">
          <div>
            <h2 class="font-headline-lg text-headline-lg text-on-background mb-2">
              Halo, {{ userName }}
            </h2>
            <p class="font-body-md text-body-md text-on-surface-variant">
              Berikut adalah ringkasan finansial Anda bulan ini.
            </p>
          </div>
          <div class="flex items-center gap-4">
            <button
              id="btn-add-transaction"
              class="flex items-center gap-2 border-2 border-secondary text-secondary font-label-md text-label-md px-6 py-3 rounded-xl hover:bg-secondary/5 transition-colors"
              @click="openFormTransaksi"
            >
              <span class="material-symbols-outlined">add</span>
              Tambah Transaksi
            </button>
            <RouterLink
              id="btn-tanya-ai"
              :to="`/chatbot/${userID}`"
              class="flex items-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-xl shadow-sm hover:bg-primary/90 transition-colors"
            >
              <span class="material-symbols-outlined">smart_toy</span>
              Tanya AI Naviance
            </RouterLink>
          </div>
        </section>

        <!-- Top Row: Metrics Grid -->
        <section class="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <!-- Card: Total Pemasukan -->
          <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6 flex flex-col justify-between hover:shadow-md transition-shadow" id="card-pemasukan">
            <div class="flex justify-between items-start mb-4">
              <span class="font-label-md text-label-md text-on-surface-variant">Total Pemasukan</span>
              <div class="w-10 h-10 rounded-full bg-tertiary-fixed/20 flex items-center justify-center text-on-tertiary-fixed">
                <span class="material-symbols-outlined">arrow_upward</span>
              </div>
            </div>
            <div>
              <h3 class="font-headline-md text-headline-md text-on-background">
                Rp {{ totalPemasukan.toLocaleString('id-ID') }}
              </h3>
              <p class="font-label-sm text-label-sm text-on-tertiary-container mt-2 flex items-center gap-1">
                <span class="material-symbols-outlined text-[16px]">trending_up</span>
                +12% dari bulan lalu
              </p>
            </div>
          </div>

          <!-- Card: Total Pengeluaran -->
          <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6 flex flex-col justify-between hover:shadow-md transition-shadow" id="card-pengeluaran">
            <div class="flex justify-between items-start mb-4">
              <span class="font-label-md text-label-md text-on-surface-variant">Total Pengeluaran</span>
              <div class="w-10 h-10 rounded-full bg-error-container/50 flex items-center justify-center text-error">
                <span class="material-symbols-outlined">arrow_downward</span>
              </div>
            </div>
            <div>
              <h3 class="font-headline-md text-headline-md text-on-background">
                Rp {{ totalPengeluaran.toLocaleString('id-ID') }}
              </h3>
              <p class="font-label-sm text-label-sm text-error mt-2 flex items-center gap-1">
                <span class="material-symbols-outlined text-[16px]">warning</span>
                Mendekati limit budget
              </p>
            </div>
          </div>

          <!-- Card: Sisa Anggaran -->
          <div class="bg-primary text-on-primary rounded-2xl shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden" id="card-sisa-anggaran">
            <!-- Decorative abstract shape -->
            <div class="absolute -right-8 -top-8 w-32 h-32 bg-primary-fixed/10 rounded-full blur-2xl"></div>
            <div class="flex justify-between items-start mb-4 relative z-10">
              <span class="font-label-md text-label-md text-primary-fixed">Sisa Anggaran</span>
              <div class="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center text-primary-fixed">
                <span class="material-symbols-outlined">account_balance_wallet</span>
              </div>
            </div>
            <div class="relative z-10">
              <h3 class="font-headline-md text-headline-md">
                Rp {{ totalSisaAnggaran.toLocaleString('id-ID') }}
              </h3>
              <p class="font-label-sm text-label-sm text-primary-fixed mt-2">
                Aman untuk dialokasikan
              </p>
            </div>
          </div>
        </section>

        <!-- Middle Section: Bento Grid -->
        <section class="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
          <!-- Chart Area: Ringkasan Bulanan (Span 2 cols) -->
          <div class="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6 flex flex-col chart-container" id="chart-ringkasan">
            <div class="flex justify-between items-center mb-6">
              <h3 class="font-headline-md text-headline-md text-on-background">Ringkasan Bulanan</h3>
              <select
                v-model="chartPeriod"
                class="bg-surface-container-low border-none text-on-surface-variant font-label-sm text-label-sm rounded-lg focus:ring-primary px-3 py-2"
              >
                <option value="6bulan">6 Bulan Terakhir</option>
                <option value="bulanIni">Bulan Ini</option>
                <option value="bulanLalu">Bulan Lalu</option>
              </select>
            </div>
            <!-- SVG Line Chart -->
            <div
              ref="chartAreaRef"
              class="flex-1 min-h-[240px] relative w-full flex items-end justify-between px-2"
              @mousemove="onChartMouseMove"
              @mouseleave="onChartMouseLeave"
            >
              <!-- Grid lines -->
              <div class="absolute inset-0 flex flex-col justify-between pb-12 z-0">
                <div class="border-b border-outline-variant/10 w-full h-0"></div>
                <div class="border-b border-outline-variant/10 w-full h-0"></div>
                <div class="border-b border-outline-variant/10 w-full h-0"></div>
                <div class="border-b border-outline-variant/10 w-full h-0"></div>
              </div>

              <div class="relative z-10 w-full h-full flex flex-col justify-end">
                <svg ref="svgWrapperRef" class="w-full h-48 overflow-visible" viewBox="0 0 600 160" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#00a472" stop-opacity="0.2" />
                      <stop offset="100%" stop-color="#00a472" stop-opacity="0" />
                    </linearGradient>
                    <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#ba1a1a" stop-opacity="0.2" />
                      <stop offset="100%" stop-color="#ba1a1a" stop-opacity="0" />
                    </linearGradient>
                  </defs>
                  <!-- Income line + area -->
                  <path :d="incomePath" fill="none" stroke="#00a472" stroke-width="3" stroke-linecap="round" />
                  <path :d="incomeAreaPath" :fill="'url(#incomeGradient)'" />
                  <!-- Expense line + area -->
                  <path :d="expensePath" fill="none" stroke="#ba1a1a" stroke-width="3" stroke-linecap="round" />
                  <path :d="expenseAreaPath" :fill="'url(#expenseGradient)'" />
                </svg>

                <!-- Month labels -->
                <div class="flex justify-between px-4 mt-4 relative z-0">
                  <span
                    v-for="(d, i) in chartData"
                    :key="i"
                    class="font-label-sm text-label-sm w-8 text-center"
                    :class="i === activeChartIndex ? 'text-primary font-semibold' : 'text-outline'"
                  >{{ d.month }}</span>
                </div>
              </div>

              <!-- Interactive tooltip elements -->
              <div class="chart-guide-line" :style="guideStyle"></div>
              <div class="chart-point" style="border-color: #00a472;" :style="incomePointStyle"></div>
              <div class="chart-point" style="border-color: #ba1a1a;" :style="expensePointStyle"></div>
              <div class="chart-tooltip glass-ai rounded-xl p-3 shadow-lg min-w-[140px]" :style="tooltipStyle">
                <p class="font-label-md text-label-md text-[#1E293B] mb-2 border-b border-outline-variant/20 pb-1">{{ tooltipData.month }}</p>
                <div class="space-y-1">
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-[#00a472]"></span>
                      <span class="font-label-sm text-label-sm text-on-surface-variant">Pemasukan</span>
                    </div>
                    <span class="font-label-sm text-label-sm font-semibold text-[#00a472]">{{ tooltipData.income }}</span>
                  </div>
                  <div class="flex items-center justify-between gap-3">
                    <div class="flex items-center gap-1.5">
                      <span class="w-2 h-2 rounded-full bg-[#ba1a1a]"></span>
                      <span class="font-label-sm text-label-sm text-on-surface-variant">Pengeluaran</span>
                    </div>
                    <span class="font-label-sm text-label-sm font-semibold text-[#ba1a1a]">{{ tooltipData.expense }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Legend -->
            <div class="flex justify-center gap-6 mt-4 pt-4 border-t border-outline-variant/10 relative z-0">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-on-tertiary-container"></span>
                <span class="font-label-sm text-label-sm text-on-surface-variant">Pemasukan</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-error"></span>
                <span class="font-label-sm text-label-sm text-on-surface-variant">Pengeluaran</span>
              </div>
            </div>
          </div>

          <!-- Widget: Target Tabungan -->
          <div class="lg:col-span-1 flex flex-col gap-gutter">
            <!-- Goal Card -->
            <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6 flex-1" id="card-target-tabungan">
              <div class="flex justify-between items-center mb-6">
                <h3 class="font-headline-md text-headline-md text-on-background">Target Tabungan</h3>
                <RouterLink :to="`/target/${userID}`" class="text-secondary-container hover:text-secondary transition-colors" id="btn-add-goal">
                  <span class="material-symbols-outlined">{{ targetStore.selected ? 'arrow_forward' : 'add_circle' }}</span>
                </RouterLink>
              </div>
              <!-- Progress Item -->
              <div v-if="targetStore.selected" class="space-y-4">
                <div class="flex justify-between items-end">
                  <div>
                    <h4 class="font-label-md text-label-md text-on-background">{{ targetStore.selected.nama_target }}</h4>
                    <p class="font-label-sm text-label-sm text-on-surface-variant">Rp {{ totalTabungan.toLocaleString('id-ID') }} / Rp {{ targetStore.selected.nominal_target.toLocaleString('id-ID') }}</p>
                  </div>
                  <span class="font-label-md text-label-md text-primary">{{ progressTabungan.toFixed(1) }}%</span>
                </div>
                <!-- Progress Bar -->
                <div class="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-secondary-container to-secondary rounded-full" :style="{ width: progressTabungan + '%' }"></div>
                </div>
              </div>
              <div v-else class="py-4 text-center">
                <p class="font-body-md text-body-md text-on-surface-variant mb-2">Belum ada target aktif</p>
                <RouterLink :to="`/target/${userID}`" class="text-secondary font-label-md text-label-md hover:underline">Buat Target Sekarang</RouterLink>
              </div>

              <!-- AI Insight Card -->
              <div class="mt-8 p-4 bg-surface-container rounded-xl flex items-start gap-3 border border-outline-variant/10">
                <span class="material-symbols-outlined text-secondary-container text-xl">auto_awesome</span>
                <div>
                  <p class="font-label-md text-label-md text-on-background mb-1">AI Insight</p>
                  <p class="font-body-md text-body-md text-on-surface-variant text-sm">
                    Alokasikan sisa anggaran Rp {{ totalSisaAnggaran.toLocaleString('id-ID') }} bulan ini untuk mencapai target 15% lebih cepat.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Recent Transactions -->
        <section class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6" id="section-transaksi-terkini">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-headline-md text-headline-md text-on-background">Transaksi Terkini</h3>
            <RouterLink
              :to="`/transaksi/${userID}`"
              class="text-primary font-label-md text-label-md hover:underline"
            >
              Lihat Semua
            </RouterLink>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-left">
              <thead>
                <tr class="border-b border-outline-variant/10">
                  <th class="pb-4 font-label-md text-label-md text-on-surface-variant">Transaksi</th>
                  <th class="pb-4 font-label-md text-label-md text-on-surface-variant">Tanggal</th>
                  <th class="pb-4 font-label-md text-label-md text-on-surface-variant text-right">Jumlah</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-outline-variant/10">
                <!-- Empty state -->
                <tr v-if="recentTransactions.length === 0">
                  <td colspan="3" class="py-12 text-center text-on-surface-variant font-body-md text-body-md">
                    <span class="material-symbols-outlined text-4xl mb-2 block text-outline-variant">receipt_long</span>
                    Belum ada transaksi. Mulai catat pengeluaran Anda!
                  </td>
                </tr>
                <!-- Transaction Rows -->
                <tr
                  v-for="trx in recentTransactions"
                  :key="trx.id_transaksi"
                  class="hover:bg-surface-container-low transition-colors"
                >
                  <td class="py-4 flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center text-on-surface-variant">
                      <span class="material-symbols-outlined">{{ getCategoryIcon(trx) }}</span>
                    </div>
                    <div>
                      <p class="font-label-md text-label-md text-on-background">
                        {{ trx.nama_transaksi ?? trx.nama_toko ?? 'Transaksi' }}
                      </p>
                      <p class="font-label-sm text-label-sm text-on-surface-variant">
                        {{ getCategoryLabel(trx) }}
                      </p>
                    </div>
                  </td>
                  <td class="py-4 font-body-md text-body-md text-on-surface-variant">
                    {{ formatDate(trx.tanggal_transaksi) }}
                  </td>
                  <td class="py-4 font-label-md text-label-md text-right" :class="trx.jenis_transaksi === 'pemasukan' ? 'text-on-tertiary-container' : 'text-error'">
                    {{ trx.jenis_transaksi === 'pemasukan' ? '+' : '-' }} Rp {{ trx.nominal.toLocaleString('id-ID') }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Bottom padding for FAB clearance -->
        <div class="h-16"></div>
      </main>

      <ChatBot id="btn-ai-chatbot" />
    </div>

    <!-- Transaction Form Modal -->
    <FormTransaksi
      :show="showFormTransaksi"
      @update:show="showFormTransaksi = $event"
    />
  </div>
</template>