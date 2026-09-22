import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createAppTheme } from '@/shared/styles/createAppTheme';
import { appDarkPalette } from '@/shared/styles/appPalette';
import { OrderStatusModal } from './OrderStatusModal';

const mocks = vi.hoisted(() => ({
  orderState: {
    type: { id: 3, text: 'Предзаказы' },
    setType: vi.fn(),
    types: [
      { id: 1, text: 'Активные' },
      { id: 3, text: 'Предзаказы' },
      { id: 2, text: 'Мои отмеченные' },
    ],
  },
}));

vi.mock('@/entities/order/model/order.store', () => ({
  useOrdersStore: (selector: (state: typeof mocks.orderState) => unknown) =>
    selector(mocks.orderState),
}));

function renderModal(darkMode: boolean) {
  return render(
    <ThemeProvider theme={createAppTheme(darkMode)}>
      <OrderStatusModal open onClose={vi.fn()} globalFontSize={16} />
    </ThemeProvider>
  );
}

describe('OrderStatusModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('keeps a white sheet in the light theme', () => {
    renderModal(false);

    expect(screen.getByText('Активные')).toBeInTheDocument();
    expect(document.querySelector('.orderStatusSheet')).toHaveStyle({
      backgroundColor: '#FFFFFF',
    });
  });

  it('uses the dark surface for the sheet when the app theme is dark', () => {
    renderModal(true);

    expect(document.querySelector('.orderStatusSheet')).toHaveStyle({
      backgroundColor: appDarkPalette.surface,
    });
  });
});
