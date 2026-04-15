import type { ReactNode } from 'react';

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

import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import QueryStatsRoundedIcon from '@mui/icons-material/QueryStatsRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import VideocamRoundedIcon from '@mui/icons-material/VideocamRounded';

import {
  formatMoney,
  isCurrentUserRow,
  isTodayColumn,
  isWeekend,
} from '@/entities/graph/model/graph.utils';
import {
  GraphCameraError,
  GraphErrorModal,
  GraphMonthItem,
  GraphOrderError,
  GraphPointItem,
  GraphScheduleRow,
} from '@/entities/graph/model/types';
import { appPalette } from '@/ui/palette';

function GraphSectionHeader({ icon, title }: { icon: ReactNode; title: string }) {
  return (
    <div className="graph__cardHeader">
      <div className="graph__cardHeaderMain">
        <span className="graph__cardIcon">{icon}</span>

        <div className="graph__cardHeading">
          <h2 className="graph__cardTitle">{title}</h2>
        </div>
      </div>
    </div>
  );
}

function EmptyTableRow({ colSpan, text }: { colSpan: number; text: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="graph__emptyCell">
        {text}
      </TableCell>
    </TableRow>
  );
}

interface GraphMonthPickerDrawerProps {
  open: boolean;
  monthList: GraphMonthItem[];
  globalFontSize: number;
  fontClassName: string;
  onOpen: () => void;
  onClose: () => void;
  onSelectMonth: (item: GraphMonthItem) => void;
}

function GraphMonthPickerDrawer({
  open,
  monthList,
  globalFontSize,
  fontClassName,
  onOpen,
  onClose,
  onSelectMonth,
}: GraphMonthPickerDrawerProps) {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
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
      <div className={`monthDrawer ${fontClassName}`}>
        <div className="monthDrawer__handle" />

        <List className="monthList">
          {monthList.map((item, key) => (
            <ListItem
              disablePadding
              key={key}
              className={parseInt(String(item.is_active), 10) === 1 ? 'active' : ''}
              onClick={() => onSelectMonth(item)}
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

interface GraphPointPickerDrawerProps {
  open: boolean;
  pointList: GraphPointItem[];
  globalFontSize: number;
  fontClassName: string;
  onOpen: () => void;
  onClose: () => void;
  onSelectPoint: (item: GraphPointItem) => void;
}

function GraphPointPickerDrawer({
  open,
  pointList,
  globalFontSize,
  fontClassName,
  onOpen,
  onClose,
  onSelectPoint,
}: GraphPointPickerDrawerProps) {
  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      onOpen={onOpen}
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
      <div className={`monthDrawer ${fontClassName}`}>
        <div className="monthDrawer__handle" />

        <List className="monthList">
          {pointList.map((item, key) => (
            <ListItem disablePadding key={key} onClick={() => onSelectPoint(item)}>
              <ListItemButton>
                <ListItemText
                  primary={item.name}
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

interface GraphErrorDrawerProps {
  open: boolean;
  errorModal: GraphErrorModal;
  globalFontSize: number;
  fontClassName: string;
  appealText: string;
  isSubmittingAppeal: boolean;
  onChangeAppealText: (value: string) => void;
  onClose: () => void;
  onSubmitOrderAppeal: () => void;
  onSubmitCameraAppeal: () => void;
}

function GraphErrorDrawer({
  open,
  errorModal,
  globalFontSize,
  fontClassName,
  appealText,
  isSubmittingAppeal,
  onChangeAppealText,
  onClose,
  onSubmitOrderAppeal,
  onSubmitCameraAppeal,
}: GraphErrorDrawerProps) {
  const orderError = errorModal?.kind === 'order' ? errorModal.item : null;
  const cameraError = errorModal?.kind === 'camera' ? errorModal.item : null;

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      className={`modalErr ${fontClassName}`}
      onOpen={() => {}}
    >
      <DialogContent>
        <div className="lineModal" />

        {!orderError ? null : (
          <>
            <Typography component="span" style={{ color: '#000', fontSize: globalFontSize }}>
              Ошибка по заказу №{orderError.order_id}
            </Typography>

            <div
              style={{
                width: 'auto',
                height: 'auto',
                flexWrap: 'wrap',
                flexShrink: 1,
                paddingTop: 20,
              }}
            >
              <Typography
                component="span"
                style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}
              >
                Дата заказа:
              </Typography>
              <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>
                {' '}
                {orderError.date_time_order}
              </Typography>
            </div>

            <div
              style={{
                width: 'auto',
                height: 'auto',
                flexWrap: 'wrap',
                flexShrink: 1,
                paddingTop: 20,
              }}
            >
              <Typography
                component="span"
                style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}
              >
                Ошибка заказа:
              </Typography>
              <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>
                {' '}
                {orderError.order_desc}
              </Typography>
            </div>

            <div
              style={{
                width: 'auto',
                height: 'auto',
                flexWrap: 'wrap',
                flexShrink: 1,
                paddingTop: 20,
              }}
            >
              <Typography
                component="span"
                style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}
              >
                Позиция:
              </Typography>
              <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>
                {' '}
                {orderError.item_name}
              </Typography>
            </div>

            <div
              style={{
                width: 'auto',
                height: 'auto',
                flexWrap: 'wrap',
                flexShrink: 1,
                paddingTop: 20,
              }}
            >
              <Typography
                component="span"
                style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}
              >
                Ошибка:
              </Typography>
              <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>
                {' '}
                {orderError.pr_name}
              </Typography>
            </div>

            <div
              style={{
                width: 'auto',
                height: 'auto',
                flexWrap: 'wrap',
                flexShrink: 1,
                paddingTop: 20,
              }}
            >
              <Typography
                component="span"
                style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}
              >
                Сумма:
              </Typography>
              <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>
                {' '}
                {orderError.my_price}₽
              </Typography>
            </div>

            {orderError.imgs.length === 0 ? null : (
              <div
                style={{
                  width: 'auto',
                  height: 'auto',
                  flexWrap: 'wrap',
                  flexShrink: 1,
                  paddingTop: 20,
                }}
              >
                <Typography
                  component="span"
                  style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}
                >
                  Фото
                </Typography>
              </div>
            )}

            {orderError.imgs.map((item, key) => (
              <img key={key} alt="" style={{ width: '100%', height: 'auto' }} src={item} />
            ))}

            {!orderError.new_text_1 || orderError.new_text_1.length === 0 ? (
              parseInt(String(orderError.is_edit), 10) === 0 ? null : (
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
                  <Typography
                    component="span"
                    style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}
                  >
                    Причина обжалования:
                  </Typography>
                  <TextareaAutosize
                    style={{ width: '100%', minHeight: 50 }}
                    value={appealText}
                    onChange={(event) => onChangeAppealText(event.target.value)}
                  />

                  <Button
                    disabled={isSubmittingAppeal}
                    onClick={onSubmitOrderAppeal}
                    style={{
                      color: '#fff',
                      marginTop: 10,
                      width: '100%',
                      backgroundColor: appPalette.brand,
                    }}
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
                <Typography
                  component="span"
                  style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}
                >
                  Причина обжалования:
                </Typography>
                <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>
                  {orderError.new_text_1}
                </Typography>
              </div>
            )}

            {!orderError.new_text_2 || orderError.new_text_2.length === 0 ? null : (
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
                <Typography
                  component="span"
                  style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}
                >
                  Ответ обжалования:
                </Typography>
                <Typography component="span" style={{ fontSize: globalFontSize, color: '#000' }}>
                  {orderError.new_text_2}
                </Typography>
              </div>
            )}
          </>
        )}

        {!cameraError ? null : (
          <>
            <Typography style={{ color: '#000', fontSize: globalFontSize }}>
              Ошибка №{cameraError.id}
            </Typography>

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
              <Typography style={{ fontSize: globalFontSize, color: '#000' }}>
                {cameraError.date_time_fine}
              </Typography>
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
              <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>
                Ошибка:
              </Typography>
              <Typography style={{ fontSize: globalFontSize, color: '#000' }}>
                {cameraError.fine_name}
              </Typography>
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
              <Typography style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}>
                Сумма:
              </Typography>
              <Typography style={{ fontSize: globalFontSize, color: '#000' }}>
                {cameraError.price}
              </Typography>
            </div>

            {cameraError.imgs.length === 0 ? null : (
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
                  Фото
                </Typography>
              </div>
            )}

            {cameraError.imgs.map((item, key) => (
              <img
                key={key}
                alt=""
                style={{ width: '100%', height: 'auto' }}
                src={`https://jacochef.ru/src/img/fine_err/uploads/${item}`}
              />
            ))}

            {!cameraError.text_one || cameraError.text_one.length === 0 ? (
              parseInt(String(cameraError.is_edit), 10) === 0 ? null : (
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
                  <Typography
                    style={{ fontSize: globalFontSize, fontWeight: 'bold', color: '#000' }}
                  >
                    Причина обжалования:
                  </Typography>
                  <TextareaAutosize
                    style={{ width: '100%', minHeight: 50 }}
                    value={appealText}
                    onChange={(event) => onChangeAppealText(event.target.value)}
                  />

                  <Button
                    disabled={isSubmittingAppeal}
                    onClick={onSubmitCameraAppeal}
                    style={{
                      color: '#fff',
                      marginTop: 10,
                      width: '100%',
                      backgroundColor: appPalette.brand,
                    }}
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
                <Typography style={{ fontSize: globalFontSize, color: '#000' }}>
                  {cameraError.text_one}
                </Typography>
              </div>
            )}

            {!cameraError.text_two || cameraError.text_two.length === 0 ? null : (
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
                <Typography style={{ fontSize: globalFontSize, color: '#000' }}>
                  {cameraError.text_two}
                </Typography>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </SwipeableDrawer>
  );
}

function GraphAlertDialog({
  open,
  text,
  globalFontSize,
  onClose,
}: {
  open: boolean;
  text: string;
  globalFontSize: number;
  onClose: () => void;
}) {
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle style={{ fontSize: globalFontSize }}>{text}</DialogTitle>

      <DialogActions>
        <Button onClick={onClose} autoFocus style={{ fontSize: globalFontSize }}>
          Хорошо
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export interface GraphScreenViewProps {
  globalFontSize: number;
  fontClassName: string;
  point: string;
  pointList: GraphPointItem[];
  isPointDrawerOpen: boolean;
  month: string;
  monthList: GraphMonthItem[];
  dates: Array<{ day: number | string; dow: string }>;
  users: GraphScheduleRow[];
  currentUserId: string;
  currentUserName: string;
  chooseDate: string;
  errOrders: GraphOrderError[];
  errCam: GraphCameraError[];
  isMonthDrawerOpen: boolean;
  errorModal: GraphErrorModal;
  alertText: string;
  isAlertOpen: boolean;
  appealText: string;
  isSubmittingAppeal: boolean;
  onOpenPointDrawer: () => void;
  onClosePointDrawer: () => void;
  onSelectPoint: (item: GraphPointItem) => void;
  onOpenMonthDrawer: () => void;
  onCloseMonthDrawer: () => void;
  onSelectMonth: (item: GraphMonthItem) => void;
  onOpenOrderError: (item: GraphOrderError) => void;
  onOpenCameraError: (item: GraphCameraError) => void;
  onCloseErrorModal: () => void;
  onChangeAppealText: (value: string) => void;
  onSubmitOrderAppeal: () => void;
  onSubmitCameraAppeal: () => void;
  onCloseAlert: () => void;
}

export function GraphScreenView({
  globalFontSize,
  fontClassName,
  point,
  pointList,
  isPointDrawerOpen,
  month,
  monthList,
  dates,
  users,
  currentUserId,
  currentUserName,
  chooseDate,
  errOrders,
  errCam,
  isMonthDrawerOpen,
  errorModal,
  alertText,
  isAlertOpen,
  appealText,
  isSubmittingAppeal,
  onOpenPointDrawer,
  onClosePointDrawer,
  onSelectPoint,
  onOpenMonthDrawer,
  onCloseMonthDrawer,
  onSelectMonth,
  onOpenOrderError,
  onOpenCameraError,
  onCloseErrorModal,
  onChangeAppealText,
  onSubmitOrderAppeal,
  onSubmitCameraAppeal,
  onCloseAlert,
}: GraphScreenViewProps) {
  const scheduleTableMinWidth = Math.max(760, 220 + dates.length * 64);

  return (
    <Grid container spacing={2} className={`graph graphScreen ${fontClassName}`}>
      <Grid size={12}>
        <div className="graph__content">
          <Paper className="graph__hero">
            <div className="graph__heroTop">
              <div className="graph__heroMain">
                <span className="graph__eyebrow">График работы</span>
              </div>

              <Grid container spacing={1.5} justifyContent="flex-end">
                {pointList.length > 0 ? (
                  <Grid>
                    <Button
                      variant="outlined"
                      className="graph__monthButton"
                      style={{ fontSize: globalFontSize }}
                      startIcon={<StorefrontRoundedIcon />}
                      endIcon={<KeyboardArrowDownRoundedIcon />}
                      onClick={onOpenPointDrawer}
                    >
                      {point || 'Выберите кафе'}
                    </Button>
                  </Grid>
                ) : null}

                <Grid>
                  <Button
                    variant="outlined"
                    className="graph__monthButton"
                    style={{ fontSize: globalFontSize }}
                    endIcon={<KeyboardArrowDownRoundedIcon />}
                    onClick={onOpenMonthDrawer}
                  >
                    {month || 'Выберите месяц'}
                  </Button>
                </Grid>
              </Grid>
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
                <Table
                  stickyHeader
                  className="graph__scheduleTable"
                  sx={{ minWidth: scheduleTableMinWidth }}
                >
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
                        const isCurrentRow = isCurrentUserRow(
                          rowData,
                          currentUserId,
                          currentUserName
                        );

                        return (
                          <TableRow
                            hover
                            key={index}
                            className={
                              isCurrentRow
                                ? 'graph__scheduleRow graph__scheduleRow--current'
                                : 'graph__scheduleRow'
                            }
                          >
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

                              const hasHours = parseInt(String(cellData.min), 10) > 0;
                              const isToday = isTodayColumn(dates[cellIndex - 1]?.day, chooseDate);
                              const hoursCellClasses = [
                                'graph__hoursCell',
                                hasHours ? 'graph__hoursCell--filled' : '',
                                isCurrentRow ? 'graph__hoursCell--currentRow' : '',
                                isToday ? 'graph__hoursCell--today' : '',
                                isCurrentRow && isToday ? 'graph__hoursCell--currentToday' : '',
                              ]
                                .filter(Boolean)
                                .join(' ');

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
                        );
                      })
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
                      <TableCell
                        className="graph__tableHeadCell graph__issuesCell--date"
                        style={{ fontSize: globalFontSize }}
                      >
                        Дата заказа
                      </TableCell>
                      <TableCell
                        className="graph__tableHeadCell graph__issuesCell--error"
                        style={{ fontSize: globalFontSize }}
                      >
                        Ошибка
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {errOrders.length === 0 ? (
                      <EmptyTableRow
                        colSpan={2}
                        text="Ошибок по заказам за выбранный период нет."
                      />
                    ) : (
                      errOrders.map((rowData, index) => (
                        <TableRow
                          hover
                          key={index}
                          className="graph__interactiveRow"
                          onClick={() => onOpenOrderError(rowData)}
                        >
                          <TableCell
                            className="graph__issuesCell--date"
                            style={{ fontSize: globalFontSize }}
                          >
                            {rowData.date_time_order}
                          </TableCell>
                          <TableCell
                            className="graph__issuesCell--error"
                            style={{ fontSize: globalFontSize }}
                          >
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
                      <TableCell
                        className="graph__tableHeadCell graph__issuesCell--date"
                        style={{ fontSize: globalFontSize }}
                      >
                        Дата и время
                      </TableCell>
                      <TableCell
                        className="graph__tableHeadCell graph__issuesCell--error"
                        style={{ fontSize: globalFontSize }}
                      >
                        Ошибка
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {errCam.length === 0 ? (
                      <EmptyTableRow
                        colSpan={2}
                        text="Ошибок по камерам за выбранный период нет."
                      />
                    ) : (
                      errCam.map((rowData, index) => (
                        <TableRow
                          hover
                          key={index}
                          className="graph__interactiveRow"
                          onClick={() => onOpenCameraError(rowData)}
                        >
                          <TableCell
                            className="graph__issuesCell--date"
                            style={{ fontSize: globalFontSize }}
                          >
                            {rowData.date_time_fine}
                          </TableCell>
                          <TableCell
                            className="graph__issuesCell--error"
                            style={{ fontSize: globalFontSize }}
                          >
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

      <GraphPointPickerDrawer
        open={isPointDrawerOpen}
        pointList={pointList}
        globalFontSize={globalFontSize}
        fontClassName={fontClassName}
        onOpen={onOpenPointDrawer}
        onClose={onClosePointDrawer}
        onSelectPoint={onSelectPoint}
      />

      <GraphMonthPickerDrawer
        open={isMonthDrawerOpen}
        monthList={monthList}
        globalFontSize={globalFontSize}
        fontClassName={fontClassName}
        onOpen={onOpenMonthDrawer}
        onClose={onCloseMonthDrawer}
        onSelectMonth={onSelectMonth}
      />

      <GraphErrorDrawer
        open={Boolean(errorModal)}
        errorModal={errorModal}
        globalFontSize={globalFontSize}
        fontClassName={fontClassName}
        appealText={appealText}
        isSubmittingAppeal={isSubmittingAppeal}
        onChangeAppealText={onChangeAppealText}
        onClose={onCloseErrorModal}
        onSubmitOrderAppeal={onSubmitOrderAppeal}
        onSubmitCameraAppeal={onSubmitCameraAppeal}
      />

      <GraphAlertDialog
        open={isAlertOpen}
        text={alertText}
        globalFontSize={globalFontSize}
        onClose={onCloseAlert}
      />
    </Grid>
  );
}
