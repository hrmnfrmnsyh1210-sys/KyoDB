<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 modal-backdrop-warm backdrop-blur-sm transition-opacity"
      @click="$emit('close')"
    ></div>

    <!-- Modal Box -->
    <div class="relative w-full max-w-md rounded-2xl border border-red-500/20 bg-[#1a1007] shadow-2xl shadow-red-950/30 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-[#2e1c0d] px-6 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            <Trash2 class="h-4 w-4" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-white">Delete Object(s)</h3>
            <p class="text-xs text-[#9b8674]">
              Permanent removal from Cloudflare R2
            </p>
          </div>
        </div>

        <button
          class="p-1 rounded-lg text-[#9b8674] hover:text-[#f0e6d8] hover:bg-[#2a1a0c] transition-colors"
          @click="$emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Warning Body -->
      <div class="p-6 space-y-4">
        <div class="rounded-xl border border-red-500/20 bg-red-950/20 p-4 text-xs text-red-300 flex items-start gap-3">
          <AlertTriangle class="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
          <div class="space-y-1">
            <span class="font-semibold text-red-200">Warning: This action is permanent!</span>
            <p class="text-[#d6c6b4]">
              Deleting these items will remove them immediately from Cloudflare R2 bucket storage and metadata tracking.
            </p>
          </div>
        </div>

        <!-- Target List Preview -->
        <div class="space-y-2">
          <div class="text-xs text-[#9b8674]">
            Target Item(s) to Delete ({{ items.length }}):
          </div>
          <div class="max-h-40 overflow-y-auto space-y-1 rounded-xl border border-[#2e1c0d] bg-[#1c1208] p-2.5 text-xs font-mono">
            <div
              v-for="(item, idx) in items"
              :key="idx"
              class="flex items-center gap-2 text-[#d6c6b4] truncate"
            >
              <Folder v-if="item.type === 'folder'" class="h-3.5 w-3.5 text-[#e8882a] shrink-0" />
              <File v-else class="h-3.5 w-3.5 text-[#9b8674] shrink-0" />
              <span class="truncate" :title="item.key">{{ item.name || item.key }}</span>
            </div>
          </div>
        </div>

        <!-- Confirmation Checkbox -->
        <label class="flex items-center gap-2 text-xs text-[#d6c6b4] cursor-pointer pt-1">
          <input
            v-model="isConfirmed"
            type="checkbox"
            class="rounded border-[#3a2410] bg-[#1c1208] text-red-500 focus:ring-red-500/30"
          />
          <span>I understand that this action cannot be undone.</span>
        </label>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            class="rounded-xl border border-[#3a2410] bg-[#2a1a0c] px-4 py-2 text-xs font-semibold text-[#d6c6b4] hover:bg-[#3a2410] transition-colors"
            @click="$emit('close')"
          >
            Cancel
          </button>

          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-red-600/30 hover:bg-red-500 transition-all disabled:opacity-50"
            :disabled="!isConfirmed || isLoading"
            @click="handleDelete"
          >
            <Loader2 v-if="isLoading" class="h-3.5 w-3.5 animate-spin" />
            <Trash2 v-else class="h-3.5 w-3.5" />
            <span>{{ isLoading ? 'Deleting...' : `Delete ${items.length} Item(s)` }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Trash2, AlertTriangle, X, Folder, File, Loader2 } from '@lucide/vue'
import type { StorageItem } from '~/types'

const props = defineProps<{
  isOpen: boolean
  items: StorageItem[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'deleted'): void
}>()

const isConfirmed = ref(false)
const isLoading = ref(false)

async function handleDelete() {
  if (!isConfirmed.value || props.items.length === 0 || isLoading.value) return
  isLoading.value = true

  try {
    const keys = props.items.map((i) => i.key)
    await $fetch('/api/storage/delete', {
      method: 'POST',
      body: { keys }
    })

    isConfirmed.value = false
    emit('deleted')
    emit('close')
  } catch (err: any) {
    alert(err.data?.statusMessage || err.message || 'Failed to delete items')
  } finally {
    isLoading.value = false
  }
}
</script>
