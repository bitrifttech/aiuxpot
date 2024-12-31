import React, { createContext, useContext, useEffect, useState } from 'react';
import { AIProviderManager } from '@/lib/ai/provider-manager';
import { OllamaProvider } from '@/lib/ai/providers/ollama';
import { OpenAIProvider } from '@/lib/ai/providers/openai';
import { loadEnvConfig, getProviderConfig } from '@/lib/ai/config';
import { 
  AIProvider, 
  AIProviderConfig,
  AIProviderStats,
  AIRequestOptions,
  AIResponse,
  AIError
} from '@/types/ai';
import { useToast } from '@/hooks/use-toast';

interface AIContextType {
  providers: AIProvider[];
  activeProvider?: AIProvider;
  setActiveProvider: (providerId: string) => void;
  stats: Map<string, AIProviderStats>;
  isInitialized: boolean;
  error: AIError | null;
  complete: (options: AIRequestOptions) => Promise<AIResponse>;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [providerManager] = useState(() => new AIProviderManager());
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [activeProvider, setActiveProvider] = useState<AIProvider>();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<AIError | null>(null);
  const { toast } = useToast();

  // Initialize providers
  useEffect(() => {
    const initializeProviders = async () => {
      try {
        const envConfig = loadEnvConfig();

        // Initialize Ollama provider
        const ollamaConfig = getProviderConfig('ollama', envConfig);
        const ollamaProvider = new OllamaProvider(ollamaConfig);
        providerManager.registerProvider(ollamaProvider);

        // Initialize OpenAI provider if API key is available
        if (envConfig.OPENAI_API_KEY) {
          const openaiConfig = getProviderConfig('openai', envConfig);
          const openaiProvider = new OpenAIProvider(openaiConfig);
          providerManager.registerProvider(openaiProvider);
        }

        // Get available providers
        const available = await providerManager.getAvailableProviders();
        setProviders(available);

        // Set default provider
        if (available.length > 0) {
          const defaultProvider = available.find(p => p.id === envConfig.AI_PROVIDER) 
            || available[0];
          setActiveProvider(defaultProvider);
          providerManager.setDefaultProvider(defaultProvider.id);
        }

        setIsInitialized(true);
      } catch (err) {
        const aiError = err as AIError;
        setError(aiError);
        toast({
          title: 'AI Initialization Error',
          description: aiError.message,
          variant: 'destructive',
        });
      }
    };

    initializeProviders();
  }, [providerManager, toast]);

  const handleSetActiveProvider = (providerId: string) => {
    const provider = providers.find(p => p.id === providerId);
    if (provider) {
      setActiveProvider(provider);
      providerManager.setDefaultProvider(providerId);
    }
  };

  const complete = async (options: AIRequestOptions): Promise<AIResponse> => {
    try {
      return await providerManager.complete(options);
    } catch (err) {
      const aiError = err as AIError;
      toast({
        title: 'AI Error',
        description: aiError.message,
        variant: 'destructive',
      });
      throw aiError;
    }
  };

  const value = {
    providers,
    activeProvider,
    setActiveProvider: handleSetActiveProvider,
    stats: providerManager.getAllStats(),
    isInitialized,
    error,
    complete,
  };

  return <AIContext.Provider value={value}>{children}</AIContext.Provider>;
}

export function useAIContext() {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error('useAIContext must be used within an AIProvider');
  }
  return context;
}
