<template>
  <header class="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 border-b border-neutral-200/80 bg-[#f4f5f6] shrink-0">
    <!-- Left: Hamburger on Mobile + Pill Search Bar (Donezo style) -->
    <div class="flex items-center gap-3 flex-1 max-w-md">
      <button
        class="p-2 rounded-xl md:hidden text-neutral-600 hover:bg-white hover:text-neutral-900 border border-neutral-200 bg-white shadow-xs"
        @click="$emit('toggle-sidebar')"
      >
        <Menu class="w-5 h-5" />
      </button>

      <!-- Pill Search Bar with ⌘F -->
      <div class="flex items-center gap-2.5 rounded-full px-4 py-2 bg-white border border-neutral-200/80 shadow-xs w-full text-xs transition-all focus-within:border-[#144e35] focus-within:ring-1 focus-within:ring-[#144e35]/20">
        <Search class="w-4 h-4 text-neutral-400 shrink-0" />
        <input
          type="text"
          placeholder="Search task, project, database or files..."
          class="w-full bg-transparent border-none outline-none text-neutral-800 placeholder-neutral-400 text-xs"
        />
        <kbd class="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
          ⌘F
        </kbd>
      </div>
    </div>

    <!-- Right Controls: Status Pills + Refresh Button + User Capsule -->
    <div class="flex items-center gap-3">
      <!-- TiDB Health status pill -->
      <div
        class="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border shadow-xs"
        :class="tidbClass"
      >
        <span class="w-2 h-2 rounded-full" :class="tidbDotClass"></span>
        <span class="font-semibold">TiDB</span>
        <span class="text-neutral-500 font-normal">{{ tidbStatusText }}</span>
      </div>

      <!-- R2 Health status pill -->
      <div
        class="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border shadow-xs"
        :class="r2Class"
      >
        <span class="w-2 h-2 rounded-full" :class="r2DotClass"></span>
        <span class="font-semibold">R2</span>
        <span class="text-neutral-500 font-normal">{{ r2StatusText }}</span>
      </div>

      <!-- Notification Round Button -->
      <button
        class="w-9 h-9 rounded-full bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 shadow-xs transition-colors relative"
        title="Refresh Status"
        :disabled="isChecking"
        @click="checkHealth"
      >
        <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isChecking }" />
      </button>

      <!-- Donezo User Profile Capsule -->
      <div class="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full bg-white border border-neutral-200/80 shadow-xs">
        <!-- Avatar Circle -->
        <div class="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold text-white shadow-xs"
          style="background: linear-gradient(135deg, #185a3c 0%, #12452e 100%);">
          {{ userInitials }}
        </div>

        <!-- Name & Email -->
        <div class="hidden sm:block text-left leading-tight">
          <div class="text-xs font-semibold text-neutral-900">
            {{ auth.user.value?.username || 'Admin' }}
          </div>
          <div class="text-[10px] text-neutral-400">
            {{ auth.user.value?.email || 'admin@kyodb.local' }}
          </div>
        </div>

        <button
          class="text-neutral-400 hover:text-rose-600 p-1 rounded-full hover:bg-neutral-100 transition-colors ml-0.5"
          title="Sign Out"
          @click="handleLogout"
        >
          <LogOut class="w-3.5 h-3.5" />
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
  const u = auth.user.value?.username || 'AD'
  return u.slice(0, 2).toUpperCase()
})

const tidbStatusText = computed(() => {
  if (!health.value?.tidb) return 'Checking'
  if (health.value.tidb.connected) return `${health.value.tidb.latencyMs ?? 0}ms`
  if (health.value.tidb.statusText === 'Not Configured') return 'Offline'
  return 'Offline'
})

const tidbClass = computed(() => {
  if (health.value?.tidb?.connected) return 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
  return 'bg-neutral-100 border-neutral-200 text-neutral-700'
})

const tidbDotClass = computed(() => {
  if (health.value?.tidb?.connected) return 'bg-emerald-500 animate-pulse'
  return 'bg-amber-400'
})

const r2StatusText = computed(() => {
  if (!health.value?.r2) return 'Checking'
  if (health.value.r2.connected) return `${health.value.r2.latencyMs ?? 0}ms`
  if (health.value.r2.statusText === 'Not Configured') return 'Offline'
  return 'Offline'
})

const r2Class = computed(() => {
  if (health.value?.r2?.connected) return 'bg-emerald-50/60 border-emerald-200 text-emerald-800'
  return 'bg-neutral-100 border-neutral-200 text-neutral-700'
})

const r2DotClass = computed(() => {
  if (health.value?.r2?.connected) return 'bg-emerald-500 animate-pulse'
  return 'bg-amber-400'
})

const handleLogout = async () => {
  await auth.logout()
}
</script>
