<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity"
      @click="handleClose"
    ></div>

    <!-- Modal Box -->
    <div class="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-neutral-100 px-6 py-4 bg-neutral-50/50">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/60 text-[#144e35]">
            <FolderPlus class="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-neutral-900">Create Virtual Folder</h3>
            <p class="text-xs text-neutral-500">
              Virtual directory prefix in Cloudflare R2
            </p>
          </div>
        </div>

        <button
          class="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          @click="handleClose"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Error Message Banner -->
      <div v-if="errorMessage" class="m-6 mb-0 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-start gap-2.5">
        <AlertTriangle class="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
        <div class="flex-1">{{ errorMessage }}</div>
      </div>

      <!-- Form Body -->
      <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
        <!-- Current Path context -->
        <div class="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-xs">
          <div class="text-[11px] font-semibold text-neutral-500 mb-1">Parent Location</div>
          <div class="font-mono text-neutral-900 font-bold truncate">
            /{{ currentPrefix || 'root' }}
          </div>
        </div>

        <!-- Folder Name -->
        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5">
            Folder Name <span class="text-[#144e35]">*</span>
          </label>
          <input
            v-model="folderName"
            type="text"
            required
            placeholder="e.g. assets, invoices, uploads"
            class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#144e35] focus:outline-none transition-all"
            @input="errorMessage = null"
          />
          <p class="mt-1 text-[11px] text-neutral-400">
            Letters, numbers, dashes, underscores only. No slashes or dots.
          </p>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            class="btn-white-pill px-4 py-2 text-xs font-semibold"
            @click="handleClose"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !folderName.trim()"
            class="btn-forest inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold"
          >
            <RefreshCw v-if="isSubmitting" class="h-3.5 w-3.5 animate-spin" />
            <span>Create Folder</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FolderPlus, X, AlertTriangle, RefreshCw } from '@lucide/vue'

const props = defineProps<{
  isOpen: boolean
  currentPrefix: string
  currentProjectId?: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created'): void
}>()

const folderName = ref('')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      folderName.value = ''
      errorMessage.value = null
    }
  }
)

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  const trimmed = folderName.value.trim()
  if (!trimmed) return

  isSubmitting.value = true
  errorMessage.value = null

  try {
    const res = await $fetch<{ success: boolean; data?: any; error?: string }>('/api/storage/folder', {
      method: 'POST',
      body: {
        folderName: trimmed,
        prefix: props.currentPrefix || '',
        projectId: props.currentProjectId || undefined
      }
    })

    if (res.success) {
      emit('created')
      emit('close')
    } else {
      errorMessage.value = res.error || 'Failed to create folder'
    }
  } catch (err: any) {
    errorMessage.value = err.data?.message || err.message || 'Failed to create folder'
  } finally {
    isSubmitting.value = false
  }
}
</script>
