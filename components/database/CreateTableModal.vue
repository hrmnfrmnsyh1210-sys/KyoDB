<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" @click="$emit('close')"></div>

    <div class="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-[#0c121e] shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-cyan-400">
            <Table class="h-4 w-4" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-white">Create Table</h3>
            <p class="text-xs text-slate-400">Target database: <code class="text-cyan-400 font-mono">{{ databaseName }}</code></p>
          </div>
        </div>
        <button class="p-1 rounded-lg text-slate-400 hover:text-white" @click="$emit('close')">
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Error Message Banner -->
      <div v-if="errorMessage" class="m-6 mb-0 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-300 flex items-start gap-2">
        <AlertTriangle class="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form Body (Scrollable) -->
      <form class="flex-1 overflow-y-auto p-6 space-y-5" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">
              Table Name <span class="text-cyan-400">*</span>
            </label>
            <input
              v-model="tableName"
              type="text"
              required
              placeholder="e.g. users, products, orders"
              class="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-medium text-slate-300 mb-1.5">Table Comment (Optional)</label>
            <input
              v-model="comment"
              type="text"
              placeholder="e.g. User accounts and auth credentials"
              class="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>
        </div>

        <!-- Columns Section -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-xs font-semibold text-slate-200 uppercase tracking-wider">Columns Definition</h4>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              @click="addColumn"
            >
              <Plus class="h-3.5 w-3.5" />
              <span>Add Column</span>
            </button>
          </div>

          <div class="space-y-2">
            <div
              v-for="(col, idx) in columns"
              :key="idx"
              class="grid grid-cols-12 gap-2 items-center rounded-xl border border-slate-800 bg-slate-900/60 p-2.5"
            >
              <!-- Name -->
              <div class="col-span-3">
                <input
                  v-model="col.name"
                  type="text"
                  required
                  placeholder="name"
                  class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-mono text-cyan-300 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <!-- Type -->
              <div class="col-span-2">
                <select
                  v-model="col.type"
                  class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
                >
                  <option value="INT">INT</option>
                  <option value="BIGINT">BIGINT</option>
                  <option value="VARCHAR">VARCHAR</option>
                  <option value="TEXT">TEXT</option>
                  <option value="TIMESTAMP">TIMESTAMP</option>
                  <option value="DATETIME">DATETIME</option>
                  <option value="BOOLEAN">BOOLEAN</option>
                  <option value="JSON">JSON</option>
                  <option value="DECIMAL">DECIMAL</option>
                </select>
              </div>

              <!-- Length -->
              <div class="col-span-2">
                <input
                  v-model="col.length"
                  type="text"
                  placeholder="length (e.g. 255)"
                  class="w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs font-mono text-slate-300 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <!-- Nullable / PK / AI Checkboxes -->
              <div class="col-span-4 flex items-center gap-3 text-[11px] text-slate-300">
                <label class="flex items-center gap-1 cursor-pointer">
                  <input v-model="col.nullable" type="checkbox" class="accent-cyan-400" />
                  <span>Null</span>
                </label>
                <label class="flex items-center gap-1 cursor-pointer">
                  <input v-model="col.primaryKey" type="checkbox" class="accent-cyan-400" />
                  <span class="font-bold text-amber-400">PK</span>
                </label>
                <label class="flex items-center gap-1 cursor-pointer">
                  <input v-model="col.autoIncrement" type="checkbox" class="accent-cyan-400" />
                  <span class="text-blue-400">A_I</span>
                </label>
              </div>

              <!-- Remove Column -->
              <div class="col-span-1 flex justify-end">
                <button
                  type="button"
                  class="p-1 text-slate-500 hover:text-red-400 disabled:opacity-30"
                  :disabled="columns.length <= 1"
                  @click="removeColumn(idx)"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            class="rounded-xl border border-slate-700/80 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !tableName.trim() || columns.length === 0"
            class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50"
          >
            <RefreshCw v-if="isSubmitting" class="h-3.5 w-3.5 animate-spin" />
            <span>Create Table</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Table, X, AlertTriangle, Plus, Trash2, RefreshCw } from '@lucide/vue'

const props = defineProps<{
  isOpen: boolean
  databaseName: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'created', tableName: string): void
}>()

const { createTable } = useDatabases()

const tableName = ref('')
const comment = ref('')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

interface ColForm {
  name: string
  type: string
  length: string
  nullable: boolean
  primaryKey: boolean
  autoIncrement: boolean
  defaultValue?: string
}

const defaultColumns = (): ColForm[] => [
  { name: 'id', type: 'BIGINT', length: '20', nullable: false, primaryKey: true, autoIncrement: true },
  { name: 'created_at', type: 'TIMESTAMP', length: '', nullable: false, primaryKey: false, autoIncrement: false, defaultValue: 'CURRENT_TIMESTAMP' }
]

const columns = ref<ColForm[]>(defaultColumns())

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      tableName.value = ''
      comment.value = ''
      columns.value = defaultColumns()
      errorMessage.value = null
    }
  }
)

const addColumn = () => {
  columns.value.push({
    name: '',
    type: 'VARCHAR',
    length: '255',
    nullable: true,
    primaryKey: false,
    autoIncrement: false
  })
}

const removeColumn = (index: number) => {
  if (columns.value.length > 1) {
    columns.value.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (!tableName.value.trim() || columns.value.length === 0) return
  isSubmitting.value = true
  errorMessage.value = null

  try {
    const payload = {
      tableName: tableName.value.trim(),
      comment: comment.value.trim() || undefined,
      columns: columns.value.map((c) => ({
        name: c.name.trim(),
        type: c.type,
        length: c.length ? c.length.trim() : undefined,
        nullable: c.nullable,
        primaryKey: c.primaryKey,
        autoIncrement: c.autoIncrement,
        defaultValue: c.defaultValue
      }))
    }

    const res = await createTable(props.databaseName, payload)
    if (res.success) {
      emit('created', tableName.value.trim())
      emit('close')
    } else {
      errorMessage.value = res.error || 'Failed to create table'
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'An unexpected error occurred'
  } finally {
    isSubmitting.value = false
  }
}
</script>
