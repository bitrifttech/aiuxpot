import OpenAI from 'openai';
import { BaseAIProvider } from '../base-provider';
import { 
  AIProviderConfig, 
  AIRequestOptions, 
  AIResponse,
  AIStreamResponse
} from '@/types/ai';

export class OpenAIProvider extends BaseAIProvider {
  private client: OpenAI;
  private modelContextLimits: Record<string, number> = {
    'gpt-4': 8192,
    'gpt-4-32k': 32768,
    'gpt-3.5-turbo': 4096,
    'gpt-3.5-turbo-16k': 16384,
  };

  constructor(config: AIProviderConfig) {
    super(config);
    if (!config.apiKey) {
      throw this.createError('OpenAI API key not provided', 'INVALID_CONFIG');
    }

    this.client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
      organization: config.organizationId,
      timeout: config.timeoutMs,
    });
  }

  get id(): string {
    return 'openai';
  }

  get name(): string {
    return 'OpenAI';
  }

  get type(): 'local' | 'remote' {
    return 'remote';
  }

  get supportedModels(): string[] {
    return Object.keys(this.modelContextLimits);
  }

  get maxTokens(): number {
    return Math.max(...Object.values(this.modelContextLimits));
  }

  get streaming(): boolean {
    return true;
  }

  async validateConfig(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }

  async complete(options: AIRequestOptions): Promise<AIResponse> {
    this.validateRequestOptions(options);

    try {
      const completion = await this.client.chat.completions.create({
        model: options.model,
        messages: [{ role: 'user', content: options.prompt }],
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: false,
      });

      const response = completion.choices[0];

      return {
        content: response.message.content || '',
        usage: {
          promptTokens: completion.usage?.prompt_tokens || 0,
          completionTokens: completion.usage?.completion_tokens || 0,
          totalTokens: completion.usage?.total_tokens || 0,
        },
        model: completion.model,
        provider: this.id,
      };
    } catch (error) {
      throw this.handleOpenAIError(error);
    }
  }

  async *stream(options: AIRequestOptions): AsyncGenerator<AIStreamResponse> {
    this.validateRequestOptions(options);

    try {
      const stream = await this.client.chat.completions.create({
        model: options.model,
        messages: [{ role: 'user', content: options.prompt }],
        temperature: options.temperature,
        max_tokens: options.maxTokens,
        stream: true,
      });

      let content = '';
      let promptTokens = 0;
      let completionTokens = 0;

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta?.content || '';
        content += delta;

        // Approximate token counting
        promptTokens = Math.ceil(options.prompt.length / 4);
        completionTokens = Math.ceil(content.length / 4);

        yield {
          content,
          chunk: delta,
          isComplete: chunk.choices[0]?.finish_reason !== null,
          usage: {
            promptTokens,
            completionTokens,
            totalTokens: promptTokens + completionTokens,
          },
          model: chunk.model,
          provider: this.id,
        };
      }
    } catch (error) {
      throw this.handleOpenAIError(error);
    }
  }

  private handleOpenAIError(error: any): Error {
    if (error instanceof OpenAI.APIError) {
      switch (error.code) {
        case 'invalid_api_key':
          return this.createError(
            'Invalid API key. Please check your OpenAI API key.',
            'INVALID_API_KEY'
          );
        case 'model_not_found':
          return this.createError(
            'Model not found. Please check if the model is available.',
            'MODEL_NOT_FOUND'
          );
        case 'rate_limit_exceeded':
          return this.createError(
            'Rate limit exceeded. Please try again later.',
            'RATE_LIMIT',
            true
          );
        case 'insufficient_quota':
          return this.createError(
            'Insufficient quota. Please check your OpenAI account.',
            'INSUFFICIENT_QUOTA'
          );
        default:
          return this.createError(
            error.message || 'Unknown OpenAI error',
            'PROVIDER_ERROR',
            true
          );
      }
    }

    return this.createError(
      'Unknown error occurred',
      'UNKNOWN_ERROR',
      true
    );
  }
}
