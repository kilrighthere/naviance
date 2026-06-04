import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { CATEGORIES } from '@/types/transaksi'

export interface ForecastItem {
  id_kategori: string
  nama_kategori: string
  predicted_amount: number
  percentage: number
}

export const useForecastingStore = defineStore('forecasting', () => {
  const items = ref<ForecastItem[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const forecastMonth = ref('')

  // Total predicted spending
  const totalPrediksi = computed(() =>
    items.value.reduce((sum, item) => sum + item.predicted_amount, 0)
  )

  /**
   * Fetch AI forecasting predictions from backend.
   * Currently uses mock data — backend will integrate AI later.
   */
  const fetchForecast = async (userId: string) => {
    isLoading.value = true
    error.value = null

    try {
      // TODO: Replace with actual API call when backend integrates AI
      // e.g. const response = await supabase.functions.invoke('forecast', { body: { userId } })
      
      // For now, generate mock predictions for all categories
      const now = new Date()
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
      forecastMonth.value = nextMonth.toLocaleDateString('id-ID', {
        month: 'long',
        year: 'numeric'
      })

      // Mock data — simulates AI prediction output per category
      const mockPredictions: Record<string, number> = {
        'af5dc46e-26bf-48b1-8ba8-2124d0928a49': 2500000,  // makanan dan minuman
        '146489bd-fb7d-4e5c-bbec-932c9245697a': 800000,   // fashion
        '3cbd5118-8524-4dd8-b1a0-f2c83a16d245': 500000,   // kesehatan
        '38f317d7-034f-4900-912b-7328042381de': 1875000,   // transportasi
        '3eab81f1-8a6b-4bb7-b195-0e644ca41ca0': 750000,   // pendidikan
        '96f5a9c1-da72-43d7-bbdf-d5888e10c6aa': 1200000,  // belanja
        '80a90f45-811b-48d3-8f9c-0137873aff53': 1250000,  // hiburan
        'c3bf77bf-aed9-4c01-a554-407ec8237bcb': 1500000,  // investasi
        '83a23757-6790-487c-9868-c8e39453ad28': 2000000,  // tabungan
        'c0751a34-b2d0-4094-a5be-83b5068be5bb': 1800000,  // tagihan
        '563483bf-ae5b-41d2-82dd-7289c18aba7b': 600000,   // lainnya
        'cc700e23-4002-4bf1-bfe2-d9447af4e6b4': 0,        // bonus (income, no expense prediction)
        '8c36ed44-1a2b-4b47-a50e-7e525660ed5d': 0,        // gaji (income, no expense prediction)
      }

      const total = Object.values(mockPredictions).reduce((a, b) => a + b, 0)

      items.value = CATEGORIES.map(cat => ({
        id_kategori: cat.id_kategori,
        nama_kategori: cat.nama_kategori,
        predicted_amount: mockPredictions[cat.id_kategori] ?? 0,
        percentage: total > 0
          ? Math.round(((mockPredictions[cat.id_kategori] ?? 0) / total) * 100)
          : 0,
      }))

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800))
    } catch (err: any) {
      error.value = err.message || 'Gagal memuat prediksi'
    } finally {
      isLoading.value = false
    }
  }

  return {
    items,
    isLoading,
    error,
    forecastMonth,
    totalPrediksi,
    fetchForecast,
  }
})
