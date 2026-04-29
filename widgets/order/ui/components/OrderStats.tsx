import React from 'react';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

interface OrderStatsProps {
  limit: string;
  limitCount: string;
  globalFontSize: number;
}

export const OrderStats: React.FC<OrderStatsProps> = ({ limit, limitCount, globalFontSize }) => {
  const hasLimitCount = limitCount?.length > 0;

  return (
    <Grid
      size={12}
      style={{
        display: 'flex',
        justifyContent: hasLimitCount ? 'space-between' : 'center',
        maxWidth: '70%',
      }}
    >
      <Typography
        style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}
        component="span"
      >
        {limit}
      </Typography>
      {hasLimitCount && (
        <Typography
          style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}
          component="span"
        >
          {limitCount}
        </Typography>
      )}
    </Grid>
  );
};
