<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <div
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      @click="$emit('close')"
    ></div>

    <div class="relative w-full max-w-md rounded-2xl border border-red-500/30 bg-[#0c121e] shadow-2xl shadow-red-950/20 overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
            <Trash2 class="h-4 w-4" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-white">Delete Project</h3>
            <p class="text-xs text-slate-400">Destructive operation</p>
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

      <!-- Warning & Content -->
      <div class="p-6 space-y-4">
        <p class="text-xs text-slate-300 leading-relaxed">
          Are you sure you want to delete project <strong class="text-white">{{ project?.name }}</strong> (<code class="text-cyan-400 font-mono">{{ project?.slug }}</code>)?
        </p>

        <div class="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-300 space-y-1">
          <div class="font-semibold flex items-center gap-1.5">
            <AlertTriangle class="h-3.5 w-3.5" />
            <span>Scope & Associations</span>
          </div>
          <p class="text-[11px] text-amber-200/80 leading-relaxed">
            Deleting this project will remove its configuration, storage scope links, and API associations.
          </p>
        </div>

        <!-- Optional database drop checkbox -->
        <label
          v-if="project?.databasesCount && project.databasesCount > 0"
          class="flex items-start gap-3 p-3 rounded-xl border border-red-900/30 bg-red-950/20 cursor-pointer text-xs"
        >
          <input
            v-model="dropDatabases"
            type="checkbox"
            class="mt-0.5 accent-red-500 rounded"
          />
          <div>
            <span class="font-semibold text-red-300 block">
              Also drop {{ project.databasesCount }} associated TiDB database(s) from cluster
            </span>
            <span class="text-[11px] text-slate-400 block mt-0.5">
              Permanently executes <code class="text-red-400 font-mono">DROP DATABASE</code> on the cluster. All tables and data will be destroyed.
            </span>
          </div>
        </label>

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
            type="button"
            :disabled="isSubmitting"
            class="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-red-500/20 hover:bg-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            @click="handleDelete"
          >
            <RefreshCw v-if="isSubmitting" class="h-3.5 w-3.5 animate-spin" />
            <span>Confirm Delete</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trash2, X, AlertTriangle, RefreshCw } from '@lucide/vue'
import type { Project } from '~/types'

const props = defineProps<{
  isOpen: boolean
  project: Project | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'deleted'): void
}>()

const { deleteProject } = useProjects()

const dropDatabases = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      dropDatabases.value = false
      errorMessage.value = null
    }
  }
)

const handleDelete = async () => {
  if (!props.project) return

  isSubmitting.value = true
  errorMessage.value = null

  try {
    const res = await deleteProject(props.project.id, {
      dropDatabases: dropDatabases.value
    })

    if (res.success) {
      emit('deleted')
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
