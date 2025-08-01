import { devtools } from 'valtio/utils'
import { log } from '@/utils/logger.js'

class DevToolsManager {
  constructor() {
    this.registeredStores = new Map()
  }

  register(name, store, options = {}) {
    if (this.registeredStores.has(name)) {
      log(`⚠️ DevTools store "${name}" already registered`)
      return
    }

    if (typeof window !== 'undefined') {
      const unsubscribe = devtools(store, {
        name,
        enabled: true,
        trace: true,
        ...options
      })

      this.registeredStores.set(name, {
        store,
        unsubscribe,
        options
      })

      log(`🔧 DevTools registered: ${name}`)
    }
  }

  unregister(name) {
    const registration = this.registeredStores.get(name)
    if (registration) {
      registration.unsubscribe()
      this.registeredStores.delete(name)
      log(`🔌 DevTools unregistered: ${name}`)
    }
  }

  isRegistered(name) {
    return this.registeredStores.has(name)
  }

  list() {
    return Array.from(this.registeredStores.keys())
  }

  clear() {
    for (const [name] of this.registeredStores) {
      this.unregister(name)
    }
  }
}

export const devToolsManager = new DevToolsManager()