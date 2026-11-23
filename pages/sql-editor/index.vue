<template>
  <div class="space-y-6">
    <!-- Header Banner -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-gradient-to-r from-blue-900/30 via-slate-900/40 to-slate-900/60 border border-slate-800/80 p-6 backdrop-blur">
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-bold tracking-tight text-white">
            Monaco <span class="text-cyan-400">SQL Editor</span>
          </h1>
          <span class="rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-[11px] font-mono text-cyan-400">
            Phase 3 Active
          </span>
        </div>
        <p class="text-xs text-slate-400 mt-1">
          Execute interactive SQL queries with sub-millisecond execution telemetry and read-only enforcement.
        </p>
      </div>

      <!-- Controls & Execute Button -->
      <div class="flex items-center gap-3">
        <!-- Target Database Selector -->
        <div class="flex items-center gap-2">
          <Database class="h-4 w-4 text-cyan-400" />
          <select
            v-model="selectedDatabase"
            class="rounded-xl border border-slate-700 bg-slate-900/90 px-3 py-1.5 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none"
          >
            <option v-for="db in databases" :key="db.name" :value="db.name">
              {{ db.name }} {{ db.isSystem ? '(System)' : '' }}
            </option>
          </select>
        </div>

        <!-- Read Only Switch -->
        <label
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs cursor-pointer transition-all select-none"
          :class="isReadOnly ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-900/80 border-slate-800 text-slate-400'"
        >
          <input v-model="isReadOnly" type="checkbox" class="accent-emerald-400" />
          <span>Read-Only Mode</span>
        </label>

        <!-- Run Query Button -->
        <button
          class="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-cyan-500 transition-all disabled:opacity-50"
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
    <div class="rounded-2xl border border-slate-800/80 bg-[#0c121e] shadow-xl overflow-hidden">
      <!-- Editor Top Toolbar -->
      <div class="flex items-center justify-between border-b border-slate-800/80 px-4 py-2 bg-slate-900/60 text-xs">
        <div class="flex items-center gap-2">
          <Terminal class="h-3.5 w-3.5 text-blue-400" />
          <span class="font-mono text-slate-300">query.sql</span>
          <span class="text-slate-600">|</span>
          <span class="text-[11px] text-slate-500">TiDB Serverless / MySQL 8.0</span>
        </div>

        <div class="flex items-center gap-3">
          <button
            class="text-slate-400 hover:text-white transition-colors"
            @click="formatSql"
          >
            Format SQL
          </button>
          <button
            class="text-slate-400 hover:text-white transition-colors"
            @click="sqlCode = ''"
          >
            Clear
          </button>
        </div>
      </div>

      <!-- Editor Area -->
      <div class="relative min-h-[220px] max-h-[360px] bg-[#0c121e]">
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
              class="w-full bg-[#0c121e] p-4 font-mono text-xs text-slate-200 outline-none resize-none"
              placeholder="SELECT * FROM my_table LIMIT 10;"
              @keydown="handleKeyDown"
            ></textarea>
          </template>
        </ClientOnly>
      </div>
    </div>

    <!-- Bottom Section: Results & Telemetry Tabs -->
    <div class="rounded-2xl border border-slate-800/80 bg-[#0f172a]/70 p-6 backdrop-blur space-y-4">
      <!-- Tabs Header -->
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2">
          <button
            class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            :class="activeBottomTab === 'results' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'"
            @click="activeBottomTab = 'results'"
          >
            Query Results
          </button>
          <button
            class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            :class="activeBottomTab === 'history' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'"
            @click="activeBottomTab = 'history'"
          >
            Query History
          </button>
          <button
            class="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all"
            :class="activeBottomTab === 'snippets' ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'"
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

          <span class="text-slate-400 font-mono">
            ⏱ {{ queryResult.executionTimeMs }}ms
          </span>

          <span v-if="queryResult.rows" class="text-slate-400 font-mono">
            {{ queryResult.rows.length }} rows returned
          </span>

          <button
            v-if="queryResult.rows && queryResult.rows.length > 0"
            class="inline-flex items-center gap-1 text-slate-300 hover:text-cyan-400 ml-2"
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
        <div v-else-if="!queryResult" class="py-12 text-center text-xs text-slate-500">
          Enter an SQL query and press <strong class="text-slate-400">Run (Ctrl+Enter)</strong> to see live output.
        </div>

        <!-- Non-SELECT affected rows info -->
        <div
          v-else-if="queryResult.affectedRows !== undefined && (!queryResult.rows || queryResult.rows.length === 0)"
          class="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4 text-xs text-emerald-300"
        >
          Query executed successfully. Affected rows: <strong>{{ queryResult.affectedRows }}</strong>.
        </div>

        <!-- Results Data Table -->
        <div v-else-if="queryResult.rows && queryResult.rows.length > 0" class="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950/60 max-h-[460px]">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="sticky top-0 bg-[#0f172a] border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th v-for="col in queryResult.columns" :key="col" class="p-2.5">
                  {{ col }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60 font-mono text-slate-300">
              <tr v-for="(row, idx) in queryResult.rows" :key="idx" class="hover:bg-slate-900/80">
                <td
                  v-for="col in queryResult.columns"
                  :key="col"
                  class="p-2.5 max-w-xs truncate"
                  :title="String(row[col] ?? '')"
                >
                  <span v-if="row[col] === null" class="text-slate-600 italic">NULL</span>
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
            class="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-xs font-mono"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span
                class="w-2 h-2 rounded-full shrink-0"
                :class="hist.status === 'success' ? 'bg-emerald-400' : 'bg-red-400'"
              ></span>
              <span class="text-cyan-400 uppercase font-bold text-[11px]">{{ hist.queryType }}</span>
              <span class="text-slate-400 truncate text-[11px]">in {{ hist.databaseName }}</span>
              <span class="text-slate-500 text-[10px]">{{ hist.executionTimeMs }}ms</span>
            </div>

            <span class="text-slate-500 text-[10px] shrink-0">{{ formatDate(hist.executedAt) }}</span>
          </div>
        </div>
        <div v-else class="py-10 text-center text-xs text-slate-500">
          No executed queries logged yet.
        </div>
      </div>

      <!-- TAB: TEMPLATES / SNIPPETS -->
      <div v-else-if="activeBottomTab === 'snippets'" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div
          v-for="snippet in sqlSnippets"
          :key="snippet.title"
          class="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5 space-y-2 hover:border-slate-700 transition-colors cursor-pointer"
          @click="loadSnippet(snippet.sql)"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-white">{{ snippet.title }}</span>
            <span class="text-[10px] text-cyan-400 font-mono">Insert →</span>
          </div>
          <code class="block text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded truncate">
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
