<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div class="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity" @click="$emit('close')"></div>

    <div class="relative w-full max-w-lg max-h-[85vh] flex flex-col rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-neutral-100 px-6 py-4 bg-neutral-50/50">
        <h3 class="text-base font-bold text-neutral-900">
          {{ isEditing ? 'Edit Record' : 'Insert New Record' }}
        </h3>
        <button class="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors" @click="$emit('close')">
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Error Message Banner -->
      <div v-if="errorMessage" class="m-6 mb-0 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700 flex items-start gap-2">
        <AlertTriangle class="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
        <span>{{ errorMessage }}</span>
      </div>

      <!-- Form Body -->
      <form class="flex-1 overflow-y-auto p-6 space-y-4" @submit.prevent="handleSubmit">
        <div v-for="col in columns" :key="col.name" class="space-y-1">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-neutral-700 flex items-center gap-1.5">
              <span>{{ col.name }}</span>
              <span v-if="col.key === 'PRI'" class="text-[10px] text-amber-600 font-bold">(PK)</span>
              <span v-if="!col.nullable && !col.extra.includes('auto_increment')" class="text-[#144e35]">*</span>
            </label>
            <span class="text-[10px] text-neutral-400 font-mono">{{ col.type }}</span>
          </div>

          <!-- Auto Increment hint -->
          <div v-if="!isEditing && col.extra.includes('auto_increment')" class="text-[11px] text-neutral-400 italic">
            Auto-generated on insert
          </div>

          <!-- Input Field -->
          <div v-else>
            <textarea
              v-if="col.type.toLowerCase().includes('text') || col.type.toLowerCase().includes('json')"
              v-model="formData[col.name]"
              rows="3"
              class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-mono text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#144e35] focus:outline-none"
            ></textarea>
            <input
              v-else
              v-model="formData[col.name]"
              :disabled="isEditing && col.key === 'PRI'"
              type="text"
              class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs font-mono text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#144e35] focus:outline-none disabled:bg-neutral-100 disabled:text-neutral-400"
            />
          </div>
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
            :disabled="isSubmitting"
            class="btn-forest inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold"
          >
            <RefreshCw v-if="isSubmitting" class="h-3.5 w-3.5 animate-spin" />
            <span>{{ isEditing ? 'Save Changes' : 'Insert Record' }}</span>
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
  isEditing: boolean
  columns: TableColumn[]
  initialData?: Record<string, any> | null
  primaryKeyCol?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: Record<string, any>): void
}>()

const formData = ref<Record<string, any>>({})
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMessage.value = null
      if (props.isEditing && props.initialData) {
        formData.value = { ...props.initialData }
      } else {
        const fresh: Record<string, any> = {}
        props.columns.forEach((col) => {
          if (!col.extra.includes('auto_increment')) {
            fresh[col.name] = col.default ?? ''
          }
        })
        formData.value = fresh
      }
    }
  }
)

const handleSubmit = () => {
  emit('save', { ...formData.value })
}
</script>
