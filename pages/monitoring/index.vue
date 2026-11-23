<template>
  <div class="donezo-card p-8 text-center max-w-xl mx-auto my-12">
    <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-[#144e35] mb-4 shadow-xs">
      <Activity class="h-8 w-8" />
    </div>
    <h2 class="text-xl font-bold text-neutral-900">Resource Monitoring & Logs</h2>
    <p class="text-xs text-neutral-500 mt-2 max-w-md mx-auto leading-relaxed">
      Realtime query telemetry, TiDB/R2 bandwidth tracking, performance diagnostics, and full audit logs viewer.
    </p>
    <div class="mt-6 flex items-center justify-center gap-3">
      <NuxtLink to="/" class="btn-forest px-5 py-2 text-xs font-semibold">
        ← Return to Dashboard
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Activity } from '@lucide/vue'
definePageMeta({ middleware: 'auth' })
</script>
