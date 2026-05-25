<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useTransaksiStore } from '@/stores/transaksi';
import { useAnggaranStore } from '@/stores/anggaran';
import ApexChart from 'vue3-apexcharts';
import type { ApexOptions } from 'apexcharts';

const transaksiStore = useTransaksiStore();
const authStore = useAuthStore();
const anggaranStore = useAnggaranStore();

const userID = computed(() => authStore.user?.id ?? '');

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

const ringkasanChartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'line',
    toolbar: { show: false }
  },
  markers: { size: 4 },
  dataLabels: { enabled: false },
  stroke: { show: true, width: 3, curve: 'straight' },
  xaxis: {
    categories: ringkasan6BulanApex.value.categories
  },
  yaxis: {
    min: 0,
    labels: {
      formatter: (value: number) => value.toLocaleString('id-ID')
    }
  },
  tooltip: {
    y: {
      formatter: (value: number) => value.toLocaleString('id-ID')
    }
  },
  legend: { position: 'top' },
  colors: ['#16a34a', '#ef4444']
}));

const ringkasanSeries = computed(() => ringkasan6BulanApex.value.series);

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
  <section class="dashboard-summary">
    <div class="summary-card">
      <p class="summary-label">Total Pemasukan</p>
      <p class="summary-value">{{ totalPemasukan.toLocaleString('id-ID') }}</p>
    </div>
    <div class="summary-card">
      <p class="summary-label">Total Pengeluaran</p>
      <p class="summary-value">{{ totalPengeluaran.toLocaleString('id-ID') }}</p>
    </div>
    <div class="summary-card">
      <p class="summary-label">Sisa Anggaran</p>
      <p class="summary-value">{{ totalSisaAnggaran.toLocaleString('id-ID') }}</p>
    </div>
  </section>

  <section class="dashboard-summary">
    <div class="summary-card chart-card">
      <p class="summary-label">Ringkasan 6 Bulan Terakhir</p>
      <ApexChart
        height="300"
        type="line"
        :options="ringkasanChartOptions"
        :series="ringkasanSeries"
      />
    </div>
  </section>
</template>

<style scoped>
.dashboard-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  padding: 16px 0;
}

.summary-card {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 12px 16px;
  background: #ffffff;
}

.chart-card {
  padding: 16px;
}

.summary-label {
  margin: 0 0 8px;
  font-size: 14px;
  color: #6b7280;
}

.summary-value {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}
</style>