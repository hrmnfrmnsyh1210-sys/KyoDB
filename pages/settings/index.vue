<template>
  <div class="rounded-2xl border border-slate-800/80 bg-[#0f172a]/70 p-12 text-center backdrop-blur">
    <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-slate-300 border border-slate-700 mb-4">
      <Settings class="h-7 w-7" />
    </div>
    <h2 class="text-xl font-bold text-white">System Settings & Project API Keys</h2>
    <p class="text-xs text-slate-400 mt-2 max-w-md mx-auto">
      Hashed API keys management, permission scoping, 2FA TOTP setup, and backup automation are scheduled for <strong>Phase 6</strong>.
    </p>
    <div class="mt-6">
      <NuxtLink to="/" class="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 transition-colors">
        ← Return to Dashboard
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Settings } from '@lucide/vue'
definePageMeta({ middleware: 'auth' })
</script>
