import React from 'react';
import { useLocation } from 'react-router-dom';
import { SettingsHeader } from './settings-header';
import { Separator } from '@/components/ui/separator';

interface SettingsLayoutProps {
  children: React.ReactNode;
}

const settingsTitles: Record<string, { title: string; description: string }> = {
  general: {
    title: 'General Settings',
    description: 'Manage your basic application preferences and configurations.',
  },
  ai: {
    title: 'AI Configuration',
    description: 'Configure AI providers, models, and usage settings.',
  },
  appearance: {
    title: 'Appearance',
    description: 'Customize the application theme and visual preferences.',
  },
  projects: {
    title: 'Project Defaults',
    description: 'Set default settings for new projects and templates.',
  },
  privacy: {
    title: 'Privacy & Security',
    description: 'Manage your privacy preferences and security settings.',
  },
  advanced: {
    title: 'Advanced Settings',
    description: 'Configure advanced features and developer options.',
  },
  about: {
    title: 'About',
    description: 'View application information and credits.',
  },
};

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const location = useLocation();
  const section = location.pathname.split('/').pop() || 'general';
  const { title, description } = settingsTitles[section] || settingsTitles.general;

  return (
    <div className="container mx-auto py-6">
      <SettingsHeader title={title} description={description} />
      <Separator className="my-6" />
      <div className="flex-1 space-y-8">
        {children}
      </div>
    </div>
  );
}
