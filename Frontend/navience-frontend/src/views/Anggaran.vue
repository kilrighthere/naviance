<script lang="ts">
export default {
  name: 'AnggaranView'
};
</script>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import { useTransaksiStore } from '@/stores/transaksi';
import { useAnggaranStore } from '@/stores/anggaran';
import Sidebar from '@/components/sidebar.vue';
import ChatBot from '@/components/chatBot.vue';
import ProfileDropdown from '@/components/profile.vue';
import { CATEGORIES } from '@/types/transaksi';

const transaksiStore = useTransaksiStore();
const authStore = useAuthStore();
const anggaranStore = useAnggaranStore();

const userID = computed(() => authStore.user?.id ?? '');

const { items: anggaranItems, anggaranTerpakai } = storeToRefs(anggaranStore);
const { items: transaksiItems } = storeToRefs(transaksiStore);

const periodeAktif = computed(() => {
  const now = new Date();
  return now.toISOString().slice(0, 7);
});

const monthDisplay = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
});

const filteredAnggaran = computed(() => {
  // Hanya ambil anggaran untuk periode bulan ini
  const aktif = anggaranItems.value.filter(item => item.periode.slice(0, 7) === periodeAktif.value || item.periode === anggaranStore.periodeIns.toDateString());
  return aktif;
});

const totalAlokasi = computed(() => {
  return filteredAnggaran.value.reduce((sum, item) => sum + (item.total_anggaran ?? 0), 0);
});

const totalDigunakan = computed(() => {
  // Hitung total pengeluaran untuk kategori yang ada anggarannya pada bulan ini
  const kategoriAktif = new Set(filteredAnggaran.value.map(item => item.id_kategori));
  return transaksiItems.value
    .filter(item => item.jenis_transaksi === 'pengeluaran' && item.tanggal_transaksi.slice(0, 7) === periodeAktif.value && kategoriAktif.has(item.id_kategori))
    .reduce((sum, item) => sum + item.nominal, 0);
});

const sisaAnggaran = computed(() => {
  return Math.max(totalAlokasi.value - totalDigunakan.value, 0);
});

const percentageDigunakan = computed(() => {
  if (totalAlokasi.value === 0) return 0;
  const pct = Math.round((totalDigunakan.value / totalAlokasi.value) * 100);
  return Math.min(pct, 100);
});

const sisaPercentage = computed(() => {
  return Math.max(100 - percentageDigunakan.value, 0);
});

// -- Kategori Details --
const kategoriProgress = computed(() => {
  return filteredAnggaran.value.map(anggaran => {
    const kategori = CATEGORIES.find(c => c.id_kategori === anggaran.id_kategori);
    const nama = kategori ? kategori.nama_kategori : 'Lainnya';
    const terpakai = anggaranTerpakai.value.get(anggaran.id_kategori) ?? 0;
    const batas = anggaran.total_anggaran ?? 0;
    const pct = batas > 0 ? Math.min((terpakai / batas) * 100, 100) : 0;
    
    // Tentukan warna bar: merah (error) jika >=90%, kuning (secondary) jika >=70%, hijau (tertiary-fixed-dim) jika aman
    let barColor = 'bg-tertiary-fixed-dim';
    if (pct >= 90) barColor = 'bg-error';
    else if (pct >= 70) barColor = 'bg-secondary';

    return {
      id: anggaran.id_anggaran,
      id_kategori: anggaran.id_kategori,
      nama,
      batas,
      terpakai,
      pct,
      barColor,
      icon: getIconForCategory(nama)
    };
  }).sort((a, b) => b.terpakai - a.terpakai); // Urutkan berdasarkan yang paling banyak terpakai
});

const getIconForCategory = (nama: string) => {
  const n = nama.toLowerCase();
  if (n.includes('makanan')) return 'restaurant';
  if (n.includes('fashion')) return 'apparel';
  if (n.includes('kesehatan')) return 'favorite';
  if (n.includes('transportasi')) return 'directions_bus';
  if (n.includes('pendidikan')) return 'school';
  if (n.includes('belanja')) return 'shopping_cart';
  if (n.includes('hiburan')) return 'theater_comedy';
  if (n.includes('investasi')) return 'trending_up';
  if (n.includes('tagihan')) return 'receipt';
  if (n.includes('tabungan')) return 'savings';
  if (n.includes('lainnya')) return 'more_horiz';
  return 'category';
};

// Kategori pengeluaran (exclude income categories: gaji, bonus)
const EXPENSE_CATEGORIES = CATEGORIES.filter(
  c => !['gaji', 'bonus'].includes(c.nama_kategori)
);

// -- Modal Atur Anggaran --
const showModal = ref(false);
const formTotalAnggaran = ref('');
const formInputs = ref<Record<string, string>>({});
const saveError = ref('');
const isSaving = ref(false);

// ID kategori "lainnya" untuk menyimpan sisa anggaran yang belum dialokasikan
const LAINNYA_KATEGORI_ID = CATEGORIES.find(c => c.nama_kategori === 'lainnya')?.id_kategori ?? '';

// Format number to Indonesian locale string (e.g. 2.500.000)
const formatRupiah = (val: number): string => {
  if (!val || val === 0) return '';
  return val.toLocaleString('id-ID');
};

// Parse formatted rupiah string back to number
const parseRupiah = (str: string): number => {
  if (!str) return 0;
  return Number(str.replace(/\./g, '').replace(/,/g, '')) || 0;
};

const openAturAnggaran = () => {
  saveError.value = '';
  
  // Populate total anggaran from sum of existing
  const existingTotal = filteredAnggaran.value.reduce((sum, a) => sum + (a.total_anggaran ?? 0), 0);
  formTotalAnggaran.value = existingTotal > 0 ? formatRupiah(existingTotal) : '';
  
  // Populate form inputs with existing anggaran values
  formInputs.value = {};
  for (const kat of EXPENSE_CATEGORIES) {
    const existing = filteredAnggaran.value.find(a => a.id_kategori === kat.id_kategori);
    formInputs.value[kat.id_kategori] = existing && existing.total_anggaran > 0 
      ? formatRupiah(existing.total_anggaran) 
      : '';
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  saveError.value = '';
};

// Handle formatting on input for Total Anggaran
const onTotalInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const raw = target.value.replace(/\D/g, '');
  const num = Number(raw) || 0;
  formTotalAnggaran.value = num > 0 ? formatRupiah(num) : '';
};

// Handle formatting on input for category inputs
const onCategoryInput = (kategoriId: string, e: Event) => {
  const target = e.target as HTMLInputElement;
  const raw = target.value.replace(/\D/g, '');
  const num = Number(raw) || 0;
  formInputs.value[kategoriId] = num > 0 ? formatRupiah(num) : '';
};

// Computed: total allocated across categories in the modal
const modalTotalTeralokasi = computed(() => {
  return EXPENSE_CATEGORIES.reduce((sum, kat) => {
    return sum + parseRupiah(formInputs.value[kat.id_kategori] ?? '');
  }, 0);
});

// Computed: total budget set by user in the top field
const modalTotalAnggaran = computed(() => parseRupiah(formTotalAnggaran.value));

// Computed: remaining budget in the modal
const modalSisaAnggaran = computed(() => {
  return Math.max(modalTotalAnggaran.value - modalTotalTeralokasi.value, 0);
});

// Computed: allocation percentage for the progress bar
const modalAllokasiPct = computed(() => {
  if (modalTotalAnggaran.value === 0) return 0;
  return Math.min(Math.round((modalTotalTeralokasi.value / modalTotalAnggaran.value) * 100), 100);
});

// Computed: warning states
const isOverBudget = computed(() => modalTotalTeralokasi.value > modalTotalAnggaran.value);
const overBudgetAmount = computed(() => Math.max(modalTotalTeralokasi.value - modalTotalAnggaran.value, 0));

const saveAnggaran = async () => {
  if (!userID.value) return;
  
  saveError.value = '';
  const total = modalTotalAnggaran.value;
  const kategoriSum = modalTotalTeralokasi.value;

  // Validasi: harus ada total anggaran
  if (total <= 0) {
    saveError.value = 'Total anggaran harus lebih dari 0.';
    return;
  }

  // Validasi: total kategori tidak boleh melebihi total anggaran
  if (kategoriSum > total) {
    saveError.value = 'Total alokasi kategori melebihi total anggaran.';
    return;
  }

  isSaving.value = true;
  
  try {
    const promises = [];
    
    // Hitung sisa yang belum dialokasikan ke kategori tertentu
    const sisaBelumAlokasi = total - kategoriSum;
    
    for (const kategori of EXPENSE_CATEGORIES) {
      let val = parseRupiah(formInputs.value[kategori.id_kategori] ?? '');
      
      // Jika ada sisa anggaran belum dialokasi, masukkan ke "lainnya"
      if (kategori.id_kategori === LAINNYA_KATEGORI_ID && sisaBelumAlokasi > 0) {
        val += sisaBelumAlokasi;
      }
      
      const existing = filteredAnggaran.value.find(a => a.id_kategori === kategori.id_kategori);
      
      if (val > 0) {
        if (existing) {
          if (existing.total_anggaran !== val) {
            promises.push(anggaranStore.updateAnggaran(userID.value, existing.id_anggaran, {
              ...existing,
              total_anggaran: val
            }));
          }
        } else {
          promises.push(anggaranStore.createAnggaran(userID.value, {
            id_kategori: kategori.id_kategori,
            periode: anggaranStore.periodeIns.toDateString(),
            total_anggaran: val
          }));
        }
      } else if (val === 0 && existing) {
        promises.push(anggaranStore.deleteAnggaran(userID.value, existing.id_anggaran));
      }
    }

    const results = await Promise.allSettled(promises);
    const failures = results.filter(r => r.status === 'rejected');
    
    if (failures.length > 0) {
      saveError.value = `${failures.length} operasi gagal. Silakan coba lagi.`;
    }
    
    await anggaranStore.fetchAll(userID.value);
    
    if (failures.length === 0) {
      closeModal();
    }
  } catch (e) {
    saveError.value = e instanceof Error ? e.message : 'Terjadi kesalahan saat menyimpan.';
  } finally {
    isSaving.value = false;
  }
};


const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null);
const isSidebarMinimized = computed(() => sidebarRef.value?.isMinimized ?? false);

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
  <div class="bg-surface text-on-surface font-sans antialiased overflow-x-hidden flex h-screen w-full">
    <!-- Sidebar Component -->
    <Sidebar ref="sidebarRef" />

    <!-- Main Content Wrapper -->
    <div 
      class="dashboard-main-content flex-1 flex flex-col h-full bg-background relative"
      :class="{ 'content-expanded': isSidebarMinimized }"
    >
      <!-- Page Header with Profile Dropdown included in flex layout (Dashboard style) -->
      <header class="flex justify-between items-center w-full px-margin-mobile lg:px-margin-desktop h-16 lg:h-20 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-10">
        <div class="flex items-center gap-3 lg:gap-4">
          <button
            class="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
            @click="sidebarRef?.toggleMobile()"
          >
            <span class="material-symbols-outlined">menu</span>
          </button>
          <h2 class="font-headline-md text-headline-md text-primary tracking-tight">Anggaran</h2>
        </div>
        <div class="flex items-center gap-4 lg:gap-6 text-on-surface-variant">

          <ProfileDropdown />
        </div>
      </header>

      <main class="flex-1 overflow-y-auto px-margin-mobile pb-margin-mobile pt-4 md:px-margin-desktop md:pb-margin-desktop space-y-8">
        <!-- Subheader -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary tracking-tight">Anggaran</h2>
            <p class="font-body-md text-body-md text-on-surface-variant mt-1">Kelola arus kas saat ini dan antisipasi pengeluaran masa depan.</p>
          </div>
          <div class="relative flex items-center bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-1 shadow-sm">
            <button class="px-4 py-2 font-label-md text-label-md rounded-md bg-primary-container text-white font-bold">
              {{ monthDisplay }}
            </button>
            <button class="p-2 text-on-surface-variant hover:text-primary flex items-center transition-colors">
              <span class="material-symbols-outlined">calendar_month</span>
            </button>
          </div>
        </div>

        <!-- Bento Grid Layout -->
        <div class="grid grid-cols-1 gap-gutter">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-gutter w-full items-stretch">
            
            <!-- LEFT COLUMN: Status Anggaran -->
            <div class="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_12px_rgba(30,41,59,0.05)] border border-outline-variant/20 relative overflow-hidden h-full flex flex-col">
              <div class="flex justify-between items-start mb-8">
                <div>
                  <h3 class="font-headline-md text-headline-md text-primary">Status Anggaran</h3>
                  <p class="font-body-md text-body-md text-on-surface-variant">{{ monthDisplay }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <button 
                    @click="openAturAnggaran"
                    class="flex items-center gap-2 px-4 py-2 bg-secondary-container text-on-secondary-container rounded-lg font-label-md text-label-md hover:opacity-90 transition-opacity"
                  >
                    <span class="material-symbols-outlined text-sm">edit</span> Atur Anggaran
                  </button>
                </div>
              </div>
              
              <div class="flex-1 flex flex-col items-center justify-center gap-8">
                <!-- Donut Chart representation -->
                <div class="relative flex-shrink-0 w-48 h-48 md:w-64 md:h-64">
                  <svg class="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle class="stroke-tertiary-fixed-dim" cx="18" cy="18" fill="none" r="16" stroke-width="3.5"></circle>
                    <circle class="stroke-primary" cx="18" cy="18" fill="none" r="16" :stroke-dasharray="`${percentageDigunakan}, 100`" stroke-linecap="round" stroke-width="3.5"></circle>
                  </svg>
                  <div class="absolute inset-0 flex flex-col items-center justify-center">
                    <span class="font-label-sm text-on-surface-variant uppercase tracking-widest text-label-md">Total Digunakan</span>
                    <span class="font-display-lg text-primary leading-none mt-1 text-display-lg">{{ percentageDigunakan }}%</span>
                  </div>
                </div>
                
                <div class="flex flex-col gap-4 w-full">
                  <div class="flex items-center justify-between group">
                    <div class="flex items-center gap-3">
                      <div class="w-4 h-4 rounded-full bg-primary"></div>
                      <div class="flex flex-col">
                        <span class="font-label-md text-label-md text-on-surface-variant">Anggaran Terpakai</span>
                        <span class="font-body-md font-bold text-primary">Rp {{ totalDigunakan.toLocaleString('id-ID') }}</span>
                      </div>
                    </div>
                    <span class="font-label-md text-label-md bg-surface-container-high px-2 py-1 rounded-md text-primary">{{ percentageDigunakan }}%</span>
                  </div>
                  
                  <div class="flex items-center justify-between group">
                    <div class="flex items-center gap-3">
                      <div class="w-4 h-4 rounded-full bg-tertiary-fixed-dim"></div>
                      <div class="flex flex-col">
                        <span class="font-label-md text-label-md text-on-surface-variant">Sisa Anggaran</span>
                        <span class="font-body-md font-bold text-on-tertiary-container">Rp {{ sisaAnggaran.toLocaleString('id-ID') }}</span>
                      </div>
                    </div>
                    <span class="font-label-md text-label-md bg-tertiary-container/10 px-2 py-1 rounded-md text-on-tertiary-container">{{ sisaPercentage }}%</span>
                  </div>
                  
                  <div class="pt-4 border-t border-outline-variant/20 flex justify-between items-center">
                    <span class="font-label-sm text-label-sm text-on-surface-variant">Total Alokasi</span>
                    <span class="font-label-md text-label-md text-primary font-bold">Rp {{ totalAlokasi.toLocaleString('id-ID') }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- RIGHT COLUMN: Kategori Pengeluaran Terbesar -->
            <div class="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_4px_12px_rgba(30,41,59,0.05)] border border-outline-variant/20 h-full flex flex-col">
              <div class="flex justify-between items-center mb-6">
                <h3 class="font-label-md text-label-md text-primary uppercase tracking-wider">Kategori Pengeluaran Terbesar</h3>
              </div>
              
              <div class="space-y-6 flex-1 overflow-y-auto pr-2">
                <div v-if="kategoriProgress.length === 0" class="text-center py-10 text-on-surface-variant">
                  <span class="material-symbols-outlined text-4xl block mb-2 text-outline-variant">category</span>
                  Belum ada anggaran. Silakan Atur Anggaran.
                </div>

                <div v-for="kat in kategoriProgress" :key="kat.id_kategori">
                  <div class="flex justify-between items-center mb-2">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                        <span class="material-symbols-outlined">{{ kat.icon }}</span>
                      </div>
                      <div>
                        <p class="font-label-md text-label-md text-primary capitalize">{{ kat.nama }}</p>
                        <p class="font-label-sm text-label-sm text-on-surface-variant">Batas: Rp {{ kat.batas.toLocaleString('id-ID') }}</p>
                      </div>
                    </div>
                    <span class="font-label-md text-label-md" :class="kat.pct >= 90 ? 'text-error' : 'text-primary'">
                      Rp {{ kat.terpakai.toLocaleString('id-ID') }}
                    </span>
                  </div>
                  <div class="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-500" :class="kat.barColor" :style="{ width: `${kat.pct}%` }"></div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
        
        <div class="h-24"></div> <!-- Padding for FAB -->
      </main>

      <ChatBot />
    </div>

    <!-- MODAL ATUR ANGGARAN -->
    <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-primary/10 backdrop-blur-[2px]" @click="closeModal"></div>
      <div class="relative bg-white w-full max-w-[540px] rounded-2xl shadow-[0_8px_24px_rgba(30,41,59,0.10)] border border-[#E2E8F0] overflow-hidden flex flex-col h-[85vh] max-h-[850px] z-10">
        
        <!-- Header -->
        <div class="p-6 border-b border-surface-variant/50 flex justify-between items-center shrink-0">
          <h3 class="font-headline-md text-headline-md text-primary leading-tight">Atur Anggaran Bulanan</h3>
          <button @click="closeModal" class="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-high shrink-0">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Total Anggaran Input -->
        <div class="p-6 border-b border-surface-variant/50 shrink-0 bg-surface-bright">
          <label class="block font-label-md text-label-md text-on-surface mb-2">Total Anggaran (Rp)</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 font-body-md text-on-surface-variant">Rp</span>
            <input 
              :value="formTotalAnggaran" 
              @input="onTotalInput" 
              class="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md bg-white text-lg font-semibold" 
              placeholder="Misal 15.000.000" 
              type="text"
            >
          </div>
          <p class="font-body-md text-sm text-on-surface-variant mt-2">Alokasikan dana untuk semua pengeluaran bulan ini.</p>
        </div>

        <!-- Scrollable Category List -->
        <div class="flex-1 overflow-y-auto p-2" style="scrollbar-width: thin; scrollbar-color: #cbd5e1 #f1f1f1;">
          <div class="flex justify-between items-center px-4 pt-2 pb-1 border-b border-surface-variant/10">
            <span class="font-label-md text-xs text-on-surface-variant uppercase tracking-wider">Kategori</span>
          </div>

          <div 
            v-for="kat in EXPENSE_CATEGORIES" 
            :key="kat.id_kategori" 
            class="px-4 py-3 flex items-center justify-between group hover:bg-surface-container-lowest rounded-lg transition-colors"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded bg-surface-container-high flex items-center justify-center text-on-surface-variant">
                <span class="material-symbols-outlined text-[18px]">{{ getIconForCategory(kat.nama_kategori) }}</span>
              </div>
              <span class="font-body-md text-body-md capitalize">{{ kat.nama_kategori }}</span>
            </div>
            <div class="flex items-center">
              <div class="flex flex-col items-end relative">
                <span class="absolute left-2 top-1/2 -translate-y-1/2 font-body-md text-xs text-on-surface-variant">Rp</span>
                <input 
                  :value="formInputs[kat.id_kategori]" 
                  @input="onCategoryInput(kat.id_kategori, $event)" 
                  class="w-28 py-1.5 pl-7 pr-2 text-right border border-outline-variant rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-sm transition-all" 
                  placeholder="0" 
                  type="text"
                >
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Summary & Actions -->
        <div class="p-6 border-t border-surface-variant/50 bg-surface-bright shrink-0">
          <!-- Error message -->
          <div v-if="isOverBudget" class="mb-4 px-4 py-3 bg-error-container/30 border border-error/20 rounded-lg flex items-start gap-2">
            <span class="material-symbols-outlined text-error text-[18px] mt-0.5 shrink-0">warning</span>
            <p class="font-label-sm text-label-sm text-error">Total alokasi melebihi anggaran sebesar <b>Rp {{ overBudgetAmount.toLocaleString('id-ID') }}</b>.</p>
          </div>
          <div v-else-if="saveError" class="mb-4 px-4 py-3 bg-error-container/30 border border-error/20 rounded-lg flex items-start gap-2">
            <span class="material-symbols-outlined text-error text-[18px] mt-0.5 shrink-0">error</span>
            <p class="font-label-sm text-label-sm text-error">{{ saveError }}</p>
          </div>

          <div class="space-y-3 mb-6">
            <div class="flex justify-between items-center">
              <span class="font-label-md text-label-md text-on-surface">Total Anggaran Teralokasi:</span>
              <span class="font-label-md text-label-md font-bold text-primary">Rp {{ modalTotalTeralokasi.toLocaleString('id-ID') }}</span>
            </div>
            <div class="w-full h-2 bg-surface-container-high rounded-full overflow-hidden">
              <div 
                class="h-full rounded-full transition-all duration-300" 
                :class="isOverBudget ? 'bg-error' : 'bg-secondary-container'"
                :style="{ width: `${modalAllokasiPct}%` }"
              ></div>
            </div>
            <div class="flex justify-between items-center pt-1">
              <span class="font-label-md text-label-md text-on-surface-variant">Sisa Anggaran:</span>
              <span class="font-label-md text-label-md text-on-surface-variant">Rp {{ modalSisaAnggaran.toLocaleString('id-ID') }}</span>
            </div>
          </div>
          <div class="flex gap-3 justify-end">
            <button @click="closeModal" class="px-6 py-2.5 border border-outline-variant rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-high transition-colors">
              Batal
            </button>
            <button @click="saveAnggaran" :disabled="isSaving || isOverBudget" class="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container/90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
              <span v-if="isSaving" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              Simpan Anggaran
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
