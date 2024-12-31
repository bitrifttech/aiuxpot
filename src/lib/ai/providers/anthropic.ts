import Anthropic from '@anthropic-ai/sdk';
import { BaseAIProvider } from '../base-provider';
import { AIProviderConfig, AIRequestOptions, AIResponse, AIError } from '@/types/ai';

export class AnthropicProvider extends BaseAIProvider {
  private client: Anthropic;
  private defaultModel = 'claude-2';

  constructor(config: AIProviderConfig) {
    super({
      id: 'anthropic',
      name: 'Anthropic',
      type: 'cloud',
      models: ['claude-2', 'claude-instant-1'],
      ...config,
    });

    if (!config.apiKey) {
      throw new Error('Anthropic API key is required');
    }

    this.client = new Anthropic({
      apiKey: config.apiKey,
    });
  }

  async complete(options: AIRequestOptions): Promise<AIResponse> {
    const startTime = Date.now();

    try {
      this.validateRequest(options);
      const model = options.model || this.defaultModel;

      // Create message with streaming
      const message = await this.client.messages.create({
        model,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7,
        messages: [
          {
            role: 'user',
            content: options.prompt,
          },
        ],
        stream: options.stream,
      });

      if (options.stream && message.stream) {
        // Handle streaming response
        let content = '';
        let totalTokens = 0;

        for await (const chunk of message.stream) {
          content += chunk.delta?.text || '';
          totalTokens += chunk.usage?.output_tokens || 0;

          if (options.onProgress) {
            options.onProgress({
              content,
              tokens: {
                total: totalTokens,
                prompt: chunk.usage?.input_tokens || 0,
                completion: chunk.usage?.output_tokens || 0,
              },
            });
          }
        }

        return {
          content,
          tokens: {
            total: totalTokens,
            prompt: message.usage?.input_tokens || 0,
            completion: message.usage?.output_tokens || 0,
          },
          model,
          provider: this.id,
          latencyMs: Date.now() - startTime,
        };
      } else {
        // Handle non-streaming response
        return {
          content: message.content,
          tokens: {
            total: message.usage?.total_tokens || 0,
            prompt: message.usage?.input_tokens || 0,
            completion: message.usage?.output_tokens || 0,
          },
          model,
          provider: this.id,
          latencyMs: Date.now() - startTime,
        };
      }
    } catch (error) {
      // Handle Anthropic API errors
      const apiError = error as any;
      let errorMessage = 'Unknown error occurred';
      let errorType = 'unknown';
      let statusCode = 500;

      if (apiError.status) {
        statusCode = apiError.status;
        errorType = this.getErrorType(statusCode);
        errorMessage = apiError.message || errorMessage;
      }

      const aiError: AIError = {
        message: errorMessage,
        type: errorType,
        statusCode,
        provider: this.id,
        raw: apiError,
      };

      this.emitError(aiError);
      throw aiError;
    }
  }

  private getErrorType(statusCode: number): string {
    switch (statusCode) {
      case 401:
        return 'authentication';
      case 429:
        return 'rate_limit';
      case 400:
        return 'invalid_request';
      case 500:
        return 'server_error';
      default:
        return 'unknown';
    }
  }

  private validateRequest(options: AIRequestOptions): void {
    if (!options.prompt) {
      throw new Error('Prompt is required');
    }

    if (options.model && !this.config.models.includes(options.model)) {
      throw new Error(`Model ${options.model} is not supported by Anthropic`);
    }

    if (options.maxTokens && (options.maxTokens < 1 || options.maxTokens > 100000)) {
      throw new Error('maxTokens must be between 1 and 100000');
    }

    if (options.temperature && (options.temperature < 0 || options.temperature > 1)) {
      throw new Error('temperature must be between 0 and 1');
    }
  }
}
