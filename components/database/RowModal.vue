<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" @click="$emit('close')"></div>

    <div class="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-slate-800 bg-[#0c121e] shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
        <h3 class="text-base font-semibold text-white">
          {{ isEditing ? 'Edit Record' : 'Insert New Record' }}
        </h3>
        <button class="p-1 rounded-lg text-slate-400 hover:text-white" @click="$emit('close')">
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Error Message Banner -->
      <div v-if="errorMessage" class="m-6 mb-0 rounded-xl bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-300 flex items-start gap-2">
        <AlertTriangle class="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form Body -->
      <form class="flex-1 overflow-y-auto p-6 space-y-4" @submit.prevent="handleSubmit">
        <div v-for="col in columns" :key="col.name" class="space-y-1">
          <div class="flex items-center justify-between">
            <label class="text-xs font-medium text-slate-300 flex items-center gap-1.5">
              <span>{{ col.name }}</span>
              <span v-if="col.key === 'PRI'" class="text-[10px] text-amber-400 font-bold">(PK)</span>
              <span v-if="!col.nullable && !col.extra.includes('auto_increment')" class="text-cyan-400">*</span>
            </label>
            <span class="text-[10px] text-slate-500 font-mono">{{ col.type }}</span>
          </div>

          <!-- Auto Increment hint -->
          <div v-if="!isEditing && col.extra.includes('auto_increment')" class="text-[11px] text-slate-500 italic">
            Auto-generated on insert
          </div>

          <!-- Input Field -->
          <div v-else>
            <textarea
              v-if="col.type.toLowerCase().includes('text') || col.type.toLowerCase().includes('json')"
              v-model="formData[col.name]"
              rows="3"
              class="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none"
            ></textarea>
            <input
              v-else
              v-model="formData[col.name]"
              :disabled="isEditing && col.key === 'PRI'"
              type="text"
              class="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:border-cyan-500 focus:outline-none disabled:opacity-50"
            />
          </div>
        </div>

        <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            class="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 disabled:opacity-50"
          >
            <RefreshCw v-if="isSubmitting" class="h-3.5 w-3.5 animate-spin" />
            <span>{{ isEditing ? 'Save Changes' : 'Insert Row' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { X, AlertTriangle, RefreshCw } from '@lucide/vue'
import type { TableColumn } from '~/types'

const props = defineProps<{
  isOpen: boolean
  databaseName: string
  tableName: string
  columns: TableColumn[]
  rowToEdit?: Record<string, any> | null
  primaryKey?: string | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved'): void
}>()

const { insertRow, updateRow } = useDatabases()

const isEditing = computed(() => !!props.rowToEdit)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const formData = reactive<Record<string, any>>({})

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMessage.value = null
      Object.keys(formData).forEach((k) => delete formData[k])

      if (props.rowToEdit) {
        props.columns.forEach((col) => {
          formData[col.name] = props.rowToEdit?.[col.name] ?? ''
        })
      } else {
        props.columns.forEach((col) => {
          if (!col.extra.includes('auto_increment')) {
            formData[col.name] = col.default ?? ''
          }
        })
      }
    }
  }
)

const handleSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = null

  try {
    if (isEditing.value && props.primaryKey && props.rowToEdit) {
      const pkVal = props.rowToEdit[props.primaryKey]
      const res = await updateRow(props.databaseName, props.tableName, props.primaryKey, pkVal, formData)
      if (res.success) {
        emit('saved')
        emit('close')
      } else {
        errorMessage.value = res.error || 'Failed to update record'
      }
    } else {
      const payload: Record<string, any> = {}
      props.columns.forEach((col) => {
        if (!col.extra.includes('auto_increment') && formData[col.name] !== undefined && formData[col.name] !== '') {
          payload[col.name] = formData[col.name]
        }
      })

      const res = await insertRow(props.databaseName, props.tableName, payload)
      if (res.success) {
        emit('saved')
        emit('close')
      } else {
        errorMessage.value = res.error || 'Failed to insert record'
      }
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'An unexpected error occurred'
  } finally {
    isSubmitting.value = false
  }
}
</script>
