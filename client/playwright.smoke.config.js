import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './smoke',
  testMatch: '**/*.spec.js',
  fullyParallel: true,
  reporter: 'list',
  timeout: 60_000,
  use: {
    baseURL: 'http://127.0.0.1:5174',
    browserName: 'chromium',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5174 --strictPort',
    url: 'http://127.0.0.1:5174',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_API_URL: 'http://127.0.0.1:4001',
      VITE_CLIENT_URL: 'http://127.0.0.1:5174',
      VITE_SUPABASE_URL: 'https://smoke.supabase.co',
      VITE_SUPABASE_ANON_KEY: 'smoke-anon-key',
    },
  },
})