<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl card-amber border border-[#2e1c0d] p-6 backdrop-blur">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold tracking-tight text-warm">
            Database <span class="text-amber-accent">Explorer</span>
          </h1>
          <span class="rounded-full bg-[#e8882a]/10 border border-[#e8882a]/30 px-2.5 py-0.5 text-[11px] font-mono text-amber-accent">
            Phase 3 Active
          </span>
        </div>
        <p class="text-xs text-muted-warm mt-1">
          Explore TiDB Cloud logical databases, design table schemas, and manage relational rows.
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          class="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3.5 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 transition-all shadow-sm"
          @click="isConnectModalOpen = true"
        >
          <Zap class="h-3.5 w-3.5 text-emerald-400" />
          <span>{{ activeConnection ? 'TiDB Credentials' : 'Connect TiDB' }}</span>
        </button>

        <button
          class="inline-flex items-center gap-1.5 rounded-xl border border-[#3a2410] bg-[#231509] px-3.5 py-2 text-xs font-medium text-warm hover:bg-[#3a2410] hover:text-warm transition-all shadow-sm"
          :disabled="isLoading"
          @click="refreshAll"
        >
          <RefreshCw class="h-3.5 w-3.5" :class="{ 'animate-spin': isLoading }" />
          <span>Refresh</span>
        </button>

        <button
          class="inline-flex items-center gap-1.5 rounded-xl btn-amber px-4 py-2 text-xs font-semibold text-warm shadow-lg shadow-[#e8882a]/20 hover:from-[#f9a84a] hover:to-[#e8882a] transition-all"
          @click="isCreateDbModalOpen = true"
        >
          <Plus class="h-3.5 w-3.5" />
          <span>New Database</span>
        </button>
      </div>
    </div>

    <!-- Active TiDB Connection Banner -->
    <div
      v-if="activeConnection"
      class="rounded-xl border border-[#2e1c0d] bg-[#1a1007]/80 px-4 py-2.5 flex items-center justify-between text-xs text-muted-warm"
    >
      <div class="flex items-center gap-2.5">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
        <span>Active TiDB: <strong class="text-warm">{{ activeConnection.name }}</strong></span>
        <span class="font-mono text-[11px] text-[#e8882a] bg-[#231509] px-2 py-0.5 rounded border border-[#3a2410]">
          {{ activeConnection.username }}@{{ activeConnection.host }}:{{ activeConnection.port }}/{{ activeConnection.database }}
        </span>
      </div>

      <button
        type="button"
        class="text-amber-accent hover:underline text-[11px] font-medium"
        @click="isConnectModalOpen = true"
      >
        Change Connection
      </button>
    </div>

    <!-- Empty Connection Alert if no connection configured -->
    <div
      v-else-if="!isLoading && databases.length === 0"
      class="rounded-2xl border border-amber-900/40 bg-amber-950/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-4"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-accent shrink-0">
          <Database class="w-5 h-5" />
        </div>
        <div>
          <h4 class="text-sm font-bold text-warm">Connect Your TiDB Cloud Database</h4>
          <p class="text-xs text-muted-warm mt-0.5">
            Enter your TiDB Host, Port, User, Password, and Database name to manage tables, run queries, and browse records.
          </p>
        </div>
      </div>

      <button
        type="button"
        class="btn-amber px-5 py-2 text-xs font-semibold shrink-0"
        @click="isConnectModalOpen = true"
      >
        Connect TiDB Now
      </button>
    </div>

    <!-- Main Two-Column Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
      <!-- Left Sidebar: Database & Tables Navigation (4 cols) -->
      <div class="lg:col-span-4 space-y-4">
        <!-- Database Selector Card -->
        <div class="rounded-2xl border border-[#2e1c0d] panel-warm p-4 backdrop-blur space-y-3">
          <div class="flex items-center justify-between">
            <label class="text-xs font-semibold text-muted-warm uppercase tracking-wider flex items-center gap-1.5">
              <Database class="h-3.5 w-3.5 text-amber-accent" />
              <span>Select Database</span>
            </label>
            <span class="text-[11px] text-faint-warm font-mono">{{ databases.length }} available</span>
          </div>

          <select
            v-model="selectedDatabase"
            class="w-full rounded-xl border border-[#3a2410] input-warm px-3 py-2 text-xs font-mono text-amber-accent focus:border-[#e8882a] focus:outline-none"
            @change="handleDatabaseChange"
          >
            <option v-for="db in databases" :key="db.name" :value="db.name">
              {{ db.name }} {{ db.isSystem ? '(System Protected)' : `(${db.tablesCount} tables)` }}
            </option>
          </select>

          <!-- Database Controls -->
          <div class="flex items-center justify-between pt-1">
            <span v-if="currentDbInfo?.isSystem" class="text-[11px] text-amber-400/90 flex items-center gap-1">
              <ShieldAlert class="h-3.5 w-3.5" />
              <span>Protected Schema</span>
            </span>
            <button
              v-else-if="selectedDatabase"
              type="button"
              class="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
              @click="openDropDbModal"
            >
              <Trash2 class="h-3 w-3" />
              <span>Drop Database</span>
            </button>
            <NuxtLink
              :to="`/sql-editor?db=${encodeURIComponent(selectedDatabase)}`"
              class="ml-auto text-[11px] text-amber-accent hover:text-[#f9a84a] flex items-center gap-1"
            >
              <Terminal class="h-3 w-3" />
              <span>Open in SQL Editor</span>
            </NuxtLink>
          </div>
        </div>

        <!-- Tables List Card -->
        <div class="rounded-2xl border border-[#2e1c0d] panel-warm p-4 backdrop-blur space-y-3">
          <div class="flex items-center justify-between">
            <h3 class="text-xs font-semibold text-warm uppercase tracking-wider flex items-center gap-1.5">
              <Table class="h-3.5 w-3.5 text-amber-accent" />
              <span>Tables in {{ selectedDatabase }}</span>
            </h3>
            <button
              v-if="!currentDbInfo?.isSystem"
              class="inline-flex items-center gap-1 text-[11px] text-amber-accent hover:text-[#f9a84a] font-medium"
              @click="isCreateTableModalOpen = true"
            >
              <Plus class="h-3 w-3" />
              <span>New Table</span>
            </button>
          </div>

          <!-- Search Tables -->
          <div class="relative">
            <Search class="absolute left-3 top-2.5 h-3.5 w-3.5 text-faint-warm" />
            <input
              v-model="tableSearchQuery"
              type="text"
              placeholder="Filter tables..."
              class="w-full rounded-xl border border-[#3a2410] input-warm pl-9 pr-3 py-1.5 text-xs text-warm placeholder-[#6a5545] focus:border-[#e8882a] focus:outline-none"
            />
          </div>

          <!-- Tables Navigation List -->
          <div v-if="filteredTables.length > 0" class="max-h-[420px] overflow-y-auto space-y-1 pr-1">
            <button
              v-for="tbl in filteredTables"
              :key="tbl.name"
              type="button"
              class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all text-left"
              :class="selectedTable === tbl.name ? 'bg-[#e8882a]/15 text-amber-accent border border-[#e8882a]/40 shadow-sm' : 'text-muted-warm hover:bg-[#231509]/70 hover:text-warm border border-transparent'"
              @click="selectTable(tbl.name)"
            >
              <div class="flex items-center gap-2 truncate">
                <Table class="h-3.5 w-3.5 shrink-0" :class="selectedTable === tbl.name ? 'text-amber-accent' : 'text-faint-warm'" />
                <span class="truncate">{{ tbl.name }}</span>
              </div>
              <span class="text-[10px] text-faint-warm bg-[#231509] px-1.5 py-0.5 rounded border border-[#2e1c0d] shrink-0 font-mono">
                {{ tbl.rows }}
              </span>
            </button>
          </div>

          <div v-else class="text-center py-8 text-xs text-faint-warm">
            {{ tableSearchQuery ? 'No tables match query' : 'No tables in this database' }}
          </div>
        </div>
      </div>

      <!-- Right Panel: Table Viewer & Editor (8 cols) -->
      <div class="lg:col-span-8 space-y-4">
        <!-- If Table Selected -->
        <div v-if="selectedTable" class="rounded-2xl border border-[#2e1c0d] panel-warm p-6 backdrop-blur space-y-5">
          <!-- Table Header & Actions -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2e1c0d] pb-4">
            <div>
              <div class="flex items-center gap-2.5">
                <h2 class="text-xl font-bold font-mono text-warm">{{ selectedTable }}</h2>
                <span class="text-xs text-muted-warm bg-[#231509] border border-[#2e1c0d] px-2 py-0.5 rounded">
                  {{ currentTableInfo?.engine || 'InnoDB' }}
                </span>
              </div>
              <p class="text-xs text-muted-warm mt-1">
                {{ tableData?.totalRows ?? currentTableInfo?.rows ?? 0 }} total rows •
                {{ formatBytes(currentTableInfo?.dataLengthBytes) }}
              </p>
            </div>

            <!-- Action buttons -->
            <div class="flex items-center gap-2">
              <button
                class="inline-flex items-center gap-1.5 rounded-xl border border-[#3a2410] bg-[#231509] px-3 py-1.5 text-xs font-medium text-warm hover:bg-[#3a2410] transition-colors"
                @click="exportCsv"
              >
                <Download class="h-3.5 w-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                class="inline-flex items-center gap-1.5 rounded-xl btn-amber px-3.5 py-1.5 text-xs font-semibold text-warm shadow-lg shadow-[#e8882a]/20 hover:bg-[#f9a84a] transition-all"
                @click="openInsertRowModal"
              >
                <Plus class="h-3.5 w-3.5" />
                <span>Insert Row</span>
              </button>

              <button
                v-if="!currentDbInfo?.isSystem"
                class="p-2 text-muted-warm hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors border border-transparent hover:border-red-500/20"
                title="Drop Table"
                @click="openDropTableModal"
              >
                <Trash2 class="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <!-- View Tabs (Browse Rows vs Structure) -->
          <div class="flex items-center gap-2 border-b border-[#2e1c0d] pb-2">
            <button
              class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              :class="activeTab === 'data' ? 'bg-[#e8882a]/10 text-amber-accent border border-[#e8882a]/30' : 'text-muted-warm hover:text-warm'"
              @click="activeTab = 'data'"
            >
              Browse Data (Rows)
            </button>
            <button
              class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
              :class="activeTab === 'structure' ? 'bg-[#e8882a]/10 text-amber-accent border border-[#e8882a]/30' : 'text-muted-warm hover:text-warm'"
              @click="activeTab = 'structure'"
            >
              Table Structure (Schema & Indexes)
            </button>
          </div>

          <!-- TAB 1: BROWSE ROWS DATA -->
          <div v-if="activeTab === 'data'" class="space-y-4">
            <!-- Filter & Sort Bar -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
              <div class="flex items-center gap-2">
                <span class="text-muted-warm">Filter:</span>
                <select v-model="filterCol" class="rounded-lg border border-[#3a2410] bg-[#231509] px-2 py-1 text-xs text-warm">
                  <option value="">All columns</option>
                  <option v-for="col in tableData?.columns || []" :key="col" :value="col">{{ col }}</option>
                </select>
                <input
                  v-model="filterVal"
                  type="text"
                  placeholder="Contains..."
                  class="rounded-lg border border-[#3a2410] bg-[#231509] px-2.5 py-1 text-xs text-warm placeholder-[#6a5545]"
                  @keyup.enter="loadTableRows(1)"
                />
                <button
                  class="rounded-lg bg-[#2a1a0c] px-2.5 py-1 text-xs text-muted-warm hover:bg-[#3a2410]"
                  @click="loadTableRows(1)"
                >
                  Filter
                </button>
              </div>

              <!-- Page Size -->
              <div class="flex items-center gap-2 text-muted-warm">
                <span>Show:</span>
                <select
                  v-model="pageSize"
                  class="rounded-lg border border-[#3a2410] bg-[#231509] px-2 py-1 text-xs text-warm"
                  @change="loadTableRows(1)"
                >
                  <option :value="25">25</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
                <span>rows</span>
              </div>
            </div>

            <!-- Data Table Container -->
            <div class="overflow-x-auto rounded-xl border border-[#2e1c0d] bg-[#120a04]/70 max-h-[500px]">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="sticky top-0 bg-[#1a1007] border-b border-[#2e1c0d] text-muted-warm text-[11px] font-mono uppercase tracking-wider">
                  <tr>
                    <th class="p-2.5 text-center w-16">Actions</th>
                    <th
                      v-for="col in tableData?.columns || []"
                      :key="col"
                      class="p-2.5 cursor-pointer hover:text-warm"
                      @click="handleSort(col)"
                    >
                      <div class="flex items-center gap-1">
                        <span>{{ col }}</span>
                        <span v-if="sortColumn === col" class="text-amber-accent">
                          {{ sortDirection === 'ASC' ? '▲' : '▼' }}
                        </span>
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#2e1c0d]/60 font-mono text-muted-warm">
                  <tr
                    v-for="(row, idx) in tableData?.rows || []"
                    :key="idx"
                    class="hover:bg-[#231509] transition-colors"
                  >
                    <!-- Row Action Buttons -->
                    <td class="p-2.5 text-center whitespace-nowrap">
                      <div class="flex items-center justify-center gap-1.5">
                        <button
                          class="text-muted-warm hover:text-[#f9a84a] p-0.5"
                          title="Edit row"
                          @click="openEditRowModal(row)"
                        >
                          <Edit3 class="h-3 w-3" />
                        </button>
                        <button
                          class="text-muted-warm hover:text-red-400 p-0.5"
                          title="Delete row"
                          @click="confirmDeleteRow(row)"
                        >
                          <Trash2 class="h-3 w-3" />
                        </button>
                      </div>
                    </td>

                    <!-- Row Cells -->
                    <td
                      v-for="col in tableData?.columns || []"
                      :key="col"
                      class="p-2.5 max-w-xs truncate"
                      :title="String(row[col] ?? '')"
                    >
                      <span v-if="row[col] === null" class="text-faint-warm italic">NULL</span>
                      <span v-else>{{ row[col] }}</span>
                    </td>
                  </tr>

                  <tr v-if="!tableData?.rows || tableData.rows.length === 0">
                    <td :colspan="(tableData?.columns?.length || 1) + 1" class="text-center py-8 text-faint-warm">
                      Table contains no rows
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination Bar -->
            <div class="flex items-center justify-between text-xs text-muted-warm pt-2">
              <div>
                Showing page <strong class="text-warm">{{ currentPage }}</strong> of
                <strong class="text-warm">{{ totalPages }}</strong> ({{ tableData?.totalRows ?? 0 }} total records)
              </div>

              <div class="flex items-center gap-1.5">
                <button
                  class="rounded-lg border border-[#3a2410] bg-[#2a1a0c] px-3 py-1.5 text-xs text-warm hover:bg-[#3a2410] disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="currentPage <= 1"
                  @click="loadTableRows(currentPage - 1)"
                >
                  Previous
                </button>
                <button
                  class="rounded-lg border border-[#3a2410] bg-[#2a1a0c] px-3 py-1.5 text-xs text-warm hover:bg-[#3a2410] disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="currentPage >= totalPages"
                  @click="loadTableRows(currentPage + 1)"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          <!-- TAB 2: STRUCTURE / SCHEMA -->
          <div v-else-if="activeTab === 'structure'" class="space-y-6">
            <!-- Columns Table -->
            <div>
              <h3 class="text-xs font-semibold text-muted-warm uppercase tracking-wider mb-2">Column Definitions</h3>
              <div class="overflow-x-auto rounded-xl border border-[#2e1c0d] bg-[#120a04]/70">
                <table class="w-full text-left text-xs">
                  <thead class="bg-[#231509] border-b border-[#2e1c0d] text-muted-warm font-mono text-[11px]">
                    <tr>
                      <th class="p-2.5">Name</th>
                      <th class="p-2.5">Type</th>
                      <th class="p-2.5">Null</th>
                      <th class="p-2.5">Key</th>
                      <th class="p-2.5">Default</th>
                      <th class="p-2.5">Extra</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#2e1c0d] font-mono text-muted-warm">
                    <tr v-for="col in tableDetails?.columns || []" :key="col.name">
                      <td class="p-2.5 font-bold text-amber-accent">{{ col.name }}</td>
                      <td class="p-2.5">{{ col.type }}</td>
                      <td class="p-2.5">{{ col.nullable ? 'YES' : 'NO' }}</td>
                      <td class="p-2.5">
                        <span v-if="col.key === 'PRI'" class="text-amber-400 font-bold">PRIMARY</span>
                        <span v-else>{{ col.key || '-' }}</span>
                      </td>
                      <td class="p-2.5 text-muted-warm">{{ col.default ?? 'NULL' }}</td>
                      <td class="p-2.5 text-amber-accent">{{ col.extra || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Indexes Table -->
            <div>
              <h3 class="text-xs font-semibold text-muted-warm uppercase tracking-wider mb-2">Indexes</h3>
              <div class="overflow-x-auto rounded-xl border border-[#2e1c0d] bg-[#120a04]/70">
                <table class="w-full text-left text-xs">
                  <thead class="bg-[#231509] border-b border-[#2e1c0d] text-muted-warm font-mono text-[11px]">
                    <tr>
                      <th class="p-2.5">Index Name</th>
                      <th class="p-2.5">Column</th>
                      <th class="p-2.5">Unique</th>
                      <th class="p-2.5">Type</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#2e1c0d] font-mono text-muted-warm">
                    <tr v-for="(idx, i) in tableDetails?.indexes || []" :key="i">
                      <td class="p-2.5 font-bold text-warm">{{ idx.name }}</td>
                      <td class="p-2.5 text-amber-accent">{{ idx.columnName }}</td>
                      <td class="p-2.5">{{ idx.isUnique ? 'YES' : 'NO' }}</td>
                      <td class="p-2.5">{{ idx.type }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- No Table Selected State -->
        <div v-else class="rounded-2xl border border-[#2e1c0d] panel-warm p-16 text-center backdrop-blur">
          <Database class="mx-auto h-12 w-12 text-faint-warm mb-3" />
          <h3 class="text-base font-semibold text-warm">No Table Selected</h3>
          <p class="text-xs text-muted-warm mt-1 max-w-sm mx-auto">
            Choose a table from the sidebar on the left to browse records, view schema structure, or insert data.
          </p>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <DatabaseCreateDatabaseModal
      :is-open="isCreateDbModalOpen"
      @close="isCreateDbModalOpen = false"
      @created="handleDbCreated"
    />

    <DatabaseCreateTableModal
      :is-open="isCreateTableModalOpen"
      :database-name="selectedDatabase"
      @close="isCreateTableModalOpen = false"
      @created="handleTableCreated"
    />

    <DatabaseRowModal
      :is-open="isRowModalOpen"
      :database-name="selectedDatabase"
      :table-name="selectedTable"
      :columns="tableDetails?.columns || []"
      :row-to-edit="rowToEdit"
      :primary-key="tableData?.primaryKey"
      @close="isRowModalOpen = false"
      @saved="handleRowSaved"
    />

    <DatabaseDeleteConfirmModal
      :is-open="isDeleteModalOpen"
      :title="deleteModalConfig.title"
      :description="deleteModalConfig.description"
      :confirm-button-text="deleteModalConfig.buttonText"
      :action="deleteModalConfig.action"
      @close="isDeleteModalOpen = false"
      @confirmed="deleteModalConfig.onConfirmed"
    />

    <DatabaseConnectTiDbModal
      :is-open="isConnectModalOpen"
      :edit-connection="activeConnection"
      @close="isConnectModalOpen = false"
      @saved="handleConnectionSaved"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Database,
  Table,
  Plus,
  RefreshCw,
  Search,
  Terminal,
  Trash2,
  Edit3,
  Download,
  ShieldAlert,
  Zap
} from '@lucide/vue'

definePageMeta({ middleware: ['auth', 'user-setup'] })

const route = useRoute()
const {
  connections,
  activeConnection,
  hasConnection,
  fetchConnections
} = useUserDatabases()

const {
  databases,
  currentDatabase,
  tables,
  tableDetails,
  tableData,
  isLoading,
  fetchDatabases,
  deleteDatabase,
  fetchTables,
  fetchTableDetails,
  dropTable,
  fetchTableData,
  deleteRow
} = useDatabases()

const isConnectModalOpen = ref(false)

const selectedDatabase = ref('')
const selectedTable = ref('')
const tableSearchQuery = ref('')
const activeTab = ref<'data' | 'structure'>('data')

// Pagination & filters
const currentPage = ref(1)
const pageSize = ref(50)
const sortColumn = ref('')
const sortDirection = ref<'ASC' | 'DESC'>('ASC')
const filterCol = ref('')
const filterVal = ref('')

// Modals
const isCreateDbModalOpen = ref(false)
const isCreateTableModalOpen = ref(false)
const isRowModalOpen = ref(false)
const rowToEdit = ref<Record<string, any> | null>(null)

const isDeleteModalOpen = ref(false)
const deleteModalConfig = reactive({
  title: '',
  description: '',
  buttonText: '',
  action: async () => ({ success: true }),
  onConfirmed: () => {}
})

const currentDbInfo = computed(() => {
  return databases.value.find((d) => d.name === selectedDatabase.value)
})

const currentTableInfo = computed(() => {
  return tables.value.find((t) => t.name === selectedTable.value)
})

const filteredTables = computed(() => {
  if (!tableSearchQuery.value) return tables.value
  const q = tableSearchQuery.value.toLowerCase()
  return tables.value.filter((t) => t.name.toLowerCase().includes(q))
})

const totalPages = computed(() => {
  if (!tableData.value || !tableData.value.totalRows) return 1
  return Math.ceil(tableData.value.totalRows / pageSize.value)
})

const refreshAll = async () => {
  await fetchDatabases()
  if (selectedDatabase.value) {
    await fetchTables(selectedDatabase.value)
    if (selectedTable.value) {
      await Promise.all([
        fetchTableDetails(selectedDatabase.value, selectedTable.value),
        loadTableRows(currentPage.value)
      ])
    }
  }
}

const handleDatabaseChange = async () => {
  selectedTable.value = ''
  tableDetails.value = null
  tableData.value = null
  if (selectedDatabase.value) {
    await fetchTables(selectedDatabase.value)
    if (tables.value.length > 0) {
      selectTable(tables.value[0].name)
    }
  }
}

const selectTable = async (tableName: string) => {
  selectedTable.value = tableName
  currentPage.value = 1
  filterCol.value = ''
  filterVal.value = ''
  sortColumn.value = ''
  sortDirection.value = 'ASC'

  await Promise.all([
    fetchTableDetails(selectedDatabase.value, tableName),
    loadTableRows(1)
  ])
}

const loadTableRows = async (page = 1) => {
  if (!selectedDatabase.value || !selectedTable.value) return
  currentPage.value = page
  await fetchTableData(selectedDatabase.value, selectedTable.value, {
    page,
    pageSize: pageSize.value,
    sortColumn: sortColumn.value || undefined,
    sortDirection: sortDirection.value,
    filterColumn: filterCol.value || undefined,
    filterValue: filterVal.value || undefined
  })
}

const handleSort = (col: string) => {
  if (sortColumn.value === col) {
    sortDirection.value = sortDirection.value === 'ASC' ? 'DESC' : 'ASC'
  } else {
    sortColumn.value = col
    sortDirection.value = 'ASC'
  }
  loadTableRows(1)
}

const openInsertRowModal = () => {
  rowToEdit.value = null
  isRowModalOpen.value = true
}

const openEditRowModal = (row: Record<string, any>) => {
  rowToEdit.value = { ...row }
  isRowModalOpen.value = true
}

const handleRowSaved = () => {
  loadTableRows(currentPage.value)
}

const confirmDeleteRow = (row: Record<string, any>) => {
  const pk = tableData.value?.primaryKey
  if (!pk) {
    alert('Cannot delete row: Table has no primary key defined.')
    return
  }
  const pkVal = row[pk]

  deleteModalConfig.title = 'Delete Table Record'
  deleteModalConfig.description = `Are you sure you want to delete this record where ${pk} = ${pkVal}?`
  deleteModalConfig.buttonText = 'Delete Record'
  deleteModalConfig.action = async () => {
    return await deleteRow(selectedDatabase.value, selectedTable.value, pk, pkVal)
  }
  deleteModalConfig.onConfirmed = () => {
    loadTableRows(currentPage.value)
  }
  isDeleteModalOpen.value = true
}

const openDropTableModal = () => {
  deleteModalConfig.title = `Drop Table "${selectedTable.value}"`
  deleteModalConfig.description = `Are you sure you want to permanently DROP table "${selectedTable.value}" from database "${selectedDatabase.value}"? All data and structure will be destroyed.`
  deleteModalConfig.buttonText = 'Drop Table'
  deleteModalConfig.action = async () => {
    return await dropTable(selectedDatabase.value, selectedTable.value)
  }
  deleteModalConfig.onConfirmed = () => {
    selectedTable.value = ''
    tableDetails.value = null
    tableData.value = null
  }
  isDeleteModalOpen.value = true
}

const openDropDbModal = () => {
  deleteModalConfig.title = `Drop Database "${selectedDatabase.value}"`
  deleteModalConfig.description = `Are you sure you want to permanently DROP database "${selectedDatabase.value}"? All tables and contents will be deleted forever.`
  deleteModalConfig.buttonText = 'Drop Database'
  deleteModalConfig.action = async () => {
    return await deleteDatabase(selectedDatabase.value)
  }
  deleteModalConfig.onConfirmed = async () => {
    selectedDatabase.value = databases.value[0]?.name || ''
    await handleDatabaseChange()
  }
  isDeleteModalOpen.value = true
}

const handleDbCreated = async (name: string) => {
  selectedDatabase.value = name
  await handleDatabaseChange()
}

const handleTableCreated = async (tableName: string) => {
  await fetchTables(selectedDatabase.value)
  selectTable(tableName)
}

const exportCsv = () => {
  if (!tableData.value || !tableData.value.rows || tableData.value.rows.length === 0) return
  const cols = tableData.value.columns
  const csvRows = [
    cols.join(','),
    ...tableData.value.rows.map((r) =>
      cols
        .map((c) => {
          const val = r[c] ?? ''
          return `"${String(val).replace(/"/g, '""')}"`
        })
        .join(',')
    )
  ]
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${selectedTable.value}_export.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const formatBytes = (bytes?: number) => {
  if (!bytes) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

const handleConnectionSaved = async () => {
  await fetchConnections()
  await refreshAll()
}

onMounted(async () => {
  await fetchConnections()
  await fetchDatabases()
  const dbQuery = route.query.db as string
  if (dbQuery && databases.value.some((d) => d.name === dbQuery)) {
    selectedDatabase.value = dbQuery
  } else if (!selectedDatabase.value && databases.value.length > 0) {
    const defaultDb = databases.value.find((d) => !d.isSystem) || databases.value[0]
    selectedDatabase.value = defaultDb.name
  }
  if (selectedDatabase.value) {
    await handleDatabaseChange()
  }
})
</script>
