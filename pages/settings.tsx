import React, { useEffect } from 'react';

import dynamic from 'next/dynamic';
import { SettingsForm } from '../widgets/settings-form/ui/SettingsForm';
import Meta from '@/components/meta';
import { useProtectedRoute } from '@/shared/lib/session/useProtectedRoute';
import { useHeaderStore } from '@/features/header/model/header.store';

const DynamicHeader = dynamic(() => import('@/modules/header.jsx'));

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
      <DynamicHeader />
      <SettingsForm />
    </Meta>
  );
}
