import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { OrderConfirmModal } from './OrderConfirmModal';
import { ErrorModal } from '@/shared/ui/ErrorModal/ErrorModal';

vi.mock('@/features/header/model/header.store', () => ({
  useHeaderStore: (selector: (state: { globalFontSize: number }) => unknown) =>
    selector({ globalFontSize: 16 }),
}));

describe('order map modals', () => {
  it('renders confirmation as a bottom sheet, not a centered dialog', () => {
    render(
      <OrderConfirmModal
        open
        orderId={866503}
        typeConfirm="finish"
        onClose={vi.fn()}
        onConfirm={vi.fn()}
      />
    );

    const sheet = screen.getByTestId('order-confirm-modal');

    expect(sheet.className).toContain('MuiDrawer-anchorBottom');
    expect(sheet.className).not.toContain('MuiDialog-root');
    expect(screen.getByText('Завершить заказ')).toBeInTheDocument();
    expect(screen.getByText(/#866503/)).toBeInTheDocument();
    expect(screen.queryByText('Взять заказ')).not.toBeInTheDocument();
  });

  it('disables confirm buttons while the request is in flight', () => {
    const onConfirm = vi.fn();

    render(
      <OrderConfirmModal
        open
        orderId={1}
        typeConfirm="cancel"
        busy
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Отменить' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Отменить' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Нет' })).toBeDisabled();
  });

  it('shows a Russian geolocation error in the error modal', () => {
    render(
      <ErrorModal
        open
        errorText={'Нет доступа к геолокации.\n\nРазрешите доступ к местоположению.'}
        onClose={vi.fn()}
      />
    );

    const modal = screen.getByTestId('error-modal');

    expect(modal.className).toContain('MuiDialog-root');
    expect(screen.getByText(/Нет доступа к геолокации/)).toBeInTheDocument();
    expect(screen.queryByText('User denied Geolocation')).not.toBeInTheDocument();
  });
});
