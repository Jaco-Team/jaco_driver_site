import CircularProgress from '@mui/material/CircularProgress';

export function SessionLoading({ fontSize }: { fontSize: number }) {
  return (
    <main className="session-loading" role="status" aria-live="polite">
      <CircularProgress size={40} aria-hidden="true" />
      <p
        className="session-loading__text"
        style={{ fontSize: Math.min(22, Math.max(12, fontSize)) }}
      >
        Загружаем приложение
      </p>
    </main>
  );
}
