<template>
  <div class="min-h-screen flex items-center justify-center bg-[#070b12] p-4 relative overflow-hidden">
    <!-- Glowing Accent Background Blobs -->
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

    <div class="w-full max-w-md relative z-10">
      <slot />
    </div>
  </div>
</template>
