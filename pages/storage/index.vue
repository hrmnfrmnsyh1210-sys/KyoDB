<template>
  <div class="space-y-6" @dragover.prevent="isGlobalDragging = true">
    <!-- Page Header Banner -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl card-amber border border-[#2e1c0d] p-6 backdrop-blur">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold tracking-tight text-warm">
            Cloud <span class="text-[#e8882a]">Storage</span>
          </h1>
          <span class="rounded-full bg-[#e8882a]/10 border border-[#e8882a]/30 px-2.5 py-0.5 text-[11px] font-mono text-[#e8882a]">
            Phase 4 Active
          </span>
        </div>
        <p class="text-xs text-muted-warm mt-1">
          Direct-to-R2 object explorer, virtual folders, pre-signed upload/download engine, and project storage scoping.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1.5 rounded-xl border border-[#3a2410] bg-[#231509] px-3.5 py-2 text-xs font-medium text-warm hover:bg-[#3a2410] hover:text-warm transition-all shadow-sm"
          :disabled="isLoading"
          @click="loadStorageItems"
        >
          <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': isLoading }" />
          <span>Refresh</span>
        </button>

        <button
          class="inline-flex items-center gap-1.5 rounded-xl border border-[#3a2410] bg-[#2a1a0c] px-3.5 py-2 text-xs font-semibold text-warm hover:bg-[#3a2410] transition-all shadow-sm"
          @click="isCreateFolderOpen = true"
        >
          <FolderPlus class="h-3.5 w-3.5 text-amber-accent" />
          <span>New Folder</span>
        </button>

        <button
          class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#e8882a] to-[#c46a18] px-4 py-2 text-xs font-semibold text-warm shadow-lg shadow-[#e8882a]/20 hover:from-[#f9a84a] hover:to-[#e8882a] transition-all"
          @click="isUploadOpen = true"
        >
          <UploadCloud class="h-3.5 w-3.5" />
          <span>Upload Files</span>
        </button>
      </div>
    </div>

    <!-- Quick Metrics Cards -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div class="rounded-xl border border-[#2e1c0d] panel-warm p-4 backdrop-blur">
        <div class="flex items-center gap-2 text-xs text-muted-warm mb-1">
          <File class="h-4 w-4 text-[#e8882a]" />
          <span>Total Files</span>
        </div>
        <div class="text-xl font-bold text-warm font-mono">
          {{ storageData.totalFiles }}
        </div>
      </div>

      <div class="rounded-xl border border-[#2e1c0d] panel-warm p-4 backdrop-blur">
        <div class="flex items-center gap-2 text-xs text-muted-warm mb-1">
          <Folder class="h-4 w-4 text-amber-accent" />
          <span>Virtual Folders</span>
        </div>
        <div class="text-xl font-bold text-warm font-mono">
          {{ storageData.totalFolders }}
        </div>
      </div>

      <div class="rounded-xl border border-[#2e1c0d] panel-warm p-4 backdrop-blur">
        <div class="flex items-center gap-2 text-xs text-muted-warm mb-1">
          <HardDrive class="h-4 w-4 text-[#c98a3a]" />
          <span>Stored Volume</span>
        </div>
        <div class="text-xl font-bold text-warm font-mono">
          {{ formatBytes(storageData.totalBytes) }}
        </div>
      </div>

      <div class="rounded-xl border border-[#2e1c0d] panel-warm p-4 backdrop-blur">
        <div class="flex items-center gap-2 text-xs text-muted-warm mb-1">
          <Cloud class="h-4 w-4 text-amber-accent" />
          <span>Cloudflare R2</span>
        </div>
        <div class="flex items-center gap-1.5 mt-1">
          <span
            class="h-2 w-2 rounded-full"
            :class="storageData.isConfigured ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' : 'bg-amber-400'"
          ></span>
          <span class="text-xs font-mono text-warm truncate" :title="storageData.bucketName">
            {{ storageData.isConfigured ? storageData.bucketName : 'Dev Mode (Mock Store)' }}
          </span>
        </div>
      </div>
    </div>

    <!-- Controls: Scoping, Breadcrumbs & Search -->
    <div class="space-y-3">
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 rounded-xl border border-[#2e1c0d] bg-[#1a1007]/80 p-3 backdrop-blur">
        <!-- Breadcrumb Navigation -->
        <div class="flex items-center gap-1 overflow-x-auto py-1 text-xs">
          <button
            v-if="currentPrefix"
            class="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-muted-warm hover:text-warm hover:bg-[#2a1a0c] transition-colors mr-1 shrink-0"
            title="Go up one folder"
            @click="navigateUp"
          >
            <ArrowUpLeft class="h-3.5 w-3.5" />
            <span>Up</span>
          </button>

          <button
            class="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-medium transition-colors shrink-0"
            :class="!currentPrefix ? 'text-[#e8882a] bg-[#e8882a]/10' : 'text-muted-warm hover:text-warm hover:bg-[#2a1a0c]'"
            @click="navigateToPrefix('')"
          >
            <Home class="h-3.5 w-3.5" />
            <span>Root</span>
          </button>

          <template v-for="(crumb, idx) in storageData.breadcrumbs.slice(1)" :key="idx">
            <ChevronRight class="h-3.5 w-3.5 text-faint-warm shrink-0" />
            <button
              class="rounded-lg px-2 py-1 font-mono transition-colors shrink-0 truncate max-w-[150px]"
              :class="crumb.prefix === currentPrefix ? 'text-[#e8882a] bg-[#e8882a]/10 font-semibold' : 'text-muted-warm hover:text-warm hover:bg-[#2a1a0c]'"
              :title="crumb.name"
              @click="navigateToPrefix(crumb.prefix)"
            >
              {{ crumb.name }}
            </button>
          </template>
        </div>

        <!-- Project Scoping Filter & View Mode Toggle -->
        <div class="flex items-center gap-2 shrink-0">
          <!-- Project Filter Dropdown -->
          <div class="flex items-center gap-1.5 text-xs">
            <Layers class="h-3.5 w-3.5 text-muted-warm" />
            <select
              v-model="selectedProjectId"
              class="rounded-lg border border-[#3a2410] bg-[#231509] px-2.5 py-1.5 text-xs text-warm focus:border-[#e8882a] focus:outline-none"
              @change="handleProjectChange"
            >
              <option :value="null">All Projects</option>
              <option v-for="proj in projects" :key="proj.id" :value="proj.id">
                {{ proj.name }}
              </option>
            </select>
          </div>

          <!-- View Mode Toggle -->
          <div class="flex items-center bg-[#231509] rounded-lg p-0.5 border border-[#2e1c0d]">
            <button
              class="p-1.5 rounded-md transition-colors"
              :class="viewMode === 'grid' ? 'bg-[#e8882a]/20 text-[#f9a84a]' : 'text-muted-warm hover:text-warm'"
              title="Grid View"
              @click="viewMode = 'grid'"
            >
              <Grid class="h-3.5 w-3.5" />
            </button>
            <button
              class="p-1.5 rounded-md transition-colors"
              :class="viewMode === 'list' ? 'bg-[#e8882a]/20 text-[#f9a84a]' : 'text-muted-warm hover:text-warm'"
              title="Table List View"
              @click="viewMode = 'list'"
            >
              <List class="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      <!-- Search & Category Filters -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1">
          <Search class="absolute left-3 top-2.5 h-3.5 w-3.5 text-faint-warm" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Filter files by name or prefix..."
            class="w-full rounded-xl border border-[#2e1c0d] bg-[#1a1007]/80 pl-9 pr-3.5 py-2 text-xs text-warm placeholder-[#6a5545] focus:border-[#e8882a] focus:outline-none focus:ring-1 focus:ring-[#e8882a] transition-all"
            @input="handleSearchInput"
          />
        </div>

        <!-- Category Tabs -->
        <div class="flex items-center gap-1 overflow-x-auto bg-[#1a1007]/80 p-1 rounded-xl border border-[#2e1c0d]">
          <button
            v-for="cat in categoryTabs"
            :key="cat.value"
            class="px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0"
            :class="selectedCategory === cat.value ? 'btn-amber text-warm shadow-sm' : 'text-muted-warm hover:text-warm'"
            @click="selectCategory(cat.value)"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Bulk Action Bar when items selected -->
    <div
      v-if="selectedItems.length > 0"
      class="flex items-center justify-between rounded-xl bg-[#231509] border border-[#e8882a]/30 px-4 py-2.5 shadow-lg"
    >
      <div class="flex items-center gap-2 text-xs text-muted-warm">
        <CheckSquare class="h-4 w-4 text-[#e8882a]" />
        <span>{{ selectedItems.length }} item(s) selected</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="text-xs text-muted-warm hover:text-warm px-2 py-1"
          @click="selectedItems = []"
        >
          Deselect All
        </button>
        <button
          class="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-warm hover:bg-red-500 transition-colors shadow-sm"
          @click="openBulkDeleteModal"
        >
          <Trash2 class="h-3.5 w-3.5" />
          <span>Delete Selected</span>
        </button>
      </div>
    </div>

    <!-- Explorer Stage -->
    <div
      class="relative rounded-2xl border border-[#2e1c0d] panel-warm p-5 backdrop-blur min-h-[400px]"
      @dragleave.prevent="isGlobalDragging = false"
      @drop.prevent="handleGlobalDrop"
    >
      <!-- Drag Over Overlay -->
      <div
        v-if="isGlobalDragging"
        class="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-[#1a1007]/80 border-2 border-dashed border-[#e8882a] backdrop-blur-sm"
      >
        <UploadCloud class="h-12 w-12 text-[#e8882a] animate-bounce mb-3" />
        <h3 class="text-base font-bold text-warm">Drop files to upload to R2</h3>
        <p class="text-xs text-[#f9a84a] mt-1">Files will be placed into /{{ currentPrefix || 'root' }}</p>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading && storageData.items.length === 0" class="py-24 text-center">
        <Loader2 class="h-8 w-8 text-[#e8882a] animate-spin mx-auto mb-3" />
        <p class="text-xs text-muted-warm">Loading Cloudflare R2 bucket contents...</p>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="storageData.items.length === 0"
        class="py-20 text-center"
      >
        <div class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8882a]/10 text-[#e8882a] border border-[#e8882a]/20 mb-4">
          <FolderOpen class="h-7 w-7" />
        </div>
        <h3 class="text-base font-bold text-warm">Folder is Empty</h3>
        <p class="text-xs text-muted-warm mt-1 max-w-sm mx-auto">
          No files or folders found in this location. Upload your first file or create a virtual folder.
        </p>
        <div class="mt-5 flex items-center justify-center gap-2">
          <button
            class="inline-flex items-center gap-1.5 rounded-xl border border-[#3a2410] bg-[#2a1a0c] px-3.5 py-2 text-xs font-medium text-warm hover:bg-[#3a2410] transition-colors"
            @click="isCreateFolderOpen = true"
          >
            <FolderPlus class="h-3.5 w-3.5" />
            <span>Create Folder</span>
          </button>
          <button
            class="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#e8882a] to-[#c46a18] px-4 py-2 text-xs font-semibold text-warm shadow-lg shadow-[#e8882a]/20 hover:from-[#f9a84a] hover:to-[#e8882a] transition-all"
            @click="isUploadOpen = true"
          >
            <UploadCloud class="h-3.5 w-3.5" />
            <span>Upload File</span>
          </button>
        </div>
      </div>

      <!-- Content: GRID VIEW -->
      <div
        v-else-if="viewMode === 'grid'"
        class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
      >
        <!-- Virtual Folder Tiles -->
        <div
          v-for="folder in foldersList"
          :key="folder.key"
          class="group relative rounded-xl border border-[#2e1c0d] bg-[#1c1208] p-3.5 hover:border-[#e8882a]/50 hover:bg-[#2a1a0c] transition-all cursor-pointer flex flex-col justify-between"
          @click="navigateToPrefix(folder.key)"
        >
          <!-- Selection Checkbox -->
          <div class="absolute top-2.5 left-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
            <input
              type="checkbox"
              :checked="isItemSelected(folder)"
              class="rounded border-[#3a2410] bg-[#231509] text-[#e8882a] focus:ring-[#e8882a]/30"
              @change="toggleSelect(folder)"
            />
          </div>

          <!-- Folder Delete Action button -->
          <div class="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
            <button
              class="p-1 rounded text-faint-warm hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete folder"
              @click="confirmSingleDelete(folder)"
            >
              <Trash2 class="h-3 w-3" />
            </button>
          </div>

          <div class="pt-2 text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8882a]/10 text-amber-accent group-hover:scale-110 transition-transform mb-2">
              <Folder class="h-6 w-6" />
            </div>
            <div class="text-xs font-medium text-warm truncate px-1" :title="folder.name">
              {{ folder.name }}
            </div>
            <span class="text-[10px] text-faint-warm font-mono">Folder</span>
          </div>
        </div>

        <!-- File Tiles -->
        <div
          v-for="file in filesList"
          :key="file.key"
          class="group relative rounded-xl border border-[#2e1c0d] bg-[#1c1208] p-3.5 hover:border-[#e8882a]/50 hover:bg-[#2a1a0c] transition-all cursor-pointer flex flex-col justify-between"
          @click="openPreview(file)"
        >
          <!-- Selection Checkbox -->
          <div class="absolute top-2.5 left-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity" @click.stop>
            <input
              type="checkbox"
              :checked="isItemSelected(file)"
              class="rounded border-[#3a2410] bg-[#231509] text-[#e8882a] focus:ring-[#e8882a]/30"
              @change="toggleSelect(file)"
            />
          </div>

          <!-- File Menu Actions -->
          <div class="absolute top-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1" @click.stop>
            <button
              class="p-1 rounded text-faint-warm hover:text-[#f9a84a] hover:bg-[#e8882a]/10 transition-colors"
              title="Download file"
              @click="triggerDownload(file)"
            >
              <Download class="h-3 w-3" />
            </button>
            <button
              class="p-1 rounded text-faint-warm hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete file"
              @click="confirmSingleDelete(file)"
            >
              <Trash2 class="h-3 w-3" />
            </button>
          </div>

          <div class="pt-2 text-center">
            <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#e8882a]/10 text-[#e8882a] group-hover:scale-110 transition-transform mb-2">
              <component :is="getCategoryIcon(file.category)" class="h-6 w-6" />
            </div>
            <div class="text-xs font-medium text-warm truncate px-1" :title="file.name">
              {{ file.name }}
            </div>
            <div class="flex items-center justify-center gap-1.5 text-[10px] text-muted-warm mt-1">
              <span class="font-mono">{{ formatBytes(file.sizeBytes) }}</span>
            </div>
          </div>

          <!-- Bottom project tag if exists -->
          <div v-if="file.projectName" class="mt-2 text-center truncate">
            <span class="text-[9px] rounded-full bg-[#e8882a]/10 text-amber-accent border border-[#e8882a]/20 px-2 py-0.5 font-medium truncate inline-block max-w-full">
              {{ file.projectName }}
            </span>
          </div>
        </div>
      </div>

      <!-- Content: TABLE LIST VIEW -->
      <div v-else-if="viewMode === 'list'" class="overflow-x-auto">
        <table class="w-full text-left text-xs text-muted-warm">
          <thead class="border-b border-[#2e1c0d] text-[11px] text-faint-warm font-semibold uppercase tracking-wider bg-[#1c1208]">
            <tr>
              <th scope="col" class="py-3 px-3 w-8">
                <input
                  type="checkbox"
                  :checked="areAllSelected"
                  class="rounded border-[#3a2410] bg-[#231509] text-[#e8882a] focus:ring-[#e8882a]/30"
                  @change="toggleSelectAll"
                />
              </th>
              <th scope="col" class="py-3 px-4">Name</th>
              <th scope="col" class="py-3 px-4">Size</th>
              <th scope="col" class="py-3 px-4">Type</th>
              <th scope="col" class="py-3 px-4">Project</th>
              <th scope="col" class="py-3 px-4">Last Modified</th>
              <th scope="col" class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#2e1c0d]/60">
            <!-- Folders in table -->
            <tr
              v-for="folder in foldersList"
              :key="folder.key"
              class="hover:bg-[#2a1a0c] transition-colors cursor-pointer"
              @click="navigateToPrefix(folder.key)"
            >
              <td class="py-2.5 px-3" @click.stop>
                <input
                  type="checkbox"
                  :checked="isItemSelected(folder)"
                  class="rounded border-[#3a2410] bg-[#231509] text-[#e8882a] focus:ring-[#e8882a]/30"
                  @change="toggleSelect(folder)"
                />
              </td>
              <td class="py-2.5 px-4 font-medium text-warm flex items-center gap-2">
                <Folder class="h-4 w-4 text-amber-accent shrink-0" />
                <span class="truncate">{{ folder.name }}</span>
              </td>
              <td class="py-2.5 px-4 text-faint-warm font-mono">-</td>
              <td class="py-2.5 px-4 text-muted-warm">Virtual Folder</td>
              <td class="py-2.5 px-4 text-faint-warm font-mono">-</td>
              <td class="py-2.5 px-4 text-faint-warm font-mono">-</td>
              <td class="py-2.5 px-4 text-right" @click.stop>
                <button
                  class="p-1 text-muted-warm hover:text-red-400 transition-colors"
                  title="Delete folder"
                  @click="confirmSingleDelete(folder)"
                >
                  <Trash2 class="h-3.5 w-3.5" />
                </button>
              </td>
            </tr>

            <!-- Files in table -->
            <tr
              v-for="file in filesList"
              :key="file.key"
              class="hover:bg-[#2a1a0c] transition-colors cursor-pointer"
              @click="openPreview(file)"
            >
              <td class="py-2.5 px-3" @click.stop>
                <input
                  type="checkbox"
                  :checked="isItemSelected(file)"
                  class="rounded border-[#3a2410] bg-[#231509] text-[#e8882a] focus:ring-[#e8882a]/30"
                  @change="toggleSelect(file)"
                />
              </td>
              <td class="py-2.5 px-4 font-medium text-warm flex items-center gap-2">
                <component :is="getCategoryIcon(file.category)" class="h-4 w-4 text-[#e8882a] shrink-0" />
                <span class="truncate" :title="file.name">{{ file.name }}</span>
              </td>
              <td class="py-2.5 px-4 text-muted-warm font-mono">
                {{ formatBytes(file.sizeBytes) }}
              </td>
              <td class="py-2.5 px-4 text-muted-warm font-mono text-[11px]">
                {{ file.mimeType || 'binary' }}
              </td>
              <td class="py-2.5 px-4">
                <span
                  v-if="file.projectName"
                  class="rounded-full bg-[#e8882a]/10 text-amber-accent border border-[#e8882a]/20 px-2 py-0.5 text-[10px] font-medium"
                >
                  {{ file.projectName }}
                </span>
                <span v-else class="text-faint-warm font-mono">-</span>
              </td>
              <td class="py-2.5 px-4 text-muted-warm">
                {{ formatDate(file.lastModified) }}
              </td>
              <td class="py-2.5 px-4 text-right" @click.stop>
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="p-1 text-muted-warm hover:text-[#f9a84a] transition-colors"
                    title="Preview"
                    @click="openPreview(file)"
                  >
                    <Eye class="h-3.5 w-3.5" />
                  </button>
                  <button
                    class="p-1 text-muted-warm hover:text-[#f9a84a] transition-colors"
                    title="Download"
                    @click="triggerDownload(file)"
                  >
                    <Download class="h-3.5 w-3.5" />
                  </button>
                  <button
                    class="p-1 text-muted-warm hover:text-red-400 transition-colors"
                    title="Delete"
                    @click="confirmSingleDelete(file)"
                  >
                    <Trash2 class="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modals -->
    <UploadModal
      :is-open="isUploadOpen"
      :current-prefix="currentPrefix"
      :default-project-id="selectedProjectId"
      :projects="projects"
      @close="isUploadOpen = false"
      @uploaded="loadStorageItems"
    />

    <CreateFolderModal
      :is-open="isCreateFolderOpen"
      :current-path="currentPrefix"
      :project-id="selectedProjectId"
      @close="isCreateFolderOpen = false"
      @created="loadStorageItems"
    />

    <FilePreviewModal
      :is-open="isPreviewOpen"
      :item="selectedPreviewItem"
      @close="isPreviewOpen = false"
      @delete="handlePreviewDelete"
    />

    <DeleteConfirmModal
      :is-open="isDeleteConfirmOpen"
      :items="itemsToDelete"
      @close="isDeleteConfirmOpen = false"
      @deleted="handleDeleted"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  RefreshCw,
  FolderPlus,
  UploadCloud,
  File,
  Folder,
  FolderOpen,
  HardDrive,
  Cloud,
  Home,
  ChevronRight,
  ArrowUpLeft,
  Search,
  Grid,
  List,
  Layers,
  CheckSquare,
  Trash2,
  Download,
  Eye,
  Loader2,
  Image as ImageIcon,
  Video,
  Music,
  Code,
  Archive,
  FileText
} from '@lucide/vue'
import UploadModal from '~/components/storage/UploadModal.vue'
import CreateFolderModal from '~/components/storage/CreateFolderModal.vue'
import FilePreviewModal from '~/components/storage/FilePreviewModal.vue'
import DeleteConfirmModal from '~/components/storage/DeleteConfirmModal.vue'
import { formatBytes } from '~/server/validators/storage.validator'
import type { StorageItem, StorageListResponse, Project } from '~/types'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const router = useRouter()

// State
const isLoading = ref(false)
const viewMode = ref<'grid' | 'list'>('grid')
const currentPrefix = ref<string>('')
const selectedProjectId = ref<string | null>(null)
const searchQuery = ref('')
const selectedCategory = ref<string>('all')
const isGlobalDragging = ref(false)

const projects = ref<Project[]>([])
const selectedItems = ref<StorageItem[]>([])

const storageData = ref<StorageListResponse>({
  currentPrefix: '',
  breadcrumbs: [{ name: 'Root', prefix: '' }],
  items: [],
  totalFiles: 0,
  totalFolders: 0,
  totalBytes: 0,
  bucketName: '',
  isConfigured: false
})

// Modals
const isUploadOpen = ref(false)
const isCreateFolderOpen = ref(false)
const isPreviewOpen = ref(false)
const selectedPreviewItem = ref<StorageItem | null>(null)
const isDeleteConfirmOpen = ref(false)
const itemsToDelete = ref<StorageItem[]>([])

const categoryTabs = [
  { label: 'All Files', value: 'all' },
  { label: 'Images', value: 'image' },
  { label: 'Documents', value: 'document' },
  { label: 'Media', value: 'video' },
  { label: 'Code', value: 'code' },
  { label: 'Archives', value: 'archive' }
]

const foldersList = computed(() => {
  return storageData.value.items.filter((i) => i.type === 'folder')
})

const filesList = computed(() => {
  return storageData.value.items.filter((i) => i.type === 'file')
})

const areAllSelected = computed(() => {
  return (
    storageData.value.items.length > 0 &&
    selectedItems.value.length === storageData.value.items.length
  )
})

function isItemSelected(item: StorageItem): boolean {
  return selectedItems.value.some((i) => i.key === item.key)
}

function toggleSelect(item: StorageItem) {
  const idx = selectedItems.value.findIndex((i) => i.key === item.key)
  if (idx >= 0) {
    selectedItems.value.splice(idx, 1)
  } else {
    selectedItems.value.push(item)
  }
}

function toggleSelectAll() {
  if (areAllSelected.value) {
    selectedItems.value = []
  } else {
    selectedItems.value = [...storageData.value.items]
  }
}

function getCategoryIcon(cat?: string) {
  switch (cat) {
    case 'image':
      return ImageIcon
    case 'video':
      return Video
    case 'audio':
      return Music
    case 'code':
      return Code
    case 'archive':
      return Archive
    case 'document':
      return FileText
    default:
      return File
  }
}

function formatDate(isoDate?: string): string {
  if (!isoDate) return '-'
  try {
    return new Date(isoDate).toLocaleDateString()
  } catch {
    return isoDate
  }
}

// Navigation
function navigateToPrefix(prefix: string) {
  currentPrefix.value = prefix
  selectedItems.value = []
  loadStorageItems()
}

function navigateUp() {
  if (!currentPrefix.value) return
  const parts = currentPrefix.value.replace(/\/$/, '').split('/')
  parts.pop()
  const upPrefix = parts.length > 0 ? `${parts.join('/')}/` : ''
  navigateToPrefix(upPrefix)
}

function handleProjectChange() {
  if (selectedProjectId.value) {
    currentPrefix.value = `projects/${selectedProjectId.value}/`
  } else {
    currentPrefix.value = ''
  }
  loadStorageItems()
}

function selectCategory(cat: string) {
  selectedCategory.value = cat
  loadStorageItems()
}

let searchTimer: NodeJS.Timeout | null = null
function handleSearchInput() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    loadStorageItems()
  }, 300)
}

function handleGlobalDrop(e: DragEvent) {
  isGlobalDragging.value = false
  if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
    isUploadOpen.value = true
  }
}

async function loadProjects() {
  try {
    const res = await $fetch<{ success: boolean; data: Project[] }>('/api/projects')
    if (res.success && res.data) {
      projects.value = res.data
    }
  } catch {
    // Ignore error
  }
}

async function loadStorageItems() {
  isLoading.value = true
  try {
    const queryParams: Record<string, any> = {
      prefix: currentPrefix.value,
      category: selectedCategory.value
    }

    if (selectedProjectId.value) {
      queryParams.projectId = selectedProjectId.value
    }
    if (searchQuery.value.trim()) {
      queryParams.search = searchQuery.value.trim()
    }

    const res = await $fetch<{ success: boolean; data: StorageListResponse }>('/api/storage', {
      query: queryParams
    })

    if (res.success && res.data) {
      storageData.value = res.data
    }
  } catch (err: any) {
    // graceful fallback
  } finally {
    isLoading.value = false
  }
}

function openPreview(item: StorageItem) {
  selectedPreviewItem.value = item
  isPreviewOpen.value = true
}

function handlePreviewDelete(item: StorageItem) {
  isPreviewOpen.value = false
  confirmSingleDelete(item)
}

async function triggerDownload(item: StorageItem) {
  try {
    const res = await $fetch<{ success: boolean; data: { downloadUrl: string } }>(
      `/api/storage/download-url?key=${encodeURIComponent(item.key)}`
    )
    if (res.data?.downloadUrl) {
      window.open(res.data.downloadUrl, '_blank')
    }
  } catch (err: any) {
    alert(err.data?.statusMessage || 'Failed to generate download URL')
  }
}

function confirmSingleDelete(item: StorageItem) {
  itemsToDelete.value = [item]
  isDeleteConfirmOpen.value = true
}

function openBulkDeleteModal() {
  if (selectedItems.value.length === 0) return
  itemsToDelete.value = [...selectedItems.value]
  isDeleteConfirmOpen.value = true
}

function handleDeleted() {
  selectedItems.value = []
  loadStorageItems()
}

onMounted(() => {
  // Check route queries for initial project or prefix
  if (route.query.project && typeof route.query.project === 'string') {
    selectedProjectId.value = route.query.project
    currentPrefix.value = `projects/${route.query.project}/`
  }
  if (route.query.prefix && typeof route.query.prefix === 'string') {
    currentPrefix.value = route.query.prefix
  }

  loadProjects()
  loadStorageItems()
})
</script>
