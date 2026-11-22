<template>
  <header class="h-16 border-b border-slate-800/80 bg-[#0c121e]/90 backdrop-blur sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
    <div class="flex items-center gap-3">
      <button
        class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 md:hidden"
        @click="$emit('toggle-sidebar')"
      >
        <Menu class="w-5 h-5" />
      </button>

      <div class="hidden sm:flex items-center gap-2">
        <span class="text-xs px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
          Production Ready Architecture
        </span>
      </div>
    </div>

    <!-- Right status & user menu -->
    <div class="flex items-center gap-3 sm:gap-4">
      <!-- Live TiDB Indicator Pill -->
      <div
        class="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border"
        :class="tidbStatusClasses"
      >
        <span class="w-2 h-2 rounded-full" :class="tidbDotClasses"></span>
        <span class="font-medium">TiDB:</span>
        <span>{{ tidbStatusText }}</span>
      </div>

      <!-- Live R2 Indicator Pill -->
      <div
        class="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border"
        :class="r2StatusClasses"
      >
        <span class="w-2 h-2 rounded-full" :class="r2DotClasses"></span>
        <span class="font-medium">R2:</span>
        <span>{{ r2StatusText }}</span>
      </div>

      <!-- Refresh Status Button -->
      <button
        class="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
        title="Refresh Cloud Connection Status"
        :disabled="isChecking"
        @click="checkHealth"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isChecking }" />
      </button>

      <!-- Admin User Profile / Logout -->
      <div class="relative flex items-center gap-2 pl-2 border-l border-slate-800">
        <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shadow">
          {{ userInitials }}
        </div>
        <div class="hidden md:block text-left">
          <div class="text-xs font-semibold text-white leading-tight">
            {{ auth.user.value?.username || 'Administrator' }}
          </div>
          <div class="text-[10px] text-slate-400 leading-tight">
            {{ auth.user.value?.email || 'admin@kyodb' }}
          </div>
        </div>

        <button
          class="p-1.5 ml-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Sign Out"
          @click="handleLogout"
        >
          <LogOut class="w-4 h-4" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, RefreshCw, LogOut } from '@lucide/vue'

defineEmits<{
  (e: 'toggle-sidebar'): void
}>()

const auth = useAuth()
const { health, isChecking, checkHealth } = useSystemHealth()

onMounted(async () => {
  if (!health.value) {
    await checkHealth()
  }
})

const userInitials = computed(() => {
  const username = auth.user.value?.username || 'Admin'
  return username.slice(0, 2).toUpperCase()
})

const tidbStatusText = computed(() => {
  if (!health.value?.tidb) return 'Checking...'
  if (health.value.tidb.connected) return `${health.value.tidb.latencyMs ?? 0}ms`
  if (health.value.tidb.statusText === 'Not Configured') return 'Not Configured'
  return 'Offline'
})

const tidbStatusClasses = computed(() => {
  if (health.value?.tidb?.connected) {
    return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
  }
  if (health.value?.tidb?.statusText === 'Not Configured') {
    return 'bg-amber-500/10 border-amber-500/30 text-amber-300'
  }
  return 'bg-rose-500/10 border-rose-500/30 text-rose-300'
})

const tidbDotClasses = computed(() => {
  if (health.value?.tidb?.connected) return 'bg-emerald-400 animate-pulse'
  if (health.value?.tidb?.statusText === 'Not Configured') return 'bg-amber-400'
  return 'bg-rose-400'
})

const r2StatusText = computed(() => {
  if (!health.value?.r2) return 'Checking...'
  if (health.value.r2.connected) return `${health.value.r2.latencyMs ?? 0}ms`
  if (health.value.r2.statusText === 'Not Configured') return 'Not Configured'
  return 'Offline'
})

const r2StatusClasses = computed(() => {
  if (health.value?.r2?.connected) {
    return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
  }
  if (health.value?.r2?.statusText === 'Not Configured') {
    return 'bg-amber-500/10 border-amber-500/30 text-amber-300'
  }
  return 'bg-rose-500/10 border-rose-500/30 text-rose-300'
})

const r2DotClasses = computed(() => {
  if (health.value?.r2?.connected) return 'bg-emerald-400 animate-pulse'
  if (health.value?.r2?.statusText === 'Not Configured') return 'bg-amber-400'
  return 'bg-rose-400'
})

const handleLogout = async () => {
  await auth.logout()
}
</script>
