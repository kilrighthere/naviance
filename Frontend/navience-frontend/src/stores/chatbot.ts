import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface QuickSuggestion {
  icon: string
  title: string
  description: string
  prompt: string
}

const dummyResponses: Record<string, string> = {
  'analisis-pengeluaran': `## 📊 Analisis Pengeluaran Bulan Ini

Berdasarkan data transaksi Anda, berikut ringkasan pengeluaran bulan ini:

| Kategori | Jumlah | Persentase |
|---|---|---|
| 🍔 Makanan & Minuman | Rp 2.450.000 | 32% |
| 🚗 Transportasi | Rp 1.200.000 | 16% |
| 🛒 Belanja | Rp 1.800.000 | 24% |
| 💡 Utilitas | Rp 850.000 | 11% |
| 🎬 Hiburan | Rp 1.300.000 | 17% |

**Total Pengeluaran: Rp 7.600.000**

### 💡 Insight Utama:
- Pengeluaran **Makanan & Minuman** naik **18%** dibanding bulan lalu. Pertimbangkan untuk memasak di rumah lebih sering.
- Kategori **Belanja** memiliki 3 transaksi impulsif yang bisa dihindari sebesar Rp 650.000.
- Anda sudah menggunakan **76%** dari anggaran bulanan dengan sisa 12 hari.`,

  'strategi-menabung': `## 💰 Strategi Menabung Personalisasi

Berdasarkan pola keuangan Anda, berikut rekomendasi saya:

### 1. Metode 50/30/20
Dengan pendapatan Rp 12.000.000/bulan:
- **50% Kebutuhan**: Rp 6.000.000 (saat ini Rp 5.250.000 ✅)
- **30% Keinginan**: Rp 3.600.000 (saat ini Rp 4.100.000 ⚠️)
- **20% Tabungan**: Rp 2.400.000 (saat ini Rp 1.650.000 ❌)

### 2. Automasi Tabungan
Saya sarankan untuk menyiapkan auto-debit di awal bulan:
- **Dana Darurat**: Rp 1.000.000/bulan → tercapai dalam 40 bulan
- **Investasi**: Rp 800.000/bulan di Reksadana

### 3. Potensi Penghematan
- Ganti kopi harian (Rp 35.000 × 22 hari = Rp 770.000) → buat sendiri bisa hemat **Rp 550.000/bulan**
- Kurangi langganan yang jarang dipakai: **Rp 150.000/bulan**

> 🎯 **Target**: Dengan langkah ini, Anda bisa menabung ekstra **Rp 700.000/bulan**!`,

  'tinjauan-anggaran': `## 📋 Tinjauan Anggaran Bulan Juni 2026

### Status Anggaran per Kategori:

| Kategori | Anggaran | Terpakai | Sisa | Status |
|---|---|---|---|---|
| Makanan | Rp 3.000.000 | Rp 2.450.000 | Rp 550.000 | ⚠️ 82% |
| Transport | Rp 1.500.000 | Rp 1.200.000 | Rp 300.000 | ⚠️ 80% |
| Belanja | Rp 2.000.000 | Rp 1.800.000 | Rp 200.000 | 🔴 90% |
| Utilitas | Rp 1.000.000 | Rp 850.000 | Rp 150.000 | ⚠️ 85% |
| Hiburan | Rp 1.500.000 | Rp 1.300.000 | Rp 200.000 | 🔴 87% |

### ⚠️ Peringatan:
- **3 kategori** mendekati limit (>80%)
- Proyeksi akhir bulan: kemungkinan **over-budget Rp 800.000**

### 🔧 Rekomendasi Penyesuaian:
1. Alokasikan sisa Dana Darurat ke kategori Belanja
2. Freeze pengeluaran Hiburan untuk 12 hari terakhir
3. Siapkan buffer Rp 500.000 dari tabungan darurat`,

  'input-transaksi': `## ✏️ Input Transaksi via Chat

Tentu! Anda bisa mencatat transaksi dengan mengetik secara natural. Contoh:

- *"Makan siang di Solaria Rp 85.000"*
- *"Gaji masuk Rp 12.000.000"*
- *"Bayar listrik Rp 350.000"*
- *"Beli baju di Uniqlo Rp 499.000"*

Saya akan otomatis mengkategorikan dan mencatat transaksi Anda. 

### 📝 Coba sekarang!
Ketik transaksi Anda di bawah, dan saya akan memprosesnya. Pastikan menyebutkan:
1. **Deskripsi** transaksi
2. **Nominal** (dalam Rupiah)
3. *(Opsional)* Tanggal jika bukan hari ini`,
}

const fallbackResponses = [
  `Terima kasih atas pertanyaannya! Berdasarkan analisis data keuangan Anda, saya merekomendasikan untuk:

1. **Meninjau pengeluaran** kategori terbesar Anda bulan ini
2. **Memastikan** alokasi tabungan minimal 20% dari pendapatan
3. **Memantau** progress target keuangan secara mingguan

Ada hal spesifik yang ingin Anda ketahui lebih lanjut?`,

  `Pertanyaan yang bagus! Berikut beberapa insight dari data Anda:

📈 **Tren Positif**: Pendapatan Anda meningkat 8% dalam 3 bulan terakhir.
📉 **Perlu Perhatian**: Rasio pengeluaran-pendapatan masih di atas 75%.

Saya sarankan untuk fokus pada pengurangan pengeluaran non-esensial terlebih dahulu. Mau saya buatkan rencana detailnya?`,

  `Saya sudah menganalisis data finansial Anda. Berikut hasilnya:

### Kesehatan Keuangan: 🟡 Sedang (Skor: 65/100)

**Kelebihan:**
- Pendapatan stabil
- Memiliki target tabungan yang jelas

**Perlu Ditingkatkan:**
- Disiplin anggaran kategori hiburan
- Konsistensi menabung setiap bulan

Ingin saya jelaskan lebih detail tentang salah satu aspek?`,
]

export const useChatbotStore = defineStore('chatbot', () => {
  const messages = ref<ChatMessage[]>([])
  const isLoading = ref(false)
  const hasStartedChat = ref(false)

  const quickSuggestions: QuickSuggestion[] = [
    {
      icon: 'monitoring',
      title: 'Analisis Pengeluaran',
      description: 'Identifikasi pola dan anomali dalam pengeluaran bulanan Anda.',
      prompt: 'analisis-pengeluaran',
    },
    {
      icon: 'savings',
      title: 'Strategi Menabung',
      description: 'Temukan cara untuk meningkatkan tingkat tabungan Anda secara efektif.',
      prompt: 'strategi-menabung',
    },
    {
      icon: 'pie_chart',
      title: 'Tinjauan Anggaran',
      description: 'Analisis alokasi anggaran dan target yang direncanakan.',
      prompt: 'tinjauan-anggaran',
    },
    {
      icon: 'receipt_long',
      title: 'Input Transaksi',
      description: 'Catat pengeluaran atau pemasukan Anda secara otomatis melalui percakapan.',
      prompt: 'input-transaksi',
    },
  ]

  const isEmpty = computed(() => messages.value.length === 0)

  function generateId(): string {
    return `msg-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  }

  function addUserMessage(content: string): void {
    hasStartedChat.value = true
    messages.value.push({
      id: generateId(),
      role: 'user',
      content,
      timestamp: new Date(),
    })
  }

  async function sendMessage(content: string): Promise<void> {
    addUserMessage(content)
    isLoading.value = true

    // Simulate AI typing delay (1.5-3s)
    const delay = 1500 + Math.random() * 1500
    await new Promise((resolve) => setTimeout(resolve, delay))

    // Check for mapped responses first
    const mapped = dummyResponses[content]
    let response: string

    if (mapped !== undefined) {
      response = mapped
    } else {
      // Use fallback random response
      const idx = Math.floor(Math.random() * fallbackResponses.length)
      response = fallbackResponses[idx] ?? 'Maaf, saya tidak mengerti.'
    }

    messages.value.push({
      id: generateId(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    })

    isLoading.value = false
  }

  function clearChat(): void {
    messages.value = []
    hasStartedChat.value = false
  }

  return {
    messages,
    isLoading,
    hasStartedChat,
    quickSuggestions,
    isEmpty,
    sendMessage,
    clearChat,
  }
})
