<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <div
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      @click="$emit('close')"
    ></div>

    <div class="relative w-full max-w-md rounded-2xl border border-slate-800 bg-[#0c121e] shadow-2xl shadow-black/60 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Database class="h-4 w-4" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-white">Attach TiDB Database</h3>
            <p class="text-xs text-slate-400">Associate a database with this project</p>
          </div>
        </div>

        <button
          class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          @click="$emit('close')"
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
        <!-- Mode choice -->
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="p-2.5 rounded-xl border text-xs font-medium transition-all text-center"
            :class="mode === 'create' ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'"
            @click="mode = 'create'"
          >
            Create New Database
          </button>
          <button
            type="button"
            class="p-2.5 rounded-xl border text-xs font-medium transition-all text-center"
            :class="mode === 'attach' ? 'border-cyan-500/60 bg-cyan-950/30 text-cyan-300' : 'border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700'"
            @click="mode = 'attach'"
          >
            Attach Existing
          </button>
        </div>

        <!-- Mode = Create New -->
        <div v-if="mode === 'create'" class="space-y-2">
          <label class="block text-xs font-medium text-slate-300">
            New Logical Database Name <span class="text-cyan-400">*</span>
          </label>
          <input
            v-model="databaseName"
            type="text"
            required
            placeholder="e.g. app_production_db"
            class="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          <p class="text-[11px] text-slate-500">
            Will be created directly in your TiDB Cloud cluster with <code class="text-slate-400 font-mono">utf8mb4</code> collation.
          </p>
        </div>

        <!-- Mode = Attach Existing -->
        <div v-if="mode === 'attach'" class="space-y-2">
          <label class="block text-xs font-medium text-slate-300">
            Select Existing Database <span class="text-cyan-400">*</span>
          </label>
          <select
            v-model="databaseName"
            required
            class="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
          >
            <option value="" disabled>-- Choose available database --</option>
            <option
              v-for="db in availableDatabases"
              :key="db.databaseName"
              :value="db.databaseName"
              :disabled="db.isAssociated"
            >
              {{ db.databaseName }} {{ db.isAssociated ? `(attached to ${db.associatedProjectName})` : '' }}
            </option>
          </select>
          <p class="text-[11px] text-slate-500">
            Lists all databases found in the TiDB cluster (excluding system metadata).
          </p>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            class="rounded-xl border border-slate-700/80 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !databaseName.trim()"
            class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw v-if="isSubmitting" class="h-3.5 w-3.5 animate-spin" />
            <span>{{ mode === 'create' ? 'Create & Attach' : 'Attach Database' }}</span>
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
  projectId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'attached'): void
}>()

const { attachDatabase, fetchAvailableDatabases, availableDatabases } = useProjects()

const mode = ref<'create' | 'attach'>('create')
const databaseName = ref('')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      databaseName.value = ''
      errorMessage.value = null
      mode.value = 'create'
      fetchAvailableDatabases()
    }
  }
)

const handleSubmit = async () => {
  if (!databaseName.value.trim()) return

  isSubmitting.value = true
  errorMessage.value = null

  try {
    const res = await attachDatabase(props.projectId, {
      databaseName: databaseName.value.trim(),
      createNew: mode.value === 'create'
    })

    if (res.success) {
      emit('attached')
      emit('close')
    } else {
      errorMessage.value = res.error || 'Failed to attach database'
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'An unexpected error occurred'
  } finally {
    isSubmitting.value = false
  }
}
</script>
