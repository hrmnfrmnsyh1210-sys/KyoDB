<template>
  <div class="flex h-screen overflow-hidden" style="background:#130d07;">
    <!-- Mobile backdrop -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-20 bg-black/70 backdrop-blur-sm md:hidden"
      @click="isSidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <SharedSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <!-- Main Area -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <SharedNavbar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <main class="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const isSidebarOpen = ref(false)
</script>
