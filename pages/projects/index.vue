<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
          Projects
        </h1>
        <p class="text-xs sm:text-sm text-neutral-500 mt-1">
          Manage application workspaces, TiDB database associations, and Cloudflare R2 storage scoping.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          class="btn-white-pill inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold shadow-xs"
          :disabled="isLoading"
          @click="loadProjects"
        >
          <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': isLoading }" />
          <span>Refresh</span>
        </button>

        <button
          class="btn-forest inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold shadow-xs"
          @click="openCreateModal"
        >
          <Plus class="h-4 w-4" />
          <span>Add Project</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats Cards (Donezo Style) -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="donezo-card p-4">
        <div class="flex items-center gap-2 text-xs text-neutral-500 mb-1">
          <FolderKanban class="h-4 w-4 text-[#144e35]" />
          <span>Total Projects</span>
        </div>
        <div class="text-2xl font-bold text-neutral-900 font-mono">{{ projects.length }}</div>
      </div>
      <div class="donezo-card p-4">
        <div class="flex items-center gap-2 text-xs text-neutral-500 mb-1">
          <Activity class="h-4 w-4 text-emerald-600" />
          <span>Active</span>
        </div>
        <div class="text-2xl font-bold text-neutral-900 font-mono">{{ activeProjectsCount }}</div>
      </div>
      <div class="donezo-card p-4">
        <div class="flex items-center gap-2 text-xs text-neutral-500 mb-1">
          <Database class="h-4 w-4 text-[#144e35]" />
          <span>Databases</span>
        </div>
        <div class="text-2xl font-bold text-neutral-900 font-mono">{{ totalDatabasesAttached }}</div>
      </div>
      <div class="donezo-card p-4">
        <div class="flex items-center gap-2 text-xs text-neutral-500 mb-1">
          <HardDrive class="h-4 w-4 text-[#144e35]" />
          <span>Storage Files</span>
        </div>
        <div class="text-2xl font-bold text-neutral-900 font-mono">{{ totalStorageObjects }}</div>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="donezo-card p-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div class="relative flex-1">
        <Search class="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-400" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search projects by name or slug..."
          class="w-full rounded-full bg-neutral-50 pl-10 pr-4 py-2 text-xs border border-neutral-200 outline-none focus:border-[#144e35] focus:bg-white transition-all text-neutral-900"
        />
      </div>

      <div class="flex items-center gap-1 bg-neutral-100 p-1 rounded-full">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          class="px-3 py-1 rounded-full text-xs font-semibold transition-all"
          :class="selectedStatus === tab.value ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'"
          @click="selectStatus(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading && projects.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div v-for="n in 3" :key="n" class="donezo-card h-52 p-5 animate-pulse">
        <div class="h-4 bg-neutral-100 rounded w-1/3 mb-3"></div>
        <div class="h-3 bg-neutral-100 rounded w-1/2 mb-6"></div>
        <div class="h-16 bg-neutral-50 rounded mb-4"></div>
        <div class="h-4 bg-neutral-100 rounded w-1/4"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredProjects.length === 0"
      class="donezo-card p-12 text-center"
    >
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-[#144e35] mb-4">
        <FolderKanban class="h-7 w-7" />
      </div>
      <h3 class="text-base font-bold text-neutral-900">No Projects Found</h3>
      <p class="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
        {{ searchQuery || selectedStatus !== 'all' ? 'No projects match your current filter criteria.' : "You haven't created any projects yet." }}
      </p>
      <div class="mt-5">
        <button
          v-if="searchQuery || selectedStatus !== 'all'"
          class="btn-white-pill px-4 py-2 text-xs font-semibold"
          @click="resetFilters"
        >
          Clear Filters
        </button>
        <button
          v-else
          class="btn-forest px-5 py-2 text-xs font-semibold"
          @click="openCreateModal"
        >
          <Plus class="h-3.5 w-3.5 inline mr-1" />
          <span>Create First Project</span>
        </button>
      </div>
    </div>

    <!-- Projects Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <ProjectsProjectCard
        v-for="project in filteredProjects"
        :key="project.id"
        :project="project"
        @edit="openEditModal"
        @delete="openDeleteModal"
      />
    </div>

    <!-- Modals -->
    <ProjectsProjectModal
      :is-open="isProjectModalOpen"
      :project-to-edit="projectToEdit"
      @close="isProjectModalOpen = false"
      @saved="handleProjectSaved"
    />
    <ProjectsDeleteProjectModal
      :is-open="isDeleteModalOpen"
      :project="projectToDelete"
      @close="isDeleteModalOpen = false"
      @deleted="handleProjectDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { FolderKanban, Plus, RefreshCw, Search, Activity, Database, HardDrive } from '@lucide/vue'
import type { Project } from '~/types'

definePageMeta({ middleware: ['auth', 'admin-only'] })

const { projects, isLoading, fetchProjects } = useProjects()
const searchQuery = ref('')
const selectedStatus = ref('all')
const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'Suspended', value: 'suspended' }
]
const isProjectModalOpen = ref(false)
const projectToEdit = ref<Project | null>(null)
const isDeleteModalOpen = ref(false)
const projectToDelete = ref<Project | null>(null)

const loadProjects = async () => { await fetchProjects() }
onMounted(() => { loadProjects() })

const filteredProjects = computed(() =>
  projects.value.filter((p) => {
    const matchesSearch = !searchQuery.value ||
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchesStatus = selectedStatus.value === 'all' || p.status === selectedStatus.value
    return matchesSearch && matchesStatus
  })
)
const activeProjectsCount = computed(() => projects.value.filter(p => p.status === 'active').length)
const totalDatabasesAttached = computed(() => projects.value.reduce((acc, p) => acc + (p.databasesCount || 0), 0))
const totalStorageObjects = computed(() => projects.value.reduce((acc, p) => acc + (p.storage?.filesCount || 0), 0))
const selectStatus = (s: string) => { selectedStatus.value = s }
const resetFilters = () => { searchQuery.value = ''; selectedStatus.value = 'all' }
const openCreateModal = () => { projectToEdit.value = null; isProjectModalOpen.value = true }
const openEditModal = (p: Project) => { projectToEdit.value = p; isProjectModalOpen.value = true }
const openDeleteModal = (p: Project) => { projectToDelete.value = p; isDeleteModalOpen.value = true }
const handleProjectSaved = () => { loadProjects() }
const handleProjectDeleted = () => { loadProjects() }
</script>
