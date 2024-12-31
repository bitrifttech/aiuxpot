/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OLLAMA_HOST: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly VITE_ANTHROPIC_API_KEY?: string
  readonly VITE_AI_PROVIDER?: 'ollama' | 'openai' | 'anthropic'
  readonly VITE_MAX_CONCURRENT_REQUESTS?: string
  readonly VITE_REQUEST_TIMEOUT_MS?: string
  readonly VITE_API_RATE_LIMIT?: string
  readonly VITE_API_TIMEOUT?: string
  readonly VITE_DEV_SERVER_PORT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
