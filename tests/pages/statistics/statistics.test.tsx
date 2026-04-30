import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';

import StatisticsPage from '@/pages/statistics';

const mocks = vi.hoisted(() => ({
  setActivePageRU: vi.fn(),
  isAuthenticated: true,
}));

vi.mock('next/dynamic', () => ({
  default: () =>
    function DynamicStatisticsScreen() {
      return <div data-testid="statistics-screen" />;
    },
}));

vi.mock('@/components/meta', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-meta-title={title}>{children}</div>
  ),
}));

vi.mock('@/widgets/app-header/ui/AppHeader', () => ({
  AppHeader: () => <header data-testid="app-header" />,
}));

vi.mock('@/shared/lib/session/useProtectedRoute', () => ({
  useProtectedRoute: () => ({ isAuthenticated: mocks.isAuthenticated }),
}));

vi.mock('@/features/header/model/header.store', () => ({
  useHeaderStore: (
    selector: (state: { setActivePageRU: typeof mocks.setActivePageRU }) => unknown
  ) => selector({ setActivePageRU: mocks.setActivePageRU }),
}));

describe('StatisticsPage', () => {
  beforeEach(() => {
    mocks.isAuthenticated = true;
    mocks.setActivePageRU.mockClear();
  });

  it('renders the statistics screen for authenticated users', async () => {
    render(<StatisticsPage />);

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('statistics-screen')).toBeInTheDocument();

    await waitFor(() => expect(mocks.setActivePageRU).toHaveBeenCalledWith('Статистика'));
  });

  it('renders nothing while unauthenticated', () => {
    mocks.isAuthenticated = false;

    const { container } = render(<StatisticsPage />);

    expect(container).toBeEmptyDOMElement();
  });
});
