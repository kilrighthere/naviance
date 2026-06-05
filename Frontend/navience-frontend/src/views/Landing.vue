<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'

const router = useRouter()

// ─── Counting Animation ───────────────────────────
const counters = ref({ users: 0, transactions: 0, satisfaction: 0 })
const counterTargets = { users: 10000, transactions: 50, satisfaction: 98 }
const hasCounterAnimated = ref(false)

function animateCounters() {
  if (hasCounterAnimated.value) return
  hasCounterAnimated.value = true
  const duration = 2000
  const steps = 60
  const interval = duration / steps
  let step = 0
  const timer = setInterval(() => {
    step++
    const progress = step / steps
    const ease = 1 - Math.pow(1 - progress, 3) // easeOutCubic
    counters.value.users = Math.round(counterTargets.users * ease)
    counters.value.transactions = Math.round(counterTargets.transactions * ease)
    counters.value.satisfaction = Math.round(counterTargets.satisfaction * ease)
    if (step >= steps) {
      counters.value.users = counterTargets.users
      counters.value.transactions = counterTargets.transactions
      counters.value.satisfaction = counterTargets.satisfaction
      clearInterval(timer)
    }
  }, interval)
}

// ─── Scroll-triggered Animations ──────────────────
const observerRef = ref<IntersectionObserver | null>(null)

onMounted(() => {
  observerRef.value = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
          // Trigger counter animation when metrics section is visible
          if (entry.target.id === 'metrics-section') {
            animateCounters()
          }
        }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -50px 0px' }
  )

  // Observe all reveal elements after DOM is ready
  setTimeout(() => {
    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observerRef.value?.observe(el)
    })
  }, 100)
})

onUnmounted(() => {
  observerRef.value?.disconnect()
})

// ─── Mobile Nav Toggle ────────────────────────────
const isMobileNavOpen = ref(false)
</script>

<template>
  <div class="landing-root">
    <!-- Background Pattern Overlay -->
    <div class="bg-pattern"></div>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- NAVBAR                                          -->
    <!-- ═══════════════════════════════════════════════ -->
    <header class="navbar">
      <div class="navbar-inner">
        <div class="navbar-brand" @click="router.push('/')">
          <img src="/logo.png" alt="Naviance Logo" class="brand-icon-img" />
          <div class="brand-text">
            <span class="brand-name">Naviance</span>
            <span class="brand-tagline">Navigate Your Finance</span>
          </div>
        </div>

        <nav class="navbar-links">
          <a href="#features">Fitur</a>
          <a href="#how-it-works">Cara Kerja</a>
          <a href="#testimonials">Testimoni</a>
        </nav>

        <div class="navbar-actions">
          <button class="btn-text" @click="router.push('/login')">Login</button>
          <button class="btn-primary-pill" @click="router.push('/register')">
            Mulai Gratis
          </button>
        </div>

        <!-- Mobile hamburger -->
        <button class="mobile-menu-btn" @click="isMobileNavOpen = !isMobileNavOpen">
          <span class="material-symbols-outlined">{{ isMobileNavOpen ? 'close' : 'menu' }}</span>
        </button>
      </div>

      <!-- Mobile Nav Drawer -->
      <div class="mobile-nav" :class="{ open: isMobileNavOpen }">
        <a href="#features" @click="isMobileNavOpen = false">Fitur</a>
        <a href="#how-it-works" @click="isMobileNavOpen = false">Cara Kerja</a>
        <a href="#testimonials" @click="isMobileNavOpen = false">Testimoni</a>
        <div class="mobile-nav-actions">
          <button class="btn-text" @click="router.push('/login'); isMobileNavOpen = false">Login</button>
          <button class="btn-primary-pill" @click="router.push('/register'); isMobileNavOpen = false">Mulai Gratis</button>
        </div>
      </div>
    </header>

    <main>
      <!-- ═══════════════════════════════════════════════ -->
      <!-- HERO SECTION                                    -->
      <!-- ═══════════════════════════════════════════════ -->
      <section class="hero">
        <!-- Decorative blobs -->
        <div class="hero-blob hero-blob-1"></div>
        <div class="hero-blob hero-blob-2"></div>
        <div class="hero-blob hero-blob-3"></div>

        <div class="hero-inner">
          <div class="hero-content reveal-on-scroll">
            <div class="hero-badge">
              <span class="material-symbols-outlined badge-icon">auto_awesome</span>
              <span>Powered by AI</span>
            </div>

            <h1 class="hero-title">
              Kelola Keuanganmu<br />
              dengan <span class="hero-title-accent">Kecerdasan AI</span>
            </h1>

            <p class="hero-subtitle">
              Naviance membantu mahasiswa dan profesional muda mengelola keuangan secara cerdas — catat transaksi via chatbot AI, kelola anggaran, dan wujudkan tujuan finansial Anda.
            </p>

            <div class="hero-cta-group">
              <button class="btn-primary-hero" @click="router.push('/register')">
                <span class="material-symbols-outlined">rocket_launch</span>
                Mulai Gratis Sekarang
              </button>
              <button class="btn-outline-hero" @click="router.push('/login')">
                <span class="material-symbols-outlined">play_circle</span>
                Lihat Demo
              </button>
            </div>
          </div>

          <!-- Hero Dashboard Mockup -->
          <div class="hero-visual reveal-on-scroll">
            <div class="hero-mockup">
              <!-- Dashboard mockup content -->
              <div class="mockup-topbar">
                <div class="mockup-dots">
                  <span></span><span></span><span></span>
                </div>
                <span class="mockup-url">naviance.app/dashboard</span>
              </div>
              <div class="mockup-body">
                <!-- Chart area -->
                <div class="mockup-chart">
                  <div class="mockup-chart-label">Ringkasan 6 Bulan</div>
                  <svg viewBox="0 0 300 80" class="mockup-svg">
                    <defs>
                      <linearGradient id="heroIncGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#00a472" stop-opacity="0.3" />
                        <stop offset="100%" stop-color="#00a472" stop-opacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0,60 L 50,45 L 100,50 L 150,30 L 200,35 L 250,20 L 300,15" fill="none" stroke="#00a472" stroke-width="2.5" stroke-linecap="round" />
                    <path d="M 0,60 L 50,45 L 100,50 L 150,30 L 200,35 L 250,20 L 300,15 L 300,80 L 0,80 Z" fill="url(#heroIncGrad)" />
                    <path d="M 0,70 L 50,55 L 100,60 L 150,50 L 200,55 L 250,45 L 300,40" fill="none" stroke="#ba1a1a" stroke-width="2" stroke-linecap="round" stroke-dasharray="4 4" />
                  </svg>
                  <div class="mockup-chart-months">
                    <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>Mei</span><span>Jun</span>
                  </div>
                </div>
                <!-- Stats row -->
                <div class="mockup-stats-row">
                  <div class="mockup-stat green">
                    <span class="stat-label">Pemasukan</span>
                    <span class="stat-value">Rp 8.5M</span>
                  </div>
                  <div class="mockup-stat red">
                    <span class="stat-label">Pengeluaran</span>
                    <span class="stat-value">Rp 5.2M</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Floating Cards -->
            <div class="floating-card card-chatbot">
              <div class="fc-icon fc-icon-amber">
                <span class="material-symbols-outlined">smart_toy</span>
              </div>
              <div class="fc-content">
                <span class="fc-label">AI Chatbot</span>
                <span class="fc-value">Online ✓</span>
              </div>
            </div>

            <div class="floating-card card-analytics">
              <div class="fc-icon fc-icon-purple">
                <span class="material-symbols-outlined">insights</span>
              </div>
              <div class="fc-content">
                <span class="fc-label">Analitik</span>
                <span class="fc-value">+12% Hemat</span>
              </div>
            </div>

            <div class="floating-card card-budget">
              <div class="fc-icon fc-icon-green">
                <span class="material-symbols-outlined">savings</span>
              </div>
              <div class="fc-content">
                <span class="fc-label">Target Tabungan</span>
                <div class="fc-progress-wrap">
                  <div class="fc-progress-bar"><div class="fc-progress-fill" style="width: 68%"></div></div>
                  <span class="fc-progress-text">68%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- METRICS TICKER                                  -->
      <!-- ═══════════════════════════════════════════════ -->
      <section class="metrics-section reveal-on-scroll" id="metrics-section">
        <div class="metrics-inner">
          <div class="metric-item">
            <span class="metric-number">{{ counters.users.toLocaleString('id-ID') }}+</span>
            <span class="metric-label">Pengguna Aktif</span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric-item">
            <span class="metric-number">{{ counters.transactions }}M+</span>
            <span class="metric-label">Transaksi Tercatat</span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric-item">
            <span class="metric-number">{{ counters.satisfaction }}%</span>
            <span class="metric-label">Kepuasan Pengguna</span>
          </div>
          <div class="metric-divider"></div>
          <div class="metric-item">
            <span class="metric-number">24/7</span>
            <span class="metric-label">AI Assistant</span>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- FEATURES BENTO GRID                             -->
      <!-- ═══════════════════════════════════════════════ -->
      <section class="features-section" id="features">
        <div class="section-container">
          <div class="section-header reveal-on-scroll">
            <span class="section-badge">Fitur Unggulan</span>
            <h2 class="section-title">Semua yang Anda Butuhkan untuk<br/>Menguasai Keuangan</h2>
            <p class="section-subtitle">Teknologi AI mutakhir yang dirancang khusus untuk menyederhanakan pelacakan keuangan tanpa membuang waktu berharga Anda.</p>
          </div>

          <div class="bento-grid">
            <!-- Feature 1: AI Chatbot (wide) -->
            <div class="bento-card reveal-on-scroll" style="--delay: 0ms">
              <div class="bento-text">
                <div class="bento-icon-wrap icon-bg-amber">
                  <span class="material-symbols-outlined">smart_toy</span>
                </div>
                <h3 class="bento-title">Asisten AI (Chatbot)</h3>
                <p class="bento-desc">Input transaksi dengan bahasa alami dan dapatkan saran keuangan cerdas langsung dari asisten virtual pribadi Anda.</p>
              </div>
              <!-- Mini Mockup: Chat -->
              <div class="bento-mockup mockup-chat">
                <div class="chat-bubble chat-user">Berapa sisa anggaran makan saya bulan ini?</div>
                <div class="chat-bubble chat-ai">
                  <div class="chat-ai-header">
                    <span class="material-symbols-outlined">auto_awesome</span>
                    Naviance AI
                  </div>
                  Sisa anggaran makan Anda <strong>Rp 450.000</strong> dari total Rp 1.500.000. Performa keuangan Anda bulan ini sangat baik! 🎉
                </div>
                <div class="chat-suggestions">
                  <span class="chat-chip">Analisis Pengeluaran</span>
                  <span class="chat-chip">Tips Hemat</span>
                </div>
              </div>
            </div>

            <!-- Feature 2: Dashboard Analytics (wide) -->
            <div class="bento-card reveal-on-scroll" style="--delay: 100ms">
              <div class="bento-text">
                <div class="bento-icon-wrap icon-bg-primary">
                  <span class="material-symbols-outlined">dashboard</span>
                </div>
                <h3 class="bento-title">Dashboard Analitik</h3>
                <p class="bento-desc">Pantau ringkasan keuangan lengkap dengan visualisasi tren pemasukan dan pengeluaran dalam satu tampilan interaktif.</p>
              </div>
              <div class="bento-mockup mockup-dashboard">
                <div class="dash-mini-cards">
                  <div class="dash-mini green-mini">
                    <span class="material-symbols-outlined">arrow_upward</span>
                    <div>
                      <span class="dash-mini-label">Pemasukan</span>
                      <span class="dash-mini-val">+12%</span>
                    </div>
                  </div>
                  <div class="dash-mini red-mini">
                    <span class="material-symbols-outlined">arrow_downward</span>
                    <div>
                      <span class="dash-mini-label">Pengeluaran</span>
                      <span class="dash-mini-val">-3%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Feature 3: Manajemen Anggaran -->
            <div class="bento-card reveal-on-scroll" style="--delay: 200ms">
              <div class="bento-text">
                <div class="bento-icon-wrap icon-bg-teal">
                  <span class="material-symbols-outlined">account_balance_wallet</span>
                </div>
                <h3 class="bento-title">Manajemen Anggaran</h3>
                <p class="bento-desc">Set budget per kategori dan monitor pemakaian secara real-time.</p>
              </div>
              <div class="bento-mockup mockup-budget">
                <div class="budget-item">
                  <div class="budget-item-header">
                    <span class="budget-cat">🍔 Makanan</span>
                    <span class="budget-pct pct-warning">78%</span>
                  </div>
                  <div class="budget-bar"><div class="budget-bar-fill fill-warning" style="width: 78%"></div></div>
                </div>
                <div class="budget-item">
                  <div class="budget-item-header">
                    <span class="budget-cat">🚗 Transport</span>
                    <span class="budget-pct pct-safe">45%</span>
                  </div>
                  <div class="budget-bar"><div class="budget-bar-fill fill-safe" style="width: 45%"></div></div>
                </div>
                <div class="budget-item">
                  <div class="budget-item-header">
                    <span class="budget-cat">🎮 Hiburan</span>
                    <span class="budget-pct pct-danger">92%</span>
                  </div>
                  <div class="budget-bar"><div class="budget-bar-fill fill-danger" style="width: 92%"></div></div>
                </div>
              </div>
            </div>

            <!-- Feature 4: Target Tabungan -->
            <div class="bento-card reveal-on-scroll" style="--delay: 300ms">
              <div class="bento-text">
                <div class="bento-icon-wrap icon-bg-emerald">
                  <span class="material-symbols-outlined">target</span>
                </div>
                <h3 class="bento-title">Target Tabungan</h3>
                <p class="bento-desc">Timeline adaptif untuk mewujudkan tujuan finansial Anda.</p>
              </div>
              <div class="bento-mockup mockup-target">
                <div class="target-card">
                  <div class="target-header">
                    <span class="target-emoji">💻</span>
                    <div>
                      <span class="target-name">Laptop Baru</span>
                      <span class="target-deadline">Target: Rp 15.000.000</span>
                    </div>
                  </div>
                  <div class="target-progress-wrap">
                    <div class="target-progress-bar">
                      <div class="target-progress-fill" style="width: 60%">
                        <div class="target-progress-dot"></div>
                      </div>
                    </div>
                    <div class="target-progress-info">
                      <span>Rp 9.000.000</span>
                      <span>3 bulan lagi</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- HOW IT WORKS                                    -->
      <!-- ═══════════════════════════════════════════════ -->
      <section class="how-section" id="how-it-works">
        <div class="section-container">
          <div class="section-header reveal-on-scroll">
            <span class="section-badge">Cara Kerja</span>
            <h2 class="section-title">Mulai dalam 3 Langkah Mudah</h2>
            <p class="section-subtitle">Dari registrasi hingga mendapat insight AI — semuanya cepat dan tanpa ribet.</p>
          </div>

          <div class="steps-grid reveal-on-scroll">
            <div class="step-card">
              <div class="step-number">1</div>
              <div class="step-icon-wrap">
                <span class="material-symbols-outlined">person_add</span>
              </div>
              <h3 class="step-title">Daftar Akun Gratis</h3>
              <p class="step-desc">Buat akun dalam hitungan detik. Tidak perlu kartu kredit atau data sensitif lainnya.</p>
            </div>

            <div class="step-connector">
              <svg viewBox="0 0 60 12" class="connector-svg">
                <line x1="0" y1="6" x2="50" y2="6" stroke="#c5c6cd" stroke-width="2" stroke-dasharray="4 4" />
                <polygon points="48,2 56,6 48,10" fill="#c5c6cd" />
              </svg>
            </div>

            <div class="step-card">
              <div class="step-number">2</div>
              <div class="step-icon-wrap">
                <span class="material-symbols-outlined">smart_toy</span>
              </div>
              <h3 class="step-title">Catat via Chatbot AI</h3>
              <p class="step-desc">Input transaksi dengan bahasa alami melalui chatbot AI. Cukup ketik dan biarkan AI yang mencatat untuk Anda.</p>
            </div>

            <div class="step-connector">
              <svg viewBox="0 0 60 12" class="connector-svg">
                <line x1="0" y1="6" x2="50" y2="6" stroke="#c5c6cd" stroke-width="2" stroke-dasharray="4 4" />
                <polygon points="48,2 56,6 48,10" fill="#c5c6cd" />
              </svg>
            </div>

            <div class="step-card">
              <div class="step-number">3</div>
              <div class="step-icon-wrap step-icon-ai">
                <span class="material-symbols-outlined">auto_awesome</span>
              </div>
              <h3 class="step-title">Kelola & Capai Target</h3>
              <p class="step-desc">Atur anggaran, pantau pengeluaran, dan lacak progres target tabungan Anda secara real-time.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- TESTIMONIALS                                    -->
      <!-- ═══════════════════════════════════════════════ -->
      <section class="testimonials-section" id="testimonials">
        <div class="section-container">
          <div class="section-header reveal-on-scroll">
            <span class="section-badge">Testimoni</span>
            <h2 class="section-title">Dipercaya oleh Ribuan<br/>Profesional Muda</h2>
          </div>

          <div class="testimonials-grid reveal-on-scroll">
            <div class="testimonial-card">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"Naviance benar-benar mengubah cara saya mengelola uang. Chatbot AI-nya praktis banget, tinggal ketik langsung tercatat otomatis!"</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar avatar-1">AR</div>
                <div>
                  <span class="testimonial-name">Andi Rahmat</span>
                  <span class="testimonial-role">Mahasiswa UI</span>
                </div>
              </div>
            </div>

            <div class="testimonial-card testimonial-featured">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"AI Chatbot-nya luar biasa! Saya bisa tanya apa saja soal keuangan saya dan langsung dapat jawaban yang detail dan actionable."</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar avatar-2">SN</div>
                <div>
                  <span class="testimonial-name">Sari Nurhayati</span>
                  <span class="testimonial-role">Junior Developer</span>
                </div>
              </div>
            </div>

            <div class="testimonial-card">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"Fitur manajemen anggarannya luar biasa! Sekarang saya bisa plan budget per kategori dan tahu persis ke mana uang saya pergi."</p>
              <div class="testimonial-author">
                <div class="testimonial-avatar avatar-3">BP</div>
                <div>
                  <span class="testimonial-name">Budi Prasetyo</span>
                  <span class="testimonial-role">Fresh Graduate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════════ -->
      <!-- FINAL CTA                                       -->
      <!-- ═══════════════════════════════════════════════ -->
      <section class="cta-section reveal-on-scroll">
        <div class="cta-card">
          <div class="cta-glow cta-glow-1"></div>
          <div class="cta-glow cta-glow-2"></div>
          <div class="cta-content">
            <span class="material-symbols-outlined cta-icon">rocket_launch</span>
            <h2 class="cta-title">Siap Ambil Kendali Masa Depan Keuanganmu?</h2>
            <p class="cta-subtitle">Bergabunglah dengan generasi baru yang melek finansial. Mulai lacak, rencanakan, dan wujudkan tujuan keuangan Anda bersama asisten AI pribadi Anda hari ini.</p>
            <button class="btn-cta" @click="router.push('/register')">
              Buat Akun Gratis
              <span class="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </section>
    </main>

    <!-- ═══════════════════════════════════════════════ -->
    <!-- FOOTER                                          -->
    <!-- ═══════════════════════════════════════════════ -->
    <footer class="site-footer">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-logo">
            <img src="/logo.png" alt="Naviance Logo" class="footer-logo-img" />
            <span class="footer-logo-text">Naviance</span>
          </div>
          <p class="footer-desc">Navigate Your Finance.<br/>Empowering your financial future through intelligent tracking.</p>
        </div>
        <div class="footer-links-group">
          <div class="footer-links-col">
            <span class="footer-col-title">Produk</span>
            <a href="#features">Fitur</a>
            <a href="#how-it-works">Cara Kerja</a>
            <a href="#testimonials">Testimoni</a>
          </div>
          <div class="footer-links-col">
            <span class="footer-col-title">Legal</span>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Security</a>
          </div>
          <div class="footer-links-col">
            <span class="footer-col-title">Dukungan</span>
            <a href="#">Help Center</a>
            <a href="#">Cookie Settings</a>
            <a href="#">Kontak</a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Naviance. All rights reserved.</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* ═══════════════════════════════════════════════════ */
/*  DESIGN TOKENS & BASE                              */
/* ═══════════════════════════════════════════════════ */
.landing-root {
  --primary: #091426;
  --primary-container: #1e293b;
  --secondary: #855300;
  --secondary-container: #fea619;
  --surface: #fbf8fa;
  --surface-container: #f0edef;
  --surface-container-low: #f5f3f4;
  --surface-container-lowest: #ffffff;
  --outline-variant: #c5c6cd;
  --on-surface: #1b1b1d;
  --on-surface-variant: #45474c;
  --on-primary: #ffffff;
  --error: #ba1a1a;
  --tertiary-green: #00a472;
  --accent-amber: #fea619;
  --accent-indigo: #6366f1;
  --accent-teal: #14b8a6;
  --accent-emerald: #10b981;

  font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
  color: var(--on-surface);
  background: var(--surface);
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
  -webkit-font-smoothing: antialiased;
}

.material-symbols-outlined {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* Background Pattern */
.bg-pattern {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background-image: radial-gradient(#c5c6cd 1px, transparent 1px);
  background-size: 24px 24px;
  background-position: -12px -12px;
  opacity: 0.12;
  mix-blend-mode: multiply;
}

/* ═══════════════════════════════════════════════════ */
/*  SCROLL-TRIGGERED REVEAL                            */
/* ═══════════════════════════════════════════════════ */
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(32px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1),
              transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--delay, 0ms);
}

.reveal-on-scroll.revealed {
  opacity: 1;
  transform: translateY(0);
}

/* ═══════════════════════════════════════════════════ */
/*  NAVBAR                                             */
/* ═══════════════════════════════════════════════════ */
.navbar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(251, 248, 250, 0.75);
  backdrop-filter: blur(20px) saturate(180%);
  border-bottom: 1px solid rgba(197, 198, 205, 0.3);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.navbar-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 40px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: opacity 0.2s;
}
.navbar-brand:hover { opacity: 0.8; }

.brand-icon, .brand-icon-img {
  font-size: 32px;
  color: var(--secondary-container);
}
.brand-icon-img {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-name {
  font-size: 22px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1.1;
  letter-spacing: -0.02em;
}

.brand-tagline {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--on-surface-variant);
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 32px;
}

.navbar-links a {
  color: var(--on-surface-variant);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  transition: color 0.2s;
}
.navbar-links a:hover { color: var(--secondary); }

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.btn-text {
  background: none;
  border: none;
  color: var(--primary);
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: background 0.2s, color 0.2s;
}
.btn-text:hover {
  background: rgba(9, 20, 38, 0.05);
  color: var(--secondary);
}

.btn-primary-pill {
  background: var(--primary);
  color: var(--on-primary);
  border: none;
  font-weight: 600;
  font-size: 14px;
  padding: 10px 24px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(9, 20, 38, 0.15);
}
.btn-primary-pill:hover {
  background: var(--primary-container);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(9, 20, 38, 0.2);
}
.btn-primary-pill:active { transform: scale(0.98); }

.mobile-menu-btn {
  display: none;
  background: none;
  border: none;
  color: var(--on-surface);
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
}

.mobile-nav {
  display: none;
  flex-direction: column;
  padding: 0 24px 24px;
  gap: 8px;
  border-top: 1px solid rgba(197, 198, 205, 0.2);
}
.mobile-nav.open {
  display: flex;
}
.mobile-nav a {
  color: var(--on-surface-variant);
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(197, 198, 205, 0.15);
}
.mobile-nav-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
.mobile-nav-actions .btn-primary-pill {
  flex: 1;
  text-align: center;
}

/* ═══════════════════════════════════════════════════ */
/*  HERO SECTION                                       */
/* ═══════════════════════════════════════════════════ */
.hero {
  position: relative;
  padding: 80px 40px 100px;
  overflow: hidden;
  background: linear-gradient(135deg, var(--surface) 0%, var(--surface-container-low) 100%);
}

.hero-blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}
.hero-blob-1 {
  width: 600px; height: 600px;
  top: -200px; right: -100px;
  background: radial-gradient(circle, rgba(254, 166, 25, 0.12) 0%, transparent 70%);
}
.hero-blob-2 {
  width: 400px; height: 400px;
  bottom: -100px; left: -100px;
  background: radial-gradient(circle, rgba(0, 164, 114, 0.08) 0%, transparent 70%);
}
.hero-blob-3 {
  width: 300px; height: 300px;
  top: 50%; left: 40%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%);
}

.hero-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1.15fr;
  gap: 64px;
  align-items: center;
  position: relative;
  z-index: 1;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(254, 166, 25, 0.12);
  color: var(--secondary);
  padding: 6px 16px;
  border-radius: 9999px;
  width: fit-content;
  border: 1px solid rgba(254, 166, 25, 0.25);
  font-size: 13px;
  font-weight: 700;
}
.badge-icon { font-size: 16px; }

.hero-title {
  font-size: 52px;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--primary);
}

.hero-title-accent {
  background: linear-gradient(135deg, var(--secondary) 0%, var(--accent-amber) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 18px;
  line-height: 1.65;
  color: var(--on-surface-variant);
  max-width: 520px;
}

.hero-cta-group {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.btn-primary-hero {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--primary);
  color: var(--on-primary);
  border: none;
  font-weight: 700;
  font-size: 15px;
  padding: 16px 32px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 6px 24px rgba(9, 20, 38, 0.2);
}
.btn-primary-hero:hover {
  background: var(--primary-container);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(9, 20, 38, 0.25);
}
.btn-primary-hero:active { transform: scale(0.97); }

.btn-outline-hero {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--surface-container-lowest);
  color: var(--primary);
  border: 1.5px solid rgba(197, 198, 205, 0.5);
  font-weight: 600;
  font-size: 15px;
  padding: 16px 32px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.25s;
}
.btn-outline-hero:hover {
  background: var(--surface-container);
  border-color: rgba(197, 198, 205, 0.8);
}

/* ─── Hero Visual / Mockup ─── */
.hero-visual {
  position: relative;
}

.hero-mockup {
  background: var(--surface-container-lowest);
  border-radius: 20px;
  border: 1px solid rgba(197, 198, 205, 0.4);
  box-shadow: 0 20px 60px rgba(9, 20, 38, 0.08), 0 4px 16px rgba(9, 20, 38, 0.04);
  overflow: hidden;
}

.mockup-topbar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--surface-container);
  border-bottom: 1px solid rgba(197, 198, 205, 0.3);
}

.mockup-dots {
  display: flex;
  gap: 6px;
}
.mockup-dots span {
  width: 10px; height: 10px;
  border-radius: 50%;
}
.mockup-dots span:nth-child(1) { background: #ff5f56; }
.mockup-dots span:nth-child(2) { background: #ffbd2e; }
.mockup-dots span:nth-child(3) { background: #27c93f; }

.mockup-url {
  font-size: 11px;
  color: var(--on-surface-variant);
  background: var(--surface-container-low);
  padding: 4px 12px;
  border-radius: 6px;
  flex: 1;
  text-align: center;
}

.mockup-body {
  padding: 20px;
}

.mockup-chart {
  margin-bottom: 16px;
}
.mockup-chart-label {
  font-size: 13px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 12px;
}

.mockup-svg {
  width: 100%;
  height: auto;
}

.mockup-chart-months {
  display: flex;
  justify-content: space-between;
  padding: 0 4px;
  margin-top: 8px;
}
.mockup-chart-months span {
  font-size: 10px;
  color: var(--on-surface-variant);
  font-weight: 500;
}

.mockup-stats-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.mockup-stat {
  background: var(--surface-container-low);
  border-radius: 12px;
  padding: 12px 16px;
  border: 1px solid rgba(197, 198, 205, 0.2);
}
.mockup-stat .stat-label {
  display: block;
  font-size: 11px;
  font-weight: 600;
  color: var(--on-surface-variant);
  margin-bottom: 4px;
}
.mockup-stat .stat-value {
  display: block;
  font-size: 18px;
  font-weight: 800;
}
.mockup-stat.green .stat-value { color: var(--tertiary-green); }
.mockup-stat.red .stat-value { color: var(--error); }

/* ─── Floating Cards ─── */
.floating-card {
  position: absolute;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.6);
  border-radius: 16px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 32px rgba(9, 20, 38, 0.1);
  z-index: 5;
}

.card-chatbot {
  bottom: 30%;
  left: -30px;
  animation: floatB 5s ease-in-out infinite 0.5s;
}

.card-analytics {
  top: 15%;
  right: -20px;
  animation: floatA 4s ease-in-out infinite;
}

.card-budget {
  bottom: 5%;
  right: 10%;
  animation: floatA 4.5s ease-in-out infinite 1s;
}

.fc-icon {
  width: 40px; height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.fc-icon .material-symbols-outlined { font-size: 20px; }

.fc-icon-purple { background: rgba(99, 102, 241, 0.15); color: var(--accent-indigo); }
.fc-icon-amber { background: rgba(254, 166, 25, 0.15); color: var(--secondary); }
.fc-icon-green { background: rgba(0, 164, 114, 0.15); color: var(--tertiary-green); }

.fc-content {
  display: flex;
  flex-direction: column;
}

.fc-label {
  font-size: 11px;
  font-weight: 600;
  color: var(--on-surface-variant);
}
.fc-value {
  font-size: 16px;
  font-weight: 800;
  color: var(--primary);
}

.fc-progress-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.fc-progress-bar {
  width: 80px; height: 6px;
  background: #e4e2e3;
  border-radius: 9999px;
  overflow: hidden;
}
.fc-progress-fill {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, var(--tertiary-green), #4edea3);
}
.fc-progress-text {
  font-size: 11px;
  font-weight: 700;
  color: var(--tertiary-green);
}

@keyframes floatA {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-14px); }
}

@keyframes floatB {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* ═══════════════════════════════════════════════════ */
/*  METRICS TICKER                                     */
/* ═══════════════════════════════════════════════════ */
.metrics-section {
  position: relative;
  z-index: 10;
  margin-top: -32px;
  padding: 0 40px;
}

.metrics-inner {
  max-width: 1000px;
  margin: 0 auto;
  background: var(--surface-container-lowest);
  border: 1px solid rgba(197, 198, 205, 0.3);
  border-radius: 20px;
  padding: 32px 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 8px 32px rgba(9, 20, 38, 0.06);
  gap: 24px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 4px;
}

.metric-number {
  font-size: 32px;
  font-weight: 800;
  color: var(--primary);
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.metric-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--on-surface-variant);
}

.metric-divider {
  width: 1px;
  height: 48px;
  background: rgba(197, 198, 205, 0.4);
  flex-shrink: 0;
}

/* ═══════════════════════════════════════════════════ */
/*  SECTION COMMON STYLES                              */
/* ═══════════════════════════════════════════════════ */
.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 40px;
}

.section-header {
  text-align: center;
  margin-bottom: 56px;
}

.section-badge {
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--secondary);
  background: rgba(254, 166, 25, 0.1);
  padding: 6px 16px;
  border-radius: 9999px;
  border: 1px solid rgba(254, 166, 25, 0.2);
  margin-bottom: 16px;
}

.section-title {
  font-size: 40px;
  font-weight: 800;
  color: var(--primary);
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
}

.section-subtitle {
  font-size: 17px;
  color: var(--on-surface-variant);
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.65;
}

/* ═══════════════════════════════════════════════════ */
/*  FEATURES BENTO GRID                                */
/* ═══════════════════════════════════════════════════ */
.features-section {
  padding: 100px 0;
  background: linear-gradient(180deg, rgba(240, 237, 239, 0.3) 0%, var(--surface) 100%);
  position: relative;
}

.bento-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.bento-card {
  background: var(--surface-container-lowest);
  border-radius: 24px;
  border: 1px solid rgba(197, 198, 205, 0.35);
  padding: 28px;
  position: relative;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.bento-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(9, 20, 38, 0.08);
}

.bento-wide {
  grid-column: span 2;
}


.bento-icon-wrap {
  width: 48px; height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
}
.bento-icon-wrap .material-symbols-outlined { font-size: 24px; }

.icon-bg-primary { background: rgba(9, 20, 38, 0.08); color: var(--primary); }
.icon-bg-amber { background: rgba(254, 166, 25, 0.12); color: var(--secondary); }
.icon-bg-indigo { background: rgba(99, 102, 241, 0.1); color: var(--accent-indigo); }
.icon-bg-teal { background: rgba(20, 184, 166, 0.1); color: var(--accent-teal); }
.icon-bg-emerald { background: rgba(16, 185, 129, 0.1); color: var(--accent-emerald); }
.icon-bg-slate { background: rgba(30, 41, 59, 0.08); color: var(--primary-container); }

.bento-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 4px;
}

.bento-desc {
  font-size: 14px;
  line-height: 1.65;
  color: var(--on-surface-variant);
}

.bento-mockup {
  background: var(--surface-container-low);
  border-radius: 16px;
  border: 1px solid rgba(197, 198, 205, 0.25);
  padding: 16px;
  flex: 1;
}


/* ─── Chat Mockup ─── */
.mockup-chat {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.chat-bubble {
  padding: 10px 14px;
  border-radius: 16px;
  font-size: 12px;
  line-height: 1.5;
  max-width: 85%;
}
.chat-user {
  background: var(--primary-container);
  color: white;
  border-bottom-right-radius: 4px;
  align-self: flex-end;
}
.chat-ai {
  background: var(--surface-container-lowest);
  color: var(--on-surface);
  border: 1px solid rgba(197, 198, 205, 0.3);
  border-bottom-left-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}
.chat-ai-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--secondary);
  margin-bottom: 6px;
}
.chat-ai-header .material-symbols-outlined { font-size: 14px; }

.chat-suggestions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.chat-chip {
  font-size: 10px;
  font-weight: 700;
  padding: 5px 12px;
  border-radius: 9999px;
  border: 1px solid rgba(197, 198, 205, 0.4);
  background: var(--surface-container-lowest);
  color: var(--on-surface-variant);
}

/* ─── Forecast Mockup ─── */
.mockup-forecast {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
}
.forecast-donut {
  position: relative;
  width: 120px;
  height: 120px;
}
.donut-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}
.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.donut-label {
  font-size: 10px;
  font-weight: 600;
  color: var(--on-surface-variant);
}
.donut-value {
  font-size: 14px;
  font-weight: 800;
  color: var(--primary);
}

/* ─── Budget Mockup ─── */
.mockup-budget {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.budget-item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.budget-cat {
  font-size: 12px;
  font-weight: 600;
  color: var(--on-surface);
}
.budget-pct {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}
.pct-safe { background: rgba(0, 164, 114, 0.1); color: var(--tertiary-green); }
.pct-warning { background: rgba(254, 166, 25, 0.1); color: var(--secondary); }
.pct-danger { background: rgba(186, 26, 26, 0.1); color: var(--error); }

.budget-bar {
  width: 100%;
  height: 6px;
  background: #e4e2e3;
  border-radius: 9999px;
  overflow: hidden;
}
.budget-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 1s ease;
}
.fill-safe { background: var(--tertiary-green); }
.fill-warning { background: var(--accent-amber); }
.fill-danger { background: var(--error); }

/* ─── Target Mockup ─── */
.mockup-target {
  display: flex;
  flex-direction: column;
}
.target-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
.target-emoji {
  font-size: 28px;
}
.target-name {
  display: block;
  font-size: 13px;
  font-weight: 700;
  color: var(--primary);
}
.target-deadline {
  display: block;
  font-size: 11px;
  color: var(--on-surface-variant);
}
.target-progress-bar {
  width: 100%;
  height: 8px;
  background: #e4e2e3;
  border-radius: 9999px;
  overflow: hidden;
  position: relative;
}
.target-progress-fill {
  height: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, var(--accent-emerald), #4edea3);
  position: relative;
  transition: width 1s ease;
}
.target-progress-dot {
  width: 12px; height: 12px;
  border-radius: 50%;
  background: white;
  border: 2.5px solid var(--accent-emerald);
  position: absolute;
  right: -4px;
  top: -2px;
}
.target-progress-info {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--on-surface-variant);
}

/* ─── Dashboard Mockup ─── */
.mockup-dashboard {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.dash-mini-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.dash-mini {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: var(--surface-container-lowest);
  border-radius: 12px;
  border: 1px solid rgba(197, 198, 205, 0.2);
}
.dash-mini .material-symbols-outlined {
  font-size: 20px;
  padding: 6px;
  border-radius: 8px;
}
.green-mini .material-symbols-outlined {
  background: rgba(0, 164, 114, 0.1);
  color: var(--tertiary-green);
}
.red-mini .material-symbols-outlined {
  background: rgba(186, 26, 26, 0.1);
  color: var(--error);
}
.dash-mini-label {
  display: block;
  font-size: 11px;
  color: var(--on-surface-variant);
}
.dash-mini-val {
  display: block;
  font-size: 16px;
  font-weight: 800;
}
.green-mini .dash-mini-val { color: var(--tertiary-green); }
.red-mini .dash-mini-val { color: var(--error); }

/* ═══════════════════════════════════════════════════ */
/*  HOW IT WORKS                                       */
/* ═══════════════════════════════════════════════════ */
.how-section {
  padding: 100px 0;
  background: var(--surface);
}

.steps-grid {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0;
  max-width: 1000px;
  margin: 0 auto;
}

.step-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 0 32px;
  flex: 1;
  position: relative;
}

.step-number {
  width: 32px; height: 32px;
  border-radius: 50%;
  background: var(--primary);
  color: var(--on-primary);
  font-size: 14px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.step-icon-wrap {
  width: 72px; height: 72px;
  border-radius: 20px;
  background: var(--surface-container-low);
  border: 1px solid rgba(197, 198, 205, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  transition: all 0.3s;
}
.step-icon-wrap .material-symbols-outlined {
  font-size: 32px;
  color: var(--primary);
}
.step-icon-ai {
  background: rgba(254, 166, 25, 0.1);
  border-color: rgba(254, 166, 25, 0.2);
}
.step-icon-ai .material-symbols-outlined {
  color: var(--secondary);
}

.step-card:hover .step-icon-wrap {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(9, 20, 38, 0.08);
}

.step-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--primary);
  margin-bottom: 8px;
}

.step-desc {
  font-size: 14px;
  line-height: 1.6;
  color: var(--on-surface-variant);
  max-width: 260px;
}

.step-connector {
  display: flex;
  align-items: center;
  padding-top: 88px;
  flex-shrink: 0;
}
.connector-svg {
  width: 60px;
  height: 12px;
}

/* ═══════════════════════════════════════════════════ */
/*  TESTIMONIALS                                       */
/* ═══════════════════════════════════════════════════ */
.testimonials-section {
  padding: 100px 0;
  background: linear-gradient(180deg, var(--surface) 0%, rgba(240, 237, 239, 0.3) 100%);
}

.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.testimonial-card {
  background: var(--surface-container-lowest);
  border: 1px solid rgba(197, 198, 205, 0.3);
  border-radius: 24px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: transform 0.3s, box-shadow 0.3s;
}
.testimonial-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(9, 20, 38, 0.06);
}

.testimonial-featured {
  border-color: rgba(254, 166, 25, 0.3);
  box-shadow: 0 4px 20px rgba(254, 166, 25, 0.08);
}

.testimonial-stars {
  color: var(--accent-amber);
  font-size: 18px;
  letter-spacing: 2px;
}

.testimonial-text {
  font-size: 15px;
  line-height: 1.7;
  color: var(--on-surface);
  flex: 1;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid rgba(197, 198, 205, 0.2);
}

.testimonial-avatar {
  width: 44px; height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 800;
  color: white;
  flex-shrink: 0;
}
.avatar-1 { background: linear-gradient(135deg, #1e293b, #475569); }
.avatar-2 { background: linear-gradient(135deg, #fea619, #f59e0b); }
.avatar-3 { background: linear-gradient(135deg, #00a472, #10b981); }

.testimonial-name {
  display: block;
  font-size: 14px;
  font-weight: 700;
  color: var(--primary);
}
.testimonial-role {
  display: block;
  font-size: 12px;
  color: var(--on-surface-variant);
}

/* ═══════════════════════════════════════════════════ */
/*  FINAL CTA                                         */
/* ═══════════════════════════════════════════════════ */
.cta-section {
  padding: 80px 40px;
}

.cta-card {
  max-width: 1000px;
  margin: 0 auto;
  background: var(--primary);
  border-radius: 40px;
  padding: 80px 60px;
  text-align: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(9, 20, 38, 0.2);
}

.cta-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  pointer-events: none;
}
.cta-glow-1 {
  width: 400px; height: 400px;
  top: -100px; right: -100px;
  background: rgba(254, 166, 25, 0.2);
}
.cta-glow-2 {
  width: 300px; height: 300px;
  bottom: -100px; left: -80px;
  background: rgba(0, 164, 114, 0.15);
}

.cta-content {
  position: relative;
  z-index: 1;
}

.cta-icon {
  font-size: 48px;
  color: var(--accent-amber);
  margin-bottom: 20px;
}

.cta-title {
  font-size: 40px;
  font-weight: 800;
  color: var(--on-primary);
  line-height: 1.15;
  letter-spacing: -0.02em;
  margin-bottom: 16px;
}

.cta-subtitle {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.75);
  max-width: 560px;
  margin: 0 auto 36px;
  line-height: 1.65;
}

.btn-cta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  background: var(--accent-amber);
  color: var(--primary);
  border: none;
  font-weight: 700;
  font-size: 16px;
  padding: 18px 40px;
  border-radius: 9999px;
  cursor: pointer;
  transition: all 0.25s;
  box-shadow: 0 6px 24px rgba(254, 166, 25, 0.3);
}
.btn-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(254, 166, 25, 0.4);
  background: #ffb94d;
}
.btn-cta:active { transform: scale(0.97); }

/* ═══════════════════════════════════════════════════ */
/*  FOOTER                                             */
/* ═══════════════════════════════════════════════════ */
.site-footer {
  background: var(--primary);
  padding: 64px 40px 0;
  position: relative;
  z-index: 10;
}

.footer-inner {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1.2fr 2fr;
  gap: 48px;
  padding-bottom: 48px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.footer-logo .material-symbols-outlined, .footer-logo-img {
  font-size: 28px;
  color: rgba(255, 255, 255, 0.7);
}
.footer-logo-img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}
.footer-logo-text {
  font-size: 22px;
  font-weight: 800;
  color: white;
}

.footer-desc {
  font-size: 14px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.55);
}

.footer-links-group {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.footer-links-col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.footer-col-title {
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 4px;
}

.footer-links-col a {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 0.2s;
}
.footer-links-col a:hover { color: var(--accent-amber); }

.footer-bottom {
  max-width: 1280px;
  margin: 0 auto;
  padding: 24px 0;
  text-align: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.35);
}

/* ═══════════════════════════════════════════════════ */
/*  RESPONSIVE DESIGN                                  */
/* ═══════════════════════════════════════════════════ */
@media (max-width: 1024px) {
  .hero-inner {
    grid-template-columns: 1fr;
    gap: 48px;
  }
  .hero { padding: 60px 24px 80px; }
  .hero-title { font-size: 40px; }
  .hero-subtitle { font-size: 16px; }

  .bento-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .testimonials-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .testimonials-grid .testimonial-card:last-child {
    grid-column: span 2;
    max-width: 50%;
    margin: 0 auto;
  }

  .steps-grid {
    flex-wrap: wrap;
    gap: 32px;
    justify-content: center;
  }
  .step-connector { display: none; }
  .step-card { max-width: 280px; }
}

@media (max-width: 768px) {
  .navbar-inner { padding: 0 16px; height: 64px; }
  .navbar-links { display: none; }
  .navbar-actions { display: none; }
  .mobile-menu-btn { display: block; }
  .mobile-nav { padding: 0 16px 16px; }

  .hero { padding: 40px 16px 60px; }
  .hero-title { font-size: 32px; }
  .hero-cta-group { flex-direction: column; }
  .btn-primary-hero, .btn-outline-hero {
    width: 100%;
    justify-content: center;
  }

  .floating-card { display: none; }

  .metrics-section { padding: 0 16px; margin-top: -24px; }
  .metrics-inner {
    flex-wrap: wrap;
    padding: 24px;
    gap: 16px;
    justify-content: center;
  }
  .metric-divider { display: none; }
  .metric-item { min-width: 40%; }
  .metric-number { font-size: 24px; }

  .section-container { padding: 0 16px; }
  .features-section { padding: 64px 0; }
  .section-title { font-size: 28px; }
  .section-header { margin-bottom: 36px; }

  .bento-grid {
    grid-template-columns: 1fr;
  }
  .bento-wide { grid-column: span 1; }

  .how-section { padding: 64px 0; }
  .steps-grid {
    flex-direction: column;
    align-items: center;
  }

  .testimonials-section { padding: 64px 0; }
  .testimonials-grid {
    grid-template-columns: 1fr;
  }
  .testimonials-grid .testimonial-card:last-child {
    grid-column: span 1;
    max-width: 100%;
  }

  .cta-section { padding: 48px 16px; }
  .cta-card { padding: 48px 24px; border-radius: 28px; }
  .cta-title { font-size: 28px; }
  .cta-subtitle { font-size: 15px; }

  .site-footer { padding: 48px 16px 0; }
  .footer-inner {
    grid-template-columns: 1fr;
    gap: 32px;
  }
  .footer-links-group {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .hero-title { font-size: 28px; }
  .metric-item { min-width: 45%; }
  .footer-links-group {
    grid-template-columns: 1fr 1fr;
  }
  .cta-title { font-size: 24px; }
}
</style>