<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-neutral-200/80 transition-transform duration-200 md:static md:translate-x-0"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Brand Logo & Header -->
    <div class="flex items-center justify-between h-18 px-6 border-b border-neutral-100">
      <NuxtLink to="/" class="flex items-center gap-2.5 group">
        <!-- Donezo-style Circular/Spiral Green Logo -->
        <div class="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
          style="background: linear-gradient(135deg, #16533a 0%, #144e35 100%);">
          <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" opacity="0.3"/>
            <path d="M12 4a8 8 0 100 16 8 8 0 000-16zm-1 12V8l5 4-5 4z" />
          </svg>
        </div>
        <div class="flex items-center">
          <span class="text-xl font-bold tracking-tight text-neutral-900">Kyo<span class="text-[#144e35]">DB</span></span>
        </div>
      </NuxtLink>

      <button class="md:hidden p-1.5 text-neutral-400 hover:text-neutral-700" @click="$emit('close')">
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Nav List Container -->
    <div class="flex-1 flex flex-col justify-between overflow-y-auto px-4 py-5 space-y-6">
      <!-- Section 1: MENU -->
      <div>
        <div class="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          MENU
        </div>
        <nav class="space-y-1">
          <NuxtLink
            v-for="item in primaryNavigation"
            :key="item.name"
            :to="item.to"
            class="donezo-nav-item group"
            :class="isActiveRoute(item.to) ? 'active' : ''"
          >
            <component
              :is="item.icon"
              class="w-4.5 h-4.5 transition-colors"
              :class="isActiveRoute(item.to) ? 'text-[#144e35]' : 'text-neutral-400 group-hover:text-neutral-600'"
            />
            <span class="flex-1">{{ item.name }}</span>

            <!-- Badge (e.g. 12+ like Donezo Tasks badge) -->
            <span
              v-if="item.badge"
              class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              :class="isActiveRoute(item.to) ? 'bg-[#144e35] text-white' : 'bg-neutral-100 text-neutral-600'"
            >
              {{ item.badge }}
            </span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Section 2: GENERAL -->
      <div>
        <div class="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
          GENERAL
        </div>
        <nav class="space-y-1">
          <NuxtLink
            v-for="item in secondaryNavigation"
            :key="item.name"
            :to="item.to"
            class="donezo-nav-item group"
            :class="isActiveRoute(item.to) ? 'active' : ''"
          >
            <component
              :is="item.icon"
              class="w-4.5 h-4.5 transition-colors"
              :class="isActiveRoute(item.to) ? 'text-[#144e35]' : 'text-neutral-400 group-hover:text-neutral-600'"
            />
            <span>{{ item.name }}</span>
          </NuxtLink>

          <!-- Sign Out -->
          <button
            class="w-full text-left donezo-nav-item group hover:text-rose-600"
            @click="handleLogout"
          >
            <LogOut class="w-4.5 h-4.5 text-neutral-400 group-hover:text-rose-500" />
            <span>Logout</span>
          </button>
        </nav>
      </div>

      <!-- Bottom Card: Mobile App / Storage Widget (Exact Donezo styling) -->
      <div class="rounded-2xl p-4 text-white relative overflow-hidden"
        style="background: radial-gradient(circle at 100% 0%, #1a5d3f 0%, #0c2a1c 85%);">
        <!-- Ambient wavy highlight -->
        <div class="absolute -right-6 -bottom-6 w-24 h-24 rounded-full blur-xl pointer-events-none"
          style="background: rgba(52, 211, 153, 0.25);"></div>

        <div class="flex items-center gap-2 mb-2">
          <div class="w-6 h-6 rounded-lg flex items-center justify-center bg-white/15">
            <HardDrive class="w-3.5 h-3.5 text-white" />
          </div>
          <span class="text-xs font-semibold">Cloud Infrastructure</span>
        </div>

        <p class="text-[11px] text-white/75 leading-relaxed mb-3">
          TiDB &amp; Cloudflare R2 connected &amp; ready.
        </p>

        <NuxtLink
          to="/storage"
          class="block w-full py-1.5 px-3 rounded-full text-center text-xs font-semibold transition-all"
          style="background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(4px); color: #ffffff;"
          @mouseenter="e => (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.25)'"
          @mouseleave="e => (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.15)'"
        >
          Explore Storage
        </NuxtLink>
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
  LogOut,
  X
} from '@lucide/vue'

defineProps<{ isOpen: boolean }>()
defineEmits<{ (e: 'close'): void }>()

const route = useRoute()
const auth = useAuth()

const isActiveRoute = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

const primaryNavigation = [
  { name: 'Dashboard',     to: '/',         icon: LayoutDashboard },
  { name: 'Projects',      to: '/projects', icon: FolderKanban, badge: 'Live' },
  { name: 'Databases',     to: '/databases', icon: Database },
  { name: 'SQL Editor',    to: '/sql-editor', icon: Terminal },
  { name: 'Cloud Storage', to: '/storage',   icon: HardDrive },
]

const secondaryNavigation = [
  { name: 'Monitoring',   to: '/monitoring', icon: Activity },
  { name: 'Settings',     to: '/settings',   icon: Settings },
]

const handleLogout = async () => {
  await auth.logout()
}
</script>
