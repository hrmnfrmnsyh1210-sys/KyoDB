<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl card-amber border border-[#2e1c0d] p-6 backdrop-blur">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold tracking-tight text-warm">
            Monaco <span class="text-amber-accent">SQL Editor</span>
          </h1>
          <span class="rounded-full bg-[#e8882a]/10 border border-[#e8882a]/30 px-2.5 py-0.5 text-[11px] font-mono text-amber-accent">
            Phase 3 Active
          </span>
        </div>
        <p class="text-xs text-muted-warm mt-1">
          Execute interactive SQL queries with sub-millisecond execution telemetry and read-only enforcement.
        </p>
      </div>

      <!-- Controls & Execute Button -->
      <div class="flex items-center gap-3">
        <!-- Target Database Selector -->
        <div class="flex items-center gap-2">
          <Database class="h-4 w-4 text-amber-accent" />
          <select
            v-model="selectedDatabase"
            class="rounded-xl border border-[#3a2410] input-warm px-3 py-1.5 text-xs font-mono text-amber-accent focus:border-[#e8882a] focus:outline-none"
          >
            <option v-for="db in databases" :key="db.name" :value="db.name">
              {{ db.name }} {{ db.isSystem ? '(System)' : '' }}
            </option>
          </select>
        </div>

        <!-- Read Only Switch -->
        <label
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all select-none"
          :class="isReadOnly ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-[#231509] border-[#2e1c0d] text-muted-warm'"
        >
          <input v-model="isReadOnly" type="checkbox" class="accent-emerald-400" />
          <span>Read-Only Mode</span>
        </label>

        <!-- Run Query Button -->
        <button
          class="inline-flex items-center gap-2 rounded-xl btn-amber px-5 py-2 text-xs font-semibold text-warm shadow-lg shadow-[#e8882a]/20 hover:from-[#f9a84a] hover:to-[#e8882a] transition-all disabled:opacity-50"
          :disabled="isExecuting || !sqlCode.trim() || !selectedDatabase"
          title="Press Ctrl+Enter to execute"
          @click="runQuery"
        >
          <Play v-if="!isExecuting" class="h-3.5 w-3.5 fill-current" />
          <RefreshCw v-else class="h-3.5 w-3.5 animate-spin" />
          <span>Run (Ctrl+↵)</span>
        </button>
      </div>
    </div>

    <!-- SQL Editor Box -->
    <div class="rounded-2xl border border-[#2e1c0d] bg-[#1a1007] shadow-xl overflow-hidden">
      <!-- Editor Top Toolbar -->
      <div class="flex items-center justify-between border-b border-[#2e1c0d] px-4 py-2 bg-[#1c1208] text-xs">
        <div class="flex items-center gap-2">
          <Terminal class="h-3.5 w-3.5 text-amber-accent" />
          <span class="font-mono text-muted-warm">query.sql</span>
          <span class="text-faint-warm">|</span>
          <span class="text-[11px] text-faint-warm">TiDB Serverless / MySQL 8.0</span>
        </div>

        <div class="flex items-center gap-3">
          <button
            class="text-muted-warm hover:text-warm transition-colors"
            @click="formatSql"
          >
            Format SQL
          </button>
          <button
            class="text-muted-warm hover:text-warm transition-colors"
            @click="sqlCode = ''"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Editor Area -->
      <div class="relative min-h-[220px] max-h-[360px] bg-[#1a1007]">
        <ClientOnly>
          <vue-monaco-editor
            v-model:value="sqlCode"
            theme="vs-dark"
            language="sql"
            :options="editorOptions"
            style="height: 220px;"
            @mount="handleEditorMount"
          />
          <template #fallback>
            <textarea
              v-model="sqlCode"
              rows="8"
              class="w-full bg-[#1a1007] p-4 font-mono text-xs text-warm outline-none resize-none"
              placeholder="SELECT * FROM my_table LIMIT 10;"
              @keydown="handleKeyDown"
            ></textarea>
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- Bottom Section: Results & Telemetry Tabs -->
    <div class="rounded-2xl border border-[#2e1c0d] panel-warm p-6 backdrop-blur space-y-4">
      <!-- Tabs Header -->
      <div class="flex items-center justify-between border-b border-[#2e1c0d] pb-3">
        <div class="flex items-center gap-2">
          <button
            class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            :class="activeBottomTab === 'results' ? 'bg-[#e8882a]/10 text-amber-accent border border-[#e8882a]/30' : 'text-muted-warm hover:text-warm'"
            @click="activeBottomTab = 'results'"
          >
            Query Results
          </button>
          <button
            class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            :class="activeBottomTab === 'history' ? 'bg-[#e8882a]/10 text-amber-accent border border-[#e8882a]/30' : 'text-muted-warm hover:text-warm'"
            @click="activeBottomTab = 'history'"
          >
            Query History
          </button>
          <button
            class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            :class="activeBottomTab === 'snippets' ? 'bg-[#e8882a]/10 text-amber-accent border border-[#e8882a]/30' : 'text-muted-warm hover:text-warm'"
            @click="activeBottomTab = 'snippets'"
          >
            SQL Templates
          </button>
        </div>

        <!-- Telemetry & Export -->
        <div v-if="activeBottomTab === 'results' && queryResult" class="flex items-center gap-3 text-xs">
          <span
            class="px-2 py-0.5 rounded text-[11px] font-mono border"
            :class="queryResult.status === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'"
          >
            {{ queryResult.status === 'success' ? '✓ Query Executed' : '✗ Query Error' }}
          </span>

          <span class="text-muted-warm font-mono">
            ⏱ {{ queryResult.executionTimeMs }}ms
          </span>

          <span v-if="queryResult.rows" class="text-muted-warm font-mono">
            {{ queryResult.rows.length }} rows returned
          </span>

          <button
            v-if="queryResult.rows && queryResult.rows.length > 0"
            class="inline-flex items-center gap-1 text-muted-warm hover:text-[#f9a84a] ml-2"
            @click="exportResultCsv"
          >
            <Download class="h-3 w-3" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <!-- TAB: RESULTS -->
      <div v-if="activeBottomTab === 'results'">
        <!-- Error Banner -->
        <div
          v-if="queryResult?.status === 'error'"
          class="rounded-xl border border-red-500/30 bg-red-950/20 p-4 text-xs font-mono text-red-300 space-y-1"
        >
          <div class="font-bold">Error Message:</div>
          <div>{{ queryResult.error }}</div>
        </div>

        <!-- Empty Query State -->
        <div v-else-if="!queryResult" class="py-12 text-center text-xs text-faint-warm">
          Enter an SQL query and press <strong class="text-muted-warm">Run (Ctrl+Enter)</strong> to see live output.
        </div>

        <!-- Non-SELECT affected rows info -->
        <div
          v-else-if="queryResult.affectedRows !== undefined && (!queryResult.rows || queryResult.rows.length === 0)"
          class="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4 text-xs text-emerald-300"
        >
          Query executed successfully. Affected rows: <strong>{{ queryResult.affectedRows }}</strong>.
        </div>

        <!-- Results Data Table -->
        <div v-else-if="queryResult.rows && queryResult.rows.length > 0" class="overflow-x-auto rounded-xl border border-[#2e1c0d] bg-[#120a04]/70 max-h-[460px]">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="sticky top-0 bg-[#1a1007] border-b border-[#2e1c0d] text-muted-warm font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th v-for="col in queryResult.columns" :key="col" class="p-2.5">
                  {{ col }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#2e1c0d]/60 font-mono text-muted-warm">
              <tr v-for="(row, idx) in queryResult.rows" :key="idx" class="hover:bg-[#231509]">
                <td
                  v-for="col in queryResult.columns"
                  :key="col"
                  class="p-2.5 max-w-xs truncate"
                  :title="String(row[col] ?? '')"
                >
                  <span v-if="row[col] === null" class="text-faint-warm italic">NULL</span>
                  <span v-else>{{ row[col] }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- TAB: HISTORY -->
      <div v-else-if="activeBottomTab === 'history'" class="space-y-2">
        <div v-if="queryHistory.length > 0" class="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          <div
            v-for="hist in queryHistory"
            :key="hist.id"
            class="flex items-center justify-between rounded-xl border border-[#2e1c0d] bg-[#1c1208] p-3 text-xs font-mono"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="hist.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'"
              ></span>
              <span class="text-amber-accent uppercase font-bold text-[11px]">{{ hist.queryType }}</span>
              <span class="text-muted-warm truncate text-[11px]">in {{ hist.databaseName }}</span>
              <span class="text-faint-warm text-[10px]">{{ hist.executionTimeMs }}ms</span>
            </div>

            <span class="text-faint-warm text-[10px] shrink-0">{{ formatDate(hist.executedAt) }}</span>
          </div>
        </div>
        <div v-else class="py-10 text-center text-xs text-faint-warm">
          No executed queries logged yet.
        </div>
      </div>

      <!-- TAB: TEMPLATES / SNIPPETS -->
      <div v-else-if="activeBottomTab === 'snippets'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          v-for="snippet in sqlSnippets"
          :key="snippet.title"
          class="rounded-xl border border-[#2e1c0d] bg-[#1c1208] p-3.5 space-y-2 hover:border-[#3a2410] transition-colors cursor-pointer"
          @click="loadSnippet(snippet.sql)"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-warm">{{ snippet.title }}</span>
            <span class="text-[10px] text-amber-accent font-mono">Insert →</span>
          </div>
          <code class="block text-[11px] font-mono text-muted-warm bg-[#120a04] p-2 rounded truncate">
            {{ snippet.sql }}
          </code>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Database,
  Terminal,
  Play,
  RefreshCw,
  Download
} from '@lucide/vue'

definePageMeta({ middleware: 'auth' })

const route = useRoute()
const { databases, fetchDatabases } = useDatabases()
const {
  activeDatabase,
  readOnly,
  isExecuting,
  queryResult,
  queryHistory,
  executeQuery,
  fetchHistory
} = useSqlEditor()

const selectedDatabase = ref('')
const isReadOnly = ref(false)
const sqlCode = ref('SELECT 1 as test, NOW() as server_time, VERSION() as version;')
const activeBottomTab = ref<'results' | 'history' | 'snippets'>('results')

const editorOptions = {
  minimap: { enabled: false },
  fontSize: 13,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: 'on',
  lineNumbers: 'on',
  fontFamily: 'JetBrains Mono, Fira Code, monospace',
  padding: { top: 12, bottom: 12 }
}

const sqlSnippets = [
  { title: 'Show All Tables', sql: 'SHOW TABLES;' },
  { title: 'Server Time & Version', sql: 'SELECT NOW() as current_time, VERSION() as tidb_version;' },
  { title: 'Show Processlist', sql: 'SHOW PROCESSLIST;' },
  { title: 'Select Top 50 Rows', sql: 'SELECT * FROM `table_name` LIMIT 50;' },
  { title: 'Table Schema Information', sql: 'DESCRIBE `table_name`;' },
  { title: 'Explain Query Plan', sql: 'EXPLAIN SELECT * FROM `table_name` WHERE id = 1;' }
]

const handleEditorMount = (editor: any, monaco: any) => {
  editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
    runQuery()
  })
}

const handleKeyDown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    runQuery()
  }
}

const runQuery = async () => {
  if (!sqlCode.value.trim() || !selectedDatabase.value) return
  activeBottomTab.value = 'results'
  await executeQuery(selectedDatabase.value, sqlCode.value.trim(), isReadOnly.value)
}

const formatSql = () => {
  sqlCode.value = sqlCode.value.trim().replace(/\s+/g, ' ')
}

const loadSnippet = (snippetSql: string) => {
  sqlCode.value = snippetSql
  activeBottomTab.value = 'results'
}

const exportResultCsv = () => {
  if (!queryResult.value || !queryResult.value.rows || queryResult.value.rows.length === 0) return
  const cols = queryResult.value.columns
  const csvRows = [
    cols.join(','),
    ...queryResult.value.rows.map((r) =>
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
  a.download = `query_result_${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const formatDate = (isoStr: string) => {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  return d.toLocaleTimeString()
}

onMounted(async () => {
  await fetchDatabases()
  const dbParam = route.query.db as string
  if (dbParam && databases.value.some((d) => d.name === dbParam)) {
    selectedDatabase.value = dbParam
  } else if (databases.value.length > 0) {
    const defaultDb = databases.value.find((d) => !d.isSystem) || databases.value[0]
    selectedDatabase.value = defaultDb.name
  }
  await fetchHistory(selectedDatabase.value)
})
</script>
