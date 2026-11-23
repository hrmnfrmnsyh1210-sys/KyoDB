<template>
  <div class="donezo-card p-5 group flex flex-col justify-between hover:shadow-md transition-all">
    <div>
      <!-- Header: Title & Status Badge -->
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <h3 class="truncate text-sm font-bold text-neutral-900 group-hover:text-[#144e35] transition-colors">
              {{ project.name }}
            </h3>
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase border"
              :class="statusBadgeClasses"
            >
              <span class="w-1.5 h-1.5 rounded-full mr-1" :class="statusDotClasses"></span>
              {{ project.status }}
            </span>
          </div>

          <!-- Slug pill with copy -->
          <div class="mt-1 flex items-center gap-1.5">
            <code class="text-[11px] font-mono text-neutral-600 bg-neutral-100 px-1.5 py-0.5 rounded border border-neutral-200">
              {{ project.slug }}
            </code>
            <button
              class="p-0.5 text-neutral-400 hover:text-neutral-700 transition-colors"
              :title="copied ? 'Copied!' : 'Copy slug'"
              @click.stop="copySlug"
            >
              <Check v-if="copied" class="h-3 w-3 text-emerald-600" />
              <Copy v-else class="h-3 w-3" />
            </button>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex items-center gap-1">
          <button
            class="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            title="Edit Project"
            @click.stop="$emit('edit', project)"
          >
            <Edit3 class="h-3.5 w-3.5" />
          </button>
          <button
            class="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="Delete Project"
            @click.stop="$emit('delete', project)"
          >
            <Trash2 class="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <!-- Description -->
      <p class="mt-3 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
        {{ project.description || 'No description provided for this project.' }}
      </p>

      <!-- Associated Resources Metrics -->
      <div class="mt-4 grid grid-cols-2 gap-2">
        <!-- TiDB Databases Count -->
        <div class="rounded-xl bg-neutral-50 border border-neutral-200/80 p-2.5">
          <div class="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <Database class="h-3.5 w-3.5 text-[#144e35]" />
            <span>Databases</span>
          </div>
          <div class="mt-1 flex items-baseline gap-1">
            <span class="text-base font-bold text-neutral-900 font-mono">
              {{ project.databasesCount ?? 0 }}
            </span>
            <span class="text-[10px] text-neutral-400">attached</span>
          </div>
        </div>

        <!-- R2 Storage Usage -->
        <div class="rounded-xl bg-neutral-50 border border-neutral-200/80 p-2.5">
          <div class="flex items-center gap-1.5 text-[11px] text-neutral-500">
            <HardDrive class="h-3.5 w-3.5 text-[#144e35]" />
            <span>R2 Storage</span>
          </div>
          <div class="mt-1 flex items-baseline gap-1">
            <span class="text-base font-bold text-neutral-900 font-mono">
              {{ formatBytes(project.storage?.totalBytes) }}
            </span>
            <span class="text-[10px] text-neutral-400">({{ project.storage?.filesCount ?? 0 }} files)</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer: Created At & Manage Link -->
    <div class="mt-5 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs">
      <div class="flex items-center gap-1 text-[11px] text-neutral-400">
        <Clock class="h-3 w-3" />
        <span>{{ formatDate(project.createdAt) }}</span>
      </div>

      <NuxtLink
        :to="`/projects/${project.slug}`"
        class="inline-flex items-center gap-1 font-semibold text-xs text-[#144e35] hover:underline"
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
    setTimeout(() => { copied.value = false }, 2000)
  } catch (err) {
    console.error('Failed to copy slug:', err)
  }
}

const statusBadgeClasses = computed(() => {
  switch (props.project.status) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200'
    case 'archived':
      return 'bg-amber-50 text-amber-700 border-amber-200'
    case 'suspended':
      return 'bg-rose-50 text-rose-700 border-rose-200'
    default:
      return 'bg-neutral-100 text-neutral-600 border-neutral-200'
  }
})

const statusDotClasses = computed(() => {
  switch (props.project.status) {
    case 'active':
      return 'bg-emerald-500'
    case 'archived':
      return 'bg-amber-500'
    case 'suspended':
      return 'bg-rose-500'
    default:
      return 'bg-neutral-400'
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
