import type { NextApiRequest, NextApiResponse } from 'next';

import { createOfflineMapSession, hasYandexTilesApiKey } from '@/shared/server/yandexOfflineMap';

interface SessionRequestBody {
  cityId?: unknown;
  pointId?: unknown;
  bounds?: {
    west?: unknown;
    south?: unknown;
    east?: unknown;
    north?: unknown;
  };
  minZoom?: unknown;
  maxZoom?: unknown;
  detailTile?: unknown;
}

function apiOrigin(): string {
  return `${
    process.env.NEXT_PUBLIC_API_ORIGIN ??
    process.env.NEXT_PUBLIC_API_URL ??
    'https://apidriver.jacochef.ru'
  }`.replace(/\/+$/, '');
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Метод не поддерживается.' });
    return;
  }

  if (!hasYandexTilesApiKey()) {
    res.status(503).json({ error: 'На сервере не настроен ключ Yandex Tiles API.' });
    return;
  }

  const authorization = `${req.headers.authorization ?? ''}`.trim();
  if (!authorization.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Требуется авторизация.' });
    return;
  }

  let body: SessionRequestBody | undefined;
  try {
    body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as
      SessionRequestBody | undefined;
  } catch {
    res.status(400).json({ error: 'Некорректные параметры области карты.' });
    return;
  }
  const session = createOfflineMapSession({
    cityId: body?.cityId,
    detailTile: body?.detailTile,
    pointId: body?.pointId,
    bounds: {
      west: Number(body?.bounds?.west),
      south: Number(body?.bounds?.south),
      east: Number(body?.bounds?.east),
      north: Number(body?.bounds?.north),
    },
    minZoom: Number(body?.minZoom),
    maxZoom: Number(body?.maxZoom),
  });

  if (!session) {
    res.status(400).json({ error: 'Некорректная или слишком большая область карты.' });
    return;
  }

  try {
    const authResponse = await fetch(`${apiOrigin()}/api/v1/auth/me`, {
      headers: {
        Accept: 'application/json',
        Authorization: authorization,
        'X-Requested-With': 'XMLHttpRequest',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(12_000),
    });

    if (!authResponse.ok) {
      res.status(authResponse.status === 401 ? 401 : 502).json({
        error:
          authResponse.status === 401
            ? 'Сессия истекла. Войдите снова.'
            : 'Не удалось проверить авторизацию перед загрузкой карты.',
      });
      return;
    }

    res.status(200).json({ session });
  } catch {
    res.status(502).json({ error: 'Backend недоступен. Загрузка карты не начата.' });
  }
}
