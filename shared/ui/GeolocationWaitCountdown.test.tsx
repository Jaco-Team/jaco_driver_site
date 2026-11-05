import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  state: null as { deadlineAt: number; startedAt: number } | null,
  listeners: new Set<() => void>(),
}));

vi.mock('@/shared/lib/geolocation', () => ({
  getGeolocationWaitState: () => mocks.state,
  subscribeGeolocationWait: (listener: () => void) => {
    mocks.listeners.add(listener);
    return () => mocks.listeners.delete(listener);
  },
}));

import { GeolocationWaitCountdown } from './GeolocationWaitCountdown';

function setDeadline(value: number | null) {
  act(() => {
    mocks.state = value === null ? null : { deadlineAt: value, startedAt: Date.now() };
    mocks.listeners.forEach((listener) => listener());
  });
}

describe('GeolocationWaitCountdown', () => {
  afterEach(() => {
    vi.useRealTimers();
    mocks.state = null;
  });

  it('counts down the remaining seconds and hides after the wait', () => {
    vi.useFakeTimers();
    render(<GeolocationWaitCountdown fontSize={16} />);
    expect(screen.queryByRole('status')).toBeNull();

    setDeadline(Date.now() + 25000);
    expect(screen.getByRole('status').textContent).toBe('Определяем местоположение · 25 сек.');

    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(screen.getByRole('status').textContent).toBe('Определяем местоположение · 15 сек.');

    act(() => {
      vi.advanceTimersByTime(20000);
    });
    expect(screen.getByRole('status').textContent).toBe('Определяем местоположение…');

    setDeadline(null);
    expect(screen.queryByRole('status')).toBeNull();
  });
});
