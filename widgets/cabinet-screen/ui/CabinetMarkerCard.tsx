import Link from 'next/link';

import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';

import { useSettingsStore } from '@/entities/settings';
import { useHeaderStore } from '@/features/header/model/header.store';
import { sanitizeCssColor } from '@/shared/lib/escapeHtml';
import { resolveMarkerTheme } from '@/shared/lib/markerTheme';

import { SectionTitle } from './CabinetPreview';
import styles from './CabinetPreview.module.scss';

const exampleLabels = {
  norm: '18:40 (12 мин.)',
  full: '18:40 - 19:10 (12 мин.)',
  min: '12 мин.',
};

const customLabelThemes = new Set([
  'transparent',
  'transparent_white',
  'white',
  'white_border',
  'black',
]);

export function CabinetMarkerCard() {
  const timeFormat = useSettingsStore((state) => state.settings?.type_data_map) ?? 'norm';
  const savedColor = useSettingsStore((state) => sanitizeCssColor(state.settings?.color, ''));
  const theme = useHeaderStore((state) => state.theme);
  const darkTheme = useHeaderStore((state) => state.darkTheme);
  const mapScale = useHeaderStore((state) => Number(state.mapScale));
  const resolvedTheme = resolveMarkerTheme(theme, darkTheme);
  const classic = resolvedTheme === 'classic';
  const labelTheme = customLabelThemes.has(resolvedTheme)
    ? resolvedTheme
    : classic
      ? 'white'
      : 'white_border';
  const scale =
    classic || !Number.isFinite(mapScale)
      ? '1'
      : String(Math.round(Math.min(1.3, Math.max(0.5, mapScale)) * 10) / 10).replace('.', '_');

  return (
    <section className={styles.card} aria-labelledby="cabinet-marker">
      <SectionTitle id="cabinet-marker" icon={<PlaceRoundedIcon />}>
        Твоя метка на карте
      </SectionTitle>
      <div className={styles.markerExample}>
        <span className={`map-img ${styles.mapSample}`} aria-label="Пример метки заказа">
          <span className={`span_svg_circle_${scale} ${styles.mapSampleIcon}`} aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              style={{ color: savedColor || 'var(--app-text-muted)' }}
            >
              {classic ? (
                <>
                  <circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="3" />
                </>
              ) : (
                <path d="M11.969 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.47 10-10-4.47-10-10-10m.03 14.23c-2.34 0-4.23-1.89-4.23-4.23s1.89-4.23 4.23-4.23 4.23 1.89 4.23 4.23-1.89 4.23-4.23 4.23" />
              )}
            </svg>
          </span>
          <span className={`span_text_${labelTheme} ${styles.mapSampleLabel}`}>
            {exampleLabels[timeFormat] ?? exampleLabels.norm}
          </span>
        </span>
      </div>
      <Link href="/settings" className={styles.settingsLink} prefetch={false}>
        Настройки
        <ChevronRightRoundedIcon className={styles.chevron} aria-hidden="true" />
      </Link>
    </section>
  );
}
