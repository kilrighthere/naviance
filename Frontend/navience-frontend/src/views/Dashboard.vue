<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useTransaksiStore } from '@/stores/transaksi';
import { useAnggaranStore } from '@/stores/anggaran';
import ApexChart from 'vue3-apexcharts';
import type { ApexOptions } from 'apexcharts';
import Sidebar from '@/components/sidebar.vue';
import ChatBot from '@/components/chatBot.vue';

const transaksiStore = useTransaksiStore();
const authStore = useAuthStore();
const anggaranStore = useAnggaranStore();

const userID = computed(() => authStore.user?.id ?? '');
const userName = computed(() => authStore.user?.user_metadata?.nama_lengkap ?? 'User');

const { transaksiByJenis, ringkasan6BulanApex } = storeToRefs(transaksiStore);
const { items: anggaranItems, anggaranTerpakai } = storeToRefs(anggaranStore);

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

// Chart configuration: bar chart matching the reference design
const ringkasanChartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Inter, sans-serif',
    background: 'transparent',
  },
  plotOptions: {
    bar: {
      columnWidth: '35%',
      borderRadius: 4,
      borderRadiusApplication: 'end',
    }
  },
  dataLabels: { enabled: false },
  stroke: { show: false },
  xaxis: {
    categories: ringkasan6BulanApex.value.categories,
    labels: {
      style: {
        colors: '#75777d',
        fontFamily: 'Inter',
        fontSize: '12px',
        fontWeight: 500,
      }
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    show: false,
    min: 0,
    labels: {
      formatter: (value: number) => value.toLocaleString('id-ID')
    }
  },
  grid: {
    borderColor: '#c5c6cd20',
    strokeDashArray: 0,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { left: 8, right: 8 },
  },
  tooltip: {
    y: {
      formatter: (value: number) => 'Rp ' + value.toLocaleString('id-ID')
    }
  },
  legend: {
    position: 'bottom',
    fontFamily: 'Inter',
    fontSize: '12px',
    fontWeight: 500,
    labels: { colors: '#45474c' },
    markers: {
      size: 6,
      shape: 'circle',
    },
    itemMargin: { horizontal: 16 },
  },
  colors: ['#00a472', '#ba1a1a'],
  fill: {
    opacity: 1,
  },
}));

const ringkasanSeries = computed(() => ringkasan6BulanApex.value.series);

// Recent transactions (latest 5)
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

// Sidebar ref
const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null);
const isSidebarMinimized = computed(() => sidebarRef.value?.isMinimized ?? false);

// Chart period selector
const chartPeriod = ref('6bulan');

const loadData = async (id: string) => {
  if (!id) return;
  await Promise.all([
    transaksiStore.fetchAll(id),
    anggaranStore.fetchAll(id)
  ]);
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
          <h2 class="font-headline-md text-headline-md text-primary">Overview</h2>
        </div>
        <div class="flex items-center gap-6 text-on-surface-variant">
          <button class="hover:text-primary transition-colors relative" id="btn-notifications">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <button class="hover:text-primary transition-colors flex items-center" id="btn-profile">
            <span class="material-symbols-outlined text-3xl">account_circle</span>
          </button>
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
            >
              <span class="material-symbols-outlined">add</span>
              Tambah Transaksi
            </button>
            <button
              id="btn-scan-ocr"
              class="flex items-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-xl shadow-sm hover:bg-primary/90 transition-colors"
            >
              <span class="material-symbols-outlined">document_scanner</span>
              Scan Struk (OCR)
            </button>
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
          <div class="lg:col-span-2 bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6 flex flex-col" id="chart-ringkasan">
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
            <div class="flex-1 min-h-[280px]">
              <ApexChart
                height="280"
                type="bar"
                :options="ringkasanChartOptions"
                :series="ringkasanSeries"
              />
            </div>
          </div>

          <!-- Widget: Target Tabungan -->
          <div class="lg:col-span-1 flex flex-col gap-gutter">
            <!-- Goal Card -->
            <div class="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-6 flex-1" id="card-target-tabungan">
              <div class="flex justify-between items-center mb-6">
                <h3 class="font-headline-md text-headline-md text-on-background">Target Tabungan</h3>
                <button class="text-secondary-container hover:text-secondary transition-colors" id="btn-add-goal">
                  <span class="material-symbols-outlined">add_circle</span>
                </button>
              </div>
              <!-- Progress Item -->
              <div class="space-y-4">
                <div class="flex justify-between items-end">
                  <div>
                    <h4 class="font-label-md text-label-md text-on-background">Dana Darurat</h4>
                    <p class="font-label-sm text-label-sm text-on-surface-variant">Rp 10.000.000 / Rp 50.000.000</p>
                  </div>
                  <span class="font-label-md text-label-md text-primary">20%</span>
                </div>
                <!-- Progress Bar -->
                <div class="w-full h-3 bg-surface-container-high rounded-full overflow-hidden">
                  <div class="h-full bg-gradient-to-r from-secondary-container to-secondary rounded-full" style="width: 20%;"></div>
                </div>
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
  </div>
</template>