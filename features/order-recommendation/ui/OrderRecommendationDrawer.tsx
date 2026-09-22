import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import RouteRoundedIcon from '@mui/icons-material/RouteRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';

import { log } from '@/components/analytics';
import type { Order } from '@/entities/order/model/order.types';
import { useHeaderStore } from '@/features/header/model/header.store';
import { appDarkPalette, appPalette } from '@/shared/styles/appPalette';

import type { OrderRecommendationResult } from '../model/orderRecommendation.types';
import {
  buildRouteMapPoints,
  buildYandexMapsRouteUrl,
  routeStopLabel,
  sortRouteStops,
} from '../model/routeMapPoints';
import { RecommendationRouteMapDrawer } from './RecommendationRouteMapDrawer';

interface OrderRecommendationDrawerProps {
  open: boolean;
  result: OrderRecommendationResult | null;
  orders: Order[];
  onClose: () => void;
}

function clampFontSize(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatDistance(value?: number | null) {
  if (!value) return null;
  return value >= 1000 ? `${(value / 1000).toFixed(1)} км` : `${Math.round(value)} м`;
}

function getSafeExternalUrl(value?: string | null) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export function OrderRecommendationDrawer({
  open,
  result,
  orders,
  onClose,
}: OrderRecommendationDrawerProps) {
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const orderById = useMemo(() => new Map(orders.map((order) => [order.id, order])), [orders]);
  const titleSize = clampFontSize(globalFontSize + 4, 18, 24);
  const sectionSize = clampFontSize(globalFontSize + 1, 15, 19);
  const bodySize = clampFontSize(globalFontSize, 14, 18);
  const helperSize = clampFontSize(globalFontSize - 1, 13, 16);
  const route = result?.route;
  const distance = formatDistance(route?.total_distance_m);
  const stops = useMemo(() => sortRouteStops(route?.stops), [route?.stops]);
  const mapPoints = useMemo(() => buildRouteMapPoints(stops, orderById), [orderById, stops]);
  const externalRouteUrl = getSafeExternalUrl(route?.external_url);
  const mapRouteUrl = externalRouteUrl || buildYandexMapsRouteUrl(mapPoints);
  const routeSummary = [
    route?.total_minutes ? `Примерно ${route.total_minutes} мин` : '',
    distance || '',
  ]
    .filter(Boolean)
    .join(' · ');
  const hasDetails = Boolean(
    result?.take?.length || route?.stops?.length || result?.skip?.length || result?.warnings?.length
  );

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
            maxHeight: '88vh',
            backgroundColor: 'background.paper',
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
      <Box sx={{ px: 2, pt: 1.15, pb: 'calc(env(safe-area-inset-bottom, 0px) + 24px)' }}>
        <Box onClick={onClose} sx={{ display: 'flex', justifyContent: 'center', pb: 1.5 }}>
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

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 1 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '13px',
              display: 'grid',
              placeItems: 'center',
              color: 'primary.main',
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark' ? appDarkPalette.surfaceAlt : appPalette.soft,
            }}
          >
            <AutoAwesomeRoundedIcon />
          </Box>
          <Typography component="h2" sx={{ fontSize: titleSize, fontWeight: 750, lineHeight: 1.2 }}>
            {result?.title || 'Совет по заказам'}
          </Typography>
        </Box>

        {result?.summary && (
          <Typography sx={{ fontSize: bodySize, lineHeight: 1.45, color: 'text.secondary', mb: 2 }}>
            {result.summary}
          </Typography>
        )}

        <Box sx={{ overflowY: 'auto', maxHeight: 'calc(88vh - 170px)', pr: 0.25 }}>
          {!hasDetails && (
            <Typography sx={{ fontSize: bodySize, color: 'text.secondary', mb: 2 }}>
              Сервер не вернул подробный план. Попробуйте запросить совет ещё раз.
            </Typography>
          )}

          {(result?.take?.length ?? 0) > 0 && (
            <Box sx={{ mb: 2.25 }}>
              <Typography sx={{ fontSize: sectionSize, fontWeight: 750, mb: 1 }}>
                Какие заказы взять
              </Typography>
              <Box sx={{ display: 'grid', gap: 1 }}>
                {result?.take?.map((item) => {
                  const order = orderById.get(item.id);
                  return (
                    <Box
                      key={item.id}
                      sx={{
                        p: 1.5,
                        borderRadius: '16px',
                        border: '1px solid',
                        borderColor: 'divider',
                        backgroundColor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? appDarkPalette.surfaceAlt
                            : appPalette.surface,
                      }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.6 }}>
                        <Chip
                          size="small"
                          label={`${item.seq}`}
                          sx={{ minWidth: 32, fontWeight: 750 }}
                        />
                        <Typography sx={{ fontSize: bodySize, fontWeight: 750 }}>
                          {order?.id_text || `Заказ №${item.id}`}
                        </Typography>
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
                        <Typography sx={{ fontSize: helperSize, color: 'text.secondary', mt: 0.75 }}>
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

          {(route?.stops?.length ?? 0) > 0 && (
            <Box sx={{ mb: 2.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
                <RouteRoundedIcon color="primary" />
                <Typography sx={{ fontSize: sectionSize, fontWeight: 750 }}>Маршрут</Typography>
              </Box>
              {routeSummary && (
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
              {mapPoints.length > 1 && (
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<MapRoundedIcon />}
                  onClick={() => {
                    setIsMapOpen(true);
                    log('order_recommendation_map_opened', 'Открыта карта маршрута совета');
                  }}
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
              {externalRouteUrl && (
                <Button
                  fullWidth
                  component="a"
                  href={externalRouteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  endIcon={<LaunchRoundedIcon />}
                  sx={{ mt: 0.75, minHeight: 44, borderRadius: '14px', textTransform: 'none' }}
                >
                  Открыть маршрут
                </Button>
              )}
            </Box>
          )}

          {(result?.skip?.length ?? 0) > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: sectionSize, fontWeight: 750, mb: 0.75 }}>
                Что пока не брать
              </Typography>
              {result?.skip?.map((item) => (
                <Typography
                  key={item.id}
                  sx={{ fontSize: bodySize, lineHeight: 1.4, color: 'text.secondary', mb: 0.5 }}
                >
                  {orderById.get(item.id)?.id_text || `Заказ №${item.id}`}: {item.reason}
                </Typography>
              ))}
            </Box>
          )}

          {(result?.warnings?.length ?? 0) > 0 && (
            <>
              <Divider sx={{ mb: 1.25 }} />
              <Box sx={{ display: 'grid', gap: 0.75 }}>
                {result?.warnings?.map((warning) => (
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

      <RecommendationRouteMapDrawer
        open={isMapOpen}
        points={mapPoints}
        summary={routeSummary}
        externalUrl={mapRouteUrl}
        fontSize={globalFontSize}
        onClose={() => {
          setIsMapOpen(false);
          log('order_recommendation_map_closed', 'Закрыта карта маршрута совета');
        }}
      />
    </SwipeableDrawer>
  );
}
