<template>
  <div class="space-y-6">
    <!-- Page Header Banner -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-blue-900/30 via-slate-900/40 to-slate-900/60 border border-slate-800/80 p-6 backdrop-blur">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold tracking-tight text-white">
            Project <span class="text-cyan-400">Manager</span>
          </h1>
          <span class="rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-[11px] font-mono text-cyan-400">
            Phase 2 Active
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-1">
          Manage application workspaces, logical TiDB database associations, and Cloudflare R2 storage scoping.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
          :disabled="isLoading"
          @click="loadProjects"
        >
          <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': isLoading }" />
          <span>Refresh</span>
        </button>

        <button
          class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-500 transition-all"
          @click="openCreateModal"
        >
          <Plus class="h-3.5 w-3.5" />
          <span>New Project</span>
        </button>
      </div>
    </div>

    <!-- Quick Stats Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="rounded-xl border border-slate-800/80 bg-[#0f172a]/70 p-4 backdrop-blur">
        <div class="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <FolderKanban class="h-4 w-4 text-indigo-400" />
          <span>Total Projects</span>
        </div>
        <div class="text-xl font-bold text-white font-mono">
          {{ projects.length }}
        </div>
      </div>

      <div class="rounded-xl border border-slate-800/80 bg-[#0f172a]/70 p-4 backdrop-blur">
        <div class="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <Activity class="h-4 w-4 text-emerald-400" />
          <span>Active Projects</span>
        </div>
        <div class="text-xl font-bold text-white font-mono">
          {{ activeProjectsCount }}
        </div>
      </div>

      <div class="rounded-xl border border-slate-800/80 bg-[#0f172a]/70 p-4 backdrop-blur">
        <div class="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <Database class="h-4 w-4 text-cyan-400" />
          <span>Databases Attached</span>
        </div>
        <div class="text-xl font-bold text-white font-mono">
          {{ totalDatabasesAttached }}
        </div>
      </div>

      <div class="rounded-xl border border-slate-800/80 bg-[#0f172a]/70 p-4 backdrop-blur">
        <div class="flex items-center gap-2 text-xs text-slate-400 mb-1">
          <HardDrive class="h-4 w-4 text-violet-400" />
          <span>R2 Storage Objects</span>
        </div>
        <div class="text-xl font-bold text-white font-mono">
          {{ totalStorageObjects }}
        </div>
      </div>
    </div>

    <!-- Search & Filter Controls -->
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-xl border border-slate-800/80 bg-[#0c121e]/80 p-3 backdrop-blur">
      <!-- Search Input -->
      <div class="relative flex-1">
        <Search class="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-500" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search projects by name or slug..."
          class="w-full rounded-lg border border-slate-700/80 bg-slate-900/80 pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-all"
          @input="handleSearch"
        />
      </div>

      <!-- Status Filter Tabs -->
      <div class="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800/80">
        <button
          v-for="tab in statusTabs"
          :key="tab.value"
          class="px-2.5 py-1 rounded-md text-xs font-medium transition-all"
          :class="selectedStatus === tab.value ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'"
          @click="selectStatus(tab.value)"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- Loading Skeleton State -->
    <div v-if="isLoading && projects.length === 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="n in 3"
        :key="n"
        class="h-56 rounded-xl border border-slate-800/60 bg-slate-900/30 animate-pulse p-5"
      >
        <div class="h-4 bg-slate-800 rounded w-1/3 mb-3"></div>
        <div class="h-3 bg-slate-800/60 rounded w-1/2 mb-6"></div>
        <div class="h-16 bg-slate-800/40 rounded mb-4"></div>
        <div class="h-4 bg-slate-800/50 rounded w-1/4"></div>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="filteredProjects.length === 0"
      class="rounded-2xl border border-slate-800/80 bg-[#0f172a]/70 p-12 text-center backdrop-blur"
    >
      <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4">
        <FolderKanban class="h-7 w-7" />
      </div>
      <h3 class="text-base font-bold text-white">No Projects Found</h3>
      <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
        {{ searchQuery || selectedStatus !== 'all' ? 'No projects match your current search or filter criteria.' : 'You haven’t created any projects yet. Start by creating your first managed project.' }}
      </p>
      <div class="mt-5">
        <button
          v-if="searchQuery || selectedStatus !== 'all'"
          class="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors"
          @click="resetFilters"
        >
          Clear Filters
        </button>
        <button
          v-else
          class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-500 transition-all"
          @click="openCreateModal"
        >
          <Plus class="h-3.5 w-3.5" />
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
import {
  FolderKanban,
  Plus,
  RefreshCw,
  Search,
  Activity,
  Database,
  HardDrive
} from '@lucide/vue'
import type { Project } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const { projects, isLoading, fetchProjects } = useProjects()

const searchQuery = ref('')
const selectedStatus = ref('all')

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Archived', value: 'archived' },
  { label: 'Suspended', value: 'suspended' }
]

// Modal states
const isProjectModalOpen = ref(false)
const projectToEdit = ref<Project | null>(null)
const isDeleteModalOpen = ref(false)
const projectToDelete = ref<Project | null>(null)

const loadProjects = async () => {
  await fetchProjects()
}

onMounted(() => {
  loadProjects()
})

const filteredProjects = computed(() => {
  return projects.value.filter((p) => {
    const matchesSearch =
      !searchQuery.value ||
      p.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesStatus =
      selectedStatus.value === 'all' || p.status === selectedStatus.value

    return matchesSearch && matchesStatus
  })
})

const activeProjectsCount = computed(() => {
  return projects.value.filter((p) => p.status === 'active').length
})

const totalDatabasesAttached = computed(() => {
  return projects.value.reduce((acc, p) => acc + (p.databasesCount || 0), 0)
})

const totalStorageObjects = computed(() => {
  return projects.value.reduce((acc, p) => acc + (p.storage?.filesCount || 0), 0)
})

const selectStatus = (status: string) => {
  selectedStatus.value = status
}

const handleSearch = () => {
  // Reactive filteredProjects handles it
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedStatus.value = 'all'
}

const openCreateModal = () => {
  projectToEdit.value = null
  isProjectModalOpen.value = true
}

const openEditModal = (project: Project) => {
  projectToEdit.value = project
  isProjectModalOpen.value = true
}

const openDeleteModal = (project: Project) => {
  projectToDelete.value = project
  isDeleteModalOpen.value = true
}

const handleProjectSaved = () => {
  loadProjects()
}

const handleProjectDeleted = () => {
  loadProjects()
}
</script>
