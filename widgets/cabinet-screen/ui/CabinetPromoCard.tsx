import { useEffect, useState } from 'react';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

import styles from './CabinetPreview.module.scss';

type CabinetPromoCardProps = {
  code: string;
  description: string;
  detail?: string;
  timing?: string;
  used?: boolean;
};

export function CabinetPromoCard({
  code,
  description,
  detail,
  timing,
  used,
}: CabinetPromoCardProps) {
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  useEffect(() => {
    if (copyStatus === 'idle') return;
    const timeout = window.setTimeout(() => setCopyStatus('idle'), 1800);
    return () => window.clearTimeout(timeout);
  }, [copyStatus]);

  async function copyPromo() {
    try {
      await navigator.clipboard.writeText(code);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
  }

  const copyMessage =
    copyStatus === 'copied'
      ? 'Промокод скопирован'
      : copyStatus === 'error'
        ? 'Не удалось скопировать промокод'
        : '';

  return (
    <div className={styles.promo}>
      <div className={styles.promoHeader}>
        <strong>{code}</strong>
        <button
          type="button"
          onClick={() => void copyPromo()}
          className={styles.copyButton}
          aria-label={copyMessage || 'Скопировать промокод'}
        >
          {copyStatus === 'copied' && <CheckRoundedIcon aria-hidden="true" />}
          {copyStatus === 'error' && <ErrorOutlineRoundedIcon aria-hidden="true" />}
          {copyStatus === 'idle' && <ContentCopyRoundedIcon aria-hidden="true" />}
        </button>
        <span className={styles.copyStatus} role="status">
          {copyMessage}
        </span>
      </div>
      {used && <p className={styles.meta}>Использован</p>}
      {description && <p>{description}</p>}
      {detail && <p>{detail}</p>}
      {timing && <p className={styles.meta}>{timing}</p>}
    </div>
  );
}
