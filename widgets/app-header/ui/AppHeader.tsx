'use client';

import { type ReactElement, type ReactNode, useEffect } from 'react';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import Button from '@mui/material/Button';
import CachedIcon from '@mui/icons-material/Cached';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FilterAlt from '@mui/icons-material/FilterAlt';
import HeadsetMicRoundedIcon from '@mui/icons-material/HeadsetMicRounded';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import MenuIcon from '@mui/icons-material/Menu';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';

import AlertOrder from '@/components/AlertOrder';
import { log, logTel } from '@/components/analytics';
import useSession, { markSessionUnauthorized } from '@/components/sessionHook';
import { useSettingsStore } from '@/entities/settings';
import { useOrdersStore } from '@/components/store.js';
import { useHeaderStore } from '@/features/header/model/header.store';
import OrderCard from '@/modules/order_card';
import PayModel from '@/components/PayModel';
import { roboto } from '@/shared/config/fonts';
import { formatPhoneNumber } from '@/shared/lib/formatters/formatPhoneNumber';
import { logoutWeb } from '@/shared/api/client';
import { appPalette } from '@/shared/styles/appPalette';

type NavigationItem = {
  href: string;
  label: string;
  icon: ReactNode;
};

type ContactItem = {
  label: string;
  phone: string;
  formattedPhone: string;
  icon: ReactElement;
  eventName: string;
  logTitle: string;
};

const routeTitles: Record<string, string> = {
  '/auth': 'Авторизация',
  '/auth/callback': 'SSO авторизация',
  '/registration': 'Восстановление пароля',
  '/list_orders': 'Список заказов',
  '/map_orders': 'Карта заказов',
  '/price': 'Расчет',
  '/graph': 'График работы',
  '/statistics': 'Статистика',
  '/settings': 'Настройки',
};

function OrderMapDrawer() {
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);
  const [isOpenOrderMap, closeOrderMap, showOrders] = useOrdersStore((state) => [
    state.isOpenOrderMap,
    state.closeOrderMap,
    state.showOrders,
  ]);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={isOpenOrderMap}
      onClose={closeOrderMap}
      className={`modalOrderMap ${roboto.variable}`}
      onOpen={() => {}}
    >
      {showOrders.map((item: unknown, index: number) => (
        <OrderCard key={index} item={item} is_map globalFontSize={globalFontSize} />
      ))}
    </SwipeableDrawer>
  );
}

function OrderTypeDrawer() {
  const [isOpenMenu, setOpenMenu, setCloseMenu, types, setType] = useOrdersStore((state) => [
    state.isOpenMenu,
    state.setOpenMenu,
    state.setCloseMenu,
    state.types,
    state.setType,
  ]);
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);

  return (
    <SwipeableDrawer anchor="bottom" open={isOpenMenu} onClose={setCloseMenu} onOpen={setOpenMenu}>
      <List className={`monthList ${roboto.variable}`}>
        {types.map((item: { text: string }, index: number) => (
          <ListItem disablePadding key={index} onClick={() => setType(item)}>
            <ListItemButton>
              <ListItemText
                primary={item.text}
                sx={{
                  '& .MuiTypography-root': {
                    fontSize: globalFontSize,
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </SwipeableDrawer>
  );
}

function DeletedOrdersDrawer() {
  const [delOrders, hideDelOrders] = useOrdersStore((state) => [
    state.del_orders,
    state.hideDelOrders,
  ]);
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={Boolean(delOrders?.length)}
      onClose={hideDelOrders}
      className={`modalOrderMap ${roboto.variable}`}
      onOpen={() => {}}
    >
      <div className="lineModal" />

      <Typography
        style={{
          fontSize: globalFontSize,
          paddingTop: 10,
          paddingBottom: 10,
          color: '#000',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
        component="h6"
      >
        Удаленные заказы
      </Typography>

      <div
        className="modalOrderDelContent"
        style={{
          height: 300,
          width: '100%',
          overflow: 'auto',
          padding: 20,
          paddingTop: 10,
        }}
      >
        {delOrders?.map((item: { id: string | number; addr: string }, index: number) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column' }}>
            <Typography component="span" style={{ fontSize: globalFontSize }}>
              Удаленный заказ #{item.id}
            </Typography>
            <Typography component="span" style={{ fontSize: globalFontSize }}>
              Адрес: {item.addr}
            </Typography>
          </div>
        ))}
      </div>

      <Button className="btnGOOD" onClick={hideDelOrders} style={{ fontSize: globalFontSize }}>
        Хорошо
      </Button>
    </SwipeableDrawer>
  );
}

function OrdersLoadingBackdrop() {
  const isLoading = useOrdersStore((state) => state.is_load);

  return (
    <Backdrop style={{ zIndex: 9999, color: '#fff' }} open={isLoading}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

function HeaderMenuDrawer({ onLogout }: { onLogout: () => void }) {
  const [
    isOpenMenu,
    setOpenMenu,
    setCloseMenu,
    phones,
    avgTime,
    globalFontSize,
    isNeedAvgTime,
    isNeedPageStat,
  ] = useHeaderStore((state) => [
    state.isOpenMenu,
    state.setOpenMenu,
    state.setCloseMenu,
    state.phones,
    state.avgTime,
    state.globalFontSize,
    state.is_need_avg_time,
    state.is_need_page_stat,
  ]);
  const pathname = usePathname();

  const navigationLabelFontSize = Math.max(Math.min(globalFontSize, 18), 15);
  const contactLabelFontSize = Math.max(Math.min(globalFontSize - 1, 17), 14);
  const contactPhoneFontSize = Math.max(Math.min(globalFontSize - 2, 15), 12);

  const navigationItems: NavigationItem[] = [
    {
      href: '/list_orders',
      label: 'Список заказов',
      icon: <ReceiptLongRoundedIcon />,
    },
    {
      href: '/map_orders',
      label: 'Карта заказов',
      icon: <MapRoundedIcon />,
    },
    {
      href: '/price',
      label: 'Расчет',
      icon: <CalculateRoundedIcon />,
    },
    {
      href: '/graph',
      label: 'График работы',
      icon: <TimelineRoundedIcon />,
    },
    ...(isNeedPageStat
      ? [
          {
            href: '/statistics',
            label: 'Статистика',
            icon: <QueryStatsRoundedIcon />,
          },
        ]
      : []),
    {
      href: '/settings',
      label: 'Настройки',
      icon: <SettingsRoundedIcon />,
    },
  ];

  const contactItems = [
    phones?.phone_upr
      ? {
          label: 'Директор',
          phone: phones.phone_upr,
          formattedPhone: formatPhoneNumber(phones.phone_upr),
          icon: <BusinessCenterRoundedIcon />,
          eventName: 'call_director',
          logTitle: 'Звонок директору',
        }
      : null,
    phones?.phone_man
      ? {
          label: 'Менеджер',
          phone: phones.phone_man,
          formattedPhone: formatPhoneNumber(phones.phone_man),
          icon: <SupportAgentRoundedIcon />,
          eventName: 'call_manager',
          logTitle: 'Звонок менеджеру',
        }
      : null,
    phones?.phone_center
      ? {
          label: 'Контакт-центр',
          phone: phones.phone_center,
          formattedPhone: formatPhoneNumber(phones.phone_center),
          icon: <HeadsetMicRoundedIcon />,
          eventName: 'call_contact_center',
          logTitle: 'Звонок в Контакт-центр',
        }
      : null,
  ].filter((item): item is ContactItem => item !== null);

  return (
    <SwipeableDrawer
      anchor="left"
      open={isOpenMenu}
      onClose={setCloseMenu}
      onOpen={setOpenMenu}
      sx={{
        '& .MuiDrawer-paper': {
          width: 'min(86vw, 340px)',
          background: 'linear-gradient(180deg, #f6f9fc 0%, #ffffff 34%)',
          boxShadow: `0 28px 60px ${appPalette.shadowStrong}`,
          overflow: 'hidden',
        },
      }}
    >
      <Box
        className={roboto.variable}
        sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <Box
          sx={{
            px: 2.5,
            pt: 2.5,
            pb: 2,
            color: '#fff',
            background: `linear-gradient(135deg, ${appPalette.brand} 0%, ${appPalette.brandDeep} 100%)`,
          }}
        >
          <Typography
            component="div"
            sx={{
              fontSize: Math.max(globalFontSize - 3, 12),
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              opacity: 0.78,
              mb: 1,
            }}
          >
            Навигация
          </Typography>

          <Typography
            component="div"
            sx={{
              fontSize: Math.max(globalFontSize + 8, 28),
              fontWeight: 800,
              lineHeight: 1.1,
              mb: 1,
            }}
          >
            {routeTitles[pathname] || 'Меню'}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            overflowY: 'auto',
            px: 2,
            py: 2,
            gap: 1.75,
          }}
        >
          {isNeedAvgTime && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                px: 2,
                py: 1.75,
                borderRadius: 4,
                border: `1px solid ${appPalette.softStrong}`,
                background: `linear-gradient(135deg, ${appPalette.soft} 0%, rgba(31, 61, 86, 0.03) 100%)`,
                boxShadow: '0 6px 16px rgba(15, 23, 42, 0.08)',
              }}
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  borderRadius: '16px',
                  color: appPalette.primary,
                  bgcolor: '#fff',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.08)',
                }}
              >
                <AccessTimeRoundedIcon />
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  component="div"
                  sx={{
                    fontSize: Math.max(globalFontSize - 3, 12),
                    fontWeight: 700,
                    color: appPalette.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    mb: 0.5,
                  }}
                >
                  Среднее время
                </Typography>

                <Typography
                  component="div"
                  sx={{
                    fontSize: Math.max(globalFontSize + 4, 22),
                    fontWeight: 800,
                    lineHeight: 1,
                    color: appPalette.primaryDeep,
                  }}
                >
                  {avgTime || '00:00:00'}
                </Typography>
              </Box>
            </Box>
          )}

          <Box>
            <Typography
              component="div"
              sx={{
                px: 1,
                mb: 1,
                fontSize: Math.max(globalFontSize - 3, 12),
                fontWeight: 800,
                color: appPalette.textMuted,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Разделы
            </Typography>

            <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
              {navigationItems.map((item) => {
                const isSelected = pathname === item.href;

                return (
                  <ListItem disablePadding key={item.href}>
                    <ListItemButton
                      component={Link}
                      href={item.href}
                      onClick={setCloseMenu}
                      selected={isSelected}
                      sx={{
                        px: 1.5,
                        py: 1.25,
                        minHeight: 60,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: isSelected ? appPalette.primary : 'rgba(15, 23, 42, 0.06)',
                        bgcolor: isSelected ? appPalette.softStrong : '#fff',
                        boxShadow: isSelected
                          ? '0 14px 30px rgba(66, 98, 125, 0.12)'
                          : '0 10px 22px rgba(15, 23, 42, 0.04)',
                        overflow: 'hidden',
                        '&.Mui-selected': {
                          bgcolor: appPalette.softStrong,
                          borderColor: appPalette.primary,
                          boxShadow: '0 14px 30px rgba(66, 98, 125, 0.12)',
                        },
                        '&.Mui-selected:hover': {
                          bgcolor: 'rgba(66, 98, 125, 0.18)',
                        },
                        '&:hover': {
                          bgcolor: isSelected ? 'rgba(66, 98, 125, 0.18)' : appPalette.softHover,
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 40,
                          color: isSelected ? appPalette.primary : '#5f6b75',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>

                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          sx: {
                            fontSize: navigationLabelFontSize,
                            fontWeight: isSelected ? 700 : 500,
                            color: isSelected ? appPalette.primaryDeep : appPalette.text,
                            whiteSpace: 'nowrap',
                            lineHeight: 1.2,
                          },
                        }}
                        sx={{
                          my: 0,
                          minWidth: 0,
                        }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          {contactItems.length > 0 && (
            <>
              <Divider sx={{ borderColor: 'rgba(15, 23, 42, 0.08)' }} />

              <Box>
                <Typography
                  component="div"
                  sx={{
                    px: 1,
                    mb: 1,
                    fontSize: Math.max(globalFontSize - 3, 12),
                    fontWeight: 800,
                    color: appPalette.textMuted,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  Контакты
                </Typography>

                <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                  {contactItems.map((item) => (
                    <ListItem disablePadding key={item.label}>
                      <ListItemButton
                        component="a"
                        href={`tel:${item.phone}`}
                        onClick={(event) => {
                          setCloseMenu();
                          logTel(item.eventName, item.phone, item.logTitle, event);
                        }}
                        sx={{
                          px: 1.5,
                          py: 1.1,
                          minHeight: 60,
                          display: 'grid',
                          gridTemplateColumns: '36px 1fr',
                          columnGap: 1.25,
                          alignItems: 'center',
                          borderRadius: 3,
                          border: '1px solid rgba(15, 23, 42, 0.06)',
                          bgcolor: '#fff',
                          boxShadow: '0 10px 22px rgba(15, 23, 42, 0.04)',
                          '&:hover': {
                            bgcolor: appPalette.softHover,
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 36,
                            m: 0,
                            justifyContent: 'center',
                            color: appPalette.primary,
                            '& svg': {
                              fontSize: 28,
                            },
                          }}
                        >
                          {item.icon}
                        </ListItemIcon>

                        <Box
                          sx={{
                            minWidth: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: 0.22,
                          }}
                        >
                          <Typography
                            component="div"
                            sx={{
                              fontSize: contactLabelFontSize,
                              fontWeight: 600,
                              color: appPalette.text,
                              textAlign: 'center',
                              whiteSpace: 'nowrap',
                              lineHeight: 1.15,
                              mb: 0.5,
                            }}
                          >
                            {item.label}
                          </Typography>

                          <Typography
                            component="div"
                            sx={{
                              fontSize: contactPhoneFontSize,
                              color: appPalette.textMuted,
                              textAlign: 'center',
                              lineHeight: 1.2,
                            }}
                          >
                            {item.formattedPhone}
                          </Typography>
                        </Box>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </>
          )}

          <Box sx={{ flexGrow: 1 }} />

          <Button
            variant="outlined"
            startIcon={<LogoutRoundedIcon />}
            onClick={() => {
              setCloseMenu();
              onLogout();
            }}
            sx={{
              justifyContent: 'flex-start',
              px: 1.75,
              py: 1.2,
              borderRadius: 3,
              borderColor: appPalette.brandSoftStrong,
              bgcolor: '#fff',
              color: appPalette.brand,
              fontSize: globalFontSize,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 10px 22px rgba(15, 23, 42, 0.04)',
              '&:hover': {
                borderColor: appPalette.brandSoftStrong,
                bgcolor: appPalette.brandSoft,
              },
            }}
          >
            Выйти
          </Button>
        </Box>
      </Box>
    </SwipeableDrawer>
  );
}

export function AppHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const session = useSession();

  const getMySetting = useSettingsStore((state) => state.getMySetting);

  const [
    activePageRU,
    setOpenMenu,
    getStat,
    checkMyPos,
    globalFontSize,
    applySettings,
    getMyAvgTime,
  ] = useHeaderStore((state) => [
    state.activePageRU,
    state.setOpenMenu,
    state.getStat,
    state.checkMyPos,
    state.globalFontSize,
    state.applySettings,
    state.getMyAvgTime,
  ]);

  const [myCurrentLocation, showModalTypeDop, getOrders] = useOrdersStore((state) => [
    state.MyCurrentLocation,
    state.showModalTypeDop,
    state.getOrders,
  ]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      window.location.replace(
        `https:${window.location.href.substring(window.location.protocol.length)}`
      );
    }
  }, []);

  useEffect(() => {
    if (session?.isAuth !== true) {
      return;
    }

    void (async () => {
      let pointId: string | number | null | undefined;

      try {
        const settings = await getMySetting(session.token ?? '');
        applySettings(settings);
        pointId = settings?.point_id;
      } catch (error) {
        console.error('header_settings_load_failed', error);
      }

      await Promise.allSettled([
        getStat(session.token ?? '', pointId),
        getMyAvgTime(session.token ?? ''),
        Promise.resolve(myCurrentLocation()),
      ]);
    })();
  }, [
    applySettings,
    getMyAvgTime,
    getMySetting,
    getStat,
    myCurrentLocation,
    session?.isAuth,
    session?.token,
  ]);

  useEffect(() => {
    if (session?.isAuth !== true) {
      return;
    }

    checkMyPos();
    getMyAvgTime(session.token ?? '');

    const intervalId = window.setInterval(() => {
      checkMyPos();
      getMyAvgTime(session.token ?? '');
    }, 120 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [checkMyPos, getMyAvgTime, session?.isAuth, session?.token]);

  const pageTitle = activePageRU || routeTitles[pathname] || '';

  const handleLogout = () => {
    void logoutWeb().catch((error) => {
      console.error('logout_request_failed', error);
    });

    markSessionUnauthorized();
    useOrdersStore.setState({ token: '' });
    useHeaderStore.setState({ token: '', phones: null });

    let pushed = false;
    const go = () => {
      if (pushed) {
        return;
      }

      pushed = true;
      router.push('/auth', { scroll: false });
    };

    log('logout', 'Выход из аккаунта', null, { callback: go });
    setTimeout(go, 200);
  };

  return (
    <Box>
      <AppBar>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="menu"
            sx={{ mr: 2 }}
            onClick={setOpenMenu}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            component="div"
            sx={{ flexGrow: 1 }}
            style={{ fontSize: globalFontSize }}
          >
            {pageTitle}
          </Typography>
          {(pathname === '/list_orders' || pathname === '/map_orders') && (
            <div>
              <Button
                className="noselect"
                style={{ flex: 1 }}
                onClick={() => showModalTypeDop(true)}
              >
                <FilterAlt style={{ color: '#fff' }} />
              </Button>
              <Button
                className="noselect"
                style={{ flex: 1 }}
                onClick={() => getOrders(true, true)}
              >
                <CachedIcon style={{ color: '#fff' }} />
              </Button>
            </div>
          )}
        </Toolbar>
      </AppBar>

      <OrderMapDrawer />
      <OrderTypeDrawer />
      <HeaderMenuDrawer onLogout={handleLogout} />
      <DeletedOrdersDrawer />
      <AlertOrder />
      <OrdersLoadingBackdrop />
      <PayModel />
    </Box>
  );
}
