<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header Banner -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
          Resource Monitoring
        </h1>
        <p class="text-xs sm:text-sm text-neutral-500 mt-1">
          Realtime telemetry, system resource usage, administrative audit logs, and SQL query history.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          class="btn-white-pill inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold shadow-xs"
          :disabled="isLoadingStats || isLoadingAudit || isLoadingQuery"
          @click="refreshAll"
        >
          <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': isLoadingStats }" />
          <span>Refresh All</span>
        </button>
      </div>
    </div>

    <!-- 4 System Resource Telemetry Cards (Donezo Style) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. Node.js & Process Uptime -->
      <div class="donezo-card-forest p-6 flex flex-col justify-between shadow-xs relative overflow-hidden min-h-[160px]">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-white/80">System Uptime</span>
          <div class="circle-arrow-btn-white">
            <Cpu class="w-4 h-4" />
          </div>
        </div>

        <div class="my-3">
          <div class="text-3xl font-bold font-mono text-white">
            {{ stats?.uptimeFormatted || 'Active' }}
          </div>
          <span class="text-[11px] text-emerald-200/80 font-mono">
            Node {{ stats?.nodeVersion || 'v20+' }} • PID {{ stats?.pid || '—' }}
          </span>
        </div>

        <div>
          <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-white/15 px-2.5 py-1 rounded-full text-white">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Platform: {{ stats?.platform || 'Node-server' }} ({{ stats?.arch || 'x64' }})</span>
          </span>
        </div>
      </div>

      <!-- 2. Memory Usage (Heap) -->
      <div class="donezo-card p-6 flex flex-col justify-between shadow-xs min-h-[160px]">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-neutral-500">Heap Memory</span>
          <div class="circle-arrow-btn">
            <HardDrive class="w-4 h-4 text-[#144e35]" />
          </div>
        </div>

        <div class="my-3">
          <div class="text-3xl font-bold font-mono text-neutral-900">
            {{ stats?.memory?.heapUsedMb || 42.5 }} <span class="text-lg font-normal text-neutral-400">MB</span>
          </div>
          <div class="mt-2 w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
            <div
              class="h-full bg-[#144e35] rounded-full transition-all duration-300"
              :style="{ width: `${Math.min(stats?.memory?.heapPercent || 35, 100)}%` }"
            ></div>
          </div>
        </div>

        <div class="flex items-center justify-between text-[11px] font-mono text-neutral-500">
          <span>{{ stats?.memory?.heapPercent || 35 }}% of total</span>
          <span>RSS: {{ stats?.memory?.rssMb || 85 }} MB</span>
        </div>
      </div>

      <!-- 3. TiDB Latency & DB Health -->
      <div class="donezo-card p-6 flex flex-col justify-between shadow-xs min-h-[160px]">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-neutral-500">TiDB Cloud Latency</span>
          <div class="circle-arrow-btn">
            <Database class="w-4 h-4 text-[#144e35]" />
          </div>
        </div>

        <div class="my-3 flex items-baseline justify-between">
          <div class="text-3xl font-bold font-mono text-neutral-900">
            {{ stats?.tidb?.latencyMs !== undefined ? `${stats.tidb.latencyMs}ms` : 'Healthy' }}
          </div>
          <span class="text-xs text-neutral-400 font-mono">{{ stats?.counts?.totalDatabases || 0 }} DBs</span>
        </div>

        <div class="flex items-center gap-1.5">
          <span
            class="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border"
            :class="stats?.tidb?.connected ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60' : 'bg-neutral-100 text-neutral-600 border-neutral-200'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="stats?.tidb?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'"></span>
            <span>{{ stats?.tidb?.connected ? 'Cluster Connected' : (stats?.tidb?.statusText || 'Offline') }}</span>
          </span>
        </div>
      </div>

      <!-- 4. Cloudflare R2 Status & Storage Files -->
      <div class="donezo-card p-6 flex flex-col justify-between shadow-xs min-h-[160px]">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-neutral-500">R2 Object Storage</span>
          <div class="circle-arrow-btn">
            <Cloud class="w-4 h-4 text-[#144e35]" />
          </div>
        </div>

        <div class="my-3 flex items-baseline justify-between">
          <div class="text-3xl font-bold font-mono text-neutral-900">
            {{ stats?.counts?.totalFiles || 0 }} <span class="text-sm font-normal text-neutral-400 font-sans">files</span>
          </div>
          <span class="text-xs text-neutral-400 font-mono">Presigned S3</span>
        </div>

        <div class="flex items-center gap-1.5">
          <span
            class="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full border"
            :class="stats?.r2?.connected ? 'bg-emerald-50 text-emerald-800 border-emerald-200/60' : 'bg-neutral-100 text-neutral-600 border-neutral-200'"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="stats?.r2?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'"></span>
            <span>{{ stats?.r2?.connected ? 'Bucket Connected' : (stats?.r2?.statusText || 'Mock Storage') }}</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Main Tabs: Audit Logs vs Query History -->
    <div class="donezo-card overflow-hidden">
      <!-- Tab Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 p-4 bg-neutral-50/50">
        <div class="flex items-center gap-1 bg-neutral-200/60 p-1 rounded-full">
          <button
            class="px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2"
            :class="activeTab === 'audit' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'"
            @click="activeTab = 'audit'"
          >
            <ShieldCheck class="w-3.5 h-3.5" :class="activeTab === 'audit' ? 'text-[#144e35]' : ''" />
            <span>Audit Logs</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-100 font-mono">{{ totalAuditLogs }}</span>
          </button>

          <button
            class="px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2"
            :class="activeTab === 'queries' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'"
            @click="activeTab = 'queries'"
          >
            <Terminal class="w-3.5 h-3.5" :class="activeTab === 'queries' ? 'text-[#144e35]' : ''" />
            <span>Query History</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-100 font-mono">{{ totalQueries }}</span>
          </button>
        </div>

        <!-- Filter Controls -->
        <!-- Audit Filters -->
        <div v-if="activeTab === 'audit'" class="flex flex-wrap items-center gap-2">
          <div class="relative">
            <Search class="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
            <input
              v-model="auditSearch"
              type="text"
              placeholder="Search action or target..."
              class="rounded-full bg-white border border-neutral-200 pl-8 pr-3 py-1.5 text-xs text-neutral-900 outline-none focus:border-[#144e35]"
              @input="handleAuditSearch"
            />
          </div>

          <select
            v-model="auditActionFilter"
            class="rounded-full bg-white border border-neutral-200 px-3 py-1.5 text-xs text-neutral-900 focus:border-[#144e35] outline-none"
            @change="fetchAuditLogs(1)"
          >
            <option value="">All Actions</option>
            <option value="auth.login">auth.login</option>
            <option value="database.create">database.create</option>
            <option value="table.create">table.create</option>
            <option value="storage.upload">storage.upload</option>
            <option value="storage.delete">storage.delete</option>
            <option value="apikey.create">apikey.create</option>
          </select>
        </div>

        <!-- Query Filters -->
        <div v-else class="flex flex-wrap items-center gap-2">
          <select
            v-model="queryStatusFilter"
            class="rounded-full bg-white border border-neutral-200 px-3 py-1.5 text-xs text-neutral-900 focus:border-[#144e35] outline-none"
            @change="fetchQueryHistory(1)"
          >
            <option value="">All Statuses</option>
            <option value="success">Success</option>
            <option value="error">Error</option>
          </select>

          <input
            v-model="queryDbFilter"
            type="text"
            placeholder="Filter database..."
            class="rounded-full bg-white border border-neutral-200 px-3 py-1.5 text-xs text-neutral-900 outline-none focus:border-[#144e35]"
            @input="handleQueryDbFilter"
          />
        </div>
      </div>

      <!-- Tab Content 1: Audit Logs Table -->
      <div v-if="activeTab === 'audit'">
        <div v-if="isLoadingAudit && auditLogs.length === 0" class="p-8 text-center text-xs text-neutral-400">
          <RefreshCw class="w-6 h-6 animate-spin mx-auto text-[#144e35] mb-2" />
          Loading audit events...
        </div>

        <div v-else-if="auditLogs.length === 0" class="p-12 text-center">
          <ShieldCheck class="w-10 h-10 text-neutral-300 mx-auto mb-2" />
          <h4 class="text-sm font-bold text-neutral-900">No Audit Logs Found</h4>
          <p class="text-xs text-neutral-400 mt-1">Actions performed across the dashboard will be automatically logged here.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-neutral-50/70 border-b border-neutral-100 text-neutral-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th class="py-3 px-4">Action</th>
                <th class="py-3 px-4">Target Type</th>
                <th class="py-3 px-4">Target ID</th>
                <th class="py-3 px-4">Admin</th>
                <th class="py-3 px-4">IP Address</th>
                <th class="py-3 px-4">Timestamp</th>
                <th class="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
              <tr v-for="log in auditLogs" :key="log.id" class="hover:bg-neutral-50/60 transition-colors">
                <td class="py-3 px-4">
                  <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold" :class="getActionBadgeStyle(log.action)">
                    {{ log.action }}
                  </span>
                </td>
                <td class="py-3 px-4 font-mono text-neutral-600">{{ log.targetType }}</td>
                <td class="py-3 px-4 font-mono text-neutral-800 truncate max-w-[180px]" :title="log.targetId || '—'">
                  {{ log.targetId || '—' }}
                </td>
                <td class="py-3 px-4 text-neutral-700">{{ log.adminUsername || 'admin' }}</td>
                <td class="py-3 px-4 font-mono text-neutral-400 text-[11px]">{{ log.ipAddress || '127.0.0.1' }}</td>
                <td class="py-3 px-4 text-neutral-500 text-[11px] font-mono whitespace-nowrap">{{ formatDate(log.createdAt) }}</td>
                <td class="py-3 px-4 text-right">
                  <button
                    v-if="log.metadata"
                    class="text-[11px] font-semibold text-[#144e35] hover:underline"
                    @click="viewMetadata(log)"
                  >
                    View JSON
                  </button>
                  <span v-else class="text-neutral-300">—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Audit Pagination Footer -->
        <div v-if="auditTotalPages > 1" class="flex items-center justify-between border-t border-neutral-100 px-4 py-3 bg-neutral-50/40">
          <span class="text-xs text-neutral-500">
            Page {{ auditPage }} of {{ auditTotalPages }} ({{ totalAuditLogs }} total logs)
          </span>
          <div class="flex items-center gap-1.5">
            <button
              class="btn-white-pill px-3 py-1 text-xs font-semibold disabled:opacity-40"
              :disabled="auditPage <= 1"
              @click="fetchAuditLogs(auditPage - 1)"
            >
              Previous
            </button>
            <button
              class="btn-white-pill px-3 py-1 text-xs font-semibold disabled:opacity-40"
              :disabled="auditPage >= auditTotalPages"
              @click="fetchAuditLogs(auditPage + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <!-- Tab Content 2: Query History Table -->
      <div v-else>
        <div v-if="isLoadingQuery && queryHistory.length === 0" class="p-8 text-center text-xs text-neutral-400">
          <RefreshCw class="w-6 h-6 animate-spin mx-auto text-[#144e35] mb-2" />
          Loading SQL query telemetry...
        </div>

        <div v-else-if="queryHistory.length === 0" class="p-12 text-center">
          <Terminal class="w-10 h-10 text-neutral-300 mx-auto mb-2" />
          <h4 class="text-sm font-bold text-neutral-900">No Query History Recorded</h4>
          <p class="text-xs text-neutral-400 mt-1">Queries executed via the Monaco SQL Editor will appear here with execution timings.</p>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-neutral-50/70 border-b border-neutral-100 text-neutral-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th class="py-3 px-4">Database</th>
                <th class="py-3 px-4">Statement / Type</th>
                <th class="py-3 px-4">Execution Time</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Executed At</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
              <tr v-for="q in queryHistory" :key="q.id" class="hover:bg-neutral-50/60 transition-colors">
                <td class="py-3 px-4 font-mono font-bold text-neutral-800">{{ q.databaseName }}</td>
                <td class="py-3 px-4 font-mono text-neutral-700 max-w-xs truncate" :title="q.query">
                  {{ q.query }}
                </td>
                <td class="py-3 px-4 font-mono">
                  <span
                    class="px-2 py-0.5 rounded-full text-[11px] font-bold"
                    :class="q.executionTimeMs < 50 ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'"
                  >
                    {{ q.executionTimeMs }}ms
                  </span>
                </td>
                <td class="py-3 px-4">
                  <span
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase"
                    :class="q.status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'"
                  >
                    <span class="w-1.5 h-1.5 rounded-full" :class="q.status === 'success' ? 'bg-emerald-500' : 'bg-rose-500'"></span>
                    {{ q.status }}
                  </span>
                </td>
                <td class="py-3 px-4 text-neutral-500 font-mono text-[11px] whitespace-nowrap">{{ formatDate(q.executedAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Query Pagination Footer -->
        <div v-if="queryTotalPages > 1" class="flex items-center justify-between border-t border-neutral-100 px-4 py-3 bg-neutral-50/40">
          <span class="text-xs text-neutral-500">
            Page {{ queryPage }} of {{ queryTotalPages }} ({{ totalQueries }} total queries)
          </span>
          <div class="flex items-center gap-1.5">
            <button
              class="btn-white-pill px-3 py-1 text-xs font-semibold disabled:opacity-40"
              :disabled="queryPage <= 1"
              @click="fetchQueryHistory(queryPage - 1)"
            >
              Previous
            </button>
            <button
              class="btn-white-pill px-3 py-1 text-xs font-semibold disabled:opacity-40"
              :disabled="queryPage >= queryTotalPages"
              @click="fetchQueryHistory(queryPage + 1)"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Metadata Modal -->
    <div v-if="selectedMetadataLog" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs" @click="selectedMetadataLog = null"></div>
      <div class="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white shadow-2xl p-6 overflow-hidden">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
          <h3 class="text-sm font-bold text-neutral-900">
            Audit Metadata: {{ selectedMetadataLog.action }}
          </h3>
          <button class="p-1 text-neutral-400 hover:text-neutral-700" @click="selectedMetadataLog = null">
            <X class="w-4 h-4" />
          </button>
        </div>
        <pre class="bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs font-mono text-neutral-800 overflow-x-auto max-h-80"><code>{{ JSON.stringify(selectedMetadataLog.metadata, null, 2) }}</code></pre>
        <div class="mt-4 flex justify-end">
          <button class="btn-forest px-4 py-1.5 text-xs font-semibold" @click="selectedMetadataLog = null">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Cpu,
  HardDrive,
  Database,
  Cloud,
  RefreshCw,
  ShieldCheck,
  Terminal,
  Search,
  X
} from '@lucide/vue'
import type { AuditLogEntry } from '~/types'

definePageMeta({ middleware: ['auth', 'admin-only'] })

const activeTab = ref<'audit' | 'queries'>('audit')
const selectedMetadataLog = ref<AuditLogEntry | null>(null)

const {
  stats,
  isLoadingStats,
  fetchStats,
  auditLogs,
  totalAuditLogs,
  auditPage,
  auditTotalPages,
  auditActionFilter,
  auditSearch,
  isLoadingAudit,
  fetchAuditLogs,
  queryHistory,
  totalQueries,
  queryPage,
  queryTotalPages,
  queryDbFilter,
  queryStatusFilter,
  isLoadingQuery,
  fetchQueryHistory
} = useMonitoring()

let searchTimeout: any = null

const handleAuditSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchAuditLogs(1)
  }, 300)
}

const handleQueryDbFilter = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchQueryHistory(1)
  }, 300)
}

const refreshAll = async () => {
  await Promise.all([
    fetchStats(),
    fetchAuditLogs(auditPage.value),
    fetchQueryHistory(queryPage.value)
  ])
}

const viewMetadata = (log: AuditLogEntry) => {
  selectedMetadataLog.value = log
}

const getActionBadgeStyle = (action: string) => {
  if (action.includes('login')) return 'bg-emerald-50 text-emerald-800 border border-emerald-200/60'
  if (action.includes('create')) return 'bg-blue-50 text-blue-800 border border-blue-200/60'
  if (action.includes('delete') || action.includes('revoke')) return 'bg-rose-50 text-rose-800 border border-rose-200/60'
  return 'bg-neutral-100 text-neutral-800'
}

const formatDate = (isoStr?: string) => {
  if (!isoStr) return '—'
  try {
    const d = new Date(isoStr)
    return d.toLocaleString()
  } catch {
    return isoStr
  }
}

onMounted(() => {
  refreshAll()
})
</script>
