import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextareaAutosize from '@mui/material/TextareaAutosize';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';

import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';

import { useGraphStore, useHeaderStore } from '@/components/store.js';
import useSession from '@/components/sessionHook';

import dayjs from 'dayjs';

import Meta from '@/components/meta.js';

import { roboto } from '@/ui/Font';
import { appPalette } from '@/ui/palette';

import { log } from '@/components/analytics';

function formatMoney(value) {
  return new Intl.NumberFormat('ru-RU').format(Number(value ?? 0));
}

function isWeekend(dow) {
  const normalized = String(dow ?? '').trim().toLowerCase();

  return normalized.includes('сб') || normalized.includes('вс');
}

function toMonthStart(value) {
  if (!value) {
    return null;
  }

  const normalized = String(value).length <= 7 ? `${value}-01` : String(value);
  const parsed = dayjs(normalized);

  return parsed.isValid() ? parsed : null;
}

function isTruthyFlag(value) {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function getRowIdentifier(cellData) {
  return `${cellData?.user_id ?? cellData?.driver_id ?? cellData?.id ?? ''}`;
}

function normalizeUserName(value) {
  return String(value ?? '').trim().toLowerCase();
}

function isCurrentUserRow(rowData, currentUserId, currentUserName) {
  const firstCell = rowData?.[0];

  if (!firstCell) {
    return false;
  }

  if (isTruthyFlag(firstCell?.is_my) || isTruthyFlag(firstCell?.is_me)) {
    return true;
  }

  const rowUserName = normalizeUserName(firstCell?.user_name);
  const currentName = normalizeUserName(currentUserName);

  if (rowUserName && currentName && rowUserName === currentName) {
    return true;
  }

  const rowIdentifier = getRowIdentifier(firstCell);

  return Boolean(currentUserId) && Boolean(rowIdentifier) && rowIdentifier === `${currentUserId}`;
}

function isTodayColumn(dayValue, chooseDate) {
  const viewedMonth = toMonthStart(chooseDate);

  if (!viewedMonth || !viewedMonth.isSame(dayjs(), 'month')) {
    return false;
  }

  return Number(dayValue) === dayjs().date();
}

function GraphSectionHeader({ icon, title, description, badge }) {
  return (
    <div className="graph__cardHeader">
      <div className="graph__cardHeaderMain">
        <span className="graph__cardIcon">{icon}</span>

        <div className="graph__cardHeading">
          <h2 className="graph__cardTitle">{title}</h2>
          {!description ? null : <p className="graph__cardDescription">{description}</p>}
        </div>
      </div>

      {!badge ? null : <span className="graph__badge">{badge}</span>}
    </div>
  );
}

function EmptyTableRow({ colSpan, text }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="graph__emptyCell">
        {text}
      </TableCell>
    </TableRow>
  );
}

function SwipeableTemporaryDrawer() {
  const session = useSession();

  const [isOpenMenu, setOpenMenu, setCloseMenu, getGraph, month_list] = useGraphStore((state) => [
    state.isOpenMenu,
    state.setOpenMenu,
    state.setCloseMenu,
    state.getGraph,
    state.month_list,
  ]);

  const [globalFontSize] = useHeaderStore((state) => [state.globalFontSize]);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={isOpenMenu}
      onClose={() => {
        log('graph_month_picker_close', 'Закрытие выбора месяца (График работы)');
        setCloseMenu();
      }}
      onOpen={() => {
        log('graph_month_picker_open', 'Открытие выбора месяца (График работы)');
        setOpenMenu();
      }}
      sx={{
        '& .MuiDrawer-paper': {
          borderTopLeftRadius: 30,
          borderTopRightRadius: 30,
          background: 'linear-gradient(180deg, #f8fbff 0%, #ffffff 24%)',
          boxShadow: '0 -20px 44px rgba(15, 23, 42, 0.18)',
          overflow: 'hidden',
        },
      }}
    >
      <div className={`monthDrawer ${roboto.variable}`}>
        <div className="monthDrawer__handle" />

        <List className="monthList">
          {month_list.map((item, key) => (
            <ListItem
              disablePadding
              key={key}
              className={parseInt(item.is_active, 10) === 1 ? 'active' : ''}
              onClick={() => {
                log('graph_month_selected', 'Выбор месяца (График работы)');
                getGraph(item.day, session?.token);
              }}
            >
              <ListItemButton>
                <ListItemText
                  primary={item.mounth}
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
      </div>
    </SwipeableDrawer>
  );
}

function ModalErr() {
  const session = useSession();

  const [
    isOpenModalErr,
    closeModalErr,
    showErrOrderCum,
    showErrOrder,
    false_err_order,
    false_err_cam,
    errText,
    setTextErr,
  ] = useGraphStore((state) => [
    state.isOpenModalErr,
    state.closeModalErr,
    state.showErrOrderCum,
    state.showErrOrder,
    state.false_err_order,
    state.false_err_cam,
    state.errText,
    state.setTextErr,
  ]);

  const [globalFontSize] = useHeaderStore((state) => [state.globalFontSize]);

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={isOpenModalErr}
      onClose={() => {
        if (showErrOrder) {
          log('graph_errorder_modal_close', 'Закрытие модалки ошибки по заказу');
        }

        if (showErrOrderCum) {
          log('graph_errcam_modal_close', 'Закрытие модалки ошибки по камерам');
        }

        closeModalErr();
      }}
      className={`modalErr ${roboto.variable}`}
      onOpen={() => {}}
    >
      <DialogContent>
        <div className="lineModal" />

        {!showErrOrder ? null : (
          <>
            <Typography component="span" style={{ color: '#000', fontSize: globalFontSize }}>
              Ошибка по заказу №{showErrOrder.order_id}
            </Typography>

            <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
              <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>
                Дата заказа:
              </Typography>
              <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>
                {' '}
                {showErrOrder.date_time_order}
              </Typography>
            </div>

            <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
              <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>
                Ошибка заказа:
              </Typography>
              <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>
                {' '}
                {showErrOrder.order_desc}
              </Typography>
            </div>

            <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
              <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>
                Позиция:
              </Typography>
              <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>
                {' '}
                {showErrOrder.item_name}
              </Typography>
            </div>

            <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
              <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>
                Ошибка:
              </Typography>
              <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>
                {' '}
                {showErrOrder.pr_name}
              </Typography>
            </div>

            <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
              <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>
                Сумма:
              </Typography>
              <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>
                {' '}
                {showErrOrder.my_price}₽
              </Typography>
            </div>

            {showErrOrder.imgs.length === 0 ? null : (
              <div style={{ width: 'auto', height: 'auto', flexWrap: 'wrap', flexShrink: 1, paddingTop: 20 }}>
                <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>
                  Фото
                </Typography>
              </div>
            )}

            {showErrOrder.imgs.map((item, key) => (
              <img key={key} alt="" style={{ width: '100%', height: 'auto' }} src={item} />
            ))}

            {!showErrOrder.new_text_1 || showErrOrder.new_text_1.length === 0 ? (
              parseInt(showErrOrder.is_edit, 10) === 0 ? null : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: 'auto',
                    height: 'auto',
                    flexWrap: 'wrap',
                    flexShrink: 1,
                    paddingTop: 20,
                  }}
                >
                  <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>
                    Причина обжалования:
                  </Typography>
                  <TextareaAutosize
                    style={{ width: '100%', minHeight: 50 }}
                    value={errText}
                    onChange={(event) => {
                      setTextErr(event.target.value);
                    }}
                  />

                  <Button
                    onClick={() => false_err_order(session?.token, errText, showErrOrder.err_id, showErrOrder.row_id)}
                    style={{ color: '#fff', marginTop: 10, width: '100%', backgroundColor: appPalette.brand }}
                  >
                    Обжаловать
                  </Button>
                </div>
              )
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  width: 'auto',
                  height: 'auto',
                  flexWrap: 'wrap',
                  flexShrink: 1,
                  paddingTop: 20,
                }}
              >
                <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>
                  Причина обжалования:
                </Typography>
                <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>
                  {showErrOrder.new_text_1}
                </Typography>
              </div>
            )}

            {!showErrOrder.new_text_2 || showErrOrder.new_text_2.length === 0 ? null : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  width: 'auto',
                  height: 'auto',
                  flexWrap: 'wrap',
                  flexShrink: 1,
                  paddingTop: 20,
                }}
              >
                <Typography component="span" style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>
                  Ответ обжалования:
                </Typography>
                <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>
                  {showErrOrder.new_text_2}
                </Typography>
              </div>
            )}
          </>
        )}

        {!showErrOrderCum ? null : (
          <>
            <Typography style={{ color: '#000', fontSize: globalFontSize }}>Ошибка №{showErrOrderCum.id}</Typography>

            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: 'auto',
                height: 'auto',
                flexWrap: 'wrap',
                flexShrink: 1,
                paddingTop: 20,
              }}
            >
              <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>
                Дата время ошибки:
              </Typography>
              <Typography style={{ fontSize: globalFontSize, color: '#000' }}>{showErrOrderCum.date_time_fine}</Typography>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: 'auto',
                height: 'auto',
                flexWrap: 'wrap',
                flexShrink: 1,
                paddingTop: 20,
              }}
            >
              <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Ошибка:</Typography>
              <Typography style={{ fontSize: globalFontSize, color: '#000' }}>{showErrOrderCum.fine_name}</Typography>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                width: 'auto',
                height: 'auto',
                flexWrap: 'wrap',
                flexShrink: 1,
                paddingTop: 20,
              }}
            >
              <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Сумма:</Typography>
              <Typography style={{ fontSize: globalFontSize, color: '#000' }}>{showErrOrderCum.price}</Typography>
            </div>

            {showErrOrderCum.imgs.length === 0 ? null : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  width: 'auto',
                  height: 'auto',
                  flexWrap: 'wrap',
                  flexShrink: 1,
                  paddingTop: 20,
                }}
              >
                <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>Фото</Typography>
              </div>
            )}

            {showErrOrderCum.imgs.map((item, key) => (
              <img
                key={key}
                alt=""
                style={{ width: '100%', height: 'auto' }}
                src={`https://jacochef.ru/src/img/fine_err/uploads/${item}`}
              />
            ))}

            {!showErrOrderCum.text_one || showErrOrderCum.text_one.length === 0 ? (
              parseInt(showErrOrderCum.is_edit, 10) === 0 ? null : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    width: 'auto',
                    height: 'auto',
                    flexWrap: 'wrap',
                    flexShrink: 1,
                    paddingTop: 20,
                  }}
                >
                  <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>
                    Причина обжалования:
                  </Typography>
                  <TextareaAutosize
                    style={{ width: '100%', minHeight: 50 }}
                    value={errText}
                    onChange={(event) => {
                      setTextErr(event.target.value);
                    }}
                  />

                  <Button
                    onClick={() => false_err_cam(session?.token, errText, showErrOrderCum.id)}
                    style={{ color: '#fff', marginTop: 10, width: '100%', backgroundColor: appPalette.brand }}
                  >
                    Обжаловать
                  </Button>
                </div>
              )
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  width: 'auto',
                  height: 'auto',
                  flexWrap: 'wrap',
                  flexShrink: 1,
                  paddingTop: 20,
                }}
              >
                <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>
                  Причина обжалования:
                </Typography>
                <Typography style={{ fontSize: globalFontSize, color: '#000' }}>{showErrOrderCum.text_one}</Typography>
              </div>
            )}

            {!showErrOrderCum.text_two || showErrOrderCum.text_two.length === 0 ? null : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  width: 'auto',
                  height: 'auto',
                  flexWrap: 'wrap',
                  flexShrink: 1,
                  paddingTop: 20,
                }}
              >
                <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>
                  Ответ обжалования:
                </Typography>
                <Typography style={{ fontSize: globalFontSize, color: '#000' }}>{showErrOrderCum.text_two}</Typography>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </SwipeableDrawer>
  );
}

function AlertErr() {
  const [isshowErrOrder, textErrOrder, closeErrOrder] = useGraphStore((state) => [
    state.isshowErrOrder,
    state.textErrOrder,
    state.closeErrOrder,
  ]);

  const [globalFontSize] = useHeaderStore((state) => [state.globalFontSize]);

  return (
    <Dialog onClose={closeErrOrder} open={isshowErrOrder}>
      <DialogTitle style={{ fontSize: globalFontSize }}>{textErrOrder}</DialogTitle>

      <DialogActions>
        <Button onClick={closeErrOrder} autoFocus style={{ fontSize: globalFontSize }}>
          Хорошо
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function GraphPage() {
  const session = useSession();

  const [setOpenMenu, getGraph, month_list, dates, users, current_user_id, current_user_name, chooseDate, err_orders, err_cam, openModalErr] = useGraphStore((state) => [
    state.setOpenMenu,
    state.getGraph,
    state.month_list,
    state.dates,
    state.users,
    state.current_user_id,
    state.current_user_name,
    state.chooseDate,
    state.err_orders,
    state.err_cam,
    state.openModalErr,
  ]);

  const [globalFontSize] = useHeaderStore((state) => [state.globalFontSize]);

  const [is_load, setIsLoad] = useState(false);
  const month = month_list.find((it) => parseInt(it.is_active, 10) === 1)?.mounth ?? '';

  useEffect(() => {
    const fetchData = async () => {
      if (session?.token) {
        await getGraph(dayjs().format('YYYY-MM'), session?.token);
        setIsLoad(true);
      }
    };

    if (!is_load) {
      fetchData();
    }
  }, [getGraph, is_load, session?.token]);

  const scheduleTableMinWidth = Math.max(760, 220 + dates.length * 64);

  return (
    <Meta title="График работы">
      <Grid container spacing={2} className={`graph graphScreen ${roboto.variable}`}>
        <Grid size={12}>
          <div className="graph__content">
            <Paper className="graph__hero">
              <div className="graph__heroTop">
                <div className="graph__heroMain">
                  <span className="graph__eyebrow">График работы</span>
                </div>

                <Button
                  variant="outlined"
                  className="graph__monthButton"
                  style={{ fontSize: globalFontSize }}
                  endIcon={<KeyboardArrowDownRoundedIcon />}
                  onClick={setOpenMenu}
                >
                  {month || 'Выберите месяц'}
                </Button>
              </div>
            </Paper>
          </div>
        </Grid>

        <Grid size={12}>
          <div className="graph__content">
            <Paper className="graph__card graph__card--schedule">
              <GraphSectionHeader
                icon={<QueryStatsRoundedIcon fontSize="inherit" />}
                title="Таблица смен"
              />

	              <div className="graph__tableShell">
	                <TableContainer className="graph__tableContainer" id="tableGraph">
	                  <Table stickyHeader className="graph__scheduleTable" sx={{ minWidth: scheduleTableMinWidth }}>
	                    <TableHead>
	                      <TableRow>
	                        <TableCell
	                          className="graph__tableHeadCell"
	                          style={{ fontSize: globalFontSize }}
	                        >
	                          Дата
	                        </TableCell>

	                        {dates.map((cellData, cellIndex) => (
	                          <TableCell
	                            key={cellIndex}
	                            className={`graph__tableHeadCell${isWeekend(cellData.dow) ? ' graph__tableHeadCell--weekend' : ''}${isTodayColumn(cellData.day, chooseDate) ? ' graph__tableHeadCell--today' : ''}`}
	                            style={{ fontSize: globalFontSize }}
	                          >
	                            {cellData.day}
	                          </TableCell>
                        ))}
                      </TableRow>

	                      <TableRow>
	                        <TableCell
	                          className="graph__tableHeadCell graph__employeeHeaderCell"
	                          style={{ fontSize: globalFontSize }}
	                        >
	                          Сотрудник
	                        </TableCell>

	                        {dates.map((cellData, cellIndex) => (
	                          <TableCell
	                            key={cellIndex}
	                            className={`graph__tableHeadCell${isWeekend(cellData.dow) ? ' graph__tableHeadCell--weekend' : ''}${isTodayColumn(cellData.day, chooseDate) ? ' graph__tableHeadCell--today' : ''}`}
	                            style={{ fontSize: globalFontSize }}
	                          >
	                            {cellData.dow}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {users.length === 0 ? (
                        <EmptyTableRow
                          colSpan={Math.max(dates.length + 1, 2)}
                          text="За выбранный месяц пока нет данных по графику."
                        />
	                      ) : (
	                        users.map((rowData, index) => {
                            const isCurrentRow = isCurrentUserRow(rowData, current_user_id, current_user_name);

                            return (
	                          <TableRow hover key={index} className={isCurrentRow ? 'graph__scheduleRow graph__scheduleRow--current' : 'graph__scheduleRow'}>
	                            {rowData.map((cellData, cellIndex) => {
	                              if (cellIndex === 0) {
	                                return (
	                                  <TableCell
	                                    key={cellIndex}
	                                    className={`graph__employeeCell${isCurrentRow ? ' graph__employeeCell--current' : ''}`}
	                                    style={{ fontSize: globalFontSize }}
	                                  >
	                                    {cellData.user_name}
                                  </TableCell>
                                );
	                              }

	                              const hasHours = parseInt(cellData.min, 10) > 0;
                                const isToday = isTodayColumn(dates[cellIndex - 1]?.day, chooseDate);
                                const hoursCellClasses = [
                                  'graph__hoursCell',
                                  hasHours ? 'graph__hoursCell--filled' : '',
                                  isCurrentRow ? 'graph__hoursCell--currentRow' : '',
                                  isToday ? 'graph__hoursCell--today' : '',
                                  isCurrentRow && isToday ? 'graph__hoursCell--currentToday' : '',
                                ].filter(Boolean).join(' ');

	                              return (
	                                <TableCell
	                                  key={cellIndex}
	                                  className={hoursCellClasses}
	                                  style={{ fontSize: globalFontSize }}
	                                >
	                                  {hasHours ? cellData.hours : ''}
	                                </TableCell>
	                              );
	                            })}
	                          </TableRow>
	                        )})
	                      )}
	                    </TableBody>
	                  </Table>
                </TableContainer>
              </div>
            </Paper>
          </div>
        </Grid>

        <Grid size={12}>
          <div className="graph__content">
            <Paper className="graph__card">
              <GraphSectionHeader
                icon={<ReceiptLongRoundedIcon fontSize="inherit" />}
                title="Ошибки по заказам"
              />

	              <div className="graph__tableShell">
	                <TableContainer className="graph__tableContainer">
	                  <Table className="graph__issuesTable">
	                    <TableHead>
	                      <TableRow>
	                        <TableCell className="graph__tableHeadCell graph__issuesCell--date" style={{ fontSize: globalFontSize }}>
	                          Дата заказа
	                        </TableCell>
	                        <TableCell className="graph__tableHeadCell graph__issuesCell--error" style={{ fontSize: globalFontSize }}>
	                          Ошибка
	                        </TableCell>
	                      </TableRow>
	                    </TableHead>

	                    <TableBody>
	                      {err_orders.length === 0 ? (
	                        <EmptyTableRow colSpan={2} text="Ошибок по заказам за выбранный период нет." />
	                      ) : (
	                        err_orders.map((rowData, index) => (
	                          <TableRow
                            hover
                            key={index}
                            className="graph__interactiveRow"
                            onClick={() => {
	                              log('graph_errorder_modal_open', 'Открытие модалки ошибки по заказу');
	                              openModalErr('showErrOrder', rowData);
	                            }}
	                          >
	                            <TableCell className="graph__issuesCell--date" style={{ fontSize: globalFontSize }}>
	                              {rowData.date_time_order}
	                            </TableCell>
	                            <TableCell className="graph__issuesCell--error" style={{ fontSize: globalFontSize }}>
	                              {rowData.pr_name}
	                            </TableCell>
	                          </TableRow>
	                        ))
	                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </Paper>
          </div>
        </Grid>

        <Grid size={12}>
          <div className="graph__content">
            <Paper className="graph__card">
              <GraphSectionHeader
                icon={<VideocamRoundedIcon fontSize="inherit" />}
                title="Ошибки по камерам"
              />

	              <div className="graph__tableShell">
	                <TableContainer className="graph__tableContainer">
	                  <Table className="graph__issuesTable">
	                    <TableHead>
	                      <TableRow>
	                        <TableCell className="graph__tableHeadCell graph__issuesCell--date" style={{ fontSize: globalFontSize }}>
	                          Дата и время
	                        </TableCell>
	                        <TableCell className="graph__tableHeadCell graph__issuesCell--error" style={{ fontSize: globalFontSize }}>
	                          Ошибка
	                        </TableCell>
	                      </TableRow>
	                    </TableHead>

	                    <TableBody>
	                      {err_cam.length === 0 ? (
	                        <EmptyTableRow colSpan={2} text="Ошибок по камерам за выбранный период нет." />
	                      ) : (
	                        err_cam.map((rowData, index) => (
	                          <TableRow
                            hover
                            key={index}
                            className="graph__interactiveRow"
                            onClick={() => {
	                              log('graph_errcam_modal_open', 'Открытие модалки ошибки по камерам');
	                              openModalErr('showErrOrderCum', rowData);
	                            }}
	                          >
	                            <TableCell className="graph__issuesCell--date" style={{ fontSize: globalFontSize }}>
	                              {rowData.date_time_fine}
	                            </TableCell>
	                            <TableCell className="graph__issuesCell--error" style={{ fontSize: globalFontSize }}>
	                              {rowData.fine_name}
	                            </TableCell>
	                          </TableRow>
	                        ))
	                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </Paper>
          </div>
        </Grid>

        <SwipeableTemporaryDrawer />
        <ModalErr />
        <AlertErr />
      </Grid>
    </Meta>
  );
}
