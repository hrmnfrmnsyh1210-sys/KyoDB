<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      @click="$emit('close')"
    ></div>

    <!-- Modal Box -->
    <div class="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-[#0c121e] shadow-2xl shadow-black/60 overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
        <div class="flex items-center gap-2.5">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <FolderKanban class="h-4 w-4" />
          </div>
          <div>
            <h3 class="text-base font-semibold text-white">
              {{ isEditing ? 'Edit Project' : 'Create New Project' }}
            </h3>
            <p class="text-xs text-slate-400">
              {{ isEditing ? 'Update project metadata and status' : 'Set up a new isolated project, database & storage scope' }}
            </p>
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

      <!-- Form Body -->
      <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
        <!-- Project Name -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">
            Project Name <span class="text-cyan-400">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="e.g. Acme SaaS Platform"
            class="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            @input="handleNameInput"
          />
        </div>

        <!-- Project Slug -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-medium text-slate-300">
              Project Slug <span class="text-cyan-400">*</span>
            </label>
            <span class="text-[10px] text-slate-500 font-mono">Unique URL identifier</span>
          </div>
          <div class="relative">
            <input
              v-model="form.slug"
              type="text"
              required
              :disabled="isEditing"
              placeholder="e.g. acme-saas-platform"
              class="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50 disabled:bg-slate-950"
              @input="isCustomSlug = true"
            />
          </div>
          <p class="mt-1 text-[11px] text-slate-500">
            Preview scope: <code class="text-slate-400 font-mono">projects/{{ form.slug || '{slug}' }}/</code>
          </p>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">
            Description <span class="text-slate-500">(Optional)</span>
          </label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="Brief overview of this project..."
            class="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all resize-none"
          ></textarea>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-xs font-medium text-slate-300 mb-1.5">Status</label>
          <select
            v-model="form.status"
            class="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2.5 text-xs text-white focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
          >
            <option value="active">Active (Full operational access)</option>
            <option value="archived">Archived (Read-only / dormant)</option>
            <option value="suspended">Suspended (Access blocked)</option>
          </select>
        </div>

        <!-- Database Association Option (Creation Mode Only) -->
        <div v-if="!isEditing" class="pt-2 border-t border-slate-800/80 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-medium text-slate-200">TiDB Database Association</span>
            <span class="text-[10px] text-blue-400 font-medium">TiDB Cloud Cluster</span>
          </div>

          <div class="grid grid-cols-1 gap-2">
            <!-- None -->
            <label
              class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-xs"
              :class="form.databaseOption === 'none' ? 'border-cyan-500/60 bg-cyan-950/20 text-white' : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'"
            >
              <input
                v-model="form.databaseOption"
                type="radio"
                value="none"
                class="accent-cyan-400"
              />
              <div>
                <span class="font-medium text-slate-200 block">No database</span>
                <span class="text-[11px] text-slate-500">Create project first, attach database later</span>
              </div>
            </label>

            <!-- Create New Logical Database -->
            <label
              class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-xs"
              :class="form.databaseOption === 'create_new' ? 'border-cyan-500/60 bg-cyan-950/20 text-white' : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'"
            >
              <input
                v-model="form.databaseOption"
                type="radio"
                value="create_new"
                class="accent-cyan-400"
              />
              <div>
                <span class="font-medium text-slate-200 block">Create new logical database on TiDB Cloud</span>
                <span class="text-[11px] text-slate-500">Auto-provisions a fresh logical database in the cluster</span>
              </div>
            </label>

            <!-- Attach Existing Database -->
            <label
              class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-xs"
              :class="form.databaseOption === 'attach_existing' ? 'border-cyan-500/60 bg-cyan-950/20 text-white' : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'"
            >
              <input
                v-model="form.databaseOption"
                type="radio"
                value="attach_existing"
                class="accent-cyan-400"
              />
              <div>
                <span class="font-medium text-slate-200 block">Attach existing cluster database</span>
                <span class="text-[11px] text-slate-500">Link an existing logical database already in TiDB</span>
              </div>
            </label>
          </div>

          <!-- Dynamic Database Name Input -->
          <div v-if="form.databaseOption === 'create_new'" class="mt-2 space-y-1">
            <label class="block text-[11px] font-medium text-slate-300">
              New Database Identifier <span class="text-cyan-400">*</span>
            </label>
            <input
              v-model="form.databaseName"
              type="text"
              placeholder="e.g. acme_saas_db"
              class="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3.5 py-2 text-xs font-mono text-cyan-300 placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
            />
            <p class="text-[10px] text-slate-500">
              Only alphanumeric characters and underscores. Max 64 characters.
            </p>
          </div>

          <!-- Select Existing Database -->
          <div v-if="form.databaseOption === 'attach_existing'" class="mt-2 space-y-1">
            <label class="block text-[11px] font-medium text-slate-300">
              Select Existing Database <span class="text-cyan-400">*</span>
            </label>
            <select
              v-model="form.databaseName"
              class="w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
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
        </div>

        <!-- Modal Actions -->
        <div class="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
          <button
            type="button"
            class="rounded-xl border border-slate-700/80 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw v-if="isSubmitting" class="h-3.5 w-3.5 animate-spin" />
            <span>{{ isEditing ? 'Save Changes' : 'Create Project' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FolderKanban, X, AlertTriangle, RefreshCw } from '@lucide/vue'
import type { Project, CreateProjectPayload, UpdateProjectPayload, ProjectStatus } from '~/types'

const props = defineProps<{
  isOpen: boolean
  projectToEdit?: Project | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', project: Project): void
}>()

const { createProject, updateProject, fetchAvailableDatabases, availableDatabases } = useProjects()

const isEditing = computed(() => !!props.projectToEdit)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const isCustomSlug = ref(false)

const form = reactive({
  name: '',
  slug: '',
  description: '',
  status: 'active' as ProjectStatus,
  databaseOption: 'none' as 'none' | 'create_new' | 'attach_existing',
  databaseName: ''
})

const resetForm = () => {
  if (props.projectToEdit) {
    form.name = props.projectToEdit.name
    form.slug = props.projectToEdit.slug
    form.description = props.projectToEdit.description || ''
    form.status = props.projectToEdit.status
    form.databaseOption = 'none'
    form.databaseName = ''
    isCustomSlug.value = true
  } else {
    form.name = ''
    form.slug = ''
    form.description = ''
    form.status = 'active'
    form.databaseOption = 'none'
    form.databaseName = ''
    isCustomSlug.value = false
  }
  errorMessage.value = null
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      resetForm()
      if (!isEditing.value) {
        fetchAvailableDatabases()
      }
    }
  }
)

const slugify = (text: string) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 64)
}

const handleNameInput = () => {
  if (!isEditing.value && !isCustomSlug.value) {
    form.slug = slugify(form.name)
    if (form.databaseOption === 'create_new') {
      form.databaseName = form.slug.replace(/-/g, '_') + '_db'
    }
  }
}

watch(
  () => form.databaseOption,
  (opt) => {
    if (opt === 'create_new' && !form.databaseName && form.slug) {
      form.databaseName = form.slug.replace(/-/g, '_') + '_db'
    }
  }
)

const handleSubmit = async () => {
  isSubmitting.value = true
  errorMessage.value = null

  try {
    if (isEditing.value && props.projectToEdit) {
      const payload: UpdateProjectPayload = {
        name: form.name.trim(),
        description: form.description ? form.description.trim() : null,
        status: form.status
      }
      const res = await updateProject(props.projectToEdit.id, payload)
      if (res.success && res.project) {
        emit('saved', res.project)
        emit('close')
      } else {
        errorMessage.value = res.error || 'Failed to update project'
      }
    } else {
      const payload: CreateProjectPayload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description ? form.description.trim() : null,
        status: form.status,
        databaseOption: form.databaseOption,
        databaseName: form.databaseOption !== 'none' ? form.databaseName.trim() : undefined
      }
      const res = await createProject(payload)
      if (res.success && res.project) {
        emit('saved', res.project)
        emit('close')
      } else {
        errorMessage.value = res.error || 'Failed to create project'
      }
    }
  } catch (err: any) {
    errorMessage.value = err.message || 'An unexpected error occurred'
  } finally {
    isSubmitting.value = false
  }
}
</script>
