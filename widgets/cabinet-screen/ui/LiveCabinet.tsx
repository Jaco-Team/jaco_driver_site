import { useEffect, useState } from 'react';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';

import {
  fetchCabinet,
  resolveCabinetPhotoUrl,
  type CabinetData,
  type CabinetHealthBook,
  type CabinetPromo,
} from '@/entities/cabinet/api/cabinet.api';
import { useSettingsStore } from '@/entities/settings';
import { markAppOffline, useConnectivityStore } from '@/features/offline/model/connectivity.store';
import { isConnectivityError } from '@/shared/lib/offline/isConnectivityError';
import { AppHeader } from '@/widgets/app-header/ui/AppHeader';

import {
  CabinetDisclosure,
  CabinetScreen,
  SectionTitle,
  type CabinetExpansion,
} from './CabinetPreview';
import { CabinetPromoCard } from './CabinetPromoCard';
import { CabinetMarkerCard } from './CabinetMarkerCard';
import styles from './CabinetPreview.module.scss';

type CabinetState = { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; data: CabinetData };

type LiveCabinetProps = {
  token: string;
  fullName: string | null;
  showStatistics: boolean;
  showTestPhoto: boolean;
};

function russianDate(value: string | null) {
  return value?.split('-').reverse().join('.') ?? null;
}

function healthSummary(book: CabinetHealthBook) {
  const until = russianDate(book.valid_until);

  switch (book.status) {
    case 'valid':
      return until ? `Действует до ${until}` : 'Действует';
    case 'expiring':
      return until ? `Истекает ${until}` : 'Срок истекает';
    case 'expired':
      return until ? `Срок истёк ${until}` : 'Срок истёк';
    case 'missing':
      return 'Срок не заполнен';
  }
}

const promoDay = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Samara',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function promoTiming(promo: CabinetPromo) {
  const date = russianDate(promo.valid_until);
  const validity =
    promo.valid_until === promoDay.format(new Date()) ? 'сегодня' : date ? `до ${date}` : '';
  const { time_from: from, time_to: to } = promo;
  const timeInText =
    from &&
    to &&
    [promo.conditions, promo.description].some((text) => text.includes(from) && text.includes(to));
  const time = from && to && !timeInText ? `с ${from} до ${to}` : '';
  return validity || time ? ['Действует', validity, time].filter(Boolean).join(' ') : '';
}

function HealthBookChecks({ items }: { items: NonNullable<CabinetHealthBook['items']> }) {
  const checks = [...items].sort((left, right) => {
    if (left.valid_until === right.valid_until) return 0;
    if (left.valid_until === null) return 1;
    if (right.valid_until === null) return -1;
    return left.valid_until.localeCompare(right.valid_until);
  });
  const earliestDate = checks[0]?.valid_until;

  return (
    <div>
      <dt>Осмотры и анализы</dt>
      <dd>
        {checks.length > 0 ? (
          <ul className={styles.healthBookItems} role="list">
            {checks.map(({ type, name, valid_until: date }) => {
              const isNearest = date !== null && date === earliestDate;
              return (
                <li key={type} className={styles.healthBookRow} data-nearest={isNearest}>
                  <span className={styles.healthBookName}>{name}</span>
                  {date ? (
                    <time className={styles.healthBookDate} dateTime={date}>
                      до {russianDate(date)}
                    </time>
                  ) : (
                    <span className={styles.healthBookDate}>Не заполнено</span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          'Данных по медкнижке нет.'
        )}
      </dd>
    </div>
  );
}

const cabinetMaterialTitles = [
  { title: 'Инструкция курьера', sourceTitles: ['инструкция курьера', 'курьер'] },
  { title: 'Общие правила', sourceTitles: ['общие правила'] },
];

function CabinetDetails({
  data,
  documentsExpansion,
}: {
  data: CabinetData;
  documentsExpansion: CabinetExpansion;
}) {
  const materials = cabinetMaterialTitles.flatMap(({ title, sourceTitles }) => {
    const material = data.instructions.find(({ name }) =>
      sourceTitles.includes(name.trim().toLowerCase())
    );
    return material ? [{ ...material, name: title }] : [];
  });
  const noDocuments = data.unavailable.some(
    (source) => source === 'health_book' || source === 'instructions' || source === 'issued_clothes'
  );
  const showDocuments =
    Boolean(data.health_book) ||
    materials.length > 0 ||
    data.issued_clothes.length > 0 ||
    noDocuments;

  return (
    <>
      {showDocuments && (
        <CabinetDisclosure
          title="Документы и допуски"
          icon={<DescriptionOutlinedIcon />}
          expansion={documentsExpansion}
          subtitle={
            data.health_book ? (
              <>
                <span className={styles.meta}>Медкнижка</span>
                <span className={styles.meta}>{healthSummary(data.health_book)}</span>
              </>
            ) : (
              noDocuments && <span className={styles.meta}>Часть документов недоступна</span>
            )
          }
        >
          <dl className={`${styles.documents} ${styles.detailsBody} ${styles.documentGroups}`}>
            {data.health_book?.items && <HealthBookChecks items={data.health_book.items} />}
            {materials.length > 0 && (
              <div>
                <dt>Материалы для курьера</dt>
                <dd>
                  <ul className={styles.documentItems} role="list">
                    {materials.map((item) => (
                      <li key={item.id}>
                        {item.url ? (
                          <a
                            className={styles.documentLink}
                            href={item.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span>{item.name}</span>
                            <OpenInNewRoundedIcon
                              className={styles.chevron}
                              fontSize="small"
                              aria-hidden="true"
                            />
                          </a>
                        ) : (
                          <span className={styles.documentText}>{item.name}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            )}
            {data.issued_clothes.length > 0 && (
              <div>
                <dt>Выданная форма</dt>
                <dd>{data.issued_clothes.map((item) => item.name).join(' · ')}</dd>
              </div>
            )}
          </dl>
          {noDocuments && <p className={styles.meta}>Часть документов недоступна.</p>}
        </CabinetDisclosure>
      )}
      {data.promos.length > 0 && (
        <section className={styles.card} aria-labelledby="cabinet-promos">
          <SectionTitle id="cabinet-promos" icon={<LocalOfferOutlinedIcon />}>
            Промокоды
          </SectionTitle>
          <div className={styles.promoList}>
            {data.promos.map((promo) => (
              <CabinetPromoCard
                key={promo.id}
                code={promo.code}
                description={promo.description}
                detail={promo.conditions}
                timing={promoTiming(promo)}
                used={promo.uses_left <= 0}
              />
            ))}
          </div>
        </section>
      )}
      {data.unavailable.includes('promos') && (
        <p className={styles.notice} role="status">
          Не удалось загрузить промокоды.
        </p>
      )}
    </>
  );
}

function OnlineCabinet({
  token,
  fullName,
  showStatistics,
  showTestPhoto,
  profileExpansion,
  documentsExpansion,
}: LiveCabinetProps & {
  profileExpansion: CabinetExpansion;
  documentsExpansion: CabinetExpansion;
}) {
  const getMySetting = useSettingsStore((state) => state.getMySetting);
  const [state, setState] = useState<CabinetState>({ kind: 'loading' });
  const [settledPhotoUrl, setSettledPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    const request = new AbortController();
    void Promise.allSettled([fetchCabinet(token, request.signal), getMySetting(token, true)]).then(
      ([cabinet]) => {
        if (request.signal.aborted) return;
        if (cabinet.status === 'fulfilled') {
          setState({ kind: 'ready', data: cabinet.value });
        } else if (isConnectivityError(cabinet.reason)) {
          markAppOffline();
        } else {
          setState({ kind: 'error' });
        }
      }
    );
    return () => request.abort();
  }, [getMySetting, token]);

  const data = state.kind === 'ready' ? state.data : null;
  const photoUrl = resolveCabinetPhotoUrl(data?.photo_url, showTestPhoto);
  const loading = state.kind === 'loading' || (photoUrl !== null && settledPhotoUrl !== photoUrl);

  return (
    <>
      <div inert={loading || undefined}>
        <AppHeader />
        {state.kind !== 'loading' && (
          <div
            className={loading ? styles.loadingContent : undefined}
            aria-hidden={loading || undefined}
          >
            <CabinetScreen
              fullName={fullName}
              showStatistics={showStatistics}
              appointmentName={data?.appointment_name}
              workplaceName={data?.workplace_name}
              profile={
                data
                  ? {
                      registrationDate: russianDate(data.registration_date),
                      experienceMonths: data.experience_months,
                    }
                  : undefined
              }
              profileExpansion={profileExpansion}
              photoUrl={photoUrl}
              onPhotoSettled={setSettledPhotoUrl}
            >
              {state.kind === 'error' && (
                <p className={styles.notice} role="status">
                  Не удалось загрузить данные кабинета.
                </p>
              )}
              {data && <CabinetDetails data={data} documentsExpansion={documentsExpansion} />}
              <CabinetMarkerCard />
            </CabinetScreen>
          </div>
        )}
      </div>
      {loading && (
        <Backdrop open style={{ zIndex: 9999, color: '#fff' }}>
          <CircularProgress color="inherit" aria-label="Загружаем личный кабинет" />
        </Backdrop>
      )}
    </>
  );
}

export function LiveCabinet({ token, fullName, showStatistics, showTestPhoto }: LiveCabinetProps) {
  const isOnline = useConnectivityStore((state) => state.isOnline);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [documentsExpanded, setDocumentsExpanded] = useState(false);

  if (isOnline) {
    return (
      <OnlineCabinet
        token={token}
        fullName={fullName}
        showStatistics={showStatistics}
        showTestPhoto={showTestPhoto}
        profileExpansion={{ expanded: profileExpanded, onExpandedChange: setProfileExpanded }}
        documentsExpansion={{ expanded: documentsExpanded, onExpandedChange: setDocumentsExpanded }}
      />
    );
  }

  return (
    <>
      <AppHeader />
      <CabinetScreen
        fullName={fullName}
        showStatistics={showStatistics}
        showOfflineProfile={profileExpanded}
      >
        {documentsExpanded && (
          <section className={styles.card} aria-labelledby="cabinet-offline-documents">
            <SectionTitle id="cabinet-offline-documents" icon={<DescriptionOutlinedIcon />}>
              Документы и допуски
            </SectionTitle>
          </section>
        )}
        <CabinetMarkerCard />
      </CabinetScreen>
    </>
  );
}
