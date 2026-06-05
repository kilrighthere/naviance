import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useAuthStore } from '@/stores/auth'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface RasaResponse {
  recipient_id: string
  text: string
}

interface QuickSuggestion {
  title: string
  description: string
  icon: string
  prompt: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CHATBOT_API_URL =
  'https://capstone-dbs-production-766e.up.railway.app/webhooks/rest/webhook'

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate ID unik untuk setiap message.
 */
function generateId(): string {
  return `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Menggabungkan multiple response dari Rasa menjadi satu string,
 * dipisah baris baru agar tampil rapi di markdown renderer.
 */
function joinRasaResponses(responses: RasaResponse[]): string {
  return responses
    .map((r) => r.text)
    .filter(Boolean)
    .join('\n\n')
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useChatbotStore = defineStore('chatbot', () => {
  // ── State ──────────────────────────────────────────────────────────────────

  const messages = ref<Message[]>([])
  const isLoading = ref(false)

  // ── Getters ────────────────────────────────────────────────────────────────

  /**
   * isEmpty dipakai di view untuk:
   * - toggle antara empty state dan chat messages
   * - show/hide tombol "Chat Baru"
   */
  const isEmpty = computed(() => messages.value.length === 0)

  /**
   * Suggestion cards yang tampil di empty state.
   * Prompt adalah teks yang dikirim ke chatbot, sedangkan
   * title & description hanya untuk tampilan UI.
   */
  const quickSuggestions: QuickSuggestion[] = [
    {
      title: 'Catat Transaksi',
      description: 'Catat pemasukan atau pengeluaran harianmu',
      icon: 'receipt_long',
      prompt: 'Saya ingin mencatat transaksi baru',
    },
    {
      title: 'Ringkasan Keuangan',
      description: 'Lihat ringkasan keuangan bulan ini',
      icon: 'bar_chart',
      prompt: 'Tampilkan ringkasan keuangan bulan ini',
    },
    {
      title: 'Analisis Pengeluaran',
      description: 'Analisa pola pengeluaran dan kategorisasi',
      icon: 'analytics',
      prompt: 'Analisis pengeluaran saya bulan ini',
    },
    {
      title: 'Saran Tabungan',
      description: 'Dapatkan rekomendasi untuk mencapai target',
      icon: 'savings',
      prompt: 'Berikan saran tabungan untuk target saya',
    },
  ]

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Mengirim pesan user ke Rasa chatbot dan menambahkan
   * response ke messages.
   *
   * Flow:
   * 1. Tambah user message ke state
   * 2. Set isLoading = true (tampil typing indicator di view)
   * 3. Ambil userId & token dari authStore
   * 4. POST ke Rasa webhook
   * 5. Gabungkan response array → 1 assistant message
   * 6. Tambah assistant message ke state
   * 7. Set isLoading = false
   */
  async function sendMessage(text: string): Promise<void> {
    if (!text.trim() || isLoading.value) return

    // Tambah user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
    messages.value.push(userMessage)
    isLoading.value = true

    try {
      // Ambil auth dari useAuthStore
      // - user.id  → sebagai "sender" di body Rasa
      // - token    → computed dari session.access_token
      const authStore = useAuthStore()
      const userId = authStore.user?.id
      const accessToken = authStore.token

      // Guard: jika sesi sudah habis, hentikan dan beri tahu user
      if (!userId || !accessToken) {
        pushAssistantMessage('Sesi kamu sudah habis. Silakan login ulang.')
        return
      }

      const response = await axios.post<RasaResponse[]>(
        CHATBOT_API_URL,
        {
          sender: userId,
          message: text.trim(),
          metadata: {
            access_token: accessToken,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          // Timeout 30 detik — Rasa kadang lambat di cold start
          timeout: 30000,
        },
      )

      const rasaResponses = response.data

      // Jika response kosong (Rasa tidak membalas), tampilkan pesan fallback
      if (!rasaResponses || rasaResponses.length === 0) {
        pushAssistantMessage('Maaf, saya tidak mengerti. Coba ulangi dengan kalimat yang berbeda.')
        return
      }

      // Gabungkan semua response text menjadi 1 message
      const combinedText = joinRasaResponses(rasaResponses)
      pushAssistantMessage(combinedText)
    } catch (error) {
      // Tangani error jaringan / timeout / server error
      let errorMessage = 'Maaf, terjadi kesalahan saat menghubungi asisten. Silakan coba lagi.'

      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          errorMessage = 'Koneksi timeout. Silakan coba lagi.'
        } else if (error.response?.status === 401) {
          errorMessage = 'Sesi kamu sudah habis. Silakan login ulang.'
        } else if (error.response?.status && error.response.status >= 500) {
          errorMessage = 'Server sedang bermasalah. Coba beberapa saat lagi.'
        }
      }

      pushAssistantMessage(errorMessage)
    } finally {
      isLoading.value = false
    }
  }

  /**
   * Helper internal untuk push assistant message ke state.
   */
  function pushAssistantMessage(content: string): void {
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date(),
    }
    messages.value.push(assistantMessage)
  }

  /**
   * Reset seluruh chat ke kondisi awal (empty state).
   * Dipanggil saat user klik tombol "Chat Baru".
   */
  function clearChat(): void {
    messages.value = []
    isLoading.value = false
  }

  // ── Expose ─────────────────────────────────────────────────────────────────

  return {
    // state
    messages,
    isLoading,
    // getters
    isEmpty,
    quickSuggestions,
    // actions
    sendMessage,
    clearChat,
  }
})