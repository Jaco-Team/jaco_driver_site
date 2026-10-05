import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { runInNewContext } from 'node:vm';
import { compile } from 'sass';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

const root = resolve(import.meta.dirname, '../..');
const runtimeSource = readFileSync(
  resolve(root, 'public/offline-map/offline-orders-map.mjs'),
  'utf8'
)
  .replace(/^import \* as maplibregl from '[^']+';\n/, '')
  .replace(/^export \{ mount \};$/m, '');
let styles;

beforeAll(() => {
  styles = document.createElement('style');
  styles.textContent = compile(resolve(root, 'styles/map.scss')).css;
  document.head.append(styles);
});
afterAll(() => styles.remove());
afterEach(() => {
  localStorage.clear();
  document.body.replaceChildren();
});

async function openMap(groups, options = {}) {
  const markers = [];
  const listeners = {};
  const map = {
    once: vi.fn((event, callback) => {
      listeners[event] = callback;
    }),
    on: vi.fn(),
    off: vi.fn(),
    resize: vi.fn(),
    triggerRepaint: vi.fn(),
    getBounds: () => ({
      getSouthWest: () => ({ lat: 53.4, lng: 49.2 }),
      getNorthEast: () => ({ lat: 53.7, lng: 49.7 }),
    }),
    getCenter: () => ({ lat: 53.5, lng: 49.4 }),
    remove: vi.fn(),
    stop: vi.fn(),
    easeTo: vi.fn(),
  };
  const container = document.createElement('div');
  document.body.append(container);
  localStorage.setItem(
    'jaco_yandex_offline_maps_v2',
    JSON.stringify({
      version: 2,
      regions: {
        'city:tolyatti': {
          cityId: 'tolyatti',
          expiresAt: Date.now() + 60_000,
          minZoom: 10,
          maxZoom: 14,
          bounds: { west: 49.2, south: 53.4, east: 49.7, north: 53.7 },
        },
      },
    })
  );
  const api = { dispatchEvent: vi.fn() };
  runInNewContext(runtimeSource, {
    maplibregl: {
      removeProtocol: vi.fn(),
      addProtocol: vi.fn(),
      Map: class {
        constructor() {
          return map;
        }
      },
      Marker: class {
        constructor(settings) {
          this.settings = settings;
          this.remove = vi.fn();
          markers.push(this);
        }
        setLngLat(coordinate) {
          this.coordinate = coordinate;
          return this;
        }
        addTo() {
          container.append(this.settings.element);
          return this;
        }
      },
    },
    globalThis: api,
    document,
    HTMLElement,
    localStorage,
    location,
    Event,
    caches: { open: vi.fn().mockResolvedValue({}) },
    requestAnimationFrame: vi.fn().mockReturnValue(1),
    cancelAnimationFrame: vi.fn(),
  });
  const onOrderClick = vi.fn();
  const handle = await api.JacoOfflineOrdersMap.mount({
    container,
    groups,
    center: [53.5, 49.4],
    showZoomControls: false,
    onOrderClick,
    ...options,
  });
  listeners.load();
  return { markers, handle, onOrderClick };
}

const order = {
  coordinate: [53.52, 49.42],
  orderId: 7,
  idText: '#7',
  label: '13:46 (38 мин.)',
  color: 'green',
  count: 1,
};

describe('offline marker coordinate anchors', () => {
  it.each(['transparent', 'white', 'white_border', 'black'])(
    'keeps the circle center at the coordinate with the %s theme',
    async (theme) => {
      const { markers, handle } = await openMap([order], { theme });
      const marker = markers[1];
      expect(markers[0].settings.anchor).toBe('center');
      expect(marker.settings).toMatchObject({ anchor: 'center', subpixelPositioning: true });
      expect(marker.coordinate).toEqual([49.42, 53.52]);
      expect(marker.settings.element.style.width).toBe('24px');
      expect(marker.settings.element.style.height).toBe('24px');
      expect(
        getComputedStyle(marker.settings.element.querySelector('.offline-order-marker__details'))
          .position
      ).toBe('absolute');
      handle.destroy();
    }
  );
  it('does not let a long label, a count or a large font change the coordinate footprint', async () => {
    const { markers, handle, onOrderClick } = await openMap([order], {
      globalFontSize: 22,
      mapScale: '1.3',
    });
    handle.updateGroups([{ ...order, label: 'Очень длинная подпись времени заказа', count: 12 }]);
    const marker = markers.at(-1);
    const element = marker.settings.element;
    expect(marker.settings.anchor).toBe('center');
    expect(marker.coordinate).toEqual([49.42, 53.52]);
    expect(Number.parseFloat(element.style.width)).toBeCloseTo(31.2);
    expect(element.style.height).toBe(element.style.width);
    expect(element.querySelector('.offline-order-marker__count').parentElement.className).toBe(
      'offline-order-marker__details'
    );
    element.querySelector('.offline-order-marker__label').click();
    expect(onOrderClick).toHaveBeenCalledWith(7);
    handle.destroy();
  });
  it('anchors a location pin by its tip, not by its label or circle center', async () => {
    const { markers, handle } = await openMap([{ ...order, isLocation: true, count: 2 }], {
      mapScale: '0.5',
    });
    const marker = markers[1];
    expect(marker.settings.anchor).toBe('bottom');
    expect(marker.settings.element.style.width).toBe('10px');
    expect(marker.settings.element.style.height).toBe('10px');
    expect(marker.coordinate).toEqual([49.42, 53.52]);
    handle.destroy();
  });
});
