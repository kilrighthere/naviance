<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();

const userID = computed(() => authStore.user?.id ?? '');
const userName = computed(() => authStore.user?.user_metadata?.nama_lengkap ?? 'User');
const userEmail = computed(() => authStore.user?.email ?? '');

// ─── Profile Dropdown ─────────────────────────────
const showProfileDropdown = ref(false);
const profileDropdownRef = ref<HTMLElement | null>(null);
const profileButtonRef = ref<HTMLElement | null>(null);

const toggleProfileDropdown = (e: Event) => {
  e.stopPropagation();
  showProfileDropdown.value = !showProfileDropdown.value;
};

const closeProfileDropdown = (e: Event) => {
  if (
    profileDropdownRef.value &&
    !profileDropdownRef.value.contains(e.target as Node) &&
    profileButtonRef.value &&
    !profileButtonRef.value.contains(e.target as Node)
  ) {
    showProfileDropdown.value = false;
  }
};

const handleLogout = async () => {
  try {
    await authStore.logout();
    window.location.href = '/login';
  } catch (error) {
    console.error('Logout error:', error);
  }
};

onMounted(() => {
  document.addEventListener('click', closeProfileDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeProfileDropdown);
});
</script>

<template>
  <div class="relative">
    <button
      ref="profileButtonRef"
      class="hover:text-primary transition-colors flex items-center"
      id="profile-menu-button"
      @click="toggleProfileDropdown"
    >
      <span class="material-symbols-outlined text-3xl">account_circle</span>
    </button>
    <!-- Profile Dropdown -->
    <Transition
      enter-active-class="profile-dropdown-enter-active"
      leave-active-class="profile-dropdown-leave-active"
      enter-from-class="profile-dropdown-enter-from"
      leave-to-class="profile-dropdown-leave-to"
    >
      <div
        v-if="showProfileDropdown"
        ref="profileDropdownRef"
        class="absolute top-full right-0 mt-2 w-56 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-xl overflow-hidden z-[60] flex flex-col"
        id="profile-dropdown"
      >
        <div class="px-4 py-3 border-b border-outline-variant/10">
          <p class="font-label-md text-label-md text-on-background">{{ userName }}</p>
          <p class="font-label-sm text-label-sm text-on-surface-variant">{{ userEmail }}</p>
        </div>
        <div class="p-1">
          <RouterLink
            :to="`/profile/${userID}`"
            class="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-container-low transition-colors text-on-surface-variant"
            @click="showProfileDropdown = false"
          >
            <span class="material-symbols-outlined">person</span>
            <span class="font-label-md text-label-md">Profil Saya</span>
          </RouterLink>

          <div class="my-1 border-t border-outline-variant/10"></div>
          <button
            class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-error-container/10 transition-colors text-error cursor-pointer"
            @click="handleLogout"
          >
            <span class="material-symbols-outlined">logout</span>
            <span class="font-label-md text-label-md">Logout</span>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
