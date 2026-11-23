<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <div
      class="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity"
      @click="$emit('close')"
    ></div>

    <div class="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-neutral-100 px-6 py-4 bg-neutral-50/50">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-200/60 text-[#144e35]">
            <Database class="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-neutral-900">Attach TiDB Database</h3>
            <p class="text-xs text-neutral-500">Associate a database with this project</p>
          </div>
        </div>

        <button
          class="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          @click="$emit('close')"
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
        <!-- Mode choice -->
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            class="p-2.5 text-xs rounded-xl border text-center transition-all font-semibold"
            :class="mode === 'existing' ? 'border-[#144e35] bg-emerald-50 text-[#144e35]' : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'"
            @click="mode = 'existing'"
          >
            Existing Database
          </button>
          <button
            type="button"
            class="p-2.5 text-xs rounded-xl border text-center transition-all font-semibold"
            :class="mode === 'new' ? 'border-[#144e35] bg-emerald-50 text-[#144e35]' : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:bg-neutral-100'"
            @click="mode = 'new'"
          >
            Create New
          </button>
        </div>

        <!-- Mode Existing -->
        <div v-if="mode === 'existing'" class="space-y-1">
          <label class="block text-xs font-semibold text-neutral-700 mb-1">Select Available Database</label>
          <select
            v-model="selectedDatabase"
            class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs font-mono text-neutral-900 focus:bg-white focus:border-[#144e35] focus:outline-none"
          >
            <option value="" disabled>-- Select database --</option>
            <option
              v-for="db in availableDatabases"
              :key="db.databaseName"
              :value="db.databaseName"
              :disabled="db.isAssociated"
            >
              {{ db.databaseName }} {{ db.isAssociated ? `(already used by ${db.associatedProjectName})` : '' }}
            </option>
          </select>
        </div>

        <!-- Mode New -->
        <div v-else class="space-y-1">
          <label class="block text-xs font-semibold text-neutral-700 mb-1">New Database Identifier</label>
          <input
            v-model="newDatabaseName"
            type="text"
            placeholder="e.g. ecommerce_db"
            class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs font-mono text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#144e35] focus:outline-none"
          />
          <p class="text-[11px] text-neutral-400">Letters, numbers, underscores only (max 64 chars).</p>
        </div>

        <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            class="btn-white-pill px-4 py-2 text-xs font-semibold"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || (mode === 'existing' ? !selectedDatabase : !newDatabaseName.trim())"
            class="btn-forest inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold"
          >
            <RefreshCw v-if="isSubmitting" class="h-3.5 w-3.5 animate-spin" />
            <span>Attach Database</span>
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

const mode = ref<'existing' | 'new'>('existing')
const selectedDatabase = ref('')
const newDatabaseName = ref('')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      mode.value = 'existing'
      selectedDatabase.value = ''
      newDatabaseName.value = ''
      errorMessage.value = null
      await fetchAvailableDatabases()
    }
  }
)

const handleSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = null

  try {
    const dbName = mode.value === 'existing' ? selectedDatabase.value : newDatabaseName.value.trim()
    const isNew = mode.value === 'new'

    const res = await attachDatabase(props.projectId, dbName, isNew)
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
