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
} from 'lucide-react';

const settingsSections = [
  {
    id: 'general',
    label: 'General',
    icon: Settings,
    path: '/settings/general',
  },
  {
    id: 'ai',
    label: 'AI Configuration',
    icon: Sliders,
    path: '/settings/ai',
  },
  {
    id: 'appearance',
    label: 'Appearance',
    icon: Palette,
    path: '/settings/appearance',
  },
  {
    id: 'projects',
    label: 'Project Defaults',
    icon: Code2,
    path: '/settings/projects',
  },
  {
    id: 'privacy',
    label: 'Privacy & Security',
    icon: Shield,
    path: '/settings/privacy',
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: Terminal,
    path: '/settings/advanced',
  },
  {
    id: 'about',
    label: 'About',
    icon: Info,
    path: '/settings/about',
  },
];

export function SettingsSidebar() {
  const location = useLocation();

  return (
    <nav className="space-y-2">
      {settingsSections.map((section) => {
        const Icon = section.icon;
        const isActive = location.pathname === section.path;

        return (
          <Link
            key={section.id}
            to={section.path}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-secondary text-secondary-foreground'
                : 'hover:bg-secondary/50'
            )}
          >
            <Icon className="h-4 w-4" />
            {section.label}
          </Link>
        );
      })}
    </nav>
  );
}
