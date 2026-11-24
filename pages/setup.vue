<template>
  <div class="flex items-center justify-center min-h-[400px]">
    <div class="flex items-center gap-2 text-xs text-neutral-500">
      <Loader2 class="w-4 h-4 animate-spin text-[#144e35]" />
      <span>Redirecting to TiDB connection modal...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Loader2 } from '@lucide/vue'

definePageMeta({ layout: 'auth', middleware: 'auth' })

onMounted(() => {
  navigateTo('/app?connect=1')
})
</script>
