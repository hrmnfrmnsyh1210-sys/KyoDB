<template>
  <aside
    class="fixed inset-y-0 left-0 z-30 flex flex-col w-64 border-r border-slate-800/80 bg-[#0c121e] transition-transform duration-200 md:static md:translate-x-0"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Brand Header -->
    <div class="flex items-center justify-between h-16 px-6 border-b border-slate-800/80">
      <NuxtLink to="/" class="flex items-center gap-3 group">
        <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 shadow-lg shadow-cyan-500/10">
          <Database class="w-5 h-5 text-white" />
        </div>
        <div>
          <span class="text-lg font-bold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
            Kyo<span class="text-cyan-400">DB</span>
          </span>
          <span class="block text-[10px] font-medium text-slate-400 -mt-1 tracking-wider uppercase">Cloud Manager</span>
        </div>
      </NuxtLink>
      <button
        class="p-1 rounded-md text-slate-400 hover:text-white md:hidden"
        @click="$emit('close')"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Navigation Menu -->
    <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      <div class="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
        Core Platform
      </div>

      <NuxtLink
        v-for="item in primaryNavigation"
        :key="item.name"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 group"
        :class="isActiveRoute(item.to)
          ? 'bg-blue-600/15 text-cyan-400 border border-blue-500/30'
          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'"
      >
        <component
          :is="item.icon"
          class="w-4 h-4 transition-transform group-hover:scale-110"
          :class="isActiveRoute(item.to) ? 'text-cyan-400' : 'text-slate-400'"
        />
        <span>{{ item.name }}</span>
        <span
          v-if="item.badge"
          class="ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono font-medium"
          :class="item.badgeColor || 'bg-slate-800 text-slate-400 border border-slate-700'"
        >
          {{ item.badge }}
        </span>
      </NuxtLink>

      <div class="pt-5 px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
        System & Ops
      </div>

      <NuxtLink
        v-for="item in secondaryNavigation"
        :key="item.name"
        :to="item.to"
        class="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-150 group"
        :class="isActiveRoute(item.to)
          ? 'bg-blue-600/15 text-cyan-400 border border-blue-500/30'
          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'"
      >
        <component
          :is="item.icon"
          class="w-4 h-4 transition-transform group-hover:scale-110"
          :class="isActiveRoute(item.to) ? 'text-cyan-400' : 'text-slate-400'"
        />
        <span>{{ item.name }}</span>
        <span
          v-if="item.badge"
          class="ml-auto text-[10px] px-1.5 py-0.5 rounded font-mono font-medium"
          :class="item.badgeColor || 'bg-slate-800 text-slate-400 border border-slate-700'"
        >
          {{ item.badge }}
        </span>
      </NuxtLink>
    </nav>

    <!-- Hybrid Storage Architecture Indicator -->
    <div class="p-3 m-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
      <div class="flex items-center justify-between text-slate-400 font-medium mb-1.5">
        <span class="flex items-center gap-1.5">
          <Layers class="w-3.5 h-3.5 text-blue-400" />
          <span>Storage Engine</span>
        </span>
        <span class="text-[10px] text-cyan-400 font-mono">v1.0 (P1)</span>
      </div>
      <div class="space-y-1.5 text-[11px]">
        <div class="flex items-center justify-between text-slate-300">
          <span class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            TiDB Cloud (SQL)
          </span>
          <span class="font-mono text-[10px] text-slate-400">Active</span>
        </div>
        <div class="flex items-center justify-between text-slate-300">
          <span class="flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
            Cloudflare R2
          </span>
          <span class="font-mono text-[10px] text-slate-400">Active</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  LayoutDashboard,
  FolderKanban,
  Database,
  Terminal,
  HardDrive,
  Activity,
  Settings,
  X,
  Layers
} from '@lucide/vue'

defineProps<{
  isOpen: boolean
}>()

defineEmits<{
  (e: 'close'): void
}>()

const route = useRoute()

const isActiveRoute = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const primaryNavigation = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { name: 'Projects', to: '/projects', icon: FolderKanban, badge: 'Phase 2' },
  { name: 'Databases', to: '/databases', icon: Database, badge: 'Phase 3' },
  { name: 'SQL Editor', to: '/sql-editor', icon: Terminal, badge: 'Phase 3' },
  { name: 'Cloud Storage', to: '/storage', icon: HardDrive, badge: 'Phase 4' }
]

const secondaryNavigation = [
  { name: 'Monitoring', to: '/monitoring', icon: Activity, badge: 'Phase 5' },
  { name: 'Settings & API', to: '/settings', icon: Settings, badge: 'Phase 6' }
]
</script>
