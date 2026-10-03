import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { OrdersOfflineMap } from './OrdersOfflineMap';

vi.mock('./OrdersMapOfflineList', () => ({
  OrdersMapOfflineList: ({ onOpenOrders }: { onOpenOrders: (id: number) => void }) => (
    <button type="button" onClick={() => onOpenOrders(7)}>
      Открыть заказ из списка
    </button>
  ),
}));

const props = {
  pointId: 12,
  groups: [],
  home: null,
  dark: false,
  theme: 'white',
  mapScale: '1',
  showZoomControls: true,
  typeText: 'Активные',
  globalFontSize: 16,
  onOpenOrders: vi.fn(),
  onHomeClick: vi.fn(),
  showCompass: false,
};

function createHandle() {
  return {
    destroy: vi.fn(),
    updateGroups: vi.fn(),
    centerOnCoordinate: vi.fn(),
  };
}

describe('OrdersOfflineMap runtime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete window.JacoOfflineOrdersMap;
    document.getElementById('jaco-offline-orders-map-runtime')?.remove();
  });

  afterEach(() => {
    delete window.JacoOfflineOrdersMap;
    document.getElementById('jaco-offline-orders-map-runtime')?.remove();
  });

  it('opens the saved map again and releases the old instance on close', async () => {
    const firstHandle = createHandle();
    const secondHandle = createHandle();
    const mount = vi
      .fn<NonNullable<Window['JacoOfflineOrdersMap']>['mount']>()
      .mockImplementationOnce(async (options) => {
        options.onReady();
        return firstHandle;
      })
      .mockImplementationOnce(async (options) => {
        options.onReady();
        return secondHandle;
      });
    window.JacoOfflineOrdersMap = { version: '25', mount };

    const first = render(<OrdersOfflineMap {...props} />);
    await waitFor(() => expect(firstHandle.updateGroups).toHaveBeenCalledWith([]));
    expect(screen.queryByText('Открываем сохранённую карту…')).not.toBeInTheDocument();

    mount.mock.calls[0][0].onOrderClick(7);
    expect(props.onOpenOrders).toHaveBeenCalledWith(7);

    first.unmount();
    expect(firstHandle.destroy).toHaveBeenCalledTimes(1);

    const second = render(<OrdersOfflineMap {...props} />);
    await waitFor(() => expect(secondHandle.updateGroups).toHaveBeenCalledWith([]));
    expect(mount).toHaveBeenCalledTimes(2);
    second.unmount();
    expect(secondHandle.destroy).toHaveBeenCalledTimes(1);
  });

  it('retries a failed runtime script and keeps the saved order list available', async () => {
    const first = render(<OrdersOfflineMap {...props} />);
    const failedScript = document.getElementById('jaco-offline-orders-map-runtime');
    expect(failedScript).toBeInstanceOf(HTMLScriptElement);

    fireEvent.error(failedScript!);
    await screen.findByText(/Не удалось загрузить модуль офлайн-карты/);
    fireEvent.click(screen.getByText('Открыть заказ из списка'));
    expect(props.onOpenOrders).toHaveBeenCalledWith(7);
    first.unmount();

    const handle = createHandle();
    const mount = vi.fn<NonNullable<Window['JacoOfflineOrdersMap']>['mount']>(async (options) => {
      options.onReady();
      return handle;
    });
    const second = render(<OrdersOfflineMap {...props} />);
    const retryScript = document.getElementById('jaco-offline-orders-map-runtime');
    expect(retryScript).toBeInstanceOf(HTMLScriptElement);
    expect(retryScript).not.toBe(failedScript);

    window.JacoOfflineOrdersMap = { version: '25', mount };
    fireEvent.load(retryScript!);

    await waitFor(() => expect(handle.updateGroups).toHaveBeenCalledWith([]));
    expect(screen.queryByText(/Не удалось загрузить модуль офлайн-карты/)).not.toBeInTheDocument();
    second.unmount();
    expect(handle.destroy).toHaveBeenCalledTimes(1);
  });
});
