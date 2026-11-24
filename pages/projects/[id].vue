<template>
  <div class="space-y-6">
    <!-- Breadcrumb & Top Bar -->
    <div class="flex items-center justify-between text-xs">
      <nav class="flex items-center gap-2 text-muted-warm">
        <NuxtLink to="/" class="hover:text-warm transition-colors">Dashboard</NuxtLink>
        <span class="text-faint-warm">/</span>
        <NuxtLink to="/projects" class="hover:text-warm transition-colors">Projects</NuxtLink>
        <span class="text-faint-warm">/</span>
        <span class="text-amber-accent font-medium">{{ currentProject?.name || 'Project Details' }}</span>
      </nav>

      <NuxtLink
        to="/projects"
        class="inline-flex items-center gap-1.5 text-xs text-muted-warm hover:text-warm transition-colors"
      >
        <ArrowLeft class="h-3.5 w-3.5" />
        <span>Back to Projects</span>
      </NuxtLink>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading && !currentProject" class="space-y-6 animate-pulse">
      <div class="h-28 rounded-2xl bg-[#1c1208] border border-[#2e1c0d]"></div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-2 h-96 rounded-2xl bg-[#1c1208] border border-[#2e1c0d]"></div>
        <div class="h-96 rounded-2xl bg-[#1c1208] border border-[#2e1c0d]"></div>
      </div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="error || !currentProject"
      class="rounded-2xl border border-red-500/20 bg-red-950/10 p-12 text-center backdrop-blur"
    >
      <AlertTriangle class="mx-auto h-10 w-10 text-red-400 mb-3" />
      <h3 class="text-base font-bold text-warm">Project Not Found</h3>
      <p class="text-xs text-muted-warm mt-1 max-w-sm mx-auto">
        {{ error || 'The requested project could not be loaded.' }}
      </p>
      <div class="mt-5">
        <NuxtLink
          to="/projects"
          class="inline-flex items-center gap-2 rounded-xl bg-[#2a1a0c] px-4 py-2 text-xs font-semibold text-warm hover:bg-[#3a2410] transition-colors"
        >
          Return to Projects
        </NuxtLink>
      </div>
    </div>

    <!-- Content when Loaded -->
    <div v-else class="space-y-6">
      <!-- Project Header Card -->
      <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl card-amber border border-[#2e1c0d] p-6 backdrop-blur">
        <div class="space-y-2">
          <div class="flex items-center gap-3">
            <h1 class="text-2xl font-bold tracking-tight text-warm">
              {{ currentProject.name }}
            </h1>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase border"
              :class="statusBadgeClasses"
            >
              <span class="w-1.5 h-1.5 rounded-full mr-1.5" :class="statusDotClasses"></span>
              {{ currentProject.status }}
            </span>
          </div>

          <div class="flex items-center gap-2 text-xs">
            <span class="text-muted-warm">Slug:</span>
            <code class="text-amber-accent font-mono bg-[#e8882a]/10 border border-[#7a4a1a]/40 px-2 py-0.5 rounded">
              {{ currentProject.slug }}
            </code>
            <button
              class="p-1 text-faint-warm hover:text-muted-warm transition-colors"
              :title="copied ? 'Copied!' : 'Copy slug'"
              @click="copySlug"
            >
              <Check v-if="copied" class="h-3.5 w-3.5 text-emerald-400" />
              <Copy v-else class="h-3.5 w-3.5" />
            </button>
          </div>

          <p v-if="currentProject.description" class="text-xs text-muted-warm max-w-2xl leading-relaxed pt-1">
            {{ currentProject.description }}
          </p>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center gap-2">
          <button
            class="inline-flex items-center gap-1.5 rounded-xl border border-[#3a2410] bg-[#231509] px-3.5 py-2 text-xs font-medium text-warm hover:bg-[#3a2410] hover:text-warm transition-all shadow-sm"
            @click="openEditModal"
          >
            <Edit3 class="h-3.5 w-3.5" />
            <span>Edit</span>
          </button>

          <button
            class="inline-flex items-center gap-1.5 rounded-xl btn-amber px-4 py-2 text-xs font-semibold text-warm shadow-lg shadow-[#e8882a]/20 hover:bg-[#f9a84a] transition-all"
            @click="isAttachDbModalOpen = true"
          >
            <Plus class="h-3.5 w-3.5" />
            <span>Add Database</span>
          </button>

          <button
            class="p-2 text-muted-warm hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20"
            title="Delete Project"
            @click="isDeleteModalOpen = true"
          >
            <Trash2 class="h-4 w-4" />
          </button>
        </div>
      </div>

      <!-- Main Layout: 2 Columns -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Left Column: Databases & Storage Scoping -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Associated TiDB Databases Card -->
          <div class="rounded-2xl border border-[#2e1c0d] panel-warm p-6 backdrop-blur">
            <div class="flex items-center justify-between border-b border-[#2e1c0d]/60 pb-4 mb-4">
              <div class="flex items-center gap-2.5">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e8882a]/10 border border-[#e8882a]/20 text-amber-accent">
                  <Database class="h-4 w-4" />
                </div>
                <div>
                  <h3 class="text-base font-semibold text-warm">Associated TiDB Databases</h3>
                  <p class="text-xs text-muted-warm">Logical relational databases linked to this project</p>
                </div>
              </div>

              <button
                class="inline-flex items-center gap-1.5 rounded-lg border border-[#3a2410] bg-[#2a1a0c] px-3 py-1.5 text-xs font-medium text-warm hover:bg-[#3a2410] transition-all"
                @click="isAttachDbModalOpen = true"
              >
                <Plus class="h-3 w-3" />
                <span>Attach Database</span>
              </button>
            </div>

            <!-- Database List -->
            <div v-if="currentProject.databases && currentProject.databases.length > 0" class="space-y-3">
              <div
                v-for="db in currentProject.databases"
                :key="db.id"
                class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#2e1c0d] bg-[#1c1208] p-4 hover:border-[#3a2410] transition-all"
              >
                <div class="flex items-center gap-3">
                  <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8882a]/10 text-amber-accent">
                    <Database class="h-4 w-4" />
                  </div>
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="text-sm font-bold font-mono text-warm">{{ db.databaseName }}</span>
                      <span class="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        {{ db.status }}
                      </span>
                    </div>
                    <div class="text-[11px] text-muted-warm mt-0.5">
                      {{ db.tablesCount ?? 0 }} tables in schema
                    </div>
                  </div>
                </div>

                <!-- Database Quick Actions -->
                <div class="flex items-center gap-2">
                  <NuxtLink
                    :to="`/databases?db=${encodeURIComponent(db.databaseName)}`"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-[#3a2410] bg-[#231509] px-2.5 py-1.5 text-xs font-medium text-warm hover:bg-[#3a2410] hover:text-warm transition-colors"
                  >
                    <span>Explorer</span>
                    <ExternalLink class="h-3 w-3" />
                  </NuxtLink>

                  <NuxtLink
                    :to="`/sql-editor?db=${encodeURIComponent(db.databaseName)}`"
                    class="inline-flex items-center gap-1.5 rounded-lg border border-[#3a2410] bg-[#231509] px-2.5 py-1.5 text-xs font-medium text-amber-accent hover:bg-[#3a2410] transition-colors"
                  >
                    <span>SQL</span>
                    <Terminal class="h-3 w-3" />
                  </NuxtLink>

                  <button
                    class="p-1.5 text-muted-warm hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Detach Database"
                    @click="confirmDetach(db.databaseName)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Empty Databases State -->
            <div v-else class="rounded-xl border border-dashed border-[#2e1c0d] p-8 text-center">
              <Database class="mx-auto h-8 w-8 text-faint-warm mb-2" />
              <p class="text-xs text-muted-warm">No databases are currently attached to this project.</p>
              <button
                class="mt-3 inline-flex items-center gap-1.5 text-xs text-amber-accent hover:text-[#f9a84a] font-medium"
                @click="isAttachDbModalOpen = true"
              >
                <Plus class="h-3.5 w-3.5" />
                <span>Create or attach a TiDB database</span>
              </button>
            </div>
          </div>

          <!-- Cloudflare R2 Storage Scoping Card -->
          <div class="rounded-2xl border border-[#2e1c0d] panel-warm p-6 backdrop-blur">
            <div class="flex items-center justify-between border-b border-[#2e1c0d]/60 pb-4 mb-4">
              <div class="flex items-center gap-2.5">
                <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-[#c98a3a]/10 border border-[#c98a3a]/20 text-[#c98a3a]">
                  <HardDrive class="h-4 w-4" />
                </div>
                <div>
                  <h3 class="text-base font-semibold text-warm">Cloudflare R2 Storage Scope</h3>
                  <p class="text-xs text-muted-warm">Direct-to-R2 isolated object storage namespace</p>
                </div>
              </div>

              <NuxtLink
                :to="`/storage?project=${currentProject.id}`"
                class="inline-flex items-center gap-1.5 rounded-lg border border-[#3a2410] bg-[#2a1a0c] px-3 py-1.5 text-xs font-medium text-warm hover:bg-[#3a2410] transition-all"
              >
                <span>Browse Files</span>
                <ExternalLink class="h-3 w-3" />
              </NuxtLink>
            </div>

            <!-- Storage Metrics Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div class="rounded-xl bg-[#1c1208] border border-[#2e1c0d] p-3">
                <span class="text-[11px] text-muted-warm">Scoped Objects</span>
                <div class="mt-1 text-lg font-bold font-mono text-warm">
                  {{ currentProject.storage?.filesCount ?? 0 }}
                </div>
              </div>

              <div class="rounded-xl bg-[#1c1208] border border-[#2e1c0d] p-3">
                <span class="text-[11px] text-muted-warm">Stored Bytes</span>
                <div class="mt-1 text-lg font-bold font-mono text-warm">
                  {{ formatBytes(currentProject.storage?.totalBytes) }}
                </div>
              </div>

              <div class="rounded-xl bg-[#1c1208] border border-[#2e1c0d] p-3">
                <span class="text-[11px] text-muted-warm">Object Storage Key Prefix</span>
                <div class="mt-1 text-xs font-mono text-amber-accent truncate" :title="`projects/${currentProject.id}/`">
                  projects/{{ currentProject.id.slice(0, 8) }}.../
                </div>
              </div>
            </div>

            <!-- Scope Explanation Box -->
            <div class="rounded-xl border border-[#2e1c0d] bg-[#1c1208] p-4 text-xs text-muted-warm leading-relaxed space-y-1.5">
              <div class="text-muted-warm font-medium flex items-center gap-1.5">
                <Layers class="h-3.5 w-3.5 text-amber-accent" />
                <span>Isolated Object Namespace</span>
              </div>
              <p>
                All uploaded media, documents, and database backups for this project are organized under the virtual key:
                <code class="text-amber-accent font-mono">projects/{{ currentProject.id }}/{folder}/{uuid}-{filename}</code>.
              </p>
            </div>
          </div>
        </div>

        <!-- Right Column: Project Metadata & Activity -->
        <div class="space-y-6">
          <!-- Metadata Info Card -->
          <div class="rounded-2xl border border-[#2e1c0d] panel-warm p-5 backdrop-blur space-y-3">
            <h3 class="text-sm font-semibold text-warm border-b border-[#2e1c0d] pb-2">
              Project Information
            </h3>

            <div class="space-y-2.5 text-xs">
              <div class="flex justify-between items-center">
                <span class="text-muted-warm">Identifier (UUID)</span>
                <code class="text-[11px] font-mono text-muted-warm" :title="currentProject.id">
                  {{ currentProject.id.slice(0, 13) }}...
                </code>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-muted-warm">Slug</span>
                <code class="text-[11px] font-mono text-amber-accent">
                  {{ currentProject.slug }}
                </code>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-muted-warm">Status</span>
                <span class="font-medium capitalize text-warm">
                  {{ currentProject.status }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-muted-warm">Created At</span>
                <span class="text-muted-warm">
                  {{ formatDate(currentProject.createdAt) }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-muted-warm">Last Updated</span>
                <span class="text-muted-warm">
                  {{ formatDate(currentProject.updatedAt) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Project Activity Card -->
          <div class="rounded-2xl border border-[#2e1c0d] panel-warm p-5 backdrop-blur">
            <h3 class="text-sm font-semibold text-warm border-b border-[#2e1c0d] pb-2 mb-3">
              Project Activity
            </h3>

            <div v-if="currentProject.recentActivity && currentProject.recentActivity.length > 0" class="space-y-3">
              <div
                v-for="item in currentProject.recentActivity"
                :key="item.id"
                class="flex items-start gap-2.5 text-xs pb-3 border-b border-[#2e1c0d]/40 last:border-b-0 last:pb-0"
              >
                <div class="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#e8882a]/10 text-amber-accent">
                  <Activity class="h-3 w-3" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between gap-1">
                    <span class="font-medium text-warm truncate">{{ item.action }}</span>
                    <span class="text-[10px] text-faint-warm shrink-0">{{ formatTimeAgo(item.createdAt) }}</span>
                  </div>
                  <p v-if="item.metadata" class="text-[11px] text-muted-warm mt-0.5 truncate">
                    {{ JSON.stringify(item.metadata) }}
                  </p>
                </div>
              </div>
            </div>

            <div v-else class="text-center py-6 text-xs text-faint-warm">
              No recorded activity for this project yet.
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <ProjectsProjectModal
      :is-open="isEditModalOpen"
      :project-to-edit="currentProject"
      @close="isEditModalOpen = false"
      @saved="handleProjectUpdated"
    />

    <ProjectsDeleteProjectModal
      :is-open="isDeleteModalOpen"
      :project="currentProject"
      @close="isDeleteModalOpen = false"
      @deleted="handleProjectDeleted"
    />

    <ProjectsDatabaseAttachModal
      v-if="currentProject"
      :is-open="isAttachDbModalOpen"
      :project-id="currentProject.id"
      @close="isAttachDbModalOpen = false"
      @attached="handleDatabaseAttached"
    />

    <!-- Detach Confirmation Modal -->
    <div v-if="databaseToDetach" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 modal-backdrop-warm backdrop-blur-sm" @click="databaseToDetach = null"></div>
      <div class="relative w-full max-w-sm rounded-2xl border border-[#2e1c0d] bg-[#1a1007] p-6 shadow-2xl">
        <h3 class="text-base font-semibold text-warm">Detach Database</h3>
        <p class="text-xs text-muted-warm mt-2 leading-relaxed">
          Are you sure you want to detach database <code class="text-amber-accent font-mono">{{ databaseToDetach }}</code> from this project? The database will remain in your TiDB cluster, but will no longer be linked to this project.
        </p>
        <div class="mt-5 flex items-center justify-end gap-2.5">
          <button
            class="px-3.5 py-1.5 rounded-lg border border-[#3a2410] text-xs font-medium text-muted-warm hover:bg-[#2a1a0c]"
            @click="databaseToDetach = null"
          >
            Cancel
          </button>
          <button
            class="px-4 py-1.5 rounded-lg bg-red-600 text-xs font-semibold text-warm hover:bg-red-500"
            @click="executeDetach"
          >
            Detach
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ArrowLeft,
  Database,
  HardDrive,
  Activity,
  Layers,
  Edit3,
  Trash2,
  Plus,
  ExternalLink,
  Terminal,
  Copy,
  Check,
  AlertTriangle
} from '@lucide/vue'
import type { Project } from '~/types'

definePageMeta({
  middleware: ['auth', 'admin-only']
})

const route = useRoute()
const router = useRouter()
const { currentProject, isLoading, error, fetchProject, detachDatabase } = useProjects()

const isEditModalOpen = ref(false)
const isDeleteModalOpen = ref(false)
const isAttachDbModalOpen = ref(false)
const databaseToDetach = ref<string | null>(null)
const copied = ref(false)

const loadData = async () => {
  const idOrSlug = route.params.id as string
  if (idOrSlug) {
    await fetchProject(idOrSlug)
  }
}

onMounted(() => {
  loadData()
})

const copySlug = async () => {
  if (!currentProject.value) return
  try {
    await navigator.clipboard.writeText(currentProject.value.slug)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Copy failed:', err)
  }
}

const statusBadgeClasses = computed(() => {
  switch (currentProject.value?.status) {
    case 'active':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    case 'archived':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    case 'suspended':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    default:
      return 'bg-[#6a5545]/10 text-muted-warm border-[#6a5545]/30'
  }
})

const statusDotClasses = computed(() => {
  switch (currentProject.value?.status) {
    case 'active':
      return 'bg-emerald-400'
    case 'archived':
      return 'bg-amber-400'
    case 'suspended':
      return 'bg-rose-400'
    default:
      return 'bg-[#6a5545]'
  }
})

const openEditModal = () => {
  isEditModalOpen.value = true
}

const handleProjectUpdated = () => {
  loadData()
}

const handleProjectDeleted = () => {
  router.push('/projects')
}

const handleDatabaseAttached = () => {
  loadData()
}

const confirmDetach = (dbName: string) => {
  databaseToDetach.value = dbName
}

const executeDetach = async () => {
  if (!currentProject.value || !databaseToDetach.value) return
  await detachDatabase(currentProject.value.id, databaseToDetach.value)
  databaseToDetach.value = null
  loadData()
}

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const formatDate = (isoStr?: string) => {
  if (!isoStr) return '-'
  return new Date(isoStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const formatTimeAgo = (isoStr?: string) => {
  if (!isoStr) return ''
  const diff = Date.now() - new Date(isoStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}
</script>
