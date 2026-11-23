<template>
  <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" style="background:#0d0804;">
    <!-- Warm ambient blobs -->
    <div class="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none" style="background:rgba(180,70,10,0.12); transform:translate(-30%,-30%);"></div>
    <div class="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none" style="background:rgba(120,45,5,0.1); transform:translate(30%,30%);"></div>

    <div class="w-full max-w-md relative z-10">
      <slot />
    </div>
  </div>
</template>
