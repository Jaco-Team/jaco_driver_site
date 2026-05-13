import type { Dispatch, SetStateAction } from 'react';

import type { Feedback } from '@/entities/feedback/model/types';
import type { SnackbarState } from '@/shared/ui/SnackbarNotification/SnackbarNotification';

export interface UseFeedbackPageResult {
  addModal: boolean;
  setAddModal: (value: boolean) => void;
  feedbacks: Feedback[];
  isLoad: boolean;
  snackbar: SnackbarState;
  selectedFeedback: Feedback | null;
  bottomSheetOpen: boolean;
  setBottomSheetOpen: Dispatch<SetStateAction<boolean>>;
  handleCardClick: (feedback: Feedback) => void;
  handleCloseDrawer: () => void;
  handleCloseSnackbar: () => void;
}
