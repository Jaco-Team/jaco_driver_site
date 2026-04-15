'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';

import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import Box from '@mui/material/Box';

import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import HeadsetMicRoundedIcon from '@mui/icons-material/HeadsetMicRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import MenuIcon from '@mui/icons-material/Menu';
import Button from '@mui/material/Button';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';

import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';

//import { signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import { useOrdersStore } from '@/components/store.js';
import { useHeaderStore } from '@/features/header/model/header.store';

import AlertOrder from '@/components/AlertOrder';
import PayModel from '@/components/PayModel';

//import { initializeApp } from "firebase/app";
//import { getMessaging, getToken } from "firebase/messaging";

import OrderCard from '@/modules/order_card';

import { roboto } from '@/ui/Font';
import { appPalette } from '@/ui/palette';

import { log, logTel } from '@/components/analytics';

function DrawerMap() {
  const [isOpenOrderMap, closeOrderMap, showOrders] = useOrdersStore((state) => [
    state.isOpenOrderMap,
    state.closeOrderMap,
    state.showOrders,
  ]);

  return (
    <SwipeableDrawer
      anchor={'bottom'}
      open={isOpenOrderMap}
      onClose={closeOrderMap}
      className={'modalOrderMap ' + roboto.variable}
      onOpen={() => {}}
    >
      {showOrders.map((item, key) => (
        <OrderCard key={key} item={item} is_map={true} />
      ))}
    </SwipeableDrawer>
  );
}

function DrawerList() {
  const [isOpenMenu, setOpenMenu, setCloseMenu, types, setType] = useOrdersStore((state) => [
    state.isOpenMenu,
    state.setOpenMenu,
    state.setCloseMenu,
    state.types,
    state.setType,
  ]);

  const [globalFontSize] = useHeaderStore((state) => [state.globalFontSize]);

  return (
    <SwipeableDrawer
      anchor={'bottom'}
      open={isOpenMenu}
      onClose={setCloseMenu}
      onOpen={setOpenMenu}
    >
      <List className={'monthList ' + roboto.variable}>
        {types.map((item, key) => (
          <ListItem disablePadding key={key} onClick={() => setType(item)}>
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

function formatPhoneNumber(phone) {
  const digits = `${phone ?? ''}`.replace(/\D/g, '');

  if (digits.length !== 11) {
    return phone || '';
  }

  const prefix = digits[0];
  const rest = digits.slice(1);

  if (rest.startsWith('9')) {
    return `${prefix} (${rest.slice(0, 3)}) ${rest.slice(3, 6)}-${rest.slice(6, 8)}-${rest.slice(8, 10)}`;
  }

  return `${prefix} (${rest.slice(0, 4)}) ${rest.slice(4, 6)}-${rest.slice(6, 8)}-${rest.slice(8, 10)}`;
}

function DrawerHeader() {
  const [
    isOpenMenu,
    setOpenMenu,
    setCloseMenu,
    phones,
    avgTime,
    globalFontSize,
    is_need_avg_time,
    is_need_page_stat,
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
  const router = useRouter();
  const pathname = usePathname();
  const navigationLabelFontSize = Math.max(Math.min(globalFontSize, 18), 15);
  const contactLabelFontSize = Math.max(Math.min(globalFontSize - 1, 17), 14);
  const contactPhoneFontSize = Math.max(Math.min(globalFontSize - 2, 15), 12);

  const navigationItems = [
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
    ...(is_need_page_stat
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
  ].filter(Boolean);

  function logOut() {
    void logoutWeb().catch((error) => {
      console.error('logout_request_failed', error);
    });
    markSessionUnauthorized();
    useOrdersStore.setState({ token: '' });
    useHeaderStore.setState({ token: '', phones: null });

    let pushed = false;
    const go = () => {
      if (pushed) return;
      pushed = true;
      router.push('/auth', { scroll: false });
    };

    log('logout', 'Выход из аккаунта', null, { callback: go });
    setTimeout(go, 200); // фолбэк, если колбэк не пришёл
  }

  return (
    <SwipeableDrawer
      anchor={'left'}
      open={isOpenMenu}
      onClose={setCloseMenu}
      onOpen={setOpenMenu}
      sx={{
        '& .MuiDrawer-paper': {
          width: 'min(86vw, 340px)',
          background: 'linear-gradient(180deg, #f6f9fc 0%, #ffffff 34%)',
          boxShadow: `0 28px 60px ${appPalette.shadowStrong}`,
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
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
          {is_need_avg_time && (
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
                        onClick={(e) => {
                          setCloseMenu();
                          logTel(item.eventName, item.phone, item.logTitle, e);
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
              logOut();
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

function ModalDelOrders() {
  const [del_orders, hideDelOrders] = useOrdersStore((state) => [
    state.del_orders,
    state.hideDelOrders,
  ]);
  const [globalFontSize] = useHeaderStore((state) => [state.globalFontSize]);

  return (
    <SwipeableDrawer
      anchor={'bottom'}
      open={del_orders?.length > 0 ? true : false}
      onClose={hideDelOrders}
      className={'modalOrderMap ' + roboto.variable}
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
        {del_orders?.map((item, key) => (
          <div key={key} style={{ display: 'flex', flexDirection: 'column' }}>
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

function LoadOrderSpiner() {
  const [is_load] = useOrdersStore((state) => [state.is_load]);

  return (
    <Backdrop style={{ zIndex: 9999, color: '#fff' }} open={is_load}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

import useSession, { markSessionUnauthorized } from '@/components/sessionHook';
import { logoutWeb } from '@/components/api';
import CachedIcon from '@mui/icons-material/Cached';
import { FilterAlt } from '@mui/icons-material';

const routeTitles = {
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

export default function Header() {
  const session = useSession();

  const [activePageRU, setOpenMenu, getStat, checkMyPos, globalFontSize, getSettings] =
    useHeaderStore((state) => [
      state.activePageRU,
      state.setOpenMenu,
      state.getStat,
      state.checkMyPos,
      state.globalFontSize,
      state.getSettings,
    ]);
  const [MyCurrentLocation, showModalTypeDop, getOrders] = useOrdersStore((state) => [
    state.MyCurrentLocation,
    state.showModalTypeDop,
    state.getOrders,
  ]);

  /*useEffect( () => {
		if( session.data?.user?.token ){
			const firebaseConfig = {
				apiKey: "AIzaSyAK8l7m2URB6kFbBzC5iv67W34cuEzPKYc",
				authDomain: "macro-thinker-288611.firebaseapp.com",
				databaseURL: "https://macro-thinker-288611.firebaseio.com",
				projectId: "macro-thinker-288611",
				storageBucket: "macro-thinker-288611.appspot.com",
				messagingSenderId: "989415800368",
				appId: "1:989415800368:web:35373fd752ab60aa3177f5",
				measurementId: "G-YDT84TR2E2"
			};

			const app = initializeApp(firebaseConfig);

			try{
				const messaging = getMessaging();

				getToken(messaging, { vapidKey: 'BJmoVaG5ijS0CXc126Y47xmkjxv92stPrkQDfLql5hirvoWvAcy2N4xR1CPKVnCzUVai3ZqkzvVAjOyHGUWhogA' }).then((currentToken) => {
					if (currentToken) {
						setNotifToken(currentToken)
					}
				}).catch((err) => {
					///
				});
			}catch(err){

			}
		}

	}, [session] )*/

  useEffect(() => {
    if (session?.isAuth !== true) {
      return;
    }

    getStat(session?.token ?? '');
    getSettings(session?.token ?? '');
    MyCurrentLocation();
  }, [MyCurrentLocation, getSettings, getStat, session?.isAuth, session?.token]);

  useEffect(() => {
    if (session?.isAuth !== true) {
      return;
    }

    checkMyPos();
    const interval = setInterval(() => {
      checkMyPos();
    }, 120 * 1000);

    return () => clearInterval(interval);
  }, [checkMyPos, session?.isAuth, session?.token]);

  if (typeof window != 'undefined') {
    if (location.protocol !== 'https:' && location.hostname != 'localhost') {
      location.replace(`https:${location.href.substring(location.protocol.length)}`);
    }
  }

  const pathname = usePathname();
  const pageTitle = activePageRU || routeTitles[pathname] || '';

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

      <DrawerMap />
      <DrawerList />
      <DrawerHeader />
      <ModalDelOrders />
      <AlertOrder />
      <LoadOrderSpiner />
      <PayModel />
    </Box>
  );
}
