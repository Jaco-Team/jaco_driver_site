import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import { Feedback, statusArr } from '@/entities/feedback/model/types';

interface FeedbackCardProps {
  feedback: Feedback;
  onClick: (feedback: Feedback) => void;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, onClick }) => {
  const normalizedTitle = String(feedback.title ?? '').trim();
  const normalizedDescription = (feedback.description || '').trim();
  const isCompactCard = normalizedTitle.length <= 24 && normalizedDescription.length <= 40;

  const getStatusColor = (status: number): string => {
    switch (status) {
      case 1:
        return '#42AAFF';
      case 2:
        return '#ffeccf';
      case 3:
        return '#eceff3';
      case 4:
        return '#dff6df';
      default:
        return '#eceff3';
    }
  };

  const getStatusTextColor = (status: number): string => {
    if (status === 1) {
      return '#ffffff';
    }

    if (status === 4) {
      return '#1f6b2a';
    }

    return '#253343';
  };

  const createdAt =
    feedback.date_time_create?.replace(/^(\d{4})-(\d{2})-(\d{2}).*$/, '$3.$2.$1') || '—';

  return (
    <Box
      onClick={() => onClick(feedback)}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 4,
        border: '1px solid rgba(66, 98, 125, 0.12)',
        boxShadow: '0 12px 24px rgba(31, 43, 54, 0.08)',
        transition: 'transform 0.2s, boxShadow 0.2s, border-color 0.2s',
        minHeight: isCompactCard ? { xs: 172, sm: 184 } : { xs: 198, sm: 216 },
        maxHeight: { xs: 360, sm: 392 },
        height: 'auto',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 16px 28px rgba(31, 43, 54, 0.13)',
          borderColor: 'rgba(66, 98, 125, 0.25)',
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
      }}
    >
      <Box
        sx={{
          p: '16px 16px 8px 16px',
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
        }}
      >
        <Typography
          component="h3"
          sx={{
            fontWeight: 800,
            color: '#171b22',
            mb: 1.15,
            fontSize: '1.34rem',
            lineHeight: 1.22,
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            textOverflow: 'ellipsis',
          }}
        >
          {normalizedTitle || 'Без заголовка'}
        </Typography>

        <Typography
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 4,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            mb: 1.25,
            color: '#5a6470',
            fontSize: '0.98rem',
            lineHeight: 1.45,
            overflowWrap: 'anywhere',
          }}
        >
          {normalizedDescription || 'Нет описания'}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
            pt: 0.8,
            mt: 'auto',
            minHeight: 40,
            borderTop: '1px solid',
            borderColor: 'rgba(66, 98, 125, 0.2)',
          }}
        >
          <Chip
            label={statusArr.find((u) => u.id === feedback.status)?.name}
            size="small"
            sx={{
              backgroundColor: getStatusColor(feedback.status),
              color: getStatusTextColor(feedback.status),
              borderRadius: '999px',
              fontWeight: 700,
              height: 30,
              px: 0.35,
              fontSize: '0.86rem',
              '& .MuiChip-label': {
                display: 'inline-flex',
                alignItems: 'center',
                lineHeight: 1,
              },
            }}
          />
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.55,
              color: '#6e7884',
              minHeight: 30,
            }}
          >
            <CalendarTodayRoundedIcon sx={{ fontSize: '0.9rem' }} />
            <Typography
              sx={{ fontSize: '0.9rem', color: '#66707b', fontWeight: 500, lineHeight: 1 }}
            >
              {createdAt}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
