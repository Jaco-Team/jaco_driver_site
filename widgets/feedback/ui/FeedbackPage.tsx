import React from 'react';
import { roboto } from '@/shared/ui/Font';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Button from '@mui/material/Button';
import { CreateFeedbackDialog } from '@/widgets/feedback/ui/CreateFeedbackDialog';
import { FeedbackFilters } from '@/widgets/feedback/ui/FeedbackFilters';
import { FeedbackCard } from '@/widgets/feedback/ui/FeedbackCard';
import { FeedbackDetailsDrawer } from '@/widgets/feedback/ui/FeedbackDetailsDrawer';
import CircularProgress from '@mui/material/CircularProgress';
import { SnackbarNotification } from '@/shared/ui/SnackbarNotification/SnackbarNotification';
import { useFeedbackPage } from '../model/useFeedbackPage';

const FeedbackPage: React.FC = () => {
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
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        className={roboto.variable}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Grid
        container
        spacing={3}
        className={'list ' + roboto.variable}
        style={{ display: 'flex', position: 'relative' }}
      >
        <CreateFeedbackDialog open={addModal} onClose={() => setAddModal(false)} />

        <Button
          onClick={() => setAddModal(true)}
          sx={{
            backgroundColor: '#cc0033',
            color: 'white',
            boxShadow: '0 20px 36px rgba(166, 0, 42, 0.28)',
            borderRadius: '50%',
            position: 'fixed',
            right: '12px',
            bottom: '10px',
            padding: '20px',
            zIndex: 1000,
            '&:hover': {
              backgroundColor: 'red',
              boxShadow: '0 20px 16px rgba(166, 0, 42, 0.28)',
            },
          }}
        >
          <CloseIcon sx={{ rotate: '45deg' }} />
        </Button>

        <FeedbackFilters />

        {feedbacks?.length > 0 ? (
          feedbacks.map((feedback, index) => (
            <Grid key={feedback.id || index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <FeedbackCard feedback={feedback} onClick={handleCardClick} />
            </Grid>
          ))
        ) : (
          <Grid size={{ xs: 12 }}>
            <Typography align="center">Нет отзывов</Typography>
          </Grid>
        )}
      </Grid>

      <FeedbackDetailsDrawer
        open={bottomSheetOpen}
        feedback={selectedFeedback}
        onClose={handleCloseDrawer}
      />

      <SnackbarNotification
        state={snackbar}
        onClose={handleCloseSnackbar}
        fontSize={14}
        autoHideDuration={5000}
      />
    </>
  );
};

export default FeedbackPage;
