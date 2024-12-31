import React from 'react';
import { useSettings } from '@/contexts/settings-context';
import { SettingsSection } from '../settings-section';
import { SettingsCard } from '../settings-card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const languages = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
  { value: 'ja', label: '日本語' },
  { value: 'zh', label: '中文' },
];

export function GeneralSettings() {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();

  const handleLanguageChange = async (value: string) => {
    try {
      await updateSettings('general', { language: value });
      toast({
        title: 'Language Updated',
        description: 'Application language has been changed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update language setting.',
        variant: 'destructive',
      });
    }
  };

  const handleAutoSaveChange = async (value: number) => {
    try {
      await updateSettings('general', { autoSaveInterval: value });
      toast({
        title: 'Auto-save Updated',
        description: 'Auto-save interval has been updated.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update auto-save setting.',
        variant: 'destructive',
      });
    }
  };

  const handleLocationChange = async (value: string) => {
    try {
      await updateSettings('general', { defaultLocation: value });
      toast({
        title: 'Default Location Updated',
        description: 'Project default location has been changed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update default location.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleChange = async (key: 'checkUpdates' | 'analyticsEnabled', value: boolean) => {
    try {
      await updateSettings('general', { [key]: value });
      toast({
        title: 'Setting Updated',
        description: `${key === 'checkUpdates' ? 'Update checking' : 'Analytics'} has been ${value ? 'enabled' : 'disabled'}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update setting.',
        variant: 'destructive',
      });
    }
  };

  return (
    <SettingsSection
      title="General Settings"
      description="Configure basic application settings and preferences."
    >
      <SettingsCard
        title="Language"
        description="Select your preferred language for the application interface."
      >
        <Select
          value={settings.general.language}
          onValueChange={handleLanguageChange}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.value} value={lang.value}>
                {lang.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SettingsCard>

      <SettingsCard
        title="Auto-save"
        description="Set the interval for automatic saving of changes."
      >
        <div className="flex items-center gap-4">
          <Input
            type="number"
            min={5000}
            max={300000}
            step={1000}
            value={settings.general.autoSaveInterval}
            onChange={(e) => handleAutoSaveChange(Number(e.target.value))}
            className="w-[200px]"
          />
          <span className="text-sm text-muted-foreground">milliseconds</span>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Project Location"
        description="Set the default location for new projects."
      >
        <div className="flex items-center gap-4">
          <Input
            value={settings.general.defaultLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline" onClick={() => {/* TODO: Add directory picker */}}>
            Browse
          </Button>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Updates & Analytics"
        description="Configure update checking and analytics preferences."
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Check for Updates</Label>
              <div className="text-sm text-muted-foreground">
                Automatically check for application updates
              </div>
            </div>
            <Switch
              checked={settings.general.checkUpdates}
              onCheckedChange={(checked) => handleToggleChange('checkUpdates', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Usage Analytics</Label>
              <div className="text-sm text-muted-foreground">
                Help improve the app by sending anonymous usage data
              </div>
            </div>
            <Switch
              checked={settings.general.analyticsEnabled}
              onCheckedChange={(checked) => handleToggleChange('analyticsEnabled', checked)}
            />
          </div>
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
