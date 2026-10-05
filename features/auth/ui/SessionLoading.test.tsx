import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SessionLoading } from './SessionLoading';

describe('session loading', () => {
  it('shows a visible accessible loading state', () => {
    render(<SessionLoading fontSize={16} />);

    expect(screen.getByRole('status')).toHaveTextContent('Загружаем приложение');
    expect(screen.getByText('Загружаем приложение')).toHaveStyle({ fontSize: '16px' });
  });

  it.each([
    [8, 12],
    [32, 22],
  ])('clamps font size %s to %s', (fontSize, expected) => {
    render(<SessionLoading fontSize={fontSize} />);

    expect(screen.getByText('Загружаем приложение')).toHaveStyle({
      fontSize: `${expected}px`,
    });
  });
});
