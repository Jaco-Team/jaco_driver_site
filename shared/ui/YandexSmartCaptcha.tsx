import dynamic from 'next/dynamic';

const SmartCaptcha = dynamic(
  () => import('@yandex/smart-captcha').then((mod) => mod.SmartCaptcha),
  { ssr: false }
);

export const SMARTCAPTCHA_CLIENT_KEY = process.env.NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY || '';

interface YandexSmartCaptchaProps {
  resetKey: number;
  onSuccess: (token: string) => void;
  onTokenExpired: () => void;
}

export default function YandexSmartCaptcha({
  resetKey,
  onSuccess,
  onTokenExpired,
}: YandexSmartCaptchaProps) {
  if (!SMARTCAPTCHA_CLIENT_KEY) {
    return null;
  }

  return (
    <div className="auth__captcha">
      <SmartCaptcha
        key={resetKey}
        sitekey={SMARTCAPTCHA_CLIENT_KEY}
        language="ru"
        onSuccess={onSuccess}
        onTokenExpired={onTokenExpired}
      />
    </div>
  );
}
