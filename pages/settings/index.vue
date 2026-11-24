<template>
  <div class="space-y-6 max-w-7xl mx-auto">
    <!-- Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
          Settings &amp; API Management
        </h1>
        <p class="text-xs sm:text-sm text-neutral-500 mt-1">
          Generate secure scoped API keys, inspect security parameters, and view cloud cluster configuration.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          v-if="!isAdmin && activeTab === 'tidb'"
          class="btn-forest inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold shadow-xs"
          @click="openAddConnectionModal"
        >
          <Plus class="h-3.5 w-3.5" />
          <span>Add TiDB Connection</span>
        </button>

        <button
          v-if="isAdmin && activeTab === 'apikeys'"
          class="btn-forest inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold shadow-xs"
          @click="openCreateKeyModal"
        >
          <Plus class="h-3.5 w-3.5" />
          <span>Generate API Key</span>
        </button>
      </div>
    </div>

    <!-- Tab Switcher -->
    <div class="flex items-center gap-1 bg-neutral-200/60 p-1 rounded-full w-fit">
      <!-- TiDB Connections (Public Users Only) -->
      <button
        v-if="!isAdmin"
        class="px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2"
        :class="activeTab === 'tidb' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'"
        @click="activeTab = 'tidb'"
      >
        <Database class="w-3.5 h-3.5" :class="activeTab === 'tidb' ? 'text-[#144e35]' : ''" />
        <span>TiDB Connections</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-100 font-mono">{{ connections.length }}</span>
      </button>

      <!-- Project API Keys (Admin Only) -->
      <button
        v-if="isAdmin"
        class="px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2"
        :class="activeTab === 'apikeys' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'"
        @click="activeTab = 'apikeys'"
      >
        <Key class="w-3.5 h-3.5" :class="activeTab === 'apikeys' ? 'text-[#144e35]' : ''" />
        <span>Project API Keys</span>
        <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-neutral-100 font-mono">{{ apiKeys.length }}</span>
      </button>

      <!-- Security & Cloud Config (Admin Only) -->
      <button
        v-if="isAdmin"
        class="px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2"
        :class="activeTab === 'system' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'"
        @click="activeTab = 'system'"
      >
        <ShieldCheck class="w-3.5 h-3.5" :class="activeTab === 'system' ? 'text-[#144e35]' : ''" />
        <span>Security &amp; Cloud Config</span>
      </button>
    </div>

    <!-- TAB 0: TIDB DATABASE CONNECTIONS -->
    <div v-if="activeTab === 'tidb'" class="space-y-5">
      <!-- Info Callout Banner -->
      <div class="donezo-card p-4 bg-emerald-50/50 border border-emerald-200/60 flex items-start gap-3 text-xs text-neutral-700">
        <Database class="w-5 h-5 text-[#144e35] shrink-0 mt-0.5" />
        <div>
          <span class="font-bold text-neutral-900 block mb-0.5">TiDB Cloud Cluster Management</span>
          <p class="text-neutral-600 leading-relaxed">
            Enter your TiDB host, port, username, password, and database to manage tables, run queries, and browse records from this web app.
            Credentials are encrypted with AES-256-GCM and communication uses TLS v1.2+.
          </p>
        </div>
      </div>

      <!-- Connections Table Card -->
      <div class="donezo-card overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-neutral-100 bg-neutral-50/50">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-neutral-900">Configured TiDB Databases</h3>
            <span class="text-xs text-neutral-400">({{ connections.length }} configured)</span>
          </div>

          <button
            class="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
            title="Refresh Connections"
            @click="fetchConnections"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isUserDbLoading }" />
          </button>
        </div>

        <div v-if="isUserDbLoading && connections.length === 0" class="p-8 text-center text-xs text-neutral-400">
          <RefreshCw class="w-6 h-6 animate-spin mx-auto text-[#144e35] mb-2" />
          Loading database connections...
        </div>

        <div v-else-if="connections.length === 0" class="p-12 text-center">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-[#144e35] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Database class="w-6 h-6" />
          </div>
          <h4 class="text-base font-bold text-neutral-900">No TiDB Connections Configured</h4>
          <p class="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Connect your TiDB Cloud database by entering your host, port, user, password, and database name.
          </p>
          <button
            class="btn-forest mt-4 inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold"
            @click="openAddConnectionModal"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Add TiDB Connection</span>
          </button>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-neutral-50/70 border-b border-neutral-100 text-neutral-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th class="py-3 px-4">Connection Name</th>
                <th class="py-3 px-4">Host : Port</th>
                <th class="py-3 px-4">User</th>
                <th class="py-3 px-4">Database</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Created At</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
              <tr v-for="conn in connections" :key="conn.id" class="hover:bg-neutral-50/60 transition-colors">
                <td class="py-3 px-4 font-bold text-neutral-900">
                  <div class="flex items-center gap-2">
                    <Database class="w-3.5 h-3.5 text-[#144e35]" />
                    <span>{{ conn.name }}</span>
                  </div>
                </td>
                <td class="py-3 px-4 font-mono text-neutral-700 text-[11px]">
                  {{ conn.host }}:{{ conn.port }}
                </td>
                <td class="py-3 px-4 font-mono text-neutral-700 text-[11px]">
                  {{ conn.username }}
                </td>
                <td class="py-3 px-4 font-mono text-neutral-900 font-semibold text-[11px]">
                  {{ conn.database }}
                </td>
                <td class="py-3 px-4">
                  <span
                    v-if="conn.isDefault"
                    class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active Default
                  </span>
                  <button
                    v-else
                    class="text-[11px] font-semibold text-neutral-500 hover:text-[#144e35] hover:underline"
                    @click="handleActivateConnection(conn.id)"
                  >
                    Set Active
                  </button>
                </td>
                <td class="py-3 px-4 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                  {{ formatDate(conn.createdAt) }}
                </td>
                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      class="p-1 text-neutral-400 hover:text-amber-600 rounded transition-colors"
                      title="Test Connection"
                      :disabled="testingConnId === conn.id"
                      @click="handleTestStoredConnection(conn)"
                    >
                      <RefreshCw v-if="testingConnId === conn.id" class="w-3.5 h-3.5 animate-spin" />
                      <Zap v-else class="w-3.5 h-3.5 text-amber-500" />
                    </button>
                    <button
                      class="p-1 text-neutral-400 hover:text-neutral-700 rounded transition-colors"
                      title="Edit Connection"
                      @click="openEditConnectionModal(conn)"
                    >
                      <Edit3 class="w-3.5 h-3.5" />
                    </button>
                    <button
                      class="p-1 text-neutral-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete Connection"
                      @click="handleDeleteConnection(conn)"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 1: API KEYS MANAGEMENT -->
    <div v-if="activeTab === 'apikeys'" class="space-y-5">
      <!-- Info Callout Banner -->
      <div class="donezo-card p-4 bg-emerald-50/50 border border-emerald-200/60 flex items-start gap-3 text-xs text-neutral-700">
        <Key class="w-5 h-5 text-[#144e35] shrink-0 mt-0.5" />
        <div>
          <span class="font-bold text-neutral-900 block mb-0.5">Cryptographic API Key Protection</span>
          <p class="text-neutral-600 leading-relaxed">
            API keys are generated with 192-bit cryptographic randomness (<code class="font-mono text-[#144e35]">kyo_live_...</code>).
            Plaintext keys are never stored on the server — only SHA-256 hashes are preserved in TiDB metadata.
          </p>
        </div>
      </div>

      <!-- API Keys Table Card -->
      <div class="donezo-card overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b border-neutral-100 bg-neutral-50/50">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-bold text-neutral-900">Active API Keys</h3>
            <span class="text-xs text-neutral-400">({{ apiKeys.length }} total)</span>
          </div>

          <button
            class="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
            title="Refresh API Keys"
            @click="fetchApiKeys"
          >
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
          </button>
        </div>

        <div v-if="isLoading && apiKeys.length === 0" class="p-8 text-center text-xs text-neutral-400">
          <RefreshCw class="w-6 h-6 animate-spin mx-auto text-[#144e35] mb-2" />
          Loading API keys...
        </div>

        <div v-else-if="apiKeys.length === 0" class="p-12 text-center">
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 text-[#144e35] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Key class="w-6 h-6" />
          </div>
          <h4 class="text-base font-bold text-neutral-900">No API Keys Generated</h4>
          <p class="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Generate an API key to securely query TiDB tables or upload objects to Cloudflare R2 from external clients or microservices.
          </p>
          <button
            class="btn-forest mt-4 inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold"
            @click="openCreateKeyModal"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Generate First API Key</span>
          </button>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-neutral-50/70 border-b border-neutral-100 text-neutral-500 font-semibold uppercase text-[10px] tracking-wider">
              <tr>
                <th class="py-3 px-4">Name</th>
                <th class="py-3 px-4">Key Identifier</th>
                <th class="py-3 px-4">Project</th>
                <th class="py-3 px-4">Permissions</th>
                <th class="py-3 px-4">Status</th>
                <th class="py-3 px-4">Created At</th>
                <th class="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-neutral-100">
              <tr v-for="key in apiKeys" :key="key.id" class="hover:bg-neutral-50/60 transition-colors">
                <td class="py-3 px-4 font-bold text-neutral-900">{{ key.name }}</td>
                <td class="py-3 px-4 font-mono text-neutral-600">
                  <code class="bg-neutral-100 px-2 py-0.5 rounded border border-neutral-200 text-neutral-800">
                    {{ key.keyPrefix }}
                  </code>
                </td>
                <td class="py-3 px-4 text-neutral-700 font-medium">
                  {{ key.projectName || 'Global' }}
                </td>
                <td class="py-3 px-4">
                  <div class="flex flex-wrap gap-1 max-w-xs">
                    <span
                      v-for="perm in key.permissions"
                      :key="perm"
                      class="px-1.5 py-0.5 rounded text-[10px] font-mono bg-neutral-100 text-neutral-700 border border-neutral-200"
                    >
                      {{ perm }}
                    </span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span
                    v-if="key.isRevoked"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200"
                  >
                    Revoked
                  </span>
                  <span
                    v-else-if="key.isExpired"
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200"
                  >
                    Expired
                  </span>
                  <span
                    v-else
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Active
                  </span>
                </td>
                <td class="py-3 px-4 text-neutral-500 font-mono text-[11px] whitespace-nowrap">
                  {{ formatDate(key.createdAt) }}
                </td>
                <td class="py-3 px-4 text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <button
                      v-if="!key.isRevoked"
                      class="px-2 py-1 rounded text-[11px] font-semibold text-amber-700 hover:bg-amber-50 transition-colors"
                      title="Revoke Key"
                      @click="handleRevoke(key)"
                    >
                      Revoke
                    </button>
                    <button
                      class="p-1 text-neutral-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete Key"
                      @click="handleDelete(key)"
                    >
                      <Trash2 class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TAB 2: SECURITY & CLOUD INFRASTRUCTURE CONFIG -->
    <div v-else class="space-y-5">
      <!-- Admin Profile Card -->
      <div class="donezo-card p-6">
        <h3 class="text-sm font-bold text-neutral-900 mb-4 flex items-center gap-2">
          <User class="w-4 h-4 text-[#144e35]" />
          <span>Master Administrator Identity</span>
        </h3>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div class="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
            <span class="text-[11px] text-neutral-400 font-semibold block">Username</span>
            <span class="text-xs font-bold text-neutral-900 font-mono">{{ auth.user.value?.username || 'admin' }}</span>
          </div>

          <div class="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
            <span class="text-[11px] text-neutral-400 font-semibold block">Email</span>
            <span class="text-xs font-bold text-neutral-900 font-mono">{{ auth.user.value?.email || 'admin@kyodb.local' }}</span>
          </div>

          <div class="p-3 rounded-xl bg-neutral-50 border border-neutral-200">
            <span class="text-[11px] text-neutral-400 font-semibold block">Authentication Engine</span>
            <span class="text-xs font-bold text-emerald-800 font-mono">Argon2id (Memory-hard)</span>
          </div>
        </div>
      </div>

      <!-- Cloud Infrastructure Parameters -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
        <!-- TiDB Configuration Card -->
        <div class="donezo-card p-6 space-y-4">
          <div class="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-[#144e35] flex items-center justify-center">
              <Database class="w-4 h-4" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-neutral-900">TiDB Cloud Cluster</h4>
              <p class="text-[11px] text-neutral-400">Relational SQL engine</p>
            </div>
          </div>

          <div class="space-y-2 text-xs font-mono">
            <div class="flex justify-between py-1 border-b border-neutral-100">
              <span class="text-neutral-400">System Database:</span>
              <span class="font-bold text-[#144e35]">kyodb_system</span>
            </div>
            <div class="flex justify-between py-1 border-b border-neutral-100">
              <span class="text-neutral-400">Connection Mode:</span>
              <span class="text-neutral-800">Connection Pool (mysql2)</span>
            </div>
            <div class="flex justify-between py-1 border-b border-neutral-100">
              <span class="text-neutral-400">TLS Encryption:</span>
              <span class="text-emerald-700 font-semibold">TLS v1.2+ Enforced</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-neutral-400">System Tables:</span>
              <span class="text-neutral-800">8 Core Metadata Tables</span>
            </div>
          </div>
        </div>

        <!-- Cloudflare R2 Configuration Card -->
        <div class="donezo-card p-6 space-y-4">
          <div class="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-[#144e35] flex items-center justify-center">
              <Cloud class="w-4 h-4" />
            </div>
            <div>
              <h4 class="text-sm font-bold text-neutral-900">Cloudflare R2 Storage</h4>
              <p class="text-[11px] text-neutral-400">Direct-to-R2 S3 API</p>
            </div>
          </div>

          <div class="space-y-2 text-xs font-mono">
            <div class="flex justify-between py-1 border-b border-neutral-100">
              <span class="text-neutral-400">Upload Protocol:</span>
              <span class="font-bold text-[#144e35]">Presigned S3 PUT URLs</span>
            </div>
            <div class="flex justify-between py-1 border-b border-neutral-100">
              <span class="text-neutral-400">Master Secret Safety:</span>
              <span class="text-emerald-700 font-semibold">Zero Client Exposure</span>
            </div>
            <div class="flex justify-between py-1 border-b border-neutral-100">
              <span class="text-neutral-400">Presigned Expiration:</span>
              <span class="text-neutral-800">900 seconds (15 mins)</span>
            </div>
            <div class="flex justify-between py-1">
              <span class="text-neutral-400">Local Dev Resilience:</span>
              <span class="text-neutral-800">In-Memory Mock Fallback</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create API Key Modal -->
    <div v-if="isCreateModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs" @click="isCreateModalOpen = false"></div>
      <div class="relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white shadow-2xl p-6 overflow-hidden">
        <div class="flex items-center justify-between pb-3 mb-4 border-b border-neutral-100">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-lg bg-emerald-50 text-[#144e35] flex items-center justify-center">
              <Key class="w-4 h-4" />
            </div>
            <div>
              <h3 class="text-sm font-bold text-neutral-900">Generate New API Key</h3>
              <p class="text-[11px] text-neutral-400">Cryptographically signed access token</p>
            </div>
          </div>
          <button class="p-1 text-neutral-400 hover:text-neutral-700" @click="isCreateModalOpen = false">
            <X class="w-4 h-4" />
          </button>
        </div>

        <div v-if="createError" class="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
          {{ createError }}
        </div>

        <form class="space-y-4" @submit.prevent="handleCreateKey">
          <div>
            <label class="block text-xs font-semibold text-neutral-700 mb-1">Key Name <span class="text-[#144e35]">*</span></label>
            <input
              v-model="keyForm.name"
              type="text"
              required
              placeholder="e.g. Mobile App Backend, CI/CD Pipeline"
              class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#144e35] outline-none"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-neutral-700 mb-1">Scope Project <span class="text-[#144e35]">*</span></label>
            <select
              v-model="keyForm.projectId"
              required
              class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:border-[#144e35] outline-none"
            >
              <option value="" disabled>-- Select project scope --</option>
              <option v-for="p in projects" :key="p.id" :value="p.id">
                {{ p.name }} ({{ p.slug }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Permissions</label>
            <div class="grid grid-cols-2 gap-2 text-xs text-neutral-700">
              <label v-for="perm in availablePermissions" :key="perm" class="flex items-center gap-1.5 cursor-pointer">
                <input
                  v-model="keyForm.permissions"
                  type="checkbox"
                  :value="perm"
                  class="rounded text-[#144e35] focus:ring-[#144e35]"
                />
                <span class="font-mono text-[11px]">{{ perm }}</span>
              </label>
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-neutral-700 mb-1">Expiry Duration</label>
            <select
              v-model="keyForm.expiresInDays"
              class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 focus:bg-white focus:border-[#144e35] outline-none"
            >
              <option :value="null">Never Expires</option>
              <option :value="30">30 Days</option>
              <option :value="60">60 Days</option>
              <option :value="90">90 Days</option>
              <option :value="365">1 Year</option>
            </select>
          </div>

          <div class="mt-6 flex justify-end gap-2.5 pt-4 border-t border-neutral-100">
            <button
              type="button"
              class="btn-white-pill px-4 py-2 text-xs font-semibold"
              @click="isCreateModalOpen = false"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isSubmittingKey || !keyForm.name.trim() || !keyForm.projectId || keyForm.permissions.length === 0"
              class="btn-forest px-5 py-2 text-xs font-semibold"
            >
              Generate Key
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Key Reveal Modal (Only Shown Once!) -->
    <div v-if="revealedKey" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs"></div>
      <div class="relative w-full max-w-lg rounded-2xl border border-emerald-200 bg-white shadow-2xl p-6 overflow-hidden">
        <div class="flex items-center gap-2.5 mb-4 text-emerald-800">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#144e35] border border-emerald-200">
            <Check class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-base font-bold text-neutral-900">API Key Successfully Generated!</h3>
            <p class="text-xs text-neutral-500">Save this key now — it cannot be retrieved later.</p>
          </div>
        </div>

        <div class="rounded-xl bg-neutral-50 border border-neutral-200 p-4 space-y-2 mb-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-neutral-700">Secret Token:</span>
            <button
              class="inline-flex items-center gap-1 text-xs font-semibold text-[#144e35] hover:underline"
              @click="copyKey(revealedKey.plainKey)"
            >
              <Check v-if="hasCopiedKey" class="w-3.5 h-3.5 text-emerald-600" />
              <Copy v-else class="w-3.5 h-3.5" />
              <span>{{ hasCopiedKey ? 'Copied!' : 'Copy Key' }}</span>
            </button>
          </div>
          <div class="font-mono text-xs text-neutral-900 break-all bg-white p-2.5 rounded-lg border border-neutral-200 select-all">
            {{ revealedKey.plainKey }}
          </div>
        </div>

        <p class="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-6">
          ⚠️ <strong>Security Notice:</strong> Store this API key securely in your environment variables. For security reasons, KyoDB will never display the raw secret key again.
        </p>

        <div class="flex justify-end">
          <button class="btn-forest px-6 py-2 text-xs font-semibold" @click="closeRevealModal">
            I Have Saved My Key
          </button>
        </div>
      </div>
    </div>

    <!-- Connect TiDB Modal -->
    <DatabaseConnectTiDbModal
      :is-open="isTiDbModalOpen"
      :edit-connection="editingConnection"
      @close="isTiDbModalOpen = false"
      @saved="handleConnectionSaved"
    />
  </div>
</template>

<script setup lang="ts">
import {
  Key,
  Plus,
  RefreshCw,
  Trash2,
  ShieldCheck,
  User,
  Database,
  Cloud,
  X,
  Copy,
  Check,
  Edit3,
  Zap
} from '@lucide/vue'
import type { ApiKey, CreateApiKeyResponse, UserDatabaseConnection } from '~/types'

definePageMeta({ middleware: 'auth' })

const auth = useAuth()
const isAdmin = computed(() => auth.user.value?.role === 'admin')
const { projects, fetchProjects } = useProjects()
const { apiKeys, isLoading, fetchApiKeys, createApiKey, revokeApiKey, deleteApiKey } = useApiKeys()
const {
  connections,
  isLoading: isUserDbLoading,
  fetchConnections,
  deleteConnection,
  activateConnection,
  testConnection
} = useUserDatabases()

const activeTab = ref<'tidb' | 'apikeys' | 'system'>(isAdmin.value ? 'apikeys' : 'tidb')

watch(
  isAdmin,
  (val) => {
    if (val && activeTab.value === 'tidb') {
      activeTab.value = 'apikeys'
    } else if (!val && activeTab.value !== 'tidb') {
      activeTab.value = 'tidb'
    }
  },
  { immediate: true }
)
const isCreateModalOpen = ref(false)
const isSubmittingKey = ref(false)
const createError = ref<string | null>(null)
const revealedKey = ref<CreateApiKeyResponse | null>(null)
const hasCopiedKey = ref(false)

// TiDB Connections Modal & Actions
const isTiDbModalOpen = ref(false)
const editingConnection = ref<UserDatabaseConnection | null>(null)
const testingConnId = ref<string | null>(null)

const openAddConnectionModal = () => {
  editingConnection.value = null
  isTiDbModalOpen.value = true
}

const openEditConnectionModal = (conn: UserDatabaseConnection) => {
  editingConnection.value = conn
  isTiDbModalOpen.value = true
}

const handleConnectionSaved = async () => {
  await fetchConnections()
}

const handleActivateConnection = async (id: string) => {
  await activateConnection(id)
}

const handleDeleteConnection = async (conn: UserDatabaseConnection) => {
  if (confirm(`Are you sure you want to delete TiDB connection "${conn.name}"?`)) {
    await deleteConnection(conn.id)
  }
}

const handleTestStoredConnection = async (conn: UserDatabaseConnection) => {
  testingConnId.value = conn.id
  try {
    const res = await testConnection({
      host: conn.host,
      port: conn.port,
      username: conn.username,
      database: conn.database,
      sslCa: conn.sslCa || undefined,
      connectionId: conn.id
    })
    if (res.connected) {
      alert(`Connection to ${conn.name} succeeded! (${res.latencyMs}ms, TiDB ${res.version})`)
    } else {
      alert(`Connection to ${conn.name} failed: ${res.error}`)
    }
  } finally {
    testingConnId.value = null
  }
}

const availablePermissions = [
  'databases:read',
  'databases:write',
  'storage:read',
  'storage:write',
  'queries:execute',
  'projects:read'
]

const keyForm = reactive({
  name: '',
  projectId: '',
  permissions: ['databases:read', 'storage:read'],
  expiresInDays: null as number | null
})

const openCreateModal = () => {
  keyForm.name = ''
  keyForm.projectId = projects.value[0]?.id || ''
  keyForm.permissions = ['databases:read', 'storage:read']
  keyForm.expiresInDays = null
  createError.value = null
  isCreateModalOpen.value = true
}

const openCreateKeyModal = () => {
  openCreateModal()
}

const handleCreateKey = async () => {
  isSubmittingKey.value = true
  createError.value = null
  try {
    const res = await createApiKey({
      name: keyForm.name,
      projectId: keyForm.projectId,
      permissions: keyForm.permissions,
      expiresInDays: keyForm.expiresInDays
    })
    if (res.success && res.data) {
      isCreateModalOpen.value = false
      revealedKey.value = res.data
    } else {
      createError.value = res.error || 'Failed to generate API key'
    }
  } finally {
    isSubmittingKey.value = false
  }
}

const copyKey = async (text: string) => {
  try {
    await navigator.clipboard.writeText(text)
    hasCopiedKey.value = true
    setTimeout(() => { hasCopiedKey.value = false }, 2000)
  } catch (err) {
    console.error('Failed to copy key:', err)
  }
}

const closeRevealModal = () => {
  revealedKey.value = null
}

const handleRevoke = async (key: ApiKey) => {
  if (confirm(`Are you sure you want to revoke API key "${key.name}"? External requests using this key will be rejected.`)) {
    await revokeApiKey(key.id)
  }
}

const handleDelete = async (key: ApiKey) => {
  if (confirm(`Permanently delete API key "${key.name}"?`)) {
    await deleteApiKey(key.id)
  }
}

const formatDate = (isoStr?: string) => {
  if (!isoStr) return '—'
  try {
    const d = new Date(isoStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return isoStr
  }
}

onMounted(async () => {
  await Promise.all([
    fetchConnections(),
    fetchApiKeys(),
    fetchProjects()
  ])
})
</script>
