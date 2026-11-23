<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" @click="$emit('close')"></div>

    <div class="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#0c121e] shadow-2xl overflow-hidden">
      <div class="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
            <Database class="h-4 w-4" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-white">Create Database</h3>
            <p class="text-xs text-slate-400">New logical database on TiDB Cloud</p>
          </div>
        </div>
        <button class="p-1 rounded-lg text-slate-400 hover:text-white" @click="$emit('close')">
          <X class="h-4 w-4" />
        </button>
      </div>

      <div v-if="errorMessage" class="m-6 mb-0 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-300 flex items-start gap-2">
        <AlertTriangle class="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
        <span>{{ errorMessage }}</span>
      </div>

      <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">
            Database Identifier <span class="text-cyan-400">*</span>
          </label>
          <input
            v-model="name"
            type="text"
            required
            placeholder="e.g. ecommerce_production"
            class="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500"
          />
          <p class="mt-1 text-[11px] text-slate-500">Only letters, numbers, and underscores (max 64 chars).</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">Character Set</label>
            <input
              v-model="charset"
              type="text"
              readonly
              class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-400 cursor-not-allowed"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">Collation</label>
            <input
              v-model="collation"
              type="text"
              readonly
              class="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>

        <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            class="rounded-xl border border-slate-700/80 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !name.trim()"
            class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50"
          >
            <RefreshCw v-if="isSubmitting" class="h-3.5 w-3.5 animate-spin" />
            <span>Create Database</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Database, X, AlertTriangle, RefreshCw } from '@lucide/vue'

const props = defineProps<{
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', name: string): void
}>()

const { createDatabase } = useDatabases()

const name = ref('')
const charset = ref('utf8mb4')
const collation = ref('utf8mb4_unicode_ci')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      name.value = ''
      errorMessage.value = null
    }
  }
)

const handleSubmit = async () => {
  if (!name.value.trim()) return
  isSubmitting.value = true
  errorMessage.value = null

  try {
    const res = await createDatabase(name.value.trim(), charset.value, collation.value)
    if (res.success) {
      emit('created', name.value.trim())
      emit('close')
    } else {
      errorMessage.value = res.error || 'Failed to create database'
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'An unexpected error occurred'
  } finally {
    isSubmitting.value = false
  }
}
</script>
