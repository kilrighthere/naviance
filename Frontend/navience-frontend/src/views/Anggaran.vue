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
  if (n.includes('kesehatan')) return 'medical_services';
  if (n.includes('transportasi')) return 'directions_car';
  if (n.includes('pendidikan')) return 'school';
  if (n.includes('belanja')) return 'shopping_bag';
  if (n.includes('hiburan')) return 'theater_comedy';
  if (n.includes('investasi')) return 'trending_up';
  if (n.includes('tagihan')) return 'receipt';
  if (n.includes('tempat tinggal') || n.includes('rumah')) return 'home';
  return 'category';
};

// -- Modal Atur Anggaran --
const showModal = ref(false);
const formInputs = ref<Record<string, number>>({});

const openAturAnggaran = () => {
  // Populate form dengan existing anggaran
  formInputs.value = {};
  filteredAnggaran.value.forEach(ang => {
    formInputs.value[ang.id_kategori] = ang.total_anggaran ?? 0;
  });
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
};

const saveAnggaran = async () => {
  if (!userID.value) return;
  
  const promises = [];
  
  for (const kategori of CATEGORIES) {
    const val = formInputs.value[kategori.id_kategori];
    const existing = filteredAnggaran.value.find(a => a.id_kategori === kategori.id_kategori);
    
    if (val && val > 0) {
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
    } else if (!val && existing) {
       promises.push(anggaranStore.deleteAnggaran(userID.value, existing.id_anggaran));
    }
  }

  await Promise.all(promises);
  await anggaranStore.fetchAll(userID.value);
  closeModal();
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
      <header class="flex justify-between items-center w-full px-margin-desktop h-20 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-10">
        <div class="flex items-center gap-4">
          <h2 class="font-headline-md text-headline-md text-primary tracking-tight">Anggaran</h2>
        </div>
        <div class="flex items-center gap-6 text-on-surface-variant">
          <button class="hover:text-primary transition-colors relative" id="btn-notifications">
            <span class="material-symbols-outlined">notifications</span>
            <span class="absolute top-0 right-0 w-2 h-2 bg-error rounded-full"></span>
          </button>
          <ProfileDropdown />
        </div>
      </header>

      <main class="flex-1 overflow-y-auto p-margin-mobile md:p-margin-desktop space-y-8">
        <!-- Subheader -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary tracking-tight">Anggaran</h2>
            <p class="font-body-md text-body-md text-on-surface-variant mt-1">Kelola arus kas saat ini dan antisipasi pengeluaran masa depan.</p>
          </div>
          <div class="relative flex items-center bg-surface-container-lowest border border-outline-variant/30 rounded-lg p-1 shadow-sm">
            <button class="px-4 py-2 font-label-md text-label-md rounded-md bg-primary-container text-on-primary-container font-bold">
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
                <div class="relative flex-shrink-0 w-64 h-64">
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
      <div class="absolute inset-0 bg-primary/40 backdrop-blur-sm" @click="closeModal"></div>
      <div class="relative bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div class="p-6 border-b border-outline-variant/20 flex justify-between items-center">
          <h3 class="font-headline-md text-headline-md text-primary-container">Atur Anggaran - {{ monthDisplay }}</h3>
          <button @click="closeModal" class="p-2 hover:bg-surface-container-high rounded-full transition-colors">
            <span class="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <div class="p-6 overflow-y-auto space-y-4">
          <p class="font-label-sm text-label-sm text-on-surface-variant mb-4">Masukkan nominal batas anggaran bulanan untuk setiap kategori yang Anda inginkan. Kosongkan jika tidak ada batas.</p>
          
          <div class="space-y-4">
            <div v-for="kat in CATEGORIES.filter(c => c.nama_kategori !== 'pemasukan' && c.nama_kategori !== 'gaji')" :key="kat.id_kategori" class="flex flex-col gap-1.5">
              <label class="font-label-md text-label-md text-primary-container capitalize">{{ kat.nama_kategori }}</label>
              <input 
                v-model.number="formInputs[kat.id_kategori]"
                class="w-full px-4 py-2 rounded-lg border border-outline-variant/50 focus:ring-2 focus:ring-secondary focus:border-secondary outline-none transition-all" 
                placeholder="Rp 0" 
                type="number"
                min="0"
              >
            </div>
          </div>
        </div>
        
        <div class="p-6 border-t border-outline-variant/20 flex gap-3">
          <button @click="closeModal" class="flex-1 px-4 py-2.5 rounded-lg border border-outline font-label-md text-label-md text-primary-container hover:bg-surface-container-high transition-colors">Batal</button>
          <button @click="saveAnggaran" class="flex-1 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            <span v-if="anggaranStore.isLoading" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
            Simpan
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
