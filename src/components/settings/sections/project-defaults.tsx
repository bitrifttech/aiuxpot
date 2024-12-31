import React from 'react';
import { useSettings } from '@/contexts/settings-context';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SettingsSection } from '../settings-section';
import { SettingsCard } from '../settings-card';

const templates = [
  { value: 'blank', label: 'Blank Project' },
  { value: 'landing-page', label: 'Landing Page' },
  { value: 'dashboard', label: 'Dashboard' },
  { value: 'e-commerce', label: 'E-commerce' },
  { value: 'blog', label: 'Blog' },
];

const frameworks = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue.js' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
];

const cssFrameworks = [
  { value: 'tailwind', label: 'Tailwind CSS' },
  { value: 'bootstrap', label: 'Bootstrap' },
  { value: 'mui', label: 'Material-UI' },
  { value: 'chakra', label: 'Chakra UI' },
];

const componentLibraries = [
  { value: 'shadcn', label: 'shadcn/ui' },
  { value: 'radix', label: 'Radix UI' },
  { value: 'headless', label: 'Headless UI' },
  { value: 'none', label: 'None' },
];

export function ProjectDefaults() {
  const { settings, updateSettings } = useSettings();
  const { projectDefaults } = settings;

  const handleTemplateChange = (value: string) => {
    updateSettings('projectDefaults', { template: value });
  };

  const handleFrameworkChange = (value: string) => {
    updateSettings('projectDefaults', { framework: value });
  };

  const handleCSSFrameworkChange = (value: string) => {
    updateSettings('projectDefaults', { cssFramework: value });
  };

  const handleComponentLibraryChange = (value: string) => {
    updateSettings('projectDefaults', { componentLibrary: value });
  };

  const handleLayoutChange = (value: 'single' | 'split' | 'grid') => {
    updateSettings('projectDefaults', { defaultLayout: value });
  };

  const handleViewportChange = (value: 'desktop' | 'tablet' | 'mobile') => {
    updateSettings('projectDefaults', { defaultViewport: value });
  };

  const handleGitIntegrationChange = (checked: boolean) => {
    updateSettings('projectDefaults', { gitIntegration: checked });
  };

  const handleLintingChange = (checked: boolean) => {
    updateSettings('projectDefaults', { lintingEnabled: checked });
  };

  const handleFormatOnSaveChange = (checked: boolean) => {
    updateSettings('projectDefaults', { formatOnSave: checked });
  };

  return (
    <SettingsSection 
      title="Project Defaults" 
      description="Configure default settings for new projects"
    >
      <SettingsCard title="Templates & Frameworks" description="Choose your preferred starting point">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Default Template</Label>
            <Select value={projectDefaults.template} onValueChange={handleTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Framework</Label>
            <Select value={projectDefaults.framework} onValueChange={handleFrameworkChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select framework" />
              </SelectTrigger>
              <SelectContent>
                {frameworks.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>CSS Framework</Label>
            <Select value={projectDefaults.cssFramework} onValueChange={handleCSSFrameworkChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select CSS framework" />
              </SelectTrigger>
              <SelectContent>
                {cssFrameworks.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Component Library</Label>
            <Select value={projectDefaults.componentLibrary} onValueChange={handleComponentLibraryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select component library" />
              </SelectTrigger>
              <SelectContent>
                {componentLibraries.map(({ value, label }) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Layout & Viewport" description="Set default view preferences">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Default Layout</Label>
            <RadioGroup
              value={projectDefaults.defaultLayout}
              onValueChange={handleLayoutChange}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="single" id="single" className="peer sr-only" />
                <Label
                  htmlFor="single"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Single</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="split" id="split" className="peer sr-only" />
                <Label
                  htmlFor="split"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Split</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="grid" id="grid" className="peer sr-only" />
                <Label
                  htmlFor="grid"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Grid</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label>Default Viewport</Label>
            <RadioGroup
              value={projectDefaults.defaultViewport}
              onValueChange={handleViewportChange}
              className="grid grid-cols-3 gap-4"
            >
              <div>
                <RadioGroupItem value="desktop" id="desktop" className="peer sr-only" />
                <Label
                  htmlFor="desktop"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Desktop</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="tablet" id="tablet" className="peer sr-only" />
                <Label
                  htmlFor="tablet"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Tablet</span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="mobile" id="mobile" className="peer sr-only" />
                <Label
                  htmlFor="mobile"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <span>Mobile</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Development Tools" description="Configure development environment preferences">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="git">Git Integration</Label>
              <p className="text-sm text-muted-foreground">Initialize Git repository for new projects</p>
            </div>
            <Switch
              id="git"
              checked={projectDefaults.gitIntegration}
              onCheckedChange={handleGitIntegrationChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="linting">Enable Linting</Label>
              <p className="text-sm text-muted-foreground">Configure ESLint for code quality</p>
            </div>
            <Switch
              id="linting"
              checked={projectDefaults.lintingEnabled}
              onCheckedChange={handleLintingChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="format">Format on Save</Label>
              <p className="text-sm text-muted-foreground">Automatically format code when saving</p>
            </div>
            <Switch
              id="format"
              checked={projectDefaults.formatOnSave}
              onCheckedChange={handleFormatOnSaveChange}
            />
          </div>
        </div>
      </SettingsCard>
    </SettingsSection>
  );
}
