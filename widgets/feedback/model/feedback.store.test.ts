import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useFeedbackStore } from './feedback.store';

const mocks = vi.hoisted(() => ({
  getFeedbacks: vi.fn(),
  saveFeedbacks: vi.fn(),
  isOnline: true,
  markAppOffline: vi.fn(),
}));

vi.mock('@/entities/feedback/api/feedback.api', () => ({
  getFeedbacks: mocks.getFeedbacks,
  saveFeedbacks: mocks.saveFeedbacks,
}));

vi.mock('@/features/offline/model/connectivity.store', () => ({
  isAppOnline: () => mocks.isOnline,
  markAppOffline: mocks.markAppOffline,
}));

const sampleFeedbacks = [
  {
    id: 1,
    type: 'ошибка',
    title: 'Карта не открывается',
    description: 'После обновления',
    status: 1 as const,
    answer: null,
    date_time_create: '2026-04-01 12:00:00',
    link: null,
  },
  {
    id: 2,
    type: 'предложение',
    title: 'Тёмная тема',
    description: 'Добавить ночной режим',
    status: 4 as const,
    answer: 'Сделаем',
    date_time_create: '2026-04-02 12:00:00',
    link: null,
  },
];

function resetStore() {
  useFeedbackStore.setState({
    search: '',
    feedbacks: [],
    feedbacksAll: [],
    isLoad: false,
    isSaving: false,
    addModal: false,
    status: 0,
    type: 'предложение',
    title: '',
    description: '',
    img: null,
    is_need_notification: false,
    snackbar: {
      open: false,
      vertical: 'bottom',
      horizontal: 'center',
      severity: 'success',
      message: '',
    },
  });
}

describe('feedback store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isOnline = true;
    resetStore();
  });

  it('loads feedbacks and keeps the full list for filters', async () => {
    mocks.getFeedbacks.mockResolvedValue({ data: sampleFeedbacks });

    await useFeedbackStore.getState().getFeedbacks();

    expect(useFeedbackStore.getState().feedbacks).toHaveLength(2);
    expect(useFeedbackStore.getState().feedbacksAll).toHaveLength(2);
    expect(useFeedbackStore.getState().isLoad).toBe(false);
  });

  it('filters by search and status', async () => {
    mocks.getFeedbacks.mockResolvedValue({ data: sampleFeedbacks });
    await useFeedbackStore.getState().getFeedbacks();

    useFeedbackStore.getState().setSearch('карта');
    expect(useFeedbackStore.getState().feedbacks.map((item) => item.id)).toEqual([1]);

    useFeedbackStore.getState().setSearch('');
    useFeedbackStore.getState().changeStatus(4);
    expect(useFeedbackStore.getState().feedbacks.map((item) => item.id)).toEqual([2]);
  });

  it('does not save an empty title', async () => {
    useFeedbackStore.getState().setForm('description', 'Текст');

    await useFeedbackStore.getState().saveFeedbacks();

    expect(mocks.saveFeedbacks).not.toHaveBeenCalled();
    expect(useFeedbackStore.getState().snackbar).toMatchObject({
      open: true,
      severity: 'error',
      message: 'Пожалуйста, заполните заголовок',
    });
  });

  it('creates feedback and reloads the list', async () => {
    mocks.saveFeedbacks.mockResolvedValue({ message: 'Отзыв успешно создан!' });
    mocks.getFeedbacks.mockResolvedValue({ data: sampleFeedbacks });

    useFeedbackStore.setState({
      title: 'Новая идея',
      description: 'Описание',
      addModal: true,
    });

    await useFeedbackStore.getState().saveFeedbacks();

    expect(mocks.saveFeedbacks).toHaveBeenCalledTimes(1);
    expect(useFeedbackStore.getState().addModal).toBe(false);
    expect(useFeedbackStore.getState().title).toBe('');
    expect(useFeedbackStore.getState().feedbacks).toHaveLength(2);
    expect(useFeedbackStore.getState().snackbar.message).toBe('Отзыв успешно создан!');
  });

  it('clears the previously loaded list without keeping feedback offline', async () => {
    useFeedbackStore.setState({
      feedbacks: sampleFeedbacks,
      feedbacksAll: sampleFeedbacks,
      isLoad: true,
    });

    useFeedbackStore.getState().clearFeedbacks();

    expect(useFeedbackStore.getState().feedbacks).toEqual([]);
    expect(useFeedbackStore.getState().feedbacksAll).toEqual([]);
    expect(useFeedbackStore.getState().isLoad).toBe(false);
  });

  it('does not show a feedback loading error when the app is offline', async () => {
    mocks.isOnline = false;
    mocks.getFeedbacks.mockRejectedValue(new Error('Network Error'));

    await useFeedbackStore.getState().getFeedbacks();

    expect(useFeedbackStore.getState().snackbar.open).toBe(false);
    expect(useFeedbackStore.getState().isLoad).toBe(false);
    expect(mocks.markAppOffline).not.toHaveBeenCalled();
  });

  it('marks the app offline when an online feedback request fails because of the network', async () => {
    mocks.getFeedbacks.mockRejectedValue(
      Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK' })
    );

    await useFeedbackStore.getState().getFeedbacks();

    expect(useFeedbackStore.getState().snackbar.open).toBe(false);
    expect(useFeedbackStore.getState().isLoad).toBe(false);
    expect(mocks.markAppOffline).toHaveBeenCalledTimes(1);
  });
});
