import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { OfflineCityMapsSettings } from './OfflineCityMapsSettings';

const mocks = vi.hoisted(() => ({
  state: {
    hydrated: true,
    selectedCityId: 'samara',
    jobs: {} as Record<string, unknown>,
    maps: {} as Record<string, unknown>,
    busyCityId: null as string | null,
    deletingCityId: null,
    error: '',
    selectCity: vi.fn(),
    download: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    remove: vi.fn().mockResolvedValue(undefined),
  },
  isOnline: true,
}));
vi.mock('@/entities/offline-map/model/offlineMap.store', () => ({
  useOfflineMapStore: () => mocks.state,
}));
vi.mock('@/entities/settings', () => ({
  useSettingsStore: (select: (value: unknown) => unknown) => select({ cityId: '1', points: [] }),
}));
vi.mock('@/entities/order/model/order.store', () => ({
  useOrdersStore: (select: (value: unknown) => unknown) => select({ home: null }),
}));
vi.mock('@/features/offline/model/connectivity.store', () => ({
  useConnectivityStore: (select: (value: unknown) => unknown) =>
    select({ isOnline: mocks.isOnline }),
}));
vi.mock('@/components/analytics', () => ({ log: vi.fn() }));
vi.mock('@/shared/ui/SettingsSection/SettingsSection', () => ({
  SettingsSection: ({ children }: { children: ReactNode }) => <section>{children}</section>,
}));

describe('offline city settings', () => {
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isOnline = true;
    mocks.state.jobs = {};
    mocks.state.maps = {};
    mocks.state.busyCityId = null;
    mocks.state.deletingCityId = null;
    mocks.state.error = '';
    mocks.state.selectedCityId = 'samara';
    mocks.state.selectCity.mockImplementation((id: string) => {
      mocks.state.selectedCityId = id;
    });
  });
  it('offers both cities and starts the selected city package', async () => {
    const { rerender } = render(<OfflineCityMapsSettings globalFontSize={16} />);
    expect(screen.getByRole('radio', { name: 'Самара' })).toHaveAttribute('aria-checked', 'true');
    fireEvent.click(screen.getByRole('radio', { name: 'Тольятти' }));
    expect(mocks.state.selectCity).toHaveBeenCalledWith('tolyatti');
    rerender(<OfflineCityMapsSettings globalFontSize={16} />);
    fireEvent.click(screen.getByRole('button', { name: 'Скачать' }));
    expect(mocks.state.download).toHaveBeenCalledWith('tolyatti', false);
  });
  it('deletes a saved map only after confirmation in the bottom sheet', async () => {
    mocks.state.maps = {
      'city:samara': {
        maxZoom: 15,
        savedAt: Date.now(),
        expiresAt: Date.now() + 60_000,
        byteSize: 1024,
      },
    };
    render(<OfflineCityMapsSettings globalFontSize={16} />);

    expect(screen.getByTestId('offline-city-trash-icon')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Удалить карту: Самара' }));
    expect(await screen.findByText('Удалить карту?')).toBeInTheDocument();
    expect(
      screen.getByText('Карта «Самара» будет удалена с этого устройства. Её можно скачать снова.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Нет' })).toBeInTheDocument();
    expect(mocks.state.remove).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Удалить' }));
    });
    expect(mocks.state.remove).toHaveBeenCalledWith('samara');
  });
  it('disables network actions offline', () => {
    mocks.isOnline = false;
    render(<OfflineCityMapsSettings globalFontSize={16} />);
    expect(screen.getByRole('button', { name: 'Скачать' })).toBeDisabled();
    expect(screen.getByText('Для скачивания нужен интернет.')).toBeInTheDocument();
  });
  it('shows paused progress and continues rather than starting from zero', () => {
    mocks.state.jobs = {
      samara: { status: 'paused', completed: 250, total: 1000, byteSize: 1024 },
    };
    render(<OfflineCityMapsSettings globalFontSize={16} />);
    expect(screen.getByText('25%')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Продолжить' }));
    expect(mocks.state.download).toHaveBeenCalledWith('samara', false);
    expect(mocks.state.remove).not.toHaveBeenCalled();
  });
  it('upgrades a layer-14 map without refreshing previously saved layers', () => {
    mocks.state.maps = {
      'city:samara': {
        maxZoom: 14,
        savedAt: Date.now(),
        expiresAt: Date.now() + 60_000,
        byteSize: 17_091_789,
      },
    };
    render(<OfflineCityMapsSettings globalFontSize={16} />);
    expect(screen.getByText('Доступна офлайн')).toBeInTheDocument();
    expect(screen.getByText(/Сохранена ·/)).toBeInTheDocument();
    expect(screen.queryByText('16,3 МБ')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Докачать' }));
    expect(mocks.state.download).toHaveBeenCalledWith('samara', false);
  });
  it('updates availability when the saved map expires without another store update', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-05T10:00:00Z'));
    mocks.state.maps = {
      'city:samara': { savedAt: Date.now(), expiresAt: Date.now() + 60_000, byteSize: 1024 },
    };
    render(<OfflineCityMapsSettings globalFontSize={16} />);
    expect(screen.getByText('Доступна офлайн')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Обновить' })).toBeInTheDocument();
    expect(screen.getByTestId('offline-city-refresh-icon')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(60_000));

    expect(screen.queryByText('Доступна офлайн')).not.toBeInTheDocument();
    expect(screen.getByText(/Нужно обновить/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Скачать' })).toBeInTheDocument();
  });
  it('does not offer an already expired map as available', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-05T10:00:00Z'));
    mocks.state.maps = {
      'city:samara': { savedAt: Date.now() - 1000, expiresAt: Date.now() - 1, byteSize: 1024 },
    };
    render(<OfflineCityMapsSettings globalFontSize={16} />);
    expect(screen.queryByText('Доступна офлайн')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Скачать' })).toBeInTheDocument();
  });
  it('handles the full 29-day lifetime without overflowing the browser timer', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-05T10:00:00Z'));
    const lifetime = 29 * 24 * 60 * 60 * 1000;
    mocks.state.maps = {
      'city:samara': { savedAt: Date.now(), expiresAt: Date.now() + lifetime, byteSize: 1024 },
    };
    render(<OfflineCityMapsSettings globalFontSize={16} />);
    act(() => vi.advanceTimersByTime(2_147_483_647));
    expect(screen.getByText('Доступна офлайн')).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(lifetime - 2_147_483_647));
    expect(screen.queryByText('Доступна офлайн')).not.toBeInTheDocument();
  });
  it('clears the pending expiration timer on unmount', () => {
    vi.useFakeTimers();
    mocks.state.maps = {
      'city:samara': { savedAt: Date.now(), expiresAt: Date.now() + 60_000, byteSize: 1024 },
    };
    const { unmount } = render(<OfflineCityMapsSettings globalFontSize={16} />);
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
import type { ReactNode } from 'react';
