<template>
  <div class="donezo-card p-8 sm:p-10 shadow-lg border border-neutral-200">
    <!-- Brand Title & Official Logo -->
    <div class="text-center mb-8">
      <NuxtLink to="/" class="inline-block mb-3">
        <KyoLogo variant="light" size="lg" />
      </NuxtLink>
      <h2 class="text-lg font-bold text-neutral-900">Create Public Account</h2>
      <p class="text-xs text-neutral-400 mt-0.5">
        Manage your own TiDB Cloud database directly from KyoDB
      </p>
    </div>

    <!-- Alert Banners -->
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

    <!-- Registration Form -->
    <form @submit.prevent="handleRegister" class="space-y-4">
      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Username</label>
        <input
          v-model="username"
          type="text"
          required
          autocomplete="username"
          placeholder="e.g. johndoe"
          class="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-[#144e35] focus:bg-white focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Email Address</label>
        <input
          v-model="email"
          type="email"
          required
          autocomplete="email"
          placeholder="john@example.com"
          class="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-[#144e35] focus:bg-white focus:outline-none transition-colors"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Password (min 8 chars)</label>
        <div class="relative">
          <input
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            required
            minlength="8"
            autocomplete="new-password"
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

      <div>
        <label class="block text-xs font-semibold text-neutral-700 mb-1.5">Confirm Password</label>
        <input
          v-model="confirmPassword"
          :type="showPassword ? 'text' : 'password'"
          required
          minlength="8"
          autocomplete="new-password"
          placeholder="••••••••••••"
          class="w-full rounded-xl bg-neutral-50 border border-neutral-200 px-4 py-2.5 text-xs text-neutral-900 placeholder-neutral-400 focus:border-[#144e35] focus:bg-white focus:outline-none transition-colors"
        />
      </div>

      <button
        type="submit"
        :disabled="isSubmitting"
        class="w-full mt-2 btn-forest py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
      >
        <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin" />
        <span>{{ isSubmitting ? 'Creating Account...' : 'Register &amp; Get Started' }}</span>
      </button>
    </form>

    <!-- Switch to Login -->
    <div class="mt-6 text-center text-xs text-neutral-500">
      Already have an account?
      <NuxtLink to="/login" class="font-semibold text-[#144e35] hover:underline ml-1">
        Sign in here
      </NuxtLink>
    </div>

    <!-- Footer Notice -->
    <div class="mt-8 pt-4 border-t border-neutral-100 text-center">
      <p class="text-[11px] text-neutral-400 flex items-center justify-center gap-1.5">
        <ShieldCheck class="h-3.5 w-3.5 text-emerald-600" />
        <span>Argon2id Session Security • Multi-tenant TiDB Storage</span>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlertCircle, CheckCircle2, Eye, EyeOff, Loader2, ShieldCheck } from '@lucide/vue'

definePageMeta({ layout: 'auth' })

const auth = useAuth()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

onMounted(async () => {
  await auth.fetchUser()
  if (auth.isAuthenticated.value) {
    await navigateTo(auth.user.value?.role === 'admin' ? '/dashboard' : '/app')
  }
})

const handleRegister = async () => {
  errorMessage.value = null
  successMessage.value = null

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match.'
    return
  }

  isSubmitting.value = true

  try {
    const res = await auth.register({
      username: username.value.trim(),
      email: email.value.trim(),
      password: password.value
    })

    if (res.success) {
      successMessage.value = 'Account created! Opening TiDB setup…'
      setTimeout(async () => {
        // Direct new public users to workspace with connect modal auto-opened
        await navigateTo('/app?connect=1')
      }, 600)
    } else {
      errorMessage.value = res.error || 'Registration failed'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>
