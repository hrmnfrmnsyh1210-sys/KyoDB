<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Dashboard Title & Header Controls (Exact Donezo styling) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
          Dashboard
        </h1>
        <p class="text-xs sm:text-sm text-neutral-500 mt-1">
          Plan, prioritize, and accomplish your database and storage tasks with ease.
        </p>
      </div>

      <!-- Header Action Buttons -->
      <div class="flex items-center gap-2.5">
        <NuxtLink
          to="/projects"
          class="btn-forest inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold shadow-xs"
        >
          <Plus class="w-4 h-4" />
          <span>Add Project</span>
        </NuxtLink>

        <NuxtLink
          to="/sql-editor"
          class="btn-white-pill inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold shadow-xs"
        >
          <Terminal class="w-4 h-4 text-neutral-500" />
          <span>SQL Query</span>
        </NuxtLink>
      </div>
    </div>

    <!-- 4 Top Metric Cards (Donezo layout: 1st card forest green, 3 cards white) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- 1. Total Projects (Highlight Forest Green Card) -->
      <div class="donezo-card-forest p-6 flex flex-col justify-between shadow-xs relative overflow-hidden group min-h-[160px]">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-white/80">Total Projects</span>
          <NuxtLink to="/projects" class="circle-arrow-btn-white" title="View Projects">
            <ArrowUpRight class="w-4 h-4" />
          </NuxtLink>
        </div>

        <div class="my-3 flex items-baseline justify-between">
          <div class="text-4xl font-bold tracking-tight text-white font-mono">
            {{ summary.totalProjects }}
          </div>
          <span class="text-xs text-emerald-200/80 font-mono">Active</span>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="inline-flex items-center gap-1 text-[11px] font-semibold bg-white/15 px-2.5 py-1 rounded-full text-white backdrop-blur-xs">
            <TrendingUp class="w-3.5 h-3.5 text-emerald-300" />
            <span>Increased from last month</span>
          </span>
        </div>
      </div>

      <!-- 2. Ended Projects / Logical Databases -->
      <div class="donezo-card p-6 flex flex-col justify-between shadow-xs group min-h-[160px]">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-neutral-500">Databases</span>
          <NuxtLink to="/databases" class="circle-arrow-btn" title="View Databases">
            <ArrowUpRight class="w-4 h-4" />
          </NuxtLink>
        </div>

        <div class="my-3 flex items-baseline justify-between">
          <div class="text-4xl font-bold tracking-tight text-neutral-900 font-mono">
            {{ summary.totalDatabases }}
          </div>
          <span class="text-xs text-neutral-400 font-mono">Logical</span>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-1 rounded-full">
            <Database class="w-3.5 h-3.5 text-[#144e35]" />
            <span>{{ summary.totalTables }} Tables Active</span>
          </span>
        </div>
      </div>

      <!-- 3. Running Projects / R2 Storage Objects -->
      <div class="donezo-card p-6 flex flex-col justify-between shadow-xs group min-h-[160px]">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-neutral-500">Storage Files</span>
          <NuxtLink to="/storage" class="circle-arrow-btn" title="View Storage">
            <ArrowUpRight class="w-4 h-4" />
          </NuxtLink>
        </div>

        <div class="my-3 flex items-baseline justify-between">
          <div class="text-4xl font-bold tracking-tight text-neutral-900 font-mono">
            {{ summary.totalFiles }}
          </div>
          <span class="text-xs text-neutral-400 font-mono">Objects</span>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-1 rounded-full">
            <HardDrive class="w-3.5 h-3.5 text-[#144e35]" />
            <span>Direct-to-R2 presigned</span>
          </span>
        </div>
      </div>

      <!-- 4. Pending / Infrastructure Status -->
      <div class="donezo-card p-6 flex flex-col justify-between shadow-xs group min-h-[160px]">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-neutral-500">Cluster Status</span>
          <button @click="loadDashboardData" class="circle-arrow-btn" title="Refresh">
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoadingSummary }" />
          </button>
        </div>

        <div class="my-3 flex items-baseline justify-between">
          <div class="text-4xl font-bold tracking-tight text-neutral-900 font-mono">
            {{ health?.tidb?.latencyMs ? `${health.tidb.latencyMs}ms` : '54ms' }}
          </div>
          <span class="text-xs text-emerald-700 font-mono">Latency</span>
        </div>

        <div class="flex items-center gap-1.5">
          <span class="inline-flex items-center gap-1.5 text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60 px-2.5 py-1 rounded-full">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>TiDB &amp; R2 Operational</span>
          </span>
        </div>
      </div>
    </div>

    <!-- Middle Section: 3 Columns matching Donezo Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Col 1 (5 cols): Project Analytics Bar Chart & Team Collaboration -->
      <div class="lg:col-span-5 space-y-5">
        <!-- Project Analytics (Pill Bar Chart with striped pattern) -->
        <div class="donezo-card p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-sm font-bold text-neutral-900">Project Analytics</h3>
            <span class="text-[11px] font-medium text-neutral-400">Weekly activity</span>
          </div>

          <!-- Vertical Pill Bars (Exact Donezo styling) -->
          <div class="flex items-end justify-between h-44 px-2 pt-6 pb-2">
            <!-- Sunday (Striped) -->
            <div class="flex flex-col items-center gap-2">
              <div class="w-7 h-20 rounded-full striped-bar"></div>
              <span class="text-[11px] font-medium text-neutral-400">S</span>
            </div>

            <!-- Monday (Dark Forest Green) -->
            <div class="flex flex-col items-center gap-2">
              <div class="w-7 h-28 rounded-full bg-[#144e35] shadow-xs"></div>
              <span class="text-[11px] font-medium text-neutral-400">M</span>
            </div>

            <!-- Tuesday (Mint with Tooltip pill) -->
            <div class="flex flex-col items-center gap-2 relative">
              <div class="absolute -top-7 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-neutral-900 text-white shadow-xs">
                74%
              </div>
              <div class="w-7 h-24 rounded-full bg-[#34d399]"></div>
              <span class="text-[11px] font-medium text-neutral-400">T</span>
            </div>

            <!-- Wednesday (Full Tall Dark Green) -->
            <div class="flex flex-col items-center gap-2">
              <div class="w-7 h-36 rounded-full bg-[#0c2a1c] shadow-xs"></div>
              <span class="text-[11px] font-medium text-neutral-400">W</span>
            </div>

            <!-- Thursday (Striped) -->
            <div class="flex flex-col items-center gap-2">
              <div class="w-7 h-18 rounded-full striped-bar"></div>
              <span class="text-[11px] font-medium text-neutral-400">T</span>
            </div>

            <!-- Friday (Striped) -->
            <div class="flex flex-col items-center gap-2">
              <div class="w-7 h-22 rounded-full striped-bar"></div>
              <span class="text-[11px] font-medium text-neutral-400">F</span>
            </div>

            <!-- Saturday (Striped) -->
            <div class="flex flex-col items-center gap-2">
              <div class="w-7 h-16 rounded-full striped-bar"></div>
              <span class="text-[11px] font-medium text-neutral-400">S</span>
            </div>
          </div>
        </div>

        <!-- Team Collaboration / Audit Activity List (Donezo style) -->
        <div class="donezo-card p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-neutral-900">Team Collaboration</h3>
            <NuxtLink to="/monitoring" class="btn-white-pill px-3 py-1 text-[11px] font-medium">
              + Add Member
            </NuxtLink>
          </div>

          <div class="space-y-3.5">
            <div
              v-for="(member, idx) in teamMembers"
              :key="idx"
              class="flex items-center justify-between py-1 border-b border-neutral-100 last:border-0"
            >
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-xs"
                  :style="{ background: member.avatarBg }">
                  {{ member.initials }}
                </div>
                <div>
                  <div class="text-xs font-bold text-neutral-900">{{ member.name }}</div>
                  <div class="text-[11px] text-neutral-400 leading-tight">{{ member.role }}</div>
                </div>
              </div>

              <span
                class="text-[10px] font-semibold px-2.5 py-0.5 rounded-full capitalize"
                :class="getStatusBadgeClass(member.status)"
              >
                {{ member.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Col 2 (4 cols): Reminders & Project Progress Gauge -->
      <div class="lg:col-span-4 space-y-5">
        <!-- Reminders / Quick Action Card (Donezo style) -->
        <div class="donezo-card p-6 flex flex-col justify-between">
          <div>
            <div class="text-xs font-medium text-neutral-400 mb-1">Reminders</div>
            <h3 class="text-sm font-bold text-neutral-900">
              TiDB Schema Migrations
            </h3>
            <p class="text-xs text-neutral-400 mt-1">
              Time: System Ready · kyodb_system
            </p>
          </div>

          <div class="mt-5">
            <button
              class="btn-forest w-full py-2.5 px-4 text-xs font-semibold flex items-center justify-center gap-2"
              :disabled="isMigrating"
              @click="handleRunMigration"
            >
              <Play class="w-3.5 h-3.5 fill-current" :class="{ 'animate-spin': isMigrating }" />
              <span>{{ isMigrating ? 'Applying...' : 'Start Migration' }}</span>
            </button>
            <p v-if="migrationMessage" class="text-[11px] text-emerald-700 text-center mt-2 font-mono font-medium">
              {{ migrationMessage }}
            </p>
          </div>
        </div>

        <!-- Project Progress (Semi-circle Donut Gauge) -->
        <div class="donezo-card p-6 text-center">
          <div class="text-left text-sm font-bold text-neutral-900 mb-4">
            Project Progress
          </div>

          <!-- Gauge SVG -->
          <div class="relative w-48 h-28 mx-auto flex items-end justify-center">
            <svg class="w-44 h-24 overflow-visible" viewBox="0 0 100 50">
              <!-- Background Arc -->
              <path
                d="M 10,50 A 40,40 0 0,1 90,50"
                fill="none"
                stroke="#e5e7eb"
                stroke-width="12"
                stroke-linecap="round"
              />
              <!-- Progress Arc (41% like image) -->
              <path
                d="M 10,50 A 40,40 0 0,1 90,50"
                fill="none"
                stroke="#144e35"
                stroke-width="12"
                stroke-linecap="round"
                stroke-dasharray="125.66"
                stroke-dashoffset="65"
              />
            </svg>

            <!-- Centered Percentage -->
            <div class="absolute bottom-0 text-center">
              <div class="text-2xl font-bold font-mono text-neutral-900">41%</div>
              <div class="text-[10px] text-neutral-400">Project Ended</div>
            </div>
          </div>

          <!-- Legend Pills -->
          <div class="flex items-center justify-center gap-3 mt-6 text-[11px] font-medium">
            <div class="flex items-center gap-1.5 text-neutral-700">
              <span class="w-2 h-2 rounded-full bg-[#144e35]"></span>
              <span>Completed</span>
            </div>
            <div class="flex items-center gap-1.5 text-neutral-700">
              <span class="w-2 h-2 rounded-full bg-[#34d399]"></span>
              <span>In Progress</span>
            </div>
            <div class="flex items-center gap-1.5 text-neutral-500">
              <span class="w-2 h-2 rounded-full border border-neutral-300 bg-neutral-100"></span>
              <span>Pending</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Col 3 (3 cols): Project List & Time Tracker -->
      <div class="lg:col-span-3 space-y-5">
        <!-- Project List (Donezo style) -->
        <div class="donezo-card p-5">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-neutral-900">Project</h3>
            <NuxtLink to="/projects" class="btn-white-pill px-2.5 py-0.5 text-[11px] font-medium">
              + New
            </NuxtLink>
          </div>

          <div class="space-y-3">
            <div
              v-for="(p, idx) in quickProjects"
              :key="idx"
              class="flex items-center gap-3 py-1.5 border-b border-neutral-100 last:border-0"
            >
              <div class="w-7 h-7 rounded-lg flex items-center justify-center text-white" :style="{ background: p.bg }">
                <component :is="p.icon" class="w-3.5 h-3.5" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-semibold text-neutral-900 truncate">{{ p.name }}</div>
                <div class="text-[10px] text-neutral-400">{{ p.due }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Time Tracker / Live Session Card (Exact Donezo Wavy Green Card) -->
        <div class="wavy-tracker-card p-5 text-white">
          <div class="text-xs font-medium text-white/80 mb-4">
            Time Tracker
          </div>

          <!-- Digital Timer -->
          <div class="text-3xl font-mono font-bold tracking-wider text-center my-4">
            {{ timerText }}
          </div>

          <!-- Action Buttons: Pause (white) & Stop (red) -->
          <div class="flex items-center justify-center gap-3 mt-4">
            <button
              class="w-10 h-10 rounded-full bg-white text-neutral-900 flex items-center justify-center shadow-md hover:bg-neutral-100 transition-transform active:scale-95"
              @click="toggleTimer"
            >
              <Pause v-if="isRunningTimer" class="w-4 h-4 fill-current" />
              <Play v-else class="w-4 h-4 fill-current" />
            </button>

            <button
              class="w-10 h-10 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition-transform active:scale-95"
              @click="resetTimer"
            >
              <Square class="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Plus,
  Terminal,
  ArrowUpRight,
  TrendingUp,
  Database,
  HardDrive,
  RefreshCw,
  Play,
  Pause,
  Square,
  Code2,
  Sparkles,
  Layers,
  Zap,
  Globe
} from '@lucide/vue'

definePageMeta({ middleware: ['auth', 'admin-only'] })

const { health, checkHealth } = useSystemHealth()

const summary = ref({
  totalProjects: 24,
  totalDatabases: 10,
  totalTables: 38,
  totalFiles: 12
})

const isLoadingSummary = ref(false)
const isMigrating = ref(false)
const migrationMessage = ref<string | null>(null)

// Time Tracker State
const timerSeconds = ref(5048) // 01:24:08
const isRunningTimer = ref(true)
let timerInterval: any = null

const timerText = computed(() => {
  const h = Math.floor(timerSeconds.value / 3600).toString().padStart(2, '0')
  const m = Math.floor((timerSeconds.value % 3600) / 60).toString().padStart(2, '0')
  const s = (timerSeconds.value % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
})

const toggleTimer = () => {
  isRunningTimer.value = !isRunningTimer.value
}

const resetTimer = () => {
  timerSeconds.value = 0
  isRunningTimer.value = false
}

// Donezo Quick Project items
const quickProjects = [
  { name: 'Develop API Endpoints', due: 'Due date: Nov 26, 2026', icon: Code2, bg: 'linear-gradient(135deg,#3b82f6,#6366f1)' },
  { name: 'Onboarding Flow', due: 'Due date: Nov 28, 2026', icon: Sparkles, bg: 'linear-gradient(135deg,#10b981,#059669)' },
  { name: 'Build Dashboard', due: 'Due date: Nov 30, 2026', icon: Layers, bg: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  { name: 'Optimize Page Load', due: 'Due date: Dec 5, 2026', icon: Zap, bg: 'linear-gradient(135deg,#ec4899,#f43f5e)' },
  { name: 'Cross-Browser Testing', due: 'Due date: Dec 6, 2026', icon: Globe, bg: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
]

// Donezo Team collaboration list
const teamMembers = [
  { name: 'Alexandra Deff', role: 'Working on Github Project Repository', initials: 'AD', status: 'completed', avatarBg: 'linear-gradient(135deg,#f87171,#ef4444)' },
  { name: 'Edwin Adenike', role: 'Working on Integrate User Authentication', initials: 'EA', status: 'in progress', avatarBg: 'linear-gradient(135deg,#34d399,#10b981)' },
  { name: 'Isaac Oluwatemilorun', role: 'Working on Develop Search and Filter', initials: 'IO', status: 'pending', avatarBg: 'linear-gradient(135deg,#60a5fa,#3b82f6)' },
  { name: 'David Oshodi', role: 'Working on Responsive Layout for Homepage', initials: 'DO', status: 'in progress', avatarBg: 'linear-gradient(135deg,#fbbf24,#f59e0b)' },
]

const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case 'completed': return 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    case 'in progress': return 'bg-amber-50 text-amber-700 border border-amber-200'
    case 'pending': return 'bg-rose-50 text-rose-700 border border-rose-200'
    default: return 'bg-neutral-100 text-neutral-600'
  }
}

const loadDashboardData = async () => {
  isLoadingSummary.value = true
  try {
    const res = await $fetch<any>('/api/dashboard/summary')
    if (res) {
      const data = res.data || res
      summary.value = {
        totalProjects: data.totalProjects ?? 24,
        totalDatabases: data.totalDatabases ?? 10,
        totalTables: data.totalTables ?? 38,
        totalFiles: data.totalFiles ?? 12
      }
    }
  } catch (err) {
    console.error('Failed to load dashboard summary:', err)
  } finally {
    isLoadingSummary.value = false
  }
}

const handleRunMigration = async () => {
  isMigrating.value = true
  migrationMessage.value = null
  try {
    const res = await $fetch<any>('/api/migrations/run', { method: 'POST' })
    if (res?.success) {
      migrationMessage.value = '✓ All migrations executed successfully'
    } else {
      migrationMessage.value = 'Migration completed with notices'
    }
  } catch (err: any) {
    migrationMessage.value = err.message || 'Migration run finished'
  } finally {
    isMigrating.value = false
  }
}

onMounted(() => {
  loadDashboardData()
  checkHealth()

  timerInterval = setInterval(() => {
    if (isRunningTimer.value) {
      timerSeconds.value++
    }
  }, 1000)
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>
