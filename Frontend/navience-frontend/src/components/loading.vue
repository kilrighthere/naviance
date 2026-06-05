<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    isLoading?: boolean
    message?: string
    fullScreen?: boolean
  }>(),
  {
    isLoading: true,
    message: 'Memuat halaman...',
    fullScreen: true,
  }
)
</script>

<template>
  <Transition name="loading-fade">
    <div
      v-if="isLoading"
      class="loading-overlay"
      :class="{ 'loading-fullscreen': fullScreen, 'loading-inline': !fullScreen }"
    >
      <!-- Background blobs (decorative, matching Landing hero style) -->
      <div v-if="fullScreen" class="loading-blob loading-blob-1"></div>
      <div v-if="fullScreen" class="loading-blob loading-blob-2"></div>

      <div class="loading-content">
        <!-- Spinner ring -->
        <div class="spinner-wrapper">
          <svg class="spinner-ring" viewBox="0 0 56 56">
            <!-- Track -->
            <circle
              cx="28" cy="28" r="24"
              fill="none"
              stroke-width="4"
              class="spinner-track"
            />
            <!-- Animated arc -->
            <circle
              cx="28" cy="28" r="24"
              fill="none"
              stroke-width="4"
              stroke-linecap="round"
              class="spinner-arc"
            />
          </svg>
          <!-- Logo in center -->
          <img
            src="@/assets/logo.png"
            alt="Naviance"
            class="spinner-logo"
          />
        </div>

        <!-- Text -->
        <div class="loading-text-group">
          <span class="loading-brand">Naviance</span>
          <span class="loading-message">{{ message }}</span>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* ═══════════════════════════════════════════════ */
/*  OVERLAY                                        */
/* ═══════════════════════════════════════════════ */
.loading-overlay {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fbf8fa;
  z-index: 9999;
  overflow: hidden;
  position: relative;
}

.loading-fullscreen {
  position: fixed;
  inset: 0;
}

.loading-inline {
  width: 100%;
  min-height: 320px;
  border-radius: 16px;
}

/* ═══════════════════════════════════════════════ */
/*  DECORATIVE BLOBS (matching Landing hero)       */
/* ═══════════════════════════════════════════════ */
.loading-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.25;
  pointer-events: none;
  animation: blob-drift 6s ease-in-out infinite alternate;
}

.loading-blob-1 {
  width: 340px;
  height: 340px;
  background: #fea619;
  top: -80px;
  right: -60px;
  animation-delay: 0s;
}

.loading-blob-2 {
  width: 280px;
  height: 280px;
  background: #091426;
  bottom: -60px;
  left: -40px;
  animation-delay: -3s;
}

@keyframes blob-drift {
  0%   { transform: translate(0, 0) scale(1); }
  100% { transform: translate(20px, -15px) scale(1.08); }
}

/* ═══════════════════════════════════════════════ */
/*  CONTENT                                        */
/* ═══════════════════════════════════════════════ */
.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  z-index: 1;
  animation: content-enter 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes content-enter {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.96);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ═══════════════════════════════════════════════ */
/*  SPINNER                                        */
/* ═══════════════════════════════════════════════ */
.spinner-wrapper {
  position: relative;
  width: 72px;
  height: 72px;
}

.spinner-ring {
  width: 100%;
  height: 100%;
  animation: spin 1.4s linear infinite;
}

.spinner-track {
  stroke: #e4e2e3;
}

.spinner-arc {
  stroke: url(#spinnerGrad);
  stroke: #fea619;
  stroke-dasharray: 90 150;
  stroke-dashoffset: 0;
  animation: arc-dash 1.4s ease-in-out infinite;
  transform-origin: center;
}

@keyframes spin {
  0%   { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes arc-dash {
  0% {
    stroke-dasharray: 1 150;
    stroke-dashoffset: 0;
    stroke: #fea619;
  }
  50% {
    stroke-dasharray: 90 150;
    stroke-dashoffset: -35;
    stroke: #091426;
  }
  100% {
    stroke-dasharray: 90 150;
    stroke-dashoffset: -124;
    stroke: #fea619;
  }
}

.spinner-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 28px;
  height: 28px;
  object-fit: contain;
  animation: logo-pulse 2s ease-in-out infinite;
}

@keyframes logo-pulse {
  0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  50%      { opacity: 0.7; transform: translate(-50%, -50%) scale(0.92); }
}

/* ═══════════════════════════════════════════════ */
/*  TEXT                                           */
/* ═══════════════════════════════════════════════ */
.loading-text-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.loading-brand {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: #091426;
  letter-spacing: -0.02em;
}

.loading-message {
  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #75777d;
  letter-spacing: 0.01em;
  animation: message-pulse 2s ease-in-out infinite;
}

@keyframes message-pulse {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.5; }
}

/* ═══════════════════════════════════════════════ */
/*  TRANSITION                                     */
/* ═══════════════════════════════════════════════ */
.loading-fade-enter-active {
  transition: opacity 0.3s ease;
}

.loading-fade-leave-active {
  transition: opacity 0.4s ease 0.1s;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
