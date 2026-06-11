import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface OrderStatsProps {
  limit: string;
  limitCount: string;
  globalFontSize: number;
}

export const OrderStats: React.FC<OrderStatsProps> = ({ limit, limitCount, globalFontSize }) => {
  const hasLimitCount = limitCount?.length > 0;

  return (
    <Box className="listStats">
      {hasLimitCount ? (
        <Typography
          className="listStats__count"
          style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}
          component="span"
        >
          {limitCount}
        </Typography>
      ) : null}

      <Typography
        className="listStats__limit"
        style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}
        component="span"
      >
        {limit}
      </Typography>
    </Box>
  );
};
