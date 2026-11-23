<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
    <!-- Backdrop -->
    <div
      class="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs transition-opacity"
      @click="$emit('close')"
    ></div>

    <!-- Modal Box -->
    <div class="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden">
      <!-- Modal Header -->
      <div class="flex items-center justify-between border-b border-neutral-100 px-6 py-4 bg-neutral-50/50">
        <div class="flex items-center gap-2.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-[#144e35] border border-emerald-200/60">
            <FolderKanban class="h-4.5 w-4.5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-neutral-900">
              {{ isEditing ? 'Edit Project' : 'Create New Project' }}
            </h3>
            <p class="text-xs text-neutral-500">
              {{ isEditing ? 'Update project metadata and status' : 'Set up a new isolated project, database & storage scope' }}
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

      <!-- Error Message Banner -->
      <div v-if="errorMessage" class="m-6 mb-0 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-start gap-2.5">
        <AlertTriangle class="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
        <div class="flex-1">{{ errorMessage }}</div>
      </div>

      <!-- Form Body -->
      <form class="p-6 space-y-4" @submit.prevent="handleSubmit">
        <!-- Project Name -->
        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5">
            Project Name <span class="text-[#144e35]">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="e.g. Acme SaaS Platform"
            class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#144e35] focus:outline-none transition-all"
            @input="handleNameInput"
          />
        </div>

        <!-- Project Slug -->
        <div>
          <div class="flex items-center justify-between mb-1.5">
            <label class="text-xs font-semibold text-neutral-700">
              Project Slug <span class="text-[#144e35]">*</span>
            </label>
            <span class="text-[10px] text-neutral-400 font-mono">Unique URL identifier</span>
          </div>
          <div class="relative">
            <input
              v-model="form.slug"
              type="text"
              required
              :disabled="isEditing"
              placeholder="e.g. acme-saas-platform"
              class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs font-mono text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#144e35] focus:outline-none transition-all disabled:bg-neutral-100 disabled:text-neutral-400"
              @input="isCustomSlug = true"
            />
          </div>
          <p class="mt-1 text-[11px] text-neutral-400">
            Preview scope: <code class="text-neutral-600 font-mono">projects/{{ form.slug || '{slug}' }}/</code>
          </p>
        </div>

        <!-- Description -->
        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5">
            Description <span class="text-neutral-400 font-normal">(Optional)</span>
          </label>
          <textarea
            v-model="form.description"
            rows="2"
            placeholder="Brief overview of this project..."
            class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#144e35] focus:outline-none transition-all resize-none"
          ></textarea>
        </div>

        <!-- Status -->
        <div>
          <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Status</label>
          <select
            v-model="form.status"
            class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2.5 text-xs text-neutral-900 focus:bg-white focus:border-[#144e35] focus:outline-none transition-all"
          >
            <option value="active">Active (Full operational access)</option>
            <option value="archived">Archived (Read-only / dormant)</option>
            <option value="suspended">Suspended (Access blocked)</option>
          </select>
        </div>

        <!-- Database Association Option (Creation Mode Only) -->
        <div v-if="!isEditing" class="pt-3 border-t border-neutral-100 space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-neutral-900">TiDB Database Association</span>
            <span class="text-[10px] text-[#144e35] font-semibold">TiDB Cloud Cluster</span>
          </div>

          <div class="grid grid-cols-1 gap-2">
            <!-- None -->
            <label
              class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-xs"
              :class="form.databaseOption === 'none' ? 'border-[#144e35] bg-emerald-50/50 text-neutral-900' : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300'"
            >
              <input
                v-model="form.databaseOption"
                type="radio"
                value="none"
                class="accent-[#144e35]"
              />
              <div>
                <span class="font-bold text-neutral-900 block">No database</span>
                <span class="text-[11px] text-neutral-500">Create project first, attach database later</span>
              </div>
            </label>

            <!-- Create New Logical Database -->
            <label
              class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-xs"
              :class="form.databaseOption === 'create_new' ? 'border-[#144e35] bg-emerald-50/50 text-neutral-900' : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300'"
            >
              <input
                v-model="form.databaseOption"
                type="radio"
                value="create_new"
                class="accent-[#144e35]"
              />
              <div>
                <span class="font-bold text-neutral-900 block">Create new logical database on TiDB Cloud</span>
                <span class="text-[11px] text-neutral-500">Auto-provisions a fresh logical database in the cluster</span>
              </div>
            </label>

            <!-- Attach Existing Database -->
            <label
              class="flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all text-xs"
              :class="form.databaseOption === 'attach_existing' ? 'border-[#144e35] bg-emerald-50/50 text-neutral-900' : 'border-neutral-200 bg-neutral-50 text-neutral-600 hover:border-neutral-300'"
            >
              <input
                v-model="form.databaseOption"
                type="radio"
                value="attach_existing"
                class="accent-[#144e35]"
              />
              <div>
                <span class="font-bold text-neutral-900 block">Attach existing cluster database</span>
                <span class="text-[11px] text-neutral-500">Link an existing logical database already in TiDB</span>
              </div>
            </label>
          </div>

          <!-- Dynamic Database Name Input -->
          <div v-if="form.databaseOption === 'create_new'" class="mt-2 space-y-1">
            <label class="block text-[11px] font-semibold text-neutral-700">
              New Database Identifier <span class="text-[#144e35]">*</span>
            </label>
            <input
              v-model="form.databaseName"
              type="text"
              placeholder="e.g. acme_saas_db"
              class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-xs font-mono text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#144e35] focus:outline-none transition-all"
            />
          </div>

          <!-- Select Existing Database -->
          <div v-if="form.databaseOption === 'attach_existing'" class="mt-2 space-y-1">
            <label class="block text-[11px] font-semibold text-neutral-700">
              Select Existing Database <span class="text-[#144e35]">*</span>
            </label>
            <select
              v-model="form.databaseName"
              class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs font-mono text-neutral-900 focus:bg-white focus:border-[#144e35] focus:outline-none transition-all"
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
  form.name = ''
  form.slug = ''
  form.description = ''
  form.status = 'active'
  form.databaseOption = 'none'
  form.databaseName = ''
  isCustomSlug.value = false
  errorMessage.value = null
}

const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const handleNameInput = () => {
  if (!isEditing.value && !isCustomSlug.value) {
    form.slug = generateSlug(form.name)
  }
}

watch(
  () => props.isOpen,
  async (newVal) => {
    if (newVal) {
      if (props.projectToEdit) {
        form.name = props.projectToEdit.name
        form.slug = props.projectToEdit.slug
        form.description = props.projectToEdit.description || ''
        form.status = props.projectToEdit.status
        form.databaseOption = 'none'
        form.databaseName = ''
        isCustomSlug.value = true
      } else {
        resetForm()
        await fetchAvailableDatabases()
      }
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
      if (res.success && res.data) {
        emit('saved', res.data)
        emit('close')
      } else {
        errorMessage.value = res.error || 'Failed to update project'
      }
    } else {
      const payload: CreateProjectPayload = {
        name: form.name.trim(),
        slug: form.slug.trim(),
        description: form.description ? form.description.trim() : undefined,
        status: form.status,
        databaseOption: form.databaseOption,
        databaseName:
          form.databaseOption !== 'none' && form.databaseName.trim()
            ? form.databaseName.trim()
            : undefined
      }

      const res = await createProject(payload)
      if (res.success && res.data) {
        emit('saved', res.data)
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
