<script lang="ts">
export default {
  name: 'ChatbotView',
}
</script>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useChatbotStore } from '@/stores/chatbot'
import Sidebar from '@/components/sidebar.vue'
import ProfileDropdown from '@/components/profile.vue'

const chatbotStore = useChatbotStore()
const { messages, isLoading, isEmpty } = storeToRefs(chatbotStore)
const quickSuggestions = chatbotStore.quickSuggestions

const userInput = ref('')
const messagesEndRef = ref<HTMLElement | null>(null)
const chatScrollRef = ref<HTMLElement | null>(null)

// ─── Sidebar ref ──────────────────────────────────
const sidebarRef = ref<InstanceType<typeof Sidebar> | null>(null)
const isSidebarMinimized = computed(() => sidebarRef.value?.isMinimized ?? false)

// Auto-scroll when messages change
watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    scrollToBottom()
  },
)

watch(isLoading, async () => {
  await nextTick()
  scrollToBottom()
})

function scrollToBottom(): void {
  if (chatScrollRef.value) {
    chatScrollRef.value.scrollTo({
      top: chatScrollRef.value.scrollHeight,
      behavior: 'smooth',
    })
  }
}

async function handleSend(): Promise<void> {
  const text = userInput.value.trim()
  if (!text || isLoading.value) return

  userInput.value = ''
  await chatbotStore.sendMessage(text)
}

async function handleSuggestionClick(prompt: string, title: string): Promise<void> {
  if (isLoading.value) return
  // Show the title as the user message
  userInput.value = ''
  await chatbotStore.sendMessage(prompt)
}

function handleKeyDown(e: KeyboardEvent): void {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    handleSend()
  }
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function handleNewChat(): void {
  chatbotStore.clearChat()
}

// Simple markdown-like rendering for the dummy responses
function renderMarkdown(text: string): string {
  let html = text
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  // Headers
  html = html.replace(/^### (.+)$/gm, '<h4 class="font-label-md text-label-md text-on-background mt-4 mb-2">$1</h4>')
  html = html.replace(/^## (.+)$/gm, '<h3 class="font-headline-md text-[18px] text-on-background mt-3 mb-2">$1</h3>')

  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-on-background">$1</strong>')
  // Italic
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Tables
  html = html.replace(/^(\|.+\|)$/gm, (match) => {
    return match
  })

  // Process tables
  const lines = html.split('\n')
  let inTable = false
  let tableHtml = ''
  const result: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line === undefined) continue;
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true
        tableHtml = '<div class="overflow-x-auto my-3"><table class="w-full text-left border-collapse">'
      }
      // Skip separator rows
      if (line.match(/^\|[\s-:|]+\|$/)) {
        continue
      }
      const cells = line
        .split('|')
        .filter((c) => c.trim() !== '')
        .map((c) => c.trim())

      if (tableHtml.includes('<tr>')) {
        tableHtml += '<tr class="border-b border-outline-variant/20">'
        cells.forEach((cell) => {
          tableHtml += `<td class="py-2 px-3 font-label-sm text-on-surface-variant">${cell}</td>`
        })
        tableHtml += '</tr>'
      } else {
        tableHtml += '<thead><tr class="border-b border-outline-variant/30">'
        cells.forEach((cell) => {
          tableHtml += `<th class="py-2 px-3 font-label-md text-label-sm text-on-background">${cell}</th>`
        })
        tableHtml += '</tr></thead><tbody>'
        // Mark that we've had a header
        tableHtml += '<tr class="hidden"></tr>'
      }
    } else {
      if (inTable) {
        tableHtml += '</tbody></table></div>'
        result.push(tableHtml)
        tableHtml = ''
        inTable = false
      }
      result.push(line)
    }
  }
  if (inTable) {
    tableHtml += '</tbody></table></div>'
    result.push(tableHtml)
  }
  html = result.join('\n')

  // Blockquotes
  html = html.replace(
    /^&gt; (.+)$/gm,
    '<div class="border-l-4 border-secondary-container pl-4 py-2 my-3 bg-secondary-fixed/10 rounded-r-lg">$1</div>',
  )

  // Unordered lists
  html = html.replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-on-surface-variant">$1</li>')

  // Ordered lists
  html = html.replace(
    /^(\d+)\. (.+)$/gm,
    '<li class="ml-4 list-decimal text-on-surface-variant" value="$1">$2</li>',
  )

  // Line breaks
  html = html.replace(/\n\n/g, '<br/><br/>')
  html = html.replace(/\n/g, '<br/>')

  return html
}
</script>

<template>
  <div class="bg-background text-on-background flex h-screen overflow-hidden">
    <!-- Sidebar Component -->
    <Sidebar ref="sidebarRef" />

    <!-- Main Content Wrapper -->
    <div
      class="dashboard-main-content flex-1 flex flex-col h-full bg-background relative"
      :class="{ 'content-expanded': isSidebarMinimized }"
    >
      <!-- Top Header Bar -->
      <header
        class="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-20 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/30 sticky top-0 z-10 shrink-0"
      >
        <div class="flex items-center gap-4">
          <div>
            <h1 class="font-headline-md text-headline-md text-primary-container tracking-tight">
              Asisten AI Naviance
            </h1>
            <p
              class="font-body-md text-body-md text-on-surface-variant mt-0.5 flex items-center gap-2 text-sm"
            >
              <span class="material-symbols-outlined text-[16px] text-secondary">auto_awesome</span>
              Kecerdasan finansial pribadi Anda
            </p>
          </div>
        </div>
        <div class="flex items-center gap-4 text-on-surface-variant">
          <!-- New Chat Button -->
          <button
            v-if="!isEmpty"
            id="btn-new-chat"
            class="flex items-center gap-2 border border-outline-variant/40 text-on-surface-variant font-label-md text-label-md px-4 py-2 rounded-xl hover:bg-surface-container hover:text-primary transition-all"
            @click="handleNewChat"
          >
            <span class="material-symbols-outlined text-[18px]">add</span>
            Chat Baru
          </button>
          <ProfileDropdown />
        </div>
      </header>

      <!-- Chat Layout Container -->
      <div class="flex-1 flex w-full min-h-0">
        <!-- Active Chat Window -->
        <div
          class="flex-1 flex flex-col bg-surface-container-lowest overflow-hidden relative"
        >
          <!-- Messages / Empty State Area -->
          <div
            ref="chatScrollRef"
            class="flex-1 overflow-y-auto p-4 md:p-6 chat-scroll bg-surface/50"
          >
            <!-- ===== EMPTY STATE (Initial View) ===== -->
            <div
              v-if="isEmpty"
              class="max-w-4xl mx-auto flex flex-col items-center py-12 px-4"
            >
              <!-- Animated Bot Avatar -->
              <div class="relative mb-6">
                <div
                  class="w-20 h-20 rounded-full bg-gradient-to-br from-primary-container to-primary flex items-center justify-center shadow-lg chatbot-avatar-glow"
                >
                  <span class="material-symbols-outlined icon-fill text-on-primary text-[40px]"
                    >smart_toy</span
                  >
                </div>
                <div
                  class="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center shadow-md"
                >
                  <span
                    class="material-symbols-outlined icon-fill text-on-secondary-container text-[14px]"
                    >auto_awesome</span
                  >
                </div>
              </div>

              <div class="text-center mb-10">
                <h2
                  class="font-headline-lg text-headline-lg text-primary-container mb-2"
                >
                  Bagaimana saya bisa membantu Anda hari ini?
                </h2>
                <p class="font-body-md text-on-surface-variant">
                  Pilih topik untuk memulai analisis keuangan Anda
                </p>
              </div>

              <!-- Suggestion Cards Grid -->
              <div class="grid grid-cols-1 gap-6 w-full lg:grid-cols-4 md:grid-cols-2">
                <button
                  v-for="suggestion in quickSuggestions"
                  :key="suggestion.prompt"
                  :id="`btn-suggestion-${suggestion.prompt}`"
                  class="suggestion-card flex flex-col items-center gap-4 p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 hover:border-secondary/50 hover:shadow-lg transition-all group cursor-pointer"
                  @click="handleSuggestionClick(suggestion.prompt, suggestion.title)"
                >
                  <div
                    class="w-16 h-16 rounded-full bg-secondary-fixed/30 flex items-center justify-center text-secondary group-hover:scale-110 transition-transform"
                  >
                    <span class="material-symbols-outlined text-[32px]">{{ suggestion.icon }}</span>
                  </div>
                  <div class="text-center">
                    <h3
                      class="font-headline-md text-headline-md text-primary-container text-[18px] mb-2"
                    >
                      {{ suggestion.title }}
                    </h3>
                    <p class="font-label-sm text-on-surface-variant">
                      {{ suggestion.description }}
                    </p>
                  </div>
                </button>
              </div>

              <!-- Info Banner -->
              <div
                class="mt-12 p-4 rounded-xl bg-secondary-fixed/20 border border-secondary/10 flex items-center gap-3 max-w-lg"
              >
                <span class="material-symbols-outlined text-secondary">info</span>
                <p class="font-label-sm text-on-surface-variant">
                  Naviance AI menggunakan akses baca-saja yang aman ke data keuangan Anda.
                </p>
              </div>
            </div>

            <!-- ===== CHAT MESSAGES ===== -->
            <div v-else class="max-w-5xl mx-auto space-y-6 py-4">
              <template v-for="message in messages" :key="message.id">
                <!-- User Message -->
                <div v-if="message.role === 'user'" class="flex justify-end items-start gap-3">
                  <div class="max-w-[85%]">
                    <div
                      class="bg-primary-container text-white px-5 py-3.5 rounded-2xl rounded-br-md shadow-sm"
                    >
                      <p class="font-body-md text-body-md">{{ message.content }}</p>
                    </div>
                    <p
                      class="font-label-sm text-label-sm text-on-surface-variant/50 mt-1.5 text-right"
                    >
                      {{ formatTime(message.timestamp) }}
                    </p>
                  </div>
                  <div
                    class="w-9 h-9 rounded-full bg-primary-container flex items-center justify-center shrink-0"
                  >
                    <span class="material-symbols-outlined text-white text-[18px]">person</span>
                  </div>
                </div>

                <!-- Assistant Message -->
                <div v-else class="flex items-start gap-3 chat-message-enter">
                  <div
                    class="w-9 h-9 rounded-full bg-gradient-to-br from-secondary-container to-secondary flex items-center justify-center shrink-0 shadow-sm"
                  >
                    <span
                      class="material-symbols-outlined icon-fill text-on-secondary-container text-[18px]"
                      >smart_toy</span
                    >
                  </div>
                  <div class="max-w-[85%]">
                    <div
                      class="bg-surface-container-lowest px-5 py-4 rounded-2xl rounded-bl-md shadow-sm border border-outline-variant/20"
                    >
                      <div
                        class="font-body-md text-body-md text-on-surface prose-chat"
                        v-html="renderMarkdown(message.content)"
                      ></div>
                    </div>
                    <p
                      class="font-label-sm text-label-sm text-on-surface-variant/50 mt-1.5"
                    >
                      {{ formatTime(message.timestamp) }}
                    </p>
                  </div>
                </div>
              </template>

              <!-- Typing Indicator -->
              <div v-if="isLoading" class="flex items-start gap-3 chat-message-enter">
                <div
                  class="w-9 h-9 rounded-full bg-gradient-to-br from-secondary-container to-secondary flex items-center justify-center shrink-0 shadow-sm"
                >
                  <span
                    class="material-symbols-outlined icon-fill text-on-secondary-container text-[18px]"
                    >smart_toy</span
                  >
                </div>
                <div
                  class="bg-surface-container-lowest px-5 py-4 rounded-2xl rounded-bl-md shadow-sm border border-outline-variant/20"
                >
                  <div class="flex items-center gap-1.5">
                    <div class="typing-dot"></div>
                    <div class="typing-dot" style="animation-delay: 0.15s"></div>
                    <div class="typing-dot" style="animation-delay: 0.3s"></div>
                  </div>
                </div>
              </div>

              <!-- Scroll anchor -->
              <div ref="messagesEndRef"></div>
            </div>
          </div>

          <!-- Input Area (Fixed at bottom) -->
          <div
            class="px-4 md:px-6 py-4 bg-surface-container-lowest border-t border-outline-variant/20 shrink-0 relative z-10"
          >
            <form
              class="relative flex items-center group"
              @submit.prevent="handleSend"
            >
              <input
                id="input-chat-message"
                v-model="userInput"
                type="text"
                class="w-full bg-surface-bright border border-outline-variant/50 text-primary-container placeholder:text-on-surface-variant/50 rounded-2xl py-4 pl-5 pr-16 font-body-md text-body-md focus:outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all shadow-sm"
                placeholder="Tanyakan sesuatu..."
                :disabled="isLoading"
                autocomplete="off"
                @keydown="handleKeyDown"
              />
              <button
                id="btn-send-message"
                type="submit"
                class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-secondary-container text-on-secondary-container flex items-center justify-center hover:bg-secondary hover:text-on-secondary transition-colors shadow-sm disabled:opacity-50"
                :disabled="!userInput.trim() || isLoading"
              >
                <span class="material-symbols-outlined icon-fill">send</span>
              </button>
            </form>
            <p
              class="text-center mt-3 font-label-sm text-label-sm text-on-surface-variant/70"
            >
              AI dapat membuat kesalahan. Pertimbangkan untuk memverifikasi keputusan keuangan yang
              penting.
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Custom Scrollbar for Chat */
.chat-scroll::-webkit-scrollbar {
  width: 6px;
}
.chat-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.chat-scroll::-webkit-scrollbar-thumb {
  background-color: var(--color-outline-variant, #c5c6cd);
  border-radius: 10px;
}

/* Material Symbols filled variant */
.icon-fill {
  font-variation-settings: 'FILL' 1, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}

/* Chatbot avatar glow animation */
.chatbot-avatar-glow {
  animation: avatar-glow 3s ease-in-out infinite;
}

@keyframes avatar-glow {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(30, 41, 59, 0.15);
  }
  50% {
    box-shadow: 0 0 0 12px rgba(30, 41, 59, 0);
  }
}

/* Suggestion card hover effect */
.suggestion-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}
.suggestion-card:hover {
  transform: translateY(-4px);
}

/* Chat message entrance animation */
.chat-message-enter {
  animation: message-slide-in 0.3s ease-out;
}

@keyframes message-slide-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Typing indicator animation */
.typing-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #75777d;
  animation: typing-bounce 1.2s ease-in-out infinite;
}

@keyframes typing-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-6px);
    opacity: 1;
  }
}

/* Prose styles for AI chat responses */
.prose-chat :deep(h3) {
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
}
.prose-chat :deep(h4) {
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
}
.prose-chat :deep(table) {
  font-size: 13px;
}
.prose-chat :deep(li) {
  margin-bottom: 0.25rem;
  font-size: 14px;
  line-height: 1.5;
}
.prose-chat :deep(br + br) {
  display: block;
  content: '';
  margin-top: 0.5rem;
}
</style>
