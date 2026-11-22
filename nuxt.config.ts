// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  modules: ['@nuxt/ui'],
  icon: {
    serverBundle: false
  },
  future: {
    compatibilityVersion: 3
  },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Private keys only available on server
    tidbHost: process.env.TIDB_HOST || '',
    tidbPort: parseInt(process.env.TIDB_PORT || '4000', 10),
    tidbUser: process.env.TIDB_USER || '',
    tidbPassword: process.env.TIDB_PASSWORD || '',
    tidbDatabase: process.env.TIDB_DATABASE || 'kyodb_system',
    tidbSslCa: process.env.TIDB_SSL_CA || '',

    r2AccountId: process.env.R2_ACCOUNT_ID || '',
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    r2BucketName: process.env.R2_BUCKET_NAME || '',
    r2Endpoint: process.env.R2_ENDPOINT || '',

    sessionSecret: process.env.SESSION_SECRET || 'kyodb-secure-session-secret-at-least-32-chars-long-2026',
    adminBootstrapEmail: process.env.ADMIN_BOOTSTRAP_EMAIL || 'admin@kyodb.local',
    adminBootstrapPassword: process.env.ADMIN_BOOTSTRAP_PASSWORD || 'Admin@KyoDB2026!',

    public: {
      appName: process.env.NUXT_PUBLIC_APP_NAME || 'KyoDB',
      appUrl: process.env.NUXT_PUBLIC_APP_URL || 'http://localhost:3000'
    }
  }
})
