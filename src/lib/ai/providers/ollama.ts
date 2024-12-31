import { BaseAIProvider } from '../base-provider';
import { 
  AIProviderConfig, 
  AIRequestOptions, 
  AIResponse,
  AIStreamResponse
} from '@/types/ai';

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
  eval_count?: number;
  prompt_tokens?: number;
  completion_tokens?: number;
}

interface OllamaError {
  error: string;
  status?: number;
}

export class OllamaProvider extends BaseAIProvider {
  private baseUrl: string;

  constructor(config: AIProviderConfig) {
    super(config);
    this.baseUrl = config.baseUrl || 'http://localhost:11434';
  }

  get id(): string {
    return 'ollama';
  }

  get name(): string {
    return 'Ollama';
  }

  get type(): 'local' | 'remote' {
    return 'local';
  }

  get supportedModels(): string[] {
    return this.config.models || ['llama2', 'codellama', 'mistral'];
  }

  get maxTokens(): number {
    return 4096; // Default max tokens for most Ollama models
  }

  get streaming(): boolean {
    return true;
  }

  async validateConfig(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      if (!response.ok) {
        throw new Error('Failed to connect to Ollama');
      }
      return true;
    } catch (error) {
      return false;
    }
  }

  async complete(options: AIRequestOptions): Promise<AIResponse> {
    this.validateRequestOptions(options);

    const response = await this.makeRequest('/api/generate', {
      model: options.model,
      prompt: options.prompt,
      context: options.context,
      options: {
        temperature: options.temperature,
        num_predict: options.maxTokens,
      },
    });

    return this.formatResponse(response);
  }

  async *stream(options: AIRequestOptions): AsyncGenerator<AIStreamResponse> {
    this.validateRequestOptions(options);

    const response = await fetch(`${this.baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: options.model,
        prompt: options.prompt,
        context: options.context,
        options: {
          temperature: options.temperature,
          num_predict: options.maxTokens,
        },
        stream: true,
      }),
      signal: options.signal,
    });

    if (!response.ok || !response.body) {
      throw this.handleError(await response.json());
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let totalResponse = '';
    let promptTokens = 0;
    let completionTokens = 0;

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            const chunk = JSON.parse(line) as OllamaResponse;
            totalResponse += chunk.response;
            
            if (chunk.prompt_tokens) promptTokens = chunk.prompt_tokens;
            if (chunk.completion_tokens) completionTokens = chunk.completion_tokens;

            yield {
              content: totalResponse,
              chunk: chunk.response,
              isComplete: chunk.done,
              usage: {
                promptTokens,
                completionTokens,
                totalTokens: promptTokens + completionTokens,
              },
              model: chunk.model,
              provider: this.id,
            };

            if (chunk.done) {
              return;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  private async makeRequest(endpoint: string, data: any): Promise<OllamaResponse> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await this.handleError(await response.json());
    }

    return response.json();
  }

  private handleError(error: OllamaError): Error {
    if (error.status === 404) {
      return this.createError(
        'Model not found. Please check if the model is installed.',
        'MODEL_NOT_FOUND',
        true
      );
    }

    if (error.status === 500) {
      return this.createError(
        'Internal server error. Please check if Ollama is running.',
        'SERVER_ERROR',
        true
      );
    }

    return this.createError(
      error.error || 'Unknown error occurred',
      'PROVIDER_ERROR',
      true
    );
  }

  private formatResponse(response: OllamaResponse): AIResponse {
    return {
      content: response.response,
      usage: {
        promptTokens: response.prompt_tokens || 0,
        completionTokens: response.completion_tokens || 0,
        totalTokens: (response.prompt_tokens || 0) + (response.completion_tokens || 0),
      },
      model: response.model,
      provider: this.id,
    };
  }
}
