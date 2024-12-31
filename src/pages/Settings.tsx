import React, { Suspense } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { SettingsLayout } from '@/components/settings/settings-layout';
import { GeneralSettings } from '@/components/settings/sections/general-settings';
import { AISettings } from '@/components/settings/sections/ai-settings';
import { AppearanceSettings } from '@/components/settings/sections/appearance-settings';
import { ProjectDefaults } from '@/components/settings/sections/project-defaults';
import { PrivacySecurity } from '@/components/settings/sections/privacy-security';
import { SettingsProvider } from '@/contexts/settings-context';
import { Loader2 } from 'lucide-react';

const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin" />
  </div>
);

export default function Settings() {
  const location = useLocation();

  // Redirect to general settings if no specific section is selected
  if (location.pathname === '/settings') {
    return <Navigate to="/settings/general" replace />;
  }

  return (
    <SettingsProvider>
      <SettingsLayout>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="general" element={<GeneralSettings />} />
            <Route path="ai" element={<AISettings />} />
            <Route path="appearance" element={<AppearanceSettings />} />
            <Route path="projects" element={<ProjectDefaults />} />
            <Route path="privacy" element={<PrivacySecurity />} />
            <Route path="*" element={<Navigate to="/settings/general" replace />} />
          </Routes>
        </Suspense>
      </SettingsLayout>
    </SettingsProvider>
  );
}
