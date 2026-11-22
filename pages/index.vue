<template>
  <div class="space-y-6">
    <!-- Page Header Banner -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-blue-900/30 via-slate-900/40 to-slate-900/60 border border-slate-800/80 p-6 backdrop-blur">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold tracking-tight text-white">
            Kyo<span class="text-cyan-400">DB</span> Dashboard
          </h1>
          <span class="rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-[11px] font-mono text-cyan-400">
            Phase 1 Active
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-1">
          Unified management dashboard for TiDB Cloud relational data and Cloudflare R2 object storage.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3.5 py-2 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-all shadow-sm"
          :disabled="isLoadingSummary"
          @click="loadDashboardData"
        >
          <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': isLoadingSummary }" />
          <span>Refresh Metrics</span>
        </button>
      </div>
    </div>

    <!-- Metrics Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      <DashboardStatCard
        title="Total Projects"
        :value="summary?.totalProjects"
        subtitle="Managed applications"
        :icon="FolderKanban"
        icon-bg="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
        hint="TiDB metadata"
      />

      <DashboardStatCard
        title="Total Databases"
        :value="summary?.totalDatabases"
        subtitle="Logical databases"
        :icon="Database"
        icon-bg="bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
        hint="TiDB Cluster"
      />

      <DashboardStatCard
        title="Total Tables"
        :value="summary?.totalTables"
        subtitle="User schema tables"
        :icon="Table"
        icon-bg="bg-blue-500/10 text-blue-400 border border-blue-500/20"
        hint="Across databases"
      />

      <DashboardStatCard
        title="Total Files"
        :value="summary?.totalFiles"
        subtitle="R2 storage objects"
        :icon="FileText"
        icon-bg="bg-teal-500/10 text-teal-400 border border-teal-500/20"
        hint="Direct-to-R2"
      />

      <DashboardStatCard
        title="TiDB Storage"
        :value="summary?.tidbStatus === 'connected' ? 'Connected' : null"
        subtitle="Cluster status"
        :icon="Server"
        icon-bg="bg-sky-500/10 text-sky-400 border border-sky-500/20"
        hint="kyodb_system"
      />

      <DashboardStatCard
        title="R2 Storage"
        :value="formatStorageBytes(summary?.r2StoredBytes)"
        subtitle="Object usage"
        :icon="HardDrive"
        icon-bg="bg-violet-500/10 text-violet-400 border border-violet-500/20"
        hint="Cloudflare R2"
      />
    </div>

    <!-- Infrastructure & Live Health Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <DashboardConnectionStatusCard
          :tidb="health?.tidb"
          :r2="health?.r2"
          @refresh="loadHealthData"
        />

        <DashboardMigrationRunnerCard
          :tidb-connected="Boolean(health?.tidb?.connected)"
          @migrated="handleMigrationComplete"
        />
      </div>

      <div class="space-y-6">
        <DashboardRecentActivityList
          :activities="summary?.recentActivities || []"
        />
      </div>
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
  RefreshCw
} from '@lucide/vue'
import type { DashboardSummary } from '~/types'

definePageMeta({
  middleware: 'auth'
})

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

const loadDashboardData = async () => {
  isLoadingSummary.value = true
  try {
    const data = await $fetch<DashboardSummary>('/api/dashboard/summary')
    summary.value = data
  } catch (err) {
    console.warn('Failed to load dashboard summary:', err)
  } finally {
    isLoadingSummary.value = false
  }
}

const loadHealthData = async () => {
  await checkHealth()
  await loadDashboardData()
}

const handleMigrationComplete = async () => {
  await loadHealthData()
}

onMounted(async () => {
  await Promise.all([
    checkHealth(),
    loadDashboardData()
  ])
})
</script>
