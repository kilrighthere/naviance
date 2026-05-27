<script setup lang="ts">
defineProps<{
  id?: string
}>()
</script>

<template>
  <!-- Global Component: Floating AI Chatbot -->
  <button
    :id="id ?? 'btn-ai-chatbot'"
    class="fixed bottom-8 right-8 z-50 h-14 px-6 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center gap-3 hover:scale-105 hover:shadow-xl transition-all duration-200 group animate-pulse-custom"
  >
    <span class="material-symbols-outlined text-3xl group-hover:hidden">smart_toy</span>
    <span class="font-label-md text-label-md">Tanya AI Naviance</span>
  </button>
</template>
