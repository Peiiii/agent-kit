// import react from '@vitejs/plugin-react'
import react from '@vitejs/plugin-react-oxc'
import { resolve } from 'path'
import { defineConfig } from 'vite'


export default defineConfig({
  root: './playground',
  plugins: [ react()],
  resolve: {
    alias: {
      '@agent-kit/agent-chat': resolve(__dirname, '../src')
    }
  }
})
