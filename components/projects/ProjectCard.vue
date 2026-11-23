<template>
  <div class="group relative flex flex-col justify-between rounded-xl border border-slate-800/80 bg-[#0f172a]/70 p-5 backdrop-blur transition-all duration-200 hover:border-blue-500/40 hover:shadow-lg hover:shadow-blue-500/5">
    <div>
      <!-- Header: Title & Status -->
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h3 class="truncate text-base font-semibold text-white group-hover:text-cyan-300 transition-colors">
              {{ project.name }}
            </h3>
            <span
              class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase border"
              :class="statusBadgeClasses"
            >
              <span class="w-1.5 h-1.5 rounded-full mr-1" :class="statusDotClasses"></span>
              {{ project.status }}
            </span>
          </div>

          <!-- Slug pill with copy -->
          <div class="mt-1 flex items-center gap-1.5">
            <code class="text-[11px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded">
              {{ project.slug }}
            </code>
            <button
              class="p-0.5 text-slate-500 hover:text-slate-300 transition-colors"
              :title="copied ? 'Copied!' : 'Copy slug'"
              @click.stop="copySlug"
            >
              <Check v-if="copied" class="h-3 w-3 text-emerald-400" />
              <Copy v-else class="h-3 w-3" />
            </button>
          </div>
        </div>

        <!-- Action menu buttons -->
        <div class="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/70 rounded-lg transition-colors"
            title="Edit Project"
            @click.stop="$emit('edit', project)"
          >
            <Edit3 class="h-3.5 w-3.5" />
          </button>
          <button
            class="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Delete Project"
            @click.stop="$emit('delete', project)"
          >
            <Trash2 class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <!-- Description -->
      <p class="mt-3 text-xs text-slate-400 line-clamp-2 leading-relaxed">
        {{ project.description || 'No description provided for this project.' }}
      </p>

      <!-- Associated Resources Metrics -->
      <div class="mt-4 grid grid-cols-2 gap-2">
        <!-- TiDB Databases Count -->
        <div class="rounded-lg bg-slate-900/60 border border-slate-800/70 p-2.5">
          <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
            <Database class="h-3.5 w-3.5 text-blue-400" />
            <span>TiDB Databases</span>
          </div>
          <div class="mt-1 flex items-baseline gap-1">
            <span class="text-base font-bold text-white font-mono">
              {{ project.databasesCount ?? 0 }}
            </span>
            <span class="text-[10px] text-slate-500">attached</span>
          </div>
        </div>

        <!-- R2 Storage Usage -->
        <div class="rounded-lg bg-slate-900/60 border border-slate-800/70 p-2.5">
          <div class="flex items-center gap-1.5 text-[11px] text-slate-400">
            <HardDrive class="h-3.5 w-3.5 text-violet-400" />
            <span>R2 Storage</span>
          </div>
          <div class="mt-1 flex items-baseline gap-1">
            <span class="text-base font-bold text-white font-mono">
              {{ formatBytes(project.storage?.totalBytes) }}
            </span>
            <span class="text-[10px] text-slate-500">({{ project.storage?.filesCount ?? 0 }} files)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer: Created At & Manage Link -->
    <div class="mt-5 flex items-center justify-between border-t border-slate-800/70 pt-3 text-xs">
      <div class="flex items-center gap-1 text-[11px] text-slate-500">
        <Clock class="h-3 w-3" />
        <span>{{ formatDate(project.createdAt) }}</span>
      </div>

      <NuxtLink
        :to="`/projects/${project.slug}`"
        class="inline-flex items-center gap-1 font-medium text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
      >
        <span>Manage</span>
        <ChevronRight class="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Database,
  HardDrive,
  Clock,
  ChevronRight,
  Edit3,
  Trash2,
  Copy,
  Check
} from '@lucide/vue'
import type { Project } from '~/types'

const props = defineProps<{
  project: Project
}>()

defineEmits<{
  (e: 'edit', project: Project): void
  (e: 'delete', project: Project): void
}>()

const copied = ref(false)

const copySlug = async () => {
  try {
    await navigator.clipboard.writeText(props.project.slug)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy slug:', err)
  }
}

const statusBadgeClasses = computed(() => {
  switch (props.project.status) {
    case 'active':
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
    case 'archived':
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30'
    case 'suspended':
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30'
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/30'
  }
})

const statusDotClasses = computed(() => {
  switch (props.project.status) {
    case 'active':
      return 'bg-emerald-400'
    case 'archived':
      return 'bg-amber-400'
    case 'suspended':
      return 'bg-rose-400'
    default:
      return 'bg-slate-400'
  }
})

const formatBytes = (bytes?: number | null) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const formatDate = (isoStr: string) => {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}
</script>
