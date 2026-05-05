import React from 'react';
import { Grid, Chip, Typography } from '@mui/material';
import MyTextInput from '@/shared/ui/MyTextInput';
import { useFeedbackStore } from '@/widgets/feedback/model/feedback.store';
import { statusArr } from '@/entities/feedback/model/types';
import InputAdornment from '@mui/material/InputAdornment';

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
export const FeedbackFilters: React.FC = () => {
  const { search, setSearch, status, changeStatus } = useFeedbackStore();
  return (
    <>
      <Grid size={{ xs: 12 }} style={{ marginTop: '12px' }}>
        <Typography>Статус</Typography>
      </Grid>
      <Grid size={{ xs: 12 }} style={{ display: 'flex', justifyContent: 'start' }}>
        {statusArr.map((u) => (
          <Chip
            key={u.id}
            label={u.name}
            style={{
              marginRight: '10px',
              backgroundColor: status === u.id ? '#cc0033' : '#F5F5F5',
              color: status === u.id ? 'white' : 'black',
            }}
            onClick={() => changeStatus(u.id)}
          />
        ))}
      </Grid>
      <Grid size={{ xs: 12 }} style={{ display: 'flex', justifyContent: 'start' }}>
        <MyTextInput
          label="Поиск отзывов"
          value={search}
          type={'text'}
          startAdornment={
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          }
          onChange={(e) => setSearch(e.target.value)}
        />
      </Grid>
    </>
  );
};
