import type { Dispatch, KeyboardEvent, SetStateAction } from 'react';

import type { useAuthStore } from '@/features/auth/model/auth.store';

export type RecoveryStep = 0 | 1;

export type SubmitHandler = () => void | Promise<void>;

export type SubmitOnEnter = (
  handler: SubmitHandler
) => (event: KeyboardEvent<HTMLInputElement>) => void;

type AuthStoreState = ReturnType<typeof useAuthStore.getState>;

export type RequestPasswordRecoveryCode = AuthStoreState['requestPasswordRecoveryCode'];
export type ConfirmPasswordRecoveryCode = AuthStoreState['confirmPasswordRecoveryCode'];
export type LoginByPassword = AuthStoreState['login'];

export interface UseRegistrationPageResult {
  loader: boolean;
  panelTitle: string;
  panelText: string;
  activeStep: RecoveryStep;
  myLogin: string;
  setMyLogin: Dispatch<SetStateAction<string>>;
  myPWD: string;
  setMyPWD: Dispatch<SetStateAction<string>>;
  submitOnEnter: SubmitOnEnter;
  requestRecoveryCode: () => Promise<void>;
  myCode: string;
  setMyCode: Dispatch<SetStateAction<string>>;
  confirmRecoveryCode: () => Promise<void>;
  errorText: string;
  helperText: string;
}
