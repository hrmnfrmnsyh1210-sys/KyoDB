<template>
  <div class="space-y-6 max-w-6xl mx-auto pb-10">
    <!-- Header / Welcome Banner -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-xs text-neutral-400 font-medium mb-1">
          <span>KyoDB Cloud</span>
          <span>/</span>
          <span class="text-neutral-700 font-semibold">User Workspace</span>
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-neutral-900">
          Welcome back, {{ auth.user.value?.username }} 👋
        </h1>
        <p class="text-xs text-neutral-500 mt-1">
          Manage your TiDB Cloud database, browse schemas, and execute raw SQL queries.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <NuxtLink
          to="/settings"
          class="btn-outline-forest inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold shadow-xs"
        >
          <Settings class="w-3.5 h-3.5" />
          <span>Manage Connections</span>
        </NuxtLink>
        <button
          type="button"
          class="btn-forest inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold shadow-xs cursor-pointer"
          @click="openAddModal"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Connect TiDB</span>
        </button>
      </div>
    </div>

    <!-- Active Cluster Banner / Status -->
    <div
      v-if="activeConnection"
      class="donezo-card p-5 bg-white border border-neutral-200/80 shadow-xs relative overflow-hidden"
    >
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
        <div class="flex items-start gap-3.5">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center shrink-0">
            <Database class="w-5 h-5 text-[#144e35]" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h2 class="text-base font-bold text-neutral-900">{{ activeConnection.name }}</h2>
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active Cluster
              </span>
            </div>
            <p class="text-xs text-neutral-500 font-mono mt-0.5">
              {{ activeConnection.username }}@{{ activeConnection.host }}:{{ activeConnection.port }} / {{ activeConnection.database || 'default' }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="px-3 py-2 rounded-xl text-xs font-semibold border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors inline-flex items-center gap-1.5"
            @click="openEditModal(activeConnection)"
          >
            <Edit3 class="w-3.5 h-3.5 text-neutral-500" />
            <span>Edit TiDB</span>
          </button>
          <NuxtLink
            to="/databases"
            class="btn-forest inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold shadow-xs"
          >
            <Table class="w-3.5 h-3.5" />
            <span>Open Explorer</span>
          </NuxtLink>
          <NuxtLink
            to="/sql-editor"
            class="px-4 py-2 rounded-xl text-xs font-semibold border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors inline-flex items-center gap-1.5"
          >
            <Terminal class="w-3.5 h-3.5 text-neutral-500" />
            <span>SQL Console</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- No Active TiDB Connection Alert Banner -->
    <div
      v-else
      class="donezo-card p-6 bg-amber-50/60 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div class="flex items-start gap-3.5">
        <div class="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
          <AlertCircle class="w-5 h-5 text-amber-700" />
        </div>
        <div>
          <h2 class="text-sm font-bold text-amber-900">No TiDB Database Connected Yet</h2>
          <p class="text-xs text-amber-700 mt-0.5">
            Connect your TiDB Cloud cluster credentials to start exploring tables, schema, and executing SQL queries.
          </p>
        </div>
      </div>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white transition-colors shrink-0 shadow-xs cursor-pointer"
        @click="openAddModal"
      >
        <Zap class="w-3.5 h-3.5" />
        <span>Connect TiDB Now</span>
      </button>
    </div>

    <!-- Quick Navigation Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <NuxtLink
        to="/databases"
        class="donezo-card p-6 hover:shadow-md hover:border-neutral-300 transition-all group flex items-start gap-4"
      >
        <div class="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-200 group-hover:bg-emerald-50 group-hover:border-emerald-200/80 flex items-center justify-center shrink-0 transition-colors">
          <Database class="w-6 h-6 text-neutral-600 group-hover:text-[#144e35] transition-colors" />
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-neutral-900 group-hover:text-[#144e35] transition-colors">
              Database Explorer
            </h3>
            <ArrowRight class="w-4 h-4 text-neutral-400 group-hover:translate-x-1 group-hover:text-[#144e35] transition-all" />
          </div>
          <p class="text-xs text-neutral-500 mt-1 leading-relaxed">
            Inspect your tables, schema definitions, column types, row counts, and browse your records interactively.
          </p>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/sql-editor"
        class="donezo-card p-6 hover:shadow-md hover:border-neutral-300 transition-all group flex items-start gap-4"
      >
        <div class="w-12 h-12 rounded-2xl bg-neutral-50 border border-neutral-200 group-hover:bg-emerald-50 group-hover:border-emerald-200/80 flex items-center justify-center shrink-0 transition-colors">
          <Terminal class="w-6 h-6 text-neutral-600 group-hover:text-[#144e35] transition-colors" />
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-neutral-900 group-hover:text-[#144e35] transition-colors">
              SQL Query Console
            </h3>
            <ArrowRight class="w-4 h-4 text-neutral-400 group-hover:translate-x-1 group-hover:text-[#144e35] transition-all" />
          </div>
          <p class="text-xs text-neutral-500 mt-1 leading-relaxed">
            Write, run, and benchmark raw SQL queries directly against your TiDB cluster with syntax highlighting and instant results.
          </p>
        </div>
      </NuxtLink>
    </div>

    <!-- Configured Connections Card -->
    <div class="donezo-card overflow-hidden">
      <div class="p-4 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
        <div class="flex items-center gap-2">
          <h3 class="text-xs font-bold text-neutral-900">Your Configured Clusters</h3>
          <span class="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-neutral-200/80 text-neutral-600 font-bold">
            {{ connections.length }}
          </span>
        </div>
        <button
          type="button"
          class="text-xs font-semibold text-[#144e35] hover:underline flex items-center gap-1 cursor-pointer"
          @click="openAddModal"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>Add New Cluster</span>
        </button>
      </div>

      <div v-if="connections.length === 0" class="p-8 text-center">
        <Database class="w-8 h-8 text-neutral-300 mx-auto mb-2" />
        <p class="text-xs text-neutral-500 font-medium">No database connections found.</p>
        <button
          type="button"
          class="text-xs font-semibold text-[#144e35] hover:underline mt-1 inline-block cursor-pointer"
          @click="openAddModal"
        >
          Connect your first TiDB Cloud instance →
        </button>
      </div>

      <div v-else class="divide-y divide-neutral-100">
        <div
          v-for="conn in connections"
          :key="conn.id"
          class="p-4 flex items-center justify-between hover:bg-neutral-50/60 transition-colors"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              :class="conn.isDefault ? 'bg-emerald-50 text-[#144e35]' : 'bg-neutral-100 text-neutral-500'"
            >
              <Database class="w-4 h-4" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-xs font-bold text-neutral-900">{{ conn.name }}</span>
                <span
                  v-if="conn.isDefault"
                  class="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80"
                >
                  DEFAULT
                </span>
              </div>
              <p class="text-[11px] text-neutral-400 font-mono mt-0.5">
                {{ conn.username }}@{{ conn.host }}:{{ conn.port }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-100 transition-colors"
              title="Edit Connection"
              @click="openEditModal(conn)"
            >
              <Edit3 class="w-3.5 h-3.5" />
            </button>
            <button
              v-if="!conn.isDefault"
              type="button"
              class="px-3 py-1 rounded-lg text-xs font-medium border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
              @click="handleActivate(conn.id)"
            >
              Set as Active
            </button>
            <span v-else class="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <Check class="w-3.5 h-3.5" />
              Active
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Dedicated Connect / Edit TiDB Modal -->
    <DatabaseConnectTiDbModal
      :is-open="isModalOpen"
      :edit-connection="editingConnection"
      @close="isModalOpen = false"
      @saved="handleConnectionSaved"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Database,
  Terminal,
  Settings,
  Plus,
  Table,
  AlertCircle,
  Zap,
  ArrowRight,
  Check,
  Edit3
} from '@lucide/vue'
import type { UserDatabaseConnection } from '~/types'

definePageMeta({
  middleware: ['auth']
})

const route = useRoute()
const auth = useAuth()
const { connections, activeConnection, fetchConnections, activateConnection } = useUserDatabases()

const isModalOpen = ref(false)
const editingConnection = ref<UserDatabaseConnection | null>(null)

const openAddModal = () => {
  editingConnection.value = null
  isModalOpen.value = true
}

const openEditModal = (conn: UserDatabaseConnection) => {
  editingConnection.value = conn
  isModalOpen.value = true
}

const handleConnectionSaved = async () => {
  isModalOpen.value = false
  await fetchConnections()
}

onMounted(async () => {
  if (auth.user.value?.role === 'admin') {
    await navigateTo('/dashboard')
    return
  }
  await fetchConnections().catch(() => {})

  // Auto-open modal if connect=1 in URL or if user has no connections yet
  if (route.query.connect === '1' || connections.value.length === 0) {
    openAddModal()
  }
})

const handleActivate = async (id: string) => {
  await activateConnection(id)
}
</script>
