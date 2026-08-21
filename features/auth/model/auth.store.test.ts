import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useAuthStore } from './auth.store';

const mocks = vi.hoisted(() => ({
  loginToken: vi.fn(),
  fetchMe: vi.fn(),
  sendPasswordRecoveryCode: vi.fn(),
  confirmPasswordRecoveryCode: vi.fn(),
  getAuthToken: vi.fn(),
  clearAuthToken: vi.fn(),
}));

vi.mock('@/features/auth/api/auth.api', () => ({
  loginToken: mocks.loginToken,
  fetchMe: mocks.fetchMe,
  sendPasswordRecoveryCode: mocks.sendPasswordRecoveryCode,
  confirmPasswordRecoveryCode: mocks.confirmPasswordRecoveryCode,
}));

vi.mock('@/shared/api/token', () => ({
  getAuthToken: mocks.getAuthToken,
  setAuthToken: vi.fn(),
  clearAuthToken: mocks.clearAuthToken,
}));

function resetStore() {
  window.localStorage.clear();
  useAuthStore.setState({
    isSubmitting: false,
    isSessionRefreshing: false,
    loginErr: '',
    session: { isAuth: 'load', token: '', user: null },
  });
}

describe('auth store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetStore();
    mocks.getAuthToken.mockReturnValue(null);
  });

  it('stores the session after token login and /me', async () => {
    mocks.loginToken.mockResolvedValue({ token: 'token-1', user_id: 7, login: '79870001122' });
    mocks.fetchMe.mockResolvedValue({
      user_id: 7,
      login: '79870001122',
      name: 'Водитель',
      city_id: 1,
      point_id: 12,
    });
    mocks.getAuthToken.mockReturnValue('token-1');

    const result = await useAuthStore.getState().login('79870001122', 'Password1');

    expect(result.st).toBe(true);
    expect(result.isAuth).toBe(true);
    expect(useAuthStore.getState().session.user).toMatchObject({
      id: 7,
      user_id: 7,
      login: '79870001122',
      token: 'token-1',
    });
    expect(useAuthStore.getState().loginErr).toBe('');
  });

  it('clears the session on CSRF 419 without treating it as a valid login', async () => {
    mocks.loginToken.mockRejectedValue({
      response: {
        status: 419,
        data: { message: 'CSRF token mismatch.' },
      },
    });

    const result = await useAuthStore.getState().login('79870001122', 'Password1');

    expect(result.st).toBe(false);
    expect(result.status).toBe(419);
    expect(result.text).toBe('Сессия истекла. Обновите страницу и попробуйте снова.');
    expect(useAuthStore.getState().session.isAuth).toBe(false);
    expect(mocks.clearAuthToken).toHaveBeenCalled();
  });

  it('maps password recovery send errors including captcha', async () => {
    mocks.sendPasswordRecoveryCode.mockRejectedValue({
      response: {
        status: 422,
        data: {
          text: 'Не удалось подтвердить CAPTCHA. Попробуйте ещё раз.',
          captcha_required: true,
        },
      },
    });

    const result = await useAuthStore
      .getState()
      .requestPasswordRecoveryCode('79870001122', 'Password1');

    expect(result.st).toBe(false);
    expect(result.captcha_required).toBe(true);
    expect(result.text).toContain('CAPTCHA');
  });

  it('confirms a recovery code', async () => {
    mocks.confirmPasswordRecoveryCode.mockResolvedValue({ st: true });

    const result = await useAuthStore
      .getState()
      .confirmPasswordRecoveryCode('79870001122', '123456');

    expect(result).toEqual({ st: true });
    expect(mocks.confirmPasswordRecoveryCode).toHaveBeenCalledWith('79870001122', '123456');
  });

  it('refreshSession uses /me when a token exists', async () => {
    mocks.getAuthToken.mockReturnValue('token-1');
    mocks.fetchMe.mockResolvedValue({
      user_id: 7,
      login: '79870001122',
      settings: { fontSize: 16 },
    });

    const result = await useAuthStore.getState().refreshSession();

    expect(result.st).toBe(true);
    expect(useAuthStore.getState().session.user?.settings?.fontSize).toBe(16);
  });
});
