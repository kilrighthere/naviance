<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTransaksiStore } from '@/stores/transaksi';
import Sidebar from '@/components/sidebar.vue';
import ChatBot from '@/components/chatBot.vue';
import FormTransaksi from '@/components/formTransaksi.vue';
import { CATEGORIES } from '@/types/transaksi';
import LoadingScreen from '@/components/loading.vue';
import ProfileDropdown from '@/components/profile.vue';

const authStore = useAuthStore();
const transaksiStore = useTransaksiStore();

const userID = computed(() => authStore.user?.id ?? '');

const isModalOpen = ref(false);
const modalMode = ref<'create' | 'edit'>('create');
const activeTransaksiId = ref<string | null>(null);
const isDropdownOpen = ref(false);

const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null);
const isSidebarMinimized = computed(() => sidebarRef.value?.isMinimized ?? false);

const categoriesMap = computed(() => {
  const map: Record<string, string> = {};
  for (const kat of CATEGORIES) {
    map[kat.id_kategori] = kat.nama_kategori;
  }
  return map;
});

const isPageLoading = ref(true);

const loadData = async (id: string) => {
  if (!id) return;
  isPageLoading.value = true;
  await transaksiStore.fetchAll(id);
  isPageLoading.value = false;
};

onMounted(() => {
  if (userID.value) {
    loadData(userID.value);
  }
});

watch(userID, (id) => {
  if (id) {
    loadData(id);
  }
});

const getCategoryIcon = (item: any) => {
  const name = (item.nama_transaksi ?? '').toLowerCase();
  const kat = (item.id_kategori ?? '').toLowerCase();
  
  if (kat.includes('makanan') || name.includes('coffee') || name.includes('makan') || name.includes('starbucks') || name.includes('resto')) return 'restaurant';
  if (kat.includes('gaji') || name.includes('gaji') || name.includes('salary') || name.includes('pendapatan')) return 'payments';
  if (kat.includes('belanja') || name.includes('uniqlo') || name.includes('store') || name.includes('toko')) return 'shopping_bag';
  if (kat.includes('transportasi') || name.includes('gojek') || name.includes('grab') || name.includes('transport')) return 'directions_car';
  if (kat.includes('hiburan') || name.includes('netflix') || name.includes('spotify')) return 'subscriptions';
  if (kat.includes('utilitas') || name.includes('listrik') || name.includes('air') || name.includes('gas')) return 'bolt';
  if (item.jenis_transaksi === 'pemasukan') return 'payments';
  return 'receipt_long';
};

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

const openModal = (mode: 'create' | 'edit', trx?: any) => {
  modalMode.value = mode;
  if (mode === 'create') {
    transaksiStore.resetPayload();
    activeTransaksiId.value = null;
  } else if (trx) {
    activeTransaksiId.value = trx.id_transaksi;
    transaksiStore.setPayload({ ...trx });
  }
  isModalOpen.value = true;
};
</script>

<template>
  <div class="bg-background text-on-background flex h-screen overflow-hidden">
    <!-- Loading Screen -->
    <LoadingScreen :is-loading="isPageLoading" message="Memuat transaksi..." />

    <!-- Sidebar Component -->
    <Sidebar ref="sidebarRef" />

    <!-- Main Content Wrapper -->
    <div
      class="dashboard-main-content flex-1 flex flex-col h-full bg-background relative min-w-0 overflow-x-hidden"
      :class="{ 'content-expanded': isSidebarMinimized }"
    >
      <!-- Top App Bar -->
      <header class="flex justify-between items-center w-full px-margin-mobile lg:px-margin-desktop h-16 lg:h-20 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-10">
        <div class="flex items-center gap-3 flex-1 min-w-0">
          <button
            class="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors shrink-0"
            @click="sidebarRef?.toggleMobile()"
          >
            <span class="material-symbols-outlined">menu</span>
          </button>
          <div class="flex items-center flex-1 min-w-0 max-w-md">
            <div class="relative w-full min-w-0">
              <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
              <input 
                v-model="transaksiStore.searchQuery" 
                class="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant/30 rounded-full focus:outline-none focus:border-primary focus:ring-2 focus:ring-secondary-container/20 transition-all font-body-md text-body-md text-on-surface placeholder:text-on-surface-variant/70 min-w-0" 
                placeholder="Cari transaksi..." 
                type="text"
              />
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4 shrink-0 ml-3">
          <ProfileDropdown />
        </div>
      </header>

      <!-- Scrollable Dashboard Canvas -->
      <main class="flex-1 overflow-y-auto overflow-x-hidden px-margin-mobile lg:px-margin-desktop pb-margin-mobile lg:pb-margin-desktop pt-4 w-full">
        <!-- Page Header & Actions -->
        <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 mb-6 md:mb-8 w-full">
          <div class="flex-1 min-w-0">
            <h2 class="text-headline-lg-mobile md:text-headline-lg font-headline-lg-mobile md:font-headline-lg text-on-surface mb-2 truncate">Riwayat Transaksi</h2>
            <p class="text-body-md font-body-md text-on-surface-variant truncate">Kelola dan pantau arus kas Anda secara presisi.</p>
          </div>
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <!-- Filters -->
            <div class="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div class="relative w-full">
                <select v-model="transaksiStore.filterCategory" class="w-full appearance-none px-4 py-2 pl-10 pr-8 rounded-full border border-outline-variant/50 bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors shadow-sm focus:outline-none focus:border-primary cursor-pointer sm:min-w-[140px] capitalize truncate">
                  <option value="">Semua Kategori</option>
                  <option v-for="kat in CATEGORIES" :key="kat.id_kategori" :value="kat.id_kategori" class="capitalize">{{ kat.nama_kategori }}</option>
                </select>
                <span class="material-symbols-outlined text-[18px] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">filter_list</span>
                <span class="material-symbols-outlined text-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">arrow_drop_down</span>
              </div>
              <div class="relative w-full">
                <select v-model="transaksiStore.filterTimeRange" class="w-full appearance-none px-4 py-2 pl-10 pr-8 rounded-full border border-outline-variant/50 bg-surface-container-lowest text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors shadow-sm focus:outline-none focus:border-primary cursor-pointer sm:min-w-[150px] truncate">
                  <option value="">Semua Waktu</option>
                  <option value="7d">7 Hari</option>
                  <option value="30d">30 Hari</option>
                  <option value="this_month">Bulan Ini</option>
                </select>
                <span class="material-symbols-outlined text-[18px] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">calendar_today</span>
                <span class="material-symbols-outlined text-[18px] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">arrow_drop_down</span>
              </div>
            </div>
            
            <!-- Primary Action -->
            <div class="w-full sm:w-auto mt-1 sm:mt-0">
              <button @click="openModal('create')" class="w-full sm:w-auto bg-primary text-on-primary rounded-full px-6 py-2.5 font-label-md text-label-md flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(30,41,59,0.15)] hover:bg-primary/90 transition-colors">
                <span class="material-symbols-outlined shrink-0">add</span>
                <span class="truncate">Input Transaksi</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Data Table Card -->
        <div class="bg-surface-container-lowest rounded-2xl border border-outline-variant/30 shadow-[0_4px_12px_rgba(30,41,59,0.03)] overflow-x-auto max-w-container-max mx-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="border-b border-surface-variant bg-surface-container-low/30">
                <th class="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-medium">Tanggal</th>
                <th class="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-medium">Merchant / Transaksi</th>
                <th class="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-medium">Kategori</th>
                <th class="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-medium text-right cursor-pointer hover:text-on-surface" @click="transaksiStore.setSortNominal(transaksiStore.sortNominal === 'asc' ? 'desc' : 'asc')">
                  Nominal 
                  <span v-if="transaksiStore.sortNominal === 'asc'">↑</span>
                  <span v-if="transaksiStore.sortNominal === 'desc'">↓</span>
                </th>
                <th class="px-6 py-4 font-label-md text-label-md text-on-surface-variant font-medium text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="font-body-md text-body-md">
              <tr v-if="transaksiStore.isLoading" class="border-b border-surface-variant/50">
                <td colspan="5" class="px-6 py-10 text-center text-on-surface-variant">
                  <span class="material-symbols-outlined animate-spin text-3xl">progress_activity</span>
                  <p class="mt-2">Memuat data...</p>
                </td>
              </tr>
              <tr v-else-if="!transaksiStore.hasItems || transaksiStore.sortedItems.length === 0" class="border-b border-surface-variant/50">
                <td colspan="5" class="px-6 py-10 text-center text-on-surface-variant">
                  <span class="material-symbols-outlined text-4xl mb-2 text-outline-variant block">receipt_long</span>
                  Belum ada transaksi ditemukan.
                </td>
              </tr>
              
              <tr 
                v-for="trx in transaksiStore.sortedItems" 
                :key="trx.id_transaksi" 
                class="border-b border-surface-variant/50 hover:bg-surface-container-lowest/80 transition-all duration-150 group"
                :class="trx.jenis_transaksi === 'pemasukan' ? 'hover:shadow-[inset_4px_0_0_0_#00a472]' : 'hover:shadow-[inset_4px_0_0_0_#1e293b]'"
              >
                <td class="px-6 py-5 text-on-surface-variant whitespace-nowrap">{{ formatDate(trx.tanggal_transaksi) }}</td>
                <td class="px-6 py-5">
                  <div class="flex items-center gap-4">
                    <div 
                      class="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                      :class="trx.jenis_transaksi === 'pemasukan' 
                        ? 'bg-tertiary-fixed/30 text-on-tertiary-container group-hover:bg-tertiary-container group-hover:text-on-tertiary' 
                        : 'bg-surface-container text-primary group-hover:bg-primary group-hover:text-on-primary'"
                    >
                      <span class="material-symbols-outlined text-xl">{{ getCategoryIcon(trx) }}</span>
                    </div>
                    <div>
                      <div class="text-on-surface font-medium">{{ trx.nama_transaksi ?? trx.nama_toko ?? 'Transaksi' }}</div>
                      <div class="text-label-sm font-label-sm text-on-surface-variant/70">{{ trx.deskripsi ?? (trx.nama_toko ? 'Toko' : 'Detail') }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-5">
                  <span 
                    class="px-3 py-1 rounded-md font-label-sm text-label-sm whitespace-nowrap capitalize"
                    :class="trx.jenis_transaksi === 'pemasukan' 
                      ? 'bg-tertiary-fixed/30 border border-tertiary-fixed/50 text-on-tertiary-container'
                      : 'bg-surface-container-high/50 border border-outline-variant/20 text-on-surface-variant'"
                  >
                    {{ categoriesMap[trx.id_kategori] || 'Lainnya' }}
                  </span>
                </td>
                <td class="px-6 py-5 text-right font-medium" :class="trx.jenis_transaksi === 'pemasukan' ? 'text-on-tertiary-container' : 'text-on-surface'">
                  {{ trx.jenis_transaksi === 'pemasukan' ? '+' : '-' }} Rp {{ trx.nominal?.toLocaleString('id-ID') || 0 }}                </td>
                <td class="px-6 py-5 text-center">
                  <button class="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container-low transition-colors" @click="openModal('edit', trx)" title="Ubah Transaksi">
                    <span class="material-symbols-outlined">more_horiz</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- Pagination Control -->
          <div class="px-6 py-4 border-t border-surface-variant bg-surface-container-lowest flex items-center justify-between">
            <span class="text-label-sm font-label-sm text-on-surface-variant">
              Total {{ transaksiStore.sortedItems.length }} transaksi
            </span>
            <div class="flex gap-2">
              <button class="p-1 rounded hover:bg-surface-container-low text-on-surface-variant disabled:opacity-50"><span class="material-symbols-outlined">chevron_left</span></button>
              <button class="p-1 rounded hover:bg-surface-container-low text-on-surface"><span class="material-symbols-outlined">chevron_right</span></button>
            </div>
          </div>
        </div>
        
        <div class="h-16"></div>
      </main>

      <ChatBot id="btn-ai-chatbot" />
    </div>
    
    <!-- Modal Transaksi -->
    <FormTransaksi v-model:show="isModalOpen" :mode="modalMode" :transaksi-id="activeTransaksiId" />
  </div>
</template>
