import React from 'react';
import { Grid, Chip, Typography, Box, InputBase, IconButton } from '@mui/material';
import { useFeedbackStore } from '@/widgets/feedback/model/feedback.store';
import { statusArr } from '@/entities/feedback/model/types';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { clampFeedbackFontSize } from '@/widgets/feedback/model/feedbackTypography';

interface FeedbackFiltersProps {
  globalFontSize: number;
}

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="24"
    width="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

export const FeedbackFilters: React.FC<FeedbackFiltersProps> = ({ globalFontSize }) => {
  const { search, setSearch, status, changeStatus } = useFeedbackStore();
  const activeStatusLabel = statusArr.find((item) => item.id === status)?.name ?? 'Все';
  const sectionTitleFontSize = clampFeedbackFontSize(globalFontSize + 2, 16, 26);
  const sectionMetaFontSize = clampFeedbackFontSize(globalFontSize - 1, 12, 20);
  const chipFontSize = clampFeedbackFontSize(globalFontSize - 1, 12, 19);
  const searchInputFontSize = clampFeedbackFontSize(globalFontSize, 14, 22);

  return (
    <Grid size={{ xs: 12 }} sx={{ mt: 1.5 }}>
      <Box
        sx={{
          borderRadius: '24px',
          border: '1px solid rgba(66, 98, 125, 0.16)',
          background: 'linear-gradient(180deg, #ffffff 0%, #f7f9fb 100%)',
          boxShadow: '0 14px 30px rgba(31, 43, 54, 0.08)',
          px: { xs: 2, sm: 2.5 },
          pt: 2,
          pb: 2.1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            mb: 1.25,
          }}
        >
          <Typography sx={{ fontWeight: 700, color: '#1f2b36', fontSize: sectionTitleFontSize }}>
            Статус
          </Typography>
          <Typography sx={{ fontWeight: 500, color: '#6f7f8d', fontSize: sectionMetaFontSize }}>
            Выбрано: {activeStatusLabel}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            gap: 1,
            overflowX: 'auto',
            pb: 0.35,
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
            },
          }}
        >
          {statusArr.map((u) => (
            <Chip
              key={u.id}
              label={u.name}
              sx={{
                borderRadius: '999px',
                px: 0.55,
                fontWeight: 600,
                height: 40,
                flex: '0 0 auto',
                fontSize: chipFontSize,
                border: status === u.id ? '1px solid #cc0033' : '1px solid #e0e4e9',
                backgroundColor: status === u.id ? '#cc0033 !important' : '#ffffff',
                color: status === u.id ? '#ffffff' : '#253343',
                transition: 'all 0.18s ease',
                '&.MuiChip-clickable:hover': {
                  backgroundColor: status === u.id ? '#b4002d !important' : '#f4f7fa',
                },
                '&.MuiChip-clickable:active': {
                  backgroundColor: status === u.id ? '#a8002a !important' : '#edf2f6',
                },
                '&.Mui-focusVisible': {
                  backgroundColor: status === u.id ? '#b4002d !important' : '#f4f7fa',
                },
              }}
              onClick={() => changeStatus(u.id)}
            />
          ))}
        </Box>

        <Box
          sx={{
            mt: 1.5,
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '18px',
            border: '1px solid rgba(66, 98, 125, 0.26)',
            backgroundColor: '#fff',
            px: 1.5,
            py: 0.35,
            boxSizing: 'border-box',
            boxShadow: '0 8px 18px rgba(31, 43, 54, 0.06)',
            transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            '&:focus-within': {
              borderColor: '#3f5f7b',
              boxShadow: '0 0 0 3px rgba(66, 98, 125, 0.12)',
            },
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              color: '#6f7f8d',
              flexShrink: 0,
            }}
          >
            <SearchIcon />
          </Box>

          <InputBase
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Поиск по заголовку и описанию"
            inputProps={{ 'aria-label': 'Поиск отзывов' }}
            sx={{
              ml: 1.25,
              flex: 1,
              color: '#1f2b36',
              '& input': {
                py: 1.1,
                fontSize: searchInputFontSize,
              },
              '& input::placeholder': {
                color: '#8a94a0',
                opacity: 1,
              },
            }}
          />

          {search ? (
            <IconButton
              aria-label="Очистить поиск"
              onClick={() => setSearch('')}
              size="small"
              sx={{
                color: '#8a94a0',
                ml: 0.5,
                '&:hover': {
                  backgroundColor: 'rgba(66, 98, 125, 0.1)',
                },
              }}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          ) : null}
        </Box>
      </Box>
    </Grid>
  );
};
