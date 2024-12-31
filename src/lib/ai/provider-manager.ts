import { 
  AIProvider, 
  AIProviderConfig, 
  AIRequestOptions, 
  AIResponse,
  AIError,
  AIProviderStats,
  AIModelInfo
} from '@/types/ai';

export class AIProviderManager {
  private providers: Map<string, AIProvider>;
  private stats: Map<string, AIProviderStats>;
  private defaultProvider?: string;

  constructor() {
    this.providers = new Map();
    this.stats = new Map();
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
