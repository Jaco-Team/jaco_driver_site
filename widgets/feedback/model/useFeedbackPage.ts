import { useCallback, useEffect, useState } from 'react';

import { useFeedbackStore } from '@/widgets/feedback/model/feedback.store';
import type { Feedback } from '@/entities/feedback/model/types';
import type { UseFeedbackPageResult } from './useFeedbackPage.type';
import { useConnectivityStore } from '@/features/offline/model/connectivity.store';
import { useRetryOnlineRequest } from '@/features/offline/model/useRetryOnlineRequest';

export function useFeedbackPage(): UseFeedbackPageResult {
  const isOnline = useConnectivityStore((state) => state.isOnline);
  const {
    addModal,
    setAddModal,
    feedbacks,
    getFeedbacks,
    clearFeedbacks,
    isLoad,
    loadError,
    snackbar,
    hideSnackbar,
  } = useFeedbackStore();

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  const getFeedbacksFetch = useCallback(() => getFeedbacks(), [getFeedbacks]);

  useRetryOnlineRequest(isOnline, getFeedbacksFetch);

  useEffect(() => {
    if (isOnline) {
      return;
    }

    clearFeedbacks();
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setBottomSheetOpen(false);
        setSelectedFeedback(null);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [clearFeedbacks, isOnline]);

  const handleCardClick = (feedback: Feedback) => {
    if (!isOnline) {
      return;
    }

    setSelectedFeedback(feedback);
    setBottomSheetOpen(true);
  };

  const handleCloseDrawer = () => {
    setBottomSheetOpen(false);
    setTimeout(() => setSelectedFeedback(null), 300);
  };

  const handleCloseSnackbar = () => {
    hideSnackbar();
  };

  return {
    addModal,
    setAddModal,
    feedbacks: isOnline ? feedbacks : [],
    isLoad,
    loadError: isOnline ? loadError : null,
    snackbar,
    selectedFeedback,
    bottomSheetOpen,
    setBottomSheetOpen,
    handleCardClick,
    handleCloseDrawer,
    handleCloseSnackbar,
  };
}
