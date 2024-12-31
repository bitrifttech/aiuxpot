import { 
  AIProvider, 
  AIProviderConfig, 
  AIRequestOptions, 
  AIResponse,
  AIError,
  AIProviderStats,
  AIModelInfo
} from '@/types/ai';
import { OllamaProvider } from './providers/ollama';
import { OpenAIProvider } from './providers/openai';
import { AnthropicProvider } from './providers/anthropic';
import { loadEnvConfig, getProviderConfig } from './config';

export class AIProviderManager {
  private providers: Map<string, AIProvider>;
  private stats: Map<string, AIProviderStats>;
  private defaultProvider?: string;

  constructor() {
    this.providers = new Map();
    this.stats = new Map();
  }

  async initialize(): Promise<void> {
    const envConfig = loadEnvConfig();

    // Initialize Ollama provider
    const ollamaConfig = getProviderConfig('ollama', envConfig);
    const ollamaProvider = new OllamaProvider(ollamaConfig);
    this.registerProvider(ollamaProvider);

    // Initialize OpenAI provider if API key is available
    if (envConfig.OPENAI_API_KEY) {
      const openaiConfig = getProviderConfig('openai', envConfig);
      const openaiProvider = new OpenAIProvider(openaiConfig);
      this.registerProvider(openaiProvider);
    }

    // Initialize Anthropic provider if API key is available
    if (envConfig.ANTHROPIC_API_KEY) {
      const anthropicConfig = getProviderConfig('anthropic', envConfig);
      const anthropicProvider = new AnthropicProvider(anthropicConfig);
      this.registerProvider(anthropicProvider);
    }

    // Set default provider from environment or first available
    const defaultId = envConfig.AI_PROVIDER;
    if (defaultId && this.providers.has(defaultId)) {
      this.defaultProvider = defaultId;
    } else {
      this.defaultProvider = Array.from(this.providers.keys())[0];
    }
  }

  registerProvider(provider: AIProvider): void {
    if (this.providers.has(provider.id)) {
      throw new Error(`Provider ${provider.id} already registered`);
    }

    this.providers.set(provider.id, provider);
    this.stats.set(provider.id, this.createInitialStats());

    // Set as default if first provider
    if (!this.defaultProvider) {
      this.defaultProvider = provider.id;
    }
  }

  async getProvider(id?: string): Promise<AIProvider> {
    const providerId = id || this.defaultProvider;
    if (!providerId) {
      throw new Error('No provider specified and no default provider set');
    }

    const provider = this.providers.get(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    const isAvailable = await provider.isAvailable();
    if (!isAvailable) {
      throw new Error(`Provider ${providerId} is not available`);
    }

    return provider;
  }

  setDefaultProvider(id: string): void {
    if (!this.providers.has(id)) {
      throw new Error(`Cannot set default provider: ${id} not found`);
    }
    this.defaultProvider = id;
  }

  async complete(options: AIRequestOptions, providerId?: string): Promise<AIResponse> {
    const provider = await this.getProvider(providerId);
    
    try {
      const startTime = Date.now();
      const response = await provider.complete(options);
      this.updateStats(provider.id, startTime, response);
      return response;
    } catch (error) {
      this.updateErrorStats(provider.id);
      throw error;
    }
  }

  async getAvailableProviders(): Promise<AIProvider[]> {
    const available: AIProvider[] = [];
    
    for (const provider of this.providers.values()) {
      if (await provider.isAvailable()) {
        available.push(provider);
      }
    }

    return available;
  }

  getProviderStats(providerId: string): AIProviderStats | undefined {
    return this.stats.get(providerId);
  }

  getAllStats(): Map<string, AIProviderStats> {
    return new Map(this.stats);
  }

  private createInitialStats(): AIProviderStats {
    return {
      requestCount: 0,
      errorCount: 0,
      tokenUsage: {
        prompt: 0,
        completion: 0,
        total: 0,
      },
      averageLatency: 0,
    };
  }

  private updateStats(
    providerId: string, 
    startTime: number, 
    response: AIResponse
  ): void {
    const stats = this.stats.get(providerId);
    if (!stats) return;

    const latency = Date.now() - startTime;
    const newAvgLatency = 
      (stats.averageLatency * stats.requestCount + latency) / 
      (stats.requestCount + 1);

    stats.requestCount += 1;
    stats.tokenUsage.prompt += response.usage.promptTokens;
    stats.tokenUsage.completion += response.usage.completionTokens;
    stats.tokenUsage.total += response.usage.totalTokens;
    stats.averageLatency = newAvgLatency;
  }

  private updateErrorStats(providerId: string): void {
    const stats = this.stats.get(providerId);
    if (!stats) return;

    stats.errorCount += 1;
  }
}
