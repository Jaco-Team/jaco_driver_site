import { memo } from 'react';

import { MetricRowProps } from '../model/usePriceScreen.type';

import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

function MetricRowComponent({
  label,
  value,
  description,
  emphasize = false,
  hideDivider = false,
  globalFontSize,
}: MetricRowProps) {
  return (
    <div className={`price__metricRow${hideDivider ? ' price__metricRow--last' : ''}`}>
      <div className={`price__metricLabel${emphasize ? ' price__metricLabel--emphasis' : ''}`}>
        <span style={{ fontSize: globalFontSize }}>{label}</span>

        {description ? (
          <Tooltip title={description} arrow placement="top">
            <IconButton
              size="small"
              className="price__metricInfo"
              aria-label={`Подсказка: ${label}`}
            >
              <InfoOutlinedIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        ) : null}
      </div>

      <span
        className={`price__metricValue${emphasize ? ' price__metricValue--emphasis' : ''}`}
        style={{ fontSize: globalFontSize }}
      >
        {value}
      </span>
    </div>
  );
}

export const MetricRow = memo(MetricRowComponent);
