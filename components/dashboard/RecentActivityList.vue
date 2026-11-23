<template>
  <div class="donezo-card p-5">
    <div class="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
      <div class="flex items-center gap-2">
        <Clock class="h-4 w-4 text-[#144e35]" />
        <h3 class="text-sm font-bold text-neutral-900">Recent Activity</h3>
      </div>
      <span class="text-[10px] font-mono text-neutral-400">Audit Logs</span>
    </div>

    <div v-if="activities.length === 0" class="py-10 text-center text-xs text-neutral-400">
      No activity recorded yet. System actions will appear here in real time.
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="item in activities"
        :key="item.id"
        class="flex items-start justify-between rounded-xl p-3 text-xs bg-neutral-50 border border-neutral-200/80 transition-colors"
      >
        <div class="flex items-start gap-2.5">
          <div
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[10px] font-bold"
            :class="getActionBadgeClass(item.action)"
          >
            {{ getActionInitials(item.action) }}
          </div>
          <div>
            <div class="font-bold text-neutral-900">{{ formatActionName(item.action) }}</div>
            <div class="text-[11px] font-mono text-neutral-500 mt-0.5">
              {{ item.targetType }}
              <span v-if="item.targetId"> · {{ item.targetId.slice(0, 12) }}</span>
            </div>
          </div>
        </div>
        <div class="text-right text-[11px] font-mono shrink-0 ml-2 text-neutral-400">
          {{ formatDate(item.createdAt) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Clock } from '@lucide/vue'
import type { AuditLogEntry } from '~/types'

defineProps<{ activities: AuditLogEntry[] }>()

const getActionInitials = (action: string) => {
  const parts = action.split(/[._]/)
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  return action.slice(0, 2).toUpperCase()
}

const getActionBadgeClass = (action: string) => {
  if (action.includes('login') || action.includes('LOGIN'))
    return 'bg-emerald-100 text-emerald-800'
  if (action.includes('upload') || action.includes('storage'))
    return 'bg-teal-100 text-teal-800'
  if (action.includes('migration') || action.includes('MIGRATION'))
    return 'bg-blue-100 text-blue-800'
  return 'bg-neutral-200 text-neutral-800'
}

const formatActionName = (action: string) =>
  action.split(/[._]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')

const formatDate = (dateStr: string) => {
  try { return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  catch { return dateStr }
}
</script>
