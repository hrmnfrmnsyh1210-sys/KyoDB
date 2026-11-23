<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
    <div
      class="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity"
      @click="$emit('close')"
    ></div>

    <div class="relative w-full max-w-md my-auto rounded-2xl border border-rose-200 bg-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden z-10">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-neutral-100 px-6 py-4 bg-neutral-50/70 shrink-0">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 border border-rose-200 text-rose-600">
            <Trash2 class="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-neutral-900">Delete Project</h3>
            <p class="text-xs text-rose-600">Destructive operation</p>
          </div>
        </div>

        <button
          class="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          @click="$emit('close')"
        >
          <X class="h-4 w-4" />
        </button>
      </div>

      <!-- Content (Scrollable) -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4 overscroll-contain">
        <!-- Error Message Banner -->
        <div v-if="errorMessage" class="rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-start gap-2.5">
          <AlertTriangle class="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
          <div class="flex-1">{{ errorMessage }}</div>
        </div>

        <p class="text-xs text-neutral-600 leading-relaxed">
          Are you sure you want to delete project <strong class="text-neutral-900">{{ project?.name }}</strong> (<code class="text-[#144e35] font-mono">{{ project?.slug }}</code>)?
        </p>

        <!-- Detach vs Drop options -->
        <div class="rounded-xl border border-neutral-200 bg-neutral-50 p-4 space-y-3">
          <div class="text-xs font-bold text-neutral-800">Attached Database Handling</div>

          <label class="flex items-start gap-2.5 cursor-pointer text-xs">
            <input
              v-model="deleteDatabase"
              type="checkbox"
              class="mt-0.5 rounded border-neutral-300 text-[#144e35] focus:ring-[#144e35]"
            />
            <div>
              <span class="font-semibold text-rose-700">Drop underlying TiDB database</span>
              <p class="text-[11px] text-neutral-500">
                If checked, permanently executes <code class="text-rose-600 font-mono">DROP DATABASE</code> on TiDB Cloud.
              </p>
            </div>
          </label>
        </div>
      </div>

      <!-- Actions (Fixed Footer) -->
      <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-100 bg-neutral-50/70 shrink-0">
        <button
          type="button"
          class="btn-white-pill px-4 py-2 text-xs font-semibold"
          @click="$emit('close')"
        >
          Cancel
        </button>
        <button
          type="button"
          :disabled="isSubmitting"
          class="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-5 py-2 text-xs font-semibold text-white shadow-xs disabled:opacity-50 transition-colors"
          @click="handleDelete"
        >
          <RefreshCw v-if="isSubmitting" class="h-3.5 w-3.5 animate-spin" />
          <span>{{ isSubmitting ? 'Deleting...' : 'Delete Project' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trash2, X, AlertTriangle, RefreshCw } from '@lucide/vue'
import type { Project } from '~/types'

const props = defineProps<{
  isOpen: boolean
  project?: Project | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'deleted', projectId: string): void
}>()

const { deleteProject } = useProjects()

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const deleteDatabase = ref(false)

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      deleteDatabase.value = false
      errorMessage.value = null
    }
  }
)

const handleDelete = async () => {
  if (!props.project) return

  isSubmitting.value = true
  errorMessage.value = null

  try {
    const res = await deleteProject(props.project.id, deleteDatabase.value)
    if (res.success) {
      emit('deleted', props.project.id)
      emit('close')
    } else {
      errorMessage.value = res.error || 'Failed to delete project'
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'An unexpected error occurred'
  } finally {
    isSubmitting.value = false
  }
}
</script>
