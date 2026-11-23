<template>
  <div class="min-h-screen relative flex items-center justify-center p-4 overflow-hidden" style="background:#f4f5f6;">
    <!-- Subtle mint & forest ambient blobs -->
    <div class="absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-40"
      style="background:radial-gradient(circle, #a7f3d0 0%, transparent 70%);">
    </div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30"
      style="background:radial-gradient(circle, #86efac 0%, transparent 70%);">
    </div>

    <!-- Auth Card Container -->
    <div class="w-full max-w-md relative z-10">
      <slot />
    </div>
  </div>
</template>
