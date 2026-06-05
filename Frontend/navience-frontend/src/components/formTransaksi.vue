<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useTransaksiStore } from '@/stores/transaksi';
import { useTargetStore } from '@/stores/target';
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
const targetStore = useTargetStore();

const title = computed(() => {
  if (props.mode === 'edit') return 'Ubah Transaksi';
  return 'Tambah Transaksi';
});

const categories = CATEGORIES;

const isTabungan = computed(() => transaksiStore.payload.jenis_transaksi === 'tabungan');

// ID kategori "tabungan" dari CATEGORIES
const TABUNGAN_KATEGORI_ID = '83a23757-6790-487c-9868-c8e39453ad28';

// Target yang bisa dipilih (aktif, ATAU target yang sedang diedit)
const selectableTargets = computed(() => {
  return targetStore.items.filter(t => t.status === 'on going' || t.id_target === transaksiStore.payload.id_target);
});

// Fetch targets setiap kali modal dibuka
watch(() => props.show, async (newVal) => {
  if (newVal) {
    const userId = authStore.user?.id;
    if (userId) {
      try {
        await targetStore.fetchAll(userId);
      } catch (_) {
        // silently ignore
      }
    }
  }
});

// Saat switch ke tabungan, auto-set field yang wajib
watch(isTabungan, (val) => {
  if (val) {
    transaksiStore.payload.id_kategori = TABUNGAN_KATEGORI_ID;
    transaksiStore.payload.nama_transaksi = 'Tabungan';
    transaksiStore.payload.nama_toko = null;
    transaksiStore.payload.deskripsi = 'Setoran tabungan ke target';
    // Auto-select target aktif pertama jika belum ada yang dipilih
    if (!transaksiStore.payload.id_target && selectableTargets.value.length > 0) {
      transaksiStore.payload.id_target = selectableTargets.value[0]?.id_target ?? null;
    }
  } else {
    transaksiStore.payload.id_target = null;
  }
});

const formatCurrency = (val: number) => {
  return val.toLocaleString('id-ID');
};

const formattedNominal = computed(() => {
  const val = transaksiStore.payload.nominal;
  return val && val > 0 ? val.toLocaleString('id-ID') : '';
});

const onNominalInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const raw = target.value.replace(/\D/g, '');
  const num = Number(raw) || 0;
  transaksiStore.payload.nominal = num;
  target.value = num > 0 ? num.toLocaleString('id-ID') : '';
};

const close = () => {
  transaksiStore.resetPayload();
  transaksiStore.setError(null);
  emit('update:show', false);
};

const handleSave = async () => {
  const userID = authStore.user?.id;
  if (!userID) return;

  // Susun payload final sebelum kirim ke store
  // agar semua field sudah lengkap saat validasi dijalankan di dalam action
  const finalPayload = { ...transaksiStore.payload };

  if (isTabungan.value) {
    // Paksa field wajib tabungan
    finalPayload.id_kategori = TABUNGAN_KATEGORI_ID;
    finalPayload.nama_transaksi = finalPayload.nama_transaksi?.trim() || 'Tabungan';
    finalPayload.deskripsi = finalPayload.deskripsi?.trim() || 'Setoran tabungan ke target';

    // Guard: harus ada target yang dipilih
    if (!finalPayload.id_target) {
      if (selectableTargets.value.length > 0) {
        finalPayload.id_target = selectableTargets.value[0]?.id_target ?? null;
      } else {
        alert('Tidak ada target yang tersedia. Buat target terlebih dahulu di halaman Target.');
        return;
      }
    }
  } else {
    finalPayload.id_target = null;
  }

  // Sync store payload dengan nilai final sebelum kirim
  transaksiStore.setPayload(finalPayload);

  try {
    if (props.mode === 'edit' && props.transaksiId) {
      await transaksiStore.updateTransaksi(userID, props.transaksiId, finalPayload);
    } else {
      await transaksiStore.createTransaksi(userID, finalPayload);
    }

    // Tutup modal hanya jika tidak ada error dari store
    if (!transaksiStore.storeError) {
      close();
    }
  } catch (error: any) {
    alert(transaksiStore.storeError || error?.message || 'Gagal menyimpan transaksi');
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
      alert(transaksiStore.storeError || error?.message || 'Gagal menghapus transaksi');
    }
  }
};
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-[100] flex items-center justify-center">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-on-background/40 backdrop-blur-sm" @click="close"></div>

    <!-- Modal -->
    <div class="relative bg-white w-full max-w-[540px] rounded-2xl shadow-[0_8px_24px_rgba(30,41,59,0.10)] border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[85vh] z-10">
      <div class="p-6 border-b border-surface-variant/50 flex justify-between items-center shrink-0">
        <h3 class="font-headline-md text-headline-md text-primary leading-tight">{{ title }}</h3>
        <button class="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-high shrink-0" @click="close" type="button">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- Error Banner -->
      <div v-if="transaksiStore.storeError" class="mx-6 mt-4 p-3 rounded-lg bg-error-container/30 border border-error/20 flex items-start gap-2">
        <span class="material-symbols-outlined text-error text-[18px] shrink-0 mt-0.5">error</span>
        <p class="font-label-sm text-label-sm text-on-error-container">{{ transaksiStore.storeError }}</p>
      </div>

      <form class="flex-1 flex flex-col min-h-0" @submit.prevent="handleSave">
        <div class="flex-1 overflow-y-auto p-6 space-y-5" style="scrollbar-width: thin; scrollbar-color: #cbd5e1 #ffffff;">

          <!-- Tipe Transaksi Tabs -->
          <div class="flex bg-surface-container-low p-1 rounded-xl">
            <input class="hidden peer/pengeluaran" id="type-pengeluaran" name="type" type="radio" value="pengeluaran" v-model="transaksiStore.payload.jenis_transaksi" />
            <label class="flex-1 text-center py-2 rounded-lg cursor-pointer font-label-md text-label-md transition-all peer-checked/pengeluaran:bg-white peer-checked/pengeluaran:shadow-sm peer-checked/pengeluaran:text-primary" for="type-pengeluaran">Pengeluaran</label>

            <input class="hidden peer/pemasukan" id="type-pemasukan" name="type" type="radio" value="pemasukan" v-model="transaksiStore.payload.jenis_transaksi" />
            <label class="flex-1 text-center py-2 rounded-lg cursor-pointer font-label-md text-label-md transition-all peer-checked/pemasukan:bg-white peer-checked/pemasukan:shadow-sm peer-checked/pemasukan:text-primary" for="type-pemasukan">Pemasukan</label>

            <input class="hidden peer/tabungan" id="type-tabungan" name="type" type="radio" value="tabungan" v-model="transaksiStore.payload.jenis_transaksi" />
            <label class="flex-1 text-center py-2 rounded-lg cursor-pointer font-label-md text-label-md transition-all peer-checked/tabungan:bg-white peer-checked/tabungan:shadow-sm peer-checked/tabungan:text-primary" for="type-tabungan">Tabungan</label>
          </div>

          <!-- ===== TABUNGAN MODE ===== -->
          <template v-if="isTabungan">
            <!-- Target Aktif Selection -->
            <div class="space-y-2">
              <label class="font-label-md text-label-md text-on-surface-variant px-1">Pilihan Target</label>

              <!-- Tidak ada target aktif -->
              <div v-if="selectableTargets.length === 0" class="p-4 rounded-xl bg-error-container/30 border border-error/20 flex items-center gap-3">
                <span class="material-symbols-outlined text-error">warning</span>
                <p class="font-label-sm text-on-error-container">Tidak ada target yang tersedia. Buat target di halaman Target terlebih dahulu.</p>
              </div>

              <!-- Daftar target aktif -->
              <div v-else class="space-y-2">
                <label
                  v-for="target in selectableTargets"
                  :key="target.id_target"
                  class="flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all"
                  :class="transaksiStore.payload.id_target === target.id_target
                    ? 'border-secondary bg-secondary-fixed/15 shadow-sm'
                    : 'border-outline-variant/30 bg-surface-container-lowest hover:border-secondary/40 hover:bg-surface-container-low'"
                >
                  <input
                    type="radio"
                    name="target-selection"
                    :value="target.id_target"
                    v-model="transaksiStore.payload.id_target"
                    class="sr-only"
                  />
                  <!-- Radio indicator -->
                  <div
                    class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                    :class="transaksiStore.payload.id_target === target.id_target
                      ? 'border-secondary'
                      : 'border-outline-variant'"
                  >
                    <div
                      v-if="transaksiStore.payload.id_target === target.id_target"
                      class="w-2.5 h-2.5 rounded-full bg-secondary"
                    ></div>
                  </div>
                  <!-- Info target -->
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2">
                      <p class="font-label-md text-label-md text-on-background truncate">{{ target.nama_target }}</p>
                      <span class="font-label-sm text-label-sm text-secondary shrink-0">
                        {{ target.status === 'on going' ? '🟢 Aktif' : target.status }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between gap-2 mt-1">
                      <p class="font-label-sm text-label-sm text-on-surface-variant">
                        Target: Rp {{ formatCurrency(target.nominal_target) }}
                      </p>
                      <p class="font-label-sm text-label-sm text-on-surface-variant">
                        Deadline: {{ new Date(target.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) }}
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <!-- Nominal -->
            <div class="space-y-1.5">
              <label class="font-label-md text-label-md text-on-surface-variant px-1">Nominal Setoran</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 font-label-md text-on-surface-variant">Rp</span>
                <input :value="formattedNominal" @input="onNominalInput" class="w-full pl-12 pr-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white font-headline-md text-headline-md" placeholder="0" type="text" required />
              </div>
            </div>

            <!-- Tanggal -->
            <div class="space-y-1.5">
              <label class="font-label-md text-label-md text-on-surface-variant px-1">Tanggal</label>
              <input class="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white font-body-md text-body-md text-on-surface" type="date" v-model="transaksiStore.payload.tanggal_transaksi" required />
            </div>
          </template>

          <!-- ===== PEMASUKAN / PENGELUARAN MODE ===== -->
          <template v-else>
            <div class="space-y-1.5">
              <label class="font-label-md text-label-md text-on-surface-variant px-1">Nominal</label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 -translate-y-1/2 font-label-md text-on-surface-variant">Rp</span>
                <input :value="formattedNominal" @input="onNominalInput" class="w-full pl-12 pr-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white font-headline-md text-headline-md" placeholder="0" type="text" required />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1.5">
                <label class="font-label-md text-label-md text-on-surface-variant px-1">Kategori</label>
                <select class="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white font-body-md text-body-md text-on-surface capitalize" v-model="transaksiStore.payload.id_kategori" required>
                  <option value="" disabled>Pilih Kategori</option>
                  <option v-for="kat in categories" :key="kat.id_kategori" :value="kat.id_kategori" class="capitalize">{{ kat.nama_kategori }}</option>
                </select>
              </div>
              <div class="space-y-1.5">
                <label class="font-label-md text-label-md text-on-surface-variant px-1">Tanggal</label>
                <input class="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white font-body-md text-body-md text-on-surface" type="date" v-model="transaksiStore.payload.tanggal_transaksi" required />
              </div>
            </div>

            <div class="space-y-1.5">
              <label class="font-label-md text-label-md text-on-surface-variant px-1">Nama Transaksi</label>
              <input class="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white font-body-md text-body-md text-on-surface" placeholder="Contoh: Makan Siang, Gaji Bulanan" type="text" v-model="transaksiStore.payload.nama_transaksi" required />
            </div>

            <div class="space-y-1.5">
              <label class="font-label-md text-label-md text-on-surface-variant px-1">Nama Toko <span class="text-outline font-normal">(Opsional)</span></label>
              <input class="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white font-body-md text-body-md text-on-surface" placeholder="Contoh: Starbucks, Uniqlo" type="text" v-model="transaksiStore.payload.nama_toko" />
            </div>

            <div class="space-y-1.5">
              <label class="font-label-md text-label-md text-on-surface-variant px-1">Deskripsi</label>
              <textarea class="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all bg-white font-body-md text-body-md text-on-surface" placeholder="Tambah catatan..." rows="2" v-model="transaksiStore.payload.deskripsi" required></textarea>
            </div>
          </template>

        </div>

        <!-- Action Buttons -->
        <div class="p-6 border-t border-surface-variant/50 bg-white shrink-0">
          <div class="flex gap-3 justify-end">
            <button
              v-if="props.mode === 'edit'"
              class="px-4 py-2.5 rounded-lg font-label-md text-label-md border border-error/50 text-error hover:bg-error/10 transition-colors flex justify-center items-center disabled:opacity-60 disabled:cursor-not-allowed"
              type="button"
              @click="handleDelete"
              :disabled="transaksiStore.isLoading"
              title="Hapus Transaksi"
            >
              <span class="material-symbols-outlined text-sm mr-1">delete</span> Hapus
            </button>

            <button
              class="px-6 py-2.5 border border-outline-variant rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-high transition-colors"
              type="button"
              @click="close"
              :disabled="transaksiStore.isLoading"
            >
              Batal
            </button>

            <button
              class="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container/90 transition-colors shadow-sm flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              :disabled="transaksiStore.isLoading || (isTabungan && selectableTargets.length === 0)"
            >
              <span v-if="transaksiStore.isLoading" class="material-symbols-outlined animate-spin text-sm">progress_activity</span>
              Simpan
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>3