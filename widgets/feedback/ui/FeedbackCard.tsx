import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Feedback, statusArr } from '@/entities/feedback/model/types';

interface FeedbackCardProps {
  feedback: Feedback;
  onClick: (feedback: Feedback) => void;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, onClick }) => {
  const getStatusColor = (status: number) => {
    switch (status) {
      case 1:
        return '#42AAFF';
      case 2:
        return '#F2F2F2';
      case 3:
        return '#f5f5f5';
      case 4:
        return 'green';
      default:
        return '#f5f5f5';
    }
  };

  const getStatusTextColor = (status: number) => {
    return status === 3 || status === 2 ? 'black' : 'white';
  };

  return (
    <Box
      onClick={() => onClick(feedback)}
      sx={{
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        transition: 'transform 0.2s, boxShadow 0.2s',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        },
        '&:active': {
          transform: 'scale(0.98)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography
          variant="h8"
          sx={{
            fontWeight: 600,
            mb: 1.5,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {feedback.title}
        </Typography>

        <Typography
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            mb: 2,
            color: 'text.secondary',
            fontSize: '0.875rem',
            lineHeight: 1.5,
            minHeight: '2.5em',
          }}
        >
          {feedback.description || 'Нет описания'}
        </Typography>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Chip
            label={statusArr.find((u) => u.id === feedback.status)?.name}
            size="small"
            sx={{
              backgroundColor: getStatusColor(feedback.status),
              color: getStatusTextColor(feedback.status),
            }}
          />
          <Typography variant="caption" color="text.secondary">
            {feedback.date_time_create?.replace(/^(\d{4})-(\d{2})-(\d{2}).*$/, '$3.$2.$1') || '—'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};
