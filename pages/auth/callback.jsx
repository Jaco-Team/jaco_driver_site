import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';

import Meta from '@/components/meta.js';
import { fetchMe, getApiErrorInfo } from '@/shared/api/client';
import { log } from '@/components/analytics';
import { markSessionAuthenticated, markSessionUnauthorized } from '@/components/sessionHook';

import { roboto } from '@/ui/Font';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const finish = async () => {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status');
      const code = params.get('code');

      if (status !== 'success') {
        log('auth_sso_callback_fail', 'Ошибка SSO авторизации', { code: code || 'unknown' });
        markSessionUnauthorized();

        if (!cancelled) {
          router.replace('/auth?error=sso_failed', { scroll: false });
        }

        return;
      }

      try {
        const me = await fetchMe();

        if (cancelled) {
          return;
        }

        markSessionAuthenticated(me);
        log('auth_sso_callback_success', 'Успешная SSO авторизация');
        router.replace('/list_orders', { scroll: false });
      } catch (error) {
        const errorInfo = getApiErrorInfo(error);

        log('auth_sso_callback_fail', 'Ошибка SSO авторизации', {
          status: errorInfo.status || 'unknown',
        });

        markSessionUnauthorized();

        if (!cancelled) {
          router.replace('/auth?error=sso_failed', { scroll: false });
        }
      }
    };

    void finish();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <Meta title="SSO авторизация">
      <Grid container justifyContent="center" className={`auth ${roboto.variable}`}>
        <Grid size={{ xs: 12, md: 8, lg: 5 }}>
          <section className="auth__panel auth__panel--solo" style={{ alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <CircularProgress />
            <h2 className="auth__panelTitle" style={{ marginBottom: 0 }}>Завершаем вход</h2>
            <p className="auth__panelText" style={{ textAlign: 'center', maxWidth: 360 }}>
              Проверяем авторизацию и перенаправляем в приложение.
            </p>
          </section>
        </Grid>
      </Grid>
    </Meta>
  );
}
