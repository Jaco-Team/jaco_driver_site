import { type Dispatch, type SetStateAction } from 'react';
import { useRouter } from 'next/navigation';

type AppRouter = ReturnType<typeof useRouter>;

export interface UseAuthPageResult {
  loginWithSso: () => void;
  loginFN: () => Promise<void>;
  myLogin: string;
  setMyLogin: Dispatch<SetStateAction<string>>;
  myPWD: string;
  setMyPWD: Dispatch<SetStateAction<string>>;
  loginErr: string;
  router: AppRouter;
  captchaRequired: boolean;
  captchaResetKey: number;
  setCaptchaToken: (token: string) => void;
  resetCaptcha: () => void;
  retryAfter: number;
  canSubmit: boolean;
}
