import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useFeedbackStore } from './feedback.store';
import { useFeedbackPage } from './useFeedbackPage';

const mocks = vi.hoisted(() => ({
  isOnline: true,
  getFeedbacks: vi.fn(),
}));

vi.mock('@/features/offline/model/connectivity.store', () => ({
  isAppOnline: () => mocks.isOnline,
  markAppOffline: vi.fn(),
  useConnectivityStore: (selector: (state: { isOnline: boolean }) => unknown) =>
    selector({ isOnline: mocks.isOnline }),
}));

vi.mock('@/entities/feedback/api/feedback.api', () => ({
  getFeedbacks: mocks.getFeedbacks,
  saveFeedbacks: vi.fn(),
}));

const feedback = {
  id: 1,
  type: 'ошибка',
  title: 'Карта',
  description: 'Описание',
  status: 1 as const,
  answer: null,
  date_time_create: '2026-09-24 12:00:00',
  link: null,
};

describe('useFeedbackPage offline behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isOnline = true;
    mocks.getFeedbacks.mockResolvedValue({ data: [feedback] });
    useFeedbackStore.setState({
      feedbacks: [feedback],
      feedbacksAll: [feedback],
      addModal: false,
      isLoad: false,
    });
  });

  it('closes an opened feedback and clears the list when connectivity is lost', async () => {
    const { result, rerender } = renderHook(() => useFeedbackPage());

    act(() => result.current.handleCardClick(feedback));
    expect(result.current.bottomSheetOpen).toBe(true);

    mocks.isOnline = false;
    rerender();

    await waitFor(() => {
      expect(result.current.bottomSheetOpen).toBe(false);
      expect(result.current.selectedFeedback).toBeNull();
      expect(result.current.feedbacks).toEqual([]);
      expect(useFeedbackStore.getState().feedbacksAll).toEqual([]);
    });
  });

  it('does not open a feedback card while offline', async () => {
    mocks.isOnline = false;
    const { result } = renderHook(() => useFeedbackPage());

    await act(async () => {
      await Promise.resolve();
    });

    act(() => result.current.handleCardClick(feedback));

    expect(result.current.bottomSheetOpen).toBe(false);
    expect(result.current.selectedFeedback).toBeNull();
  });
});
