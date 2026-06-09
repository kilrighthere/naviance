import { defineStore } from "pinia";
import { ref, computed } from "vue";
import axios from "axios";
import { useAuthStore } from "@/stores/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

export type HealthClassification = "Healthy" | "Moderate" | "Critical";

export interface PatternResult {
  classification: HealthClassification;
  confidence: number;
  /** [Healthy, Moderate, Critical] probabilities, order follows model output */
  probabilities: [number, number, number];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const BASE_URL = ((import.meta.env.VITE_API_BASE_URL as string) || "https://naviance-production-5ff4.up.railway.app/api/v1").replace(/\/$/, "");

// Per-classification UI tokens — kept here so the store is the single
// source of truth for theming; views just bind to these computed values.
const CONFIG: Record<
  HealthClassification,
  {
    label: string;
    labelId: string;
    description: string;
    icon: string;
    colorText: string;
    colorBg: string;
    colorBorder: string;
    colorBar: string;
  }
> = {
  Healthy: {
    label: "Healthy",
    labelId: "Sehat",
    description: "Pola keuangan Anda terdeteksi sehat. Pengeluaran terkendali dan alokasi dana berjalan baik.",
    icon: "verified",
    colorText: "text-on-tertiary-container",
    colorBg: "bg-tertiary-fixed/10",
    colorBorder: "border-on-tertiary-container/25",
    colorBar: "bg-on-tertiary-container",
  },
  Moderate: {
    label: "Moderate",
    labelId: "Moderat",
    description: "Kondisi keuangan Anda cukup stabil, namun ada beberapa area pengeluaran yang perlu diperhatikan.",
    icon: "info",
    colorText: "text-secondary-container",
    colorBg: "bg-secondary-fixed/10",
    colorBorder: "border-secondary-container/25",
    colorBar: "bg-secondary-container",
  },
  Critical: {
    label: "Critical",
    labelId: "Kritis",
    description: "Pola pengeluaran Anda menunjukkan risiko finansial. Segera tinjau dan kurangi pengeluaran tidak penting.",
    icon: "warning",
    colorText: "text-error",
    colorBg: "bg-error-container/30",
    colorBorder: "border-error/25",
    colorBar: "bg-error",
  },
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePatternStore = defineStore("pattern", () => {
  const isLoading = ref(false);
  const storeError = ref<string | null>(null);
  const noData = ref(false);
  const result = ref<PatternResult | null>(null);

  // ─── Helpers ────────────────────────────────────────────────────────────

  const setLoading = (v: boolean) => { isLoading.value = v; };
  const setError   = (v: string | null) => { storeError.value = v; };
  const reset      = () => { result.value = null; storeError.value = null; noData.value = false; };

  // ─── Computed ────────────────────────────────────────────────────────────

  /** Active config object based on current classification */
  const config = computed(() =>
    result.value ? CONFIG[result.value.classification] : null
  );

  /** Confidence as a percentage string, e.g. "96.0%" */
  const confidenceFormatted = computed(() =>
    result.value
      ? (result.value.confidence * 100).toFixed(0) + "%"
      : null
  );

  /**
   * Single top-probability bar — the class with the highest probability.
   * Prevents ambiguous multi-bar representation on the dashboard.
   */
  const topBar = computed(() => {
    if (!result.value) return null;
    const keys: HealthClassification[] = ["Healthy", "Moderate", "Critical"];
    const labels = ["Sehat", "Moderat", "Kritis"];
    const [h, m, c] = result.value.probabilities;
    const values = [h, m, c];
    const maxIdx = values.indexOf(Math.max(...values));
    const key = keys[maxIdx]!;
    return {
      key,
      labelId: labels[maxIdx]!,
      value: values[maxIdx]!,
      pct: (values[maxIdx]! * 100).toFixed(0),
      bar: CONFIG[key].colorBar,
    };
  });

  /** @deprecated use topBar — kept for backward compat */
  const probabilityBars = computed(() => {
    if (!result.value) return [];
    const [h, m, c] = result.value.probabilities;
    return [
      { key: "Healthy",  labelId: "Sehat",   value: h, pct: (h * 100).toFixed(0), bar: CONFIG.Healthy.colorBar  },
      { key: "Moderate", labelId: "Moderat", value: m, pct: (m * 100).toFixed(0), bar: CONFIG.Moderate.colorBar },
      { key: "Critical", labelId: "Kritis",  value: c, pct: (c * 100).toFixed(0), bar: CONFIG.Critical.colorBar },
    ];
  });

  // ─── Actions ─────────────────────────────────────────────────────────────

  async function classify() {
    const authStore = useAuthStore();
    const token = authStore.token;

    if (!token) {
      setError("Sesi tidak ditemukan. Silakan login ulang.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<{
        status: string;
        data: PatternResult;
      }>(`${BASE_URL}/pattern/predict`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data.status === "success") {
        result.value = response.data.data;
        noData.value = false;
      } else {
        setError("Respons tidak valid dari server.");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { status?: string; message?: string } | undefined;
        if (responseData?.status === "no_data") {
          noData.value = true;
          setError(null);
        } else {
          noData.value = false;
          setError("Kondisi keuangan belum dapat dianalisis. Coba lagi nanti.");
        }
      } else {
        noData.value = false;
        setError("Terjadi kesalahan tidak diketahui.");
      }
    } finally {
      setLoading(false);
    }
  }

  return {
    // state
    isLoading,
    storeError,
    noData,
    result,
    // computed
    config,
    confidenceFormatted,
    topBar,
    probabilityBars,
    // actions
    classify,
    reset,
    setError,
  };
});