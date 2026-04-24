import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

import useSession from '@/components/sessionHook';

export function useProtectedRoute(): {
  isCheckingAuth: boolean;
  isAuthenticated: boolean;
  session: ReturnType<typeof useSession>;
} {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.isAuth === false) {
      router.replace('/auth', { scroll: false });
    }
  }, [router, session.isAuth]);

  return {
    isCheckingAuth: session.isAuth === 'load',
    isAuthenticated: session.isAuth === true,
    session,
  };
}
