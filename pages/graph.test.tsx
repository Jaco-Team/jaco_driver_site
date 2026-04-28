import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type React from 'react';

import GraphPage from '@/pages/graph';

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

vi.mock('@/widgets/graph-screen/ui/GraphScreen', () => ({
  default: () => <div data-testid="graph-screen" />,
}));

vi.mock('@/shared/lib/session/useProtectedRoute', () => ({
  useProtectedRoute: () => ({ isAuthenticated: mocks.isAuthenticated }),
}));

vi.mock('@/features/header/model/header.store', () => ({
  useHeaderStore: (
    selector: (state: { setActivePageRU: typeof mocks.setActivePageRU }) => unknown
  ) => selector({ setActivePageRU: mocks.setActivePageRU }),
}));

describe('GraphPage', () => {
  beforeEach(() => {
    mocks.isAuthenticated = true;
    mocks.setActivePageRU.mockClear();
  });

  it('renders the graph screen for authenticated users', async () => {
    render(<GraphPage />);

    expect(screen.getByTestId('app-header')).toBeInTheDocument();
    expect(screen.getByTestId('graph-screen')).toBeInTheDocument();

    await waitFor(() => expect(mocks.setActivePageRU).toHaveBeenCalledWith('График работы'));
  });

  it('renders nothing while unauthenticated', () => {
    mocks.isAuthenticated = false;

    const { container } = render(<GraphPage />);

    expect(container).toBeEmptyDOMElement();
  });
});
