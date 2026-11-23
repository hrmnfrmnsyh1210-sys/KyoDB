<template>
  <div class="rounded-xl p-5" style="background:#1c1208; border:1px solid #2e1c0d;">
    <!-- Header -->
    <div class="flex items-center justify-between pb-4 mb-4" style="border-bottom:1px solid #2e1c0d;">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(232,136,42,0.1);">
          <Activity class="h-4.5 w-4.5" style="color:#e8882a;" />
        </div>
        <div>
          <h3 class="text-sm font-semibold" style="color:#f0e6d8;">Cloud Infrastructure</h3>
          <p class="text-[11px]" style="color:#9a8070;">TiDB Cloud &amp; Cloudflare R2 health</p>
        </div>
      </div>

      <button
        class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
        style="background:#231509; border:1px solid #3a2410; color:#c4a882;"
        :disabled="isRefreshing"
        @click="refreshAll"
      >
        <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': isRefreshing }" />
        <span>Check All</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- TiDB Card -->
      <div class="rounded-xl p-4" style="background:#231509; border:1px solid #3a2410;">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:rgba(232,136,42,0.1);">
              <Database class="h-4 w-4" style="color:#e8882a;" />
            </div>
            <div>
              <div class="text-sm font-semibold" style="color:#f0e6d8;">TiDB Cloud</div>
              <div class="text-[11px]" style="color:#9a8070;">Structured SQL</div>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-mono" :style="tidbBadgeStyle">
            <span class="h-1.5 w-1.5 rounded-full" :class="tidbDotClasses"></span>
            {{ tidbStatusLabel }}
          </span>
        </div>

        <div class="space-y-1.5 text-[11px] font-mono">
          <div class="flex justify-between">
            <span style="color:#9a8070;">Latency</span>
            <span style="color:#c4a882;">{{ tidb?.latencyMs !== undefined ? `${tidb.latencyMs} ms` : 'N/A' }}</span>
          </div>
          <div class="flex justify-between">
            <span style="color:#9a8070;">Database</span>
            <span style="color:#e8882a;">kyodb_system</span>
          </div>
          <div v-if="tidb?.error" class="mt-2 rounded-lg p-2 text-[11px]"
            style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); color:#fca5a5;">
            {{ tidb.error }}
          </div>
        </div>

        <div class="mt-3 pt-3 flex justify-end" style="border-top:1px solid #2e1c0d;">
          <button
            class="text-xs font-medium transition-colors inline-flex items-center gap-1"
            style="color:#e8882a;"
            :disabled="isTestingTiDb"
            @click="handleTestTiDb"
          >
            <RefreshCw class="h-3 w-3" :class="{ 'animate-spin': isTestingTiDb }" />
            Test Connection
          </button>
        </div>
      </div>

      <!-- R2 Card -->
      <div class="rounded-xl p-4" style="background:#231509; border:1px solid #3a2410;">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:rgba(232,136,42,0.1);">
              <HardDrive class="h-4 w-4" style="color:#e8882a;" />
            </div>
            <div>
              <div class="text-sm font-semibold" style="color:#f0e6d8;">Cloudflare R2</div>
              <div class="text-[11px]" style="color:#9a8070;">Object Storage</div>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-mono" :style="r2BadgeStyle">
            <span class="h-1.5 w-1.5 rounded-full" :class="r2DotClasses"></span>
            {{ r2StatusLabel }}
          </span>
        </div>

        <div class="space-y-1.5 text-[11px] font-mono">
          <div class="flex justify-between">
            <span style="color:#9a8070;">Latency</span>
            <span style="color:#c4a882;">{{ r2?.latencyMs !== undefined ? `${r2.latencyMs} ms` : 'N/A' }}</span>
          </div>
          <div class="flex justify-between">
            <span style="color:#9a8070;">Bucket</span>
            <span style="color:#e8882a;">{{ r2?.details?.bucket || 'via .env' }}</span>
          </div>
          <div class="flex justify-between">
            <span style="color:#9a8070;">Protocol</span>
            <span style="color:#c4a882;">S3 Presigned</span>
          </div>
          <div v-if="r2?.error" class="mt-2 rounded-lg p-2 text-[11px]"
            style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.2); color:#fca5a5;">
            {{ r2.error }}
          </div>
        </div>

        <div class="mt-3 pt-3 flex justify-end" style="border-top:1px solid #2e1c0d;">
          <button
            class="text-xs font-medium transition-colors inline-flex items-center gap-1"
            style="color:#e8882a;"
            :disabled="isTestingR2"
            @click="handleTestR2"
          >
            <RefreshCw class="h-3 w-3" :class="{ 'animate-spin': isTestingR2 }" />
            Test Connection
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Activity, Database, HardDrive, RefreshCw } from '@lucide/vue'
import type { ConnectionHealth } from '~/types'

const props = defineProps<{ tidb: ConnectionHealth | undefined; r2: ConnectionHealth | undefined }>()
const emit = defineEmits<{ (e: 'refresh'): void }>()
const { testTiDb, testR2 } = useSystemHealth()
const isRefreshing = ref(false)
const isTestingTiDb = ref(false)
const isTestingR2 = ref(false)

const refreshAll = async () => { isRefreshing.value = true; emit('refresh'); setTimeout(() => { isRefreshing.value = false }, 600) }
const handleTestTiDb = async () => { isTestingTiDb.value = true; try { await testTiDb() } finally { isTestingTiDb.value = false } }
const handleTestR2 = async () => { isTestingR2.value = true; try { await testR2() } finally { isTestingR2.value = false } }

const badgeStyle = (connected?: boolean, text?: string) => {
  if (connected) return { background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.25)', color: '#86efac' }
  if (text === 'Not Configured') return { background: 'rgba(232,136,42,0.08)', border: '1px solid rgba(232,136,42,0.25)', color: '#fbbf6a' }
  return { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }
}

const tidbStatusLabel = computed(() => props.tidb?.connected ? 'Connected' : props.tidb?.statusText === 'Not Configured' ? 'Not Configured' : 'Disconnected')
const tidbBadgeStyle = computed(() => badgeStyle(props.tidb?.connected, props.tidb?.statusText))
const tidbDotClasses = computed(() => props.tidb?.connected ? 'bg-green-400 animate-pulse' : props.tidb?.statusText === 'Not Configured' ? 'bg-amber-400' : 'bg-red-400')

const r2StatusLabel = computed(() => props.r2?.connected ? 'Connected' : props.r2?.statusText === 'Not Configured' ? 'Not Configured' : 'Disconnected')
const r2BadgeStyle = computed(() => badgeStyle(props.r2?.connected, props.r2?.statusText))
const r2DotClasses = computed(() => props.r2?.connected ? 'bg-green-400 animate-pulse' : props.r2?.statusText === 'Not Configured' ? 'bg-amber-400' : 'bg-red-400')
</script>
