import { useEffect } from 'react';

import Meta from '@/components/meta';
import { useHeaderStore } from '@/features/header/model/header.store';
import { useProtectedRoute } from '@/shared/lib/session/useProtectedRoute';
import { AppHeader } from '@/widgets/app-header/ui/AppHeader';
import GraphScreen from '@/widgets/graph-screen/ui/GraphScreen';

export default function GraphPage() {
  const { isAuthenticated } = useProtectedRoute();
  const setActivePageRU = useHeaderStore((state) => state.setActivePageRU);

  useEffect(() => {
    setActivePageRU('График работы');
  }, [setActivePageRU]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Meta title="График работы">
      <AppHeader />
      <GraphScreen />
    </Meta>
  );
}
