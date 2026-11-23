<template>
  <div class="flex h-screen overflow-hidden" style="background:#f4f5f6; color:#111827;">
    <!-- Mobile backdrop -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden"
      @click="isSidebarOpen = false"
    ></div>

    <!-- Sidebar (Donezo expanded clean sidebar) -->
    <SharedSidebar :is-open="isSidebarOpen" @close="isSidebarOpen = false" />

    <!-- Main Content Area -->
    <div class="flex flex-col flex-1 min-w-0 overflow-hidden">
      <!-- Navbar (Pill search, icons, user capsule) -->
      <SharedNavbar @toggle-sidebar="isSidebarOpen = !isSidebarOpen" />

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
const isSidebarOpen = ref(false)
</script>
