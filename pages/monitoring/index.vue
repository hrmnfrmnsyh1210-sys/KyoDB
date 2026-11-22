<template>
  <div class="rounded-2xl border border-slate-800/80 bg-[#0f172a]/70 p-12 text-center backdrop-blur">
    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-4">
      <Activity class="h-7 w-7" />
    </div>
    <h2 class="text-xl font-bold text-white">Resource Monitoring & Logs</h2>
    <p class="text-xs text-slate-400 mt-2 max-w-md mx-auto">
      Resource telemetry, TiDB/R2 bandwidth tracking, query statistics, and audit logs viewer are scheduled for <strong>Phase 5</strong>.
    </p>
    <div class="mt-6">
      <NuxtLink to="/" class="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors">
        ← Return to Dashboard
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Activity } from '@lucide/vue'
definePageMeta({ middleware: 'auth' })
</script>
