<template>
  <div class="rounded-2xl border border-slate-800/80 bg-[#0f172a]/70 p-12 text-center backdrop-blur">
    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 mb-4">
      <Terminal class="h-7 w-7" />
    </div>
    <h2 class="text-xl font-bold text-white">Monaco SQL Editor</h2>
    <p class="text-xs text-slate-400 mt-2 max-w-md mx-auto">
      Monaco editor with syntax highlighting, read-only/write modes, parameterized query execution, and query history are scheduled for <strong>Phase 3</strong>.
    </p>
    <div class="mt-6">
      <NuxtLink to="/" class="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors">
        ← Return to Dashboard
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Terminal } from '@lucide/vue'
definePageMeta({ middleware: 'auth' })
</script>
