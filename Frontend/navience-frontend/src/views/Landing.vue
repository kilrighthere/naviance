<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="bg-surface text-on-surface font-body-md antialiased selection:bg-secondary-container selection:text-on-secondary-container relative min-h-screen">
    <!-- Background Pattern Overlay -->
    <div class="fixed inset-0 pointer-events-none bg-pattern z-0 mix-blend-multiply"></div>

    <!-- TopAppBar -->
    <header class="bg-surface/80 backdrop-blur-xl text-primary sticky top-0 w-full z-50 border-b border-outline-variant/30 shadow-sm">
      <div class="flex justify-between items-center h-20 px-4 md:px-10 max-w-[1280px] mx-auto">
        <div class="flex items-center gap-3 cursor-pointer opacity-100 transition-all hover:opacity-80">
          <span class="material-symbols-outlined text-4xl text-secondary">account_balance</span>
          <div class="flex flex-col">
            <span class="font-headline-md text-headline-md font-extrabold tracking-tight text-primary leading-none">Naviance</span>
            <span class="font-label-sm text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-bold">Navigate Your Finance</span>
          </div>
        </div>
        <nav class="hidden md:flex items-center gap-8">
          <a class="text-on-surface-variant font-medium hover:text-secondary transition-colors duration-200" href="#features">Features</a>
          <a class="text-on-surface-variant font-medium hover:text-secondary transition-colors duration-200" href="#about">About</a>
          <a class="text-on-surface-variant font-medium hover:text-secondary transition-colors duration-200" href="#pricing">Pricing</a>
        </nav>
        <div class="flex items-center gap-4">
          <button @click="router.push('/login')" class="hidden md:block font-label-md text-label-md text-primary hover:text-secondary transition-colors duration-200">Login</button>
          <button @click="router.push('/register')" class="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full hover:bg-primary/90 transition-all active:scale-[0.98] shadow-sm">Get Started</button>
        </div>
      </div>
    </header>

    <main class="relative z-10">
      <!-- Hero Section -->
      <section class="relative pt-16 pb-20 px-4 md:px-10 overflow-hidden bg-gradient-to-br from-surface to-surface-container-low">
        <!-- Background decorative gradient -->
        <div class="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-bl from-primary-fixed/20 via-tertiary-fixed-dim/10 to-transparent -z-10 rounded-bl-[120px] opacity-80 blur-3xl"></div>
        <div class="absolute top-1/4 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-secondary-container/10 to-transparent -z-10 rounded-full blur-3xl"></div>

        <div class="max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div class="flex flex-col gap-5 max-w-xl">
            <div class="inline-flex items-center gap-2 bg-secondary-container/20 text-secondary-container px-4 py-1.5 rounded-full w-fit border border-secondary-container/30 shadow-sm">
              <span class="material-symbols-outlined text-sm">auto_awesome</span>
              <span class="font-label-md text-label-md">AI Financial Tracker</span>
            </div>

            <p class="font-label-md text-label-md text-secondary font-bold uppercase tracking-widest mb-1">Navigate Your Finance</p>

            <h1 class="font-display-lg text-display-lg text-primary leading-tight">
                Kuasai Keuanganmu dengan Kecerdasan AI
            </h1>

            <p class="font-body-lg text-body-lg text-on-surface-variant text-balance">
                Naviance membantu mahasiswa dan profesional muda mengelola keuangan secara otomatis dengan teknologi OCR dan prediksi AI yang presisi. Tinggalkan cara manual, mulai kendalikan masa depanmu.
            </p>

            <div class="flex flex-col sm:flex-row gap-4 mt-2">
              <button @click="router.push('/register')" class="bg-primary text-on-primary font-label-md text-label-md px-8 py-3.5 rounded-full hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/20">
                  Mulai Gratis Sekarang
              </button>
              <button class="bg-surface-container-lowest text-primary border border-outline-variant/60 font-label-md text-label-md px-8 py-3.5 rounded-full hover:bg-surface-container transition-all active:scale-[0.98] shadow-sm">
                  Lihat Demo
              </button>
            </div>
          </div>

          <!-- Hero Image/Mockup -->
          <div class="relative w-full aspect-square md:aspect-[4/3] rounded-3xl bg-surface-container-lowest shadow-xl border border-outline-variant/40 overflow-visible group">
            <!-- Soft Glow Behind Image -->
            <div class="absolute -inset-4 bg-gradient-to-r from-primary/10 to-tertiary/10 rounded-3xl blur-2xl -z-10"></div>

            <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 rounded-3xl" style="background-image: url('https://lh3.googleusercontent.com/aida-public/AB6AXuCZRWRXrHOHZAoML-n2TsfF73JLOcFXhc2Rep1lm6phh2zzyl0T9B7EJXbYlWzB8skzrCI1egq4wpx1U5vVId924W6GpbkBqkFxMbqDvhqwCp37GD0b6w_uezSnPXwMnPRERVE58hHbLs3j8WrVDjWqPeZ-WSzuerWwsKhgv8Wo0tZzLVaVQr6_0_c8YcvpwL5kGsy32VaV8bTIuXVeondnPsRi6O5HUT29qgcsrzOdPLvBenI7xZ69oPpmsb5LMhYBWrXd8o3TeQI');">
            </div>

            <!-- Glassmorphism Floating Element -->
            <div class="absolute bottom-6 -left-6 md:left-6 bg-surface-container-lowest/80 backdrop-blur-lg border border-white/60 p-4 rounded-xl shadow-xl flex items-center gap-4 w-64 floating-card">
              <div class="w-10 h-10 rounded-full bg-tertiary-fixed-dim/20 flex items-center justify-center text-tertiary-fixed-dim">
                <span class="material-symbols-outlined">trending_up</span>
              </div>
              <div>
                <p class="font-label-sm text-label-sm text-on-surface-variant">Prediksi Saldo</p>
                <p class="font-headline-md text-headline-md text-primary">Rp 4.500.000</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Decorative Divider -->
      <div class="w-full flex justify-center -mt-8 relative z-20">
        <div class="w-24 h-1 bg-gradient-to-r from-transparent via-outline-variant to-transparent rounded-full"></div>
      </div>

      <!-- Features - Bento Grid -->
      <section class="py-16 px-4 md:px-10 bg-surface-container/30 relative" id="features">
        <div class="absolute inset-0 bg-gradient-to-b from-surface-container-low/50 to-transparent pointer-events-none"></div>
        <div class="max-w-[1280px] mx-auto relative z-10">
          <div class="text-center mb-12 max-w-2xl mx-auto">
            <h2 class="font-headline-lg text-headline-lg text-primary mb-3">Fitur Inti Naviance</h2>
            <p class="font-body-md text-body-md text-on-surface-variant">Teknologi mutakhir yang dirancang khusus untuk menyederhanakan pelacakan keuangan Anda tanpa membuang waktu berharga.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <!-- Feature 1: OCR (Spans 2 columns) -->
            <div class="md:col-span-2 bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/40 shadow-md flex flex-col gap-6 group overflow-hidden relative hover:shadow-lg transition-shadow duration-300">
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-fixed to-transparent opacity-50"></div>
              <div class="flex-1 space-y-4">
                <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
                  <span class="material-symbols-outlined">document_scanner</span>
                </div>
                <h3 class="font-headline-md text-headline-md text-primary">Pencatatan Otomatis OCR</h3>
                <p class="font-body-md text-body-md text-on-surface-variant">
                    Pindai struk belanja secara instan. AI kami akan secara otomatis mengekstrak nama merchant dan total biaya.
                </p>
              </div>
              <div class="w-full h-48 bg-surface-variant rounded-2xl overflow-hidden relative border border-outline-variant/30 shadow-inner group/mockup">
                <img alt="OCR receipt scanning process" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida/ADBb0ugViY7vVDwv_qOlBgz9dqF8OrClpjeL59noao0uwxuSZ_ZDSsJuw3dpxHB-_BhpT1phwqUkVQ7VjYkjCClrtii6b7K3cHjZASN3XPfh4bl7cR95q-9BHDQICGHqVIAb7AdG9JqXqt2DbT80jYzS-pNfx_pFzAIleXs_BInp1eJetTzM14rzDWjbzYYTZy6CK_KRoKlg75QqTOwQHeQrr52BCFjxfqCBS86Smz8-3ySWLqdPQ16CuwrO5A"/>
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>

            <!-- Feature 2: AI Assistant (Spans 2 columns) -->
            <div class="md:col-span-2 bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/40 shadow-md flex flex-col gap-6 relative hover:shadow-lg transition-shadow duration-300">
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary-container to-transparent opacity-50"></div>
              <div class="flex-1 space-y-4">
                <div class="w-12 h-12 bg-secondary-container/20 rounded-xl flex items-center justify-center text-secondary-container shadow-sm">
                  <span class="material-symbols-outlined">smart_toy</span>
                </div>
                <h3 class="font-headline-md text-headline-md text-primary">Asisten AI (Chatbot)</h3>
                <p class="font-body-md text-body-md text-on-surface-variant">
                    Input transaksi berbasis NLP dan dapatkan saran keuangan cerdas langsung dari asisten virtual pribadi Anda.
                </p>
              </div>
              <!-- Chatbot Mockup -->
              <div class="w-full bg-surface-container-low rounded-2xl border border-outline-variant/30 p-4 space-y-3">
                <div class="flex gap-3 items-end">
                  <div class="w-8 h-8 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary-container">
                    <span class="material-symbols-outlined text-base">smart_toy</span>
                  </div>
                  <div class="bg-surface-container-highest p-3 rounded-2xl rounded-bl-none text-xs text-on-surface shadow-sm">Berapa sisa anggaran makan saya?</div>
                </div>
                <div class="flex gap-3 items-end justify-end">
                  <div class="bg-primary p-3 rounded-2xl rounded-br-none text-xs text-on-primary shadow-sm">Sisa Rp 200rb. Mau saya carikan diskon promo makan hari ini?</div>
                  <div class="w-8 h-8 rounded-full bg-primary-fixed-dim/30 flex items-center justify-center text-primary">
                    <span class="material-symbols-outlined text-base">auto_awesome</span>
                  </div>
                </div>
                <div class="mt-4 pt-3 border-t border-outline-variant/20 flex gap-2">
                  <div class="px-3 py-1 rounded-full bg-secondary-container/10 border border-secondary-container/30 text-[10px] text-secondary font-bold">Cari Promo</div>
                  <div class="px-3 py-1 rounded-full bg-surface-container-highest border border-outline-variant/30 text-[10px] text-on-surface-variant">Nanti saja</div>
                </div>
              </div>
            </div>

            <!-- Feature 3: Spending Forecasting (Spans 2 columns) -->
            <div class="md:col-span-2 bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/40 shadow-md flex flex-col gap-6 relative hover:shadow-lg transition-shadow duration-300">
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tertiary-fixed-dim to-transparent opacity-50"></div>
              <div class="flex-1 space-y-4">
                <div class="w-12 h-12 bg-tertiary-fixed-dim/20 rounded-xl flex items-center justify-center text-tertiary-fixed-dim shadow-sm">
                  <span class="material-symbols-outlined">trending_up</span>
                </div>
                <h3 class="font-headline-md text-headline-md text-primary">Prediksi Pengeluaran</h3>
                <p class="font-body-md text-body-md text-on-surface-variant">
                    Proyeksi berbasis machine learning untuk pengeluaran bulan depan Anda berdasarkan pola historis.
                </p>
              </div>
              <div class="w-full h-48 bg-surface-variant rounded-2xl overflow-hidden relative border border-outline-variant/30 shadow-inner group/mockup">
                <img alt="Spending Forecasting Dashboard" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida/ADBb0uiXE_Kkhc6i1_aWhK1Jwrm1R12z4ksiClyzBXLZosew3gLwVS5axJ7n9IcCIWW_FPLZNlF-17-CuNLWMy_fJsWmPEmZAsNxb_B5f4WKf2u38HM9loi6GuLInI9CfU-AWC6Xhki26edsJs_vKAG7iq9ThZAtgI96_X7Eysfu-FYVPvE9dhW2kxn91b78Q1mj4XSWSmftmFb3rDWIv2hAQVujpI_IVF2hIRMw3FLxCuszdb4axTAOvS3Op1Q"/>
              </div>
            </div>

            <!-- Feature 4: Smart Alerts (1 column) -->
            <div class="md:col-span-1 bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/40 shadow-md flex flex-col gap-6 relative hover:shadow-lg transition-shadow duration-300">
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-error to-transparent opacity-50"></div>
              <div class="flex-1 space-y-4">
                <div class="w-12 h-12 bg-error-container/50 rounded-xl flex items-center justify-center text-error shadow-sm">
                  <span class="material-symbols-outlined">notifications_active</span>
                </div>
                <h3 class="font-headline-md text-headline-md text-primary">Peringatan Cerdas</h3>
                <p class="font-body-md text-body-md text-on-surface-variant">
                    Notifikasi proaktif untuk anomali atau overbudgeting.
                </p>
              </div>
              <!-- Alert Mockup -->
              <div class="w-full bg-error-container/30 rounded-2xl border border-error/20 p-4 flex items-center gap-3">
                <div class="w-full space-y-3">
                  <div class="bg-white rounded-xl p-3 shadow-sm border border-error/10 flex items-start gap-3">
                    <div class="p-1.5 bg-error-container text-error rounded-lg flex-shrink-0">
                      <span class="material-symbols-outlined text-base">warning</span>
                    </div>
                    <div>
                      <p class="text-[10px] font-bold text-on-surface">Overbudgeting!</p>
                      <p class="text-[9px] text-on-surface-variant">Pengeluaran hiburan melebihi batas 15%.</p>
                    </div>
                  </div>
                  <div class="h-12 w-full bg-surface-container rounded-xl flex items-center justify-center border border-dashed border-outline-variant/40">
                    <span class="text-[10px] text-outline font-medium">Monitor Aktif</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Feature 5: Dynamic Goals (1 column) -->
            <div class="md:col-span-1 bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/40 shadow-md flex flex-col gap-6 relative hover:shadow-lg transition-shadow duration-300">
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tertiary to-transparent opacity-50"></div>
              <div class="flex-1 space-y-4">
                <div class="w-12 h-12 bg-tertiary/10 rounded-xl flex items-center justify-center text-tertiary shadow-sm">
                  <span class="material-symbols-outlined">target</span>
                </div>
                <h3 class="font-headline-md text-headline-md text-primary">Tabungan Dinamis</h3>
                <p class="font-body-md text-body-md text-on-surface-variant">
                    Timeline adaptif untuk target tabungan Anda.
                </p>
              </div>
              <!-- Savings Goal Mockup -->
              <div class="w-full bg-surface-container-low rounded-2xl border border-outline-variant/30 p-4">
                <div class="flex flex-col gap-4">
                  <div class="flex items-center justify-between">
                    <div class="w-10 h-10 rounded-full border-2 border-secondary-container border-t-transparent spin-slow flex items-center justify-center">
                      <span class="text-[10px] font-bold text-secondary">60%</span>
                    </div>
                    <div class="text-right">
                      <p class="text-[10px] font-bold text-primary">Laptop Baru</p>
                      <p class="text-[9px] text-on-surface-variant">Target: Rp 15jt</p>
                    </div>
                  </div>
                  <div class="space-y-1">
                    <div class="w-full h-1.5 bg-surface-variant rounded-full">
                      <div class="h-full bg-gradient-to-r from-secondary to-secondary-container w-[60%] rounded-full relative">
                        <div class="absolute -right-1 -top-1 w-2.5 h-2.5 bg-white border-2 border-secondary-container rounded-full"></div>
                      </div>
                    </div>
                    <div class="flex justify-between text-[8px] font-bold text-outline">
                      <span>Rp 9jt</span>
                      <span>3 bulan lagi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Decorative Divider -->
      <div class="w-full flex justify-center py-4 relative z-20">
        <div class="w-24 h-1 bg-gradient-to-r from-transparent via-outline-variant/50 to-transparent rounded-full"></div>
      </div>

      <!-- Trust / Social Proof -->
      <section class="py-12 px-4 md:px-10 bg-surface text-center relative z-10">
        <div class="max-w-[1280px] mx-auto">
          <p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-6 flex items-center justify-center gap-4 before:h-px before:w-12 before:bg-outline-variant/50 after:h-px after:w-12 after:bg-outline-variant/50">Dipercaya oleh ribuan profesional muda</p>
          <div class="flex flex-wrap justify-center items-center gap-10 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div class="flex items-center gap-2 font-headline-md text-primary bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow"><span class="material-symbols-outlined text-2xl text-secondary">corporate_fare</span> StartupHub</div>
            <div class="flex items-center gap-2 font-headline-md text-primary bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow"><span class="material-symbols-outlined text-2xl text-tertiary">domain</span> TechFinance</div>
            <div class="flex items-center gap-2 font-headline-md text-primary bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow"><span class="material-symbols-outlined text-2xl text-on-primary-fixed-variant">business</span> UnivInvest</div>
            <div class="flex items-center gap-2 font-headline-md text-primary bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow"><span class="material-symbols-outlined text-2xl text-error">storefront</span> GenZBank</div>
          </div>
        </div>
      </section>

      <!-- Final CTA -->
      <section class="py-16 px-4 md:px-10 relative z-10">
        <div class="max-w-4xl mx-auto bg-primary rounded-[2.5rem] p-12 text-center shadow-2xl relative overflow-hidden border border-primary-container">
          <div class="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-secondary/30 via-primary to-primary opacity-90"></div>
          <div class="absolute -bottom-24 -left-24 w-64 h-64 bg-tertiary-fixed-dim/20 rounded-full blur-3xl"></div>
          <div class="relative z-10">
            <span class="material-symbols-outlined text-secondary text-5xl mb-4">rocket_launch</span>
            <h2 class="font-display-lg text-display-lg text-on-primary mb-4">Siap Ambil Kendali Masa Depan Keuanganmu?</h2>
            <p class="font-body-lg text-body-lg text-primary-fixed-dim mb-8 max-w-2xl mx-auto">
                Bergabunglah dengan generasi baru yang melek finansial. Mulai lacak, rencanakan, dan wujudkan tujuan Anda bersama asisten AI pribadi Anda hari ini.
            </p>
            <div class="flex justify-center">
              <button @click="router.push('/register')" class="bg-secondary-container text-on-secondary-container font-label-md text-label-md px-10 py-4 rounded-full hover:bg-secondary-fixed-dim transition-all active:scale-[0.98] shadow-lg shadow-secondary-container/30 flex items-center gap-2 border border-secondary">
                  Buat Akun Gratis
                  <span class="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-primary w-full py-12 border-t border-primary-container relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 px-4 md:px-10 max-w-[1280px] mx-auto">
        <div class="flex flex-col gap-4 md:col-span-1">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary brightness-0 invert opacity-80" style="font-variation-settings: 'FILL' 1;">account_balance</span>
            <span class="font-headline-md text-headline-md font-black text-on-primary">Naviance</span>
          </div>
          <p class="font-body-md text-body-md text-on-primary/80">Naviance: Navigate Your Finance. Empowering your financial future through intelligent tracking.</p>
        </div>
        <div class="flex flex-col gap-3 md:col-start-3">
          <a class="font-body-md text-body-md text-on-primary/60 hover:text-secondary-fixed-dim transition-colors" href="#">Privacy Policy</a>
          <a class="font-body-md text-body-md text-on-primary/60 hover:text-secondary-fixed-dim transition-colors" href="#">Terms of Service</a>
          <a class="font-body-md text-body-md text-on-primary/60 hover:text-secondary-fixed-dim transition-colors" href="#">Security</a>
        </div>
        <div class="flex flex-col gap-3">
          <a class="font-body-md text-body-md text-on-primary/60 hover:text-secondary-fixed-dim transition-colors" href="#">Cookie Settings</a>
          <a class="font-body-md text-body-md text-on-primary/60 hover:text-secondary-fixed-dim transition-colors" href="#">Help Center</a>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.material-symbols-outlined {
    font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* Custom Background Pattern */
.bg-pattern {
    background-image: radial-gradient(#c5c6cd 1px, transparent 1px);
    background-size: 24px 24px;
    background-position: -12px -12px;
    opacity: 0.15;
}

/* Floating card animation */
.floating-card {
    animation: float 4s ease-in-out infinite;
}

@keyframes float {
    0%, 100% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-12px);
    }
}

/* Slow spin for savings goal indicator */
.spin-slow {
    animation: spin 4s linear infinite;
}

@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}
</style>