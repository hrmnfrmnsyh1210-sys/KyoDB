<template>
  <div class="rounded-xl border border-slate-800/80 bg-[#0f172a]/70 p-5 backdrop-blur">
    <div class="flex items-center justify-between border-b border-slate-800/60 pb-3 mb-4">
      <div class="flex items-center gap-2">
        <Clock class="h-4 w-4 text-cyan-400" />
        <h3 class="text-sm font-semibold text-white">Recent System Activities</h3>
      </div>
      <span class="text-[11px] font-mono text-slate-400">Audit Logs</span>
    </div>

    <div v-if="activities.length === 0" class="py-8 text-center text-xs text-slate-500">
      No activity recorded yet. System actions and logins will appear here in real time.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="item in activities"
        :key="item.id"
        class="flex items-start justify-between rounded-lg bg-slate-900/60 p-3 text-xs border border-slate-800/60 hover:border-slate-700 transition-colors"
      >
        <div class="flex items-start gap-3">
          <div
            class="flex h-7 w-7 shrink-0 items-center justify-center rounded-md font-mono text-[10px]"
            :class="getActionBadgeClass(item.action)"
          >
            {{ getActionInitials(item.action) }}
          </div>
          <div>
            <div class="font-medium text-slate-200">
              {{ formatActionName(item.action) }}
            </div>
            <div class="text-[11px] text-slate-400 font-mono mt-0.5">
              <span>Target: {{ item.targetType }}</span>
              <span v-if="item.targetId"> ({{ item.targetId }})</span>
              <span v-if="item.ipAddress" class="ml-2 text-slate-500">• {{ item.ipAddress }}</span>
            </div>
          </div>
        </div>

        <div class="text-right text-[11px] font-mono text-slate-400">
          {{ formatDate(item.createdAt) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Clock } from '@lucide/vue'
import type { AuditLogEntry } from '~/types'

defineProps<{
  activities: AuditLogEntry[]
}>()

const getActionInitials = (action: string) => {
  const parts = action.split('_')
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`
  return action.slice(0, 2).toUpperCase()
}

const getActionBadgeClass = (action: string) => {
  if (action.includes('LOGIN')) return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
  if (action.includes('LOGOUT')) return 'bg-slate-700/50 text-slate-300 border border-slate-600'
  if (action.includes('BOOTSTRAP')) return 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
  if (action.includes('MIGRATION')) return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
  return 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
}

const formatActionName = (action: string) => {
  return action
    .split('_')
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ')
}

const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  } catch {
    return dateStr
  }
}
</script>
