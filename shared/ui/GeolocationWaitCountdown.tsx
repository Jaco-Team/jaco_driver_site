import { useEffect, useState, useSyncExternalStore } from 'react';
import Typography from '@mui/material/Typography';

import { getGeolocationWaitState, subscribeGeolocationWait } from '@/shared/lib/geolocation';

const TICK_MS = 250;

export function useGeolocationWaitSeconds(): number | null {
  const wait = useSyncExternalStore(subscribeGeolocationWait, getGeolocationWaitState, () => null);
  const [now, setNow] = useState(0);

  useEffect(() => {
    if (wait === null) return undefined;

    const timer = window.setInterval(() => setNow(Date.now()), TICK_MS);
    return () => window.clearInterval(timer);
  }, [wait]);

  if (wait === null) {
    return null;
  }

  // До первого тика берём начало этапа, чтобы сразу показать полный срок.
  const effectiveNow = Math.max(now, wait.startedAt);
  return Math.max(0, Math.ceil((wait.deadlineAt - effectiveNow) / 1000));
}

interface GeolocationWaitCountdownProps {
  fontSize: number;
  color?: string;
}

/** Ориентир для курьера, сколько ещё ждать геопозицию до продолжения без неё. */
export function GeolocationWaitCountdown({ fontSize, color }: GeolocationWaitCountdownProps) {
  const seconds = useGeolocationWaitSeconds();

  if (seconds === null) {
    return null;
  }

  return (
    <Typography
      role="status"
      aria-live="polite"
      sx={{ color, fontSize, fontWeight: 600, lineHeight: 1.4, textAlign: 'center', mt: 1.5 }}
    >
      {seconds > 0 ? `Определяем местоположение · ${seconds} сек.` : 'Определяем местоположение…'}
    </Typography>
  );
}
