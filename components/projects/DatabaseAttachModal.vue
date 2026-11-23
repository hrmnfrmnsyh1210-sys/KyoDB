<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <div
      class="fixed inset-0 modal-backdrop-warm backdrop-blur-sm transition-opacity"
      @click="$emit('close')"
    ></div>

    <div class="relative w-full max-w-md rounded-2xl border border-[#2e1c0d] bg-[#1a1007] shadow-2xl shadow-black/60 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-[#2e1c0d] px-6 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8882a]/10 border border-[#e8882a]/20 text-[#e8882a]">
            <Database class="h-4 w-4" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-white">Attach TiDB Database</h3>
            <p class="text-xs text-[#9b8674]">Associate a database with this project</p>
          </div>
        </div>

        <button
          class="p-1 rounded-lg text-[#9b8674] hover:text-[#f0e6d8] hover:bg-[#2a1a0c] transition-colors"
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
            :class="mode === 'create' ? 'border-[#e8882a]/60 bg-[#e8882a]/10 text-[#f9a84a]' : 'border-[#2e1c0d] bg-[#1c1208] text-[#9b8674] hover:border-[#3a2410]'"
            @click="mode = 'create'"
          >
            Create New Database
          </button>
          <button
            type="button"
            class="p-2.5 rounded-xl border text-xs font-medium transition-all text-center"
            :class="mode === 'attach' ? 'border-[#e8882a]/60 bg-[#e8882a]/10 text-[#f9a84a]' : 'border-[#2e1c0d] bg-[#1c1208] text-[#9b8674] hover:border-[#3a2410]'"
            @click="mode = 'attach'"
          >
            Attach Existing
          </button>
        </div>

        <!-- Mode = Create New -->
        <div v-if="mode === 'create'" class="space-y-2">
          <label class="block text-xs font-medium text-[#d6c6b4]">
            New Logical Database Name <span class="text-[#e8882a]">*</span>
          </label>
          <input
            v-model="databaseName"
            type="text"
            required
            placeholder="e.g. app_production_db"
            class="w-full rounded-xl border border-[#3a2410] bg-[#120a04] px-3.5 py-2.5 text-xs font-mono text-[#f9a84a] placeholder-[#6a5545] focus:border-[#e8882a] focus:outline-none focus:ring-1 focus:ring-[#e8882a] transition-all"
          />
          <p class="text-[11px] text-[#6a5545]">
            Will be created directly in your TiDB Cloud cluster with <code class="text-[#9b8674] font-mono">utf8mb4</code> collation.
          </p>
        </div>

        <!-- Mode = Attach Existing -->
        <div v-if="mode === 'attach'" class="space-y-2">
          <label class="block text-xs font-medium text-[#d6c6b4]">
            Select Existing Database <span class="text-[#e8882a]">*</span>
          </label>
          <select
            v-model="databaseName"
            required
            class="w-full rounded-xl border border-[#3a2410] bg-[#120a04] px-3.5 py-2.5 text-xs font-mono text-[#f9a84a] focus:border-[#e8882a] focus:outline-none focus:ring-1 focus:ring-[#e8882a] transition-all"
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
          <p class="text-[11px] text-[#6a5545]">
            Lists all databases found in the TiDB cluster (excluding system metadata).
          </p>
        </div>

        <!-- Actions -->
        <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-[#2e1c0d]">
          <button
            type="button"
            class="rounded-xl border border-[#3a2410] px-4 py-2 text-xs font-medium text-[#d6c6b4] hover:bg-[#2a1a0c] hover:text-[#f0e6d8] transition-colors"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !databaseName.trim()"
            class="inline-flex items-center gap-2 rounded-xl btn-amber px-5 py-2 text-xs font-semibold text-[#1a1007] shadow-lg shadow-[#e8882a]/20 hover:bg-[#f9a84a] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
