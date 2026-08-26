import React from 'react';
import { roboto } from '@/shared/ui/Font';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Box, Fab } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { CreateFeedbackDialog } from '@/widgets/feedback/ui/CreateFeedbackDialog';
import { FeedbackFilters } from '@/widgets/feedback/ui/FeedbackFilters';
import { FeedbackCard } from '@/widgets/feedback/ui/FeedbackCard';
import { FeedbackDetailsDrawer } from '@/widgets/feedback/ui/FeedbackDetailsDrawer';
import CircularProgress from '@mui/material/CircularProgress';
import { SnackbarNotification } from '@/shared/ui/SnackbarNotification/SnackbarNotification';
import { useHeaderStore } from '@/features/header/model/header.store';
import { useFeedbackPage } from '../model/useFeedbackPage';
import {
  clampFeedbackFontSize,
  normalizeFeedbackFontSize,
} from '@/widgets/feedback/model/feedbackTypography';

const FeedbackPage: React.FC = () => {
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);
  const normalizedGlobalFontSize = normalizeFeedbackFontSize(globalFontSize);
  const listTitleFontSize = clampFeedbackFontSize(normalizedGlobalFontSize + 1, 14, 24);
  const listMetaFontSize = clampFeedbackFontSize(normalizedGlobalFontSize - 1, 12, 20);
  const emptyTitleFontSize = clampFeedbackFontSize(normalizedGlobalFontSize + 3, 16, 28);
  const emptyTextFontSize = clampFeedbackFontSize(normalizedGlobalFontSize, 14, 24);
  const createFabIconFontSize = clampFeedbackFontSize(normalizedGlobalFontSize + 22, 30, 44);

  const {
    addModal,
    setAddModal,
    feedbacks,
    isLoad,
    snackbar,
    selectedFeedback,
    bottomSheetOpen,
    handleCardClick,
    handleCloseDrawer,
    handleCloseSnackbar,
  } = useFeedbackPage();

  if (isLoad) {
    return (
      <Box
        className={roboto.variable}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Grid
        container
        spacing={2.5}
        className={'list ' + roboto.variable}
        sx={{
          display: 'flex',
          position: 'relative',
          alignContent: 'flex-start',
          paddingTop: 1,
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 120px)',
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <CreateFeedbackDialog
          open={addModal}
          onClose={() => setAddModal(false)}
          globalFontSize={normalizedGlobalFontSize}
        />

        <Fab
          onClick={() => setAddModal(true)}
          sx={{
            backgroundColor: '#cc0033',
            color: '#ffffff',
            position: 'fixed',
            right: 14,
            bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
            width: 72,
            height: 72,
            borderRadius: '50%',
            boxShadow: '0 22px 34px rgba(146, 0, 36, 0.32)',
            zIndex: 1000,
            '&:hover': {
              backgroundColor: '#b4002d',
              boxShadow: '0 24px 36px rgba(146, 0, 36, 0.36)',
            },
          }}
          aria-label="Создать предложение"
        >
          <AddRoundedIcon sx={{ fontSize: createFabIconFontSize }} />
        </Fab>

        <FeedbackFilters globalFontSize={normalizedGlobalFontSize} />

        <Grid size={{ xs: 12 }} sx={{ mt: -0.25 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 0.5,
            }}
          >
            <Typography
              sx={{ color: 'text.secondary', fontWeight: 600, fontSize: listTitleFontSize }}
            >
              Лента предложений
            </Typography>
            <Typography
              sx={{ color: 'text.secondary', fontWeight: 500, fontSize: listMetaFontSize }}
            >
              Всего: {feedbacks?.length ?? 0}
            </Typography>
          </Box>
        </Grid>

        {feedbacks?.length > 0 ? (
          feedbacks.map((feedback, index) => (
            <Grid key={feedback.id || index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <FeedbackCard
                feedback={feedback}
                onClick={handleCardClick}
                globalFontSize={normalizedGlobalFontSize}
              />
            </Grid>
          ))
        ) : (
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                borderRadius: '24px',
                border: '1px dashed',
                borderColor: 'divider',
                backgroundColor: 'background.paper',
                py: 5,
                px: 2,
                textAlign: 'center',
                color: 'text.primary',
              }}
            >
              <Typography sx={{ fontSize: emptyTitleFontSize, fontWeight: 700, mb: 0.6 }}>
                Ничего не найдено
              </Typography>
              <Typography sx={{ fontSize: emptyTextFontSize, color: 'text.secondary' }}>
                Попробуйте изменить фильтр или текст поиска
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>

      <FeedbackDetailsDrawer
        open={bottomSheetOpen}
        feedback={selectedFeedback}
        onClose={handleCloseDrawer}
        globalFontSize={normalizedGlobalFontSize}
      />

      <SnackbarNotification
        state={snackbar}
        onClose={handleCloseSnackbar}
        fontSize={normalizedGlobalFontSize}
        autoHideDuration={5000}
      />
    </>
  );
};

export default FeedbackPage;
