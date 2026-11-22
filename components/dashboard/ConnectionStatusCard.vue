<template>
  <div class="rounded-xl border border-slate-800/80 bg-[#0f172a]/70 p-5 backdrop-blur">
    <div class="flex items-center justify-between border-b border-slate-800/60 pb-4">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
          <Activity class="h-5 w-5" />
        </div>
        <div>
          <h3 class="text-base font-semibold text-white">Cloud Infrastructure Status</h3>
          <p class="text-xs text-slate-400">Live health verification for TiDB Cloud & Cloudflare R2</p>
        </div>
      </div>

      <button
        class="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/80 px-3 py-1.5 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-700 hover:text-white"
        :disabled="isRefreshing"
        @click="refreshAll"
      >
        <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': isRefreshing }" />
        <span>Check All</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <!-- TiDB Cloud Service Card -->
      <div class="rounded-lg border border-slate-800/80 bg-slate-900/60 p-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2.5">
            <div class="flex h-8 w-8 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Database class="h-4 w-4" />
            </div>
            <div>
              <div class="text-sm font-semibold text-white">TiDB Cloud</div>
              <div class="text-[11px] text-slate-400">Structured SQL Data</div>
            </div>
          </div>
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-mono border"
            :class="tidbBadgeClasses"
          >
            <span class="h-1.5 w-1.5 rounded-full" :class="tidbDotClasses"></span>
            {{ tidbStatusLabel }}
          </span>
        </div>

        <div class="mt-3 space-y-1.5 text-xs text-slate-300">
          <div class="flex justify-between font-mono text-[11px]">
            <span class="text-slate-400">Latency:</span>
            <span>{{ tidb?.latencyMs !== undefined ? `${tidb.latencyMs} ms` : 'N/A' }}</span>
          </div>
          <div class="flex justify-between font-mono text-[11px]">
            <span class="text-slate-400">Target Database:</span>
            <span class="text-cyan-400">kyodb_system</span>
          </div>
          <div v-if="tidb?.version" class="flex justify-between font-mono text-[11px] truncate">
            <span class="text-slate-400">Engine Version:</span>
            <span class="truncate ml-2 text-slate-300" :title="tidb.version">{{ tidb.version }}</span>
          </div>
          <div v-if="tidb?.error" class="mt-2 rounded bg-red-500/10 p-2 text-[11px] text-red-300 border border-red-500/20">
            {{ tidb.error }}
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800/60 flex justify-end">
          <button
            class="inline-flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            :disabled="isTestingTiDb"
            @click="handleTestTiDb"
          >
            <RefreshCw class="h-3 w-3" :class="{ 'animate-spin': isTestingTiDb }" />
            <span>Test Connection</span>
          </button>
        </div>
      </div>

      <!-- Cloudflare R2 Object Storage Card -->
      <div class="rounded-lg border border-slate-800/80 bg-slate-900/60 p-4">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2.5">
            <div class="flex h-8 w-8 items-center justify-center rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <HardDrive class="h-4 w-4" />
            </div>
            <div>
              <div class="text-sm font-semibold text-white">Cloudflare R2</div>
              <div class="text-[11px] text-slate-400">Object Storage</div>
            </div>
          </div>
          <span
            class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-mono border"
            :class="r2BadgeClasses"
          >
            <span class="h-1.5 w-1.5 rounded-full" :class="r2DotClasses"></span>
            {{ r2StatusLabel }}
          </span>
        </div>

        <div class="mt-3 space-y-1.5 text-xs text-slate-300">
          <div class="flex justify-between font-mono text-[11px]">
            <span class="text-slate-400">Latency:</span>
            <span>{{ r2?.latencyMs !== undefined ? `${r2.latencyMs} ms` : 'N/A' }}</span>
          </div>
          <div class="flex justify-between font-mono text-[11px]">
            <span class="text-slate-400">Target Bucket:</span>
            <span class="text-blue-400">{{ r2?.details?.bucket || 'Configured via .env' }}</span>
          </div>
          <div class="flex justify-between font-mono text-[11px]">
            <span class="text-slate-400">Protocol:</span>
            <span class="text-slate-300">S3 Presigned API</span>
          </div>
          <div v-if="r2?.error" class="mt-2 rounded bg-red-500/10 p-2 text-[11px] text-red-300 border border-red-500/20">
            {{ r2.error }}
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800/60 flex justify-end">
          <button
            class="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 font-medium"
            :disabled="isTestingR2"
            @click="handleTestR2"
          >
            <RefreshCw class="h-3 w-3" :class="{ 'animate-spin': isTestingR2 }" />
            <span>Test Connection</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Activity, Database, HardDrive, RefreshCw } from '@lucide/vue'
import type { ConnectionHealth } from '~/types'

const props = defineProps<{
  tidb: ConnectionHealth | undefined
  r2: ConnectionHealth | undefined
}>()

const emit = defineEmits<{
  (e: 'refresh'): void
}>()

const { testTiDb, testR2 } = useSystemHealth()

const isRefreshing = ref(false)
const isTestingTiDb = ref(false)
const isTestingR2 = ref(false)

const refreshAll = async () => {
  isRefreshing.value = true
  emit('refresh')
  setTimeout(() => {
    isRefreshing.value = false
  }, 600)
}

const handleTestTiDb = async () => {
  isTestingTiDb.value = true
  try {
    await testTiDb()
  } finally {
    isTestingTiDb.value = false
  }
}

const handleTestR2 = async () => {
  isTestingR2.value = true
  try {
    await testR2()
  } finally {
    isTestingR2.value = false
  }
}

const tidbStatusLabel = computed(() => {
  if (props.tidb?.connected) return 'Connected'
  if (props.tidb?.statusText === 'Not Configured') return 'Not Configured'
  return 'Disconnected'
})

const tidbBadgeClasses = computed(() => {
  if (props.tidb?.connected) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
  if (props.tidb?.statusText === 'Not Configured') return 'bg-amber-500/10 border-amber-500/30 text-amber-300'
  return 'bg-rose-500/10 border-rose-500/30 text-rose-300'
})

const tidbDotClasses = computed(() => {
  if (props.tidb?.connected) return 'bg-emerald-400 animate-pulse'
  if (props.tidb?.statusText === 'Not Configured') return 'bg-amber-400'
  return 'bg-rose-400'
})

const r2StatusLabel = computed(() => {
  if (props.r2?.connected) return 'Connected'
  if (props.r2?.statusText === 'Not Configured') return 'Not Configured'
  return 'Disconnected'
})

const r2BadgeClasses = computed(() => {
  if (props.r2?.connected) return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
  if (props.r2?.statusText === 'Not Configured') return 'bg-amber-500/10 border-amber-500/30 text-amber-300'
  return 'bg-rose-500/10 border-rose-500/30 text-rose-300'
})

const r2DotClasses = computed(() => {
  if (props.r2?.connected) return 'bg-emerald-400 animate-pulse'
  if (props.r2?.statusText === 'Not Configured') return 'bg-amber-400'
  return 'bg-rose-400'
})
</script>
