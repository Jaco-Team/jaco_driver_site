import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import * as cabinetPage from '@/pages/lk';
import { readDevCabinetOptions } from '@/shared/config/cabinetPreview';

const CabinetPage = cabinetPage.default;

const session = vi.hoisted(() => ({
  isAuthenticated: true,
  session: { token: 'test-session', user: { name: 'Тестов Алексей Львович', point_id: 1 } },
}));
const settings = vi.hoisted(() => ({
  settingsSynced: true,
  settings: { type_data_map: 'full', color: '#8257d8' },
  getMySetting: vi.fn(),
  pointId: 3,
  points: [
    { id: 1, name: 'Первое кафе' },
    { id: 3, name: 'Матросова 32' },
    { id: 4, name: 'Куйбышева 113' },
  ],
}));

const apiConfig = vi.hoisted(() => ({
  apiOrigin: '',
  isApiProxyEnabled: false,
}));

vi.mock('@/shared/api/config', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api/config')>();
  return { ...actual, apiConfig: Object.assign(apiConfig, actual.apiConfig) };
});

const menuSettings = vi.hoisted(() => ({ showStatistics: true }));

const cabinetRequest = vi.hoisted(() => ({
  fetch: vi.fn(),
  online: true,
}));

vi.mock('@/entities/cabinet/api/cabinet.api', () => ({
  fetchCabinet: cabinetRequest.fetch,
  resolveCabinetPhotoUrl: (url: string | null | undefined) => url ?? null,
}));

vi.mock('@/features/offline/model/connectivity.store', () => ({
  markAppOffline: vi.fn(),
  useConnectivityStore: (selector: (state: { isOnline: boolean }) => unknown) =>
    selector({ isOnline: cabinetRequest.online }),
}));

vi.mock('@/entities/settings', () => ({
  useSettingsStore: (selector: (state: typeof settings) => unknown) => selector(settings),
}));

vi.mock('@/shared/lib/session/useProtectedRoute', () => ({
  useProtectedRoute: () => session,
}));

vi.mock('@/features/header/model/header.store', () => ({
  useHeaderStore: (
    selector: (state: {
      globalFontSize: number;
      is_need_page_stat: boolean;
      theme: string;
      darkTheme: boolean;
      mapScale: string;
    }) => unknown
  ) =>
    selector({
      globalFontSize: 16,
      is_need_page_stat: menuSettings.showStatistics,
      theme: 'transparent',
      darkTheme: true,
      mapScale: '1.2',
    }),
}));

vi.mock('@/widgets/app-header/ui/AppHeader', () => ({
  AppHeader: () => <header>Личный кабинет</header>,
}));

const emptyCabinet = {
  photo_url: null,
  appointment_name: null,
  workplace_name: null,
  registration_date: null,
  experience_months: null,
  health_book: null,
  instructions: [],
  issued_clothes: [],
  promos: [],
  unavailable: [],
};

beforeEach(() => {
  vi.stubEnv('NODE_ENV', 'development');
  apiConfig.apiOrigin = 'http://localhost:8080';
  apiConfig.isApiProxyEnabled = true;
  cabinetRequest.online = true;
  menuSettings.showStatistics = true;
  cabinetRequest.fetch.mockReset();
  cabinetRequest.fetch.mockResolvedValue(emptyCabinet);
  settings.getMySetting.mockReset();
  settings.getMySetting.mockResolvedValue({});
});

afterEach(() => {
  session.isAuthenticated = true;
  settings.settingsSynced = true;
  settings.pointId = 3;
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

describe('local cabinet preview', () => {
  it('allows the local fixture and supports a dark, large text and hidden statistics preview', () => {
    expect(
      readDevCabinetOptions(
        { uiPreview: '1', theme: 'dark', font: '26', statistics: '0' },
        'localhost:3225'
      )
    ).toEqual({
      cabinetPreview: { theme: 'dark', fontSize: 26, showStatistics: false },
    });
  });

  it('limits development fixtures to localhost with a local API proxy', () => {
    const query = { uiPreview: '1', testPhoto: '1' };
    expect(readDevCabinetOptions(query, 'preview.example.org')).toEqual({ cabinetPreview: null });

    apiConfig.isApiProxyEnabled = false;
    expect(readDevCabinetOptions(query, 'localhost:3225')).toEqual({ cabinetPreview: null });

    apiConfig.isApiProxyEnabled = true;
    apiConfig.apiOrigin = 'https://api.example.org';
    expect(readDevCabinetOptions(query, 'localhost:3225')).toEqual({ cabinetPreview: null });

    apiConfig.apiOrigin = 'http://localhost:8080';
    vi.stubEnv('NODE_ENV', 'production');
    expect(readDevCabinetOptions(query, 'localhost:3325')).toEqual({ cabinetPreview: null });
  });

  it('links to existing pages, respects the preview flag and copies the sample code', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const navigatorWithClipboard = Object.create(window.navigator, {
      clipboard: { value: { writeText } },
    });
    vi.stubGlobal('navigator', navigatorWithClipboard);

    const { rerender } = render(
      <CabinetPage cabinetPreview={{ theme: null, fontSize: null, showStatistics: true }} />
    );

    expect(screen.getByRole('link', { name: 'График работы' })).toHaveAttribute('href', '/graph');
    expect(screen.getByRole('link', { name: 'Расчёт' })).toHaveAttribute('href', '/price');
    expect(screen.getByRole('link', { name: 'Статистика' })).toHaveAttribute('href', '/statistics');
    expect(screen.getByRole('link', { name: 'Настройки' })).toHaveAttribute('href', '/settings');

    fireEvent.click(screen.getByRole('button', { name: 'Скопировать промокод' }));
    const copiedButton = await screen.findByRole('button', { name: 'Промокод скопирован' });
    expect(copiedButton).toHaveAccessibleName('Промокод скопирован');
    expect(screen.queryByText('Скопировано', { exact: true })).not.toBeInTheDocument();
    expect(writeText).toHaveBeenCalledWith(screen.getByText('DRIVER-DEMO').textContent);

    rerender(
      <CabinetPage cabinetPreview={{ theme: null, fontSize: null, showStatistics: false }} />
    );
    expect(screen.queryByRole('link', { name: 'Статистика' })).not.toBeInTheDocument();
  });
});

describe('authenticated cabinet', () => {
  it('does not require Next.js server page data to open', () => {
    expect(cabinetPage).not.toHaveProperty('getServerSideProps');
    expect(cabinetPage).not.toHaveProperty('getStaticProps');
    expect(readDevCabinetOptions({ theme: 'dark' }, 'localhost:3225')).toEqual({
      cabinetPreview: null,
    });
    expect(readDevCabinetOptions({ testPhoto: '1' }, 'localhost:3225')).toEqual({
      cabinetPreview: null,
      showTestPhoto: true,
    });
  });

  it('loads the real cabinet after sign-in in a regular production build', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    apiConfig.apiOrigin = 'https://api.example.org';
    apiConfig.isApiProxyEnabled = false;
    const options = readDevCabinetOptions({ uiPreview: '1', testPhoto: '1' }, 'driver.example.org');
    expect(options).toEqual({ cabinetPreview: null });

    session.isAuthenticated = false;
    const { container, rerender } = render(<CabinetPage {...options} />);
    expect(container).toBeEmptyDOMElement();
    expect(cabinetRequest.fetch).not.toHaveBeenCalled();

    session.isAuthenticated = true;
    rerender(<CabinetPage {...options} />);
    expect(
      await screen.findByRole('heading', { name: session.session.user.name })
    ).toBeInTheDocument();
    expect(cabinetRequest.fetch).toHaveBeenCalledWith(
      session.session.token,
      expect.any(AbortSignal)
    );
    expect(screen.queryByText('DRIVER-DEMO')).not.toBeInTheDocument();
  });

  it('shows the assigned workplace and profile while the working cafe changes', async () => {
    cabinetRequest.fetch.mockResolvedValue({
      ...emptyCabinet,
      appointment_name: 'Курьер',
      workplace_name: 'Тольятти, Ленинградская 47',
      registration_date: '2023-09-01',
      experience_months: 38,
    });
    const { rerender } = render(<CabinetPage cabinetPreview={null} />);

    const name = 'Тестов Алексей Львович';
    const hero = within(await screen.findByRole('region', { name }));
    expect(hero.getByRole('heading', { name })).toBeInTheDocument();
    expect(hero.getByText('Тольятти, Ленинградская 47')).toBeInTheDocument();
    expect(screen.queryByText(/Выбранное кафе|Матросова 32/)).not.toBeInTheDocument();
    expect(screen.queryByText('Александр Сергеевич Волков')).not.toBeInTheDocument();
    expect(screen.queryByText('DRIVER-DEMO')).not.toBeInTheDocument();

    const summary = screen.getByText('Профиль').closest('summary')!;
    const profile = within(summary.closest('details')!);
    expect(profile.getByText('Стаж 3 года 2 мес.')).toBeVisible();
    expect(profile.getByText('01.09.2023')).not.toBeVisible();
    fireEvent.click(summary);
    expect(profile.getByText(name)).toBeVisible();
    expect(profile.getByText('Курьер')).toBeVisible();
    expect(profile.getByText('Тольятти, Ленинградская 47')).toBeVisible();
    expect(profile.getByText('01.09.2023')).toBeVisible();
    expect(profile.getByText('3 года 2 мес.')).toBeVisible();

    settings.pointId = 4;
    rerender(<CabinetPage cabinetPreview={null} />);
    expect(hero.getByText('Тольятти, Ленинградская 47')).toBeInTheDocument();
    expect(profile.getByText('Тольятти, Ленинградская 47')).toBeVisible();
    expect(screen.queryByText('Куйбышева 113')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Статистика' })).toBeInTheDocument();

    settings.settingsSynced = false;
    rerender(<CabinetPage cabinetPreview={null} />);
    expect(hero.getByText('Тольятти, Ленинградская 47')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Статистика' })).toBeInTheDocument();

    menuSettings.showStatistics = false;
    rerender(<CabinetPage cabinetPreview={null} />);
    expect(screen.queryByRole('link', { name: 'Статистика' })).not.toBeInTheDocument();
  });

  it('keeps the header visible and hides cards until settings and the profile photo settle', async () => {
    let finishSettings!: () => void;
    settings.getMySetting.mockReturnValue(
      new Promise<void>((resolve) => {
        finishSettings = resolve;
      })
    );
    cabinetRequest.fetch.mockResolvedValue({
      ...emptyCabinet,
      photo_url: 'https://images.example.com/new.png',
    });

    const { container } = render(<CabinetPage cabinetPreview={null} />);
    const progress = () => screen.queryByRole('progressbar', { name: 'Загружаем личный кабинет' });
    const profile = () => screen.queryByRole('heading', { name: 'Тестов Алексей Львович' });
    expect(progress()).toBeInTheDocument();
    expect(screen.getByText('Личный кабинет')).toBeVisible();
    expect(profile()).not.toBeInTheDocument();
    expect(container.querySelector('img')).toBeNull();

    finishSettings();
    await waitFor(() => expect(container.querySelector('img')).not.toBeNull());
    expect(progress()).toBeInTheDocument();
    expect(screen.getByText('Личный кабинет')).toBeVisible();
    expect(profile()).not.toBeInTheDocument();

    fireEvent.load(container.querySelector('img')!);
    expect(profile()).toBeInTheDocument();
    expect(progress()).not.toBeInTheDocument();
  });

  it('does not show a documents card for installation links alone', async () => {
    cabinetRequest.fetch.mockResolvedValue({
      ...emptyCabinet,
      instructions: [
        { id: 1, name: 'Курьерский сайт', url: 'https://driver.example.com' },
        { id: 2, name: 'Курьерское приложение IOS', url: 'https://apps.example.com/ios' },
      ],
    });

    render(<CabinetPage cabinetPreview={null} />);

    await screen.findByRole('heading', { name: 'Тестов Алексей Львович' });
    expect(screen.queryByText('Документы и допуски')).not.toBeInTheDocument();
  });

  it('shows exam dates inside documents and highlights every earliest date', async () => {
    cabinetRequest.fetch.mockResolvedValue({
      ...emptyCabinet,
      health_book: {
        status: 'missing',
        valid_until: null,
        items: [
          { type: 2, name: 'Отоларинголог', valid_until: '2028-09-05' },
          { type: 3, name: 'Патогенный стафилококк', valid_until: null },
          { type: 4, name: 'Стоматолог', valid_until: '2027-09-22' },
          { type: 10, name: 'Санитарный минимум', valid_until: '2027-09-22' },
        ],
      },
    });

    render(<CabinetPage cabinetPreview={null} />);

    const summary = (await screen.findByText('Документы и допуски')).closest('summary')!;
    expect(within(summary).getByText('Срок не заполнен')).toBeVisible();
    expect(screen.getByText('Осмотры и анализы')).not.toBeVisible();
    fireEvent.click(summary);

    const rows = within(summary.closest('details')!).getAllByRole('listitem');
    expect(rows).toHaveLength(4);
    expect(within(rows[0]).getByText('Стоматолог')).toBeVisible();
    expect(within(rows[0]).getByText('до 22.09.2027')).toHaveAttribute('datetime', '2027-09-22');
    expect(rows[0]).toHaveAttribute('data-nearest', 'true');
    expect(rows[1]).toHaveAttribute('data-nearest', 'true');
    expect(within(rows[2]).getByText('до 05.09.2028')).toBeVisible();
    expect(rows[2]).toHaveAttribute('data-nearest', 'false');
    expect(within(rows[3]).getByText('Не заполнено')).toBeVisible();
    expect(rows[3]).toHaveAttribute('data-nearest', 'false');
  });

  it('keeps open section headings offline and reloads private data after a connection returns', async () => {
    vi.setSystemTime(new Date('2026-12-09T21:00:00Z'));
    cabinetRequest.fetch.mockResolvedValue({
      ...emptyCabinet,
      photo_url: 'https://images.example.com/current.png',
      appointment_name: 'Курьер',
      health_book: { status: 'valid', valid_until: '2027-02-22' },
      instructions: [
        { id: 1, name: 'Курьер', url: 'https://docs.example.com/guide' },
        { id: 2, name: 'Общие правила', url: 'https://docs.example.com/rules' },
        { id: 3, name: 'Курьерский сайт', url: 'https://driver.example.com' },
        {
          id: 4,
          name: 'Курьерское приложение android 10+',
          url: 'https://apps.example.com/android-10',
        },
        {
          id: 5,
          name: 'Курьерское приложение android 14+',
          url: 'https://apps.example.com/android-14',
        },
        { id: 6, name: 'Курьерское приложение IOS', url: 'https://apps.example.com/ios' },
      ],
      issued_clothes: [],
      promos: [
        {
          id: 7,
          code: 'LK002563',
          description: 'Тестовый код',
          conditions: 'Доступен с 11:00 до 19:00.',
          valid_until: '2026-12-10',
          time_from: '11:00',
          time_to: '19:00',
          uses_left: 0,
        },
        {
          id: 8,
          code: 'TESTSECOND',
          description: 'Второй тестовый код',
          conditions: '',
          valid_until: '2026-12-11',
          time_from: '11:00',
          time_to: '19:00',
          uses_left: 2,
        },
      ],
      unavailable: [],
    });

    const { container, rerender } = render(<CabinetPage cabinetPreview={null} />);
    const profilePhoto = () =>
      container.querySelector('img[src="https://images.example.com/current.png"]');
    await waitFor(() => expect(profilePhoto()).not.toBeNull());
    fireEvent.error(profilePhoto()!);
    expect(profilePhoto()).toBeNull();
    expect(await screen.findByText('LK002563')).toBeInTheDocument();
    expect(screen.getByText('Использован')).toBeInTheDocument();
    expect(screen.getByText('Доступен с 11:00 до 19:00.')).toBeInTheDocument();
    expect(screen.getByText('Действует сегодня', { exact: true })).toBeInTheDocument();
    expect(screen.getByText('Действует до 11.12.2026 с 11:00 до 19:00')).toBeInTheDocument();
    const hero = within(screen.getByRole('region', { name: 'Тестов Алексей Львович' }));
    expect(hero.getByText('Курьер')).toBeInTheDocument();
    expect(hero.queryByText(/кафе|Матросова 32/i)).not.toBeInTheDocument();
    const summary = screen.getByText('Документы и допуски').closest('summary')!;
    const healthBook = within(summary).getByText('Медкнижка');
    expect(healthBook.nextElementSibling).toHaveTextContent('Действует до 22.02.2027');
    expect(summary.parentElement).not.toHaveAttribute('open');
    fireEvent.click(summary);
    expect(summary.parentElement).toHaveAttribute('open');
    expect(screen.getByText('Материалы для курьера')).toBeInTheDocument();
    const materials = within(summary.closest('details')!);
    expect(materials.getAllByRole('link')).toHaveLength(2);
    const instruction = materials.getByRole('link', { name: 'Инструкция курьера' });
    expect(instruction).toHaveAttribute('href', 'https://docs.example.com/guide');
    expect(instruction).toHaveAttribute('target', '_blank');
    expect(materials.getByRole('link', { name: 'Общие правила' })).toHaveAttribute(
      'href',
      'https://docs.example.com/rules'
    );
    expect(materials.queryByText(/курьерский сайт|курьерское приложение/i)).not.toBeInTheDocument();
    const marker = screen.getByText('18:40 - 19:10 (12 мин.)');
    expect(marker).toHaveClass('span_text_transparent_white');
    const markerIcon = marker.closest('.map-img')?.querySelector('.span_svg_circle_1_2 svg');
    expect(markerIcon).toHaveStyle({ color: '#8257d8' });
    expect(screen.queryByText(/Ваш цвет во вкладке/)).not.toBeInTheDocument();
    const promoTitle = screen.getByRole('heading', { name: 'Промокоды' });
    const markerTitle = screen.getByRole('heading', { name: 'Твоя метка на карте' });
    expect(
      promoTitle.compareDocumentPosition(markerTitle) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    fireEvent.click(screen.getByText('Профиль').closest('summary')!);
    expect(screen.getByText('Должность')).toBeVisible();

    cabinetRequest.online = false;
    rerender(<CabinetPage cabinetPreview={null} />);
    expect(screen.getByRole('heading', { name: 'Профиль' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Документы и допуски' })).toBeVisible();
    expect(screen.queryByText('Должность')).not.toBeInTheDocument();
    expect(screen.queryByText('Медкнижка')).not.toBeInTheDocument();
    expect(screen.queryByText('LK002563')).not.toBeInTheDocument();
    expect(screen.queryByText(/после восстановления связи/)).not.toBeInTheDocument();
    expect(cabinetRequest.fetch).toHaveBeenCalledTimes(1);

    cabinetRequest.online = true;
    rerender(<CabinetPage cabinetPreview={null} />);
    await waitFor(() => expect(profilePhoto()).not.toBeNull());
    fireEvent.error(profilePhoto()!);
    expect(await screen.findByText('LK002563')).toBeInTheDocument();
    expect(screen.getByText('Профиль').closest('details')).toHaveAttribute('open');
    expect(screen.getByText('Документы и допуски').closest('details')).toHaveAttribute('open');
    expect(screen.getByText('Должность')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Инструкция курьера' })).toBeVisible();
    expect(cabinetRequest.fetch).toHaveBeenCalledTimes(2);
  });
});
