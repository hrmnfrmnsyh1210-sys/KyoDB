<template>
  <div class="min-h-screen bg-[#030712] text-neutral-100 selection:bg-[#00DC82]/30 selection:text-[#00DC82] flex flex-col font-sans relative overflow-x-hidden">
    <!-- Ambient Radial Glow Background -->
    <div
      class="pointer-events-none fixed inset-0 -z-10"
      style="
        background-image: radial-gradient(rgba(0, 220, 130, 0.06) 1px, transparent 1px);
        background-size: 32px 32px;
      "
    ></div>

    <div
      class="pointer-events-none fixed top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[350px] -z-10 opacity-50 blur-3xl"
      style="
        background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 220, 130, 0.22), transparent 70%);
      "
    ></div>

    <!-- Top Docs Header (Nuxt Glassmorphic Sticky Header) -->
    <header class="sticky top-0 z-40 bg-[#030712]/80 backdrop-blur-xl border-b border-white/5">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <!-- Logo & Docs Label -->
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="flex items-center gap-2.5 group">
            <KyoLogo variant="dark" size="sm" />
            <span class="text-xs font-bold text-white tracking-tight">Docs</span>
            <span class="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#00DC82]/10 text-[#00DC82] border border-[#00DC82]/25">
              v1.4
            </span>
          </NuxtLink>
        </div>

        <!-- Global Search Bar -->
        <div class="relative flex-1 max-w-md hidden sm:block">
          <Search class="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="isId ? 'Cari dokumentasi (misal: R2, SQL, API keys)...' : 'Search documentation (e.g. R2, SQL, API keys)...'"
            class="w-full rounded-full border border-white/10 bg-white/5 pl-10 pr-12 py-1.5 text-xs text-white placeholder-neutral-400 focus:bg-neutral-900 focus:border-[#00DC82] focus:outline-none transition-all"
          />
          <span class="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-neutral-400 border border-white/10 px-1.5 py-0.5 rounded">
            ⌘K
          </span>
        </div>

        <!-- Header Actions: Language Switcher, Back to Landing, Dashboard -->
        <div class="flex items-center gap-3">
          <!-- Interactive Language Switcher -->
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
            to="/"
            class="text-xs font-semibold text-neutral-300 hover:text-white transition-colors hidden md:inline-flex items-center gap-1"
          >
            <span>← {{ isId ? 'Halaman Utama' : 'Landing Page' }}</span>
          </NuxtLink>

          <NuxtLink
            :to="auth.isAuthenticated.value ? '/dashboard' : '/login'"
            class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-[#00DC82] text-neutral-950 hover:bg-[#00DC82]/90 shadow-[0_0_20px_rgba(0,220,130,0.35)] transition-all"
          >
            <LayoutGrid v-if="auth.isAuthenticated.value" class="w-3.5 h-3.5" />
            <Terminal v-else class="w-3.5 h-3.5" />
            <span>{{ auth.isAuthenticated.value ? (isId ? 'Buka Konsol' : 'Open Console') : (isId ? 'Masuk' : 'Sign In') }}</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Docs Container (Nuxt Layout: Left Sticky Sidebar + Content Area) -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col md:flex-row gap-8">
      <!-- Left Sidebar: Sticky Navigation TOC -->
      <aside class="w-full md:w-64 shrink-0">
        <div class="sticky top-24 space-y-6">
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 pb-2 font-mono">
              {{ isId ? 'DAFTAR ISI DOKUMENTASI' : 'DOCUMENTATION INDEX' }}
            </div>
            <nav class="space-y-1 text-xs font-medium">
              <a
                v-for="section in filteredSections"
                :key="section.id"
                :href="`#${section.id}`"
                class="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all"
                :class="activeSection === section.id ? 'bg-[#00DC82]/10 text-[#00DC82] font-bold border border-[#00DC82]/25' : 'text-neutral-400 hover:text-white hover:bg-white/5'"
                @click="activeSection = section.id"
              >
                <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/5 text-neutral-400">
                  {{ section.badge }}
                </span>
                <span class="truncate">{{ isId ? section.titleId : section.titleEn }}</span>
              </a>
            </nav>
          </div>

          <!-- Quick Resilience Tip Card -->
          <div class="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs space-y-2 backdrop-blur-sm">
            <div class="font-bold text-white flex items-center gap-1.5">
              <Sparkles class="w-3.5 h-3.5 text-[#00DC82]" />
              <span>{{ isId ? 'Ketahanan Offline' : 'Offline Resilience' }}</span>
            </div>
            <p class="text-[11px] text-neutral-400 leading-relaxed">
              {{ isId
                ? 'KyoDB dilengkapi store in-memory fallback otomatis jika kredensial TiDB atau Cloudflare R2 belum diisi, memudahkan pengetesan UI lokal.'
                : 'KyoDB includes automatic in-memory fallback stores when TiDB or Cloudflare R2 credentials are not configured, enabling smooth local UI testing.'
              }}
            </p>
          </div>
        </div>
      </aside>

      <!-- Right Column: Rich Interactive Documentation Content -->
      <main class="flex-1 min-w-0 space-y-16 pb-24">
        <!-- ========================================== -->
        <!-- Section 1: Panduan Memulai / Getting Started -->
        <!-- ========================================== -->
        <section id="getting-started" class="space-y-5 scroll-mt-24">
          <div class="border-b border-white/10 pb-4">
            <div class="text-xs font-mono font-bold text-[#00DC82] uppercase tracking-wider">
              {{ isId ? 'BAB 01' : 'CHAPTER 01' }}
            </div>
            <h1 class="text-2xl sm:text-4xl font-black text-white tracking-tight mt-1.5">
              {{ isId ? 'Panduan Memulai KyoDB' : 'Getting Started with KyoDB' }}
            </h1>
          </div>

          <p class="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            <strong>KyoDB</strong> {{ isId
              ? 'adalah konsol pengembang terpadu yang menyatukan manajemen database relasional terdistribusi TiDB Cloud dan penyimpanan objek bebas biaya bandwidth (zero-egress) Cloudflare R2. Alih-alih berpindah-pindah antara konsol AWS S3 dan MySQL client, KyoDB memberikan satu antarmuka yang cepat, modern, dan aman.'
              : 'is a unified developer platform combining distributed relational SQL management on TiDB Cloud with zero-egress object storage on Cloudflare R2. Instead of juggling fragmented vendor consoles, KyoDB delivers a single, fast, modern, and secure dashboard.'
            }}
          </p>

          <!-- Callout: Wizard Bootstrap -->
          <div class="p-4.5 rounded-2xl bg-[#00DC82]/10 border border-[#00DC82]/25 text-xs text-neutral-200 space-y-1.5 backdrop-blur-sm">
            <div class="font-bold text-[#00DC82] flex items-center gap-2">
              <ShieldCheck class="w-4.5 h-4.5 shrink-0" />
              <span>{{ isId ? 'Peluncuran Pertama Bebas Ribet (Bootstrap Wizard)' : 'Zero-Setup First Launch (Bootstrap Wizard)' }}</span>
            </div>
            <p class="text-neutral-300 leading-relaxed">
              {{ isId
                ? 'Saat pertama kali membuka KyoDB di browser, jika belum ada akun administrator di database, halaman login akan otomatis masuk ke Mode Bootstrap Administrator. Cukup masukkan username dan password admin yang Anda inginkan untuk langsung menginisialisasi akun root.'
                : 'When launching KyoDB for the first time, if no administrator account exists in the database, the login screen automatically activates Master Administrator Bootstrap Mode. Simply enter your desired admin username and password to initialize the root account.'
              }}
            </p>
          </div>

          <!-- Clone & Run Snippet Box -->
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs text-neutral-300 font-semibold">
              <span>{{ isId ? '1. Clone Repositori & Jalankan Aplikasi' : '1. Clone Repository & Run Application' }}</span>
              <button
                class="text-[11px] font-mono text-[#00DC82] hover:underline flex items-center gap-1"
                @click="copySnippet('git-clone', 'git clone https://github.com/hrmnfrmnsyh1210-sys/KyoDB.git && cd KyoDB && npm install && npm run dev')"
              >
                <Check v-if="copied['git-clone']" class="w-3.5 h-3.5" />
                <Copy v-else class="w-3.5 h-3.5" />
                <span>{{ copied['git-clone'] ? (isId ? 'Tersalin!' : 'Copied!') : (isId ? 'Salin Perintah' : 'Copy Command') }}</span>
              </button>
            </div>
            <div class="rounded-xl border border-white/10 bg-neutral-950 p-4 font-mono text-xs text-neutral-200 overflow-x-auto shadow-xl">
              <span class="text-[#00DC82]">$</span> git clone https://github.com/hrmnfrmnsyh1210-sys/KyoDB.git<br />
              <span class="text-[#00DC82]">$</span> cd KyoDB<br />
              <span class="text-[#00DC82]">$</span> npm install<br />
              <span class="text-[#00DC82]">$</span> npm run dev
            </div>
          </div>

          <!-- Environment Configuration Box -->
          <div class="space-y-2 pt-2">
            <div class="flex items-center justify-between text-xs text-neutral-300 font-semibold">
              <span>{{ isId ? '2. Konfigurasi Variabel Lingkungan (.env)' : '2. Environment Configuration (.env)' }}</span>
              <button
                class="text-[11px] font-mono text-[#00DC82] hover:underline flex items-center gap-1"
                @click="copySnippet('env-sample', envSampleCode)"
              >
                <Check v-if="copied['env-sample']" class="w-3.5 h-3.5" />
                <Copy v-else class="w-3.5 h-3.5" />
                <span>{{ copied['env-sample'] ? (isId ? 'Tersalin!' : 'Copied!') : (isId ? 'Salin .env' : 'Copy .env') }}</span>
              </button>
            </div>
            <div class="rounded-xl border border-white/10 bg-neutral-950 p-4 font-mono text-xs text-neutral-300 overflow-x-auto shadow-xl">
              <pre><code>{{ envSampleCode }}</code></pre>
            </div>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- Section 2: Manajemen Proyek / Project Management -->
        <!-- ========================================== -->
        <section id="project-management" class="space-y-5 scroll-mt-24">
          <div class="border-b border-white/10 pb-4">
            <div class="text-xs font-mono font-bold text-[#00DC82] uppercase tracking-wider">
              {{ isId ? 'BAB 02' : 'CHAPTER 02' }}
            </div>
            <h2 class="text-xl sm:text-3xl font-bold text-white tracking-tight mt-1.5">
              {{ isId ? 'Manajemen Proyek & Isolasi Namespace' : 'Project Management & Scoping' }}
            </h2>
          </div>

          <p class="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {{ isId
              ? 'Proyek di KyoDB berfungsi sebagai namespace administratif terisolasi. Setiap proyek dapat ditautkan ke database logis TiDB tertentu dan secara otomatis mendapatkan cakupan folder penyimpanan virtual terisolasi di Cloudflare R2.'
              : 'Projects in KyoDB act as isolated administrative namespaces. Each project can link to a dedicated logical TiDB database and automatically reserves a virtual storage scope at Cloudflare R2.'
            }}
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
            <div class="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
                ACTIVE
              </div>
              <div class="font-bold text-xs text-white mb-1">{{ isId ? 'Aktif' : 'Active' }}</div>
              <p class="text-[11px] text-neutral-400 leading-relaxed">
                {{ isId ? 'Akses penuh operasional untuk manipulasi database, unggah storage R2, dan eksekusi kunci API.' : 'Full operational access for database queries, storage uploads, and API keys.' }}
              </p>
            </div>

            <div class="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
                ARCHIVED
              </div>
              <div class="font-bold text-xs text-white mb-1">{{ isId ? 'Diarsipkan' : 'Archived' }}</div>
              <p class="text-[11px] text-neutral-400 leading-relaxed">
                {{ isId ? 'Mode pasif (hanya baca). Data proyek tetap aman namun tidak menerima modifikasi baru.' : 'Passive read-only state. Data remains intact with write operations locked.' }}
              </p>
            </div>

            <div class="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-2">
                SUSPENDED
              </div>
              <div class="font-bold text-xs text-white mb-1">{{ isId ? 'Ditangguhkan' : 'Suspended' }}</div>
              <p class="text-[11px] text-neutral-400 leading-relaxed">
                {{ isId ? 'Akses diblokir sementara. Sangat berguna saat audit keamanan atau investigasi anomali.' : 'Access temporarily blocked. Useful during security reviews or investigation.' }}
              </p>
            </div>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- Section 3: Studio Database / Database Manager -->
        <!-- ========================================== -->
        <section id="database-manager" class="space-y-5 scroll-mt-24">
          <div class="border-b border-white/10 pb-4">
            <div class="text-xs font-mono font-bold text-[#00DC82] uppercase tracking-wider">
              {{ isId ? 'BAB 03' : 'CHAPTER 03' }}
            </div>
            <h2 class="text-xl sm:text-3xl font-bold text-white tracking-tight mt-1.5">
              {{ isId ? 'Studio Database & Perancang Skema Visual' : 'Database & Schema Studio' }}
            </h2>
          </div>

          <p class="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {{ isId
              ? 'Menu Database menyediakan antarmuka visual penuh untuk merancang tabel dan mengelola data langsung di kluster TiDB Anda tanpa memerlukan aplikasi eksternal seperti DBeaver atau MySQL Workbench:'
              : 'The Database Manager provides a complete visual schema designer and table data editor directly over your TiDB cluster without requiring external GUI apps:'
            }}
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div class="text-xs font-bold text-white mb-1.5 flex items-center gap-2">
                <Database class="w-4 h-4 text-[#00DC82]" />
                <span>{{ isId ? 'Database Explorer' : 'Database Explorer' }}</span>
              </div>
              <p class="text-[11px] text-neutral-400 leading-relaxed">
                {{ isId ? 'Pantau daftar database logis, jumlah tabel, total baris, dan estimasi ukuran memori secara akurat.' : 'Inspect logical databases, table counts, row quantities, and storage sizes.' }}
              </p>
            </div>

            <div class="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div class="text-xs font-bold text-white mb-1.5 flex items-center gap-2">
                <LayoutGrid class="w-4 h-4 text-[#00DC82]" />
                <span>{{ isId ? 'Visual Table Designer' : 'Visual Table Designer' }}</span>
              </div>
              <p class="text-[11px] text-neutral-400 leading-relaxed">
                {{ isId ? 'Buat tabel baru dengan kolom kustom, tipe data (INT, VARCHAR, DATETIME, JSON), Primary Key, dan Auto Increment.' : 'Design tables with custom column types (INT, VARCHAR, DATETIME, JSON), Primary Keys, and Auto-increment.' }}
              </p>
            </div>

            <div class="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div class="text-xs font-bold text-white mb-1.5 flex items-center gap-2">
                <Terminal class="w-4 h-4 text-[#00DC82]" />
                <span>{{ isId ? 'Inline Row Editor' : 'Inline Row Editor' }}</span>
              </div>
              <p class="text-[11px] text-neutral-400 leading-relaxed">
                {{ isId ? 'Jelajahi baris tabel dengan paginasi, pencarian cepat, serta modal Buat, Edit, dan Hapus instan.' : 'Browse rows with paginated grid view, search filters, and instant Create/Edit/Delete modals.' }}
              </p>
            </div>
          </div>

          <!-- Alert Proteksi Database Sistem -->
          <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200">
            <strong>{{ isId ? 'Proteksi Skema Sistem:' : 'System Database Protection:' }}</strong>
            {{ isId
              ? ' Database internal kritis (kyodb_system, mysql, information_schema, performance_schema) dilindungi oleh guardrail otomatis agar tidak dapat dihapus secara tidak sengaja.'
              : ' Internal critical databases (kyodb_system, mysql, information_schema, performance_schema) are locked against accidental deletion or drop operations.'
            }}
          </div>
        </section>

        <!-- ========================================== -->
        <!-- Section 4: Monaco SQL Editor -->
        <!-- ========================================== -->
        <section id="sql-editor" class="space-y-5 scroll-mt-24">
          <div class="border-b border-white/10 pb-4">
            <div class="text-xs font-mono font-bold text-[#00DC82] uppercase tracking-wider">
              {{ isId ? 'BAB 04' : 'CHAPTER 04' }}
            </div>
            <h2 class="text-xl sm:text-3xl font-bold text-white tracking-tight mt-1.5">
              {{ isId ? 'Monaco SQL Editor & Guardrail Keamanan' : 'Monaco SQL Editor & Guardrails' }}
            </h2>
          </div>

          <p class="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {{ isId
              ? 'Editor SQL bawaan KyoDB ditenagai oleh mesin yang sama dengan Microsoft VS Code (Monaco Editor), memberikan fitur syntax highlighting, autocompletion cerdas, dan template query siap pakai.'
              : 'The built-in SQL Editor is powered by Microsoft Monaco Editor (the engine behind VS Code), featuring syntax highlighting, intelligent autocompletion, and preset query templates.'
            }}
          </p>

          <div class="space-y-2.5 text-xs text-neutral-300">
            <div class="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
              <span class="font-bold text-white">1. {{ isId ? 'Mode Hanya-Baca (Read-Only Guardrail):' : 'Read-Only Mode Guardrail:' }}</span>
              <span class="text-neutral-400 ml-1.5">
                {{ isId ? 'Ketika diaktifkan, query manipulasi data atau DDL (INSERT, UPDATE, DELETE, DROP, ALTER) langsung diblokir di layer klien dan validator Nitro.' : 'When active, destructive DDL or write queries (INSERT, UPDATE, DELETE, DROP, ALTER) are blocked at client and server validator layers.' }}
              </span>
            </div>
            <div class="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
              <span class="font-bold text-white">2. {{ isId ? 'Konfirmasi Query Destruktif:' : 'Destructive Confirmation Dialog:' }}</span>
              <span class="text-neutral-400 ml-1.5">
                {{ isId ? 'Setiap query DROP, TRUNCATE, atau DELETE tanpa filter WHERE mewajibkan konfirmasi eksplisit sebelum eksekusi dikirim ke TiDB.' : 'Any DROP, TRUNCATE, or unconstrained DELETE requires explicit confirmation before execution.' }}
              </span>
            </div>
            <div class="p-3.5 rounded-xl border border-white/10 bg-white/[0.02]">
              <span class="font-bold text-white">3. {{ isId ? 'Pencatatan Riwayat & Telemetri:' : 'Execution Telemetry Logging:' }}</span>
              <span class="text-neutral-400 ml-1.5">
                {{ isId ? 'Durasi eksekusi dalam milidetik dan jumlah baris terdampak otomatis tersimpan rapi di riwayat query.' : 'Execution latencies in milliseconds and affected row counts are tracked in query history.' }}
              </span>
            </div>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- Section 5: Cloudflare R2 Storage -->
        <!-- ========================================== -->
        <section id="storage-manager" class="space-y-5 scroll-mt-24">
          <div class="border-b border-white/10 pb-4">
            <div class="text-xs font-mono font-bold text-[#00DC82] uppercase tracking-wider">
              {{ isId ? 'BAB 05' : 'CHAPTER 05' }}
            </div>
            <h2 class="text-xl sm:text-3xl font-bold text-white tracking-tight mt-1.5">
              {{ isId ? 'Penyimpanan Objek Cloudflare R2 ($0 Biaya Egress)' : 'Cloudflare R2 Object Storage' }}
            </h2>
          </div>

          <p class="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {{ isId
              ? 'Cloudflare R2 meniadakan biaya transfer data keluar (egress fees) yang mahal pada AWS S3. KyoDB menggunakan arsitektur Direct Presigned Upload yang efisien:'
              : 'Cloudflare R2 completely eliminates AWS S3 bandwidth egress fees ($0/GB). KyoDB utilizes an ultra-efficient Direct-to-R2 Presigned Upload engine:'
            }}
          </p>

          <!-- 3-Step Interactive Process Cards -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div class="w-6 h-6 rounded-full bg-[#00DC82]/10 text-[#00DC82] border border-[#00DC82]/30 flex items-center justify-center font-bold font-mono text-[11px] mb-2.5">
                1
              </div>
              <div class="font-bold text-xs text-white mb-1">
                {{ isId ? 'Minta Presigned URL' : 'Request Presigned URL' }}
              </div>
              <p class="text-[11px] text-neutral-400 leading-relaxed">
                {{ isId ? 'Aplikasi meminta URL penandatanganan PUT berumur pendek langsung dari API KyoDB.' : 'Client requests a short-lived presigned PUT URL directly from KyoDB API.' }}
              </p>
            </div>

            <div class="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div class="w-6 h-6 rounded-full bg-[#00DC82]/10 text-[#00DC82] border border-[#00DC82]/30 flex items-center justify-center font-bold font-mono text-[11px] mb-2.5">
                2
              </div>
              <div class="font-bold text-xs text-white mb-1">
                {{ isId ? 'Stream Langsung ke Edge' : 'Direct Stream to Edge' }}
              </div>
              <p class="text-[11px] text-neutral-400 leading-relaxed">
                {{ isId ? 'Browser mengalirkan file langsung ke jaringan edge Cloudflare R2 tanpa membebani memori server.' : 'Browser streams raw binary straight to Cloudflare R2 without consuming server memory.' }}
              </p>
            </div>

            <div class="p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div class="w-6 h-6 rounded-full bg-[#00DC82]/10 text-[#00DC82] border border-[#00DC82]/30 flex items-center justify-center font-bold font-mono text-[11px] mb-2.5">
                3
              </div>
              <div class="font-bold text-xs text-white mb-1">
                {{ isId ? 'Sinkronisasi Metadata' : 'Metadata Sync' }}
              </div>
              <p class="text-[11px] text-neutral-400 leading-relaxed">
                {{ isId ? 'Ukuran file, mime type, dan key otomatis tercatat di katalog metadata TiDB.' : 'File size, MIME type, and key path are recorded in the TiDB metadata catalog.' }}
              </p>
            </div>
          </div>
        </section>

        <!-- ========================================== -->
        <!-- Section 6: Telemetri & Audit / Monitoring -->
        <!-- ========================================== -->
        <section id="monitoring" class="space-y-5 scroll-mt-24">
          <div class="border-b border-white/10 pb-4">
            <div class="text-xs font-mono font-bold text-[#00DC82] uppercase tracking-wider">
              {{ isId ? 'BAB 06' : 'CHAPTER 06' }}
            </div>
            <h2 class="text-xl sm:text-3xl font-bold text-white tracking-tight mt-1.5">
              {{ isId ? 'Telemetri Real-Time & Log Audit Keamanan' : 'Monitoring & Audit Trail' }}
            </h2>
          </div>

          <p class="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {{ isId
              ? 'Dapatkan visibilitas menyeluruh terhadap kesehatan sistem, penggunaan memori proses Node.js, latensi TiDB, dan log aktivitas keamanan di menu /monitoring:'
              : 'Gain complete observability into system health, Node.js process heap memory, TiDB roundtrip latency, and immutable security logs at /monitoring:'
            }}
          </p>

          <ul class="space-y-2.5 text-xs text-neutral-300 pl-4 list-disc marker:text-[#00DC82]">
            <li><strong>{{ isId ? 'Kartu Telemetri Langsung:' : 'Live Telemetry Cards:' }}</strong> {{ isId ? 'Uptime server, persentase heap memori, latensi koneksi TiDB Cloud (ms), dan total objek Cloudflare R2.' : 'Server uptime, heap memory percentage, TiDB latency (ms), and managed R2 object counts.' }}</li>
            <li><strong>{{ isId ? 'Audit Trail Kebal Manipulasi:' : 'Immutable Audit Trail:' }}</strong> {{ isId ? 'Mencatat setiap aksi admin (database.create, table.drop, apikey.create, storage.delete) beserta alamat IP dan metadata JSON.' : 'Records every admin action with IP address and JSON metadata.' }}</li>
            <li><strong>{{ isId ? 'Riwayat Query Terdistribusi:' : 'Query History Matrix:' }}</strong> {{ isId ? 'Log eksekusi real-time lengkap dengan badge status sukses/gagal dan waktu respon.' : 'Live execution records showing latency and status badges.' }}</li>
          </ul>
        </section>

        <!-- ========================================== -->
        <!-- Section 7: Kunci API & Keamanan / API Keys -->
        <!-- ========================================== -->
        <section id="api-keys" class="space-y-5 scroll-mt-24">
          <div class="border-b border-white/10 pb-4">
            <div class="text-xs font-mono font-bold text-[#00DC82] uppercase tracking-wider">
              {{ isId ? 'BAB 07' : 'CHAPTER 07' }}
            </div>
            <h2 class="text-xl sm:text-3xl font-bold text-white tracking-tight mt-1.5">
              {{ isId ? 'Kunci API Kriptografis & Keamanan Zero-Knowledge' : 'API Keys & Cryptographic Security' }}
            </h2>
          </div>

          <p class="text-xs sm:text-sm text-neutral-300 leading-relaxed">
            {{ isId
              ? 'KyoDB menerapkan arsitektur Zero-Knowledge Secret Storage untuk akses API programatik:'
              : 'KyoDB implements a Zero-Knowledge Secret Storage Architecture for programmatic REST API access:'
            }}
          </p>

          <div class="space-y-3 text-xs text-neutral-300">
            <p>• <strong>{{ isId ? 'Format Token CSPRNG:' : 'CSPRNG Token Format:' }}</strong> <code>kyo_live_&lt;48 hex characters&gt;</code> {{ isId ? 'dibuat menggunakan generator acak kriptografi aman bawaan Node.js.' : 'generated with Node.js crypto CSPRNG.' }}</p>
            <p>• <strong>{{ isId ? 'Penyimpanan Satu Kali (One-Time Reveal):' : 'One-Time Secret Reveal:' }}</strong> {{ isId ? 'Token asli hanya ditampilkan sekali saat dibuat. Database hanya menyimpan hash deterministik SHA-256 sehingga token tidak dapat bocor dari database.' : 'The plaintext key is shown only once upon creation. Only the deterministic SHA-256 hash is stored in TiDB.' }}</p>
            <p>• <strong>{{ isId ? 'Izin Granular (Permissions):' : 'Granular Permissions:' }}</strong></p>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              <span class="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[#00DC82]">databases:read</span>
              <span class="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[#00DC82]">databases:write</span>
              <span class="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[#00DC82]">storage:read</span>
              <span class="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[#00DC82]">storage:write</span>
              <span class="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[#00DC82]">queries:execute</span>
              <span class="p-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-[#00DC82]">projects:read</span>
            </div>

            <!-- Code Sample Request -->
            <div class="space-y-2 pt-3">
              <div class="flex items-center justify-between text-xs text-neutral-300 font-semibold">
                <span>{{ isId ? 'Contoh Request cURL dengan Kunci API:' : 'cURL API Key Request Example:' }}</span>
                <button
                  class="text-[11px] font-mono text-[#00DC82] hover:underline flex items-center gap-1"
                  @click="copySnippet('curl-key', curlSample)"
                >
                  <Check v-if="copied['curl-key']" class="w-3.5 h-3.5" />
                  <Copy v-else class="w-3.5 h-3.5" />
                  <span>{{ copied['curl-key'] ? (isId ? 'Tersalin!' : 'Copied!') : (isId ? 'Salin cURL' : 'Copy cURL') }}</span>
                </button>
              </div>
              <div class="rounded-xl border border-white/10 bg-neutral-950 p-4 font-mono text-xs text-neutral-300 overflow-x-auto shadow-xl">
                <pre><code>{{ curlSample }}</code></pre>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Footer -->
    <footer class="bg-[#020412] border-t border-white/5 py-8 text-xs text-neutral-500 text-center">
      <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-2">
          <KyoLogo variant="dark" size="sm" />
          <span>• {{ isId ? 'Panduan Dokumentasi Resmi KyoDB' : 'Official KyoDB Documentation Guide' }}</span>
        </div>
        <div class="text-[11px] font-mono text-neutral-400">
          MIT License • 2026 KyoDB
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
import KyoLogo from '~/components/shared/KyoLogo.vue'
import {
  BookOpen,
  Search,
  Sparkles,
  ShieldCheck,
  LayoutGrid,
  Terminal,
  Database,
  Globe,
  Copy,
  Check
} from '@lucide/vue'

definePageMeta({
  layout: false
})

const auth = useAuth()
const { currentLocale, isId, toggleLocale } = useLocale()

const searchQuery = ref('')
const activeSection = ref('getting-started')

// Copy state management for code snippets
const copied = reactive<Record<string, boolean>>({})

const copySnippet = async (key: string, text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    copied[key] = true
    setTimeout(() => {
      copied[key] = false
    }, 2000)
  } catch {
    // fallback
  }
}

const sections = [
  { id: 'getting-started', badge: '01', titleId: '1. Panduan Memulai', titleEn: '1. Getting Started' },
  { id: 'project-management', badge: '02', titleId: '2. Manajemen Proyek', titleEn: '2. Project Management' },
  { id: 'database-manager', badge: '03', titleId: '3. Studio Database', titleEn: '3. Database Studio' },
  { id: 'sql-editor', badge: '04', titleId: '4. Monaco SQL Editor', titleEn: '4. Monaco SQL Editor' },
  { id: 'storage-manager', badge: '05', titleId: '5. Cloudflare R2', titleEn: '5. Cloudflare R2' },
  { id: 'monitoring', badge: '06', titleId: '6. Telemetri & Audit', titleEn: '6. Monitoring & Audit' },
  { id: 'api-keys', badge: '07', titleId: '7. Kunci API & Keamanan', titleEn: '7. API Keys & Security' }
]

const filteredSections = computed(() => {
  if (!searchQuery.value.trim()) return sections
  const q = searchQuery.value.toLowerCase()
  return sections.filter((s) => {
    return (
      s.titleId.toLowerCase().includes(q) ||
      s.titleEn.toLowerCase().includes(q) ||
      s.id.toLowerCase().includes(q)
    )
  })
})

const envSampleCode = `# TiDB Cloud Distributed MySQL Cluster
TIDB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=your_prefix.root
TIDB_PASSWORD=your_secure_password
TIDB_DATABASE=kyodb_system

# Cloudflare R2 Zero-Egress Storage
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_r2_bucket
R2_ENDPOINT=https://your_cloudflare_account_id.r2.cloudflarestorage.com

# Master Admin Bootstrap Credentials
ADMIN_BOOTSTRAP_EMAIL=hrmnfrmnsyh1210@gmail.com
ADMIN_BOOTSTRAP_PASSWORD=YourPassword2026!`

const curlSample = `curl -X POST https://kyodb.app/api/databases/query \\
  -H "Authorization: Bearer kyo_live_8f3a9e42b1c7d0e5f6a8b2c4..." \\
  -H "Content-Type: application/json" \\
  -d '{"database": "ecommerce_prod", "sql": "SELECT id, name, price FROM products LIMIT 10"}'`

onMounted(async () => {
  if (!auth.isChecked.value) {
    await auth.fetchUser()
  }
})
</script>
