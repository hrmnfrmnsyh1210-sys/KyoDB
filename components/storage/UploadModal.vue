<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 modal-backdrop-warm backdrop-blur-sm transition-opacity"
      @click="handleClose"
    ></div>

    <!-- Modal Box -->
    <div class="relative w-full max-w-xl rounded-2xl border border-[#2e1c0d] bg-[#1a1007] shadow-2xl shadow-black/60 overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-[#2e1c0d] px-6 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8882a]/10 border border-[#e8882a]/20 text-[#e8882a]">
            <UploadCloud class="h-4 w-4" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-warm">Upload Files to Cloudflare R2</h3>
            <p class="text-xs text-muted-warm">
              Direct-to-R2 presigned upload engine
            </p>
          </div>
        </div>

        <button
          class="p-1 rounded-lg text-muted-warm hover:text-warm hover:bg-[#231509]/70 transition-colors"
          :disabled="isUploading"
          @click="handleClose"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Scope / Destination Banner -->
      <div class="bg-[#1c1208] border-b border-[#2e1c0d]/60 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-1.5 text-muted-warm">
          <Folder class="h-3.5 w-3.5 text-amber-accent shrink-0" />
          <span class="text-muted-warm">Target Folder:</span>
          <span class="font-mono text-amber-accent font-medium">/{{ currentPrefix || 'root' }}</span>
        </div>

        <!-- Project Selector if available -->
        <div v-if="projects.length > 0" class="flex items-center gap-2">
          <span class="text-muted-warm">Project Scope:</span>
          <select
            v-model="selectedProjectId"
            :disabled="isUploading"
            class="rounded-lg border border-[#3a2410] bg-[#231509] px-2.5 py-1 text-xs text-warm focus:border-[#e8882a] focus:outline-none"
          >
            <option :value="null">None (Global)</option>
            <option v-for="proj in projects" :key="proj.id" :value="proj.id">
              {{ proj.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Body / Scrollable Content -->
      <div class="p-6 overflow-y-auto space-y-4 flex-1">
        <!-- Drag & Drop Zone -->
        <div
          class="relative rounded-2xl border-2 border-dashed transition-all p-8 text-center cursor-pointer"
          :class="isDragging ? 'border-[#e8882a] bg-[#e8882a]/10' : 'border-[#3a2410] hover:border-[#6a5545] bg-[#1c1208]/30'"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="handleDrop"
          @click="triggerFileInput"
        >
          <input
            ref="fileInputRef"
            type="file"
            multiple
            class="hidden"
            @change="handleFileSelect"
          />

          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8882a]/10 text-[#e8882a] border border-[#e8882a]/20 mb-3">
            <UploadCloud class="h-6 w-6" />
          </div>

          <h4 class="text-sm font-semibold text-warm">
            Choose files or drag & drop here
          </h4>
          <p class="text-xs text-muted-warm mt-1 max-w-sm mx-auto">
            Images, documents, videos, and archives are uploaded directly to Cloudflare R2 via pre-signed S3 URLs.
          </p>
          <span class="mt-3 inline-block rounded-lg bg-[#2a1a0c] px-3 py-1.5 text-xs font-medium text-warm border border-[#3a2410] hover:bg-[#3a2410]">
            Browse files
          </span>
        </div>

        <!-- File Queue List -->
        <div v-if="fileQueue.length > 0" class="space-y-2.5">
          <div class="flex items-center justify-between text-xs text-muted-warm pt-2">
            <span>Selected Files ({{ fileQueue.length }})</span>
            <button
              v-if="!isUploading && fileQueue.length > 0"
              class="text-red-400 hover:text-red-300 transition-colors"
              @click="clearQueue"
            >
              Clear all
            </button>
          </div>

          <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
            <div
              v-for="(item, idx) in fileQueue"
              :key="idx"
              class="rounded-xl border border-[#2e1c0d] bg-[#231509] p-3 space-y-2"
            >
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2 min-w-0 pr-2">
                  <File class="h-4 w-4 text-amber-accent shrink-0" />
                  <span class="font-medium text-warm truncate" :title="item.file.name">
                    {{ item.file.name }}
                  </span>
                  <span class="text-[11px] text-faint-warm shrink-0">
                    ({{ formatBytes(item.file.size) }})
                  </span>
                </div>

                <!-- Status Badge -->
                <div class="flex items-center gap-2 shrink-0">
                  <span
                    v-if="item.status === 'pending'"
                    class="rounded-full bg-[#2a1a0c] px-2 py-0.5 text-[10px] text-muted-warm font-mono"
                  >
                    Pending
                  </span>
                  <span
                    v-else-if="item.status === 'uploading'"
                    class="flex items-center gap-1 text-[10px] text-amber-accent font-mono"
                  >
                    <Loader2 class="h-3 w-3 animate-spin" />
                    {{ item.progress }}%
                  </span>
                  <span
                    v-else-if="item.status === 'completed'"
                    class="flex items-center gap-1 text-[10px] text-emerald-400 font-mono"
                  >
                    <Check class="h-3 w-3" />
                    Uploaded
                  </span>
                  <span
                    v-else-if="item.status === 'error'"
                    class="flex items-center gap-1 text-[10px] text-red-400 font-mono"
                    :title="item.error"
                  >
                    <AlertCircle class="h-3 w-3" />
                    Failed
                  </span>

                  <!-- Remove item button if pending -->
                  <button
                    v-if="item.status === 'pending' && !isUploading"
                    class="p-0.5 text-faint-warm hover:text-red-400 transition-colors"
                    @click="removeItem(idx)"
                  >
                    <X class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <!-- Progress bar for uploading / completed -->
              <div
                v-if="item.status === 'uploading' || item.status === 'completed'"
                class="w-full bg-[#2a1a0c] h-1.5 rounded-full overflow-hidden"
              >
                <div
                  class="h-full transition-all duration-200"
                  :class="item.status === 'completed' ? 'bg-emerald-500' : 'bg-gradient-to-r from-[#e8882a] to-[#f9a84a]'"
                  :style="{ width: `${item.progress}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between border-t border-[#2e1c0d] px-6 py-4 bg-[#1c1208]">
        <div class="text-xs text-muted-warm">
          <span v-if="allCompleted && fileQueue.length > 0" class="text-emerald-400 flex items-center gap-1">
            <Check class="h-3.5 w-3.5" /> All files uploaded successfully!
          </span>
          <span v-else-if="isUploading">
            Uploading files directly to Cloudflare R2...
          </span>
          <span v-else>
            {{ fileQueue.length }} file(s) selected
          </span>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="rounded-xl border border-[#3a2410] bg-[#2a1a0c] px-4 py-2 text-xs font-semibold text-muted-warm hover:bg-[#3a2410] transition-colors"
            :disabled="isUploading"
            @click="handleClose"
          >
            {{ allCompleted ? 'Close' : 'Cancel' }}
          </button>

          <button
            v-if="!allCompleted"
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#e8882a] to-[#c46a18] px-4 py-2 text-xs font-semibold text-warm shadow-lg shadow-[#e8882a]/20 hover:from-[#f9a84a] hover:to-[#e8882a] transition-all disabled:opacity-50"
            :disabled="isUploading || fileQueue.length === 0"
            @click="startUpload"
          >
            <Loader2 v-if="isUploading" class="h-3.5 w-3.5 animate-spin" />
            <UploadCloud v-else class="h-3.5 w-3.5" />
            <span>{{ isUploading ? 'Uploading...' : `Upload ${fileQueue.length} File(s)` }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  UploadCloud,
  X,
  File,
  Folder,
  Loader2,
  Check,
  AlertCircle
} from '@lucide/vue'
import { formatBytes } from '~/server/validators/storage.validator'
import type { Project } from '~/types'

interface QueueItem {
  file: globalThis.File
  status: 'pending' | 'uploading' | 'completed' | 'error'
  progress: number
  error?: string
}

const props = defineProps<{
  isOpen: boolean
  currentPrefix: string
  defaultProjectId?: string | null
  projects: Project[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'uploaded'): void
}>()

const fileInputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const isUploading = ref(false)
const selectedProjectId = ref<string | null>(props.defaultProjectId || null)
const fileQueue = ref<QueueItem[]>([])

watch(
  () => props.defaultProjectId,
  (val) => {
    selectedProjectId.value = val || null
  }
)

const allCompleted = computed(() => {
  return fileQueue.value.length > 0 && fileQueue.value.every((i) => i.status === 'completed')
})

function triggerFileInput() {
  if (isUploading.value) return
  fileInputRef.value?.click()
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    addFilesToQueue(Array.from(target.files))
    target.value = ''
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (isUploading.value) return
  if (e.dataTransfer?.files) {
    addFilesToQueue(Array.from(e.dataTransfer.files))
  }
}

function addFilesToQueue(files: globalThis.File[]) {
  for (const file of files) {
    if (!fileQueue.value.some((q) => q.file.name === file.name && q.file.size === file.size)) {
      fileQueue.value.push({
        file,
        status: 'pending',
        progress: 0
      })
    }
  }
}

function removeItem(idx: number) {
  fileQueue.value.splice(idx, 1)
}

function clearQueue() {
  fileQueue.value = []
}

function handleClose() {
  if (isUploading.value) return
  const hadUploads = fileQueue.value.some((i) => i.status === 'completed')
  if (hadUploads) {
    emit('uploaded')
  }
  clearQueue()
  emit('close')
}

/**
 * Upload an individual file directly to Cloudflare R2 using XMLHttpRequest for upload progress tracking
 */
function uploadFileDirect(url: string, file: globalThis.File, onProgress: (pct: number) => void): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url, true)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100)
        onProgress(percent)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Direct R2 upload failed with HTTP status ${xhr.status}`))
      }
    }

    xhr.onerror = () => {
      reject(new Error('Network error during direct upload to R2'))
    }

    xhr.send(file)
  })
}

async function startUpload() {
  if (isUploading.value || fileQueue.value.length === 0) return
  isUploading.value = true

  for (const item of fileQueue.value) {
    if (item.status === 'completed') continue

    item.status = 'uploading'
    item.progress = 5

    try {
      // 1. Request presigned upload URL from backend
      const res = await $fetch<{ success: boolean; data: { uploadUrl: string; objectKey: string } }>(
        '/api/storage/upload-url',
        {
          method: 'POST',
          body: {
            filename: item.file.name,
            contentType: item.file.type || 'application/octet-stream',
            folder: props.currentPrefix,
            projectId: selectedProjectId.value,
            sizeBytes: item.file.size
          }
        }
      )

      if (!res.success || !res.data?.uploadUrl) {
        throw new Error('Failed to obtain presigned upload URL')
      }

      item.progress = 15

      // 2. Direct PUT to Cloudflare R2
      await uploadFileDirect(res.data.uploadUrl, item.file, (pct) => {
        // Map 15% -> 90%
        item.progress = 15 + Math.round((pct * 75) / 100)
      })

      item.progress = 95

      // 3. Confirm upload and save object in metadata database
      await $fetch('/api/storage/confirm', {
        method: 'POST',
        body: {
          objectKey: res.data.objectKey,
          filename: item.file.name,
          mimeType: item.file.type || 'application/octet-stream',
          sizeBytes: item.file.size,
          projectId: selectedProjectId.value
        }
      })

      item.status = 'completed'
      item.progress = 100
    } catch (err: any) {
      item.status = 'error'
      item.error = err.data?.statusMessage || err.message || 'Upload failed'
    }
  }

  isUploading.value = false
  emit('uploaded')
}
</script>
