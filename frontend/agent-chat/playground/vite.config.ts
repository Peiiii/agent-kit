import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  root: './playground',
  plugins: [react()],
  resolve: {
    alias: {
      '@agent-labs/agent-chat': resolve(__dirname, '../src'),
      '@': resolve(__dirname, './src'),
    },
  },
})
