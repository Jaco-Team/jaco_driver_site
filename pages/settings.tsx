import React, { useEffect } from 'react';

import { SettingsForm } from '../widgets/settings-form/ui/SettingsForm';
import { AppHeader } from '@/widgets/app-header/ui/AppHeader';
import Meta from '@/components/meta';
import { useProtectedRoute } from '@/shared/lib/session/useProtectedRoute';
import { useHeaderStore } from '@/features/header/model/header.store';

export default function Settings() {
  const { isAuthenticated } = useProtectedRoute();
  const setActivePageRU = useHeaderStore((state) => state.setActivePageRU);

  useEffect(() => {
    setActivePageRU('Настройки');
  }, [setActivePageRU]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Meta title="Настройки">
      <AppHeader />
      <SettingsForm />
    </Meta>
  );
}
