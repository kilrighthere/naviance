import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AdaptivePrediction {
  prob_goal_achieved: number;
  status: string;
  on_track: boolean;
  threshold_used: number;
}

export interface RekomendasiPenghematan {
  "Makanan & Minuman": number;
  Fashion: number;
  Kesehatan: number;
  Transportasi: number;
  Pendidikan: number;
  Belanja: number;
  Hiburan: number;
  Tagihan: number;
  Lainnya: number;
}

export interface AdaptiveResult {
  prediction: AdaptivePrediction;
  rekomendasi_penghematan: RekomendasiPenghematan;
  total_hemat_per_bulan: number;
  model_version: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string) || "https://naviance-production-5ff4.up.railway.app/api/v1").replace(/\/$/, "");

// ─── Store ────────────────────────────────────────────────────────────────────

export const useAdaptiveStore = defineStore("adaptive", () => {
  const isLoading = ref(false);
  const storeError = ref<string | null>(null);
  const result = ref<AdaptiveResult | null>(null);

  // ─── Helpers ──────────────────────────────────────────────────────────────

  const setLoading = (value: boolean) => {
    isLoading.value = value;
  };

  const setError = (value: string | null) => {
    storeError.value = value;
  };

  const reset = () => {
    result.value = null;
    storeError.value = null;
  };

  // ─── Computed ─────────────────────────────────────────────────────────────

  /** Returns only categories that have a saving recommendation > 0 */
  const rekomendasiAktif = computed(() => {
    if (!result.value) return [] as { kategori: string; nominal: number }[];
    return Object.entries(result.value.rekomendasi_penghematan)
      .filter(([, nominal]) => nominal > 0)
      .map(([kategori, nominal]) => ({ kategori, nominal }))
      .sort((a, b) => b.nominal - a.nominal);
  });

  /** Probability formatted as percentage string, e.g. "96.9%" */
  const probFormatted = computed(() => {
    if (!result.value) return null;
    return (result.value.prediction.prob_goal_achieved * 100).toFixed(1) + "%";
  });

  /** Color token for current prediction status */
  const statusColor = computed(() => {
    if (!result.value) return "text-on-surface-variant";
    return result.value.prediction.on_track ? "text-on-tertiary-container" : "text-error";
  });

  /** Icon name (Material Symbols) for current status */
  const statusIcon = computed(() => {
    if (!result.value) return "hourglass_empty";
    return result.value.prediction.on_track ? "check_circle" : "warning";
  });

  // ─── Actions ──────────────────────────────────────────────────────────────

  /**
   * Call the adaptive predict endpoint.
   * The backend derives everything from the authenticated user's data,
   * so no request body is needed — only the Bearer token.
   */
  async function predict() {
    const authStore = useAuthStore();

    // Use the `token` computed already defined in auth store
    const token = authStore.token;

    // Gracefully skip if there is no active session yet
    if (!token) {
      setError("Sesi tidak ditemukan. Silakan login ulang.");
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<{
        status: string;
        data: AdaptiveResult;
      }>(
        `${BASE_URL}/adaptive/predict`,
        {}, // no body required
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.status === "success") {
        result.value = response.data.data;
        return true;
      } else {
        setError("Respons API tidak valid.");
        return false;
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const msg =
          (error.response?.data as { message?: string })?.message ??
          error.message;
        setError(msg);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Terjadi kesalahan tidak diketahui.");
      }
      return false;
    } finally {
      setLoading(false);
    }
  }

  return {
    // state
    isLoading,
    storeError,
    result,
    // computed
    rekomendasiAktif,
    probFormatted,
    statusColor,
    statusIcon,
    // actions
    predict,
    reset,
    setError,
    setLoading,
  };
});