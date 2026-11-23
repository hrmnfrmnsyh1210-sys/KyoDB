<template>
  <div class="donezo-card p-8 text-center max-w-xl mx-auto my-12">
    <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-700 mb-4 shadow-xs">
      <Settings class="h-8 w-8" />
    </div>
    <h2 class="text-xl font-bold text-neutral-900">System Settings & Project API Keys</h2>
    <p class="text-xs text-neutral-500 mt-2 max-w-md mx-auto leading-relaxed">
      Hashed API keys management, permission scoping, 2FA TOTP setup, and backup automation are available in Settings.
    </p>
    <div class="mt-6 flex items-center justify-center gap-3">
      <NuxtLink to="/" class="btn-forest px-5 py-2 text-xs font-semibold">
        ← Return to Dashboard
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Settings } from '@lucide/vue'
definePageMeta({ middleware: 'auth' })
</script>
