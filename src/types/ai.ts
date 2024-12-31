/**
 * Base types for AI provider integration
 */

export type AIProviderType = 'local' | 'remote';

export interface AIProvider {
  id: string;
  name: string;
  type: AIProviderType;
  supportedModels: string[];
  maxTokens: number;
  streaming: boolean;
  isAvailable(): Promise<boolean>;
  validateConfig(): Promise<boolean>;
}

export interface AIRequestOptions {
  model: string;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  streaming?: boolean;
  signal?: AbortSignal;
  context?: string[];
}

export interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: string;
}

export interface AIStreamResponse extends AIResponse {
  isComplete: boolean;
  chunk: string;
}

export interface AIError extends Error {
  code: string;
  provider: string;
  retryable: boolean;
}

export interface AIProviderConfig {
  apiKey?: string;
  baseUrl?: string;
  organizationId?: string;
  models?: string[];
  maxConcurrentRequests?: number;
  timeoutMs?: number;
}

export interface AIModelInfo {
  id: string;
  name: string;
  provider: string;
  contextSize: number;
  pricing?: {
    input: number;
    output: number;
    unit: 'token' | 'character';
    currency: string;
  };
}

export type AIEventType = 
  | 'start' 
  | 'chunk' 
  | 'complete' 
  | 'error' 
  | 'cancel';

export interface AIEvent {
  type: AIEventType;
  timestamp: number;
  data?: AIResponse | AIError | string;
}

export interface AIProviderStats {
  requestCount: number;
  errorCount: number;
  tokenUsage: {
    prompt: number;
    completion: number;
    total: number;
  };
  averageLatency: number;
  costEstimate?: number;
}
