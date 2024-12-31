import { useState, useCallback, useEffect } from 'react';
import { AIProviderManager } from '@/lib/ai/provider-manager';
import { OllamaProvider } from '@/lib/ai/providers/ollama';
import { loadEnvConfig, getProviderConfig } from '@/lib/ai/config';
import { 
  AIRequestOptions, 
  AIResponse, 
  AIStreamResponse,
  AIError,
  AIProvider,
  AIProviderStats
} from '@/types/ai';
import { useToast } from './use-toast';

// Initialize the provider manager
const providerManager = new AIProviderManager();

// Load environment configuration
const envConfig = loadEnvConfig();

// Initialize Ollama provider
const ollamaConfig = getProviderConfig('ollama', envConfig);
const ollamaProvider = new OllamaProvider(ollamaConfig);
providerManager.registerProvider(ollamaProvider);

interface UseAIOptions {
  defaultProvider?: string;
  onError?: (error: AIError) => void;
}

interface UseAIReturn {
  complete: (options: AIRequestOptions) => Promise<AIResponse>;
  stream: (options: AIRequestOptions) => AsyncGenerator<AIStreamResponse>;
  isLoading: boolean;
  error: AIError | null;
  abort: () => void;
  providers: AIProvider[];
  stats: Map<string, AIProviderStats>;
  setDefaultProvider: (id: string) => void;
}

export function useAI({ defaultProvider, onError }: UseAIOptions = {}): UseAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AIError | null>(null);
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const { toast } = useToast();

  // Load available providers
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const available = await providerManager.getAvailableProviders();
        setProviders(available);

        if (defaultProvider) {
          providerManager.setDefaultProvider(defaultProvider);
        }
      } catch (err) {
        console.error('Failed to load AI providers:', err);
        toast({
          title: 'Error',
          description: 'Failed to initialize AI providers',
          variant: 'destructive',
        });
      }
    };

    loadProviders();
  }, [defaultProvider, toast]);

  const handleError = useCallback((err: AIError) => {
    setError(err);
    onError?.(err);
    toast({
      title: 'AI Error',
      description: err.message,
      variant: 'destructive',
    });
  }, [onError, toast]);

  const complete = useCallback(async (options: AIRequestOptions): Promise<AIResponse> => {
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await providerManager.complete({
        ...options,
        signal: controller.signal,
      });
      return response;
    } catch (err) {
      const aiError = err as AIError;
      handleError(aiError);
      throw aiError;
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [handleError]);

  const stream = useCallback(async function* (
    options: AIRequestOptions
  ): AsyncGenerator<AIStreamResponse> {
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const provider = await providerManager.getProvider(options.provider);
      const generator = provider.stream({
        ...options,
        signal: controller.signal,
      });

      for await (const chunk of generator) {
        yield chunk;
      }
    } catch (err) {
      const aiError = err as AIError;
      handleError(aiError);
      throw aiError;
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }, [handleError]);

  const abort = useCallback(() => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsLoading(false);
    }
  }, [abortController]);

  return {
    complete,
    stream,
    isLoading,
    error,
    abort,
    providers,
    stats: providerManager.getAllStats(),
    setDefaultProvider: providerManager.setDefaultProvider.bind(providerManager),
  };
}
