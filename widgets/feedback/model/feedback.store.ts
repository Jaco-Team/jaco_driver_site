import { createWithEqualityFn } from 'zustand/traditional';
import { shallow } from 'zustand/shallow';
import { FeedbackStore, SnackbarState } from '@/entities/feedback/model/types';
import { getFeedbacks, saveFeedbacks } from '@/entities/feedback/api/feedback.api';

const initialSnackbar: SnackbarState = {
  open: false,
  vertical: 'bottom',
  horizontal: 'center',
  severity: 'success',
  message: '',
};

export const useFeedbackStore = createWithEqualityFn<FeedbackStore>(
  (set, get) => ({
    search: '',
    feedbacks: [],
    feedbacksAll: [],
    isLoad: false,
    addModal: false,
    status: 0,
    type: 'предложение',
    title: '',
    description: '',
    img: null,
    is_need_notification: false,
    snackbar: initialSnackbar,

    setForm: (type, value) => {
      set({ [type]: value });
    },

    setSearch: (search) => {
      const { feedbacksAll, status } = get();
      set({
        search,
        feedbacks: feedbacksAll.filter(
          (u) =>
            (u.title.includes(search) || u.description.includes(search)) &&
            (u.status === status || status === 0)
        ),
      });
    },

    setIsLoad: (load) => {
      set({ isLoad: load });
    },

    setAddModal: (load) => {
      set({ addModal: load });
    },

    setSnackbar: (snackbar) => {
      set((state) => ({
        snackbar: { ...state.snackbar, ...snackbar, open: true },
      }));
    },

    hideSnackbar: () => {
      set((state) => ({
        snackbar: { ...state.snackbar, open: false },
      }));
    },

    changeStatus: (status) => {
      const { feedbacksAll } = get();
      set({
        feedbacks: status === 0 ? feedbacksAll : feedbacksAll.filter((k) => k.status === status),
        status,
      });
    },

    getFeedbacks: async () => {
      set({ isLoad: true });
      try {
        const res = await getFeedbacks();
        set({
          feedbacks: res.data,
          feedbacksAll: res.data,
          isLoad: false,
        });
      } catch (error: any) {
        set({
          isLoad: false,
          snackbar: {
            open: true,
            vertical: 'top',
            horizontal: 'center',
            severity: 'error',
            message: error.response?.data?.message || 'Ошибка загрузки отзывов',
          },
        });
      }
    },

    saveFeedbacks: async () => {
      const { type, title, description, img, is_need_notification } = get();

      // Валидация на фронтенде
      if (!title.trim()) {
        set({
          snackbar: {
            open: true,
            vertical: 'top',
            horizontal: 'center',
            severity: 'error',
            message: 'Пожалуйста, заполните заголовок',
          },
        });
        return;
      }

      if (!description.trim()) {
        set({
          snackbar: {
            open: true,
            vertical: 'top',
            horizontal: 'center',
            severity: 'error',
            message: 'Пожалуйста, заполните описание',
          },
        });
        return;
      }

      // Валидация файлов
      if (img && img.length > 0) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const invalidFiles = img.filter((file) => file.size > maxSize);

        if (invalidFiles.length > 0) {
          set({
            snackbar: {
              open: true,
              vertical: 'top',
              horizontal: 'center',
              severity: 'error',
              message: `Файлы слишком большие (максимум 5MB): ${invalidFiles.map((f) => f.name).join(', ')}`,
            },
          });
          return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        const invalidTypes = img.filter((file) => !allowedTypes.includes(file.type));

        if (invalidTypes.length > 0) {
          set({
            snackbar: {
              open: true,
              vertical: 'top',
              horizontal: 'center',
              severity: 'error',
              message: `Неподдерживаемый тип файлов: ${invalidTypes.map((f) => f.name).join(', ')}`,
            },
          });
          return;
        }
      }

      set({ isLoad: true });
      const formData = new FormData();

      formData.append('type', type);
      formData.append('title', title);
      formData.append('description', description);

      if (img && img.length > 0) {
        img.forEach((file) => {
          formData.append('images', file);
        });
      }

      formData.append('is_need_notification', String(is_need_notification));

      try {
        const res = await saveFeedbacks(formData);

        // Успешное сообщение
        set({
          snackbar: {
            open: true,
            vertical: 'top',
            horizontal: 'center',
            severity: 'success',
            message: res.message || 'Отзыв успешно создан!',
          },
          isLoad: false,
          addModal: false,
          // Сброс формы
          type: 'предложение',
          title: '',
          description: '',
          img: null,
          is_need_notification: false,
        });

        // Перезагружаем список
        const res2 = await getFeedbacks();
        set({
          feedbacks: res2.data,
          feedbacksAll: res2.data,
        });
      } catch (error: any) {
        let errorMessage = 'Ошибка при создании отзыва';

        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.errors) {
          const errors = Object.values(error.response.data.errors).flat();
          errorMessage = errors.join(', ');
        } else if (error.message) {
          errorMessage = error.message;
        }

        set({
          isLoad: false,
          snackbar: {
            open: true,
            vertical: 'top',
            horizontal: 'center',
            severity: 'error',
            message: errorMessage,
          },
        });
      }
    },
  }),
  shallow
);
