<template>
  <div class="min-h-screen bg-[#fcfdfd] text-neutral-900 selection:bg-emerald-100 selection:text-emerald-900 flex flex-col font-sans">
    <!-- Top Docs Header -->
    <header class="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-neutral-200/80">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="flex items-center gap-2 group">
            <img
              src="/images/logo.webp"
              alt="KyoDB"
              class="h-8 w-auto object-contain transition-transform group-hover:scale-102"
            />
            <span class="text-xs font-bold text-neutral-800">Docs</span>
            <span class="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200/80">
              v1.4
            </span>
          </NuxtLink>
        </div>

        <!-- Search Bar (Quick filter sections) -->
        <div class="relative flex-1 max-w-md hidden sm:block">
          <Search class="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search documentation (e.g. R2, SQL, API keys)..."
            class="w-full rounded-full border border-neutral-200 bg-neutral-50 pl-9 pr-4 py-1.5 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#144e35] focus:outline-none transition-all"
          />
        </div>

        <!-- Header Actions -->
        <div class="flex items-center gap-3">
          <NuxtLink
            to="/"
            class="text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors hidden md:inline-block"
          >
            ← Landing Page
          </NuxtLink>

          <NuxtLink
            :to="auth.isAuthenticated.value ? '/dashboard' : '/login'"
            class="btn-forest inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold shadow-xs"
          >
            <LayoutGrid v-if="auth.isAuthenticated.value" class="w-3.5 h-3.5" />
            <Terminal v-else class="w-3.5 h-3.5" />
            <span>{{ auth.isAuthenticated.value ? 'Open Console' : 'Sign In' }}</span>
          </NuxtLink>
        </div>
      </div>
    </header>

    <!-- Main Docs Container -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col md:flex-row gap-8">
      <!-- Left Sidebar: Table of Contents (Sticky) -->
      <aside class="w-full md:w-64 shrink-0">
        <div class="sticky top-24 space-y-6">
          <div>
            <div class="text-[10px] font-bold uppercase tracking-wider text-neutral-400 px-3 pb-2">
              DOCUMENTATION INDEX
            </div>
            <nav class="space-y-1 text-xs font-medium">
              <a
                v-for="section in filteredSections"
                :key="section.id"
                :href="`#${section.id}`"
                class="block px-3 py-2 rounded-xl transition-colors"
                :class="activeSection === section.id ? 'bg-emerald-50 text-[#144e35] font-bold border border-emerald-200/60' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60'"
                @click="activeSection = section.id"
              >
                {{ section.title }}
              </a>
            </nav>
          </div>

          <!-- Quick Tip Card -->
          <div class="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 text-xs space-y-2">
            <div class="font-bold text-neutral-900 flex items-center gap-1.5">
              <Sparkles class="w-3.5 h-3.5 text-[#144e35]" />
              <span>Offline Resilience</span>
            </div>
            <p class="text-[11px] text-neutral-500 leading-relaxed">
              KyoDB runs in-memory fallback stores when TiDB or Cloudflare R2 credentials are not configured, allowing complete local UI testing.
            </p>
          </div>
        </div>
      </aside>

      <!-- Right Column: Documentation Content -->
      <main class="flex-1 min-w-0 space-y-14 pb-20">
        <!-- Section 1: Getting Started -->
        <section id="getting-started" class="space-y-4 scroll-mt-24">
          <div class="border-b border-neutral-200 pb-3">
            <div class="text-xs font-bold text-[#144e35] uppercase tracking-wider">Chapter 1</div>
            <h1 class="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight mt-1">
              Getting Started with KyoDB
            </h1>
          </div>

          <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            <strong>KyoDB</strong> is a unified developer platform combining distributed relational SQL management on <strong>TiDB Cloud</strong> with zero-egress object storage on <strong>Cloudflare R2</strong>. Instead of juggling separate vendor consoles, KyoDB provides a single, high-contrast, responsive dashboard.
          </p>

          <!-- Callout -->
          <div class="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-neutral-800 space-y-1">
            <div class="font-bold text-[#144e35] flex items-center gap-2">
              <ShieldCheck class="w-4 h-4" />
              <span>Zero-Setup First Launch (Bootstrap Wizard)</span>
            </div>
            <p class="text-neutral-600">
              When launching KyoDB for the first time, if no administrator account exists in the database, the login screen automatically shifts into <strong>Master Administrator Bootstrap Mode</strong>. Simply provide your desired admin username and password to initialize the root account.
            </p>
          </div>

          <h3 class="text-base font-bold text-neutral-900 pt-2">Environment Configuration</h3>
          <p class="text-xs text-neutral-600 leading-relaxed">
            Configure your TiDB Cloud and Cloudflare R2 connection strings in the <code>.env</code> file:
          </p>

          <div class="rounded-xl border border-neutral-800 bg-neutral-950 p-4 text-xs font-mono text-neutral-200 overflow-x-auto">
<pre><code><span class="text-neutral-500"># TiDB Cloud Configuration</span>
TIDB_HOST=gateway01.ap-southeast-1.prod.aws.tidbcloud.com
TIDB_PORT=4000
TIDB_USER=your_user_prefix.root
TIDB_PASSWORD=your_secure_password
TIDB_DATABASE=kyodb_system

<span class="text-neutral-500"># Cloudflare R2 Object Storage</span>
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_r2_bucket
R2_ENDPOINT=https://your_cloudflare_account_id.r2.cloudflarestorage.com</code></pre>
          </div>
        </section>

        <!-- Section 2: Project Management -->
        <section id="project-management" class="space-y-4 scroll-mt-24">
          <div class="border-b border-neutral-200 pb-3">
            <div class="text-xs font-bold text-[#144e35] uppercase tracking-wider">Chapter 2</div>
            <h2 class="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight mt-1">
              Project Management &amp; Scoping
            </h2>
          </div>

          <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Projects act as isolated administrative namespaces. Each project can link to a dedicated logical TiDB database and automatically reserves a virtual storage folder scope at <code>projects/{slug}/</code>.
          </p>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div class="p-3.5 rounded-xl border border-neutral-200 bg-white">
              <div class="font-bold text-xs text-neutral-900 mb-1">Active</div>
              <p class="text-[11px] text-neutral-500">Fully operational access for databases, storage, and API keys.</p>
            </div>
            <div class="p-3.5 rounded-xl border border-neutral-200 bg-white">
              <div class="font-bold text-xs text-neutral-900 mb-1">Archived</div>
              <p class="text-[11px] text-neutral-500">Dormant state. Project data remains intact in read-only mode.</p>
            </div>
            <div class="p-3.5 rounded-xl border border-neutral-200 bg-white">
              <div class="font-bold text-xs text-neutral-900 mb-1">Suspended</div>
              <p class="text-[11px] text-neutral-500">Access temporarily blocked. Useful during security audits or payment holds.</p>
            </div>
          </div>
        </section>

        <!-- Section 3: Database & Tables -->
        <section id="database-manager" class="space-y-4 scroll-mt-24">
          <div class="border-b border-neutral-200 pb-3">
            <div class="text-xs font-bold text-[#144e35] uppercase tracking-wider">Chapter 3</div>
            <h2 class="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight mt-1">
              Database &amp; Schema Studio
            </h2>
          </div>

          <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            The Database Manager provides a graphical schema designer and table data editor over your TiDB cluster without requiring external tools like DBeaver or MySQL Workbench:
          </p>

          <ul class="space-y-2 text-xs text-neutral-700 pl-4 list-disc">
            <li><strong>Database Explorer:</strong> View all logical databases, table counts, row counts, and data length sizes.</li>
            <li><strong>Visual Table Designer:</strong> Create tables with custom columns, types (<code>INT</code>, <code>VARCHAR</code>, <code>BIGINT</code>, <code>DATETIME</code>, <code>JSON</code>, etc.), Primary Keys, and Auto-increment flags.</li>
            <li><strong>Inline Data Editor:</strong> Browse table rows with paginated grid view, search filter, and instant Create / Edit / Delete modals.</li>
          </ul>

          <div class="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
            <strong>System Database Protection:</strong> Critical system databases (<code>kyodb_system</code>, <code>mysql</code>, <code>information_schema</code>, <code>performance_schema</code>) are locked against deletion or arbitrary modification to ensure application safety.
          </div>
        </section>

        <!-- Section 4: Monaco SQL Editor -->
        <section id="sql-editor" class="space-y-4 scroll-mt-24">
          <div class="border-b border-neutral-200 pb-3">
            <div class="text-xs font-bold text-[#144e35] uppercase tracking-wider">Chapter 4</div>
            <h2 class="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight mt-1">
              Monaco SQL Editor &amp; Guardrails
            </h2>
          </div>

          <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            The built-in SQL Editor uses the same engine as Microsoft VS Code (Monaco Editor), offering syntax highlighting, autocompletion, query formatting, and preset templates.
          </p>

          <h3 class="text-sm font-bold text-neutral-900">Safety Guardrails:</h3>
          <div class="space-y-2 text-xs text-neutral-600">
            <p>1. <strong>Read-Only Mode Toggle:</strong> When enabled, any query with write or DDL patterns (<code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code>, <code>DROP</code>, <code>ALTER</code>) is blocked at both client and server validator layers.</p>
            <p>2. <strong>Destructive Confirmation:</strong> Any <code>DROP</code>, <code>TRUNCATE</code>, or unconstrained <code>DELETE</code> query requires explicit confirmation before execution.</p>
            <p>3. <strong>Telemetry Logging:</strong> Query execution durations and affected row counts are automatically tracked in the <code>query_history</code> table.</p>
          </div>
        </section>

        <!-- Section 5: Cloudflare R2 Storage -->
        <section id="storage-manager" class="space-y-4 scroll-mt-24">
          <div class="border-b border-neutral-200 pb-3">
            <div class="text-xs font-bold text-[#144e35] uppercase tracking-wider">Chapter 5</div>
            <h2 class="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight mt-1">
              Cloudflare R2 Object Storage
            </h2>
          </div>

          <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Cloudflare R2 eliminates AWS S3 egress costs. KyoDB utilizes a high-efficiency <strong>Direct-to-R2 Pre-signed Upload Engine</strong>:
          </p>

          <!-- Step diagram -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div class="p-3.5 rounded-xl border border-neutral-200 bg-white text-xs">
              <div class="w-6 h-6 rounded-full bg-emerald-100 text-[#144e35] flex items-center justify-center font-bold text-[11px] mb-2">1</div>
              <div class="font-bold text-neutral-900 mb-1">Pre-signed URL</div>
              <p class="text-[11px] text-neutral-500">Client asks KyoDB for a short-lived presigned S3 PUT URL.</p>
            </div>
            <div class="p-3.5 rounded-xl border border-neutral-200 bg-white text-xs">
              <div class="w-6 h-6 rounded-full bg-emerald-100 text-[#144e35] flex items-center justify-center font-bold text-[11px] mb-2">2</div>
              <div class="font-bold text-neutral-900 mb-1">Direct Stream</div>
              <p class="text-[11px] text-neutral-500">Browser streams raw bytes straight to Cloudflare R2 edge.</p>
            </div>
            <div class="p-3.5 rounded-xl border border-neutral-200 bg-white text-xs">
              <div class="w-6 h-6 rounded-full bg-emerald-100 text-[#144e35] flex items-center justify-center font-bold text-[11px] mb-2">3</div>
              <div class="font-bold text-neutral-900 mb-1">Metadata Confirmation</div>
              <p class="text-[11px] text-neutral-500">Upload confirmed and recorded in TiDB metadata catalog.</p>
            </div>
          </div>
        </section>

        <!-- Section 6: Monitoring & Telemetry -->
        <section id="monitoring" class="space-y-4 scroll-mt-24">
          <div class="border-b border-neutral-200 pb-3">
            <div class="text-xs font-bold text-[#144e35] uppercase tracking-wider">Chapter 6</div>
            <h2 class="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight mt-1">
              Monitoring &amp; Audit Trail
            </h2>
          </div>

          <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            Gain full visibility into system health, Node.js process memory, database latency, and security actions at <code>/monitoring</code>:
          </p>

          <ul class="space-y-2 text-xs text-neutral-700 pl-4 list-disc">
            <li><strong>Telemetry Cards:</strong> Server uptime (days, hours, minutes), heap memory usage percentage, TiDB roundtrip latency, and total managed R2 objects.</li>
            <li><strong>Audit Trail:</strong> Immutable security log tracking admin actions (<code>database.create</code>, <code>table.drop</code>, <code>apikey.create</code>, <code>storage.delete</code>) with IP addresses and JSON metadata.</li>
            <li><strong>Query History:</strong> Live execution records showing latency in milliseconds, status badges, and database names.</li>
          </ul>
        </section>

        <!-- Section 7: API Keys & Security -->
        <section id="api-keys" class="space-y-4 scroll-mt-24">
          <div class="border-b border-neutral-200 pb-3">
            <div class="text-xs font-bold text-[#144e35] uppercase tracking-wider">Chapter 7</div>
            <h2 class="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight mt-1">
              API Keys &amp; Cryptographic Security
            </h2>
          </div>

          <p class="text-xs sm:text-sm text-neutral-600 leading-relaxed">
            KyoDB implements a <strong>Zero-Knowledge Secret Storage Architecture</strong> for programmatic API access:
          </p>

          <div class="space-y-3 text-xs text-neutral-700">
            <p>• <strong>Key Generation:</strong> Keys use the format <code>kyo_live_&lt;48 hex characters&gt;</code> generated using Node.js Cryptographically Secure Pseudo-Random Number Generator (CSPRNG).</p>
            <p>• <strong>One-Time Reveal:</strong> The plaintext key is only shown <em>once</em> upon generation. Only the deterministic <strong>SHA-256 hash</strong> is stored in the database.</p>
            <p>• <strong>Granular Permissions:</strong> Selectively grant capabilities:</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px]">
              <span class="p-2 rounded bg-neutral-100 text-neutral-800">databases:read</span>
              <span class="p-2 rounded bg-neutral-100 text-neutral-800">databases:write</span>
              <span class="p-2 rounded bg-neutral-100 text-neutral-800">storage:read</span>
              <span class="p-2 rounded bg-neutral-100 text-neutral-800">storage:write</span>
              <span class="p-2 rounded bg-neutral-100 text-neutral-800">queries:execute</span>
              <span class="p-2 rounded bg-neutral-100 text-neutral-800">projects:read</span>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Footer -->
    <footer class="bg-white border-t border-neutral-200 py-6 text-xs text-neutral-500 text-center">
      <div class="max-w-7xl mx-auto px-4">
        <span>KyoDB v1.4 Documentation • TiDB Cloud &amp; Cloudflare R2 Integration Guide</span>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import {
  BookOpen,
  Search,
  Sparkles,
  ShieldCheck,
  LayoutGrid,
  Terminal
} from '@lucide/vue'

definePageMeta({
  layout: false
})

const auth = useAuth()
const searchQuery = ref('')
const activeSection = ref('getting-started')

const sections = [
  { id: 'getting-started', title: '1. Getting Started' },
  { id: 'project-management', title: '2. Project Management' },
  { id: 'database-manager', title: '3. Database & Tables' },
  { id: 'sql-editor', title: '4. Monaco SQL Editor' },
  { id: 'storage-manager', title: '5. Cloudflare R2' },
  { id: 'monitoring', title: '6. Monitoring & Audit' },
  { id: 'api-keys', title: '7. API Keys & Security' }
]

const filteredSections = computed(() => {
  if (!searchQuery.value.trim()) return sections
  const q = searchQuery.value.toLowerCase()
  return sections.filter((s) => s.title.toLowerCase().includes(q) || s.id.toLowerCase().includes(q))
})

onMounted(async () => {
  if (!auth.isChecked.value) {
    await auth.fetchUser()
  }
})
</script>
