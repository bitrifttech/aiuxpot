import React, { createContext, useContext, useState, useEffect } from 'react';
import { GlobalSettings, ValidationResult } from '@/types/settings';
import { SettingsService } from '@/lib/settings/settings-service';

interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: string;
  fontFamily: string;
  sidebarPosition: 'left' | 'right';
  uiDensity: 'comfortable' | 'compact';
  showLineNumbers: boolean;
  showMiniMap: boolean;
}

interface AISettings {
  provider: string;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
}

interface GeneralSettings {
  language: string;
  autoSave: boolean;
  autoSaveInterval: number;
  updateChannel: 'stable' | 'beta' | 'nightly';
}

export interface GlobalSettings {
  appearance: AppearanceSettings;
  ai: AISettings;
  general: GeneralSettings;
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
    provider: 'openai',
    model: 'gpt-4',
    apiKey: '',
    temperature: 0.7,
    maxTokens: 2000,
  },
  general: {
    language: 'en',
    autoSave: true,
    autoSaveInterval: 30,
    updateChannel: 'stable',
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
  const [settings, setSettings] = useState<GlobalSettings | null>(null);
  const [settingsService] = useState(() => new SettingsService());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeSettings = async () => {
      const loadedSettings = await settingsService.load();
      setSettings(loadedSettings);
      setIsLoading(false);
    };

    initializeSettings();
  }, [settingsService]);

  useEffect(() => {
    if (!settings) return;

    const unwatch = settingsService.watch((newSettings) => {
      setSettings(newSettings);
    });

    return unwatch;
  }, [settings, settingsService]);

  const updateSettings = async <T extends keyof GlobalSettings>(
    section: T,
    values: Partial<GlobalSettings[T]>
  ) => {
    if (!settings) return;

    const updatedSettings = {
      ...settings,
      [section]: {
        ...settings[section],
        ...values,
      },
    };

    await settingsService.save(updatedSettings);
  };

  const resetSettings = async (section?: keyof GlobalSettings) => {
    if (!settings) return;

    if (section) {
      await settingsService.save({
        [section]: defaultSettings[section],
      });
    } else {
      await settingsService.save(defaultSettings);
    }
  };

  const exportSettings = async (): Promise<string> => {
    if (!settings) throw new Error('Settings not initialized');
    return JSON.stringify(settings, null, 2);
  };

  const importSettings = async (json: string): Promise<void> => {
    try {
      const parsed = JSON.parse(json);
      const validation = await settingsService.validate(parsed);
      
      if (!validation.valid) {
        throw new Error('Invalid settings format');
      }

      await settingsService.save(parsed);
    } catch (error) {
      throw new Error('Failed to import settings: ' + error.message);
    }
  };

  const validateSettings = async <T extends keyof GlobalSettings>(
    section: T,
    values: Partial<GlobalSettings[T]>
  ): Promise<ValidationResult> => {
    if (!settings) throw new Error('Settings not initialized');
    
    return settingsService.validate({
      [section]: values,
    });
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