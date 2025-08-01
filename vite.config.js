import { resolve } from 'node:path'
import { defineConfig } from 'vite'

import viteReact from '@vitejs/plugin-react-oxc'
import viteFastifyReact from '@fastify/react/plugin'
import tailwindcss from '@tailwindcss/vite'
import Inspect from 'vite-plugin-inspect'

export default defineConfig({
  root: resolve(import.meta.dirname, 'client'),

  plugins: [
    viteReact(),
    viteFastifyReact(),
    tailwindcss(),
    Inspect()
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'client')
    }
  },
  worker: {
    format: 'es',
    plugins: () => [viteReact()]
  },
  build: {
    outDir: resolve(import.meta.dirname, 'dist'),
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.includes('Worker')) {
            return 'assets/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
        advancedChunks: {
          groups: [{ name: 'vendor', test: /\/react(?:-dom)?/ }]
        }
      }
    }
  },
  ssr: {
    external: [
      'use-sync-external-store'
    ]
  },
  experimental: {
    enableNativePlugin: false
  }
})