import { resolve } from 'node:path'

import viteReact from '@vitejs/plugin-react'
import viteFastifyReact from '@fastify/react/plugin'
import tailwindcss from '@tailwindcss/vite'
import Inspect from 'vite-plugin-inspect'

export default {
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
          // Keep worker files in assets directory
          if (assetInfo.name && assetInfo.name.includes('Worker')) {
            return 'assets/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  ssr: {
    external: [
      'use-sync-external-store'
    ]
  },
}