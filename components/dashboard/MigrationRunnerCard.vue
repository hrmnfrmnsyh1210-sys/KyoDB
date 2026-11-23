<template>
  <div class="rounded-xl p-5" style="background:#1c1208; border:1px solid #2e1c0d;">
    <div class="flex items-center justify-between pb-4 mb-4" style="border-bottom:1px solid #2e1c0d;">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center" style="background:rgba(232,136,42,0.1);">
          <DatabaseZap class="h-4.5 w-4.5" style="color:#e8882a;" />
        </div>
        <div>
          <h3 class="text-sm font-semibold" style="color:#f0e6d8;">Schema Migrations</h3>
          <p class="text-[11px]" style="color:#9a8070;">Idempotent schema applied to <code style="color:#e8882a;">kyodb_system</code></p>
        </div>
      </div>

      <button
        class="btn-amber inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="isRunning || !tidbConnected"
        @click="executeMigrations"
      >
        <Play class="h-3.5 w-3.5" :class="{ 'animate-spin': isRunning }" />
        <span>Run Migrations</span>
      </button>
    </div>

    <div>
      <div v-if="!tidbConnected" class="rounded-xl p-3 text-xs flex items-center gap-2"
        style="background:rgba(232,136,42,0.08); border:1px solid rgba(232,136,42,0.25); color:#fbbf6a;">
        <AlertTriangle class="h-4 w-4 shrink-0" />
        <span>TiDB Cloud is not connected. Configure <code style="color:#f0e6d8;">.env</code> credentials first.</span>
      </div>

      <div v-else class="text-xs space-y-1.5" style="color:#9a8070;">
        <p style="color:#c4a882;">Target: <strong style="color:#f0e6d8;">kyodb_system</strong> — 8 core metadata tables</p>
        <p>All migrations use <code style="color:#e8882a;" class="font-mono">CREATE TABLE IF NOT EXISTS</code> — safe to run repeatedly.</p>
      </div>

      <div v-if="lastResult" class="mt-3 rounded-xl p-3 text-xs font-mono"
        :style="lastResult.success
          ? 'background:rgba(34,197,94,0.07); border:1px solid rgba(34,197,94,0.25); color:#86efac;'
          : 'background:rgba(239,68,68,0.07); border:1px solid rgba(239,68,68,0.25); color:#fca5a5;'">
        <div class="font-bold mb-1">{{ lastResult.success ? '✓ Success:' : '✗ Error:' }}</div>
        <div>{{ lastResult.message }}</div>
        <div v-if="lastResult.executedFiles?.length" class="mt-1" style="color:#c4a882;">
          Applied: {{ lastResult.executedFiles.join(', ') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DatabaseZap, Play, AlertTriangle } from '@lucide/vue'

defineProps<{ tidbConnected: boolean }>()
const emit = defineEmits<{ (e: 'migrated'): void }>()

const isRunning = ref(false)
const lastResult = ref<{ success: boolean; message: string; executedFiles?: string[] } | null>(null)

const executeMigrations = async () => {
  isRunning.value = true
  lastResult.value = null
  try {
    const res = await $fetch<{ success: boolean; message: string; executedFiles: string[] }>('/api/migrations/run', { method: 'POST' })
    lastResult.value = res
    emit('migrated')
  } catch (err: any) {
    lastResult.value = { success: false, message: err.data?.statusMessage || err.message || 'Migration failed' }
  } finally {
    isRunning.value = false
  }
}
</script>
