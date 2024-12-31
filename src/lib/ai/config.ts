import { z } from 'zod';
import { AIProviderConfig } from '@/types/ai';

// Schema for environment variables
export const envSchema = z.object({
  OLLAMA_HOST: z.string().default('http://localhost:11434'),
  OPENAI_API_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  AI_PROVIDER: z.enum(['ollama', 'openai', 'anthropic']).default('ollama'),
  MAX_CONCURRENT_REQUESTS: z.number().min(1).default(5),
  REQUEST_TIMEOUT_MS: z.number().min(1000).default(30000),
});

// Type for validated environment variables
export type EnvConfig = z.infer<typeof envSchema>;

// Default provider configurations
export const defaultConfigs: Record<string, Partial<AIProviderConfig>> = {
  ollama: {
    baseUrl: 'http://localhost:11434',
    maxConcurrentRequests: 5,
    timeoutMs: 30000,
    models: ['llama2', 'codellama', 'mistral'],
  },
  openai: {
    baseUrl: 'https://api.openai.com/v1',
    maxConcurrentRequests: 5,
    timeoutMs: 30000,
    models: ['gpt-4', 'gpt-3.5-turbo'],
  },
  anthropic: {
    baseUrl: 'https://api.anthropic.com',
    maxConcurrentRequests: 5,
    timeoutMs: 30000,
    models: ['claude-2', 'claude-instant-1'],
  },
};

// Load and validate environment variables
export function loadEnvConfig(): EnvConfig {
  try {
    return envSchema.parse({
      OLLAMA_HOST: import.meta.env.VITE_OLLAMA_HOST,
      OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
      ANTHROPIC_API_KEY: import.meta.env.VITE_ANTHROPIC_API_KEY,
      AI_PROVIDER: import.meta.env.VITE_AI_PROVIDER,
      MAX_CONCURRENT_REQUESTS: import.meta.env.VITE_MAX_CONCURRENT_REQUESTS 
        ? parseInt(import.meta.env.VITE_MAX_CONCURRENT_REQUESTS) 
        : undefined,
      REQUEST_TIMEOUT_MS: import.meta.env.VITE_REQUEST_TIMEOUT_MS
        ? parseInt(import.meta.env.VITE_REQUEST_TIMEOUT_MS)
        : undefined,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid environment configuration: ${error.message}`);
    }
    throw error;
  }
}

// Get provider configuration
export function getProviderConfig(
  providerId: string,
  env: EnvConfig
): AIProviderConfig {
  const defaultConfig = defaultConfigs[providerId] || {};
  
  switch (providerId) {
    case 'ollama':
      return {
        ...defaultConfig,
        baseUrl: env.OLLAMA_HOST,
        maxConcurrentRequests: env.MAX_CONCURRENT_REQUESTS,
        timeoutMs: env.REQUEST_TIMEOUT_MS,
      };
    
    case 'openai':
      if (!env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }
      return {
        ...defaultConfig,
        apiKey: env.OPENAI_API_KEY,
        maxConcurrentRequests: env.MAX_CONCURRENT_REQUESTS,
        timeoutMs: env.REQUEST_TIMEOUT_MS,
      };
    
    case 'anthropic':
      if (!env.ANTHROPIC_API_KEY) {
        throw new Error('Anthropic API key not configured');
      }
      return {
        ...defaultConfig,
        apiKey: env.ANTHROPIC_API_KEY,
        maxConcurrentRequests: env.MAX_CONCURRENT_REQUESTS,
        timeoutMs: env.REQUEST_TIMEOUT_MS,
      };
    
    default:
      throw new Error(`Unknown provider: ${providerId}`);
  }
}
