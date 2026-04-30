import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import RegistrationPage from '@/pages/registration';

const mocks = vi.hoisted(() => ({
  setActivePageRU: vi.fn(),
}));

vi.mock('next/dynamic', () => ({
  default: () =>
    function DynamicPasswordRecoveryScreen() {
      return <div data-testid="password-recovery-screen" />;
    },
}));

vi.mock('@/features/header/model/header.store', () => ({
  useHeaderStore: (
    selector: (state: { setActivePageRU: typeof mocks.setActivePageRU }) => unknown
  ) => selector({ setActivePageRU: mocks.setActivePageRU }),
}));

describe('RegistrationPage', () => {
  beforeEach(() => {
    mocks.setActivePageRU.mockClear();
  });

  it('renders the password recovery screen', async () => {
    render(<RegistrationPage />);

    expect(screen.getByTestId('password-recovery-screen')).toBeInTheDocument();

    await waitFor(() =>
      expect(mocks.setActivePageRU).toHaveBeenCalledWith('Восстановление пароля')
    );
  });
});
