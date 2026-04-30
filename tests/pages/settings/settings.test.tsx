import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';

import SettingsPage from '@/pages/settings';

const mocks = vi.hoisted(() => ({
  setActivePageRU: vi.fn(),
  isAuthenticated: true,
}));

vi.mock('@/components/meta', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-meta-title={title}>{children}</div>
  ),
}));

vi.mock('@/widgets/app-header/ui/AppHeader', () => ({
  AppHeader: () => <header data-testid="app-header" />,
}));

vi.mock('@/widgets/settings-form/ui/SettingsForm', () => ({
  SettingsForm: () => <form data-testid="settings-screen" />,
}));

vi.mock('@/shared/lib/session/useProtectedRoute', () => ({
  useProtectedRoute: () => ({ isAuthenticated: mocks.isAuthenticated }),
}));

vi.mock('@/features/header/model/header.store', () => ({
  useHeaderStore: (
    selector: (state: { setActivePageRU: typeof mocks.setActivePageRU }) => unknown
  ) => selector({ setActivePageRU: mocks.setActivePageRU }),
}));

describe('SettingsPage', () => {
  beforeEach(() => {
    mocks.isAuthenticated = true;
    mocks.setActivePageRU.mockClear();
  });

  it('renders the settings screen for authenticated users', async () => {
    render(<SettingsPage />);

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('settings-screen')).toBeInTheDocument();

    await waitFor(() => expect(mocks.setActivePageRU).toHaveBeenCalledWith('Настройки'));
  });

  it('renders nothing while unauthenticated', () => {
    mocks.isAuthenticated = false;

    const { container } = render(<SettingsPage />);

    expect(container).toBeEmptyDOMElement();
  });
});
