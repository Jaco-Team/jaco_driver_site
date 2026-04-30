import React, { useEffect } from 'react';

import dynamic from 'next/dynamic';

const DynamicHomePage = dynamic(
  () => import('@/widgets/password-recovery-screen/ui/PasswordRecoveryScreen')
);

import { useHeaderStore } from '@/features/header/model/header.store';

export default function Registration() {
  const setActivePageRU = useHeaderStore((state) => state.setActivePageRU);

  useEffect(() => {
    setActivePageRU('Восстановление пароля');
  }, [setActivePageRU]);

  return (
    <>
      <DynamicHomePage />
    </>
  );
}
