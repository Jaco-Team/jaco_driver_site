'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import WifiOffRoundedIcon from '@mui/icons-material/WifiOffRounded';

import type { OrderMapGroup } from '@/entities/order/model/orderMapGroups';
import { roboto } from '@/shared/config/fonts';
import { sanitizeCssColor } from '@/shared/lib/escapeHtml';
import { appPalette } from '@/shared/styles/appPalette';

interface OrdersMapOfflineListProps {
  mapError?: string;
  groups: OrderMapGroup[];
  typeText: string;
  globalFontSize: number;
  onOpenOrders: (id: number) => void;
}

function clampFontSize(value: number, min: number, max: number): number {
  return Math.max(Math.min(value, max), min);
}

function getOrderCountLabel(count: number): string {
  const lastTwoDigits = count % 100;
  const lastDigit = count % 10;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} заказов`;
  }

  if (lastDigit === 1) {
    return `${count} заказ`;
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${count} заказа`;
  }

  return `${count} заказов`;
}

export function OrdersMapOfflineList({
  mapError,
  groups,
  typeText,
  globalFontSize,
  onOpenOrders,
}: OrdersMapOfflineListProps) {
  const titleFontSize = clampFontSize(globalFontSize + 4, 20, 28);
  const hintFontSize = clampFontSize(globalFontSize - 1, 13, 16);
  const addressFontSize = clampFontSize(globalFontSize, 14, 20);
  const metaFontSize = clampFontSize(globalFontSize - 2, 12, 15);

  return (
    <Box
      className={roboto.variable}
      data-testid="orders-map-offline-list"
      sx={{
        minHeight: '100vh',
        px: 2,
        pt: 2,
        pb: 'calc(env(safe-area-inset-bottom, 0px) + 170px)',
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          px: 2,
          py: 1.75,
          mb: 2,
          mt: 8,
          borderRadius: '24px',
          border: `1px solid ${appPalette.softStrong}`,
          bgcolor: 'background.paper',
          boxShadow: `0 10px 22px ${appPalette.shadowSoft}`,
        }}
      >
        <Box
          sx={{
            width: 46,
            height: 46,
            flexShrink: 0,
            display: 'grid',
            placeItems: 'center',
            borderRadius: '16px',
            color: appPalette.primary,
            bgcolor: appPalette.soft,
          }}
        >
          <WifiOffRoundedIcon />
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography
            component="div"
            sx={{
              fontSize: titleFontSize,
              fontWeight: 800,
              lineHeight: 1.2,
              color: 'text.primary',
            }}
          >
            Карта недоступна
          </Typography>

          <Typography
            component="div"
            sx={{
              fontSize: hintFontSize,
              lineHeight: 1.4,
              color: 'text.secondary',
            }}
          >
            {mapError || 'Нет интернета.'}
          </Typography>

          <Typography
            component="div"
            sx={{ fontSize: hintFontSize, lineHeight: 1.4, color: 'text.secondary', mt: 0.5 }}
          >
            Заказы «{typeText}» доступны из сохранённого списка.
          </Typography>
        </Box>
      </Box>

      {groups.length === 0 ? (
        <Typography
          component="div"
          sx={{
            px: 2,
            py: 3,
            fontSize: addressFontSize,
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          Сохранённых заказов нет.
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {groups.map((group) => (
            <ButtonBase
              key={group.key}
              onClick={() => onOpenOrders(group.representative.id)}
              sx={{
                display: 'grid',
                gridTemplateColumns: '12px 1fr auto',
                alignItems: 'center',
                columnGap: 1.5,
                width: '100%',
                minHeight: 72,
                px: 2,
                py: 1.5,
                textAlign: 'left',
                borderRadius: '20px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                boxShadow: `0 10px 22px ${appPalette.shadowSoft}`,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: sanitizeCssColor(group.statusColors[0]),
                }}
              />

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component="div"
                  sx={{
                    fontSize: addressFontSize,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: 'text.primary',
                  }}
                >
                  {group.representative.addr || 'Адрес не указан'}
                </Typography>

                <Typography
                  component="div"
                  sx={{
                    fontSize: metaFontSize,
                    lineHeight: 1.4,
                    color: 'text.secondary',
                  }}
                >
                  {[
                    group.representative.id_text || `#${group.representative.id}`,
                    group.representative.status,
                    group.representative.close_time_ || group.representative.need_time,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Typography>
              </Box>

              {group.count > 1 ? (
                <Typography
                  component="span"
                  sx={{
                    px: 1.25,
                    py: 0.5,
                    fontSize: metaFontSize,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    borderRadius: '999px',
                    color: appPalette.primary,
                    bgcolor: appPalette.soft,
                  }}
                >
                  {getOrderCountLabel(group.count)}
                </Typography>
              ) : null}
            </ButtonBase>
          ))}
        </Box>
      )}
    </Box>
  );
}
