<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity"
      @click="$emit('close')"
    ></div>

    <!-- Modal Box -->
    <div class="relative w-full max-w-md rounded-2xl border border-rose-200 bg-white shadow-2xl overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-neutral-100 px-6 py-4 bg-neutral-50/50">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
            <Trash2 class="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-neutral-900">Delete Object(s)</h3>
            <p class="text-xs text-rose-600">
              Permanent removal from Cloudflare R2
            </p>
          </div>
        </div>

        <button
          class="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          @click="$emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Warning Body -->
      <div class="p-6 space-y-4">
        <div class="rounded-xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-800 flex items-start gap-3">
          <AlertTriangle class="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <span class="font-bold text-rose-900">Warning: This action is permanent!</span>
            <p class="text-neutral-700">
              Deleting these items will remove them immediately from Cloudflare R2 bucket storage and metadata tracking.
            </p>
          </div>
        </div>

        <!-- Selected Items Preview -->
        <div class="space-y-2">
          <div class="text-xs font-semibold text-neutral-700">
            Items to be deleted ({{ items.length }}):
          </div>
          <div class="max-h-32 overflow-y-auto rounded-xl border border-neutral-200 bg-neutral-50 p-2 space-y-1">
            <div
              v-for="item in items"
              :key="item.key"
              class="flex items-center justify-between text-[11px] font-mono py-1 px-2 rounded hover:bg-neutral-100"
            >
              <span class="truncate text-neutral-800 max-w-[220px]" :title="item.name">{{ item.name }}</span>
              <span class="text-neutral-400 uppercase text-[10px] shrink-0 ml-2">{{ item.type }}</span>
            </div>
          </div>
        </div>

        <!-- Error display -->
        <div v-if="errorMessage" class="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {{ errorMessage }}
        </div>

        <!-- Actions -->
        <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            class="btn-white-pill px-4 py-2 text-xs font-semibold"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="isDeleting"
            class="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 text-xs font-semibold text-white shadow-sm disabled:opacity-50 transition-colors"
            @click="handleConfirm"
          >
            <RefreshCw v-if="isDeleting" class="h-3.5 w-3.5 animate-spin" />
            <span>{{ isDeleting ? 'Deleting...' : 'Confirm Delete' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trash2, X, AlertTriangle, RefreshCw } from '@lucide/vue'
import type { StorageItem } from '~/types'

const props = defineProps<{
  isOpen: boolean
  items: StorageItem[]
  isDeleting?: boolean
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
