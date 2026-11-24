<template>
  <div class="inline-flex items-center gap-2.5 select-none group" :class="wrapperClass">
    <!-- KyoDB Logo Image (background removed) -->
    <div
      class="relative shrink-0 flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
      :class="iconSizeClass"
    >
      <img
        src="/images/logo-kyodb.png"
        alt="KyoDB Logo"
        class="w-full h-full object-contain drop-shadow-[0_2px_10px_rgba(0,220,130,0.3)]"
      />
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
