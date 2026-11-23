<template>
  <div class="rounded-xl p-5" style="background:#1c1208; border:1px solid #2e1c0d;">
    <div class="flex items-center justify-between pb-3 mb-4" style="border-bottom:1px solid #2e1c0d;">
      <div class="flex items-center gap-2">
        <Clock class="h-4 w-4" style="color:#e8882a;" />
        <h3 class="text-sm font-semibold" style="color:#f0e6d8;">Recent Activity</h3>
      </div>
      <span class="text-[10px] font-mono" style="color:#6a5545;">Audit Logs</span>
    </div>

    <div v-if="activities.length === 0" class="py-10 text-center text-xs" style="color:#6a5545;">
      No activity recorded yet. System actions will appear here in real time.
    </div>

    <div v-else class="space-y-2">
      <div
        v-for="item in activities"
        :key="item.id"
        class="flex items-start justify-between rounded-xl p-3 text-xs transition-colors"
        style="background:#231509; border:1px solid #3a2410;"
      >
        <div class="flex items-start gap-2.5">
          <div
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-[10px] font-bold"
            :style="getActionBadgeStyle(item.action)"
          >
            {{ getActionInitials(item.action) }}
          </div>
          <div>
            <div class="font-semibold" style="color:#f0e6d8;">{{ formatActionName(item.action) }}</div>
            <div class="text-[11px] font-mono mt-0.5" style="color:#9a8070;">
              {{ item.targetType }}
              <span v-if="item.targetId"> · {{ item.targetId.slice(0, 12) }}</span>
            </div>
          </div>
        </div>
        <div class="text-right text-[11px] font-mono shrink-0 ml-2" style="color:#6a5545;">
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

const getActionBadgeStyle = (action: string) => {
  if (action.includes('login') || action.includes('LOGIN'))
    return { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#86efac' }
  if (action.includes('upload') || action.includes('storage'))
    return { background: 'rgba(232,136,42,0.1)', border: '1px solid rgba(232,136,42,0.3)', color: '#e8882a' }
  if (action.includes('migration') || action.includes('MIGRATION'))
    return { background: 'rgba(96,165,250,0.1)', border: '1px solid rgba(96,165,250,0.25)', color: '#93c5fd' }
  return { background: 'rgba(232,136,42,0.07)', border: '1px solid #3a2410', color: '#c4a882' }
}

const formatActionName = (action: string) =>
  action.split(/[._]/).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')

const formatDate = (dateStr: string) => {
  try { return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
  catch { return dateStr }
}
</script>
