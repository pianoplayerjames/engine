import { resolve } from 'node:path'

import viteReact from '@vitejs/plugin-react'
import viteFastifyReact from '@fastify/react/plugin'
import tailwindcss from '@tailwindcss/vite'

export default {
  root: resolve(import.meta.dirname, 'client'),
  plugins: [
    viteReact(),
    viteFastifyReact(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, 'client')
    }
  },
  ssr: {
    external: [
      'use-sync-external-store'
    ]
  },
}
