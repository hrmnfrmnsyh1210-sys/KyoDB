<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity"
      @click="handleClose"
    ></div>

    <!-- Modal Box -->
    <div class="relative w-full max-w-xl rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-neutral-100 px-6 py-4 bg-neutral-50/50">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/60 text-[#144e35]">
            <UploadCloud class="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-neutral-900">Upload Files to Cloudflare R2</h3>
            <p class="text-xs text-neutral-500">
              Direct-to-R2 presigned upload engine
            </p>
          </div>
        </div>

        <button
          class="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          :disabled="isUploading"
          @click="handleClose"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Scope / Destination Banner -->
      <div class="bg-neutral-50 border-b border-neutral-100 px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div class="flex items-center gap-1.5 text-neutral-600">
          <Folder class="h-4 w-4 text-[#144e35] shrink-0" />
          <span>Target Folder:</span>
          <span class="font-mono text-[#144e35] font-bold">/{{ currentPrefix || 'root' }}</span>
        </div>

        <!-- Project Selector if available -->
        <div v-if="projects.length > 0" class="flex items-center gap-2">
          <span class="text-neutral-500">Project Scope:</span>
          <select
            v-model="selectedProjectId"
            :disabled="isUploading"
            class="rounded-lg border border-neutral-200 bg-white px-2.5 py-1 text-xs text-neutral-900 focus:border-[#144e35] focus:outline-none"
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
          :class="isDragging ? 'border-[#144e35] bg-emerald-50/50' : 'border-neutral-300 hover:border-[#144e35] bg-neutral-50/50'"
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

          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[#144e35] border border-emerald-200/60 mb-3 shadow-xs">
            <UploadCloud class="h-6 w-6" />
          </div>

          <h4 class="text-sm font-bold text-neutral-900">
            Choose files or drag & drop here
          </h4>
          <p class="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Images, documents, videos, and archives are uploaded directly to Cloudflare R2 via pre-signed S3 URLs.
          </p>
          <span class="mt-3 inline-block rounded-full bg-white px-3.5 py-1.5 text-xs font-semibold text-neutral-800 border border-neutral-200 shadow-xs hover:bg-neutral-50">
            Browse files
          </span>
        </div>

        <!-- File Queue List -->
        <div v-if="fileQueue.length > 0" class="space-y-2.5">
          <div class="flex items-center justify-between text-xs text-neutral-500 pt-2">
            <span class="font-semibold text-neutral-700">Selected Files ({{ fileQueue.length }})</span>
            <button
              v-if="!isUploading && fileQueue.length > 0"
              class="text-rose-600 hover:underline font-semibold"
              @click="clearQueue"
            >
              Clear all
            </button>
          </div>

          <div class="space-y-2 max-h-56 overflow-y-auto pr-1">
            <div
              v-for="(item, idx) in fileQueue"
              :key="idx"
              class="rounded-xl border border-neutral-200 bg-neutral-50 p-3 space-y-2"
            >
              <div class="flex items-center justify-between text-xs">
                <div class="flex items-center gap-2 min-w-0 pr-2">
                  <File class="h-4 w-4 text-[#144e35] shrink-0" />
                  <span class="font-semibold text-neutral-900 truncate" :title="item.file.name">
                    {{ item.file.name }}
                  </span>
                  <span class="text-[11px] text-neutral-400 shrink-0">
                    ({{ formatBytes(item.file.size) }})
                  </span>
                </div>

                <!-- Status Badge -->
                <div class="flex items-center gap-2 shrink-0">
                  <span
                    v-if="item.status === 'pending'"
                    class="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] text-neutral-700 font-mono font-medium"
                  >
                    Pending
                  </span>
                  <span
                    v-else-if="item.status === 'uploading'"
                    class="flex items-center gap-1 text-[10px] text-[#144e35] font-mono font-bold"
                  >
                    <Loader2 class="h-3 w-3 animate-spin" />
                    {{ item.progress }}%
                  </span>
                  <span
                    v-else-if="item.status === 'completed'"
                    class="flex items-center gap-1 text-[10px] text-emerald-700 font-mono font-bold"
                  >
                    <Check class="h-3 w-3" />
                    Uploaded
                  </span>
                  <span
                    v-else-if="item.status === 'error'"
                    class="flex items-center gap-1 text-[10px] text-rose-600 font-mono font-bold"
                    :title="item.error"
                  >
                    <AlertCircle class="h-3 w-3" />
                    Failed
                  </span>

                  <!-- Remove item button if pending -->
                  <button
                    v-if="item.status === 'pending' && !isUploading"
                    class="p-0.5 text-neutral-400 hover:text-rose-600 transition-colors"
                    @click="removeItem(idx)"
                  >
                    <X class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <!-- Progress bar for uploading / completed -->
              <div
                v-if="item.status === 'uploading' || item.status === 'completed'"
                class="w-full bg-neutral-200 h-1.5 rounded-full overflow-hidden"
              >
                <div
                  class="h-full transition-all duration-200"
                  :class="item.status === 'completed' ? 'bg-emerald-500' : 'bg-[#144e35]'"
                  :style="{ width: `${item.progress}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="flex items-center justify-between border-t border-neutral-100 px-6 py-4 bg-white">
        <div class="text-xs text-neutral-500">
          <span v-if="allCompleted && fileQueue.length > 0" class="text-emerald-700 font-semibold flex items-center gap-1">
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
            class="btn-white-pill px-4 py-2 text-xs font-semibold"
            :disabled="isUploading"
            @click="handleClose"
          >
            {{ allCompleted ? 'Close' : 'Cancel' }}
          </button>

          <button
            v-if="!allCompleted"
            type="button"
            class="btn-forest inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold shadow-xs disabled:opacity-50"
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

async function startUpload() {
  if (isUploading.value || fileQueue.value.length === 0) return
  isUploading.value = true

  for (const item of fileQueue.value) {
    if (item.status === 'completed') continue
    item.status = 'uploading'
    item.progress = 0

    try {
      const sanitizedName = item.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
      const targetKey = props.currentPrefix
        ? `${props.currentPrefix.replace(/^\/|\/$/g, '')}/${sanitizedName}`
        : sanitizedName

      const presignedRes = await $fetch<{
        success: boolean
        data?: {
          uploadUrl: string
          key: string
          storageType: 'r2' | 'mock'
        }
        error?: string
      }>('/api/storage/upload-url', {
        method: 'POST',
        body: {
          key: targetKey,
          contentType: item.file.type || 'application/octet-stream',
          sizeBytes: item.file.size,
          projectId: selectedProjectId.value || undefined
        }
      })

      if (!presignedRes.success || !presignedRes.data) {
        throw new Error(presignedRes.error || 'Failed to acquire presigned URL')
      }

      const { uploadUrl, key: finalKey, storageType } = presignedRes.data

      await uploadWithProgress(uploadUrl, item.file, (pct) => {
        item.progress = pct
      })

      const confirmRes = await $fetch<{ success: boolean; error?: string }>(
        '/api/storage/confirm',
        {
          method: 'POST',
          body: {
            key: finalKey,
            sizeBytes: item.file.size,
            mimeType: item.file.type || 'application/octet-stream',
            storageType,
            projectId: selectedProjectId.value || undefined
          }
        }
      )

      if (!confirmRes.success) {
        throw new Error(confirmRes.error || 'Failed to confirm upload metadata')
      }

      item.status = 'completed'
      item.progress = 100
    } catch (err: any) {
      item.status = 'error'
      item.error = err.message || 'Upload failed'
    }
  }

  isUploading.value = false
}

function uploadWithProgress(
  url: string,
  file: globalThis.File,
  onProgress: (pct: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url, true)
    xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100)
        onProgress(pct)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
      } else {
        reject(new Error(`Storage service responded with status ${xhr.status}`))
      }
    }

    xhr.onerror = () => {
      reject(new Error('Network error during upload to Cloudflare R2'))
    }

    xhr.send(file)
  })
}
</script>
