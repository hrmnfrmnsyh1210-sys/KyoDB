<template>
  <div class="relative overflow-hidden rounded-xl border border-slate-800/80 bg-[#0f172a]/70 p-5 backdrop-blur transition-all duration-200 hover:border-slate-700/80 hover:bg-[#111a2f]">
    <div class="flex items-center justify-between">
      <span class="text-xs font-semibold tracking-wider text-slate-400 uppercase">{{ title }}</span>
      <div
        class="flex h-9 w-9 items-center justify-center rounded-lg"
        :class="iconBg || 'bg-blue-500/10 text-cyan-400 border border-blue-500/20'"
      >
        <component :is="icon" class="h-4 w-4" />
      </div>
    </div>

    <div class="mt-4 flex items-baseline gap-2">
      <span v-if="value !== null && value !== undefined" class="text-2xl font-bold tracking-tight text-white font-mono">
        {{ formatValue(value) }}
      </span>
      <span
        v-else
        class="inline-flex items-center gap-1 rounded-md bg-slate-800/80 px-2 py-0.5 text-xs font-medium text-slate-400 border border-slate-700/50"
      >
        <span class="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
        Not Available
      </span>

      <span v-if="unit && value !== null" class="text-xs text-slate-400 font-mono">
        {{ unit }}
      </span>
    </div>

    <div class="mt-2 flex items-center justify-between text-xs">
      <span class="text-slate-400">{{ subtitle }}</span>
      <span v-if="hint" class="text-[11px] font-mono text-cyan-400/80">{{ hint }}</span>
    </div>

    <!-- Bottom glowing accent line -->
    <div
      class="absolute bottom-0 left-0 h-[2px] w-full"
      :class="accentLineClass || 'bg-gradient-to-r from-blue-500/0 via-cyan-500/40 to-blue-500/0'"
    ></div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

const props = defineProps<{
  title: string
  value: number | string | null | undefined
  subtitle: string
  unit?: string
  hint?: string
  icon: Component
  iconBg?: string
  accentLineClass?: string
}>()

const formatValue = (val: number | string) => {
  if (typeof val === 'number') {
    return val.toLocaleString()
  }
  return val
}
</script>
