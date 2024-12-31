import { 
  AIProvider, 
  AIProviderConfig, 
  AIRequestOptions, 
  AIResponse, 
  AIError,
  AIEvent,
  AIStreamResponse
} from '@/types/ai';

export abstract class BaseAIProvider implements AIProvider {
  protected config: AIProviderConfig;
  protected eventHandlers: Map<string, (event: AIEvent) => void>;

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.eventHandlers = new Map();
  }

  abstract get id(): string;
  abstract get name(): string;
  abstract get type(): 'local' | 'remote';
  abstract get supportedModels(): string[];
  abstract get maxTokens(): number;
  abstract get streaming(): boolean;

  abstract complete(options: AIRequestOptions): Promise<AIResponse>;
  abstract stream(options: AIRequestOptions): AsyncGenerator<AIStreamResponse>;
  
  async isAvailable(): Promise<boolean> {
    try {
      return await this.validateConfig();
    } catch {
      return false;
    }
  }

  abstract validateConfig(): Promise<boolean>;

  protected createError(message: string, code: string, retryable = false): AIError {
    return {
      name: 'AIError',
      message,
      code,
      provider: this.id,
      retryable,
    };
  }

  protected async emitEvent(event: AIEvent): Promise<void> {
    this.eventHandlers.forEach(handler => handler(event));
  }

  on(eventId: string, handler: (event: AIEvent) => void): void {
    this.eventHandlers.set(eventId, handler);
  }

  off(eventId: string): void {
    this.eventHandlers.delete(eventId);
  }

  protected validateRequestOptions(options: AIRequestOptions): void {
    if (!options.model) {
      throw this.createError('Model not specified', 'INVALID_MODEL');
    }

    if (!this.supportedModels.includes(options.model)) {
      throw this.createError(
        `Model ${options.model} not supported by provider ${this.name}`,
        'UNSUPPORTED_MODEL'
      );
    }

    if (options.maxTokens && options.maxTokens > this.maxTokens) {
      throw this.createError(
        `Max tokens ${options.maxTokens} exceeds provider limit ${this.maxTokens}`,
        'TOKEN_LIMIT_EXCEEDED'
      );
    }
  }

  protected async handleResponse<T extends AIResponse>(
    promise: Promise<T>,
    options: AIRequestOptions
  ): Promise<T> {
    try {
      await this.emitEvent({
        type: 'start',
        timestamp: Date.now(),
      });

      const response = await promise;

      await this.emitEvent({
        type: 'complete',
        timestamp: Date.now(),
        data: response,
      });

      return response;
    } catch (error) {
      const aiError = error instanceof Error
        ? this.createError(error.message, 'PROVIDER_ERROR')
        : this.createError('Unknown error', 'UNKNOWN_ERROR');

      await this.emitEvent({
        type: 'error',
        timestamp: Date.now(),
        data: aiError,
      });

      throw aiError;
    }
  }
}
