<template>
  <div class="donezo-card p-8 sm:p-10 shadow-lg border border-neutral-200">
    <!-- Brand Title & Official Logo -->
    <div class="text-center mb-8">
      <NuxtLink to="/" class="inline-block mb-3">
        <img
          src="/images/logo.webp"
          alt="KyoDB"
          class="h-12 w-auto mx-auto object-contain transition-transform hover:scale-105"
        />
      </NuxtLink>
      <p class="text-xs text-neutral-400">
        Unified management for TiDB Cloud &amp; Cloudflare R2
      </p>
    </div>

    <!-- Alert Banner -->
    <div
      v-if="errorMessage"
      class="mb-6 rounded-xl bg-rose-50 border border-rose-200 p-3.5 text-xs text-rose-700 flex items-start gap-2.5"
    >
      <AlertCircle class="h-4 w-4 shrink-0 mt-0.5 text-rose-500" />
      <div>{{ errorMessage }}</div>
    </div>

    <div
      v-if="successMessage"
      class="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-3.5 text-xs text-emerald-700 flex items-start gap-2.5"
    >
      <CheckCircle2 class="h-4 w-4 shrink-0 mt-0.5 text-emerald-500" />
      <div>{{ successMessage }}</div>
    </div>

    <!-- Mode Selector if Bootstrap Needed -->
    <div v-if="auth.requiresBootstrap.value" class="mb-6 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs text-emerald-800">
      <div class="font-bold mb-1">First Time Setup Detected</div>
      <div>No administrator registered yet. Create your master administrator account below.</div>
    </div>

    <!-- Standard Login Form -->
    <form v-if="!auth.requiresBootstrap.value" @submit.prevent="handleLogin" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Username or Email</label>
        <input
          v-model="identifier"
          type="text"
          required
          autocomplete="username"
          placeholder="admin@kyodb.local"
          class="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-[#144e35] focus:bg-white focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Password</label>
        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            autocomplete="current-password"
            placeholder="••••••••••••"
            class="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-[#144e35] focus:bg-white focus:outline-none transition-colors pr-10"
          />
          <button
            type="button"
            class="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700"
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
        class="w-full mt-2 btn-forest py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
      >
        <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
        <span>{{ isSubmitting ? 'Authenticating...' : 'Sign In to Dashboard' }}</span>
      </button>
    </form>

    <!-- Bootstrap Form -->
    <form v-else @submit.prevent="handleBootstrap" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Admin Username</label>
        <input
          v-model="bootstrapUsername"
          type="text"
          required
          placeholder="admin"
          class="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-2.5 text-xs text-neutral-900 focus:border-[#144e35] focus:bg-white focus:outline-none"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Admin Email</label>
        <input
          v-model="bootstrapEmail"
          type="email"
          required
          placeholder="admin@kyodb.local"
          class="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-2.5 text-xs text-neutral-900 focus:border-[#144e35] focus:bg-white focus:outline-none"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Master Password (min 8 chars)</label>
        <input
          v-model="bootstrapPassword"
          type="password"
          required
          minlength="8"
          placeholder="••••••••••••"
          class="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-2.5 text-xs text-neutral-900 focus:border-[#144e35] focus:bg-white focus:outline-none"
        />
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full mt-2 btn-forest py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
      >
        <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
        <span>Initialize Administrator</span>
      </button>
    </form>

    <!-- Footer Notice -->
    <div class="mt-8 pt-4 border-t border-neutral-100 text-center">
      <p class="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
        <ShieldCheck class="h-3.5 w-3.5 text-emerald-600" />
        <span>Argon2id Session Security • Strict Rate Limiting</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck } from '@lucide/vue'

definePageMeta({ layout: 'auth' })

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
    await navigateTo('/dashboard')
  }
})

const handleLogin = async () => {
  errorMessage.value = null
  successMessage.value = null
  isSubmitting.value = true

  try {
    const res = await auth.login(identifier.value, password.value)
    if (res.success) {
      const redirectPath = (route.query.redirect as string) || '/dashboard'
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
