<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity" @click="$emit('close')"></div>

    <div class="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-neutral-100 px-6 py-4 bg-neutral-50/50">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#144e35] border border-emerald-200/60">
            <Table class="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-neutral-900">Create Table</h3>
            <p class="text-xs text-neutral-500">Target database: <code class="text-[#144e35] font-mono font-semibold">{{ databaseName }}</code></p>
          </div>
        </div>
        <button class="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors" @click="$emit('close')">
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Error Message Banner -->
      <div v-if="errorMessage" class="m-6 mb-0 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start gap-2">
        <AlertTriangle class="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form Body (Scrollable) -->
      <form class="flex-1 overflow-y-auto p-6 space-y-5" @submit.prevent="handleSubmit">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-neutral-700 mb-1.5">
              Table Name <span class="text-[#144e35]">*</span>
            </label>
            <input
              v-model="tableName"
              type="text"
              required
              placeholder="e.g. users, products, orders"
              class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs font-mono text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#144e35] focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Table Comment (Optional)</label>
            <input
              v-model="comment"
              type="text"
              placeholder="e.g. User accounts and auth credentials"
              class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#144e35] focus:outline-none"
            />
          </div>
        </div>

        <!-- Columns Section -->
        <div>
          <div class="flex items-center justify-between mb-3">
            <h4 class="text-xs font-bold text-neutral-900 uppercase tracking-wider">Columns Definition</h4>
            <button
              type="button"
              class="inline-flex items-center gap-1.5 text-xs text-[#144e35] hover:text-[#0f3d2a] font-semibold"
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
              class="grid grid-cols-12 gap-2 items-center rounded-xl border border-neutral-200 bg-neutral-50 p-2.5"
            >
              <!-- Name -->
              <div class="col-span-3">
                <input
                  v-model="col.name"
                  type="text"
                  required
                  placeholder="name"
                  class="w-full rounded-lg border border-neutral-200 bg-white px-2.5 py-1.5 text-xs font-mono text-neutral-900 placeholder-neutral-400 focus:border-[#144e35] focus:outline-none"
                />
              </div>

              <!-- Type -->
              <div class="col-span-2">
                <select
                  v-model="col.type"
                  class="w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs font-mono text-neutral-900 focus:border-[#144e35] focus:outline-none"
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
                  class="w-full rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-xs font-mono text-neutral-700 placeholder-neutral-400 focus:border-[#144e35] focus:outline-none"
                />
              </div>

              <!-- Nullable / PK / AI Checkboxes -->
              <div class="col-span-4 flex items-center gap-3 text-[11px] text-neutral-700">
                <label class="flex items-center gap-1 cursor-pointer">
                  <input v-model="col.nullable" type="checkbox" class="accent-[#144e35]" />
                  <span>Null</span>
                </label>
                <label class="flex items-center gap-1 cursor-pointer">
                  <input v-model="col.primaryKey" type="checkbox" class="accent-[#144e35]" />
                  <span class="font-bold text-amber-600">PK</span>
                </label>
                <label class="flex items-center gap-1 cursor-pointer">
                  <input v-model="col.autoIncrement" type="checkbox" class="accent-[#144e35]" />
                  <span class="font-bold text-[#144e35]">A_I</span>
                </label>
              </div>

              <!-- Remove Column -->
              <div class="col-span-1 flex justify-end">
                <button
                  type="button"
                  class="p-1 text-neutral-400 hover:text-rose-600 disabled:opacity-30 transition-colors"
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
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            class="btn-white-pill px-4 py-2 text-xs font-semibold"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting || !tableName.trim() || columns.length === 0"
            class="btn-forest inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold"
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

interface ColumnDef {
  name: string
  type: string
  length: string
  nullable: boolean
  primaryKey: boolean
  autoIncrement: boolean
}

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

const columns = ref<ColumnDef[]>([
  { name: 'id', type: 'BIGINT', length: '', nullable: false, primaryKey: true, autoIncrement: true },
  { name: 'created_at', type: 'TIMESTAMP', length: '', nullable: false, primaryKey: false, autoIncrement: false }
])

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      tableName.value = ''
      comment.value = ''
      errorMessage.value = null
      columns.value = [
        { name: 'id', type: 'BIGINT', length: '', nullable: false, primaryKey: true, autoIncrement: true },
        { name: 'created_at', type: 'TIMESTAMP', length: '', nullable: false, primaryKey: false, autoIncrement: false }
      ]
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
    const formattedColumns = columns.value.map((col) => ({
      name: col.name.trim(),
      type: col.type,
      length: col.length ? parseInt(col.length, 10) : undefined,
      nullable: col.nullable,
      primaryKey: col.primaryKey,
      autoIncrement: col.autoIncrement
    }))

    const res = await createTable(props.databaseName, tableName.value.trim(), formattedColumns)
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
