<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  isOpen: boolean;
  initialData?: { nama_target: string; nominal_target: number; deadline: string } | null;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', data: { nama_target: string; nominal_target: number; deadline: string }): void;
}>();

const nama_target = ref('');
const nominal_target = ref('');
const deadline = ref('');

const formatRupiah = (val: number): string => {
  if (!val || val === 0) return '';
  return val.toLocaleString('id-ID');
};

const parseRupiah = (str: string): number => {
  if (!str) return 0;
  return Number(str.replace(/\./g, '').replace(/,/g, '')) || 0;
};

const onNominalInput = (e: Event) => {
  const target = e.target as HTMLInputElement;
  const raw = target.value.replace(/\D/g, '');
  const num = Number(raw) || 0;
  nominal_target.value = num > 0 ? formatRupiah(num) : '';
};

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.initialData) {
      nama_target.value = props.initialData.nama_target;
      nominal_target.value = formatRupiah(props.initialData.nominal_target);
      deadline.value = props.initialData.deadline;
    } else {
      nama_target.value = '';
      nominal_target.value = '';
      deadline.value = '';
    }
  }
});

const close = () => {
  emit('close');
};

const save = () => {
  const parsedNominal = parseRupiah(nominal_target.value);
  if (!nama_target.value || !parsedNominal || !deadline.value) {
    alert("Semua field harus diisi");
    return;
  }
  emit('save', {
    nama_target: nama_target.value,
    nominal_target: parsedNominal,
    deadline: deadline.value
  });
  
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-[100] flex items-center justify-center p-4">
    <div class="absolute inset-0 bg-primary/10 backdrop-blur-[2px]" @click="close"></div>
    <div class="relative bg-white w-full max-w-[540px] rounded-2xl shadow-[0_8px_24px_rgba(30,41,59,0.10)] border border-[#E2E8F0] overflow-hidden flex flex-col max-h-[85vh] z-10 animate-in fade-in zoom-in duration-200">
      
      <!-- Header -->
      <div class="p-6 border-b border-surface-variant/50 flex justify-between items-center shrink-0">
        <h3 class="font-headline-md text-headline-md text-primary leading-tight">{{ initialData ? 'Ubah Target' : 'Tambah Target Baru' }}</h3>
        <button @click="close" class="text-on-surface-variant hover:text-primary transition-colors p-1 rounded-full hover:bg-surface-container-high shrink-0">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6 flex flex-col gap-5 bg-surface-bright" style="scrollbar-width: thin; scrollbar-color: #cbd5e1 #f1f1f1;">
        <p class="font-body-md text-body-md text-on-surface-variant mb-1">
          {{ initialData ? 'Ubah detail target finansial Anda.' : 'Tetapkan target finansial baru dengan bantuan cerdas Naviance.' }}
        </p>

        <div class="flex flex-col gap-1.5">
          <label class="font-label-md text-label-md text-on-surface">Nama Target</label>
          <input v-model="nama_target" class="w-full pl-4 pr-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md bg-white text-on-surface" placeholder="e.g., Liburan ke Bali" type="text">
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label class="font-label-md text-label-md text-on-surface">Target Tabungan</label>
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 font-body-md text-on-surface-variant">Rp</span>
              <input :value="nominal_target" @input="onNominalInput" class="w-full pl-10 pr-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md bg-white text-on-surface" placeholder="15.000.000" type="text">
            </div>
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="font-label-md text-label-md text-on-surface">Target Waktu</label>
            <input v-model="deadline" class="w-full px-4 py-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-body-md bg-white text-on-surface" type="date">
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="p-6 border-t border-surface-variant/50 bg-surface-bright shrink-0 flex gap-3 justify-end">
        <button @click="close" class="px-6 py-2.5 border border-outline-variant rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-high transition-colors">Batal</button>
        <button @click="save" class="px-6 py-2.5 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container/90 transition-colors shadow-sm flex items-center gap-2">
          <span class="material-symbols-outlined text-[18px]">save</span>
          Simpan Target
        </button>
      </div>
    </div>
  </div>
</template>
