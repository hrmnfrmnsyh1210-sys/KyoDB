<template>
  <div class="min-h-screen bg-[#030712] text-neutral-100 selection:bg-[#00DC82]/30 selection:text-[#00DC82] flex flex-col font-sans relative overflow-x-hidden">
    <!-- Nuxt Grid & Radial Ambient Glow Background -->
    <div
      class="pointer-events-none fixed inset-0 -z-10"
      style="
        background-image: radial-gradient(rgba(0, 220, 130, 0.08) 1px, transparent 1px);
        background-size: 32px 32px;
      "
    ></div>

    <div
      class="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[450px] -z-10 opacity-70 blur-3xl"
      style="
        background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 220, 130, 0.28), rgba(16, 185, 129, 0.1) 40%, transparent 70%);
      "
    ></div>

    <!-- Top Announcement Bar (Nuxt Docs Style) -->
    <div class="border-b border-white/5 bg-[#030712]/60 backdrop-blur-md text-xs py-2 px-4 text-center font-medium">
      <div class="max-w-7xl mx-auto flex items-center justify-center gap-2.5 flex-wrap">
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00DC82]/10 text-[#00DC82] border border-[#00DC82]/25">
          <span class="w-1.5 h-1.5 rounded-full bg-[#00DC82] animate-pulse"></span>
          <span>v1.4 Release</span>
        </span>
        <span class="text-neutral-300">Telemetry Monitoring &amp; Cryptographic API Keys are now live.</span>
        <NuxtLink to="/docs#api-keys" class="text-[#00DC82] hover:underline font-semibold inline-flex items-center gap-1">
          <span>Read docs</span>
          <ArrowRight class="w-3 h-3" />
        </NuxtLink>
      </div>
    </div>

    <!-- Navigation Header (Nuxt.com Glassmorphism Navbar) -->
    <header class="sticky top-0 z-40 bg-[#030712]/80 backdrop-blur-xl border-b border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <!-- Brand Logo -->
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <img
            src="/images/logo.webp"
            alt="KyoDB Logo"
            class="h-8.5 w-auto object-contain transition-transform group-hover:scale-102 brightness-110"
          />
          <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10">
            Console
          </span>
        </NuxtLink>

        <!-- Center Nav Links -->
        <nav class="hidden md:flex items-center gap-7 text-xs font-semibold text-neutral-400">
          <a href="#features" class="hover:text-white transition-colors">Features</a>
          <a href="#code-playground" class="hover:text-white transition-colors">Developer API</a>
          <a href="#architecture" class="hover:text-white transition-colors">Architecture</a>
          <NuxtLink to="/docs" class="hover:text-white transition-colors flex items-center gap-1.5">
            <BookOpen class="w-3.5 h-3.5 text-[#00DC82]" />
            <span>Documentation</span>
          </NuxtLink>
        </nav>

        <!-- Right Controls -->
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/docs"
            class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <BookOpen class="w-3.5 h-3.5 text-neutral-400" />
            <span>Docs</span>
          </NuxtLink>

          <NuxtLink
            v-if="auth.isAuthenticated.value"
            to="/dashboard"
            class="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full text-xs font-bold bg-[#00DC82] text-neutral-950 hover:bg-[#00DC82]/90 shadow-[0_0_20px_rgba(0,220,130,0.35)] transition-all"
          >
            <LayoutGrid class="w-3.5 h-3.5" />
            <span>Dashboard</span>
          </NuxtLink>

          <NuxtLink
            v-else
            to="/login"
            class="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full text-xs font-bold bg-[#00DC82] text-neutral-950 hover:bg-[#00DC82]/90 shadow-[0_0_20px_rgba(0,220,130,0.35)] transition-all"
          >
            <span>Launch Console</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1">
      <!-- Hero Section (Nuxt.com Signature Developer Hero) -->
      <section class="relative pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden text-center">
        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <!-- Nuxt Tag Pill -->
          <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-neutral-300 mb-8 backdrop-blur-md hover:border-[#00DC82]/40 transition-colors">
            <span class="w-2 h-2 rounded-full bg-[#00DC82] animate-pulse"></span>
            <span class="font-semibold text-white">Hybrid Cloud Engine</span>
            <span class="text-neutral-500">•</span>
            <span class="text-[#00DC82]">TiDB Cloud + Cloudflare R2</span>
          </div>

          <!-- Hero Headline -->
          <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.08] max-w-4xl mx-auto">
            The Intuitive Database &amp;<br />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#00DC82] via-emerald-300 to-teal-200">
              Cloud Storage Console
            </span>
          </h1>

          <!-- Hero Subtitle -->
          <p class="mt-6 text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            Unify distributed relational SQL on <strong>TiDB Cloud</strong> alongside ultra-fast, zero-egress object storage on <strong>Cloudflare R2</strong>. Built for modern developers who value speed, security, and developer ergonomics.
          </p>

          <!-- Interactive CLI Copy Pill (Signature Nuxt terminal bar) -->
          <div class="mt-8 inline-flex items-center gap-3 p-1.5 pl-4 rounded-full bg-neutral-900/90 border border-white/10 backdrop-blur-md shadow-2xl max-w-md w-full sm:w-auto text-left font-mono text-xs">
            <span class="text-[#00DC82] font-bold select-none">$</span>
            <span class="text-neutral-300 truncate select-all">{{ cliCommand }}</span>
            <button
              class="ml-auto px-3 py-1 rounded-full text-[11px] font-sans font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 flex items-center gap-1.5"
              @click="handleCopyCli"
            >
              <Check v-if="copiedCli" class="w-3.5 h-3.5 text-[#00DC82]" />
              <Copy v-else class="w-3.5 h-3.5 text-neutral-400" />
              <span>{{ copiedCli ? 'Copied!' : 'Copy' }}</span>
            </button>
          </div>

          <!-- Primary CTAs -->
          <div class="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <NuxtLink
              :to="auth.isAuthenticated.value ? '/dashboard' : '/login'"
              class="inline-flex items-center gap-2.5 px-6 py-3 rounded-full text-sm font-bold bg-[#00DC82] text-neutral-950 hover:bg-[#00DC82]/90 shadow-[0_0_24px_rgba(0,220,130,0.35)] transition-all hover:scale-102"
            >
              <LayoutGrid v-if="auth.isAuthenticated.value" class="w-4 h-4" />
              <Terminal v-else class="w-4 h-4" />
              <span>{{ auth.isAuthenticated.value ? 'Open Console Dashboard' : 'Get Started with KyoDB' }}</span>
              <ArrowRight class="w-4 h-4" />
            </NuxtLink>

            <NuxtLink
              to="/docs"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-neutral-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <BookOpen class="w-4 h-4 text-[#00DC82]" />
              <span>Read Documentation</span>
            </NuxtLink>
          </div>

          <!-- Benchmark / Specs Matrix Chips -->
          <div class="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xs">
              <div class="text-[10px] text-neutral-400 font-mono">TIDB CLUSTER</div>
              <div class="text-xl font-bold font-mono text-white mt-0.5">54<span class="text-xs text-[#00DC82] font-normal">ms</span></div>
              <div class="text-[11px] text-neutral-400 mt-1">Distributed MySQL 8.0</div>
            </div>

            <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xs">
              <div class="text-[10px] text-neutral-400 font-mono">CLOUDFLARE R2</div>
              <div class="text-xl font-bold font-mono text-[#00DC82] mt-0.5">$0.00</div>
              <div class="text-[11px] text-neutral-400 mt-1">Zero Egress Fees</div>
            </div>

            <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xs">
              <div class="text-[10px] text-neutral-400 font-mono">SECURITY MODEL</div>
              <div class="text-xl font-bold font-mono text-white mt-0.5">SHA-256</div>
              <div class="text-[11px] text-neutral-400 mt-1">Zero-Knowledge Storage</div>
            </div>

            <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xs">
              <div class="text-[10px] text-neutral-400 font-mono">ENCRYPTION</div>
              <div class="text-xl font-bold font-mono text-[#00DC82] mt-0.5">TLS v1.2+</div>
              <div class="text-[11px] text-neutral-400 mt-1">Full End-to-End SSL</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Code Playground / Interactive Developer Engine (Nuxt Docs Signature) -->
      <section id="code-playground" class="py-16 md:py-24 border-y border-white/5 bg-neutral-950/60 relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-12">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#00DC82]/10 text-[#00DC82] border border-[#00DC82]/25">
              <span>Developer-First Architecture</span>
            </span>
            <h2 class="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Simple, Powerful, Type-Safe Integration
            </h2>
            <p class="mt-3 text-sm text-neutral-400">
              Integrate your applications with TiDB Cloud and Cloudflare R2 using standard protocols and scoped API keys.
            </p>
          </div>

          <!-- Code Window Container -->
          <div class="max-w-4xl mx-auto rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl overflow-hidden font-mono text-xs">
            <!-- Window Titlebar with macOS Dots & Tabs -->
            <div class="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/[0.02]">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span class="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span class="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span class="ml-2 text-xs font-sans text-neutral-400 font-medium hidden sm:inline">KyoDB Developer Console</span>
              </div>

              <!-- Language / Protocol Tabs -->
              <div class="flex items-center gap-1">
                <button
                  v-for="tab in codeTabs"
                  :key="tab.id"
                  class="px-3 py-1 rounded-md text-[11px] transition-colors"
                  :class="activeCodeTab === tab.id ? 'bg-white/10 text-[#00DC82] font-bold' : 'text-neutral-400 hover:text-white'"
                  @click="activeCodeTab = tab.id"
                >
                  {{ tab.label }}
                </button>
              </div>
            </div>

            <!-- Code Content Area -->
            <div class="p-5 overflow-x-auto text-neutral-200 leading-relaxed text-[12px]">
              <div v-if="activeCodeTab === 'r2'">
                <div class="text-neutral-500">// 1. Request presigned upload URL directly from KyoDB API</div>
                <div><span class="text-[#00DC82]">const</span> res = <span class="text-[#00DC82]">await</span> fetch(<span class="text-amber-300">'https://kyodb.app/api/storage/upload-url'</span>, {</div>
                <div class="pl-4">method: <span class="text-amber-300">'POST'</span>,</div>
                <div class="pl-4">headers: {</div>
                <div class="pl-8"><span class="text-amber-300">'Authorization'</span>: <span class="text-amber-300">'Bearer kyo_live_8f3a9e...'</span>,</div>
                <div class="pl-8"><span class="text-amber-300">'Content-Type'</span>: <span class="text-amber-300">'application/json'</span></div>
                <div class="pl-4">},</div>
                <div class="pl-4">body: JSON.stringify({ key: <span class="text-amber-300">'media/avatar.png'</span>, contentType: <span class="text-amber-300">'image/png'</span> })</div>
                <div>})</div>
                <div class="mt-2 text-neutral-500">// 2. Stream directly from browser to Cloudflare R2 edge (Zero server memory load)</div>
                <div><span class="text-[#00DC82]">const</span> { uploadUrl } = <span class="text-[#00DC82]">await</span> res.json()</div>
                <div><span class="text-[#00DC82]">await</span> fetch(uploadUrl, { method: <span class="text-amber-300">'PUT'</span>, body: fileBlob })</div>
                <div class="mt-1 text-emerald-400 font-bold">// ✓ Uploaded to Cloudflare R2 with zero egress fees!</div>
              </div>

              <div v-else-if="activeCodeTab === 'tidb'">
                <div class="text-neutral-500">// Connect to distributed TiDB Cloud cluster with TLS encryption</div>
                <div><span class="text-[#00DC82]">import</span> mysql <span class="text-[#00DC82]">from</span> <span class="text-amber-300">'mysql2/promise'</span></div>
                <div class="mt-2"><span class="text-[#00DC82]">const</span> pool = mysql.createPool({</div>
                <div class="pl-4">host: <span class="text-amber-300">process.env.TIDB_HOST</span>,</div>
                <div class="pl-4">port: <span class="text-amber-300">4000</span>,</div>
                <div class="pl-4">user: <span class="text-amber-300">process.env.TIDB_USER</span>,</div>
                <div class="pl-4">password: <span class="text-amber-300">process.env.TIDB_PASSWORD</span>,</div>
                <div class="pl-4">ssl: { minVersion: <span class="text-amber-300">'TLSv1.2'</span>, rejectUnauthorized: <span class="text-[#00DC82]">true</span> }</div>
                <div>})</div>
                <div class="mt-2"><span class="text-[#00DC82]">const</span> [rows] = <span class="text-[#00DC82]">await</span> pool.query(<span class="text-amber-300">'SELECT * FROM users WHERE status = ?'</span>, [<span class="text-amber-300">'active'</span>])</div>
              </div>

              <div v-else-if="activeCodeTab === 'auth'">
                <div class="text-neutral-500">// Authenticate programmatic requests with Scoped API Key</div>
                <div><span class="text-[#00DC82]">curl</span> -X POST https://kyodb.app/api/databases/query/execute \</div>
                <div class="pl-4">-H <span class="text-amber-300">"Authorization: Bearer kyo_live_9b4e117a8c..."</span> \</div>
                <div class="pl-4">-H <span class="text-amber-300">"Content-Type: application/json"</span> \</div>
                <div class="pl-4">-d <span class="text-amber-300">'{ "databaseName": "production_db", "sql": "SELECT id, name FROM projects;" }'</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Nuxt Bento Grid Features Section -->
      <section id="features" class="py-16 md:py-24">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-16">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#00DC82]/10 text-[#00DC82] border border-[#00DC82]/25">
              <span>Bento Architecture</span>
            </span>
            <h2 class="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Engineered for Modern Web Workloads
            </h2>
            <p class="mt-3 text-sm text-neutral-400">
              Eliminate vendor lock-in and fragmented developer tooling with our unified bento stack.
            </p>
          </div>

          <!-- 6-Card Nuxt Bento Grid -->
          <div class="grid grid-cols-1 md:grid-cols-12 gap-5">
            <!-- Bento 1 (Large 7 cols): TiDB Distributed SQL Studio -->
            <div class="md:col-span-7 p-7 rounded-3xl border border-white/10 bg-white/[0.02] hover:border-[#00DC82]/40 transition-all flex flex-col justify-between group relative overflow-hidden">
              <div>
                <div class="w-11 h-11 rounded-2xl bg-[#00DC82]/10 border border-[#00DC82]/25 text-[#00DC82] flex items-center justify-center mb-5">
                  <Database class="w-5 h-5" />
                </div>
                <div class="flex items-center gap-2 mb-1.5">
                  <h3 class="text-lg font-bold text-white">Distributed TiDB Schema Studio</h3>
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">MySQL 8.0</span>
                </div>
                <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
                  Design, alter, and explore logical databases with an interactive visual schema designer. View row counts, data lengths, and edit rows inline with zero SQL boilerplate.
                </p>
              </div>

              <div class="p-3.5 rounded-2xl bg-neutral-950/80 border border-white/5 font-mono text-[11px] text-neutral-300 space-y-1">
                <div class="text-[#00DC82]">✓ Horizontal auto-scaling without manual sharding</div>
                <div class="text-neutral-400">✓ System schema protection for `kyodb_system` metadata</div>
              </div>
            </div>

            <!-- Bento 2 (Large 5 cols): Cloudflare R2 Storage -->
            <div class="md:col-span-5 p-7 rounded-3xl border border-white/10 bg-white/[0.02] hover:border-[#00DC82]/40 transition-all flex flex-col justify-between group relative overflow-hidden">
              <div>
                <div class="w-11 h-11 rounded-2xl bg-[#00DC82]/10 border border-[#00DC82]/25 text-[#00DC82] flex items-center justify-center mb-5">
                  <HardDrive class="w-5 h-5" />
                </div>
                <div class="flex items-center gap-2 mb-1.5">
                  <h3 class="text-lg font-bold text-white">Cloudflare R2 Direct S3</h3>
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00DC82]/15 text-[#00DC82]">0$ Egress</span>
                </div>
                <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
                  Direct presigned uploads stream gigabytes directly from client to edge, completely avoiding server memory overhead and serverless payload limits.
                </p>
              </div>

              <div class="p-3.5 rounded-2xl bg-neutral-950/80 border border-white/5 font-mono text-[11px] text-neutral-300 space-y-1">
                <div class="text-[#00DC82]">✓ Virtual folder breadcrumbs &amp; instant file previews</div>
                <div class="text-neutral-400">✓ Project scoped prefixes: `projects/{slug}/`</div>
              </div>
            </div>

            <!-- Bento 3 (4 cols): Monaco SQL Editor -->
            <div class="md:col-span-4 p-6 rounded-3xl border border-white/10 bg-white/[0.02] hover:border-[#00DC82]/40 transition-all flex flex-col justify-between">
              <div>
                <div class="w-10 h-10 rounded-2xl bg-[#00DC82]/10 border border-[#00DC82]/25 text-[#00DC82] flex items-center justify-center mb-4">
                  <Terminal class="w-5 h-5" />
                </div>
                <h3 class="text-base font-bold text-white mb-2">Monaco SQL Editor</h3>
                <p class="text-xs text-neutral-400 leading-relaxed">
                  VS Code-grade editor with syntax highlighting, autocomplete, preset templates, and read-only safety mode.
                </p>
              </div>
              <div class="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-neutral-500">
                LSP &amp; Destructive query guardrails
              </div>
            </div>

            <!-- Bento 4 (4 cols): Telemetry & Auditing -->
            <div class="md:col-span-4 p-6 rounded-3xl border border-white/10 bg-white/[0.02] hover:border-[#00DC82]/40 transition-all flex flex-col justify-between">
              <div>
                <div class="w-10 h-10 rounded-2xl bg-[#00DC82]/10 border border-[#00DC82]/25 text-[#00DC82] flex items-center justify-center mb-4">
                  <Activity class="w-5 h-5" />
                </div>
                <h3 class="text-base font-bold text-white mb-2">Live Telemetry &amp; Logs</h3>
                <p class="text-xs text-neutral-400 leading-relaxed">
                  Real-time Node.js process heap memory monitoring, uptime tracking, and immutable audit logs.
                </p>
              </div>
              <div class="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-neutral-500">
                Paginated audit trail &amp; latency pills
              </div>
            </div>

            <!-- Bento 5 (4 cols): Zero-Knowledge API Keys -->
            <div class="md:col-span-4 p-6 rounded-3xl border border-white/10 bg-white/[0.02] hover:border-[#00DC82]/40 transition-all flex flex-col justify-between">
              <div>
                <div class="w-10 h-10 rounded-2xl bg-[#00DC82]/10 border border-[#00DC82]/25 text-[#00DC82] flex items-center justify-center mb-4">
                  <KeyRound class="w-5 h-5" />
                </div>
                <h3 class="text-base font-bold text-white mb-2">Cryptographic API Keys</h3>
                <p class="text-xs text-neutral-400 leading-relaxed">
                  CSPRNG generated tokens (<code class="text-neutral-300">kyo_live_...</code>) stored strictly as deterministic SHA-256 hashes.
                </p>
              </div>
              <div class="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-neutral-500">
                Granular permission scoping &amp; revoke
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Architecture Section -->
      <section id="architecture" class="py-16 md:py-24 border-t border-white/5 bg-neutral-950/40">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="max-w-3xl mx-auto text-center mb-12">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#00DC82]/10 text-[#00DC82] border border-[#00DC82]/25">
              <span>Dual-Engine Topology</span>
            </span>
            <h2 class="mt-4 text-3xl font-extrabold text-white tracking-tight">
              How KyoDB Bridges Databases and Storage
            </h2>
          </div>

          <div class="max-w-4xl mx-auto p-6 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div class="p-4 rounded-2xl bg-neutral-900/60 border border-white/5">
                <div class="w-8 h-8 rounded-full bg-[#00DC82]/20 text-[#00DC82] font-mono font-bold text-xs flex items-center justify-center mx-auto mb-3">1</div>
                <h4 class="text-sm font-bold text-white mb-1">Developer Client</h4>
                <p class="text-xs text-neutral-400">Monaco Web Console or Programmatic API Key</p>
              </div>

              <div class="p-4 rounded-2xl bg-neutral-900/60 border border-[#00DC82]/30 relative">
                <div class="w-8 h-8 rounded-full bg-[#00DC82] text-neutral-950 font-mono font-bold text-xs flex items-center justify-center mx-auto mb-3">2</div>
                <h4 class="text-sm font-bold text-white mb-1">KyoDB Nitro Engine</h4>
                <p class="text-xs text-neutral-400">Argon2id Auth, Presigned S3 Signer, Zod Validators</p>
              </div>

              <div class="p-4 rounded-2xl bg-neutral-900/60 border border-white/5">
                <div class="w-8 h-8 rounded-full bg-[#00DC82]/20 text-[#00DC82] font-mono font-bold text-xs flex items-center justify-center mx-auto mb-3">3</div>
                <h4 class="text-sm font-bold text-white mb-1">Cloud Edges</h4>
                <p class="text-xs text-neutral-400">TiDB Cloud Distributed SQL + Cloudflare R2</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Documentation Directory Quick Jump (Nuxt Docs Style) -->
      <section class="py-16 md:py-24 border-t border-white/5">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-12">
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Explore the Documentation
            </h2>
            <p class="mt-2 text-xs sm:text-sm text-neutral-400">
              In-depth operational manuals, schema blueprints, and API references.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <NuxtLink
              to="/docs#getting-started"
              class="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-[#00DC82]/60 hover:bg-white/[0.04] transition-all group"
            >
              <div class="text-xs font-bold text-white group-hover:text-[#00DC82] flex items-center justify-between mb-2">
                <span>1. Getting Started</span>
                <ArrowRight class="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#00DC82] group-hover:translate-x-1 transition-all" />
              </div>
              <p class="text-[11px] text-neutral-400">Admin bootstrap wizard, credentials setup, and local environment.</p>
            </NuxtLink>

            <NuxtLink
              to="/docs#database-manager"
              class="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-[#00DC82]/60 hover:bg-white/[0.04] transition-all group"
            >
              <div class="text-xs font-bold text-white group-hover:text-[#00DC82] flex items-center justify-between mb-2">
                <span>2. Database &amp; Tables</span>
                <ArrowRight class="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#00DC82] group-hover:translate-x-1 transition-all" />
              </div>
              <p class="text-[11px] text-neutral-400">Schema builder, table data editor, and Monaco SQL query console.</p>
            </NuxtLink>

            <NuxtLink
              to="/docs#storage-manager"
              class="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-[#00DC82]/60 hover:bg-white/[0.04] transition-all group"
            >
              <div class="text-xs font-bold text-white group-hover:text-[#00DC82] flex items-center justify-between mb-2">
                <span>3. Cloudflare R2</span>
                <ArrowRight class="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#00DC82] group-hover:translate-x-1 transition-all" />
              </div>
              <p class="text-[11px] text-neutral-400">Direct presigned streaming, folder navigation, and media previews.</p>
            </NuxtLink>

            <NuxtLink
              to="/docs#api-keys"
              class="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-[#00DC82]/60 hover:bg-white/[0.04] transition-all group"
            >
              <div class="text-xs font-bold text-white group-hover:text-[#00DC82] flex items-center justify-between mb-2">
                <span>4. API Keys &amp; Security</span>
                <ArrowRight class="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#00DC82] group-hover:translate-x-1 transition-all" />
              </div>
              <p class="text-[11px] text-neutral-400">CSPRNG tokens, SHA-256 zero-knowledge storage, and REST SDKs.</p>
            </NuxtLink>
          </div>
        </div>
      </section>

      <!-- Bottom Nuxt CTA Banner -->
      <section class="py-20 relative overflow-hidden border-t border-white/5">
        <div
          class="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] opacity-40 blur-3xl -z-10"
          style="background: radial-gradient(circle, rgba(0, 220, 130, 0.3) 0%, transparent 70%);"
        ></div>

        <div class="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 class="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Ready to Take Control of Your Cloud Data?
          </h2>
          <p class="mt-4 text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
            Experience the simplicity of unified TiDB relational databases and Cloudflare R2 zero-egress storage.
          </p>

          <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
            <NuxtLink
              :to="auth.isAuthenticated.value ? '/dashboard' : '/login'"
              class="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold bg-[#00DC82] text-neutral-950 hover:bg-[#00DC82]/90 shadow-[0_0_24px_rgba(0,220,130,0.35)] transition-all hover:scale-102"
            >
              <span>{{ auth.isAuthenticated.value ? 'Open Console Dashboard' : 'Launch KyoDB Console' }}</span>
              <ArrowRight class="w-4 h-4" />
            </NuxtLink>

            <NuxtLink
              to="/docs"
              class="px-6 py-3.5 rounded-full text-sm font-semibold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              Browse Documentation
            </NuxtLink>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer (Nuxt.com Style) -->
    <footer class="bg-[#020412] border-t border-white/5 py-8 text-xs text-neutral-500">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2.5">
          <img
            src="/images/logo.webp"
            alt="KyoDB"
            class="h-6 w-auto object-contain brightness-110"
          />
          <span>• Distributed Database &amp; Object Storage Manager</span>
        </div>

        <div class="flex items-center gap-6">
          <NuxtLink to="/docs" class="hover:text-white transition-colors">Documentation</NuxtLink>
          <NuxtLink to="/login" class="hover:text-white transition-colors">Login</NuxtLink>
          <span class="text-neutral-700">|</span>
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
  Activity,
  KeyRound,
  BookOpen,
  ArrowRight,
  Copy,
  Check
} from '@lucide/vue'

definePageMeta({
  layout: false
})

const auth = useAuth()

const cliCommand = ref('git clone https://github.com/kyodb/kyodb.git && npm run dev')
const copiedCli = ref(false)

const handleCopyCli = async () => {
  try {
    await navigator.clipboard.writeText(cliCommand.value)
    copiedCli.value = true
    setTimeout(() => {
      copiedCli.value = false
    }, 2000)
  } catch {
    // fallback
  }
}

const activeCodeTab = ref<'r2' | 'tidb' | 'auth'>('r2')
const codeTabs = [
  { id: 'r2', label: 'Direct R2 Upload' },
  { id: 'tidb', label: 'TiDB Client' },
  { id: 'auth', label: 'cURL / REST' }
]

onMounted(async () => {
  if (!auth.isChecked.value) {
    await auth.fetchUser()
  }
})
</script>
