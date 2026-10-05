import * as maplibregl from '/offline-map/runtime/maplibre-gl.mjs?v=6.12.0';

const CACHE_NAME = 'jaco-yandex-offline-tiles-v1';
const METADATA_KEY = 'jaco_yandex_offline_maps_v2';

function isCoordinate(value) {
  return (
    Array.isArray(value) &&
    value.length >= 2 &&
    Number.isFinite(Number(value[0])) &&
    Number.isFinite(Number(value[1]))
  );
}

function safeColor(value) {
  const fallback = '#CC0033';

  if (typeof value !== 'string' || !value.trim()) {
    return fallback;
  }

  return globalThis.CSS?.supports?.('color', value.trim()) ? value.trim() : fallback;
}

function distanceToRegion(metadata, center) {
  if (!isCoordinate(center)) return Number.POSITIVE_INFINITY;
  const longitude = Number(center[1]);
  const latitude = Number(center[0]);
  const regionLongitude = (metadata.bounds.west + metadata.bounds.east) / 2;
  const regionLatitude = (metadata.bounds.south + metadata.bounds.north) / 2;

  return Math.hypot(longitude - regionLongitude, latitude - regionLatitude);
}

async function readOfflineMap(pointId, center) {
  let registry;

  try {
    registry = JSON.parse(localStorage.getItem(METADATA_KEY) || 'null');
  } catch {
    registry = null;
  }

  const regions =
    registry?.version === 2
      ? Object.values(registry.regions || {}).filter((region) => region.expiresAt > Date.now())
      : [];
  const exact =
    pointId === null || pointId === undefined ? null : registry?.regions?.[String(pointId)] || null;
  const containing = regions.filter(
    (region) =>
      !isCoordinate(center) ||
      (Number(center[0]) >= region.bounds.south &&
        Number(center[0]) <= region.bounds.north &&
        Number(center[1]) >= region.bounds.west &&
        Number(center[1]) <= region.bounds.east)
  );
  const cityMap = containing.find((region) => region.cityId);
  const metadata =
    cityMap ||
    (exact?.expiresAt > Date.now()
      ? exact
      : containing.sort((a, b) => distanceToRegion(a, center) - distanceToRegion(b, center))[0]);

  if (!metadata) {
    throw new Error(
      'Карта этой области ещё не сохранена. Скачайте город в настройках при подключённом интернете.'
    );
  }

  const cache = await caches.open(CACHE_NAME);

  return { cache, metadata };
}

function getMarkerScale(value) {
  const scale = Number.parseFloat(String(value));

  return Number.isFinite(scale) ? Math.min(1.3, Math.max(0.5, scale)) : 1;
}

function getLabelTheme(value) {
  const theme = value === 'classic' ? 'white' : String(value || 'transparent');

  return ['transparent', 'transparent_white', 'white', 'white_border', 'black'].includes(theme)
    ? theme
    : 'transparent';
}

function createMarkerIcon(group, size) {
  const namespace = 'http://www.w3.org/2000/svg';
  const icon = document.createElement('span');
  const svg = document.createElementNS(namespace, 'svg');
  const path = document.createElementNS(namespace, 'path');

  icon.className = 'offline-order-marker__icon';
  icon.style.width = `${size}px`;
  icon.style.height = `${size}px`;
  svg.setAttribute('viewBox', group.isLocation ? '0 0 64 64' : '0 0 24 24');
  svg.setAttribute('aria-hidden', 'true');
  path.setAttribute('fill', safeColor(group.color));
  path.setAttribute(
    'd',
    group.isLocation
      ? 'M32 0C18.746 0 8 10.746 8 24c0 5.219 1.711 10.008 4.555 13.93.051.094.059.199.117.289l16 24a4 4 0 0 0 6.656 0l16-24c.059-.09.066-.195.117-.289C54.289 34.008 56 29.219 56 24 56 10.746 45.254 0 32 0m0 32a8 8 0 1 1 0-16 8 8 0 0 1 0 16'
      : 'M11.969 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.47-10-10-10m.03 14.23c-2.34 0-4.23-1.89-4.23-4.23s1.89-4.23 4.23-4.23 4.23 1.89 4.23 4.23'
  );
  svg.append(path);
  icon.append(svg);

  return icon;
}

function createOrderMarker(group, options, onOrderClick) {
  const marker = document.createElement('button');
  const details = document.createElement('span');
  const label = document.createElement('span');
  const scale = getMarkerScale(options.mapScale);
  const size = (group.isLocation ? 20 : 24) * scale;
  const icon = createMarkerIcon(group, size);

  marker.type = 'button';
  marker.className = 'offline-order-marker';
  marker.style.width = `${size}px`;
  marker.style.height = `${size}px`;
  marker.setAttribute(
    'aria-label',
    `Открыть заказ ${group.idText || `#${group.orderId}`} по адресу ${
      group.address || 'адрес не указан'
    }`
  );
  details.className = 'offline-order-marker__details';
  label.className = `offline-order-marker__label offline-order-marker__label--${getLabelTheme(
    options.theme
  )}`;
  label.style.fontSize = `${Number.isFinite(Number(options.globalFontSize)) ? Number(options.globalFontSize) : 16}px`;
  label.textContent = group.label || group.idText || `#${group.orderId}`;
  details.append(label);
  marker.append(icon, details);

  if (Number(group.count) > 1) {
    const count = document.createElement('span');
    count.className = 'offline-order-marker__count';
    count.textContent = String(group.count);
    details.append(count);
  }

  marker.addEventListener('click', () => onOrderClick?.(group.orderId));

  return marker;
}

function createZoomControls(map, container) {
  const controls = document.createElement('div');
  const rail = document.createElement('button');
  const handle = document.createElement('span');

  controls.className = 'offline-map-zoom';
  rail.type = 'button';
  rail.className = 'offline-map-zoom__rail';
  rail.setAttribute('role', 'slider');
  rail.setAttribute('aria-label', 'Масштаб карты');
  rail.setAttribute('aria-orientation', 'vertical');
  rail.setAttribute('aria-valuemin', String(map.getMinZoom()));
  rail.setAttribute('aria-valuemax', String(map.getMaxZoom()));
  handle.className = 'offline-map-zoom__handle';
  rail.append(handle);
  controls.append(rail);
  container.append(controls);

  const syncHandle = () => {
    const range = map.getMaxZoom() - map.getMinZoom();
    const progress = range > 0 ? (map.getZoom() - map.getMinZoom()) / range : 0;
    handle.style.top = `${(1 - progress) * 100}%`;
    rail.style.setProperty('--zoom-progress', `${progress * 100}%`);
    rail.setAttribute('aria-valuenow', String(Math.round(map.getZoom() * 10) / 10));
  };
  const stopPropagation = (event) => {
    event.stopPropagation();
  };
  const setZoom = (nextZoom) => {
    map.stop();
    map.jumpTo({
      zoom: Math.min(map.getMaxZoom(), Math.max(map.getMinZoom(), nextZoom)),
    });
    map.triggerRepaint();
    syncHandle();
  };
  const handleRailClick = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const bounds = rail.getBoundingClientRect();
    const progress = 1 - Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
    setZoom(map.getMinZoom() + progress * (map.getMaxZoom() - map.getMinZoom()));
  };
  const handleRailPointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    rail.setPointerCapture(event.pointerId);
    handleRailClick(event);
  };
  const handleRailPointerMove = (event) => {
    if (rail.hasPointerCapture(event.pointerId)) handleRailClick(event);
  };
  const handleRailKeyDown = (event) => {
    const nextZoom = {
      ArrowUp: map.getZoom() + 1,
      ArrowRight: map.getZoom() + 1,
      ArrowDown: map.getZoom() - 1,
      ArrowLeft: map.getZoom() - 1,
      Home: map.getMinZoom(),
      End: map.getMaxZoom(),
    }[event.key];
    if (nextZoom === undefined) return;
    event.preventDefault();
    event.stopPropagation();
    setZoom(nextZoom);
  };

  controls.addEventListener('pointerdown', stopPropagation);
  controls.addEventListener('mousedown', stopPropagation);
  controls.addEventListener('touchstart', stopPropagation, { passive: true });
  controls.addEventListener('dblclick', stopPropagation);
  rail.addEventListener('click', handleRailClick);
  rail.addEventListener('pointerdown', handleRailPointerDown);
  rail.addEventListener('pointermove', handleRailPointerMove);
  rail.addEventListener('keydown', handleRailKeyDown);
  map.on('zoom', syncHandle);
  syncHandle();

  return () => {
    map.off('zoom', syncHandle);
    controls.removeEventListener('pointerdown', stopPropagation);
    controls.removeEventListener('mousedown', stopPropagation);
    controls.removeEventListener('touchstart', stopPropagation);
    controls.removeEventListener('dblclick', stopPropagation);
    rail.removeEventListener('click', handleRailClick);
    rail.removeEventListener('pointerdown', handleRailPointerDown);
    rail.removeEventListener('pointermove', handleRailPointerMove);
    rail.removeEventListener('keydown', handleRailKeyDown);
    controls.remove();
  };
}

function createAttribution(container) {
  const attribution = document.createElement('div');
  const mapsLink = document.createElement('a');
  const logo = document.createElement('img');
  const termsLink = document.createElement('a');

  attribution.className = 'offline-map-attribution';
  mapsLink.href = 'https://yandex.ru/maps/';
  mapsLink.target = '_blank';
  mapsLink.rel = 'noreferrer';
  mapsLink.setAttribute('aria-label', 'Открыть в Яндекс Картах');
  logo.src = '/offline-map/yandex-logo-ru.svg';
  logo.alt = 'Яндекс Карты';
  termsLink.href = 'https://yandex.ru/legal/maps_termsofuse/';
  termsLink.target = '_blank';
  termsLink.rel = 'noreferrer';
  termsLink.textContent = 'Условия';
  attribution.append(mapsLink, termsLink);
  mapsLink.append(logo);
  container.append(attribution);

  return () => attribution.remove();
}

function createHomeMarker(map, coordinate, dark, onHomeClick) {
  const marker = document.createElement('button');

  marker.type = 'button';
  marker.className = 'offline-home-marker';
  marker.setAttribute('aria-label', 'Показать кафе');
  marker.style.color = dark ? '#f0f8ff' : '#111820';
  marker.innerHTML =
    '<svg aria-hidden="true" viewBox="0 0 24 24"><path fill="currentColor" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6.5 20v-9H3l9-6 9 6h-3.5v9h-3v-3.5A1.5 1.5 0 0 0 13 15h-2a1.5 1.5 0 0 0-1.5 1.5V20z"/></svg>';
  marker.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    map.stop();
    map.easeTo({ center: coordinate, duration: 250 });
    map.triggerRepaint();
    onHomeClick?.();
  });

  return marker;
}

function getMapViewport(map) {
  const bounds = map.getBounds();
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();
  const center = map.getCenter();

  return {
    bounds: [
      [southWest.lat, southWest.lng],
      [northEast.lat, northEast.lng],
    ],
    center: [center.lat, center.lng],
  };
}

async function mount({
  container,
  signal,
  pointId,
  center,
  zoom = 12,
  groups = [],
  dark = false,
  theme = 'transparent',
  mapScale = '1',
  globalFontSize = 16,
  showZoomControls = true,
  onOrderClick,
  onHomeClick,
  onViewportChange,
  onReady,
  onError,
}) {
  if (!(container instanceof HTMLElement)) {
    throw new Error('Не найден контейнер офлайн-карты.');
  }

  try {
    const coverageCenter = isCoordinate(center)
      ? center
      : groups.find((group) => isCoordinate(group.coordinate))?.coordinate;
    const { cache, metadata } = await readOfflineMap(pointId, coverageCenter);

    if (signal?.aborted) {
      throw new DOMException('Загрузка офлайн-карты отменена.', 'AbortError');
    }

    maplibregl.removeProtocol('yandex-offline');
    maplibregl.addProtocol('yandex-offline', async (request, abortController) => {
      const match = request.url.match(/^yandex-offline:\/\/(\d+)\/(\d+)\/(\d+)$/);

      if (!match) {
        throw new Error(`Некорректный адрес офлайн-тайла: ${request.url}`);
      }

      if (abortController.signal.aborted) {
        throw new DOMException('Загрузка тайла отменена.', 'AbortError');
      }

      const [, z, x, y] = match;
      const tileUrl = new URL(`/offline-map/yandex/${z}/${x}/${y}.png`, location.origin);
      const response = await cache.match(tileUrl.href);

      if (!response) {
        throw new Error(`Тайл ${z}/${x}/${y} отсутствует в сохранённой карте.`);
      }

      const data = new Uint8Array(await response.arrayBuffer());
      return { data };
    });

    const requestedCenter = isCoordinate(coverageCenter)
      ? [Number(coverageCenter[1]), Number(coverageCenter[0])]
      : [
          (metadata.bounds.west + metadata.bounds.east) / 2,
          (metadata.bounds.south + metadata.bounds.north) / 2,
        ];
    const mapCenter = [
      Math.min(metadata.bounds.east, Math.max(metadata.bounds.west, requestedCenter[0])),
      Math.min(metadata.bounds.north, Math.max(metadata.bounds.south, requestedCenter[1])),
    ];
    const requestedZoom = Number.isFinite(Number(zoom)) ? Number(zoom) - 1 : 11;
    const initialZoom = Number.isFinite(Number(metadata.initialZoom))
      ? Number(metadata.initialZoom)
      : requestedZoom;
    const cameraMinZoom = Number.isFinite(Number(metadata.cameraMinZoom))
      ? Number(metadata.cameraMinZoom)
      : Math.max(Number(metadata.minZoom) - 1, initialZoom - 1);
    const cameraMaxZoom = Number.isFinite(Number(metadata.cameraMaxZoom))
      ? Number(metadata.cameraMaxZoom)
      : Math.min(Number(metadata.maxZoom) - 1, initialZoom + 2);
    const map = new maplibregl.Map({
      container,
      center: mapCenter,
      zoom: Math.min(cameraMaxZoom, Math.max(cameraMinZoom, initialZoom)),
      minZoom: cameraMinZoom,
      maxZoom: cameraMaxZoom,
      maxBounds: metadata.cityId
        ? [
            [metadata.bounds.west, metadata.bounds.south],
            [metadata.bounds.east, metadata.bounds.north],
          ]
        : undefined,
      attributionControl: false,
      style: {
        version: 8,
        sources: {
          yandex: {
            type: 'raster',
            tiles: ['yandex-offline://{z}/{x}/{y}'],
            tileSize: 256,
            minzoom: metadata.minZoom,
            maxzoom: metadata.maxZoom,
            bounds: [
              metadata.bounds.west,
              metadata.bounds.south,
              metadata.bounds.east,
              metadata.bounds.north,
            ],
          },
        },
        layers: [
          {
            id: 'yandex',
            type: 'raster',
            source: 'yandex',
            paint: { 'raster-fade-duration': 0 },
          },
        ],
      },
    });
    let destroyed = false;
    let loaded = false;
    let pendingMapError = null;
    let mapErrorTimer = null;
    let currentGroups = groups;
    let homeMarker = null;
    let orderMarkers = [];
    let resizeFrame = requestAnimationFrame(() => {
      map.resize();
      map.triggerRepaint();
    });
    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            cancelAnimationFrame(resizeFrame);
            resizeFrame = requestAnimationFrame(() => {
              map.resize();
              map.triggerRepaint();
            });
          });
    resizeObserver?.observe(container);
    const removeZoomControls = showZoomControls ? createZoomControls(map, container) : () => {};
    const removeAttribution = createAttribution(container);
    const syncViewport = () => {
      if (!destroyed && loaded) {
        onViewportChange?.(getMapViewport(map));
      }
    };

    const removeMarker = (marker) => {
      try {
        marker?.remove();
      } catch {
        // Marker may already have been detached by MapLibre during map cleanup.
      }
    };
    const clearOrderMarkers = () => {
      const markers = orderMarkers;
      orderMarkers = [];
      markers.forEach(removeMarker);
    };
    const renderOrderMarkers = (nextGroups) => {
      currentGroups = Array.isArray(nextGroups) ? nextGroups : [];

      if (!loaded || destroyed) {
        return;
      }

      clearOrderMarkers();

      for (const group of currentGroups) {
        if (!isCoordinate(group.coordinate)) {
          continue;
        }

        const marker = new maplibregl.Marker({
          element: createOrderMarker(group, { theme, mapScale, globalFontSize }, onOrderClick),
          anchor: group.isLocation ? 'bottom' : 'center',
          subpixelPositioning: true,
        })
          .setLngLat([Number(group.coordinate[1]), Number(group.coordinate[0])])
          .addTo(map);
        orderMarkers.push(marker);
      }
    };
    const handleLoad = () => {
      if (destroyed) {
        return;
      }

      loaded = true;
      map.resize();
      map.triggerRepaint();

      if (mapErrorTimer !== null) {
        clearTimeout(mapErrorTimer);
        mapErrorTimer = null;
      }

      if (isCoordinate(center)) {
        const homeCoordinate = [Number(center[1]), Number(center[0])];
        homeMarker = new maplibregl.Marker({
          element: createHomeMarker(map, homeCoordinate, dark, onHomeClick),
          anchor: 'center',
          subpixelPositioning: true,
        })
          .setLngLat(homeCoordinate)
          .addTo(map);
      }

      renderOrderMarkers(currentGroups);
      syncViewport();
      onReady?.({
        size: metadata.byteSize,
        markerCount: orderMarkers.length + (homeMarker ? 1 : 0),
      });
    };
    const handleError = (event) => {
      if (destroyed) {
        return;
      }

      const mapError = event.error || new Error('Ошибка офлайн-карты.');

      if (loaded) {
        console.warn('[offline-map] MapLibre warning:', mapError);
        return;
      }

      pendingMapError = mapError;

      if (mapErrorTimer === null) {
        mapErrorTimer = setTimeout(() => {
          mapErrorTimer = null;

          if (!destroyed && !loaded) {
            onError?.(pendingMapError || new Error('Не удалось отрисовать офлайн-карту.'));
          }
        }, 10000);
      }
    };

    map.once('load', handleLoad);
    map.on('error', handleError);
    map.on('moveend', syncViewport);

    return {
      updateGroups(nextGroups) {
        renderOrderMarkers(nextGroups);
      },
      centerOnCoordinate(coordinate) {
        if (!isCoordinate(coordinate) || destroyed) {
          return;
        }

        map.stop();
        map.easeTo({
          center: [Number(coordinate[1]), Number(coordinate[0])],
          duration: 250,
        });
        map.triggerRepaint();
      },
      destroy() {
        if (destroyed) {
          return;
        }

        destroyed = true;
        map.off('load', handleLoad);
        map.off('error', handleError);
        map.off('moveend', syncViewport);

        if (mapErrorTimer !== null) {
          clearTimeout(mapErrorTimer);
          mapErrorTimer = null;
        }

        removeZoomControls();
        removeAttribution();
        resizeObserver?.disconnect();
        cancelAnimationFrame(resizeFrame);
        clearOrderMarkers();
        removeMarker(homeMarker);
        homeMarker = null;

        try {
          map.remove();
        } catch {
          // MapLibre may already have released its DOM nodes during route cleanup.
        }
      },
    };
  } catch (error) {
    onError?.(error);
    throw error;
  }
}

globalThis.JacoOfflineOrdersMap = { version: '28', mount };
globalThis.dispatchEvent(new Event('jaco-offline-orders-map-ready'));

export { mount };
