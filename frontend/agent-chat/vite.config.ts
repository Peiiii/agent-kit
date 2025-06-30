import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import dts from 'vite-plugin-dts'
import { dependencies, peerDependencies } from "./package.json"

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
        // 自动检测所有外部依赖
        const allDependencies = {
          ...dependencies,
          ...peerDependencies,
        }
        
        // 检查是否是 node_modules 中的包
        if (id.includes('node_modules')) {
          return true
        }
        
        // 检查是否是内置模块
        if (id.startsWith('node:')) {
          return true
        }
        
        // 检查是否匹配已知的外部依赖
        const dependencyNames = Object.keys(allDependencies)
        return dependencyNames.some(depName => {
          // 精确匹配包名
          if (id === depName) return true
          // 匹配包名开头的子模块
          if (id.startsWith(depName + '/')) return true
          // 匹配 React 相关
          if (depName === 'react' && (id.startsWith('react/') || id === 'react')) return true
          if (depName === 'react-dom' && (id.startsWith('react-dom/') || id === 'react-dom')) return true
          return false
        })
      },
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@ag-ui/client': 'AgUiClient',
          '@ag-ui/core': 'AgUiCore',
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
