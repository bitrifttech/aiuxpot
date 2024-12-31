import { GlobalSettings, ValidationResult } from '@/types/settings';
import { z } from 'zod';

const SETTINGS_KEY = 'aiuxpot_settings';
const SETTINGS_VERSION = '1.0.0';

// Default settings
export const defaultSettings: GlobalSettings = {
  general: {
    language: 'en',
    autoSaveInterval: 30000,
    defaultLocation: './projects',
    checkUpdates: true,
    analyticsEnabled: false,
  },
  ai: {
    defaultProvider: 'ollama',
    providers: {},
    modelPreferences: {},
    requestDefaults: {
      maxTokens: 2000,
      temperature: 0.7,
      topP: 1,
      frequencyPenalty: 0,
      presencePenalty: 0,
    },
    usageLimits: {
      maxRequestsPerMinute: 60,
      maxTokensPerDay: 100000,
      maxConcurrentRequests: 5,
    },
  },
  appearance: {
    theme: 'system',
    font: {
      family: 'Inter',
      size: 14,
      lineHeight: 1.5,
      weight: 400,
    },
    layout: {
      sidebarPosition: 'left',
      sidebarWidth: 280,
      panelArrangement: 'horizontal',
    },
    colors: {
      primary: '#0ea5e9',
      secondary: '#7c3aed',
      accent: '#f59e0b',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f1f5f9',
      mutedForeground: '#64748b',
    },
  },
  projects: {
    defaultTemplate: 'blank',
    frameworks: [],
    codeStyle: {
      indentSize: 2,
      useTabs: false,
      insertFinalNewline: true,
      trimTrailingWhitespace: true,
    },
    gitConfig: {
      defaultBranch: 'main',
      commitTemplate: 'feat: ',
      signCommits: false,
    },
  },
  privacy: {
    dataCollection: false,
    backupEnabled: true,
    storageQuota: 1024 * 1024 * 1024, // 1GB
  },
  advanced: {
    developerMode: false,
    performanceMode: true,
    debugLevel: 'error',
  },
};

export class SettingsService {
  private settings: GlobalSettings;
  private watchers: Set<(settings: GlobalSettings) => void>;

  constructor() {
    this.settings = defaultSettings;
    this.watchers = new Set();
  }

  async load(): Promise<GlobalSettings> {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.version !== SETTINGS_VERSION) {
          await this.migrate(parsed.version, SETTINGS_VERSION);
        }
        this.settings = this.mergeWithDefaults(parsed.settings);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return this.settings;
  }

  async save(settings: Partial<GlobalSettings>): Promise<void> {
    try {
      this.settings = this.mergeWithDefaults({
        ...this.settings,
        ...settings,
      });

      localStorage.setItem(SETTINGS_KEY, JSON.stringify({
        version: SETTINGS_VERSION,
        settings: this.settings,
      }));

      this.notifyWatchers();
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  watch(callback: (settings: GlobalSettings) => void): () => void {
    this.watchers.add(callback);
    return () => this.watchers.delete(callback);
  }

  async validate(settings: Partial<GlobalSettings>): Promise<ValidationResult> {
    // TODO: Implement validation using zod schemas
    return { valid: true, errors: {} };
  }

  async migrate(oldVersion: string, newVersion: string): Promise<void> {
    // TODO: Implement migration logic
    console.log(`Migrating settings from ${oldVersion} to ${newVersion}`);
  }

  private mergeWithDefaults(settings: Partial<GlobalSettings>): GlobalSettings {
    return {
      ...defaultSettings,
      ...settings,
      general: { ...defaultSettings.general, ...settings.general },
      ai: { ...defaultSettings.ai, ...settings.ai },
      appearance: { ...defaultSettings.appearance, ...settings.appearance },
      projects: { ...defaultSettings.projects, ...settings.projects },
      privacy: { ...defaultSettings.privacy, ...settings.privacy },
      advanced: { ...defaultSettings.advanced, ...settings.advanced },
    };
  }

  private notifyWatchers(): void {
    this.watchers.forEach(callback => callback(this.settings));
  }
}
