<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: { nama_target: string; nominal_target: number; deadline: string }): void;
}>();

const nama_target = ref('');
const nominal_target = ref<number | null>(null);
const deadline = ref('');

const close = () => {
  emit('close');
};

const save = () => {
  if (!nama_target.value || !nominal_target.value || !deadline.value) {
    alert("Semua field harus diisi");
    return;
  }
  emit('save', {
    nama_target: nama_target.value,
    nominal_target: Number(nominal_target.value),
    deadline: deadline.value
  });
  
  // reset
  nama_target.value = '';
  nominal_target.value = null;
  deadline.value = '';
  
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-on-background/40 backdrop-blur-sm px-4" id="modal-backdrop" @click.self="close">
    <div class="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 w-full max-w-lg overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
      <!-- Header -->
      <div class="px-6 py-5 border-b border-outline-variant/20">
        <h2 class="font-headline-md text-headline-md text-primary-container">Tambah Target Baru</h2>
        <p class="font-body-md text-body-md text-on-surface-variant mt-1">Tetapkan target finansial baru dengan bantuan cerdas Naviance.</p>
      </div>
      <!-- Content -->
      <div class="px-6 py-6 flex flex-col gap-5">
        <div class="flex flex-col gap-1.5">
          <label class="font-label-md text-label-md text-on-surface-variant">Nama Target</label>
          <input v-model="nama_target" class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-secondary-container focus:border-secondary-container font-body-md px-3 py-2 outline-none transition-all" placeholder="e.g., Liburan ke Bali" type="text">
        </div>
        <div class="grid grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="font-label-md text-label-md text-on-surface-variant">Target Tabungan (Rp)</label>
            <input v-model.number="nominal_target" class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-secondary-container focus:border-secondary-container font-body-md px-3 py-2 outline-none transition-all" placeholder="e.g., 15000000" type="number">
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="font-label-md text-label-md text-on-surface-variant">Target Waktu</label>
            <input v-model="deadline" class="w-full rounded-lg border border-outline-variant bg-surface-container-lowest focus:ring-secondary-container focus:border-secondary-container font-body-md px-3 py-2 outline-none transition-all" type="date">
          </div>
        </div>
      </div>
      <!-- Footer -->
      <div class="px-6 py-4 bg-surface-container-low flex justify-end gap-3">
        <button @click="close" class="px-5 py-2.5 font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors">Batal</button>
        <button @click="save" class="px-6 py-2.5 font-label-md text-label-md text-white rounded-lg transition-all shadow-sm flex items-center gap-2 bg-[#F59E0B] hover:brightness-105">
          <span class="material-symbols-outlined text-[18px]">save</span>
          Simpan Target
        </button>
      </div>
    </div>
  </div>
</template>
