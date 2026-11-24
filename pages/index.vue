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

    <!-- Top Announcement Bar -->
    <div class="border-b border-white/5 bg-[#030712]/60 backdrop-blur-md text-xs py-2 px-4 text-center font-medium">
      <div class="max-w-7xl mx-auto flex items-center justify-center gap-2.5 flex-wrap">
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#00DC82]/10 text-[#00DC82] border border-[#00DC82]/25">
          <span class="w-1.5 h-1.5 rounded-full bg-[#00DC82] animate-pulse"></span>
          <span>{{ t.announcementBadge }}</span>
        </span>
        <span class="text-neutral-300">{{ t.announcementText }}</span>
        <NuxtLink to="/docs#api-keys" class="text-[#00DC82] hover:underline font-semibold inline-flex items-center gap-1">
          <span>{{ t.announcementLink }}</span>
          <ArrowRight class="w-3 h-3" />
        </NuxtLink>
      </div>
    </div>

    <!-- Navigation Header (Nuxt.com Glassmorphism Navbar) -->
    <header class="sticky top-0 z-40 bg-[#030712]/80 backdrop-blur-xl border-b border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <!-- Brand Logo (Precision Vector SVG) -->
        <NuxtLink to="/" class="flex items-center gap-2.5 group">
          <KyoLogo variant="dark" size="md" />
          <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-white/5 text-neutral-300 border border-white/10">
            Console
          </span>
        </NuxtLink>

        <!-- Center Nav Links -->
        <nav class="hidden md:flex items-center gap-7 text-xs font-semibold text-neutral-400">
          <a href="#features" class="hover:text-white transition-colors">{{ t.navFeatures }}</a>
          <a href="#code-playground" class="hover:text-white transition-colors">{{ t.navApi }}</a>
          <a href="#architecture" class="hover:text-white transition-colors">{{ t.navArchitecture }}</a>
          <NuxtLink to="/docs" class="hover:text-white transition-colors flex items-center gap-1.5">
            <BookOpen class="w-3.5 h-3.5 text-[#00DC82]" />
            <span>{{ t.navDocs }}</span>
          </NuxtLink>
        </nav>

        <!-- Right Controls (Language Switcher + Action CTA) -->
        <div class="flex items-center gap-3">
          <!-- Interactive Language Switcher (ID / EN) -->
          <button
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-semibold bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white border border-white/10 transition-all cursor-pointer"
            :title="isId ? 'Ganti ke Bahasa Inggris' : 'Switch to Indonesian'"
            @click="toggleLocale"
          >
            <Globe class="w-3.5 h-3.5 text-[#00DC82]" />
            <span class="font-bold">{{ isId ? '🇮🇩 ID' : '🇬🇧 EN' }}</span>
            <span class="text-[10px] text-neutral-400 font-sans">({{ isId ? 'EN' : 'ID' }})</span>
          </button>

          <NuxtLink
            to="/docs"
            class="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
          >
            <BookOpen class="w-3.5 h-3.5 text-neutral-400" />
            <span>{{ t.navDocs }}</span>
          </NuxtLink>

          <NuxtLink
            v-if="auth.isAuthenticated.value"
            to="/dashboard"
            class="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full text-xs font-bold bg-[#00DC82] text-neutral-950 hover:bg-[#00DC82]/90 shadow-[0_0_20px_rgba(0,220,130,0.35)] transition-all"
          >
            <LayoutGrid class="w-3.5 h-3.5" />
            <span>{{ t.btnDashboard }}</span>
          </NuxtLink>

          <NuxtLink
            v-else
            to="/login"
            class="inline-flex items-center gap-2 px-4.5 py-1.5 rounded-full text-xs font-bold bg-[#00DC82] text-neutral-950 hover:bg-[#00DC82]/90 shadow-[0_0_20px_rgba(0,220,130,0.35)] transition-all"
          >
            <span>{{ t.btnLaunch }}</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="flex-1">
      <!-- Hero Section -->
      <section
        ref="heroSectionRef"
        class="relative pt-8 pb-16 md:pt-14 md:pb-24 overflow-hidden text-center"
        @mousemove="handleMouseMove"
        @mouseleave="handleMouseLeave"
      >
        <!-- Interactive Particle Canvas (Responds to Cursor) -->
        <canvas
          ref="particleCanvasRef"
          class="absolute inset-0 pointer-events-none z-0"
        ></canvas>

        <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <!-- Hero Headline with Staggered Letter-by-Letter Reveal -->
          <h1 class="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-[1.12] max-w-4xl mx-auto min-h-[1.9em] sm:min-h-[2.1em] flex flex-col items-center justify-center">
            <span class="inline-block">
              {{ displayedTitle1 }}
              <span
                v-if="!typingFirstDone"
                class="inline-block w-[3px] h-[0.85em] align-middle bg-[#00DC82] ml-1 shadow-[0_0_10px_#00DC82] animate-pulse"
              ></span>
            </span>
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#00DC82] via-emerald-300 to-teal-200 inline-block">
              {{ displayedTitle2 }}
              <span
                v-if="typingFirstDone && !typingSecondDone"
                class="inline-block w-[3px] h-[0.85em] align-middle bg-[#00DC82] ml-1 shadow-[0_0_10px_#00DC82] animate-pulse"
              ></span>
            </span>
          </h1>

          <!-- Hero Subtitle -->
          <p class="mt-5 text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto leading-relaxed">
            {{ t.heroSubtitle }}
          </p>

          <!-- Interactive CLI Copy Pill -->
          <div class="mt-8 inline-flex items-center gap-3 p-1.5 pl-4 rounded-full bg-neutral-900/90 border border-white/10 backdrop-blur-md shadow-2xl max-w-md w-full sm:w-auto text-left font-mono text-xs">
            <span class="text-[#00DC82] font-bold select-none">$</span>
            <span class="text-neutral-300 truncate select-all">{{ cliCommand }}</span>
            <button
              class="ml-auto px-3 py-1 rounded-full text-[11px] font-sans font-semibold bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0 flex items-center gap-1.5"
              @click="handleCopyCli"
            >
              <Check v-if="copiedCli" class="w-3.5 h-3.5 text-[#00DC82]" />
              <Copy v-else class="w-3.5 h-3.5 text-neutral-400" />
              <span>{{ copiedCli ? t.copiedText : t.copyText }}</span>
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
              <span>{{ auth.isAuthenticated.value ? t.btnDashboard : t.btnGetStarted }}</span>
              <ArrowRight class="w-4 h-4" />
            </NuxtLink>

            <NuxtLink
              to="/docs"
              class="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-neutral-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              <BookOpen class="w-4 h-4 text-[#00DC82]" />
              <span>{{ t.btnReadDocs }}</span>
            </NuxtLink>
          </div>

          <!-- Benchmark / Specs Matrix Chips -->
          <div class="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
            <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xs">
              <div class="text-[10px] text-neutral-400 font-mono">{{ t.benchTidb }}</div>
              <div class="text-xl font-bold font-mono text-white mt-0.5">54<span class="text-xs text-[#00DC82] font-normal">ms</span></div>
              <div class="text-[11px] text-neutral-400 mt-1">{{ t.benchTidbSub }}</div>
            </div>

            <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xs">
              <div class="text-[10px] text-neutral-400 font-mono">{{ t.benchR2 }}</div>
              <div class="text-xl font-bold font-mono text-[#00DC82] mt-0.5">$0.00</div>
              <div class="text-[11px] text-neutral-400 mt-1">{{ t.benchR2Sub }}</div>
            </div>

            <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xs">
              <div class="text-[10px] text-neutral-400 font-mono">{{ t.benchSecurity }}</div>
              <div class="text-xl font-bold font-mono text-white mt-0.5">SHA-256</div>
              <div class="text-[11px] text-neutral-400 mt-1">{{ t.benchSecuritySub }}</div>
            </div>

            <div class="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xs">
              <div class="text-[10px] text-neutral-400 font-mono">{{ t.benchEncryption }}</div>
              <div class="text-xl font-bold font-mono text-[#00DC82] mt-0.5">TLS v1.2+</div>
              <div class="text-[11px] text-neutral-400 mt-1">{{ t.benchEncryptionSub }}</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Code Playground / Interactive Developer Engine -->
      <section id="code-playground" class="py-16 md:py-24 border-y border-white/5 bg-neutral-950/60 relative">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-3xl mx-auto mb-12">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-[#00DC82]/10 text-[#00DC82] border border-[#00DC82]/25">
              <span>{{ t.codeEyebrow }}</span>
            </span>
            <h2 class="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {{ t.codeTitle }}
            </h2>
            <p class="mt-3 text-sm text-neutral-400">
              {{ t.codeSubtitle }}
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
                  {{ isId ? tab.labelId : tab.labelEn }}
                </button>
              </div>
            </div>

            <!-- Code Content Area -->
            <div class="p-5 overflow-x-auto text-neutral-200 leading-relaxed text-[12px]">
              <div v-if="activeCodeTab === 'r2'">
                <div class="text-neutral-500">{{ isId ? '// 1. Minta URL upload presigned langsung dari API KyoDB' : '// 1. Request presigned upload URL directly from KyoDB API' }}</div>
                <div><span class="text-[#00DC82]">const</span> res = <span class="text-[#00DC82]">await</span> fetch(<span class="text-amber-300">'https://kyodb.app/api/storage/upload-url'</span>, {</div>
                <div class="pl-4">method: <span class="text-amber-300">'POST'</span>,</div>
                <div class="pl-4">headers: {</div>
                <div class="pl-8"><span class="text-amber-300">'Authorization'</span>: <span class="text-amber-300">'Bearer kyo_live_8f3a9e...'</span>,</div>
                <div class="pl-8"><span class="text-amber-300">'Content-Type'</span>: <span class="text-amber-300">'application/json'</span></div>
                <div class="pl-4">},</div>
                <div class="pl-4">body: JSON.stringify({ key: <span class="text-amber-300">'media/avatar.png'</span>, contentType: <span class="text-amber-300">'image/png'</span> })</div>
                <div>})</div>
                <div class="mt-2 text-neutral-500">{{ isId ? '// 2. Stream langsung dari browser ke edge Cloudflare R2 (Beban memori server 0)' : '// 2. Stream directly from browser to Cloudflare R2 edge (Zero server memory load)' }}</div>
                <div><span class="text-[#00DC82]">const</span> { uploadUrl } = <span class="text-[#00DC82]">await</span> res.json()</div>
                <div><span class="text-[#00DC82]">await</span> fetch(uploadUrl, { method: <span class="text-amber-300">'PUT'</span>, body: fileBlob })</div>
                <div class="mt-1 text-emerald-400 font-bold">{{ isId ? '// ✓ File terunggah ke Cloudflare R2 tanpa biaya egress!' : '// ✓ Uploaded to Cloudflare R2 with zero egress fees!' }}</div>
              </div>

              <div v-else-if="activeCodeTab === 'tidb'">
                <div class="text-neutral-500">{{ isId ? '// Koneksi ke cluster TiDB Cloud terdistribusi dengan enkripsi TLS' : '// Connect to distributed TiDB Cloud cluster with TLS encryption' }}</div>
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
                <div class="text-neutral-500">{{ isId ? '// Autentikasi request programatik menggunakan Kunci API Scoped' : '// Authenticate programmatic requests with Scoped API Key' }}</div>
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
              <span>{{ t.bentoEyebrow }}</span>
            </span>
            <h2 class="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {{ t.bentoTitle }}
            </h2>
            <p class="mt-3 text-sm text-neutral-400">
              {{ t.bentoSubtitle }}
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
                  <h3 class="text-lg font-bold text-white">{{ t.bento1Title }}</h3>
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-white/10 text-neutral-300">MySQL 8.0</span>
                </div>
                <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
                  {{ t.bento1Desc }}
                </p>
              </div>

              <div class="p-3.5 rounded-2xl bg-neutral-950/80 border border-white/5 font-mono text-[11px] text-neutral-300 space-y-1">
                <div class="text-[#00DC82]">{{ t.bento1Bullet1 }}</div>
                <div class="text-neutral-400">{{ t.bento1Bullet2 }}</div>
              </div>
            </div>

            <!-- Bento 2 (Large 5 cols): Cloudflare R2 Storage -->
            <div class="md:col-span-5 p-7 rounded-3xl border border-white/10 bg-white/[0.02] hover:border-[#00DC82]/40 transition-all flex flex-col justify-between group relative overflow-hidden">
              <div>
                <div class="w-11 h-11 rounded-2xl bg-[#00DC82]/10 border border-[#00DC82]/25 text-[#00DC82] flex items-center justify-center mb-5">
                  <HardDrive class="w-5 h-5" />
                </div>
                <div class="flex items-center gap-2 mb-1.5">
                  <h3 class="text-lg font-bold text-white">{{ t.bento2Title }}</h3>
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#00DC82]/15 text-[#00DC82]">{{ t.zeroEgressTag }}</span>
                </div>
                <p class="text-xs sm:text-sm text-neutral-400 leading-relaxed mb-6">
                  {{ t.bento2Desc }}
                </p>
              </div>

              <div class="p-3.5 rounded-2xl bg-neutral-950/80 border border-white/5 font-mono text-[11px] text-neutral-300 space-y-1">
                <div class="text-[#00DC82]">{{ t.bento2Bullet1 }}</div>
                <div class="text-neutral-400">{{ t.bento2Bullet2 }}</div>
              </div>
            </div>

            <!-- Bento 3 (4 cols): Monaco SQL Editor -->
            <div class="md:col-span-4 p-6 rounded-3xl border border-white/10 bg-white/[0.02] hover:border-[#00DC82]/40 transition-all flex flex-col justify-between">
              <div>
                <div class="w-10 h-10 rounded-2xl bg-[#00DC82]/10 border border-[#00DC82]/25 text-[#00DC82] flex items-center justify-center mb-4">
                  <Terminal class="w-5 h-5" />
                </div>
                <h3 class="text-base font-bold text-white mb-2">{{ t.bento3Title }}</h3>
                <p class="text-xs text-neutral-400 leading-relaxed">
                  {{ t.bento3Desc }}
                </p>
              </div>
              <div class="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-neutral-500">
                {{ t.bento3Footer }}
              </div>
            </div>

            <!-- Bento 4 (4 cols): Telemetry & Auditing -->
            <div class="md:col-span-4 p-6 rounded-3xl border border-white/10 bg-white/[0.02] hover:border-[#00DC82]/40 transition-all flex flex-col justify-between">
              <div>
                <div class="w-10 h-10 rounded-2xl bg-[#00DC82]/10 border border-[#00DC82]/25 text-[#00DC82] flex items-center justify-center mb-4">
                  <Activity class="w-5 h-5" />
                </div>
                <h3 class="text-base font-bold text-white mb-2">{{ t.bento4Title }}</h3>
                <p class="text-xs text-neutral-400 leading-relaxed">
                  {{ t.bento4Desc }}
                </p>
              </div>
              <div class="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-neutral-500">
                {{ t.bento4Footer }}
              </div>
            </div>

            <!-- Bento 5 (4 cols): Zero-Knowledge API Keys -->
            <div class="md:col-span-4 p-6 rounded-3xl border border-white/10 bg-white/[0.02] hover:border-[#00DC82]/40 transition-all flex flex-col justify-between">
              <div>
                <div class="w-10 h-10 rounded-2xl bg-[#00DC82]/10 border border-[#00DC82]/25 text-[#00DC82] flex items-center justify-center mb-4">
                  <KeyRound class="w-5 h-5" />
                </div>
                <h3 class="text-base font-bold text-white mb-2">{{ t.bento5Title }}</h3>
                <p class="text-xs text-neutral-400 leading-relaxed">
                  {{ t.bento5Desc }}
                </p>
              </div>
              <div class="mt-4 pt-3 border-t border-white/5 text-[11px] font-mono text-neutral-500">
                {{ t.bento5Footer }}
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
              <span>{{ t.archEyebrow }}</span>
            </span>
            <h2 class="mt-4 text-3xl font-extrabold text-white tracking-tight">
              {{ t.archTitle }}
            </h2>
          </div>

          <div class="max-w-4xl mx-auto p-6 rounded-3xl border border-white/10 bg-white/[0.02] backdrop-blur-md">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div class="p-4 rounded-2xl bg-neutral-900/60 border border-white/5">
                <div class="w-8 h-8 rounded-full bg-[#00DC82]/20 text-[#00DC82] font-mono font-bold text-xs flex items-center justify-center mx-auto mb-3">1</div>
                <h4 class="text-sm font-bold text-white mb-1">{{ t.arch1Title }}</h4>
                <p class="text-xs text-neutral-400">{{ t.arch1Desc }}</p>
              </div>

              <div class="p-4 rounded-2xl bg-neutral-900/60 border border-[#00DC82]/30 relative">
                <div class="w-8 h-8 rounded-full bg-[#00DC82] text-neutral-950 font-mono font-bold text-xs flex items-center justify-center mx-auto mb-3">2</div>
                <h4 class="text-sm font-bold text-white mb-1">{{ t.arch2Title }}</h4>
                <p class="text-xs text-neutral-400">{{ t.arch2Desc }}</p>
              </div>

              <div class="p-4 rounded-2xl bg-neutral-900/60 border border-white/5">
                <div class="w-8 h-8 rounded-full bg-[#00DC82]/20 text-[#00DC82] font-mono font-bold text-xs flex items-center justify-center mx-auto mb-3">3</div>
                <h4 class="text-sm font-bold text-white mb-1">{{ t.arch3Title }}</h4>
                <p class="text-xs text-neutral-400">{{ t.arch3Desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Documentation Directory Quick Jump -->
      <section class="py-16 md:py-24 border-t border-white/5">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center max-w-2xl mx-auto mb-12">
            <h2 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {{ t.docsJumpTitle }}
            </h2>
            <p class="mt-2 text-xs sm:text-sm text-neutral-400">
              {{ t.docsJumpSubtitle }}
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <NuxtLink
              to="/docs#getting-started"
              class="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-[#00DC82]/60 hover:bg-white/[0.04] transition-all group"
            >
              <div class="text-xs font-bold text-white group-hover:text-[#00DC82] flex items-center justify-between mb-2">
                <span>{{ t.docCard1Title }}</span>
                <ArrowRight class="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#00DC82] group-hover:translate-x-1 transition-all" />
              </div>
              <p class="text-[11px] text-neutral-400">{{ t.docCard1Desc }}</p>
            </NuxtLink>

            <NuxtLink
              to="/docs#database-manager"
              class="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-[#00DC82]/60 hover:bg-white/[0.04] transition-all group"
            >
              <div class="text-xs font-bold text-white group-hover:text-[#00DC82] flex items-center justify-between mb-2">
                <span>{{ t.docCard2Title }}</span>
                <ArrowRight class="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#00DC82] group-hover:translate-x-1 transition-all" />
              </div>
              <p class="text-[11px] text-neutral-400">{{ t.docCard2Desc }}</p>
            </NuxtLink>

            <NuxtLink
              to="/docs#storage-manager"
              class="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-[#00DC82]/60 hover:bg-white/[0.04] transition-all group"
            >
              <div class="text-xs font-bold text-white group-hover:text-[#00DC82] flex items-center justify-between mb-2">
                <span>{{ t.docCard3Title }}</span>
                <ArrowRight class="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#00DC82] group-hover:translate-x-1 transition-all" />
              </div>
              <p class="text-[11px] text-neutral-400">{{ t.docCard3Desc }}</p>
            </NuxtLink>

            <NuxtLink
              to="/docs#api-keys"
              class="p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-[#00DC82]/60 hover:bg-white/[0.04] transition-all group"
            >
              <div class="text-xs font-bold text-white group-hover:text-[#00DC82] flex items-center justify-between mb-2">
                <span>{{ t.docCard4Title }}</span>
                <ArrowRight class="w-3.5 h-3.5 text-neutral-500 group-hover:text-[#00DC82] group-hover:translate-x-1 transition-all" />
              </div>
              <p class="text-[11px] text-neutral-400">{{ t.docCard4Desc }}</p>
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
            {{ t.bottomCtaTitle }}
          </h2>
          <p class="mt-4 text-sm sm:text-base text-neutral-400 max-w-xl mx-auto">
            {{ t.bottomCtaSubtitle }}
          </p>

          <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
            <NuxtLink
              :to="auth.isAuthenticated.value ? '/dashboard' : '/login'"
              class="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-bold bg-[#00DC82] text-neutral-950 hover:bg-[#00DC82]/90 shadow-[0_0_24px_rgba(0,220,130,0.35)] transition-all hover:scale-102"
            >
              <span>{{ auth.isAuthenticated.value ? t.btnDashboard : t.btnBottomLaunch }}</span>
              <ArrowRight class="w-4 h-4" />
            </NuxtLink>

            <NuxtLink
              to="/docs"
              class="px-6 py-3.5 rounded-full text-sm font-semibold text-neutral-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
            >
              {{ t.btnBrowseDocs }}
            </NuxtLink>
          </div>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="bg-[#020412] border-t border-white/5 py-8 text-xs text-neutral-500">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2.5">
          <KyoLogo variant="dark" size="sm" />
          <span>• {{ t.footerTagline }}</span>
        </div>

        <div class="flex items-center gap-6">
          <NuxtLink to="/docs" class="hover:text-white transition-colors">{{ t.navDocs }}</NuxtLink>
          <NuxtLink to="/login" class="hover:text-white transition-colors">{{ t.footerLogin }}</NuxtLink>
          <span class="text-neutral-700">|</span>
          <span class="text-neutral-400 font-mono text-[11px]">MIT License • 2026 KyoDB</span>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import KyoLogo from '~/components/shared/KyoLogo.vue'
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
  Check,
  Globe
} from '@lucide/vue'

definePageMeta({
  layout: false
})

const auth = useAuth()
const { currentLocale, isId, toggleLocale } = useLocale()

// Hero Section & Interactive Particle Canvas
const heroSectionRef = ref<HTMLElement | null>(null)
const particleCanvasRef = ref<HTMLCanvasElement | null>(null)

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  baseAlpha: number
  color: string
}

const mouse = {
  x: -1000,
  y: -1000,
  active: false
}

let animFrameId: number | null = null
let particles: Particle[] = []

const handleMouseMove = (e: MouseEvent) => {
  if (!heroSectionRef.value) return
  const rect = heroSectionRef.value.getBoundingClientRect()
  mouse.x = e.clientX - rect.left
  mouse.y = e.clientY - rect.top
  mouse.active = true
}

const handleMouseLeave = () => {
  mouse.active = false
  mouse.x = -1000
  mouse.y = -1000
}

function initParticleCanvas() {
  const canvas = particleCanvasRef.value
  const container = heroSectionRef.value
  if (!canvas || !container) return

  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  let width = container.clientWidth
  let height = container.clientHeight

  function resizeCanvas() {
    if (!canvas || !container) return
    width = container.clientWidth
    height = container.clientHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx?.scale(dpr, dpr)
  }

  resizeCanvas()
  window.addEventListener('resize', resizeCanvas)

  // Spawn reactive floating particles
  const count = Math.min(Math.floor((width * height) / 10000), 75)
  const palette = ['#00DC82', '#10B981', '#34D399', '#38BDF8']
  particles = []

  for (let i = 0; i < count; i++) {
    const baseAlpha = 0.2 + Math.random() * 0.45
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: 1.2 + Math.random() * 2,
      alpha: baseAlpha,
      baseAlpha,
      color: palette[Math.floor(Math.random() * palette.length)]
    })
  }

  function render() {
    if (!ctx) return
    ctx.clearRect(0, 0, width, height)

    // Constellation lines between nearby particles
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 90) {
          const lineAlpha = (1 - dist / 90) * 0.15
          ctx.strokeStyle = `rgba(0, 220, 130, ${lineAlpha})`
          ctx.lineWidth = 0.6
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.stroke()
        }
      }
    }

    // Dynamic interaction on cursor proximity
    for (const p of particles) {
      if (mouse.active) {
        const mdx = p.x - mouse.x
        const mdy = p.y - mouse.y
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy)

        if (mdist < 140) {
          // Glow line to cursor
          const cursorLineAlpha = (1 - mdist / 140) * 0.45
          ctx.strokeStyle = `rgba(0, 220, 130, ${cursorLineAlpha})`
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(mouse.x, mouse.y)
          ctx.stroke()

          // Magnetic gentle acceleration away from cursor
          const force = (1 - mdist / 140) * 2.2
          p.x += (mdx / (mdist || 1)) * force
          p.y += (mdy / (mdist || 1)) * force
          p.alpha = Math.min(1, p.baseAlpha + 0.45)
        } else {
          p.alpha = p.baseAlpha
        }
      } else {
        p.alpha = p.baseAlpha
      }

      // Move particle
      p.x += p.vx
      p.y += p.vy

      // Bounce at boundary walls
      if (p.x < 0 || p.x > width) p.vx *= -1
      if (p.y < 0 || p.y > height) p.vy *= -1

      // Draw particle dot with neon glow
      ctx.save()
      ctx.globalAlpha = p.alpha
      ctx.fillStyle = p.color
      ctx.shadowColor = p.color
      ctx.shadowBlur = p.radius * 3.5
      ctx.beginPath()
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    animFrameId = requestAnimationFrame(render)
  }

  render()
}

// Letter-by-Letter Typewriter Animation for Main Headline
const displayedTitle1 = ref('')
const displayedTitle2 = ref('')
const typingFirstDone = ref(false)
const typingSecondDone = ref(false)
let typewriterTimer: any = null

function runTypewriter() {
  if (typewriterTimer) clearTimeout(typewriterTimer)
  displayedTitle1.value = ''
  displayedTitle2.value = ''
  typingFirstDone.value = false
  typingSecondDone.value = false

  const text1 = t.value.heroTitle1 || ''
  const text2 = t.value.heroTitle2 || ''
  let idx1 = 0
  let idx2 = 0

  function typeChar1() {
    if (idx1 < text1.length) {
      displayedTitle1.value += text1[idx1]
      idx1++
      typewriterTimer = setTimeout(typeChar1, 26)
    } else {
      typingFirstDone.value = true
      typewriterTimer = setTimeout(typeChar2, 60)
    }
  }

  function typeChar2() {
    if (idx2 < text2.length) {
      displayedTitle2.value += text2[idx2]
      idx2++
      typewriterTimer = setTimeout(typeChar2, 26)
    } else {
      typingSecondDone.value = true
    }
  }

  typeChar1()
}

const cliCommand = ref('git clone https://github.com/hrmnfrmnsyh1210-sys/KyoDB.git && npm run dev')
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
  { id: 'r2', labelId: 'Upload Langsung R2', labelEn: 'Direct R2 Upload' },
  { id: 'tidb', labelId: 'Koneksi TiDB', labelEn: 'TiDB Client' },
  { id: 'auth', labelId: 'cURL / REST API', labelEn: 'cURL / REST' }
]

// Bilingual Content Dictionary (Indonesian default, English supported)
const dictionary = {
  id: {
    announcementBadge: 'Rilis v1.4',
    announcementText: 'Pemantauan Telemetri & Manajemen Kunci API Kriptografis Kini Aktif!',
    announcementLink: 'Baca dokumentasi',
    navFeatures: 'Fitur',
    navApi: 'API Pengembang',
    navArchitecture: 'Arsitektur',
    navDocs: 'Dokumentasi',
    btnDashboard: 'Dashboard',
    btnLaunch: 'Masuk Konsol',
    heroTag: 'Mesin Cloud Hibrida',
    heroTitle1: 'Konsol Database &',
    heroTitle2: 'Cloud Storage yang Intuitif',
    heroSubtitle: 'Satukan manajemen database relasional terdistribusi TiDB Cloud dan penyimpanan objek tanpa biaya egress Cloudflare R2 dalam satu konsol modern untuk pengembang.',
    copyText: 'Salin',
    copiedText: 'Tersalin!',
    btnGetStarted: 'Mulai dengan KyoDB',
    btnReadDocs: 'Baca Dokumentasi',
    benchTidb: 'CLUSTER TIDB',
    benchTidbSub: 'MySQL 8.0 Terdistribusi',
    benchR2: 'CLOUDFLARE R2',
    benchR2Sub: 'Bebas Biaya Egress ($0)',
    benchSecurity: 'MODEL KEAMANAN',
    benchSecuritySub: 'Penyimpanan Zero-Knowledge',
    benchEncryption: 'ENKRIPSI DATA',
    benchEncryptionSub: 'SSL End-to-End Penuh',
    codeEyebrow: 'Arsitektur Ramah Pengembang',
    codeTitle: 'Integrasi Sederhana, Bertenaga, dan Type-Safe',
    codeSubtitle: 'Hubungkan aplikasi Anda ke TiDB Cloud dan Cloudflare R2 menggunakan protokol standar dan kunci API dengan hak akses terisolasi.',
    bentoEyebrow: 'Arsitektur Bento',
    bentoTitle: 'Dirancang untuk Beban Kerja Web Modern',
    bentoSubtitle: 'Hilangkan vendor lock-in dan kerumitan perkakas pengembang yang terpisah-pisah dengan platform terpadu kami.',
    bento1Title: 'Studio Skema TiDB Terdistribusi',
    bento1Desc: 'Rancang, ubah, dan jelajahi database relasional secara visual. Lihat jumlah baris, ukuran data, dan edit data tabel langsung tanpa repot menulis query manual.',
    bento1Bullet1: '✓ Auto-scaling horizontal tanpa kerumitan sharding manual',
    bento1Bullet2: '✓ Proteksi skema sistem untuk metadata kyodb_system',
    bento2Title: 'Cloudflare R2 Direct S3',
    zeroEgressTag: 'Biaya Egress $0',
    bento2Desc: 'Upload presigned mengalirkan gigabyte data langsung dari klien ke edge Cloudflare, bebas batasan memori server dan tanpa biaya bandwidth egress ($0/GB).',
    bento2Bullet1: '✓ Breadcrumb folder virtual & preview media instan',
    bento2Bullet2: '✓ Prefix terisolasi per proyek: projects/{slug}/',
    bento3Title: 'Monaco SQL Editor',
    bento3Desc: 'Editor sekelas VS Code dengan syntax highlighting, autocompletion cerdas, template query siap pakai, dan mode keamanan Read-Only.',
    bento3Footer: 'LSP & Guardrail pencegah query destruktif',
    bento4Title: 'Telemetri & Log Audit Real-Time',
    bento4Desc: 'Pemantauan memori heap proses Node.js, status uptime sistem, serta log audit keamanan yang tidak dapat dimanipulasi (immutable).',
    bento4Footer: 'Audit trail terpaginasi & badge latensi eksekusi',
    bento5Title: 'Kunci API Kriptografis',
    bento5Desc: 'Token CSPRNG acak (kyo_live_...) disimpan secara aman dengan hash deterministik SHA-256 dan pembatasan izin granular.',
    bento5Footer: 'Pembatasan hak akses granular & pencabutan instan',
    archEyebrow: 'Topologi Dual-Engine',
    archTitle: 'Bagaimana KyoDB Menjembatani Database dan Penyimpanan',
    arch1Title: 'Klien Pengembang',
    arch1Desc: 'Konsol Web Monaco atau Kunci API Programatik',
    arch2Title: 'Engine KyoDB Nitro',
    arch2Desc: 'Autentikasi Argon2id, Penandatangan Presigned S3, Validator Zod',
    arch3Title: 'Edge Cloud Terpadu',
    arch3Desc: 'TiDB Cloud SQL Terdistribusi + Cloudflare R2',
    docsJumpTitle: 'Jelajahi Dokumentasi',
    docsJumpSubtitle: 'Panduan operasional mendalam, cetak biru skema, dan referensi API lengkap.',
    docCard1Title: '1. Panduan Awal',
    docCard1Desc: 'Wizard bootstrap admin, konfigurasi kredensial, dan env lokal.',
    docCard2Title: '2. Database & Tabel',
    docCard2Desc: 'Studio skema, editor data tabel, dan konsol Monaco SQL.',
    docCard3Title: '3. Cloudflare R2',
    docCard3Desc: 'Streaming presigned langsung, navigasi folder, preview media.',
    docCard4Title: '4. Kunci API & Keamanan',
    docCard4Desc: 'Token CSPRNG, hash SHA-256 zero-knowledge, dan REST SDK.',
    bottomCtaTitle: 'Siap Mengambil Kendali Penuh Data Cloud Anda?',
    bottomCtaSubtitle: 'Rasakan kemudahan mengelola database relasional TiDB dan penyimpanan zero-egress Cloudflare R2 dalam satu tempat.',
    btnBottomLaunch: 'Buka Konsol KyoDB',
    btnBrowseDocs: 'Jelajahi Dokumentasi',
    footerTagline: 'Manajer Database Terdistribusi & Penyimpanan Objek Cloud',
    footerLogin: 'Masuk Konsol'
  },
  en: {
    announcementBadge: 'v1.4 Release',
    announcementText: 'Telemetry Monitoring & Cryptographic API Keys are now live.',
    announcementLink: 'Read docs',
    navFeatures: 'Features',
    navApi: 'Developer API',
    navArchitecture: 'Architecture',
    navDocs: 'Documentation',
    btnDashboard: 'Dashboard',
    btnLaunch: 'Launch Console',
    heroTag: 'Hybrid Cloud Engine',
    heroTitle1: 'The Intuitive Database &',
    heroTitle2: 'Cloud Storage Console',
    heroSubtitle: 'Unify distributed relational SQL on TiDB Cloud alongside ultra-fast, zero-egress object storage on Cloudflare R2 in one modern developer console.',
    copyText: 'Copy',
    copiedText: 'Copied!',
    btnGetStarted: 'Get Started with KyoDB',
    btnReadDocs: 'Read Documentation',
    benchTidb: 'TIDB CLUSTER',
    benchTidbSub: 'Distributed MySQL 8.0',
    benchR2: 'CLOUDFLARE R2',
    benchR2Sub: 'Zero Egress Fees ($0.00)',
    benchSecurity: 'SECURITY MODEL',
    benchSecuritySub: 'Zero-Knowledge Storage',
    benchEncryption: 'DATA ENCRYPTION',
    benchEncryptionSub: 'Full End-to-End SSL',
    codeEyebrow: 'Developer-First Architecture',
    codeTitle: 'Simple, Powerful, Type-Safe Integration',
    codeSubtitle: 'Integrate your applications with TiDB Cloud and Cloudflare R2 using standard protocols and scoped API keys.',
    bentoEyebrow: 'Bento Architecture',
    bentoTitle: 'Engineered for Modern Web Workloads',
    bentoSubtitle: 'Eliminate vendor lock-in and fragmented developer tooling with our unified bento stack.',
    bento1Title: 'Distributed TiDB Schema Studio',
    bento1Desc: 'Design, alter, and explore logical databases with an interactive visual schema designer. View row counts, data lengths, and edit rows inline with zero SQL boilerplate.',
    bento1Bullet1: '✓ Horizontal auto-scaling without manual sharding',
    bento1Bullet2: '✓ System schema protection for kyodb_system metadata',
    bento2Title: 'Cloudflare R2 Direct S3',
    zeroEgressTag: '0$ Egress',
    bento2Desc: 'Direct presigned uploads stream gigabytes directly from client to edge, completely avoiding server memory overhead and serverless payload limits.',
    bento2Bullet1: '✓ Virtual folder breadcrumbs & instant file previews',
    bento2Bullet2: '✓ Project scoped prefixes: projects/{slug}/',
    bento3Title: 'Monaco SQL Editor',
    bento3Desc: 'VS Code-grade editor with syntax highlighting, autocomplete, preset templates, and read-only safety mode.',
    bento3Footer: 'LSP & Destructive query guardrails',
    bento4Title: 'Live Telemetry & Logs',
    bento4Desc: 'Real-time Node.js process heap memory monitoring, uptime tracking, and immutable audit logs.',
    bento4Footer: 'Paginated audit trail & execution latency pills',
    bento5Title: 'Cryptographic API Keys',
    bento5Desc: 'CSPRNG generated tokens (kyo_live_...) stored strictly as deterministic SHA-256 hashes.',
    bento5Footer: 'Granular permission scoping & instant revocation',
    archEyebrow: 'Dual-Engine Topology',
    archTitle: 'How KyoDB Bridges Databases and Storage',
    arch1Title: 'Developer Client',
    arch1Desc: 'Monaco Web Console or Programmatic API Key',
    arch2Title: 'KyoDB Nitro Engine',
    arch2Desc: 'Argon2id Auth, Presigned S3 Signer, Zod Validators',
    arch3Title: 'Unified Cloud Edges',
    arch3Desc: 'Distributed TiDB Cloud SQL + Cloudflare R2',
    docsJumpTitle: 'Explore the Documentation',
    docsJumpSubtitle: 'In-depth operational manuals, schema blueprints, and API references.',
    docCard1Title: '1. Getting Started',
    docCard1Desc: 'Admin bootstrap wizard, credentials setup, and local environment.',
    docCard2Title: '2. Database & Tables',
    docCard2Desc: 'Schema builder, table data editor, and Monaco SQL query console.',
    docCard3Title: '3. Cloudflare R2',
    docCard3Desc: 'Direct presigned streaming, folder navigation, and media previews.',
    docCard4Title: '4. API Keys & Security',
    docCard4Desc: 'CSPRNG tokens, SHA-256 zero-knowledge storage, and REST SDKs.',
    bottomCtaTitle: 'Ready to Take Control of Your Cloud Data?',
    bottomCtaSubtitle: 'Experience the simplicity of unified TiDB relational databases and Cloudflare R2 zero-egress storage.',
    btnBottomLaunch: 'Launch KyoDB Console',
    btnBrowseDocs: 'Browse Documentation',
    footerTagline: 'Distributed Database & Object Storage Manager',
    footerLogin: 'Console Login'
  }
}

const t = computed(() => dictionary[currentLocale.value] || dictionary.id)

watch(currentLocale, () => {
  runTypewriter()
})

onMounted(async () => {
  runTypewriter()
  initParticleCanvas()
  if (!auth.isChecked.value) {
    await auth.fetchUser()
  }
})

onBeforeUnmount(() => {
  if (typewriterTimer) clearTimeout(typewriterTimer)
  if (animFrameId) cancelAnimationFrame(animFrameId)
})
</script>
