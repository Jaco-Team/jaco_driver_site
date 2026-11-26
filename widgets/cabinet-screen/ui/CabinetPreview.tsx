import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';

import CalculateOutlinedIcon from '@mui/icons-material/CalculateOutlined';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import EventNoteRoundedIcon from '@mui/icons-material/EventNoteRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';

import { useHeaderStore } from '@/features/header/model/header.store';
import type { CabinetPreviewOptions } from '@/shared/config/cabinetPreview';

import { CabinetPromoCard } from './CabinetPromoCard';
import styles from './CabinetPreview.module.scss';

const workLinks = [
  { label: 'График работы', href: '/graph', Icon: EventNoteRoundedIcon },
  { label: 'Расчёт', href: '/price', Icon: CalculateOutlinedIcon },
  { label: 'Статистика', href: '/statistics', Icon: QueryStatsRoundedIcon },
] as const;

export function SectionTitle({
  id,
  icon,
  children,
}: {
  id: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <h2 className={styles.sectionTitle} id={id}>
      <span className={styles.sectionIcon} aria-hidden="true">
        {icon}
      </span>
      {children}
    </h2>
  );
}

export type CabinetExpansion = {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
};

export function CabinetDisclosure({
  title,
  icon,
  subtitle,
  expansion,
  children,
}: {
  title: string;
  icon: ReactNode;
  subtitle: ReactNode;
  expansion?: CabinetExpansion;
  children: ReactNode;
}) {
  return (
    <details className={styles.card} open={expansion?.expanded}>
      <summary
        className={styles.detailsSummary}
        onClick={
          expansion &&
          ((event) => {
            event.preventDefault();
            expansion.onExpandedChange(!expansion.expanded);
          })
        }
      >
        <span className={styles.sectionIcon} aria-hidden="true">
          {icon}
        </span>
        <span className={styles.summaryCopy}>
          <span className={styles.summaryTitle}>{title}</span>
          {subtitle}
        </span>
        <ExpandMoreRoundedIcon className={styles.detailsArrow} aria-hidden="true" />
      </summary>
      {children}
    </details>
  );
}

type ProfileDetails = {
  registrationDate: string | null;
  experienceMonths: number | null;
};

type CabinetScreenProps = {
  fullName: string | null;
  workplaceName?: string | null;
  profile?: ProfileDetails;
  profileExpansion?: CabinetExpansion;
  showOfflineProfile?: boolean;
  showStatistics: boolean;
  photoUrl?: string | null;
  onPhotoSettled?: (url: string) => void;
  appointmentName?: string | null;
  fontSize?: number | null;
  preview?: boolean;
  children?: ReactNode;
};

function CabinetAvatar({
  photoUrl,
  onPhotoSettled,
}: {
  photoUrl: string | null | undefined;
  onPhotoSettled?: (url: string) => void;
}) {
  const [result, setResult] = useState<'loaded' | 'failed' | null>(null);

  useEffect(() => {
    if (!photoUrl || result) return;
    const timeout = window.setTimeout(() => {
      setResult('failed');
      onPhotoSettled?.(photoUrl);
    }, 8000);
    return () => window.clearTimeout(timeout);
  }, [onPhotoSettled, photoUrl, result]);

  return (
    <span className={styles.avatar} aria-hidden="true">
      <PersonRoundedIcon />
      {photoUrl && result !== 'failed' && (
        // The URL comes from the profile API. Show the placeholder if the image fails.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photoUrl}
          alt=""
          onLoad={() => {
            setResult('loaded');
            onPhotoSettled?.(photoUrl);
          }}
          onError={() => {
            setResult('failed');
            onPhotoSettled?.(photoUrl);
          }}
        />
      )}
    </span>
  );
}

const russianPlural = new Intl.PluralRules('ru');

function formatExperience(experienceMonths: number | null) {
  if (experienceMonths == null) return null;
  if (experienceMonths === 0) return 'Менее месяца';

  const years = Math.floor(experienceMonths / 12);
  const months = experienceMonths % 12;
  const yearForm = { one: 'год', few: 'года', many: 'лет', other: 'лет', zero: 'лет', two: 'года' };
  const yearsText = years ? `${years} ${yearForm[russianPlural.select(years)]}` : '';
  const monthsText = months ? `${months} мес.` : '';
  return [yearsText, monthsText].filter(Boolean).join(' ');
}

function CabinetProfileCard({
  fullName,
  appointmentName,
  workplaceName,
  profile,
  profileExpansion,
}: Pick<
  CabinetScreenProps,
  'fullName' | 'appointmentName' | 'workplaceName' | 'profileExpansion'
> & {
  profile: ProfileDetails;
}) {
  const experience = formatExperience(profile.experienceMonths);
  const facts = [
    { label: 'ФИО', value: fullName },
    { label: 'Должность', value: appointmentName },
    { label: 'Место работы', value: workplaceName },
    { label: 'Дата регистрации', value: profile.registrationDate },
    { label: 'Стаж работы', value: experience },
  ].filter(({ value }) => Boolean(value));
  if (facts.length === 0) return null;

  return (
    <CabinetDisclosure
      title="Профиль"
      icon={<PersonRoundedIcon />}
      subtitle={
        <span className={styles.meta}>
          {experience ? `Стаж ${experience.toLowerCase()}` : 'Личные данные'}
        </span>
      }
      expansion={profileExpansion}
    >
      <dl className={`${styles.documents} ${styles.detailsBody}`}>
        {facts.map(({ label, value }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </CabinetDisclosure>
  );
}

export function CabinetScreen({
  fullName,
  workplaceName,
  profile,
  profileExpansion,
  showOfflineProfile = false,
  showStatistics,
  photoUrl,
  onPhotoSettled,
  appointmentName,
  fontSize,
  preview = false,
  children,
}: CabinetScreenProps) {
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);

  return (
    <main className={styles.screen} data-large-text={(fontSize ?? globalFontSize) >= 23}>
      <div className={styles.profile} aria-labelledby="cabinet-name" role="region">
        <CabinetAvatar key={photoUrl} photoUrl={photoUrl} onPhotoSettled={onPhotoSettled} />
        <div className={styles.identity}>
          <h1 id="cabinet-name">{fullName ?? 'Профиль курьера'}</h1>
          {appointmentName && <p className={styles.appointment}>{appointmentName}</p>}
          {workplaceName && <p>{workplaceName}</p>}
        </div>
        {preview && <span className={styles.previewBadge}>Тестовые данные</span>}
      </div>

      <div className={styles.grid}>
        {profile && (
          <CabinetProfileCard
            fullName={fullName}
            appointmentName={appointmentName}
            workplaceName={workplaceName}
            profile={profile}
            profileExpansion={profileExpansion}
          />
        )}
        {showOfflineProfile && (
          <section className={styles.card} aria-labelledby="cabinet-offline-profile">
            <SectionTitle id="cabinet-offline-profile" icon={<PersonRoundedIcon />}>
              Профиль
            </SectionTitle>
          </section>
        )}
        <section className={styles.card} aria-labelledby="cabinet-work">
          <h2 className={styles.sectionTitle} id="cabinet-work">
            Рабочие разделы
          </h2>
          <ul className={styles.workLinks}>
            {workLinks
              .filter(({ href }) => href !== '/statistics' || showStatistics)
              .map(({ label, href, Icon }) => (
                <li key={href}>
                  <Link href={href} className={styles.workLink} prefetch={false}>
                    <Icon className={styles.linkIcon} aria-hidden="true" />
                    <span>{label}</span>
                    <ChevronRightRoundedIcon className={styles.chevron} aria-hidden="true" />
                  </Link>
                </li>
              ))}
          </ul>
        </section>

        {children}
      </div>
    </main>
  );
}

export function CabinetPreview({ fontSize, showStatistics }: CabinetPreviewOptions) {
  return (
    <CabinetScreen
      fullName="Александр Сергеевич Волков"
      appointmentName="Курьер"
      workplaceName="Самара, ул. Молодогвардейская, 204"
      profile={{ registrationDate: '24.02.2018', experienceMonths: 105 }}
      fontSize={fontSize}
      showStatistics={showStatistics}
      preview
    >
      <section className={styles.card} aria-labelledby="cabinet-documents">
        <SectionTitle id="cabinet-documents" icon={<DescriptionOutlinedIcon />}>
          Документы и допуски
        </SectionTitle>
        <dl className={styles.documents}>
          <div>
            <dt>Медкнижка</dt>
            <dd>Действует до 18 декабря 2026</dd>
          </div>
          <div>
            <dt>Материалы для курьера</dt>
            <dd>Инструкция курьера · Общие правила</dd>
          </div>
          <div>
            <dt>Выданная форма</dt>
            <dd>Куртка · Термосумка</dd>
          </div>
        </dl>
      </section>

      <section className={styles.card} aria-labelledby="cabinet-promos">
        <SectionTitle id="cabinet-promos" icon={<LocalOfferOutlinedIcon />}>
          Промокоды
        </SectionTitle>
        <CabinetPromoCard
          code="DRIVER-DEMO"
          description="Пример скидки на обед для сотрудника."
          timing="Самара · До 30 ноября · с 11:00 до 19:00"
        />
      </section>

      <section className={styles.card} aria-labelledby="cabinet-marker">
        <SectionTitle id="cabinet-marker" icon={<PlaceRoundedIcon />}>
          Твоя метка на карте
        </SectionTitle>
        <div className={styles.markerExample}>
          <PlaceRoundedIcon aria-hidden="true" />
          <span className={styles.markerLabel}>18:40 (12 мин.)</span>
        </div>
        <Link href="/settings" className={styles.settingsLink} prefetch={false}>
          Настройки
          <ChevronRightRoundedIcon className={styles.chevron} aria-hidden="true" />
        </Link>
      </section>
    </CabinetScreen>
  );
}
