import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'
import { dependencies } from "./package.json"

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    react(),
    // tailwindcss(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      outDir: 'dist/types',
      rollupTypes: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AgentChat',
      cssFileName: 'index',
      formats: ['es'],
    },
    rollupOptions: {
      external: (id, parentId, isResolved) => {
        console.log("[external] [id]", id)
        console.log("[external] [parentId]", parentId)
        console.log("[external] [isResolved]", isResolved)
        if(isResolved && id.includes('node_modules')) {
          return true
        }
        return [/node_modules/, 'react', 'react-dom', ...Object.keys(dependencies)].some(pattern => {
          if (typeof pattern === 'string') {
            return id.includes(pattern)
          }
          return pattern.test(id)
        })
      },
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
    },
    sourcemap: true,
    minify: true,
  },
})
