import React, { createContext, useContext, useState, useEffect } from 'react';
import { GlobalSettings, ValidationResult } from '@/types/settings';

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: string;
  fontFamily: string;
  sidebarPosition: 'left' | 'right';
  uiDensity: 'comfortable' | 'compact';
  showLineNumbers: boolean;
  showMiniMap: boolean;
}

interface AIModelConfig {
  enabled: boolean;
  temperature: number;
  maxTokens: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  priority?: number;
  contextLength?: number;
}

interface AIProviderConfig {
  apiKey: string;
  baseUrl?: string;
  enabled: boolean;
  models: string[];
}

interface RequestDefaults {
  maxTokens: number;
  temperature: number;
  topP: number;
  frequencyPenalty: number;
  presencePenalty: number;
  contextLength: number;
}

interface UsageLimits {
  maxRequestsPerMinute: number;
  maxTokensPerDay: number;
  maxConcurrentRequests: number;
  maxRequestsPerDay: number;
  maxCostPerDay: number;
  resetTime: string;
}

interface AISettings {
  defaultProvider: string;
  providers: {
    [key: string]: AIProviderConfig;
  };
  modelPreferences: {
    [key: string]: AIModelConfig;
  };
  requestDefaults: RequestDefaults;
  usageLimits: UsageLimits;
}

interface GeneralSettings {
  language: string;
  autoSave: boolean;
  autoSaveInterval: number;
  updateChannel: 'stable' | 'beta' | 'nightly';
}

interface ProjectDefaultSettings {
  template: string;
  framework: string;
  cssFramework: string;
  componentLibrary: string;
  defaultLayout: 'single' | 'split' | 'grid';
  defaultViewport: 'desktop' | 'tablet' | 'mobile';
  gitIntegration: boolean;
  lintingEnabled: boolean;
  formatOnSave: boolean;
}

interface PrivacySecuritySettings {
  telemetryEnabled: boolean;
  crashReportsEnabled: boolean;
  autoUpdate: boolean;
  updateNotifications: boolean;
  secureStorage: boolean;
  apiKeyStorage: 'local' | 'system' | 'none';
  anonymizeData: boolean;
  thirdPartyIntegrations: {
    github: boolean;
    google: boolean;
    vscode: boolean;
  };
}

export interface GlobalSettings {
  appearance: AppearanceSettings;
  ai: AISettings;
  general: GeneralSettings;
  projectDefaults: ProjectDefaultSettings;
  privacySecurity: PrivacySecuritySettings;
}

const defaultSettings: GlobalSettings = {
  appearance: {
    theme: 'system',
    fontSize: '14px',
    fontFamily: 'Inter',
    sidebarPosition: 'left',
    uiDensity: 'comfortable',
    showLineNumbers: true,
    showMiniMap: true,
  },
  ai: {
    defaultProvider: 'openai',
    providers: {
      openai: {
        apiKey: '',
        baseUrl: 'https://api.openai.com/v1',
        enabled: true,
        models: ['gpt-4', 'gpt-3.5-turbo'],
      },
      anthropic: {
        apiKey: '',
        enabled: false,
        models: ['claude-2', 'claude-instant'],
      },
    },
    modelPreferences: {
      'gpt-4': {
        enabled: true,
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        priority: 1,
        contextLength: 8000,
      },
      'gpt-3.5-turbo': {
        enabled: true,
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        priority: 2,
        contextLength: 4000,
      },
      'claude-2': {
        enabled: false,
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        priority: 1,
        contextLength: 100000,
      },
      'claude-instant': {
        enabled: false,
        temperature: 0.7,
        maxTokens: 2000,
        topP: 1,
        frequencyPenalty: 0,
        presencePenalty: 0,
        priority: 2,
        contextLength: 100000,
      },
    },
    requestDefaults: {
      maxTokens: 2000,
      temperature: 0.7,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
      contextLength: 8000,
    },
    usageLimits: {
      maxRequestsPerMinute: 60,
      maxTokensPerDay: 100000,
      maxConcurrentRequests: 5,
      maxRequestsPerDay: 1000,
      maxCostPerDay: 10,
      resetTime: '00:00',
    },
  },
  general: {
    language: 'en',
    autoSave: true,
    autoSaveInterval: 30,
    updateChannel: 'stable',
  },
  projectDefaults: {
    template: 'blank',
    framework: 'react',
    cssFramework: 'tailwind',
    componentLibrary: 'shadcn',
    defaultLayout: 'split',
    defaultViewport: 'desktop',
    gitIntegration: true,
    lintingEnabled: true,
    formatOnSave: true,
  },
  privacySecurity: {
    telemetryEnabled: true,
    crashReportsEnabled: true,
    autoUpdate: true,
    updateNotifications: true,
    secureStorage: true,
    apiKeyStorage: 'local',
    anonymizeData: true,
    thirdPartyIntegrations: {
      github: false,
      google: false,
      vscode: false,
    },
  },
};

interface SettingsContextType {
  settings: GlobalSettings;
  updateSettings: <T extends keyof GlobalSettings>(
    section: T,
    values: Partial<GlobalSettings[T]>
  ) => Promise<void>;
  resetSettings: (section?: keyof GlobalSettings) => Promise<void>;
  exportSettings: () => Promise<string>;
  importSettings: (json: string) => Promise<void>;
  validateSettings: <T extends keyof GlobalSettings>(
    section: T,
    values: Partial<GlobalSettings[T]>
  ) => Promise<ValidationResult>;
  isLoading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GlobalSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = localStorage.getItem('settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      setIsLoading(false);
    };

    loadSettings();
  }, []);

  const updateSettings = async <T extends keyof GlobalSettings>(
    section: T,
    values: Partial<GlobalSettings[T]>
  ) => {
    setSettings((prev) => {
      const newSettings = {
        ...prev,
        [section]: {
          ...prev[section],
          ...values,
        },
      };
      localStorage.setItem('settings', JSON.stringify(newSettings));
      return newSettings;
    });
  };

  const resetSettings = async (section?: keyof GlobalSettings) => {
    if (section) {
      setSettings((prev) => {
        const newSettings = {
          ...prev,
          [section]: defaultSettings[section],
        };
        localStorage.setItem('settings', JSON.stringify(newSettings));
        return newSettings;
      });
    } else {
      setSettings(defaultSettings);
      localStorage.setItem('settings', JSON.stringify(defaultSettings));
    }
  };

  const exportSettings = async (): Promise<string> => {
    if (!settings) throw new Error('Settings not initialized');
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = async (json: string): Promise<void> => {
    try {
      const parsed = JSON.parse(json);
      const validation = await validateSettings('general', parsed.general);
      
      if (!validation.valid) {
        throw new Error('Invalid settings format');
      }

      await updateSettings('general', parsed.general);
    } catch (error) {
      throw new Error('Failed to import settings: ' + error.message);
    }
  };

  const validateSettings = async <T extends keyof GlobalSettings>(
    section: T,
    values: Partial<GlobalSettings[T]>
  ): Promise<ValidationResult> => {
    if (!settings) throw new Error('Settings not initialized');
    
    return { valid: true };
  };

  if (!settings) {
    return null;
  }

  const value: SettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
    exportSettings,
    importSettings,
    validateSettings,
    isLoading,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
