<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity" @click="$emit('close')"></div>

    <div class="relative w-full max-w-md rounded-2xl border border-rose-200 bg-white shadow-2xl p-6 overflow-hidden">
      <div class="flex items-center gap-3 mb-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600 border border-rose-200">
          <Trash2 class="h-5 w-5" />
        </div>
        <div>
          <h3 class="text-base font-bold text-neutral-900">{{ title }}</h3>
          <p class="text-xs text-rose-600">Irreversible destructive operation</p>
        </div>
      </div>

      <div v-if="errorMessage" class="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
        {{ errorMessage }}
      </div>

      <p class="text-xs text-neutral-600 leading-relaxed mb-6">
        {{ description }}
      </p>

      <div class="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
        <button
          type="button"
          class="btn-white-pill px-4 py-2 text-xs font-semibold"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="isSubmitting"
          class="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-50 transition-colors"
          @click="handleConfirm"
        >
          <RefreshCw v-if="isSubmitting" class="h-3.5 w-3.5 animate-spin" />
          <span>{{ confirmButtonText || 'Confirm Delete' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trash2, RefreshCw } from '@lucide/vue'

const props = defineProps<{
  isOpen: boolean
  title: string
  description: string
  confirmButtonText?: string
  isSubmitting?: boolean
  errorMessage?: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirm'): void
}>()

const handleConfirm = () => {
  emit('confirm')
}
</script>
