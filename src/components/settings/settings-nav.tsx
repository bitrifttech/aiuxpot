import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Settings,
  Palette,
  Code2,
  Shield,
  Terminal,
  Info,
  Sliders,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const settingsNavItems = [
  {
    title: 'General',
    href: '/settings/general',
    icon: Settings,
    description: 'Basic application settings and preferences',
  },
  {
    title: 'AI Configuration',
    href: '/settings/ai',
    icon: Sliders,
    description: 'Configure AI providers and models',
  },
  {
    title: 'Appearance',
    href: '/settings/appearance',
    icon: Palette,
    description: 'Customize the application look and feel',
  },
  {
    title: 'Project Defaults',
    href: '/settings/projects',
    icon: Code2,
    description: 'Set default project settings and templates',
  },
  {
    title: 'Privacy & Security',
    href: '/settings/privacy',
    icon: Shield,
    description: 'Manage security and privacy preferences',
  },
  {
    title: 'Advanced',
    href: '/settings/advanced',
    icon: Terminal,
    description: 'Developer tools and advanced settings',
  },
  {
    title: 'About',
    href: '/settings/about',
    icon: Info,
    description: 'View application information',
  },
];

interface SettingsNavProps {
  className?: string;
}

export function SettingsNav({ className }: SettingsNavProps) {
  const location = useLocation();

  return (
    <nav className={cn('flex space-x-2', className)}>
      {settingsNavItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'inline-flex items-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-secondary text-secondary-foreground'
                : 'hover:bg-secondary/50'
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            {item.title}
            {isActive && (
              <ChevronRight className="ml-auto h-4 w-4" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
