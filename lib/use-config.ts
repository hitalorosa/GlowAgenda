'use client'
// Hook para ler e salvar configurações do estúdio no localStorage.
// Enquanto o Supabase não estiver conectado, mudanças ficam salvas
// apenas neste dispositivo/navegador.

import { useState, useEffect } from 'react'
import { DEFAULT_CONFIG, SiteConfig } from './site-config'

const STORAGE_KEY = 'glowagenda_config_v1'

function load(): SiteConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CONFIG
    const parsed = JSON.parse(raw) as Partial<SiteConfig>
    return {
      services: parsed.services ?? DEFAULT_CONFIG.services,
      footer: { ...DEFAULT_CONFIG.footer, ...(parsed.footer ?? {}) },
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function persistConfig(config: SiteConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  }
}

export function useStudioConfig() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_CONFIG)

  useEffect(() => {
    setConfig(load())
  }, [])

  const update = (next: SiteConfig) => {
    persistConfig(next)
    setConfig(next)
  }

  return { config, update }
}
