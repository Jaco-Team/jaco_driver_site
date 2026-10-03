'use client';

import { type ReactElement, type ReactNode } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import Backdrop from '@mui/material/Backdrop';
import Box from '@mui/material/Box';
import BusinessCenterRoundedIcon from '@mui/icons-material/BusinessCenterRounded';
import Button from '@mui/material/Button';
import CachedIcon from '@mui/icons-material/Cached';
import CalculateRoundedIcon from '@mui/icons-material/CalculateRounded';
import CircularProgress from '@mui/material/CircularProgress';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
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
import { logTel } from '@/components/analytics';
import { useOrdersStore } from '@/entities/order/model/order.store';
import { useHeaderStore } from '@/features/header/model/header.store';
import PayModel from '@/components/PayModel';
import { roboto } from '@/shared/config/fonts';
import { appDarkPalette, appPalette, appSuccessPalette } from '@/shared/styles/appPalette';
import ErrorOutlinedIcon from '@mui/icons-material/ErrorOutlined';
import { OrderMapDrawer } from '@/widgets/order/ui/components/OrderMapDrawer';
import { useAppHeader } from '../model/useAppHeader';

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
  '/feedback': 'Предложения',
  '/price': 'Расчет',
  '/graph': 'График работы',
  '/statistics': 'Статистика',
  '/settings': 'Настройки',
};

function formatContactPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const normalizedDigits =
    digits.length === 11 && (digits.startsWith('7') || digits.startsWith('8'))
      ? digits.slice(1)
      : digits;

  if (normalizedDigits.length !== 10) return phone;

  return `+7 (${normalizedDigits.slice(0, 3)}) ${normalizedDigits.slice(3, 6)}-${normalizedDigits.slice(6, 8)}-${normalizedDigits.slice(8, 10)}`;
}

function OrderTypeDrawer() {
  const [isOpenMenu, setOpenMenu, setCloseMenu, type, types, setType] = useOrdersStore((state) => [
    state.isOpenMenu,
    state.setOpenMenu,
    state.setCloseMenu,
    state.type,
    state.types,
    state.setType,
  ]);
  const globalFontSize = useHeaderStore((state) => state.globalFontSize);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={isOpenMenu}
      onClose={setCloseMenu}
      onOpen={setOpenMenu}
      disableSwipeToOpen
      slotProps={{
        paper: {
          style: {
            backgroundColor: 'var(--app-surface)',
            backgroundImage: 'none',
          },
          sx: {
            maxHeight: '75%',
            overflow: 'hidden',
            borderTopLeftRadius: '28px',
            borderTopRightRadius: '28px',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: (theme) =>
              `0 -18px 42px ${theme.palette.mode === 'dark' ? appDarkPalette.shadowStrong : appPalette.shadowStrong}`,
          },
        },
      }}
    >
      <Box
        className={roboto.variable}
        sx={{
          backgroundColor: 'var(--app-surface)',
        }}
      >
        <Box
          sx={{
            height: 22,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            sx={{
              width: 62,
              height: 6,
              borderRadius: 999,
              bgcolor: 'divider',
            }}
          />
        </Box>

        <Box
          sx={{
            minHeight: 46,
            display: 'grid',
            gridTemplateColumns: '44px 1fr 44px',
            alignItems: 'center',
            px: 1.5,
            pb: 1,
          }}
        >
          <Box />
          <Typography
            component="div"
            sx={{
              fontSize: Math.max(globalFontSize + 2, 18),
              fontWeight: 500,
              lineHeight: 1.35,
              textAlign: 'center',
              color: 'text.primary',
            }}
          >
            Список заказов
          </Typography>
          <IconButton
            aria-label="Закрыть"
            onClick={setCloseMenu}
            sx={{ width: 44, height: 44, color: 'text.secondary' }}
          >
            <CloseRoundedIcon />
          </IconButton>
        </Box>

        <Divider />

        <List
          disablePadding
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            px: 2,
            pt: 1.5,
            pb: 'calc(env(safe-area-inset-bottom, 0px) + 28px)',
          }}
        >
          {types.map((item) => {
            const isSelected = type.id === item.id;

            return (
              <ListItem disablePadding key={item.id}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => setType(item)}
                  style={{
                    backgroundColor: isSelected ? 'var(--app-surface-alt)' : 'var(--app-surface)',
                  }}
                  sx={{
                    position: 'relative',
                    minHeight: 56,
                    justifyContent: 'center',
                    px: 3,
                    border: '1px solid',
                    borderColor: isSelected ? 'secondary.main' : 'divider',
                    borderRadius: '12px',
                    boxShadow: (theme) =>
                      `0 1px 3px ${theme.palette.mode === 'dark' ? appDarkPalette.shadowSoft : appPalette.shadowSoft}`,
                    '&&.Mui-selected': {
                      borderColor: 'secondary.main',
                    },
                  }}
                >
                  <ListItemText
                    primary={item.text}
                    sx={{
                      m: 0,
                      textAlign: 'center',
                      '& .MuiTypography-root': {
                        color: 'text.primary',
                        fontSize: globalFontSize,
                        fontWeight: 500,
                        lineHeight: 1.4,
                      },
                    }}
                  />
                  {isSelected ? (
                    <Box
                      sx={{
                        position: 'absolute',
                        right: 2,
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: appSuccessPalette.main,
                      }}
                    />
                  ) : null}
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
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
          color: 'var(--app-text)',
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
        {delOrders?.map((item, index: number) => (
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
  const isOpenOrderMap = useOrdersStore((state) => state.isOpenOrderMap);

  if (isOpenOrderMap) {
    return null;
  }

  return (
    <Backdrop style={{ zIndex: 9999, color: '#fff' }} open={isLoading}>
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

function HeaderMenuDrawer({ onLogout, isOnline }: { onLogout: () => void; isOnline: boolean }) {
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
    {
      href: '/feedback',
      label: 'Предложения',
      icon: <ErrorOutlinedIcon />,
    },
  ];

  const contactItems = [
    phones?.phone_upr
      ? {
          label: 'Директор',
          phone: phones.phone_upr,
          formattedPhone: formatContactPhoneNumber(phones.phone_upr),
          icon: <BusinessCenterRoundedIcon />,
          eventName: 'call_director',
          logTitle: 'Звонок директору',
        }
      : null,
    phones?.phone_man
      ? {
          label: 'Менеджер',
          phone: phones.phone_man,
          formattedPhone: formatContactPhoneNumber(phones.phone_man),
          icon: <SupportAgentRoundedIcon />,
          eventName: 'call_manager',
          logTitle: 'Звонок менеджеру',
        }
      : null,
    phones?.phone_center
      ? {
          label: 'Контакт-центр',
          phone: phones.phone_center,
          formattedPhone: formatContactPhoneNumber(phones.phone_center),
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
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? appDarkPalette.background : appPalette.surface,
          backgroundImage: 'none',
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
            color: 'primary.contrastText',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? `linear-gradient(135deg, ${appDarkPalette.brand} 0%, ${appDarkPalette.brandDeep} 100%)`
                : `linear-gradient(135deg, ${appPalette.brand} 0%, ${appPalette.brandDeep} 100%)`,
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
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
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
                borderRadius: '24px',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(142, 169, 191, 0.20)'
                    : appPalette.softStrong,
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark' ? appDarkPalette.surfaceAlt : appPalette.surfaceAlt,
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
                  bgcolor: 'background.paper',
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
                    color: 'text.secondary',
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
                    color: 'text.primary',
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
                color: 'text.secondary',
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
                        borderRadius: '24px',
                        border: '1px solid',
                        borderColor: isSelected ? 'secondary.main' : 'divider',
                        bgcolor: (theme) =>
                          theme.palette.mode === 'dark'
                            ? isSelected
                              ? appDarkPalette.surfaceAlt
                              : appDarkPalette.surface
                            : isSelected
                              ? appPalette.surfaceAlt
                              : '#FFFFFF',
                        color: 'text.primary',
                        boxShadow: (theme) =>
                          theme.palette.mode === 'dark'
                            ? isSelected
                              ? `0 5px 11px ${appDarkPalette.shadowSoft}`
                              : '0 5px 11px rgba(0, 0, 0, 0.08)'
                            : isSelected
                              ? '0 14px 30px rgba(66, 98, 125, 0.12)'
                              : '0 10px 22px rgba(15, 23, 42, 0.04)',
                        overflow: 'hidden',
                        '&.Mui-selected': {
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? appDarkPalette.surfaceAlt
                              : appPalette.surfaceAlt,
                          borderColor: 'secondary.main',
                          color: 'text.primary',
                          boxShadow: (theme) =>
                            theme.palette.mode === 'dark'
                              ? `0 5px 11px ${appDarkPalette.shadowSoft}`
                              : '0 14px 30px rgba(66, 98, 125, 0.12)',
                        },
                        '&.Mui-selected:hover': {
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? appDarkPalette.surfaceAlt
                              : appPalette.surfaceAlt,
                        },
                        '&:hover': {
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? isSelected
                                ? appDarkPalette.surfaceAlt
                                : appDarkPalette.surface
                              : isSelected
                                ? appPalette.surfaceAlt
                                : '#FFFFFF',
                        },
                        '& .MuiListItemIcon-root': {
                          color: isSelected ? 'secondary.main' : 'text.secondary',
                        },
                        '& .MuiListItemText-primary': {
                          color: 'text.primary',
                          fontSize: navigationLabelFontSize,
                          fontWeight: isSelected ? 700 : 500,
                          whiteSpace: 'nowrap',
                          lineHeight: 1.2,
                        },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>

                      <ListItemText primary={item.label} sx={{ my: 0, minWidth: 0 }} />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          {contactItems.length > 0 && (
            <>
              <Divider />

              <Box>
                <Typography
                  component="div"
                  sx={{
                    px: 1,
                    mb: 1,
                    fontSize: Math.max(globalFontSize - 3, 12),
                    fontWeight: 800,
                    color: 'text.secondary',
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
                          borderRadius: '24px',
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'background.paper',
                          boxShadow: '0 10px 22px rgba(15, 23, 42, 0.04)',
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 36,
                            m: 0,
                            justifyContent: 'center',
                            color: 'secondary.main',
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
                              color: 'text.primary',
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
                              color: 'text.secondary',
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
            disabled={!isOnline}
            onClick={() => {
              if (!isOnline) return;
              setCloseMenu();
              onLogout();
            }}
            sx={{
              minHeight: 56,
              justifyContent: 'flex-start',
              px: 2,
              py: 1.375,
              borderRadius: '24px',
              borderColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? appDarkPalette.brandSoftStrong
                  : appPalette.brandSoftStrong,
              bgcolor: 'background.paper',
              color: (theme) =>
                theme.palette.mode === 'dark' ? appDarkPalette.brand : appPalette.brand,
              fontSize: globalFontSize,
              fontWeight: 700,
              textTransform: 'none',
              boxShadow: '0 10px 22px rgba(15, 23, 42, 0.04)',
              '& .MuiButton-startIcon': { marginLeft: 0, marginRight: '12px' },
              '&:hover': {
                borderColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? appDarkPalette.brandSoftStrong
                    : appPalette.brandSoftStrong,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? appDarkPalette.brandSoft : appPalette.brandSoft,
              },
              '&.Mui-disabled': {
                borderColor: 'divider',
                bgcolor: 'action.disabledBackground',
                color: 'text.disabled',
                boxShadow: 'none',
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
  const {
    pathname,
    pageTitle,
    globalFontSize,
    setOpenMenu,
    showModalTypeDop,
    getOrders,
    isOrdersActionsVisible,
    isOnline,
    handleLogout,
  } = useAppHeader(routeTitles);

  return (
    <Box>
      <AppBar
        sx={{
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? appDarkPalette.brandHeader : appPalette.brand,
          backgroundImage: 'none',
        }}
      >
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
            sx={{ flexGrow: 1, minWidth: 0 }}
            style={{ fontSize: globalFontSize }}
            noWrap
          >
            {pageTitle}
          </Typography>
          {isOrdersActionsVisible && (
            <div>
              <Button
                className="noselect"
                style={{ flex: 1 }}
                onClick={() => showModalTypeDop(true)}
              >
                <FilterAlt style={{ color: '#fff' }} />
              </Button>
              <Button className="noselect" style={{ flex: 1 }} onClick={() => getOrders(true)}>
                <CachedIcon style={{ color: '#fff' }} />
              </Button>
            </div>
          )}
        </Toolbar>
        {!isOnline && (
          <Box
            role="status"
            aria-live="assertive"
            data-testid="offline-status-banner"
            sx={{
              mx: '8px',
              my: '6px',
              minHeight: '36px',
              px: '16px',
              py: '8px',
              boxSizing: 'border-box',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              bgcolor: appPalette.brandDeep,
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              textAlign: 'center',
              pointerEvents: 'none',
            }}
          >
            Нет подключения к интернету
          </Box>
        )}
      </AppBar>

      {!isOnline && <Box aria-hidden="true" sx={{ height: '48px' }} />}

      <OrderMapDrawer />
      <OrderTypeDrawer />
      <HeaderMenuDrawer onLogout={handleLogout} isOnline={isOnline} />
      <DeletedOrdersDrawer />
      <AlertOrder />
      <OrdersLoadingBackdrop />
      <PayModel />
    </Box>
  );
}
