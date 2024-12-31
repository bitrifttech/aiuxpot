import { AIProviderConfig } from './ai';

export type ThemeMode = 'light' | 'dark' | 'system';
export type DebugLevel = 'none' | 'error' | 'warn' | 'info' | 'debug';

export interface FontSettings {
  family: string;
  size: number;
  lineHeight: number;
  weight: number;
}

export interface ThemeConfig {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
  };
}

export interface LayoutConfig {
  sidebarPosition: 'left' | 'right';
  sidebarWidth: number;
  panelArrangement: 'horizontal' | 'vertical';
}

export interface CodeStyleConfig {
  indentSize: number;
  useTabs: boolean;
  insertFinalNewline: boolean;
  trimTrailingWhitespace: boolean;
}

export interface GitConfig {
  defaultBranch: string;
  commitTemplate: string;
  signCommits: boolean;
}

export interface RequestConfig {
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

export interface UsageLimits {
  maxRequestsPerMinute: number;
  maxTokensPerDay: number;
  maxConcurrentRequests: number;
}

export interface ModelConfig {
  enabled: boolean;
  priority: number;
  contextLength: number;
  customOptions?: Record<string, unknown>;
}

export interface GlobalSettings {
  general: {
    language: string;
    autoSaveInterval: number;
    defaultLocation: string;
    checkUpdates: boolean;
    analyticsEnabled: boolean;
  };
  ai: {
    defaultProvider: string;
    providers: Record<string, AIProviderConfig>;
    modelPreferences: Record<string, ModelConfig>;
    requestDefaults: RequestConfig;
    usageLimits: UsageLimits;
  };
  appearance: {
    theme: ThemeMode;
    customTheme?: ThemeConfig;
    font: FontSettings;
    layout: LayoutConfig;
    colors: ThemeConfig['colors'];
  };
  projects: {
    defaultTemplate: string;
    frameworks: string[];
    codeStyle: CodeStyleConfig;
    gitConfig: GitConfig;
  };
  privacy: {
    dataCollection: boolean;
    backupEnabled: boolean;
    storageQuota: number;
  };
  advanced: {
    developerMode: boolean;
    performanceMode: boolean;
    debugLevel: DebugLevel;
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}
