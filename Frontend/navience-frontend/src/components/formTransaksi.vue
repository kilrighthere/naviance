<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTransaksiStore } from '@/stores/transaksi';
import { CATEGORIES } from '@/types/transaksi';

const props = defineProps<{
  show: boolean,
  mode?: 'create' | 'edit',
  transaksiId?: string | null
}>();

const emit = defineEmits<{
  (e: 'update:show', value: boolean): void
}>();

const authStore = useAuthStore();
const transaksiStore = useTransaksiStore();

const title = computed(() => {
  if (props.mode === 'edit') return 'Ubah Transaksi';
  return 'Tambah Transaksi';
});

const categories = CATEGORIES;

const close = () => {
  transaksiStore.resetPayload();
  emit('update:show', false);
};

const handleSave = async () => {
  const userID = authStore.user?.id;
  if (!userID) return;

  if (transaksiStore.payload.jenis_transaksi === 'tabungan') {
    if (!transaksiStore.payload.id_target) {
      const { useTargetStore } = await import('@/stores/target');
      const targetStore = useTargetStore();
      await targetStore.fetchTargetAktif(userID);
      if (targetStore.selected) {
        transaksiStore.payload.id_target = targetStore.selected.id_target;
      } else {
        alert('Tidak ada target aktif. Transaksi tabungan tidak dapat ditambahkan tanpa target.');
        return;
      }
    }
  } else {
    transaksiStore.payload.id_target = null;
  }

  try {
    if (props.mode === 'edit' && props.transaksiId) {
      await transaksiStore.updateTransaksi(userID, props.transaksiId, transaksiStore.payload);
    } else {
      await transaksiStore.createTransaksi(userID, transaksiStore.payload);
    }
    close();
  } catch (error: any) {
    alert(transaksiStore.storeError || error.message || 'Gagal menyimpan transaksi');
  }
};

const handleDelete = async () => {
  const userID = authStore.user?.id;
  if (!userID || !props.transaksiId) return;
  
  if (confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
    try {
      await transaksiStore.deleteTransaksi(userID, props.transaksiId);
      close();
    } catch (error: any) {
      alert(error.message || 'Gagal menghapus transaksi');
    }
  }
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-on-background/40 backdrop-blur-sm" @click="close"></div>
    
    <!-- Modal -->
    <div class="bg-surface rounded-2xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden border border-outline-variant/30">
      <div class="bg-primary-container px-6 py-4 flex justify-between items-center">
        <h3 class="text-headline-md font-headline-md text-on-primary">{{ title }}</h3>
        <button class="text-on-primary/70 hover:text-on-primary transition-colors" @click="close" type="button">
          <span class="material-symbols-outlined">close</span>
        </button>
      </div>
      
      <form class="p-6 space-y-5" @submit.prevent="handleSave">
        <!-- Tipe Transaksi Tabs -->
        <div class="flex bg-surface-container-low p-1 rounded-xl">
          <input class="hidden peer/pengeluaran" id="type-pengeluaran" name="type" type="radio" value="pengeluaran" v-model="transaksiStore.payload.jenis_transaksi" />
          <label class="flex-1 text-center py-2 rounded-lg cursor-pointer font-label-md text-label-md transition-all peer-checked/pengeluaran:bg-white peer-checked/pengeluaran:shadow-sm peer-checked/pengeluaran:text-primary" for="type-pengeluaran">Pengeluaran</label>
          
          <input class="hidden peer/pemasukan" id="type-pemasukan" name="type" type="radio" value="pemasukan" v-model="transaksiStore.payload.jenis_transaksi" />
          <label class="flex-1 text-center py-2 rounded-lg cursor-pointer font-label-md text-label-md transition-all peer-checked/pemasukan:bg-white peer-checked/pemasukan:shadow-sm peer-checked/pemasukan:text-primary" for="type-pemasukan">Pemasukan</label>
          
          <input class="hidden peer/tabungan" id="type-tabungan" name="type" type="radio" value="tabungan" v-model="transaksiStore.payload.jenis_transaksi" />
          <label class="flex-1 text-center py-2 rounded-lg cursor-pointer font-label-md text-label-md transition-all peer-checked/tabungan:bg-white peer-checked/tabungan:shadow-sm peer-checked/tabungan:text-primary" for="type-tabungan">Tabungan</label>
        </div>

        <div class="space-y-1.5">
          <label class="font-label-md text-label-md text-on-surface-variant px-1">Nominal</label>
          <div class="relative">
            <span class="absolute left-4 top-1/2 -translate-y-1/2 font-label-md text-on-surface-variant">Rp</span>
            <input class="w-full pl-12 pr-4 py-3 rounded-xl border-outline-variant bg-surface-container-lowest focus:ring-secondary-container focus:border-secondary-container font-headline-md text-headline-md" placeholder="0" type="number" v-model.number="transaksiStore.payload.nominal" required />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-1.5">
            <label class="font-label-md text-label-md text-on-surface-variant px-1">Kategori</label>
            <select class="w-full px-4 py-3 rounded-xl border-outline-variant bg-surface-container-lowest focus:ring-secondary-container focus:border-secondary-container font-body-md text-body-md text-on-surface" v-model="transaksiStore.payload.id_kategori" required>
              <option value="" disabled>Pilih Kategori</option>
              <option v-for="kat in categories" :key="kat.id_kategori" :value="kat.id_kategori">{{ kat.nama_kategori }}</option>
            </select>
          </div>
          <div class="space-y-1.5">
            <label class="font-label-md text-label-md text-on-surface-variant px-1">Tanggal</label>
            <input class="w-full px-4 py-3 rounded-xl border-outline-variant bg-surface-container-lowest focus:ring-secondary-container focus:border-secondary-container font-body-md text-body-md text-on-surface" type="date" v-model="transaksiStore.payload.tanggal_transaksi" required />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="font-label-md text-label-md text-on-surface-variant px-1">Nama Transaksi</label>
          <input class="w-full px-4 py-3 rounded-xl border-outline-variant bg-surface-container-lowest focus:ring-secondary-container focus:border-secondary-container font-body-md text-body-md text-on-surface" placeholder="Contoh: Makan Siang, Gaji Bulanan" type="text" v-model="transaksiStore.payload.nama_transaksi" required />
        </div>

        <div class="space-y-1.5">
          <label class="font-label-md text-label-md text-on-surface-variant px-1">Nama Toko <span class="text-outline font-normal">(Opsional)</span></label>
          <input class="w-full px-4 py-3 rounded-xl border-outline-variant bg-surface-container-lowest focus:ring-secondary-container focus:border-secondary-container font-body-md text-body-md text-on-surface" placeholder="Contoh: Starbucks, Uniqlo" type="text" v-model="transaksiStore.payload.nama_toko" />
        </div>

        <div class="space-y-1.5">
          <label class="font-label-md text-label-md text-on-surface-variant px-1">Deskripsi</label>
          <textarea class="w-full px-4 py-3 rounded-xl border-outline-variant bg-surface-container-lowest focus:ring-secondary-container focus:border-secondary-container font-body-md text-body-md text-on-surface" placeholder="Tambah catatan..." rows="2" v-model="transaksiStore.payload.deskripsi" required></textarea>
        </div>

        <div class="flex gap-4 pt-4">
          <button v-if="props.mode === 'edit'" class="px-5 py-3 rounded-xl font-label-md text-label-md border-2 border-error/50 text-error hover:bg-error/10 transition-colors flex justify-center items-center" type="button" @click="handleDelete" :disabled="transaksiStore.isLoading" title="Hapus Transaksi">
            <span class="material-symbols-outlined">delete</span>
          </button>
          
          <button class="flex-1 py-3 rounded-xl font-label-md text-label-md border-2 border-outline-variant text-on-surface-variant hover:bg-surface-container transition-colors" type="button" @click="close">Batal</button>
          <button class="flex-1 py-3 rounded-xl font-label-md text-label-md bg-secondary text-on-secondary shadow-lg shadow-secondary-container/20 hover:opacity-90 transition-all flex justify-center items-center" type="submit" :disabled="transaksiStore.isLoading">
            <span v-if="transaksiStore.isLoading" class="material-symbols-outlined animate-spin mr-2">progress_activity</span>
            Simpan
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
