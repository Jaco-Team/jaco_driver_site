export type FeedbackStatus = 0 | 1 | 2 | 3 | 4;

export interface Feedback {
  id: number;
  type: string;
  title: string;
  description: string;
  status: FeedbackStatus;
  answer: string | null;
  date_time_create: string;
  link: string | null;
  images?: string[];
}

export interface FeedbackResponse {
  feedbacks: Feedback[];
}

export interface CreateFeedbackData {
  type: string;
  title: string;
  description: string;
  img: File[];
  is_need_notification: boolean;
}
export interface SnackbarState {
  open: boolean;
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
  severity: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

export interface FeedbackStore {
  search: string;
  snackbar: SnackbarState;
  setSnackbar: (snackbar: Partial<SnackbarState>) => void;
  hideSnackbar: () => void;
  feedbacks: Feedback[];
  feedbacksAll: Feedback[];
  isLoad: boolean;
  addModal: boolean;
  status: FeedbackStatus;
  type: string;
  title: string;
  description: string;
  img: File[] | null;
  is_need_notification: boolean;

  setForm: (type: keyof Omit<CreateFeedbackData, 'img'> | 'img', value: any) => void;
  setSearch: (search: string) => void;
  setIsLoad: (load: boolean) => void;
  setAddModal: (load: boolean) => void;
  changeStatus: (status: FeedbackStatus) => void;
  getFeedbacks: () => Promise<void>;
  saveFeedbacks: () => Promise<void>;
}

export const statusArr = [
  { id: 0, name: 'Все' },
  { id: 1, name: 'Новое' },
  { id: 2, name: 'В работе' },
  { id: 3, name: 'Отклонено' },
  { id: 4, name: 'Решено' },
] as const;

export const feedbackTypes = ['предложение', 'ошибка', 'улучшение', 'другое'] as const;
