import { defineConfig } from 'tsdown'

export default defineConfig([
  {
    entry: ['src/index.ts'],
    dts: true,
    clean: true,
    format: ['esm'],
    minify: false,
    sourcemap: true,
  },
])
