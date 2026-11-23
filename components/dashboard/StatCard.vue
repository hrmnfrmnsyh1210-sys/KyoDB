<template>
  <div class="donezo-card p-5 group flex flex-col justify-between">
    <div class="flex items-center justify-between mb-3">
      <span class="text-xs font-medium text-neutral-500">{{ title }}</span>
      <div class="circle-arrow-btn">
        <component :is="icon" class="h-4 w-4 text-[#144e35]" />
      </div>
    </div>

    <div class="my-2">
      <span v-if="value !== null && value !== undefined" class="text-3xl font-bold font-mono tracking-tight text-neutral-900">
        {{ formatValue(value) }}
      </span>
      <span v-else class="text-sm text-neutral-400">N/A</span>
      <span v-if="unit && value !== null" class="text-xs font-mono ml-1 text-neutral-500">{{ unit }}</span>
    </div>

    <div class="mt-1 flex items-center justify-between text-[11px] text-neutral-400">
      <span>{{ subtitle }}</span>
      <span v-if="hint" class="font-semibold text-[#144e35]">{{ hint }}</span>
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
