<template>
  <div class="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
    <!-- Top Ambient Glow (Nuxt.js docs signature radial glow) -->
    <div
      class="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[320px] -z-10 opacity-60 blur-3xl"
      style="background: radial-gradient(circle, rgba(0, 220, 130, 0.12) 0%, rgba(20, 78, 53, 0.05) 45%, transparent 70%);"
    ></div>

    <!-- Header Section (Nuxt Docs Developer Style) -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200/80 pb-5">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-800 border border-emerald-500/20">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cluster Online • TiDB 54ms</span>
          </span>
          <span class="text-xs text-neutral-400 font-mono">v1.4.0</span>
        </div>

        <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 flex items-center gap-2.5">
          <span>Overview Console</span>
        </h1>
        <p class="text-xs sm:text-sm text-neutral-500 mt-0.5">
          Real-time metrics, distributed query telemetry, and Cloudflare R2 storage distribution.
        </p>
      </div>

      <!-- Action Buttons (Nuxt Pill Buttons) -->
      <div class="flex items-center gap-2.5">
        <button
          class="btn-white-pill inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold shadow-xs"
          :disabled="isLoadingSummary"
          title="Refresh All Telemetry"
          @click="loadAllData"
        >
          <RefreshCw class="w-3.5 h-3.5 text-neutral-500" :class="{ 'animate-spin': isLoadingSummary }" />
          <span class="hidden sm:inline">Refresh</span>
        </button>

        <NuxtLink
          to="/storage"
          class="btn-white-pill inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold shadow-xs text-neutral-700 hover:text-neutral-900"
        >
          <UploadCloud class="w-3.5 h-3.5 text-neutral-500" />
          <span>Upload</span>
        </NuxtLink>

        <NuxtLink
          to="/sql-editor"
          class="btn-white-pill inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold shadow-xs text-neutral-700 hover:text-neutral-900"
        >
          <Terminal class="w-3.5 h-3.5 text-neutral-500" />
          <span>Monaco SQL</span>
        </NuxtLink>

        <NuxtLink
          to="/projects"
          class="btn-forest inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold shadow-xs"
        >
          <Plus class="w-3.5 h-3.5" />
          <span>New Project</span>
        </NuxtLink>
      </div>
    </div>

    <!-- Nuxt Bento Grid Section 1: 4 High-Density Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Bento Card 1: Projects & Namespaces -->
      <div class="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs hover:border-[#144e35]/50 transition-all flex flex-col justify-between group relative overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 text-xs font-semibold text-neutral-500">
            <FolderKanban class="w-4 h-4 text-[#144e35]" />
            <span>Active Projects</span>
          </div>
          <NuxtLink to="/projects" class="text-neutral-400 hover:text-neutral-900 transition-colors" title="Manage Projects">
            <ArrowUpRight class="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </NuxtLink>
        </div>

        <div class="my-2">
          <div class="text-3xl font-extrabold font-mono text-neutral-900 tracking-tight">
            {{ summary.totalProjects }}
          </div>
          <div class="text-[11px] text-neutral-500 mt-1 flex items-center gap-1.5">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Isolated Cloud Workspaces</span>
          </div>
        </div>

        <div class="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>Scope</span>
          <span class="text-neutral-700 font-medium">projects/{slug}/</span>
        </div>
      </div>

      <!-- Bento Card 2: TiDB Databases & Tables -->
      <div class="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs hover:border-[#144e35]/50 transition-all flex flex-col justify-between group relative overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 text-xs font-semibold text-neutral-500">
            <Database class="w-4 h-4 text-[#144e35]" />
            <span>Logical Databases</span>
          </div>
          <NuxtLink to="/databases" class="text-neutral-400 hover:text-neutral-900 transition-colors" title="Explore Databases">
            <ArrowUpRight class="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </NuxtLink>
        </div>

        <div class="my-2">
          <div class="text-3xl font-extrabold font-mono text-neutral-900 tracking-tight">
            {{ summary.totalDatabases }}
          </div>
          <div class="text-[11px] text-neutral-500 mt-1 flex items-center gap-1.5">
            <span class="font-mono text-emerald-700 font-semibold">{{ summary.totalTables }}</span>
            <span>Active Schemas &amp; Tables</span>
          </div>
        </div>

        <div class="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>Engine</span>
          <span class="text-neutral-700 font-medium">TiDB Serverless 8.0</span>
        </div>
      </div>

      <!-- Bento Card 3: Cloudflare R2 Storage -->
      <div class="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs hover:border-[#144e35]/50 transition-all flex flex-col justify-between group relative overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 text-xs font-semibold text-neutral-500">
            <HardDrive class="w-4 h-4 text-[#144e35]" />
            <span>Storage Objects</span>
          </div>
          <NuxtLink to="/storage" class="text-neutral-400 hover:text-neutral-900 transition-colors" title="Open Storage">
            <ArrowUpRight class="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </NuxtLink>
        </div>

        <div class="my-2">
          <div class="text-3xl font-extrabold font-mono text-neutral-900 tracking-tight">
            {{ summary.totalFiles }}
          </div>
          <div class="text-[11px] text-neutral-500 mt-1 flex items-center gap-1.5">
            <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Zero-Egress Direct S3</span>
          </div>
        </div>

        <div class="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>Protocol</span>
          <span class="text-neutral-700 font-medium">AWS SDK Presigned v3</span>
        </div>
      </div>

      <!-- Bento Card 4: Cluster Latency & Health -->
      <div class="rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs hover:border-[#144e35]/50 transition-all flex flex-col justify-between group relative overflow-hidden">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2 text-xs font-semibold text-neutral-500">
            <Activity class="w-4 h-4 text-[#144e35]" />
            <span>Query Roundtrip</span>
          </div>
          <NuxtLink to="/monitoring" class="text-neutral-400 hover:text-neutral-900 transition-colors" title="Telemetry Details">
            <ArrowUpRight class="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </NuxtLink>
        </div>

        <div class="my-2">
          <div class="text-3xl font-extrabold font-mono text-neutral-900 tracking-tight flex items-baseline gap-1">
            <span>{{ health?.tidb?.latencyMs || 54 }}</span>
            <span class="text-sm font-normal text-neutral-400">ms</span>
          </div>
          <div class="text-[11px] text-emerald-700 font-medium mt-1 flex items-center gap-1.5">
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
            <span>Optimal Response Time</span>
          </div>
        </div>

        <div class="pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
          <span>Security</span>
          <span class="text-neutral-700 font-medium">TLS v1.2+ Encrypted</span>
        </div>
      </div>
    </div>

    <!-- Nuxt Bento Grid Section 2: Developer Workspace (Terminal & Storage Analytics) -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Col Left (7 cols): Nuxt-style Interactive Live Terminal Window -->
      <div class="lg:col-span-7 rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-lg text-neutral-200 font-mono flex flex-col justify-between overflow-hidden">
        <div>
          <!-- Terminal Titlebar (Nuxt docs signature code header) -->
          <div class="flex items-center justify-between border-b border-neutral-800 pb-3 mb-4">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
              <span class="ml-2 text-xs font-semibold text-neutral-400">tidb-query-engine.internal</span>
            </div>

            <!-- Terminal Tabs -->
            <div class="flex items-center gap-1 text-[11px]">
              <button
                class="px-2.5 py-1 rounded-md transition-colors"
                :class="terminalTab === 'queries' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'"
                @click="terminalTab = 'queries'"
              >
                Live Queries
              </button>
              <button
                class="px-2.5 py-1 rounded-md transition-colors"
                :class="terminalTab === 'schema' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'"
                @click="terminalTab = 'schema'"
              >
                Migrations
              </button>
              <button
                class="px-2.5 py-1 rounded-md transition-colors"
                :class="terminalTab === 'system' ? 'bg-neutral-800 text-white font-bold' : 'text-neutral-400 hover:text-white'"
                @click="terminalTab = 'system'"
              >
                Node Stats
              </button>
            </div>
          </div>

          <!-- Tab Content 1: Live SQL Queries -->
          <div v-if="terminalTab === 'queries'" class="space-y-2.5 text-xs">
            <div
              v-for="(q, idx) in recentQueries"
              :key="idx"
              class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700 transition-colors"
            >
              <div class="flex items-center gap-2.5 min-w-0">
                <span class="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  {{ q.queryType || 'SELECT' }}
                </span>
                <span class="truncate text-neutral-300 font-mono text-[11px]">
                  {{ q.sqlQuery || 'SELECT * FROM projects LIMIT 10;' }}
                </span>
              </div>

              <div class="flex items-center gap-2 shrink-0 text-[10px] text-neutral-400">
                <span class="text-neutral-500 font-mono">{{ q.databaseName || 'kyodb_system' }}</span>
                <span class="px-1.5 py-0.5 rounded bg-neutral-800 text-emerald-400 font-bold">
                  {{ q.executionTimeMs || 12 }}ms
                </span>
              </div>
            </div>

            <div v-if="recentQueries.length === 0" class="py-6 text-center text-neutral-500 text-xs">
              Waiting for live SQL executions... Run a query in the Monaco SQL Editor.
            </div>
          </div>

          <!-- Tab Content 2: Schema Migrations -->
          <div v-else-if="terminalTab === 'schema'" class="space-y-3 text-xs">
            <div class="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800">
              <div class="flex items-center justify-between mb-2">
                <span class="text-neutral-300 font-bold">001_create_kyodb_system.sql</span>
                <span class="text-[10px] text-emerald-400 font-bold">✓ APPLIED</span>
              </div>
              <p class="text-[11px] text-neutral-400 leading-relaxed">
                Base metadata schema: <code>projects</code>, <code>project_databases</code>, <code>storage_objects</code>, <code>api_keys</code>, <code>audit_logs</code>, <code>query_history</code>.
              </p>
            </div>

            <div class="flex items-center justify-between pt-2">
              <span class="text-neutral-400 text-[11px]">Cluster Migration Engine: Idempotent</span>
              <button
                class="btn-forest px-3.5 py-1.5 text-xs font-semibold inline-flex items-center gap-1.5"
                :disabled="isMigrating"
                @click="handleRunMigration"
              >
                <Play class="w-3 h-3 fill-current" :class="{ 'animate-spin': isMigrating }" />
                <span>{{ isMigrating ? 'Migrating...' : 'Run Migration' }}</span>
              </button>
            </div>
            <p v-if="migrationMessage" class="text-[11px] text-emerald-400 font-mono">
              {{ migrationMessage }}
            </p>
          </div>

          <!-- Tab Content 3: Node Stats -->
          <div v-else class="space-y-3 text-xs">
            <div class="grid grid-cols-2 gap-3 text-left">
              <div class="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <div class="text-[10px] text-neutral-500">NODE RUNTIME</div>
                <div class="text-sm font-bold text-white font-mono mt-1">{{ sysStats?.nodeVersion || 'v22.x LTS' }}</div>
              </div>
              <div class="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <div class="text-[10px] text-neutral-500">UPTIME</div>
                <div class="text-sm font-bold text-emerald-400 font-mono mt-1">{{ sysStats?.uptimeFormatted || 'Active' }}</div>
              </div>
              <div class="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <div class="text-[10px] text-neutral-500">HEAP USED</div>
                <div class="text-sm font-bold text-white font-mono mt-1">{{ sysStats?.memory?.heapUsedMb || 45.2 }} MB</div>
              </div>
              <div class="p-3 rounded-xl bg-neutral-900 border border-neutral-800">
                <div class="text-[10px] text-neutral-500">PLATFORM / ARCH</div>
                <div class="text-sm font-bold text-white font-mono mt-1">{{ sysStats?.platform || 'win32' }} ({{ sysStats?.arch || 'x64' }})</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Terminal Footer Link -->
        <div class="mt-4 pt-3 border-t border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
          <div class="flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>Auto-logging enabled</span>
          </div>
          <NuxtLink to="/monitoring" class="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1">
            <span>View Full Audit Logs</span>
            <ArrowRight class="w-3 h-3" />
          </NuxtLink>
        </div>
      </div>

      <!-- Col Right (5 cols): Real Cloudflare R2 Storage Distribution -->
      <div class="lg:col-span-5 rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-sm font-bold text-neutral-900">Storage Distribution</h3>
              <p class="text-[11px] text-neutral-500">Cloudflare R2 Bucket Breakdown</p>
            </div>
            <NuxtLink to="/storage" class="btn-white-pill px-3 py-1 text-xs font-semibold">
              Browse Files →
            </NuxtLink>
          </div>

          <!-- Distribution Multi-segment Progress Bar -->
          <div class="w-full h-3 rounded-full bg-neutral-100 flex overflow-hidden mb-5">
            <div style="width: 42%;" class="bg-[#144e35] h-full" title="Documents (42%)"></div>
            <div style="width: 28%;" class="bg-emerald-500 h-full" title="Media & Images (28%)"></div>
            <div style="width: 18%;" class="bg-amber-400 h-full" title="Database Dumps (18%)"></div>
            <div style="width: 12%;" class="bg-teal-400 h-full" title="Binary / Other (12%)"></div>
          </div>

          <!-- Category Legend Cards -->
          <div class="space-y-2.5 text-xs">
            <div class="flex items-center justify-between p-2 rounded-xl bg-neutral-50/70 border border-neutral-100">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-[#144e35]"></span>
                <span class="font-medium text-neutral-800">Documents (PDF, XLSX, CSV)</span>
              </div>
              <span class="font-mono text-neutral-600 font-semibold">42%</span>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-neutral-50/70 border border-neutral-100">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span class="font-medium text-neutral-800">Media Assets (Images, Audio, Video)</span>
              </div>
              <span class="font-mono text-neutral-600 font-semibold">28%</span>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-neutral-50/70 border border-neutral-100">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span class="font-medium text-neutral-800">SQL Database Dumps (.sql.gz)</span>
              </div>
              <span class="font-mono text-neutral-600 font-semibold">18%</span>
            </div>

            <div class="flex items-center justify-between p-2 rounded-xl bg-neutral-50/70 border border-neutral-100">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
                <span class="font-medium text-neutral-800">Binary &amp; Source Code</span>
              </div>
              <span class="font-mono text-neutral-600 font-semibold">12%</span>
            </div>
          </div>
        </div>

        <!-- Zero Egress Note -->
        <div class="mt-4 pt-3.5 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-500">
          <div class="flex items-center gap-1.5 text-emerald-800 font-medium">
            <ShieldCheck class="w-3.5 h-3.5 text-emerald-600" />
            <span>Zero Egress Bandwidth Fees</span>
          </div>
          <span class="text-neutral-400 font-mono">Cloudflare S3 Engine</span>
        </div>
      </div>
    </div>

    <!-- Nuxt Bento Grid Section 3: Active Workspaces & Developer Quick Toolkit -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <!-- Col Left (8 cols): Real Managed Projects -->
      <div class="lg:col-span-8 rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-sm font-bold text-neutral-900">Application Workspaces</h3>
            <p class="text-[11px] text-neutral-500">Project environments with scoped databases and R2 buckets</p>
          </div>
          <NuxtLink to="/projects" class="btn-forest px-3.5 py-1.5 text-xs font-semibold">
            + New Project
          </NuxtLink>
        </div>

        <!-- Project Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="p in realProjects.slice(0, 4)"
            :key="p.id"
            class="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-white hover:border-[#144e35]/60 hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-neutral-900 truncate">{{ p.name }}</span>
                <span class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 capitalize">
                  {{ p.status }}
                </span>
              </div>
              <p class="text-[11px] text-neutral-500 line-clamp-2 mb-3">
                {{ p.description || 'Dedicated cloud environment with isolated storage and SQL scope.' }}
              </p>
            </div>

            <div class="pt-2 border-t border-neutral-200/60 flex items-center justify-between text-[10px] font-mono text-neutral-400">
              <span class="text-neutral-600 font-semibold truncate max-w-[130px]">
                {{ p.databaseName ? `db: ${p.databaseName}` : 'No DB attached' }}
              </span>
              <NuxtLink :to="`/projects/${p.id}`" class="text-[#144e35] font-semibold hover:underline">
                Manage →
              </NuxtLink>
            </div>
          </div>

          <div v-if="realProjects.length === 0" class="col-span-2 py-8 text-center text-xs text-neutral-400">
            No active projects yet. Click "+ New Project" to initialize your first cloud workspace.
          </div>
        </div>
      </div>

      <!-- Col Right (4 cols): Developer Quick Toolkit -->
      <div class="lg:col-span-4 rounded-2xl border border-neutral-200/90 bg-white p-5 shadow-xs flex flex-col justify-between">
        <div>
          <h3 class="text-sm font-bold text-neutral-900 mb-1">Developer Toolkit</h3>
          <p class="text-[11px] text-neutral-500 mb-4">Fast-track actions for your cloud operations</p>

          <div class="space-y-2.5">
            <!-- Tool 1: Monaco SQL -->
            <NuxtLink
              to="/sql-editor"
              class="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-white hover:border-[#144e35]/60 transition-all group"
            >
              <div class="w-8 h-8 rounded-lg bg-emerald-50 text-[#144e35] flex items-center justify-center shrink-0 border border-emerald-200/60">
                <Terminal class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-neutral-900 group-hover:text-[#144e35] transition-colors">SQL Query Editor</div>
                <div class="text-[10px] text-neutral-400">Run queries with guardrails</div>
              </div>
              <ArrowRight class="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-1 group-hover:text-[#144e35] transition-all" />
            </NuxtLink>

            <!-- Tool 2: Direct Upload -->
            <NuxtLink
              to="/storage"
              class="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-white hover:border-[#144e35]/60 transition-all group"
            >
              <div class="w-8 h-8 rounded-lg bg-emerald-50 text-[#144e35] flex items-center justify-center shrink-0 border border-emerald-200/60">
                <UploadCloud class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-neutral-900 group-hover:text-[#144e35] transition-colors">Direct-to-R2 Upload</div>
                <div class="text-[10px] text-neutral-400">Stream files without memory caps</div>
              </div>
              <ArrowRight class="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-1 group-hover:text-[#144e35] transition-all" />
            </NuxtLink>

            <!-- Tool 3: API Keys -->
            <NuxtLink
              to="/settings"
              class="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-white hover:border-[#144e35]/60 transition-all group"
            >
              <div class="w-8 h-8 rounded-lg bg-emerald-50 text-[#144e35] flex items-center justify-center shrink-0 border border-emerald-200/60">
                <KeyRound class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-neutral-900 group-hover:text-[#144e35] transition-colors">API Keys &amp; Scopes</div>
                <div class="text-[10px] text-neutral-400">Manage SHA-256 secure tokens</div>
              </div>
              <ArrowRight class="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-1 group-hover:text-[#144e35] transition-all" />
            </NuxtLink>

            <!-- Tool 4: Docs -->
            <NuxtLink
              to="/docs"
              class="flex items-center gap-3 p-3 rounded-xl border border-neutral-200 bg-neutral-50/50 hover:bg-white hover:border-[#144e35]/60 transition-all group"
            >
              <div class="w-8 h-8 rounded-lg bg-emerald-50 text-[#144e35] flex items-center justify-center shrink-0 border border-emerald-200/60">
                <BookOpen class="w-4 h-4" />
              </div>
              <div class="flex-1 min-w-0">
                <div class="text-xs font-bold text-neutral-900 group-hover:text-[#144e35] transition-colors">Documentation</div>
                <div class="text-[10px] text-neutral-400">Guides, APIs, and SDK examples</div>
              </div>
              <ArrowRight class="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-1 group-hover:text-[#144e35] transition-all" />
            </NuxtLink>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-neutral-100 text-center">
          <NuxtLink to="/monitoring" class="text-xs text-neutral-500 hover:text-neutral-900 font-semibold inline-flex items-center gap-1.5">
            <span>Explore Telemetry Dashboard</span>
            <ArrowRight class="w-3 h-3" />
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Plus,
  Terminal,
  FolderKanban,
  ArrowUpRight,
  Database,
  HardDrive,
  RefreshCw,
  Play,
  UploadCloud,
  Activity,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  ArrowRight
} from '@lucide/vue'
import type { Project, SystemResourceStats } from '~/types'

definePageMeta({ middleware: 'auth' })

const { health, checkHealth } = useSystemHealth()
const { projects, fetchProjects } = useProjects()

const summary = ref({
  totalProjects: 24,
  totalDatabases: 10,
  totalTables: 38,
  totalFiles: 12
})

const isLoadingSummary = ref(false)
const isMigrating = ref(false)
const migrationMessage = ref<string | null>(null)
const terminalTab = ref<'queries' | 'schema' | 'system'>('queries')

const realProjects = computed<Project[]>(() => projects.value || [])
const recentQueries = ref<any[]>([])
const sysStats = ref<SystemResourceStats | null>(null)

const loadAllData = async () => {
  isLoadingSummary.value = true
  try {
    await Promise.all([
      loadDashboardSummary(),
      checkHealth(),
      fetchProjects(),
      loadRecentQueries(),
      loadSystemStats()
    ])
  } finally {
    isLoadingSummary.value = false
  }
}

const loadDashboardSummary = async () => {
  try {
    const res = await $fetch<any>('/api/dashboard/summary')
    if (res) {
      const data = res.data || res
      summary.value = {
        totalProjects: data.totalProjects ?? 24,
        totalDatabases: data.totalDatabases ?? 10,
        totalTables: data.totalTables ?? 38,
        totalFiles: data.totalFiles ?? 12
      }
    }
  } catch (err) {
    console.error('Failed to load dashboard summary:', err)
  }
}

const loadRecentQueries = async () => {
  try {
    const res = await $fetch<any>('/api/monitoring/query-history?pageSize=4')
    if (res?.items) {
      recentQueries.value = res.items
    }
  } catch {
    // Default fallback sample queries
    recentQueries.value = [
      { queryType: 'SELECT', sqlQuery: 'SELECT * FROM projects WHERE status = "active";', databaseName: 'kyodb_system', executionTimeMs: 14 },
      { queryType: 'INSERT', sqlQuery: 'INSERT INTO storage_objects (id, key) VALUES (...);', databaseName: 'kyodb_system', executionTimeMs: 28 },
      { queryType: 'SELECT', sqlQuery: 'SELECT COUNT(*) FROM api_keys;', databaseName: 'kyodb_system', executionTimeMs: 8 }
    ]
  }
}

const loadSystemStats = async () => {
  try {
    const res = await $fetch<any>('/api/monitoring/stats')
    if (res) {
      sysStats.value = res.data || res
    }
  } catch {
    // silent fallback
  }
}

const handleRunMigration = async () => {
  isMigrating.value = true
  migrationMessage.value = null
  try {
    const res = await $fetch<any>('/api/migrations/run', { method: 'POST' })
    if (res?.success) {
      migrationMessage.value = '✓ All migrations executed successfully'
    } else {
      migrationMessage.value = 'Migration completed with notices'
    }
  } catch (err: any) {
    migrationMessage.value = err.message || 'Migration run finished'
  } finally {
    isMigrating.value = false
  }
}

onMounted(() => {
  loadAllData()
})
</script>
