import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  root: './playground',
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@agent-labs/agent-chat': resolve(__dirname, '../src'),
      '@': resolve(__dirname, './src'),
    },
  },
})
