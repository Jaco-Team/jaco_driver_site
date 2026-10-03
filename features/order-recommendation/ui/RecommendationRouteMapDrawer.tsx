'use client';

import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { Map, Placemark, Polyline, YMaps, ZoomControl, useYMaps } from '@pbe/react-yandex-maps';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useHeaderStore } from '@/features/header/model/header.store';
import { appDarkPalette, appPalette } from '@/shared/styles/appPalette';

import type { RouteMapPoint } from '../model/routeMapPoints';

const YANDEX_MAPS_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY ?? '';

const MARKER_COLORS: Record<RouteMapPoint['kind'], string> = {
  start: appPalette.textMuted,
  pickup: appPalette.primary,
  delivery: appPalette.brand,
};

type MapInstance = {
  geoObjects: {
    add: (object: object) => void;
    remove: (object: object) => void;
  };
};

interface RecommendationRouteMapDrawerProps {
  open: boolean;
  points: RouteMapPoint[];
  summary?: string | null;
  externalUrl?: string | null;
  fontSize: number;
  onClose: () => void;
}

function clampFontSize(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function mapShellSx(isDarkMap: boolean) {
  return {
    flex: 1,
    minHeight: 240,
    mt: 1.25,
    borderRadius: '18px',
    overflow: 'hidden',
    border: '1px solid',
    borderColor: 'divider',
    backgroundColor: isDarkMap ? appDarkPalette.surface : appPalette.surface,
  } as const;
}

function getRouteBounds(points: RouteMapPoint[]): [[number, number], [number, number]] | null {
  if (points.length === 0) return null;

  const lats = points.map((point) => point.coordinates[0]);
  const lons = points.map((point) => point.coordinates[1]);
  const padLat = Math.max((Math.max(...lats) - Math.min(...lats)) * 0.25, 0.004);
  const padLon = Math.max((Math.max(...lons) - Math.min(...lons)) * 0.25, 0.006);

  return [
    [Math.min(...lats) - padLat, Math.min(...lons) - padLon],
    [Math.max(...lats) + padLat, Math.max(...lons) + padLon],
  ];
}

// Real road geometry comes from the Yandex router; the straight polyline below is only a fallback
// for offline-ish cases when the router module or its request is unavailable.
function RouteLayer({
  map,
  points,
  strokeColor,
  onRouteUnavailable,
}: {
  map: MapInstance | null;
  points: RouteMapPoint[];
  strokeColor: string;
  onRouteUnavailable: () => void;
}) {
  const yMapsApi = useYMaps(['multiRouter.MultiRoute']);
  const MultiRoute = yMapsApi?.multiRouter?.MultiRoute;

  useEffect(() => {
    if (!map || !MultiRoute || points.length < 2) return;

    let multiRoute: InstanceType<typeof MultiRoute>;

    try {
      multiRoute = new MultiRoute(
        {
          referencePoints: points.map((point) => point.coordinates),
          params: { routingMode: 'auto', results: 1 },
        },
        {
          boundsAutoApply: true,
          wayPointVisible: false,
          viaPointVisible: false,
          routeActiveStrokeColor: strokeColor,
          routeActiveStrokeWidth: 5,
          routeStrokeColor: 'rgba(107, 120, 131, 0.5)',
          routeStrokeWidth: 3,
        }
      );
    } catch {
      onRouteUnavailable();
      return;
    }

    multiRoute.model.events.add('requestfail', onRouteUnavailable);
    map.geoObjects.add(multiRoute);

    return () => {
      map.geoObjects.remove(multiRoute);
    };
  }, [MultiRoute, map, onRouteUnavailable, points, strokeColor]);

  return null;
}

// Mounted only while the drawer is open, so map instance and router state reset on close.
function RouteMapCanvas({
  points,
  bounds,
  isDarkMap,
  routeColor,
  helperSize,
}: {
  points: RouteMapPoint[];
  bounds: [[number, number], [number, number]];
  isDarkMap: boolean;
  routeColor: string;
  helperSize: number;
}) {
  const [map, setMap] = useState<MapInstance | null>(null);
  const [isRouterUnavailable, setIsRouterUnavailable] = useState(false);
  const handleRouteUnavailable = useCallback(() => setIsRouterUnavailable(true), []);
  const handleMapRef = useCallback(
    (instance: unknown) => setMap((instance as MapInstance | null) ?? null),
    []
  );
  const line = useMemo(() => points.map((point) => point.coordinates), [points]);

  return (
    <>
      <Box sx={mapShellSx(isDarkMap)}>
        <Box
          sx={{
            width: '100%',
            height: '100%',
            filter: isDarkMap
              ? 'invert(92%) hue-rotate(180deg) brightness(72%) contrast(92%) saturate(70%)'
              : undefined,
          }}
        >
          <YMaps
            query={{
              lang: 'ru_RU',
              ...(YANDEX_MAPS_API_KEY ? { apikey: YANDEX_MAPS_API_KEY } : {}),
            }}
          >
            <Map
              defaultState={{ bounds, margin: [36, 36, 36, 36] }}
              instanceRef={handleMapRef}
              width="100%"
              height="100%"
              modules={['control.ZoomControl']}
              options={{ suppressMapOpenBlock: true }}
            >
              <ZoomControl options={{ size: 'small', position: { top: 12, right: 12 } }} />

              <RouteLayer
                map={map}
                points={points}
                strokeColor={routeColor}
                onRouteUnavailable={handleRouteUnavailable}
              />

              {isRouterUnavailable && line.length > 1 ? (
                <Polyline
                  geometry={line}
                  options={{
                    strokeColor: routeColor,
                    strokeWidth: 4,
                    strokeStyle: 'shortdash',
                    strokeOpacity: 0.8,
                  }}
                />
              ) : null}

              {points.map((point) => (
                <Placemark
                  key={point.key}
                  geometry={point.coordinates}
                  properties={{
                    iconContent: `${point.seq}`,
                    hintContent: point.title,
                    balloonContentHeader: point.title,
                    balloonContentBody: point.eta ? `Ожидаемое время: ${point.eta}` : '',
                  }}
                  options={{
                    preset: 'islands#circleIcon',
                    iconColor: MARKER_COLORS[point.kind],
                  }}
                />
              ))}
            </Map>
          </YMaps>
        </Box>
      </Box>

      {isRouterUnavailable && (
        <Typography sx={{ fontSize: helperSize, color: 'text.secondary', mt: 1 }}>
          Не удалось построить маршрут по дорогам, показан прямой порядок точек.
        </Typography>
      )}
    </>
  );
}

export function RecommendationRouteMapDrawer({
  open,
  points,
  summary,
  externalUrl,
  fontSize,
  onClose,
}: RecommendationRouteMapDrawerProps) {
  const theme = useTheme();
  const isDarkMap = useHeaderStore((state) => state.darkTheme);
  const bounds = useMemo(() => getRouteBounds(points), [points]);
  const titleSize = clampFontSize(fontSize + 3, 17, 22);
  const bodySize = clampFontSize(fontSize, 14, 18);
  const helperSize = clampFontSize(fontSize - 1, 13, 16);
  const routeColor = isDarkMap ? appDarkPalette.brand : appPalette.brand;

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={() => {}}
      disableSwipeToOpen
      data-testid="recommendation-route-map-drawer"
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            height: '90vh',
            backgroundColor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            boxShadow:
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
          height: '100%',
          px: 2,
          pt: 1.15,
          pb: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        }}
      >
        <Box onClick={onClose} sx={{ display: 'flex', justifyContent: 'center', pb: 1.25 }}>
          <Box
            sx={{
              width: 62,
              height: 6,
              borderRadius: 999,
              backgroundColor: isDarkMap ? 'rgba(217, 224, 230, 0.28)' : 'rgba(31, 43, 54, 0.2)',
            }}
          />
        </Box>

        <Typography component="h2" sx={{ fontSize: titleSize, fontWeight: 750, lineHeight: 1.2 }}>
          Маршрут на карте
        </Typography>
        {summary && (
          <Typography sx={{ fontSize: helperSize, color: 'text.secondary', mt: 0.25 }}>
            {summary}
          </Typography>
        )}

        {open && bounds ? (
          <RouteMapCanvas
            points={points}
            bounds={bounds}
            isDarkMap={isDarkMap}
            routeColor={routeColor}
            helperSize={helperSize}
          />
        ) : (
          <Box sx={mapShellSx(isDarkMap)}>
            <Box sx={{ display: 'grid', placeItems: 'center', height: '100%', px: 2 }}>
              <Typography sx={{ fontSize: bodySize, color: 'text.secondary', textAlign: 'center' }}>
                Для маршрута нет координат точек.
              </Typography>
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'grid', gap: 1, mt: 1.25 }}>
          {externalUrl && (
            <Button
              fullWidth
              variant="outlined"
              component="a"
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              endIcon={<LaunchRoundedIcon />}
              sx={{
                minHeight: 44,
                borderRadius: '14px',
                textTransform: 'none',
                fontSize: bodySize,
                fontWeight: 700,
              }}
            >
              Открыть в Яндекс Картах
            </Button>
          )}
          <Button
            fullWidth
            variant="contained"
            disableElevation
            onClick={onClose}
            sx={{
              minHeight: 44,
              borderRadius: '14px',
              textTransform: 'none',
              fontSize: bodySize,
              fontWeight: 750,
            }}
          >
            Закрыть
          </Button>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
}
