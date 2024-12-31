import React from 'react';
import { useSettings } from '@/contexts/settings-context';
import { SettingsSection } from '../settings-section';
import { SettingsCard } from '../settings-card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Info } from 'lucide-react';
import { AIProviderConfig, ModelConfig, RequestConfig, UsageLimits } from '@/types/settings';

export function AISettings() {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();

  const handleProviderChange = async (providerId: string) => {
    try {
      await updateSettings('ai', { defaultProvider: providerId });
      toast({
        title: 'Default Provider Updated',
        description: 'AI provider has been changed.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update AI provider.',
        variant: 'destructive',
      });
    }
  };

  const handleProviderConfigChange = async (
    providerId: string,
    config: Partial<AIProviderConfig>
  ) => {
    try {
      const updatedProviders = {
        ...settings.ai.providers,
        [providerId]: {
          ...settings.ai.providers[providerId],
          ...config,
        },
      };
      await updateSettings('ai', { providers: updatedProviders });
      toast({
        title: 'Provider Configuration Updated',
        description: 'AI provider settings have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update provider configuration.',
        variant: 'destructive',
      });
    }
  };

  const handleModelConfigChange = async (
    modelId: string,
    config: Partial<ModelConfig>
  ) => {
    try {
      const updatedPreferences = {
        ...settings.ai.modelPreferences,
        [modelId]: {
          ...settings.ai.modelPreferences[modelId],
          ...config,
        },
      };
      await updateSettings('ai', { modelPreferences: updatedPreferences });
      toast({
        title: 'Model Configuration Updated',
        description: 'Model preferences have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update model configuration.',
        variant: 'destructive',
      });
    }
  };

  const handleRequestConfigChange = async (config: Partial<RequestConfig>) => {
    try {
      const updatedDefaults = {
        ...settings.ai.requestDefaults,
        ...config,
      };
      await updateSettings('ai', { requestDefaults: updatedDefaults });
      toast({
        title: 'Request Configuration Updated',
        description: 'Default request settings have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update request configuration.',
        variant: 'destructive',
      });
    }
  };

  const handleUsageLimitsChange = async (limits: Partial<UsageLimits>) => {
    try {
      const updatedLimits = {
        ...settings.ai.usageLimits,
        ...limits,
      };
      await updateSettings('ai', { usageLimits: updatedLimits });
      toast({
        title: 'Usage Limits Updated',
        description: 'AI usage limits have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update usage limits.',
        variant: 'destructive',
      });
    }
  };

  return (
    <SettingsSection
      title="AI Configuration"
      description="Configure AI providers, models, and usage settings."
    >
      <SettingsCard
        title="Default Provider"
        description="Select and configure your preferred AI provider."
      >
        <div className="space-y-4">
          <Select
            value={settings.ai.defaultProvider}
            onValueChange={handleProviderChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select provider" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(settings.ai.providers).map(([id, provider]) => (
                <SelectItem key={id} value={id}>
                  {provider.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {settings.ai.defaultProvider && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={settings.ai.providers[settings.ai.defaultProvider]?.apiKey || ''}
                  onChange={(e) =>
                    handleProviderConfigChange(settings.ai.defaultProvider, {
                      apiKey: e.target.value,
                    })
                  }
                  className="flex-1"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label>Base URL</Label>
                <Input
                  value={settings.ai.providers[settings.ai.defaultProvider]?.baseUrl || ''}
                  onChange={(e) =>
                    handleProviderConfigChange(settings.ai.defaultProvider, {
                      baseUrl: e.target.value,
                    })
                  }
                  className="flex-1"
                />
              </div>
            </div>
          )}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Model Configuration"
        description="Configure model-specific settings and preferences."
      >
        <div className="space-y-6">
          {Object.entries(settings.ai.modelPreferences).map(([modelId, config]) => (
            <div key={modelId} className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{modelId}</h4>
                    <Badge variant={config.enabled ? 'default' : 'secondary'}>
                      {config.enabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </div>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(checked) =>
                    handleModelConfigChange(modelId, { enabled: checked })
                  }
                />
              </div>

              {config.enabled && (
                <>
                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Slider
                      value={[config.priority]}
                      min={1}
                      max={10}
                      step={1}
                      onValueChange={([value]) =>
                        handleModelConfigChange(modelId, { priority: value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Context Length</Label>
                    <Input
                      type="number"
                      value={config.contextLength}
                      onChange={(e) =>
                        handleModelConfigChange(modelId, {
                          contextLength: Number(e.target.value),
                        })
                      }
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </SettingsCard>

      <SettingsCard
        title="Request Configuration"
        description="Set default parameters for AI requests."
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Max Tokens</Label>
            <Input
              type="number"
              value={settings.ai.requestDefaults.maxTokens}
              onChange={(e) =>
                handleRequestConfigChange({
                  maxTokens: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Temperature</Label>
            <Slider
              value={[settings.ai.requestDefaults.temperature]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) =>
                handleRequestConfigChange({ temperature: value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Top P</Label>
            <Slider
              value={[settings.ai.requestDefaults.topP]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={([value]) =>
                handleRequestConfigChange({ topP: value })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Frequency Penalty</Label>
              <Slider
                value={[settings.ai.requestDefaults.frequencyPenalty]}
                min={0}
                max={2}
                step={0.1}
                onValueChange={([value]) =>
                  handleRequestConfigChange({ frequencyPenalty: value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Presence Penalty</Label>
              <Slider
                value={[settings.ai.requestDefaults.presencePenalty]}
                min={0}
                max={2}
                step={0.1}
                onValueChange={([value]) =>
                  handleRequestConfigChange({ presencePenalty: value })
                }
              />
            </div>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard
        title="Usage Limits"
        description="Configure AI usage limits and quotas."
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Max Requests per Minute</Label>
            <Input
              type="number"
              value={settings.ai.usageLimits.maxRequestsPerMinute}
              onChange={(e) =>
                handleUsageLimitsChange({
                  maxRequestsPerMinute: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Max Tokens per Day</Label>
            <Input
              type="number"
              value={settings.ai.usageLimits.maxTokensPerDay}
              onChange={(e) =>
                handleUsageLimitsChange({
                  maxTokensPerDay: Number(e.target.value),
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Max Concurrent Requests</Label>
            <Input
              type="number"
              value={settings.ai.usageLimits.maxConcurrentRequests}
              onChange={(e) =>
                handleUsageLimitsChange({
                  maxConcurrentRequests: Number(e.target.value),
                })
              }
            />
          </div>
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
