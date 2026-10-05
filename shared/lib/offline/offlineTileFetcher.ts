const REQUEST_INTERVAL_MS = 100;
const MAX_ATTEMPTS = 5;

function wait(milliseconds: number, signal: AbortSignal): Promise<void> {
  signal.throwIfAborted();
  return new Promise((resolve, reject) => {
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, milliseconds);
    signal.addEventListener('abort', onAbort, { once: true });
  });
}

function retryDelay(response: Response, attempt: number): number {
  const header = response.headers.get('Retry-After')?.trim();
  if (header) {
    const seconds = Number(header);
    const delay = Number.isFinite(seconds) ? seconds * 1000 : Date.parse(header) - Date.now();
    if (Number.isFinite(delay)) return Math.max(1000, delay);
  }
  return 1000 * 2 ** attempt;
}

export function createOfflineTileFetcher() {
  let nextRequestAt = 0;
  let pausedUntil = 0;
  let queue: Promise<void> = Promise.resolve();

  const reserveRequest = (signal: AbortSignal) => {
    const reservation = queue.then(async () => {
      signal.throwIfAborted();
      // All workers share the same pace and cooldown, including retries.
      while (Math.max(nextRequestAt, pausedUntil) > Date.now()) {
        await wait(Math.max(nextRequestAt, pausedUntil) - Date.now(), signal);
      }
      signal.throwIfAborted();
      nextRequestAt = Date.now() + REQUEST_INTERVAL_MS;
    });
    queue = reservation.catch(() => undefined);
    return reservation;
  };

  return async (url: string, signal: AbortSignal): Promise<Response> => {
    for (let attempt = 0; ; attempt += 1) {
      await reserveRequest(signal);
      const response = await fetch(url, { cache: 'no-store', signal });
      if (response.status !== 429) return response;

      pausedUntil = Math.max(pausedUntil, Date.now() + retryDelay(response, attempt));
      if (attempt === MAX_ATTEMPTS - 1) return response;
      await response.body?.cancel();
    }
  };
}
