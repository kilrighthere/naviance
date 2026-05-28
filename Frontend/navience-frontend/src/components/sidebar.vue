<script setup lang="ts">
import { ref, computed } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const userID = computed(() => authStore.user?.id ?? '');

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  }
};

const isMinimized = ref(false);

const toggleSidebar = () => {
  isMinimized.value = !isMinimized.value;
};

const navItems = [
  { icon: 'dashboard', label: 'Dashboard', to: () => `/dashboard/${userID.value}`, filled: true },
  { icon: 'receipt_long', label: 'Transactions', to: () => `/transaksi/${userID.value}`, filled: false },
  { icon: 'account_balance_wallet', label: 'Budget', to: () => `/anggaran/${userID.value}`, filled: false },
  { icon: 'query_stats', label: 'Forecasting', to: () => `/forecasting/${userID.value}`, filled: false },
  { icon: 'target', label: 'Goals', to: () => `/target/${userID.value}`, filled: false },
  { icon: 'person', label: 'Profile', to: () => `/profile/${userID.value}`, filled: false },
];

const footerItems = [
  { icon: 'settings', label: 'Settings', to: () => '#' },
  { icon: 'help_outline', label: 'Support', to: () => '#' },
];

const isActive = (to: string) => {
  return route.path === to || route.path.startsWith(to + '/');
};

defineExpose({ isMinimized });
</script>

<template>
  <nav
    class="sidebar-nav bg-surface/80 backdrop-blur-md shadow-lg h-[calc(100vh-32px)] fixed left-4 top-4 flex flex-col p-unit z-20 rounded-2xl border border-outline-variant/20"
    :class="{ 'sidebar-minimized': isMinimized }"
  >
    <!-- Floating Toggle Button -->
    <button
      class="absolute -right-5 w-10 h-10 bg-secondary-container text-on-secondary-container rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 group z-50 border border-outline-variant/20 top-8"
      @click="toggleSidebar"
    >
      <span
        class="material-symbols-outlined transition-transform duration-300"
        :style="{ transform: isMinimized ? 'rotate(180deg)' : 'rotate(0deg)' }"
      >chevron_left</span>
      <!-- Tooltip -->
      <span
        class="absolute left-full ml-2 px-2 py-1 bg-inverse-surface text-inverse-on-surface font-label-sm text-label-sm rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50"
      >{{ isMinimized ? 'Expand' : 'Collapse' }}</span>
    </button>

    <!-- Header (Expanded) -->
    <div class="sidebar-header px-4 py-4 mb-4">
      <h1 class="text-headline-md font-headline-md font-extrabold text-primary">Naviance</h1>
      <p class="font-label-sm text-label-sm text-primary">Navigate Your Finance</p>
    </div>

    <!-- Logo (Minimized) -->
    <div class="minimized-logo pt-4 pb-2">
      <span class="material-symbols-outlined text-primary text-3xl font-bold">dashboard_customize</span>
    </div>

    <!-- Main Navigation Tabs -->
    <ul class="flex-1 space-y-2 mt-2">
      <li v-for="item in navItems" :key="item.label">
        <RouterLink
          :to="item.to()"
          class="sidebar-link flex items-center gap-unit rounded-lg px-4 py-3 mx-1 transition-all duration-150"
          :class="isActive(item.to())
            ? 'bg-primary-container scale-95 text-white'
            : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-high'"
        >
          <span
            class="material-symbols-outlined"
            :class="isActive(item.to()) ? 'text-white' : ''"
            :style="isActive(item.to()) ? 'font-variation-settings: \'FILL\' 1;' : ''"
          >{{ item.icon }}</span>
          <span class="sidebar-label font-label-md text-label-md" :class="isActive(item.to()) ? 'text-white' : ''">{{ item.label }}</span>
        </RouterLink>
      </li>
    </ul>

    <!-- Footer Tabs -->
    <div class="mt-auto border-t border-outline-variant/20 pt-4 pb-2">
      <ul class="space-y-1 mb-4">
        <li v-for="item in footerItems" :key="item.label">
          <a
            :href="item.to()"
            class="sidebar-link flex items-center gap-unit text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors px-4 py-3 rounded-lg mx-1"
          >
            <span class="material-symbols-outlined">{{ item.icon }}</span>
            <span class="sidebar-label font-label-md text-label-md">{{ item.label }}</span>
          </a>
        </li>
        <li>
          <button
            @click="handleLogout"
            class="sidebar-link w-[calc(100%-8px)] flex items-center gap-unit text-error hover:bg-error/10 hover:text-error transition-colors px-4 py-3 rounded-lg mx-1 cursor-pointer text-left font-label-md text-label-md"
          >
            <span class="material-symbols-outlined">logout</span>
            <span class="sidebar-label">Logout</span>
          </button>
        </li>
      </ul>
    </div>
  </nav>
</template>
