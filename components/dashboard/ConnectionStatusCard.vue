<template>
  <div class="donezo-card p-5">
    <!-- Header -->
    <div class="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 text-[#144e35]">
          <Activity class="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-neutral-900">Cloud Infrastructure</h3>
          <p class="text-[11px] text-neutral-400">TiDB Cloud &amp; Cloudflare R2 health</p>
        </div>
      </div>

      <button
        class="btn-white-pill inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
        :disabled="isRefreshing"
        @click="refreshAll"
      >
        <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': isRefreshing }" />
        <span>Check All</span>
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- TiDB Card -->
      <div class="rounded-xl p-4 bg-neutral-50 border border-neutral-200/80">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-[#144e35] border border-neutral-200">
              <Database class="h-4 w-4" />
            </div>
            <div>
              <div class="text-sm font-bold text-neutral-900">TiDB Cloud</div>
              <div class="text-[11px] text-neutral-400">Structured SQL</div>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-mono border" :class="tidbBadgeClass">
            <span class="h-1.5 w-1.5 rounded-full" :class="tidbDotClasses"></span>
            {{ tidbStatusLabel }}
          </span>
        </div>

        <div class="space-y-1.5 text-[11px] font-mono">
          <div class="flex justify-between">
            <span class="text-neutral-400">Latency</span>
            <span class="font-bold text-neutral-800">{{ tidb?.latencyMs !== undefined ? `${tidb.latencyMs} ms` : 'N/A' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-400">Database</span>
            <span class="text-[#144e35] font-semibold">kyodb_system</span>
          </div>
          <div v-if="tidb?.error" class="mt-2 rounded-lg p-2 text-[11px] bg-rose-50 border border-rose-200 text-rose-700">
            {{ tidb.error }}
          </div>
        </div>

        <div class="mt-3 pt-3 flex justify-end border-t border-neutral-200/60">
          <button
            class="text-xs font-semibold text-[#144e35] hover:underline inline-flex items-center gap-1"
            :disabled="isTestingTiDb"
            @click="handleTestTiDb"
          >
            <RefreshCw class="h-3 w-3" :class="{ 'animate-spin': isTestingTiDb }" />
            Test Connection
          </button>
        </div>
      </div>

      <!-- R2 Card -->
      <div class="rounded-xl p-4 bg-neutral-50 border border-neutral-200/80">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-white text-[#144e35] border border-neutral-200">
              <HardDrive class="h-4 w-4" />
            </div>
            <div>
              <div class="text-sm font-bold text-neutral-900">Cloudflare R2</div>
              <div class="text-[11px] text-neutral-400">Object Storage</div>
            </div>
          </div>
          <span class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-mono border" :class="r2BadgeClass">
            <span class="h-1.5 w-1.5 rounded-full" :class="r2DotClasses"></span>
            {{ r2StatusLabel }}
          </span>
        </div>

        <div class="space-y-1.5 text-[11px] font-mono">
          <div class="flex justify-between">
            <span class="text-neutral-400">Latency</span>
            <span class="font-bold text-neutral-800">{{ r2?.latencyMs !== undefined ? `${r2.latencyMs} ms` : 'N/A' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-400">Bucket</span>
            <span class="text-[#144e35] font-semibold">{{ r2?.details?.bucket || 'via .env' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-400">Protocol</span>
            <span class="text-neutral-800">S3 Presigned</span>
          </div>
          <div v-if="r2?.error" class="mt-2 rounded-lg p-2 text-[11px] bg-rose-50 border border-rose-200 text-rose-700">
            {{ r2.error }}
          </div>
        </div>

        <div class="mt-3 pt-3 flex justify-end border-t border-neutral-200/60">
          <button
            class="text-xs font-semibold text-[#144e35] hover:underline inline-flex items-center gap-1"
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

const tidbStatusLabel = computed(() => props.tidb?.connected ? 'Connected' : props.tidb?.statusText === 'Not Configured' ? 'Not Configured' : 'Disconnected')
const tidbBadgeClass = computed(() => props.tidb?.connected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-100 text-neutral-600 border-neutral-200')
const tidbDotClasses = computed(() => props.tidb?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400')

const r2StatusLabel = computed(() => props.r2?.connected ? 'Connected' : props.r2?.statusText === 'Not Configured' ? 'Not Configured' : 'Disconnected')
const r2BadgeClass = computed(() => props.r2?.connected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-neutral-100 text-neutral-600 border-neutral-200')
const r2DotClasses = computed(() => props.r2?.connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400')
</script>
