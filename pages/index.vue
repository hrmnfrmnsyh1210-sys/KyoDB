<template>
  <div class="min-h-screen bg-[#fcfdfd] text-neutral-900 selection:bg-emerald-100 selection:text-emerald-900 flex flex-col font-sans">
    <!-- Top Announcement Bar -->
    <div class="bg-[#144e35] text-white text-xs py-2 px-4 text-center font-medium flex items-center justify-center gap-2">
      <span class="bg-white/20 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">New v1.4</span>
      <span>Resource Monitoring, Telemetry, and Cryptographic API Keys are now live!</span>
      <NuxtLink to="/docs" class="underline underline-offset-2 hover:text-emerald-200 ml-1 font-semibold">
        Read the Docs →
      </NuxtLink>
    </div>

    <!-- Navigation Header -->
    <header class="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-neutral-200/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5">
          <img
            src="/images/logo.webp"
            alt="KyoDB Logo"
            class="h-8.5 w-auto object-contain"
          />
          <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            Console
          </span>
        </NuxtLink>

        <!-- Nav Links -->
        <nav class="hidden md:flex items-center gap-7 text-xs font-semibold text-neutral-600">
          <a href="#features" class="hover:text-[#144e35] transition-colors">Features</a>
          <a href="#architecture" class="hover:text-[#144e35] transition-colors">Architecture</a>
          <a href="#code-sample" class="hover:text-[#144e35] transition-colors">Integration</a>
          <NuxtLink to="/docs" class="hover:text-[#144e35] transition-colors flex items-center gap-1.5">
            <BookOpen class="w-3.5 h-3.5" />
            <span>Documentation</span>
          </NuxtLink>
        </nav>

        <!-- Action CTAs -->
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/docs"
            class="hidden sm:inline-flex items-center gap-1.5 btn-white-pill px-4 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-900"
          >
            <BookOpen class="w-3.5 h-3.5 text-neutral-500" />
            <span>Docs</span>
          </NuxtLink>

          <NuxtLink
            v-if="auth.isAuthenticated.value"
            to="/dashboard"
            class="btn-forest inline-flex items-center gap-2 px-4.5 py-2 text-xs font-semibold shadow-xs"
          >
            <LayoutGrid class="w-3.5 h-3.5" />
            <span>Open Dashboard</span>
          </NuxtLink>

          <NuxtLink
            v-else
            to="/login"
            class="btn-forest inline-flex items-center gap-2 px-4.5 py-2 text-xs font-semibold shadow-xs"
          >
            <span>Launch Console</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Hero Section -->
    <main class="flex-1">
      <section class="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <!-- Ambient mint/emerald glowing orbs -->
        <div class="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-tr from-emerald-100/50 via-teal-50/40 to-transparent blur-3xl pointer-events-none rounded-full"></div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <!-- Tag Pill -->
          <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-neutral-200/80 shadow-xs text-xs text-neutral-700 mb-6 animate-fade-in">
            <span class="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-semibold text-neutral-900">Hybrid Cloud Platform</span>
            <span class="text-neutral-300">•</span>
            <span class="text-[#144e35] font-medium">TiDB Cloud &amp; Cloudflare R2</span>
          </div>

          <!-- Hero Headline -->
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 max-w-4xl mx-auto leading-[1.15]">
            One Unified Dashboard.<br />
            <span class="text-[#144e35] relative inline-block">
              All Your Cloud Data.
              <svg class="absolute -bottom-2 left-0 w-full text-emerald-300/60 -z-10" viewBox="0 0 300 20" fill="none">
                <path d="M5 15C80 5 220 5 295 15" stroke="currentColor" stroke-width="8" stroke-linecap="round"/>
              </svg>
            </span>
          </h1>

          <!-- Hero Subtitle -->
          <p class="mt-6 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Operate distributed relational SQL on <strong>TiDB Cloud</strong> alongside ultra-fast, zero-egress object storage on <strong>Cloudflare R2</strong>. Built with strict security guardrails and modern Donezo design.
          </p>

          <!-- Action Buttons -->
          <div class="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <NuxtLink
              :to="auth.isAuthenticated.value ? '/dashboard' : '/login'"
              class="btn-forest inline-flex items-center gap-2.5 px-6 py-3 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <LayoutGrid v-if="auth.isAuthenticated.value" class="w-4 h-4" />
              <Terminal v-else class="w-4 h-4" />
              <span>{{ auth.isAuthenticated.value ? 'Go to Dashboard' : 'Open KyoDB Console' }}</span>
              <ArrowRight class="w-4 h-4" />
            </NuxtLink>

            <NuxtLink
              to="/docs"
              class="btn-white-pill inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-neutral-800 hover:text-neutral-900 shadow-sm"
            >
              <BookOpen class="w-4 h-4 text-[#144e35]" />
              <span>Explore Documentation</span>
            </NuxtLink>
          </div>

          <!-- Live Cluster Health Status Banner -->
          <div class="mt-12 max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div class="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex items-center gap-3 text-left">
              <div class="w-9 h-9 rounded-xl bg-emerald-50 text-[#144e35] flex items-center justify-center shrink-0 border border-emerald-200/60">
                <Database class="w-4.5 h-4.5" />
              </div>
              <div>
                <div class="text-[11px] font-medium text-neutral-500">TiDB Cloud</div>
                <div class="text-xs font-bold text-neutral-900">Distributed SQL</div>
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex items-center gap-3 text-left">
              <div class="w-9 h-9 rounded-xl bg-emerald-50 text-[#144e35] flex items-center justify-center shrink-0 border border-emerald-200/60">
                <HardDrive class="w-4.5 h-4.5" />
              </div>
              <div>
                <div class="text-[11px] font-medium text-neutral-500">Cloudflare R2</div>
                <div class="text-xs font-bold text-neutral-900">Zero Egress S3</div>
              </div>
            </div>

            <div class="col-span-2 sm:col-span-1 p-3.5 rounded-2xl bg-white border border-neutral-200/80 shadow-xs flex items-center gap-3 text-left">
              <div class="w-9 h-9 rounded-xl bg-emerald-50 text-[#144e35] flex items-center justify-center shrink-0 border border-emerald-200/60">
                <ShieldCheck class="w-4.5 h-4.5" />
              </div>
              <div>
                <div class="text-[11px] font-medium text-neutral-500">Security</div>
                <div class="text-xs font-bold text-neutral-900">Argon2id + SHA-256</div>
              </div>
            </div>
          </div>

          <!-- Interactive Dashboard Mockup Preview -->
          <div class="mt-14 relative max-w-5xl mx-auto">
            <div class="rounded-2xl border border-neutral-200/90 bg-white p-2 sm:p-3 shadow-2xl overflow-hidden">
              <!-- Mock Window Titlebar -->
              <div class="flex items-center justify-between px-3 py-2 border-b border-neutral-100 bg-neutral-50/60 rounded-t-xl mb-3">
                <div class="flex items-center gap-2">
                  <span class="w-3 h-3 rounded-full bg-rose-400"></span>
                  <span class="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span class="w-3 h-3 rounded-full bg-emerald-400"></span>
                  <span class="ml-2 text-[11px] font-mono text-neutral-400">kyodb-console.internal</span>
                </div>
                <div class="flex items-center gap-2 text-[10px] text-neutral-400 font-mono">
                  <span class="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>TLS v1.2+ Protected</span>
                </div>
              </div>

              <!-- Mock Dashboard Content Preview -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-3 p-2 text-left">
                <!-- Highlight Card -->
                <div class="donezo-card-forest p-4 rounded-xl flex flex-col justify-between min-h-[120px]">
                  <div class="flex items-center justify-between text-xs text-white/80 font-medium">
                    <span>Total Projects</span>
                    <ArrowUpRight class="w-3.5 h-3.5 text-white" />
                  </div>
                  <div class="text-3xl font-bold font-mono text-white">24</div>
                  <div class="text-[10px] text-emerald-200 font-mono">Managed Workspaces</div>
                </div>

                <!-- Metric 2 -->
                <div class="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs flex flex-col justify-between">
                  <div class="text-xs font-medium text-neutral-500">Databases Online</div>
                  <div class="text-2xl font-bold font-mono text-neutral-900">12</div>
                  <div class="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle class="w-3 h-3 text-emerald-600" />
                    <span>All Healthy</span>
                  </div>
                </div>

                <!-- Metric 3 -->
                <div class="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs flex flex-col justify-between">
                  <div class="text-xs font-medium text-neutral-500">Storage Files</div>
                  <div class="text-2xl font-bold font-mono text-neutral-900">1,480</div>
                  <div class="text-[10px] text-neutral-400 font-mono">Direct-to-R2 presigned</div>
                </div>

                <!-- Metric 4 -->
                <div class="p-4 rounded-xl border border-neutral-200 bg-white shadow-2xs flex flex-col justify-between">
                  <div class="text-xs font-medium text-neutral-500">Query Latency</div>
                  <div class="text-2xl font-bold font-mono text-neutral-900">54<span class="text-xs font-normal text-neutral-400">ms</span></div>
                  <div class="text-[10px] text-emerald-700 font-medium">Optimal Response</div>
                </div>
              </div>

              <!-- Mock Table Snippet -->
              <div class="mt-3 mx-2 p-3 rounded-xl bg-neutral-50/70 border border-neutral-200/80">
                <div class="flex items-center justify-between mb-2 text-xs font-semibold text-neutral-700">
                  <div class="flex items-center gap-2">
                    <Database class="w-3.5 h-3.5 text-[#144e35]" />
                    <span>Live Database Tables Explorer</span>
                  </div>
                  <span class="text-[11px] font-mono text-neutral-400">SELECT * FROM orders LIMIT 3;</span>
                </div>
                <div class="overflow-x-auto text-xs font-mono text-neutral-600">
                  <table class="w-full text-left">
                    <thead>
                      <tr class="text-[10px] text-neutral-400 border-b border-neutral-200 uppercase">
                        <th class="pb-1">id</th>
                        <th class="pb-1">customer</th>
                        <th class="pb-1">amount</th>
                        <th class="pb-1">status</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-neutral-200/60 text-[11px]">
                      <tr>
                        <td class="py-1">ord_98a2</td>
                        <td class="py-1">Acme Logistics</td>
                        <td class="py-1 font-bold text-neutral-900">$1,420.00</td>
                        <td class="py-1 text-emerald-700 font-semibold">completed</td>
                      </tr>
                      <tr>
                        <td class="py-1">ord_71c4</td>
                        <td class="py-1">Starlight SaaS</td>
                        <td class="py-1 font-bold text-neutral-900">$850.00</td>
                        <td class="py-1 text-emerald-700 font-semibold">completed</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Architecture Overview Section -->
      <section id="architecture" class="py-16 md:py-24 bg-white border-y border-neutral-200/80">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto">
            <span class="text-xs font-bold uppercase tracking-wider text-[#144e35] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Dual-Engine Architecture
            </span>
            <h2 class="mt-4 text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Designed for Speed, Scale &amp; Zero Friction
            </h2>
            <p class="mt-3 text-sm sm:text-base text-neutral-500">
              Combining relational ACID guarantees with globally distributed, zero-egress object storage.
            </p>
          </div>

          <div class="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Engine 1: TiDB Cloud -->
            <div class="rounded-2xl border border-neutral-200 bg-[#fbfcfc] p-7 sm:p-8 relative overflow-hidden shadow-xs hover:border-[#144e35]/40 transition-colors">
              <div class="flex items-center gap-3.5 mb-5">
                <div class="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-[#144e35] flex items-center justify-center">
                  <Database class="w-6 h-6" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-neutral-900">TiDB Cloud Engine</h3>
                  <p class="text-xs text-neutral-500">Structured Relational Database</p>
                </div>
              </div>

              <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                Distributed MySQL-compatible engine offering horizontal scalability without sharding complexity. Powers user tables, system metadata, query history, and cryptographically hashed API keys.
              </p>

              <ul class="space-y-3 text-xs text-neutral-700">
                <li class="flex items-center gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-[#144e35] shrink-0" />
                  <span>MySQL 8.0 protocol support with pooled TLS v1.2+ connections</span>
                </li>
                <li class="flex items-center gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-[#144e35] shrink-0" />
                  <span>System schema protection guarding <code>kyodb_system</code> metadata</span>
                </li>
                <li class="flex items-center gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-[#144e35] shrink-0" />
                  <span>Full Monaco SQL Editor with query latency telemetry</span>
                </li>
              </ul>
            </div>

            <!-- Engine 2: Cloudflare R2 -->
            <div class="rounded-2xl border border-neutral-200 bg-[#fbfcfc] p-7 sm:p-8 relative overflow-hidden shadow-xs hover:border-[#144e35]/40 transition-colors">
              <div class="flex items-center gap-3.5 mb-5">
                <div class="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-[#144e35] flex items-center justify-center">
                  <HardDrive class="w-6 h-6" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-neutral-900">Cloudflare R2 Storage</h3>
                  <p class="text-xs text-neutral-500">Zero-Egress Object Storage</p>
                </div>
              </div>

              <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-6">
                S3-compatible object storage designed for massive scale without bandwidth egress charges. Supports media assets, raw documents, and scheduled database backups.
              </p>

              <ul class="space-y-3 text-xs text-neutral-700">
                <li class="flex items-center gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-[#144e35] shrink-0" />
                  <span>Direct-to-R2 pre-signed uploads (prevents Vercel payload limits)</span>
                </li>
                <li class="flex items-center gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-[#144e35] shrink-0" />
                  <span>Virtual folder navigation and project scoping (<code>projects/{slug}/</code>)</span>
                </li>
                <li class="flex items-center gap-2.5">
                  <CheckCircle2 class="w-4 h-4 text-[#144e35] shrink-0" />
                  <span>Instant inline previews for images, video, audio, PDF, and code</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- 6 Key Features Section -->
      <section id="features" class="py-16 md:py-24 bg-[#fcfdfd]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-14">
            <span class="text-xs font-bold uppercase tracking-wider text-[#144e35] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
              Core Capabilities
            </span>
            <h2 class="mt-4 text-3xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              Everything You Need in One Unified Tool
            </h2>
            <p class="mt-3 text-sm sm:text-base text-neutral-500">
              Eliminate context switching between cloud providers, database GUIs, and S3 file buckets.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- Feature 1 -->
            <div class="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-[#144e35] border border-emerald-200/60 flex items-center justify-center mb-4">
                <FolderKanban class="w-5 h-5" />
              </div>
              <h3 class="text-base font-bold text-neutral-900 mb-1.5">Project Workspaces</h3>
              <p class="text-xs text-neutral-500 leading-relaxed">
                Isolate schemas, databases, file buckets, and credentials per project or client with custom scoping.
              </p>
            </div>

            <!-- Feature 2 -->
            <div class="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-[#144e35] border border-emerald-200/60 flex items-center justify-center mb-4">
                <Database class="w-5 h-5" />
              </div>
              <h3 class="text-base font-bold text-neutral-900 mb-1.5">Table &amp; Schema Designer</h3>
              <p class="text-xs text-neutral-500 leading-relaxed">
                Create and modify tables, alter column types, define primary keys, and edit table rows inline with visual controls.
              </p>
            </div>

            <!-- Feature 3 -->
            <div class="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-[#144e35] border border-emerald-200/60 flex items-center justify-center mb-4">
                <Terminal class="w-5 h-5" />
              </div>
              <h3 class="text-base font-bold text-neutral-900 mb-1.5">Monaco SQL Editor</h3>
              <p class="text-xs text-neutral-500 leading-relaxed">
                VS Code-grade query editor with SQL syntax highlighting, DDL/DML destructive guardrails, and query history.
              </p>
            </div>

            <!-- Feature 4 -->
            <div class="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-[#144e35] border border-emerald-200/60 flex items-center justify-center mb-4">
                <UploadCloud class="w-5 h-5" />
              </div>
              <h3 class="text-base font-bold text-neutral-900 mb-1.5">Direct-to-R2 Uploads</h3>
              <p class="text-xs text-neutral-500 leading-relaxed">
                Stream gigabytes directly from client to Cloudflare R2 via pre-signed S3 URLs without taxing server memory.
              </p>
            </div>

            <!-- Feature 5 -->
            <div class="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-[#144e35] border border-emerald-200/60 flex items-center justify-center mb-4">
                <Activity class="w-5 h-5" />
              </div>
              <h3 class="text-base font-bold text-neutral-900 mb-1.5">Telemetry &amp; Audit Logs</h3>
              <p class="text-xs text-neutral-500 leading-relaxed">
                Live system uptime, heap memory utilization, query latency tracking, and immutable audit logs.
              </p>
            </div>

            <!-- Feature 6 -->
            <div class="p-6 rounded-2xl border border-neutral-200 bg-white shadow-xs hover:shadow-md transition-shadow">
              <div class="w-10 h-10 rounded-xl bg-emerald-50 text-[#144e35] border border-emerald-200/60 flex items-center justify-center mb-4">
                <KeyRound class="w-5 h-5" />
              </div>
              <h3 class="text-base font-bold text-neutral-900 mb-1.5">Zero-Knowledge API Keys</h3>
              <p class="text-xs text-neutral-500 leading-relaxed">
                Generate cryptographically secure tokens with SHA-256 hashed storage, granular permission scoping, and instant revocation.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Code Showcase Section -->
      <section id="code-sample" class="py-16 md:py-20 bg-white border-y border-neutral-200/80">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <span class="text-xs font-bold uppercase tracking-wider text-[#144e35] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200/60">
                Developer-First
              </span>
              <h2 class="mt-4 text-3xl font-extrabold text-neutral-900 tracking-tight">
                Integrate Seamlessly with Your Existing Stack
              </h2>
              <p class="mt-3 text-sm text-neutral-500 leading-relaxed">
                Connect your backend services, microservices, or CI/CD pipelines to KyoDB using standard REST APIs and scoped API Keys.
              </p>

              <div class="mt-6 space-y-3 text-xs text-neutral-700">
                <div class="flex items-center gap-2.5">
                  <div class="w-5 h-5 rounded-full bg-emerald-100 text-[#144e35] flex items-center justify-center font-bold text-[10px]">1</div>
                  <span>Generate an API Key in <strong>Settings → API Keys</strong></span>
                </div>
                <div class="flex items-center gap-2.5">
                  <div class="w-5 h-5 rounded-full bg-emerald-100 text-[#144e35] flex items-center justify-center font-bold text-[10px]">2</div>
                  <span>Attach granular permissions (e.g. <code>databases:read</code>, <code>storage:write</code>)</span>
                </div>
                <div class="flex items-center gap-2.5">
                  <div class="w-5 h-5 rounded-full bg-emerald-100 text-[#144e35] flex items-center justify-center font-bold text-[10px]">3</div>
                  <span>Call endpoints with <code>Authorization: Bearer kyo_live_...</code></span>
                </div>
              </div>

              <div class="mt-8">
                <NuxtLink
                  to="/docs"
                  class="btn-forest inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold"
                >
                  <BookOpen class="w-4 h-4" />
                  <span>View Full API Documentation →</span>
                </NuxtLink>
              </div>
            </div>

            <!-- Code Block Card -->
            <div class="rounded-2xl border border-neutral-800 bg-neutral-950 p-5 shadow-2xl text-xs font-mono text-neutral-300 overflow-hidden">
              <div class="flex items-center justify-between pb-3 border-b border-neutral-800 text-[11px] text-neutral-400">
                <div class="flex items-center gap-2">
                  <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span class="ml-2 text-neutral-400 font-semibold">example-upload.ts</span>
                </div>
                <span class="text-[10px] text-emerald-400">TypeScript / Node.js</span>
              </div>

              <pre class="pt-4 overflow-x-auto text-[11px] leading-relaxed text-neutral-200">
<code><span class="text-neutral-500">// 1. Request presigned upload URL</span>
<span class="text-emerald-400">const</span> res = <span class="text-emerald-400">await</span> fetch(<span class="text-amber-300">'https://your-kyodb.com/api/storage/upload-url'</span>, {
  method: <span class="text-amber-300">'POST'</span>,
  headers: {
    <span class="text-amber-300">'Authorization'</span>: <span class="text-amber-300">'Bearer kyo_live_8f3a9e...'</span>,
    <span class="text-amber-300">'Content-Type'</span>: <span class="text-amber-300">'application/json'</span>
  },
  body: JSON.stringify({
    key: <span class="text-amber-300">'reports/q4_audit.pdf'</span>,
    contentType: <span class="text-amber-300">'application/pdf'</span>,
    sizeBytes: 2048500
  })
})

<span class="text-emerald-400">const</span> { uploadUrl } = <span class="text-emerald-400">await</span> res.json()

<span class="text-neutral-500">// 2. Direct upload to Cloudflare R2</span>
<span class="text-emerald-400">await</span> fetch(uploadUrl, {
  method: <span class="text-amber-300">'PUT'</span>,
  headers: { <span class="text-amber-300">'Content-Type'</span>: <span class="text-amber-300">'application/pdf'</span> },
  body: fileBlob
})

console.log(<span class="text-amber-300">'✅ File uploaded directly to Cloudflare R2!'</span>)</code></pre>
            </div>
          </div>
        </div>
      </section>

      <!-- Documentation Directory Quick Jump -->
      <section class="py-16 bg-[#fcfdfd]">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-10">
            <h2 class="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
              Comprehensive Documentation
            </h2>
            <p class="mt-2 text-xs sm:text-sm text-neutral-500">
              Clear guides, architecture breakdowns, and step-by-step instructions.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <NuxtLink
              to="/docs#getting-started"
              class="p-5 rounded-2xl border border-neutral-200 bg-white hover:border-[#144e35] transition-all group shadow-xs"
            >
              <div class="text-xs font-bold text-neutral-900 group-hover:text-[#144e35] flex items-center justify-between mb-1">
                <span>1. Getting Started</span>
                <ArrowRight class="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#144e35] transition-transform group-hover:translate-x-1" />
              </div>
              <p class="text-[11px] text-neutral-500">Initial admin setup, credential configuration, and cluster status.</p>
            </NuxtLink>

            <NuxtLink
              to="/docs#database-manager"
              class="p-5 rounded-2xl border border-neutral-200 bg-white hover:border-[#144e35] transition-all group shadow-xs"
            >
              <div class="text-xs font-bold text-neutral-900 group-hover:text-[#144e35] flex items-center justify-between mb-1">
                <span>2. Database &amp; SQL</span>
                <ArrowRight class="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#144e35] transition-transform group-hover:translate-x-1" />
              </div>
              <p class="text-[11px] text-neutral-500">Schema designer, inline table data editing, and Monaco SQL Editor.</p>
            </NuxtLink>

            <NuxtLink
              to="/docs#storage-manager"
              class="p-5 rounded-2xl border border-neutral-200 bg-white hover:border-[#144e35] transition-all group shadow-xs"
            >
              <div class="text-xs font-bold text-neutral-900 group-hover:text-[#144e35] flex items-center justify-between mb-1">
                <span>3. Cloudflare R2</span>
                <ArrowRight class="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#144e35] transition-transform group-hover:translate-x-1" />
              </div>
              <p class="text-[11px] text-neutral-500">Direct presigned uploads, virtual folders, and live media preview.</p>
            </NuxtLink>

            <NuxtLink
              to="/docs#api-keys"
              class="p-5 rounded-2xl border border-neutral-200 bg-white hover:border-[#144e35] transition-all group shadow-xs"
            >
              <div class="text-xs font-bold text-neutral-900 group-hover:text-[#144e35] flex items-center justify-between mb-1">
                <span>4. API Management</span>
                <ArrowRight class="w-3.5 h-3.5 text-neutral-400 group-hover:text-[#144e35] transition-transform group-hover:translate-x-1" />
              </div>
              <p class="text-[11px] text-neutral-500">Cryptographic tokens, permissions scoping, and SHA-256 hashing.</p>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Bottom CTA Banner -->
      <section class="py-16 md:py-20 bg-neutral-900 text-white relative overflow-hidden">
        <!-- Ambient mint glow -->
        <div class="absolute -right-20 -bottom-20 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 bg-emerald-400"></div>

        <div class="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 class="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Streamline Your Cloud Operations?
          </h2>
          <p class="mt-4 text-sm sm:text-base text-neutral-300 max-w-xl mx-auto">
            Experience the simplicity of unified database and object storage management today.
          </p>

          <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
            <NuxtLink
              :to="auth.isAuthenticated.value ? '/dashboard' : '/login'"
              class="btn-forest inline-flex items-center gap-2.5 px-6 py-3 text-sm font-semibold shadow-md bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <span>{{ auth.isAuthenticated.value ? 'Open Console Dashboard' : 'Get Started Now' }}</span>
              <ArrowRight class="w-4 h-4" />
            </NuxtLink>
            <NuxtLink
              to="/docs"
              class="px-6 py-3 rounded-full text-sm font-semibold text-white bg-white/10 hover:bg-white/20 transition-all border border-white/20"
            >
              Read User Guide
            </NuxtLink>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-white border-t border-neutral-200 py-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <img
            src="/images/logo.webp"
            alt="KyoDB"
            class="h-7 w-auto object-contain"
          />
          <span class="text-xs text-neutral-400">
            • Distributed Database &amp; Storage Console
          </span>
        </div>

        <div class="flex items-center gap-6 text-xs text-neutral-500">
          <NuxtLink to="/docs" class="hover:text-neutral-900 transition-colors">Documentation</NuxtLink>
          <NuxtLink to="/login" class="hover:text-neutral-900 transition-colors">Console Login</NuxtLink>
          <span class="text-neutral-300">|</span>
          <span class="text-neutral-400 font-mono text-[11px]">MIT License • 2026 KyoDB</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {
  LayoutGrid,
  Database,
  HardDrive,
  Terminal,
  FolderKanban,
  UploadCloud,
  Activity,
  KeyRound,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  ArrowUpRight,
  CheckCircle,
  CheckCircle2
} from '@lucide/vue'

definePageMeta({
  layout: false
})

const auth = useAuth()

onMounted(async () => {
  if (!auth.isChecked.value) {
    await auth.fetchUser()
  }
})
</script>
