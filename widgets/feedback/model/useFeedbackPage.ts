import { useCallback, useEffect, useState } from 'react';

import { useFeedbackStore } from '@/widgets/feedback/model/feedback.store';
import type { Feedback } from '@/entities/feedback/model/types';
import type { UseFeedbackPageResult } from './useFeedbackPage.type';

export function useFeedbackPage(): UseFeedbackPageResult {
  const { addModal, setAddModal, feedbacks, getFeedbacks, isLoad, snackbar, hideSnackbar } =
    useFeedbackStore();

  const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
  const [bottomSheetOpen, setBottomSheetOpen] = useState(false);

  const getFeedbacksFetch = useCallback(async () => {
    try {
      await getFeedbacks();
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error);
    }
  }, [getFeedbacks]);

  useEffect(() => {
    void getFeedbacksFetch();
  }, [getFeedbacksFetch]);

  const handleCardClick = (feedback: Feedback) => {
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
    feedbacks,
    isLoad,
    snackbar,
    selectedFeedback,
    bottomSheetOpen,
    setBottomSheetOpen,
    handleCardClick,
    handleCloseDrawer,
    handleCloseSnackbar,
  };
}
