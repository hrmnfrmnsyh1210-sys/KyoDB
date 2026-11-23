<template>
  <header
    class="h-14 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6"
    style="background:#0d0804; border-bottom:1px solid #2a1a0c;"
  >
    <!-- Left: Mobile hamburger + Search bar -->
    <div class="flex items-center gap-3 flex-1">
      <button
        class="p-2 rounded-lg md:hidden transition-colors"
        style="color:#9a8070;"
        @click="$emit('toggle-sidebar')"
      >
        <Menu class="w-5 h-5" />
      </button>

      <!-- Search pill — matches reference design -->
      <div class="hidden sm:flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs max-w-xs w-full cursor-pointer group transition-all"
        style="background:#1c1208; border:1px solid #2e1c0d; color:#9a8070;"
      >
        <Search class="w-3.5 h-3.5 shrink-0" />
        <span class="flex-1">Search...</span>
        <kbd class="text-[10px] rounded px-1.5 py-0.5 font-mono" style="background:#2a1a0c; color:#6a5545;">⌘K</kbd>
      </div>
    </div>

    <!-- Right side controls -->
    <div class="flex items-center gap-2">
      <!-- TiDB status pill -->
      <div
        class="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border"
        :style="tidbStyleObj"
      >
        <span class="w-1.5 h-1.5 rounded-full" :class="tidbDotClasses"></span>
        <span class="font-medium">TiDB</span>
        <span>{{ tidbStatusText }}</span>
      </div>

      <!-- R2 status pill -->
      <div
        class="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono border"
        :style="r2StyleObj"
      >
        <span class="w-1.5 h-1.5 rounded-full" :class="r2DotClasses"></span>
        <span class="font-medium">R2</span>
        <span>{{ r2StatusText }}</span>
      </div>

      <!-- Refresh -->
      <button
        class="p-2 rounded-lg transition-colors"
        style="color:#9a8070;"
        title="Refresh Connection Status"
        :disabled="isChecking"
        @click="checkHealth"
      >
        <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isChecking }" />
      </button>

      <!-- Divider -->
      <div class="h-8 w-px mx-1" style="background:#2e1c0d;"></div>

      <!-- User avatar + info -->
      <div class="flex items-center gap-2.5">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-lg"
          style="background:linear-gradient(135deg,#e8882a,#c46010);"
        >
          {{ userInitials }}
        </div>
        <div class="hidden md:block text-left">
          <div class="text-xs font-semibold leading-tight" style="color:#f0e6d8;">
            {{ auth.user.value?.username || 'Administrator' }}
          </div>
          <div class="text-[10px] leading-tight" style="color:#6a5545;">
            {{ auth.user.value?.email || 'admin@kyodb' }}
          </div>
        </div>

        <!-- Logout -->
        <button
          class="p-1.5 rounded-lg transition-colors"
          style="color:#9a8070;"
          title="Sign Out"
          @click="handleLogout"
        >
          <LogOut class="w-4 h-4 hover:text-red-400" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { Menu, Search, RefreshCw, LogOut } from '@lucide/vue'

defineEmits<{ (e: 'toggle-sidebar'): void }>()

const auth = useAuth()
const { health, isChecking, checkHealth } = useSystemHealth()

onMounted(async () => {
  if (!health.value) await checkHealth()
})

const userInitials = computed(() => {
  const u = auth.user.value?.username || 'Admin'
  return u.slice(0, 2).toUpperCase()
})

const tidbStatusText = computed(() => {
  if (!health.value?.tidb) return 'Checking...'
  if (health.value.tidb.connected) return `${health.value.tidb.latencyMs ?? 0}ms`
  if (health.value.tidb.statusText === 'Not Configured') return 'No Config'
  return 'Offline'
})

const tidbStyleObj = computed(() => {
  if (health.value?.tidb?.connected)
    return { background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.25)', color: '#86efac' }
  if (health.value?.tidb?.statusText === 'Not Configured')
    return { background: 'rgba(232,136,42,0.08)', border: '1px solid rgba(232,136,42,0.25)', color: '#fbbf6a' }
  return { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }
})

const tidbDotClasses = computed(() => {
  if (health.value?.tidb?.connected) return 'bg-green-400 animate-pulse'
  if (health.value?.tidb?.statusText === 'Not Configured') return 'bg-amber-400'
  return 'bg-red-400'
})

const r2StatusText = computed(() => {
  if (!health.value?.r2) return 'Checking...'
  if (health.value.r2.connected) return `${health.value.r2.latencyMs ?? 0}ms`
  if (health.value.r2.statusText === 'Not Configured') return 'No Config'
  return 'Offline'
})

const r2StyleObj = computed(() => {
  if (health.value?.r2?.connected)
    return { background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.25)', color: '#86efac' }
  if (health.value?.r2?.statusText === 'Not Configured')
    return { background: 'rgba(232,136,42,0.08)', border: '1px solid rgba(232,136,42,0.25)', color: '#fbbf6a' }
  return { background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#fca5a5' }
})

const r2DotClasses = computed(() => {
  if (health.value?.r2?.connected) return 'bg-green-400 animate-pulse'
  if (health.value?.r2?.statusText === 'Not Configured') return 'bg-amber-400'
  return 'bg-red-400'
})

const handleLogout = async () => { await auth.logout() }
</script>
