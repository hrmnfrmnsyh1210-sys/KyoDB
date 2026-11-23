<template>
  <div class="rounded-xl p-5" style="background:#1c1208; border:1px solid #2e1c0d;">
    <div class="flex items-start justify-between gap-3 pb-3 mb-4" style="border-bottom:1px solid #2e1c0d;">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg flex items-center justify-center" style="background:rgba(232,136,42,0.1);">
          <component :is="icon" class="w-3.5 h-3.5" style="color:#e8882a;" />
        </div>
        <div>
          <h3 class="text-sm font-semibold" style="color:#f0e6d8;">{{ title }}</h3>
          <p class="text-[10px]" style="color:#9a8070;">{{ subtitle }}</p>
        </div>
      </div>
      <div v-if="badge" class="text-[10px] font-semibold px-2 py-0.5 rounded-full"
        style="color:#e8882a; background:rgba(232,136,42,0.1); border:1px solid rgba(232,136,42,0.2);">
        {{ badge }}
      </div>
    </div>

    <!-- Line / Area chart -->
    <div v-if="type === 'trend'" class="w-full">
      <svg viewBox="0 0 300 120" class="w-full h-32" preserveAspectRatio="none" role="img" :aria-label="title">
        <defs>
          <linearGradient :id="gradientId" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#e8882a" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#e8882a" stop-opacity="0" />
          </linearGradient>
        </defs>
        <line v-for="i in 4" :key="`grid-${i}`" x1="0" :y1="i * 30" x2="300" :y2="i * 30"
          stroke="#3a2410" stroke-width="0.5" stroke-dasharray="3 4" />
        <path :d="areaPath" :fill="`url(#${gradientId})`" />
        <path :d="linePath" fill="none" stroke="#e8882a" stroke-width="2"
          stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke" />
        <circle v-for="(point, i) in normalizedPoints" :key="i"
          :cx="point.x" :cy="point.y" r="2.5" fill="#f9a84a" stroke="#1c1208" stroke-width="1" />
      </svg>
      <div class="flex justify-between mt-1.5">
        <span v-for="(point, i) in points" :key="i" class="text-[9px] font-mono" style="color:#6a5545;">
          {{ point.label }}
        </span>
      </div>
      <div class="flex items-center justify-between mt-3 pt-3" style="border-top:1px solid #2e1c0d;">
        <span class="text-xs" style="color:#9a8070;">Total periode</span>
        <span class="text-sm font-bold font-mono" style="color:#f0e6d8;">{{ total }}</span>
      </div>
    </div>

    <!-- Donut chart -->
    <div v-else-if="type === 'donut'" class="w-full">
      <div v-if="!items.length" class="h-32 flex items-center justify-center text-xs" style="color:#6a5545;">
        Belum ada data storage
      </div>
      <div v-else class="flex items-center gap-5">
        <div class="relative shrink-0 w-28 h-28">
          <svg viewBox="0 0 42 42" class="w-full h-full -rotate-90" role="img" aria-label="Distribusi storage">
            <circle cx="21" cy="21" r="15.9155" fill="none" stroke="#2e1c0d" stroke-width="5" />
            <circle v-for="seg in segments" :key="seg.label" cx="21" cy="21" r="15.9155"
              fill="none" :stroke="seg.color" stroke-width="5"
              :stroke-dasharray="`${seg.percent} ${100 - seg.percent}`"
              :stroke-dashoffset="-seg.offset" />
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <span class="text-[10px]" style="color:#9a8070;">Total</span>
            <span class="text-sm font-bold font-mono" style="color:#f0e6d8;">{{ formatBytes(totalBytes) }}</span>
          </div>
        </div>
        <div class="flex-1 space-y-2 min-w-0">
          <div v-for="item in items" :key="item.label" class="flex items-center gap-2 text-[11px]">
            <span class="w-2 h-2 rounded-full shrink-0" :style="{ background: item.color }"></span>
            <span class="capitalize truncate flex-1" style="color:#9a8070;">{{ item.label }}</span>
            <span class="font-mono font-semibold" style="color:#f0e6d8;">{{ formatBytes(item.bytes) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bar chart -->
    <div v-else class="w-full space-y-3">
      <div v-for="stat in bars" :key="stat.label" class="space-y-1.5">
        <div class="flex items-center justify-between text-[11px]">
          <span style="color:#9a8070;">{{ stat.label }}</span>
          <span class="font-mono font-semibold" style="color:#f0e6d8;">{{ stat.value }} <span style="color:#6a5545;">ms</span></span>
        </div>
        <div class="h-2 rounded-full overflow-hidden" style="background:#2e1c0d;">
          <div class="h-full rounded-full transition-all" :style="{ width: `${stat.percent}%`, background: stat.color }"></div>
        </div>
      </div>
      <div class="flex items-center justify-between pt-2 text-[11px]" style="border-top:1px solid #2e1c0d;">
        <span style="color:#9a8070;">Total query</span>
        <span class="font-mono font-semibold" style="color:#f0e6d8;">{{ total }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'
import type { BreakdownItem, TrendPoint } from '~/types/analytics'

type ChartType = 'trend' | 'donut' | 'bar'
interface BarItem { label: string; value: number; percent: number; color: string }

const props = withDefaults(defineProps<{
  title: string
  subtitle?: string
  icon: Component
  type: ChartType
  badge?: string
  points?: TrendPoint[]
  items?: BreakdownItem[]
  bars?: BarItem[]
  total?: number
}>(), {
  points: () => [],
  items: () => [],
  bars: () => [],
  total: 0
})

const gradientId = `chart-gradient-${Math.random().toString(36).slice(2, 8)}`

const normalizedPoints = computed(() => {
  const data = props.points
  if (!data.length) return []
  const max = Math.max(...data.map(p => p.value), 1)
  const step = data.length > 1 ? 300 / (data.length - 1) : 0
  return data.map((p, i) => ({
    x: data.length > 1 ? i * step : 150,
    y: 110 - (p.value / max) * 95
  }))
})

const linePath = computed(() => {
  const pts = normalizedPoints.value
  if (!pts.length) return ''
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')
})

const areaPath = computed(() => {
  const pts = normalizedPoints.value
  if (!pts.length) return ''
  return `${linePath.value} L ${pts[pts.length - 1].x.toFixed(1)} 120 L ${pts[0].x.toFixed(1)} 120 Z`
})

const segments = computed(() => {
  const all = props.items
  const total = all.reduce((sum, i) => sum + i.value, 0) || 1
  let offset = 0
  return all.map(item => {
    const percent = (item.value / total) * 100
    const segment = { label: item.label, color: item.color, percent, offset }
    offset += percent
    return segment
  })
})

const totalBytes = computed(() => props.items.reduce((sum, i) => sum + i.bytes, 0))

const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(k)), sizes.length - 1)
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
</script>
