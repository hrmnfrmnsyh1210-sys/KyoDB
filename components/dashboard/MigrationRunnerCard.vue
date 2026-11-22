<template>
  <div class="rounded-xl border border-slate-800/80 bg-[#0f172a]/70 p-5 backdrop-blur">
    <div class="flex items-center justify-between border-b border-slate-800/60 pb-4">
      <div class="flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
          <DatabaseZap class="h-5 w-5" />
        </div>
        <div>
          <h3 class="text-base font-semibold text-white">Database Schema Migrations</h3>
          <p class="text-xs text-slate-400">Manage and safely apply idempotent schema to <code class="text-cyan-400">kyodb_system</code></p>
        </div>
      </div>

      <button
        class="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isRunning || !tidbConnected"
        @click="executeMigrations"
      >
        <Play class="h-3.5 w-3.5" :class="{ 'animate-spin': isRunning }" />
        <span>Run Pending Migrations</span>
      </button>
    </div>

    <div class="mt-4">
      <div v-if="!tidbConnected" class="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-300 flex items-center gap-2">
        <AlertTriangle class="h-4 w-4 shrink-0" />
        <span>TiDB Cloud connection is not active. Connect TiDB in <code class="text-white">.env</code> before executing migrations.</span>
      </div>

      <div v-else class="text-xs text-slate-300 space-y-2">
        <p>
          Target: <strong class="text-white">kyodb_system</strong> (8 core metadata tables: admin_users, sessions, projects, project_databases, storage_objects, api_keys, audit_logs, query_history).
        </p>
        <p class="text-slate-400">
          All migrations are transactional and safe to run multiple times with <code class="text-cyan-400 font-mono">CREATE TABLE IF NOT EXISTS</code>.
        </p>
      </div>

      <div v-if="lastResult" class="mt-3 rounded-lg p-3 text-xs border font-mono" :class="lastResult.success ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'">
        <div class="font-bold mb-1">{{ lastResult.success ? '✓ Migration Status:' : '✗ Migration Error:' }}</div>
        <div>{{ lastResult.message }}</div>
        <div v-if="lastResult.executedFiles?.length" class="mt-1 text-slate-300">
          Files applied: {{ lastResult.executedFiles.join(', ') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DatabaseZap, Play, AlertTriangle } from '@lucide/vue'

defineProps<{
  tidbConnected: boolean
}>()

const emit = defineEmits<{
  (e: 'migrated'): void
}>()

const isRunning = ref(false)
const lastResult = ref<{ success: boolean; message: string; executedFiles?: string[] } | null>(null)

const executeMigrations = async () => {
  isRunning.value = true
  lastResult.value = null
  try {
    const res = await $fetch<{ success: boolean; message: string; executedFiles: string[] }>(
      '/api/migrations/run',
      { method: 'POST' }
    )
    lastResult.value = res
    emit('migrated')
  } catch (err: any) {
    lastResult.value = {
      success: false,
      message: err.data?.statusMessage || err.message || 'Failed to execute migrations'
    }
  } finally {
    isRunning.value = false
  }
}
</script>
