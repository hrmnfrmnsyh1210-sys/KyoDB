<template>
  <div
    class="relative overflow-hidden rounded-xl p-5 transition-all group"
    style="background:#1c1208; border:1px solid #2e1c0d;"
    @mouseenter="e => (e.currentTarget as HTMLElement).style.borderColor = '#4a2f14'"
    @mouseleave="e => (e.currentTarget as HTMLElement).style.borderColor = '#2e1c0d'"
  >
    <div class="flex items-center justify-between mb-3">
      <span class="text-[11px] font-semibold tracking-wider uppercase" style="color:#9a8070;">{{ title }}</span>
      <div class="w-8 h-8 rounded-lg flex items-center justify-center" style="background:rgba(232,136,42,0.1);">
        <component :is="icon" class="h-4 w-4" style="color:#e8882a;" />
      </div>
    </div>

    <div class="flex items-baseline gap-1.5">
      <span v-if="value !== null && value !== undefined" class="text-2xl font-bold font-mono tracking-tight" style="color:#f0e6d8;">
        {{ formatValue(value) }}
      </span>
      <span v-else class="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[11px] font-mono" style="background:#231509; border:1px solid #3a2410; color:#6a5545;">
        <span class="h-1.5 w-1.5 rounded-full" style="background:#4a2f14;"></span>
        N/A
      </span>
      <span v-if="unit && value !== null" class="text-xs font-mono" style="color:#9a8070;">{{ unit }}</span>
    </div>

    <div class="mt-1.5 flex items-center justify-between text-[11px]">
      <span style="color:#9a8070;">{{ subtitle }}</span>
      <span v-if="hint" class="font-mono" style="color:#e8882a; opacity:0.7;">{{ hint }}</span>
    </div>

    <!-- Amber accent bottom glow -->
    <div class="absolute bottom-0 left-0 h-[2px] w-full opacity-0 group-hover:opacity-100 transition-opacity"
      style="background:linear-gradient(90deg, transparent, rgba(232,136,42,0.5), transparent);">
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  title: string
  value: number | string | null | undefined
  subtitle: string
  unit?: string
  hint?: string
  icon: Component
  iconBg?: string
  accentLineClass?: string
}>()

const formatValue = (val: number | string) => typeof val === 'number' ? val.toLocaleString() : val
</script>
