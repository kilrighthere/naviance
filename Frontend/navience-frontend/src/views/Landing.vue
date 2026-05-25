<script setup lang="ts">
import { ref, computed } from 'vue'

const isChatOpen = ref(false)
const toggleChat = () => { isChatOpen.value = !isChatOpen.value }
const closeChat  = () => { isChatOpen.value = false }

const baseCards = [
    { icon: 'edit_note',        color: 'primary',   accent: false, title: 'Manual Control',       desc: 'Take full command of your ledger with precision entry tools designed for speed and absolute accuracy.' },
    { icon: 'document_scanner', color: 'tertiary',  accent: true,  title: 'Intelligent OCR',      desc: 'Instantly convert receipts and invoices into structured data using our high-fidelity optical recognition engine.' },
    { icon: 'smart_toy',        color: 'secondary', accent: false, title: 'AI Chatbot',            desc: 'Converse with your finances. Ask complex queries and receive actionable intelligence in natural language.' },
    { icon: 'analytics',        color: 'primary',   accent: false, title: 'Adaptive Planning',     desc: 'AI-driven money management recommendations based on your unique targets and real-time spending patterns.' },
    { icon: 'timeline',         color: 'tertiary',  accent: false, title: 'Forecasting Spending',  desc: 'Predict your next month\'s requirements with category-specific mapping and intelligent trend analysis.' },
]

// Duplicate for seamless infinite loop
const tickerCards = computed(() => [...baseCards, ...baseCards])
</script>


<template>
    <div class="landing-root">

        <!-- ── Navigation ── -->
        <header class="nav">
            <div class="nav-inner">
                <div class="brand">
                    <div class="logo-mark">N</div>
                    <span class="brand-name">Naviance</span>
                </div>
                <nav class="nav-links">
                    <button class="btn-ghost" type="button" @click="$router.push('/login')">Login</button>
                    <button class="btn-cta" type="button" @click="$router.push('/register')">Get Started</button>
                </nav>
            </div>
        </header>

        <!-- ── Hero ── -->
        <main class="main">
            <section class="hero">

                <!-- Left column -->
                <div class="hero-left">
                    <div class="badge">
                        <span class="badge-icon material-symbols-outlined">auto_awesome</span>
                        <span class="badge-text">NEXT-GEN FINANCIAL INTELLIGENCE</span>
                    </div>

                    <h1 class="hero-heading">
                        Secure <em>Solutions</em> for Smarter Money Moves.
                    </h1>

                    <p class="hero-sub">
                        Our platform helps you manage, track, and optimize your finances with ease —
                        all backed by bank-level security and real-time AI-driven insights.
                    </p>

                    <div class="snapshot animate-float">
                        <div class="snapshot-top">
                            <span class="snapshot-label">Your Financial Snapshot</span>
                            <span class="material-symbols-outlined snapshot-more">more_vert</span>
                        </div>
                        <div class="snapshot-row">
                            <div class="snapshot-stat">
                                <span class="stat-period">THIS MONTH</span>
                                <div class="stat-amount-row">
                                    <span class="stat-amount">$3,570.00</span>
                                    <span class="material-symbols-outlined stat-trend">trending_up</span>
                                </div>
                            </div>
                            <p class="snapshot-note">
                                Our platform helps you manage, track, and optimize your finances instantly.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Right column: bento images -->
                <div class="hero-right">
                    <div class="bento">
                        <div class="bento-pair">
                            <div class="bento-card bento-a">
                                <img src="@/assets/image/image-01.png" alt="Financial Analysts" />
                            </div>
                            <div class="bento-card bento-b">
                                <img src="@/assets/image/image-02.png" alt="Success Mindset" />
                            </div>
                        </div>
                        <div class="bento-card bento-c">
                            <img src="@/assets/image/image-03.png" alt="Team Collaboration" />
                        </div>
                    </div>
                </div>
            </section>

            <!-- ── Features Ticker ── -->
            <section class="features">
                <div class="ticker-track">
                    <div
                        v-for="card in tickerCards"
                        :key="card.title"
                        class="feature-card"
                        :class="card.accent ? 'feature-card--accent' : ''"
                    >
                        <div class="feature-icon" :class="`feature-icon--${card.color}`">
                            <span class="material-symbols-outlined">{{ card.icon }}</span>
                        </div>
                        <h3 class="feature-title">{{ card.title }}</h3>
                        <p class="feature-body">{{ card.desc }}</p>
                    </div>
                </div>
            </section>
        </main>

        <!-- ── Floating AI Button ── -->
        <button class="fab" type="button" @click="toggleChat" :aria-label="isChatOpen ? 'Close chat' : 'Open chat'">
            <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">smart_toy</span>
        </button>

        <!-- ── Chat Panel ── -->
        <Transition name="chat">
            <div v-if="isChatOpen" class="chat-panel">
                <div class="chat-header">
                    <div class="chat-header-info">
                        <span class="material-symbols-outlined chat-bot-icon">smart_toy</span>
                        <span class="chat-header-title">Naviance AI</span>
                    </div>
                    <button class="chat-close" type="button" @click="closeChat">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div class="chat-messages">
                    <div class="chat-bubble chat-bubble--ai">
                        Hello! I'm your AI financial assistant. How can I help you optimize your portfolio today?
                    </div>
                </div>
                <div class="chat-footer">
                    <div class="chat-input-row">
                        <input class="chat-input" placeholder="Ask anything…" type="text" />
                        <button class="chat-send" type="button">
                            <span class="material-symbols-outlined">send</span>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>

    </div>
</template>


<style scoped>
/* ═══════════════════════════════════════════════
   FONTS
═══════════════════════════════════════════════ */
@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;600;700&family=Inter:wght@400;500&family=JetBrains+Mono:wght@500&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap');

/* ═══════════════════════════════════════════════
   DESIGN TOKENS
═══════════════════════════════════════════════ */
.landing-root {
    /* Colors */
    --clr-primary:              #0024c1;
    --clr-primary-cta:          #0033ff;
    --clr-secondary:            #545a91;
    --clr-tertiary:             #4421a7;
    --clr-surface:              #f9f9ff;
    --clr-surface-low:          #f0f3ff;
    --clr-surface-high:         #e2e8f8;
    --clr-on-surface:           #151c27;
    --clr-on-surface-muted:     #444657;
    --clr-inverse-surface:      #2a313c;
    --clr-outline-variant:      #c4c5da;
    --clr-primary-fixed-dim:    #bcc3ff;
    --clr-bg:                   #eaedf3;

    /* Typography */
    --font-display:   'Hanken Grotesk', sans-serif;
    --font-body:      'Inter', sans-serif;
    --font-mono:      'JetBrains Mono', monospace;

    /* Radius */
    --r-sm:     4px;
    --r-md:     8px;
    --r-lg:     16px;
    --r-xl:     24px;
    --r-2xl:    32px;
    --r-card:   40px;
    --r-full:   9999px;

    /* Shadows */
    --shadow-sm:   0 4px 20px rgba(0, 3, 61, 0.06);
    --shadow-md:   0 8px 30px rgba(0, 3, 61, 0.10);
    --shadow-lg:   0 16px 48px rgba(0, 3, 61, 0.14);
    --shadow-ai:   0 0 24px rgba(68, 33, 167, 0.18);
}

/* ═══════════════════════════════════════════════
   BASE
═══════════════════════════════════════════════ */
*,
*::before,
*::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    background: none;
}

img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.material-symbols-outlined {
    font-family: 'Material Symbols Outlined';
    font-weight: normal;
    font-style: normal;
    font-size: 24px;
    line-height: 1;
    letter-spacing: normal;
    text-transform: none;
    display: inline-block;
    white-space: nowrap;
    word-wrap: normal;
    direction: ltr;
    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    vertical-align: middle;
    user-select: none;
}

/* ═══════════════════════════════════════════════
   ROOT WRAPPER
═══════════════════════════════════════════════ */
.landing-root {
    min-height: 100vh;
    width: 100%;
    overflow-x: hidden;
    font-family: var(--font-body);
    color: var(--clr-on-surface);
    background-color: var(--clr-bg);
    background-image:
        radial-gradient(ellipse at 0% 0%,   rgba(0,  36, 193, 0.07) 0%, transparent 50%),
        radial-gradient(ellipse at 100% 100%, rgba(68, 33, 167, 0.06) 0%, transparent 50%);
}

/* ═══════════════════════════════════════════════
   NAVIGATION
═══════════════════════════════════════════════ */
.nav {
    position: sticky;
    top: 0;
    z-index: 100;
    width: 100%;
    background: rgba(249, 249, 255, 0.82);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border-bottom: 1px solid var(--clr-surface-high);
}

.nav-inner {
    max-width: 1440px;
    margin: 0 auto;
    padding: 16px 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

/* Brand */
.brand {
    display: flex;
    align-items: center;
    gap: 12px;
}

.logo-mark {
    width: 40px;
    height: 40px;
    border-radius: var(--r-md);
    background: var(--clr-primary-cta);
    color: #fff;
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    display: grid;
    place-items: center;
    box-shadow: 0 4px 14px rgba(0, 51, 255, 0.28);
    flex-shrink: 0;
}

.brand-name {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 600;
    letter-spacing: -0.01em;
    color: var(--clr-on-surface);
}

/* Nav actions */
.nav-links {
    display: flex;
    align-items: center;
    gap: 12px;
}

.btn-ghost {
    padding: 9px 22px;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
    color: var(--clr-on-surface-muted);
    border-radius: var(--r-md);
    transition: color 0.18s;
}
.btn-ghost:hover { color: var(--clr-primary); }

.btn-cta {
    padding: 9px 22px;
    background: var(--clr-primary-cta);
    color: #fff;
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.04em;
    border-radius: var(--r-md);
    box-shadow: 0 4px 14px rgba(0, 51, 255, 0.28);
    transition: background 0.18s, transform 0.1s, box-shadow 0.18s;
}
.btn-cta:hover  { background: var(--clr-primary); box-shadow: 0 6px 20px rgba(0, 36, 193, 0.35); }
.btn-cta:active { transform: scale(0.95); }

/* ═══════════════════════════════════════════════
   MAIN WRAPPER
═══════════════════════════════════════════════ */
.main {
    max-width: 1440px;
    margin: 0 auto;
    padding: 72px 32px 120px;
}

/* ═══════════════════════════════════════════════
   HERO SECTION
═══════════════════════════════════════════════ */
.hero {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 72px;
    align-items: center;
}

/* ── Hero Left ── */
.hero-left {
    display: flex;
    flex-direction: column;
    gap: 32px;
}

/* Badge */
.badge {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    width: fit-content;
    border-radius: var(--r-full);
    background: rgba(0, 36, 193, 0.09);
    border: 1px solid rgba(0, 36, 193, 0.18);
}

.badge-icon {
    font-size: 15px !important;
    color: var(--clr-primary);
}

.badge-text {
    font-family: var(--font-mono);
    font-size: 11px;
    font-weight: 500;
    letter-spacing: 0.06em;
    color: var(--clr-primary);
}

/* Heading */
.hero-heading {
    font-family: var(--font-display);
    font-size: clamp(34px, 3.2vw, 48px);
    font-weight: 700;
    line-height: 1.14;
    letter-spacing: -0.02em;
    color: var(--clr-on-surface);
    max-width: 520px;
}

.hero-heading em {
    font-style: normal;
    color: var(--clr-primary);
}

/* Subtext */
.hero-sub {
    font-family: var(--font-body);
    font-size: 17px;
    line-height: 1.65;
    color: var(--clr-on-surface-muted);
    max-width: 460px;
}

/* ── Snapshot Card ── */
.snapshot {
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(14px);
    -webkit-backdrop-filter: blur(14px);
    border: 1px solid rgba(255, 255, 255, 0.45);
    border-radius: var(--r-xl);
    padding: 24px;
    max-width: 420px;
    box-shadow: var(--shadow-sm);
}

.snapshot-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.snapshot-label {
    font-family: var(--font-display);
    font-size: 17px;
    font-weight: 600;
    color: var(--clr-on-surface);
}

.snapshot-more {
    color: var(--clr-on-surface-muted);
    font-size: 22px !important;
    cursor: pointer;
}

.snapshot-row {
    display: flex;
    align-items: center;
    gap: 20px;
}

.snapshot-stat {
    background: var(--clr-inverse-surface);
    border-radius: var(--r-lg);
    padding: 18px 20px;
    min-width: 152px;
    flex-shrink: 0;
}

.stat-period {
    display: block;
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 500;
    letter-spacing: 0.07em;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 10px;
}

.stat-amount-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.stat-amount {
    font-family: var(--font-mono);
    font-size: 21px;
    font-weight: 500;
    letter-spacing: -0.02em;
    color: #fff;
}

.stat-trend {
    font-size: 20px !important;
    color: var(--clr-primary-fixed-dim);
}

.snapshot-note {
    font-family: var(--font-body);
    font-size: 13px;
    line-height: 1.6;
    color: var(--clr-on-surface-muted);
    flex: 1;
}

/* ── Hero Right: Bento ── */
.hero-right { position: relative; }

.bento {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.bento-pair {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    align-items: start;
}

.bento-card {
    border-radius: var(--r-card);
    overflow: hidden;
    box-shadow: var(--shadow-lg);
}

.bento-a { height: 300px; }
.bento-b { height: 300px; margin-top: 28px; }
.bento-c { height: 340px; margin-top: -36px; }

/* ═══════════════════════════════════════════════
   FEATURES TICKER
═══════════════════════════════════════════════ */
.features {
    margin-top: 120px;
    overflow: hidden;
    position: relative;
    padding: 32px 0;
}

/* Fade masks */
.features::before,
.features::after {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    width: 120px;
    z-index: 2;
    pointer-events: none;
}
.features::before {
    left: 0;
    background: linear-gradient(to right, var(--clr-bg), transparent);
}
.features::after {
    right: 0;
    background: linear-gradient(to left, var(--clr-bg), transparent);
}

.ticker-track {
    display: flex;
    gap: 20px;
    width: max-content;
    animation: ticker 44s linear infinite;
}
.ticker-track:hover { animation-play-state: paused; }

@keyframes ticker {
    0%   { transform: translateX(0); }
    100% { transform: translateX(calc(-1 * (320px + 20px) * 5)); }
}

/* ── Feature Card ── */
.feature-card {
    width: 320px;
    flex-shrink: 0;
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.38);
    border-radius: var(--r-xl);
    padding: 24px;
    box-shadow: var(--shadow-sm);
    transition: background 0.22s;
}
.feature-card:hover { background: rgba(255, 255, 255, 0.95); }

.feature-card--accent {
    border-color: rgba(0, 36, 193, 0.15);
    box-shadow: var(--shadow-ai);
}

.feature-icon {
    width: 48px;
    height: 48px;
    border-radius: var(--r-md);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 18px;
    transition: background 0.22s, color 0.22s;
}

.feature-icon--primary  { background: rgba(0,  36, 193, 0.10); color: var(--clr-primary); }
.feature-icon--secondary{ background: rgba(84, 90, 145, 0.10); color: var(--clr-secondary); }
.feature-icon--tertiary { background: rgba(68, 33, 167, 0.10); color: var(--clr-tertiary); }

.feature-card:hover .feature-icon--primary  { background: var(--clr-primary);   color: #fff; }
.feature-card:hover .feature-icon--secondary{ background: var(--clr-secondary); color: #fff; }
.feature-card:hover .feature-icon--tertiary { background: var(--clr-tertiary);  color: #fff; }

.feature-title {
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 600;
    line-height: 1.3;
    color: var(--clr-on-surface);
    margin-bottom: 10px;
}

.feature-body {
    font-family: var(--font-body);
    font-size: 14px;
    line-height: 1.6;
    color: var(--clr-on-surface-muted);
}

/* ═══════════════════════════════════════════════
   FLOATING ACTION BUTTON
═══════════════════════════════════════════════ */
.fab {
    position: fixed;
    bottom: 32px;
    right: 32px;
    z-index: 200;
    width: 56px;
    height: 56px;
    border-radius: var(--r-full);
    background: var(--clr-tertiary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 28px rgba(68, 33, 167, 0.38);
    transition: transform 0.2s, box-shadow 0.2s;
}
.fab:hover  { transform: scale(1.08); box-shadow: 0 12px 36px rgba(68, 33, 167, 0.48); }
.fab:active { transform: scale(0.93); }

/* ═══════════════════════════════════════════════
   CHAT PANEL
═══════════════════════════════════════════════ */
.chat-panel {
    position: fixed;
    bottom: 104px;
    right: 32px;
    z-index: 200;
    width: 324px;
    height: 390px;
    display: flex;
    flex-direction: column;
    border-radius: var(--r-xl);
    overflow: hidden;
    background: rgba(255, 255, 255, 0.88);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
    border: 1px solid rgba(255, 255, 255, 0.45);
    box-shadow: 0 20px 60px rgba(0, 3, 61, 0.16);
}

.chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: var(--clr-tertiary);
    flex-shrink: 0;
}

.chat-header-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.chat-bot-icon {
    font-size: 18px !important;
    color: #fff;
}

.chat-header-title {
    font-family: var(--font-mono);
    font-size: 13px;
    font-weight: 500;
    letter-spacing: 0.05em;
    color: #fff;
}

.chat-close {
    color: rgba(255, 255, 255, 0.72);
    display: flex;
    align-items: center;
    transition: color 0.15s;
}
.chat-close:hover { color: #fff; }
.chat-close .material-symbols-outlined { font-size: 20px !important; }

.chat-messages {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
}

.chat-bubble {
    padding: 12px 14px;
    font-family: var(--font-body);
    font-size: 14px;
    line-height: 1.55;
    max-width: 90%;
    border-radius: 14px;
}

.chat-bubble--ai {
    background: var(--clr-surface-low);
    color: var(--clr-on-surface);
    border-top-left-radius: 4px;
}

.chat-footer {
    padding: 12px 16px;
    border-top: 1px solid var(--clr-surface-high);
    flex-shrink: 0;
}

.chat-input-row {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #fff;
    border: 1px solid var(--clr-outline-variant);
    border-radius: var(--r-full);
    padding: 8px 8px 8px 16px;
}

.chat-input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-family: var(--font-body);
    font-size: 14px;
    color: var(--clr-on-surface);
}
.chat-input::placeholder { color: var(--clr-on-surface-muted); }

.chat-send {
    width: 32px;
    height: 32px;
    border-radius: var(--r-full);
    background: var(--clr-primary-cta);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: background 0.18s, transform 0.1s;
}
.chat-send:hover  { background: var(--clr-primary); }
.chat-send:active { transform: scale(0.9); }
.chat-send .material-symbols-outlined { font-size: 17px !important; }

/* ═══════════════════════════════════════════════
   TRANSITIONS
═══════════════════════════════════════════════ */
.chat-enter-active,
.chat-leave-active {
    transition: opacity 0.24s ease, transform 0.24s ease;
}
.chat-enter-from,
.chat-leave-to {
    opacity: 0;
    transform: translateY(14px) scale(0.97);
}

/* ═══════════════════════════════════════════════
   ANIMATIONS
═══════════════════════════════════════════════ */
@keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-9px); }
}
.animate-float { animation: float 6s ease-in-out infinite; }

/* ═══════════════════════════════════════════════
   RESPONSIVE
═══════════════════════════════════════════════ */
@media (max-width: 1024px) {
    .hero {
        grid-template-columns: 1fr;
        gap: 52px;
    }
    .hero-heading { font-size: 36px; max-width: 100%; }
    .hero-sub     { max-width: 100%; }
    .snapshot     { max-width: 100%; }
    .bento-a,
    .bento-b      { height: 240px; }
    .bento-c      { height: 280px; }
    .features     { margin-top: 80px; }
}

@media (max-width: 640px) {
    .main         { padding: 48px 20px 100px; }
    .nav-inner    { padding: 14px 20px; }
    .hero-heading { font-size: 28px; }
    .bento-pair   { grid-template-columns: 1fr; }
    .bento-b      { margin-top: 0; }
    .bento-a,
    .bento-b,
    .bento-c      { height: 220px; margin-top: 0; }
    .feature-card { width: 272px; }
    .snapshot-row { flex-direction: column; align-items: stretch; }
    .snapshot-stat{ min-width: unset; }
    .chat-panel   { width: calc(100vw - 32px); right: 16px; bottom: 96px; }
    .fab          { right: 20px; bottom: 20px; }
}
</style>