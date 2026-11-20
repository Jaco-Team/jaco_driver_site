import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, expect, it } from 'vitest';

import { createAppTheme } from '@/shared/styles/createAppTheme';
import { FinishStatus } from './FinishStatus';

describe('completion status block', () => {
  it.each([false, true])('shows only saved completion status in darkMode=%s', (darkMode) => {
    const { rerender } = render(
      <ThemeProvider theme={createAppTheme(darkMode)}>
        <FinishStatus globalFontSize={26} />
      </ThemeProvider>
    );
    expect(screen.getByRole('status')).toHaveTextContent('Завершение сохранено. Ожидает отправки.');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    rerender(
      <ThemeProvider theme={createAppTheme(darkMode)}>
        <FinishStatus globalFontSize={26} acknowledged />
      </ThemeProvider>
    );
    expect(screen.getByRole('status')).toHaveTextContent(
      'Завершение отправлено. Обновляем статус.'
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
