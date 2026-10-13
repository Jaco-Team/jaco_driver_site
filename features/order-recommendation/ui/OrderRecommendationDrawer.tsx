import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import { useMemo } from 'react';

import type { Order } from '@/entities/order/model/order.types';
import { useHeaderStore } from '@/features/header/model/header.store';
import {
  appDarkPalette,
  appDarkSuccessPalette,
  appPalette,
  appSuccessPalette,
} from '@/shared/styles/appPalette';

import type { OrderRecommendationResult } from '../model/orderRecommendation.types';
import { buildRouteMapPoints, routeStopLabel, sortRouteStops } from '../model/routeMapPoints';

interface OrderRecommendationDrawerProps {
  open: boolean;
  result: OrderRecommendationResult | null;
  orders: Order[];
  acceptedOrderIds?: number[];
  unavailableOrderIds?: number[];
  orderTypeId?: number;
  onClose: () => void;
  onShowOnMap: () => void;
  showMapAction?: boolean;
}

function clampFontSize(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatDistance(value?: number | null) {
  if (!value) return null;
  return value >= 1000 ? `${(value / 1000).toFixed(1)} км` : `${Math.round(value)} м`;
}

export function OrderRecommendationDrawer({
  open,
  result,
  orders,
  acceptedOrderIds = [],
  unavailableOrderIds = [],
  orderTypeId,
  onClose,
  onShowOnMap,
  showMapAction = true,
}: OrderRecommendationDrawerProps) {
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);
  const orderById = useMemo(() => new Map(orders.map((order) => [order.id, order])), [orders]);
  const titleSize = clampFontSize(globalFontSize + 4, 18, 24);
  const sectionSize = clampFontSize(globalFontSize + 1, 15, 19);
  const bodySize = clampFontSize(globalFontSize, 14, 18);
  const helperSize = clampFontSize(globalFontSize - 1, 13, 16);
  const route = result?.route;
  const acceptedIds = useMemo(() => new Set(acceptedOrderIds), [acceptedOrderIds]);
  const unavailableIds = useMemo(() => new Set(unavailableOrderIds), [unavailableOrderIds]);
  const visibleTake = useMemo(
    () => (result?.take ?? []).filter((item) => !unavailableIds.has(item.id)),
    [result?.take, unavailableIds]
  );
  const distance = formatDistance(route?.total_distance_m);
  const stops = useMemo(
    () =>
      sortRouteStops(route?.stops).filter(
        (stop) => stop.id === null || !unavailableIds.has(stop.id)
      ),
    [route?.stops, unavailableIds]
  );
  const mapPoints = useMemo(() => buildRouteMapPoints(stops, orderById), [orderById, stops]);
  const routeSummary = [
    route?.total_minutes ? `Примерно ${route.total_minutes} мин` : '',
    distance || '',
  ]
    .filter(Boolean)
    .join(' · ');
  const visibleWarnings = (result?.warnings ?? []).filter(
    (warning) => !/остальн.*лучше не брать/i.test(warning)
  );
  const hasDetails = Boolean(visibleTake.length || stops.length || visibleWarnings.length);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            height: '88dvh',
            maxHeight: '88dvh',
            overflow: 'hidden',
            backgroundColor: (theme) =>
              theme.palette.mode === 'dark' ? appDarkPalette.aiSurface : appPalette.aiSurface,
            backgroundImage: 'none',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? `0 -20px 44px ${appDarkPalette.shadow}`
                : '0 -20px 44px rgba(31, 43, 54, 0.18)',
          },
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          height: '100%',
          px: 2,
          pt: 1.15,
          pb: 'calc(env(safe-area-inset-bottom, 0px) + 24px)',
        }}
      >
        <Box
          onClick={onClose}
          sx={{ display: 'flex', flexShrink: 0, justifyContent: 'center', pb: 1.5 }}
        >
          <Box
            sx={{
              width: 62,
              height: 6,
              borderRadius: 999,
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(217, 224, 230, 0.28)'
                  : 'rgba(31, 43, 54, 0.2)',
            }}
          />
        </Box>

        <Box sx={{ display: 'flex', flexShrink: 0, alignItems: 'center', gap: 1.25, mb: 1 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '13px',
              display: 'grid',
              placeItems: 'center',
              color: 'primary.main',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? appDarkPalette.brandSoft : appPalette.brandSoft,
            }}
          >
            <AutoAwesomeRoundedIcon />
          </Box>
          <Typography component="h2" sx={{ fontSize: titleSize, fontWeight: 750, lineHeight: 1.2 }}>
            Рекомендации по заказам
          </Typography>
        </Box>

        {result?.summary && unavailableOrderIds.length === 0 && (
          <Typography
            sx={{
              flexShrink: 0,
              fontSize: bodySize,
              lineHeight: 1.45,
              color: 'text.secondary',
              mb: 2,
            }}
          >
            {result.summary}
          </Typography>
        )}

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            pr: 0.25,
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': {
              display: 'none',
              width: 0,
              height: 0,
            },
          }}
        >
          {!hasDetails && (
            <Typography sx={{ fontSize: bodySize, color: 'text.secondary', mb: 2 }}>
              Сервер не вернул подробный план. Попробуйте запросить совет ещё раз.
            </Typography>
          )}

          {visibleTake.length > 0 && (
            <Box sx={{ mb: 2.25 }}>
              <Typography sx={{ fontSize: sectionSize, fontWeight: 750, mb: 1 }}>
                {orderTypeId === 2 ? 'Заказы в маршруте' : 'Какие заказы взять'}
              </Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                {visibleTake.map((item) => {
                  const order = orderById.get(item.id);
                  const isAccepted = acceptedIds.has(item.id);
                  return (
                    <Box
                      key={item.id}
                      sx={{
                        p: 1.5,
                        borderRadius: '16px',
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark' ? appDarkPalette.aiCard : appPalette.aiCard,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.6 }}>
                        <Chip
                          size="small"
                          label={`${item.seq}`}
                          sx={{
                            minWidth: 32,
                            fontWeight: 750,
                            backgroundColor: (theme) =>
                              theme.palette.mode === 'dark'
                                ? appDarkPalette.surfaceAlt
                                : appPalette.surfaceAlt,
                          }}
                        />
                        <Typography
                          sx={{ minWidth: 0, flex: 1, fontSize: bodySize, fontWeight: 750 }}
                        >
                          {order?.id_text || `Заказ №${item.id}`}
                        </Typography>
                        {isAccepted && (
                          <Box
                            aria-label="Заказ взят"
                            sx={{
                              width: 24,
                              height: 24,
                              flex: '0 0 24px',
                              display: 'grid',
                              placeItems: 'center',
                              borderRadius: '50%',
                              color: '#FFFFFF',
                              backgroundColor: (theme) =>
                                theme.palette.mode === 'dark'
                                  ? appDarkSuccessPalette.main
                                  : appSuccessPalette.main,
                            }}
                          >
                            <CheckRoundedIcon sx={{ fontSize: 17 }} />
                          </Box>
                        )}
                      </Box>
                      {order?.addr && (
                        <Typography sx={{ fontSize: helperSize, color: 'text.secondary', mb: 0.5 }}>
                          {order.addr}
                        </Typography>
                      )}
                      <Typography sx={{ fontSize: bodySize, lineHeight: 1.4 }}>
                        {item.reason}
                      </Typography>
                      {(item.pickup_at || item.deliver_at) && (
                        <Typography
                          sx={{ fontSize: helperSize, color: 'text.secondary', mt: 0.75 }}
                        >
                          {item.pickup_at ? `Забрать: ${item.pickup_at}` : ''}
                          {item.pickup_at && item.deliver_at ? ' · ' : ''}
                          {item.deliver_at ? `Доставить: ${item.deliver_at}` : ''}
                        </Typography>
                      )}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}

          {stops.length > 0 && (
            <Box sx={{ mb: 2.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                <RouteRoundedIcon color="primary" />
                <Typography sx={{ fontSize: sectionSize, fontWeight: 750 }}>Маршрут</Typography>
              </Box>
              {routeSummary && unavailableOrderIds.length === 0 && (
                <Typography sx={{ fontSize: helperSize, color: 'text.secondary', mb: 1 }}>
                  {routeSummary}
                </Typography>
              )}
              <Box sx={{ display: 'grid', gap: 0.75 }}>
                {stops.map((stop, index) => (
                  <Box
                    key={`${stop.kind}-${stop.id ?? 'start'}-${stop.seq}`}
                    sx={{ display: 'grid', gridTemplateColumns: '30px 1fr auto', gap: 0.75 }}
                  >
                    <Typography
                      sx={{
                        fontSize: helperSize,
                        fontWeight: 750,
                        color: 'primary.main',
                        textAlign: 'center',
                      }}
                    >
                      {index + 1}
                    </Typography>
                    <Typography sx={{ fontSize: bodySize, lineHeight: 1.35 }}>
                      {routeStopLabel(stop, stop.id ? orderById.get(stop.id) : undefined)}
                    </Typography>
                    {stop.eta && (
                      <Typography sx={{ fontSize: helperSize, color: 'text.secondary' }}>
                        {stop.eta}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
              {showMapAction && mapPoints.length > 1 && (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<MapRoundedIcon />}
                  onClick={onShowOnMap}
                  sx={{
                    mt: 1.5,
                    minHeight: 44,
                    borderRadius: '14px',
                    textTransform: 'none',
                    fontSize: bodySize,
                    fontWeight: 700,
                  }}
                >
                  Показать маршрут на карте
                </Button>
              )}
            </Box>
          )}

          {visibleWarnings.length > 0 && (
            <>
              <Divider sx={{ mb: 1.25 }} />
              <Box sx={{ display: 'grid', gap: 0.75 }}>
                {visibleWarnings.map((warning) => (
                  <Box key={warning} sx={{ display: 'flex', gap: 0.75, alignItems: 'flex-start' }}>
                    <ErrorOutlineRoundedIcon
                      sx={{ fontSize: 20, color: 'warning.main', mt: '1px' }}
                    />
                    <Typography sx={{ fontSize: helperSize, lineHeight: 1.4 }}>
                      {warning}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </Box>

        <Button
          fullWidth
          variant="contained"
          disableElevation
          onClick={onClose}
          sx={{
            minHeight: 44,
            flexShrink: 0,
            mt: 1.5,
            borderRadius: '14px',
            textTransform: 'none',
            fontSize: bodySize,
            fontWeight: 750,
          }}
        >
          Закрыть
        </Button>
      </Box>
    </SwipeableDrawer>
  );
}
