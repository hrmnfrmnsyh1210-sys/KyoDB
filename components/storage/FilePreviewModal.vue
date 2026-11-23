<template>
  <div v-if="isOpen && item" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity"
      @click="$emit('close')"
    ></div>

    <!-- Modal Box -->
    <div class="relative w-full max-w-3xl rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-neutral-100 px-6 py-4 bg-neutral-50/50">
        <div class="flex items-center gap-3 min-w-0 pr-4">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/60 text-[#144e35] shrink-0">
            <component :is="getCategoryIcon(item.category)" class="h-4.5 w-4.5" />
          </div>
          <div class="min-w-0">
            <h3 class="text-base font-bold text-neutral-900 truncate" :title="item.name">
              {{ item.name }}
            </h3>
            <div class="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
              <span>{{ formatBytes(item.sizeBytes) }}</span>
              <span>•</span>
              <span class="font-mono text-[#144e35] font-semibold uppercase text-[10px]">{{ item.category || 'file' }}</span>
              <span v-if="item.projectName">•</span>
              <span v-if="item.projectName" class="text-neutral-700 font-medium">{{ item.projectName }}</span>
            </div>
          </div>
        </div>

        <button
          class="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors shrink-0"
          @click="$emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Preview Stage -->
      <div class="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-neutral-50">
        <!-- Loading State for Presigned Download URL -->
        <div v-if="isLoadingUrl" class="py-16 text-center">
          <Loader2 class="h-8 w-8 text-[#144e35] animate-spin mx-auto mb-3" />
          <p class="text-xs text-neutral-500">Generating secure presigned preview URL...</p>
        </div>

        <!-- IMAGE Preview -->
        <div v-else-if="item.category === 'image' && resolvedUrl" class="w-full flex items-center justify-center">
          <img
            :src="resolvedUrl"
            :alt="item.name"
            class="max-h-[55vh] max-w-full rounded-xl object-contain border border-neutral-200 shadow-md bg-white"
          />
        </div>

        <!-- VIDEO Preview -->
        <div v-else-if="item.category === 'video' && resolvedUrl" class="w-full flex items-center justify-center">
          <video
            controls
            autoplay
            :src="resolvedUrl"
            class="max-h-[55vh] max-w-full rounded-xl border border-neutral-200 bg-black"
          ></video>
        </div>

        <!-- AUDIO Preview -->
        <div v-else-if="item.category === 'audio' && resolvedUrl" class="w-full max-w-md py-8 text-center space-y-4">
          <div class="h-20 w-20 mx-auto rounded-2xl bg-emerald-50 border border-emerald-200 text-[#144e35] flex items-center justify-center shadow-sm">
            <Music class="h-10 w-10" />
          </div>
          <audio controls :src="resolvedUrl" class="w-full"></audio>
        </div>

        <!-- CODE / TEXT Preview -->
        <div v-else-if="item.category === 'code' && resolvedUrl" class="w-full">
          <div class="flex items-center justify-between text-xs text-neutral-500 mb-2">
            <span class="font-mono font-semibold">Raw File Preview</span>
            <button
              v-if="textContent"
              class="text-[#144e35] hover:underline font-semibold"
              @click="copyContent"
            >
              {{ copiedContent ? 'Copied!' : 'Copy Content' }}
            </button>
          </div>
          <div v-if="isLoadingText" class="py-12 text-center text-xs text-neutral-500">
            <Loader2 class="h-6 w-6 animate-spin mx-auto text-[#144e35] mb-2" />
            Loading file contents...
          </div>
          <pre
            v-else
            class="p-4 rounded-xl border border-neutral-200 bg-white text-xs font-mono text-neutral-900 overflow-x-auto max-h-[55vh] leading-relaxed shadow-xs"
          ><code>{{ textContent || 'Empty file content' }}</code></pre>
        </div>

        <!-- PDF Document Preview -->
        <div v-else-if="item.name.toLowerCase().endsWith('.pdf') && resolvedUrl" class="w-full h-[55vh]">
          <iframe
            :src="resolvedUrl"
            class="w-full h-full rounded-xl border border-neutral-200 bg-white"
          ></iframe>
        </div>

        <!-- GENERIC / ARCHIVE / OTHER Fallback Card -->
        <div v-else class="w-full max-w-md py-8 text-center space-y-4">
          <div class="h-20 w-20 mx-auto rounded-2xl bg-neutral-100 text-neutral-600 flex items-center justify-center shadow-xs">
            <FileText class="h-10 w-10" />
          </div>
          <div class="space-y-1">
            <h4 class="text-sm font-bold text-neutral-900">{{ item.name }}</h4>
            <p class="text-xs text-neutral-500">Direct file preview is not supported for this file type.</p>
          </div>
        </div>

        <!-- Metadata Overview Card -->
        <div class="w-full mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-white border border-neutral-200 rounded-xl p-3 shadow-xs">
          <div>
            <span class="text-neutral-400 text-[11px] block">MIME Type</span>
            <span class="font-mono text-neutral-800 truncate block font-medium">{{ item.mimeType || 'unknown' }}</span>
          </div>
          <div>
            <span class="text-neutral-400 text-[11px] block">Size</span>
            <span class="font-mono text-neutral-800 block font-medium">{{ formatBytes(item.sizeBytes) }}</span>
          </div>
          <div>
            <span class="text-neutral-400 text-[11px] block">Last Modified</span>
            <span class="text-neutral-800 block truncate font-medium">{{ formatDate(item.lastModified) }}</span>
          </div>
          <div>
            <span class="text-neutral-400 text-[11px] block">Storage Key</span>
            <span class="font-mono text-[#144e35] block truncate font-medium" :title="item.key">{{ item.key }}</span>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-neutral-100 px-6 py-4 bg-white">
        <div class="flex items-center gap-2">
          <!-- Copy Presigned URL -->
          <button
            class="btn-white-pill inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
            @click="copyPresignedUrl"
          >
            <Check v-if="copiedUrl" class="h-3.5 w-3.5 text-emerald-600" />
            <Copy v-else class="h-3.5 w-3.5" />
            <span>{{ copiedUrl ? 'URL Copied!' : 'Copy Presigned URL' }}</span>
          </button>

          <!-- Copy Key -->
          <button
            class="btn-white-pill inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold"
            @click="copyKey"
          >
            <Check v-if="copiedKey" class="h-3.5 w-3.5 text-emerald-600" />
            <Key v-else class="h-3.5 w-3.5" />
            <span>{{ copiedKey ? 'Key Copied!' : 'Copy Key' }}</span>
          </button>
        </div>

        <div class="flex items-center gap-2">
          <!-- Delete Button -->
          <button
            class="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700 px-4 py-1.5 text-xs font-semibold hover:bg-rose-100 transition-colors"
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
            class="btn-forest inline-flex items-center gap-1.5 px-5 py-1.5 text-xs font-semibold shadow-xs"
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
  Code2,
  FileArchive,
  File as FileGeneric
} from '@lucide/vue'
import type { StorageItem, FileCategory } from '~/types'

const props = defineProps<{
  isOpen: boolean
  item: StorageItem | null
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'delete', item: StorageItem): void
}>()

const resolvedUrl = ref<string | null>(null)
const isLoadingUrl = ref(false)
const copiedUrl = ref(false)
const copiedKey = ref(false)

const textContent = ref<string | null>(null)
const isLoadingText = ref(false)
const copiedContent = ref(false)

const formatBytes = (bytes?: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const formatDate = (isoStr?: string) => {
  if (!isoStr) return 'N/A'
  try {
    const d = new Date(isoStr)
    return d.toLocaleString()
  } catch {
    return isoStr
  }
}

const getCategoryIcon = (category?: FileCategory) => {
  switch (category) {
    case 'image': return ImageIcon
    case 'video': return Video
    case 'audio': return Music
    case 'code': return Code2
    case 'archive': return FileArchive
    default: return FileGeneric
  }
}

const copyPresignedUrl = async () => {
  if (!resolvedUrl.value) return
  try {
    await navigator.clipboard.writeText(resolvedUrl.value)
    copiedUrl.value = true
    setTimeout(() => { copiedUrl.value = false }, 2000)
  } catch (err) {
    console.error('Failed to copy URL:', err)
  }
}

const copyKey = async () => {
  if (!props.item?.key) return
  try {
    await navigator.clipboard.writeText(props.item.key)
    copiedKey.value = true
    setTimeout(() => { copiedKey.value = false }, 2000)
  } catch (err) {
    console.error('Failed to copy key:', err)
  }
}

const copyContent = async () => {
  if (!textContent.value) return
  try {
    await navigator.clipboard.writeText(textContent.value)
    copiedContent.value = true
    setTimeout(() => { copiedContent.value = false }, 2000)
  } catch (err) {
    console.error('Failed to copy text:', err)
  }
}

watch(
  () => props.isOpen,
  async (open) => {
    if (open && props.item && props.item.type === 'file') {
      isLoadingUrl.value = true
      resolvedUrl.value = null
      textContent.value = null
      copiedUrl.value = false
      copiedKey.value = false
      copiedContent.value = false

      try {
        const res = await $fetch<{ success: boolean; data?: { downloadUrl: string; key: string } }>(
          '/api/storage/download-url',
          {
            method: 'GET',
            query: { key: props.item.key }
          }
        )

        if (res.success && res.data?.downloadUrl) {
          resolvedUrl.value = res.data.downloadUrl

          if (props.item.category === 'code' || props.item.mimeType?.startsWith('text/')) {
            isLoadingText.value = true
            try {
              const text = await $fetch<string>(res.data.downloadUrl, { responseType: 'text' })
              textContent.value = typeof text === 'string' ? text : JSON.stringify(text, null, 2)
            } catch (err) {
              textContent.value = 'Failed to load text content.'
            } finally {
              isLoadingText.value = false
            }
          }
        }
      } catch (err) {
        console.error('Failed to get download URL:', err)
      } finally {
        isLoadingUrl.value = false
      }
    }
  }
)
</script>
