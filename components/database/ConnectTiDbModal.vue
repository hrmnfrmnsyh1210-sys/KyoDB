<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs transition-opacity" @click="$emit('close')"></div>

    <!-- Modal Box -->
    <div class="relative w-full max-w-lg rounded-2xl border border-neutral-200 bg-white shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col">
      <!-- Modal Header -->
      <div class="flex items-center justify-between pb-4 border-b border-neutral-100 shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-emerald-50 text-[#144e35] flex items-center justify-center border border-emerald-200/80">
            <Database class="w-5 h-5" />
          </div>
          <div>
            <h3 class="text-sm font-bold text-neutral-900">
              {{ isEditing ? 'Edit TiDB Connection' : 'Connect TiDB Cloud Database' }}
            </h3>
            <p class="text-[11px] text-neutral-400">
              Provide your TiDB cluster credentials to manage databases &amp; run SQL queries
            </p>
          </div>
        </div>

        <button
          type="button"
          class="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          @click="$emit('close')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Scrollable Form Body -->
      <form @submit.prevent="handleSave" class="space-y-4 overflow-y-auto py-4 px-0.5 flex-1 text-xs">
        <!-- Error Banner -->
        <div v-if="formError" class="rounded-xl bg-rose-50 border border-rose-200 p-3 text-rose-700 flex items-start gap-2">
          <AlertCircle class="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div>{{ formError }}</div>
        </div>

        <!-- Connection Test Result Banner -->
        <div
          v-if="testResult"
          class="rounded-xl p-3 border flex items-start gap-2"
          :class="testResult.connected ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-700'"
        >
          <CheckCircle2 v-if="testResult.connected" class="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <AlertCircle v-else class="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div class="flex-1">
            <div class="font-bold">
              {{ testResult.connected ? 'Connection Successful!' : 'Connection Failed' }}
            </div>
            <div class="text-[11px] mt-0.5">
              <span v-if="testResult.connected">
                Server Version: <code class="font-mono">{{ testResult.version }}</code> • Latency: {{ testResult.latencyMs }}ms
              </span>
              <span v-else>{{ testResult.error }}</span>
            </div>
          </div>
        </div>

        <!-- Connection Label Name -->
        <div>
          <label class="block font-semibold text-neutral-700 mb-1">
            Connection Name <span class="text-[#144e35]">*</span>
          </label>
          <input
            v-model="form.name"
            type="text"
            required
            placeholder="e.g. My TiDB Cluster, Prod TiDB"
            class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-neutral-900 placeholder-neutral-400 focus:bg-white focus:border-[#144e35] outline-none"
          />
        </div>

        <!-- Host and Port Grid -->
        <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div class="sm:col-span-3">
            <label class="block font-semibold text-neutral-700 mb-1">
              TiDB Host <span class="text-[#144e35]">*</span>
            </label>
            <input
              v-model="form.host"
              type="text"
              required
              placeholder="e.g. gateway01.us-west-2.prod.aws.tidbcloud.com"
              class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-neutral-900 font-mono text-[11px] placeholder-neutral-400 focus:bg-white focus:border-[#144e35] outline-none"
            />
          </div>

          <div>
            <label class="block font-semibold text-neutral-700 mb-1">Port</label>
            <input
              v-model.number="form.port"
              type="number"
              required
              placeholder="4000"
              class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-neutral-900 font-mono text-[11px] focus:bg-white focus:border-[#144e35] outline-none"
            />
          </div>
        </div>

        <!-- TiDB Username & Password -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block font-semibold text-neutral-700 mb-1">
              TiDB User <span class="text-[#144e35]">*</span>
            </label>
            <input
              v-model="form.username"
              type="text"
              required
              placeholder="e.g. xxxxxx.root"
              class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-neutral-900 font-mono text-[11px] focus:bg-white focus:border-[#144e35] outline-none"
            />
          </div>

          <div>
            <label class="block font-semibold text-neutral-700 mb-1">
              TiDB Password <span v-if="!isEditing" class="text-[#144e35]">*</span>
              <span v-else class="text-neutral-400 font-normal">(Leave blank to keep current)</span>
            </label>
            <div class="relative">
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                :required="!isEditing"
                placeholder="••••••••••••"
                class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 pr-9 text-neutral-900 font-mono text-[11px] focus:bg-white focus:border-[#144e35] outline-none"
              />
              <button
                type="button"
                class="absolute right-2.5 top-2 text-neutral-400 hover:text-neutral-700"
                @click="showPassword = !showPassword"
              >
                <Eye v-if="!showPassword" class="w-3.5 h-3.5" />
                <EyeOff v-else class="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <!-- TiDB Database Name -->
        <div>
          <label class="block font-semibold text-neutral-700 mb-1">
            TiDB Database Name <span class="text-[#144e35]">*</span>
          </label>
          <input
            v-model="form.database"
            type="text"
            required
            placeholder="e.g. test or your_database"
            class="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3.5 py-2 text-neutral-900 font-mono text-[11px] focus:bg-white focus:border-[#144e35] outline-none"
          />
        </div>

        <!-- Set as Default Connection checkbox -->
        <div class="flex items-center gap-2 pt-1">
          <input
            id="isDefault"
            v-model="form.isDefault"
            type="checkbox"
            class="rounded text-[#144e35] focus:ring-[#144e35]"
          />
          <label for="isDefault" class="text-neutral-700 font-medium cursor-pointer">
            Set as active default connection for Database Explorer &amp; SQL Editor
          </label>
        </div>

        <!-- Security Note -->
        <div class="rounded-xl bg-neutral-50 border border-neutral-200 p-3 text-[11px] text-neutral-500 flex items-start gap-2">
          <ShieldCheck class="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
          <span>
            Passwords are encrypted with AES-256-GCM before saving. All connections enforce TLS v1.2+ encryption for TiDB Cloud security.
          </span>
        </div>
      </form>

      <!-- Modal Footer -->
      <div class="flex items-center justify-between pt-4 border-t border-neutral-100 shrink-0 gap-3">
        <!-- Test Connection Button -->
        <button
          type="button"
          :disabled="isTesting || !form.host || !form.username || !form.database"
          class="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100 font-semibold text-xs transition-colors disabled:opacity-50"
          @click="handleTest"
        >
          <Loader2 v-if="isTesting" class="w-3.5 h-3.5 animate-spin" />
          <Zap v-else class="w-3.5 h-3.5 text-amber-500" />
          <span>{{ isTesting ? 'Testing Connection...' : 'Test Connection' }}</span>
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="btn-white-pill px-4 py-2 text-xs font-semibold"
            @click="$emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            :disabled="isSubmitting || !form.name || !form.host || !form.username || !form.database"
            class="btn-forest px-5 py-2 text-xs font-semibold flex items-center gap-1.5"
            @click="handleSave"
          >
            <Loader2 v-if="isSubmitting" class="w-3.5 h-3.5 animate-spin" />
            <span>{{ isSubmitting ? 'Saving...' : 'Save &amp; Connect' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Database,
  X,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  Loader2
} from '@lucide/vue'
import type { UserDatabaseConnection } from '~/types'

const props = defineProps<{
  isOpen: boolean
  editConnection?: UserDatabaseConnection | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', conn: UserDatabaseConnection): void
}>()

const { createConnection, updateConnection, testConnection, isTesting, testResult } = useUserDatabases()

const isEditing = computed(() => !!props.editConnection)
const showPassword = ref(false)
const isSubmitting = ref(false)
const formError = ref<string | null>(null)

const form = reactive({
  name: '',
  host: '',
  port: 4000,
  username: '',
  password: '',
  database: '',
  sslCa: '',
  isDefault: true
})

watch(
  () => props.editConnection,
  (val) => {
    if (val) {
      form.name = val.name
      form.host = val.host
      form.port = val.port || 4000
      form.username = val.username
      form.password = ''
      form.database = val.database
      form.sslCa = val.sslCa || ''
      form.isDefault = val.isDefault
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

function resetForm() {
  form.name = 'My TiDB Cloud'
  form.host = ''
  form.port = 4000
  form.username = ''
  form.password = ''
  form.database = 'test'
  form.sslCa = ''
  form.isDefault = true
  formError.value = null
  testResult.value = null
}

const handleTest = async () => {
  formError.value = null
  await testConnection({
    host: form.host.trim(),
    port: form.port || 4000,
    username: form.username.trim(),
    password: form.password,
    database: form.database.trim(),
    sslCa: form.sslCa || undefined,
    connectionId: props.editConnection?.id
  })
}

const handleSave = async () => {
  if (!form.name.trim() || !form.host.trim() || !form.username.trim() || !form.database.trim()) {
    formError.value = 'Please fill in all required fields.'
    return
  }

  isSubmitting.value = true
  formError.value = null

  try {
    if (props.editConnection) {
      const res = await updateConnection(props.editConnection.id, {
        name: form.name.trim(),
        host: form.host.trim(),
        port: form.port,
        username: form.username.trim(),
        password: form.password ? form.password : undefined,
        database: form.database.trim(),
        sslCa: form.sslCa || undefined,
        isDefault: form.isDefault
      })
      if (res.success && res.data) {
        emit('saved', res.data)
        emit('close')
      } else {
        formError.value = res.error || 'Failed to update connection'
      }
    } else {
      const res = await createConnection({
        name: form.name.trim(),
        host: form.host.trim(),
        port: form.port,
        username: form.username.trim(),
        password: form.password,
        database: form.database.trim(),
        sslCa: form.sslCa || undefined,
        isDefault: form.isDefault
      })
      if (res.success && res.data) {
        emit('saved', res.data)
        emit('close')
      } else {
        formError.value = res.error || 'Failed to save connection'
      }
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
