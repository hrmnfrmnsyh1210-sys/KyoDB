<template>
  <!-- Icon-only sidebar — compact, dark warm brown, like the reference dashboard -->
  <aside
    class="fixed inset-y-0 left-0 z-30 flex flex-col w-16 border-r transition-transform duration-200 md:static md:translate-x-0"
    style="background:#0d0804; border-color:#2a1a0c;"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Brand Icon -->
    <div class="flex items-center justify-center h-16 border-b" style="border-color:#2a1a0c;">
      <NuxtLink to="/" class="group relative flex items-center justify-center w-10 h-10 rounded-xl overflow-hidden" title="KyoDB">
        <div class="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-600 to-amber-800 rounded-xl"></div>
        <Database class="relative w-5 h-5 text-white z-10" />
      </NuxtLink>
    </div>

    <!-- Primary Navigation -->
    <nav class="flex-1 flex flex-col items-center gap-1 py-4 px-2">
      <NuxtLink
        v-for="item in primaryNavigation"
        :key="item.name"
        :to="item.to"
        class="sidebar-icon-btn relative group"
        :class="isActiveRoute(item.to) ? 'active' : ''"
        :title="item.name"
      >
        <component :is="item.icon" class="w-4.5 h-4.5" />

        <!-- Tooltip -->
        <div class="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl"
          style="background:#231509; border:1px solid #3a2410; color:#f0e6d8;">
          {{ item.name }}
        </div>

        <!-- Active indicator bar -->
        <div
          v-if="isActiveRoute(item.to)"
          class="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-l-full"
          style="background:#e8882a;"
        ></div>
      </NuxtLink>
    </nav>

    <!-- Bottom Nav -->
    <div class="flex flex-col items-center gap-1 py-4 px-2 border-t" style="border-color:#2a1a0c;">
      <NuxtLink
        v-for="item in secondaryNavigation"
        :key="item.name"
        :to="item.to"
        class="sidebar-icon-btn relative group"
        :class="isActiveRoute(item.to) ? 'active' : ''"
        :title="item.name"
      >
        <component :is="item.icon" class="w-4.5 h-4.5" />

        <div class="absolute left-full ml-3 px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl"
          style="background:#231509; border:1px solid #3a2410; color:#f0e6d8;">
          {{ item.name }}
        </div>

        <div
          v-if="isActiveRoute(item.to)"
          class="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-l-full"
          style="background:#e8882a;"
        ></div>
      </NuxtLink>
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
  X
} from '@lucide/vue'

defineProps<{ isOpen: boolean }>()
defineEmits<{ (e: 'close'): void }>()

const route = useRoute()

const isActiveRoute = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const primaryNavigation = [
  { name: 'Dashboard',     to: '/',         icon: LayoutDashboard },
  { name: 'Projects',      to: '/projects', icon: FolderKanban },
  { name: 'Databases',     to: '/databases', icon: Database },
  { name: 'SQL Editor',    to: '/sql-editor', icon: Terminal },
  { name: 'Cloud Storage', to: '/storage',   icon: HardDrive },
]

const secondaryNavigation = [
  { name: 'Monitoring',   to: '/monitoring', icon: Activity },
  { name: 'Settings & API', to: '/settings', icon: Settings },
]
</script>
