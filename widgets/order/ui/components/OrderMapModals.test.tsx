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

  it('keeps the original confirmation content during the closing transition', () => {
    const props = { onClose: vi.fn(), onConfirm: vi.fn() };
    const { rerender } = render(
      <OrderConfirmModal open orderId={866503} typeConfirm="cancel" {...props} />
    );

    rerender(<OrderConfirmModal open={false} orderId={null} typeConfirm={null} {...props} />);

    expect(screen.queryByText('Подтверждение')).not.toBeInTheDocument();
    expect(screen.getByText('Отменить заказ')).toBeInTheDocument();
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

    expect(modal.className).toContain('MuiDrawer-anchorBottom');
    expect(screen.getByText(/Нет доступа к геолокации/)).toBeInTheDocument();
    expect(screen.queryByText('User denied Geolocation')).not.toBeInTheDocument();
  });

  it('shows the offline action message without changing an order', () => {
    render(
      <ErrorModal
        open
        errorText="Нет интернета. Действие будет доступно после восстановления связи."
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Нет интернета')).toBeInTheDocument();
    expect(
      screen.getByText('Действие будет доступно после восстановления связи.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Понятно' })).toBeInTheDocument();
  });

  it('keeps the error content while the bottom sheet closes', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <ErrorModal
        open
        errorText="Нет интернета. Действие будет доступно после восстановления связи."
        onClose={onClose}
      />
    );

    rerender(<ErrorModal open={false} errorText="" onClose={onClose} />);

    expect(screen.getByText('Нет интернета')).toBeInTheDocument();
    expect(screen.queryByText('Произошла неизвестная ошибка')).not.toBeInTheDocument();
  });
});
