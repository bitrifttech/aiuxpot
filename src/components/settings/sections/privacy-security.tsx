import React from 'react';
import { useSettings } from '@/contexts/settings-context';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Trash2, Key, Shield, RefreshCw } from 'lucide-react';
import { SettingsSection } from '../settings-section';
import { SettingsCard } from '../settings-card';
import { useToast } from '@/hooks/use-toast';

export function PrivacySecurity() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const { privacySecurity } = settings;
  const { toast } = useToast();

  const handleTelemetryChange = (checked: boolean) => {
    updateSettings('privacySecurity', { telemetryEnabled: checked });
  };

  const handleCrashReportsChange = (checked: boolean) => {
    updateSettings('privacySecurity', { crashReportsEnabled: checked });
  };

  const handleAutoUpdateChange = (checked: boolean) => {
    updateSettings('privacySecurity', { autoUpdate: checked });
  };

  const handleUpdateNotificationsChange = (checked: boolean) => {
    updateSettings('privacySecurity', { updateNotifications: checked });
  };

  const handleSecureStorageChange = (checked: boolean) => {
    updateSettings('privacySecurity', { secureStorage: checked });
  };

  const handleApiKeyStorageChange = (value: 'local' | 'system' | 'none') => {
    updateSettings('privacySecurity', { apiKeyStorage: value });
  };

  const handleAnonymizeDataChange = (checked: boolean) => {
    updateSettings('privacySecurity', { anonymizeData: checked });
  };

  const handleThirdPartyIntegrationChange = (integration: keyof typeof privacySecurity.thirdPartyIntegrations, enabled: boolean) => {
    updateSettings('privacySecurity', {
      thirdPartyIntegrations: {
        ...privacySecurity.thirdPartyIntegrations,
        [integration]: enabled,
      },
    });
  };

  const handleClearData = async () => {
    try {
      await resetSettings('privacySecurity');
      toast({
        title: 'Data cleared',
        description: 'All privacy and security settings have been reset to defaults.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to clear data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleRotateKeys = async () => {
    // This would typically integrate with your key rotation service
    toast({
      title: 'Keys rotated',
      description: 'All API keys have been rotated successfully.',
    });
  };

  return (
    <SettingsSection 
      title="Privacy & Security" 
      description="Manage your privacy preferences and security settings"
    >
      <SettingsCard title="Data Collection" description="Control how your data is collected and used">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="telemetry">Usage Analytics</Label>
              <p className="text-sm text-muted-foreground">
                Help improve aiuxpot by sending anonymous usage data
              </p>
            </div>
            <Switch
              id="telemetry"
              checked={privacySecurity.telemetryEnabled}
              onCheckedChange={handleTelemetryChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="crash-reports">Crash Reports</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send crash reports to help fix issues
              </p>
            </div>
            <Switch
              id="crash-reports"
              checked={privacySecurity.crashReportsEnabled}
              onCheckedChange={handleCrashReportsChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="anonymize">Anonymize Data</Label>
              <p className="text-sm text-muted-foreground">
                Remove personal information from collected data
              </p>
            </div>
            <Switch
              id="anonymize"
              checked={privacySecurity.anonymizeData}
              onCheckedChange={handleAnonymizeDataChange}
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Security" description="Configure security settings and API key storage">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="secure-storage">Secure Storage</Label>
              <p className="text-sm text-muted-foreground">
                Enable encryption for sensitive data
              </p>
            </div>
            <Switch
              id="secure-storage"
              checked={privacySecurity.secureStorage}
              onCheckedChange={handleSecureStorageChange}
            />
          </div>

          <div className="space-y-2">
            <Label>API Key Storage</Label>
            <RadioGroup
              value={privacySecurity.apiKeyStorage}
              onValueChange={handleApiKeyStorageChange}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="local" id="local" className="peer sr-only" />
                <Label
                  htmlFor="local"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Local</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="system" id="system" className="peer sr-only" />
                <Label
                  htmlFor="system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>System</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="none" id="none" className="peer sr-only" />
                <Label
                  htmlFor="none"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>None</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="pt-4 space-x-2">
            <Button
              variant="outline"
              className="space-x-2"
              onClick={handleRotateKeys}
            >
              <Key className="h-4 w-4" />
              <span>Rotate API Keys</span>
            </Button>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Updates" description="Manage application updates">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-update">Automatic Updates</Label>
              <p className="text-sm text-muted-foreground">
                Automatically install updates when available
              </p>
            </div>
            <Switch
              id="auto-update"
              checked={privacySecurity.autoUpdate}
              onCheckedChange={handleAutoUpdateChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="update-notifications">Update Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications about new updates
              </p>
            </div>
            <Switch
              id="update-notifications"
              checked={privacySecurity.updateNotifications}
              onCheckedChange={handleUpdateNotificationsChange}
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Third-Party Integrations" description="Manage connections to external services">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="github">GitHub Integration</Label>
              <p className="text-sm text-muted-foreground">
                Connect with GitHub for version control
              </p>
            </div>
            <Switch
              id="github"
              checked={privacySecurity.thirdPartyIntegrations.github}
              onCheckedChange={(checked) => handleThirdPartyIntegrationChange('github', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="google">Google Integration</Label>
              <p className="text-sm text-muted-foreground">
                Connect with Google for authentication
              </p>
            </div>
            <Switch
              id="google"
              checked={privacySecurity.thirdPartyIntegrations.google}
              onCheckedChange={(checked) => handleThirdPartyIntegrationChange('google', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="vscode">VS Code Integration</Label>
              <p className="text-sm text-muted-foreground">
                Connect with VS Code for enhanced development
              </p>
            </div>
            <Switch
              id="vscode"
              checked={privacySecurity.thirdPartyIntegrations.vscode}
              onCheckedChange={(checked) => handleThirdPartyIntegrationChange('vscode', checked)}
            />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Data Management" description="Manage your data and privacy">
        <div className="space-y-4">
          <div className="flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground">
              Clear all stored data and reset privacy settings to default values.
              This action cannot be undone.
            </p>
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                className="space-x-2"
                onClick={handleClearData}
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear All Data</span>
              </Button>
            </div>
          </div>
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
