<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="bg-surface text-on-surface font-body-md antialiased selection:bg-secondary-container selection:text-on-secondary-container relative min-h-screen">
    <!-- Background Pattern Overlay -->
    <div class="fixed inset-0 pointer-events-none bg-pattern z-0 mix-blend-multiply"></div>
    
    <!-- TopAppBar -->
    <header class="bg-surface/80 backdrop-blur-xl dark:bg-surface-container/80 text-primary dark:text-primary-fixed sticky top-0 w-full z-50 border-b border-outline-variant/30 shadow-sm relative z-50">
      <div class="flex justify-between items-center h-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div class="flex items-center gap-3 cursor-pointer opacity-100 transition-all hover:opacity-80">
          <span class="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1;">account_balance</span>
          <div class="flex flex-col">
            <span class="font-headline-md text-headline-md font-extrabold tracking-tight text-primary dark:text-primary-fixed leading-none">Naviance</span>
            <span class="font-label-sm text-[10px] uppercase tracking-[0.1em] text-on-surface-variant font-bold">Navigate Your Finance</span>
          </div>
        </div>
        <nav class="hidden md:flex items-center gap-8">
          <a class="text-on-surface-variant dark:text-on-surface-variant font-medium hover:text-secondary transition-colors duration-200" href="#features">Features</a>
          <a class="text-on-surface-variant dark:text-on-surface-variant font-medium hover:text-secondary transition-colors duration-200" href="#about">About</a>
          <a class="text-on-surface-variant dark:text-on-surface-variant font-medium hover:text-secondary transition-colors duration-200" href="#pricing">Pricing</a>
        </nav>
        <div class="flex items-center gap-4">
          <button @click="router.push('/login')" class="hidden md:block font-label-md text-label-md text-primary hover:text-secondary transition-colors duration-200">Login</button>
          <button @click="router.push('/register')" class="bg-primary text-on-primary font-label-md text-label-md px-6 py-2.5 rounded-full hover:bg-primary/90 transition-all active:scale-[0.98] shadow-sm">Get Started</button>
        </div>
      </div>
    </header>

    <main class="relative z-10">
      <!-- Hero Section -->
      <section class="relative pt-16 pb-20 px-margin-mobile md:px-margin-desktop overflow-hidden bg-gradient-to-br from-surface to-surface-container-low">
        <!-- Background decorative gradient -->
        <div class="absolute top-0 right-0 w-3/4 h-full bg-gradient-to-bl from-primary-fixed/20 via-tertiary-fixed-dim/10 to-transparent -z-10 rounded-bl-[120px] opacity-80 blur-3xl"></div>
        <div class="absolute top-1/4 left-0 w-1/3 h-1/2 bg-gradient-to-tr from-secondary-container/10 to-transparent -z-10 rounded-full blur-3xl"></div>
        
        <div class="max-w-container-max mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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
            <div class="absolute bottom-6 -left-6 md:left-6 bg-surface-container-lowest/80 backdrop-blur-lg border border-white/60 p-4 rounded-xl shadow-xl flex items-center gap-4 w-64 animate-bounce" style="animation-duration: 4s;">
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
      <section class="py-16 px-margin-mobile md:px-margin-desktop bg-surface-container/30 relative" id="features">
        <div class="absolute inset-0 bg-gradient-to-b from-surface-container-low/50 to-transparent pointer-events-none"></div>
        <div class="max-w-container-max mx-auto relative z-10">
          <div class="text-center mb-12 max-w-2xl mx-auto">
            <h2 class="font-headline-lg text-headline-lg text-primary mb-3">Fitur Inti Naviance</h2>
            <p class="font-body-md text-body-md text-on-surface-variant">Teknologi mutakhir yang dirancang khusus untuk menyederhanakan pelacakan keuangan Anda tanpa membuang waktu berharga.</p>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Feature 1: OCR (Spans 2 columns on desktop) -->
            <div class="md:col-span-2 bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/40 shadow-md flex flex-col md:flex-row gap-8 items-center group overflow-hidden relative">
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-fixed to-transparent opacity-50"></div>
              <div class="flex-1 space-y-4">
                <div class="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
                  <span class="material-symbols-outlined">document_scanner</span>
                </div>
                <h3 class="font-headline-md text-headline-md text-primary">Pencatatan Otomatis OCR</h3>
                <p class="font-body-md text-body-md text-on-surface-variant">
                    Pindai struk belanja secara instan. AI kami akan secara otomatis mengekstrak nama merchant, total biaya, dan mengkategorikannya tanpa perlu input manual.
                </p>
              </div>
              <div class="flex-1 w-full h-64 md:h-full bg-surface-variant rounded-2xl overflow-hidden relative border border-outline-variant/30 shadow-inner group/mockup">
                <img alt="OCR receipt scanning process" class="w-full h-full object-cover transition-transform duration-700 group-hover/mockup:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDvwPY69BAHTJ_tMZFav-RUvwfTmpB85kg6DAUuHSJ0pqfp_fhmVA_u8obQl4Za_N_ZOr0lAKgHbc7ZbPyZi93-J5xYWG9C-O6Hj4mzlyNJ7EVZtPJ4_ivSkiYfwzHOjMsjCGiuvDTmu9dLxPMWwd2WqRtNc95WdW6LI0ubO7LjoUclU3LD_JTWX0X6HaoNitLSSned1Eb5CqAofvjVrgNOp_q5orKz2w0HVc_Q5rGAZSZRGkLRDLQ6sC-RkTWpw6gQ4d-JyeBy8PU"/>
                <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
            
            <!-- Feature 2: AI Forecasting -->
            <div class="bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/40 shadow-md flex flex-col gap-6 relative justify-between">
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary-container to-transparent opacity-50"></div>
              <div>
                <h3 class="font-headline-md text-headline-md text-primary mb-2">Prediksi Cerdas AI</h3>
                <p class="font-body-md text-body-md text-on-surface-variant">
                    Algoritma machine learning kami memproyeksikan pengeluaran bulan depan Anda berdasarkan pola historis.
                </p>
              </div>
              <div class="mt-4 w-full h-40 bg-surface-variant rounded-2xl overflow-hidden border border-outline-variant/30 shadow-inner">
                <img alt="Academic Spending Analysis Dashboard" class="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEVhNPj25fZrTO3w8YEJK3aZUVWmJzZWsZiuEaUiLH8CoNN9dG77E9yzJzH1vWJYdKVcMvxOyurQkARbknN7xNQkjRZtrTlK76eM1Yy6D700YiQmZXaoAmN7aE6_gu5_4xS8isefo7FMYKakMwujexpcOzVzv5inzhyzsusnoEZnErv0J-YqaWZaHnX9od0r60tGbyfHJYwfhv_XOr9JXNs98qj3Rd9lheKzjp9E3evuWLgXitNaBlvCCnJWA2vJejYTU4otsTMwk"/>
              </div>
            </div>
            
            <!-- Feature 3: Adaptive Goals -->
            <div class="md:col-span-3 bg-surface-container-lowest rounded-3xl p-8 border border-outline-variant/40 shadow-md flex flex-col md:flex-row items-center justify-between gap-8 bg-gradient-to-r from-surface-container-lowest via-surface-container-lowest to-surface-container-low relative">
              <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-tertiary-fixed-dim to-transparent opacity-50"></div>
              <div class="max-w-xl space-y-4">
                <div class="inline-flex items-center gap-2 text-tertiary-container bg-tertiary-fixed-dim/30 px-3 py-1 rounded-full border border-tertiary-fixed-dim/40 shadow-sm">
                  <span class="material-symbols-outlined text-sm">flag</span>
                  <span class="font-label-sm text-label-sm font-bold">Single-Active-Goal</span>
                </div>
                <h3 class="font-headline-md text-headline-md text-primary">Fokus Pada Satu Tujuan Adaptif</h3>
                <p class="font-body-md text-body-md text-on-surface-variant">
                    Jangan terpencar. Naviance mengarahkan fokus Anda pada satu target finansial pada satu waktu, menyesuaikan timeline secara dinamis berdasarkan pemasukan dan pengeluaran riil Anda.
                </p>
              </div>
              <div class="w-full md:w-1/3 bg-surface-container-lowest border border-outline-variant/40 p-6 rounded-2xl shadow-lg relative overflow-hidden">
                <div class="absolute -right-4 -top-4 w-16 h-16 bg-tertiary-fixed-dim/10 rounded-full blur-xl"></div>
                <div class="flex justify-between items-end mb-3">
                  <span class="font-label-md text-label-md text-primary">Dana Darurat</span>
                  <span class="font-label-sm text-label-sm text-secondary font-bold bg-secondary-fixed/50 px-2 py-0.5 rounded">75%</span>
                </div>
                <div class="w-full h-3 bg-surface-container rounded-full overflow-hidden shadow-inner">
                  <div class="h-full bg-gradient-to-r from-tertiary-fixed-dim to-tertiary w-3/4 rounded-full shadow-sm"></div>
                </div>
                <p class="font-label-sm text-label-sm text-on-surface-variant mt-3 text-right flex items-center justify-end gap-1"><span class="material-symbols-outlined text-[14px]">check_circle</span> Tercapai dalam 2 bulan</p>
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
      <section class="py-12 px-margin-mobile md:px-margin-desktop bg-surface text-center relative z-10">
        <div class="max-w-container-max mx-auto">
          <p class="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest mb-6 flex items-center justify-center gap-4 before:h-px before:w-12 before:bg-outline-variant/50 after:h-px after:w-12 after:bg-outline-variant/50">Dipercaya oleh ribuan profesional muda</p>
          <div class="flex flex-wrap justify-center items-center gap-10 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
            <div class="flex items-center gap-2 font-headline-md text-primary bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow"><span class="material-symbols-outlined text-2xl text-secondary">corporate_fare</span> StartupHub</div>
            <div class="flex items-center gap-2 font-headline-md text-primary bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow"><span class="material-symbols-outlined text-2xl text-tertiary">domain</span> TechFinance</div>
            <div class="flex items-center gap-2 font-headline-md text-primary bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow"><span class="material-symbols-outlined text-2xl text-primary-fixed-variant">business</span> UnivInvest</div>
            <div class="flex items-center gap-2 font-headline-md text-primary bg-surface-container-low px-4 py-2 rounded-lg border border-outline-variant/20 shadow-sm hover:shadow-md transition-shadow"><span class="material-symbols-outlined text-2xl text-error">storefront</span> GenZBank</div>
          </div>
        </div>
      </section>
      
      <!-- Final CTA -->
      <section class="py-16 px-margin-mobile md:px-margin-desktop relative z-10">
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
    <footer class="bg-primary dark:bg-surface-container-lowest w-full py-12 border-t border-primary-container relative z-10">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-gutter px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div class="flex flex-col gap-4 md:col-span-1">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-secondary" style="font-variation-settings: 'FILL' 1;">account_balance</span>
            <span class="font-headline-md text-headline-md font-black text-on-primary dark:text-primary">Naviance</span>
          </div>
          <p class="font-body-md text-body-md text-on-primary/80 dark:text-on-surface-variant">Naviance: Navigate Your Finance. Empowering your financial future through intelligent tracking.</p>
        </div>
        <div class="flex flex-col gap-3 md:col-start-3">
          <a class="font-body-md text-body-md text-on-primary/60 dark:text-on-surface-variant/70 hover:text-secondary-fixed-dim transition-colors active:translate-y-[-2px]" href="#">Privacy Policy</a>
          <a class="font-body-md text-body-md text-on-primary/60 dark:text-on-surface-variant/70 hover:text-secondary-fixed-dim transition-colors active:translate-y-[-2px]" href="#">Terms of Service</a>
          <a class="font-body-md text-body-md text-on-primary/60 dark:text-on-surface-variant/70 hover:text-secondary-fixed-dim transition-colors active:translate-y-[-2px]" href="#">Security</a>
        </div>
        <div class="flex flex-col gap-3">
          <a class="font-body-md text-body-md text-on-primary/60 dark:text-on-surface-variant/70 hover:text-secondary-fixed-dim transition-colors active:translate-y-[-2px]" href="#">Cookie Settings</a>
          <a class="font-body-md text-body-md text-on-primary/60 dark:text-on-surface-variant/70 hover:text-secondary-fixed-dim transition-colors active:translate-y-[-2px]" href="#">Help Center</a>
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
</style>