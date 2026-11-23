<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" @click="$emit('close')"></div>

    <div class="relative w-full max-w-md rounded-2xl border border-red-500/30 bg-[#0c121e] shadow-2xl p-6 overflow-hidden">
      <div class="flex items-center gap-3 mb-4">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
          <Trash2 class="h-5 w-5" />
        </div>
        <div>
          <h3 class="text-base font-semibold text-white">{{ title }}</h3>
          <p class="text-xs text-slate-400">Irreversible destructive operation</p>
        </div>
      </div>

      <div v-if="errorMessage" class="mb-4 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-300">
        {{ errorMessage }}
      </div>

      <p class="text-xs text-slate-300 leading-relaxed mb-6">
        {{ description }}
      </p>

      <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
        <button
          type="button"
          class="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="isSubmitting"
          class="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/20 hover:bg-red-500 disabled:opacity-50"
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
  action: () => Promise<{ success: boolean; error?: string }>
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'confirmed'): void
}>()

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

watch(
  () => props.isOpen,
  (open) => {
    if (open) errorMessage.value = null
  }
)

const handleConfirm = async () => {
  isSubmitting.value = true
  errorMessage.value = null
  try {
    const res = await props.action()
    if (res.success) {
      emit('confirmed')
      emit('close')
    } else {
      errorMessage.value = res.error || 'Operation failed'
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'Operation failed'
  } finally {
    isSubmitting.value = false
  }
}
</script>
