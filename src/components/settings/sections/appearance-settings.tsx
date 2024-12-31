import React from 'react';
import { useTheme } from '@/components/ui/theme-provider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { SettingsSection } from '../settings-section';
import { SettingsCard } from '../settings-card';
import { useSettings } from '@/contexts/settings-context';

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useSettings();

  const fontSizes = ['12px', '14px', '16px', '18px', '20px'];
  const fontFamilies = [
    'Inter',
    'System UI',
    'Roboto',
    'SF Pro',
    'Monaco',
    'Fira Code',
  ];

  const handleThemeChange = (value: string) => {
    setTheme(value);
    updateSettings('appearance', { theme: value });
  };

  const handleFontSizeChange = (value: string) => {
    updateSettings('appearance', { fontSize: value });
  };

  const handleFontFamilyChange = (value: string) => {
    updateSettings('appearance', { fontFamily: value });
  };

  const handleSidebarPositionChange = (value: string) => {
    updateSettings('appearance', { sidebarPosition: value });
  };

  const handleUIDensityChange = (value: string) => {
    updateSettings('appearance', { uiDensity: value });
  };

  const handleLineNumbersChange = (checked: boolean) => {
    updateSettings('appearance', { showLineNumbers: checked });
  };

  const handleMiniMapChange = (checked: boolean) => {
    updateSettings('appearance', { showMiniMap: checked });
  };

  return (
    <SettingsSection title="Appearance" description="Customize the look and feel of your workspace">
      <SettingsCard title="Theme" description="Choose your preferred color theme">
        <RadioGroup
          value={theme}
          onValueChange={handleThemeChange}
          className="grid grid-cols-3 gap-4"
        >
          <div>
            <RadioGroupItem value="light" id="light" className="peer sr-only" />
            <Label
              htmlFor="light"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Light</span>
            </Label>
          </div>
          <div>
            <RadioGroupItem value="dark" id="dark" className="peer sr-only" />
            <Label
              htmlFor="dark"
              className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
            >
              <span>Dark</span>
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
        </RadioGroup>
      </SettingsCard>

      <SettingsCard title="Font" description="Customize text appearance">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Font Size</Label>
            <Select
              value={settings.appearance.fontSize}
              onValueChange={handleFontSizeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font size" />
              </SelectTrigger>
              <SelectContent>
                {fontSizes.map((size) => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Font Family</Label>
            <Select
              value={settings.appearance.fontFamily}
              onValueChange={handleFontFamilyChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select font family" />
              </SelectTrigger>
              <SelectContent>
                {fontFamilies.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Layout" description="Configure workspace layout">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Sidebar Position</Label>
            <RadioGroup
              value={settings.appearance.sidebarPosition}
              onValueChange={handleSidebarPositionChange}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="left" id="left" className="peer sr-only" />
                <Label
                  htmlFor="left"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Left</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="right" id="right" className="peer sr-only" />
                <Label
                  htmlFor="right"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Right</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>UI Density</Label>
            <RadioGroup
              value={settings.appearance.uiDensity}
              onValueChange={handleUIDensityChange}
              className="grid grid-cols-2 gap-4"
            >
              <div>
                <RadioGroupItem value="comfortable" id="comfortable" className="peer sr-only" />
                <Label
                  htmlFor="comfortable"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Comfortable</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="compact" id="compact" className="peer sr-only" />
                <Label
                  htmlFor="compact"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Compact</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Editor" description="Configure editor appearance">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="line-numbers">Show Line Numbers</Label>
            <Switch
              id="line-numbers"
              checked={settings.appearance.showLineNumbers}
              onCheckedChange={handleLineNumbersChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="minimap">Show Minimap</Label>
            <Switch
              id="minimap"
              checked={settings.appearance.showMiniMap}
              onCheckedChange={handleMiniMapChange}
            />
          </div>
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
