<template>
  <div class="donezo-card p-5">
    <div class="flex items-center justify-between pb-4 mb-4 border-b border-neutral-100">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center bg-emerald-50 text-[#144e35]">
          <DatabaseZap class="h-4.5 w-4.5" />
        </div>
        <div>
          <h3 class="text-sm font-bold text-neutral-900">Schema Migrations</h3>
          <p class="text-[11px] text-neutral-400">Idempotent schema applied to <code class="text-[#144e35]">kyodb_system</code></p>
        </div>
      </div>

      <button
        class="btn-forest inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold disabled:opacity-50"
        :disabled="isRunning || !tidbConnected"
        @click="executeMigrations"
      >
        <Play class="h-3.5 w-3.5" :class="{ 'animate-spin': isRunning }" />
        <span>Run Migrations</span>
      </button>
    </div>

    <div>
      <div v-if="!tidbConnected" class="rounded-xl p-3 text-xs flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-800">
        <AlertTriangle class="h-4 w-4 shrink-0" />
        <span>TiDB Cloud is not connected. Configure <code class="font-bold">.env</code> credentials first.</span>
      </div>

      <div v-else class="text-xs space-y-1 text-neutral-500">
        <p>Target: <strong class="text-neutral-800">kyodb_system</strong> — 8 core metadata tables</p>
        <p>All migrations use <code class="text-[#144e35] font-mono">CREATE TABLE IF NOT EXISTS</code> — safe to run repeatedly.</p>
      </div>

      <div v-if="lastResult" class="mt-3 rounded-xl p-3 text-xs font-mono"
        :class="lastResult.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-800'">
        <div class="font-bold mb-1">{{ lastResult.success ? '✓ Success:' : '✗ Error:' }}</div>
        <div>{{ lastResult.message }}</div>
        <div v-if="lastResult.executedFiles?.length" class="mt-1 text-neutral-600">
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
