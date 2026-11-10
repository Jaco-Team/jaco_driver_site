import type { ReactNode } from 'react';

import AuthIcon from './AuthIcon';

import { inter } from '@/shared/ui/Font';

interface AuthCardProps {
  title: string;
  subtitle: ReactNode;
  /** code — подзаголовок с номером, success — увеличенный отступ под ним. */
  subtitleVariant?: 'default' | 'code' | 'success';
  /** Что стоит над заголовком: логотип, значок успеха или ничего. */
  mark?: 'logo' | 'success' | 'none';
  onBack?: () => void;
  children: ReactNode;
}

/** Карточка входа и восстановления пароля: та же, что на странице входа SSO и в ШЭФ. */
export default function AuthCard({
  title,
  subtitle,
  subtitleVariant = 'default',
  mark = 'logo',
  onBack,
  children,
}: AuthCardProps) {
  const subtitleClass =
    subtitleVariant === 'default' ? 'sso-subtitle' : `sso-subtitle sso-subtitle--${subtitleVariant}`;

  return (
    <main className={`sso ${inter.variable}`}>
      <section className="sso-card" aria-labelledby="sso-title">
        {onBack ? (
          <button className="sso-back" type="button" aria-label="Назад" onClick={onBack}>
            <AuthIcon name="back" />
          </button>
        ) : null}
        {mark === 'logo' ? (
          // eslint-disable-next-line @next/next/no-img-element -- значок 32px, оптимизация не нужна
          <img className="sso-logo" src="/Logo.png" alt="Жако" width={32} height={32} />
        ) : null}
        {mark === 'success' ? <AuthIcon name="success" className="sso-success-icon" /> : null}
        <h1 className="sso-title" id="sso-title">
          {title}
        </h1>
        <p className={subtitleClass}>{subtitle}</p>
        {children}
      </section>
    </main>
  );
}
