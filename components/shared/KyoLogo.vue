<template>
  <div class="inline-flex items-center gap-2.5 select-none group" :class="wrapperClass">
    <!-- Precision Vector SVG Emblem (Distributed Relational SQL + Cloud Object Nexus) -->
    <div
      class="relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
      :class="iconSizeClass"
    >
      <svg
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        class="w-full h-full drop-shadow-[0_2px_12px_rgba(0,220,130,0.35)]"
      >
        <defs>
          <linearGradient id="kyoPrimary" x1="4" y1="4" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#00DC82" />
            <stop offset="50%" stop-color="#10B981" />
            <stop offset="100%" stop-color="#0284C7" />
          </linearGradient>
          <linearGradient id="kyoFacetTop" x1="8" y1="6" x2="36" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#34D399" />
            <stop offset="100%" stop-color="#00DC82" />
          </linearGradient>
          <linearGradient id="kyoFacetMid" x1="6" y1="16" x2="38" y2="30" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#059669" />
            <stop offset="100%" stop-color="#0284C7" />
          </linearGradient>
          <linearGradient id="kyoFacetBot" x1="6" y1="26" x2="38" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#047857" />
            <stop offset="100%" stop-color="#0369A1" />
          </linearGradient>
          <filter id="kyoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- Outer Precision Shield/Hex Frame Glow -->
        <rect
          x="2"
          y="2"
          width="40"
          height="40"
          rx="12"
          fill="url(#kyoPrimary)"
          fill-opacity="0.12"
          stroke="url(#kyoPrimary)"
          stroke-width="1.2"
          stroke-opacity="0.4"
        />

        <!-- Top Layer: Database Cylinder Cap & SQL Prism -->
        <path
          d="M22 8L34 14V17L22 23L10 17V14L22 8Z"
          fill="url(#kyoFacetTop)"
          stroke="#A7F3D0"
          stroke-width="0.8"
        />

        <!-- Mid Layer: Cloudflare R2 Zero-Egress Storage Slice -->
        <path
          d="M10 20L22 26L34 20V23L22 29L10 23V20Z"
          fill="url(#kyoFacetMid)"
          fill-opacity="0.9"
          stroke="#38BDF8"
          stroke-width="0.8"
        />

        <!-- Bottom Base: Distributed Foundation Cluster -->
        <path
          d="M10 26L22 32L34 26V29L22 35L10 29V26Z"
          fill="url(#kyoFacetBot)"
          stroke="#00DC82"
          stroke-width="0.8"
        />

        <!-- Central Quantum Micro-Core Point -->
        <circle cx="22" cy="15.5" r="2.2" fill="#FFFFFF" filter="url(#kyoGlow)" />
        <circle cx="22" cy="15.5" r="1.2" fill="#00DC82" />
      </svg>
    </div>

    <!-- Wordmark Typography -->
    <div v-if="!iconOnly" class="flex items-center leading-none">
      <span
        class="font-black tracking-tight"
        :class="[
          textColorClass,
          textSizeClass
        ]"
      >
        Kyo<span class="text-[#00DC82]">DB</span>
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'dark' | 'light'
    size?: 'sm' | 'md' | 'lg'
    iconOnly?: boolean
  }>(),
  {
    variant: 'dark',
    size: 'md',
    iconOnly: false
  }
)

const wrapperClass = computed(() => {
  return props.size === 'sm' ? 'gap-2' : props.size === 'lg' ? 'gap-3' : 'gap-2.5'
})

const iconSizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-7 h-7'
    case 'lg':
      return 'w-10 h-10'
    default:
      return 'w-8.5 h-8.5'
  }
})

const textSizeClass = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'text-base font-extrabold'
    case 'lg':
      return 'text-2xl font-black'
    default:
      return 'text-lg font-black'
  }
})

const textColorClass = computed(() => {
  return props.variant === 'light' ? 'text-neutral-900' : 'text-white'
})
</script>
