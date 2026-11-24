<template>
  <aside
    class="fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-neutral-200/80 transition-transform duration-200 md:static md:translate-x-0"
    :class="isOpen ? 'translate-x-0' : '-translate-x-full'"
  >
    <!-- Brand Logo & Header (Height 64px / h-16 matches Navbar perfectly) -->
    <div class="flex items-center justify-between h-16 px-5 border-b border-neutral-100 shrink-0">
      <NuxtLink to="/dashboard" class="flex items-center gap-2 group">
        <!-- Official KyoDB Brand Logo (Precision Vector) -->
        <KyoLogo variant="light" size="md" />
        <span class="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80">
          v1.4
        </span>
      </NuxtLink>

      <button
        class="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        @click="$emit('close')"
      >
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Navigation List (Scrollable, neatly spaced) -->
    <div class="flex-1 overflow-y-auto px-3.5 py-4 space-y-6">
      <!-- Section 1: MENU -->
      <div>
        <div class="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          MENU
        </div>
        <nav class="space-y-1">
          <NuxtLink
            v-for="item in primaryNavigation"
            :key="item.name"
            :to="item.to"
            class="donezo-nav-item group relative"
            :class="isActiveRoute(item.to) ? 'active' : ''"
          >
            <!-- Left active indicator pill -->
            <span
              v-if="isActiveRoute(item.to)"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#144e35]"
            ></span>

            <!-- Icon with subtle background wrapper -->
            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              :class="isActiveRoute(item.to) ? 'bg-[#144e35]/10 text-[#144e35]' : 'text-neutral-400 group-hover:text-neutral-700 group-hover:bg-neutral-100'"
            >
              <component :is="item.icon" class="w-4 h-4" />
            </div>

            <span class="flex-1 text-xs">{{ item.name }}</span>

            <!-- Donezo live badge with pulse dot -->
            <span
              v-if="item.badge"
              class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
              :class="isActiveRoute(item.to) ? 'bg-[#144e35] text-white' : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" :class="isActiveRoute(item.to) ? 'bg-white' : ''"></span>
              {{ item.badge }}
            </span>
          </NuxtLink>
        </nav>
      </div>

      <!-- Section 2: GENERAL -->
      <div>
        <div class="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
          GENERAL
        </div>
        <nav class="space-y-1">
          <NuxtLink
            v-for="item in secondaryNavigation"
            :key="item.name"
            :to="item.to"
            class="donezo-nav-item group relative"
            :class="isActiveRoute(item.to) ? 'active' : ''"
          >
            <span
              v-if="isActiveRoute(item.to)"
              class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-[#144e35]"
            ></span>

            <div
              class="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
              :class="isActiveRoute(item.to) ? 'bg-[#144e35]/10 text-[#144e35]' : 'text-neutral-400 group-hover:text-neutral-700 group-hover:bg-neutral-100'"
            >
              <component :is="item.icon" class="w-4 h-4" />
            </div>

            <span class="flex-1 text-xs">{{ item.name }}</span>
          </NuxtLink>

          <!-- Logout -->
          <button
            class="w-full text-left donezo-nav-item group hover:text-rose-600 transition-colors"
            @click="handleLogout"
          >
            <div class="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 group-hover:text-rose-500 group-hover:bg-rose-50 transition-colors">
              <LogOut class="w-4 h-4" />
            </div>
            <span class="flex-1 text-xs font-medium">Logout</span>
          </button>
        </nav>
      </div>
    </div>

    <!-- Bottom Widget: Dedicated status card -->
    <div class="p-3.5 border-t border-neutral-100 bg-neutral-50/60 shrink-0">
      <div
        class="rounded-2xl p-3.5 text-white relative overflow-hidden shadow-xs"
        style="background: radial-gradient(circle at 100% 0%, #1e6b48 0%, #0c2b1d 85%);"
      >
        <!-- Ambient glow -->
        <div
          class="absolute -right-4 -bottom-4 w-16 h-16 rounded-full blur-xl pointer-events-none"
          style="background: rgba(52, 211, 153, 0.3);"
        ></div>

        <div class="flex items-center justify-between mb-1.5">
          <div class="flex items-center gap-2">
            <div class="w-6 h-6 rounded-lg flex items-center justify-center bg-white/15">
              <HardDrive class="w-3.5 h-3.5 text-white" />
            </div>
            <span class="text-xs font-bold text-white">Cluster Ready</span>
          </div>
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>

        <p class="text-[11px] text-white/75 leading-tight mb-3">
          TiDB Cloud &amp; Cloudflare R2 connected.
        </p>

        <NuxtLink
          to="/storage"
          class="block w-full py-1.5 px-3 rounded-full text-center text-xs font-semibold bg-white/15 hover:bg-white/25 text-white backdrop-blur-xs transition-all"
        >
          Explore Storage →
        </NuxtLink>
      </div>
    </div>
  </aside>
</template>

<script setup lang="ts">
import {
  LayoutGrid,
  FolderKanban,
  Database,
  Terminal,
  HardDrive,
  Activity,
  Settings,
  BookOpen,
  LogOut,
  X
} from '@lucide/vue'

defineProps<{ isOpen: boolean }>()
defineEmits<{ (e: 'close'): void }>()

const route = useRoute()
const auth = useAuth()

const isActiveRoute = (path: string) => {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path === path || (path !== '/dashboard' && route.path.startsWith(path) && path.length > 1)
}

const primaryNavigation = [
  { name: 'Dashboard',     to: '/dashboard', icon: LayoutGrid },
  { name: 'Projects',      to: '/projects',   icon: FolderKanban, badge: 'Live' },
  { name: 'Databases',     to: '/databases',  icon: Database },
  { name: 'SQL Editor',    to: '/sql-editor', icon: Terminal },
  { name: 'Cloud Storage', to: '/storage',    icon: HardDrive },
]

const secondaryNavigation = [
  { name: 'Monitoring',    to: '/monitoring', icon: Activity },
  { name: 'Settings',      to: '/settings',   icon: Settings },
  { name: 'Documentation', to: '/docs',       icon: BookOpen },
]

const handleLogout = async () => {
  await auth.logout()
}
</script>
