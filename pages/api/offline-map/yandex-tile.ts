import type { NextApiRequest, NextApiResponse } from 'next';

import {
  buildYandexTileUrl,
  hasYandexTilesApiKey,
  isAllowedOfflineTile,
  verifyOfflineMapSession,
} from '@/shared/server/yandexOfflineMap';

interface RateLimitBucket {
  second: number;
  count: number;
}

const rateLimits = new Map<string, RateLimitBucket>();

function clientIp(req: NextApiRequest): string {
  const forwarded = `${req.headers['x-forwarded-for'] ?? ''}`.split(',')[0].trim();
  return forwarded || req.socket.remoteAddress || 'unknown';
}

function isRateLimited(req: NextApiRequest): boolean {
  const ip = clientIp(req);
  const second = Math.floor(Date.now() / 1000);
  const current = rateLimits.get(ip);

  if (!current || current.second !== second) {
    rateLimits.set(ip, { second, count: 1 });
    return false;
  }

  current.count += 1;
  return current.count > 24;
}

function referer(req: NextApiRequest): string {
  const forwardedProto = `${req.headers['x-forwarded-proto'] ?? ''}`.split(',')[0].trim();
  const protocol = forwardedProto || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  const host = `${req.headers['x-forwarded-host'] ?? req.headers.host ?? 'localhost:3225'}`
    .split(',')[0]
    .trim();

  return `${protocol}://${host}/map_orders`;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    res.status(405).json({ error: 'Метод не поддерживается.' });
    return;
  }

  if (!hasYandexTilesApiKey()) {
    res.status(503).json({ error: 'На сервере не настроен ключ Yandex Tiles API.' });
    return;
  }

  const session = verifyOfflineMapSession(req.query.session);
  if (!session) {
    res.status(401).json({ error: 'Сессия загрузки карты истекла. Запустите загрузку снова.' });
    return;
  }

  if (isRateLimited(req)) {
    res.setHeader('Retry-After', '1');
    res.status(429).json({ error: 'Слишком много запросов. Повторите через секунду.' });
    return;
  }

  const x = Number(req.query.x);
  const y = Number(req.query.y);
  const z = Number(req.query.z);

  if (!isAllowedOfflineTile(session, x, y, z)) {
    res.status(400).json({ error: 'Тайл находится за пределами разрешённой области.' });
    return;
  }

  try {
    const tile = await fetch(buildYandexTileUrl(x, y, z), {
      cache: 'no-store',
      headers: { Referer: referer(req) },
      signal: AbortSignal.timeout(12_000),
    });

    if (!tile.ok) {
      res.status(tile.status).json({ error: `Yandex Tiles API вернул HTTP ${tile.status}.` });
      return;
    }

    const contentType = tile.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      res.status(502).json({ error: 'Yandex Tiles API вернул не изображение.' });
      return;
    }

    const data = Buffer.from(await tile.arrayBuffer());
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', String(data.byteLength));
    res.status(200).send(data);
  } catch {
    res.status(502).json({ error: 'Сервер не смог получить тайл Яндекса.' });
  }
}
