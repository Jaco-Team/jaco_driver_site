import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import InitialPage from '@/pages/initial';

vi.mock('next/dynamic', () => ({
  default: () =>
    function DynamicInitialScreen() {
      return <div data-testid="initial-screen" />;
    },
}));

describe('InitialPage', () => {
  it('renders the initial screen', () => {
    render(<InitialPage />);

    expect(screen.getByTestId('initial-screen')).toBeInTheDocument();
  });
});
