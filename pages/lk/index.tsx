import Meta from '@/components/meta';
import { useHeaderStore } from '@/features/header/model/header.store';
import type { CabinetPageOptions } from '@/shared/config/cabinetPreview';
import { useProtectedRoute } from '@/shared/lib/session/useProtectedRoute';
import { AppHeader } from '@/widgets/app-header/ui/AppHeader';
import { CabinetPreview } from '@/widgets/cabinet-screen/ui/CabinetPreview';
import { LiveCabinet } from '@/widgets/cabinet-screen/ui/LiveCabinet';

function AuthenticatedCabinet({ showTestPhoto }: { showTestPhoto: boolean }) {
  const { isAuthenticated, session } = useProtectedRoute();
  const showStatistics = useHeaderStore((state) => state.is_need_page_stat);

  if (!isAuthenticated) return null;

  return (
    <Meta title="Личный кабинет">
      <LiveCabinet
        key={session.token}
        token={session.token}
        showTestPhoto={showTestPhoto}
        fullName={session.user?.name?.trim() || null}
        showStatistics={showStatistics}
      />
    </Meta>
  );
}

export default function CabinetPage({ cabinetPreview, showTestPhoto = false }: CabinetPageOptions) {
  if (!cabinetPreview) return <AuthenticatedCabinet showTestPhoto={showTestPhoto} />;

  return (
    <Meta title="Личный кабинет">
      <AppHeader />
      <CabinetPreview {...cabinetPreview} />
    </Meta>
  );
}
