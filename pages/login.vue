<template>
  <div class="rounded-2xl border border-slate-800/80 bg-[#0f172a]/80 p-8 backdrop-blur-xl shadow-2xl shadow-black/80">
    <!-- Brand Title -->
    <div class="text-center mb-8">
      <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 shadow-lg shadow-cyan-500/20 mb-4">
        <Database class="h-6 w-6 text-white" />
      </div>
      <h1 class="text-2xl font-bold tracking-tight text-white">
        Kyo<span class="text-cyan-400">DB</span>
      </h1>
      <p class="text-xs text-slate-400 mt-1 font-mono">
        One Dashboard. All Your Data.
      </p>
    </div>

    <!-- Alert Banner -->
    <div
      v-if="errorMessage"
      class="mb-6 rounded-lg bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-300 flex items-start gap-2.5"
    >
      <AlertCircle class="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
      <div>{{ errorMessage }}</div>
    </div>

    <div
      v-if="successMessage"
      class="mb-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3.5 text-xs text-emerald-300 flex items-start gap-2.5"
    >
      <CheckCircle2 class="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
      <div>{{ successMessage }}</div>
    </div>

    <!-- Mode Selector if Bootstrap Needed -->
    <div v-if="auth.requiresBootstrap.value" class="mb-6 rounded-lg bg-indigo-500/10 border border-indigo-500/30 p-3 text-xs text-indigo-300">
      <div class="font-semibold text-white mb-1">First Time Setup Detected</div>
      <div>No administrator is registered yet. Create your master administrator account below.</div>
    </div>

    <!-- Standard Login Form -->
    <form v-if="!auth.requiresBootstrap.value" @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="block text-xs font-medium text-slate-300 mb-1.5">Username or Email</label>
        <div class="relative">
          <input
            v-model="identifier"
            type="text"
            required
            autocomplete="username"
            placeholder="admin@kyodb.local"
            class="w-full rounded-lg bg-slate-900/90 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
          />
        </div>
      </div>

      <div>
        <label class="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            autocomplete="current-password"
            placeholder="••••••••••••"
            class="w-full rounded-lg bg-slate-900/90 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors pr-10"
          />
          <button
            type="button"
            class="absolute right-3 top-2.5 text-slate-400 hover:text-white"
            @click="showPassword = !showPassword"
          >
            <Eye v-if="!showPassword" class="h-4 w-4" />
            <EyeOff v-else class="h-4 w-4" />
          </button>
        </div>
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-indigo-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
        <span>{{ isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard' }}</span>
      </button>
    </form>

    <!-- Bootstrap Form -->
    <form v-else @submit.prevent="handleBootstrap" class="space-y-4">
      <div>
        <label class="block text-xs font-medium text-slate-300 mb-1.5">Admin Username</label>
        <input
          v-model="bootstrapUsername"
          type="text"
          required
          placeholder="admin"
          class="w-full rounded-lg bg-slate-900/90 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
        />
      </div>

      <div>
        <label class="block text-xs font-medium text-slate-300 mb-1.5">Admin Email</label>
        <input
          v-model="bootstrapEmail"
          type="email"
          required
          placeholder="admin@kyodb.local"
          class="w-full rounded-lg bg-slate-900/90 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
        />
      </div>

      <div>
        <label class="block text-xs font-medium text-slate-300 mb-1.5">Master Password (min 8 chars)</label>
        <input
          v-model="bootstrapPassword"
          type="password"
          required
          minlength="8"
          placeholder="••••••••••••"
          class="w-full rounded-lg bg-slate-900/90 border border-slate-700/80 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-colors"
        />
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500 focus:outline-none disabled:opacity-50 transition-all"
      >
        <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
        <span>Initialize Administrator</span>
      </button>
    </form>

    <!-- Footer Security Notice -->
    <div class="mt-8 pt-4 border-t border-slate-800/80 text-center">
      <p class="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
        <ShieldCheck class="h-3.5 w-3.5 text-blue-400" />
        <span>Argon2id Session Security • Strict Rate Limiting</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Database, AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck } from '@lucide/vue'

definePageMeta({
  layout: 'auth'
})

const auth = useAuth()
const route = useRoute()

const identifier = ref('')
const password = ref('')
const showPassword = ref(false)

const bootstrapUsername = ref('admin')
const bootstrapEmail = ref('admin@kyodb.local')
const bootstrapPassword = ref('Admin@KyoDB2026!')

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

onMounted(async () => {
  await auth.fetchUser()
  if (auth.isAuthenticated.value) {
    await navigateTo('/')
  }
})

const handleLogin = async () => {
  errorMessage.value = null
  successMessage.value = null
  isSubmitting.value = true

  try {
    const res = await auth.login(identifier.value, password.value)
    if (res.success) {
      const redirectPath = (route.query.redirect as string) || '/'
      if (typeof window !== 'undefined') {
        window.location.href = redirectPath
      } else {
        await navigateTo(redirectPath)
      }
    } else {
      errorMessage.value = res.error || 'Invalid credentials'
    }
  } finally {
    isSubmitting.value = false
  }
}

const handleBootstrap = async () => {
  errorMessage.value = null
  successMessage.value = null
  isSubmitting.value = true

  try {
    const res = await auth.bootstrap({
      username: bootstrapUsername.value,
      email: bootstrapEmail.value,
      password: bootstrapPassword.value
    })

    if (res.success) {
      successMessage.value = 'Master administrator created! Please sign in with your credentials.'
      identifier.value = bootstrapUsername.value
      password.value = bootstrapPassword.value
    } else {
      errorMessage.value = res.error || 'Failed to initialize administrator'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
