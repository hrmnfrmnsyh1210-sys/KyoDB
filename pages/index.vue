<template>
  <div class="space-y-5">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-5"
      style="background:linear-gradient(135deg,#1e1108 0%,#1a0e06 60%,#160c05 100%); border:1px solid #2e1c0d;">
      <div>
        <div class="flex items-center gap-2.5 mb-1">
          <h1 class="text-xl font-bold tracking-tight" style="color:#f0e6d8;">
            Kyo<span style="color:#e8882a;">DB</span> Dashboard
          </h1>
          <span class="text-[10px] font-mono rounded-full px-2 py-0.5 font-medium"
            style="background:rgba(232,136,42,0.1); border:1px solid rgba(232,136,42,0.25); color:#e8882a;">
            Phase 4 Active
          </span>
        </div>
        <p class="text-xs" style="color:#9a8070;">
          Unified management for TiDB Cloud relational data &amp; Cloudflare R2 object storage
        </p>
      </div>

      <button
        class="inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all"
        style="background:#231509; border:1px solid #3a2410; color:#c4a882;"
        :disabled="isLoadingSummary"
        @click="loadDashboardData"
      >
        <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': isLoadingSummary }" />
        <span>Refresh</span>
      </button>
    </div>

    <!-- Stat Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      <!-- Total Projects -->
      <div class="rounded-xl p-4 flex flex-col gap-2" style="background:#1c1208; border:1px solid #2e1c0d;">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium" style="color:#9a8070;">Projects</span>
          <div class="w-7 h-7 rounded-lg flex items-center justify-center"
            style="background:rgba(232,136,42,0.1);">
            <FolderKanban class="w-3.5 h-3.5" style="color:#e8882a;" />
          </div>
        </div>
        <div class="text-2xl font-bold font-mono" style="color:#f0e6d8;">
          <span v-if="summary">{{ summary.totalProjects ?? '—' }}</span>
          <span v-else class="skeleton-warm block h-7 w-12 rounded"></span>
        </div>
        <span class="text-[10px]" style="color:#6a5545;">Managed apps</span>
      </div>

      <!-- Total Databases -->
      <div class="rounded-xl p-4 flex flex-col gap-2" style="background:#1c1208; border:1px solid #2e1c0d;">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium" style="color:#9a8070;">Databases</span>
          <div class="w-7 h-7 rounded-lg flex items-center justify-center"
            style="background:rgba(232,136,42,0.1);">
            <Database class="w-3.5 h-3.5" style="color:#e8882a;" />
          </div>
        </div>
        <div class="text-2xl font-bold font-mono" style="color:#f0e6d8;">
          <span v-if="summary">{{ summary.totalDatabases ?? '—' }}</span>
          <span v-else class="skeleton-warm block h-7 w-12 rounded"></span>
        </div>
        <span class="text-[10px]" style="color:#6a5545;">Logical schemas</span>
      </div>

      <!-- Total Tables -->
      <div class="rounded-xl p-4 flex flex-col gap-2" style="background:#1c1208; border:1px solid #2e1c0d;">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium" style="color:#9a8070;">Tables</span>
          <div class="w-7 h-7 rounded-lg flex items-center justify-center"
            style="background:rgba(232,136,42,0.1);">
            <Table class="w-3.5 h-3.5" style="color:#e8882a;" />
          </div>
        </div>
        <div class="text-2xl font-bold font-mono" style="color:#f0e6d8;">
          <span v-if="summary">{{ summary.totalTables ?? '—' }}</span>
          <span v-else class="skeleton-warm block h-7 w-12 rounded"></span>
        </div>
        <span class="text-[10px]" style="color:#6a5545;">User schemas</span>
      </div>

      <!-- R2 Files -->
      <div class="rounded-xl p-4 flex flex-col gap-2" style="background:#1c1208; border:1px solid #2e1c0d;">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium" style="color:#9a8070;">R2 Objects</span>
          <div class="w-7 h-7 rounded-lg flex items-center justify-center"
            style="background:rgba(232,136,42,0.1);">
            <FileText class="w-3.5 h-3.5" style="color:#e8882a;" />
          </div>
        </div>
        <div class="text-2xl font-bold font-mono" style="color:#f0e6d8;">
          <span v-if="summary">{{ summary.totalFiles ?? '—' }}</span>
          <span v-else class="skeleton-warm block h-7 w-12 rounded"></span>
        </div>
        <span class="text-[10px]" style="color:#6a5545;">Direct-to-R2</span>
      </div>

      <!-- TiDB Status -->
      <div class="rounded-xl p-4 flex flex-col gap-2" style="background:#1c1208; border:1px solid #2e1c0d;">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium" style="color:#9a8070;">TiDB</span>
          <div class="w-7 h-7 rounded-lg flex items-center justify-center"
            style="background:rgba(232,136,42,0.1);">
            <Server class="w-3.5 h-3.5" style="color:#e8882a;" />
          </div>
        </div>
        <div class="text-sm font-bold" :style="tidbStatusStyle">
          {{ tidbStatusLabel }}
        </div>
        <span class="text-[10px]" style="color:#6a5545;">kyodb_system</span>
      </div>

      <!-- R2 Storage Used -->
      <div class="rounded-xl p-4 flex flex-col gap-2" style="background:#1c1208; border:1px solid #2e1c0d;">
        <div class="flex items-center justify-between">
          <span class="text-[11px] font-medium" style="color:#9a8070;">R2 Usage</span>
          <div class="w-7 h-7 rounded-lg flex items-center justify-center"
            style="background:rgba(232,136,42,0.1);">
            <HardDrive class="w-3.5 h-3.5" style="color:#e8882a;" />
          </div>
        </div>
        <div class="text-lg font-bold font-mono" style="color:#f0e6d8;">
          <span v-if="summary">{{ formatStorageBytes(summary.r2StoredBytes) ?? '—' }}</span>
          <span v-else class="skeleton-warm block h-7 w-16 rounded"></span>
        </div>
        <span class="text-[10px]" style="color:#6a5545;">Cloudflare R2</span>
      </div>
    </div>

    <!-- Quick Access Modules -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
      <NuxtLink
        v-for="mod in quickModules"
        :key="mod.name"
        :to="mod.to"
        class="group flex flex-col gap-3 rounded-xl p-4 transition-all"
        style="background:#1c1208; border:1px solid #2e1c0d;"
        :style="{ '--hover-border': mod.borderColor }"
        @mouseenter="e => (e.currentTarget as HTMLElement).style.borderColor = mod.borderColor"
        @mouseleave="e => (e.currentTarget as HTMLElement).style.borderColor = '#2e1c0d'"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
              :style="{ background: mod.iconBg }">
              <component :is="mod.icon" class="w-4.5 h-4.5" :style="{ color: mod.iconColor }" />
            </div>
            <div>
              <div class="text-sm font-semibold" style="color:#f0e6d8;">{{ mod.name }}</div>
              <div class="text-[11px]" style="color:#9a8070;">{{ mod.desc }}</div>
            </div>
          </div>
          <ChevronRight class="w-4 h-4 transition-transform group-hover:translate-x-1" style="color:#6a5545;" />
        </div>
      </NuxtLink>
    </div>

    <!-- Infrastructure & Activity -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <!-- Left col: connections + migration -->
      <div class="lg:col-span-2 space-y-5">
        <DashboardConnectionStatusCard :tidb="health?.tidb" :r2="health?.r2" @refresh="loadHealthData" />
        <DashboardMigrationRunnerCard :tidb-connected="Boolean(health?.tidb?.connected)" @migrated="handleMigrationComplete" />
      </div>

      <!-- Right col: recent activity -->
      <DashboardRecentActivityList :activities="summary?.recentActivities || []" />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  FolderKanban,
  Database,
  Table,
  FileText,
  Server,
  HardDrive,
  RefreshCw,
  ChevronRight,
  Terminal
} from '@lucide/vue'
import type { DashboardSummary } from '~/types'

definePageMeta({ middleware: 'auth' })

const { health, checkHealth } = useSystemHealth()
const summary = ref<DashboardSummary | null>(null)
const isLoadingSummary = ref(false)

const formatStorageBytes = (bytes: number | null | undefined): string | null => {
  if (bytes === null || bytes === undefined) return null
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

const tidbStatusLabel = computed(() => {
  if (!summary.value) return '...'
  if (summary.value.tidbStatus === 'connected') return 'Connected'
  if (summary.value.tidbStatus === 'not_configured') return 'Not Configured'
  return 'Offline'
})

const tidbStatusStyle = computed(() => {
  if (summary.value?.tidbStatus === 'connected') return { color: '#86efac' }
  if (summary.value?.tidbStatus === 'not_configured') return { color: '#fbbf6a' }
  return { color: '#fca5a5' }
})

const quickModules = [
  {
    name: 'Project Manager', desc: 'Multi-project workspaces & scopes',
    to: '/projects', icon: FolderKanban,
    iconBg: 'rgba(232,136,42,0.1)', iconColor: '#e8882a', borderColor: 'rgba(232,136,42,0.4)'
  },
  {
    name: 'Database Explorer', desc: 'Tables, schema & record manager',
    to: '/databases', icon: Database,
    iconBg: 'rgba(232,136,42,0.1)', iconColor: '#e8882a', borderColor: 'rgba(232,136,42,0.4)'
  },
  {
    name: 'Monaco SQL Editor', desc: 'Interactive queries & telemetry',
    to: '/sql-editor', icon: Terminal,
    iconBg: 'rgba(232,136,42,0.1)', iconColor: '#e8882a', borderColor: 'rgba(232,136,42,0.4)'
  }
]

const loadDashboardData = async () => {
  isLoadingSummary.value = true
  try {
    summary.value = await $fetch<DashboardSummary>('/api/dashboard/summary')
  } catch { } finally {
    isLoadingSummary.value = false
  }
}

const loadHealthData = async () => { await checkHealth(); await loadDashboardData() }
const handleMigrationComplete = async () => { await loadHealthData() }

onMounted(async () => {
  await Promise.all([checkHealth(), loadDashboardData()])
})
</script>
