<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 modal-backdrop-warm backdrop-blur-sm transition-opacity"
      @click="handleClose"
    ></div>

    <!-- Modal Box -->
    <div class="relative w-full max-w-md rounded-2xl border border-[#2e1c0d] bg-[#1a1007] shadow-2xl shadow-black/60 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-[#2e1c0d] px-6 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8882a]/10 border border-[#e8882a]/20 text-amber-accent">
            <FolderPlus class="h-4 w-4" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-warm">Create Virtual Folder</h3>
            <p class="text-xs text-muted-warm">
              Virtual directory prefix in Cloudflare R2
            </p>
          </div>
        </div>

        <button
          class="p-1 rounded-lg text-muted-warm hover:text-warm hover:bg-[#231509]/70 transition-colors"
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
          <label class="block text-xs font-medium text-muted-warm mb-1">
            Destination Location
          </label>
          <div class="flex items-center gap-2 rounded-xl border border-[#2e1c0d] bg-[#1c1208] px-3.5 py-2 text-xs font-mono text-amber-accent">
            <Folder class="h-3.5 w-3.5 text-faint-warm" />
            <span>/{{ currentPath || 'root' }}</span>
          </div>
        </div>

        <!-- Folder Name -->
        <div>
          <label class="block text-xs font-medium text-muted-warm mb-1.5">
            Folder Name <span class="text-amber-accent">*</span>
          </label>
          <input
            v-model="folderName"
            type="text"
            required
            autofocus
            placeholder="e.g. avatars, invoices, documents"
            class="w-full rounded-xl border border-[#3a2410] bg-[#231509] px-3.5 py-2.5 text-xs text-warm placeholder-[#6a5545] focus:border-[#e8882a] focus:outline-none focus:ring-1 focus:ring-[#e8882a] transition-all"
          />
          <p class="mt-1 text-[11px] text-faint-warm">
            Can include letters, numbers, spaces, dots, hyphens, and underscores.
          </p>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            class="rounded-xl border border-[#3a2410] bg-[#2a1a0c] px-4 py-2 text-xs font-semibold text-muted-warm hover:bg-[#3a2410] transition-colors"
            @click="handleClose"
          >
            Cancel
          </button>

          <button
            type="submit"
            class="inline-flex items-center gap-1.5 rounded-xl btn-amber px-4 py-2 text-xs font-semibold text-warm shadow-lg shadow-[#e8882a]/20 hover:from-[#f9a84a] hover:to-[#e8882a] transition-all disabled:opacity-50"
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
