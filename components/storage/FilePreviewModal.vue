<template>
  <div v-if="isOpen && item" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      @click="$emit('close')"
    ></div>

    <!-- Modal Box -->
    <div class="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-[#0c121e] shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
        <div class="flex items-center gap-3 min-w-0 pr-4">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shrink-0">
            <component :is="getCategoryIcon(item.category)" class="h-4.5 w-4.5" />
          </div>
          <div class="min-w-0">
            <h3 class="text-base font-semibold text-white truncate" :title="item.name">
              {{ item.name }}
            </h3>
            <div class="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
              <span>{{ formatBytes(item.sizeBytes) }}</span>
              <span>•</span>
              <span class="font-mono text-cyan-400 uppercase text-[10px]">{{ item.category || 'file' }}</span>
              <span v-if="item.projectName">•</span>
              <span v-if="item.projectName" class="text-blue-400 font-medium">{{ item.projectName }}</span>
            </div>
          </div>
        </div>

        <button
          class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors shrink-0"
          @click="$emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Preview Stage -->
      <div class="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-slate-950/50">
        <!-- Loading State for Presigned Download URL -->
        <div v-if="isLoadingUrl" class="py-16 text-center">
          <Loader2 class="h-8 w-8 text-cyan-400 animate-spin mx-auto mb-3" />
          <p class="text-xs text-slate-400">Generating secure presigned preview URL...</p>
        </div>

        <!-- IMAGE Preview -->
        <div v-else-if="item.category === 'image' && resolvedUrl" class="w-full flex items-center justify-center">
          <img
            :src="resolvedUrl"
            :alt="item.name"
            class="max-h-[55vh] max-w-full rounded-xl object-contain border border-slate-800 shadow-lg bg-[#0f172a]"
          />
        </div>

        <!-- VIDEO Preview -->
        <div v-else-if="item.category === 'video' && resolvedUrl" class="w-full flex items-center justify-center">
          <video
            controls
            autoplay
            :src="resolvedUrl"
            class="max-h-[55vh] max-w-full rounded-xl border border-slate-800 bg-black"
          ></video>
        </div>

        <!-- AUDIO Preview -->
        <div v-else-if="item.category === 'audio' && resolvedUrl" class="w-full max-w-md py-8 text-center space-y-4">
          <div class="h-20 w-20 mx-auto rounded-2xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shadow-lg">
            <Music class="h-10 w-10" />
          </div>
          <audio controls :src="resolvedUrl" class="w-full"></audio>
        </div>

        <!-- CODE / TEXT Preview -->
        <div v-else-if="item.category === 'code' && resolvedUrl" class="w-full">
          <div class="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span class="font-mono">Raw File Preview</span>
            <button
              v-if="textContent"
              class="text-cyan-400 hover:text-cyan-300 font-medium"
              @click="copyContent"
            >
              {{ copiedContent ? 'Copied!' : 'Copy Content' }}
            </button>
          </div>
          <div v-if="isLoadingText" class="py-12 text-center text-xs text-slate-400">
            <Loader2 class="h-6 w-6 animate-spin mx-auto text-cyan-400 mb-2" />
            Loading file contents...
          </div>
          <pre
            v-else
            class="p-4 rounded-xl border border-slate-800 bg-slate-900/90 text-xs font-mono text-cyan-300 overflow-x-auto max-h-[55vh] leading-relaxed"
          ><code>{{ textContent || 'Empty file content' }}</code></pre>
        </div>

        <!-- PDF Document Preview -->
        <div v-else-if="item.name.toLowerCase().endsWith('.pdf') && resolvedUrl" class="w-full h-[55vh]">
          <iframe
            :src="resolvedUrl"
            class="w-full h-full rounded-xl border border-slate-800 bg-white"
          ></iframe>
        </div>

        <!-- GENERIC / ARCHIVE / OTHER Fallback Card -->
        <div v-else class="w-full max-w-md py-8 text-center space-y-4">
          <div class="h-20 w-20 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-lg">
            <FileText class="h-10 w-10" />
          </div>
          <div class="space-y-1">
            <h4 class="text-sm font-semibold text-white">{{ item.name }}</h4>
            <p class="text-xs text-slate-400">Direct file preview is not supported for this file type.</p>
          </div>
        </div>

        <!-- Metadata Overview Card -->
        <div class="w-full mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-900/60 border border-slate-800 rounded-xl p-3">
          <div>
            <span class="text-slate-500 text-[11px] block">MIME Type</span>
            <span class="font-mono text-slate-300 truncate block">{{ item.mimeType || 'unknown' }}</span>
          </div>
          <div>
            <span class="text-slate-500 text-[11px] block">Size</span>
            <span class="font-mono text-slate-300 block">{{ formatBytes(item.sizeBytes) }}</span>
          </div>
          <div>
            <span class="text-slate-500 text-[11px] block">Last Modified</span>
            <span class="text-slate-300 block truncate">{{ formatDate(item.lastModified) }}</span>
          </div>
          <div>
            <span class="text-slate-500 text-[11px] block">Storage Key</span>
            <span class="font-mono text-cyan-400 block truncate" :title="item.key">{{ item.key }}</span>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80 px-6 py-4 bg-slate-900/40">
        <div class="flex items-center gap-2">
          <!-- Copy Presigned URL -->
          <button
            class="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
            @click="copyPresignedUrl"
          >
            <Check v-if="copiedUrl" class="h-3.5 w-3.5 text-emerald-400" />
            <Copy v-else class="h-3.5 w-3.5" />
            <span>{{ copiedUrl ? 'URL Copied!' : 'Copy Presigned URL' }}</span>
          </button>

          <!-- Copy Key -->
          <button
            class="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
            @click="copyKey"
          >
            <Check v-if="copiedKey" class="h-3.5 w-3.5 text-emerald-400" />
            <Key v-else class="h-3.5 w-3.5" />
            <span>{{ copiedKey ? 'Key Copied!' : 'Copy Key' }}</span>
          </button>
        </div>

        <div class="flex items-center gap-2">
          <!-- Delete Button -->
          <button
            class="inline-flex items-center gap-1.5 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors"
            @click="$emit('delete', item)"
          >
            <Trash2 class="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>

          <!-- Download Button -->
          <a
            v-if="resolvedUrl"
            :href="resolvedUrl"
            :download="item.name"
            target="_blank"
            class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-teal-500/20 hover:from-teal-500 hover:to-cyan-500 transition-all"
          >
            <Download class="h-3.5 w-3.5" />
            <span>Download</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  X,
  Download,
  Copy,
  Key,
  Trash2,
  Check,
  Loader2,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Code,
  Archive,
  File
} from '@lucide/vue'
import { formatBytes } from '~/server/validators/storage.validator'
import type { StorageItem } from '~/types'

const props = defineProps<{
  isOpen: boolean
  item: StorageItem | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'delete', item: StorageItem): void
}>()

const resolvedUrl = ref<string | null>(null)
const isLoadingUrl = ref(false)
const textContent = ref<string | null>(null)
const isLoadingText = ref(false)
const copiedUrl = ref(false)
const copiedKey = ref(false)
const copiedContent = ref(false)

watch(
  () => props.item,
  async (newItem) => {
    if (!newItem) {
      resolvedUrl.value = null
      textContent.value = null
      return
    }

    isLoadingUrl.value = true
    textContent.value = null

    try {
      const res = await $fetch<{ success: boolean; data: { downloadUrl: string } }>(
        `/api/storage/download-url?key=${encodeURIComponent(newItem.key)}`
      )
      resolvedUrl.value = res.data?.downloadUrl || null

      // If code/text, fetch text contents for display
      if (newItem.category === 'code' && resolvedUrl.value) {
        isLoadingText.value = true
        try {
          const txt = await $fetch<string>(resolvedUrl.value)
          textContent.value = typeof txt === 'string' ? txt : JSON.stringify(txt, null, 2)
        } catch {
          textContent.value = 'Unable to load text preview.'
        } finally {
          isLoadingText.value = false
        }
      }
    } catch {
      resolvedUrl.value = null
    } finally {
      isLoadingUrl.value = false
    }
  },
  { immediate: true }
)

function getCategoryIcon(cat?: string) {
  switch (cat) {
    case 'image':
      return ImageIcon
    case 'video':
      return Video
    case 'audio':
      return Music
    case 'code':
      return Code
    case 'archive':
      return Archive
    case 'document':
      return FileText
    default:
      return File
  }
}

function formatDate(isoDate?: string): string {
  if (!isoDate) return 'Unknown'
  try {
    return new Date(isoDate).toLocaleString()
  } catch {
    return isoDate
  }
}

async function copyPresignedUrl() {
  if (!resolvedUrl.value) return
  await navigator.clipboard.writeText(resolvedUrl.value)
  copiedUrl.value = true
  setTimeout(() => (copiedUrl.value = false), 2000)
}

async function copyKey() {
  if (!props.item?.key) return
  await navigator.clipboard.writeText(props.item.key)
  copiedKey.value = true
  setTimeout(() => (copiedKey.value = false), 2000)
}

async function copyContent() {
  if (!textContent.value) return
  await navigator.clipboard.writeText(textContent.value)
  copiedContent.value = true
  setTimeout(() => (copiedContent.value = false), 2000)
}
</script>
