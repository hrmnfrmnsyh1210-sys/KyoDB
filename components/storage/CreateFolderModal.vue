<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      @click="handleClose"
    ></div>

    <!-- Modal Box -->
    <div class="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#0c121e] shadow-2xl shadow-black/60 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <FolderPlus class="h-4 w-4" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-white">Create Virtual Folder</h3>
            <p class="text-xs text-slate-400">
              Virtual directory prefix in Cloudflare R2
            </p>
          </div>
        </div>

        <button
          class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          @click="handleClose"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Error Message Banner -->
      <div v-if="errorMessage" class="m-6 mb-0 rounded-xl bg-red-500/10 border border-red-500/20 p-3.5 text-xs text-red-300 flex items-start gap-2.5">
        <AlertTriangle class="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
        <div class="flex-1">{{ errorMessage }}</div>
      </div>

      <!-- Form Body -->
      <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
        <!-- Target Path indicator -->
        <div>
          <label class="block text-xs font-medium text-slate-400 mb-1">
            Destination Location
          </label>
          <div class="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-3.5 py-2 text-xs font-mono text-cyan-300">
            <Folder class="h-3.5 w-3.5 text-slate-500" />
            <span>/{{ currentPath || 'root' }}</span>
          </div>
        </div>

        <!-- Folder Name -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">
            Folder Name <span class="text-cyan-400">*</span>
          </label>
          <input
            v-model="folderName"
            type="text"
            required
            autofocus
            placeholder="e.g. avatars, invoices, documents"
            class="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          <p class="mt-1 text-[11px] text-slate-500">
            Can include letters, numbers, spaces, dots, hyphens, and underscores.
          </p>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            class="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700 transition-colors"
            @click="handleClose"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-500 transition-all disabled:opacity-50"
            :disabled="isLoading || !folderName.trim()"
          >
            <Loader2 v-if="isLoading" class="h-3.5 w-3.5 animate-spin" />
            <FolderPlus v-else class="h-3.5 w-3.5" />
            <span>{{ isLoading ? 'Creating...' : 'Create Folder' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FolderPlus, Folder, X, AlertTriangle, Loader2 } from '@lucide/vue'

const props = defineProps<{
  isOpen: boolean
  currentPath: string
  projectId?: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created'): void
}>()

const folderName = ref('')
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

function handleClose() {
  folderName.value = ''
  errorMessage.value = null
  emit('close')
}

async function handleSubmit() {
  if (!folderName.value.trim() || isLoading.value) return
  isLoading.value = true
  errorMessage.value = null

  try {
    await $fetch('/api/storage/folder', {
      method: 'POST',
      body: {
        folderName: folderName.value.trim(),
        currentPath: props.currentPath,
        projectId: props.projectId
      }
    })

    handleClose()
    emit('created')
  } catch (err: any) {
    errorMessage.value = err.data?.statusMessage || err.message || 'Failed to create virtual folder'
  } finally {
    isLoading.value = false
  }
}
</script>
